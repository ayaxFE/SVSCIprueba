export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA';
export type EstadoOperativo = 'PENDIENTE' | 'EN_ATENCION' | 'RESUELTO';

export interface Incidente {
  id: string;
  numeroPedido: number;
  tipoEmergencia: string;
  direccion: string;
  barrio: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  prioridad: Prioridad;
  estado: EstadoOperativo;
  estaAprobado: boolean;
  solicitante: {
    nombre: string;
    telefono: string;
  };
  afectados: {
    adultos: number;
    menores: number;
  };
}