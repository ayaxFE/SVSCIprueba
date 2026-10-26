import {
  Compass,
  LayoutDashboard,
  ClipboardList,
  Radio,
  MapPinOff,
  Users2,
  SlidersHorizontal,
  History,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Bell,
  Settings,
  LogOut,
  X,
  User as UserIcon,
  Home
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  nombreUsuario: string | null;
  fotoUsuario?: string | null;
  rol?: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  onLogout,
  onGoHome,
  nombreUsuario,
  fotoUsuario,
  rol = 'COMANDANCIA'
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/25 backdrop-blur-xs z-[1050] lg:hidden"
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white/30 text-slate-800 backdrop-blur-xl border-r border-white/30 z-[1100] flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera institucional */}
        <div className="h-16 px-5 border-b border-white/20 flex items-center justify-between shrink-0 bg-white/10">
          <span className="text-xl font-black tracking-widest text-black drop-shadow-xs font-[Arial,sans-serif]">
            COMANDANCIA
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-700 hover:text-black hover:bg-white/40 transition-colors cursor-pointer"
            title="Cerrar barra"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zona de navegación scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs scrollbar-thin">
          
          {/* Navegación Base */}
          <div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-900 hover:bg-white/40 hover:text-black transition-all font-bold cursor-pointer">
              <Compass className="w-4 h-4 text-indigo-700" />
              <span>Mapa táctico</span>
            </button>
          </div>

          {/* Bloque: Operaciones */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Operaciones
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600/25 text-indigo-950 border border-indigo-600/40 font-black shadow-xs cursor-pointer">
              <LayoutDashboard className="w-4 h-4 text-indigo-700" />
              <span>Tablero de servicios</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <ClipboardList className="w-4 h-4 text-slate-700" />
              <span>Carga de planillas</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <Radio className="w-4 h-4 text-slate-700" />
              <span>Solicitudes de puestos</span>
            </button>
          </div>

          {/* Bloque: Gestión táctica y territorio */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Gestión táctica y territorio
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <MapPinOff className="w-4 h-4 text-slate-700" />
              <span>Pendientes de ubicación</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <Users2 className="w-4 h-4 text-slate-700" />
              <span>Puestos y recursos</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <SlidersHorizontal className="w-4 h-4 text-slate-700" />
              <span>Filtros de vista</span>
            </button>
          </div>

          {/* Bloque: Datos, auditoría y cierre */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Datos, auditoría y cierre
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <History className="w-4 h-4 text-slate-700" />
              <span>Historial e Indicadores</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Imprimir y exportar</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 text-slate-700" />
              <span>Importar plantilla</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <CheckCircle2 className="w-4 h-4 text-slate-700" />
              <span>Cierre operativo</span>
            </button>
          </div>

          {/* Bloque: Sistema */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Sistema
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <span>Administración</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <Bell className="w-4 h-4 text-slate-700" />
              <span>Notificaciones</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-white/40 hover:text-black transition-all font-semibold cursor-pointer">
              <Settings className="w-4 h-4 text-slate-700" />
              <span>Configuración</span>
            </button>
          </div>

        </div>

        {/* Zona inferior: Perfil de usuario y botones */}
        <div className="p-3 border-t border-white/20 bg-white/10 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-3 px-2 py-1.5">
            {/* Contenedor del avatar*/}
            <div className="w-9 h-9 rounded-full bg-white/50 border border-slate-300 flex items-center justify-center text-slate-800 shrink-0 shadow-xs overflow-hidden">
              {fotoUsuario ? (
                <img
                  src={fotoUsuario}
                  alt={nombreUsuario || 'Operador'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-slate-900 truncate capitalize">
                {nombreUsuario || 'Operador'}
              </div>
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                {rol}
              </div>
            </div>
          </div>

          <button
            onClick={onGoHome}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-950 border border-indigo-500/30 text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            <Home className="w-4 h-4 text-indigo-700" />
            <span>Ir al Inicio</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-800 hover:text-white border border-red-500/30 text-xs font-extrabold transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}