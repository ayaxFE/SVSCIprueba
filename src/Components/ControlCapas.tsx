import { Map as MapIcon, Satellite } from 'lucide-react';

interface ControlCapasProps {
  capaActual: 'calles' | 'satelite';
  onChangeCapa: (capa: 'calles' | 'satelite') => void;
}

export default function ControlCapas({ capaActual, onChangeCapa }: ControlCapasProps) {
  return (
    <div className="flex bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <button
        onClick={() => onChangeCapa('calles')}
        className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors ${
          capaActual === 'calles' 
            ? 'bg-slate-800 text-white' 
            : 'text-slate-600 hover:bg-slate-100'
        }`}
        title="Capa de Calles"
      >
        <MapIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Calles</span>
      </button>
      <div className="w-px bg-slate-300"></div>
      <button
        onClick={() => onChangeCapa('satelite')}
        className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors ${
          capaActual === 'satelite' 
            ? 'bg-slate-800 text-white' 
            : 'text-slate-600 hover:bg-slate-100'
        }`}
        title="Capa Satelital"
      >
        <Satellite className="w-4 h-4" />
        <span className="hidden sm:inline">Satélite</span>
      </button>
    </div>
  );
}