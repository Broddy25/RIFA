import { PortalData, RifaState, LiderPublicState, MiPanelData } from './types.js';

const headers = (token?: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error en la petición' }));
    throw new Error(errorData.error || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Portal
  getPortal: (): Promise<PortalData> =>
    fetch('/api/portal').then(handleResponse),

  loginPortalAdmin: (password: string) =>
    fetch('/api/portal/admin/login', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ password })
    }).then(handleResponse),

  getPortalAdminData: (token: string) =>
    fetch('/api/portal/admin/data', {
      headers: headers(token)
    }).then(handleResponse),

  savePortalComunidad: (token: string, data: any) =>
    fetch('/api/portal/admin/comunidad', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(data)
    }).then(handleResponse),

  savePortalProyecto: (token: string, data: any) =>
    fetch('/api/portal/admin/proyecto', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(data)
    }).then(handleResponse),

  // Rifa
  getRifaState: (): Promise<RifaState> =>
    fetch('/api/rifa/state').then(handleResponse),

  reservarTickets: (data: {
    rol: 'A' | 'C';
    tickets: number[];
    nombre: string;
    cedula: string;
    telefono: string;
    correo: string;
    metodo: string;
    referencia: string;
    codigoLider: string;
  }) =>
    fetch('/api/rifa/reservar', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  loginRifaAdmin: (pin: string) =>
    fetch('/api/rifa/admin/login', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ pin })
    }).then(handleResponse),

  getRifaAdminData: (token: string) =>
    fetch('/api/rifa/admin/data', {
      headers: headers(token)
    }).then(handleResponse),

  confirmarVenta: (token: string, ventaId: string) =>
    fetch('/api/rifa/admin/confirmar-venta', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ ventaId })
    }).then(handleResponse),

  anularVenta: (token: string, ventaId: string) =>
    fetch('/api/rifa/admin/anular-venta', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ ventaId })
    }).then(handleResponse),

  ventaDirecta: (token: string, data: any) =>
    fetch('/api/rifa/admin/venta-directa', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(data)
    }).then(handleResponse),

  saveRifaConfig: (token: string, config: any) =>
    fetch('/api/rifa/admin/config', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(config)
    }).then(handleResponse),

  saveProductos: (token: string, items: any[]) =>
    fetch('/api/rifa/admin/productos', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ items })
    }).then(handleResponse),

  nuevoSorteo: (token: string) =>
    fetch('/api/rifa/admin/nuevo-sorteo', {
      method: 'POST',
      headers: headers(token)
    }).then(handleResponse),

  verificarSorteo: (token: string) =>
    fetch('/api/rifa/admin/verificar-sorteo', {
      method: 'POST',
      headers: headers(token)
    }).then(handleResponse),

  // Líderes
  getLideresPublic: (): Promise<LiderPublicState> =>
    fetch('/api/lideres/public').then(handleResponse),

  registrarLider: (data: { nombre: string; cedula: string; telefono: string; correo: string }) =>
    fetch('/api/lideres/registrar', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  getMiPanel: (cedula: string, codigo: string): Promise<MiPanelData> =>
    fetch('/api/lideres/mi-panel', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ cedula, codigo })
    }).then(handleResponse),

  loginLideresAdmin: (pin: string) =>
    fetch('/api/lideres/admin/login', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ pin })
    }).then(handleResponse),

  getLideresAdminData: (token: string) =>
    fetch('/api/lideres/admin/data', {
      headers: headers(token)
    }).then(handleResponse),

  saveLideresConfig: (token: string, config: any) =>
    fetch('/api/lideres/admin/config', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(config)
    }).then(handleResponse),

  liquidarCiclo: (token: string) =>
    fetch('/api/lideres/admin/liquidar', {
      method: 'POST',
      headers: headers(token)
    }).then(handleResponse),

  marcarPagoLiquidacion: (token: string, id: string, pagado: boolean) =>
    fetch('/api/lideres/admin/marcar-pago', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ id, pagado })
    }).then(handleResponse),

  toggleEstadoLider: (token: string, codigo: string, estado: 'Activo' | 'Inactivo') =>
    fetch('/api/lideres/admin/estado-lider', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ codigo, estado })
    }).then(handleResponse)
};
