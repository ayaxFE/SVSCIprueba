// src/pages/DashboardPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, AlertTriangle, WifiOff } from 'lucide-react';
import TacticalMap from '../Components/TacticalMap';
import Sidebar from '../Components/Sidebar';
import BuscadorCoordenadas from '../Components/BuscadorCoordenadas';
import ControlCapas from '../Components/ControlCapas';

import ModalCargaPlanilla from '../Components/operaciones/ModalCargaPlanilla';
import TableroServicios from '../Components/operaciones/TableroServicios';
import ModalSolicitudesPuesto from '../Components/operaciones/ModalSolicitudesPuesto';
import PanelPendientesUbicacion from '../Components/territorio/PanelPendientesUbicacion';
import PanelPuestosRecursos from '../Components/territorio/PanelPuestosRecursos';
import ModalFiltrosMapa from '../Components/territorio/ModalFiltrosMapa';
import ModalHistorialIndicadores from '../Components/auditoria/ModalHistorialIndicadores';
import ModalImprimirExportar from '../Components/auditoria/ModalImprimirExportar';
import ModalImportarPlantilla from '../Components/auditoria/ModalImportarPlantilla';
import ModalCierreOperativo from '../Components/auditoria/ModalCierreOperativo';
import ModalAdministracion from '../Components/sistema/ModalAdministracion';
import PanelNovedadesVHF from '../Components/sistema/PanelNovedadesVHF';
import ModalConfiguracion from '../Components/sistema/ModalConfiguracion';

import { useOperativo } from '../Context/OperativoContext';
import type { SeccionPanel } from '../types/operativo';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { 
    rolActivo, usuarioActual, usuarioLegajo, configuracion,
    serviciosFiltrados, solicitudesPuesto, setServicioIdEsperandoUbicacion
  } = useOperativo();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [panelActivo, setPanelActivo] = useState<SeccionPanel>(null);
  const [coordenadaBuscada, setCoordenadaBuscada] = useState<[number, number] | null>(null);
  const [capaMapa, setCapaMapa] = useState<'calles' | 'satelite'>('calles');

  const cerrarPanel = () => setPanelActivo(null);
  const solicitudesPendientes = solicitudesPuesto.filter(s => s.estado === 'PENDIENTE_APROBACION');

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-slate-950 select-none">

      {/* RNF04: Alerta de corte satelital */}
      {configuracion.simulacionSinConexion && (
        <div className="absolute top-0 inset-x-0 z-[1300] bg-amber-600 text-slate-950 font-black text-xs py-1.5 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>SIN CONEXIÓN — CONTINUAR RECEPCIÓN EN PLANILLA DE PAPEL (RNF04)</span>
        </div>
      )}

      {/* 1. Botón Menú y Selector de Capas (Izquierda) */}
      {!isSidebarOpen && (
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-emerald-400 rounded-xl shadow-xl border border-slate-700 cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <ControlCapas capaActual={capaMapa} onChangeCapa={setCapaMapa} />
        </div>
      )}

      {/* 2. Cartel Central "⚠️ Solicitud emergente" (Boceto 042515.jpg y 042612.jpg) */}
      {solicitudesPendientes.length > 0 && (
        <button
          onClick={() => setPanelActivo('SOLICITUDES_PUESTO')}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-sky-200/95 hover:bg-sky-100 text-slate-900 border-2 border-white px-6 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer animate-bounce"
        >
          <AlertTriangle className="w-6 h-6 text-amber-500 fill-amber-400" />
          <span className="text-lg font-black tracking-tight">
            Solicitud emergente ({solicitudesPendientes.length})
          </span>
        </button>
      )}

      {/* 3. Bloque Fijo de Usuario, Jerarquía Inmutable y Clima (Boceto 042515.jpg) */}
      <div className="absolute top-4 right-6 z-[1000] text-right pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
        <div className="text-lg font-black text-slate-100 tracking-wide">
          User: {usuarioActual} <span className="text-xs font-mono text-sky-400">({usuarioLegajo})</span>
        </div>
        <div className="text-base font-black text-amber-400 uppercase tracking-wider">
          ROL: {rolActivo}
        </div>
        <div className="text-sm font-black text-slate-300 font-mono">
          {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} / 14°C
        </div>
      </div>

      {/* 4. Buscador de Coordenadas */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
        <BuscadorCoordenadas
          onBuscar={(coords) => setCoordenadaBuscada(coords)}
          onLimpiar={() => setCoordenadaBuscada(null)}
          hasPuntoActivo={Boolean(coordenadaBuscada)}
        />
      </div>

      {/* 5. Botón Inferior Derecho "Crear emergencia" (Boceto 042515.jpg) */}
      {(rolActivo === 'COMANDANCIA' || rolActivo === 'OPERADOR_CARGA' || rolActivo === 'ADMINISTRADOR') && (
        <button
          onClick={() => setPanelActivo('CARGA_PLANILLA')}
          className="absolute bottom-6 right-6 z-[1000] bg-teal-200 hover:bg-teal-100 text-slate-900 border-4 border-teal-500 px-6 py-4 rounded-2xl shadow-2xl font-black text-base tracking-wide transition-transform active:scale-95 cursor-pointer"
        >
          Crear emergencia
        </button>
      )}

      {/* Barra Lateral con Permisos por Jerarquía */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => navigate('/login')}
        onGoHome={() => navigate('/dashboard')}
        onSeleccionarSeccion={(seccion) => setPanelActivo(seccion)}
      />

      {/* Modales y Paneles Operativos */}
      <ModalCargaPlanilla isOpen={panelActivo === 'CARGA_PLANILLA'} onClose={cerrarPanel} />
      <TableroServicios
        isOpen={panelActivo === 'TABLERO'}
        onClose={cerrarPanel}
        onCentrarEnMapa={(coords) => setCoordenadaBuscada(coords)}
      />
      <ModalSolicitudesPuesto isOpen={panelActivo === 'SOLICITUDES_PUESTO'} onClose={cerrarPanel} />
      <PanelPendientesUbicacion
        isOpen={panelActivo === 'PENDIENTES_UBICACION'}
        onClose={() => {
          setServicioIdEsperandoUbicacion(null);
          cerrarPanel();
        }}
      />
      <PanelPuestosRecursos isOpen={panelActivo === 'PUESTOS_RECURSOS'} onClose={cerrarPanel} />
      <ModalFiltrosMapa isOpen={panelActivo === 'FILTROS'} onClose={cerrarPanel} />
      <ModalHistorialIndicadores isOpen={panelActivo === 'HISTORIAL'} onClose={cerrarPanel} />
      <ModalImprimirExportar isOpen={panelActivo === 'EXPORTAR'} onClose={cerrarPanel} />
      <ModalImportarPlantilla isOpen={panelActivo === 'IMPORTAR'} onClose={cerrarPanel} />
      <ModalCierreOperativo isOpen={panelActivo === 'CIERRE'} onClose={cerrarPanel} />
      <ModalAdministracion isOpen={panelActivo === 'ADMINISTRACION'} onClose={cerrarPanel} />
      <PanelNovedadesVHF isOpen={panelActivo === 'NOVEDADES_VHF'} onClose={cerrarPanel} />
      <ModalConfiguracion isOpen={panelActivo === 'CONFIGURACION'} onClose={cerrarPanel} />

      {/* Mapa Táctico */}
      <main className="w-full h-full">
        <TacticalMap 
          coordenadaObjetivo={coordenadaBuscada} 
          capaActual={capaMapa}
          servicios={serviciosFiltrados}
          onSeleccionarServicio={() => setPanelActivo('TABLERO')}
        />
      </main>
    </div>
  );
}