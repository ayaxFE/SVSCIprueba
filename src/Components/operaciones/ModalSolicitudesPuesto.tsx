// src/Components/operaciones/ModalSolicitudesPuesto.tsx
import { useState } from 'react';
import { X, Radio, Check, Ban, PlusCircle, MapPin, Users } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';

interface ModalSolicitudesPuestoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalSolicitudesPuesto({ isOpen, onClose }: ModalSolicitudesPuestoProps) {
  const { solicitudesPuesto, aprobarSolicitudPuesto, enviarSolicitudDesdePuesto, rolActivo } = useOperativo();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [personas, setPersonas] = useState(2);

  if (!isOpen) return null;
  const esComando = rolActivo === 'COMANDANCIA' || rolActivo === 'ADMINISTRADOR';

  const handleCrearSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    if (!direccion.trim()) return;
    enviarSolicitudDesdePuesto(direccion, descripcion, personas);
    setDireccion('');
    setDescripcion('');
    setMostrarFormulario(false);
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs text-slate-200">
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Solicitudes de Puestos Avanzados (RF08)
              </h2>
              <p className="text-[11px] text-slate-400">Atenciones espontáneas en terreno pendientes de decisión de Comando</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">
              {solicitudesPuesto.filter(s => s.estado === 'PENDIENTE_APROBACION').length} pendientes de validación
            </span>
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              {mostrarFormulario ? 'Ver Listado' : 'Registrar Pedido en Puesto'}
            </button>
          </div>

          {mostrarFormulario ? (
            <form onSubmit={handleCrearSolicitud} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="font-bold text-slate-400 block mb-1">Dirección / Punto de Encuentro</label>
                <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Costanera y Alsina" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Personas Estimadas</label>
                  <input type="number" value={personas} onChange={e => setPersonas(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-400 block mb-1">Relato de la situación</label>
                <textarea rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Vecino se acercó a pie solicitando rescate..." className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
              <button type="submit" className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-lg">
                Enviar a Comando para Aprobación
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {solicitudesPuesto.map(sol => (
                <div key={sol.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      {sol.puestoOrigen}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sol.estado === 'PENDIENTE_APROBACION' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      sol.estado === 'APROBADA' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {sol.estado}
                    </span>
                  </div>
                  <p className="text-white">{sol.descripcion}</p>
                  <div className="flex gap-4 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-400" /> {sol.direccion}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-400" /> {sol.personasEstimadas} pers.</span>
                  </div>
                  {sol.estado === 'PENDIENTE_APROBACION' && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        disabled={!esComando}
                        onClick={() => aprobarSolicitudPuesto(sol.id, false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 disabled:opacity-30"
                      >
                        <Ban className="w-3.5 h-3.5 text-red-400" /> Desestimar
                      </button>
                      <button
                        disabled={!esComando}
                        onClick={() => aprobarSolicitudPuesto(sol.id, true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 disabled:opacity-30"
                      >
                        <Check className="w-3.5 h-3.5" /> Aprobar y Pasar a Tarea Aprobada
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}