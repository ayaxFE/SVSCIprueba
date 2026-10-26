// src/Components/territorio/ModalFiltrosMapa.tsx
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';

interface ModalFiltrosMapaProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalFiltrosMapa({ isOpen, onClose }: ModalFiltrosMapaProps) {
  const { filtros, setFiltros, puestos, serviciosFiltrados, servicios } = useOperativo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-xs text-slate-200">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            Filtros Tácticos de Vista (RF07)
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-bold text-slate-400 block mb-1">Filtrar por Barrio / Zona</label>
            <select
              value={filtros.barrio}
              onChange={e => setFiltros(prev => ({ ...prev, barrio: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="TODOS">Todos los barrios</option>
              <option value="Costanera">Costanera</option>
              <option value="Amespil">Amespil</option>
              <option value="Cantera">Cantera</option>
              <option value="Centro">Centro</option>
              <option value="Zona Rural">Zona Rural</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-400 block mb-1">Filtrar por Prioridad SCI</label>
            <select
              value={filtros.prioridad}
              onChange={e => setFiltros(prev => ({ ...prev, prioridad: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="TODAS">Todas las prioridades</option>
              <option value="ALTA">ALTA (Crítica)</option>
              <option value="MEDIA">MEDIA (Moderada)</option>
              <option value="BAJA">BAJA (Preventiva)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-400 block mb-1">Filtrar por Estado Operativo</label>
            <select
              value={filtros.estado}
              onChange={e => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="EN_ATENCION">EN ATENCIÓN</option>
              <option value="RESUELTO">RESUELTO</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-400 block mb-1">Puesto de Operaciones (Ámbito)</label>
            <select
              value={filtros.puestoId}
              onChange={e => setFiltros(prev => ({ ...prev, puestoId: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="TODOS">Todos los puestos</option>
              {puestos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
          <span className="text-slate-400">Mostrando en mapa y tablero:</span>
          <span className="font-mono font-black text-indigo-400">
            {serviciosFiltrados.length} de {servicios.length} servicios
          </span>
        </div>

        <div className="flex justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => setFiltros({ barrio: 'TODOS', prioridad: 'TODAS', estado: 'TODOS', puestoId: 'TODOS' })}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpiar Filtros
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black"
          >
            Aplicar Vista
          </button>
        </div>
      </div>
    </div>
  );
}