import { Viagem, DocumentoAmbiental, LicencaVeiculo, Ocorrencia } from '../types';
import { INITIAL_VIAGENS, INITIAL_MTRS, INITIAL_LICENCAS, INITIAL_OCORRENCIAS } from '../data/mockData';

const KEYS = {
  VIAGENS: 'ambipar_logistica_viagens_v1',
  MTRS: 'ambipar_logistica_mtrs_v1',
  LICENCAS: 'ambipar_logistica_licencas_v1',
  OCORRENCIAS: 'ambipar_logistica_ocorrencias_v1',
};

export const getStoredViagens = (): Viagem[] => {
  const data = localStorage.getItem(KEYS.VIAGENS);
  if (!data) {
    localStorage.setItem(KEYS.VIAGENS, JSON.stringify(INITIAL_VIAGENS));
    return INITIAL_VIAGENS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_VIAGENS;
  }
};

export const saveStoredViagens = (viagens: Viagem[]) => {
  localStorage.setItem(KEYS.VIAGENS, JSON.stringify(viagens));
};

export const getStoredMTRs = (): DocumentoAmbiental[] => {
  const data = localStorage.getItem(KEYS.MTRS);
  if (!data) {
    localStorage.setItem(KEYS.MTRS, JSON.stringify(INITIAL_MTRS));
    return INITIAL_MTRS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MTRS;
  }
};

export const saveStoredMTRs = (mtrs: DocumentoAmbiental[]) => {
  localStorage.setItem(KEYS.MTRS, JSON.stringify(mtrs));
};

export const getStoredLicencas = (): LicencaVeiculo[] => {
  const data = localStorage.getItem(KEYS.LICENCAS);
  if (!data) {
    localStorage.setItem(KEYS.LICENCAS, JSON.stringify(INITIAL_LICENCAS));
    return INITIAL_LICENCAS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_LICENCAS;
  }
};

export const saveStoredLicencas = (licencas: LicencaVeiculo[]) => {
  localStorage.setItem(KEYS.LICENCAS, JSON.stringify(licencas));
};

export const getStoredOcorrencias = (): Ocorrencia[] => {
  const data = localStorage.getItem(KEYS.OCORRENCIAS);
  if (!data) {
    localStorage.setItem(KEYS.OCORRENCIAS, JSON.stringify(INITIAL_OCORRENCIAS));
    return INITIAL_OCORRENCIAS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_OCORRENCIAS;
  }
};

export const saveStoredOcorrencias = (ocorrencias: Ocorrencia[]) => {
  localStorage.setItem(KEYS.OCORRENCIAS, JSON.stringify(ocorrencias));
};

export const resetAllData = () => {
  localStorage.removeItem(KEYS.VIAGENS);
  localStorage.removeItem(KEYS.MTRS);
  localStorage.removeItem(KEYS.LICENCAS);
  localStorage.removeItem(KEYS.OCORRENCIAS);
};
