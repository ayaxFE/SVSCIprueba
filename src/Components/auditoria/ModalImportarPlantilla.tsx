// src/Components/auditoria/ModalImportarPlantilla.tsx
import { useState } from 'react';
import { X, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, Upload } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';
import type { PedidoLlamado } from '../../types/operativo';

interface ModalImportarPlantillaProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILAS_SIMULADAS = [
  { fila: 1, pedidoNro: 204, hora: '06:40', direccion: 'Alvear 220', barrio: 'Costanera', familia: 'Gómez', adultos: 2, menores: 1, estadoValidacion: 'VALIDO', observacion: 'Listo para importar' },
  { fila: 2, pedidoNro: 101, hora: '07:30', direccion: 'Zerboni y Arellano', barrio: 'Costanera', familia: 'Martínez', adultos: 2, menores: 0, estadoValidacion: 'DUPLICADO', observacion: 'Coincide con Pedido #101 ya registrado (Se omite duplicación silenciosa)' },
  { fila: 3, pedidoNro: 205, hora: '06:55', direccion: '', barrio: 'Costanera', familia: 'S/D', adultos: 1, menores: 0, estadoValidacion: 'INVALIDO', observacion: 'Falta dirección o referencia mínima obligatoria (RF03)' },
  { fila: 4, pedidoNro: 206, hora: '07:10', direccion: 'Matheu 85', barrio: 'Amespil', familia: 'Peralta', adultos: 3, menores: 2, estadoValidacion: 'VALIDO', observacion: 'Listo para importar' }
];

export default function ModalImportarPlantilla({ isOpen, onClose }: ModalImportarPlantillaProps) {
  const { importarLoteServicios, usuarioActual } = useOperativo();
  const [importado, setImportado] = useState(false);

  if (!isOpen) return null;

  const confirmarImportacion = () => {
    const validos: PedidoLlamado[] = FILAS_SIMULADAS
      .filter(f => f.estadoValidacion === 'VALIDO')
      .map(f => ({
        id: `ped-imp-${f.pedidoNro}-${Date.now()}`,
        numeroPedido: f.pedidoNro,
        fechaRecepcion: '26/10/2026',
        horaRecepcion: f.hora,
        horaCargaDigital: new Date().toTimeString().substring(0, 5),
        operadorCarga: usuarioActual,
        responsableDecision: 'Importación por Plantilla',
        tipoEmergencia: 'Evacuación Hídrica (Histórico Papel)',
        detalle: 'Registro incorporado mediante lote de plantilla acordada',
        direccion: f.direccion,
        barrio: f.barrio,
        informante: { apellidoNombre: `Familia ${f.familia}`, telefono: 'S/D', estaEnElLugar: true },
        familiaAfectada: f.familia,
        censoInformado: { adultos: f.adultos, menores: f.menores },
        datosIncompletos: false
      }));

    importarLoteServicios(validos);
    setImportado(true);
    setTimeout(() => {
      setImportado(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-xs text-slate-200">
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Importación Acotada de Plantilla (RF15)
              </h2>
              <p className="text-[11px] text-slate-400">Revisión previa por fila de registros válidos, inválidos y duplicados</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span>Archivo cargado: <strong className="text-white font-mono">planilla_guardia_turno_noche.xlsx</strong></span>
            <span className="text-emerald-400 font-bold">2 Válidos • 1 Duplicado • 1 Inválido</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2">Fila</th>
                <th>Pedido #</th>
                <th>Dirección</th>
                <th>Familia</th>
                <th>Diagnóstico Previo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {FILAS_SIMULADAS.map(f => (
                <tr key={f.fila}>
                  <td className="py-2.5 font-mono">{f.fila}</td>
                  <td className="font-mono font-bold text-white">#{f.pedidoNro}</td>
                  <td>{f.direccion || <em className="text-rose-400">Vacío</em>} ({f.barrio})</td>
                  <td>{f.familia}</td>
                  <td className="py-2">
                    {f.estadoValidacion === 'VALIDO' && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {f.observacion}
                      </span>
                    )}
                    {f.estadoValidacion === 'DUPLICADO' && (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {f.observacion}
                      </span>
                    )}
                    {f.estadoValidacion === 'INVALIDO' && (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> {f.observacion}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={onClose} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">Cancelar</button>
            <button
              onClick={confirmarImportacion}
              disabled={importado}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {importado ? '¡Registros Importados!' : 'Confirmar e Importar 2 Filas Válidas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}