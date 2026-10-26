// src/Components/sistema/PanelNovedadesVHF.tsx
import { useState } from 'react';
import { X, Send, Radio, AlertTriangle } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';

interface PanelNovedadesVHFProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PanelNovedadesVHF({ isOpen, onClose }: PanelNovedadesVHFProps) {
  const { novedadesVHF, registrarNovedadVHF, usuarioActual } = useOperativo();
  const [mensaje, setMensaje] = useState('');
  const [esUrgente, setEsUrgente] = useState(false);

  if (!isOpen) return null;

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    registrarNovedadVHF(usuarioActual, mensaje, esUrgente);
    setMensaje('');
    setEsUrgente(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[1150] w-full sm:w-[480px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col text-slate-200">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-400" />
            Bitácora de Novedades VHF y Apoyo (RF10)
          </h2>
          <p className="text-[11px] text-slate-400">Canal 1 Operativo VHF - Enlaces de audio en terreno</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {novedadesVHF.map(nov => (
          <div key={nov.id} className={`p-3 rounded-xl border ${nov.esUrgente ? 'bg-red-950/30 border-red-800' : 'bg-slate-950 border-slate-800'}`}>
            <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
              <span className="font-bold text-sky-400">{nov.emisor} ({nov.canal})</span>
              <span className="text-slate-500">{nov.hora} hs</span>
            </div>
            <p className="text-slate-200">{nov.mensaje}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleEnviar} className="p-4 bg-slate-950 border-t border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="chk-urg"
            checked={esUrgente}
            onChange={e => setEsUrgente(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-red-600"
          />
          <label htmlFor="chk-urg" className="font-bold text-red-400 flex items-center gap-1 cursor-pointer">
            <AlertTriangle className="w-3.5 h-3.5" /> Solicitud de Apoyo Urgente
          </label>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Transmitir novedad o solicitud..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}