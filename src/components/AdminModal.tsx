import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { LOGO_LOCHITA, LOGO_MEGACESTA } from '../assets/logos.js';
import { Lock, Settings, ShieldCheck, Database, Check, X, Plus, Trash2, Download, AlertTriangle, Upload, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshAll: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onRefreshAll }) => {
  const [pin, setPin] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const [adminTab, setAdminTab] = useState<'portal' | 'rifaA' | 'rifaC' | 'productos' | 'rifaConfig' | 'lideres' | 'database'>('portal');

  // Admin Data states
  const [portalData, setPortalData] = useState<any | null>(null);
  const [rifaData, setRifaData] = useState<any | null>(null);
  const [lideresData, setLideresData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Form states for Portal
  const [pComunidad, setPComunidad] = useState('');
  const [pRepresentante, setPRepresentante] = useState('');
  const [pTelefono, setPTelefono] = useState('');
  const [pCorreo, setPCorreo] = useState('');
  const [pTitulo, setPTitulo] = useState('');
  const [pSubtitulo, setPSubtitulo] = useState('');
  const [pLogo, setPLogo] = useState('');
  const [pLogoLochita, setPLogoLochita] = useState('');
  const [pLogoMegacesta, setPLogoMegacesta] = useState('');
  const [pProjTitulo, setPProjTitulo] = useState('');
  const [pProjDesc, setPProjDesc] = useState('');
  const [pProjDocx, setPProjDocx] = useState('');
  const [pProjFoto, setPProjFoto] = useState('');

  // Direct sale form in Rifa
  const [directName, setDirectName] = useState('');
  const [directCedula, setDirectCedula] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [directMail, setDirectMail] = useState('');
  const [directNums, setDirectNums] = useState('');
  const [directMethod, setDirectMethod] = useState('Efectivo');
  const [directLider, setDirectLider] = useState('');

  // Editable Products
  const [editProductos, setEditProductos] = useState<any[]>([]);

  // Search filter for sales
  const [searchSale, setSearchSale] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      // Pin check: try both portal password and rifa pin
      const pRes = await api.loginPortalAdmin(pin).catch(() => null);
      const rRes = await api.loginRifaAdmin(pin).catch(() => null);

      if (pRes?.token || rRes?.token) {
        const validToken = pRes?.token || rRes?.token;
        setToken(validToken);
        loadAllAdminData(validToken);
      } else {
        setAuthError('Contraseña o PIN incorrecto (Prueba 52496221402 o 1402)');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error de autenticación');
    }
  };

  const loadAllAdminData = async (tok: string) => {
    setLoading(true);
    try {
      const [port, rif, lid] = await Promise.all([
        api.getPortalAdminData(tok).catch(() => null),
        api.getRifaAdminData(tok).catch(() => null),
        api.getLideresAdminData(tok).catch(() => null)
      ]);

      if (port) {
        setPortalData(port);
        setPComunidad(port.datos.comunidad || '');
        setPRepresentante(port.datos.representante || '');
        setPTelefono(port.datos.telefono || '');
        setPCorreo(port.datos.correo || '');
        setPTitulo(port.datos.titulo || '');
        setPSubtitulo(port.datos.subtitulo || '');
        setPLogo(port.datos.logo || '');
        setPLogoLochita(port.datos.logoLochita || '');
        setPLogoMegacesta(port.datos.logoMegacesta || '');
        setPProjTitulo(port.proyecto.titulo || '');
        setPProjDesc(port.proyecto.descripcion || '');
        setPProjDocx(port.proyecto.docx || '');
        setPProjFoto(port.proyecto.foto || '');
      }

      if (rif) {
        setRifaData(rif);
        setEditProductos([...rif.productos]);
      }

      if (lid) {
        setLideresData(lid);
      }
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file: File, setter: (b64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setter(canvas.toDataURL('image/png', 0.9));
        } else {
          setter(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSavePortal = async () => {
    if (!token) return;
    try {
      await api.savePortalComunidad(token, {
        titulo: pTitulo,
        subtitulo: pSubtitulo,
        comunidad: pComunidad,
        representante: pRepresentante,
        telefono: pTelefono,
        correo: pCorreo,
        logo: pLogo,
        logoLochita: pLogoLochita,
        logoMegacesta: pLogoMegacesta
      });
      await api.savePortalProyecto(token, {
        titulo: pProjTitulo,
        descripcion: pProjDesc,
        docx: pProjDocx,
        foto: pProjFoto
      });
      setSaveMessage('¡Datos de portal, logos y proyecto guardados con éxito!');
      setTimeout(() => setSaveMessage(''), 3000);
      onRefreshAll();
      loadAllAdminData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirmVenta = async (id: string) => {
    if (!token) return;
    try {
      const res = await api.confirmarVenta(token, id);
      if (res.sorteos && (res.sorteos.A || res.sorteos.C)) {
        alert('¡ATENCIÓN! Se ha completado la meta y se ha ejecutado un sorteo automático.');
      }
      loadAllAdminData(token);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAnularVenta = async (id: string) => {
    if (!token) return;
    if (!confirm('¿Seguro que deseas anular esta venta y liberar sus números?')) return;
    try {
      await api.anularVenta(token, id);
      loadAllAdminData(token);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDirectSale = async (targetRol: 'A' | 'C') => {
    if (!token) return;
    try {
      const ticketsArray = directNums
        .split(/[,\s]+/)
        .map(n => parseInt(n))
        .filter(n => !isNaN(n));

      if (ticketsArray.length === 0) {
        alert('Ingresa los números separados por coma');
        return;
      }

      const res = await api.ventaDirecta(token, {
        rol: targetRol,
        nombre: directName,
        cedula: directCedula,
        telefono: directPhone,
        correo: directMail,
        tickets: ticketsArray,
        metodo: directMethod,
        codigoLider: directLider
      });

      if (res.sorteos && (res.sorteos.A || res.sorteos.C)) {
        alert('¡Sorteo automático disparado al completar las ventas!');
      }

      setDirectName('');
      setDirectCedula('');
      setDirectNums('');
      loadAllAdminData(token);
      onRefreshAll();
      alert('Venta directa registrada con éxito.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveProductos = async () => {
    if (!token) return;
    try {
      await api.saveProductos(token, editProductos);
      setSaveMessage('¡Lista de productos actualizada!');
      setTimeout(() => setSaveMessage(''), 3000);
      loadAllAdminData(token);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveRifaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !rifaData) return;
    try {
      await api.saveRifaConfig(token, rifaData.raw);
      setSaveMessage('¡Configuración de rifa guardada!');
      setTimeout(() => setSaveMessage(''), 3000);
      loadAllAdminData(token);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleNuevoSorteo = async () => {
    if (!token) return;
    if (!confirm('¿Deseas archivar el ciclo actual e iniciar uno NUEVO? Todos los números se liberarán y comenzará el siguiente sorteo.')) return;
    try {
      const res = await api.nuevoSorteo(token);
      alert(`¡Nuevo sorteo iniciado! Ciclo actual: ${res.ciclo}`);
      loadAllAdminData(token);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleVerificarSorteo = async () => {
    if (!token) return;
    try {
      const res = await api.verificarSorteo(token);
      if (res.sorteos && (res.sorteos.A || res.sorteos.C)) {
        alert('¡Se ha ejecutado el sorteo! Revisa la lista de ganadores.');
      } else {
        alert('Aún no se cumplen las condiciones para el sorteo (se requieren 1000 tickets de compradores vendidos).');
      }
      loadAllAdminData(token);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLiquidarLideres = async () => {
    if (!token) return;
    if (!confirm('¿Deseas liquidar las comisiones del ciclo actual? Los montos quedarán congelados en el historial.')) return;
    try {
      await api.liquidarCiclo(token);
      alert('¡Ciclo liquidado con éxito!');
      loadAllAdminData(token);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleEstadoLider = async (codigo: string, actual: string) => {
    if (!token) return;
    try {
      const nuevo = actual === 'Activo' ? 'Inactivo' : 'Activo';
      await api.toggleEstadoLider(token, codigo, nuevo);
      loadAllAdminData(token);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarcarPagoLider = async (id: string, actual: boolean) => {
    if (!token) return;
    try {
      await api.marcarPagoLiquidacion(token, id, !actual);
      loadAllAdminData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#0b1f3a] text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#ffd23f]" />
            <div>
              <h2 className="text-xl font-bold font-display">Administración General</h2>
              <span className="text-xs text-slate-300">MEGACESTA · Portal, Rifas y Líderes</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        {!token ? (
          /* Login Screen */
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-sm w-full text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-[#0b1f3a] mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-display text-[#0b1f3a]">Acceso Administrador</h3>
              <p className="text-xs text-slate-500">Ingresa la contraseña del Portal (11 dígitos) o el PIN de Rifa/Líderes.</p>

              {authError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {authError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN o Contraseña"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-center text-lg font-mono tracking-widest"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0b1f3a] hover:bg-[#16325c] text-white font-bold rounded-xl text-sm shadow cursor-pointer"
                >
                  Entrar al Panel
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sub-nav tabs */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex gap-1.5 overflow-x-auto flex-shrink-0">
              <button
                onClick={() => setAdminTab('portal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  adminTab === 'portal' ? 'bg-[#0b1f3a] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Portal y Proyecto
              </button>
              <button
                onClick={() => setAdminTab('rifaA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  adminTab === 'rifaA' ? 'bg-[#0b1f3a] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Rifa Colaboradores (100)
              </button>
              <button
                onClick={() => setAdminTab('rifaC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  adminTab === 'rifaC' ? 'bg-[#0b1f3a] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Rifa Compradores (1000)
              </button>
              <button
                onClick={() => setAdminTab('productos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  adminTab === 'productos' ? 'bg-[#0b1f3a] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Inventario Productos
              </button>
              <button
                onClick={() => setAdminTab('rifaConfig')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  adminTab === 'rifaConfig' ? 'bg-[#0b1f3a] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Configuración y Sorteo
              </button>
              <button
                onClick={() => setAdminTab('lideres')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  adminTab === 'lideres' ? 'bg-[#0b1f3a] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Líderes y Liquidación
              </button>
              <button
                onClick={() => setAdminTab('database')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  adminTab === 'database' ? 'bg-[#0b1f3a] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Base de Datos
              </button>
            </div>

            {/* Notification message */}
            {saveMessage && (
              <div className="bg-emerald-50 text-emerald-800 text-xs px-4 py-2 border-b border-emerald-200 font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> {saveMessage}
              </div>
            )}

            {/* Panel Tab View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: PORTAL Y PROYECTO */}
              {adminTab === 'portal' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-base text-[#0b1f3a]">Textos y Comunidad</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Comunidad</label>
                        <input
                          type="text"
                          value={pComunidad}
                          onChange={(e) => setPComunidad(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Representante</label>
                        <input
                          type="text"
                          value={pRepresentante}
                          onChange={(e) => setPRepresentante(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                        <input
                          type="text"
                          value={pTelefono}
                          onChange={(e) => setPTelefono(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Correo</label>
                        <input
                          type="email"
                          value={pCorreo}
                          onChange={(e) => setPCorreo(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Título Encabezado</label>
                        <input
                          type="text"
                          value={pTitulo}
                          onChange={(e) => setPTitulo(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subtítulo Encabezado</label>
                        <input
                          type="text"
                          value={pSubtitulo}
                          onChange={(e) => setPSubtitulo(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logos Configuration Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-base text-[#0b1f3a] flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-amber-500" />
                          Logos de la Cabecera (Lochitaclub, Megacesta y Comunidad)
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Puedes subir imágenes desde tu equipo o pegar una URL/Base64 para cualquiera de los tres logos.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Logo 1: Lochitaclub */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center text-center space-y-3">
                        <span className="text-xs font-bold text-slate-700">Logo Lochitaclub</span>
                        <div className="w-20 h-20 rounded-full bg-white border-4 border-[#ffd23f] flex items-center justify-center overflow-hidden shadow-sm">
                          <img
                            src={pLogoLochita || LOGO_LOCHITA}
                            alt="Logo Lochitaclub"
                            className="w-[86%] h-[86%] object-contain"
                          />
                        </div>
                        <div className="w-full space-y-2">
                          <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0b1f3a] hover:bg-[#16325c] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Subir imagen</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/svg+xml"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleImageUpload(f, setPLogoLochita);
                              }}
                              className="hidden"
                            />
                          </label>
                          {pLogoLochita && (
                            <button
                              type="button"
                              onClick={() => setPLogoLochita('')}
                              className="w-full flex items-center justify-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restablecer original</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Logo 2: Megacesta */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center text-center space-y-3">
                        <span className="text-xs font-bold text-slate-700">Logo Megacesta</span>
                        <div className="w-20 h-20 rounded-full bg-white border-4 border-[#ffd23f] flex items-center justify-center overflow-hidden shadow-sm">
                          <img
                            src={pLogoMegacesta || LOGO_MEGACESTA}
                            alt="Logo Megacesta"
                            className="w-[88%] h-[88%] object-contain"
                          />
                        </div>
                        <div className="w-full space-y-2">
                          <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0b1f3a] hover:bg-[#16325c] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Subir imagen</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/svg+xml"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleImageUpload(f, setPLogoMegacesta);
                              }}
                              className="hidden"
                            />
                          </label>
                          {pLogoMegacesta && (
                            <button
                              type="button"
                              onClick={() => setPLogoMegacesta('')}
                              className="w-full flex items-center justify-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restablecer original</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Logo 3: Comunidad */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center text-center space-y-3">
                        <span className="text-xs font-bold text-slate-700">Logo de la Comunidad</span>
                        <div className="w-20 h-20 rounded-full bg-white border-4 border-[#ffd23f] flex items-center justify-center overflow-hidden shadow-sm">
                          {pLogo ? (
                            <img src={pLogo} alt="Logo Comunidad" className="w-[86%] h-[86%] object-contain" />
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400 p-2 text-center">Sin logo</span>
                          )}
                        </div>
                        <div className="w-full space-y-2">
                          <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0b1f3a] hover:bg-[#16325c] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Subir imagen</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/svg+xml"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleImageUpload(f, setPLogo);
                              }}
                              className="hidden"
                            />
                          </label>
                          {pLogo && (
                            <button
                              type="button"
                              onClick={() => setPLogo('')}
                              className="w-full flex items-center justify-center gap-1 px-2.5 py-1 text-red-600 hover:text-red-800 border border-red-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Quitar logo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-base text-[#0b1f3a]">Proyecto Comunitario</h4>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Título del Proyecto</label>
                      <input
                        type="text"
                        value={pProjTitulo}
                        onChange={(e) => setPProjTitulo(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Descripción Breve</label>
                      <textarea
                        rows={3}
                        value={pProjDesc}
                        onChange={(e) => setPProjDesc(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Enlace a Documento DOCX (Google Drive)</label>
                      <input
                        type="url"
                        value={pProjDocx}
                        onChange={(e) => setPProjDocx(e.target.value)}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">URL o Base64 de Foto del Proyecto</label>
                      <input
                        type="text"
                        value={pProjFoto}
                        onChange={(e) => setPProjFoto(e.target.value)}
                        placeholder="data:image/jpeg;base64,... o enlace web"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>

                    <button
                      onClick={handleSavePortal}
                      className="px-6 py-2.5 bg-[#0b1f3a] text-white font-bold rounded-xl text-sm shadow cursor-pointer hover:bg-[#16325c]"
                    >
                      Guardar Cambios de Portal
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2 & 3: RIFAS A & C */}
              {(adminTab === 'rifaA' || adminTab === 'rifaC') && (
                <div className="space-y-6">
                  {/* Quick Direct Sale Panel */}
                  <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-sm text-[#0b1f3a]">
                      Venta Directa en Taquilla ({adminTab === 'rifaA' ? 'Rifa A - Colaborador' : 'Rifa C - Comprador'})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Nombre cliente"
                        value={directName}
                        onChange={(e) => setDirectName(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Cédula"
                        value={directCedula}
                        onChange={(e) => setDirectCedula(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Números (ej: 1, 5, 20)"
                        value={directNums}
                        onChange={(e) => setDirectNums(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-mono"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDirectSale(adminTab === 'rifaA' ? 'A' : 'C')}
                        className="px-4 py-1.5 bg-[#0b1f3a] hover:bg-[#16325c] text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                      >
                        Registrar Venta Pagada
                      </button>
                    </div>
                  </div>

                  {/* Sales Table */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <h4 className="font-bold text-base text-[#0b1f3a]">
                        Ventas Registradas ({adminTab === 'rifaA' ? 'Colaboradores' : 'Compradores'})
                      </h4>
                      <input
                        type="text"
                        placeholder="Buscar por nombre, cédula o ID..."
                        value={searchSale}
                        onChange={(e) => setSearchSale(e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-full sm:w-64"
                      />
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-100">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold">
                          <tr>
                            <th className="py-2.5 px-3">ID / Fecha</th>
                            <th className="py-2.5 px-3">Cliente</th>
                            <th className="py-2.5 px-3">Cédula / Tlf</th>
                            <th className="py-2.5 px-3">Tickets</th>
                            <th className="py-2.5 px-3 text-right">Monto</th>
                            <th className="py-2.5 px-3">Líder</th>
                            <th className="py-2.5 px-3 text-center">Estado</th>
                            <th className="py-2.5 px-3 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rifaData?.ventas
                            ?.filter((v: any) => v.rol === (adminTab === 'rifaA' ? 'A' : 'C'))
                            ?.filter((v: any) =>
                              searchSale
                                ? `${v.nombre} ${v.cedula} ${v.id}`.toLowerCase().includes(searchSale.toLowerCase())
                                : true
                            )
                            ?.map((v: any) => (
                              <tr key={v.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono">
                                  <div className="font-bold">{v.id}</div>
                                  <div className="text-[10px] text-slate-400">{new Date(v.fecha).toLocaleString()}</div>
                                </td>
                                <td className="py-2 px-3 font-semibold">{v.nombre}</td>
                                <td className="py-2 px-3 text-slate-500">
                                  <div>{v.cedula}</div>
                                  <div>{v.telefono}</div>
                                </td>
                                <td className="py-2 px-3 font-mono font-bold">{v.tickets}</td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">${v.monto}</td>
                                <td className="py-2 px-3 font-mono font-bold text-blue-700">{v.lider || '—'}</td>
                                <td className="py-2 px-3 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                      v.estado === 'Pagada'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : v.estado === 'Pendiente'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {v.estado}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {v.estado === 'Pendiente' && (
                                      <button
                                        onClick={() => handleConfirmVenta(v.id)}
                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] cursor-pointer"
                                      >
                                        Confirmar
                                      </button>
                                    )}
                                    {v.estado !== 'Anulada' && (
                                      <button
                                        onClick={() => handleAnularVenta(v.id)}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[11px] cursor-pointer"
                                      >
                                        Anular
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PRODUCTOS */}
              {adminTab === 'productos' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-base text-[#0b1f3a]">
                      Catálogo de la Megacesta ({editProductos.length} productos)
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setEditProductos([
                            ...editProductos,
                            { producto: 'NUEVO PRODUCTO', cantidad: 1, precio: 1, total: 1 }
                          ])
                        }
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar
                      </button>
                      <button
                        onClick={handleSaveProductos}
                        className="px-4 py-1.5 bg-[#0b1f3a] hover:bg-[#16325c] text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Guardar Lista
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Producto</th>
                          <th className="py-2.5 px-3 text-center">Cant.</th>
                          <th className="py-2.5 px-3 text-right">Precio Ref.</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                          <th className="py-2.5 px-3 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {editProductos.map((p, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={p.producto}
                                onChange={(e) => {
                                  const updated = [...editProductos];
                                  updated[idx].producto = e.target.value.toUpperCase();
                                  setEditProductos(updated);
                                }}
                                className="w-full px-2 py-1 border border-slate-200 rounded font-bold text-xs"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={p.cantidad}
                                onChange={(e) => {
                                  const updated = [...editProductos];
                                  const val = parseInt(e.target.value) || 0;
                                  updated[idx].cantidad = val;
                                  updated[idx].total = Math.round(val * updated[idx].precio * 100) / 100;
                                  setEditProductos(updated);
                                }}
                                className="w-16 px-1.5 py-1 border border-slate-200 rounded text-center text-xs"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={p.precio}
                                onChange={(e) => {
                                  const updated = [...editProductos];
                                  const val = parseFloat(e.target.value) || 0;
                                  updated[idx].precio = val;
                                  updated[idx].total = Math.round(updated[idx].cantidad * val * 100) / 100;
                                  setEditProductos(updated);
                                }}
                                className="w-20 px-1.5 py-1 border border-slate-200 rounded text-right text-xs"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-bold font-mono">
                              ${(p.cantidad * p.precio).toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => {
                                  const updated = editProductos.filter((_, i) => i !== idx);
                                  setEditProductos(updated);
                                }}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: RIFA CONFIG & SORTEO */}
              {adminTab === 'rifaConfig' && rifaData && (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0b1f3a]">Ciclo Actual: {rifaData.config.ciclo}</h4>
                      <p className="text-xs text-slate-600">
                        Los sorteos automáticos se ejecutan cuando se venden los 1000 tickets de compradores.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleVerificarSorteo}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#0b1f3a] font-bold rounded-lg text-xs cursor-pointer border border-slate-300"
                      >
                        Verificar Sorteo
                      </button>
                      <button
                        onClick={handleNuevoSorteo}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                      >
                        Iniciar Nuevo Ciclo
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveRifaConfig} className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-base text-[#0b1f3a]">Parámetros de las Rifas</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Precio Colaborador (Rifa A)</label>
                        <input
                          type="number"
                          value={rifaData.raw.PRECIO_COLABORADOR}
                          onChange={(e) =>
                            setRifaData({
                              ...rifaData,
                              raw: { ...rifaData.raw, PRECIO_COLABORADOR: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Premio Efectivo (Rifa A)</label>
                        <input
                          type="number"
                          value={rifaData.raw.PREMIO_COLABORADOR}
                          onChange={(e) =>
                            setRifaData({
                              ...rifaData,
                              raw: { ...rifaData.raw, PREMIO_COLABORADOR: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Máx por Compra (A)</label>
                        <input
                          type="number"
                          value={rifaData.raw.MAX_COLABORADOR}
                          onChange={(e) =>
                            setRifaData({
                              ...rifaData,
                              raw: { ...rifaData.raw, MAX_COLABORADOR: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Precio Comprador (Rifa C)</label>
                        <input
                          type="number"
                          value={rifaData.raw.PRECIO_COMPRADOR}
                          onChange={(e) =>
                            setRifaData({
                              ...rifaData,
                              raw: { ...rifaData.raw, PRECIO_COMPRADOR: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Premio Texto (Rifa C)</label>
                        <input
                          type="text"
                          value={rifaData.raw.PREMIO_COMPRADOR}
                          onChange={(e) =>
                            setRifaData({
                              ...rifaData,
                              raw: { ...rifaData.raw, PREMIO_COMPRADOR: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Máx por Compra (C)</label>
                        <input
                          type="number"
                          value={rifaData.raw.MAX_COMPRADOR}
                          onChange={(e) =>
                            setRifaData({
                              ...rifaData,
                              raw: { ...rifaData.raw, MAX_COMPRADOR: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Horas Reserva Sin Pago</label>
                        <input
                          type="number"
                          value={rifaData.raw.HORAS_RESERVA}
                          onChange={(e) =>
                            setRifaData({
                              ...rifaData,
                              raw: { ...rifaData.raw, HORAS_RESERVA: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp de Contacto</label>
                        <input
                          type="text"
                          value={rifaData.raw.WHATSAPP}
                          onChange={(e) =>
                            setRifaData({
                              ...rifaData,
                              raw: { ...rifaData.raw, WHATSAPP: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Datos de Pago (Texto mostrado al cliente)</label>
                      <textarea
                        rows={3}
                        value={rifaData.raw.DATOS_PAGO}
                        onChange={(e) =>
                          setRifaData({
                            ...rifaData,
                            raw: { ...rifaData.raw, DATOS_PAGO: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0b1f3a] hover:bg-[#16325c] text-white font-bold rounded-xl text-sm shadow cursor-pointer"
                    >
                      Guardar Configuración
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 6: LÍDERES Y LIQUIDACIÓN */}
              {adminTab === 'lideres' && lideresData && (
                <div className="space-y-6">
                  {/* Settlement actions */}
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0b1f3a]">
                        Liquidación de Comisiones · Ciclo {lideresData.ciclo}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {lideresData.liquidado
                          ? 'Este ciclo ya fue liquidado. Los montos están congelados en el histórico.'
                          : 'Al liquidar se congelan las comisiones ganadas por los líderes en este ciclo.'}
                      </p>
                    </div>
                    {!lideresData.liquidado && (
                      <button
                        onClick={handleLiquidarLideres}
                        className="px-4 py-2 bg-[#ffd23f] hover:bg-amber-400 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-xs"
                      >
                        Liquidar Ciclo {lideresData.ciclo}
                      </button>
                    )}
                  </div>

                  {/* Leaders Table */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                    <h4 className="font-bold text-base text-[#0b1f3a]">
                      Líderes Registrados ({lideresData.lideres?.length || 0})
                    </h4>

                    <div className="overflow-x-auto rounded-lg border border-slate-100">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold">
                          <tr>
                            <th className="py-2.5 px-3">Código</th>
                            <th className="py-2.5 px-3">Líder</th>
                            <th className="py-2.5 px-3">Cédula / Teléfono</th>
                            <th className="py-2.5 px-3 text-right">Tickets</th>
                            <th className="py-2.5 px-3 text-right">Ventas</th>
                            <th className="py-2.5 px-3 text-right">Tasa</th>
                            <th className="py-2.5 px-3 text-right">Comisión</th>
                            <th className="py-2.5 px-3 text-right">Bono</th>
                            <th className="py-2.5 px-3 text-right">Total</th>
                            <th className="py-2.5 px-3 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {lideresData.lideres?.map((l: any) => (
                            <tr key={l.codigo} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono font-bold text-blue-700">{l.codigo}</td>
                              <td className="py-2 px-3 font-semibold">{l.nombre}</td>
                              <td className="py-2 px-3 text-slate-500">
                                <div>{l.cedula}</div>
                                <div>{l.telefono}</div>
                              </td>
                              <td className="py-2 px-3 text-right font-bold">{l.tickets}</td>
                              <td className="py-2 px-3 text-right">${l.monto.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-bold text-blue-600">{l.tasa}%</td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-600">${l.comision.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-bold text-amber-600">{l.bono ? `$${l.bono}` : '—'}</td>
                              <td className="py-2 px-3 text-right font-bold">${l.total.toFixed(2)}</td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  onClick={() => handleToggleEstadoLider(l.codigo, l.estado)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                    l.estado === 'Activo'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {l.estado}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Frozen Settlements Table if any */}
                  {lideresData.liquidaciones?.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                      <h4 className="font-bold text-base text-[#0b1f3a]">Histórico de Liquidaciones & Pagos</h4>
                      <div className="overflow-x-auto rounded-lg border border-slate-100">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold">
                            <tr>
                              <th className="py-2.5 px-3">Ciclo</th>
                              <th className="py-2.5 px-3">Puesto</th>
                              <th className="py-2.5 px-3">Líder</th>
                              <th className="py-2.5 px-3">Cédula / Teléfono</th>
                              <th className="py-2.5 px-3 text-right">Tickets</th>
                              <th className="py-2.5 px-3 text-right">Comisión</th>
                              <th className="py-2.5 px-3 text-right">Bono</th>
                              <th className="py-2.5 px-3 text-right">Total</th>
                              <th className="py-2.5 px-3 text-center">Estado Pago</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {lideresData.liquidaciones.map((item: any) => (
                              <tr key={item.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-bold">Ciclo {item.ciclo}</td>
                                <td className="py-2 px-3 font-bold">#{item.puesto}</td>
                                <td className="py-2 px-3 font-semibold">{item.nombre}</td>
                                <td className="py-2 px-3 text-slate-500">{item.cedula} · {item.telefono}</td>
                                <td className="py-2 px-3 text-right font-bold">{item.tickets}</td>
                                <td className="py-2 px-3 text-right">${item.comision.toFixed(2)}</td>
                                <td className="py-2 px-3 text-right">{item.bono ? `$${item.bono}` : '—'}</td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">${item.total.toFixed(2)}</td>
                                <td className="py-2 px-3 text-center">
                                  <button
                                    onClick={() => handleMarcarPagoLider(item.id, item.pagado)}
                                    className={`px-2.5 py-1 rounded font-bold text-[11px] cursor-pointer ${
                                      item.pagado
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                    }`}
                                  >
                                    {item.pagado ? 'Pagado' : 'Marcar Pagado'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: DATABASE */}
              {adminTab === 'database' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#0b1f3a]" />
                    <h4 className="font-bold text-base text-[#0b1f3a]">Base de Datos Integrada</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Toda la información del Portal, de las dos rifas (100 números de Colaboradores y 1000 tickets de Compradores), inventario de la Megacesta, registros de Líderes y liquidaciones históricas está almacenada en el servidor en formato persistente.
                  </p>

                  <div className="pt-2">
                    <a
                      href={`/api/admin/export-db?auth=${token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#0b1f3a] hover:bg-[#16325c] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Descargar Copia de Seguridad JSON
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
