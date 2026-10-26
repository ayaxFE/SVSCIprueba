// src/Components/operaciones/TableroServicios.tsx
import { useState } from 'react';
import { X, Anchor, RefreshCw } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';
import type { ServicioIncidente, Prioridad } from '../../types/operativo';

interface TableroServiciosProps {
  isOpen: boolean;
  onClose: () => void;
  onCentrarEnMapa: (coords: [number, number]) => void;
}

export default function TableroServicios({ isOpen, onClose, onCentrarEnMapa }: TableroServiciosProps) {
  const { 
    rolActivo, serviciosFiltrados, recursos, cambiarPrioridadServicio, 
    asignarRecursoAServicio, liberarRecursoDeServicio, registrarViajeParcial, resolverServicio,
    derivarServicioAPuesto, puestos
  } = useOperativo();

  const [servicioSeleccionado, setServicioSeleccionado] = useState<ServicioIncidente | null>(null);
  const [motivoPrioridad, setMotivoPrioridad] = useState('');

  if (!isOpen) return null;
  const recursosDisponibles = recursos.filter(r => r.disponible);
  const esComando = rolActivo === 'COMANDANCIA' || rolActivo === 'ADMINISTRADOR';

  return (
    <div className="fixed inset-y-0 right-0 z-[1150] w-full sm:w-[500px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col text-slate-200">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            Tablero de Situación Operativa (RF07)
          </h2>
          <p className="text-[11px] text-slate-400">Gestión de despacho, prioridades y asignación de embarcaciones</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {serviciosFiltrados.map((srv) => {
          const esActivo = servicioSeleccionado?.id === srv.id;
          return (
            <div
              key={srv.id}
              onClick={() => {
                setServicioSeleccionado(srv);
                if (srv.coordenadas) onCentrarEnMapa([srv.coordenadas.lat, srv.coordenadas.lng]);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                esActivo ? 'bg-slate-800 border-indigo-500 shadow-xl' : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {srv.codigoServicio}
                  </span>
                  <span className="text-xs font-bold text-white">{srv.direccionPrincipal}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  srv.prioridad === 'ALTA' ? 'bg-red-950 text-red-400 border border-red-800' :
                  srv.prioridad === 'MEDIA' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {srv.prioridad}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Barrio: <strong className="text-slate-300">{srv.barrio}</strong></span>
                <span>Estado: <strong className="text-slate-200">{srv.estado}</strong></span>
              </div>

              <div className="mt-2 text-[10px] text-slate-500 flex justify-between border-t border-slate-800/80 pt-2 font-mono">
                <span>Llamados: {srv.pedidosAsociados.length}</span>
                <span>Viajes lancha: {srv.viajesRealizados}</span>
                <span>Puesto: {srv.puestoAsignadoId || 'Sin asignar'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {servicioSeleccionado && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="font-mono font-bold text-indigo-400 uppercase">Control: {servicioSeleccionado.codigoServicio}</span>
            <button onClick={() => setServicioSeleccionado(null)} className="text-[10px] text-slate-400 hover:text-white underline">Cerrar detalle</button>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">
              Prioridad SCI (Exclusivo Comandancia - RF06):
            </label>
            <div className="flex gap-2 mb-2">
              {(['BAJA', 'MEDIA', 'ALTA'] as Prioridad[]).map(p => (
                <button
                  key={p}
                  disabled={!esComando}
                  onClick={() => cambiarPrioridadServicio(servicioSeleccionado.id, p, motivoPrioridad || 'Evaluación de Comando')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border ${
                    servicioSeleccionado.prioridad === p ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                  } disabled:opacity-30`}
                >
                  {p}
                </button>
              ))}
            </div>
            {esComando && (
              <input
                type="text"
                placeholder="Motivo del cambio de prioridad..."
                value={motivoPrioridad}
                onChange={e => setMotivoPrioridad(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-[11px] text-white"
              />
            )}
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">Derivación a Puesto Operativo (RF08):</label>
            <select
              value={servicioSeleccionado.puestoAsignadoId || ''}
              onChange={e => derivarServicioAPuesto(servicioSeleccionado.id, e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
            >
              <option value="">Seleccionar base de destino...</option>
              {puestos.filter(p => p.activo).map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">Recursos y Embarcaciones Asignadas (RF09):</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {servicioSeleccionado.recursosAsignados.map(recId => (
                <span key={recId} className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                  <Anchor className="w-3 h-3" /> {recId}
                  <button onClick={() => liberarRecursoDeServicio(servicioSeleccionado.id, recId)} className="hover:text-red-400 ml-1">×</button>
                </span>
              ))}
            </div>
            {recursosDisponibles.length > 0 && (
              <select
                onChange={e => {
                  if (e.target.value) {
                    asignarRecursoAServicio(servicioSeleccionado.id, e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                defaultValue=""
              >
                <option value="" disabled>+ Despachar recurso disponible...</option>
                {recursosDisponibles.map(r => (
                  <option key={r.id} value={r.id}>{r.codigo} ({r.tipo}) - Base: {r.puestoId}</option>
                ))}
              </select>
            )}
          </div>

          {servicioSeleccionado.estado !== 'RESUELTO' && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => registrarViajeParcial(servicioSeleccionado.id)}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-800/50 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Registrar Viaje Parcial Completado (RN06)
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => resolverServicio(servicioSeleccionado.id, 'EVACUACION_TOTAL', 'Atención completa realizada')}
                  className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                >
                  Evacuación Total
                </button>
                <button
                  onClick={() => resolverServicio(servicioSeleccionado.id, 'RECHAZO_FIRMA', 'Familia no acepta abandonar el inmueble')}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
                >
                  Rechazo Firmado
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}