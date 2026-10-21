import React, { useState } from 'react';
import {
  Motorista,
  Veiculo,
  StatusMotorista,
  RegimeContratacaoMotorista,
  CategoriaCnh,
  FuncaoTripulante,
} from '../types';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calendar,
  Truck,
  X,
  Phone,
  ShieldCheck,
  Download,
  Printer,
  Edit2,
  Trash2,
  Eye,
  Award,
  AlertOctagon,
  HeartPulse,
  HardHat,
  Flame,
  MessageCircle,
  Filter,
  FileSpreadsheet,
  Check,
  BadgeAlert,
  Building,
  UserCheck,
  Activity,
  Car,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
  Clock,
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export type TipoStatusEscala = 'viagem' | 'patio' | 'dsr' | 'standby' | 'ferias';

export const CONFIG_ESCALA: Record<
  TipoStatusEscala,
  { label: string; sigla: string; bg: string; text: string; border: string; dot: string; horas: number }
> = {
  viagem: {
    label: 'Em Viagem',
    sigla: 'VIAG',
    bg: 'bg-blue-500/15 hover:bg-blue-500/25',
    text: 'text-blue-300',
    border: 'border-blue-500/40',
    dot: 'bg-blue-400',
    horas: 8,
  },
  patio: {
    label: 'Pátio / Base',
    sigla: 'PÁTIO',
    bg: 'bg-emerald-500/15 hover:bg-emerald-500/25',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-400',
    horas: 8,
  },
  dsr: {
    label: 'DSR (Descanso)',
    sigla: 'DSR',
    bg: 'bg-purple-500/20 hover:bg-purple-500/30',
    text: 'text-purple-300',
    border: 'border-purple-500/50',
    dot: 'bg-purple-400',
    horas: 0,
  },
  standby: {
    label: 'Stand-by / Plantão',
    sigla: 'PLANT',
    bg: 'bg-amber-500/15 hover:bg-amber-500/25',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    dot: 'bg-amber-400',
    horas: 4,
  },
  ferias: {
    label: 'Férias / Afast.',
    sigla: 'FÉRIAS',
    bg: 'bg-slate-700/30 hover:bg-slate-700/50',
    text: 'text-slate-400',
    border: 'border-slate-700',
    dot: 'bg-slate-500',
    horas: 0,
  },
};

export const PROXIMO_STATUS_ESCALA: Record<TipoStatusEscala, TipoStatusEscala> = {
  viagem: 'patio',
  patio: 'dsr',
  dsr: 'standby',
  standby: 'ferias',
  ferias: 'viagem',
};

export const getDiasSemanaOffset = (offsetSemanas: number) => {
  const hoje = new Date();
  const hojeIso = hoje.toISOString().slice(0, 10);
  const diaSemanaIndex = hoje.getDay();
  const diffSegunda = hoje.getDate() - (diaSemanaIndex === 0 ? 6 : diaSemanaIndex - 1) + (offsetSemanas * 7);
  const segunda = new Date(hoje.getFullYear(), hoje.getMonth(), diffSegunda);

  const nomes = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const nomesCompletos = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo',
  ];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(segunda.getFullYear(), segunda.getMonth(), segunda.getDate() + i);
    const diaIso = d.toISOString().slice(0, 10);
    const diaMes = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      indice: i,
      sigla: nomes[i],
      nomeCompleto: nomesCompletos[i],
      dataIso: diaIso,
      diaMes,
      isHoje: diaIso === hojeIso,
    };
  });
};

interface MotoristasViewProps {
  motoristas: Motorista[];
  veiculos: Veiculo[];
  onAddMotorista: (motorista: Motorista) => void;
  onUpdateMotorista?: (motorista: Motorista) => void;
  onDeleteMotorista?: (id: string) => void;
  onUpdateMotoristaStatus: (id: string, status: Motorista['status']) => void;
}

export const MotoristasView: React.FC<MotoristasViewProps> = ({
  motoristas,
  veiculos,
  onAddMotorista,
  onUpdateMotorista,
  onDeleteMotorista,
  onUpdateMotoristaStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('TODAS');
  const [regimeFilter, setRegimeFilter] = useState<string>('TODOS');
  const [funcaoFilter, setFuncaoFilter] = useState<string>('TODAS');
  const [viewMode, setViewMode] = useState<'grid' | 'tabela' | 'escala'>('grid');

  // Estados da Escala Semanal & DSR (Lei 13.103/2015)
  const [offsetSemana, setOffsetSemana] = useState(0);
  const [escalaPorMotorista, setEscalaPorMotorista] = useState<Record<string, TipoStatusEscala[]>>(() => {
    try {
      const raw = localStorage.getItem('ambipar_escala_semanal_v3');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const handleSalvarEscala = (novaEscala: Record<string, TipoStatusEscala[]>) => {
    setEscalaPorMotorista(novaEscala);
    try {
      localStorage.setItem('ambipar_escala_semanal_v3', JSON.stringify(novaEscala));
    } catch (e) {
      console.error(e);
    }
  };

  const getEscalaMotorista = (motoristaId: string, indexPadrao = 0): TipoStatusEscala[] => {
    const chave = `${motoristaId}_sem_${offsetSemana}`;
    if (escalaPorMotorista[chave]) return escalaPorMotorista[chave];
    const padroes: TipoStatusEscala[][] = [
      ['viagem', 'viagem', 'viagem', 'viagem', 'patio', 'dsr', 'dsr'],
      ['viagem', 'viagem', 'viagem', 'viagem', 'viagem', 'patio', 'dsr'],
      ['patio', 'viagem', 'viagem', 'viagem', 'viagem', 'dsr', 'standby'],
      ['standby', 'viagem', 'viagem', 'viagem', 'viagem', 'patio', 'dsr'],
    ];
    return padroes[indexPadrao % padroes.length];
  };

  const handleAlternarDiaEscala = (motoristaId: string, diaIndice: number, indexPadrao: number) => {
    const chave = `${motoristaId}_sem_${offsetSemana}`;
    const atual = getEscalaMotorista(motoristaId, indexPadrao);
    const novoStatus = PROXIMO_STATUS_ESCALA[atual[diaIndice]] || 'viagem';
    const novaLista = [...atual];
    novaLista[diaIndice] = novoStatus;
    handleSalvarEscala({ ...escalaPorMotorista, [chave]: novaLista });
  };

  const handleAutoBalancearEscala = () => {
    const nova: Record<string, TipoStatusEscala[]> = { ...escalaPorMotorista };
    filtered.forEach((m, idx) => {
      const chave = `${m.id}_sem_${offsetSemana}`;
      const padroes: TipoStatusEscala[][] = [
        ['viagem', 'viagem', 'viagem', 'viagem', 'patio', 'dsr', 'dsr'],
        ['viagem', 'viagem', 'viagem', 'viagem', 'viagem', 'patio', 'dsr'],
        ['patio', 'viagem', 'viagem', 'viagem', 'viagem', 'dsr', 'standby'],
        ['standby', 'viagem', 'viagem', 'viagem', 'viagem', 'patio', 'dsr'],
      ];
      nova[chave] = padroes[idx % padroes.length];
    });
    handleSalvarEscala(nova);
  };

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dossieMotorista, setDossieMotorista] = useState<Motorista | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'pessoal' | 'contrato' | 'cnh' | 'certificados'>('pessoal');

  // Form State
  const initialFormState: Partial<Motorista> = {
    nome: '',
    funcao: 'Motorista Titular' as FuncaoTripulante,
    cpf: '',
    rg: '',
    telefone: '',
    email: '',
    contatoEmergenciaNome: '',
    contatoEmergenciaTelefone: '',
    contatoEmergenciaParentesco: 'Cônjuge',
    tipoSanguineo: 'O+',
    matricula: `AMB-${Math.floor(1000 + Math.random() * 9000)}`,
    dataAdmissao: new Date().toISOString().slice(0, 10),
    regimeContratacao: 'CLT Ambipar',
    baseOperacional: 'Base Central Paulínia/Campinas',
    veiculoFixoPlaca: veiculos[0]?.placa || '',
    status: 'Ativo',
    cnh: '',
    categoriaCnh: 'E',
    validadeCnh: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    dataPrimeiraCnh: '2012-05-10',
    orgaoEmissorCnh: 'DETRAN/SP',
    pontuacaoAtualCnh: 0,
    exerceAtividadeRemunerada: true,
    validadeMopp: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    validadeToxico: new Date(Date.now() + 180 * 86400 * 1000).toISOString().slice(0, 10),
    validadeAso: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    validadeNr20: new Date(Date.now() + 730 * 86400 * 1000).toISOString().slice(0, 10),
    validadeNr35: new Date(Date.now() + 730 * 86400 * 1000).toISOString().slice(0, 10),
    validadeDirecaoDefensiva: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    mediaConsumoGeral: 2.65,
    scoreEcoconducao: 92,
    viagensRealizadasCount: 0,
    kmTotalRodados: 0,
    observacoes: '',
  };

  const [formData, setFormData] = useState<Partial<Motorista>>(initialFormState);

  // Helper: cálculo de dias para vencimento
  const getValidityMeta = (dateStr?: string) => {
    if (!dateStr) return { label: 'Não informado', status: 'neutro', days: null, badgeClass: 'text-slate-500 bg-slate-800/40 border-slate-700' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Vencido há ${Math.abs(diffDays)}d`,
        status: 'vencido',
        days: diffDays,
        badgeClass: 'text-rose-400 bg-rose-500/15 border-rose-500/40 font-bold',
      };
    }
    if (diffDays <= 30) {
      return {
        label: `Vence em ${diffDays}d`,
        status: 'alerta',
        days: diffDays,
        badgeClass: 'text-amber-400 bg-amber-500/15 border-amber-500/40 font-bold',
      };
    }
    return {
      label: `Regular (${diffDays}d)`,
      status: 'ok',
      days: diffDays,
      badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-medium',
    };
  };

  // Motorista tem algum documento crítico vencido?
  const hasCriticalExpiredDoc = (m: Motorista) => {
    const cnh = getValidityMeta(m.validadeCnh);
    const mopp = getValidityMeta(m.validadeMopp);
    const tox = getValidityMeta(m.validadeToxico);
    const aso = getValidityMeta(m.validadeAso);
    return cnh.status === 'vencido' || mopp.status === 'vencido' || tox.status === 'vencido' || aso.status === 'vencido';
  };

  // Motorista tem documento a vencer nos próximos 30 dias?
  const hasWarningDoc = (m: Motorista) => {
    const cnh = getValidityMeta(m.validadeCnh);
    const mopp = getValidityMeta(m.validadeMopp);
    const tox = getValidityMeta(m.validadeToxico);
    const aso = getValidityMeta(m.validadeAso);
    return cnh.status === 'alerta' || mopp.status === 'alerta' || tox.status === 'alerta' || aso.status === 'alerta';
  };

  // Filtros
  const filtered = motoristas.filter((m) => {
    const matchesSearch =
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cpf.includes(searchTerm) ||
      m.cnh.includes(searchTerm) ||
      (m.matricula && m.matricula.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.baseOperacional.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.funcao && m.funcao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.veiculoFixoPlaca && m.veiculoFixoPlaca.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter === 'Ativo') matchesStatus = m.status === 'Ativo';
    else if (statusFilter === 'Em Férias') matchesStatus = m.status === 'Em Férias';
    else if (statusFilter === 'Afastado') matchesStatus = m.status === 'Afastado';
    else if (statusFilter === 'Bloqueado (Documento Vencido)') matchesStatus = m.status === 'Bloqueado (Documento Vencido)' || hasCriticalExpiredDoc(m);
    else if (statusFilter === 'Alerta Vencimento (≤30d)') matchesStatus = hasWarningDoc(m);

    let matchesCategoria = true;
    if (categoriaFilter !== 'TODAS') matchesCategoria = m.categoriaCnh === categoriaFilter;

    let matchesRegime = true;
    if (regimeFilter !== 'TODOS') matchesRegime = m.regimeContratacao === regimeFilter;

    let matchesFuncao = true;
    if (funcaoFilter !== 'TODAS') {
      const func = m.funcao || 'Motorista Titular';
      matchesFuncao = func === funcaoFilter;
    }

    return matchesSearch && matchesStatus && matchesCategoria && matchesRegime && matchesFuncao;
  });

  // KPI Calculations
  const totalMotoristas = motoristas.length;
  const titularesCount = motoristas.filter((m) => !m.funcao || m.funcao === 'Motorista Titular').length;
  const segundoMotoristaCount = motoristas.filter((m) => m.funcao === 'Segundo Motorista (Revezamento)').length;
  const ajudantesCount = motoristas.filter((m) => m.funcao === 'Ajudante Operacional / Transbordo').length;
  const ativosCount = motoristas.filter((m) => m.status === 'Ativo' && !hasCriticalExpiredDoc(m)).length;
  const vencidosCount = motoristas.filter((m) => hasCriticalExpiredDoc(m) || m.status === 'Bloqueado (Documento Vencido)').length;
  const alertasVencimentoCount = motoristas.filter((m) => hasWarningDoc(m) && !hasCriticalExpiredDoc(m)).length;
  const cltCount = motoristas.filter((m) => (m.regimeContratacao || 'CLT Ambipar') === 'CLT Ambipar').length;

  const scoreMedioFrota = motoristas.length > 0
    ? Math.round(motoristas.reduce((acc, m) => acc + (m.scoreEcoconducao || 90), 0) / motoristas.length)
    : 100;

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setActiveFormTab('pessoal');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: Motorista) => {
    setEditingId(m.id);
    setFormData({ ...m, funcao: m.funcao || 'Motorista Titular' });
    setActiveFormTab('pessoal');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAjudante = formData.funcao === 'Ajudante Operacional / Transbordo';

    if (!formData.nome || !formData.cpf) {
      alert('Preencha os campos obrigatórios: Nome Completo e CPF.');
      return;
    }

    if (!isAjudante && !formData.cnh) {
      alert('Para motoristas condutores (Titular ou 2º Motorista), a CNH é obrigatória.');
      return;
    }

    const cnhFinal = isAjudante ? (formData.cnh?.trim() || 'NÃO APLICÁVEL (AJUDANTE)') : formData.cnh!.trim();
    const categoriaFinal = isAjudante ? ('Não Aplicável (Ajudante)' as CategoriaCnh) : ((formData.categoriaCnh || 'E') as CategoriaCnh);
    const validadeCnhFinal = isAjudante ? (formData.validadeCnh || '2099-12-31') : (formData.validadeCnh || '');
    const validadeMoppFinal = isAjudante ? (formData.validadeMopp || '2099-12-31') : (formData.validadeMopp || '');
    const validadeToxicoFinal = isAjudante ? (formData.validadeToxico || '2099-12-31') : (formData.validadeToxico || '');

    const tempMotoristaParaVerificacao: Motorista = {
      ...(formData as Motorista),
      funcao: formData.funcao || 'Motorista Titular',
      cnh: cnhFinal,
      categoriaCnh: categoriaFinal,
      validadeCnh: validadeCnhFinal,
      validadeMopp: validadeMoppFinal,
      validadeToxico: validadeToxicoFinal,
    };

    const isBlocked = !isAjudante && hasCriticalExpiredDoc(tempMotoristaParaVerificacao);
    const finalStatus: StatusMotorista = isBlocked
      ? 'Bloqueado (Documento Vencido)'
      : (formData.status as StatusMotorista) || 'Ativo';

    if (editingId) {
      // Edit
      const updatedMot: Motorista = {
        ...(formData as Motorista),
        id: editingId,
        funcao: formData.funcao || 'Motorista Titular',
        cnh: cnhFinal,
        categoriaCnh: categoriaFinal,
        validadeCnh: validadeCnhFinal,
        validadeMopp: validadeMoppFinal,
        validadeToxico: validadeToxicoFinal,
        status: finalStatus,
      };
      if (onUpdateMotorista) {
        onUpdateMotorista(updatedMot);
      } else {
        // Fallback
        onAddMotorista(updatedMot);
      }
    } else {
      // Create
      const newMot: Motorista = {
        ...(formData as Motorista),
        id: `mot-${Date.now()}`,
        nome: formData.nome.trim(),
        funcao: formData.funcao || 'Motorista Titular',
        cpf: formData.cpf.trim(),
        cnh: cnhFinal,
        categoriaCnh: categoriaFinal,
        validadeCnh: validadeCnhFinal,
        validadeMopp: validadeMoppFinal,
        validadeToxico: validadeToxicoFinal,
        baseOperacional: formData.baseOperacional || 'Base Regional Paulínia',
        status: finalStatus,
        mediaConsumoGeral: Number(formData.mediaConsumoGeral) || 2.65,
        scoreEcoconducao: Number(formData.scoreEcoconducao) || 90,
        viagensRealizadasCount: Number(formData.viagensRealizadasCount) || 0,
        kmTotalRodados: Number(formData.kmTotalRodados) || 0,
      };
      onAddMotorista(newMot);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Deseja realmente excluir o motorista ${nome}? Esta ação removerá o histórico cadastral.`)) {
      if (onDeleteMotorista) {
        onDeleteMotorista(id);
      }
    }
  };

  // Exportar Relatório em CSV para Auditoria
  const handleExportCsv = () => {
    if (motoristas.length === 0) {
      alert('Nenhum motorista cadastrado para exportação.');
      return;
    }

    const headers = [
      'Matrícula',
      'Nome Completo',
      'CPF',
      'RG',
      'Telefone',
      'Regime',
      'Base Operacional',
      'Placa Veiculo Fixo',
      'CNH',
      'Categoria CNH',
      'Validade CNH',
      'Validade MOPP',
      'Validade Toxico',
      'Validade ASO',
      'Status Operacional',
      'Score Ecoconducao',
      'Media km/L',
    ];

    const rows = motoristas.map((m) => [
      `"${m.matricula || ''}"`,
      `"${m.nome}"`,
      `"${m.cpf}"`,
      `"${m.rg || ''}"`,
      `"${m.telefone || ''}"`,
      `"${m.regimeContratacao || 'CLT Ambipar'}"`,
      `"${m.baseOperacional}"`,
      `"${m.veiculoFixoPlaca || 'Rotativo'}"`,
      `"${m.cnh}"`,
      `"${m.categoriaCnh}"`,
      `"${m.validadeCnh}"`,
      `"${m.validadeMopp}"`,
      `"${m.validadeToxico}"`,
      `"${m.validadeAso || ''}"`,
      `"${m.status}"`,
      `"${m.scoreEcoconducao || 90}"`,
      `"${m.mediaConsumoGeral || 2.65}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ambipar_Motoristas_Compliance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-ambipar-400" />
            <span>Gestão Operacional de Motoristas & Conformidade SASSMAQ / MOPP</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle de condutores habilitados CNH D/E, certificações obrigatórias de produtos perigosos, exames toxicológicos, ASO e ecocondução Ambipar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Exportar planilha para auditoria SASSMAQ / ANTT"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Motorista</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Efetivo de Tripulação</span>
            <Users className="w-4 h-4 text-ambipar-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalMotoristas}</div>
          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5">
            <span className="text-cyan-400 font-bold">{titularesCount} Titulares</span>
            <span>&bull;</span>
            <span className="text-purple-400 font-bold">{segundoMotoristaCount} 2º Motoristas</span>
            <span>&bull;</span>
            <span className="text-amber-400 font-bold">{ajudantesCount} Ajudantes</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Prontos para Escala (100% OK)</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{ativosCount}</div>
          <div className="text-[11px] text-slate-500">
            {totalMotoristas > 0 ? `${Math.round((ativosCount / totalMotoristas) * 100)}%` : '100%'} da equipe disponível sem restrições
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Vencimentos &lt; 30 Dias</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{alertasVencimentoCount}</div>
          <div className="text-[11px] text-slate-500">MOPP, CNH, Toxicológico ou ASO no prazo crítico</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Bloqueios Críticos / Vencidos</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className={`text-2xl font-black ${vencidosCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
            {vencidosCount}
          </div>
          <div className="text-[11px] text-slate-500">
            {vencidosCount > 0 ? '🚨 Impedidos de assumir direção por lei' : 'Nenhum bloqueio legal vigente'}
          </div>
        </div>
      </div>

      {/* Filter and View Switcher Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, CNH, função, matrícula, base ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Filtro por Função Operacional */}
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <Users className="w-3.5 h-3.5 text-ambipar-400" />
            <select
              value={funcaoFilter}
              onChange={(e) => setFuncaoFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="TODAS" className="bg-slate-900 text-white">Função: Todas</option>
              <option value="Motorista Titular" className="bg-slate-900 text-cyan-400">Motoristas Titulares</option>
              <option value="Segundo Motorista (Revezamento)" className="bg-slate-900 text-purple-400">2º Motoristas (Revezamento)</option>
              <option value="Ajudante Operacional / Transbordo" className="bg-slate-900 text-amber-400">Ajudantes Operacionais</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Status: Todos</option>
              <option value="Ativo" className="bg-slate-900 text-emerald-400">Status: Ativos Regulares</option>
              <option value="Alerta Vencimento (≤30d)" className="bg-slate-900 text-amber-400">Status: A vencer em 30d</option>
              <option value="Bloqueado (Documento Vencido)" className="bg-slate-900 text-rose-400">Status: Bloqueados / Vencidos</option>
              <option value="Em Férias" className="bg-slate-900 text-blue-400">Status: Em Férias</option>
              <option value="Afastado" className="bg-slate-900 text-slate-400">Status: Afastados</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <span className="text-slate-400 font-medium">Cat:</span>
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="TODAS" className="bg-slate-900 text-white">Todas CNH</option>
              <option value="E" className="bg-slate-900 text-white">Cat. E (Articulados)</option>
              <option value="D" className="bg-slate-900 text-white">Cat. D (Pesados)</option>
              <option value="C" className="bg-slate-900 text-white">Cat. C (Médios)</option>
              <option value="Não Aplicável (Ajudante)" className="bg-slate-900 text-amber-400">Não Aplicável (Ajudante)</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <span className="text-slate-400 font-medium">Regime:</span>
            <select
              value={regimeFilter}
              onChange={(e) => setRegimeFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todos Regimes</option>
              <option value="CLT Ambipar" className="bg-slate-900 text-white">CLT Ambipar</option>
              <option value="Agregado" className="bg-slate-900 text-white">Agregado</option>
              <option value="Terceirizado" className="bg-slate-900 text-white">Terceirizado</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl p-0.5 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid' ? 'bg-ambipar-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('tabela')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'tabela' ? 'bg-ambipar-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tabela Auditoria
            </button>
            <button
              onClick={() => setViewMode('escala')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'escala' ? 'bg-ambipar-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Escala &amp; DSR (Lei 13.103)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhum motorista encontrado</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'TODOS'
              ? 'Nenhum motorista atende aos critérios de pesquisa ou filtros selecionados.'
              : 'Cadastre os condutores operacionais com controle rigoroso de CNH, MOPP, exames toxicológicos e veículos alocados.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Motorista</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid of Driver Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m) => {
            const isBlocked = hasCriticalExpiredDoc(m) || m.status === 'Bloqueado (Documento Vencido)';
            const isWarning = hasWarningDoc(m);
            const cnhMeta = getValidityMeta(m.validadeCnh);
            const moppMeta = getValidityMeta(m.validadeMopp);
            const toxicoMeta = getValidityMeta(m.validadeToxico);
            const asoMeta = getValidityMeta(m.validadeAso);

            const score = m.scoreEcoconducao || 90;
            const scoreColor = score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-400';
            const scoreBg = score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-rose-500';

            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl bg-slate-900 border transition shadow-sm space-y-4 flex flex-col justify-between ${
                  isBlocked
                    ? 'border-rose-500/50 bg-gradient-to-b from-rose-950/20 to-slate-900 shadow-rose-950/20'
                    : isWarning
                    ? 'border-amber-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Bar: Avatar, Names, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-slate-950 text-sm shadow-md ${
                          m.funcao === 'Segundo Motorista (Revezamento)'
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-700 text-white'
                            : m.funcao === 'Ajudante Operacional / Transbordo'
                            ? 'bg-gradient-to-br from-amber-500 to-orange-700 text-slate-950'
                            : 'bg-gradient-to-br from-ambipar-500 via-emerald-600 to-teal-800 text-slate-950'
                        }`}>
                          {m.funcao === 'Ajudante Operacional / Transbordo' ? (
                            <HardHat className="w-6 h-6 text-slate-950" />
                          ) : (
                            m.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-slate-950 px-1 py-0.2 rounded border border-slate-700 text-amber-400">
                          {m.funcao === 'Ajudante Operacional / Transbordo' ? 'Ajud.' : `Cat.${m.categoriaCnh}`}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-white text-sm tracking-tight">
                            {m.nome}
                          </h4>
                          {m.funcao === 'Segundo Motorista (Revezamento)' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              2º Motorista
                            </span>
                          )}
                          {m.funcao === 'Ajudante Operacional / Transbordo' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Ajudante
                            </span>
                          )}
                          {(!m.funcao || m.funcao === 'Motorista Titular') && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              Titular
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{m.matricula || 'MAT-AMB'}</span>
                          <span>&bull;</span>
                          <span className="text-slate-300 font-medium">{m.regimeContratacao || 'CLT Ambipar'}</span>
                        </div>
                      </div>
                    </div>

                    <select
                      value={m.status}
                      onChange={(e) => onUpdateMotoristaStatus(m.id, e.target.value as any)}
                      className={`text-[10px] font-bold rounded-lg px-2 py-1 border bg-slate-950 focus:outline-none cursor-pointer ${
                        m.status === 'Ativo' && !isBlocked
                          ? 'text-emerald-400 border-emerald-500/40'
                          : m.status === 'Em Férias'
                          ? 'text-blue-400 border-blue-500/40'
                          : m.status === 'Afastado'
                          ? 'text-slate-400 border-slate-600'
                          : 'text-rose-400 border-rose-500/50 bg-rose-950/40'
                      }`}
                    >
                      <option value="Ativo">Ativo (Apto)</option>
                      <option value="Em Férias">Em Férias</option>
                      <option value="Afastado">Afastado</option>
                      <option value="Bloqueado (Documento Vencido)">Bloqueado</option>
                    </select>
                  </div>

                  {/* Impediment Alert Banner if any document is expired */}
                  {isBlocked && (
                    <div className="mt-3 p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center gap-2 text-[11px] text-rose-300 font-semibold animate-pulse">
                      <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Bloqueio Operacional: Documento obrigatório vencido!</span>
                    </div>
                  )}

                  {/* Allocation and Vehicle info */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Veículo Alocado</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Truck className="w-3.5 h-3.5 text-ambipar-400" />
                        <span className="font-mono font-bold text-white text-xs">
                          {m.veiculoFixoPlaca || 'Rotativo / Pool'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Base Operacional</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-300 text-xs truncate max-w-[120px]" title={m.baseOperacional}>
                          {m.baseOperacional}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Radar Box (CNH, MOPP, Toxico, ASO) */}
                  <div className="mt-3 space-y-2 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>CNH {m.cnh || '---'} (Cat. {m.categoriaCnh}):</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${cnhMeta.badgeClass}`}>
                        {cnhMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Curso MOPP (Prod. Perigosos):</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${moppMeta.badgeClass}`}>
                        {moppMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Exame Toxicológico:</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${toxicoMeta.badgeClass}`}>
                        {toxicoMeta.label}
                      </span>
                    </div>

                    {m.validadeAso && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                          <span>Saúde Ocupacional (ASO):</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${asoMeta.badgeClass}`}>
                          {asoMeta.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Telemetry and Ecocondução Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Score Ecocondução:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-xs ${scoreColor}`}>{score}/100</span>
                        <span className="text-[11px] text-emerald-400 font-mono font-bold">
                          {m.mediaConsumoGeral ? `${m.mediaConsumoGeral.toFixed(2)} km/L` : '2.65 km/L'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div className={`h-full rounded-full ${scoreBg}`} style={{ width: `${Math.min(100, score)}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Toolbar */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    {/* WhatsApp Direct Chat */}
                    {m.telefone ? (
                      <a
                        href={`https://wa.me/55${m.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Olá ${m.nome}, aqui é da Torre de Controle e Logística Ambipar.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1 text-[11px] font-semibold"
                        title="Abrir WhatsApp com o motorista"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleOpenEditModal(m)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-slate-400 text-[11px] flex items-center gap-1"
                        title="Adicionar Telefone"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Sem Tel</span>
                      </button>
                    )}

                    {/* Dossiê A4 Modal */}
                    <button
                      onClick={() => setDossieMotorista(m)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition"
                      title="Visualizar e Imprimir Dossiê A4"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Dossiê A4</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEditModal(m)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Editar cadastro do motorista"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-ambipar-400" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(m.id, m.nome)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                      title="Excluir cadastro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'tabela' ? (
        /* Full Audit Compliance Table View */
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Motorista / Matrícula</th>
                <th className="py-3 px-3">Base & Veículo</th>
                <th className="py-3 px-3">CNH (Cat / Venc)</th>
                <th className="py-3 px-3">Curso MOPP</th>
                <th className="py-3 px-3">Toxicológico</th>
                <th className="py-3 px-3">ASO</th>
                <th className="py-3 px-3 text-center">Score Eco</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((m) => {
                const isBlocked = hasCriticalExpiredDoc(m) || m.status === 'Bloqueado (Documento Vencido)';
                const cnhMeta = getValidityMeta(m.validadeCnh);
                const moppMeta = getValidityMeta(m.validadeMopp);
                const toxicoMeta = getValidityMeta(m.validadeToxico);
                const asoMeta = getValidityMeta(m.validadeAso);

                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] text-ambipar-400 font-bold">
                          {m.nome.charAt(0)}
                        </span>
                        <div>
                          <span>{m.nome}</span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {m.matricula || 'MAT-AMB'} &bull; CPF: {m.cpf}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-300 font-mono text-[11px] font-semibold">
                        {m.veiculoFixoPlaca || 'Rotativo'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        {m.baseOperacional}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-white text-[11px]">
                        {m.cnh} (Cat. {m.categoriaCnh})
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border ${cnhMeta.badgeClass}`}>
                        {cnhMeta.label}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${moppMeta.badgeClass}`}>
                        {moppMeta.label}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${toxicoMeta.badgeClass}`}>
                        {toxicoMeta.label}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${asoMeta.badgeClass}`}>
                        {asoMeta.label}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-bold text-emerald-400">
                        {m.scoreEcoconducao || 90}/100
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {m.mediaConsumoGeral ? `${m.mediaConsumoGeral.toFixed(2)} km/L` : '2.65 km/L'}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          isBlocked
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                            : m.status === 'Ativo'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : m.status === 'Em Férias'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isBlocked ? '🚨 Bloqueado' : m.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDossieMotorista(m)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Ver Dossiê A4"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-ambipar-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.nome)}
                          className="p-1 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Escala Semanal & DSR (Lei 13.103/2015) View */
        (() => {
          const diasSemana = getDiasSemanaOffset(offsetSemana);
          const diaHojeIndex = diasSemana.findIndex((d) => d.isHoje);
          const indiceDiaVerificar = diaHojeIndex !== -1 ? diaHojeIndex : 0;

          let emViagemHoje = 0;
          let emPatioHoje = 0;
          let emDsrHoje = 0;
          let emStandbyHoje = 0;
          let conformesDsrCount = 0;

          filtered.forEach((m, idx) => {
            const esc = getEscalaMotorista(m.id, idx);
            const statusHoje = esc[indiceDiaVerificar];
            if (statusHoje === 'viagem') emViagemHoje++;
            if (statusHoje === 'patio') emPatioHoje++;
            if (statusHoje === 'dsr') emDsrHoje++;
            if (statusHoje === 'standby') emStandbyHoje++;

            const dsrCount = esc.filter((s) => s === 'dsr' || s === 'ferias').length;
            if (dsrCount >= 1) conformesDsrCount++;
          });

          const percConformidade =
            filtered.length > 0 ? Math.round((conformesDsrCount / filtered.length) * 100) : 100;

          const handleCompartilharWhatsApp = () => {
            const periodo = `${diasSemana[0].diaMes} a ${diasSemana[6].diaMes}`;
            let texto = `*AMBIPAR LOGISTICS - ESCALA SEMANAL & DSR*\n`;
            texto += `*Período:* ${periodo} | *Base:* Paulínia/SP\n`;
            texto += `*Responsável Técnico:* Carlos Eduardo (Analista de Logística)\n`;
            texto += `*Auditoria:* Conforme Lei 13.103/2015\n\n`;

            filtered.forEach((m, idx) => {
              const esc = getEscalaMotorista(m.id, idx);
              const dsrCount = esc.filter((s) => s === 'dsr' || s === 'ferias').length;
              texto += `🚛 *${m.nome}* (${m.veiculoFixoPlaca || 'Rotativo'})\n`;
              diasSemana.forEach((d, i) => {
                const st = esc[i];
                const emoji =
                  st === 'viagem'
                    ? '🚛'
                    : st === 'patio'
                    ? '🏢'
                    : st === 'dsr'
                    ? '🛌'
                    : st === 'standby'
                    ? '⏱️'
                    : '🏖️';
                texto += `  ${d.sigla} (${d.diaMes}): ${emoji} ${CONFIG_ESCALA[st].label}\n`;
              });
              texto += `  _Status DSR: ${
                dsrCount >= 1 ? '✅ Conforme (Descanso 24h assegurado)' : '⚠️ Alerta DSR Pendente'
              }\n\n`;
            });

            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
            window.open(url, '_blank');
          };

          return (
            <div className="space-y-5">
              {/* Barra Superior: Navegação de Semanas & Ações Rápidas */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
                {/* Seletor de Semana */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setOffsetSemana((prev) => prev - 1)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Semana Anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffsetSemana(0)}
                      className="px-3 py-1 text-xs font-bold text-white hover:bg-slate-800 rounded-lg transition"
                    >
                      Semana Atual
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffsetSemana((prev) => prev + 1)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Próxima Semana"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">
                        {diasSemana[0].diaMes} a {diasSemana[6].diaMes}
                      </span>
                      {offsetSemana === 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                          Semana Vigente
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Escala operacional da tripulação rodoviária e jornada de trabalho
                    </p>
                  </div>
                </div>

                {/* Ações da Escala */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAutoBalancearEscala}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
                    title="Distribui viagens e garante folga DSR para todos os motoristas"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auto-balancear DSR</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCompartilharWhatsApp}
                    className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Equipe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-ambipar-500/20 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Grade A4</span>
                  </button>
                </div>
              </div>

              {/* Faixa de KPIs Operacionais do Dia & Auditoria Trabalhista */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Escalados</span>
                  <strong className="text-xl font-black text-white mt-1 block">
                    {filtered.length} <span className="text-xs font-normal text-slate-500">condutores</span>
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-blue-500/30">
                  <span className="text-[10px] text-blue-400 uppercase font-bold flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Em Viagem Hoje
                  </span>
                  <strong className="text-xl font-black text-blue-300 mt-1 block">{emViagemHoje}</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    No Pátio / Base
                  </span>
                  <strong className="text-xl font-black text-emerald-300 mt-1 block">{emPatioHoje}</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-500/30">
                  <span className="text-[10px] text-purple-400 uppercase font-bold flex items-center gap-1">
                    <HeartPulse className="w-3 h-3" />
                    Em DSR (Descanso)
                  </span>
                  <strong className="text-xl font-black text-purple-300 mt-1 block">{emDsrHoje}</strong>
                </div>

                <div
                  className={`p-3.5 rounded-xl bg-slate-900 border ${
                    percConformidade === 100 ? 'border-emerald-500/40' : 'border-amber-500/40'
                  } col-span-2 sm:col-span-1`}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Conformidade DSR</span>
                  <div className="flex items-center gap-2 mt-1">
                    <strong
                      className={`text-xl font-black ${
                        percConformidade === 100 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {percConformidade}%
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      {conformesDsrCount}/{filtered.length} regulares
                    </span>
                  </div>
                </div>
              </div>

              {/* Alerta Legal: Lei 13.103/2015 */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-ambipar-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white">Auditoria da Lei do Motorista (Lei Federal nº 13.103/2015): </span>
                  O descanso semanal remunerado (DSR) de 24 horas consecutivas é obrigatório no período de 7 dias para transporte rodoviário de cargas. Motoristas sem descanso semanal registrado acusam infração trabalhista e perda de conformidade SASSMAQ.
                </div>
              </div>

              {/* Matriz Interativa da Escala Semanal */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs min-w-[860px]">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-3 min-w-[200px]">Motorista &bull; Veículo</th>
                      {diasSemana.map((dia) => (
                        <th
                          key={dia.dataIso}
                          className={`py-3 px-2 text-center transition ${
                            dia.isHoje ? 'bg-ambipar-950/40 text-ambipar-400 font-black' : ''
                          }`}
                        >
                          <div>{dia.sigla}</div>
                          <div className="text-[10px] font-mono text-slate-400 font-normal">{dia.diaMes}</div>
                        </th>
                      ))}
                      <th className="py-3 px-3 text-center">Horas Previstas</th>
                      <th className="py-3 px-3 text-center min-w-[130px]">Auditoria DSR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filtered.map((m, mIdx) => {
                      const escala = getEscalaMotorista(m.id, mIdx);
                      const totalHoras = escala.reduce((acc, st) => acc + CONFIG_ESCALA[st].horas, 0);
                      const totalDsr = escala.filter((st) => st === 'dsr' || st === 'ferias').length;
                      const hasDsrInfracao = totalDsr === 0;

                      return (
                        <tr
                          key={m.id}
                          className={`hover:bg-slate-800/40 transition ${
                            hasDsrInfracao ? 'bg-rose-950/10' : ''
                          }`}
                        >
                          {/* Coluna Motorista */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-ambipar-400 font-black">
                                {m.nome.charAt(0)}
                              </span>
                              <div>
                                <strong className="text-white font-bold block">{m.nome}</strong>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {m.veiculoFixoPlaca || 'Rotativo'} &bull; {m.funcao || 'Motorista Titular'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 7 Dias da Semana */}
                          {diasSemana.map((dia, diaIdx) => {
                            const statusDia = escala[diaIdx];
                            const cfg = CONFIG_ESCALA[statusDia] || CONFIG_ESCALA.viagem;

                            return (
                              <td
                                key={dia.dataIso}
                                className={`py-2 px-1 text-center ${dia.isHoje ? 'bg-ambipar-950/20' : ''}`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleAlternarDiaEscala(m.id, diaIdx, mIdx)}
                                  className={`w-full py-1.5 px-1.5 rounded-lg border text-[11px] font-bold transition flex items-center justify-center gap-1 active:scale-95 ${cfg.bg} ${cfg.text} ${cfg.border}`}
                                  title={`${cfg.label} (${cfg.horas}h) - Clique para alternar status`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                  <span>{cfg.sigla}</span>
                                </button>
                              </td>
                            );
                          })}

                          {/* Carga Horária Prevista */}
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-bold text-white">{totalHoras}h</span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {totalHoras > 44 ? `+${totalHoras - 44}h extra` : 'Normal 44h'}
                            </span>
                          </td>

                          {/* Auditoria DSR */}
                          <td className="py-3 px-3 text-center">
                            {hasDsrInfracao ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center justify-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                                <span>SEM DSR (0/7d)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>DSR Conforme ({totalDsr}d)</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legenda de Cores & Turnos */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Legenda de Turnos:
                </span>
                <div className="flex items-center gap-4 flex-wrap text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-slate-300">
                      <strong>VIAG:</strong> Em Viagem Rodoviária (8h)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-300">
                      <strong>PÁTIO:</strong> Operacional / Manobra (8h)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span className="text-slate-300">
                      <strong>DSR:</strong> Descanso Semanal 24h (0h)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-slate-300">
                      <strong>PLANT:</strong> Stand-by / Sobreaviso (4h)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                    <span className="text-slate-300">
                      <strong>FÉRIAS:</strong> Ausência Legal (0h)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* =========================================================
          MODAL: CADASTRO & EDIÇÃO COMPLETA DO MOTORISTA
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-4 text-xs shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-ambipar-500/20 border border-ambipar-500/30 flex items-center justify-center text-ambipar-400 font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingId ? 'Editar Motorista Operacional' : 'Cadastrar Novo Motorista Operacional'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Controle cadastral, licenças de produtos perigosos e conformidade regulatória Ambipar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
              {[
                { id: 'pessoal', label: '1. Pessoal & Emergência', icon: Users },
                { id: 'contrato', label: '2. Contrato & Frota', icon: Truck },
                { id: 'cnh', label: '3. Habilitação & CNH', icon: FileCheck },
                { id: 'certificados', label: '4. MOPP & Saúde (SASSMAQ)', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFormTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFormTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-ambipar-600 text-white shadow'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* TAB 1: Pessoal & Emergência */}
              {activeFormTab === 'pessoal' && (
                <div className="space-y-3">
                  {/* Seleção de Função Operacional */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-ambipar-400" />
                        <span>Função Operacional do Tripulante *</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Classificação na Escala & Viagens</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, funcao: 'Motorista Titular', categoriaCnh: formData.categoriaCnh === 'Não Aplicável (Ajudante)' ? 'E' : formData.categoriaCnh })}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          formData.funcao === 'Motorista Titular' || !formData.funcao
                            ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Truck className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Motorista Titular</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">Condutor principal (CNH C/D/E + MOPP)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, funcao: 'Segundo Motorista (Revezamento)', categoriaCnh: formData.categoriaCnh === 'Não Aplicável (Ajudante)' ? 'E' : formData.categoriaCnh })}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          formData.funcao === 'Segundo Motorista (Revezamento)'
                            ? 'bg-purple-500/20 border-purple-500 text-white shadow-sm'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          <span>2º Motorista (Revezamento)</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">Dupla de viagem (CNH C/D/E + MOPP)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, funcao: 'Ajudante Operacional / Transbordo', categoriaCnh: 'Não Aplicável (Ajudante)', cnh: formData.cnh || 'ISENTO (AJUDANTE)' })}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          formData.funcao === 'Ajudante Operacional / Transbordo'
                            ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <HardHat className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ajudante Operacional</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">Carga/descarga/apoio (CNH isenta)</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Nome Completo do Tripulante *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo de Oliveira"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-ambipar-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">CPF *</label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-ambipar-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">RG</label>
                      <input
                        type="text"
                        placeholder="00.000.000-0"
                        value={formData.rg}
                        onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-ambipar-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Tipo Sanguíneo / Fator RH</label>
                      <select
                        value={formData.tipoSanguineo}
                        onChange={(e) => setFormData({ ...formData, tipoSanguineo: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-ambipar-500 focus:outline-none"
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Telefone / WhatsApp do Condutor</label>
                      <input
                        type="text"
                        placeholder="(19) 99876-5432"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-ambipar-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">E-mail</label>
                      <input
                        type="email"
                        placeholder="motorista@ambipar.com ou pessoal"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-ambipar-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Contato de Emergência */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Contato de Emergência 24h (Obrigatório SASSMAQ / PAM)</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-500 text-[10px] mb-0.5">Nome do Contato</label>
                        <input
                          type="text"
                          placeholder="Ex: Maria de Oliveira"
                          value={formData.contatoEmergenciaNome}
                          onChange={(e) => setFormData({ ...formData, contatoEmergenciaNome: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] mb-0.5">Parentesco</label>
                        <select
                          value={formData.contatoEmergenciaParentesco}
                          onChange={(e) => setFormData({ ...formData, contatoEmergenciaParentesco: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs"
                        >
                          {['Cônjuge', 'Mãe / Pai', 'Filho(a)', 'Irmão(ã)', 'Outro'].map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] mb-0.5">Telefone de Emergência</label>
                        <input
                          type="text"
                          placeholder="(19) 98765-4321"
                          value={formData.contatoEmergenciaTelefone}
                          onChange={(e) => setFormData({ ...formData, contatoEmergenciaTelefone: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Contrato & Frota */}
              {activeFormTab === 'contrato' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Matrícula Ambipar</label>
                      <input
                        type="text"
                        placeholder="Ex: AMB-4081"
                        value={formData.matricula}
                        onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Regime de Contratação</label>
                      <select
                        value={formData.regimeContratacao}
                        onChange={(e) => setFormData({ ...formData, regimeContratacao: e.target.value as any })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      >
                        <option value="CLT Ambipar">CLT Ambipar (Efetivo)</option>
                        <option value="Agregado">Agregado (Cavalo Próprio)</option>
                        <option value="Terceirizado">Terceirizado / Subcontratado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Data de Admissão</label>
                      <input
                        type="date"
                        value={formData.dataAdmissao}
                        onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Base Operacional Alocada *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Base Central Paulínia/Campinas"
                        value={formData.baseOperacional}
                        onChange={(e) => setFormData({ ...formData, baseOperacional: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Veículo Fixo Vinculado (Placa)</label>
                      <select
                        value={formData.veiculoFixoPlaca}
                        onChange={(e) => setFormData({ ...formData, veiculoFixoPlaca: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      >
                        <option value="">Nenhum (Rotativo / Pool de Motoristas)</option>
                        {veiculos.map((v) => (
                          <option key={v.id} value={v.placa}>
                            {v.placa} - {v.marca} {v.modelo} ({v.tipoEquipamento})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Status Operacional Inicial</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      >
                        <option value="Ativo">Ativo (Pronto para Viagens)</option>
                        <option value="Em Férias">Em Férias</option>
                        <option value="Afastado">Afastado (Médico/INSS)</option>
                        <option value="Bloqueado (Documento Vencido)">Bloqueado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Score Inicial Telemetria (0 a 100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.scoreEcoconducao}
                        onChange={(e) => setFormData({ ...formData, scoreEcoconducao: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Habilitação & CNH */}
              {activeFormTab === 'cnh' && (
                <div className="space-y-3">
                  {formData.funcao === 'Ajudante Operacional / Transbordo' && (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                      <HardHat className="w-5 h-5 shrink-0 text-amber-400" />
                      <span>
                        <strong>Ajudante Operacional:</strong> CNH de condução é <strong>isenta/opcional</strong>. Caso o ajudante não dirija veículos, pode deixar o campo em branco ou preenchido como "Isento".
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Número CNH {formData.funcao === 'Ajudante Operacional / Transbordo' ? '(Opcional)' : '*'}
                      </label>
                      <input
                        type="text"
                        required={formData.funcao !== 'Ajudante Operacional / Transbordo'}
                        placeholder={formData.funcao === 'Ajudante Operacional / Transbordo' ? 'Isento / Opcional' : 'Ex: 04829104812'}
                        value={formData.cnh}
                        onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Categoria CNH *</label>
                      <select
                        value={formData.categoriaCnh}
                        onChange={(e) => setFormData({ ...formData, categoriaCnh: e.target.value as CategoriaCnh })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                      >
                        <option value="E">Categoria E (Carretas pesadas / Articulados)</option>
                        <option value="D">Categoria D (Caminhões pesados / VUCs)</option>
                        <option value="C">Categoria C (Caminhões médios)</option>
                        <option value="Não Aplicável (Ajudante)">Não Aplicável (Ajudante Operacional)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Validade CNH {formData.funcao === 'Ajudante Operacional / Transbordo' ? '(Opcional)' : '*'}
                      </label>
                      <input
                        type="date"
                        required={formData.funcao !== 'Ajudante Operacional / Transbordo'}
                        value={formData.validadeCnh}
                        onChange={(e) => setFormData({ ...formData, validadeCnh: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Órgão Emissor / UF</label>
                      <input
                        type="text"
                        placeholder="Ex: DETRAN/SP"
                        value={formData.orgaoEmissorCnh}
                        onChange={(e) => setFormData({ ...formData, orgaoEmissorCnh: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">1ª Habilitação (Data)</label>
                      <input
                        type="date"
                        value={formData.dataPrimeiraCnh}
                        onChange={(e) => setFormData({ ...formData, dataPrimeiraCnh: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Pontos Atuais CNH</label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={formData.pontuacaoAtualCnh}
                        onChange={(e) => setFormData({ ...formData, pontuacaoAtualCnh: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">EAR - Exerce Atividade Remunerada</span>
                      <span className="text-[11px] text-slate-400">Consta no campo observações da CNH oficial (obrigatório pelo CTB)</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.exerceAtividadeRemunerada ?? true}
                        onChange={(e) => setFormData({ ...formData, exerceAtividadeRemunerada: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 4: Certificados Obrigatórios & Saúde (MOPP / SASSMAQ) */}
              {activeFormTab === 'certificados' && (
                <div className="space-y-3">
                  {formData.funcao === 'Ajudante Operacional / Transbordo' && (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                      <HardHat className="w-5 h-5 shrink-0 text-amber-400" />
                      <span>
                        <strong>Ajudante Operacional:</strong> Curso MOPP de motorista não é obrigatório. Treinamentos de NR-20, NR-35 e ASO são recomendados para trabalho operacional.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <label className="block text-slate-300 font-bold text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Validade Curso MOPP (Resíduos Perigosos) {formData.funcao === 'Ajudante Operacional / Transbordo' ? '(Opcional)' : '*'}</span>
                      </label>
                      <p className="text-[10px] text-slate-500">Obrigatório Resolução CONTRAN para condutores de químicos</p>
                      <input
                        type="date"
                        required={formData.funcao !== 'Ajudante Operacional / Transbordo'}
                        value={formData.validadeMopp}
                        onChange={(e) => setFormData({ ...formData, validadeMopp: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono mt-1"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <label className="block text-slate-300 font-bold text-xs flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span>Validade Exame Toxicológico {formData.funcao === 'Ajudante Operacional / Transbordo' ? '(Opcional)' : '*'}</span>
                      </label>
                      <p className="text-[10px] text-slate-500">Exigência Lei 13.103/15 para motoristas profissionais C, D e E</p>
                      <input
                        type="date"
                        required={formData.funcao !== 'Ajudante Operacional / Transbordo'}
                        value={formData.validadeToxico}
                        onChange={(e) => setFormData({ ...formData, validadeToxico: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <label className="block text-slate-300 font-bold text-[11px] flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                        <span>ASO Saúde Ocupacional</span>
                      </label>
                      <input
                        type="date"
                        value={formData.validadeAso}
                        onChange={(e) => setFormData({ ...formData, validadeAso: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs font-mono"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <label className="block text-slate-300 font-bold text-[11px] flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>NR-20 (Inflamáveis)</span>
                      </label>
                      <input
                        type="date"
                        value={formData.validadeNr20}
                        onChange={(e) => setFormData({ ...formData, validadeNr20: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs font-mono"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <label className="block text-slate-300 font-bold text-[11px] flex items-center gap-1">
                        <HardHat className="w-3.5 h-3.5 text-blue-400" />
                        <span>NR-35 (Altura/Enlonamento)</span>
                      </label>
                      <input
                        type="date"
                        value={formData.validadeNr35}
                        onChange={(e) => setFormData({ ...formData, validadeNr35: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Observações Médicas / Operacionais</label>
                    <textarea
                      rows={2}
                      placeholder="Alergias, restrições médicas, histórico de treinamento especial Ambipar..."
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  {editingId ? 'Editando registro cadastral existente' : 'Novo registro será adicionado com persistência contínua'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold shadow-lg shadow-ambipar-500/20"
                  >
                    {editingId ? 'Salvar Alterações' : 'Concluir Cadastro'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: DOSSIÊ & FICHA CADASTRAL DO CONDUTOR (A4 / IMPRESSÃO)
          ========================================================= */}
      {dossieMotorista && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Top Bar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  Dossiê Oficial do Condutor & Conformidade Regulamentar (SASSMAQ)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Ficha A4</span>
                </button>
                <button
                  onClick={() => setDossieMotorista(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Content Body */}
            <div className="p-6 overflow-y-auto bg-slate-900 text-slate-200 space-y-6 text-xs print:p-0 print:bg-white print:text-black">
              {/* Header Ambipar */}
              <div className="border-b-2 border-ambipar-500 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl text-white print:text-black tracking-tight">AMBIPAR</span>
                    <span className="text-[10px] font-bold bg-ambipar-500/20 text-ambipar-400 print:text-emerald-700 px-2 py-0.5 rounded border border-ambipar-500/30">
                      LOGÍSTICA & RESÍDUOS
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-300 print:text-slate-700 mt-1">
                    FICHA DE REGISTRO E PRONTUÁRIO DE CONDUTOR OPERACIONAL
                  </h4>
                  <p className="text-[10px] text-slate-500 print:text-slate-600">
                    Sistema de Avaliação de Segurança, Saúde, Meio Ambiente e Qualidade (SASSMAQ) / ANTT
                  </p>
                </div>

                <div className="text-right text-[11px] text-slate-400 print:text-slate-600">
                  <div>Data de Emissão: <strong className="text-white print:text-black">{new Date().toLocaleDateString('pt-BR')}</strong></div>
                  <div>Matrícula: <strong className="text-white print:text-black font-mono">{dossieMotorista.matricula || 'AMB-0000'}</strong></div>
                  <div>Status: <strong className="text-emerald-400 print:text-emerald-700">{dossieMotorista.status}</strong></div>
                </div>
              </div>

              {/* Quadro 1: Dados Pessoais & Contato */}
              <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-2">
                <h5 className="font-bold text-white print:text-black uppercase tracking-wider text-[11px] text-ambipar-400 print:text-emerald-800">
                  1. DADOS CADASTRAIS & IDENTIFICAÇÃO PESSOAL
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Nome Completo:</span>
                    <strong className="text-white print:text-black font-bold">{dossieMotorista.nome}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">CPF:</span>
                    <strong className="text-white print:text-black font-mono">{dossieMotorista.cpf}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">RG:</span>
                    <strong className="text-white print:text-black font-mono">{dossieMotorista.rg || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Tipo Sanguíneo:</span>
                    <strong className="text-rose-400 print:text-rose-700 font-bold">{dossieMotorista.tipoSanguineo || 'O+'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Telefone:</span>
                    <strong className="text-white print:text-black">{dossieMotorista.telefone || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Regime / Contrato:</span>
                    <strong className="text-white print:text-black">{dossieMotorista.regimeContratacao || 'CLT Ambipar'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Data Admissão:</span>
                    <strong className="text-white print:text-black font-mono">{dossieMotorista.dataAdmissao || 'Não informada'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Base Operacional:</span>
                    <strong className="text-white print:text-black">{dossieMotorista.baseOperacional}</strong>
                  </div>
                </div>

                {dossieMotorista.contatoEmergenciaNome && (
                  <div className="pt-2 border-t border-slate-800 print:border-slate-300 text-xs">
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block font-semibold">Contato de Emergência:</span>
                    <span className="text-white print:text-black font-medium">
                      {dossieMotorista.contatoEmergenciaNome} ({dossieMotorista.contatoEmergenciaParentesco || 'Família'}) &bull; Telefone: {dossieMotorista.contatoEmergenciaTelefone}
                    </span>
                  </div>
                )}
              </div>

              {/* Quadro 2: Habilitação CNH */}
              <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-2">
                <h5 className="font-bold text-white print:text-black uppercase tracking-wider text-[11px] text-ambipar-400 print:text-emerald-800">
                  2. DADOS DA CARTEIRA NACIONAL DE HABILITAÇÃO (CNH)
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Número CNH:</span>
                    <strong className="text-white print:text-black font-mono">{dossieMotorista.cnh}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Categoria:</span>
                    <strong className="text-amber-400 print:text-amber-800 font-bold font-mono">Categoria {dossieMotorista.categoriaCnh}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Validade CNH:</span>
                    <strong className="text-white print:text-black font-mono">{dossieMotorista.validadeCnh}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Exerce Atividade Remunerada (EAR):</span>
                    <strong className="text-emerald-400 print:text-emerald-700 font-bold">
                      {dossieMotorista.exerceAtividadeRemunerada ? 'SIM (Apto)' : 'NÃO'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Quadro 3: Qualificações e Validades Obrigatórias */}
              <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-3">
                <h5 className="font-bold text-white print:text-black uppercase tracking-wider text-[11px] text-ambipar-400 print:text-emerald-800">
                  3. CERTIFICAÇÕES OPERACIONAIS & VALIDADES DE SAÚDE (MOPP / SASSMAQ)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 flex justify-between items-center">
                    <div>
                      <strong className="text-white print:text-black block">Curso MOPP (Resíduos Perigosos)</strong>
                      <span className="text-[10px] text-slate-500 print:text-slate-600">Resolução CONTRAN / Cargas Químicas</span>
                    </div>
                    <span className="font-mono font-bold text-white print:text-black">{dossieMotorista.validadeMopp}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 flex justify-between items-center">
                    <div>
                      <strong className="text-white print:text-black block">Exame Toxicológico Periódico</strong>
                      <span className="text-[10px] text-slate-500 print:text-slate-600">Lei Federal 13.103/2015</span>
                    </div>
                    <span className="font-mono font-bold text-white print:text-black">{dossieMotorista.validadeToxico}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 flex justify-between items-center">
                    <div>
                      <strong className="text-white print:text-black block">ASO - Saúde Ocupacional</strong>
                      <span className="text-[10px] text-slate-500 print:text-slate-600">Exame Médico Periódico</span>
                    </div>
                    <span className="font-mono font-bold text-white print:text-black">{dossieMotorista.validadeAso || 'Em dia'}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 flex justify-between items-center">
                    <div>
                      <strong className="text-white print:text-black block">NR-20 / NR-35</strong>
                      <span className="text-[10px] text-slate-500 print:text-slate-600">Inflamáveis & Trabalho em Altura</span>
                    </div>
                    <span className="font-mono font-bold text-white print:text-black">
                      {dossieMotorista.validadeNr20 ? `${dossieMotorista.validadeNr20}` : 'Certificado Válido'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quadro 4: Histórico Operacional */}
              <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-2">
                <h5 className="font-bold text-white print:text-black uppercase tracking-wider text-[11px] text-ambipar-400 print:text-emerald-800">
                  4. EQUIPAMENTO VINCULADO & PERFORMANCE DE TELEMETRIA
                </h5>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Caminhão Fixo:</span>
                    <strong className="text-white print:text-black font-mono">{dossieMotorista.veiculoFixoPlaca || 'Rotativo / Pool'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Média Histórica km/L:</span>
                    <strong className="text-emerald-400 print:text-emerald-700 font-bold font-mono">
                      {dossieMotorista.mediaConsumoGeral ? `${dossieMotorista.mediaConsumoGeral.toFixed(2)} km/L` : '2.65 km/L'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Score Ecocondução:</span>
                    <strong className="text-amber-400 print:text-amber-800 font-bold font-mono">{dossieMotorista.scoreEcoconducao || 90}/100</strong>
                  </div>
                </div>
              </div>

              {/* Assinaturas */}
              <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="border-t border-slate-700 print:border-black pt-2">
                  <strong className="block text-white print:text-black">{dossieMotorista.nome}</strong>
                  <span className="text-slate-500 print:text-slate-600 text-[10px]">Assinatura do Motorista Condutor</span>
                </div>

                <div className="border-t border-slate-700 print:border-black pt-2">
                  <strong className="block text-white print:text-black">Carlos Eduardo (Analista de Logística)</strong>
                  <span className="text-slate-500 print:text-slate-600 text-[10px]">Gestão de Frotas & Compliance Ambipar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
