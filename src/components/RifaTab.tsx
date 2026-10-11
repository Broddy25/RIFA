import React, { useState, useMemo } from 'react';
import { RifaState } from '../types.js';
import { api } from '../api.js';
import { Ticket, Users, Trophy, Dices, X, Check, MessageSquare, AlertCircle } from 'lucide-react';

interface RifaTabProps {
  state: RifaState;
  onRefresh: () => void;
  referralCode?: string;
}

export const RifaTab: React.FC<RifaTabProps> = ({ state, onRefresh, referralCode }) => {
  const [rol, setRol] = useState<'A' | 'C' | null>(null);
  const [selectedNums, setSelectedNums] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [randomCount, setRandomCount] = useState(3);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyResult, setBuyResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [metodo, setMetodo] = useState('Pago móvil');
  const [referencia, setReferencia] = useState('');
  const [codigoLider, setCodigoLider] = useState(referralCode || '');

  const c = state.config;
  const s = state.stats;
  const isDrawn = rol ? Boolean(state.ganadores[rol]) : false;

  const currentMax = rol === 'A' ? c.A.max : c.C.max;
  const currentTotal = rol === 'A' ? 100 : 1000;
  const currentPrice = rol === 'A' ? c.A.precio : c.C.precio;
  const pageSize = rol === 'C' ? 200 : 100;
  const totalPages = Math.ceil(currentTotal / pageSize);

  const currentMap = rol ? state.mapa[rol] : '';

  const handleToggleNum = (n: number) => {
    if (!rol || isDrawn) return;
    const m = currentMap[n - 1];
    if (m !== 'D') return;

    const next = new Set(selectedNums);
    if (next.has(n)) {
      next.delete(n);
    } else {
      if (next.size >= currentMax) {
        alert(`Máximo ${currentMax} números por compra.`);
        return;
      }
      next.add(n);
    }
    setSelectedNums(next);
  };

  const handleRandomPick = () => {
    if (!rol || isDrawn) return;
    const available: number[] = [];
    for (let i = 0; i < currentMap.length; i++) {
      if (currentMap[i] === 'D' && !selectedNums.has(i + 1)) {
        available.push(i + 1);
      }
    }
    const q = Math.min(randomCount, currentMax - selectedNums.size);
    if (q <= 0) return;

    const next = new Set(selectedNums);
    for (let k = 0; k < q && available.length > 0; k++) {
      const idx = Math.floor(Math.random() * available.length);
      next.add(available[idx]);
      available.splice(idx, 1);
    }
    setSelectedNums(next);
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rol || selectedNums.size === 0) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.reservarTickets({
        rol,
        tickets: Array.from(selectedNums).sort((a, b) => a - b),
        nombre,
        cedula,
        telefono,
        correo,
        metodo,
        referencia,
        codigoLider
      });

      setBuyResult(res);
      setSelectedNums(new Set());
      setShowBuyModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar reserva');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedArray = useMemo(() => Array.from(selectedNums).sort((a, b) => a - b), [selectedNums]);
  const totalPrice = selectedArray.length * currentPrice;

  return (
    <div className="space-y-6 pb-24">
      {/* Winners Banner if any */}
      {(state.ganadores.A || state.ganadores.C) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.ganadores.C && (
            <div className="bg-[#ffd23f] text-[#0b1f3a] p-5 rounded-2xl flex items-center gap-4 shadow-md border-2 border-amber-400">
              <div className="w-16 h-16 rounded-full bg-[#0b1f3a] text-[#ffd23f] flex items-center justify-center font-display font-black text-2xl flex-shrink-0">
                #{state.ganadores.C.numero}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-slate-800">
                  ¡Ganador Rifa Compradores!
                </span>
                <h4 className="text-xl font-bold font-display">{state.ganadores.C.nombre}</h4>
                <p className="text-xs text-slate-700 mt-0.5">
                  Premio: {state.ganadores.C.premio} · {new Date(state.ganadores.C.fecha).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          {state.ganadores.A && (
            <div className="bg-[#ffd23f] text-[#0b1f3a] p-5 rounded-2xl flex items-center gap-4 shadow-md border-2 border-amber-400">
              <div className="w-16 h-16 rounded-full bg-[#0b1f3a] text-[#ffd23f] flex items-center justify-center font-display font-black text-2xl flex-shrink-0">
                #{state.ganadores.A.numero}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-slate-800">
                  ¡Ganador Rifa Colaboradores!
                </span>
                <h4 className="text-xl font-bold font-display">{state.ganadores.A.nombre}</h4>
                <p className="text-xs text-slate-700 mt-0.5">
                  Premio: {state.ganadores.A.premio} · {new Date(state.ganadores.A.fecha).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Role Selector Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Role A */}
        <button
          onClick={() => {
            setRol('A');
            setSelectedNums(new Set());
            setPage(0);
          }}
          className={`p-5 rounded-2xl text-left border-3 transition-all cursor-pointer shadow-sm relative overflow-hidden ${
            rol === 'A'
              ? 'bg-[#ffd23f] border-[#0b1f3a] text-[#0b1f3a] shadow-md -translate-y-0.5'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rifa A · 100 números</span>
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold font-display mt-1">Soy COLABORADOR</h3>
          <p className="text-sm mt-1 font-medium">
            {c.moneda}{c.A.precio} c/u · Premio en efectivo: <b className="text-slate-900">{c.moneda}{c.A.premio}</b>
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded font-bold">
              {s.A.disponibles} libres
            </span>
            <span className="text-slate-500">{s.A.vendidos} vendidos</span>
          </div>
        </button>

        {/* Role C */}
        <button
          onClick={() => {
            setRol('C');
            setSelectedNums(new Set());
            setPage(0);
          }}
          className={`p-5 rounded-2xl text-left border-3 transition-all cursor-pointer shadow-sm relative overflow-hidden ${
            rol === 'C'
              ? 'bg-[#ffd23f] border-[#0b1f3a] text-[#0b1f3a] shadow-md -translate-y-0.5'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rifa C · 1000 tickets</span>
            <Ticket className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold font-display mt-1">Soy COMPRADOR</h3>
          <p className="text-sm mt-1 font-medium">
            {c.moneda}{c.C.precio} c/u · Premio: <b className="text-slate-900">{c.premioC}</b>
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded font-bold">
              {s.C.disponibles} libres
            </span>
            <span className="text-slate-500">{s.C.vendidos} vendidos</span>
          </div>
        </button>
      </div>

      {/* Grid Picker Section */}
      {rol ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          {/* Community Organizer Banner */}
          {c.comunidad && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-sm text-[#0b1f3a]">
              🏛️ Rifa organizada por la comunidad <b>{c.comunidad}</b>
              {c.representante && (
                <span> · Representante que la gestiona: <b>{c.representante}</b></span>
              )}
            </div>
          )}

          {/* Bar controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded border border-[#0b1f3a] bg-white inline-block"></span> Libre
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded border border-amber-400 bg-amber-100 inline-block"></span> Reservado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 inline-block"></span> Vendido
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#0b1f3a] inline-block"></span> Seleccionado
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="number"
                min="1"
                max={currentMax}
                value={randomCount}
                onChange={(e) => setRandomCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2.5 py-1.5 border border-slate-200 rounded-lg text-center font-bold text-sm"
              />
              <button
                onClick={handleRandomPick}
                disabled={isDrawn}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-[#0b1f3a] font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer border border-slate-200 disabled:opacity-50"
              >
                <Dices className="w-4 h-4" /> Al azar
              </button>
            </div>
          </div>

          {/* Pagination if multiple pages */}
          {totalPages > 1 && (
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: totalPages }).map((_, i) => {
                const start = i * pageSize + 1;
                const end = Math.min((i + 1) * pageSize, currentTotal);
                return (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      page === i
                        ? 'bg-[#0b1f3a] text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {start} – {end}
                  </button>
                );
              })}
            </div>
          )}

          {/* Numbers Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 gap-1.5 sm:gap-2">
            {Array.from({ length: Math.min(pageSize, currentTotal - page * pageSize) }).map((_, i) => {
              const num = page * pageSize + i + 1;
              const statusChar = currentMap[num - 1] || 'D';
              const isSelected = selectedNums.has(num);
              const isSold = statusChar === 'V';
              const isReserved = statusChar === 'R';
              const isDisabled = statusChar !== 'D' || isDrawn;

              let btnClass = 'bg-white border-slate-300 text-slate-800 hover:border-[#0b1f3a] hover:bg-slate-50';
              if (isSelected) {
                btnClass = 'bg-[#0b1f3a] border-[#0b1f3a] text-[#ffd23f] font-black scale-105 shadow-sm';
              } else if (isSold) {
                btnClass = 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed';
              } else if (isReserved) {
                btnClass = 'bg-amber-100 border-amber-300 text-amber-800 cursor-not-allowed';
              }

              return (
                <button
                  key={num}
                  disabled={isDisabled}
                  onClick={() => handleToggleNum(num)}
                  className={`h-10 rounded-lg border font-mono font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-sm">
          <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-lg font-bold text-[#0b1f3a] font-display">Elige una modalidad arriba</h4>
          <p className="text-sm text-slate-500 mt-1">
            Selecciona si deseas participar como Colaborador (100 números) o como Comprador (1000 tickets).
          </p>
        </div>
      )}

      {/* Floating Tray Cart */}
      {selectedArray.length > 0 && rol && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0b1f3a] text-white py-3.5 px-4 shadow-2xl z-40 border-t border-slate-700 animate-in slide-in-from-bottom duration-200">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-bold font-display text-lg text-[#ffd23f]">
                  {selectedArray.length} {rol === 'A' ? 'números' : 'tickets'}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-extrabold text-xl text-white">
                  {c.moneda}{totalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate max-w-[320px] sm:max-w-md">
                Seleccionados: {selectedArray.join(', ')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedNums(new Set())}
                className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white border border-slate-600 rounded-xl cursor-pointer"
              >
                Vaciar
              </button>
              <button
                onClick={() => setShowBuyModal(true)}
                className="bg-[#ffd23f] hover:bg-amber-400 text-black font-display font-extrabold px-6 py-2.5 rounded-xl shadow cursor-pointer text-sm"
              >
                Reservar Ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Form Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowBuyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold font-display text-[#0b1f3a]">
              Reserva de {rol === 'A' ? 'Colaborador' : 'Comprador'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {selectedArray.length} {rol === 'A' ? 'número(s)' : 'ticket(s)'} · Total:{' '}
              <b className="text-slate-900">{c.moneda}{totalPrice.toFixed(2)}</b>
            </p>

            <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs font-mono text-slate-700 break-words">
              {selectedArray.join(', ')}
            </div>

            {errorMessage && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleConfirmReservation} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  required
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Pedro Pérez"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cédula de Identidad *</label>
                  <input
                    required
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ej: V-18456789"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono *</label>
                  <input
                    required
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="04121234567"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  required
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código de Líder / Referido (Opcional)
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={codigoLider}
                  onChange={(e) => setCodigoLider(e.target.value.toUpperCase())}
                  placeholder="Si alguien te invitó, escribe su código"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Método de Pago</label>
                  <select
                    value={metodo}
                    onChange={(e) => setMetodo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="Pago móvil">Pago móvil</option>
                    <option value="Zelle">Zelle</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nro de Referencia (opcional)</label>
                  <input
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Últimos 4 dígitos o ref"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBuyModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#0b1f3a] hover:bg-[#16325c] text-white rounded-xl text-sm font-bold shadow cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Procesando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {buyResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 font-black" />
            </div>

            <h3 className="text-2xl font-extrabold font-display text-[#0b1f3a]">¡Reserva Exitosa!</h3>

            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 text-left space-y-2 border border-slate-100">
              <p><b>Venta ID:</b> <span className="font-mono">{buyResult.ventaId}</span></p>
              <p><b>Tickets:</b> <span className="font-mono">{buyResult.tickets?.join(', ')}</span></p>
              <p><b>Monto Total:</b> <span className="font-bold text-emerald-700">{buyResult.moneda}{buyResult.monto}</span></p>
              <p className="text-xs text-slate-500">
                Tu reserva estará activa durante <b>{buyResult.horas} horas</b> mientras se confirma tu pago.
              </p>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-left text-xs whitespace-pre-line text-slate-800">
              <p className="font-bold text-amber-900 mb-1">Datos para realizar tu pago:</p>
              {buyResult.pago}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {buyResult.whatsapp && (
                <a
                  href={`https://wa.me/${buyResult.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hola, reservé los números ${buyResult.tickets?.join(', ')} en la MEGACESTA. Venta ID: ${buyResult.ventaId}, monto: ${buyResult.moneda}${buyResult.monto}. Adjunto mi comprobante de pago.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#1f9d6b] hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow transition-colors text-sm"
                >
                  <MessageSquare className="w-4 h-4" /> Enviar Comprobante por WhatsApp
                </a>
              )}
              <button
                onClick={() => setBuyResult(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
