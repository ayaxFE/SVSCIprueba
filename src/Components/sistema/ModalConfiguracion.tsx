// src/Components/sistema/ModalConfiguracion.tsx
import { X, Settings, WifiOff, Waves } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';

interface ModalConfiguracionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalConfiguracion({ isOpen, onClose }: ModalConfiguracionProps) {
  const { configuracion, actualizarConfiguracion } = useOperativo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-xs text-slate-200">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            Configuración del Operativo (RF01 / RNF04)
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-bold text-slate-400 block mb-1">Nombre del Despliegue SCI</label>
            <input
              type="text"
              value={configuracion.nombreOperativo}
              onChange={e => actualizarConfiguracion({ nombreOperativo: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-400 flex items-center gap-1 mb-1">
                <Waves className="w-3.5 h-3.5 text-sky-400" /> Nivel Río Areco (m)
              </label>
              <input
                type="number"
                step="0.05"
                value={configuracion.nivelRioMetros}
                onChange={e => actualizarConfiguracion({ nivelRioMetros: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-400 block mb-1">Cota de Desborde (m)</label>
              <input
                type="number"
                step="0.05"
                value={configuracion.cuotaAlertaMetros}
                onChange={e => actualizarConfiguracion({ cuotaAlertaMetros: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Simulador de corte de enlace satelital RNF04 */}
          <div className="bg-amber-950/30 border border-amber-800/60 p-3.5 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <WifiOff className="w-4 h-4" /> Simular Caída de Enlace Starlink (RNF04)
              </span>
              <input
                type="checkbox"
                checked={configuracion.simulacionSinConexion}
                onChange={e => actualizarConfiguracion({ simulacionSinConexion: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Activa el protocolo visual de contingencia ante pérdida de red para demostrar la continuidad en papel exigida en la sección 11 del MVP.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button onClick={onClose} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black">
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}