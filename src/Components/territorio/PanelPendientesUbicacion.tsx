// src/Components/territorio/PanelPendientesUbicacion.tsx
import { X, MapPinOff, Crosshair } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';

interface PanelPendientesUbicacionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PanelPendientesUbicacion({ isOpen, onClose }: PanelPendientesUbicacionProps) {
  const { servicios, setServicioIdEsperandoUbicacion } = useOperativo();

  if (!isOpen) return null;
  const sinUbicacion = servicios.filter(s => !s.coordenadas && s.estado !== 'RESUELTO');

  return (
    <div className="fixed inset-y-0 right-0 z-[1150] w-full sm:w-[450px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col text-slate-200">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
            <MapPinOff className="w-4 h-4 text-rose-500" />
            Pendientes de Ubicación Cartográfica (RF05)
          </h2>
          <p className="text-[11px] text-slate-400">Llamados sin calle y altura catastral exacta</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {sinUbicacion.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Todos los servicios cuentan con georreferencia activa en el mapa.
          </div>
        ) : (
          sinUbicacion.map(srv => (
            <div key={srv.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {srv.codigoServicio}
                </span>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800">
                  Sin Punto en Mapa
                </span>
              </div>
              <div className="font-bold text-white">{srv.direccionPrincipal}</div>
              <div className="text-slate-400 text-[11px]">Barrio / Sector: {srv.barrio}</div>
              <div className="text-slate-300 italic text-[11px] bg-slate-900 p-2 rounded">
                "{srv.pedidosAsociados[0]?.detalle || 'Sin observaciones'}"
              </div>
              <button
                onClick={() => {
                  setServicioIdEsperandoUbicacion(srv.id);
                  onClose();
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <Crosshair className="w-4 h-4" /> Activar Captura y Fijar Punto en Mapa
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}