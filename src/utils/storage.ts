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
  CteDocumento,
  MdfeDocumento,
  EmpresaFiscalConfig,
  MedicaoContrato,
  CotacaoManutencao,
  CertificadoDestinacaoFinalCDF,
} from '../types';
import {
  INITIAL_VIAGENS,
  INITIAL_MTRS,
  INITIAL_LICENCAS,
  INITIAL_OCORRENCIAS,
  INITIAL_VEICULOS,
  INITIAL_MOTORISTAS,
  INITIAL_MANUTENCOES,
  INITIAL_CHECKLISTS,
  INITIAL_ABASTECIMENTOS,
  INITIAL_CDFS,
} from '../data/mockData';
import {
  INITIAL_CTES,
  INITIAL_MDFES,
  INITIAL_EMPRESA_FISCAL,
} from '../data/fiscalData';

const KEYS = {
  VIAGENS: 'ambipar_logistica_viagens_v2',
  MTRS: 'ambipar_logistica_mtrs_v2',
  LICENCAS: 'ambipar_logistica_licencas_v2',
  OCORRENCIAS: 'ambipar_logistica_ocorrencias_v2',
  VEICULOS: 'ambipar_logistica_veiculos_v2',
  MOTORISTAS: 'ambipar_logistica_motoristas_v2',
  MANUTENCOES: 'ambipar_logistica_manutencoes_v2',
  CHECKLISTS: 'ambipar_logistica_checklists_v2',
  ABASTECIMENTOS: 'ambipar_logistica_abastecimentos_v2',
  CTES: 'ambipar_logistica_ctes_v2',
  MDFES: 'ambipar_logistica_mdfes_v2',
  EMPRESA_FISCAL: 'ambipar_logistica_empresa_fiscal_v2',
  MEDICOES: 'ambipar_logistica_medicoes_v2',
  COTACOES: 'ambipar_logistica_cotacoes_v2',
  CDFS: 'ambipar_logistica_cdfs_v2',
};

// Limpa automaticamente dados de versões anteriores com dados fictícios
try {
  const legacyKeys = [
    'ambipar_logistica_viagens_v1',
    'ambipar_logistica_mtrs_v1',
    'ambipar_logistica_licencas_v1',
    'ambipar_logistica_ocorrencias_v1',
    'ambipar_logistica_veiculos_v1',
    'ambipar_logistica_motoristas_v1',
    'ambipar_logistica_manutencoes_v1',
    'ambipar_logistica_checklists_v1',
    'ambipar_logistica_abastecimentos_v1',
    'ambipar_logistica_ctes_v1',
    'ambipar_logistica_mdfes_v1',
    'ambipar_logistica_empresa_fiscal_v1',
  ];
  legacyKeys.forEach((key) => localStorage.removeItem(key));
} catch {
  // Ignora se localStorage não estiver disponível
}

export const clearAllStoredData = () => {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  window.location.reload();
};

// Viagens
export const getStoredViagens = (): Viagem[] => {
  const data = localStorage.getItem(KEYS.VIAGENS);
  if (!data) {
    localStorage.setItem(KEYS.VIAGENS, JSON.stringify(INITIAL_VIAGENS));
    return INITIAL_VIAGENS;
  }
  try { return JSON.parse(data); } catch { return INITIAL_VIAGENS; }
};
export const saveStoredViagens = (data: Viagem[]) => localStorage.setItem(KEYS.VIAGENS, JSON.stringify(data));

// MTRs
export const getStoredMTRs = (): DocumentoAmbiental[] => {
  const data = localStorage.getItem(KEYS.MTRS);
  if (!data) {
    localStorage.setItem(KEYS.MTRS, JSON.stringify(INITIAL_MTRS));
    return INITIAL_MTRS;
  }
  try { return JSON.parse(data); } catch { return INITIAL_MTRS; }
};
export const saveStoredMTRs = (data: DocumentoAmbiental[]) => localStorage.setItem(KEYS.MTRS, JSON.stringify(data));

// Licencas
export const getStoredLicencas = (): LicencaVeiculo[] => {
  const data = localStorage.getItem(KEYS.LICENCAS);
  if (!data) {
    localStorage.setItem(KEYS.LICENCAS, JSON.stringify(INITIAL_LICENCAS));
    return INITIAL_LICENCAS;
  }
  try { return JSON.parse(data); } catch { return INITIAL_LICENCAS; }
};
export const saveStoredLicencas = (data: LicencaVeiculo[]) => localStorage.setItem(KEYS.LICENCAS, JSON.stringify(data));

// Ocorrencias
export const getStoredOcorrencias = (): Ocorrencia[] => {
  const data = localStorage.getItem(KEYS.OCORRENCIAS);
  if (!data) {
    localStorage.setItem(KEYS.OCORRENCIAS, JSON.stringify(INITIAL_OCORRENCIAS));
    return INITIAL_OCORRENCIAS;
  }
  try { return JSON.parse(data); } catch { return INITIAL_OCORRENCIAS; }
};
export const saveStoredOcorrencias = (data: Ocorrencia[]) => localStorage.setItem(KEYS.OCORRENCIAS, JSON.stringify(data));

// Veiculos
export const getStoredVeiculos = (): Veiculo[] => {
  const data = localStorage.getItem(KEYS.VEICULOS);
  if (!data) {
    localStorage.setItem(KEYS.VEICULOS, JSON.stringify(INITIAL_VEICULOS));
    return INITIAL_VEICULOS;
  }
  try { return JSON.parse(data); } catch { return INITIAL_VEICULOS; }
};
export const saveStoredVeiculos = (data: Veiculo[]) => localStorage.setItem(KEYS.VEICULOS, JSON.stringify(data));

// Motoristas
export const getStoredMotoristas = (): Motorista[] => {
  const data = localStorage.getItem(KEYS.MOTORISTAS);
  if (!data) {
    localStorage.setItem(KEYS.MOTORISTAS, JSON.stringify(INITIAL_MOTORISTAS));
    return INITIAL_MOTORISTAS;
  }
  try { return JSON.parse(data); } catch { return INITIAL_MOTORISTAS; }
};
export const saveStoredMotoristas = (data: Motorista[]) => localStorage.setItem(KEYS.MOTORISTAS, JSON.stringify(data));

// Manutencoes
export const getStoredManutencoes = (): Manutencao[] => {
  const data = localStorage.getItem(KEYS.MANUTENCOES);
  if (!data) {
    localStorage.setItem(KEYS.MANUTENCOES, JSON.stringify(INITIAL_MANUTENCOES));
    return INITIAL_MANUTENCOES;
  }
  try { return JSON.parse(data); } catch { return INITIAL_MANUTENCOES; }
};
export const saveStoredManutencoes = (data: Manutencao[]) => localStorage.setItem(KEYS.MANUTENCOES, JSON.stringify(data));

// Checklists
export const getStoredChecklists = (): ChecklistDiario[] => {
  const data = localStorage.getItem(KEYS.CHECKLISTS);
  if (!data) {
    localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(INITIAL_CHECKLISTS));
    return INITIAL_CHECKLISTS;
  }
  try { return JSON.parse(data); } catch { return INITIAL_CHECKLISTS; }
};
export const saveStoredChecklists = (data: ChecklistDiario[]) => localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(data));

// Abastecimentos
export const getStoredAbastecimentos = (): Abastecimento[] => {
  const data = localStorage.getItem(KEYS.ABASTECIMENTOS);
  if (!data) {
    localStorage.setItem(KEYS.ABASTECIMENTOS, JSON.stringify(INITIAL_ABASTECIMENTOS));
    return INITIAL_ABASTECIMENTOS;
  }
  try { return JSON.parse(data); } catch { return INITIAL_ABASTECIMENTOS; }
};
export const saveStoredAbastecimentos = (data: Abastecimento[]) => localStorage.setItem(KEYS.ABASTECIMENTOS, JSON.stringify(data));

// CT-es
export const getStoredCtes = (): CteDocumento[] => {
  const data = localStorage.getItem(KEYS.CTES);
  if (!data) {
    localStorage.setItem(KEYS.CTES, JSON.stringify(INITIAL_CTES));
    return INITIAL_CTES;
  }
  try { return JSON.parse(data); } catch { return INITIAL_CTES; }
};
export const saveStoredCtes = (data: CteDocumento[]) => localStorage.setItem(KEYS.CTES, JSON.stringify(data));

// MDF-es
export const getStoredMdfes = (): MdfeDocumento[] => {
  const data = localStorage.getItem(KEYS.MDFES);
  if (!data) {
    localStorage.setItem(KEYS.MDFES, JSON.stringify(INITIAL_MDFES));
    return INITIAL_MDFES;
  }
  try { return JSON.parse(data); } catch { return INITIAL_MDFES; }
};
export const saveStoredMdfes = (data: MdfeDocumento[]) => localStorage.setItem(KEYS.MDFES, JSON.stringify(data));

// Empresa Fiscal Config
export const getStoredEmpresaFiscal = (): EmpresaFiscalConfig => {
  const data = localStorage.getItem(KEYS.EMPRESA_FISCAL);
  if (!data) {
    localStorage.setItem(KEYS.EMPRESA_FISCAL, JSON.stringify(INITIAL_EMPRESA_FISCAL));
    return INITIAL_EMPRESA_FISCAL;
  }
  try { return JSON.parse(data); } catch { return INITIAL_EMPRESA_FISCAL; }
};
export const saveStoredEmpresaFiscal = (data: EmpresaFiscalConfig) => localStorage.setItem(KEYS.EMPRESA_FISCAL, JSON.stringify(data));

// Medições de Clientes e Fornecedores
export const getStoredMedicoes = (): MedicaoContrato[] => {
  const data = localStorage.getItem(KEYS.MEDICOES);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredMedicoes = (data: MedicaoContrato[]) => localStorage.setItem(KEYS.MEDICOES, JSON.stringify(data));

// Cotações de Oficinas
export const getStoredCotacoes = (): CotacaoManutencao[] => {
  const data = localStorage.getItem(KEYS.COTACOES);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredCotacoes = (data: CotacaoManutencao[]) => localStorage.setItem(KEYS.COTACOES, JSON.stringify(data));

// Certificados de Destinação Final (CDF)
export const getStoredCdfs = (): CertificadoDestinacaoFinalCDF[] => {
  const data = localStorage.getItem(KEYS.CDFS);
  if (!data) {
    localStorage.setItem(KEYS.CDFS, JSON.stringify(INITIAL_CDFS));
    return INITIAL_CDFS;
  }
  try { return JSON.parse(data); } catch { return INITIAL_CDFS; }
};
export const saveStoredCdfs = (data: CertificadoDestinacaoFinalCDF[]) => localStorage.setItem(KEYS.CDFS, JSON.stringify(data));
