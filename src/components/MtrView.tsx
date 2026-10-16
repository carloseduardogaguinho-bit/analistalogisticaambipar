import React, { useState, useMemo } from 'react';
import {
  DocumentoAmbiental,
  LicencaVeiculo,
  StatusMTR,
  SistemaEmissorMtr,
  EstadoFisicoResiduo,
  TipoAcondicionamentoResiduo,
  TecnologiaDestinacaoFinal,
  CertificadoDestinacaoFinalCDF,
  ClasseResiduo,
  Veiculo,
  Motorista,
} from '../types';
import {
  FileCheck2,
  Plus,
  Search,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  BookOpen,
  Printer,
  Download,
  Filter,
  Trash2,
  Building,
  Truck,
  Recycle,
  Flame,
  Award,
  Layers,
  Calendar,
  Eye,
  Check,
  MapPin,
  User,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { getStatusColor, formatNumber } from '../utils/formatters';

interface MtrViewProps {
  mtrs: DocumentoAmbiental[];
  licencas: LicencaVeiculo[];
  cdfs?: CertificadoDestinacaoFinalCDF[];
  veiculos?: Veiculo[];
  motoristas?: Motorista[];
  onAddMtr: (mtr: DocumentoAmbiental) => void;
  onUpdateMtrStatus: (id: string, newStatus: StatusMTR, cdf?: string) => void;
  onDeleteMtr?: (id: string) => void;
  onAddCdf?: (cdf: CertificadoDestinacaoFinalCDF) => void;
  onDeleteCdf?: (id: string) => void;
  onAddLicenca?: (lic: LicencaVeiculo) => void;
  onDeleteLicenca?: (id: string) => void;
}

// Catálogo Oficial da Lista Brasileira de Resíduos Sólidos (Instrução Normativa IBAMA nº 13/2012)
export const IBAMA_CATALOG = [
  {
    code: '13 02 05*',
    desc: 'Óleos de motor, de engrenagens e de lubrificação minerais não clorados',
    classe: 'Classe I - Perigoso (Inflamável / Tóxico)',
    categoria: 'Óleos & Lubrificantes',
    onu: 'UN 3082',
    classeOnu: 'Classe 9',
    tecnologiaSug: 'Rerrefino de Óleo Lubrificante Usado (OLUC)',
  },
  {
    code: '13 01 10*',
    desc: 'Óleos hidráulicos minerais não clorados',
    classe: 'Classe I - Perigoso (Inflamável / Tóxico)',
    categoria: 'Óleos & Lubrificantes',
    onu: 'UN 3082',
    classeOnu: 'Classe 9',
    tecnologiaSug: 'Rerrefino de Óleo Lubrificante Usado (OLUC)',
  },
  {
    code: '16 01 07*',
    desc: 'Filtros de óleo automotivos e industriais contaminados',
    classe: 'Classe I - Perigoso (Inflamável / Tóxico)',
    categoria: 'Filtros & Embalagens Contaminadas',
    onu: 'UN 3175',
    classeOnu: 'Classe 4.1',
    tecnologiaSug: 'Coprocessamento em Forno de Clínquer',
  },
  {
    code: '15 01 10*',
    desc: 'Embalagens contendo resíduos ou contaminadas por substâncias perigosas',
    classe: 'Classe I - Perigoso (Inflamável / Tóxico)',
    categoria: 'Filtros & Embalagens Contaminadas',
    onu: 'UN 3509',
    classeOnu: 'Classe 9',
    tecnologiaSug: 'Coprocessamento em Forno de Clínquer',
  },
  {
    code: '07 01 01*',
    desc: 'Soluções aquosas de lavagem e licores-mãe de processos químicos orgânicos',
    classe: 'Classe I - Químico Industrial',
    categoria: 'Efluentes & Lodos Químicos',
    onu: 'UN 1760',
    classeOnu: 'Classe 8',
    tecnologiaSug: 'Tratamento Físico-Químico / ETE Industrial',
  },
  {
    code: '08 01 11*',
    desc: 'Resíduos de tintas e vernizes contendo solventes orgânicos ou substâncias perigosas',
    classe: 'Classe I - Perigoso (Inflamável / Tóxico)',
    categoria: 'Solventes & Químicos',
    onu: 'UN 1263',
    classeOnu: 'Classe 3',
    tecnologiaSug: 'Incineração Térmica de Resíduos Perigosos',
  },
  {
    code: '17 05 03*',
    desc: 'Solos e rochas contendo substâncias perigosas (contaminação / remediação ambiental)',
    classe: 'Classe I - Perigoso (Inflamável / Tóxico)',
    categoria: 'Solos & Contaminações',
    onu: 'UN 3077',
    classeOnu: 'Classe 9',
    tecnologiaSug: 'Aterro Industrial Classe I (Perigoso)',
  },
  {
    code: '03 03 09',
    desc: 'Lodos de tratamento de efluentes da indústria de papel e celulose',
    classe: 'Classe II-A - Não Inerte (Orgânico / Industrial)',
    categoria: 'Efluentes & Lodos Químicos',
    tecnologiaSug: 'Compostagem / Tratamento Biológico',
  },
  {
    code: '12 01 05',
    desc: 'Aparas e raspas de materiais plásticos industriais não contaminadas',
    classe: 'Classe II-B - Inerte',
    categoria: 'Não Perigosos / Recicláveis',
    tecnologiaSug: 'Reciclagem & Beneficiamento de Materiais',
  },
  {
    code: '16 02 14',
    desc: 'Equipamentos elétricos e eletrônicos descartados (Logística Reversa / Sucata)',
    classe: 'Logística Reversa / Eletrônicos',
    categoria: 'Não Perigosos / Recicláveis',
    tecnologiaSug: 'Descaracterização & Logística Reversa',
  },
];

export const MtrView: React.FC<MtrViewProps> = ({
  mtrs,
  licencas,
  cdfs = [],
  veiculos = [],
  motoristas = [],
  onAddMtr,
  onUpdateMtrStatus,
  onDeleteMtr,
  onAddCdf,
  onDeleteCdf,
  onAddLicenca,
  onDeleteLicenca,
}) => {
  // Sub-abas ativas: 'manifestos' | 'cdfs' | 'licencas'
  const [activeSubTab, setActiveSubTab] = useState<'manifestos' | 'cdfs' | 'licencas'>('manifestos');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [sistemaFilter, setSistemaFilter] = useState<string>('todos');
  const [classeFilter, setClasseFilter] = useState<string>('todos');

  // Modais
  const [isNewMtrModalOpen, setIsNewMtrModalOpen] = useState(false);
  const [isNewCdfModalOpen, setIsNewCdfModalOpen] = useState(false);
  const [isNewLicencaModalOpen, setIsNewLicencaModalOpen] = useState(false);
  const [showIbamaGuide, setShowIbamaGuide] = useState(false);
  const [selectedMtrForPrint, setSelectedMtrForPrint] = useState<DocumentoAmbiental | null>(null);
  const [selectedCdfForPrint, setSelectedCdfForPrint] = useState<CertificadoDestinacaoFinalCDF | null>(null);
  const [ibamaSearchTerm, setIbamaSearchTerm] = useState('');
  const [ibamaCategoryFilter, setIbamaCategoryFilter] = useState('Todos');

  // Formulário de Novo MTR
  const [formData, setFormData] = useState<Partial<DocumentoAmbiental>>({
    numeroMTR: `MTR-SINIR-${Math.floor(100000 + Math.random() * 900000)}`,
    chaveAcessoMtr: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    sistemaEmissor: 'SINIR (Federal)',
    tipoManifesto: 'MTR Inicial (Padrão)',
    gerador: '',
    cnpjGerador: '',
    municipioUfGerador: 'São Paulo - SP',
    licencaGerador: 'LO nº 4589/2023',
    destinador: 'Ambipar Centro de Valorização & Coprocessamento',
    cnpjDestinador: '09.289.479/0002-19',
    municipioUfDestinador: 'Nova Odessa - SP',
    licencaDestinador: 'CETESB LO nº 31004812',
    transportadorNome: 'Ambipar Waste Management Logistics S.A.',
    cnpjTransportador: '09.289.479/0001-38',
    rntrcTransportador: '04892182',
    licencaOperacaoTransporte: 'IBAMA LO nº 2410/2024 - Produtos Perigosos',
    placaCavalo: '',
    placaCarreta: '',
    motoristaNome: '',
    codigoIbama: '13 02 05* - Óleos de motor e lubrificação minerais não clorados',
    descricaoResiduo: '',
    classeResiduo: 'Classe I - Perigoso (Inflamável / Tóxico)',
    estadoFisico: 'Líquido',
    tipoAcondicionamento: 'Carreta Tanque Inox Granel',
    tecnologiaDestinacao: 'Coprocessamento em Forno de Clínquer',
    quantidadeTon: 15,
    volumeM3: 16.5,
    numeroOnu: 'UN 3082',
    classeRiscoOnu: 'Classe 9 - Substâncias Perigosas',
    grupoEmbalagemOnu: 'III',
    status: 'Emitido no SINIR',
    dataEmissao: new Date().toISOString().slice(0, 10),
    dataValidadeMTR: new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 10),
  });

  // Formulário de Novo CDF
  const [cdfFormData, setCdfFormData] = useState<Partial<CertificadoDestinacaoFinalCDF>>({
    numeroCDF: `CDF-SINIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    sistemaEmissor: 'SINIR (Federal)',
    destinadorRazaoSocial: 'Ambipar Centro de Valorização & Coprocessamento S.A.',
    destinadorCnpj: '09.289.479/0002-19',
    destinadorLicencaOperacao: 'CETESB LO nº 31004812',
    destinadorEndereco: 'Rod. Anhanguera, km 118, Nova Odessa - SP',
    geradorRazaoSocial: '',
    geradorCnpj: '',
    geradorEndereco: '',
    tecnologiaDestinacao: 'Coprocessamento em Forno de Clínquer',
    dataEmissao: new Date().toISOString().slice(0, 10),
    dataRecebimentoInicial: new Date(Date.now() - 15 * 86400 * 1000).toISOString().slice(0, 10),
    dataRecebimentoFinal: new Date().toISOString().slice(0, 10),
    pesoTotalHomologadoTon: 0,
    mtrsVinculados: [],
    descricaoResiduos: '',
    responsavelTecnicoNome: 'Dr. Roberto Silveira de Alencar',
    responsavelTecnicoConselho: 'CRQ IV',
    responsavelTecnicoNumero: '0421892-D',
    numeroArt: `ART-SP-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'Homologado & Válido',
  });

  // Formulário de Nova Licença
  const [licencaFormData, setLicencaFormData] = useState<Partial<LicencaVeiculo>>({
    placa: '',
    entidade: 'Veículo da Frota',
    tipoDocumento: 'CIPP (Produtos Perigosos Granel - Inmetro)',
    numeroCertificado: `CIPP-${Math.floor(100000 + Math.random() * 900000)}`,
    orgaoEmissor: 'INMETRO',
    dataEmissao: new Date().toISOString().slice(0, 10),
    dataValidade: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    status: 'Válido',
    observacoes: '',
  });

  // Cálculos de Indicadores Executivos (KPIs)
  const totalMtrs = mtrs.length;
  const totalToneladas = mtrs.reduce((acc, m) => acc + (Number(m.quantidadeTon) || 0), 0);
  const mtrsEmTransito = mtrs.filter((m) => m.status === 'Em Transporte').length;
  const mtrsComCdf = mtrs.filter((m) => m.status === 'CDF Gerado' || Boolean(m.numeroCDF)).length;
  const taxaHomologacaoCdf = totalMtrs > 0 ? Math.round((mtrsComCdf / totalMtrs) * 100) : 0;
  const mtrsClasseI = mtrs.filter((m) => m.classeResiduo?.includes('Classe I') || m.codigoIbama?.includes('*'));
  const toneladasClasseI = mtrsClasseI.reduce((acc, m) => acc + (Number(m.quantidadeTon) || 0), 0);

  // Radar de Licenças
  const licencasVencidas = licencas.filter((l) => l.status === 'Vencido').length;
  const licencasAlerta = licencas.filter((l) => l.status === 'Atenção (Expira em 30d)').length;
  const licencasValidas = licencas.filter((l) => l.status === 'Válido').length;

  // Filtragem de MTRs
  const filteredMtrs = useMemo(() => {
    return mtrs.filter((m) => {
      const matchSearch =
        m.numeroMTR.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.gerador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.destinador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.codigoIbama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.placaCavalo && m.placaCavalo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.motoristaNome && m.motoristaNome.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'todos' || m.status === statusFilter;
      const matchSistema = sistemaFilter === 'todos' || m.sistemaEmissor.includes(sistemaFilter);
      const matchClasse = classeFilter === 'todos' || (m.classeResiduo && m.classeResiduo.includes(classeFilter));

      return matchSearch && matchStatus && matchSistema && matchClasse;
    });
  }, [mtrs, searchTerm, statusFilter, sistemaFilter, classeFilter]);

  // Handler de Novo MTR
  const handleSubmitMtr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gerador || !formData.descricaoResiduo) {
      alert('Preencha os campos obrigatórios (Gerador e Descrição do Resíduo).');
      return;
    }

    const newMtr: DocumentoAmbiental = {
      id: `doc-${Date.now()}`,
      numeroMTR: formData.numeroMTR || `MTR-SINIR-${Math.floor(100000 + Math.random() * 900000)}`,
      chaveAcessoMtr: formData.chaveAcessoMtr || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      sistemaEmissor: (formData.sistemaEmissor as SistemaEmissorMtr) || 'SINIR (Federal)',
      tipoManifesto: formData.tipoManifesto || 'MTR Inicial (Padrão)',
      gerador: formData.gerador || '',
      cnpjGerador: formData.cnpjGerador || '12.345.678/0001-90',
      municipioUfGerador: formData.municipioUfGerador || 'São Paulo - SP',
      licencaGerador: formData.licencaGerador || 'LO nº 4589/2023',
      destinador: formData.destinador || 'Ambipar Centro de Valorização & Coprocessamento',
      cnpjDestinador: formData.cnpjDestinador || '09.289.479/0002-19',
      municipioUfDestinador: formData.municipioUfDestinador || 'Nova Odessa - SP',
      licencaDestinador: formData.licencaDestinador || 'CETESB LO nº 31004812',
      transportadorNome: formData.transportadorNome || 'Ambipar Waste Management Logistics S.A.',
      cnpjTransportador: formData.cnpjTransportador || '09.289.479/0001-38',
      rntrcTransportador: formData.rntrcTransportador || '04892182',
      licencaOperacaoTransporte: formData.licencaOperacaoTransporte || 'IBAMA LO nº 2410/2024 - Produtos Perigosos',
      placaCavalo: formData.placaCavalo || '',
      placaCarreta: formData.placaCarreta || '',
      motoristaNome: formData.motoristaNome || '',
      codigoIbama: formData.codigoIbama || '13 02 05*',
      descricaoResiduo: formData.descricaoResiduo || '',
      classeResiduo: formData.classeResiduo || 'Classe I - Perigoso (Inflamável / Tóxico)',
      estadoFisico: formData.estadoFisico || 'Líquido',
      tipoAcondicionamento: formData.tipoAcondicionamento || 'Carreta Tanque Inox Granel',
      tecnologiaDestinacao: formData.tecnologiaDestinacao || 'Coprocessamento em Forno de Clínquer',
      quantidadeTon: Number(formData.quantidadeTon) || 0,
      volumeM3: Number(formData.volumeM3) || 0,
      numeroOnu: formData.numeroOnu || 'UN 3082',
      classeRiscoOnu: formData.classeRiscoOnu || 'Classe 9',
      grupoEmbalagemOnu: formData.grupoEmbalagemOnu || 'III',
      status: (formData.status as StatusMTR) || 'Emitido no SINIR',
      dataEmissao: formData.dataEmissao || new Date().toISOString().slice(0, 10),
      dataValidadeMTR: formData.dataValidadeMTR || new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 10),
      numeroCDF: formData.status === 'CDF Gerado' ? `CDF-SINIR-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      observacoes: formData.observacoes,
    };

    onAddMtr(newMtr);
    setIsNewMtrModalOpen(false);
  };

  // Handler de Novo CDF
  const handleSubmitCdf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cdfFormData.destinadorRazaoSocial || !cdfFormData.geradorRazaoSocial) {
      alert('Preencha os campos obrigatórios de Destinador e Gerador.');
      return;
    }

    const newCdf: CertificadoDestinacaoFinalCDF = {
      id: `cdf-${Date.now()}`,
      numeroCDF: cdfFormData.numeroCDF || `CDF-SINIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sistemaEmissor: cdfFormData.sistemaEmissor || 'SINIR (Federal)',
      destinadorRazaoSocial: cdfFormData.destinadorRazaoSocial || 'Ambipar Centro de Valorização & Coprocessamento S.A.',
      destinadorCnpj: cdfFormData.destinadorCnpj || '09.289.479/0002-19',
      destinadorLicencaOperacao: cdfFormData.destinadorLicencaOperacao || 'CETESB LO nº 31004812',
      destinadorEndereco: cdfFormData.destinadorEndereco || 'Rod. Anhanguera, km 118, Nova Odessa - SP',
      geradorRazaoSocial: cdfFormData.geradorRazaoSocial || '',
      geradorCnpj: cdfFormData.geradorCnpj || '',
      geradorEndereco: cdfFormData.geradorEndereco || '',
      tecnologiaDestinacao: cdfFormData.tecnologiaDestinacao || 'Coprocessamento em Forno de Clínquer',
      dataEmissao: cdfFormData.dataEmissao || new Date().toISOString().slice(0, 10),
      dataRecebimentoInicial: cdfFormData.dataRecebimentoInicial || new Date().toISOString().slice(0, 10),
      dataRecebimentoFinal: cdfFormData.dataRecebimentoFinal || new Date().toISOString().slice(0, 10),
      pesoTotalHomologadoTon: Number(cdfFormData.pesoTotalHomologadoTon) || 0,
      mtrsVinculados: cdfFormData.mtrsVinculados || [],
      descricaoResiduos: cdfFormData.descricaoResiduos || 'Resíduos industriais destinados em conformidade legal',
      responsavelTecnicoNome: cdfFormData.responsavelTecnicoNome || 'Dr. Roberto Silveira de Alencar',
      responsavelTecnicoConselho: cdfFormData.responsavelTecnicoConselho || 'CRQ IV',
      responsavelTecnicoNumero: cdfFormData.responsavelTecnicoNumero || '0421892-D',
      numeroArt: cdfFormData.numeroArt || `ART-SP-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Homologado & Válido',
      observacoes: cdfFormData.observacoes,
    };

    if (onAddCdf) {
      onAddCdf(newCdf);
    }

    // Atualiza status dos MTRs vinculados para 'CDF Gerado'
    if (newCdf.mtrsVinculados.length > 0) {
      mtrs.forEach((m) => {
        if (newCdf.mtrsVinculados.includes(m.numeroMTR)) {
          onUpdateMtrStatus(m.id, 'CDF Gerado', newCdf.numeroCDF);
        }
      });
    }

    setIsNewCdfModalOpen(false);
  };

  // Handler de Nova Licença
  const handleSubmitLicenca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licencaFormData.numeroCertificado || !licencaFormData.dataValidade) {
      alert('Preencha os campos obrigatórios da licença.');
      return;
    }

    // Calcula status
    const hoje = new Date();
    const dataVal = new Date(licencaFormData.dataValidade);
    const diffDias = Math.ceil((dataVal.getTime() - hoje.getTime()) / (1000 * 86400));
    let statusCalc: 'Válido' | 'Atenção (Expira em 30d)' | 'Vencido' = 'Válido';
    if (diffDias < 0) {
      statusCalc = 'Vencido';
    } else if (diffDias <= 30) {
      statusCalc = 'Atenção (Expira em 30d)';
    }

    const novaLic: LicencaVeiculo = {
      id: `lic-${Date.now()}`,
      placa: licencaFormData.placa || undefined,
      entidade: licencaFormData.entidade || 'Veículo da Frota',
      tipoDocumento: (licencaFormData.tipoDocumento as any) || 'CIV (Certificado de Inspeção Veicular - Inmetro)',
      numeroCertificado: licencaFormData.numeroCertificado,
      orgaoEmissor: licencaFormData.orgaoEmissor || 'INMETRO',
      dataEmissao: licencaFormData.dataEmissao,
      dataValidade: licencaFormData.dataValidade,
      status: statusCalc,
      observacoes: licencaFormData.observacoes,
    };

    if (onAddLicenca) {
      onAddLicenca(novaLic);
    }
    setIsNewLicencaModalOpen(false);
  };

  // Exportar MTRs em CSV
  const handleExportMtrsCsv = () => {
    if (mtrs.length === 0) {
      alert('Nenhum MTR para exportar.');
      return;
    }

    const headers = [
      'Numero_MTR',
      'Chave_Acesso',
      'Sistema_Emissor',
      'Gerador',
      'CNPJ_Gerador',
      'Destinador',
      'CNPJ_Destinador',
      'Codigo_IBAMA',
      'Descricao_Residuo',
      'Classe_Residuo',
      'Quantidade_Ton',
      'Acondicionamento',
      'Tecnologia_Destinacao',
      'Placa_Cavalo',
      'Motorista',
      'Status_MTR',
      'Numero_CDF',
      'Data_Emissao',
      'Data_Validade',
    ];

    const rows = mtrs.map((m) => [
      `"${m.numeroMTR}"`,
      `"${m.chaveAcessoMtr || ''}"`,
      `"${m.sistemaEmissor}"`,
      `"${m.gerador.replace(/"/g, '""')}"`,
      `"${m.cnpjGerador || ''}"`,
      `"${m.destinador.replace(/"/g, '""')}"`,
      `"${m.cnpjDestinador || ''}"`,
      `"${m.codigoIbama}"`,
      `"${m.descricaoResiduo.replace(/"/g, '""')}"`,
      `"${m.classeResiduo || ''}"`,
      m.quantidadeTon,
      `"${m.tipoAcondicionamento || ''}"`,
      `"${m.tecnologiaDestinacao || ''}"`,
      `"${m.placaCavalo || ''}"`,
      `"${m.motoristaNome || ''}"`,
      `"${m.status}"`,
      `"${m.numeroCDF || ''}"`,
      `"${m.dataEmissao}"`,
      `"${m.dataValidadeMTR}"`,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ambipar_manifestos_mtr_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Exportar RAPP IBAMA em CSV
  const handleExportRappIbamaCsv = () => {
    if (mtrs.length === 0) {
      alert('Nenhum MTR para compor o Relatório RAPP.');
      return;
    }

    const headers = [
      'CNPJ_TRANSPORTADOR_AMBIPAR',
      'CODIGO_RESIDUO_IBAMA',
      'DESCRICAO_RESIDUO_IBAMA',
      'CLASSE_NBR_10004',
      'QUANTIDADE_TOTAL_TRANSPORTADA_TON',
      'CNPJ_GERADOR_ORIGEM',
      'RAZAO_SOCIAL_GERADOR',
      'CNPJ_DESTINADOR_FINAL',
      'RAZAO_SOCIAL_DESTINADOR',
      'TECNOLOGIA_DESTINACAO_FINAL',
      'NUMERO_CDF_HOMOLOGADO',
    ];

    const rows = mtrs.map((m) => [
      `"${m.cnpjTransportador || '09.289.479/0001-38'}"`,
      `"${m.codigoIbama}"`,
      `"${m.descricaoResiduo.replace(/"/g, '""')}"`,
      `"${m.classeResiduo || 'Classe I - Perigoso'}"`,
      m.quantidadeTon,
      `"${m.cnpjGerador || 'N/A'}"`,
      `"${m.gerador.replace(/"/g, '""')}"`,
      `"${m.cnpjDestinador || 'N/A'}"`,
      `"${m.destinador.replace(/"/g, '""')}"`,
      `"${m.tecnologiaDestinacao || 'Coprocessamento em Forno de Clínquer'}"`,
      `"${m.numeroCDF || 'Pendente Baixa'}"`,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ambipar_relatorio_rapp_ibama_${new Date().getFullYear()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações Globais */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/20">
              SINIR • SIGOR • IBAMA • NBR 10004
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5 mt-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ambipar-500 to-emerald-700 flex items-center justify-center text-slate-950 shadow-md shadow-ambipar-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span>Conformidade Ambiental: MTR, CDF & Licenças</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Gestão integrada e rastreabilidade total de resíduos perigosos e industriais: emissão de Manifestos MTR
            (SINIR Federal / SIGOR SP / FEPAM / INEA), controle de Certificados de Destinação Final (CDF) e radar de
            validade das licenças de transporte e certificados CIPP/CIV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Guia Códigos IBAMA */}
          <button
            onClick={() => setShowIbamaGuide(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-ambipar-400" />
            <span>Tabela Códigos IBAMA</span>
          </button>

          {/* Exportar RAPP IBAMA */}
          <button
            onClick={handleExportRappIbamaCsv}
            title="Exportar Relatório Anual RAPP IBAMA"
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Relatório RAPP IBAMA</span>
          </button>

          {/* Exportar CSV */}
          <button
            onClick={handleExportMtrsCsv}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Exportar MTRs em CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Ação Primária de Acordo com a Aba */}
          {activeSubTab === 'manifestos' && (
            <button
              onClick={() => setIsNewMtrModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir / Registrar MTR</span>
            </button>
          )}

          {activeSubTab === 'cdfs' && (
            <button
              onClick={() => setIsNewCdfModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Award className="w-4 h-4" />
              <span>Registrar / Homologar CDF</span>
            </button>
          )}

          {activeSubTab === 'licencas' && (
            <button
              onClick={() => setIsNewLicencaModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Licença / Certificado</span>
            </button>
          )}
        </div>
      </div>

      {/* Indicadores Executivos (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* KPI 1 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">MTRs Registrados</span>
            <FileText className="w-4 h-4 text-ambipar-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white font-mono">{totalMtrs}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{formatNumber(totalToneladas)} t movimentadas</div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Em Transporte</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-400 font-mono">{mtrsEmTransito}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Prazo SINIR: 30 dias</div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Homologação CDF</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-400 font-mono">{taxaHomologacaoCdf}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{mtrsComCdf} de {totalMtrs} certificados</div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Classe I Perigosos</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-rose-400 font-mono">{formatNumber(toneladasClasseI)} t</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{mtrsClasseI.length} manifestos perigosos</div>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Radar Licenças</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{licencas.length}</span>
            {licencasVencidas > 0 ? (
              <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                {licencasVencidas} Vencida(s)
              </span>
            ) : licencasAlerta > 0 ? (
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {licencasAlerta} a Vencer
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                100% Regulares
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">IBAMA, CETESB, CIPP & CIV</div>
        </div>
      </div>

      {/* Navegação por Sub-Abas */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('manifestos')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'manifestos'
              ? 'border-ambipar-500 text-ambipar-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Manifestos MTR ({mtrs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cdfs')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'cdfs'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificados de Destinação Final - CDF ({cdfs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('licencas')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'licencas'
              ? 'border-blue-500 text-blue-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Licenças Ambientais & Frota ({licencas.length})</span>
        </button>
      </div>

      {/* =========================================================
          SUB-ABA 1: MANIFESTOS MTR (SINIR / SIGOR / FEPAM / INEA)
          ========================================================= */}
      {activeSubTab === 'manifestos' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por MTR, cliente gerador, destinador, placa, motorista ou resíduo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-ambipar-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="Emitido no SINIR">Emitido no SINIR</option>
                <option value="Em Transporte">Em Transporte</option>
                <option value="Recebido no Destino">Recebido no Destino</option>
                <option value="CDF Gerado">CDF Gerado</option>
                <option value="Pendente Regularização">Pendente Regularização</option>
              </select>

              {/* Filtro Sistema */}
              <select
                value={sistemaFilter}
                onChange={(e) => setSistemaFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-ambipar-500"
              >
                <option value="todos">Todos os Sistemas</option>
                <option value="SINIR">SINIR Federal</option>
                <option value="SIGOR">SIGOR SP</option>
                <option value="FEPAM">FEPAM RS</option>
                <option value="INEA">INEA RJ</option>
                <option value="FEAM">FEAM MG</option>
              </select>

              {/* Filtro Classe Resíduo */}
              <select
                value={classeFilter}
                onChange={(e) => setClasseFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-ambipar-500"
              >
                <option value="todos">Todas as Classes</option>
                <option value="Classe I">Classe I (Perigoso)</option>
                <option value="Classe II-A">Classe II-A (Não Inerte)</option>
                <option value="Classe II-B">Classe II-B (Inerte)</option>
                <option value="Logística Reversa">Logística Reversa</option>
              </select>
            </div>
          </div>

          {/* Tabela de Manifestos MTR */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Número MTR & Sistema</th>
                    <th className="py-3.5 px-4">Gerador (Origem)</th>
                    <th className="py-3.5 px-4">Destinador & Tecnologia</th>
                    <th className="py-3.5 px-4">Código IBAMA & Resíduo</th>
                    <th className="py-3.5 px-4 text-right">Peso (Ton)</th>
                    <th className="py-3.5 px-4">Veículo & Motorista</th>
                    <th className="py-3.5 px-4 text-center">Status MTR</th>
                    <th className="py-3.5 px-4">Certificado CDF</th>
                    <th className="py-3.5 px-4 text-center">Ações Oficiais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredMtrs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileCheck2 className="w-8 h-8 text-slate-600" />
                          <p>Nenhum manifesto MTR encontrado com os critérios pesquisados.</p>
                          <button
                            onClick={() => setIsNewMtrModalOpen(true)}
                            className="mt-2 px-3 py-1.5 rounded-lg bg-ambipar-500/20 text-ambipar-400 border border-ambipar-500/30 text-xs font-semibold hover:bg-ambipar-500/30 transition"
                          >
                            Registrar Primeiro MTR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMtrs.map((m) => {
                      const badge = getStatusColor(m.status);
                      const isPerigoso = m.classeResiduo?.includes('Classe I') || m.codigoIbama.includes('*');

                      return (
                        <tr key={m.id} className="hover:bg-slate-800/40 transition">
                          {/* Número MTR */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{m.numeroMTR}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                {m.sistemaEmissor}
                              </span>
                              {m.chaveAcessoMtr && (
                                <span className="text-[9px] font-mono text-slate-500 truncate max-w-[90px]" title={`Chave: ${m.chaveAcessoMtr}`}>
                                  #{m.chaveAcessoMtr.slice(0, 8)}...
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Gerador */}
                          <td className="py-3.5 px-4 max-w-[200px]">
                            <div className="text-slate-200 font-semibold truncate" title={m.gerador}>
                              {m.gerador}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {m.cnpjGerador ? `CNPJ: ${m.cnpjGerador}` : m.municipioUfGerador || 'Licença Ativa'}
                            </div>
                          </td>

                          {/* Destinador & Tecnologia */}
                          <td className="py-3.5 px-4 max-w-[200px]">
                            <div className="text-slate-300 font-medium truncate" title={m.destinador}>
                              {m.destinador}
                            </div>
                            <div className="text-[10px] text-ambipar-400/90 truncate flex items-center gap-1 mt-0.5">
                              <Recycle className="w-3 h-3 shrink-0" />
                              <span>{m.tecnologiaDestinacao || 'Coprocessamento'}</span>
                            </div>
                          </td>

                          {/* Resíduo e Código IBAMA */}
                          <td className="py-3.5 px-4 max-w-[220px]">
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">
                                {m.codigoIbama}
                              </span>
                              {isPerigoso && (
                                <span className="text-[9px] px-1 py-0.5 rounded font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  Classe I
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5" title={m.descricaoResiduo}>
                              {m.descricaoResiduo}
                            </div>
                          </td>

                          {/* Quantidade */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="font-bold text-white font-mono text-xs">{formatNumber(m.quantidadeTon)} t</div>
                            <div className="text-[10px] text-slate-500">{m.tipoAcondicionamento?.split(' ')[0] || 'Granel'}</div>
                          </td>

                          {/* Veículo & Motorista */}
                          <td className="py-3.5 px-4">
                            {m.placaCavalo ? (
                              <div>
                                <span className="font-mono font-bold text-slate-200 text-xs bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                  {m.placaCavalo}
                                </span>
                                <div className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[120px]">
                                  {m.motoristaNome || 'Motorista MOPP'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">Não vinculado</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                              {m.status}
                            </span>
                            <div className="text-[9px] text-slate-500 mt-1">Val: {m.dataValidadeMTR}</div>
                          </td>

                          {/* CDF */}
                          <td className="py-3.5 px-4">
                            {m.numeroCDF ? (
                              <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-[110px]" title={m.numeroCDF}>{m.numeroCDF}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  const cdfNum = prompt(
                                    'Digite o número do Certificado CDF gerado pelo destinador:',
                                    `CDF-SINIR-2026-${Math.floor(1000 + Math.random() * 9000)}`
                                  );
                                  if (cdfNum) {
                                    onUpdateMtrStatus(m.id, 'CDF Gerado', cdfNum);
                                  }
                                }}
                                className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold transition"
                              >
                                + Baixar CDF
                              </button>
                            )}
                          </td>

                          {/* Ações */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Visualizar / Imprimir A4 Oficial */}
                              <button
                                onClick={() => setSelectedMtrForPrint(m)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Visualizar e Imprimir MTR Oficial (A4)"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Atualizar Status */}
                              {m.status === 'Emitido no SINIR' && (
                                <button
                                  onClick={() => onUpdateMtrStatus(m.id, 'Em Transporte')}
                                  className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-semibold transition"
                                  title="Iniciar Transporte"
                                >
                                  Em Rota
                                </button>
                              )}

                              {m.status === 'Em Transporte' && (
                                <button
                                  onClick={() => onUpdateMtrStatus(m.id, 'Recebido no Destino')}
                                  className="px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-semibold transition"
                                  title="Confirmar Descarga no Destinador"
                                >
                                  Recebido
                                </button>
                              )}

                              {/* Excluir */}
                              {onDeleteMtr && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Deseja realmente excluir o MTR ${m.numeroMTR}?`)) {
                                      onDeleteMtr(m.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                                  title="Excluir MTR"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-ABA 2: CERTIFICADOS DE DESTINAÇÃO FINAL (CDF)
          ========================================================= */}
      {activeSubTab === 'cdfs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Certificados de Destinação Final Homologados (CDF)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprovantes legais de descarte e tratamento definitivo exigidos pela Política Nacional de Resíduos Sólidos (PNRS).
              </p>
            </div>

            <button
              onClick={() => setIsNewCdfModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Novo CDF Vinculado</span>
            </button>
          </div>

          {/* Cards de CDFs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cdfs.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-400">Nenhum Certificado CDF emitido até o momento.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Os CDFs são gerados pelo destinador final para atestar o tratamento ou coprocessamento dos resíduos recebidos via MTR.
                </p>
                <button
                  onClick={() => setIsNewCdfModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/20 transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Primeiro CDF</span>
                </button>
              </div>
            ) : (
              cdfs.map((cdf) => (
                <div key={cdf.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {cdf.sistemaEmissor}
                      </span>
                      <h4 className="text-sm font-bold text-white font-mono mt-1.5">{cdf.numeroCDF}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{cdf.status}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Destinador Emissor:</span>
                      <div className="text-slate-200 font-semibold truncate">{cdf.destinadorRazaoSocial}</div>
                      <div className="text-[10px] text-slate-400">Licença: {cdf.destinadorLicencaOperacao}</div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Gerador Beneficiado:</span>
                      <div className="text-slate-300 truncate">{cdf.geradorRazaoSocial}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-semibold">Tecnologia:</span>
                        <div className="text-ambipar-400 text-[11px] font-medium truncate">{cdf.tecnologiaDestinacao}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] uppercase font-semibold">Peso Homologado:</span>
                        <div className="text-white font-mono font-bold">{formatNumber(cdf.pesoTotalHomologadoTon)} t</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Responsável Técnico & ART:</span>
                      <div className="text-slate-300 text-[11px] font-medium">{cdf.responsavelTecnicoNome}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {cdf.responsavelTecnicoConselho} {cdf.responsavelTecnicoNumero} • ART: {cdf.numeroArt}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase font-semibold">MTRs Cobertos ({cdf.mtrsVinculados.length}):</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cdf.mtrsVinculados.slice(0, 3).map((mtrNum, idx) => (
                          <span key={idx} className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                            {mtrNum}
                          </span>
                        ))}
                        {cdf.mtrsVinculados.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-medium">+{cdf.mtrsVinculados.length - 3} mais</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Emitido em: {cdf.dataEmissao}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedCdfForPrint(cdf)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir CDF (A4)</span>
                      </button>
                      {onDeleteCdf && (
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir o CDF ${cdf.numeroCDF}?`)) {
                              onDeleteCdf(cdf.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-ABA 3: LICENÇAS AMBIENTAIS & REGULARIDADE (IBAMA / CETESB)
          ========================================================= */}
      {activeSubTab === 'licencas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Radar de Regularidade Ambiental & Certificações Inmetro</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Controle rigoroso das autorizações do IBAMA, Licenças de Operação estaduais (CETESB/INEA/FEPAM), CIPP, CIV e SASSMAQ.
              </p>
            </div>

            <button
              onClick={() => setIsNewLicencaModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Licença / Certificado</span>
            </button>
          </div>

          {/* Cards Grid de Licenças */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {licencas.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-400">Nenhuma licença ambiental ou certificado registrado.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Cadastre as licenças de transporte interestadual do IBAMA, licenças estaduais e laudos CIPP/CIV da frota.
                </p>
                <button
                  onClick={() => setIsNewLicencaModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/20 transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Primeira Licença</span>
                </button>
              </div>
            ) : (
              licencas.map((lic) => {
                const badge = getStatusColor(lic.status);
                const hoje = new Date();
                const dataVal = new Date(lic.dataValidade);
                const diasRestantes = Math.ceil((dataVal.getTime() - hoje.getTime()) / (1000 * 86400));

                return (
                  <div key={lic.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-xs">
                        {lic.placa ? lic.placa : lic.entidade || 'Empresa'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {lic.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-slate-200 font-semibold">{lic.tipoDocumento}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {lic.orgaoEmissor ? `${lic.orgaoEmissor} • ` : ''}Nº {lic.numeroCertificado}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Vencimento:</span>
                      <strong className="text-white font-mono">{lic.dataValidade}</strong>
                    </div>

                    {/* Barra / Dias Restantes */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-500">Validade restante:</span>
                        <span className={`font-bold font-mono ${diasRestantes <= 0 ? 'text-rose-400' : diasRestantes <= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {diasRestantes <= 0 ? 'Expirada' : `${diasRestantes} dias`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            diasRestantes <= 0 ? 'w-full bg-rose-500' : diasRestantes <= 30 ? 'w-1/4 bg-amber-500' : 'w-full bg-emerald-500'
                          }`}
                        ></div>
                      </div>
                    </div>

                    {onDeleteLicenca && (
                      <div className="pt-2 border-t border-slate-800 flex justify-end">
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir a licença ${lic.numeroCertificado}?`)) {
                              onDeleteLicenca(lic.id);
                            }
                          }}
                          className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          DRAWER / GUIA INTERATIVO DE CÓDIGOS IBAMA
          ========================================================= */}
      {showIbamaGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Catálogo Oficial de Códigos IBAMA (IN 13/2012)</h3>
                  <p className="text-[11px] text-slate-400">Classificação ABNT NBR 10004 & Regulamento ANTT para resíduos perigosos</p>
                </div>
              </div>
              <button onClick={() => setShowIbamaGuide(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtros do Catálogo */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar código (ex: 13 02 05* ou 'óleo')..."
                  value={ibamaSearchTerm}
                  onChange={(e) => setIbamaSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400"
                />
              </div>

              <select
                value={ibamaCategoryFilter}
                onChange={(e) => setIbamaCategoryFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Todos">Todas as Categorias</option>
                <option value="Óleos & Lubrificantes">Óleos & Lubrificantes</option>
                <option value="Filtros & Embalagens Contaminadas">Filtros & Embalagens</option>
                <option value="Efluentes & Lodos Químicos">Efluentes & Lodos</option>
                <option value="Solventes & Químicos">Solventes & Químicos</option>
                <option value="Solos & Contaminações">Solos & Contaminações</option>
                <option value="Não Perigosos / Recicláveis">Não Perigosos / Recicláveis</option>
              </select>
            </div>

            {/* Lista dos Códigos */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {IBAMA_CATALOG.filter((item) => {
                const matchSearch =
                  item.code.toLowerCase().includes(ibamaSearchTerm.toLowerCase()) ||
                  item.desc.toLowerCase().includes(ibamaSearchTerm.toLowerCase());
                const matchCat = ibamaCategoryFilter === 'Todos' || item.categoria === ibamaCategoryFilter;
                return matchSearch && matchCat;
              }).map((item) => (
                <div key={item.code} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs border border-emerald-500/20">
                        {item.code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.categoria}
                      </span>
                      {item.code.includes('*') && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Resíduo Perigoso
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white font-medium">{item.desc}</div>
                    <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-3">
                      <span>Classe: <strong className="text-slate-300">{item.classe}</strong></span>
                      {item.onu && <span>ANTT: <strong className="text-amber-400">{item.onu} ({item.classeOnu})</strong></span>}
                      <span>Destinação Sugerida: <strong className="text-ambipar-400">{item.tecnologiaSug}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        codigoIbama: `${item.code} - ${item.desc.slice(0, 45)}...`,
                        descricaoResiduo: item.desc,
                        classeResiduo: item.classe as any,
                        numeroOnu: item.onu || 'UN 3082',
                        classeRiscoOnu: item.classeOnu || 'Classe 9',
                        tecnologiaDestinacao: (item.tecnologiaSug as any) || 'Coprocessamento em Forno de Clínquer',
                      }));
                      setShowIbamaGuide(false);
                      setIsNewMtrModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs shrink-0 transition"
                  >
                    Usar no MTR
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE EMISSÃO / CADASTRO DE MTR OFICIAL
          ========================================================= */}
      {isNewMtrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-6 space-y-4 max-h-[92vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-ambipar-500/10 text-ambipar-400 flex items-center justify-center border border-ambipar-500/20">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Registrar Manifesto de Transporte de Resíduos (MTR)</h3>
                  <p className="text-xs text-slate-400">Padronizado com a Portaria MMA 280/2020 e Sistemas Estaduais Integrados</p>
                </div>
              </div>
              <button onClick={() => setIsNewMtrModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMtr} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Seção 1: Dados do Manifesto & Sistema */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-ambipar-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  1. Dados do Manifesto & Sistema Emissor
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Número do MTR *</label>
                    <input
                      type="text"
                      required
                      value={formData.numeroMTR}
                      onChange={(e) => setFormData({ ...formData, numeroMTR: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Sistema Integrado</label>
                    <select
                      value={formData.sistemaEmissor}
                      onChange={(e) => setFormData({ ...formData, sistemaEmissor: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="SINIR (Federal)">SINIR (Federal - MMA)</option>
                      <option value="SIGOR (CETESB SP)">SIGOR (CETESB - São Paulo)</option>
                      <option value="FEPAM (RS)">FEPAM (Rio Grande do Sul)</option>
                      <option value="INEA (RJ)">INEA (Rio de Janeiro)</option>
                      <option value="FEAM (MG)">FEAM (Minas Gerais)</option>
                      <option value="IMA (SC)">IMA (Santa Catarina)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Tipo de Manifesto</label>
                    <select
                      value={formData.tipoManifesto}
                      onChange={(e) => setFormData({ ...formData, tipoManifesto: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="MTR Inicial (Padrão)">MTR Inicial (Padrão)</option>
                      <option value="MTR Complementar">MTR Complementar</option>
                      <option value="MTR Provisório">MTR Provisório</option>
                      <option value="MTR de Armazenamento Temporário">MTR de Armazenamento Temporário</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Data de Emissão</label>
                    <input
                      type="date"
                      value={formData.dataEmissao}
                      onChange={(e) => setFormData({ ...formData, dataEmissao: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Data de Validade (SINIR)</label>
                    <input
                      type="date"
                      value={formData.dataValidadeMTR}
                      onChange={(e) => setFormData({ ...formData, dataValidadeMTR: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Gerador e Destinador */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  2. Gerador (Origem) & Destinador Final
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Gerador */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Gerador do Resíduo (Razão Social) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Petroquímica Paulista S.A."
                        value={formData.gerador}
                        onChange={(e) => setFormData({ ...formData, gerador: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">CNPJ Gerador</label>
                        <input
                          type="text"
                          placeholder="00.000.000/0001-00"
                          value={formData.cnpjGerador}
                          onChange={(e) => setFormData({ ...formData, cnpjGerador: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Município / UF</label>
                        <input
                          type="text"
                          placeholder="Ex: Paulínia - SP"
                          value={formData.municipioUfGerador}
                          onChange={(e) => setFormData({ ...formData, municipioUfGerador: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Destinador */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Destinador Final *</label>
                      <input
                        type="text"
                        required
                        value={formData.destinador}
                        onChange={(e) => setFormData({ ...formData, destinador: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">CNPJ Destinador</label>
                        <input
                          type="text"
                          value={formData.cnpjDestinador}
                          onChange={(e) => setFormData({ ...formData, cnpjDestinador: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Licença Operação</label>
                        <input
                          type="text"
                          value={formData.licencaDestinador}
                          onChange={(e) => setFormData({ ...formData, licencaDestinador: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Transporte & Frota Ambipar */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  3. Transporte Operacional (Ambipar Logistics)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Placa Cavalo (Tração)</label>
                    {veiculos.length > 0 ? (
                      <select
                        value={formData.placaCavalo}
                        onChange={(e) => setFormData({ ...formData, placaCavalo: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      >
                        <option value="">Selecione da Frota...</option>
                        {veiculos.map((v) => (
                          <option key={v.id} value={v.placa}>
                            {v.placa} - {v.modelo} ({v.tipoEquipamento})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Ex: ABC-1234 ou BRA2E19"
                        value={formData.placaCavalo}
                        onChange={(e) => setFormData({ ...formData, placaCavalo: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Placa Carreta / Reboque</label>
                    <input
                      type="text"
                      placeholder="Ex: XYZ-9876"
                      value={formData.placaCarreta}
                      onChange={(e) => setFormData({ ...formData, placaCarreta: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Motorista com MOPP</label>
                    {motoristas.length > 0 ? (
                      <select
                        value={formData.motoristaNome}
                        onChange={(e) => setFormData({ ...formData, motoristaNome: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="">Selecione o Motorista...</option>
                        {motoristas.map((m) => (
                          <option key={m.id} value={m.nome}>
                            {m.nome} (CNH: {m.categoriaCnh} - MOPP Ativo)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nome do motorista condutor"
                        value={formData.motoristaNome}
                        onChange={(e) => setFormData({ ...formData, motoristaNome: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Seção 4: Detalhamento do Resíduo */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Recycle className="w-3.5 h-3.5" />
                    4. Caracterização do Resíduo & Normas ABNT / ANTT
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowIbamaGuide(true)}
                    className="text-[10px] text-ambipar-400 hover:text-ambipar-300 font-semibold flex items-center gap-1 underline"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Consultar Códigos IBAMA</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Código Oficial IBAMA *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 13 02 05* - Óleos minerais não clorados"
                      value={formData.codigoIbama}
                      onChange={(e) => setFormData({ ...formData, codigoIbama: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Classe de Resíduo (NBR 10004)</label>
                    <select
                      value={formData.classeResiduo}
                      onChange={(e) => setFormData({ ...formData, classeResiduo: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Classe I - Perigoso (Inflamável / Tóxico)">Classe I - Perigoso (Inflamável / Tóxico)</option>
                      <option value="Classe I - Químico Industrial">Classe I - Químico Industrial</option>
                      <option value="Classe II-A - Não Inerte (Orgânico / Industrial)">Classe II-A - Não Inerte (Orgânico / Industrial)</option>
                      <option value="Classe II-B - Inerte">Classe II-B - Inerte</option>
                      <option value="Logística Reversa / Eletrônicos">Logística Reversa / Eletrônicos</option>
                      <option value="Material Valorizado (Coprocessamento)">Material Valorizado (Coprocessamento)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Descrição Comercial & Química do Resíduo *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ex: Borra oleosa recuperada de lavagem de tanques industriais contendo hidrocarbonetos..."
                    value={formData.descricaoResiduo}
                    onChange={(e) => setFormData({ ...formData, descricaoResiduo: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Estado Físico</label>
                    <select
                      value={formData.estadoFisico}
                      onChange={(e) => setFormData({ ...formData, estadoFisico: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Líquido">Líquido</option>
                      <option value="Sólido">Sólido</option>
                      <option value="Pastoso / Semissólido">Pastoso / Semissólido</option>
                      <option value="Lodo / Sedimento">Lodo / Sedimento</option>
                      <option value="Granel">Granel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Acondicionamento</label>
                    <select
                      value={formData.tipoAcondicionamento}
                      onChange={(e) => setFormData({ ...formData, tipoAcondicionamento: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Carreta Tanque Inox Granel">Carreta Tanque Inox Granel</option>
                      <option value="Caçamba Estanque Roll-on">Caçamba Estanque Roll-on</option>
                      <option value="IBC 1.000 Litros Homologado">IBC 1.000 Litros Homologado</option>
                      <option value="Tambores 200 Litros Metálicos/Plásticos">Tambores 200 Litros</option>
                      <option value="Big Bag Homologado">Big Bag Homologado</option>
                      <option value="Bombonas 50 Litros">Bombonas 50 Litros</option>
                      <option value="Paletes Enlonados">Paletes Enlonados</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Quantidade (Ton) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.quantidadeTon}
                      onChange={(e) => setFormData({ ...formData, quantidadeTon: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Volume (m³)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.volumeM3}
                      onChange={(e) => setFormData({ ...formData, volumeM3: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Tecnologia de Destinação</label>
                    <select
                      value={formData.tecnologiaDestinacao}
                      onChange={(e) => setFormData({ ...formData, tecnologiaDestinacao: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Coprocessamento em Forno de Clínquer">Coprocessamento em Clínquer</option>
                      <option value="Incineração Térmica de Resíduos Perigosos">Incineração Térmica</option>
                      <option value="Aterro Industrial Classe I (Perigoso)">Aterro Industrial Classe I</option>
                      <option value="Aterro Classe II-A (Não Inerte)">Aterro Classe II-A</option>
                      <option value="Tratamento Físico-Químico / ETE Industrial">Tratamento Físico-Químico</option>
                      <option value="Rerrefino de Óleo Lubrificante Usado (OLUC)">Rerrefino (OLUC)</option>
                      <option value="Descaracterização & Logística Reversa">Descaracterização / Log. Reversa</option>
                      <option value="Compostagem / Tratamento Biológico">Compostagem / Biológico</option>
                      <option value="Reciclagem & Beneficiamento de Materiais">Reciclagem & Beneficiamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Número ONU (ANTT)</label>
                    <input
                      type="text"
                      placeholder="Ex: UN 3082 ou UN 1993"
                      value={formData.numeroOnu}
                      onChange={(e) => setFormData({ ...formData, numeroOnu: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Status Inicial MTR</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Emitido no SINIR">Emitido no SINIR</option>
                      <option value="Em Transporte">Em Transporte</option>
                      <option value="Recebido no Destino">Recebido no Destino</option>
                      <option value="CDF Gerado">CDF Gerado</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewMtrModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold shadow-lg shadow-ambipar-500/20"
                >
                  Confirmar Emissão do MTR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE CADASTRO / EMISSÃO DE CERTIFICADO CDF
          ========================================================= */}
      {isNewCdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Registrar Certificado de Destinação Final (CDF)</h3>
                  <p className="text-xs text-slate-400">Comprovação técnica com Responsabilidade Técnica (CRQ / CREA / ART)</p>
                </div>
              </div>
              <button onClick={() => setIsNewCdfModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCdf} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Número do CDF *</label>
                  <input
                    type="text"
                    required
                    value={cdfFormData.numeroCDF}
                    onChange={(e) => setCdfFormData({ ...cdfFormData, numeroCDF: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sistema Emissor</label>
                  <select
                    value={cdfFormData.sistemaEmissor}
                    onChange={(e) => setCdfFormData({ ...cdfFormData, sistemaEmissor: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="SINIR (Federal)">SINIR (Federal)</option>
                    <option value="SIGOR (CETESB SP)">SIGOR (CETESB SP)</option>
                    <option value="FEPAM (RS)">FEPAM (RS)</option>
                    <option value="INEA (RJ)">INEA (RJ)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Destinador Emissor *</label>
                  <input
                    type="text"
                    required
                    value={cdfFormData.destinadorRazaoSocial}
                    onChange={(e) => setCdfFormData({ ...cdfFormData, destinadorRazaoSocial: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">CNPJ Destinador</label>
                    <input
                      type="text"
                      value={cdfFormData.destinadorCnpj}
                      onChange={(e) => setCdfFormData({ ...cdfFormData, destinadorCnpj: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Licença de Operação (LO)</label>
                    <input
                      type="text"
                      value={cdfFormData.destinadorLicencaOperacao}
                      onChange={(e) => setCdfFormData({ ...cdfFormData, destinadorLicencaOperacao: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Gerador Beneficiado (Cliente) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Razão social do gerador"
                    value={cdfFormData.geradorRazaoSocial}
                    onChange={(e) => setCdfFormData({ ...cdfFormData, geradorRazaoSocial: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">CNPJ Gerador</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={cdfFormData.geradorCnpj}
                    onChange={(e) => setCdfFormData({ ...cdfFormData, geradorCnpj: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tecnologia Aplicada</label>
                  <select
                    value={cdfFormData.tecnologiaDestinacao}
                    onChange={(e) => setCdfFormData({ ...cdfFormData, tecnologiaDestinacao: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Coprocessamento em Forno de Clínquer">Coprocessamento em Clínquer</option>
                    <option value="Incineração Térmica de Resíduos Perigosos">Incineração Térmica</option>
                    <option value="Aterro Industrial Classe I (Perigoso)">Aterro Industrial Classe I</option>
                    <option value="Aterro Classe II-A (Não Inerte)">Aterro Classe II-A</option>
                    <option value="Tratamento Físico-Químico / ETE Industrial">Tratamento Físico-Químico</option>
                    <option value="Rerrefino de Óleo Lubrificante Usado (OLUC)">Rerrefino (OLUC)</option>
                    <option value="Reciclagem & Beneficiamento de Materiais">Reciclagem & Beneficiamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Peso Total Homologado (Ton)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cdfFormData.pesoTotalHomologadoTon}
                    onChange={(e) => setCdfFormData({ ...cdfFormData, pesoTotalHomologadoTon: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Seleção de MTRs para Vinculação */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Vincular MTRs ({cdfFormData.mtrsVinculados?.length || 0} selecionados)
                </label>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  {mtrs.length === 0 ? (
                    <div className="text-slate-500 text-center py-2">Nenhum MTR disponível no sistema.</div>
                  ) : (
                    mtrs.map((m) => {
                      const isSelected = cdfFormData.mtrsVinculados?.includes(m.numeroMTR);
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            const cur = cdfFormData.mtrsVinculados || [];
                            const updated = isSelected ? cur.filter((x) => x !== m.numeroMTR) : [...cur, m.numeroMTR];
                            // Recalcula peso
                            const pesoTotal = mtrs
                              .filter((x) => updated.includes(x.numeroMTR))
                              .reduce((acc, curr) => acc + (Number(curr.quantidadeTon) || 0), 0);

                            setCdfFormData({
                              ...cdfFormData,
                              mtrsVinculados: updated,
                              pesoTotalHomologadoTon: pesoTotal,
                              geradorRazaoSocial: cdfFormData.geradorRazaoSocial || m.gerador,
                              geradorCnpj: cdfFormData.geradorCnpj || m.cnpjGerador,
                            });
                          }}
                          className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition ${
                            isSelected ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={isSelected} readOnly className="rounded accent-emerald-500" />
                            <span className="font-mono font-bold">{m.numeroMTR}</span>
                            <span className="text-slate-400 truncate max-w-[150px]">{m.gerador}</span>
                          </div>
                          <span className="font-mono font-bold text-white">{formatNumber(m.quantidadeTon)} t</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Responsável Técnico */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Responsabilidade Técnica (ART / RRT)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Nome do Responsável</label>
                    <input
                      type="text"
                      value={cdfFormData.responsavelTecnicoNome}
                      onChange={(e) => setCdfFormData({ ...cdfFormData, responsavelTecnicoNome: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Conselho / Registro</label>
                    <input
                      type="text"
                      placeholder="Ex: CRQ IV 0421892"
                      value={`${cdfFormData.responsavelTecnicoConselho || ''} ${cdfFormData.responsavelTecnicoNumero || ''}`}
                      onChange={(e) => setCdfFormData({ ...cdfFormData, responsavelTecnicoNumero: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Número da ART</label>
                    <input
                      type="text"
                      value={cdfFormData.numeroArt}
                      onChange={(e) => setCdfFormData({ ...cdfFormData, numeroArt: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCdfModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  Homologar CDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE CADASTRO DE LICENÇA AMBIENTAL / CERTIFICADO
          ========================================================= */}
      {isNewLicencaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Cadastrar Licença ou Certificado</h3>
              </div>
              <button onClick={() => setIsNewLicencaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLicenca} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Entidade / Vinculação</label>
                <select
                  value={licencaFormData.entidade}
                  onChange={(e) => setLicencaFormData({ ...licencaFormData, entidade: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Veículo da Frota">Veículo da Frota</option>
                  <option value="Empresa Ambipar">Empresa Ambipar (Matriz / Filial)</option>
                  <option value="Base Operacional">Base Operacional</option>
                </select>
              </div>

              {licencaFormData.entidade === 'Veículo da Frota' && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Placa do Veículo</label>
                  {veiculos.length > 0 ? (
                    <select
                      value={licencaFormData.placa}
                      onChange={(e) => setLicencaFormData({ ...licencaFormData, placa: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    >
                      <option value="">Selecione o Veículo...</option>
                      {veiculos.map((v) => (
                        <option key={v.id} value={v.placa}>
                          {v.placa} - {v.modelo}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Ex: ABC-1234"
                      value={licencaFormData.placa}
                      onChange={(e) => setLicencaFormData({ ...licencaFormData, placa: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                    />
                  )}
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tipo de Licença / Documento *</label>
                <select
                  value={licencaFormData.tipoDocumento}
                  onChange={(e) => setLicencaFormData({ ...licencaFormData, tipoDocumento: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="CIPP (Produtos Perigosos Granel - Inmetro)">CIPP (Produtos Perigosos Granel - Inmetro)</option>
                  <option value="CIPP (Produtos Perigosos Fracionado)">CIPP (Produtos Perigosos Fracionado)</option>
                  <option value="CIV (Certificado de Inspeção Veicular - Inmetro)">CIV (Inspeção Veicular - Inmetro)</option>
                  <option value="Licença Operacional de Transporte (IBAMA)">Licença de Transporte (IBAMA)</option>
                  <option value="Licença de Operação Estadual (CETESB SP)">Licença CETESB (São Paulo)</option>
                  <option value="Licença Ambiental Estadual (INEA RJ)">Licença INEA (Rio de Janeiro)</option>
                  <option value="Licença Ambiental Estadual (FEPAM RS)">Licença FEPAM (Rio Grande do Sul)</option>
                  <option value="Licença Ambiental Estadual (FEAM MG)">Licença FEAM (Minas Gerais)</option>
                  <option value="CTF/APP IBAMA (Certificado de Regularidade)">CTF/APP IBAMA (Certificado Regularidade)</option>
                  <option value="Certificação SASSMAQ Rodoviário">Certificação SASSMAQ Rodoviário</option>
                  <option value="Cronotacógrafo Inmetro">Cronotacógrafo Inmetro</option>
                  <option value="AET (Autorização Especial de Trânsito)">AET (Autorização Especial Trânsito)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Número do Certificado *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: CIPP-2026-9812"
                    value={licencaFormData.numeroCertificado}
                    onChange={(e) => setLicencaFormData({ ...licencaFormData, numeroCertificado: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Órgão Emissor</label>
                  <input
                    type="text"
                    placeholder="Ex: INMETRO / IBAMA"
                    value={licencaFormData.orgaoEmissor}
                    onChange={(e) => setLicencaFormData({ ...licencaFormData, orgaoEmissor: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Data de Emissão</label>
                  <input
                    type="date"
                    value={licencaFormData.dataEmissao}
                    onChange={(e) => setLicencaFormData({ ...licencaFormData, dataEmissao: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Data de Validade *</label>
                  <input
                    type="date"
                    required
                    value={licencaFormData.dataValidade}
                    onChange={(e) => setLicencaFormData({ ...licencaFormData, dataValidade: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewLicencaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20"
                >
                  Salvar Licença
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE IMPRESSÃO A4 OFICIAL: MANIFESTO MTR (SINIR / SIGOR)
          ========================================================= */}
      {selectedMtrForPrint && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-4 sm:p-6 space-y-4 max-h-[95vh] flex flex-col shadow-2xl">
            {/* Barra de Controle de Impressão */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-ambipar-400" />
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Dossiê Oficial: Manifesto de Transporte de Resíduos (MTR)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir em A4</span>
                </button>
                <button
                  onClick={() => setSelectedMtrForPrint(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Documento Estilizado em A4 (Fundo Branco para Impressão Perfeita) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 rounded-2xl font-sans text-xs space-y-4 shadow-inner border border-slate-300">
              {/* Cabeçalho do MTR */}
              <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-slate-950 text-emerald-400 font-black text-xl flex items-center justify-center tracking-tighter">
                    AMB
                  </div>
                  <div>
                    <h1 className="font-black text-sm uppercase tracking-tight text-slate-950">
                      AMBIPAR WASTE MANAGEMENT LOGISTICS
                    </h1>
                    <div className="text-[11px] font-bold text-slate-700">
                      SISTEMA NACIONAL DE INFORMAÇÕES SOBRE A GESTÃO DOS RESÍDUOS SÓLIDOS (SINIR)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Portaria MMA nº 280/2020 • Resolução CONAMA • ANTT Resolução nº 5998/22
                    </div>
                  </div>
                </div>

                <div className="text-right border-l-2 border-slate-200 pl-4">
                  <div className="text-[10px] font-bold uppercase text-slate-500">MANIFESTO DE TRANSPORTE (MTR)</div>
                  <div className="text-base font-black font-mono text-slate-950">{selectedMtrForPrint.numeroMTR}</div>
                  <div className="text-[10px] font-mono text-slate-600">Sistema: {selectedMtrForPrint.sistemaEmissor}</div>
                  {selectedMtrForPrint.chaveAcessoMtr && (
                    <div className="text-[9px] font-mono text-slate-500">Chave: {selectedMtrForPrint.chaveAcessoMtr}</div>
                  )}
                </div>
              </div>

              {/* Bloco 1: Gerador */}
              <div className="border border-slate-300 rounded p-2.5 space-y-1">
                <div className="font-bold text-[11px] uppercase bg-slate-100 p-1 rounded text-slate-800">
                  1. IDENTIFICAÇÃO DO GERADOR (ORIGEM DO RESÍDUO)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Razão Social:</span>
                    <strong className="text-[11px]">{selectedMtrForPrint.gerador}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">CNPJ do Gerador:</span>
                    <strong className="font-mono text-[11px]">{selectedMtrForPrint.cnpjGerador || '12.345.678/0001-90'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Município / UF:</span>
                    <strong className="text-[11px]">{selectedMtrForPrint.municipioUfGerador || 'São Paulo - SP'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Licença Ambiental (LO):</span>
                    <span className="text-[11px] font-mono">{selectedMtrForPrint.licencaGerador || 'LO nº 4589/2023'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Responsável pela Expedição:</span>
                    <span className="text-[11px]">{selectedMtrForPrint.responsavelGeradorNome || 'Coordenação de EHS'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Data de Emissão:</span>
                    <span className="text-[11px] font-mono font-bold">{selectedMtrForPrint.dataEmissao}</span>
                  </div>
                </div>
              </div>

              {/* Bloco 2: Transportador */}
              <div className="border border-slate-300 rounded p-2.5 space-y-1">
                <div className="font-bold text-[11px] uppercase bg-slate-100 p-1 rounded text-slate-800">
                  2. IDENTIFICAÇÃO DO TRANSPORTADOR (LOGÍSTICA AMBIPAR)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-500 uppercase block">Razão Social:</span>
                    <strong className="text-[11px]">{selectedMtrForPrint.transportadorNome || 'Ambipar Waste Management Logistics S.A.'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">CNPJ Transportador:</span>
                    <strong className="font-mono text-[11px]">{selectedMtrForPrint.cnpjTransportador || '09.289.479/0001-38'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">RNTRC (ANTT):</span>
                    <span className="font-mono text-[11px]">{selectedMtrForPrint.rntrcTransportador || '04892182'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Placa Tração (Cavalo):</span>
                    <strong className="font-mono text-[11px]">{selectedMtrForPrint.placaCavalo || 'NÃO INFORMADA'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Placa Carreta / Reboque:</span>
                    <strong className="font-mono text-[11px]">{selectedMtrForPrint.placaCarreta || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Motorista Condutor:</span>
                    <span className="text-[11px]">{selectedMtrForPrint.motoristaNome || 'Condutor Habilitado MOPP'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Licença de Transporte:</span>
                    <span className="text-[10px] font-mono">{selectedMtrForPrint.licencaOperacaoTransporte || 'IBAMA LO nº 2410/2024'}</span>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Destinador */}
              <div className="border border-slate-300 rounded p-2.5 space-y-1">
                <div className="font-bold text-[11px] uppercase bg-slate-100 p-1 rounded text-slate-800">
                  3. IDENTIFICAÇÃO DO DESTINADOR FINAL & TECNOLOGIA APLICADA
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-500 uppercase block">Razão Social do Destinador:</span>
                    <strong className="text-[11px]">{selectedMtrForPrint.destinador}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">CNPJ Destinador:</span>
                    <strong className="font-mono text-[11px]">{selectedMtrForPrint.cnpjDestinador || '09.289.479/0002-19'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Município / UF:</span>
                    <span className="text-[11px]">{selectedMtrForPrint.municipioUfDestinador || 'Nova Odessa - SP'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Licença de Operação (LO):</span>
                    <span className="text-[11px] font-mono">{selectedMtrForPrint.licencaDestinador || 'CETESB LO nº 31004812'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Tecnologia de Destinação:</span>
                    <strong className="text-[11px] text-emerald-800">{selectedMtrForPrint.tecnologiaDestinacao || 'Coprocessamento em Forno de Clínquer'}</strong>
                  </div>
                </div>
              </div>

              {/* Bloco 4: Caracterização do Resíduo */}
              <div className="border border-slate-300 rounded p-2.5 space-y-1">
                <div className="font-bold text-[11px] uppercase bg-slate-100 p-1 rounded text-slate-800">
                  4. CARACTERIZAÇÃO DO RESÍDUO (LISTA BRASILEIRA DE RESÍDUOS - IN IBAMA 13/2012)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-500 uppercase block">Código Oficial IBAMA:</span>
                    <strong className="font-mono text-[11px] text-emerald-800">{selectedMtrForPrint.codigoIbama}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Classe NBR 10004:</span>
                    <strong className="text-[11px]">{selectedMtrForPrint.classeResiduo || 'Classe I - Perigoso'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Estado Físico:</span>
                    <span className="text-[11px]">{selectedMtrForPrint.estadoFisico || 'Líquido'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-500 uppercase block">Descrição Detalhada do Resíduo:</span>
                    <span className="text-[11px]">{selectedMtrForPrint.descricaoResiduo}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Acondicionamento:</span>
                    <span className="text-[11px]">{selectedMtrForPrint.tipoAcondicionamento || 'Carreta Tanque Inox Granel'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Quantidade Total:</span>
                    <strong className="font-mono text-sm text-slate-950">{formatNumber(selectedMtrForPrint.quantidadeTon)} Toneladas</strong>
                  </div>
                </div>
              </div>

              {/* Bloco 5: Regulamento ANTT (Produtos Perigosos) */}
              <div className="border border-slate-300 rounded p-2.5 space-y-1 bg-amber-50/50">
                <div className="font-bold text-[10px] uppercase text-amber-900 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>5. REGULAMENTAÇÃO DE PRODUTOS PERIGOSOS (ANTT 5998/22)</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-0.5 text-[10px]">
                  <div>
                    <span className="text-slate-500 uppercase block">Número ONU:</span>
                    <strong className="font-mono">{selectedMtrForPrint.numeroOnu || 'UN 3082'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block">Classe de Risco:</span>
                    <span>{selectedMtrForPrint.classeRiscoOnu || 'Classe 9'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block">Grupo Embalagem:</span>
                    <span className="font-mono font-bold">{selectedMtrForPrint.grupoEmbalagemOnu || 'III'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block">Painel de Segurança:</span>
                    <span className="font-mono font-bold">90 / 3082</span>
                  </div>
                </div>
              </div>

              {/* Bloco 6: Declaração & Assinaturas */}
              <div className="pt-3 border-t-2 border-slate-900 space-y-6">
                <p className="text-[9px] text-slate-600 text-justify leading-relaxed">
                  DECLARAÇÃO DO GERADOR E TRANSPORTADOR: Declaramos que os resíduos descritos neste Manifesto foram devidamente classificados,
                  acondicionados, rotulados e sinalizados de acordo com as normas da ABNT e resoluções da ANTT e dos órgãos ambientais competentes.
                  O transportador Ambipar declara possuir autorização ambiental válida e equipamentos inspecionados para a presente operação.
                </p>

                <div className="grid grid-cols-3 gap-6 pt-4 text-center">
                  <div className="border-t border-slate-400 pt-2">
                    <div className="font-bold text-[10px]">{selectedMtrForPrint.gerador}</div>
                    <div className="text-[9px] text-slate-500">Expedidor / Gerador do Resíduo</div>
                    <div className="text-[8px] text-slate-400 mt-1">Data: ____/____/2026</div>
                  </div>

                  <div className="border-t border-slate-400 pt-2">
                    <div className="font-bold text-[10px]">Ambipar Waste Management Logistics</div>
                    <div className="text-[9px] text-slate-500">Condutor / Transportador MOPP</div>
                    <div className="text-[8px] text-slate-400 mt-1">Data: ____/____/2026</div>
                  </div>

                  <div className="border-t border-slate-400 pt-2">
                    <div className="font-bold text-[10px]">{selectedMtrForPrint.destinador}</div>
                    <div className="text-[9px] text-slate-500">Recebedor / Destinador Final</div>
                    <div className="text-[8px] text-slate-400 mt-1">Data: ____/____/2026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE IMPRESSÃO A4 OFICIAL: CERTIFICADO CDF
          ========================================================= */}
      {selectedCdfForPrint && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-4 sm:p-6 space-y-4 max-h-[95vh] flex flex-col shadow-2xl">
            {/* Barra de Controle de Impressão */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Dossiê Oficial: Certificado de Destinação Final (CDF)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Certificado (A4)</span>
                </button>
                <button
                  onClick={() => setSelectedCdfForPrint(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Folha Timbrada CDF em A4 */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-10 bg-white text-slate-900 rounded-2xl font-sans text-xs space-y-6 shadow-inner border-2 border-emerald-700">
              {/* Topo do Certificado */}
              <div className="border-b-2 border-emerald-800 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-emerald-950 text-emerald-400 font-black text-2xl flex items-center justify-center">
                    AMB
                  </div>
                  <div>
                    <h1 className="font-black text-base uppercase text-emerald-950 tracking-tight">
                      AMBIPAR ENVIRONMENT & WASTE VALORIZATION
                    </h1>
                    <div className="text-[11px] font-bold text-slate-700">
                      CENTRO DE VALORIZAÇÃO, TRATAMENTO & COPROCESSAMENTO DE RESÍDUOS
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Sistema Integrado SINIR / SIGOR • Política Nacional de Resíduos Sólidos (Lei 12.305/2010)
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-emerald-800">CERTIFICADO OFICIAL</div>
                  <div className="text-lg font-black font-mono text-emerald-950">{selectedCdfForPrint.numeroCDF}</div>
                  <div className="text-[10px] text-slate-500">Emissão: {selectedCdfForPrint.dataEmissao}</div>
                </div>
              </div>

              {/* Título de Homologação */}
              <div className="text-center py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <h2 className="text-base font-black uppercase text-emerald-950 tracking-wider">
                  CERTIFICADO DE DESTINAÇÃO FINAL DE RESÍDUOS (CDF)
                </h2>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  Atestado de Conformidade Ambiental, Rastreabilidade e Destinação Legal
                </span>
              </div>

              {/* Texto Legal Declaratório */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-justify text-[11px] leading-relaxed text-slate-800">
                Certificamos para os devidos fins legais, fiscais e ambientais, em atendimento à Política Nacional de Resíduos Sólidos
                (Lei Federal nº 12.305/2010), ao Decreto Federal nº 10.936/2022 e à Portaria MMA nº 280/2020, que os resíduos descritos
                neste certificado, gerados por <strong>{selectedCdfForPrint.geradorRazaoSocial}</strong> (CNPJ: <strong>{selectedCdfForPrint.geradorCnpj || 'Inscrito'}</strong>),
                foram devidamente recebidos e submetidos ao processo definitivo de <strong>{selectedCdfForPrint.tecnologiaDestinacao}</strong>
                nas instalações industriais licenciadas da <strong>{selectedCdfForPrint.destinadorRazaoSocial}</strong>, sob a Licença de Operação
                <strong> {selectedCdfForPrint.destinadorLicencaOperacao}</strong>.
              </div>

              {/* Tabela dos Manifestos MTR Cobertos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase text-slate-800">
                    Manifestos de Transporte (MTR) Vinculados a Este Certificado:
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-700">
                    Total: {selectedCdfForPrint.mtrsVinculados.length} MTR(s)
                  </span>
                </div>

                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700">
                    <tr>
                      <th className="py-2 px-3">Número MTR</th>
                      <th className="py-2 px-3">Sistema Emissor</th>
                      <th className="py-2 px-3">Tecnologia Aplicada</th>
                      <th className="py-2 px-3 text-right">Status do Recebimento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedCdfForPrint.mtrsVinculados.map((mtrNum, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{mtrNum}</td>
                        <td className="py-2 px-3 text-slate-600">{selectedCdfForPrint.sistemaEmissor}</td>
                        <td className="py-2 px-3 text-emerald-800 font-semibold">{selectedCdfForPrint.tecnologiaDestinacao}</td>
                        <td className="py-2 px-3 text-right text-emerald-700 font-bold">100% Homologado</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totalizador de Toneladas */}
              <div className="p-4 bg-emerald-950 text-white rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-400">PESO TOTAL HOMOLOGADO NESTE CDF:</div>
                  <div className="text-xs text-slate-300">Destinação final definitiva concluída sem passivo ambiental</div>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-300">
                  {formatNumber(selectedCdfForPrint.pesoTotalHomologadoTon)} TONELADAS
                </div>
              </div>

              {/* Responsabilidade Técnica e Assinatura */}
              <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center pt-8">
                <div>
                  <div className="border-t border-slate-500 pt-2">
                    <div className="font-bold text-xs text-slate-950">{selectedCdfForPrint.responsavelTecnicoNome}</div>
                    <div className="text-[10px] text-slate-600">
                      Responsável Técnico • {selectedCdfForPrint.responsavelTecnicoConselho} nº {selectedCdfForPrint.responsavelTecnicoNumero}
                    </div>
                    <div className="text-[10px] font-mono font-semibold text-emerald-900">
                      ART nº {selectedCdfForPrint.numeroArt}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="border-t border-slate-500 pt-2">
                    <div className="font-bold text-xs text-slate-950">{selectedCdfForPrint.destinadorRazaoSocial}</div>
                    <div className="text-[10px] text-slate-600">Diretoria de Operações & Meio Ambiente Ambipar</div>
                    <div className="text-[10px] text-slate-500">Chave de Autenticidade Digital SINIR</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
