import React, { useState } from 'react';
import { LiderPublicState, MiPanelData } from '../types.js';
import { api } from '../api.js';
import { Users, Trophy, Award, Copy, Check, Share2, Sparkles, AlertCircle } from 'lucide-react';

interface LideresTabProps {
  state: LiderPublicState;
  onRefresh: () => void;
  referralCode?: string;
}

export const LideresTab: React.FC<LideresTabProps> = ({ state, onRefresh }) => {
  const [subTab, setSubTab] = useState<'registro' | 'panel' | 'ranking' | 'historial'>('registro');

  // Registration state
  const [regNombre, setRegNombre] = useState('');
  const [regCedula, setRegCedula] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regResult, setRegResult] = useState<any | null>(null);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState('');

  // Mi panel login & data
  const [panelCedula, setPanelCedula] = useState('');
  const [panelCodigo, setPanelCodigo] = useState('');
  const [panelData, setPanelData] = useState<MiPanelData | null>(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState('');

  const [copied, setCopied] = useState(false);

  const c = state.config;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSubmitting(true);
    setRegError('');
    try {
      const res = await api.registrarLider({
        nombre: regNombre,
        cedula: regCedula,
        telefono: regTelefono,
        correo: regCorreo
      });
      setRegResult(res);
      onRefresh();
    } catch (err: any) {
      setRegError(err.message || 'Error al registrar líder');
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleFetchPanel = async (e: React.FormEvent) => {
    e.preventDefault();
    setPanelLoading(true);
    setPanelError('');
    try {
      const res = await api.getMiPanel(panelCedula, panelCodigo);
      setPanelData(res);
    } catch (err: any) {
      setPanelError(err.message || 'Cédula o código inválidos');
    } finally {
      setPanelLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let appUrl = '';
  try {
    appUrl = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
  } catch (e) {
    appUrl = '';
  }

  return (
    <div className="space-y-6">
      {/* Commission Rules Banner */}
      <div className="bg-[#0b1f3a] text-white rounded-2xl p-6 shadow-md">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display">{c.titulo}</h2>
        <p className="text-slate-300 text-sm mt-1">{c.texto}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-2xl font-black font-display text-[#ffd23f] block">{c.min}+</span>
            <span className="text-xs text-slate-300">tickets mínimos para calificar</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-2xl font-black font-display text-[#ffd23f] block">{c.tasa1}%</span>
            <span className="text-xs text-slate-300">comisión nivel inicial</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-2xl font-black font-display text-[#ffd23f] block">{c.tasa2}%</span>
            <span className="text-xs text-slate-300">comisión más de {c.tier2} tickets</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-2xl font-black font-display text-[#ffd23f] block">{c.moneda}{c.bono}</span>
            <span className="text-xs text-slate-300">bono especial al 1er lugar</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setSubTab('registro')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'registro' ? 'bg-[#0b1f3a] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Registrarse como Líder
        </button>
        <button
          onClick={() => setSubTab('panel')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'panel' ? 'bg-[#0b1f3a] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Mi Panel de Líder
        </button>
        <button
          onClick={() => setSubTab('ranking')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'ranking' ? 'bg-[#0b1f3a] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ranking Top 10
        </button>
        <button
          onClick={() => setSubTab('historial')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'historial' ? 'bg-[#0b1f3a] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Histórico
        </button>
      </div>

      {/* 1. REGISTRO TAB */}
      {subTab === 'registro' && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
          {!regResult ? (
            <>
              <h3 className="text-2xl font-bold font-display text-[#0b1f3a]">Registro de Nuevo Líder</h3>
              <p className="text-sm text-slate-500 mt-1">
                Tus datos quedarán guardados permanentemente. Recibirás tu código único y enlace para compartir con tus compradores.
              </p>

              {regError && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    required
                    type="text"
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    placeholder="Ej: María Rodríguez"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cédula de Identidad *</label>
                    <input
                      required
                      type="text"
                      value={regCedula}
                      onChange={(e) => setRegCedula(e.target.value)}
                      placeholder="V-19876543"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono *</label>
                    <input
                      required
                      type="tel"
                      value={regTelefono}
                      onChange={(e) => setRegTelefono(e.target.value)}
                      placeholder="04121234567"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                  <input
                    required
                    type="email"
                    value={regCorreo}
                    onChange={(e) => setRegCorreo(e.target.value)}
                    placeholder="lider@correo.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="w-full py-3 bg-[#ffd23f] hover:bg-amber-400 text-black font-display font-extrabold rounded-xl shadow transition-colors cursor-pointer text-base disabled:opacity-50 mt-2"
                >
                  {regSubmitting ? 'Generando código...' : 'Obtener mi Código de Líder'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-[#0b1f3a] flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold font-display text-[#0b1f3a]">
                ¡Bienvenido, {regResult.nombre}!
              </h3>
              <p className="text-sm text-slate-600">
                Tu registro ha sido completado. Este es tu código exclusivo de líder:
              </p>

              <div className="p-4 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 inline-block my-2">
                <span className="font-display font-black text-4xl sm:text-5xl tracking-widest text-[#0b1f3a]">
                  {regResult.codigo}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs font-mono text-slate-700 break-all">
                {`${appUrl}/?ref=${regResult.codigo}`}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  onClick={() => copyToClipboard(`${appUrl}/?ref=${regResult.codigo}`)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0b1f3a] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `¡Hola! Participa en la MEGACESTA. Usa mi código de líder *${regResult.codigo}* o ingresa directamente con este enlace: ${appUrl}/?ref=${regResult.codigo}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#1f9d6b] hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow"
                >
                  <Share2 className="w-4 h-4" /> Compartir por WhatsApp
                </a>
              </div>

              <button
                onClick={() => {
                  setRegResult(null);
                  setPanelCedula(regCedula);
                  setPanelCodigo(regResult.codigo);
                  setSubTab('panel');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline mt-4 cursor-pointer"
              >
                Ir a consultar mi panel ahora
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. MI PANEL TAB */}
      {subTab === 'panel' && (
        <div className="space-y-6">
          {/* Login form for panel */}
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-xl font-bold font-display text-[#0b1f3a]">Acceso a Mi Panel de Líder</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ingresa tu cédula y tu código de líder para ver tus ventas.</p>

            {panelError && (
              <div className="mt-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{panelError}</span>
              </div>
            )}

            <form onSubmit={handleFetchPanel} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cédula</label>
                <input
                  required
                  type="text"
                  value={panelCedula}
                  onChange={(e) => setPanelCedula(e.target.value)}
                  placeholder="V-19876543"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Código de Líder</label>
                <input
                  required
                  type="text"
                  value={panelCodigo}
                  onChange={(e) => setPanelCodigo(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC12"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase font-mono font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={panelLoading}
                  className="w-full py-2.5 bg-[#0b1f3a] hover:bg-[#16325c] text-white font-bold rounded-xl text-sm shadow cursor-pointer disabled:opacity-50"
                >
                  {panelLoading ? 'Consultando...' : 'Ver Mis Estadísticas'}
                </button>
              </div>
            </form>
          </div>

          {/* Leader stats view */}
          {panelData && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-2xl font-bold font-display text-[#0b1f3a]">{panelData.nombre}</h3>
                  <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full inline-block mt-1">
                    Código: {panelData.codigo}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  Ciclo actual: <b>{panelData.ciclo}</b> {panelData.liquidado ? '(Liquidado)' : '(En curso)'}
                </div>
              </div>

              {/* Stat tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Tickets Vendidos</span>
                  <span className="text-2xl font-black font-display text-[#0b1f3a]">{panelData.tickets}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Ventas Pagadas</span>
                  <span className="text-2xl font-black font-display text-[#0b1f3a]">
                    {panelData.moneda}{panelData.monto.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Tasa Aplicada</span>
                  <span className="text-2xl font-black font-display text-blue-600">{panelData.tasa}%</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Comisión</span>
                  <span className="text-2xl font-black font-display text-emerald-600">
                    {panelData.moneda}{panelData.comision.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Posición</span>
                  <span className="text-2xl font-black font-display text-amber-600">
                    {panelData.puesto ? `#${panelData.puesto}` : '—'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Total a Recibir</span>
                  <span className="text-2xl font-black font-display text-[#0b1f3a]">
                    {panelData.moneda}{panelData.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Status message */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>Progreso de calificación</span>
                  <span>{panelData.tickets} / {panelData.min} tickets</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ffd23f] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, (panelData.tickets / panelData.min) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  {!panelData.calificado ? (
                    <>Te faltan <b>{panelData.faltan} tickets</b> para calificar y acceder al {panelData.tasa1}% de comisión.</>
                  ) : panelData.paraNivel2 > 0 ? (
                    <>¡Calificado con éxito! Con <b>{panelData.paraNivel2} tickets más</b> (más de {panelData.tier2}) tu tasa sube al <b>{panelData.tasa2}%</b> en todas tus ventas.</>
                  ) : (
                    <>¡Felicidades! Estás en el nivel máximo de comisión con <b>{panelData.tasa2}%</b>.</>
                  )}
                </p>
              </div>

              {/* Historical settlements for leader */}
              {panelData.historial.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-bold text-sm text-[#0b1f3a] mb-2">Liquidaciones Anteriores</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Ciclo</th>
                          <th className="py-2.5 px-3">Puesto</th>
                          <th className="py-2.5 px-3 text-right">Tickets</th>
                          <th className="py-2.5 px-3 text-right">Comisión</th>
                          <th className="py-2.5 px-3 text-right">Bono</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                          <th className="py-2.5 px-3 text-center">Estado Pago</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {panelData.historial.map((h, i) => (
                          <tr key={i}>
                            <td className="py-2 px-3 font-bold">Ciclo {h.ciclo}</td>
                            <td className="py-2 px-3">#{h.puesto}</td>
                            <td className="py-2 px-3 text-right">{h.tickets}</td>
                            <td className="py-2 px-3 text-right">{panelData.moneda}{h.comision.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right">{h.bono ? `${panelData.moneda}${h.bono.toFixed(2)}` : '—'}</td>
                            <td className="py-2 px-3 text-right font-bold">{panelData.moneda}{h.total.toFixed(2)}</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full font-bold ${
                                h.pagado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {h.pagado ? 'Pagado' : 'Pendiente'}
                              </span>
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
        </div>
      )}

      {/* 3. RANKING TAB */}
      {subTab === 'ranking' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold font-display text-[#0b1f3a] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Los 10 Primeros Líderes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ciclo {state.ciclo} {state.liquidado ? '· Liquidación oficial' : '· En vivo'}
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
              {state.totalLideres} líderes registrados
            </span>
          </div>

          {state.top.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#0b1f3a] text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Líder</th>
                    <th className="py-3 px-4 text-right">Tickets</th>
                    <th className="py-3 px-4 text-right">Comisión</th>
                    <th className="py-3 px-4 text-right">Bono 1er Lugar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.top.map((row) => (
                    <tr
                      key={row.puesto}
                      className={`hover:bg-slate-50 transition-colors ${
                        row.puesto === 1 ? 'bg-amber-50/60 font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-display font-black text-sm">
                        {row.puesto === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-[#ffd23f] text-[#0b1f3a] inline-flex items-center justify-center shadow-xs">
                            1
                          </span>
                        ) : (
                          <span className="text-slate-500">#{row.puesto}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">{row.nombre}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0b1f3a]">{row.tickets}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">{row.tasa}%</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                        {row.bono ? `★ ${c.moneda}${row.bono}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Todavía no hay líderes que alcancen el mínimo de {c.min} tickets en este ciclo.</p>
            </div>
          )}
        </div>
      )}

      {/* 4. HISTORIAL TAB */}
      {subTab === 'historial' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-display text-[#0b1f3a] flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" />
            Histórico Oficial de Liquidaciones
          </h3>

          {state.historico.length > 0 ? (
            state.historico.map((h) => (
              <div key={h.ciclo} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-base text-[#0b1f3a]">Ciclo {h.ciclo}</h4>
                  <span className="text-xs text-slate-500">{new Date(h.fecha).toLocaleDateString()}</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Líder</th>
                        <th className="py-2 px-3 text-right">Tickets</th>
                        <th className="py-2 px-3 text-right">Tasa</th>
                        <th className="py-2 px-3 text-right">Bono</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {h.filas.map((row) => (
                        <tr key={row.puesto}>
                          <td className="py-2 px-3 font-bold">#{row.puesto}</td>
                          <td className="py-2 px-3">{row.nombre}</td>
                          <td className="py-2 px-3 text-right font-bold">{row.tickets}</td>
                          <td className="py-2 px-3 text-right">{row.tasa}%</td>
                          <td className="py-2 px-3 text-right">{row.bono ? `${c.moneda}${row.bono}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">Aún no hay ciclos anteriores archivados.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
