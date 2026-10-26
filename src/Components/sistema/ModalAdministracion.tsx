// src/Components/sistema/ModalAdministracion.tsx
import { X, ShieldCheck, Users, MapPin, UserCheck } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';

interface ModalAdministracionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalAdministracion({ isOpen, onClose }: ModalAdministracionProps) {
  const { puestos, usuarios, toggleEstadoPuesto, toggleUsuarioActivo, cambiarSesionRelevo, usuarioActual } = useOperativo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs text-slate-200">
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Administración de Puestos, Accesos y Relevos (RF01 / RF02)
              </h2>
              <p className="text-[11px] text-slate-400">Gestión de bases operativas avanzadas, permisos SCI y cambio de turno</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Bloque 1: Puestos de Operaciones */}
          <div>
            <h3 className="font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-400" /> Puestos de Operaciones Configurados (RF01)
            </h3>
            <div className="space-y-2">
              {puestos.map(p => (
                <div key={p.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{p.nombre}</div>
                    <div className="text-[11px] text-slate-400">Responsable: {p.responsable} • Cobertura: {p.sectorCobertura}</div>
                  </div>
                  <button
                    onClick={() => toggleEstadoPuesto(p.id)}
                    className={`px-3 py-1 rounded-lg font-bold text-[10px] ${
                      p.activo ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.activo ? 'ACTIVO EN MAPA' : 'DESACTIVADO'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bloque 2: Usuarios y Simulación de Relevo de Guardia */}
          <div>
            <h3 className="font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" /> Personal Autorizado y Relevo de Turno (RF02)
            </h3>
            <div className="space-y-2">
              {usuarios.map(u => {
                const esSesionActual = usuarioActual === u.nombre;
                return (
                  <div key={u.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {u.nombre}
                        <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300">{u.rol}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Jerarquía: {u.jerarquia}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => cambiarSesionRelevo(u.nombre, u.rol)}
                        disabled={esSesionActual}
                        className={`px-3 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 ${
                          esSesionActual
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <UserCheck className="w-3 h-3" />
                        {esSesionActual ? 'Sesión en Uso' : 'Tomar Relevo'}
                      </button>
                      <button
                        onClick={() => toggleUsuarioActivo(u.id)}
                        className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 hover:text-white"
                      >
                        {u.activo ? 'Habilitado' : 'Suspendido'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}