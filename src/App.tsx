import React, { useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
import { PortalData, RifaState, LiderPublicState } from './types.js';
import { Header } from './components/Header.js';
import { PortalTab } from './components/PortalTab.js';
import { RifaTab } from './components/RifaTab.js';
import { CestaTab } from './components/CestaTab.js';
import { ProyectoTab } from './components/ProyectoTab.js';
import { LideresTab } from './components/LideresTab.js';
import { AdminModal } from './components/AdminModal.js';
import { RefreshCw, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'portal' | 'rifa' | 'cesta' | 'proyecto' | 'lideres' | 'admin'>('portal');
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [rifa, setRifa] = useState<RifaState | null>(null);
  const [lideres, setLideres] = useState<LiderPublicState | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Read URL params for ?ref=...
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
          setReferralCode(ref.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12));
        }
      }
    } catch (e) {
      // Ignored cross-origin location read errors
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [p, r, l] = await Promise.all([
        api.getPortal(),
        api.getRifaState(),
        api.getLideresPublic()
      ]);
      setPortal(p);
      setRifa(r);
      setLideres(l);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleTabChange = (tab: 'portal' | 'rifa' | 'cesta' | 'proyecto' | 'lideres' | 'admin') => {
    if (tab === 'admin') {
      setIsAdminOpen(true);
    } else {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && !portal) {
    return (
      <div className="min-h-screen bg-[#f3f5fa] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-10 h-10 text-[#0b1f3a] animate-spin mb-3" />
        <p className="font-display font-extrabold text-xl text-[#0b1f3a]">Cargando MEGACESTA...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5fa] flex flex-col text-[#0b1f3a]">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        comunidadNombre={portal?.comunidad.nombre || 'Comunidad'}
        comunidadLogo={portal?.comunidad.logo}
        logoLochita={portal?.config.logoLochita}
        logoMegacesta={portal?.config.logoMegacesta}
        titulo={portal?.config.titulo || 'MEGACESTA'}
        subtitulo={portal?.config.subtitulo || 'SISTEMA DE AUTOFINANCIAMIENTO DE PROYECTOS'}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        {activeTab === 'portal' && portal && (
          <PortalTab portal={portal} setActiveTab={handleTabChange} />
        )}

        {activeTab === 'rifa' && rifa && (
          <RifaTab
            state={rifa}
            onRefresh={loadData}
            referralCode={referralCode}
          />
        )}

        {activeTab === 'cesta' && rifa && (
          <CestaTab
            productos={rifa.productos}
            moneda={rifa.config.moneda}
          />
        )}

        {activeTab === 'proyecto' && portal && (
          <ProyectoTab portal={portal} />
        )}

        {activeTab === 'lideres' && lideres && (
          <LideresTab
            state={lideres}
            onRefresh={loadData}
            referralCode={referralCode}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 text-center">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 justify-center">
            <span>Plataforma comunitaria</span>
            <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-white">MEGACESTA</span>
            {portal?.comunidad.nombre && <span>· {portal.comunidad.nombre}</span>}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Panel Administrador
            </button>
            <span className="text-slate-600">|</span>
            <span>Autofinanciamiento Seguro</span>
          </div>
        </div>
      </footer>

      {/* Unified Admin Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshAll={loadData}
      />
    </div>
  );
}
