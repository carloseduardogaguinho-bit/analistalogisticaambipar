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
  Pneu,
} from '../types';
import { INITIAL_EMPRESA_FISCAL } from '../data/fiscalData';

const KEYS = {
  VIAGENS: 'ambipar_logistica_viagens_v3',
  MTRS: 'ambipar_logistica_mtrs_v3',
  LICENCAS: 'ambipar_logistica_licencas_v3',
  OCORRENCIAS: 'ambipar_logistica_ocorrencias_v3',
  VEICULOS: 'ambipar_logistica_veiculos_v3',
  MOTORISTAS: 'ambipar_logistica_motoristas_v3',
  MANUTENCOES: 'ambipar_logistica_manutencoes_v3',
  CHECKLISTS: 'ambipar_logistica_checklists_v3',
  ABASTECIMENTOS: 'ambipar_logistica_abastecimentos_v3',
  CTES: 'ambipar_logistica_ctes_v3',
  MDFES: 'ambipar_logistica_mdfes_v3',
  EMPRESA_FISCAL: 'ambipar_logistica_empresa_fiscal_v3',
  MEDICOES: 'ambipar_logistica_medicoes_v3',
  COTACOES: 'ambipar_logistica_cotacoes_v3',
  CDFS: 'ambipar_logistica_cdfs_v3',
  PNEUS: 'ambipar_logistica_pneus_v3',
};

// Limpa automaticamente qualquer dado demo ou resíduo de versões anteriores (v1 e v2)
try {
  const legacyKeys = [
    'ambipar_logistica_viagens_v1',
    'ambipar_logistica_viagens_v2',
    'ambipar_logistica_mtrs_v1',
    'ambipar_logistica_mtrs_v2',
    'ambipar_logistica_licencas_v1',
    'ambipar_logistica_licencas_v2',
    'ambipar_logistica_ocorrencias_v1',
    'ambipar_logistica_ocorrencias_v2',
    'ambipar_logistica_veiculos_v1',
    'ambipar_logistica_veiculos_v2',
    'ambipar_logistica_motoristas_v1',
    'ambipar_logistica_motoristas_v2',
    'ambipar_logistica_manutencoes_v1',
    'ambipar_logistica_manutencoes_v2',
    'ambipar_logistica_checklists_v1',
    'ambipar_logistica_checklists_v2',
    'ambipar_logistica_abastecimentos_v1',
    'ambipar_logistica_abastecimentos_v2',
    'ambipar_logistica_ctes_v1',
    'ambipar_logistica_ctes_v2',
    'ambipar_logistica_mdfes_v1',
    'ambipar_logistica_mdfes_v2',
    'ambipar_logistica_empresa_fiscal_v1',
    'ambipar_logistica_empresa_fiscal_v2',
    'ambipar_logistica_medicoes_v1',
    'ambipar_logistica_medicoes_v2',
    'ambipar_logistica_cotacoes_v1',
    'ambipar_logistica_cotacoes_v2',
    'ambipar_logistica_cdfs_v1',
    'ambipar_logistica_cdfs_v2',
  ];
  legacyKeys.forEach((key) => localStorage.removeItem(key));
} catch {
  // Ignora se localStorage não estiver disponível
}

export const clearAllStoredData = () => {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  window.location.reload();
};

// Viagens (Inicia 100% limpo)
export const getStoredViagens = (): Viagem[] => {
  const data = localStorage.getItem(KEYS.VIAGENS);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredViagens = (data: Viagem[]) => localStorage.setItem(KEYS.VIAGENS, JSON.stringify(data));

// MTRs (Inicia 100% limpo)
export const getStoredMTRs = (): DocumentoAmbiental[] => {
  const data = localStorage.getItem(KEYS.MTRS);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredMTRs = (data: DocumentoAmbiental[]) => localStorage.setItem(KEYS.MTRS, JSON.stringify(data));

// Licencas (Inicia 100% limpo)
export const getStoredLicencas = (): LicencaVeiculo[] => {
  const data = localStorage.getItem(KEYS.LICENCAS);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredLicencas = (data: LicencaVeiculo[]) => localStorage.setItem(KEYS.LICENCAS, JSON.stringify(data));

// Ocorrencias (Inicia 100% limpo)
export const getStoredOcorrencias = (): Ocorrencia[] => {
  const data = localStorage.getItem(KEYS.OCORRENCIAS);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredOcorrencias = (data: Ocorrencia[]) => localStorage.setItem(KEYS.OCORRENCIAS, JSON.stringify(data));

// Veiculos da Frota (Inicia 100% limpo)
export const getStoredVeiculos = (): Veiculo[] => {
  const data = localStorage.getItem(KEYS.VEICULOS);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredVeiculos = (data: Veiculo[]) => localStorage.setItem(KEYS.VEICULOS, JSON.stringify(data));

// Motoristas e Tripulantes (Inicia 100% limpo)
export const getStoredMotoristas = (): Motorista[] => {
  const data = localStorage.getItem(KEYS.MOTORISTAS);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredMotoristas = (data: Motorista[]) => localStorage.setItem(KEYS.MOTORISTAS, JSON.stringify(data));

// Manutencoes (Inicia 100% limpo)
export const getStoredManutencoes = (): Manutencao[] => {
  const data = localStorage.getItem(KEYS.MANUTENCOES);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredManutencoes = (data: Manutencao[]) => localStorage.setItem(KEYS.MANUTENCOES, JSON.stringify(data));

// Checklists Diarios (Inicia 100% limpo)
export const getStoredChecklists = (): ChecklistDiario[] => {
  const data = localStorage.getItem(KEYS.CHECKLISTS);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredChecklists = (data: ChecklistDiario[]) => localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(data));

// Abastecimentos (Inicia 100% limpo)
export const getStoredAbastecimentos = (): Abastecimento[] => {
  const data = localStorage.getItem(KEYS.ABASTECIMENTOS);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredAbastecimentos = (data: Abastecimento[]) => localStorage.setItem(KEYS.ABASTECIMENTOS, JSON.stringify(data));

// CT-es (Inicia 100% limpo)
export const getStoredCtes = (): CteDocumento[] => {
  const data = localStorage.getItem(KEYS.CTES);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredCtes = (data: CteDocumento[]) => localStorage.setItem(KEYS.CTES, JSON.stringify(data));

// MDF-es (Inicia 100% limpo)
export const getStoredMdfes = (): MdfeDocumento[] => {
  const data = localStorage.getItem(KEYS.MDFES);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
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

// Medições de Clientes e Fornecedores (Inicia 100% limpo)
export const getStoredMedicoes = (): MedicaoContrato[] => {
  const data = localStorage.getItem(KEYS.MEDICOES);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredMedicoes = (data: MedicaoContrato[]) => localStorage.setItem(KEYS.MEDICOES, JSON.stringify(data));

// Cotações de Oficinas (Inicia 100% limpo)
export const getStoredCotacoes = (): CotacaoManutencao[] => {
  const data = localStorage.getItem(KEYS.COTACOES);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredCotacoes = (data: CotacaoManutencao[]) => localStorage.setItem(KEYS.COTACOES, JSON.stringify(data));

// Certificados de Destinação Final (CDF) (Inicia 100% limpo)
export const getStoredCdfs = (): CertificadoDestinacaoFinalCDF[] => {
  const data = localStorage.getItem(KEYS.CDFS);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredCdfs = (data: CertificadoDestinacaoFinalCDF[]) => localStorage.setItem(KEYS.CDFS, JSON.stringify(data));

// Gestão de Pneus & CPK (Inicia 100% limpo)
export const getStoredPneus = (): Pneu[] => {
  const data = localStorage.getItem(KEYS.PNEUS);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};
export const saveStoredPneus = (data: Pneu[]) => localStorage.setItem(KEYS.PNEUS, JSON.stringify(data));

