import { CteDocumento, MdfeDocumento, EmpresaFiscalConfig } from '../types';

export const INITIAL_EMPRESA_FISCAL: EmpresaFiscalConfig = {
  razaoSocial: 'AMBIPAR LOGISTICS & ENVIRONMENTAL SERVICES S.A.',
  nomeFantasia: 'AMBIPAR LOGISTICS',
  cnpj: '12.648.266/0001-24',
  inscricaoEstadual: '535.190.281.110',
  rntrc: '48920194',
  logradouro: 'Rodovia Anhanguera, Km 118 - Bloco B',
  numero: 'S/N',
  bairro: 'Distrito Industrial',
  municipio: 'Nova Odessa',
  uf: 'SP',
  cep: '13380-000',
  telefone: '(19) 3466-9900',
  emailFiscal: 'fiscal.logistica@ambipar.com',
  ambienteSefaz: 'Homologação (Testes)',
  certificadoNome: 'A1_DIGITAL_AMBIPAR.pfx',
  certificadoValidade: '2027-12-31',
  certificadoStatus: 'Válido',
  provedorConexao: 'Sefaz Direta (Web Services)',
};

// Banco de documentos fiscais limpo
export const INITIAL_CTES: CteDocumento[] = [];

export const INITIAL_MDFES: MdfeDocumento[] = [];
