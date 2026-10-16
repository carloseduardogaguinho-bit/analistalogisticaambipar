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

/* =========================================================
   MÓDULOS DE FROTA, MOTORISTAS, MANUTENÇÃO & CHECKLIST
   ========================================================= */

export type StatusVeiculo = 'Disponível' | 'Em Viagem' | 'Em Manutenção' | 'Inativo';

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  tipoEquipamento: TipoEquipamento;
  baseOperacional: string;
  odometroAtualKm: number;
  capacidadeCargaTon: number;
  status: StatusVeiculo;
  proximaRevisaoKm: number;
  dataUltimaRevisao?: string;
  tipoCombustivelPadrao: TipoCombustivel;
}

export type StatusMotorista = 'Ativo' | 'Em Férias' | 'Afastado' | 'Bloqueado (Documento Vencido)';
export type RegimeContratacaoMotorista = 'CLT Ambipar' | 'Terceirizado' | 'Agregado';
export type CategoriaCnh = 'C' | 'D' | 'E';

export interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  rg?: string;
  telefone?: string;
  email?: string;
  contatoEmergenciaNome?: string;
  contatoEmergenciaTelefone?: string;
  contatoEmergenciaParentesco?: string;
  tipoSanguineo?: string; // Ex: 'O+', 'A+', 'B+', 'AB-', etc.

  // Dados Funcionais Ambipar
  matricula?: string;
  dataAdmissao?: string;
  regimeContratacao?: RegimeContratacaoMotorista;
  baseOperacional: string;
  veiculoFixoPlaca?: string;
  status: StatusMotorista;

  // CNH & Órgãos de Trânsito
  cnh: string;
  categoriaCnh: CategoriaCnh;
  validadeCnh: string;
  dataPrimeiraCnh?: string;
  orgaoEmissorCnh?: string;
  pontuacaoAtualCnh?: number;
  exerceAtividadeRemunerada?: boolean; // EAR

  // Certificados e Saúde Obrigatória (SASSMAQ / MOPP)
  validadeMopp: string; // Curso MOPP Produtos Perigosos
  validadeToxico: string; // Exame Toxicológico Periódico
  validadeAso?: string; // Atestado de Saúde Ocupacional
  validadeNr20?: string; // Inflamáveis e Combustíveis
  validadeNr35?: string; // Trabalho em Altura / Enlonamento
  validadeDirecaoDefensiva?: string;

  // Indicadores de Telemetria e Desempenho
  mediaConsumoGeral?: number; // km/litro
  viagensRealizadasCount?: number;
  kmTotalRodados?: number;
  scoreEcoconducao?: number; // 0 a 100
  ocorrenciasCount?: number;
  observacoes?: string;
}

export type TipoManutencao =
  | 'Preventiva Programada'
  | 'Corretiva Emergencial'
  | 'Revisão de Pneus'
  | 'Inspeção Tanque / CIV'
  | 'Troca de Óleo e Filtros'
  | 'Sistema de Freios';

export type StatusManutencao = 'Agendada' | 'Em Execução' | 'Concluída' | 'Cancelada';

export interface Manutencao {
  id: string;
  veiculoPlaca: string;
  tipo: TipoManutencao;
  descricao: string;
  kmNoMomento: number;
  kmProximaRevisao?: number;
  dataEntrada: string;
  dataPrevisaoSaida?: string;
  dataConclusao?: string;
  oficina: string;
  custoTotal: number;
  status: StatusManutencao;
  responsavelAprovacao: string;
}

export interface ChecklistDiario {
  id: string;
  dataHora: string;
  veiculoPlaca: string;
  motoristaNome: string;
  kmInicial: number;
  tipoInspecao: 'Saída para Viagem' | 'Retorno à Base';
  pneusPressaoEEstado: boolean;
  freiosEstacionamentoEServico: boolean;
  luzesESinalizacao: boolean;
  extintoresPQSValidade: boolean;
  kitEmergenciaAmbipar: boolean;
  vazamentoFluidos: boolean;
  documentacaoMTRCIVCIPP: boolean;
  tacografoDiscoOuDigital: boolean;
  resultado: 'Aprovado - Liberado' | 'Aprovado com Restrição Leve' | 'Reprovado - Bloqueado';
  observacoes?: string;
}

export interface Abastecimento {
  id: string;
  dataHora: string;
  veiculoPlaca: string;
  motoristaNome: string;
  odometroKm: number;
  litrosAbastecidos: number;
  tipoCombustivel: TipoCombustivel;
  valorTotal: number;
  posto: string;
  kmRodadosDesdeUltimo?: number;
  mediaKmL?: number; // km por litro
  precoLitro?: number; // R$/L
  custoPorKm?: number; // R$/km
  numeroNotaFiscal?: string;
  tipoPosto?: 'Interno (Base Ambipar)' | 'Rede Credenciada (Ticket Log / Sem Parar)' | 'Posto Rodovia';
  tanqueCheio?: boolean;
  arla32Litros?: number;
  arla32Valor?: number;
  anomaliaDetectada?: boolean;
  motivoAnomalia?: string;
  observacoes?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

/* =========================================================
   PORTAL FISCAL DE EMISSÃO: CT-E, DACTE, MDF-E & DANFE
   ========================================================= */

export type StatusDocumentoFiscal = 
  | 'Autorizado'
  | 'Em Processamento'
  | 'Cancelado'
  | 'Rejeitado'
  | 'Rascunho'
  | 'Encerrado';

export interface CteDocumento {
  id: string;
  numeroCte: string; // Ex: 000004128
  serie: string; // Ex: 1
  chaveAcesso: string; // 44 dígitos
  dataEmissao: string;
  status: StatusDocumentoFiscal;
  protocoloAutorizacao?: string;
  dataAutorizacao?: string;
  motivoCancelamento?: string;
  ambiente: 'Homologação (Testes)' | 'Produção';

  // Remetente (Origem da Carga)
  remetenteNome: string;
  remetenteCnpj: string;
  remetenteIe: string;
  remetenteEndereco: string;
  remetenteMunicipio: string;
  remetenteUf: string;

  // Destinatário (Destino da Carga)
  destinatarioNome: string;
  destinatarioCnpj: string;
  destinatarioIe: string;
  destinatarioEndereco: string;
  destinatarioMunicipio: string;
  destinatarioUf: string;

  // Tomador do Frete
  tomadorServico: 'Remetente' | 'Destinatário' | 'Expedidor' | 'Recebedor';

  // Valores & Tributação
  valorFretePeso: number;
  valorPedagio: number;
  valorGris: number; // Gerenciamento de Risco
  valorOutros: number;
  valorTotalServico: number;
  aliquotaIcms: number;
  valorIcms: number;
  cfop: string; // Ex: 5353 ou 6353

  // Carga & Documentos Anexos
  produtoPredominante: string;
  classeRiscoOnu?: string; // Ex: Classe 9 - Substâncias Perigosas
  pesoBrutoKg: number;
  pesoLiquidoKg: number;
  valorCargaAverbada: number;
  numeroNfeCarga: string; // Chave da NF-e vinculada ou número da DANFE
  numeroMtrVinculado?: string;

  // Veículo & ANTT
  placaTracao: string;
  placaReboque?: string;
  motoristaNome: string;
  motoristaCpf: string;
  rntrc: string;

  observacoesFiscais?: string;
}

export interface MdfeDocumento {
  id: string;
  numeroMdfe: string; // Ex: 000000892
  serie: string;
  chaveAcesso: string; // 44 dígitos
  dataEmissao: string;
  status: StatusDocumentoFiscal;
  protocoloAutorizacao?: string;
  ufCarregamento: string;
  ufDescarregamento: string;
  municipioCarregamento: string;
  municipioDescarregamento: string;
  pesoBrutoTotalKg: number;
  valorTotalCargas: number;
  quantidadeCtes: number;
  ctesChaves: string[];
  placaVeiculo: string;
  motoristaNome: string;
  motoristaCpf: string;
  rntrc: string;
  ciot?: string;
  seguradoraNome: string;
  seguradoraApolice: string;
}

export interface EmpresaFiscalConfig {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  rntrc: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  emailFiscal: string;
  ambienteSefaz: 'Homologação (Testes)' | 'Produção';
  certificadoNome: string;
  certificadoValidade: string;
  certificadoStatus: 'Válido' | 'Pendente' | 'Expirado';
  provedorConexao: 'Sefaz Direta (Web Services)' | 'Focus NFe' | 'Nuvem Fiscal' | 'SpeedGov';
  apiTokenGateway?: string;
}

/* =========================================================
   MEDIÇÕES DE CLIENTES E FORNECEDORES (FATURAMENTO & CONTAS)
   ========================================================= */

export type TipoMedicao = 'Cliente (Faturamento)' | 'Fornecedor (Contas a Pagar)';
export type StatusMedicao = 
  | 'Em Aberto'
  | 'Enviada para Conferência'
  | 'Divergência / Em Contestação'
  | 'Aprovada'
  | 'Faturada / Liquidada';

export interface ItemMedicao {
  id: string;
  descricao: string;
  quantidade: number;
  unidade: 'ton' | 'km' | 'diária' | 'hora' | 'viagem';
  valorUnitario: number;
  valorTotal: number;
  viagemCodigo?: string;
  placaVeiculo?: string;
  ticketBalanca?: string;
  numeroMtr?: string;
}

export interface MedicaoContrato {
  id: string;
  numeroMedicao: string; // Ex: BM-2026-0042
  tipo: TipoMedicao;
  contraparteNome: string; // Nome do Cliente ou Fornecedor
  contraparteCnpj: string;
  contratoNumero: string;
  periodoInicio: string;
  periodoFim: string;
  dataEmissao: string;
  dataAprovacao?: string;
  dataVencimento?: string;
  status: StatusMedicao;
  itens: ItemMedicao[];
  valorTotalMedido: number;
  valorAprovadoContraparte?: number;
  valorAprovado?: number;
  valorDivergencia?: number;
  justificativaDivergencia?: string;
  justificativaGlosa?: string;
  numeroNotaFiscal?: string;
  numeroNfFaturamento?: string;
  responsavelAmbipar: string;
  observacoes?: string;
}

/* =========================================================
   COTAÇÕES DE OFICINAS & GESTÃO DE SAVING DE MANUTENÇÃO
   ========================================================= */

export type StatusCotacao = 
  | 'Aberta (Em Cotação)'
  | 'Aguardando Aprovação'
  | 'Aprovada (Gerou OS)'
  | 'Cancelada';

export interface PropostaOficina {
  id: string;
  oficinaNome: string;
  oficinaCnpj?: string;
  oficinaCidade: string;
  cidade?: string;
  telefoneContato: string;
  valorPecas: number;
  valorMaoDeObra: number;
  valorTotal: number;
  prazoDias: number;
  prazoDiasExecucao?: number;
  condicaoPagamento: string; // Ex: Faturado 30 dias, À vista c/ desconto
  garantiaMeses: number;
  observacoes?: string;
  isVencedora?: boolean;
}

export interface CotacaoManutencao {
  id: string;
  codigoCotacao: string; // Ex: COT-2026-0089
  veiculoPlaca: string;
  modeloVeiculo: string;
  tipoServico: string; // Ex: Sistema de Freios, Embreagem, Pneus, Suspensão
  descricaoNecessidade: string;
  kmAtualVeiculo: number;
  dataAbertura: string;
  dataLimiteResposta: string;
  dataAprovacao?: string;
  status: StatusCotacao;
  propostas: PropostaOficina[];
  propostaVencedoraId?: string;
  economiaSavingReais?: number; // Diferença entre o maior orçamento e o menor
  economiaSavingPercentual?: number;
  savingEstimado?: number;
  motivoEscolha?: string;
  justificativaEscolha?: string;
  responsavelCotacao: string;
  ordemServicoGeradaId?: string;
}

