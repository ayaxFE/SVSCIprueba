import { HelpCircle, User, LogOut, AlertCircle, X, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import ClimaHora from '../components/ClimaHora';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [ultimoUsuario, setUltimoUsuario] = useState<{ nombre: string; cuit: string; rol: string; foto: string | null } | null>(null);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  
  // Estados para el formulario
  const [cuit, setCuit] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('@SVSCI:ultimoUsuario');
    if (usuarioGuardado) {
      try {
        setUltimoUsuario(JSON.parse(usuarioGuardado));
      } catch {
        localStorage.removeItem('@SVSCI:ultimoUsuario');
      }
    }
  }, []);

  const obtenerInicial = (nombre: string) => {
    return nombre.trim().charAt(0).toUpperCase();
  };

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2) value = value.slice(0, 2) + '-' + value.slice(2);
    if (value.length > 10) value = value.slice(0, 11) + '-' + value.slice(11);
    setCuit(value);
  };

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin(null);

    // Datos de prueba para validación
    const usuariosPermitidos = [
      {
        cuit: '20-12345678-9',
        password: '123456',
        nombre: 'Juan Pérez',
        rol: 'COMANDANCIA',
        foto: null
      },
      {
        cuit: '27-98765432-1',
        password: 'bombero2026',
        nombre: 'Juan Rodríguez',
        rol: 'JEFE DE PUNTO',
        foto: null
      }
    ];
    
    const cuitABuscar = ultimoUsuario ? ultimoUsuario.cuit : cuit;

    const usuarioEncontrado = usuariosPermitidos.find(
      (u) => u.cuit === cuitABuscar && u.password === password
    );

    if (usuarioEncontrado) {
      const userData = {
        nombre: usuarioEncontrado.nombre,
        cuit: usuarioEncontrado.cuit,
        rol: usuarioEncontrado.rol,
        foto: usuarioEncontrado.foto
      };
      localStorage.setItem('@SVSCI:ultimoUsuario', JSON.stringify(userData));
      navigate('/dashboard');
    } else {
      setErrorLogin('Contraseña incorrecta.');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center">
        <img
          src="/login.jpg"
          alt="Fondo Bomberos"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #dc2626, #dc2626 20px, transparent 20px, transparent 40px)',
          }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>

        <div className="relative z-10 text-center px-12 flex flex-col items-center">
          <div className="bg-white p-4 rounded-3xl shadow-2xl shadow-red-900/50 mb-8 cursor-default">
            <img
              src="/logosada.jpg"
              alt="Logo Bomberos"
              className="w-24 h-24 object-contain pointer-events-none"
            />
          </div>

          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-lg">
            San Antonio de Areco
          </h1>

          <div className="w-16 h-1 bg-red-600 mb-6 rounded-full"></div>

          <p className="text-slate-300 text-lg max-w-md mx-auto font-medium leading-relaxed">
            Sistema de gestión de incidentes y emergencias por inundaciones fluviales.
          </p>
          <p className="text-red-500 text-sm mt-10 font-bold uppercase tracking-widest">
            Bomberos Voluntarios
          </p>
          <p className="text-slate-500 text-sm">San Antonio de Areco</p>
        </div>

        {/* Botón de Soporte Técnico */}
        <div className="absolute bottom-6 left-6 z-20">
          <a
            href="https://chat.whatsapp.com/LU6vD7Fta992fm1XPO45s8"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 group"
          >
            <div className="bg-slate-800/80 p-2 rounded-full group-hover:bg-green-600 transition-colors shadow-lg">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Soporte técnico
            </span>
          </a>
        </div>
      </div>

      {/* Panel Derecho - Formulario y Fondo Móvil */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white relative min-h-screen lg:min-h-0">
        
        {/* Fondo decorativo para celulares/móviles */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-[45vh] overflow-hidden bg-slate-950 pointer-events-none z-0">
          <img
            src="/login.jpg"
            alt="Fondo Bomberos Móvil"
            className="w-full h-full object-cover opacity-50"
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #dc2626, #dc2626 20px, transparent 20px, transparent 40px)',
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/40 to-white"></div>
        </div>

        {/* Widget Clima y Hora flotante */}
        <div className="absolute top-6 right-6 z-20">
          <ClimaHora />
        </div>

        {/* Contenedor del formulario */}
        <div className="w-full max-w-md space-y-6 relative z-10 pt-8 sm:pt-0">
          <div className="text-center flex flex-col items-center">
            
            {/* Avatar / Textos */}
            <div className="mb-6 flex flex-col items-center">
              {ultimoUsuario ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center shadow-md relative group cursor-pointer hover:border-slate-300 transition-colors overflow-hidden">
                    {ultimoUsuario.foto ? (
                      <img src={ultimoUsuario.foto} alt={ultimoUsuario.nombre} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-3xl font-bold text-slate-700">
                        {obtenerInicial(ultimoUsuario.nombre)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center mt-3">
                    <p className="text-sm font-medium text-slate-600 capitalize">
                      {ultimoUsuario.nombre}
                    </p>
                    <button
                      onClick={() => {
                        localStorage.removeItem('@SVSCI:ultimoUsuario');
                        window.location.reload();
                      }}
                      className="text-sm text-red-500 hover:text-red-700 font-bold flex items-center justify-center gap-1.5 mt-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      No soy {ultimoUsuario.nombre.split(' ')[0]}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-xs border-2 border-slate-200 flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-10 h-10 text-red-600" />
                </div>
              )}
            </div>

            <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              {ultimoUsuario ? `¡Hola de nuevo!` : 'Bienvenido'}
            </h2>
            <p className="text-slate-500 text-lg">
              {ultimoUsuario ? 'Ingresá tu contraseña para continuar.' : 'Ingresá con tu CUIT institucional.'}
            </p>
          </div>

          {/* Banner de Error */}
          {errorLogin && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start justify-between gap-3 shadow-xs transition-all">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-red-900 uppercase tracking-wider">Acceso denegado</h4>
                  <p className="text-xs font-medium text-red-700 mt-0.5 leading-relaxed">{errorLogin}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setErrorLogin(null)}
                className="p-1 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Formulario de login */}
          <form onSubmit={onLogin} className="mt-6 space-y-4">
            
            {/* Campo CUIT */}
            {!ultimoUsuario && (
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={cuit}
                    onChange={handleCuitChange}
                    placeholder="CUIT"
                    className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    required
                  />
                  <User className="w-5 h-5 text-slate-400 absolute left-3 top-4" />
                </div>
              </div>
            )}

            {/* Campo Contraseña */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={ultimoUsuario ? `Contraseña` : "Contraseña"}
                  className="w-full pl-10 pr-12 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  required
                  autoFocus={!!ultimoUsuario}
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {ultimoUsuario && (
                <div className="text-right mt-1">
                  <span className="text-[11px] text-slate-400 font-medium">CUIT: {ultimoUsuario.cuit}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer mt-2"
            >
              {ultimoUsuario ? 'Desbloquear Perfil' : 'Ingresar al Sistema'}
            </button>
          </form>

          {/* Ayuda de prueba */}
          {!ultimoUsuario && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-bold mb-1">Datos de prueba:</p>
              <p className="text-[11px] text-slate-500">CUIT: <span className="font-mono text-slate-800">20-12345678-9</span> | Pass: <span className="font-mono text-slate-800">123456</span></p>
            </div>
          )}

          {/* Soporte Técnico */}
          <div className="text-center mt-4 lg:hidden">
            <a
              href="https://chat.whatsapp.com/LU6vD7Fta992fm1XPO45s8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-green-600 transition-colors inline-flex items-center gap-1 font-medium"
            >
              <HelpCircle className="w-4 h-4" />
              Contactar a soporte técnico
            </a>
          </div>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-400">
                Uso exclusivo del personal autorizado
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
            Al ingresar, aceptás las normas de uso del sistema institucional.<br />
            Si no tenés acceso, contactá al administrador en Comando.
          </p>
        </div>
      </div>
    </div>
  );
}