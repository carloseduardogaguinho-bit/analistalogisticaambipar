import React, { useState, useEffect } from 'react';
import { Viagem, DocumentoAmbiental, LicencaVeiculo, Ocorrencia, StatusViagem, StatusMTR } from './types';
import {
  getStoredViagens,
  saveStoredViagens,
  getStoredMTRs,
  saveStoredMTRs,
  getStoredLicencas,
  saveStoredLicencas,
  getStoredOcorrencias,
  saveStoredOcorrencias,
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ViagensView } from './components/ViagensView';
import { MtrView } from './components/MtrView';
import { OcorrenciasView } from './components/OcorrenciasView';
import { EsgKpiView } from './components/EsgKpiView';
import { ImportadorView } from './components/ImportadorView';
import { CalculadoraFreteView } from './components/CalculadoraFreteView';
import { RelatorioView } from './components/RelatorioView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [mtrs, setMtrs] = useState<DocumentoAmbiental[]>([]);
  const [licencas, setLicencas] = useState<LicencaVeiculo[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    setViagens(getStoredViagens());
    setMtrs(getStoredMTRs());
    setLicencas(getStoredLicencas());
    setOcorrencias(getStoredOcorrencias());
    setLoaded(true);
  }, []);

  // Save changes
  useEffect(() => {
    if (loaded) saveStoredViagens(viagens);
  }, [viagens, loaded]);

  useEffect(() => {
    if (loaded) saveStoredMTRs(mtrs);
  }, [mtrs, loaded]);

  useEffect(() => {
    if (loaded) saveStoredLicencas(licencas);
  }, [licencas, loaded]);

  useEffect(() => {
    if (loaded) saveStoredOcorrencias(ocorrencias);
  }, [ocorrencias, loaded]);

  // Handlers for Viagens
  const handleAddViagem = (newTrip: Viagem) => {
    setViagens((prev) => [newTrip, ...prev]);

    // Also auto-generate an MTR entry for compliance tracking
    const autoMtr: DocumentoAmbiental = {
      id: `doc-auto-${Date.now()}`,
      numeroMTR: newTrip.numeroMTR || `MTR-SINIR-${Math.floor(100000 + Math.random() * 900000)}`,
      sistemaEmissor: 'SINIR',
      gerador: newTrip.cliente,
      destinador: newTrip.destino,
      codigoIbama: '13 02 05* - Óleos minerais não clorados',
      descricaoResiduo: `Resíduo vinculado à viagem ${newTrip.codigoViagem}`,
      quantidadeTon: newTrip.pesoToneladas,
      status: 'Em Transporte',
      dataEmissao: new Date().toISOString().slice(0, 10),
      dataValidadeMTR: new Date(Date.now() + 7 * 86400 * 1000).toISOString().slice(0, 10),
      viagemId: newTrip.id,
    };
    setMtrs((prev) => [autoMtr, ...prev]);
  };

  const handleUpdateViagemStatus = (id: string, newStatus: StatusViagem) => {
    setViagens((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
  };

  const handleDeleteViagem = (id: string) => {
    if (confirm('Tem certeza de que deseja remover esta viagem?')) {
      setViagens((prev) => prev.filter((v) => v.id !== id));
    }
  };

  // Handlers for MTRs
  const handleAddMtr = (newMtr: DocumentoAmbiental) => {
    setMtrs((prev) => [newMtr, ...prev]);
  };

  const handleUpdateMtrStatus = (id: string, newStatus: StatusMTR, cdf?: string) => {
    setMtrs((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: newStatus, numeroCDF: cdf || m.numeroCDF } : m
      )
    );
  };

  // Handlers for Ocorrencias
  const handleAddOcorrencia = (newOco: Ocorrencia) => {
    setOcorrencias((prev) => [newOco, ...prev]);
  };

  const handleUpdateOcorrenciaStatus = (id: string, newStatus: Ocorrencia['status']) => {
    setOcorrencias((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  // Handlers for Excel Import
  const handleImportViagens = (novasViagens: Viagem[]) => {
    setViagens((prev) => [...novasViagens, ...prev]);
  };

  const handleRefresh = () => {
    setViagens(getStoredViagens());
    setMtrs(getStoredMTRs());
    setLicencas(getStoredLicencas());
    setOcorrencias(getStoredOcorrencias());
  };

  const ocorrenciasAbertasCount = ocorrencias.filter((o) => o.status !== 'Concluída').length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onRefresh={handleRefresh}
        ocorrenciasCount={ocorrenciasAbertasCount}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          ocorrenciasCount={ocorrenciasAbertasCount}
          viagensCount={viagens.length}
          mtrsCount={mtrs.length}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              viagens={viagens}
              mtrs={mtrs}
              ocorrencias={ocorrencias}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'viagens' && (
            <ViagensView
              viagens={viagens}
              onAddViagem={handleAddViagem}
              onUpdateViagemStatus={handleUpdateViagemStatus}
              onDeleteViagem={handleDeleteViagem}
            />
          )}

          {activeTab === 'mtr' && (
            <MtrView
              mtrs={mtrs}
              licencas={licencas}
              onAddMtr={handleAddMtr}
              onUpdateMtrStatus={handleUpdateMtrStatus}
            />
          )}

          {activeTab === 'ocorrencias' && (
            <OcorrenciasView
              ocorrencias={ocorrencias}
              onAddOcorrencia={handleAddOcorrencia}
              onUpdateOcorrenciaStatus={handleUpdateOcorrenciaStatus}
            />
          )}

          {activeTab === 'kpis' && (
            <EsgKpiView viagens={viagens} />
          )}

          {activeTab === 'importador' && (
            <ImportadorView
              viagens={viagens}
              onImportViagens={handleImportViagens}
            />
          )}

          {activeTab === 'calculadora' && (
            <CalculadoraFreteView />
          )}

          {activeTab === 'relatorio' && (
            <RelatorioView
              viagens={viagens}
              mtrs={mtrs}
              ocorrencias={ocorrencias}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
