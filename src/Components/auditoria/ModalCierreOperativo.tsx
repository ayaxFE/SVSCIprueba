// src/Components/auditoria/ModalCierreOperativo.tsx
import { X, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';

interface ModalCierreOperativoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCierreOperativo({ isOpen, onClose }: ModalCierreOperativoProps) {
  const { servicios, rolActivo, configuracion } = useOperativo();

  if (!isOpen) return null;
  const pendientes = servicios.filter(s => s.estado !== 'RESUELTO');
  const esComando = rolActivo === 'COMANDANCIA' || rolActivo === 'ADMINISTRADOR';
  const listoParaCerrar = pendientes.length === 0 && esComando;

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-xs text-slate-200">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            Cierre Operativo y Preparación Administrativa (RF12)
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Total servicios creados:</span>
            <span className="font-bold text-white">{servicios.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Resueltos formalmente:</span>
            <span className="font-bold text-emerald-400">{servicios.length - pendientes.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">En atención o pendientes:</span>
            <span className="font-bold text-rose-400">{pendientes.length}</span>
          </div>
        </div>

        {pendientes.length > 0 ? (
          <div className="bg-amber-950/40 border border-amber-800 p-3 rounded-xl flex gap-2 text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              Bloqueo operativo: Existen {pendientes.length} servicios sin resolución operativa final (RF12). Deben cerrarse antes de finalizar el despliegue general.
            </span>
          </div>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-800 p-3 rounded-xl flex gap-2 text-emerald-300">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>
              Todos los incidentes han sido resueltos en terreno. La operación está lista para el pase a archivo administrativo.
            </span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold">
            Volver
          </button>
          <button
            disabled={!listoParaCerrar}
            onClick={() => {
              alert(`Operativo "${configuracion.nombreOperativo}" cerrado con éxito.`);
              onClose();
            }}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white rounded-xl font-black shadow-lg"
          >
            Confirmar y Archivar Operativo
          </button>
        </div>
      </div>
    </div>
  );
}