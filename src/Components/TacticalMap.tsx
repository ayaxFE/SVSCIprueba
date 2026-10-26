// src/Components/TacticalMap.tsx
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ServicioIncidente, Prioridad } from '../types/operativo';
import { useOperativo } from '../Context/OperativoContext';

const ARECO_COORDINATES: [number, number] = [-34.2460, -59.4720];
const CENTRAL_73_COORDINATES: [number, number] = [-34.24995, -59.47448];

interface TacticalMapProps {
  coordenadaObjetivo?: [number, number] | null;
  capaActual: 'calles' | 'satelite';
  servicios: ServicioIncidente[];
  onSeleccionarServicio?: (servicio: ServicioIncidente) => void;
}

// Paleta de prioridades según tabla de triage de sus bocetos
const COLOR_PRIORIDAD: Record<Prioridad, string> = {
  ALTA: '#ef4444',   // Rojo (Crítico / Riesgo vital)
  MEDIA: '#f59e0b',  // Naranja/Amarillo (Emergencia / Preventivo)
  BAJA: '#10b981'    // Verde (Urgencia menor / Suministros)
};

export default function TacticalMap({
  coordenadaObjetivo,
  capaActual,
  servicios,
  onSeleccionarServicio
}: TacticalMapProps) {
  const { 
    puestos, 
    servicioIdEsperandoUbicacion, 
    setServicioIdEsperandoUbicacion,
    ubicarManualmenteServicio,
    cambiarPrioridadServicio,
    rolActivo
  } = useOperativo();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const incidentLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const puestosLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const previewPinRef = useRef<L.Marker | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);

  // Estado para la mira roja a pantalla completa (ejes X e Y) y el panel de triage
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [coordsTemporales, setCoordsTemporales] = useState<[number, number] | null>(null);
  const [prioridadTriage, setPrioridadTriage] = useState<Prioridad>('ALTA');
  const [motivoTriage, setMotivoTriage] = useState<string>('Menores / Adultos mayores en vivienda');

  // 1. Inicialización única del lienzo Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: ARECO_COORDINATES,
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Pin del Cuartel Central N° 73
    const centralIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div style="background-color: #991b1b; padding: 5px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 9px; font-weight: 900; font-family: monospace;">C-73</span>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    L.marker(CENTRAL_73_COORDINATES, { icon: centralIcon })
      .addTo(map)
      .bindPopup('<strong>Cuartel Central N° 73</strong><br/>Comando de Incidentes (SCI)');

    // Polígono hidrográfico siguiendo la ribera real del Río Areco
    const cuencaRioArecoReal: [number, number][] = [
      [-34.2385, -59.4895], [-34.2370, -59.4840], [-34.2345, -59.4790],
      [-34.2355, -59.4720], [-34.2380, -59.4640], [-34.2410, -59.4580],
      [-34.2460, -59.4530], [-34.2490, -59.4560], [-34.2440, -59.4640],
      [-34.2460, -59.4710], [-34.2435, -59.4770], [-34.2415, -59.4830],
      [-34.2430, -59.4880]
    ];

    L.polygon(cuencaRioArecoReal, {
      color: '#0284c7',
      fillColor: '#38bdf8',
      fillOpacity: 0.22,
      weight: 2,
      dashArray: '4, 6'
    }).addTo(map);

    puestosLayerGroupRef.current = L.layerGroup().addTo(map);
    incidentLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !coordenadaObjetivo) return;

    if (targetMarkerRef.current) map.removeLayer(targetMarkerRef.current);
    targetMarkerRef.current = L.marker(coordenadaObjetivo).addTo(map);
    map.flyTo(coordenadaObjetivo, 16, { animate: true, duration: 1.2 });
  }, [coordenadaObjetivo]);

  // 2. Sincronización del clic para previsualizar el pin azul tipo Google Maps antes de confirmar "MARCAR"
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!servicioIdEsperandoUbicacion) return;
      setCoordsTemporales([e.latlng.lat, e.latlng.lng]);

      if (previewPinRef.current) {
        map.removeLayer(previewPinRef.current);
      }

      // Pin celeste/azul de preselección idéntico al boceto 042551.jpg
      const blueDropPin = L.divIcon({
        className: 'bg-transparent',
        html: `
          <div style="position: relative; width: 38px; height: 46px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));">
            <svg viewBox="0 0 24 24" width="38" height="46" fill="#0ea5e9" stroke="#ffffff" stroke-width="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="3" fill="#0f172a"/>
            </svg>
          </div>
        `,
        iconSize: [38, 46],
        iconAnchor: [19, 42]
      });

      previewPinRef.current = L.marker([e.latlng.lat, e.latlng.lng], {
        icon: blueDropPin,
        draggable: true
      }).addTo(map);

      previewPinRef.current.on('dragend', (ev) => {
        const pos = ev.target.getLatLng();
        setCoordsTemporales([pos.lat, pos.lng]);
      });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [servicioIdEsperandoUbicacion]);

  // Limpieza del pin temporal al salir del modo captura
  useEffect(() => {
    if (!servicioIdEsperandoUbicacion && previewPinRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(previewPinRef.current);
      previewPinRef.current = null;
      setCoordsTemporales(null);
    }
  }, [servicioIdEsperandoUbicacion]);

  // 3. Cambio de capa base (Calles / Satélite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);

    const callesUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const sateliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    
    tileLayerRef.current = L.tileLayer(capaActual === 'satelite' ? sateliteUrl : callesUrl, {
      attribution: '&copy; OpenStreetMap &copy; ESRI',
      maxZoom: 19,
    }).addTo(map);
  }, [capaActual]);

  // 4. Puestos de Operaciones con pin azul institucional
  useEffect(() => {
    const group = puestosLayerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    puestos.filter(p => p.activo).forEach(puesto => {
      const puestoIcon = L.divIcon({
        className: 'bg-transparent',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.6));">
            <svg viewBox="0 0 24 24" width="30" height="36" fill="#2563eb" stroke="#ffffff" stroke-width="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="3" fill="#ffffff"/>
            </svg>
            <span style="background:#0f172a; color:#38bdf8; border:1px solid #38bdf8; font-size:9px; font-weight:900; padding:1px 5px; border-radius:4px; margin-top:-4px; white-space:nowrap;">
              ${puesto.id}
            </span>
          </div>
        `,
        iconSize: [80, 48],
        iconAnchor: [40, 36]
      });

      L.marker(puesto.coordenadas, { icon: puestoIcon })
        .addTo(group)
        .bindPopup(`<strong>${puesto.nombre}</strong><br/>Sector: ${puesto.sectorCobertura}`);
    });
  }, [puestos]);

  // 5. Renderizado de incidentes con PINES TIPO GOOGLE MAPS + Símbolo de Estado (Propuesta 1 y 3)
  useEffect(() => {
    const layerGroup = incidentLayerGroupRef.current;
    if (!layerGroup) return;
    layerGroup.clearLayers();

    servicios.forEach((servicio) => {
      if (!servicio.coordenadas) return;

      const esResuelto = servicio.estado === 'RESUELTO';
      const colorPin = esResuelto ? '#64748b' : COLOR_PRIORIDAD[servicio.prioridad];

      // Símbolo interno según estado (Propuesta 1 de la captura 042626.jpg):
      // '!' = Pendiente | '▶' = En atención | '✓' = Resuelto
      const simboloEstado = 
        servicio.estado === 'PENDIENTE' ? '!' : 
        servicio.estado === 'EN_ATENCION' ? '▶' : '✓';

      const googlePinHtml = `
        <div style="position: relative; width: 34px; height: 42px; cursor: grab; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.55));" title="Arrastrar para ajustar ubicación">
          <svg viewBox="0 0 24 24" width="34" height="42" fill="${colorPin}" stroke="#ffffff" stroke-width="1.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
          <div style="position: absolute; top: 6px; left: 50%; transform: translateX(-50%); width: 16px; height: 16px; border-radius: 9999px; background-color: rgba(15,23,42,0.85); color: #ffffff; font-size: 10px; font-weight: 900; display: flex; align-items: center; justify-content: center; font-family: sans-serif;">
            ${simboloEstado}
          </div>
        </div>
      `;

      const incidentIcon = L.divIcon({
        className: 'bg-transparent',
        html: googlePinHtml,
        iconSize: [34, 42],
        iconAnchor: [17, 40], // La punta inferior del pin clava exactamente en la coordenada
        popupAnchor: [0, -36]
      });

      const marker = L.marker([servicio.coordenadas.lat, servicio.coordenadas.lng], { 
        icon: incidentIcon,
        draggable: rolActivo === 'COMANDANCIA' || rolActivo === 'OPERADOR_CARGA'
      }).addTo(layerGroup);

      marker.on('dragend', (e) => {
        const nuevaPos = e.target.getLatLng();
        ubicarManualmenteServicio(servicio.id, nuevaPos.lat, nuevaPos.lng);
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; min-width: 195px;">
          <div style="font-weight: 900; color: ${colorPin}; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>${servicio.codigoServicio}</span>
            <span>PRIORIDAD ${servicio.prioridad}</span>
          </div>
          <strong>${servicio.direccionPrincipal}</strong> (${servicio.barrio})<br/>
          <span>Estado: <b>${servicio.estado}</b></span><br/>
          <span>Puesto: <b>${servicio.puestoAsignadoId || 'Sin derivar'}</b></span><br/>
          <span>Llamados asociados: <b>${servicio.pedidosAsociados.length}</b></span>
        </div>
      `);

      marker.on('click', () => {
        if (onSeleccionarServicio) onSeleccionarServicio(servicio);
      });
    });
  }, [servicios, onSeleccionarServicio, ubicarManualmenteServicio, rolActivo]);

  // Confirmación del panel derecho "Marcador y triage táctico"
  const confirmarMarcadoTactico = async () => {
    if (!servicioIdEsperandoUbicacion || !coordsTemporales) {
      alert('Hacé clic en un punto del mapa para clavar el marcador celeste antes de confirmar.');
      return;
    }
    ubicarManualmenteServicio(servicioIdEsperandoUbicacion, coordsTemporales[0], coordsTemporales[1]);
    if (rolActivo === 'COMANDANCIA' || rolActivo === 'ADMINISTRADOR') {
      await cambiarPrioridadServicio(servicioIdEsperandoUbicacion, prioridadTriage, motivoTriage);
    }
    setServicioIdEsperandoUbicacion(null);
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onMouseMove={(e) => {
        if (servicioIdEsperandoUbicacion) {
          setMousePos({ x: e.clientX, y: e.clientY });
        }
      }}
    >
      {/* RETÍCULA DE EJES ROJOS A PANTALLA COMPLETA (Boceto 042551.jpg y 042721.jpg) */}
      {servicioIdEsperandoUbicacion && (
        <>
          {/* Eje Horizontal Rojo */}
          <div 
            className="pointer-events-none fixed left-0 right-0 h-[1.5px] bg-red-600/90 z-[1040]"
            style={{ top: `${mousePos.y}px` }}
          />
          {/* Eje Vertical Rojo */}
          <div 
            className="pointer-events-none fixed top-0 bottom-0 w-[1.5px] bg-red-600/90 z-[1040]"
            style={{ left: `${mousePos.x}px` }}
          />

          {/* PANEL DERECHO: MARCADOR Y TRIAGE TÁCTICO (Boceto 042551.jpg) */}
          <div className="fixed top-4 right-4 bottom-4 w-80 bg-slate-900/95 border-2 border-slate-700 rounded-2xl z-[1250] p-5 flex flex-col justify-between shadow-2xl text-xs text-slate-200">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="font-black text-white uppercase tracking-wider">
                  Marcador y triage táctico
                </span>
                <button 
                  onClick={() => setServicioIdEsperandoUbicacion(null)}
                  className="text-red-500 font-black text-base hover:text-red-400"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-slate-400">📍 UBICACIÓN SELECCIONADA:</div>
                {coordsTemporales ? (
                  <div className="text-sky-400 font-bold">
                    Lat: {coordsTemporales[0].toFixed(5)} | Lng: {coordsTemporales[1].toFixed(5)}
                  </div>
                ) : (
                  <div className="text-amber-400 animate-pulse">
                    Hacé clic sobre la calle en el mapa...
                  </div>
                )}
              </div>

              {/* Botonera vertical de colores de Triage (Exclusivo Comando - RF06) */}
              <div className="space-y-2">
                <label className="font-black text-slate-300 uppercase text-[10px] block">
                  Nivel de Prioridad Triage (RF06):
                </label>

                <button
                  type="button"
                  disabled={rolActivo !== 'COMANDANCIA' && rolActivo !== 'ADMINISTRADOR'}
                  onClick={() => setPrioridadTriage('ALTA')}
                  className={`w-full py-2.5 px-3 rounded-xl font-black text-white flex justify-between items-center bg-red-600 ${
                    prioridadTriage === 'ALTA' ? 'ring-2 ring-white scale-[1.02]' : 'opacity-60'
                  }`}
                >
                  <span>CRÍTICO / ALTA</span>
                  <span className="text-[10px] font-mono">0 MIN</span>
                </button>

                <button
                  type="button"
                  disabled={rolActivo !== 'COMANDANCIA' && rolActivo !== 'ADMINISTRADOR'}
                  onClick={() => setPrioridadTriage('MEDIA')}
                  className={`w-full py-2.5 px-3 rounded-xl font-black text-slate-950 flex justify-between items-center bg-amber-500 ${
                    prioridadTriage === 'MEDIA' ? 'ring-2 ring-white scale-[1.02]' : 'opacity-60'
                  }`}
                >
                  <span>EMERGENCIA / MEDIA</span>
                  <span className="text-[10px] font-mono">10-60 MIN</span>
                </button>

                <button
                  type="button"
                  disabled={rolActivo !== 'COMANDANCIA' && rolActivo !== 'ADMINISTRADOR'}
                  onClick={() => setPrioridadTriage('BAJA')}
                  className={`w-full py-2.5 px-3 rounded-xl font-black text-white flex justify-between items-center bg-emerald-600 ${
                    prioridadTriage === 'BAJA' ? 'ring-2 ring-white scale-[1.02]' : 'opacity-60'
                  }`}
                >
                  <span>URGENCIA MENOR / BAJA</span>
                  <span className="text-[10px] font-mono">120 MIN</span>
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Motivo / Observación de Comando:</label>
                <input
                  type="text"
                  value={motivoTriage}
                  onChange={(e) => setMotivoTriage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setServicioIdEsperandoUbicacion(null)}
                className="py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl uppercase"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={confirmarMarcadoTactico}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl uppercase shadow-lg"
              >
                MARCAR
              </button>
            </div>
          </div>
        </>
      )}

      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}