import React from 'react';
import { PortalData } from '../types.js';
import { FileText, ExternalLink, Calendar, HeartHandshake } from 'lucide-react';

interface ProyectoTabProps {
  portal: PortalData;
}

export const ProyectoTab: React.FC<ProyectoTabProps> = ({ portal }) => {
  const p = portal.proyecto;
  const c = portal.comunidad;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b1f3a] bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full w-fit mb-3">
          <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
          Fondo de Autofinanciamiento Comunitario
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b1f3a] font-display mb-2">
          {p.titulo || 'Proyecto Comunitario'}
        </h2>

        {c.nombre && (
          <p className="text-slate-500 text-sm mb-6 flex items-center gap-2">
            <span>Comunidad responsable: <b>{c.nombre}</b></span>
            {p.actualizado && (
              <span className="flex items-center gap-1 text-slate-400">
                · <Calendar className="w-3.5 h-3.5" />
                Actualizado: {new Date(p.actualizado).toLocaleDateString()}
              </span>
            )}
          </p>
        )}

        {/* Project Image */}
        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-6 shadow-inner relative">
          {p.foto ? (
            <img src={p.foto} alt={p.titulo} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0b1f3a] to-[#16325c] flex flex-col items-center justify-center text-slate-300 p-6 text-center">
              <FileText className="w-16 h-16 text-[#ffd23f] mb-3" />
              <span className="text-lg font-bold text-white">Documentación del Proyecto</span>
              <span className="text-sm text-slate-300 mt-1">
                La fotografía o infografía del proyecto se cargará en el panel de administración
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="prose max-w-none text-slate-700 text-base md:text-lg leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100 mb-6 whitespace-pre-line">
          {p.descripcion ||
            'Este proyecto tiene como objetivo financiar mejoras comunitarias, servicios básicos y adquisición de insumos a través del esfuerzo conjunto y solidario de toda la comunidad.'}
        </div>

        {/* Action Link to DOCX */}
        {p.docx ? (
          <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-[#0b1f3a] text-base">Documento Oficial de Respaldo</h4>
              <p className="text-sm text-slate-600 mt-0.5">
                Accede a la memoria descriptiva, presupuesto y plan de ejecución del proyecto.
              </p>
            </div>
            <a
              href={p.docx}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0b1f3a] hover:bg-[#16325c] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow transition-all flex-shrink-0"
            >
              <FileText className="w-4 h-4 text-[#ffd23f]" />
              Ver Documento DOCX
              <ExternalLink className="w-4 h-4 ml-0.5" />
            </a>
          </div>
        ) : (
          <div className="text-sm text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center">
            El enlace al documento descriptivo de Google Drive puede asignarse desde el módulo de administración.
          </div>
        )}
      </div>
    </div>
  );
};
