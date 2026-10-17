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
  | 'Veículo Rápido Emergência'
  | 'Tanque Sucção a Vácuo'
  | 'Prancha Carrega-Tudo';

export type TipoPropriedadeVeiculo = 'Frota Própria Ambipar' | 'Locado / Leasing' | 'Terceiro / Agregado';
export type TipoTracaoVeiculo = '4x2 (Toco)' | '6x2 (Trucado)' | '6x4 (Traçado)' | '8x2 (Bitruck)' | 'Semirreboque / Carreta';

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

export type SistemaEmissorMtr = 
  | 'SINIR (Federal)' 
  | 'SIGOR (CETESB SP)' 
  | 'FEPAM (RS)' 
  | 'INEA (RJ)' 
  | 'FEAM (MG)' 
  | 'IMA (SC)' 
  | 'Outro Estadual';

export type EstadoFisicoResiduo = 
  | 'Líquido' 
  | 'Sólido' 
  | 'Pastoso / Semissólido' 
  | 'Lodo / Sedimento' 
  | 'Granel';

export type TipoAcondicionamentoResiduo = 
  | 'Carreta Tanque Inox Granel'
  | 'Caçamba Estanque Roll-on'
  | 'IBC 1.000 Litros Homologado'
  | 'Tambores 200 Litros Metálicos/Plásticos'
  | 'Big Bag Homologado'
  | 'Bombonas 50 Litros'
  | 'Paletes Enlonados';

export type TecnologiaDestinacaoFinal =
  | 'Coprocessamento em Forno de Clínquer'
  | 'Incineração Térmica de Resíduos Perigosos'
  | 'Aterro Industrial Classe I (Perigoso)'
  | 'Aterro Classe II-A (Não Inerte)'
  | 'Tratamento Físico-Químico / ETE Industrial'
  | 'Rerrefino de Óleo Lubrificante Usado (OLUC)'
  | 'Descaracterização & Logística Reversa'
  | 'Compostagem / Tratamento Biológico'
  | 'Reciclagem & Beneficiamento de Materiais';

export type TipoManifestoMtr =
  | 'MTR Inicial (Padrão)'
  | 'MTR Complementar'
  | 'MTR Provisório'
  | 'MTR de Armazenamento Temporário';

export interface DocumentoAmbiental {
  id: string;
  numeroMTR: string;
  chaveAcessoMtr?: string; // Código de 16 a 24 dígitos do SINIR/SIGOR
  tipoManifesto?: TipoManifestoMtr;
  sistemaEmissor: SistemaEmissorMtr | 'SINIR' | 'SIGOR SP' | 'FEPAM RS' | 'INEA RJ' | 'Outro';

  // Gerador (Origem)
  gerador: string;
  cnpjGerador?: string;
  municipioUfGerador?: string;
  licencaGerador?: string;
  responsavelGeradorNome?: string;

  // Destinador Final
  destinador: string;
  cnpjDestinador?: string;
  municipioUfDestinador?: string;
  licencaDestinador?: string;
  responsavelDestinadorNome?: string;

  // Transportador (Ambipar Logistics)
  transportadorNome?: string;
  cnpjTransportador?: string;
  rntrcTransportador?: string;
  licencaOperacaoTransporte?: string;
  placaCavalo?: string;
  placaCarreta?: string;
  motoristaNome?: string;
  motoristaCpf?: string;
  motoristaMopp?: string;

  // Resíduo e Classificações Ambientais
  codigoIbama: string;
  descricaoResiduo: string;
  classeResiduo?: ClasseResiduo;
  estadoFisico?: EstadoFisicoResiduo;
  tipoAcondicionamento?: TipoAcondicionamentoResiduo;
  quantidadeTon: number;
  volumeM3?: number;
  densidadeEstimada?: number;
  ticketBalanca?: string;

  // Regulamento ANTT (Produtos Perigosos)
  numeroOnu?: string; // Ex: UN 3082 ou UN 1993
  classeRiscoOnu?: string; // Ex: Classe 9 ou Classe 3
  grupoEmbalagemOnu?: 'I' | 'II' | 'III';
  nomeApropriadoEmbarque?: string;

  // Destinação Final & CDF
  tecnologiaDestinacao?: TecnologiaDestinacaoFinal;
  status: StatusMTR;
  dataEmissao: string;
  dataValidadeMTR: string;
  dataRecebimento?: string;
  numeroCDF?: string;
  dataEmissaoCDF?: string;
  viagemId?: string;
  observacoes?: string;
}

export interface CertificadoDestinacaoFinalCDF {
  id: string;
  numeroCDF: string; // Ex: CDF-SINIR-2026-08192
  sistemaEmissor: SistemaEmissorMtr | string;
  destinadorRazaoSocial: string;
  destinadorCnpj: string;
  destinadorLicencaOperacao: string;
  destinadorEndereco?: string;
  geradorRazaoSocial: string;
  geradorCnpj: string;
  geradorEndereco?: string;
  tecnologiaDestinacao: TecnologiaDestinacaoFinal | string;
  dataEmissao: string;
  dataRecebimentoInicial: string;
  dataRecebimentoFinal: string;
  pesoTotalHomologadoTon: number;
  mtrsVinculados: string[]; // Números dos MTRs cobertos
  descricaoResiduos: string;
  responsavelTecnicoNome: string;
  responsavelTecnicoConselho: string; // Ex: CRQ IV ou CREA-SP
  responsavelTecnicoNumero: string; // Ex: 04291823
  numeroArt: string; // Anotação de Responsabilidade Técnica
  status: 'Homologado & Válido' | 'Pendente de Regularização' | 'Cancelado';
  laudoAnaliticoNumero?: string;
  observacoes?: string;
}

export interface LicencaVeiculo {
  id: string;
  placa?: string;
  entidade?: 'Veículo da Frota' | 'Empresa Ambipar' | 'Base Operacional';
  tipoDocumento: 
    | 'CIV (Certificado de Inspeção Veicular)' 
    | 'CIPP (Produtos Perigosos)' 
    | 'Licença IBAMA' 
    | 'Licença CETESB / Estadual' 
    | 'AET'
    | 'CIV (Certificado de Inspeção Veicular - Inmetro)'
    | 'CIPP (Produtos Perigosos Granel - Inmetro)'
    | 'CIPP (Produtos Perigosos Fracionado)'
    | 'Licença Operacional de Transporte (IBAMA)'
    | 'Licença de Operação Estadual (CETESB SP)'
    | 'Licença Ambiental Estadual (INEA RJ)'
    | 'Licença Ambiental Estadual (FEPAM RS)'
    | 'Licença Ambiental Estadual (FEAM MG)'
    | 'CTF/APP IBAMA (Certificado de Regularidade)'
    | 'Certificação SASSMAQ Rodoviário'
    | 'Cronotacógrafo Inmetro'
    | 'AET (Autorização Especial de Trânsito)';
  numeroCertificado: string;
  orgaoEmissor?: string;
  dataEmissao?: string;
  dataValidade: string;
  status: 'Válido' | 'Atenção (Expira em 30d)' | 'Vencido';
  observacoes?: string;
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
  anoModelo?: number;
  chassi?: string;
  renavam?: string;
  cor?: string;
  tipoTracao?: TipoTracaoVeiculo;
  tipoEquipamento: TipoEquipamento;
  tipoPropriedade?: TipoPropriedadeVeiculo;
  baseOperacional: string;
  motoristaTitularNome?: string;

  // Capacidades Mecânicas & Carga
  capacidadeCargaTon: number;
  volumeTanqueM3?: number;
  materialTanque?: string; // Ex: 'Inox 316L', 'Aço Carbono', 'Revestimento Epóxi'
  odometroAtualKm: number;
  status: StatusVeiculo;

  // Manutenção Preventiva
  proximaRevisaoKm: number;
  dataUltimaRevisao?: string;
  scoreSaudeMecanica?: number; // 0 a 100%

  // Combustível & Telemetria
  tipoCombustivelPadrao: TipoCombustivel;
  mediaConsumoMeta?: number; // km/L

  // Certificações Regulamentares e Laudos (SASSMAQ / Inmetro / ANTT)
  numeroCiv?: string;
  validadeCiv?: string; // Certificado de Inspeção Veicular
  numeroCipp?: string;
  validadeCipp?: string; // Certificado de Inspeção para Transporte de Produtos Perigosos
  numeroCronotacografo?: string;
  validadeCronotacografo?: string; // Inmetro
  licencaAmbientalTransporte?: string;
  validadeLicencaAmbiental?: string;
  apoliceSeguro?: string;
  seguradoraNome?: string;
  validadeSeguro?: string;
  observacoes?: string;
}

export type StatusMotorista = 'Ativo' | 'Em Férias' | 'Afastado' | 'Bloqueado (Documento Vencido)';
export type RegimeContratacaoMotorista = 'CLT Ambipar' | 'Terceirizado' | 'Agregado';
export type CategoriaCnh = 'C' | 'D' | 'E' | 'Não Aplicável (Ajudante)';
export type FuncaoTripulante = 'Motorista Titular' | 'Segundo Motorista (Revezamento)' | 'Ajudante Operacional / Transbordo';

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
  funcao?: FuncaoTripulante;
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
  | 'Preventiva'
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

export type TipoInspecaoChecklist = 'Saída para Viagem' | 'Retorno à Base';
export type ResultadoChecklist = 'Aprovado - Liberado' | 'Aprovado com Restrição Leve' | 'Reprovado - Bloqueado';
export type SeveridadeAvaria = 'Nenhuma' | 'Leve (Apenas Visual/Estética)' | 'Média (Requer Atenção em Breve)' | 'Crítica / Grave (Bloqueia Veículo)';
export type NivelTanque = 'Cheio (100%)' | '3/4' | '1/2' | '1/4' | 'Reserva';

export interface ChecklistDiario {
  id: string;
  jornadaId?: string; // ID da jornada para parear Saída e Retorno
  dataHora: string;
  dataHoraRetorno?: string;
  veiculoPlaca: string;
  placaCarreta?: string;
  motoristaNome: string;
  motoristaCpf?: string;
  motoristaTelefone?: string;
  segundoMotoristaNome?: string;
  segundoMotoristaCpf?: string;
  ajudanteNome?: string;
  ajudanteCpf?: string;
  tipoInspecao: TipoInspecaoChecklist;

  // Quilometragem & Odômetro
  kmInicial: number;
  kmFinal?: number;
  kmPercorrido?: number;

  // Itens de Inspeção de Segurança SASSMAQ / Ambipar Response
  pneusPressaoEEstado: boolean;
  freiosEstacionamentoEServico: boolean;
  luzesESinalizacao: boolean;
  extintoresPQSValidade: boolean;
  kitEmergenciaAmbipar: boolean;
  vazamentoFluidos: boolean;
  documentacaoMTRCIVCIPP: boolean;
  tacografoDiscoOuDigital: boolean;
  episObrigatorios?: boolean;
  niveisOleoRadiador?: boolean;
  limpezaCabine?: boolean;

  // Níveis de Fluidos
  nivelCombustivel?: NivelTanque;
  nivelArla32?: 'Normal (>50%)' | 'Atenção (<25%)' | 'Crítico';

  // Registro Detalhado de Avarias (Início da Jornada)
  possuiAvarias?: boolean;
  descricaoAvarias?: string;
  localAvaria?: string;
  severidadeAvaria?: SeveridadeAvaria;

  // Registro Detalhado de Avarias (Fim da Jornada / Retorno)
  avariasRetornoDetectadas?: boolean;
  descricaoAvariasRetorno?: string;
  localAvariaRetorno?: string;
  severidadeAvariaRetorno?: SeveridadeAvaria;

  // Parecer Operacional
  resultado: ResultadoChecklist;
  motivoReprovacao?: string;
  observacoes?: string;
  assinaturaDigitalMotorista?: string;
  statusJornada?: 'Em Jornada' | 'Jornada Concluída';
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

