import React, { useState, useEffect, useMemo } from 'react';
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
  Pneu,
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
  getStoredPneus,
  saveStoredPneus,
} from './utils/storage';
import { ParsedSefazXml } from './utils/sebraeUtils';
import { CENARIO_DEMO_AMBIPAR } from './data/demonstracaoAmbipar';

import { getSupabaseCredentials, getSupabaseClient } from './services/supabase';

import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ViagensView } from './components/ViagensView';
import { FrotaView } from './components/FrotaView';
import { PneusView } from './components/PneusView';
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
import { PortalMotoristaChecklist } from './components/PortalMotoristaChecklist';
import { ModalQrCodeChecklist } from './components/ModalQrCodeChecklist';
import { ModalRadarSassmaq } from './components/ModalRadarSassmaq';
import { ModalBuscaGlobal } from './components/ModalBuscaGlobal';
import { ModalBackupDados, BackupDataStructure } from './components/ModalBackupDados';
import { ModalManualPopAmbipar } from './components/ModalManualPopAmbipar';
import { ModalTorreTv } from './components/ModalTorreTv';
import { ModalPassagemPlantao } from './components/ModalPassagemPlantao';
import { ModalGestaoEstadias } from './components/ModalGestaoEstadias';
import { ModalIncompatibilidadeQuimica } from './components/ModalIncompatibilidadeQuimica';
import { ModalPaeEmergencia } from './components/ModalPaeEmergencia';
import { ModalPedagioPpd } from './components/ModalPedagioPpd';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Modais Operacionais de Estreia SASSMAQ
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
  const [qrCodePlacaSelecionada, setQrCodePlacaSelecionada] = useState<string | undefined>(undefined);
  const [isRadarSassmaqOpen, setIsRadarSassmaqOpen] = useState(false);
  const [isBuscaGlobalOpen, setIsBuscaGlobalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isManualPopModalOpen, setIsManualPopModalOpen] = useState(false);
  const [isTorreTvOpen, setIsTorreTvOpen] = useState(false);
  const [isPassagemPlantaoOpen, setIsPassagemPlantaoOpen] = useState(false);
  const [isEstadiasOpen, setIsEstadiasOpen] = useState(false);
  const [isIncompatibilidadeOpen, setIsIncompatibilidadeOpen] = useState(false);
  const [isPaeEmergenciaOpen, setIsPaeEmergenciaOpen] = useState(false);
  const [isPedagioPpdOpen, setIsPedagioPpdOpen] = useState(false);

  const [isPortalMotorista, setIsPortalMotorista] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.search.includes('portal=motorista') ||
        window.location.search.includes('motorista=true') ||
        window.location.hash.includes('motorista')
      );
    }
    return false;
  });

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
  const [pneus, setPneus] = useState<Pneu[]>([]);
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
    setPneus(getStoredPneus());
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
      // 1. Veículos
      const { data: vData } = await client.from('veiculos').select('*');
      if (vData && vData.length > 0) {
        const mappedVeiculos: Veiculo[] = vData.map((row: any) => ({
          id: row.id,
          placa: row.placa,
          modelo: row.modelo,
          marca: row.marca,
          ano: row.ano,
          anoModelo: row.ano_modelo,
          tipoEquipamento: row.tipo_equipamento,
          tipoPropriedade: row.tipo_propriedade,
          tipoTracao: row.tipo_tracao,
          baseOperacional: row.base_operacional,
          motoristaTitularNome: row.motorista_titular_nome,
          odometroAtualKm: row.odometro_atual_km,
          capacidadeCargaTon: row.capacidade_carga_ton,
          status: row.status,
          proximaRevisaoKm: row.proxima_revisao_km,
          dataUltimaRevisao: row.data_ultima_revisao,
          tipoCombustivelPadrao: row.tipo_combustivel_padrao,
          isSemCarreta: row.is_sem_carreta,
          renavam: row.renavam,
          chassi: row.chassi,
          cor: row.cor,
          pbtKg: row.pbt_kg,
          numeroCiv: row.numero_civ,
          validadeCiv: row.validade_civ,
          numeroCipp: row.numero_cipp,
          validadeCipp: row.validade_cipp,
          numeroCronotacografo: row.numero_cronotacografo,
          validadeCronotacografo: row.validade_cronotacografo,
        }));
        setVeiculos(mappedVeiculos);
      }

      // 2. Motoristas
      const { data: mData } = await client.from('motoristas').select('*');
      if (mData && mData.length > 0) {
        const mappedMotoristas: Motorista[] = mData.map((row: any) => ({
          id: row.id,
          nome: row.nome,
          cpf: row.cpf,
          rg: row.rg,
          telefone: row.telefone,
          email: row.email,
          funcao: row.funcao,
          matricula: row.matricula,
          dataAdmissao: row.data_admissao,
          regimeContratacao: row.regime_contratacao,
          baseOperacional: row.base_operacional,
          veiculoFixoPlaca: row.veiculo_fixo_placa,
          status: row.status,
          cnh: row.cnh,
          categoriaCnh: row.categoria_cnh,
          validadeCnh: row.validade_cnh,
          validadeMopp: row.validade_mopp,
          validadeToxico: row.validade_toxico,
          validadeAso: row.validade_aso,
          validadeNr20: row.validade_nr20,
          validadeNr35: row.validade_nr35,
          scoreEcoconducao: row.score_ecoconducao,
          mediaConsumoGeral: row.media_consumo_geral,
        }));
        setMotoristas(mappedMotoristas);
      }

      // 3. Viagens
      const { data: viData } = await client.from('viagens').select('*');
      if (viData && viData.length > 0) {
        const mappedViagens: Viagem[] = viData.map((row: any) => ({
          id: row.id,
          codigoViagem: row.codigo_viagem,
          cliente: row.cliente,
          origem: row.origem,
          destino: row.destino,
          baseOperacional: row.base_operacional,
          motorista: row.motorista,
          placaCavalo: row.placa_cavalo,
          placaCarreta: row.placa_carreta,
          tipoEquipamento: row.tipo_equipamento,
          classeResiduo: row.classe_residuo,
          pesoToneladas: Number(row.peso_toneladas) || 0,
          distanciaKm: Number(row.distancia_km) || 0,
          dataSaidaPrevista: row.data_saida_prevista,
          dataChegadaPrevista: row.data_chegada_prevista,
          status: row.status,
          numeroMTR: row.numero_mtr || '',
          numeroCTe: row.numero_cte || '',
          tipoCombustivel: row.tipo_combustivel || 'Diesel S10',
          custoTotal: Number(row.custo_total) || 0,
          observacoes: row.observacoes,
        }));
        setViagens(mappedViagens);
      }

      // 4. Manutenções
      const { data: manData } = await client.from('manutencoes').select('*');
      if (manData && manData.length > 0) {
        const mappedManutencoes: Manutencao[] = manData.map((row: any) => ({
          id: row.id,
          veiculoPlaca: row.veiculo_placa,
          tipo: row.tipo,
          descricao: row.descricao,
          kmNoMomento: row.km_no_momento,
          kmProximaRevisao: row.km_proxima_revisao,
          dataEntrada: row.data_entrada,
          dataPrevisaoSaida: row.data_previsao_saida,
          dataConclusao: row.data_conclusao,
          oficina: row.oficina,
          custoTotal: Number(row.custo_total) || 0,
          status: row.status,
          responsavelAprovacao: row.responsavel_aprovacao,
        }));
        setManutencoes(mappedManutencoes);
      }

      // 5. Pneus
      const { data: pnData } = await client.from('pneus').select('*');
      if (pnData && pnData.length > 0) {
        const mappedPneus: Pneu[] = pnData.map((row: any) => ({
          id: row.id,
          numeroFogo: row.numero_fogo,
          numeroSerie: row.numero_serie,
          marca: row.marca,
          modelo: row.modelo,
          medida: row.medida,
          vidaAtual: row.vida_atual,
          status: row.status,
          veiculoPlaca: row.veiculo_placa,
          posicao: row.posicao,
          sulcoAtualMm: Number(row.sulco_atual_mm) || 0,
          sulcoOriginalMm: Number(row.sulco_original_mm) || 0,
          pressaoPsi: row.pressao_psi,
          kmAtualPneu: Number(row.km_atual_pneu) || 0,
          kmInstalacao: row.km_instalacao,
          custoAquisicao: Number(row.custo_aquisicao) || 0,
          custoRecapagens: Number(row.custo_recapagens) || 0,
          dataAquisicao: row.data_aquisicao,
          dataUltimaInspecao: row.data_ultima_inspecao,
          observacoes: row.observacoes,
        }));
        setPneus(mappedPneus);
      }
    } catch (err) {
      console.log('Supabase sync fallback to local storage:', err);
    }
  };

  const handleUploadCompletoSupabase = async (): Promise<{ sucesso: boolean; mensagem: string }> => {
    const client = getSupabaseClient();
    if (!client) {
      return { sucesso: false, mensagem: 'Supabase não configurado. Insira a URL e Anon Key primeiro.' };
    }

    try {
      if (veiculos.length > 0) {
        const payloadVeiculos = veiculos.map((v) => ({
          id: v.id,
          placa: v.placa,
          modelo: v.modelo,
          marca: v.marca,
          ano: v.ano,
          ano_modelo: v.anoModelo || v.ano,
          tipo_equipamento: v.tipoEquipamento,
          tipo_propriedade: v.tipoPropriedade,
          tipo_tracao: v.tipoTracao,
          base_operacional: v.baseOperacional,
          motorista_titular_nome: v.motoristaTitularNome,
          odometro_atual_km: v.odometroAtualKm,
          capacidade_carga_ton: v.capacidadeCargaTon,
          status: v.status,
          proxima_revisao_km: v.proximaRevisaoKm,
          data_ultima_revisao: v.dataUltimaRevisao || null,
          tipo_combustivel_padrao: v.tipoCombustivelPadrao,
          is_sem_carreta: v.isSemCarreta || false,
          renavam: v.renavam || null,
          chassi: v.chassi || null,
          cor: v.cor || null,
          pbt_kg: v.pbtKg || null,
          numero_civ: v.numeroCiv || null,
          validade_civ: v.validadeCiv || null,
          numero_cipp: v.numeroCipp || null,
          validade_cipp: v.validadeCipp || null,
          numero_cronotacografo: v.numeroCronotacografo || null,
          validade_cronotacografo: v.validadeCronotacografo || null,
        }));
        await client.from('veiculos').upsert(payloadVeiculos, { onConflict: 'id' });
      }

      if (motoristas.length > 0) {
        const payloadMotoristas = motoristas.map((m) => ({
          id: m.id,
          nome: m.nome,
          cpf: m.cpf,
          rg: m.rg || null,
          telefone: m.telefone || null,
          email: m.email || null,
          funcao: m.funcao || 'Motorista Titular',
          matricula: m.matricula || null,
          data_admissao: m.dataAdmissao || null,
          regime_contratacao: m.regimeContratacao || 'CLT Ambipar',
          base_operacional: m.baseOperacional,
          veiculo_fixo_placa: m.veiculoFixoPlaca || null,
          status: m.status,
          cnh: m.cnh,
          categoria_cnh: m.categoriaCnh,
          validade_cnh: m.validadeCnh,
          validade_mopp: m.validadeMopp,
          validade_toxico: m.validadeToxico,
          validade_aso: m.validadeAso || null,
          validade_nr20: m.validadeNr20 || null,
          validade_nr35: m.validadeNr35 || null,
          score_ecoconducao: m.scoreEcoconducao || 90,
          media_consumo_geral: m.mediaConsumoGeral || 2.65,
        }));
        await client.from('motoristas').upsert(payloadMotoristas, { onConflict: 'id' });
      }

      if (viagens.length > 0) {
        const payloadViagens = viagens.map((vi) => ({
          id: vi.id,
          codigo_viagem: vi.codigoViagem,
          cliente: vi.cliente,
          origem: vi.origem,
          destino: vi.destino,
          base_operacional: vi.baseOperacional,
          motorista: vi.motorista,
          placa_cavalo: vi.placaCavalo,
          placa_carreta: vi.placaCarreta || null,
          tipo_equipamento: vi.tipoEquipamento,
          classe_residuo: vi.classeResiduo,
          peso_toneladas: vi.pesoToneladas,
          distancia_km: vi.distanciaKm,
          data_saida_prevista: vi.dataSaidaPrevista,
          data_chegada_prevista: vi.dataChegadaPrevista,
          status: vi.status,
          numero_mtr: vi.numeroMTR || null,
          numero_cte: vi.numeroCTe || null,
          tipo_combustivel: vi.tipoCombustivel || 'Diesel S10',
          custo_total: vi.custoTotal || 0,
          observacoes: vi.observacoes || null,
        }));
        await client.from('viagens').upsert(payloadViagens, { onConflict: 'id' });
      }

      if (manutencoes.length > 0) {
        const payloadMan = manutencoes.map((mn) => ({
          id: mn.id,
          veiculo_placa: mn.veiculoPlaca,
          tipo: mn.tipo,
          descricao: mn.descricao,
          km_no_momento: mn.kmNoMomento,
          km_proxima_revisao: mn.kmProximaRevisao || null,
          data_entrada: mn.dataEntrada,
          data_previsao_saida: mn.dataPrevisaoSaida || null,
          data_conclusao: mn.dataConclusao || null,
          oficina: mn.oficina,
          custo_total: mn.custoTotal,
          status: mn.status,
          responsavel_aprovacao: mn.responsavelAprovacao,
        }));
        await client.from('manutencoes').upsert(payloadMan, { onConflict: 'id' });
      }

      if (pneus.length > 0) {
        const payloadPneus = pneus.map((pn) => ({
          id: pn.id,
          numero_fogo: pn.numeroFogo,
          numero_serie: pn.numeroSerie || null,
          marca: pn.marca,
          modelo: pn.modelo,
          medida: pn.medida,
          vida_atual: pn.vidaAtual,
          status: pn.status,
          veiculo_placa: pn.veiculoPlaca || null,
          posicao: pn.posicao || null,
          sulco_atual_mm: pn.sulcoAtualMm,
          sulco_original_mm: pn.sulcoOriginalMm,
          pressao_psi: pn.pressaoPsi || null,
          km_atual_pneu: pn.kmAtualPneu || 0,
          km_instalacao: pn.kmInstalacao || null,
          custo_aquisicao: pn.custoAquisicao || 0,
          custo_recapagens: pn.custoRecapagens || 0,
          data_aquisicao: pn.dataAquisicao,
          data_ultima_inspecao: pn.dataUltimaInspecao || null,
          observacoes: pn.observacoes || null,
        }));
        await client.from('pneus').upsert(payloadPneus, { onConflict: 'id' });
      }

      return {
        sucesso: true,
        mensagem: `Sincronização concluída! ${veiculos.length} veículos, ${motoristas.length} motoristas, ${viagens.length} viagens e ${pneus.length} pneus salvos com sucesso no Supabase.`,
      };
    } catch (err: any) {
      console.error('Erro no upload para Supabase:', err);
      return {
        sucesso: false,
        mensagem: err.message || 'Erro ao sincronizar com o Supabase. Execute o script da migration SQL primeiro.',
      };
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
  useEffect(() => { if (loaded) saveStoredPneus(pneus); }, [pneus, loaded]);

  // Atalho global do teclado Ctrl + K para abrir a Busca Inteligente
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsBuscaGlobalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auditoria Contínua SASSMAQ 360° (alertas críticos e vencimentos <= 30 dias)
  const sassmaqAlertasCount = useMemo(() => {
    const hoje = new Date();
    let count = 0;
    const calcularDiffDias = (dataStr?: string) => {
      if (!dataStr) return null;
      try {
        const parts = dataStr.split('-');
        if (parts.length !== 3) return null;
        const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return Math.ceil((dt.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      } catch {
        return null;
      }
    };

    // Motoristas
    motoristas.forEach((m) => {
      const dCnh = calcularDiffDias(m.validadeCnh);
      if (dCnh !== null && dCnh <= 30) count++;
      const dMopp = calcularDiffDias(m.validadeMopp);
      if (dMopp !== null && dMopp <= 30) count++;
      const dTox = calcularDiffDias(m.validadeToxico);
      if (dTox !== null && dTox <= 30) count++;
      const dAso = calcularDiffDias(m.validadeAso);
      if (dAso !== null && dAso <= 30) count++;
    });

    // Veículos
    veiculos.forEach((v) => {
      const dCiv = calcularDiffDias(v.validadeCiv);
      if (dCiv !== null && dCiv <= 30) count++;
      const dCipp = calcularDiffDias(v.validadeCipp);
      if (dCipp !== null && dCipp <= 30) count++;
      const dTaco = calcularDiffDias(v.validadeCronotacografo);
      if (dTaco !== null && dTaco <= 30) count++;
      const dLic = calcularDiffDias(v.validadeLicencaAmbiental);
      if (dLic !== null && dLic <= 30) count++;
      if (v.proximaRevisaoKm && v.odometroAtualKm && (v.proximaRevisaoKm - v.odometroAtualKm <= 2000)) {
        count++;
      }
    });

    return count;
  }, [motoristas, veiculos]);

  // Restaurar Backup Geral de Dados (.json)
  const handleRestaurarBackup = (backup: BackupDataStructure) => {
    if (!backup?.dados) return;
    const { dados } = backup;
    if (dados.veiculos) { setVeiculos(dados.veiculos); saveStoredVeiculos(dados.veiculos); }
    if (dados.motoristas) { setMotoristas(dados.motoristas); saveStoredMotoristas(dados.motoristas); }
    if (dados.viagens) { setViagens(dados.viagens); saveStoredViagens(dados.viagens); }
    if (dados.checklists) { setChecklists(dados.checklists); saveStoredChecklists(dados.checklists); }
    if (dados.manutencoes) { setManutencoes(dados.manutencoes); saveStoredManutencoes(dados.manutencoes); }
    if (dados.cotacoes) { setCotacoes(dados.cotacoes); saveStoredCotacoes(dados.cotacoes); }
    if (dados.medicoes) { setMedicoes(dados.medicoes); saveStoredMedicoes(dados.medicoes); }
    if (dados.abastecimentos) { setAbastecimentos(dados.abastecimentos); saveStoredAbastecimentos(dados.abastecimentos); }
    if (dados.mtrs) { setMtrs(dados.mtrs); saveStoredMTRs(dados.mtrs); }
    if (dados.licencas) { setLicencas(dados.licencas); saveStoredLicencas(dados.licencas); }
    if (dados.ocorrencias) { setOcorrencias(dados.ocorrencias); saveStoredOcorrencias(dados.ocorrencias); }
    if (dados.cdfs) { setCdfs(dados.cdfs); saveStoredCdfs(dados.cdfs); }
    if ((dados as any).pneus) { setPneus((dados as any).pneus); saveStoredPneus((dados as any).pneus); }
    if (dados.ctes) { setCtes(dados.ctes); saveStoredCtes(dados.ctes); }
    if (dados.mdfes) { setMdfes(dados.mdfes); saveStoredMdfes(dados.mdfes); }
    if (dados.empresaFiscal) { setEmpresaFiscal(dados.empresaFiscal); saveStoredEmpresaFiscal(dados.empresaFiscal); }
  };

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

    // Salvar viagem no Supabase se conectado
    const client = getSupabaseClient();
    if (client) {
      client.from('viagens').insert([{
        id: newTrip.id,
        codigo_viagem: newTrip.codigoViagem,
        cliente: newTrip.cliente,
        origem: newTrip.origem,
        destino: newTrip.destino,
        base_operacional: newTrip.baseOperacional,
        motorista: newTrip.motorista,
        placa_cavalo: newTrip.placaCavalo,
        placa_carreta: newTrip.placaCarreta || null,
        tipo_equipamento: newTrip.tipoEquipamento,
        classe_residuo: newTrip.classeResiduo,
        peso_toneladas: newTrip.pesoToneladas,
        distancia_km: newTrip.distanciaKm,
        data_saida_prevista: newTrip.dataSaidaPrevista,
        data_chegada_prevista: newTrip.dataChegadaPrevista,
        status: newTrip.status,
        numero_mtr: newTrip.numeroMTR || null,
        numero_cte: newTrip.numeroCTe || null,
        tipo_combustivel: newTrip.tipoCombustivel || 'Diesel S10',
        custo_total: newTrip.custoTotal || 0,
        observacoes: newTrip.observacoes || null,
      }]).then(() => {});
    }
  };

  const handleUpdateViagemStatus = (id: string, newStatus: StatusViagem) => {
    setViagens((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
    const client = getSupabaseClient();
    if (client) {
      client.from('viagens').update({ status: newStatus }).eq('id', id).then(() => {});
    }
  };

  const handleDeleteViagem = (id: string) => {
    if (confirm('Deseja excluir esta viagem?')) {
      setViagens((prev) => prev.filter((v) => v.id !== id));
      const client = getSupabaseClient();
      if (client) {
        client.from('viagens').delete().eq('id', id).then(() => {});
      }
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
        ano_modelo: veic.anoModelo || veic.ano,
        tipo_equipamento: veic.tipoEquipamento,
        tipo_propriedade: veic.tipoPropriedade,
        tipo_tracao: veic.tipoTracao,
        base_operacional: veic.baseOperacional,
        motorista_titular_nome: veic.motoristaTitularNome,
        odometro_atual_km: veic.odometroAtualKm,
        capacidade_carga_ton: veic.capacidadeCargaTon,
        status: veic.status,
        proxima_revisao_km: veic.proximaRevisaoKm,
        data_ultima_revisao: veic.dataUltimaRevisao || null,
        tipo_combustivel_padrao: veic.tipoCombustivelPadrao,
        is_sem_carreta: veic.isSemCarreta || false,
      }]).then(() => {});
    }
  };

  const handleUpdateVeiculoStatus = (id: string, status: StatusVeiculo) => {
    setVeiculos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
    const client = getSupabaseClient();
    if (client) {
      client.from('veiculos').update({ status }).eq('id', id).then(() => {});
    }
  };

  const handleUpdateVeiculo = (updatedVeic: Veiculo) => {
    setVeiculos((prev) =>
      prev.map((v) => (v.id === updatedVeic.id ? updatedVeic : v))
    );
    const client = getSupabaseClient();
    if (client) {
      client.from('veiculos').update({
        placa: updatedVeic.placa,
        modelo: updatedVeic.modelo,
        marca: updatedVeic.marca,
        ano: updatedVeic.ano,
        status: updatedVeic.status,
        odometro_atual_km: updatedVeic.odometroAtualKm,
        capacidade_carga_ton: updatedVeic.capacidadeCargaTon,
      }).eq('id', updatedVeic.id).then(() => {});
    }
  };

  const handleDeleteVeiculo = (id: string) => {
    setVeiculos((prev) => prev.filter((v) => v.id !== id));
    const client = getSupabaseClient();
    if (client) {
      client.from('veiculos').delete().eq('id', id).then(() => {});
    }
  };

  // Handlers: Pneus
  const handleAddPneu = (pneu: Pneu) => {
    setPneus((prev) => [pneu, ...prev]);
    const client = getSupabaseClient();
    if (client) {
      client.from('pneus').insert([{
        id: pneu.id,
        numero_fogo: pneu.numeroFogo,
        marca: pneu.marca,
        modelo: pneu.modelo,
        medida: pneu.medida,
        vida_atual: pneu.vidaAtual,
        status: pneu.status,
        veiculo_placa: pneu.veiculoPlaca || null,
        posicao: pneu.posicao || null,
        sulco_atual_mm: pneu.sulcoAtualMm,
        sulco_original_mm: pneu.sulcoOriginalMm,
        pressao_psi: pneu.pressaoPsi || null,
        km_atual_pneu: pneu.kmAtualPneu || 0,
        custo_aquisicao: pneu.custoAquisicao || 0,
        data_aquisicao: pneu.dataAquisicao,
      }]).then(() => {});
    }
  };

  const handleUpdatePneu = (updatedPneu: Pneu) => {
    setPneus((prev) =>
      prev.map((p) => (p.id === updatedPneu.id ? updatedPneu : p))
    );
    const client = getSupabaseClient();
    if (client) {
      client.from('pneus').update({
        status: updatedPneu.status,
        veiculo_placa: updatedPneu.veiculoPlaca || null,
        posicao: updatedPneu.posicao || null,
        sulco_atual_mm: updatedPneu.sulcoAtualMm,
        km_atual_pneu: updatedPneu.kmAtualPneu,
      }).eq('id', updatedPneu.id).then(() => {});
    }
  };

  const handleDeletePneu = (id: string) => {
    setPneus((prev) => prev.filter((p) => p.id !== id));
    const client = getSupabaseClient();
    if (client) {
      client.from('pneus').delete().eq('id', id).then(() => {});
    }
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
    const client = getSupabaseClient();
    if (client) {
      client.from('motoristas').update({ status }).eq('id', id).then(() => {});
    }
  };

  const handleUpdateMotorista = (updatedMot: Motorista) => {
    setMotoristas((prev) =>
      prev.map((m) => (m.id === updatedMot.id ? updatedMot : m))
    );
    const client = getSupabaseClient();
    if (client) {
      client.from('motoristas').update({
        nome: updatedMot.nome,
        cpf: updatedMot.cpf,
        status: updatedMot.status,
        cnh: updatedMot.cnh,
        categoria_cnh: updatedMot.categoriaCnh,
        validade_cnh: updatedMot.validadeCnh,
        validade_mopp: updatedMot.validadeMopp,
        validade_toxico: updatedMot.validadeToxico,
        veiculo_fixo_placa: updatedMot.veiculoFixoPlaca || null,
      }).eq('id', updatedMot.id).then(() => {});
    }
  };

  const handleDeleteMotorista = (id: string) => {
    setMotoristas((prev) => prev.filter((m) => m.id !== id));
    const client = getSupabaseClient();
    if (client) {
      client.from('motoristas').delete().eq('id', id).then(() => {});
    }
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

  // Helper para normalização e comparação segura de placas automotivas
  const normalizePlaca = (p?: string) => (p || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  const handleAddChecklist = (chk: ChecklistDiario) => {
    const chkPlacaNorm = normalizePlaca(chk.veiculoPlaca);

    setChecklists((prev) => {
      let updated = [chk, ...prev];

      // Se for Retorno à Base, encerra a jornada do checklist inicial de saída correspondente
      if (chk.tipoInspecao === 'Retorno à Base') {
        updated = updated.map((item) => {
          const matchJornadaId = chk.jornadaId && item.jornadaId === chk.jornadaId;
          const matchPlacaEEstado =
            normalizePlaca(item.veiculoPlaca) === chkPlacaNorm &&
            item.tipoInspecao === 'Saída para Viagem' &&
            item.statusJornada === 'Em Jornada';

          if (item.id !== chk.id && (matchJornadaId || matchPlacaEEstado)) {
            return {
              ...item,
              statusJornada: 'Jornada Concluída' as const,
              kmFinal: chk.kmFinal,
              kmPercorrido: chk.kmPercorrido,
              dataHoraRetorno: chk.dataHoraRetorno || chk.dataHora,
            };
          }
          return item;
        });
      }

      saveStoredChecklists(updated);
      return updated;
    });

    const novoKm = chk.kmFinal && chk.kmFinal > 0 ? chk.kmFinal : chk.kmInicial;
    let revisaoVencidaDetectada = false;
    let proximaRevMeta = 0;
    let veiculoAfetado: Veiculo | undefined;

    // Atualiza odômetro do veículo e libera o veículo na base caso seja encerramento/retorno
    setVeiculos((prev) => {
      const updated = prev.map((v) => {
        if (normalizePlaca(v.placa) === chkPlacaNorm) {
          veiculoAfetado = v;
          proximaRevMeta = v.proximaRevisaoKm;

          let newStatus = v.status;
          if (chk.resultado === 'Reprovado - Bloqueado') {
            newStatus = 'Em Manutenção';
          } else if (chk.tipoInspecao === 'Retorno à Base' || chk.kmFinal) {
            newStatus = 'Disponível'; // Veículo liberado na base para outro condutor ou próxima escala!
          } else if (chk.tipoInspecao === 'Saída para Viagem') {
            newStatus = 'Em Viagem'; // Veículo ocupado e em trânsito
          }

          const kmAtualizado = novoKm && novoKm > v.odometroAtualKm ? novoKm : v.odometroAtualKm;
          if (kmAtualizado >= v.proximaRevisaoKm) {
            revisaoVencidaDetectada = true;
          }

          const scoreSaude = kmAtualizado >= v.proximaRevisaoKm
            ? Math.min(v.scoreSaudeMecanica || 90, 55)
            : (v.scoreSaudeMecanica || 95);

          return {
            ...v,
            odometroAtualKm: kmAtualizado,
            status: newStatus,
            scoreSaudeMecanica: scoreSaude,
          };
        }
        return v;
      });

      saveStoredVeiculos(updated);
      return updated;
    });

    // Se a revisão preventiva venceu pelo KM percorrido na rota/checklist, gera ordem de manutenção preventiva automática
    if (revisaoVencidaDetectada && novoKm) {
      setManutencoes((prev) => {
        const jaExisteAberta = prev.some(
          (m) => normalizePlaca(m.veiculoPlaca) === chkPlacaNorm && m.status !== 'Concluída'
        );
        if (!jaExisteAberta) {
          const autoManut: Manutencao = {
            id: `man-auto-rev-${Date.now()}`,
            veiculoPlaca: chk.veiculoPlaca,
            tipo: 'Preventiva',
            descricao: `[REVISÃO PREVENTIVA OBRIGATÓRIA AUTOMÁTICA] Odômetro atingiu ${novoKm.toLocaleString('pt-BR')} km e superou a meta de revisão (${proximaRevMeta.toLocaleString('pt-BR')} km). Acionado no encerramento de rota/checklist para segurança mecânica da frota.`,
            kmNoMomento: novoKm,
            kmProximaRevisao: novoKm + 15000,
            dataEntrada: new Date().toISOString().slice(0, 10),
            dataPrevisaoSaida: new Date(Date.now() + 2 * 86400 * 1000).toISOString().slice(0, 10),
            oficina: 'Oficina Central Ambipar Paulínia',
            custoTotal: 2500,
            status: 'Agendada',
            responsavelAprovacao: 'Sistema Autônomo de Gestão de Frota & Segurança',
          };
          const updatedMan = [autoManut, ...prev];
          saveStoredManutencoes(updatedMan);
          return updatedMan;
        }
        return prev;
      });
    }

    // Se houver avarias críticas registradas, gera ocorrência operacional automática
    if (
      (chk.possuiAvarias && chk.severidadeAvaria?.includes('Crítica')) ||
      (chk.avariasRetornoDetectadas && chk.severidadeAvariaRetorno?.includes('Crítica'))
    ) {
      const novaOcorrencia: Ocorrencia = {
        id: `oco-chk-${Date.now()}`,
        viagemId: '',
        codigoViagem: `FROTA ${chk.veiculoPlaca}`,
        dataHora: chk.dataHora,
        tipo: 'Problema Mecânico',
        severidade: 'Crítica (Emergência)',
        descricao: `[AVARIA CRÍTICA NO CHECKLIST] Placa: ${chk.veiculoPlaca} | Condutor: ${chk.motoristaNome} | Relato: ${chk.descricaoAvarias || chk.descricaoAvariasRetorno}`,
        status: 'Aberta',
        responsavelTratativa: 'Oficina / Gestão de Frotas Ambipar',
      };
      setOcorrencias((prev) => {
        const updated = [novaOcorrencia, ...prev];
        saveStoredOcorrencias(updated);
        return updated;
      });
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

      if (novoKm) {
        client.from('veiculos')
          .update({ odometro_atual_km: novoKm })
          .ilike('placa', `%${chkPlacaNorm}%`)
          .then(() => {});
      }
    }
  };

  // Handlers: Abastecimentos com Atualização Automática de Odômetro
  const handleAddAbastecimento = (aba: Abastecimento) => {
    setAbastecimentos((prev) => {
      const updated = [aba, ...prev];
      saveStoredAbastecimentos(updated);
      return updated;
    });

    const abaPlacaNorm = normalizePlaca(aba.veiculoPlaca);
    let revisaoVencida = false;
    let proximaRevMeta = 0;

    // Atualiza odômetro do veículo
    setVeiculos((prev) => {
      const updated = prev.map((v) => {
        if (normalizePlaca(v.placa) === abaPlacaNorm && aba.odometroKm > v.odometroAtualKm) {
          proximaRevMeta = v.proximaRevisaoKm;
          if (aba.odometroKm >= v.proximaRevisaoKm) {
            revisaoVencida = true;
          }
          const scoreSaude = aba.odometroKm >= v.proximaRevisaoKm
            ? Math.min(v.scoreSaudeMecanica || 90, 55)
            : (v.scoreSaudeMecanica || 95);

          return { ...v, odometroAtualKm: aba.odometroKm, scoreSaudeMecanica: scoreSaude };
        }
        return v;
      });
      saveStoredVeiculos(updated);
      return updated;
    });

    if (revisaoVencida && aba.odometroKm) {
      setManutencoes((prev) => {
        const jaAberta = prev.some(
          (m) => normalizePlaca(m.veiculoPlaca) === abaPlacaNorm && m.status !== 'Concluída'
        );
        if (!jaAberta) {
          const autoManut: Manutencao = {
            id: `man-auto-aba-${Date.now()}`,
            veiculoPlaca: aba.veiculoPlaca,
            tipo: 'Preventiva',
            descricao: `[REVISÃO PREVENTIVA OBRIGATÓRIA] Odômetro atingiu ${aba.odometroKm.toLocaleString('pt-BR')} km no abastecimento (Meta: ${proximaRevMeta.toLocaleString('pt-BR')} km). Revisão preventiva gerada automaticamente.`,
            kmNoMomento: aba.odometroKm,
            kmProximaRevisao: aba.odometroKm + 15000,
            dataEntrada: new Date().toISOString().slice(0, 10),
            dataPrevisaoSaida: new Date(Date.now() + 2 * 86400 * 1000).toISOString().slice(0, 10),
            oficina: 'Oficina Central Ambipar',
            custoTotal: 2500,
            status: 'Agendada',
            responsavelAprovacao: 'Gestão de Frotas & Abastecimento',
          };
          const updatedMan = [autoManut, ...prev];
          saveStoredManutencoes(updatedMan);
          return updatedMan;
        }
        return prev;
      });
    }

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

      client.from('veiculos')
        .update({ odometro_atual_km: aba.odometroKm })
        .ilike('placa', `%${abaPlacaNorm}%`)
        .then(() => {});
    }
  };

  // Sincronização em massa de odômetros a partir de todos os checklists e abastecimentos
  const handleSincronizarOdometros = (): number => {
    let veiculosAtualizados = 0;
    const novosAgendamentos: Manutencao[] = [];

    setVeiculos((prev) => {
      const updated = prev.map((v) => {
        const vPlacaNorm = normalizePlaca(v.placa);
        let maiorKm = v.odometroAtualKm;

        // Checklists
        checklists.forEach((c) => {
          if (normalizePlaca(c.veiculoPlaca) === vPlacaNorm) {
            if (c.kmFinal && c.kmFinal > maiorKm) maiorKm = c.kmFinal;
            if (c.kmInicial && c.kmInicial > maiorKm) maiorKm = c.kmInicial;
          }
        });

        // Abastecimentos
        abastecimentos.forEach((a) => {
          if (normalizePlaca(a.veiculoPlaca) === vPlacaNorm) {
            if (a.odometroKm && a.odometroKm > maiorKm) maiorKm = a.odometroKm;
          }
        });

        if (maiorKm > v.odometroAtualKm) {
          veiculosAtualizados++;
          const scoreSaude = maiorKm >= v.proximaRevisaoKm
            ? Math.min(v.scoreSaudeMecanica || 90, 55)
            : (v.scoreSaudeMecanica || 95);

          if (maiorKm >= v.proximaRevisaoKm) {
            const jaAberta = manutencoes.some(
              (m) => normalizePlaca(m.veiculoPlaca) === vPlacaNorm && m.status !== 'Concluída'
            );
            if (!jaAberta) {
              novosAgendamentos.push({
                id: `man-auto-sync-${Date.now()}-${v.id}`,
                veiculoPlaca: v.placa,
                tipo: 'Preventiva',
                descricao: `[REVISÃO AUTOMÁTICA VIA SINCRONIZAÇÃO XD] Odômetro atualizado para ${maiorKm.toLocaleString('pt-BR')} km (Meta: ${v.proximaRevisaoKm.toLocaleString('pt-BR')} km). Revisão preventiva gerada por segurança operacional.`,
                kmNoMomento: maiorKm,
                kmProximaRevisao: maiorKm + 15000,
                dataEntrada: new Date().toISOString().slice(0, 10),
                dataPrevisaoSaida: new Date(Date.now() + 2 * 86400 * 1000).toISOString().slice(0, 10),
                oficina: 'Oficina Central Ambipar',
                custoTotal: 2500,
                status: 'Agendada',
                responsavelAprovacao: 'Sincronizador Automático de Rotas XD',
              });
            }
          }

          return {
            ...v,
            odometroAtualKm: maiorKm,
            scoreSaudeMecanica: scoreSaude,
          };
        }
        return v;
      });

      saveStoredVeiculos(updated);
      return updated;
    });

    if (novosAgendamentos.length > 0) {
      setManutencoes((prev) => {
        const updated = [...novosAgendamentos, ...prev];
        saveStoredManutencoes(updated);
        return updated;
      });
    }

    return veiculosAtualizados;
  };

  // Ajuste rápido e individual de odômetro pelo analista
  const handleAtualizarKmManual = (veiculoId: string, novoKm: number, observacao?: string) => {
    let revisaoVencida = false;
    let veicRef: Veiculo | undefined;

    setVeiculos((prev) => {
      const updated = prev.map((v) => {
        if (v.id === veiculoId) {
          veicRef = v;
          if (novoKm >= v.proximaRevisaoKm) {
            revisaoVencida = true;
          }
          const scoreSaude = novoKm >= v.proximaRevisaoKm
            ? Math.min(v.scoreSaudeMecanica || 90, 55)
            : (v.scoreSaudeMecanica || 95);

          return {
            ...v,
            odometroAtualKm: novoKm,
            scoreSaudeMecanica: scoreSaude,
          };
        }
        return v;
      });
      saveStoredVeiculos(updated);
      return updated;
    });

    if (revisaoVencida && veicRef) {
      const vPlacaNorm = normalizePlaca(veicRef.placa);
      setManutencoes((prev) => {
        const jaAberta = prev.some(
          (m) => normalizePlaca(m.veiculoPlaca) === vPlacaNorm && m.status !== 'Concluída'
        );
        if (!jaAberta) {
          const autoManut: Manutencao = {
            id: `man-auto-manual-${Date.now()}`,
            veiculoPlaca: veicRef!.placa,
            tipo: 'Preventiva',
            descricao: `[REVISÃO PREVENTIVA OBRIGATÓRIA] Odômetro atualizado manualmente para ${novoKm.toLocaleString('pt-BR')} km (Meta: ${veicRef!.proximaRevisaoKm.toLocaleString('pt-BR')} km). Obs: ${observacao || 'Ajuste operacional de odômetro'}`,
            kmNoMomento: novoKm,
            kmProximaRevisao: novoKm + 15000,
            dataEntrada: new Date().toISOString().slice(0, 10),
            dataPrevisaoSaida: new Date(Date.now() + 2 * 86400 * 1000).toISOString().slice(0, 10),
            oficina: 'Oficina Central Ambipar',
            custoTotal: 2500,
            status: 'Agendada',
            responsavelAprovacao: 'Gestão de Frotas Ambipar',
          };
          const updated = [autoManut, ...prev];
          saveStoredManutencoes(updated);
          return updated;
        }
        return prev;
      });
    }

    const client = getSupabaseClient();
    if (client && veicRef) {
      client.from('veiculos').update({ odometro_atual_km: novoKm }).eq('id', veiculoId).then(() => {});
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

  if (isPortalMotorista) {
    return (
      <PortalMotoristaChecklist
        veiculos={veiculos}
        motoristas={motoristas}
        checklists={checklists}
        onAddChecklist={handleAddChecklist}
      />
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col font-sans overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onRefresh={handleRefresh}
        ocorrenciasCount={ocorrenciasAbertasCount}
        sassmaqAlertasCount={sassmaqAlertasCount}
        isSupabaseConnected={isSupabaseConnected}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenPortalMotorista={() => {
          if (typeof window !== 'undefined') {
            window.open(`${window.location.origin}/?portal=motorista`, '_blank');
          } else {
            setIsPortalMotorista(true);
          }
        }}
        onOpenQrCodeModal={() => {
          setQrCodePlacaSelecionada(undefined);
          setIsQrCodeModalOpen(true);
        }}
        onOpenRadarSassmaq={() => setIsRadarSassmaqOpen(true)}
        onOpenBuscaGlobal={() => setIsBuscaGlobalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenManualPopModal={() => setIsManualPopModalOpen(true)}
        onOpenTorreTv={() => setIsTorreTvOpen(true)}
        onOpenPassagemPlantao={() => setIsPassagemPlantaoOpen(true)}
        onOpenEstadias={() => setIsEstadiasOpen(true)}
        onOpenIncompatibilidade={() => setIsIncompatibilidadeOpen(true)}
        onOpenPaeEmergencia={() => setIsPaeEmergenciaOpen(true)}
        onOpenPedagioPpd={() => setIsPedagioPpdOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
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
          onOpenEstadias={() => setIsEstadiasOpen(true)}
          onOpenIncompatibilidade={() => setIsIncompatibilidadeOpen(true)}
          onOpenPaeEmergencia={() => setIsPaeEmergenciaOpen(true)}
          onOpenPedagioPpd={() => setIsPedagioPpdOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 h-full overflow-y-auto p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              viagens={viagens}
              mtrs={mtrs}
              ocorrencias={ocorrencias}
              veiculos={veiculos}
              motoristas={motoristas}
              onNavigateToTab={setActiveTab}
              onOpenQrCode={() => {
                setQrCodePlacaSelecionada(undefined);
                setIsQrCodeModalOpen(true);
              }}
              onOpenTorreTv={() => setIsTorreTvOpen(true)}
              onCarregarDemo={() => handleRestaurarBackup(CENARIO_DEMO_AMBIPAR)}
              onOpenBackup={() => setIsBackupModalOpen(true)}
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
              checklists={checklists}
              abastecimentos={abastecimentos}
              onAddVeiculo={handleAddVeiculo}
              onUpdateVeiculo={handleUpdateVeiculo}
              onDeleteVeiculo={handleDeleteVeiculo}
              onUpdateVeiculoStatus={handleUpdateVeiculoStatus}
              onSincronizarOdometros={handleSincronizarOdometros}
              onAtualizarKmManual={handleAtualizarKmManual}
              onNavigateToTab={setActiveTab}
              onOpenQrCode={(placa) => {
                setQrCodePlacaSelecionada(placa);
                setIsQrCodeModalOpen(true);
              }}
            />
          )}

          {activeTab === 'pneus' && (
            <PneusView
              pneus={pneus}
              veiculos={veiculos}
              onAddPneu={handleAddPneu}
              onUpdatePneu={handleUpdatePneu}
              onDeletePneu={handleDeletePneu}
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
              viagens={viagens}
              manutencoes={manutencoes}
              onAddChecklist={handleAddChecklist}
              onNavigateToTab={setActiveTab}
              onSincronizarOdometros={handleSincronizarOdometros}
              onAtualizarKmManual={handleAtualizarKmManual}
              onOpenPortalMotorista={() => {
                if (typeof window !== 'undefined') {
                  window.open(`${window.location.origin}/?portal=motorista`, '_blank');
                } else {
                  setIsPortalMotorista(true);
                }
              }}
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
        onConnectionChange={(connected) => {
          setIsSupabaseConnected(connected);
          if (connected) {
            syncWithSupabase();
          }
        }}
        onUploadCompletoSupabase={handleUploadCompletoSupabase}
        onSyncFromSupabase={syncWithSupabase}
      />

      {/* Modal Operacional de QR Code dos Caminhões (Adesivo de Cabine) */}
      <ModalQrCodeChecklist
        isOpen={isQrCodeModalOpen}
        onClose={() => setIsQrCodeModalOpen(false)}
        veiculos={veiculos}
        motoristas={motoristas}
        placaInicial={qrCodePlacaSelecionada}
        onNavigateToCadastroVeiculo={() => {
          setIsQrCodeModalOpen(false);
          setActiveTab('frota');
        }}
      />

      {/* Modal Radar SASSMAQ 360° (Auditoria de Validades e Conformidade) */}
      <ModalRadarSassmaq
        isOpen={isRadarSassmaqOpen}
        onClose={() => setIsRadarSassmaqOpen(false)}
        veiculos={veiculos}
        motoristas={motoristas}
        onNavigateToTab={setActiveTab}
      />

      {/* Modal de Busca Global Inteligente (Command Palette Ctrl + K) */}
      <ModalBuscaGlobal
        isOpen={isBuscaGlobalOpen}
        onClose={() => setIsBuscaGlobalOpen(false)}
        onNavigateToTab={setActiveTab}
        onOpenQrCode={(placa) => {
          setQrCodePlacaSelecionada(placa);
          setIsQrCodeModalOpen(true);
        }}
        onOpenRadarSassmaq={() => setIsRadarSassmaqOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenManualPopModal={() => setIsManualPopModalOpen(true)}
        veiculos={veiculos}
        motoristas={motoristas}
        viagens={viagens}
        mtrs={mtrs}
        cdfs={cdfs}
        ctes={ctes}
      />

      {/* Modal de Backup & Restauração de Dados JSON */}
      <ModalBackupDados
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        veiculos={veiculos}
        motoristas={motoristas}
        viagens={viagens}
        checklists={checklists}
        manutencoes={manutencoes}
        cotacoes={cotacoes}
        medicoes={medicoes}
        abastecimentos={abastecimentos}
        mtrs={mtrs}
        licencas={licencas}
        ocorrencias={ocorrencias}
        cdfs={cdfs}
        ctes={ctes}
        mdfes={mdfes}
        pneus={pneus}
        empresaFiscal={empresaFiscal}
        onRestaurarBackup={handleRestaurarBackup}
      />

      {/* Modal Manual Operacional POP Ambipar */}
      <ModalManualPopAmbipar
        isOpen={isManualPopModalOpen}
        onClose={() => setIsManualPopModalOpen(false)}
      />

      {/* Modal Torre TV (Painel Telão CCO / Fullscreen) */}
      <ModalTorreTv
        isOpen={isTorreTvOpen}
        onClose={() => setIsTorreTvOpen(false)}
        veiculos={veiculos}
        motoristas={motoristas}
        viagens={viagens}
        checklists={checklists}
        manutencoes={manutencoes}
        mtrs={mtrs}
        ocorrencias={ocorrencias}
      />

      {/* Modal Passagem de Plantão & Fechamento de Turno */}
      <ModalPassagemPlantao
        isOpen={isPassagemPlantaoOpen}
        onClose={() => setIsPassagemPlantaoOpen(false)}
        viagens={viagens}
        veiculos={veiculos}
        motoristas={motoristas}
        manutencoes={manutencoes}
        ocorrencias={ocorrencias}
        mtrs={mtrs}
      />

      {/* Modal Gestão de Estadias ANTT (Lei 11.442) */}
      <ModalGestaoEstadias
        isOpen={isEstadiasOpen}
        onClose={() => setIsEstadiasOpen(false)}
        viagens={viagens}
      />

      {/* Modal Matriz de Incompatibilidade Química NBR 14619 */}
      <ModalIncompatibilidadeQuimica
        isOpen={isIncompatibilidadeOpen}
        onClose={() => setIsIncompatibilidadeOpen(false)}
      />

      {/* Modal Plano de Atendimento a Emergências (PAE 24h Ambipar Response) */}
      <ModalPaeEmergencia
        isOpen={isPaeEmergenciaOpen}
        onClose={() => setIsPaeEmergenciaOpen(false)}
        viagens={viagens}
      />

      {/* Modal Calculador de Pedágios por Eixos & PPDs (Lei 13.103) */}
      <ModalPedagioPpd
        isOpen={isPedagioPpdOpen}
        onClose={() => setIsPedagioPpdOpen(false)}
      />
    </div>
  );
};

export default App;
