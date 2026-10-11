import React from 'react';
import { LOGO_LOCHITA, LOGO_MEGACESTA } from '../assets/logos.js';

interface HeaderProps {
  activeTab: 'portal' | 'rifa' | 'cesta' | 'proyecto' | 'lideres' | 'admin';
  setActiveTab: (tab: 'portal' | 'rifa' | 'cesta' | 'proyecto' | 'lideres' | 'admin') => void;
  comunidadNombre: string;
  comunidadLogo?: string;
  logoLochita?: string;
  logoMegacesta?: string;
  titulo: string;
  subtitulo: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  comunidadNombre,
  comunidadLogo,
  logoLochita,
  logoMegacesta,
  titulo,
  subtitulo,
}) => {
  const getInitials = (name: string) => {
    return (name || '?')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  const isCompact = activeTab !== 'portal';

  return (
    <header className="bg-[#0b1f3a] text-white pt-4 pb-8 md:pb-11 rounded-b-[32px] md:rounded-b-[40px] shadow-lg transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4">
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('portal')}>
            <span className="font-display font-extrabold text-2xl tracking-wider text-[#ffd23f]">
              {titulo || 'MEGACESTA'}
            </span>
            {comunidadNombre && (
              <span className="text-xs bg-white/10 text-slate-200 px-2.5 py-1 rounded-full font-medium">
                {comunidadNombre}
              </span>
            )}
          </div>

          <nav className="flex items-center gap-1 bg-white/10 p-1 rounded-full text-xs sm:text-sm font-medium flex-wrap justify-center">
            <button
              onClick={() => setActiveTab('portal')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'portal'
                  ? 'bg-[#ffd23f] text-[#0b1f3a] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setActiveTab('rifa')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'rifa'
                  ? 'bg-[#ffd23f] text-[#0b1f3a] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Rifas
            </button>
            <button
              onClick={() => setActiveTab('cesta')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'cesta'
                  ? 'bg-[#ffd23f] text-[#0b1f3a] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              La Cesta
            </button>
            <button
              onClick={() => setActiveTab('proyecto')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'proyecto'
                  ? 'bg-[#ffd23f] text-[#0b1f3a] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Proyecto
            </button>
            <button
              onClick={() => setActiveTab('lideres')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'lideres'
                  ? 'bg-[#ffd23f] text-[#0b1f3a] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Líderes
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#ffd23f] text-[#0b1f3a] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin
            </button>
          </nav>
        </div>

        {/* Logos badges */}
        <div className="flex justify-center items-center gap-3 md:gap-7 mt-3 flex-wrap">
          {/* Logo 1: Lochitaclub */}
          <div
            className={`rounded-full bg-white border-[4px] md:border-[5px] border-[#ffd23f] flex items-center justify-center overflow-hidden shadow-md transition-all ${
              isCompact ? 'w-14 h-14' : 'w-24 h-24 md:w-32 md:h-32'
            }`}
          >
            <img src={logoLochita || LOGO_LOCHITA} alt="Lochitaclub" className="w-[86%] h-[86%] object-contain" />
          </div>

          {/* Logo 2: Megacesta (Bigger) */}
          <div
            className={`rounded-full bg-white border-[5px] md:border-[7px] border-[#ffd23f] flex items-center justify-center overflow-hidden shadow-xl transition-all ${
              isCompact ? 'w-20 h-20' : 'w-36 h-36 md:w-52 md:h-52'
            }`}
          >
            <img src={logoMegacesta || LOGO_MEGACESTA} alt="Megacesta" className="w-[88%] h-[88%] object-contain" />
          </div>

          {/* Logo 3: Comunidad */}
          <div
            className={`rounded-full bg-white border-[4px] md:border-[5px] border-[#ffd23f] flex items-center justify-center overflow-hidden shadow-md transition-all ${
              isCompact ? 'w-14 h-14' : 'w-24 h-24 md:w-32 md:h-32'
            }`}
          >
            {comunidadLogo ? (
              <img src={comunidadLogo} alt={comunidadNombre || 'Comunidad'} className="w-[86%] h-[86%] object-contain" />
            ) : comunidadNombre ? (
              <span className="font-display font-extrabold text-xl md:text-3xl text-[#0b1f3a]">
                {getInitials(comunidadNombre)}
              </span>
            ) : (
              <span className="text-[10px] md:text-xs text-slate-400 p-2 text-center leading-tight">
                Logo Comunidad
              </span>
            )}
          </div>
        </div>

        {/* Title and subtitles */}
        <div className="text-center mt-3">
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-7xl tracking-tight text-white leading-none">
            {titulo || 'MEGACESTA'}
          </h1>
          <p className="text-[#ffd23f] font-bold tracking-widest text-xs sm:text-sm md:text-base mt-2 uppercase">
            {subtitulo || 'SISTEMA DE AUTOFINANCIAMIENTO DE PROYECTOS'}
          </p>
          {comunidadNombre && (
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Comunidad: <span className="font-semibold text-white">{comunidadNombre}</span>
            </p>
          )}
        </div>

        {/* CTA Buttons in Portal View */}
        {!isCompact && (
          <div className="flex gap-3 justify-center flex-wrap mt-6">
            <button
              onClick={() => setActiveTab('rifa')}
              className="bg-[#ffd23f] text-black font-display font-extrabold text-lg px-8 py-3.5 rounded-xl hover:-translate-y-1 transition-transform shadow-md min-w-[160px] cursor-pointer"
            >
              RIFA
            </button>
            <button
              onClick={() => setActiveTab('lideres')}
              className="bg-[#ffd23f] text-black font-display font-extrabold text-lg px-8 py-3.5 rounded-xl hover:-translate-y-1 transition-transform shadow-md min-w-[160px] cursor-pointer"
            >
              REFERIDOS
            </button>
            <button
              onClick={() => setActiveTab('proyecto')}
              className="bg-[#ffd23f] text-black font-display font-extrabold text-lg px-8 py-3.5 rounded-xl hover:-translate-y-1 transition-transform shadow-md min-w-[160px] cursor-pointer"
            >
              PROYECTO
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
