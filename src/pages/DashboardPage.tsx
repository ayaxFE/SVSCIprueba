import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import TacticalMap from '../components/TacticalMap';
import ClimaHora from '../components/ClimaHora';
import Sidebar from '../components/Sidebar';
import BuscadorCoordenadas from '../components/BuscadorCoordenadas';
import ControlCapas from '../components/ControlCapas';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [coordenadaBuscada, setCoordenadaBuscada] = useState<[number, number] | null>(null);
  
  const [capaMapa, setCapaMapa] = useState<'calles' | 'satelite'>('calles');

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('@SVSCI:ultimoUsuario');
    if (usuarioGuardado) {
      try {
        const usuarioParseado = JSON.parse(usuarioGuardado);
        setNombreUsuario(usuarioParseado.nombre);
        setFotoUsuario(usuarioParseado.foto || null); 
      } catch {
        setNombreUsuario(usuarioGuardado);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('@SVSCI:ultimoUsuario');
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-slate-950 select-none">

      {/* 1. Botón de menú tipo sandwich */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-[1000] p-2.5 bg-white/40 hover:bg-white/60 text-slate-900 rounded-xl shadow-lg border border-white/50 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          title="Abrir menú"
        >
          <Menu className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Selector de capas */}
      {!isSidebarOpen && (
        <div className="absolute top-4 left-[76px] z-[1000]">
          <ControlCapas capaActual={capaMapa} onChangeCapa={setCapaMapa} />
        </div>
      )}

      {/* 2. Reloj y Clima */}
      <div className="absolute top-4 right-4 z-[1000]">
        <ClimaHora />
      </div>

      {/* 3. Nombre del usuario */}
      {nombreUsuario && (
        <div className="absolute top-[96px] right-4 z-[1000] bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-lg flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-800" />
          <span className="text-xs font-bold text-slate-900 capitalize">
            {nombreUsuario}
          </span>
        </div>
      )}

      {/* 4. Buscador de coordenadas */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
        <BuscadorCoordenadas
          onBuscar={(coords) => setCoordenadaBuscada(coords)}
          onLimpiar={() => setCoordenadaBuscada(null)}
          hasPuntoActivo={Boolean(coordenadaBuscada)}
        />
      </div>

      {/* 5. Barra lateral */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        onGoHome={handleGoHome}
        nombreUsuario={nombreUsuario}
        fotoUsuario={fotoUsuario}
        rol="COMANDANCIA"
      />

      {/* 6. Visor cartográfico */}
      <main className="w-full h-full">
        <TacticalMap 
          coordenadaObjetivo={coordenadaBuscada} 
          capaActual={capaMapa} 
        />
      </main>

    </div>
  );
}