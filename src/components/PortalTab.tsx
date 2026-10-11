import React from 'react';
import { PortalData } from '../types.js';
import { Users, Ticket, Award, FileText, ArrowRight, Phone, Mail, User } from 'lucide-react';

interface PortalTabProps {
  portal: PortalData;
  setActiveTab: (tab: 'portal' | 'rifa' | 'cesta' | 'proyecto' | 'lideres' | 'admin') => void;
}

export const PortalTab: React.FC<PortalTabProps> = ({ portal, setActiveTab }) => {
  const c = portal.comunidad;
  const p = portal.proyecto;

  return (
    <div className="space-y-6">
      {/* Community Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Comunidad Organizada</span>
            <h2 className="text-2xl font-bold text-[#0b1f3a] font-display mt-0.5">
              {c.nombre || 'Comunidad en Autofinanciamiento'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            {c.representante && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <User className="w-4 h-4 text-[#0b1f3a]" />
                <span>{c.representante}</span>
              </div>
            )}
            {c.telefono && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Phone className="w-4 h-4 text-[#0b1f3a]" />
                <span>{c.telefono}</span>
              </div>
            )}
            {c.correo && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Mail className="w-4 h-4 text-[#0b1f3a]" />
                <span>{c.correo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div
            onClick={() => setActiveTab('rifa')}
            className="group p-5 bg-gradient-to-br from-amber-50/70 to-amber-100/40 rounded-xl border border-amber-200/60 hover:border-amber-300 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-[#ffd23f] flex items-center justify-center text-[#0b1f3a] mb-3">
              <Ticket className="w-5 h-5 font-bold" />
            </div>
            <h3 className="font-bold text-lg text-[#0b1f3a] font-display flex items-center justify-between">
              Dos Rifas Simultáneas
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Participa como Colaborador (100 números, premio en efectivo) o Comprador (1000 tickets, premio La Megacesta).
            </p>
          </div>

          <div
            onClick={() => setActiveTab('lideres')}
            className="group p-5 bg-gradient-to-br from-blue-50/70 to-indigo-100/40 rounded-xl border border-blue-200/60 hover:border-blue-300 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0b1f3a] flex items-center justify-center text-white mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-[#0b1f3a] font-display flex items-center justify-between">
              Programa de Líderes
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Obtén tu código de líder, comparte con tus vecinos y gana 10% a 15% en comisiones más bono al 1er lugar.
            </p>
          </div>

          <div
            onClick={() => setActiveTab('cesta')}
            className="group p-5 bg-gradient-to-br from-emerald-50/70 to-teal-100/40 rounded-xl border border-emerald-200/60 hover:border-emerald-300 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-[#1f9d6b] flex items-center justify-center text-white mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-[#0b1f3a] font-display flex items-center justify-between">
              La Megacesta
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              100 productos de alimentación y despensa familiar de primera calidad. Conoce el inventario completo.
            </p>
          </div>
        </div>
      </div>

      {/* Project Card Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Objetivo del Fondo</span>
            <h2 className="text-2xl font-bold text-[#0b1f3a] font-display">{p.titulo || 'Proyecto Comunitario'}</h2>
          </div>
          <button
            onClick={() => setActiveTab('proyecto')}
            className="text-sm font-semibold text-[#0b1f3a] hover:text-[#16325c] flex items-center gap-1 cursor-pointer"
          >
            Ver detalles <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group cursor-pointer" onClick={() => setActiveTab('proyecto')}>
            {p.foto ? (
              <img src={p.foto} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#16325c] to-[#0b1f3a] flex flex-col items-center justify-center text-slate-300 p-4 text-center">
                <FileText className="w-10 h-10 text-[#ffd23f] mb-2" />
                <span className="text-sm font-medium">Foto del Proyecto</span>
              </div>
            )}
            <span className="absolute bottom-2.5 right-2.5 bg-[#ffd23f] text-black font-bold text-xs px-3 py-1 rounded-full shadow">
              Ver Proyecto
            </span>
          </div>

          <div className="md:col-span-7 flex flex-col justify-center">
            <p className="text-slate-600 text-base leading-relaxed">
              {p.descripcion || 'Cada ticket adquirido contribuye directamente al fondo de autofinanciamiento para proyectos comunitarios sostenibles.'}
            </p>
            {p.docx && (
              <div className="mt-4">
                <a
                  href={p.docx}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold bg-slate-100 hover:bg-slate-200 text-[#0b1f3a] px-4 py-2 rounded-lg transition-colors border border-slate-200"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  Descargar o ver documento descriptivo (DOCX)
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
