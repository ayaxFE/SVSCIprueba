// src/types/operativo.ts

export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA';
export type EstadoOperativo = 'PENDIENTE' | 'EN_ATENCION' | 'RESUELTO';
export type ResultadoServicio = 
  | 'EVACUACION_TOTAL' 
  | 'EVACUACION_PARCIAL_VIAJES' 
  | 'RECHAZO_FIRMA' 
  | 'AUTOEVACUADO' 
  | 'INACCESIBLE';

export type RolOperativo = 'COMANDANCIA' | 'OPERADOR_CARGA' | 'PUESTO_OPERACIONES' | 'ADMINISTRADOR';

export type SeccionPanel = 
  | 'TABLERO'
  | 'CARGA_PLANILLA'
  | 'SOLICITUDES_PUESTO'
  | 'PENDIENTES_UBICACION'
  | 'PUESTOS_RECURSOS'
  | 'FILTROS'
  | 'HISTORIAL'
  | 'EXPORTAR'
  | 'IMPORTAR'
  | 'CIERRE'
  | 'ADMINISTRACION'
  | 'NOVEDADES_VHF'
  | 'CONFIGURACION'
  | null;

export interface PuestoOperativo {
  id: string;
  nombre: string;
  responsable: string;
  sectorCobertura: string;
  activo: boolean;
  coordenadas: [number, number];
}

export interface UsuarioSistema {
  id: string;
  nombre: string;
  jerarquia: string;
  rol: RolOperativo;
  puestoAsignado?: string;
  activo: boolean;
}

export interface Recurso {
  id: string;
  codigo: string;
  tipo: 'EMBARCACION' | 'VEHICULO_TERRESTRE' | 'KAYAK';
  disponible: boolean;
  puestoId: string;
  dotacionActual: string[];
}

export interface PedidoLlamado {
  id: string;
  numeroPedido: number;
  fechaRecepcion: string;
  horaRecepcion: string;
  horaCargaDigital: string;
  operadorCarga: string;
  responsableDecision: string;
  tipoEmergencia: string;
  detalle: string;
  direccion: string;
  barrio: string;
  informante: {
    apellidoNombre: string;
    telefono: string;
    estaEnElLugar: boolean;
  };
  familiaAfectada: string;
  censoInformado: {
    adultos: number;
    menores: number;
  };
  datosIncompletos: boolean;
  servicioVinculadoId?: string;
  prioridad?: Prioridad;
}

export interface ServicioIncidente {
  id: string;
  codigoServicio: string;
  prioridad: Prioridad;
  prioridadJustificacion?: string;
  estado: EstadoOperativo;
  puestoAsignadoId?: string;
  horaDerivacion?: string;
  direccionPrincipal: string;
  barrio: string;
  coordenadas?: {
    lat: number;
    lng: number;
    esAproximada: boolean;
  };
  recursosAsignados: string[];
  pedidosAsociados: PedidoLlamado[];
  viajesRealizados: number;
  censoConstatado?: {
    adultosEvacuados: number;
    menoresEvacuados: number;
    permanecenEnVivienda: number;
  };
  resultadoFinal?: ResultadoServicio;
  motivoResultado?: string;
  horaResolucion?: string;
}

export interface SolicitudPuesto {
  id: string;
  puestoOrigen: string;
  horaSolicitud: string;
  descripcion: string;
  direccion: string;
  personasEstimadas: number;
  estado: 'PENDIENTE_APROBACION' | 'APROBADA' | 'RECHAZADA';
}

export interface NovedadVHF {
  id: string;
  hora: string;
  emisor: string;
  canal: string;
  servicioRelacionadoCodigo?: string;
  mensaje: string;
  esUrgente: boolean;
  respuestaComando?: string;
}

// Entidad requerida para la trazabilidad y auditoría cronológica (RF13)
export interface EventoAuditoria {
  id: string;
  timestamp: string;
  usuario: string;
  rol: RolOperativo;
  modulo: string;
  accion: string;
  detalle: string;
}

export interface FiltrosOperativos {
  barrio: string;
  prioridad: string;
  estado: string;
  puestoId: string;
}

export interface ConfiguracionOperativo {
  nombreOperativo: string;
  nivelRioMetros: number;
  cuotaAlertaMetros: number;
  simulacionSinConexion: boolean;
}

// Alias de retrocompatibilidad por si algún componente antiguo aún busca 'Incidente'
export type Incidente = ServicioIncidente;