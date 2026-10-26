import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Plus } from 'lucide-react';
import TacticalMap from '../Components/TacticalMap';
import ClimaHora from '../Components/ClimaHora';
import Sidebar from '../Components/Sidebar';
import BuscadorCoordenadas from '../Components/BuscadorCoordenadas';
import ControlCapas from '../Components/ControlCapas';
import ModalCrearEmergencia from '../Components/ModalCrearEmergencia';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [coordenadaBuscada, setCoordenadaBuscada] = useState<[number, number] | null>(null);
  const [capaMapa, setCapaMapa] = useState<'calles' | 'satelite'>('calles');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-[1000] p-2.5 bg-white/40 hover:bg-white/60 text-slate-900 rounded-xl shadow-lg border border-white/50 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          title="Abrir menú"
        >
          <Menu className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {!isSidebarOpen && (
        <div className="absolute top-4 left-[76px] z-[1000]">
          <ControlCapas capaActual={capaMapa} onChangeCapa={setCapaMapa} />
        </div>
      )}

      <div className="absolute top-4 right-4 z-[1000]">
        <ClimaHora />
      </div>

      {nombreUsuario && (
        <div className="absolute top-[96px] right-4 z-[1000] bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-lg flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-800" />
          <span className="text-xs font-bold text-slate-900 capitalize">
            {nombreUsuario}
          </span>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
        <BuscadorCoordenadas
          onBuscar={(coords) => setCoordenadaBuscada(coords)}
          onLimpiar={() => setCoordenadaBuscada(null)}
          hasPuntoActivo={Boolean(coordenadaBuscada)}
        />
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        onGoHome={handleGoHome}
        nombreUsuario={nombreUsuario}
        fotoUsuario={fotoUsuario}
        rol="COMANDANCIA"
      />

      <main className="w-full h-full">
        <TacticalMap 
          coordenadaObjetivo={coordenadaBuscada} 
          capaActual={capaMapa} 
        />
      </main>

      {!isSidebarOpen && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-8 right-20 z-[1000] bg-indigo-600/90 hover:bg-indigo-600 backdrop-blur-md text-white px-5 py-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-indigo-400/50 transition-all active:scale-95 cursor-pointer flex items-center gap-2 font-bold text-sm"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          Crear emergencia
        </button>
      )}

      <ModalCrearEmergencia 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}