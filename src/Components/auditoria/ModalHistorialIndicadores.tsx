// src/Components/auditoria/ModalHistorialIndicadores.tsx
import { X, History, BarChart3, Clock } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';

interface ModalHistorialIndicadoresProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalHistorialIndicadores({ isOpen, onClose }: ModalHistorialIndicadoresProps) {
  const { servicios, historialAuditorias, recursos } = useOperativo();

  if (!isOpen) return null;

  // RF16: Contabilizar llamados y servicios por separado
  const totalLlamadosPapel = servicios.reduce((acc, s) => acc + s.pedidosAsociados.length, 0);
  const totalAdultosInformados = servicios.reduce((acc, s) => 
    acc + s.pedidosAsociados.reduce((sum, p) => sum + p.censoInformado.adultos, 0), 0
  );
  const totalMenoresInformados = servicios.reduce((acc, s) => 
    acc + s.pedidosAsociados.reduce((sum, p) => sum + p.censoInformado.menores, 0), 0
  );

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-xs text-slate-200">
        
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Indicadores Operativos y Trazabilidad Cronológica (RF13 / RF16)
              </h2>
              <p className="text-[11px] text-slate-400">Métricas para Revisión Posterior a la Acción (AAR) y auditoría inmutable</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tarjetas de indicadores SCI (Sección 10 del documento de requisitos) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Llamados en Papel</span>
              <div className="text-2xl font-black text-white font-mono mt-1">{totalLlamadosPapel}</div>
              <span className="text-[10px] text-indigo-400">Consolidados en {servicios.length} servicios</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Censo Informado</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                {totalAdultosInformados + totalMenoresInformados}
              </div>
              <span className="text-[10px] text-slate-400">{totalAdultosInformados} ad. / {totalMenoresInformados} men.</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">T. Promedio Derivación</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">06 min</div>
              <span className="text-[10px] text-slate-400">Recepción papel → Puesto</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Flota Ocupada</span>
              <div className="text-2xl font-black text-sky-400 font-mono mt-1">
                {recursos.filter(r => !r.disponible).length} / {recursos.length}
              </div>
              <span className="text-[10px] text-slate-400">Unidades en terreno</span>
            </div>
          </div>

          {/* Bitácora de trazabilidad RF13 */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Bitácora de Auditoría y Decisiones de Comando (RF13)
            </h3>
            <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
              {historialAuditorias.map(ev => (
                <div key={ev.id} className="p-3 flex items-start justify-between gap-4 hover:bg-slate-900/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[10px] font-bold">
                        {ev.modulo} :: {ev.accion}
                      </span>
                      <span className="font-bold text-white">{ev.usuario}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({ev.rol})</span>
                    </div>
                    <p className="text-slate-300">{ev.detalle}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {ev.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}