import { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Moon, CloudMoon, CloudSun, CloudLightning, CloudSnow, CloudDrizzle, Wind } from 'lucide-react';

export default function ClimaHora() {
  const [hora, setHora] = useState('');
  const [esDeNoche, setEsDeNoche] = useState(false);
  const [clima, setClima] = useState<{ temp: number; codigo: number; viento: number } | null>(null);

  useEffect(() => {
    const actualizarHora = () => {
      const fecha = new Date();
      
      const horaArg = fecha.toLocaleTimeString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setHora(horaArg);

      const horaFormat = fecha.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: 'numeric',
        hour12: false
      });
      const horaNumero = parseInt(horaFormat);
      setEsDeNoche(horaNumero >= 19 || horaNumero < 7);
    };

    actualizarHora();
    const intervalo = setInterval(actualizarHora, 1000);
    
    const obtenerClima = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-34.25&longitude=-59.47&current=temperature_2m,weather_code,wind_speed_10m&timezone=America%2FArgentina%2FBuenos_Aires'
        );
        const data = await res.json();
        setClima({
          temp: Math.round(data.current.temperature_2m),
          codigo: data.current.weather_code,
          viento: Math.round(data.current.wind_speed_10m)
        });
      } catch (error) {
        console.error("Error al cargar el clima", error);
      }
    };
    
    obtenerClima();
    const intervaloClima = setInterval(obtenerClima, 15 * 60 * 1000);

    return () => {
      clearInterval(intervalo);
      clearInterval(intervaloClima);
    };
  }, []);

  const getIconoClima = (codigo: number) => {
    if (codigo === 0) {
      return esDeNoche 
        ? <Moon className="w-5 h-5 text-blue-600" /> 
        : <Sun className="w-5 h-5 text-amber-500" />;
    }

    if (codigo >= 1 && codigo <= 3) {
      if (esDeNoche) {
        return <CloudMoon className="w-5 h-5 text-slate-700" />;
      }
      return codigo === 1 
        ? <CloudSun className="w-5 h-5 text-slate-700" /> 
        : <Cloud className="w-5 h-5 text-slate-700" />;
    }

    if (codigo === 45 || codigo === 48) return <Cloud className="w-5 h-5 text-slate-700" />;
    if (codigo >= 51 && codigo <= 57) return <CloudDrizzle className="w-5 h-5 text-blue-600" />;
    if (codigo >= 61 && codigo <= 67) return <CloudRain className="w-5 h-5 text-blue-700" />;
    if (codigo >= 71 && codigo <= 77) return <CloudSnow className="w-5 h-5 text-blue-500" />;
    if (codigo >= 80 && codigo <= 82) return <CloudRain className="w-5 h-5 text-blue-800" />;
    if (codigo >= 95) return <CloudLightning className="w-5 h-5 text-amber-600" />;
    
    return esDeNoche 
      ? <CloudMoon className="w-5 h-5 text-slate-700" /> 
      : <CloudSun className="w-5 h-5 text-slate-700" />;
  };

  return (
    <div className="flex flex-col gap-1.5 bg-white/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-lg">
      
      {/* Hora, Temperatura */}
      <div className="flex items-center gap-3">
        <span className="text-slate-900 font-extrabold text-xs tracking-wide">
          {hora}
        </span>
        <div className="w-px h-3.5 bg-slate-500/40"></div>
        
        <div className="flex items-center gap-1.5">
          {clima ? (
            <>
              {getIconoClima(clima.codigo)}
              <span className="text-slate-900 font-extrabold text-xs">
                {clima.temp}°
              </span>
            </>
          ) : (
            <span className="text-slate-700 font-medium text-[11px]">Cargando...</span>
          )}
        </div>
      </div>

      {/* Viento */}
      {clima && (
        <div className="flex items-center justify-center gap-1.5 border-t border-slate-500/30 pt-1.5">
          <Wind className="w-3.5 h-3.5 text-slate-800" />
          <span className="text-slate-900 font-extrabold text-[11px]">
            {clima.viento} km/h
          </span>
        </div>
      )}

    </div>
  );
}