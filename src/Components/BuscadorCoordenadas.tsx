import React, { useState } from 'react';
import { Search, MapPin, AlertCircle, X } from 'lucide-react';

interface BuscadorCoordenadasProps {
  onBuscar: (coordenadas: [number, number]) => void;
  onLimpiar: () => void;
  hasPuntoActivo: boolean;
}

export default function BuscadorCoordenadas({
  onBuscar,
  onLimpiar,
  hasPuntoActivo
}: BuscadorCoordenadasProps) {
  const [inputValor, setInputValor] = useState('');
  const [error, setError] = useState<string | null>(null);

  const procesarBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inputValor.trim()) return;

    const regexCoordenadas = /^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/;
    const match = inputValor.match(regexCoordenadas);

    if (!match) {
      setError('Formato inválido. Use: latitud, longitud (Ej: -34.25, -59.47)');
      return;
    }

    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);

    if (lat < -90 || lat > 90) {
      setError('Latitud fuera de rango (-90 a 90)');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitud fuera de rango (-180 a 180)');
      return;
    }

    onBuscar([lat, lng]);
  };

  const handleLimpiarTodo = () => {
    setInputValor('');
    setError(null);
    onLimpiar(); 
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="mb-2 flex items-center gap-1.5 bg-red-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-md backdrop-blur-md">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={procesarBusqueda}
        className="flex flex-col gap-1 bg-white/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 shadow-lg transition-all focus-within:border-indigo-500/60"
      >
        <label
          htmlFor="buscador-coords"
          className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"
        >
          <MapPin className="w-3 h-3 text-red-600" />
          Buscador de coordenadas
        </label>

        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-700 shrink-0" />
          <input
            id="buscador-coords"
            type="text"
            value={inputValor}
            onChange={(e) => {
              setInputValor(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ej: -34.2497, -59.4725"
            className="bg-transparent text-slate-900 placeholder:text-slate-500 text-xs font-bold outline-none w-48 sm:w-56"
          />

          {(inputValor.length > 0 || hasPuntoActivo) && (
            <button
              type="button"
              onClick={handleLimpiarTodo}
              className="p-1 rounded-full text-slate-600 hover:text-red-600 hover:bg-white/40 transition-colors cursor-pointer"
              title="Borrar texto y desfijar punto del mapa"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-900 hover:text-white border border-indigo-500/30 text-[10px] font-extrabold transition-all cursor-pointer shrink-0"
            title="Ir a coordenadas"
          >
            Buscar
          </button>
        </div>
      </form>
    </div>
  );
}