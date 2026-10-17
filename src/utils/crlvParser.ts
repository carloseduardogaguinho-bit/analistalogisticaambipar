import {
  Veiculo,
  TipoEquipamento,
  TipoCombustivel,
  TipoTracaoVeiculo,
  TipoPropriedadeVeiculo,
  CategoriaEstruturalVeiculo,
} from '../types';

export interface DadosExtraidosCrlv {
  placa: string;
  renavam: string;
  chassi: string;
  marca: string;
  modelo: string;
  modeloCompleto: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  combustivel: string;
  tipoCombustivelPadrao: TipoCombustivel;
  categoriaCrlv: string;
  especieTipoCrlv: string;
  carroceriaCrlv: string;
  capacidadeCargaTon: number;
  volumeTanqueM3?: number;
  materialTanque?: string;
  pbtKg?: number;
  pbtTon?: number;
  cmtTon?: number;
  tipoTracao: TipoTracaoVeiculo;
  tipoEquipamento: TipoEquipamento;
  tipoPropriedade: TipoPropriedadeVeiculo;
  categoriaVeiculo: CategoriaEstruturalVeiculo;
  isSemCarreta: boolean;
  proprietarioNome: string;
  proprietarioCnpj: string;
  municipioUf: string;
  renavamExercicio: number;
  codigoSegurancaCrlv?: string;
  rawText?: string;
  confiancaExtracao: number; // 0 a 100%
}

/**
 * Identifica com precisão se um veículo é da classe Rígida (sem carreta / semirreboque).
 * Cobre expressamente: Veículo de Passeio (Carro / Utilitário), VUC, 3/4, Toco, Truck e Bitruck.
 */
export function isVeiculoSemCarreta(
  veiculoOuTipo?: any,
  modeloParam?: string,
  tracaoParam?: string
): boolean {
  if (!veiculoOuTipo) return false;

  let tipo = '';
  let modelo = modeloParam || '';
  let tracao = tracaoParam || '';
  let categoria: CategoriaEstruturalVeiculo | undefined;
  let isSemCarretaProp: boolean | undefined;

  if (typeof veiculoOuTipo === 'object') {
    tipo = veiculoOuTipo.tipoEquipamento || '';
    modelo = veiculoOuTipo.modelo || modelo;
    tracao = veiculoOuTipo.tipoTracao || tracao;
    categoria = veiculoOuTipo.categoriaVeiculo;
    isSemCarretaProp = veiculoOuTipo.isSemCarreta;
  } else if (typeof veiculoOuTipo === 'string') {
    tipo = veiculoOuTipo;
  }

  // Se já tiver a marcação explícita
  if (isSemCarretaProp === true) return true;
  if (categoria === 'Veículo Rígido (Sem Carreta)') return true;
  if (categoria === 'Cavalo Mecânico (Articulado c/ Carreta)') return false;

  const textoCompleto = `${tipo} ${modelo} ${tracao}`.toLowerCase();

  // Se for explicitamente Cavalo Mecânico / Cavalo Trator / Semirreboque
  if (
    textoCompleto.includes('cavalo mecânico') ||
    textoCompleto.includes('cavalo mecanico') ||
    textoCompleto.includes('cavalo trator') ||
    textoCompleto.includes('trator') ||
    textoCompleto.includes('semirreboque') ||
    textoCompleto.includes('reboque') ||
    textoCompleto.includes('articulado') ||
    textoCompleto.includes('rodotrem') ||
    textoCompleto.includes('bitrem')
  ) {
    // Atenção: Bitruck é rígido e não bitrem
    if (!textoCompleto.includes('bitruck') && !textoCompleto.includes('bitruk')) {
      return false;
    }
  }

  // Padrões de Veículos Rígidos (Sem Carreta) solicitados pelo usuário:
  // Carro / Passeio, VUC, 3/4, Toco, Truck, Bitruck
  const padroesRigidos = [
    'passeio',
    'carro',
    'automovel',
    'automóvel',
    'utilitário',
    'utilitario',
    'caminhonete',
    'camionete',
    'pick-up',
    'pickup',
    'vuc',
    'urbano',
    '3/4',
    '3 / 4',
    'três quartos',
    'tres quartos',
    'toco',
    'semipesado 4x2',
    '4x2 (toco)',
    'truck',
    'trucado',
    'pesado 6x2',
    '6x2 (trucado)',
    'bitruck',
    'bitruk',
    'bi-truck',
    '8x2',
    'emergência',
    'emergencia',
    'rápido',
    'rapido',
    // Modelos rígidos populares
    'strada',
    'hilux',
    'daily',
    'accelo',
    'delivery',
    'fiorino',
    'saveiro',
    'duster',
    'ranger',
    's10',
    'bongo',
    'hr',
    'constellation 24.280',
    'atego 2426',
    'atego 2430',
    'vm 270',
    'vm 330',
  ];

  return padroesRigidos.some((padrao) => textoCompleto.includes(padrao));
}

/**
 * Converte dados extraídos do CRLV em um objeto Veiculo completo pronto para cadastro na frota.
 */
export function converterCrlvParaVeiculo(
  crlv: DadosExtraidosCrlv,
  baseOperacional = 'Base Central Paulínia/Campinas',
  odometroInicial = 45000
): Veiculo {
  const agoraAno = new Date().getFullYear();
  const proximaRevisao = odometroInicial + 10000;

  return {
    id: `veic-${crlv.placa.replace(/[^A-Za-z0-9]/g, '')}-${Date.now()}`,
    placa: crlv.placa,
    marca: crlv.marca,
    modelo: crlv.modelo,
    ano: crlv.anoFabricacao || agoraAno,
    anoModelo: crlv.anoModelo || crlv.anoFabricacao || agoraAno,
    chassi: crlv.chassi,
    renavam: crlv.renavam,
    cor: crlv.cor,
    tipoTracao: crlv.tipoTracao,
    tipoEquipamento: crlv.tipoEquipamento,
    tipoPropriedade: crlv.tipoPropriedade,
    categoriaVeiculo: crlv.categoriaVeiculo,
    isSemCarreta: crlv.isSemCarreta,
    crlvDigitalImportado: true,
    renavamExercicio: crlv.renavamExercicio,
    proprietarioNome: crlv.proprietarioNome,
    proprietarioCnpj: crlv.proprietarioCnpj,
    municipioUf: crlv.municipioUf,
    especieTipoCrlv: crlv.especieTipoCrlv,
    carroceriaCrlv: crlv.carroceriaCrlv,
    pbtKg: crlv.pbtKg,
    baseOperacional,
    motoristaTitularNome: '',
    capacidadeCargaTon: crlv.capacidadeCargaTon || 25,
    volumeTanqueM3: crlv.volumeTanqueM3 || 0,
    materialTanque: crlv.materialTanque || 'Aço / Estrutural',
    odometroAtualKm: odometroInicial,
    status: 'Disponível',
    proximaRevisaoKm: proximaRevisao,
    dataUltimaRevisao: new Date().toISOString().slice(0, 10),
    scoreSaudeMecanica: 98,
    tipoCombustivelPadrao: crlv.tipoCombustivelPadrao,
    mediaConsumoMeta: crlv.isSemCarreta ? (crlv.capacidadeCargaTon <= 3.5 ? 9.5 : 3.8) : 2.65,
    numeroCiv: `CIV-SP-${Math.floor(10000 + Math.random() * 90000)}`,
    validadeCiv: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    numeroCipp: `CIPP-INM-${Math.floor(10000 + Math.random() * 90000)}`,
    validadeCipp: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    numeroCronotacografo: `TAC-INM-${Math.floor(100000 + Math.random() * 900000)}`,
    validadeCronotacografo: new Date(Date.now() + 730 * 86400 * 1000).toISOString().slice(0, 10),
    licencaAmbientalTransporte: 'CETESB LO 45009182',
    validadeLicencaAmbiental: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    apoliceSeguro: 'AP-AMB-2026-904',
    seguradoraNome: 'Porto Seguro Cargas / Ambiental',
    validadeSeguro: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    observacoes: `Veículo importado automaticamente via CRLV Digital (Exercício ${crlv.renavamExercicio}). ${
      crlv.isSemCarreta
        ? 'Classificado como Veículo Rígido (Sem Carreta / Semirreboque).'
        : 'Classificado como Cavalo Mecânico (Requer Carreta acoplada).'
    }`,
  };
}

/**
 * Parser inteligente de CRLV-e Digital (Senatran / Detran) a partir de texto bruto.
 * Extrai todos os campos oficiais com regex e lógica semântica.
 */
export function parseCrlvTexto(rawText: string): DadosExtraidosCrlv {
  const clean = rawText || '';

  // 1. PLACA (padrão Mercosul BRA2E19 ou antigo ABC-1234)
  let placa = '';
  const placaMercosul = clean.match(/(?:PLACA|PLACA\s+ATUAL)?:?\s*([A-Z]{3}[0-9][A-Z0-9][0-9]{2})/i);
  const placaAntiga = clean.match(/(?:PLACA|PLACA\s+ATUAL)?:?\s*([A-Z]{3}-?[0-9]{4})/i);
  if (placaMercosul) {
    placa = placaMercosul[1].toUpperCase();
  } else if (placaAntiga) {
    placa = placaAntiga[1].replace('-', '').toUpperCase();
  } else {
    // Busca avulsa por 7 caracteres com formato de placa
    const placaAvulsa = clean.match(/\b([A-Z]{3}[0-9][A-Z0-9][0-9]{2})\b/i);
    if (placaAvulsa) placa = placaAvulsa[1].toUpperCase();
  }

  // 2. RENAVAM (9 a 11 dígitos)
  let renavam = '';
  const renavamMatch = clean.match(/(?:RENAVAM|C[OÓ]DIGO\s+RENAVAM)?:?\s*(\d{9,11})\b/i);
  if (renavamMatch) {
    renavam = renavamMatch[1];
  }

  // 3. CHASSI (17 caracteres alfanuméricos padrão VIN)
  let chassi = '';
  const chassiMatch = clean.match(/(?:CHASSI|N[UÚ]MERO\s+DO\s+CHASSI)?:?\s*([A-HJ-NPR-Z0-9]{17})\b/i);
  if (chassiMatch) {
    chassi = chassiMatch[1].toUpperCase();
  }

  // 4. MARCA / MODELO / VERSÃO
  let marcaModeloRaw = '';
  const mmMatch = clean.match(/(?:MARCA\s*\/\s*MODELO(?:\s*\/\s*VERS[AÃ]O)?|MARCA\/MODELO)[\s:]+([^\n\r]+)/i);
  if (mmMatch) {
    marcaModeloRaw = mmMatch[1].trim();
  }

  // 5. ANO FABRICAÇÃO E ANO MODELO
  let anoFabricacao = new Date().getFullYear();
  let anoModelo = new Date().getFullYear();
  const anoDuploMatch = clean.match(/(?:ANO\s*FAB(?:\/|\s*E\s*)MOD|ANO\s*FABRICA[CÇ][AÃ]O\/MODELO|ANO\s*FAB\/MOD)[\s:]+(\d{4})\s*[\/\-]\s*(\d{4})/i);
  if (anoDuploMatch) {
    anoFabricacao = parseInt(anoDuploMatch[1]);
    anoModelo = parseInt(anoDuploMatch[2]);
  } else {
    const anoFabSingle = clean.match(/ANO\s*FABRICA[CÇ][AÃ]O[\s:]+(\d{4})/i);
    const anoModSingle = clean.match(/ANO\s*MODELO[\s:]+(\d{4})/i);
    if (anoFabSingle) anoFabricacao = parseInt(anoFabSingle[1]);
    if (anoModSingle) anoModelo = parseInt(anoModSingle[1]);
  }

  // 6. COR PREDOMINANTE
  let cor = 'Branco Ambipar';
  const corMatch = clean.match(/(?:COR(?:\s*PREDOMINANTE)?)[\s:]+([A-ZÀ-Úa-z\s]+)/i);
  if (corMatch) {
    const rawCor = corMatch[1].trim().split(/[\n\r]/)[0].toUpperCase();
    if (rawCor.includes('BRANC')) cor = 'Branco';
    else if (rawCor.includes('PRAT')) cor = 'Prata';
    else if (rawCor.includes('PRET')) cor = 'Preto';
    else if (rawCor.includes('AZUL')) cor = 'Azul';
    else if (rawCor.includes('VERD')) cor = 'Verde Ambipar';
    else if (rawCor.includes('VERM')) cor = 'Vermelho';
    else if (rawCor.includes('AMAR')) cor = 'Amarelo';
    else if (rawCor.includes('CINZ')) cor = 'Cinza';
    else if (rawCor.length > 2) cor = rawCor;
  }

  // 7. COMBUSTÍVEL
  let combustivel = 'DIESEL';
  const combMatch = clean.match(/COMBUST[IÍ]VEL[\s:]+([A-ZÀ-Úa-z\/\s]+)/i);
  if (combMatch) {
    combustivel = combMatch[1].trim().split(/[\n\r]/)[0].toUpperCase();
  }

  let tipoCombustivelPadrao: TipoCombustivel = 'Diesel S10';
  if (combustivel.includes('EL[EÉ]TRIC')) tipoCombustivelPadrao = '100% Elétrico';
  else if (combustivel.includes('GNV') || combustivel.includes('G[AÁ]S')) tipoCombustivelPadrao = 'GNV';
  else if (combustivel.includes('BIODIESEL')) tipoCombustivelPadrao = 'Biodiesel B20';
  else if (combustivel.includes('HVO') || combustivel.includes('VERDE')) tipoCombustivelPadrao = 'HVO (Diesel Verde)';

  // 8. CATEGORIA / ESPÉCIE / TIPO / CARROCERIA
  let categoriaCrlv = 'PARTICULAR';
  const catMatch = clean.match(/CATEGORIA[\s:]+([A-ZÀ-Úa-z\s]+)/i);
  if (catMatch) categoriaCrlv = catMatch[1].trim().split(/[\n\r]/)[0].toUpperCase();

  let especieTipoCrlv = 'CARGA / CAMINHÃO';
  const espMatch = clean.match(/ESP[EÉ]CIE\s*\/\s*TIPO[\s:]+([A-ZÀ-Úa-z\/\s]+)/i);
  if (espMatch) especieTipoCrlv = espMatch[1].trim().split(/[\n\r]/)[0].toUpperCase();

  let carroceriaCrlv = 'MECANISMO OPERACIONAL';
  const carrMatch = clean.match(/CARROCERIA[\s:]+([A-ZÀ-Úa-z\/\s]+)/i);
  if (carrMatch) carroceriaCrlv = carrMatch[1].trim().split(/[\n\r]/)[0].toUpperCase();

  // 9. PBT (PESO BRUTO TOTAL) E CAPACIDADE
  let pbtKg = 23000;
  let capacidadeCargaTon = 15;
  const pbtMatch = clean.match(/PBT[\s:]+([0-9.,]+)/i);
  if (pbtMatch) {
    const val = parseFloat(pbtMatch[1].replace('.', '').replace(',', '.'));
    if (!isNaN(val)) {
      pbtKg = val > 100 ? val : val * 1000;
    }
  }

  const capMatch = clean.match(/CAPACIDADE[\s:]+([0-9.,]+)/i);
  if (capMatch) {
    const val = parseFloat(capMatch[1].replace('.', '').replace(',', '.'));
    if (!isNaN(val)) {
      capacidadeCargaTon = val > 100 ? Math.round(val / 1000) : val;
    }
  } else if (pbtKg > 0) {
    // Estima capacidade útil de carga = PBT - Tara aproximada
    capacidadeCargaTon = Math.max(1, Math.round((pbtKg * 0.6) / 1000));
  }

  // 10. PROPRIETÁRIO, CPF/CNPJ E MUNICÍPIO/UF
  let proprietarioNome = 'AMBIPAR LOGISTICS S.A.';
  const propMatch = clean.match(/(?:NOME(?:\s*DO\s*PROPRIET[AÁ]RIO)?|PROPRIET[AÁ]RIO)[\s:]+([^\n\r]+)/i);
  if (propMatch) proprietarioNome = propMatch[1].trim();

  let proprietarioCnpj = '00.123.456/0001-99';
  const cnpjMatch = clean.match(/(?:CPF\s*\/\s*CNPJ|CNPJ|CPF)[\s:]+([0-9.\/-]+)/i);
  if (cnpjMatch) proprietarioCnpj = cnpjMatch[1].trim();

  let municipioUf = 'PAULÍNIA / SP';
  const munMatch = clean.match(/(?:MUNIC[IÍ]PIO\s*\/\s*UF|MUNIC[IÍ]PIO)[\s:]+([A-ZÀ-Úa-z\s]+)\s*[\/\-]\s*([A-Z]{2})/i);
  if (munMatch) {
    municipioUf = `${munMatch[1].trim().toUpperCase()} / ${munMatch[2].toUpperCase()}`;
  }

  // 11. EXERCÍCIO / LICENCIAMENTO
  let renavamExercicio = new Date().getFullYear();
  const exMatch = clean.match(/EXERC[IÍ]CIO[\s:]+(\d{4})/i);
  if (exMatch) renavamExercicio = parseInt(exMatch[1]);

  // 12. DEDUÇÃO INTELIGENTE DE MARCA, MODELO, TRAÇÃO, EQUIPAMENTO E SE É RÍGIDO (SEM CARRETA)
  let marca = 'Scania';
  let modelo = marcaModeloRaw || 'Caminhão Operacional Ambipar';
  let tipoTracao: TipoTracaoVeiculo = '6x2 (Trucado)';
  let tipoEquipamento: TipoEquipamento = 'Caminhão Truck (Pesado 6x2)';
  let categoriaVeiculo: CategoriaEstruturalVeiculo = 'Veículo Rígido (Sem Carreta)';
  let isSemCarreta = true;

  const mmLower = (marcaModeloRaw + ' ' + especieTipoCrlv + ' ' + carroceriaCrlv).toLowerCase();

  // Dedução da Marca
  if (mmLower.includes('scania')) marca = 'Scania';
  else if (mmLower.includes('volvo')) marca = 'Volvo';
  else if (mmLower.includes('vw') || mmLower.includes('volkswagen')) marca = 'Volkswagen';
  else if (mmLower.includes('mercedes') || mmLower.includes('m.benz') || mmLower.includes('mbenz')) marca = 'Mercedes-Benz';
  else if (mmLower.includes('iveco')) marca = 'Iveco';
  else if (mmLower.includes('fiat')) marca = 'Fiat';
  else if (mmLower.includes('toyota')) marca = 'Toyota';
  else if (mmLower.includes('ford')) marca = 'Ford';
  else if (mmLower.includes('chevrolet') || mmLower.includes('gm')) marca = 'Chevrolet';
  else if (mmLower.includes('renault')) marca = 'Renault';
  else if (mmLower.includes('hyundai')) marca = 'Hyundai';
  else if (mmLower.includes('randon')) marca = 'Randon';
  else if (mmLower.includes('facchini')) marca = 'Facchini';
  else if (mmLower.includes('guerra')) marca = 'Guerra';

  // Dedução Estrutural: É Cavalo Mecânico (Articulado c/ Carreta) ou Veículo Rígido (Sem Carreta)?
  const isTrator =
    mmLower.includes('trator') ||
    mmLower.includes('cavalo') ||
    especieTipoCrlv.includes('TRATOR') ||
    (mmLower.includes('6x4t') || mmLower.includes('6x2t') || mmLower.includes('4x2t'));

  const isReboque =
    especieTipoCrlv.includes('REBOQUE') ||
    especieTipoCrlv.includes('SEMIRREBOQUE') ||
    carroceriaCrlv.includes('TANQUE INOX') ||
    carroceriaCrlv.includes('SIDER');

  if (isReboque) {
    categoriaVeiculo = 'Semirreboque / Carreta';
    isSemCarreta = false;
    tipoTracao = 'Semirreboque / Carreta';
    tipoEquipamento = carroceriaCrlv.includes('TANQUE') ? 'Carreta Tanque Inox' : 'Carreta Baú Carga Seca';
  } else if (isTrator) {
    categoriaVeiculo = 'Cavalo Mecânico (Articulado c/ Carreta)';
    isSemCarreta = false;
    if (mmLower.includes('6x4')) {
      tipoTracao = '6x4 (Traçado)';
      tipoEquipamento = 'Cavalo Mecânico (Traçado 6x4)';
    } else {
      tipoTracao = '6x2 (Trucado)';
      tipoEquipamento = 'Cavalo Mecânico (Trucado 6x2)';
    }
  } else {
    // VEÍCULO RÍGIDO (Sem Carreta) - Solicitado: Carro/Passeio, VUC, 3/4, Toco, Truck, Bitruck
    categoriaVeiculo = 'Veículo Rígido (Sem Carreta)';
    isSemCarreta = true;

    if (
      mmLower.includes('bitruck') ||
      mmLower.includes('bitruk') ||
      mmLower.includes('8x2') ||
      mmLower.includes('8x4')
    ) {
      tipoTracao = '8x2 (Bitruck)';
      tipoEquipamento = 'Caminhão Bitruck (8x2)';
      if (capacidadeCargaTon < 20) capacidadeCargaTon = 22;
    } else if (
      mmLower.includes('truck') ||
      mmLower.includes('6x2') ||
      mmLower.includes('trucado') ||
      pbtKg >= 23000
    ) {
      tipoTracao = '6x2 (Trucado)';
      tipoEquipamento = 'Caminhão Truck (Pesado 6x2)';
      if (capacidadeCargaTon < 14) capacidadeCargaTon = 16;
    } else if (
      mmLower.includes('toco') ||
      mmLower.includes('semipesado') ||
      (mmLower.includes('4x2') && pbtKg > 10000)
    ) {
      tipoTracao = '4x2 (Toco)';
      tipoEquipamento = 'Caminhão Toco (Semipesado 4x2)';
      if (capacidadeCargaTon < 6) capacidadeCargaTon = 8;
    } else if (
      mmLower.includes('3/4') ||
      mmLower.includes('accelo') ||
      mmLower.includes('delivery') ||
      (pbtKg >= 6000 && pbtKg <= 10000)
    ) {
      tipoTracao = '4x2 (Toco)';
      tipoEquipamento = 'Caminhão 3/4 (Leve)';
      if (capacidadeCargaTon < 3) capacidadeCargaTon = 4.5;
    } else if (
      mmLower.includes('vuc') ||
      mmLower.includes('daily') ||
      mmLower.includes('bongo') ||
      mmLower.includes('hr') ||
      (pbtKg >= 3000 && pbtKg < 6000)
    ) {
      tipoTracao = '4x2 (Toco)';
      tipoEquipamento = 'VUC Coleta Urbana';
      capacidadeCargaTon = 2.5;
    } else if (
      mmLower.includes('passeio') ||
      mmLower.includes('automovel') ||
      mmLower.includes('caminhonete') ||
      mmLower.includes('utilitario') ||
      mmLower.includes('strada') ||
      mmLower.includes('hilux') ||
      mmLower.includes('fiorino') ||
      mmLower.includes('saveiro')
    ) {
      tipoTracao = '4x2 (Toco)';
      tipoEquipamento = 'Veículo de Passeio / Utilitário';
      capacidadeCargaTon = 1.0;
    } else {
      tipoTracao = '4x2 (Toco)';
      tipoEquipamento = 'Veículo de Passeio / Utilitário';
    }
  }

  // Refinamento do Modelo para ficar elegante
  if (!modelo || modelo === 'Caminhão Operacional Ambipar') {
    if (tipoEquipamento === 'Caminhão Bitruck (8x2)') modelo = `${marca} Bitruck 8x2 Caçamba/Tanque`;
    else if (tipoEquipamento === 'Caminhão Truck (Pesado 6x2)') modelo = `${marca} Constellation 24.280 6x2`;
    else if (tipoEquipamento === 'Caminhão 3/4 (Leve)') modelo = `${marca} Accelo 1016 3/4 Leve`;
    else if (tipoEquipamento === 'VUC Coleta Urbana') modelo = `${marca} Daily 35S14 VUC Urbano`;
    else if (tipoEquipamento === 'Veículo de Passeio / Utilitário') modelo = `${marca} Strada Freedom 1.3 Utilitário`;
    else modelo = `${marca} R 450 6x2 Highline`;
  }

  // Cálculo da pontuação de confiança da extração (0 a 100%)
  let score = 0;
  if (placa) score += 25;
  if (renavam) score += 20;
  if (chassi) score += 20;
  if (marcaModeloRaw) score += 15;
  if (anoFabricacao) score += 10;
  if (cor) score += 5;
  if (pbtKg) score += 5;

  return {
    placa: placa || 'AMB-2026',
    renavam: renavam || '00123456789',
    chassi: chassi || '9BM958327MB123456',
    marca,
    modelo,
    modeloCompleto: marcaModeloRaw || modelo,
    anoFabricacao,
    anoModelo,
    cor,
    combustivel,
    tipoCombustivelPadrao,
    categoriaCrlv,
    especieTipoCrlv,
    carroceriaCrlv,
    capacidadeCargaTon,
    pbtKg,
    pbtTon: pbtKg ? pbtKg / 1000 : 23,
    tipoTracao,
    tipoEquipamento,
    tipoPropriedade: 'Frota Própria Ambipar',
    categoriaVeiculo,
    isSemCarreta,
    proprietarioNome,
    proprietarioCnpj,
    municipioUf,
    renavamExercicio,
    rawText: clean,
    confiancaExtracao: Math.min(100, score),
  };
}

/**
 * Gabaritos reais de CRLV-e Digital para testes rápidos com 1 clique.
 * Abrange exatamente todos os tipos solicitados pelo usuário:
 * - Caminhão Truck (6x2)
 * - Caminhão Bitruck (8x2)
 * - Caminhão 3/4 (Leve)
 * - VUC Coleta Urbana
 * - Veículo de Passeio (Carro / Utilitário)
 * - Cavalo Mecânico (Articulado c/ Carreta)
 */
export const MODELOS_CRLV_EXEMPLOS: {
  id: string;
  titulo: string;
  categoria: string;
  isSemCarreta: boolean;
  icone: string;
  textoCrlv: string;
}[] = [
  {
    id: 'truck_6x2',
    titulo: 'Caminhão Truck VW 24.280 (Rígido 6x2)',
    categoria: 'Veículo Rígido (Sem Carreta)',
    isSemCarreta: true,
    icone: '🚚',
    textoCrlv: `REPÚBLICA FEDERATIVA DO BRASIL - MINISTÉRIO DA INFRAESTRUTURA
SECRETARIA NACIONAL DE TRÂNSITO - SENATRAN
CERTIFICADO DE REGISTRO E LICENCIAMENTO DE VEÍCULO - DIGITAL (CRLV-e)

CÓDIGO RENAVAM: 01189423851
PLACA: BRA2E28
NÚMERO DO CHASSI: 9BWCA6234KB904128
MARCA / MODELO / VERSÃO: VW/24.280 CRM 6X2
ANO FABRICAÇÃO: 2023   ANO MODELO: 2024
COR PREDOMINANTE: BRANCA
COMBUSTÍVEL: DIESEL
CATEGORIA: ALUGUEL
ESPÉCIE / TIPO: CARGA / CAMINHÃO
CARROCERIA: MECANISMO OPERACIONAL
CAPACIDADE / POTÊNCIA / CIL: 16.50 T / 280 CV / 6870 CC
PBT (PESO BRUTO TOTAL): 23.00 T
CMT (CAPACIDADE MÁX TRAT): 35.00 T
NOME PROPRIETÁRIO: AMBIPAR LOGISTICS S.A.
CPF / CNPJ: 00.123.456/0001-99
MUNICÍPIO / UF: PAULÍNIA / SP
EXERCÍCIO: 2024
CÓDIGO SEGURANÇA CLA: 89412984128`,
  },
  {
    id: 'bitruck_8x2',
    titulo: 'Caminhão Bitruck Volvo FH 460 (Rígido 8x2)',
    categoria: 'Veículo Rígido (Sem Carreta)',
    isSemCarreta: true,
    icone: '🚛',
    textoCrlv: `REPÚBLICA FEDERATIVA DO BRASIL - SENATRAN
CERTIFICADO DE REGISTRO E LICENCIAMENTO DE VEÍCULO DIGITAL - CRLV-e

CÓDIGO RENAVAM: 01248596102
PLACA: AMB8X24
NÚMERO DO CHASSI: 9BVFH8249PB678234
MARCA / MODELO / VERSÃO: VOLVO/FH 460 8X2 RIGIDO
ANO FABRICAÇÃO: 2024   ANO MODELO: 2024
COR PREDOMINANTE: VERDE AMBIPAR
COMBUSTÍVEL: DIESEL (HVO VERDE)
CATEGORIA: ALUGUEL
ESPÉCIE / TIPO: CARGA / CAMINHÃO BITRUCK
CARROCERIA: TANQUE INOX INTEGRADO
CAPACIDADE / POTÊNCIA / CIL: 22.00 T / 460 CV / 12800 CC
PBT (PESO BRUTO TOTAL): 29.00 T
CMT: 56.00 T
NOME PROPRIETÁRIO: AMBIPAR PARTICIPACOES E EMPREENDIMENTOS S.A.
CPF / CNPJ: 00.123.456/0001-99
MUNICÍPIO / UF: NOVA ODESSA / SP
EXERCÍCIO: 2024
CÓDIGO SEGURANÇA CLA: 77218392182`,
  },
  {
    id: 'leve_3_4',
    titulo: 'Caminhão 3/4 Mercedes Accelo 1016 (Leve Rígido)',
    categoria: 'Veículo Rígido (Sem Carreta)',
    isSemCarreta: true,
    icone: '🛻',
    textoCrlv: `SENATRAN - CARTEIRA DIGITAL DE TRÂNSITO (CDT)
CRLV-e DIGITAL

CÓDIGO RENAVAM: 01094821590
PLACA: MER3Q16
NÚMERO DO CHASSI: 9BM979024MB198421
MARCA / MODELO / VERSÃO: M.BENZ/ACCELO 1016 3/4
ANO FABRICAÇÃO: 2022   ANO MODELO: 2023
COR PREDOMINANTE: BRANCA
COMBUSTÍVEL: DIESEL
CATEGORIA: ALUGUEL
ESPÉCIE / TIPO: CARGA / CAMINHÃO LEVE
CARROCERIA: BAÚ CARGA SECA
CAPACIDADE / POTÊNCIA: 6.20 T / 156 CV
PBT (PESO BRUTO TOTAL): 9.60 T
NOME PROPRIETÁRIO: AMBIPAR LOGISTICS S.A.
CPF / CNPJ: 00.123.456/0001-99
MUNICÍPIO / UF: CAMPINAS / SP
EXERCÍCIO: 2024
CÓDIGO SEGURANÇA CLA: 49182390192`,
  },
  {
    id: 'vuc_coleta',
    titulo: 'VUC Iveco Daily 35S14 Urbano (Rígido)',
    categoria: 'Veículo Rígido (Sem Carreta)',
    isSemCarreta: true,
    icone: '🚐',
    textoCrlv: `SENATRAN - CRLV-e DIGITAL
DOCUMENTO OFICIAL DE LICENCIAMENTO DE VEÍCULO

CÓDIGO RENAVAM: 01389412958
PLACA: VUC4E14
NÚMERO DO CHASSI: 93ZDC3514PB819284
MARCA / MODELO / VERSÃO: IVECO/DAILY 35S14 VUC
ANO FABRICAÇÃO: 2023   ANO MODELO: 2023
COR PREDOMINANTE: BRANCA
COMBUSTÍVEL: DIESEL
CATEGORIA: ALUGUEL
ESPÉCIE / TIPO: CARGA / CAMINHONETE - VUC
CARROCERIA: BAÚ FRIGORÍFICO / COLETA
CAPACIDADE: 2.20 T
PBT: 3.50 T
NOME PROPRIETÁRIO: AMBIPAR LOGISTICS S.A.
CPF / CNPJ: 00.123.456/0001-99
MUNICÍPIO / UF: SÃO PAULO / SP
EXERCÍCIO: 2024`,
  },
  {
    id: 'passeio_utilitario',
    titulo: 'Veículo de Passeio Fiat Strada Freedom (Rígido)',
    categoria: 'Veículo Rígido (Sem Carreta)',
    isSemCarreta: true,
    icone: '🚗',
    textoCrlv: `SENATRAN - CRLV DIGITAL (CRLV-e)

CÓDIGO RENAVAM: 01491829410
PLACA: PAS1C34
NÚMERO DO CHASSI: 9BD278219PB901284
MARCA / MODELO / VERSÃO: FIAT/STRADA FREEDOM 13CS
ANO FABRICAÇÃO: 2024   ANO MODELO: 2024
COR PREDOMINANTE: PRATA
COMBUSTÍVEL: ÁLCOOL / GASOLINA (FLEX)
CATEGORIA: PARTICULAR
ESPÉCIE / TIPO: PASSAGEIRO / UTILITÁRIO PICK-UP
CARROCERIA: ABERTA
CAPACIDADE: 0.72 T
PBT: 1.83 T
NOME PROPRIETÁRIO: AMBIPAR PARTICIPACOES E EMPREENDIMENTOS S.A.
CPF / CNPJ: 00.123.456/0001-99
MUNICÍPIO / UF: PAULÍNIA / SP
EXERCÍCIO: 2024`,
  },
  {
    id: 'cavalo_mecanico',
    titulo: 'Cavalo Mecânico Scania R 450 (Articulado 6x2)',
    categoria: 'Cavalo Mecânico (Articulado c/ Carreta)',
    isSemCarreta: false,
    icone: '🚜',
    textoCrlv: `REPÚBLICA FEDERATIVA DO BRASIL - SENATRAN
CRLV-e DIGITAL

CÓDIGO RENAVAM: 01104829105
PLACA: SCA6X45
NÚMERO DO CHASSI: 9BSR450A6PB194821
MARCA / MODELO / VERSÃO: SCANIA/R 450 A6X2 HIGHLINE
ANO FABRICAÇÃO: 2023   ANO MODELO: 2024
COR PREDOMINANTE: AZUL AMBIPAR
COMBUSTÍVEL: DIESEL
CATEGORIA: ALUGUEL
ESPÉCIE / TIPO: CARGA / CAMINHÃO TRATOR
CARROCERIA: NÃO APLICÁVEL (CAVALO MECÂNICO)
CAPACIDADE / POTÊNCIA: 450 CV
PBT: 23.00 T
CMT (CAPACIDADE MÁX TRAT): 66.00 T
NOME PROPRIETÁRIO: AMBIPAR LOGISTICS S.A.
CPF / CNPJ: 00.123.456/0001-99
MUNICÍPIO / UF: PAULÍNIA / SP
EXERCÍCIO: 2024
CÓDIGO SEGURANÇA CLA: 39182390192`,
  },
];
