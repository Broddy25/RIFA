import fs from 'fs';
import path from 'path';

export interface PortalConfig {
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
  adminPassword: string; // default '52496221402'
}

export interface PortalProject {
  titulo: string;
  descripcion: string;
  foto: string;
  docx: string;
  actualizado: string;
}

export interface Producto {
  producto: string;
  cantidad: number;
  precio: number;
  total: number;
}

export interface NumeroTicket {
  numero: number;
  estado: 'Disponible' | 'Reservado' | 'Vendido';
  ventaId: string;
  participante: string;
  fecha: string;
}

export interface Venta {
  id: string;
  fecha: string;
  rol: 'A' | 'C'; // A: Colaborador, C: Comprador
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  tickets: number[];
  cantidad: number;
  monto: number;
  metodo: string;
  referencia: string;
  estado: 'Pendiente' | 'Pagada' | 'Anulada' | 'Vencida';
  fechaConfirmacion: string;
  codigoLider: string;
}

export interface SorteoGanador {
  fecha: string;
  ciclo: number;
  rifa: 'A' | 'C';
  numero: number;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  ventaId: string;
  premio: string;
}

export interface RifaConfig {
  titulo: string;
  texto: string;
  nombre: string;
  moneda: string;
  comunidad: string;
  representante: string;
  precioA: number;
  premioA: number;
  maxA: number;
  precioC: number;
  premioC: string;
  maxC: number;
  horasReserva: number;
  datosPago: string;
  whatsapp: string;
  ciclo: number;
  adminPin: string; // default '1402'
}

export interface Lider {
  codigo: string;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  fechaRegistro: string;
  estado: 'Activo' | 'Inactivo';
}

export interface LiderConfig {
  titulo: string;
  texto: string;
  moneda: string;
  urlRifa: string;
  minTickets: number;
  tasaBase: number;
  tier2Sobre: number;
  tasaNivel2: number;
  bonoPrimerLugar: number;
  rifasCuentan: 'C' | 'A' | 'AMBAS';
  adminPin: string; // default '1402'
}

export interface LiquidacionItem {
  id: string;
  ciclo: number;
  fechaLiquidacion: string;
  puesto: number;
  codigo: string;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  tickets: number;
  monto: number;
  tasa: number;
  comision: number;
  bono: number;
  total: number;
  pagado: boolean;
}

export interface DatabaseSchema {
  portal: {
    config: PortalConfig;
    proyecto: PortalProject;
    historial: Array<{
      fecha: string;
      comunidad: string;
      representante: string;
      telefono: string;
      correo: string;
    }>;
  };
  rifa: {
    config: RifaConfig;
    productos: Producto[];
    numerosA: NumeroTicket[];
    ticketsC: NumeroTicket[];
    ventas: Venta[];
    sorteos: SorteoGanador[];
    historialVentas: Array<{ ciclo: number; venta: Venta }>;
    historialSorteos: SorteoGanador[];
  };
  lideres: {
    config: LiderConfig;
    lista: Lider[];
    liquidaciones: LiquidacionItem[];
  };
}

const DEFAULT_PRODUCTOS: Producto[] = [
  { producto: 'ACEITE VATEL 1/2LTS', cantidad: 3, precio: 1.60, total: 4.80 },
  { producto: 'ARROZ ESMERALDA PRIMOR', cantidad: 4, precio: 1.25, total: 5.00 },
  { producto: 'ATÚN MARGARITA', cantidad: 3, precio: 1.80, total: 5.40 },
  { producto: 'AVENA QUAKER 1KGS', cantidad: 2, precio: 2.80, total: 5.60 },
  { producto: 'AZÚCAR LA PASTORA 1KGS', cantidad: 4, precio: 1.30, total: 5.20 },
  { producto: 'CAFÉ LA NONA 400GRS', cantidad: 2, precio: 3.80, total: 7.60 },
  { producto: 'CARAOTAS MAIZALITO', cantidad: 4, precio: 1.30, total: 5.20 },
  { producto: 'DIABLITO UNDERWOOD GRANDE', cantidad: 2, precio: 2.50, total: 5.00 },
  { producto: 'GALLETAS DE SODA PUIG', cantidad: 5, precio: 1.10, total: 5.50 },
  { producto: 'GALLETAS MARIA PUIG', cantidad: 6, precio: 0.90, total: 5.40 },
  { producto: 'HARINA DE TRIGO ROBIN HOOD 1KGS', cantidad: 4, precio: 1.40, total: 5.60 },
  { producto: 'HARINA PAN', cantidad: 5, precio: 1.05, total: 5.25 },
  { producto: 'LECHE EN POLVO SAN SIMON 400GRS', cantidad: 1, precio: 4.50, total: 4.50 },
  { producto: 'LENTEJAS MAIZALITO', cantidad: 4, precio: 1.40, total: 5.60 },
  { producto: 'MAÍZ COTUFA MARY 400GRS', cantidad: 5, precio: 1.10, total: 5.50 },
  { producto: 'MAIZENA AMERICANA 400GRS', cantidad: 3, precio: 1.80, total: 5.40 },
  { producto: 'MAIZORITOS CRONCH FLAKES', cantidad: 2, precio: 2.50, total: 5.00 },
  { producto: 'MARGARINA MAVESA 500GRS', cantidad: 2, precio: 2.25, total: 4.50 },
  { producto: 'MAYONESA KRAFT', cantidad: 2, precio: 3.50, total: 7.00 },
  { producto: 'NESTEA SOBRE 500GRS', cantidad: 1, precio: 4.20, total: 4.20 },
  { producto: 'PAPEL HIGIÉNICO ROSAL 400H', cantidad: 7, precio: 0.75, total: 5.25 },
  { producto: 'PASTA CORTA CAPRI 1KGS', cantidad: 4, precio: 1.40, total: 5.60 },
  { producto: 'PASTA LARGA PRIMOR 1KGS', cantidad: 3, precio: 1.50, total: 4.50 },
  { producto: 'PRESTOBARBAS GILLETTE', cantidad: 4, precio: 1.20, total: 4.80 },
  { producto: 'SAL BAHIA 1 KG', cantidad: 4, precio: 0.45, total: 1.80 },
  { producto: 'SALSA DE TOMATE HEINZ', cantidad: 3, precio: 2.20, total: 6.60 },
  { producto: 'SARDINAS MARGARITA', cantidad: 5, precio: 1.00, total: 5.00 },
  { producto: 'SOBRE SOPA DE POLLO MAGGI', cantidad: 7, precio: 0.65, total: 4.55 },
  { producto: 'TODDY 400GRS', cantidad: 1, precio: 5.06, total: 5.06 },
  { producto: 'VINAGRE BLANCO HEINZ', cantidad: 3, precio: 1.50, total: 4.50 }
];

function generateDefaultNumbers(count: number): NumeroTicket[] {
  const result: NumeroTicket[] = [];
  for (let i = 1; i <= count; i++) {
    result.push({
      numero: i,
      estado: 'Disponible',
      ventaId: '',
      participante: '',
      fecha: ''
    });
  }
  return result;
}

export function createDefaultDatabase(): DatabaseSchema {
  return {
    portal: {
      config: {
        titulo: 'MEGACESTA',
        subtitulo: 'SISTEMA DE AUTOFINANCIAMIENTO DE PROYECTOS',
        comunidad: 'Encuentro Ciudadano',
        representante: 'Coordinación Comunitaria',
        telefono: '0412-1234567',
        correo: 'lochitaclub@gmail.com',
        logo: '',
        urlRifa: '',
        urlReferidos: '',
        adminPassword: '52496221402'
      },
      proyecto: {
        titulo: 'Proyecto de Abastecimiento Comunitario y Mejoras',
        descripcion: 'Iniciativa organizada de autofinanciamiento comunitario para sustentar proyectos locales, compras conjuntas y apoyo solidario a las familias de la comunidad.',
        foto: '',
        docx: '',
        actualizado: new Date().toISOString()
      },
      historial: []
    },
    rifa: {
      config: {
        titulo: 'Dos rifas. Una cesta de 100 productos.',
        texto: 'Participa como colaborador o como comprador. Los sorteos se realizan solos al agotarse los números.',
        nombre: 'MEGACESTA',
        moneda: '$',
        comunidad: 'Encuentro Ciudadano',
        representante: 'Coordinación Comunitaria',
        precioA: 3,
        premioA: 300,
        maxA: 10,
        precioC: 1,
        premioC: 'La MEGACESTA (100 productos)',
        maxC: 50,
        horasReserva: 24,
        datosPago: 'Pago Móvil: Banco de Venezuela (0102) - CI 12.345.678 - Teléfono: 0412-1234567\nZelle: pagos@megacesta.org\nEfectivo: Coordina directamente con tu líder comunitario.',
        whatsapp: '584121234567',
        ciclo: 1,
        adminPin: '1402'
      },
      productos: DEFAULT_PRODUCTOS,
      numerosA: generateDefaultNumbers(100),
      ticketsC: generateDefaultNumbers(1000),
      ventas: [],
      sorteos: [],
      historialVentas: [],
      historialSorteos: []
    },
    lideres: {
      config: {
        titulo: 'Programa de Líderes MEGACESTA',
        texto: 'Regístrate, comparte tu código y gana comisiones por cada ticket que vendas.',
        moneda: '$',
        urlRifa: '',
        minTickets: 10,
        tasaBase: 10,
        tier2Sobre: 20,
        tasaNivel2: 15,
        bonoPrimerLugar: 300,
        rifasCuentan: 'C',
        adminPin: '1402'
      },
      lista: [],
      liquidaciones: []
    }
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

class DatabaseManager {
  private memoryDb: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.memoryDb = JSON.parse(raw);
        this.migrateIfNeeded();
      } catch (err) {
        console.error('Error reading database file, initializing defaults:', err);
        this.memoryDb = createDefaultDatabase();
        this.persistImmediate();
      }
    } else {
      this.memoryDb = createDefaultDatabase();
      this.persistImmediate();
    }
  }

  private migrateIfNeeded() {
    let changed = false;
    const defaults = createDefaultDatabase();

    if (!this.memoryDb.portal) {
      this.memoryDb.portal = defaults.portal;
      changed = true;
    }
    if (!this.memoryDb.rifa) {
      this.memoryDb.rifa = defaults.rifa;
      changed = true;
    }
    if (!this.memoryDb.lideres) {
      this.memoryDb.lideres = defaults.lideres;
      changed = true;
    }
    if (!this.memoryDb.rifa.numerosA || this.memoryDb.rifa.numerosA.length !== 100) {
      this.memoryDb.rifa.numerosA = generateDefaultNumbers(100);
      changed = true;
    }
    if (!this.memoryDb.rifa.ticketsC || this.memoryDb.rifa.ticketsC.length !== 1000) {
      this.memoryDb.rifa.ticketsC = generateDefaultNumbers(1000);
      changed = true;
    }
    if (!this.memoryDb.rifa.productos || this.memoryDb.rifa.productos.length === 0) {
      this.memoryDb.rifa.productos = DEFAULT_PRODUCTOS;
      changed = true;
    }

    if (changed) {
      this.persistImmediate();
    }
  }

  public get(): DatabaseSchema {
    return this.memoryDb;
  }

  public save(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistImmediate();
    }, 200);
  }

  public persistImmediate(): void {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.memoryDb, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  /**
   * Cleans up expired reservations across both rifas.
   */
  public liberarVencidas(): boolean {
    const db = this.memoryDb;
    const maxMs = (db.rifa.config.horasReserva || 24) * 3600 * 1000;
    const now = Date.now();
    const expiredSales = new Set<string>();
    let changed = false;

    // Check A
    for (const num of db.rifa.numerosA) {
      if (num.estado === 'Reservado' && num.fecha) {
        const t = new Date(num.fecha).getTime();
        if (now - t >= maxMs) {
          expiredSales.add(num.ventaId);
          num.estado = 'Disponible';
          num.ventaId = '';
          num.participante = '';
          num.fecha = '';
          changed = true;
        }
      }
    }

    // Check C
    for (const tick of db.rifa.ticketsC) {
      if (tick.estado === 'Reservado' && tick.fecha) {
        const t = new Date(tick.fecha).getTime();
        if (now - t >= maxMs) {
          expiredSales.add(tick.ventaId);
          tick.estado = 'Disponible';
          tick.ventaId = '';
          tick.participante = '';
          tick.fecha = '';
          changed = true;
        }
      }
    }

    // Mark sales as Vencida
    if (expiredSales.size > 0) {
      for (const v of db.rifa.ventas) {
        if (expiredSales.has(v.id) && v.estado === 'Pendiente') {
          v.estado = 'Vencida';
          changed = true;
        }
      }
    }

    if (changed) {
      this.save();
    }

    return changed;
  }

  /**
   * Sorteos automáticos:
   * "El sorteo SOLO ocurre cuando se vendieron los 1000 tickets de compradores:
   * en ese instante se sortea la rifa de compradores y, a la vez, la de colaboradores
   * si sus 100 números también están vendidos. Si faltaran números de colaboradores,
   * esa rifa se sortea automáticamente en cuanto se complete."
   */
  public verificarSorteos(): { [key in 'A' | 'C']?: SorteoGanador } {
    const db = this.memoryDb;
    const ciclo = db.rifa.config.ciclo;
    const yaSorteada = (rol: 'A' | 'C') =>
      db.rifa.sorteos.some((s) => s.ciclo === ciclo && s.rifa === rol);

    const completaC = db.rifa.ticketsC.every((t) => t.estado === 'Vendido');
    const completaA = db.rifa.numerosA.every((n) => n.estado === 'Vendido');

    const nuevosSorteos: { [key in 'A' | 'C']?: SorteoGanador } = {};

    // Compradores can only draw if all 1000 tickets are sold
    if (completaC && !yaSorteada('C')) {
      const winnerTicket = db.rifa.ticketsC[Math.floor(Math.random() * db.rifa.ticketsC.length)];
      const venta = db.rifa.ventas.find((v) => v.id === winnerTicket.ventaId);
      const ganador: SorteoGanador = {
        fecha: new Date().toISOString(),
        ciclo,
        rifa: 'C',
        numero: winnerTicket.numero,
        nombre: winnerTicket.participante || venta?.nombre || 'Ganador',
        cedula: venta?.cedula || '',
        telefono: venta?.telefono || '',
        correo: venta?.correo || '',
        ventaId: winnerTicket.ventaId,
        premio: db.rifa.config.premioC
      };
      db.rifa.sorteos.push(ganador);
      nuevosSorteos.C = ganador;
    }

    // Colaboradores draws if all 100 are sold AND (either C has drawn or C is complete)
    // As per specification: "a la vez la de colaboradores si sus 100 están vendidos.
    // Si faltaran, se sortea automáticamente en cuanto se complete"
    if (completaA && !yaSorteada('A') && (completaC || yaSorteada('C'))) {
      const winnerNum = db.rifa.numerosA[Math.floor(Math.random() * db.rifa.numerosA.length)];
      const venta = db.rifa.ventas.find((v) => v.id === winnerNum.ventaId);
      const ganador: SorteoGanador = {
        fecha: new Date().toISOString(),
        ciclo,
        rifa: 'A',
        numero: winnerNum.numero,
        nombre: winnerNum.participante || venta?.nombre || 'Ganador',
        cedula: venta?.cedula || '',
        telefono: venta?.telefono || '',
        correo: venta?.correo || '',
        ventaId: winnerNum.ventaId,
        premio: `${db.rifa.config.moneda}${db.rifa.config.premioA}`
      };
      db.rifa.sorteos.push(ganador);
      nuevosSorteos.A = ganador;
    }

    if (Object.keys(nuevosSorteos).length > 0) {
      this.save();
    }

    return nuevosSorteos;
  }
}

export const dbManager = new DatabaseManager();
