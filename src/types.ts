export interface PortalData {
  config: {
    titulo: string;
    subtitulo: string;
    comunidad: string;
    representante: string;
    telefono: string;
    correo: string;
    logo: string;
    logoLochita?: string;
    logoMegacesta?: string;
    urlRifa: string;
    urlReferidos: string;
  };
  comunidad: {
    nombre: string;
    representante: string;
    telefono: string;
    correo: string;
    logo: string;
    logoLochita?: string;
    logoMegacesta?: string;
  };
  proyecto: {
    titulo: string;
    descripcion: string;
    foto: string;
    docx: string;
    actualizado: string;
  };
  urlRifa: string;
  urlReferidos: string;
}

export interface Producto {
  producto: string;
  cantidad: number;
  precio: number;
  total: number;
}

export interface GanadorInfo {
  fecha: string;
  numero: number;
  nombre: string;
  premio: string;
}

export interface RifaState {
  config: {
    nombre: string;
    moneda: string;
    comunidad: string;
    representante: string;
    titulo: string;
    texto: string;
    premioC: string;
    pago: string;
    whatsapp: string;
    horas: number;
    ciclo: number;
    A: { total: number; precio: number; premio: number; max: number };
    C: { total: number; precio: number; max: number };
  };
  stats: {
    A: { vendidos: number; reservados: number; disponibles: number };
    C: { vendidos: number; reservados: number; disponibles: number };
  };
  mapa: {
    A: string;
    C: string;
  };
  productos: Producto[];
  ganadores: {
    A: GanadorInfo | null;
    C: GanadorInfo | null;
  };
}

export interface LiderRankRow {
  puesto: number;
  nombre: string;
  tickets: number;
  tasa: number;
  bono: number;
}

export interface LiderPublicState {
  config: {
    titulo: string;
    texto: string;
    moneda: string;
    min: number;
    tasa1: number;
    tier2: number;
    tasa2: number;
    bono: number;
    cuentan: string;
  };
  ciclo: number;
  sorteado: boolean;
  liquidado: boolean;
  top: LiderRankRow[];
  totalLideres: number;
  historico: Array<{
    ciclo: number;
    fecha: string;
    filas: LiderRankRow[];
  }>;
}

export interface MiPanelData {
  nombre: string;
  codigo: string;
  tickets: number;
  monto: number;
  tasa: number;
  comision: number;
  puesto: number;
  bono: number;
  total: number;
  calificado: boolean;
  faltan: number;
  paraNivel2: number;
  liquidado: boolean;
  ciclo: number;
  moneda: string;
  min: number;
  tasa1: number;
  tasa2: number;
  tier2: number;
  historial: Array<{
    ciclo: number;
    puesto: number;
    tickets: number;
    tasa: number;
    comision: number;
    bono: number;
    total: number;
    pagado: boolean;
  }>;
}

export interface VentaItem {
  id: string;
  fecha: string;
  rol: 'A' | 'C';
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  tickets: string;
  cantidad: number;
  monto: number;
  metodo: string;
  referencia: string;
  estado: 'Pendiente' | 'Pagada' | 'Anulada' | 'Vencida';
  lider: string;
}
