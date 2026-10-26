import { useState } from 'react';
import { X, AlertTriangle, MapPin, User } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCrearEmergencia({ isOpen, onClose }: ModalProps) {
  const [estaEnLugar, setEstaEnLugar] = useState<boolean>(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl w-full max-w-3xl flex flex-col overflow-hidden text-slate-800">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300/50 bg-white/30">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-slate-900">Nueva Emergencia</h2>
              <p className="text-xs font-semibold text-slate-500">Complete los datos del reporte</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-white/60 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
          
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Ubicación y Tipo
            </h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Emergencia</label>
              <input type="text" placeholder="Ej: Incendio, Accidente..." className="w-full bg-white/50 border border-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Dirección</label>
              <input type="text" placeholder="Calle y número" className="w-full bg-white/50 border border-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Barrio</label>
              <input type="text" placeholder="Nombre del barrio" className="w-full bg-white/50 border border-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Solicitante y Afectados
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Apellido / Nombre</label>
              <input type="text" placeholder="Nombre de quien reporta" className="w-full bg-white/50 border border-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Teléfono</label>
              <input type="text" placeholder="Número de contacto" className="w-full bg-white/50 border border-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 ml-1">Adultos</label>
                <input type="number" placeholder="0" className="w-full bg-white/50 border border-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 ml-1">Menores</label>
                <input type="number" placeholder="0" className="w-full bg-white/50 border border-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold text-slate-700">¿Está en el lugar?</span>
              <div className="flex bg-white/40 rounded-lg p-1 border border-white/50 shadow-inner">
                <button 
                  onClick={() => setEstaEnLugar(true)}
                  className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${estaEnLugar ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  SI
                </button>
                <button 
                  onClick={() => setEstaEnLugar(false)}
                  className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${!estaEnLugar ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  NO
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-1 mt-2">
            <label className="text-xs font-bold text-slate-700 ml-1">Detalles Adicionales</label>
            <textarea 
              className="w-full h-20 bg-white/50 border border-white/60 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none shadow-sm"
              placeholder="Describa la situación aquí..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-300/50 bg-white/30 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-white/60 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => alert('Emergencia Creada (Mockup)')} 
            className="px-6 py-2.5 rounded-lg text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            Crear y Marcar
          </button>
        </div>
      </div>
    </div>
  );
}