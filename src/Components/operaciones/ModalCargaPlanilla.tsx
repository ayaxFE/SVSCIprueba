// src/Components/operaciones/ModalCargaPlanilla.tsx
import { useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useOperativo } from '../../Context/OperativoContext';
import type { PedidoLlamado } from '../../types/operativo';

interface ModalCargaPlanillaProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCargaPlanilla({ isOpen, onClose }: ModalCargaPlanillaProps) {
  const { agregarPedidoDesdePapel, servicios, usuarioActual, setServicioIdEsperandoUbicacion } = useOperativo();

  const [fecha, setFecha] = useState<string>('26/10');
  const [horaRecepcion, setHoraRecepcion] = useState<string>('14:00');
  const [numeroPedido, setNumeroPedido] = useState<number>(324);
  const [tipoEmergencia, setTipoEmergencia] = useState<string>('Inundación de vivienda');
  const [direccion, setDireccion] = useState<string>('');
  const [barrio, setBarrio] = useState<string>('Costanera');
  const [nombre, setNombre] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [estaEnElLugar, setEstaEnElLugar] = useState<boolean>(true);
  const [adultos, setAdultos] = useState<number>(3);
  const [menores, setMenores] = useState<number>(4);
  const [detalle, setDetalle] = useState<string>('');

  if (!isOpen) return null;

  // Cálculo automático especificado en el boceto 042551.jpg
  const cantidadTotalPersonas = Number(adultos) + Number(menores);

  // Detección de duplicados por domicilio (RF04)
  const posiblesDuplicados = servicios.filter(s => 
    direccion.trim().length > 3 && 
    s.direccionPrincipal.toLowerCase().includes(direccion.toLowerCase())
  );

  const handleCrearYMarcar = async (asociarAId?: string) => {
    if (!direccion.trim()) {
      alert('Ingresá la dirección o referencia antes de marcar en el mapa.');
      return;
    }

    const nuevoPedido: PedidoLlamado = {
      id: `ped-${Date.now()}`,
      numeroPedido,
      fechaRecepcion: fecha,
      horaRecepcion,
      horaCargaDigital: new Date().toTimeString().substring(0, 5),
      operadorCarga: usuarioActual,
      responsableDecision: usuarioActual,
      tipoEmergencia,
      detalle,
      direccion,
      barrio,
      informante: {
        apellidoNombre: nombre || 'Sin especificar',
        telefono: telefono || 'S/D',
        estaEnElLugar
      },
      familiaAfectada: nombre || 'Vecino afectado',
      censoInformado: {
        adultos: Number(adultos),
        menores: Number(menores)
      },
      datosIncompletos: !nombre || !telefono,
      servicioVinculadoId: asociarAId
    };

    const nuevoServicioId = await agregarPedidoDesdePapel(nuevoPedido, asociarAId);
    if (!nuevoServicioId) {
      alert('No se pudo registrar el pedido. Revisá la conexión con el servidor e intentá nuevamente.');
      return;
    }
    onClose();

    // Si es un servicio nuevo, activa automáticamente la mira roja en el mapa ("CREAR y Marcar")
    if (!asociarAId) {
      setServicioIdEsperandoUbicacion(nuevoServicioId);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900/95 border-2 border-slate-600 w-full max-w-4xl rounded-3xl shadow-2xl p-6 text-white space-y-5">
        
        {/* Fila Superior: Botón atrás, Fecha, Hora y Pedido Nro (Boceto 042551.jpg) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-black text-base">Fecha:</span>
            <input 
              type="text" 
              value={fecha} 
              onChange={e => setFecha(e.target.value)}
              className="bg-slate-950 border-2 border-slate-500 rounded-xl px-3 py-1 text-center font-bold w-28"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-black text-base">Hora:</span>
            <input 
              type="text" 
              value={horaRecepcion} 
              onChange={e => setHoraRecepcion(e.target.value)}
              className="bg-slate-950 border-2 border-slate-500 rounded-xl px-3 py-1 text-center font-bold w-28"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-black text-lg">Pedido Nro.:</span>
            <input 
              type="number" 
              value={numeroPedido} 
              onChange={e => setNumeroPedido(Number(e.target.value))}
              className="bg-slate-950 border-2 border-slate-400 rounded-xl px-4 py-1 text-center font-black text-xl w-32"
            />
          </div>
        </div>

        {/* Cuerpo en 3 columnas exactamente como el boceto */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-xs">
          
          {/* Columna Izquierda: Datos de ubicación y solicitante */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="font-black text-sm w-28">Emergencia:</label>
              <input type="text" value={tipoEmergencia} onChange={e => setTipoEmergencia(e.target.value)} className="flex-1 bg-slate-950 border border-slate-500 rounded-lg px-3 py-1.5 font-bold" />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="font-black text-sm w-28">Dirección:</label>
              <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Av. Güiraldes 450" className="flex-1 bg-slate-950 border border-slate-500 rounded-lg px-3 py-1.5 font-bold" />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="font-black text-sm w-28">Barrio:</label>
              <select value={barrio} onChange={e => setBarrio(e.target.value)} className="flex-1 bg-slate-950 border border-slate-500 rounded-lg px-3 py-1.5 font-bold">
                <option value="Costanera">Costanera</option>
                <option value="Don Pancho">Don Pancho</option>
                <option value="Amespil">Amespil</option>
                <option value="Cantera">Cantera</option>
                <option value="Los Horneros">Los Horneros</option>
                <option value="Zona Rural">Zona Rural</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="font-black text-sm w-28">Apellido/Nombre:</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Juan Pérez" className="flex-1 bg-slate-950 border border-slate-500 rounded-lg px-3 py-1.5 font-bold" />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="font-black text-sm w-28">Teléfono:</label>
              <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="2326 657632" className="flex-1 bg-slate-950 border border-slate-500 rounded-lg px-3 py-1.5 font-mono font-bold" />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <span className="font-black text-sm">Está en el lugar:</span>
              <button
                type="button"
                onClick={() => setEstaEnElLugar(true)}
                className={`px-3 py-1 rounded-lg font-black border-2 ${estaEnElLugar ? 'bg-emerald-500 text-white border-white' : 'bg-slate-800 text-slate-400 border-slate-600'}`}
              >
                SI
              </button>
              <button
                type="button"
                onClick={() => setEstaEnElLugar(false)}
                className={`px-3 py-1 rounded-lg font-black border-2 ${!estaEnElLugar ? 'bg-red-600 text-white border-white' : 'bg-slate-800 text-slate-400 border-slate-600'}`}
              >
                NO
              </button>
            </div>
          </div>

          {/* Columna Central: Adultos, Menores y Cantidad de Personas autocalculada */}
          <div className="md:col-span-3 space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-black text-sm">Adultos (+18):</label>
              <input 
                type="number" 
                min={0}
                value={adultos} 
                onChange={e => setAdultos(Number(e.target.value))}
                className="w-16 bg-slate-950 border-2 border-slate-400 rounded-lg py-1 text-center font-black text-base"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="font-black text-sm">Menores (-18):</label>
              <input 
                type="number" 
                min={0}
                value={menores} 
                onChange={e => setMenores(Number(e.target.value))}
                className="w-16 bg-slate-950 border-2 border-slate-400 rounded-lg py-1 text-center font-black text-base"
              />
            </div>

            <div className="pt-2">
              <label className="font-black text-sm block mb-1">Cantidad de personas:</label>
              <div className="w-full bg-slate-950 border-2 border-emerald-500/80 rounded-xl py-1.5 text-center font-black text-base text-emerald-400">
                {cantidadTotalPersonas}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Total físico para cálculo de equipo de traslado
              </span>
            </div>
          </div>

          {/* Columna Derecha: Caja de Detalles y Botones CANCELAR / CREAR y Marcar */}
          <div className="md:col-span-4 flex flex-col justify-between h-full space-y-4">
            <div className="bg-slate-950 border-2 border-slate-400 rounded-2xl p-3 flex flex-col h-40">
              <span className="font-black text-sm text-center border-b border-slate-800 pb-1 mb-2">Detalles:</span>
              <textarea
                value={detalle}
                onChange={e => setDetalle(e.target.value)}
                placeholder="Descripción de la emergencia, presencia de ancianos o dificultades de acceso..."
                className="w-full flex-1 bg-transparent resize-none outline-none text-xs font-bold text-center"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-3 bg-amber-500 hover:bg-amber-400 text-white font-black rounded-2xl uppercase tracking-wider shadow-lg cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={() => handleCrearYMarcar()}
                className="py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl uppercase tracking-wider shadow-lg cursor-pointer"
              >
                CREAR y Marcar
              </button>
            </div>
          </div>
        </div>

        {/* Alerta RF04 si el domicilio ya fue informado */}
        {posiblesDuplicados.length > 0 && (
          <div className="bg-amber-950/60 border border-amber-500 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Coincidencia detectada con {posiblesDuplicados[0].codigoServicio} ({posiblesDuplicados[0].direccionPrincipal})</span>
            </div>
            <button
              type="button"
              onClick={() => handleCrearYMarcar(posiblesDuplicados[0].id)}
              className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-lg"
            >
              Vincular a Servicio Existente
            </button>
          </div>
        )}

      </div>
    </div>
  );
}