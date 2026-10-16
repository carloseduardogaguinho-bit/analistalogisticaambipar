export type StatusViagem = 
  | 'Programada'
  | 'Em Trânsito'
  | 'No Cliente'
  | 'Carregando'
  | 'Descarregando'
  | 'Concluída'
  | 'Atrasada'
  | 'Ocorrência';

export type TipoEquipamento =
  | 'Carreta Tanque Inox'
  | 'Roll-on / Roll-off'
  | 'Poliguindaste Duplo'
  | 'Carreta Baú Carga Seca'
  | 'Sider Especial'
  | 'VUC Coleta Urbana'
  | 'Veículo Rápido Emergência';

export type ClasseResiduo =
  | 'Classe I - Perigoso (Inflamável / Tóxico)'
  | 'Classe I - Químico Industrial'
  | 'Classe II-A - Não Inerte (Orgânico / Industrial)'
  | 'Classe II-B - Inerte'
  | 'Logística Reversa / Eletrônicos'
  | 'Material Valorizado (Coprocessamento)';

export type StatusMTR =
  | 'Emitido no SINIR'
  | 'Em Transporte'
  | 'Recebido no Destino'
  | 'CDF Gerado'
  | 'Pendente Regularização';

export type SeveridadeOcorrencia = 'Baixa' | 'Média' | 'Alta' | 'Crítica (Emergência)';

export type TipoCombustivel = 'Diesel S10' | 'Biodiesel B20' | 'HVO (Diesel Verde)' | 'GNV' | '100% Elétrico';

export interface Viagem {
  id: string;
  codigoViagem: string; // Ex: AMB-2026-1042
  cliente: string;
  origem: string;
  destino: string;
  baseOperacional: string;
  motorista: string;
  placaCavalo: string;
  placaCarreta?: string;
  tipoEquipamento: TipoEquipamento;
  classeResiduo: ClasseResiduo;
  pesoToneladas: number;
  distanciaKm: number;
  dataSaidaPrevista: string;
  dataChegadaPrevista: string;
  dataChegadaReal?: string;
  status: StatusViagem;
  numeroMTR: string;
  numeroCTe: string;
  tipoCombustivel: TipoCombustivel;
  custoTotal: number;
  observacoes?: string;
}

export interface DocumentoAmbiental {
  id: string;
  numeroMTR: string;
  sistemaEmissor: 'SINIR' | 'SIGOR SP' | 'FEPAM RS' | 'INEA RJ' | 'Outro';
  gerador: string;
  destinador: string;
  codigoIbama: string;
  descricaoResiduo: string;
  quantidadeTon: number;
  status: StatusMTR;
  dataEmissao: string;
  dataValidadeMTR: string;
  numeroCDF?: string;
  viagemId?: string;
}

export interface LicencaVeiculo {
  id: string;
  placa: string;
  tipoDocumento: 'CIV (Certificado de Inspeção Veicular)' | 'CIPP (Produtos Perigosos)' | 'Licença IBAMA' | 'Licença CETESB / Estadual' | 'AET';
  numeroCertificado: string;
  dataValidade: string;
  status: 'Válido' | 'Atenção (Expira em 30d)' | 'Vencido';
}

export interface Ocorrencia {
  id: string;
  viagemId: string;
  codigoViagem: string;
  dataHora: string;
  tipo: 'Atraso em Janela de Carga' | 'Divergência de Peso / MTR' | 'Problema Mecânico' | 'Avaria na Embalagem' | 'Incidente / Protocolo Emergência' | 'Outro';
  severidade: SeveridadeOcorrencia;
  descricao: string;
  status: 'Aberta' | 'Em Análise' | 'Ação Corretiva Implementada' | 'Concluída';
  responsavelTratativa: string;
}

export interface KpiSummary {
  totalViagens: number;
  viagensEmTransito: number;
  viagensConcluidasHoje: number;
  viagensAtrasadas: number;
  otifPercent: number;
  volumeTotalTon: number;
  custoMedioPorKm: number;
  co2EmitidoKg: number;
  co2EvitadoKg: number;
  mtrsPendentes: number;
  ocorrenciasAbertas: number;
}
