// server/index.ts
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from './db';
import type { PedidoLlamado } from '../src/types/operativo';

dotenv.config();

interface PedidoAgregadoRow {
  id: string;
  numero_pedido: number;
  fecha_recepcion: string;
  hora_recepcion: string;
  hora_carga_digital: string;
  operador_legajo: string | null;
  tipo_emergencia: string;
  detalle: string | null;
  direccion: string;
  barrio: string;
  informante_nombre: string | null;
  informante_telefono: string | null;
  esta_en_el_lugar: boolean;
  familia_afectada: string | null;
  adultos_informados: number;
  menores_informados: number;
  datos_incompletos: boolean;
}

interface PedidoPapelBody {
  pedido: PedidoLlamado;
  asociarAId?: string;
  usuarioLegajo?: string;
}

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto-sci-areco';
const FRONTEND_URL = 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ==========================================
// 1. AUTENTICACIÓN INSTITUCIONAL POR LEGAJO
// ==========================================
app.post('/api/auth/login-legajo', async (req: Request, res: Response) => {
  const { legajo, pin } = req.body;

  if (!legajo || !pin) {
    return res.status(400).json({ error: 'Debe ingresar número de legajo y clave PIN.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT legajo, apellido_nombre, jerarquia, rol_sci, puesto_id, pin_hash, activo FROM bomberos WHERE legajo = $1',
      [legajo.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Legajo institucional no registrado en el padrón.' });
    }

    const bombero = rows[0];

    if (!bombero.activo) {
      return res.status(403).json({ error: 'Efectivo en situación de inactividad o licencia.' });
    }

    // Para desarrollo rápido el PIN por defecto aceptado es '1234' o la validación del hash
    const esValido = pin === '1234' || await bcrypt.compare(pin, bombero.pin_hash);

    if (!esValido) {
      return res.status(401).json({ error: 'PIN de seguridad incorrecto.' });
    }

    const token = jwt.sign(
      {
        legajo: bombero.legajo,
        nombre: bombero.apellido_nombre,
        jerarquia: bombero.jerarquia,
        rol: bombero.rol_sci,
        puestoId: bombero.puesto_id
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.cookie('svsci_token', token, {
      httpOnly: true,
      secure: false, // true en producción con SSL
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000
    });

    // Auditoría inmutable de inicio de turno (RF13)
    await pool.query(
      'INSERT INTO auditoria (id, usuario_legajo, rol, modulo, accion, detalle) VALUES ($1, $2, $3, $4, $5, $6)',
      [`aud-${Date.now()}`, bombero.legajo, bombero.rol_sci, 'ACCESO', 'INICIO_SESION', `Ingreso autenticado de ${bombero.apellido_nombre} (${bombero.jerarquia})`]
    );

    return res.json({
      success: true,
      usuario: {
        legajo: bombero.legajo,
        nombre: bombero.apellido_nombre,
        jerarquia: bombero.jerarquia,
        rol: bombero.rol_sci,
        puestoId: bombero.puesto_id
      }
    });
  } catch (error) {
    console.error('[AUTH ERROR]:', error);
    return res.status(500).json({ error: 'Falla interna al procesar las credenciales.' });
  }
});

// ==========================================
// 2. OBTENCIÓN DEL ESTADO COMPLETO DEL OPERATIVO
// ==========================================
app.get('/api/operativo/estado', async (_req: Request, res: Response) => {
  try {
    const [puestosRes, recursosRes, serviciosRes, solicitudesRes, novedadesRes, auditoriaRes] = await Promise.all([
      pool.query('SELECT * FROM puestos ORDER BY id ASC'),
      pool.query('SELECT * FROM recursos ORDER BY codigo ASC'),
      pool.query(`
        SELECT 
          s.*,
          COALESCE(
            json_agg(p.*) FILTER (WHERE p.id IS NOT NULL), '[]'
          ) as pedidos_asociados,
          COALESCE(
            array_agg(ar.recurso_id) FILTER (WHERE ar.recurso_id IS NOT NULL), '{}'
          ) as recursos_asignados
        FROM servicios s
        LEFT JOIN pedidos p ON s.id = p.servicio_id
        LEFT JOIN asignaciones_recursos ar ON s.id = ar.servicio_id
        GROUP BY s.id
        ORDER BY s.creado_en DESC
      `),
      pool.query('SELECT * FROM solicitudes_puesto ORDER BY creado_en DESC'),
      pool.query('SELECT * FROM novedades_vhf ORDER BY creado_en DESC LIMIT 50'),
      pool.query('SELECT * FROM auditoria ORDER BY timestamp_evento DESC LIMIT 100')
    ]);

    return res.json({
      puestos: puestosRes.rows.map(r => ({
        id: r.id,
        nombre: r.nombre,
        responsable: r.responsable_legajo,
        sectorCobertura: r.sector_cobertura,
        activo: r.activo,
        coordenadas: [parseFloat(r.lat), parseFloat(r.lng)]
      })),
      recursos: recursosRes.rows.map(r => ({
        id: r.id,
        codigo: r.codigo,
        tipo: r.tipo,
        disponible: r.disponible,
        puestoId: r.puesto_id,
        dotacionActual: r.dotacion || []
      })),
      servicios: serviciosRes.rows.map(r => ({
        id: r.id,
        codigoServicio: r.codigo_servicio,
        prioridad: r.prioridad,
        prioridadJustificacion: r.prioridad_justificacion,
        estado: r.estado,
        puestoAsignadoId: r.puesto_asignado_id,
        horaDerivacion: r.hora_derivacion,
        direccionPrincipal: r.direccion_principal,
        barrio: r.barrio,
        coordenadas: r.lat && r.lng ? {
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lng),
          esAproximada: r.es_aproximada
        } : undefined,
        recursosAsignados: r.recursos_asignados,
        viajesRealizados: r.viajes_realizados,
        pedidosAsociados: (r.pedidos_asociados || []).map((p: PedidoAgregadoRow) => ({
          id: p.id,
          numeroPedido: p.numero_pedido,
          fechaRecepcion: p.fecha_recepcion,
          horaRecepcion: p.hora_recepcion,
          horaCargaDigital: p.hora_carga_digital,
          operadorCarga: p.operador_legajo,
          responsableDecision: 'Comando SCI',
          tipoEmergencia: p.tipo_emergencia,
          detalle: p.detalle,
          direccion: p.direccion,
          barrio: p.barrio,
          informante: {
            apellidoNombre: p.informante_nombre,
            telefono: p.informante_telefono,
            estaEnElLugar: p.esta_en_el_lugar
          },
          familiaAfectada: p.familia_afectada,
          censoInformado: {
            adultos: p.adultos_informados,
            menores: p.menores_informados
          },
          datosIncompletos: p.datos_incompletos
        })),
        resultadoFinal: r.resultado_final,
        motivoResultado: r.motivo_resultado,
        horaResolucion: r.hora_resolucion
      })),
      solicitudesPuesto: solicitudesRes.rows.map(r => ({
        id: r.id,
        puestoOrigen: r.puesto_origen,
        horaSolicitud: r.hora_solicitud,
        direccion: r.direccion,
        descripcion: r.descripcion,
        personasEstimadas: r.personas_estimadas,
        estado: r.estado
      })),
      novedadesVHF: novedadesRes.rows.map(r => ({
        id: r.id,
        hora: r.hora,
        emisor: r.emisor,
        canal: r.canal,
        servicioRelacionadoCodigo: r.servicio_codigo,
        mensaje: r.mensaje,
        esUrgente: r.es_urgente
      })),
      historialAuditorias: auditoriaRes.rows.map(r => ({
        id: r.id,
        timestamp: new Date(r.timestamp_evento).toLocaleString('es-AR'),
        usuario: r.usuario_legajo,
        rol: r.rol,
        modulo: r.modulo,
        accion: r.accion,
        detalle: r.detalle
      }))
    });
  } catch (error) {
    console.error('[API STATE ERROR]:', error);
    return res.status(500).json({ error: 'Error al sincronizar el estado del operativo.' });
  }
});

// ==========================================
// 3. REGISTRO PROGRESIVO DE PLANILLAS EN PAPEL (RF03 / RF04)
// ==========================================
app.post('/api/pedidos/papel', async (req: Request, res: Response) => {
  const { pedido, asociarAId, usuarioLegajo } = req.body as Partial<PedidoPapelBody>;
  if (
    !pedido ||
    !Number.isInteger(pedido.numeroPedido) ||
    !pedido.direccion?.trim() ||
    !pedido.barrio?.trim() ||
    !pedido.tipoEmergencia?.trim() ||
    !pedido.fechaRecepcion?.trim() ||
    !pedido.horaRecepcion?.trim() ||
    !pedido.horaCargaDigital?.trim()
  ) {
    return res.status(400).json({ error: 'Los datos obligatorios del pedido están incompletos.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let servicioIdDestino = asociarAId;

    if (!servicioIdDestino) {
      const countRes = await client.query('SELECT COUNT(*) FROM servicios');
      const nextNum = parseInt(countRes.rows[0].count, 10) + 1;
      servicioIdDestino = `srv-${Date.now()}`;
      const codigo = `INC-ARECO-${String(nextNum).padStart(2, '0')}`;

      const esRural = pedido.barrio === 'Zona Rural';
      const lat = esRural ? null : -34.2460 + (Math.random() - 0.5) * 0.007;
      const lng = esRural ? null : -59.4710 + (Math.random() - 0.5) * 0.007;

      await client.query(
        `INSERT INTO servicios (id, codigo_servicio, prioridad, estado, puesto_asignado_id, direccion_principal, barrio, lat, lng, es_aproximada)
         VALUES ($1, $2, $3, 'PENDIENTE', $4, $5, $6, $7, $8, $9)`,
        [
          servicioIdDestino,
          codigo,
          pedido.prioridad || 'MEDIA',
          pedido.barrio === 'Costanera' ? 'PO-COSTANERA' : 'PO-CANTERA',
          pedido.direccion.trim(),
          pedido.barrio,
          lat,
          lng,
          !esRural
        ]
      );
    } else {
      const servicioRes = await client.query('SELECT id FROM servicios WHERE id = $1', [servicioIdDestino]);
      if (servicioRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'No se encontró el servicio al que se quiere vincular el pedido.' });
      }
    }

    await client.query(
      `INSERT INTO pedidos (
        id, numero_pedido, fecha_recepcion, hora_recepcion, hora_carga_digital,
        operador_legajo, tipo_emergencia, detalle, direccion, barrio,
        informante_nombre, informante_telefono, esta_en_el_lugar, familia_afectada,
        adultos_informados, menores_informados, datos_incompletos, servicio_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      )`,
      [
        pedido.id,
        pedido.numeroPedido,
        pedido.fechaRecepcion,
        pedido.horaRecepcion,
        pedido.horaCargaDigital,
        usuarioLegajo || null,
        pedido.tipoEmergencia,
        pedido.detalle,
        pedido.direccion.trim(),
        pedido.barrio,
        pedido.informante?.apellidoNombre || null,
        pedido.informante?.telefono || null,
        pedido.informante?.estaEnElLugar ?? true,
        pedido.familiaAfectada || null,
        pedido.censoInformado?.adultos ?? 0,
        pedido.censoInformado?.menores ?? 0,
        pedido.datosIncompletos,
        servicioIdDestino
      ]
    );

    await client.query(
      'INSERT INTO auditoria (id, usuario_legajo, rol, modulo, accion, detalle) VALUES ($1, $2, $3, $4, $5, $6)',
      [`aud-${Date.now()}`, usuarioLegajo || null, 'OPERADOR_CARGA', 'PEDIDOS', 'ALTA_PLANILLA', `Pedido #${pedido.numeroPedido} incorporado a servicio ${servicioIdDestino}`]
    );

    await client.query('COMMIT');
    return res.json({ success: true, servicioId: servicioIdDestino });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[PEDIDO ERROR]:', error);
    return res.status(500).json({ error: 'Falla al persistir la planilla física.' });
  } finally {
    client.release();
  }
});

// ==========================================
// 4. CAMBIO DE PRIORIDAD TÁCTICA (RF06 - Solo Comando)
// ==========================================
app.patch('/api/servicios/:id/prioridad', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { prioridad, motivo, usuarioLegajo } = req.body;

  try {
    await pool.query(
      'UPDATE servicios SET prioridad = $1, prioridad_justificacion = $2 WHERE id = $3',
      [prioridad, motivo, id]
    );

    await pool.query(
      'INSERT INTO auditoria (id, usuario_legajo, rol, modulo, accion, detalle) VALUES ($1, $2, $3, $4, $5, $6)',
      [`aud-${Date.now()}`, usuarioLegajo, 'COMANDANCIA', 'PRIORIDAD', 'CAMBIO_PRIORIDAD', `Servicio ${id} reclasificado a ${prioridad}. Motivo: ${motivo}`]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('[PRIORITY UPDATE ERROR]:', error);
    return res.status(500).json({ error: 'No se pudo actualizar la prioridad.' });
  }
});

// ==========================================
// 5. ASIGNACIÓN Y DESPACHO DE RECURSOS (RF09)
// ==========================================
app.post('/api/servicios/:id/recursos', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { recursoId, usuarioLegajo } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE recursos SET disponible = FALSE WHERE id = $1', [recursoId]);
    await client.query(
      'INSERT INTO asignaciones_recursos (servicio_id, recurso_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [id, recursoId]
    );
    await client.query("UPDATE servicios SET estado = 'EN_ATENCION' WHERE id = $1", [id]);
    await client.query(
      'INSERT INTO auditoria (id, usuario_legajo, rol, modulo, accion, detalle) VALUES ($1, $2, $3, $4, $5, $6)',
      [`aud-${Date.now()}`, usuarioLegajo, 'PUESTO_OPERACIONES', 'RECURSOS', 'DESPACHO_UNIDAD', `Recurso ${recursoId} asignado a servicio ${id}`]
    );
    await client.query('COMMIT');

    return res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[RESOURCE ASSIGNMENT ERROR]:', error);
    return res.status(500).json({ error: 'Error en asignación de dotación.' });
  } finally {
    client.release();
  }
});

// ==========================================
// 6. RESOLUCIÓN OPERATIVA Y LIBERACIÓN (RF11)
// ==========================================
app.post('/api/servicios/:id/resolver', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { resultado, motivo, usuarioLegajo } = req.body;
  const hora = new Date().toTimeString().substring(0, 5);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Liberar recursos vinculados
    await client.query(`
      UPDATE recursos SET disponible = TRUE 
      WHERE id IN (SELECT recurso_id FROM asignaciones_recursos WHERE servicio_id = $1)
    `, [id]);
    await client.query('DELETE FROM asignaciones_recursos WHERE servicio_id = $1', [id]);

    await client.query(
      `UPDATE servicios SET estado = 'RESUELTO', resultado_final = $1, motivo_resultado = $2, hora_resolucion = $3 WHERE id = $4`,
      [resultado, motivo, hora, id]
    );

    await client.query(
      'INSERT INTO auditoria (id, usuario_legajo, rol, modulo, accion, detalle) VALUES ($1, $2, $3, $4, $5, $6)',
      [`aud-${Date.now()}`, usuarioLegajo, 'COMANDANCIA', 'RESOLUCION', 'CIERRE_SERVICIO', `Servicio ${id} resuelto: ${resultado} (${motivo})`]
    );
    await client.query('COMMIT');

    return res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[SERVICE RESOLUTION ERROR]:', error);
    return res.status(500).json({ error: 'No se pudo registrar la resolución operativa.' });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`[SVSCI BACKEND ACTIVO] Servidor Express escuchando en http://localhost:${PORT}`);
});