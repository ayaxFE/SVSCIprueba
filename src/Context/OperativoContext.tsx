// src/Context/OperativoContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  ServicioIncidente, PedidoLlamado, Recurso, SolicitudPuesto, 
  NovedadVHF, Prioridad, ResultadoServicio, RolOperativo,
  PuestoOperativo, UsuarioSistema, EventoAuditoria, FiltrosOperativos,
  ConfiguracionOperativo
} from '../types/operativo';

interface OperativoContextType {
  rolActivo: RolOperativo;
  usuarioActual: string;
  usuarioLegajo: string;
  setUsuarioSesion: (usuario: { legajo: string; nombre: string; rol: RolOperativo }) => void;
  cambiarSesionRelevo: (nombreUsuario: string, rol: RolOperativo) => void;
  configuracion: ConfiguracionOperativo;
  actualizarConfiguracion: (nuevaConfig: Partial<ConfiguracionOperativo>) => void;
  servicios: ServicioIncidente[];
  serviciosFiltrados: ServicioIncidente[];
  filtros: FiltrosOperativos;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosOperativos>>;
  puestos: PuestoOperativo[];
  usuarios: UsuarioSistema[];
  recursos: Recurso[];
  solicitudesPuesto: SolicitudPuesto[];
  novedadesVHF: NovedadVHF[];
  historialAuditorias: EventoAuditoria[];
  servicioIdEsperandoUbicacion: string | null;
  setServicioIdEsperandoUbicacion: (id: string | null) => void;
  agregarPedidoDesdePapel: (pedido: PedidoLlamado, asociarAId?: string) => Promise<string | undefined>;
  cambiarPrioridadServicio: (servicioId: string, nuevaPrioridad: Prioridad, motivo: string) => Promise<void>;
  derivarServicioAPuesto: (servicioId: string, puestoId: string) => Promise<void>;
  asignarRecursoAServicio: (servicioId: string, recursoId: string) => Promise<void>;
  liberarRecursoDeServicio: (servicioId: string, recursoId: string) => Promise<void>;
  registrarViajeParcial: (servicioId: string) => void;
  resolverServicio: (servicioId: string, resultado: ResultadoServicio, motivo: string) => Promise<void>;
  aprobarSolicitudPuesto: (solicitudId: string, crearServicio: boolean) => void;
  enviarSolicitudDesdePuesto: (direccion: string, descripcion: string, personas: number) => void;
  registrarNovedadVHF: (emisor: string, mensaje: string, esUrgente?: boolean) => void;
  ubicarManualmenteServicio: (servicioId: string, lat: number, lng: number) => void;
  toggleEstadoPuesto: (puestoId: string) => void;
  toggleUsuarioActivo: (usuarioId: string) => void;
  importarLoteServicios: (nuevosPedidos: PedidoLlamado[]) => void;
  resetearEscenarioDemo: () => void;
}

const OperativoContext = createContext<OperativoContextType | undefined>(undefined);

interface EstadoServidor {
  servicios: ServicioIncidente[];
  puestos: PuestoOperativo[];
  recursos: Recurso[];
  solicitudesPuesto: SolicitudPuesto[];
  novedadesVHF: NovedadVHF[];
  historialAuditorias: EventoAuditoria[];
}

const obtenerEstadoServidor = async (signal?: AbortSignal): Promise<EstadoServidor> => {
  const resp = await fetch('http://localhost:3001/api/operativo/estado', { signal });
  if (!resp.ok) {
    throw new Error(`No se pudo cargar el estado del operativo (HTTP ${resp.status}).`);
  }
  return resp.json() as Promise<EstadoServidor>;
};

export const OperativoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rolActivo, setRolActivo] = useState<RolOperativo>('COMANDANCIA');
  const [usuarioActual, setUsuarioActual] = useState<string>('TESTONI, Guillermo Luis');
  const [usuarioLegajo, setUsuarioLegajo] = useState<string>('073/032');

  const [configuracion, setConfiguracion] = useState<ConfiguracionOperativo>({
    nombreOperativo: 'SCI Inundación Cuenca Río Areco - Octubre 2026',
    nivelRioMetros: 4.35,
    cuotaAlertaMetros: 3.80,
    simulacionSinConexion: false
  });

  const [servicios, setServicios] = useState<ServicioIncidente[]>([]);
  const [puestos, setPuestos] = useState<PuestoOperativo[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [solicitudesPuesto, setSolicitudesPuesto] = useState<SolicitudPuesto[]>([]);
  const [novedadesVHF, setNovedadesVHF] = useState<NovedadVHF[]>([]);
  const [historialAuditorias, setHistorialAuditorias] = useState<EventoAuditoria[]>([]);
  const [servicioIdEsperandoUbicacion, setServicioIdEsperandoUbicacion] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosOperativos>({
    barrio: 'TODOS',
    prioridad: 'TODAS',
    estado: 'TODOS',
    puestoId: 'TODOS'
  });

  const aplicarEstadoServidor = useCallback((estado: EstadoServidor) => {
    setServicios(estado.servicios);
    setPuestos(estado.puestos);
    setRecursos(estado.recursos);
    setSolicitudesPuesto(estado.solicitudesPuesto);
    setNovedadesVHF(estado.novedadesVHF);
    setHistorialAuditorias(estado.historialAuditorias);
  }, []);

  // Carga inicial y sincronización continua desde la base de datos PostgreSQL
  const sincronizarConServidor = async () => {
    try {
      const estado = await obtenerEstadoServidor();
      aplicarEstadoServidor(estado);
    } catch (error) {
      console.warn('[SYNC ERROR] No se pudo sincronizar el estado del operativo.', error);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    obtenerEstadoServidor(controller.signal)
      .then(estado => {
        if (!controller.signal.aborted) aplicarEstadoServidor(estado);
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          console.warn('[OFFLINE MODE] No se pudo conectar a la base de datos PostgreSQL en el puerto 3001.', error);
        }
      });
    return () => controller.abort();
  }, [aplicarEstadoServidor]);

  const setUsuarioSesion = (u: { legajo: string; nombre: string; rol: RolOperativo }) => {
    setUsuarioLegajo(u.legajo);
    setUsuarioActual(u.nombre);
    setRolActivo(u.rol);
  };

  const cambiarSesionRelevo = (nombreUsuario: string, rol: RolOperativo) => {
    setUsuarioActual(nombreUsuario);
    setRolActivo(rol);
  };

  const actualizarConfiguracion = (nuevaConfig: Partial<ConfiguracionOperativo>) => {
    setConfiguracion(prev => ({ ...prev, ...nuevaConfig }));
  };

  const serviciosFiltrados = useMemo(() => {
    return servicios.filter(srv => {
      if (rolActivo === 'PUESTO_OPERACIONES' && srv.puestoAsignadoId && srv.puestoAsignadoId !== 'PO-COSTANERA') {
        return false;
      }
      if (filtros.barrio !== 'TODOS' && srv.barrio !== filtros.barrio) return false;
      if (filtros.prioridad !== 'TODAS' && srv.prioridad !== filtros.prioridad) return false;
      if (filtros.estado !== 'TODOS' && srv.estado !== filtros.estado) return false;
      if (filtros.puestoId !== 'TODOS' && srv.puestoAsignadoId !== filtros.puestoId) return false;
      return true;
    });
  }, [servicios, filtros, rolActivo]);

  const agregarPedidoDesdePapel = async (nuevoPedido: PedidoLlamado, asociarAId?: string): Promise<string | undefined> => {
    try {
      const resp = await fetch('http://localhost:3001/api/pedidos/papel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido: nuevoPedido, asociarAId, usuarioLegajo })
      });
      if (!resp.ok) {
        throw new Error(`No se pudo guardar el pedido (HTTP ${resp.status}).`);
      }
      const data: { servicioId: string } = await resp.json();
      await sincronizarConServidor();
      return data.servicioId;
    } catch (error) {
      console.error('[PAPER REQUEST ERROR]:', error);
      return undefined;
    }
  };

  const cambiarPrioridadServicio = async (servicioId: string, nuevaPrioridad: Prioridad, motivo: string) => {
    try {
      const resp = await fetch(`http://localhost:3001/api/servicios/${servicioId}/prioridad`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prioridad: nuevaPrioridad, motivo, usuarioLegajo })
      });
      if (!resp.ok) throw new Error(`No se pudo actualizar la prioridad (HTTP ${resp.status}).`);
      await sincronizarConServidor();
    } catch (error) {
      console.error('[PRIORITY UPDATE ERROR]:', error);
    }
  };

  const derivarServicioAPuesto = async (servicioId: string, puestoId: string) => {
    setServicios(prev => prev.map(s => s.id === servicioId ? { ...s, puestoAsignadoId: puestoId } : s));
  };

  const asignarRecursoAServicio = async (servicioId: string, recursoId: string) => {
    try {
      const resp = await fetch(`http://localhost:3001/api/servicios/${servicioId}/recursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recursoId, usuarioLegajo })
      });
      if (!resp.ok) throw new Error(`No se pudo asignar el recurso (HTTP ${resp.status}).`);
      await sincronizarConServidor();
    } catch (error) {
      console.error('[RESOURCE ASSIGNMENT ERROR]:', error);
    }
  };

  const liberarRecursoDeServicio = async (servicioId: string, recursoId: string) => {
    setRecursos(prev => prev.map(r => r.id === recursoId ? { ...r, disponible: true } : r));
    setServicios(prev => prev.map(s => s.id === servicioId ? { ...s, recursosAsignados: s.recursosAsignados.filter(id => id !== recursoId) } : s));
  };

  const registrarViajeParcial = (servicioId: string) => {
    setServicios(prev => prev.map(s => s.id === servicioId ? { ...s, viajesRealizados: s.viajesRealizados + 1 } : s));
  };

  const resolverServicio = async (servicioId: string, resultado: ResultadoServicio, motivo: string) => {
    try {
      const resp = await fetch(`http://localhost:3001/api/servicios/${servicioId}/resolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultado, motivo, usuarioLegajo })
      });
      if (!resp.ok) throw new Error(`No se pudo resolver el servicio (HTTP ${resp.status}).`);
      await sincronizarConServidor();
    } catch (error) {
      console.error('[SERVICE RESOLUTION ERROR]:', error);
    }
  };

  const aprobarSolicitudPuesto = (solicitudId: string, crearServicio: boolean) => {
    setSolicitudesPuesto(prev => prev.map(s => s.id === solicitudId ? { ...s, estado: crearServicio ? 'APROBADA' : 'RECHAZADA' } : s));
  };

  const enviarSolicitudDesdePuesto = (direccion: string, descripcion: string, personas: number) => {
    const nueva: SolicitudPuesto = {
      id: `sol-${Date.now()}`,
      puestoOrigen: 'PO-COSTANERA',
      horaSolicitud: new Date().toTimeString().substring(0, 5),
      direccion,
      descripcion,
      personasEstimadas: personas,
      estado: 'PENDIENTE_APROBACION'
    };
    setSolicitudesPuesto(prev => [nueva, ...prev]);
  };

  const registrarNovedadVHF = (emisor: string, mensaje: string, esUrgente: boolean = false) => {
    const nueva: NovedadVHF = {
      id: `nov-${Date.now()}`,
      hora: new Date().toTimeString().substring(0, 5),
      emisor,
      canal: 'VHF CH-1 Táctico',
      mensaje,
      esUrgente
    };
    setNovedadesVHF(prev => [nueva, ...prev]);
  };

  const ubicarManualmenteServicio = (servicioId: string, lat: number, lng: number) => {
    setServicios(prev => prev.map(s => s.id === servicioId ? { ...s, coordenadas: { lat, lng, esAproximada: true } } : s));
    setServicioIdEsperandoUbicacion(null);
  };

  const toggleEstadoPuesto = (puestoId: string) => {
    setPuestos(prev => prev.map(p => p.id === puestoId ? { ...p, activo: !p.activo } : p));
  };

  const toggleUsuarioActivo = (usuarioId: string) => {
    setUsuarios(prev => prev.map(u => u.id === usuarioId ? { ...u, activo: !u.activo } : u));
  };

  const importarLoteServicios = (nuevosPedidos: PedidoLlamado[]) => {
    nuevosPedidos.forEach(p => agregarPedidoDesdePapel(p));
  };

  const resetearEscenarioDemo = () => {
    sincronizarConServidor();
  };

  return (
    <OperativoContext.Provider value={{
      rolActivo, usuarioActual, usuarioLegajo, setUsuarioSesion, cambiarSesionRelevo,
      configuracion, actualizarConfiguracion,
      servicios, serviciosFiltrados, filtros, setFiltros,
      puestos, usuarios, recursos, solicitudesPuesto, novedadesVHF, historialAuditorias,
      servicioIdEsperandoUbicacion, setServicioIdEsperandoUbicacion,
      agregarPedidoDesdePapel, cambiarPrioridadServicio, derivarServicioAPuesto,
      asignarRecursoAServicio, liberarRecursoDeServicio, registrarViajeParcial,
      resolverServicio, aprobarSolicitudPuesto, enviarSolicitudDesdePuesto,
      registrarNovedadVHF, ubicarManualmenteServicio, toggleEstadoPuesto,
      toggleUsuarioActivo, importarLoteServicios, resetearEscenarioDemo
    }}>
      {children}
    </OperativoContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOperativo = () => {
  const context = useContext(OperativoContext);
  if (!context) throw new Error('useOperativo debe ser utilizado dentro de un OperativoProvider');
  return context;
};