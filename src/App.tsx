import React, { useState, useEffect } from 'react';
import {
  Viagem,
  DocumentoAmbiental,
  LicencaVeiculo,
  Ocorrencia,
  Veiculo,
  Motorista,
  Manutencao,
  ChecklistDiario,
  Abastecimento,
  StatusViagem,
  StatusMTR,
  StatusVeiculo,
  CteDocumento,
  MdfeDocumento,
  EmpresaFiscalConfig,
  MedicaoContrato,
  CotacaoManutencao,
  PropostaOficina,
  StatusMedicao,
  CertificadoDestinacaoFinalCDF,
} from './types';

import {
  getStoredViagens,
  saveStoredViagens,
  getStoredMTRs,
  saveStoredMTRs,
  getStoredLicencas,
  saveStoredLicencas,
  getStoredOcorrencias,
  saveStoredOcorrencias,
  getStoredVeiculos,
  saveStoredVeiculos,
  getStoredMotoristas,
  saveStoredMotoristas,
  getStoredManutencoes,
  saveStoredManutencoes,
  getStoredChecklists,
  saveStoredChecklists,
  getStoredAbastecimentos,
  saveStoredAbastecimentos,
  getStoredCtes,
  saveStoredCtes,
  getStoredMdfes,
  saveStoredMdfes,
  getStoredEmpresaFiscal,
  saveStoredEmpresaFiscal,
  getStoredMedicoes,
  saveStoredMedicoes,
  getStoredCotacoes,
  saveStoredCotacoes,
  getStoredCdfs,
  saveStoredCdfs,
} from './utils/storage';
import { ParsedSefazXml } from './utils/sebraeUtils';

import { getSupabaseCredentials, getSupabaseClient } from './services/supabase';

import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ViagensView } from './components/ViagensView';
import { FrotaView } from './components/FrotaView';
import { ManutencaoView } from './components/ManutencaoView';
import { CotacoesOficinasView } from './components/CotacoesOficinasView';
import { ChecklistView } from './components/ChecklistView';
import { AbastecimentoView } from './components/AbastecimentoView';
import { MotoristasView } from './components/MotoristasView';
import { MedicoesView } from './components/MedicoesView';
import { MtrView } from './components/MtrView';
import { OcorrenciasView } from './components/OcorrenciasView';
import { EsgKpiView } from './components/EsgKpiView';
import { ImportadorView } from './components/ImportadorView';
import { CalculadoraFreteView } from './components/CalculadoraFreteView';
import { RelatorioView } from './components/RelatorioView';
import { PortalFiscalView } from './components/PortalFiscalView';
import { SupabaseAuthModal } from './components/SupabaseAuthModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // States
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [mtrs, setMtrs] = useState<DocumentoAmbiental[]>([]);
  const [licencas, setLicencas] = useState<LicencaVeiculo[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [checklists, setChecklists] = useState<ChecklistDiario[]>([]);
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [ctes, setCtes] = useState<CteDocumento[]>([]);
  const [mdfes, setMdfes] = useState<MdfeDocumento[]>([]);
  const [empresaFiscal, setEmpresaFiscal] = useState<EmpresaFiscalConfig>(getStoredEmpresaFiscal());
  const [medicoes, setMedicoes] = useState<MedicaoContrato[]>([]);
  const [cotacoes, setCotacoes] = useState<CotacaoManutencao[]>([]);
  const [cdfs, setCdfs] = useState<CertificadoDestinacaoFinalCDF[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Initial Load
  useEffect(() => {
    const creds = getSupabaseCredentials();
    setIsSupabaseConnected(creds.isConfigured);

    setViagens(getStoredViagens());
    setMtrs(getStoredMTRs());
    setLicencas(getStoredLicencas());
    setOcorrencias(getStoredOcorrencias());
    setVeiculos(getStoredVeiculos());
    setMotoristas(getStoredMotoristas());
    setManutencoes(getStoredManutencoes());
    setChecklists(getStoredChecklists());
    setAbastecimentos(getStoredAbastecimentos());
    setCtes(getStoredCtes());
    setMdfes(getStoredMdfes());
    setEmpresaFiscal(getStoredEmpresaFiscal());
    setMedicoes(getStoredMedicoes());
    setCotacoes(getStoredCotacoes());
    setCdfs(getStoredCdfs());
    setLoaded(true);

    // If Supabase is connected, try to sync from cloud
    if (creds.isConfigured) {
      syncWithSupabase();
    }
  }, []);

  const syncWithSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const { data: vData } = await client.from('veiculos').select('*');
      if (vData && vData.length > 0) {
        const mappedVeiculos: Veiculo[] = vData.map((row: any) => ({
          id: row.id,
          placa: row.placa,
          modelo: row.modelo,
          marca: row.marca,
          ano: row.ano,
          tipoEquipamento: row.tipo_equipamento,
          baseOperacional: row.base_operacional,
          odometroAtualKm: row.odometro_atual_km,
          capacidadeCargaTon: row.capacidade_carga_ton,
          status: row.status,
          proximaRevisaoKm: row.proxima_revisao_km,
          dataUltimaRevisao: row.data_ultima_revisao,
          tipoCombustivelPadrao: row.tipo_combustivel_padrao,
        }));
        setVeiculos(mappedVeiculos);
      }
    } catch (err) {
      console.log('Supabase sync fallback to local storage:', err);
    }
  };

  // LocalStorage Persistence
  useEffect(() => { if (loaded) saveStoredViagens(viagens); }, [viagens, loaded]);
  useEffect(() => { if (loaded) saveStoredMTRs(mtrs); }, [mtrs, loaded]);
  useEffect(() => { if (loaded) saveStoredLicencas(licencas); }, [licencas, loaded]);
  useEffect(() => { if (loaded) saveStoredOcorrencias(ocorrencias); }, [ocorrencias, loaded]);
  useEffect(() => { if (loaded) saveStoredVeiculos(veiculos); }, [veiculos, loaded]);
  useEffect(() => { if (loaded) saveStoredMotoristas(motoristas); }, [motoristas, loaded]);
  useEffect(() => { if (loaded) saveStoredManutencoes(manutencoes); }, [manutencoes, loaded]);
  useEffect(() => { if (loaded) saveStoredChecklists(checklists); }, [checklists, loaded]);
  useEffect(() => { if (loaded) saveStoredAbastecimentos(abastecimentos); }, [abastecimentos, loaded]);
  useEffect(() => { if (loaded) saveStoredCtes(ctes); }, [ctes, loaded]);
  useEffect(() => { if (loaded) saveStoredMdfes(mdfes); }, [mdfes, loaded]);
  useEffect(() => { if (loaded) saveStoredEmpresaFiscal(empresaFiscal); }, [empresaFiscal, loaded]);
  useEffect(() => { if (loaded) saveStoredMedicoes(medicoes); }, [medicoes, loaded]);
  useEffect(() => { if (loaded) saveStoredCotacoes(cotacoes); }, [cotacoes, loaded]);
  useEffect(() => { if (loaded) saveStoredCdfs(cdfs); }, [cdfs, loaded]);

  // Handlers: Viagens
  const handleAddViagem = (newTrip: Viagem) => {
    setViagens((prev) => [newTrip, ...prev]);

    // Atualiza status do veículo correspondente para "Em Viagem"
    setVeiculos((prev) =>
      prev.map((v) => (v.placa === newTrip.placaCavalo ? { ...v, status: 'Em Viagem' } : v))
    );

    // Auto MTR
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
    if (confirm('Deseja excluir esta viagem?')) {
      setViagens((prev) => prev.filter((v) => v.id !== id));
    }
  };

  // Handlers: Veículos
  const handleAddVeiculo = (veic: Veiculo) => {
    setVeiculos((prev) => [veic, ...prev]);
    // Save to Supabase if connected
    const client = getSupabaseClient();
    if (client) {
      client.from('veiculos').insert([{
        id: veic.id,
        placa: veic.placa,
        modelo: veic.modelo,
        marca: veic.marca,
        ano: veic.ano,
        tipo_equipamento: veic.tipoEquipamento,
        base_operacional: veic.baseOperacional,
        odometro_atual_km: veic.odometroAtualKm,
        capacidade_carga_ton: veic.capacidadeCargaTon,
        status: veic.status,
        proxima_revisao_km: veic.proximaRevisaoKm,
        tipo_combustivel_padrao: veic.tipoCombustivelPadrao,
      }]).then(() => {});
    }
  };

  const handleUpdateVeiculoStatus = (id: string, status: StatusVeiculo) => {
    setVeiculos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
  };

  const handleUpdateVeiculo = (updatedVeic: Veiculo) => {
    setVeiculos((prev) =>
      prev.map((v) => (v.id === updatedVeic.id ? updatedVeic : v))
    );
  };

  const handleDeleteVeiculo = (id: string) => {
    setVeiculos((prev) => prev.filter((v) => v.id !== id));
  };

  // Handlers: Motoristas
  const handleAddMotorista = (mot: Motorista) => {
    setMotoristas((prev) => [mot, ...prev]);
    const client = getSupabaseClient();
    if (client) {
      client.from('motoristas').insert([{
        id: mot.id,
        nome: mot.nome,
        cpf: mot.cpf,
        cnh: mot.cnh,
        categoria_cnh: mot.categoriaCnh,
        validade_cnh: mot.validadeCnh,
        validade_mopp: mot.validadeMopp,
        validade_toxico: mot.validadeToxico,
        base_operacional: mot.baseOperacional,
        veiculo_fixo_placa: mot.veiculoFixoPlaca,
        status: mot.status,
      }]).then(() => {});
    }
  };

  const handleUpdateMotoristaStatus = (id: string, status: Motorista['status']) => {
    setMotoristas((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  const handleUpdateMotorista = (updatedMot: Motorista) => {
    setMotoristas((prev) =>
      prev.map((m) => (m.id === updatedMot.id ? updatedMot : m))
    );
  };

  const handleDeleteMotorista = (id: string) => {
    setMotoristas((prev) => prev.filter((m) => m.id !== id));
  };

  // Handlers: Manutenções
  const handleAddManutencao = (man: Manutencao) => {
    setManutencoes((prev) => [man, ...prev]);

    // Coloca o veículo em Manutenção
    setVeiculos((prev) =>
      prev.map((v) => (v.placa === man.veiculoPlaca ? { ...v, status: 'Em Manutenção' } : v))
    );

    const client = getSupabaseClient();
    if (client) {
      client.from('manutencoes').insert([{
        id: man.id,
        veiculo_placa: man.veiculoPlaca,
        tipo: man.tipo,
        descricao: man.descricao,
        km_no_momento: man.kmNoMomento,
        km_proxima_revisao: man.kmProximaRevisao,
        data_entrada: man.dataEntrada,
        data_previsao_saida: man.dataPrevisaoSaida,
        oficina: man.oficina,
        custo_total: man.custoTotal,
        status: man.status,
        responsavel_aprovacao: man.responsavelAprovacao,
      }]).then(() => {});
    }
  };

  const handleConcluirManutencao = (id: string, kmProximaRevisao: number) => {
    const man = manutencoes.find((m) => m.id === id);
    if (!man) return;

    setManutencoes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Concluída', dataConclusao: new Date().toISOString().slice(0, 10) } : m))
    );

    // Libera o veículo e atualiza o odômetro de revisão
    setVeiculos((prev) =>
      prev.map((v) =>
        v.placa === man.veiculoPlaca
          ? { ...v, status: 'Disponível', proximaRevisaoKm: kmProximaRevisao, dataUltimaRevisao: new Date().toISOString().slice(0, 10) }
          : v
      )
    );
  };

  // Handlers: Checklists
  const handleAddChecklist = (chk: ChecklistDiario) => {
    setChecklists((prev) => [chk, ...prev]);

    // Se reprovado, bloqueia o veículo
    if (chk.resultado === 'Reprovado - Bloqueado') {
      setVeiculos((prev) =>
        prev.map((v) => (v.placa === chk.veiculoPlaca ? { ...v, status: 'Em Manutenção' } : v))
      );
    }

    const client = getSupabaseClient();
    if (client) {
      client.from('checklists').insert([{
        id: chk.id,
        data_hora: chk.dataHora,
        veiculo_placa: chk.veiculoPlaca,
        motorista_nome: chk.motoristaNome,
        km_inicial: chk.kmInicial,
        tipo_inspecao: chk.tipoInspecao,
        pneus_pressao_e_estado: chk.pneusPressaoEEstado,
        freios_estacionamento_e_servico: chk.freiosEstacionamentoEServico,
        luzes_e_sinalizacao: chk.luzesESinalizacao,
        extintores_pqs_validade: chk.extintoresPQSValidade,
        kit_emergencia_ambipar: chk.kitEmergenciaAmbipar,
        vazamento_fluidos: chk.vazamentoFluidos,
        documentacao_mtr_civ_cipp: chk.documentacaoMTRCIVCIPP,
        tacografo_disco_ou_digital: chk.tacografoDiscoOuDigital,
        resultado: chk.resultado,
        observacoes: chk.observacoes,
      }]).then(() => {});
    }
  };

  // Handlers: Abastecimentos
  const handleAddAbastecimento = (aba: Abastecimento) => {
    setAbastecimentos((prev) => [aba, ...prev]);

    // Atualiza odômetro do veículo
    setVeiculos((prev) =>
      prev.map((v) =>
        v.placa === aba.veiculoPlaca && aba.odometroKm > v.odometroAtualKm
          ? { ...v, odometroAtualKm: aba.odometroKm }
          : v
      )
    );

    const client = getSupabaseClient();
    if (client) {
      client.from('abastecimentos').insert([{
        id: aba.id,
        data_hora: aba.dataHora,
        veiculo_placa: aba.veiculoPlaca,
        motorista_nome: aba.motoristaNome,
        odometro_km: aba.odometroKm,
        litros_abastecidos: aba.litrosAbastecidos,
        tipo_combustivel: aba.tipoCombustivel,
        valor_total: aba.valorTotal,
        posto: aba.posto,
        km_rodados_desde_ultimo: aba.kmRodadosDesdeUltimo,
        media_km_l: aba.mediaKmL,
      }]).then(() => {});
    }
  };

  const handleDeleteAbastecimento = (id: string) => {
    if (confirm('Deseja excluir este registro de abastecimento?')) {
      setAbastecimentos((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // Handlers: Fiscal
  const handleAddCte = (newCte: CteDocumento) => {
    setCtes((prev) => [newCte, ...prev]);
  };

  const handleAddMdfe = (newMdfe: MdfeDocumento) => {
    setMdfes((prev) => [newMdfe, ...prev]);
  };

  const handleUpdateCteStatus = (id: string, status: CteDocumento['status'], motivo?: string) => {
    setCtes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, motivoCancelamento: motivo } : c))
    );
  };

  const handleEncerrarMdfe = (id: string) => {
    setMdfes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Encerrado' } : m))
    );
  };

  const handleUpdateEmpresa = (novaEmpresa: EmpresaFiscalConfig) => {
    setEmpresaFiscal(novaEmpresa);
  };

  const handleSincronizarRetornoSefaz = (parsedDocs: ParsedSefazXml[]) => {
    let countCte = 0;
    let countMdfe = 0;

    setCtes((prev) =>
      prev.map((c) => {
        const found = parsedDocs.find(
          (d) => d.tipo === 'cte' && (d.chaveAcesso === c.chaveAcesso || d.numeroDoc === c.numeroCte)
        );
        if (found) {
          countCte++;
          return {
            ...c,
            status: 'Autorizado',
            protocoloAutorizacao: found.protocoloAutorizacao || c.protocoloAutorizacao,
            dataAutorizacao: found.dataAutorizacao || c.dataAutorizacao,
          };
        }
        return c;
      })
    );

    setMdfes((prev) =>
      prev.map((m) => {
        const found = parsedDocs.find(
          (d) => d.tipo === 'mdfe' && (d.chaveAcesso === m.chaveAcesso || d.numeroDoc === m.numeroMdfe)
        );
        if (found) {
          countMdfe++;
          return {
            ...m,
            status: 'Autorizado',
            protocoloAutorizacao: found.protocoloAutorizacao || m.protocoloAutorizacao,
          };
        }
        return m;
      })
    );

    alert(`Sincronização com o SEBRAE/SEFAZ realizada com sucesso!\n${countCte} CT-e(s) e ${countMdfe} MDF-e(s) atualizados com protocolos oficiais da SEFAZ.`);
  };

  // Handlers: Medições Clientes & Fornecedores
  const handleAddMedicao = (newMed: MedicaoContrato) => {
    setMedicoes((prev) => [newMed, ...prev]);
  };

  const handleUpdateMedicaoStatus = (
    id: string,
    status: StatusMedicao,
    valorAprovado?: number,
    justificativa?: string,
    numeroNf?: string
  ) => {
    setMedicoes((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          status,
          valorAprovado: valorAprovado !== undefined ? valorAprovado : m.valorAprovado,
          justificativaGlosa: justificativa !== undefined ? justificativa : m.justificativaGlosa,
          numeroNfFaturamento: numeroNf !== undefined ? numeroNf : m.numeroNfFaturamento,
          dataAprovacao: (status === 'Aprovada' || status === 'Faturada / Liquidada') ? new Date().toISOString().slice(0, 10) : m.dataAprovacao,
        };
      })
    );
  };

  // Handlers: Cotações & Oficinas (Saving)
  const handleAddCotacao = (newCot: CotacaoManutencao) => {
    setCotacoes((prev) => [newCot, ...prev]);
  };

  const handleAddProposta = (cotacaoId: string, proposta: PropostaOficina) => {
    setCotacoes((prev) =>
      prev.map((c) => {
        if (c.id !== cotacaoId) return c;
        const propostasAtualizadas = [...c.propostas, proposta];
        const valores = propostasAtualizadas.map((p) => p.valorTotal);
        const menorValor = Math.min(...valores);
        const maiorValor = Math.max(...valores);
        const savingEstimado = maiorValor > menorValor ? maiorValor - menorValor : c.savingEstimado;
        return {
          ...c,
          propostas: propostasAtualizadas,
          savingEstimado,
        };
      })
    );
  };

  const handleAprovarCotacao = (cotacaoId: string, propostaId: string, motivo: string) => {
    const cot = cotacoes.find((c) => c.id === cotacaoId);
    if (!cot) return;
    const propVencedora = cot.propostas.find((p) => p.id === propostaId);
    if (!propVencedora) return;

    // 1. Atualiza status da cotação e proposta vencedora
    setCotacoes((prev) =>
      prev.map((c) => {
        if (c.id !== cotacaoId) return c;
        return {
          ...c,
          status: 'Aprovada (Gerou OS)',
          propostaVencedoraId: propostaId,
          justificativaEscolha: motivo,
          dataAprovacao: new Date().toISOString().slice(0, 10),
        };
      })
    );

    // 2. Cria Ordem de Serviço na Manutenção da Frota automaticamente!
    const veic = veiculos.find((v) => v.placa === cot.veiculoPlaca);
    const odometro = veic?.odometroAtualKm || 50000;
    const novaOS: Manutencao = {
      id: `os-cot-${Date.now()}`,
      veiculoPlaca: cot.veiculoPlaca,
      tipo: 'Corretiva Emergencial',
      descricao: `[ORIGEM COTAÇÃO ${cot.codigoCotacao}] ${cot.descricaoNecessidade} (Peças: R$ ${propVencedora.valorPecas.toFixed(2)}, M.O: R$ ${propVencedora.valorMaoDeObra.toFixed(2)} - Garantia: ${propVencedora.garantiaMeses} meses - Condição: ${propVencedora.condicaoPagamento})`,
      kmNoMomento: odometro,
      kmProximaRevisao: odometro + 10000,
      dataEntrada: new Date().toISOString().slice(0, 10),
      dataPrevisaoSaida: new Date(Date.now() + (propVencedora.prazoDiasExecucao || 2) * 86400 * 1000).toISOString().slice(0, 10),
      oficina: `${propVencedora.oficinaNome} (${propVencedora.cidade})`,
      custoTotal: propVencedora.valorTotal,
      status: 'Agendada',
      responsavelAprovacao: 'Analista de Logística Ambipar',
    };

    handleAddManutencao(novaOS);
  };

  // Refresh
  const handleRefresh = () => {
    setViagens(getStoredViagens());
    setMtrs(getStoredMTRs());
    setLicencas(getStoredLicencas());
    setOcorrencias(getStoredOcorrencias());
    setVeiculos(getStoredVeiculos());
    setMotoristas(getStoredMotoristas());
    setManutencoes(getStoredManutencoes());
    setChecklists(getStoredChecklists());
    setAbastecimentos(getStoredAbastecimentos());
    setCtes(getStoredCtes());
    setMdfes(getStoredMdfes());
    setEmpresaFiscal(getStoredEmpresaFiscal());
    setMedicoes(getStoredMedicoes());
    setCotacoes(getStoredCotacoes());
    setCdfs(getStoredCdfs());
  };

  const ocorrenciasAbertasCount = ocorrencias.filter((o) => o.status !== 'Concluída').length;
  const manutencoesPendentesCount = manutencoes.filter((m) => m.status === 'Agendada' || m.status === 'Em Execução').length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onRefresh={handleRefresh}
        ocorrenciasCount={ocorrenciasAbertasCount}
        isSupabaseConnected={isSupabaseConnected}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          ocorrenciasCount={ocorrenciasAbertasCount}
          viagensCount={viagens.length}
          veiculosCount={veiculos.length}
          manutencoesCount={manutencoesPendentesCount}
          ctesCount={ctes.length}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          isSupabaseConnected={isSupabaseConnected}
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

          {activeTab === 'frota' && (
            <FrotaView
              veiculos={veiculos}
              onAddVeiculo={handleAddVeiculo}
              onUpdateVeiculo={handleUpdateVeiculo}
              onDeleteVeiculo={handleDeleteVeiculo}
              onUpdateVeiculoStatus={handleUpdateVeiculoStatus}
            />
          )}

          {activeTab === 'manutencao' && (
            <ManutencaoView
              manutencoes={manutencoes}
              veiculos={veiculos}
              onAddManutencao={handleAddManutencao}
              onConcluirManutencao={handleConcluirManutencao}
            />
          )}

          {activeTab === 'cotacoes' && (
            <CotacoesOficinasView
              cotacoes={cotacoes}
              veiculos={veiculos}
              onAddCotacao={handleAddCotacao}
              onAddProposta={handleAddProposta}
              onAprovarCotacao={handleAprovarCotacao}
            />
          )}

          {activeTab === 'checklist' && (
            <ChecklistView
              checklists={checklists}
              veiculos={veiculos}
              motoristas={motoristas}
              onAddChecklist={handleAddChecklist}
            />
          )}

          {activeTab === 'abastecimento' && (
            <AbastecimentoView
              abastecimentos={abastecimentos}
              veiculos={veiculos}
              motoristas={motoristas}
              onAddAbastecimento={handleAddAbastecimento}
              onDeleteAbastecimento={handleDeleteAbastecimento}
            />
          )}

          {activeTab === 'motoristas' && (
            <MotoristasView
              motoristas={motoristas}
              veiculos={veiculos}
              onAddMotorista={handleAddMotorista}
              onUpdateMotorista={handleUpdateMotorista}
              onDeleteMotorista={handleDeleteMotorista}
              onUpdateMotoristaStatus={handleUpdateMotoristaStatus}
            />
          )}

          {activeTab === 'medicoes' && (
            <MedicoesView
              medicoes={medicoes}
              viagens={viagens}
              onAddMedicao={handleAddMedicao}
              onUpdateMedicaoStatus={handleUpdateMedicaoStatus}
            />
          )}

          {activeTab === 'mtr' && (
            <MtrView
              mtrs={mtrs}
              licencas={licencas}
              cdfs={cdfs}
              veiculos={veiculos}
              motoristas={motoristas}
              onAddMtr={(m) => setMtrs((prev) => [m, ...prev])}
              onUpdateMtrStatus={(id, status, cdf) =>
                setMtrs((prev) =>
                  prev.map((m) => (m.id === id ? { ...m, status, numeroCDF: cdf || m.numeroCDF } : m))
                )
              }
              onDeleteMtr={(id) => setMtrs((prev) => prev.filter((m) => m.id !== id))}
              onAddCdf={(newCdf) => setCdfs((prev) => [newCdf, ...prev])}
              onDeleteCdf={(id) => setCdfs((prev) => prev.filter((c) => c.id !== id))}
              onAddLicenca={(newLic) => setLicencas((prev) => [newLic, ...prev])}
              onDeleteLicenca={(id) => setLicencas((prev) => prev.filter((l) => l.id !== id))}
            />
          )}

          {activeTab === 'ocorrencias' && (
            <OcorrenciasView
              ocorrencias={ocorrencias}
              onAddOcorrencia={(o) => setOcorrencias((prev) => [o, ...prev])}
              onUpdateOcorrenciaStatus={(id, status) =>
                setOcorrencias((prev) =>
                  prev.map((o) => (o.id === id ? { ...o, status } : o))
                )
              }
            />
          )}

          {activeTab === 'kpis' && (
            <EsgKpiView viagens={viagens} />
          )}

          {activeTab === 'importador' && (
            <ImportadorView
              viagens={viagens}
              onImportViagens={(novas) => setViagens((prev) => [...novas, ...prev])}
            />
          )}

          {activeTab === 'calculadora' && (
            <CalculadoraFreteView />
          )}

          {activeTab === 'fiscal' && (
            <PortalFiscalView
              ctes={ctes}
              mdfes={mdfes}
              empresa={empresaFiscal}
              viagens={viagens}
              veiculos={veiculos}
              motoristas={motoristas}
              onAddCte={handleAddCte}
              onAddMdfe={handleAddMdfe}
              onUpdateCteStatus={handleUpdateCteStatus}
              onEncerrarMdfe={handleEncerrarMdfe}
              onUpdateEmpresa={handleUpdateEmpresa}
              onSincronizarRetornoSefaz={handleSincronizarRetornoSefaz}
            />
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

      {/* Supabase Database & Auth Modal */}
      <SupabaseAuthModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionChange={(connected) => setIsSupabaseConnected(connected)}
      />
    </div>
  );
};

export default App;
