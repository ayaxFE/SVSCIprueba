// src/Components/Sidebar.tsx
import {
  Compass, LayoutDashboard, ClipboardList, Radio, MapPinOff, Users2,
  SlidersHorizontal, History, Printer, FileSpreadsheet, CheckCircle2,
  ShieldCheck, Bell, Settings, LogOut, X, User as UserIcon
} from 'lucide-react';
import type { SeccionPanel } from '../types/operativo';
import { useOperativo } from '../Context/OperativoContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome: () => void;
  onLogout: () => void;
  onSeleccionarSeccion: (seccion: SeccionPanel) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  onLogout,
  onSeleccionarSeccion,
}: SidebarProps) {
  const { rolActivo, usuarioActual, serviciosFiltrados, servicios, solicitudesPuesto, novedadesVHF } = useOperativo();

  const activosCount = serviciosFiltrados.filter(s => s.estado !== 'RESUELTO').length;
  const sinUbicacionCount = servicios.filter(s => !s.coordenadas && s.estado !== 'RESUELTO').length;
  const solicitudesCount = solicitudesPuesto.filter(s => s.estado === 'PENDIENTE_APROBACION').length;

  const nav = (seccion: SeccionPanel) => {
    onSeleccionarSeccion(seccion);
    onClose();
  };

  return (
    <>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[1050] lg:hidden" />}

      <aside className={`fixed top-0 left-0 h-screen w-72 bg-slate-900/95 text-slate-200 border-r border-slate-800 z-[1100] flex flex-col transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <span className="text-sm font-black tracking-widest text-red-500 uppercase font-mono">CENTRAL 73 ARECO</span>
            <div className="text-[10px] text-slate-400 font-bold">SISTEMA COMANDO INCIDENTES</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
          <div>
            <button onClick={() => nav(null)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white hover:bg-slate-800 font-bold">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Mapa táctico</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Operaciones</div>
            <button onClick={() => nav('TABLERO')} className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-950/60 text-indigo-200 border border-indigo-800/60 font-bold">
              <span className="flex items-center gap-2.5"><LayoutDashboard className="w-4 h-4 text-indigo-400" /> Tablero de servicios</span>
              <span className="bg-indigo-800 text-white font-mono text-[10px] px-2 py-0.5 rounded-full">{activosCount}</span>
            </button>
            <button onClick={() => nav('CARGA_PLANILLA')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <ClipboardList className="w-4 h-4 text-red-400" /> <span>Carga de planillas</span>
            </button>
            <button onClick={() => nav('SOLICITUDES_PUESTO')} className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <span className="flex items-center gap-2.5"><Radio className="w-4 h-4 text-amber-400" /> Solicitudes de puestos</span>
              {solicitudesCount > 0 && <span className="bg-amber-600 text-slate-950 font-mono text-[10px] px-1.5 py-0.5 rounded-full font-black">{solicitudesCount}</span>}
            </button>
          </div>

          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Gestión táctica y territorio</div>
            <button onClick={() => nav('PENDIENTES_UBICACION')} className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <span className="flex items-center gap-2.5"><MapPinOff className="w-4 h-4 text-rose-400" /> Pendientes de ubicación</span>
              {sinUbicacionCount > 0 && <span className="bg-rose-600 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-full font-black">{sinUbicacionCount}</span>}
            </button>
            <button onClick={() => nav('PUESTOS_RECURSOS')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <Users2 className="w-4 h-4 text-emerald-400" /> <span>Puestos y recursos</span>
            </button>
            <button onClick={() => nav('FILTROS')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <SlidersHorizontal className="w-4 h-4 text-sky-400" /> <span>Filtros de vista</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Datos, auditoría y cierre</div>
            <button onClick={() => nav('HISTORIAL')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <History className="w-4 h-4 text-indigo-400" /> <span>Historial e Indicadores</span>
            </button>
            <button onClick={() => nav('EXPORTAR')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <Printer className="w-4 h-4 text-slate-400" /> <span>Imprimir y exportar</span>
            </button>
            <button onClick={() => nav('IMPORTAR')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> <span>Importar plantilla</span>
            </button>
            <button onClick={() => nav('CIERRE')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> <span>Cierre operativo</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Sistema</div>
            <button onClick={() => nav('ADMINISTRACION')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> <span>Administración y Relevos</span>
            </button>
            <button onClick={() => nav('NOVEDADES_VHF')} className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <span className="flex items-center gap-2.5"><Bell className="w-4 h-4 text-sky-400" /> Novedades VHF / Apoyo</span>
              <span className="bg-sky-950 text-sky-400 font-mono text-[10px] px-1.5 py-0.5 rounded-full">{novedadesVHF.length}</span>
            </button>
            <button onClick={() => nav('CONFIGURACION')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold">
              <Settings className="w-4 h-4 text-slate-400" /> <span>Configuración</span>
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{usuarioActual}</div>
              <div className="text-[10px] font-mono text-indigo-400 font-bold">{rolActivo}</div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/50 hover:bg-red-900 text-red-200 text-xs font-bold">
            <LogOut className="w-3.5 h-3.5" /> <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}