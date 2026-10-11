import express, { Request, Response } from 'express';
import { dbManager, Venta, SorteoGanador, Lider, Producto, LiquidacionItem } from './db.js';

const router = express.Router();

// Simple in-memory token store for sessions (30 mins validity)
const sessions = new Map<string, { role: string; expires: number }>();

function createSession(role: string): string {
  const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(token, { role, expires: Date.now() + 30 * 60 * 1000 });
  return token;
}

function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const s = sessions.get(token);
  if (!s) return false;
  if (Date.now() > s.expires) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function maskName(name: string): string {
  const parts = String(name || '').trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[1].charAt(0)}.` : parts[0];
}

const normCod = (s: any) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
const normCed = (s: any) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/* ========================================================
   1. PORTAL ROUTES
   ======================================================== */

router.get('/portal', (req: Request, res: Response) => {
  const db = dbManager.get();
  const c = db.portal.config;
  const p = db.portal.proyecto;

  res.json({
    config: {
      titulo: c.titulo || 'MEGACESTA',
      subtitulo: c.subtitulo || 'SISTEMA DE AUTOFINANCIAMIENTO DE PROYECTOS',
      comunidad: c.comunidad,
      representante: c.representante,
      telefono: c.telefono,
      correo: c.correo,
      logo: c.logo,
      logoLochita: c.logoLochita || '',
      logoMegacesta: c.logoMegacesta || '',
      urlRifa: c.urlRifa,
      urlReferidos: c.urlReferidos
    },
    comunidad: {
      nombre: c.comunidad,
      representante: c.representante,
      telefono: c.telefono,
      correo: c.correo,
      logo: c.logo,
      logoLochita: c.logoLochita || '',
      logoMegacesta: c.logoMegacesta || ''
    },
    proyecto: {
      titulo: p.titulo,
      descripcion: p.descripcion,
      foto: p.foto,
      docx: p.docx,
      actualizado: p.actualizado
    },
    urlRifa: c.urlRifa,
    urlReferidos: c.urlReferidos
  });
});

router.post('/portal/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const db = dbManager.get();
  if (String(password).trim() !== String(db.portal.config.adminPassword).trim()) {
    return res.status(401).json({ error: 'Contraseña de administrador incorrecta.' });
  }
  const token = createSession('portal_admin');
  res.json({ ok: true, token });
});

router.get('/portal/admin/data', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) {
    return res.status(401).json({ error: 'Sesión vencida. Ingresa de nuevo.' });
  }
  const db = dbManager.get();
  res.json({
    datos: db.portal.config,
    proyecto: db.portal.proyecto,
    historial: db.portal.historial
  });
});

router.post('/portal/admin/comunidad', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) {
    return res.status(401).json({ error: 'Sesión vencida. Ingresa de nuevo.' });
  }

  const { titulo, subtitulo, comunidad, representante, telefono, correo, urlRifa, urlReferidos, logo, logoLochita, logoMegacesta, adminPassword } = req.body;
  const db = dbManager.get();

  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo).trim())) {
    return res.status(400).json({ error: 'El correo no es válido.' });
  }

  if (adminPassword) {
    if (!/^\d{11}$/.test(String(adminPassword).trim())) {
      return res.status(400).json({ error: 'La contraseña de admin debe tener exactamente 11 dígitos numéricos.' });
    }
    db.portal.config.adminPassword = String(adminPassword).trim();
  }

  if (titulo !== undefined) db.portal.config.titulo = String(titulo).trim();
  if (subtitulo !== undefined) db.portal.config.subtitulo = String(subtitulo).trim();
  if (comunidad !== undefined) db.portal.config.comunidad = String(comunidad).trim();
  if (representante !== undefined) db.portal.config.representante = String(representante).trim();
  if (telefono !== undefined) db.portal.config.telefono = String(telefono).trim();
  if (correo !== undefined) db.portal.config.correo = String(correo).trim();
  if (urlRifa !== undefined) db.portal.config.urlRifa = String(urlRifa).trim();
  if (urlReferidos !== undefined) db.portal.config.urlReferidos = String(urlReferidos).trim();
  if (logo !== undefined) db.portal.config.logo = logo;
  if (logoLochita !== undefined) db.portal.config.logoLochita = logoLochita;
  if (logoMegacesta !== undefined) db.portal.config.logoMegacesta = logoMegacesta;

  // Sync community name with Rifa
  if (comunidad) {
    db.rifa.config.comunidad = String(comunidad).trim();
  }
  if (representante) {
    db.rifa.config.representante = String(representante).trim();
  }

  db.portal.historial.push({
    fecha: new Date().toISOString(),
    comunidad: db.portal.config.comunidad,
    representante: db.portal.config.representante,
    telefono: db.portal.config.telefono,
    correo: db.portal.config.correo
  });

  dbManager.save();
  res.json({ ok: true, datos: db.portal.config });
});

router.post('/portal/admin/proyecto', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) {
    return res.status(401).json({ error: 'Sesión vencida. Ingresa de nuevo.' });
  }

  const { titulo, descripcion, docx, foto } = req.body;
  const db = dbManager.get();

  if (titulo !== undefined) db.portal.proyecto.titulo = String(titulo).trim();
  if (descripcion !== undefined) db.portal.proyecto.descripcion = String(descripcion).trim();
  if (docx !== undefined) db.portal.proyecto.docx = String(docx).trim();
  if (foto !== undefined) db.portal.proyecto.foto = foto;
  db.portal.proyecto.actualizado = new Date().toISOString();

  dbManager.save();
  res.json({ ok: true, proyecto: db.portal.proyecto });
});

/* ========================================================
   2. RIFA ROUTES
   ======================================================== */

router.get('/rifa/state', (req: Request, res: Response) => {
  dbManager.liberarVencidas();
  const db = dbManager.get();
  const c = db.rifa.config;
  const ciclo = c.ciclo;

  let vA = 0, rA = 0, mapA = '';
  for (const n of db.rifa.numerosA) {
    if (n.estado === 'Vendido') { mapA += 'V'; vA++; }
    else if (n.estado === 'Reservado') { mapA += 'R'; rA++; }
    else { mapA += 'D'; }
  }

  let vC = 0, rC = 0, mapC = '';
  for (const t of db.rifa.ticketsC) {
    if (t.estado === 'Vendido') { mapC += 'V'; vC++; }
    else if (t.estado === 'Reservado') { mapC += 'R'; rC++; }
    else { mapC += 'D'; }
  }

  const ganadoresCiclo = {
    A: db.rifa.sorteos.find(s => s.ciclo === ciclo && s.rifa === 'A'),
    C: db.rifa.sorteos.find(s => s.ciclo === ciclo && s.rifa === 'C')
  };

  const pubGanador = (x: SorteoGanador | undefined) =>
    x ? { fecha: x.fecha, numero: x.numero, nombre: maskName(x.nombre), premio: x.premio } : null;

  res.json({
    config: {
      nombre: c.nombre,
      moneda: c.moneda,
      comunidad: c.comunidad,
      representante: c.representante,
      titulo: c.titulo,
      texto: c.texto,
      premioC: c.premioC,
      pago: c.datosPago,
      whatsapp: c.whatsapp,
      horas: c.horasReserva,
      ciclo: c.ciclo,
      A: { total: 100, precio: c.precioA, premio: c.premioA, max: c.maxA },
      C: { total: 1000, precio: c.precioC, max: c.maxC }
    },
    stats: {
      A: { vendidos: vA, reservados: rA, disponibles: 100 - vA - rA },
      C: { vendidos: vC, reservados: rC, disponibles: 1000 - vC - rC }
    },
    mapa: { A: mapA, C: mapC },
    productos: db.rifa.productos,
    ganadores: {
      A: pubGanador(ganadoresCiclo.A),
      C: pubGanador(ganadoresCiclo.C)
    }
  });
});

router.post('/rifa/reservar', (req: Request, res: Response) => {
  dbManager.liberarVencidas();
  const db = dbManager.get();
  const { rol, tickets, nombre, cedula, telefono, correo, metodo, referencia, codigoLider } = req.body;

  if (rol !== 'A' && rol !== 'C') {
    return res.status(400).json({ error: 'Elige si eres Colaborador o Comprador.' });
  }

  const nombreStr = String(nombre || '').trim();
  const cedulaStr = String(cedula || '').trim();
  const telStr = String(telefono || '').trim();
  const mailStr = String(correo || '').trim();
  const nums = Array.isArray(tickets) ? tickets.map(Number) : [];

  if (nombreStr.length < 3) return res.status(400).json({ error: 'Escribe tu nombre completo.' });
  if (cedulaStr.replace(/\W/g, '').length < 5) return res.status(400).json({ error: 'Escribe una cédula válida.' });
  if (telStr.replace(/\D/g, '').length < 7) return res.status(400).json({ error: 'Escribe un teléfono válido.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailStr)) return res.status(400).json({ error: 'Escribe un correo válido.' });
  if (!nums.length) return res.status(400).json({ error: 'Elige al menos un número o ticket.' });

  const maxTotal = rol === 'A' ? 100 : 1000;
  const maxAllowed = rol === 'A' ? db.rifa.config.maxA : db.rifa.config.maxC;
  if (nums.length > maxAllowed) {
    return res.status(400).json({ error: `Máximo ${maxAllowed} números por compra.` });
  }

  const targetList = rol === 'A' ? db.rifa.numerosA : db.rifa.ticketsC;
  const invalidNums = nums.filter(n => !(n >= 1 && n <= maxTotal));
  if (invalidNums.length > 0) {
    return res.status(400).json({ error: 'Números inválidos.' });
  }

  const yaOcupados = nums.filter(n => targetList[n - 1].estado !== 'Disponible');
  if (yaOcupados.length > 0) {
    return res.status(400).json({ error: `Ya no están disponibles: ${yaOcupados.join(', ')}. Elige otros.` });
  }

  // Check if raffle already drawn
  const yaSorteada = db.rifa.sorteos.some(s => s.ciclo === db.rifa.config.ciclo && s.rifa === rol);
  if (yaSorteada) {
    return res.status(400).json({ error: 'Esta rifa ya fue sorteada.' });
  }

  nums.sort((a, b) => a - b);
  const now = new Date();
  const ventaId = `${rol}${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}${Math.floor(Math.random() * 90 + 10)}`;

  const nowIso = now.toISOString();
  nums.forEach(n => {
    targetList[n - 1].estado = 'Reservado';
    targetList[n - 1].ventaId = ventaId;
    targetList[n - 1].participante = nombreStr;
    targetList[n - 1].fecha = nowIso;
  });

  const precioUnit = rol === 'A' ? db.rifa.config.precioA : db.rifa.config.precioC;
  const monto = nums.length * precioUnit;
  const codLiderNorm = normCod(codigoLider);

  const nuevaVenta: Venta = {
    id: ventaId,
    fecha: nowIso,
    rol,
    nombre: nombreStr,
    cedula: cedulaStr,
    telefono: telStr,
    correo: mailStr,
    tickets: nums,
    cantidad: nums.length,
    monto,
    metodo: String(metodo || 'Pago móvil').trim(),
    referencia: String(referencia || '').trim(),
    estado: 'Pendiente',
    fechaConfirmacion: '',
    codigoLider: codLiderNorm
  };

  db.rifa.ventas.push(nuevaVenta);
  dbManager.save();

  res.json({
    ok: true,
    ventaId,
    rol,
    monto,
    moneda: db.rifa.config.moneda,
    pago: db.rifa.config.datosPago,
    whatsapp: db.rifa.config.whatsapp,
    horas: db.rifa.config.horasReserva,
    tickets: nums
  });
});

/* RIFA ADMIN */
router.post('/rifa/admin/login', (req: Request, res: Response) => {
  const { pin } = req.body;
  const db = dbManager.get();
  if (String(pin).trim() !== String(db.rifa.config.adminPin).trim()) {
    return res.status(401).json({ error: 'PIN incorrecto.' });
  }
  const token = createSession('rifa_admin');
  res.json({ ok: true, token });
});

router.get('/rifa/admin/data', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) {
    return res.status(401).json({ error: 'Sesión vencida. Ingresa de nuevo.' });
  }
  dbManager.liberarVencidas();
  const db = dbManager.get();
  const c = db.rifa.config;
  const ciclo = c.ciclo;

  let vA = 0, rA = 0;
  for (const n of db.rifa.numerosA) {
    if (n.estado === 'Vendido') vA++;
    else if (n.estado === 'Reservado') rA++;
  }

  let vC = 0, rC = 0;
  for (const t of db.rifa.ticketsC) {
    if (t.estado === 'Vendido') vC++;
    else if (t.estado === 'Reservado') rC++;
  }

  const ganadoresMap = {
    A: db.rifa.sorteos.find(s => s.ciclo === ciclo && s.rifa === 'A') || null,
    C: db.rifa.sorteos.find(s => s.ciclo === ciclo && s.rifa === 'C') || null
  };

  const ventasFormatted = [...db.rifa.ventas].reverse().map(v => ({
    id: v.id,
    fecha: v.fecha,
    rol: v.rol,
    nombre: v.nombre,
    cedula: v.cedula,
    telefono: v.telefono,
    correo: v.correo,
    tickets: v.tickets.join(', '),
    cantidad: v.cantidad,
    monto: v.monto,
    metodo: v.metodo,
    referencia: v.referencia,
    estado: v.estado,
    lider: v.codigoLider
  }));

  res.json({
    ventas: ventasFormatted,
    productos: db.rifa.productos,
    raw: {
      TITULO_PRINCIPAL: c.titulo,
      TEXTO_PRINCIPAL: c.texto,
      NOMBRE_RIFA: c.nombre,
      MONEDA: c.moneda,
      COMUNIDAD: c.comunidad,
      REPRESENTANTE: c.representante,
      PRECIO_COLABORADOR: c.precioA,
      PREMIO_COLABORADOR: c.premioA,
      MAX_COLABORADOR: c.maxA,
      PRECIO_COMPRADOR: c.precioC,
      PREMIO_COMPRADOR: c.premioC,
      MAX_COMPRADOR: c.maxC,
      HORAS_RESERVA: c.horasReserva,
      DATOS_PAGO: c.datosPago,
      WHATSAPP: c.whatsapp,
      ADMIN_PIN: c.adminPin,
      CICLO: c.ciclo
    },
    config: {
      ...c,
      A: { total: 100, precio: c.precioA, premio: c.premioA, max: c.maxA },
      C: { total: 1000, precio: c.precioC, max: c.maxC }
    },
    ganadores: ganadoresMap,
    stats: {
      A: { vendidos: vA, reservados: rA, disponibles: 100 - vA - rA },
      C: { vendidos: vC, reservados: rC, disponibles: 1000 - vC - rC }
    }
  });
});

router.post('/rifa/admin/confirmar-venta', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const { ventaId } = req.body;
  const db = dbManager.get();
  const venta = db.rifa.ventas.find(v => v.id === ventaId);
  if (!venta) return res.status(404).json({ error: 'Venta no encontrada.' });

  if (venta.estado !== 'Pendiente') {
    return res.status(400).json({ error: `La venta está en estado ${venta.estado}.` });
  }

  const targetList = venta.rol === 'A' ? db.rifa.numerosA : db.rifa.ticketsC;
  venta.tickets.forEach(n => {
    targetList[n - 1].estado = 'Vendido';
    targetList[n - 1].participante = venta.nombre;
    targetList[n - 1].ventaId = venta.id;
  });

  venta.estado = 'Pagada';
  venta.fechaConfirmacion = new Date().toISOString();

  const sorteos = dbManager.verificarSorteos();
  dbManager.save();

  res.json({ ok: true, sorteos });
});

router.post('/rifa/admin/anular-venta', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const { ventaId } = req.body;
  const db = dbManager.get();
  const venta = db.rifa.ventas.find(v => v.id === ventaId);
  if (!venta) return res.status(404).json({ error: 'Venta no encontrada.' });

  const targetList = venta.rol === 'A' ? db.rifa.numerosA : db.rifa.ticketsC;
  venta.tickets.forEach(n => {
    if (targetList[n - 1].ventaId === venta.id) {
      targetList[n - 1].estado = 'Disponible';
      targetList[n - 1].ventaId = '';
      targetList[n - 1].participante = '';
      targetList[n - 1].fecha = '';
    }
  });

  venta.estado = 'Anulada';
  dbManager.save();
  res.json({ ok: true });
});

router.post('/rifa/admin/venta-directa', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const db = dbManager.get();
  const { rol, nombre, cedula, telefono, correo, tickets, metodo, codigoLider } = req.body;

  if (rol !== 'A' && rol !== 'C') {
    return res.status(400).json({ error: 'Rol inválido.' });
  }

  const nombreStr = String(nombre || 'Venta Mostrador').trim();
  const nums = Array.isArray(tickets) ? tickets.map(Number) : [];
  if (!nums.length) return res.status(400).json({ error: 'Selecciona al menos un número.' });

  const maxTotal = rol === 'A' ? 100 : 1000;
  const targetList = rol === 'A' ? db.rifa.numerosA : db.rifa.ticketsC;

  const invalid = nums.filter(n => !(n >= 1 && n <= maxTotal));
  if (invalid.length > 0) return res.status(400).json({ error: 'Números fuera de rango.' });

  const ocupados = nums.filter(n => targetList[n - 1].estado !== 'Disponible');
  if (ocupados.length > 0) return res.status(400).json({ error: `Números no disponibles: ${ocupados.join(', ')}` });

  nums.sort((a, b) => a - b);
  const now = new Date();
  const nowIso = now.toISOString();
  const ventaId = `${rol}DIR${Date.now().toString().slice(-8)}`;

  nums.forEach(n => {
    targetList[n - 1].estado = 'Vendido';
    targetList[n - 1].ventaId = ventaId;
    targetList[n - 1].participante = nombreStr;
    targetList[n - 1].fecha = nowIso;
  });

  const precioUnit = rol === 'A' ? db.rifa.config.precioA : db.rifa.config.precioC;
  const monto = nums.length * precioUnit;

  const nuevaVenta: Venta = {
    id: ventaId,
    fecha: nowIso,
    rol,
    nombre: nombreStr,
    cedula: String(cedula || 'V00000000').trim(),
    telefono: String(telefono || '').trim(),
    correo: String(correo || 'mostrador@megacesta.org').trim(),
    tickets: nums,
    cantidad: nums.length,
    monto,
    metodo: String(metodo || 'Efectivo').trim(),
    referencia: 'Venta Directa',
    estado: 'Pagada',
    fechaConfirmacion: nowIso,
    codigoLider: normCod(codigoLider)
  };

  db.rifa.ventas.push(nuevaVenta);
  const sorteos = dbManager.verificarSorteos();
  dbManager.save();

  res.json({ ok: true, ventaId, sorteos });
});

router.post('/rifa/admin/config', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const db = dbManager.get();
  const cfg = req.body;

  if (cfg.PRECIO_COLABORADOR !== undefined) db.rifa.config.precioA = Number(cfg.PRECIO_COLABORADOR) || 3;
  if (cfg.PREMIO_COLABORADOR !== undefined) db.rifa.config.premioA = Number(cfg.PREMIO_COLABORADOR) || 300;
  if (cfg.MAX_COLABORADOR !== undefined) db.rifa.config.maxA = Number(cfg.MAX_COLABORADOR) || 10;
  if (cfg.PRECIO_COMPRADOR !== undefined) db.rifa.config.precioC = Number(cfg.PRECIO_COMPRADOR) || 1;
  if (cfg.PREMIO_COMPRADOR !== undefined) db.rifa.config.premioC = String(cfg.PREMIO_COMPRADOR);
  if (cfg.MAX_COMPRADOR !== undefined) db.rifa.config.maxC = Number(cfg.MAX_COMPRADOR) || 50;
  if (cfg.HORAS_RESERVA !== undefined) db.rifa.config.horasReserva = Number(cfg.HORAS_RESERVA) || 24;
  if (cfg.DATOS_PAGO !== undefined) db.rifa.config.datosPago = String(cfg.DATOS_PAGO);
  if (cfg.WHATSAPP !== undefined) db.rifa.config.whatsapp = String(cfg.WHATSAPP);
  if (cfg.TITULO_PRINCIPAL !== undefined) db.rifa.config.titulo = String(cfg.TITULO_PRINCIPAL);
  if (cfg.TEXTO_PRINCIPAL !== undefined) db.rifa.config.texto = String(cfg.TEXTO_PRINCIPAL);
  if (cfg.NOMBRE_RIFA !== undefined) db.rifa.config.nombre = String(cfg.NOMBRE_RIFA);
  if (cfg.MONEDA !== undefined) db.rifa.config.moneda = String(cfg.MONEDA);
  if (cfg.COMUNIDAD !== undefined) db.rifa.config.comunidad = String(cfg.COMUNIDAD);
  if (cfg.REPRESENTANTE !== undefined) db.rifa.config.representante = String(cfg.REPRESENTANTE);
  if (cfg.ADMIN_PIN !== undefined) {
    if (String(cfg.ADMIN_PIN).trim().length >= 4) {
      db.rifa.config.adminPin = String(cfg.ADMIN_PIN).trim();
      db.lideres.config.adminPin = String(cfg.ADMIN_PIN).trim();
    }
  }

  dbManager.save();
  res.json({ ok: true });
});

router.post('/rifa/admin/productos', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const db = dbManager.get();
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'La lista de productos no puede estar vacía.' });
  }

  db.rifa.productos = items.map((p: any) => {
    const cant = Number(p.cantidad) || 0;
    const prec = Number(p.precio) || 0;
    return {
      producto: String(p.producto || '').trim().toUpperCase(),
      cantidad: cant,
      precio: prec,
      total: Math.round(cant * prec * 100) / 100
    };
  });

  dbManager.save();
  res.json({ ok: true, productos: db.rifa.productos });
});

router.post('/rifa/admin/verificar-sorteo', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const sorteos = dbManager.verificarSorteos();
  res.json({ ok: true, sorteos });
});

router.post('/rifa/admin/nuevo-sorteo', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const db = dbManager.get();
  const currentCiclo = db.rifa.config.ciclo;

  // Archive current sales
  for (const v of db.rifa.ventas) {
    db.rifa.historialVentas.push({ ciclo: currentCiclo, venta: v });
  }
  db.rifa.ventas = [];

  // Archive current sorteos
  for (const s of db.rifa.sorteos) {
    db.rifa.historialSorteos.push(s);
  }
  db.rifa.sorteos = [];

  // Reset numbers
  db.rifa.numerosA = db.rifa.numerosA.map(n => ({
    numero: n.numero,
    estado: 'Disponible',
    ventaId: '',
    participante: '',
    fecha: ''
  }));

  db.rifa.ticketsC = db.rifa.ticketsC.map(t => ({
    numero: t.numero,
    estado: 'Disponible',
    ventaId: '',
    participante: '',
    fecha: ''
  }));

  db.rifa.config.ciclo = currentCiclo + 1;
  dbManager.save();

  res.json({ ok: true, ciclo: db.rifa.config.ciclo });
});

/* ========================================================
   3. REFERIDOS / PROGRAMA DE LÍDERES ROUTES
   ======================================================== */

function calcularLideresLive() {
  const db = dbManager.get();
  const cfg = db.lideres.config;

  // Sum paid sales by leader code
  const ventasMap: { [code: string]: { tickets: number; monto: number; ventas: number } } = {};
  for (const v of db.rifa.ventas) {
    if (v.estado === 'Pagada' && v.codigoLider) {
      const rol = v.rol;
      if (cfg.rifasCuentan !== 'AMBAS' && cfg.rifasCuentan !== rol) continue;
      const cod = v.codigoLider;
      if (!ventasMap[cod]) ventasMap[cod] = { tickets: 0, monto: 0, ventas: 0 };
      ventasMap[cod].tickets += v.cantidad;
      ventasMap[cod].monto += v.monto;
      ventasMap[cod].ventas += 1;
    }
  }

  const list = db.lideres.lista.map((l, index) => {
    const v = ventasMap[l.codigo] || { tickets: 0, monto: 0, ventas: 0 };
    delete ventasMap[l.codigo];
    const tickets = v.tickets;
    const monto = Math.round(v.monto * 100) / 100;
    const calificado = l.estado === 'Activo' && tickets >= cfg.minTickets;
    const tasa = !calificado ? 0 : (tickets > cfg.tier2Sobre ? cfg.tasaNivel2 : cfg.tasaBase);
    const comision = Math.round(monto * tasa / 100 * 100) / 100;

    return {
      orden: index,
      codigo: l.codigo,
      nombre: l.nombre,
      cedula: l.cedula,
      telefono: l.telefono,
      correo: l.correo,
      fechaRegistro: l.fechaRegistro,
      estado: l.estado,
      tickets,
      monto,
      ventas: v.ventas,
      calificado,
      tasa,
      comision,
      bono: 0,
      total: comision,
      puesto: 0,
      faltan: Math.max(0, cfg.minTickets - tickets),
      paraNivel2: tickets > cfg.tier2Sobre ? 0 : cfg.tier2Sobre + 1 - tickets
    };
  });

  // Ranking among qualified
  const calificados = list
    .filter(l => l.calificado)
    .sort((a, b) => b.tickets - a.tickets || b.monto - a.monto || a.orden - b.orden);

  calificados.forEach((l, i) => {
    l.puesto = i + 1;
    if (i === 0) {
      l.bono = cfg.bonoPrimerLugar;
      l.total = Math.round((l.comision + l.bono) * 100) / 100;
    }
  });

  const huerfanos = Object.keys(ventasMap).map(k => ({
    codigo: k,
    tickets: ventasMap[k].tickets,
    monto: Math.round(ventasMap[k].monto * 100) / 100
  }));

  return { lideres: list, top: calificados, huerfanos };
}

router.get('/lideres/public', (req: Request, res: Response) => {
  const db = dbManager.get();
  const cfg = db.lideres.config;
  const ciclo = db.rifa.config.ciclo;

  const liqCiclo = db.lideres.liquidaciones.filter(l => l.ciclo === ciclo);
  const liquidado = liqCiclo.length > 0;
  const calc = calcularLideresLive();

  const topRows = liquidado
    ? liqCiclo.sort((a, b) => a.puesto - b.puesto).slice(0, 10).map(l => ({
        puesto: l.puesto,
        nombre: maskName(l.nombre),
        tickets: l.tickets,
        tasa: l.tasa,
        bono: l.bono
      }))
    : calc.top.slice(0, 10).map(l => ({
        puesto: l.puesto,
        nombre: maskName(l.nombre),
        tickets: l.tickets,
        tasa: l.tasa,
        bono: l.bono
      }));

  // Historical settlements grouped by cycle
  const histByCycle: { [ciclo: number]: { ciclo: number; fecha: string; filas: any[] } } = {};
  for (const item of db.lideres.liquidaciones) {
    if (!histByCycle[item.ciclo]) {
      histByCycle[item.ciclo] = {
        ciclo: item.ciclo,
        fecha: item.fechaLiquidacion,
        filas: []
      };
    }
    histByCycle[item.ciclo].filas.push({
      puesto: item.puesto,
      nombre: maskName(item.nombre),
      tickets: item.tickets,
      tasa: item.tasa,
      bono: item.bono
    });
  }

  const historico = Object.values(histByCycle).sort((a, b) => b.ciclo - a.ciclo);

  const sorteado = db.rifa.sorteos.some(s => s.ciclo === ciclo && s.rifa === 'C');

  res.json({
    config: {
      titulo: cfg.titulo,
      texto: cfg.texto,
      moneda: cfg.moneda,
      min: cfg.minTickets,
      tasa1: cfg.tasaBase,
      tier2: cfg.tier2Sobre,
      tasa2: cfg.tasaNivel2,
      bono: cfg.bonoPrimerLugar,
      cuentan: cfg.rifasCuentan
    },
    ciclo,
    sorteado,
    liquidado,
    top: topRows,
    totalLideres: db.lideres.lista.length,
    historico
  });
});

router.post('/lideres/registrar', (req: Request, res: Response) => {
  const { nombre, cedula, telefono, correo } = req.body;
  const db = dbManager.get();

  const nombreStr = String(nombre || '').trim();
  const cedulaStr = String(cedula || '').trim();
  const telStr = String(telefono || '').trim();
  const mailStr = String(correo || '').trim();

  if (nombreStr.length < 3) return res.status(400).json({ error: 'Escribe tu nombre completo.' });
  if (normCed(cedulaStr).length < 5) return res.status(400).json({ error: 'Escribe una cédula válida.' });
  if (telStr.replace(/\D/g, '').length < 7) return res.status(400).json({ error: 'Escribe un teléfono válido.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailStr)) return res.status(400).json({ error: 'Escribe un correo válido.' });

  if (db.lideres.lista.some(l => normCed(l.cedula) === normCed(cedulaStr))) {
    return res.status(400).json({ error: 'Esa cédula ya está registrada. Ingresa a "Mi panel" con tu código.' });
  }

  // Generate 5-char unique code (avoiding confusing chars like O/0, I/1)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let cod = '';
  do {
    cod = '';
    for (let i = 0; i < 5; i++) {
      cod += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (db.lideres.lista.some(l => l.codigo === cod));

  const nuevoLider: Lider = {
    codigo: cod,
    nombre: nombreStr,
    cedula: cedulaStr,
    telefono: telStr,
    correo: mailStr,
    fechaRegistro: new Date().toISOString(),
    estado: 'Activo'
  };

  db.lideres.lista.push(nuevoLider);
  dbManager.save();

  res.json({
    ok: true,
    codigo: cod,
    nombre: nombreStr,
    moneda: db.lideres.config.moneda
  });
});

router.post('/lideres/mi-panel', (req: Request, res: Response) => {
  const { cedula, codigo } = req.body;
  const db = dbManager.get();
  const cod = normCod(codigo);
  const ced = normCed(cedula);

  const me = db.lideres.lista.find(l => l.codigo === cod && normCed(l.cedula) === ced);
  if (!me) {
    return res.status(404).json({ error: 'Cédula o código incorrectos.' });
  }

  const ciclo = db.rifa.config.ciclo;
  const snap = db.lideres.liquidaciones.find(x => x.codigo === cod && x.ciclo === ciclo);
  const calc = calcularLideresLive();
  const live = calc.lideres.find(l => l.codigo === cod);

  const propiasLiq = db.lideres.liquidaciones
    .filter(x => x.codigo === cod)
    .sort((a, b) => b.ciclo - a.ciclo);

  const out = snap ? {
    tickets: snap.tickets,
    monto: snap.monto,
    tasa: snap.tasa,
    comision: snap.comision,
    puesto: snap.puesto,
    bono: snap.bono,
    total: snap.total,
    calificado: true,
    faltan: 0,
    paraNivel2: snap.tickets > db.lideres.config.tier2Sobre ? 0 : db.lideres.config.tier2Sobre + 1 - snap.tickets
  } : {
    tickets: live?.tickets || 0,
    monto: live?.monto || 0,
    tasa: live?.tasa || 0,
    comision: live?.comision || 0,
    puesto: live?.puesto || 0,
    bono: live?.bono || 0,
    total: live?.total || 0,
    calificado: live?.calificado || false,
    faltan: live?.faltan || db.lideres.config.minTickets,
    paraNivel2: live?.paraNivel2 || db.lideres.config.tier2Sobre + 1
  };

  res.json({
    ...out,
    nombre: me.nombre,
    codigo: me.codigo,
    liquidado: !!snap,
    ciclo,
    moneda: db.lideres.config.moneda,
    min: db.lideres.config.minTickets,
    tasa1: db.lideres.config.tasaBase,
    tasa2: db.lideres.config.tasaNivel2,
    tier2: db.lideres.config.tier2Sobre,
    historial: propiasLiq.map(x => ({
      ciclo: x.ciclo,
      puesto: x.puesto,
      tickets: x.tickets,
      tasa: x.tasa,
      comision: x.comision,
      bono: x.bono,
      total: x.total,
      pagado: x.pagado
    }))
  });
});

/* LÍDERES ADMIN */
router.post('/lideres/admin/login', (req: Request, res: Response) => {
  const { pin } = req.body;
  const db = dbManager.get();
  if (String(pin).trim() !== String(db.lideres.config.adminPin).trim()) {
    return res.status(401).json({ error: 'PIN incorrecto.' });
  }
  const token = createSession('lideres_admin');
  res.json({ ok: true, token });
});

router.get('/lideres/admin/data', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const db = dbManager.get();
  const ciclo = db.rifa.config.ciclo;
  const calc = calcularLideresLive();
  const liqCiclo = db.lideres.liquidaciones.filter(l => l.ciclo === ciclo);

  // Group historical by cycle
  const histByCycle: { [ciclo: number]: { ciclo: number; fecha: string; filas: any[] } } = {};
  for (const item of db.lideres.liquidaciones) {
    if (!histByCycle[item.ciclo]) {
      histByCycle[item.ciclo] = {
        ciclo: item.ciclo,
        fecha: item.fechaLiquidacion,
        filas: []
      };
    }
    histByCycle[item.ciclo].filas.push(item);
  }

  res.json({
    config: db.lideres.config,
    raw: {
      TITULO_PROGRAMA: db.lideres.config.titulo,
      TEXTO_PROGRAMA: db.lideres.config.texto,
      MONEDA: db.lideres.config.moneda,
      URL_RIFA: db.lideres.config.urlRifa,
      MIN_TICKETS: db.lideres.config.minTickets,
      TASA_BASE: db.lideres.config.tasaBase,
      TIER2_SOBRE: db.lideres.config.tier2Sobre,
      TASA_NIVEL2: db.lideres.config.tasaNivel2,
      BONO_PRIMER_LUGAR: db.lideres.config.bonoPrimerLugar,
      RIFAS_CUENTAN: db.lideres.config.rifasCuentan
    },
    ciclo,
    sorteado: db.rifa.sorteos.some(s => s.ciclo === ciclo && s.rifa === 'C'),
    liquidado: liqCiclo.length > 0,
    lideres: calc.lideres,
    preview: calc.top,
    huerfanos: calc.huerfanos,
    liquidaciones: db.lideres.liquidaciones,
    historico: Object.values(histByCycle).sort((a, b) => b.ciclo - a.ciclo)
  });
});

router.post('/lideres/admin/config', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const db = dbManager.get();
  const c = req.body;

  if (c.TITULO_PROGRAMA !== undefined) db.lideres.config.titulo = String(c.TITULO_PROGRAMA);
  if (c.TEXTO_PROGRAMA !== undefined) db.lideres.config.texto = String(c.TEXTO_PROGRAMA);
  if (c.MONEDA !== undefined) db.lideres.config.moneda = String(c.MONEDA);
  if (c.URL_RIFA !== undefined) db.lideres.config.urlRifa = String(c.URL_RIFA);
  if (c.MIN_TICKETS !== undefined) db.lideres.config.minTickets = Number(c.MIN_TICKETS) || 10;
  if (c.TASA_BASE !== undefined) db.lideres.config.tasaBase = Number(c.TASA_BASE) || 10;
  if (c.TIER2_SOBRE !== undefined) db.lideres.config.tier2Sobre = Number(c.TIER2_SOBRE) || 20;
  if (c.TASA_NIVEL2 !== undefined) db.lideres.config.tasaNivel2 = Number(c.TASA_NIVEL2) || 15;
  if (c.BONO_PRIMER_LUGAR !== undefined) db.lideres.config.bonoPrimerLugar = Number(c.BONO_PRIMER_LUGAR) || 300;
  if (c.RIFAS_CUENTAN !== undefined) db.lideres.config.rifasCuentan = c.RIFAS_CUENTAN;

  dbManager.save();
  res.json({ ok: true });
});

router.post('/lideres/admin/liquidar', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const db = dbManager.get();
  const ciclo = db.rifa.config.ciclo;

  if (db.lideres.liquidaciones.some(l => l.ciclo === ciclo)) {
    return res.status(400).json({ error: `El ciclo ${ciclo} ya fue liquidado.` });
  }

  const calc = calcularLideresLive();
  if (calc.top.length === 0) {
    return res.status(400).json({ error: `Ningún líder alcanza el mínimo de ${db.lideres.config.minTickets} tickets.` });
  }

  const nowIso = new Date().toISOString();
  calc.top.forEach(l => {
    const item: LiquidacionItem = {
      id: `LIQ_${ciclo}_${l.codigo}`,
      ciclo,
      fechaLiquidacion: nowIso,
      puesto: l.puesto,
      codigo: l.codigo,
      nombre: l.nombre,
      cedula: l.cedula,
      telefono: l.telefono,
      correo: l.correo,
      tickets: l.tickets,
      monto: l.monto,
      tasa: l.tasa,
      comision: l.comision,
      bono: l.bono,
      total: l.total,
      pagado: false
    };
    db.lideres.liquidaciones.push(item);
  });

  dbManager.save();
  res.json({ ok: true, ciclo, calificados: calc.top.length });
});

router.post('/lideres/admin/marcar-pago', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const { id, pagado } = req.body;
  const db = dbManager.get();
  const liq = db.lideres.liquidaciones.find(l => l.id === id);
  if (!liq) return res.status(404).json({ error: 'Registro de liquidación no encontrado.' });

  liq.pagado = !!pagado;
  dbManager.save();
  res.json({ ok: true });
});

router.post('/lideres/admin/estado-lider', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  const { codigo, estado } = req.body;
  const db = dbManager.get();
  const lider = db.lideres.lista.find(l => l.codigo === codigo);
  if (!lider) return res.status(404).json({ error: 'Líder no encontrado.' });

  lider.estado = estado === 'Inactivo' ? 'Inactivo' : 'Activo';
  dbManager.save();
  res.json({ ok: true });
});

// Database Export / Backup endpoint
router.get('/admin/export-db', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifySession(token)) return res.status(401).json({ error: 'Sesión vencida.' });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="megacesta_db_${Date.now()}.json"`);
  res.send(JSON.stringify(dbManager.get(), null, 2));
});

export default router;
