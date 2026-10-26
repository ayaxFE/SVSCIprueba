// src/Components/territorio/PanelPuestosRecursos.tsx
import { X, Anchor, Truck, Users2, CheckCircle2, AlertOctagon } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';

interface PanelPuestosRecursosProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PanelPuestosRecursos({ isOpen, onClose }: PanelPuestosRecursosProps) {
  const { recursos, puestos } = useOperativo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[1150] w-full sm:w-[480px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col text-slate-200">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
            <Users2 className="w-4 h-4 text-emerald-400" />
            Puestos y Recursos Asignados (RF01 / RF09)
          </h2>
          <p className="text-[11px] text-slate-400">Dotaciones, gomones y vehículos 4x4 desplegados</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {puestos.map(puesto => {
          const recursosDelPuesto = recursos.filter(r => r.puestoId === puesto.id);
          return (
            <div key={puesto.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <div>
                  <div className="font-bold text-white text-sm">{puesto.nombre}</div>
                  <div className="text-[11px] text-slate-400">A cargo: {puesto.responsable}</div>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-bold">
                  {recursosDelPuesto.length} unidades
                </span>
              </div>

              <div className="space-y-2">
                {recursosDelPuesto.map(rec => (
                  <div key={rec.id} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-white">
                        {rec.tipo === 'EMBARCACION' || rec.tipo === 'KAYAK' ? (
                          <Anchor className="w-3.5 h-3.5 text-sky-400" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>{rec.codigo}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Dotación: {rec.dotacionActual.join(', ') || 'Sin dotación asignada'}
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      rec.disponible ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {rec.disponible ? <CheckCircle2 className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                      {rec.disponible ? 'LIBRE' : 'EN MISIÓN'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}