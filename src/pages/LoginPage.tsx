// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useOperativo } from '../Context/OperativoContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUsuarioSesion } = useOperativo();
  const [legajo, setLegajo] = useState('073/032'); // Cmte. Gral. Testoni predeterminado para demo
  const [pin, setPin] = useState('1234');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const resp = await fetch('http://localhost:3001/api/auth/login-legajo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legajo, pin }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Credenciales inválidas.');
      }

      setUsuarioSesion(data.usuario);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-slate-950 to-slate-950 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-8 backdrop-blur-xl z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-red-600/10 border border-red-500/30 rounded-2xl mx-auto flex items-center justify-center text-red-500 shadow-inner">
            <Shield className="w-9 h-9" />
          </div>
          <h1 className="text-xl font-black text-white tracking-wider uppercase font-mono">
            CENTRAL 73 - ARECO
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Sistema de Coordinación ante Emergencias (SCI)
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800/80 p-3 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1 uppercase tracking-wider text-[10px]">
              Número de Legajo Institucional
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={legajo}
                onChange={(e) => setLegajo(e.target.value)}
                placeholder="Ej: 073/032"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono font-bold tracking-widest outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1 uppercase tracking-wider text-[10px]">
              Código de Seguridad (PIN)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono tracking-widest outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              PIN asignado por defecto para homologación: <strong className="text-slate-400 font-mono">1234</strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {cargando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Validar Identidad y Tomar Turno</span>
            )}
          </button>
        </form>

        <div className="border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[10px] text-slate-500">
            Padrón activo conforme a la Planilla de Asistencia I.N.O.B.V. 073
          </p>
        </div>
      </div>
    </div>
  );
}