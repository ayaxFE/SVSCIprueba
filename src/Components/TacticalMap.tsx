import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ARECO_COORDINATES: [number, number] = [-34.2497, -59.4725];
const CASA_COORDINATES: [number, number] = [-34.249956816672835, -59.4744814363303];

interface TacticalMapProps {
  coordenadaObjetivo?: [number, number] | null;
  capaActual: 'calles' | 'satelite';
}

export default function TacticalMap({ coordenadaObjetivo, capaActual }: TacticalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // 1. Inicialización única del mapa base
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: ARECO_COORDINATES,
      zoom: 15,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const customIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="flex flex-col items-center transition-transform duration-300" style="transform-origin: center 20px;">
          <div class="text-white p-2 rounded-full shadow-lg border-2 border-white z-50" style="background-color: #FD342C;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [100, 60],
      iconAnchor: [50, 22],
    });

    const marcadorCasa = L.marker(CASA_COORDINATES, { icon: customIcon }).addTo(map);

    const manejarZoom = () => {
      const currentZoom = map.getZoom();
      const markerElement = marcadorCasa.getElement();

      if (markerElement) {
        const innerDiv = markerElement.firstElementChild as HTMLElement;
        if (currentZoom < 13) {
          innerDiv.style.opacity = '0';
          innerDiv.style.pointerEvents = 'none';
        } else if (currentZoom === 13 || currentZoom === 14) {
          innerDiv.style.opacity = '0.8';
          innerDiv.style.transform = 'scale(0.6)';
          innerDiv.style.pointerEvents = 'auto';
        } else {
          innerDiv.style.opacity = '1';
          innerDiv.style.transform = 'scale(1)';
          innerDiv.style.pointerEvents = 'auto';
        }
      }
    };

    map.on('zoomend', manejarZoom);
    manejarZoom();

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Cambiar la capa (calles o satélite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const callesUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const sateliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    const url = capaActual === 'satelite' ? sateliteUrl : callesUrl;

    const nuevaCapa = L.tileLayer(url, {
      attribution: '&copy; OpenStreetMap &copy; ESRI',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = nuevaCapa;
  }, [capaActual]);

  // 3. Sincronización del punto buscado
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (!coordenadaObjetivo) {
      if (searchMarkerRef.current) {
        map.removeLayer(searchMarkerRef.current);
        searchMarkerRef.current = null;
      }
      return;
    }

    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }

    const searchIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; width: 24px; height: 24px; background-color: rgba(79, 70, 229, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background-color: #4f46e5; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.4);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const nuevoMarcador = L.marker(coordenadaObjetivo, { icon: searchIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
          <strong style="color: #4f46e5;">Ubicación Encontrada</strong><br/>
          Lat: ${coordenadaObjetivo[0].toFixed(5)}<br/>
          Lng: ${coordenadaObjetivo[1].toFixed(5)}
        </div>
      `)
      .openPopup();

    searchMarkerRef.current = nuevoMarcador;

    map.flyTo(coordenadaObjetivo, 17, {
      animate: true,
      duration: 1.5,
    });
  }, [coordenadaObjetivo]);

  return <div ref={mapContainerRef} className="w-full h-full z-0" />;
}