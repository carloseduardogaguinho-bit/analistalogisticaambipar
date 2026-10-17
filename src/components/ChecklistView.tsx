import React, { useState, useMemo } from 'react';
import {
  ChecklistDiario,
  Veiculo,
  Motorista,
  Viagem,
  Manutencao,
  SeveridadeAvaria,
} from '../types';
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Truck,
  User,
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Smartphone,
  Printer,
  Calendar,
  Gauge,
  Flame,
  ArrowRight,
  Filter,
  Layers,
  Wrench,
  Download,
  MapPin,
  Navigation,
  Clock,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  Eye,
  History,
  Sparkles,
  RotateCcw,
  Fuel,
  Users,
  HardHat,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Send,
  Building,
} from 'lucide-react';
import {
  formatDateTime,
  formatNumber,
  getNowLocalBR,
  getTodayLocalBR,
  isVeiculoSemCarreta,
} from '../utils/formatters';

interface ChecklistViewProps {
  checklists: ChecklistDiario[];
  veiculos: Veiculo[];
  motoristas: Motorista[];
  viagens?: Viagem[];
  manutencoes?: Manutencao[];
  onAddChecklist: (checklist: ChecklistDiario) => void;
  onOpenPortalMotorista?: () => void;
  onNavigateToTab?: (tab: any) => void;
  onSincronizarOdometros?: () => number;
  onAtualizarKmManual?: (placa: string, novoKm: number) => void;
}

type ViewMode = 'jornadas' | 'motoristas' | 'timeline' | 'tabela' | 'avarias';

interface JornadaPareada {
  chave: string;
  jornadaId: string;
  data: string; // 'YYYY-MM-DD'
  veiculoPlaca: string;
  placaCarreta?: string;
  motoristaNome: string;
  motoristaCpf?: string;
  motoristaTelefone?: string;
  segundoMotoristaNome?: string;
  ajudanteNome?: string;
  saida?: ChecklistDiario;
  retorno?: ChecklistDiario;
  kmInicial?: number;
  kmFinal?: number;
  kmPercorrido?: number;
  temAvariaSaida?: boolean;
  temAvariaRetorno?: boolean;
  duracaoHoras?: string;
  status: 'Concluída' | 'Em Andamento' | 'Retorno Registrado';
  resultadoGeral: 'Aprovado - Liberado' | 'Aprovado com Restrição Leve' | 'Reprovado - Bloqueado';
  viagem?: Viagem;
  veiculo?: Veiculo;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklists,
  veiculos,
  motoristas,
  viagens = [],
  manutencoes = [],
  onAddChecklist,
  onOpenPortalMotorista,
  onNavigateToTab,
  onSincronizarOdometros,
  onAtualizarKmManual,
}) => {
  // Modos de Exibição
  const [viewMode, setViewMode] = useState<ViewMode>('jornadas');

  // Filtros Avançados
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMotorista, setFilterMotorista] = useState<string>('todos');
  const [filterPlaca, setFilterPlaca] = useState<string>('todos');
  const [filterPeriodo, setFilterPeriodo] = useState<'hoje' | '7dias' | 'mes' | 'todos'>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Modais e Estados de Ação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChecklistForPrint, setSelectedChecklistForPrint] = useState<ChecklistDiario | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Link único do portal do motorista
  const portalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?portal=motorista`
      : 'https://analistalogisticaambipar.vercel.app/?portal=motorista';

  // Copiar Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Compartilhar via WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá motorista Ambipar Logistics!\n\nAcesse o link oficial para realizar o Checklist Diário Obrigatório (Saída e Retorno):\n👉 ${portalUrl}\n\nEntre com seu CPF para iniciar a inspeção pré-viagem ou registrar o encerramento do turno.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Disparar sincronização de odômetros
  const handleTriggerSync = () => {
    if (onSincronizarOdometros) {
      const qtd = onSincronizarOdometros();
      setSyncFeedback(`${qtd} odômetro(s) da frota foram alinhados e sincronizados com sucesso!`);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  // Normalizador de Placa
  const normalizePlaca = (p?: string) => (p || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  // Helper para localizar Veículo cadastrado
  const findVeiculo = (placa?: string): Veiculo | undefined => {
    if (!placa || !veiculos) return undefined;
    const pNorm = normalizePlaca(placa);
    return veiculos.find((v) => normalizePlaca(v.placa) === pNorm);
  };

  // Helper para localizar Motorista cadastrado
  const findMotorista = (nomeOuCpf?: string): Motorista | undefined => {
    if (!nomeOuCpf || !motoristas) return undefined;
    const clean = nomeOuCpf.toLowerCase().trim();
    const cleanCpf = nomeOuCpf.replace(/\D/g, '');
    return motoristas.find(
      (m) =>
        m.nome.toLowerCase().includes(clean) ||
        (cleanCpf && m.cpf.replace(/\D/g, '') === cleanCpf)
    );
  };

  // Helper para vincular Viagem / Rota ativa do veículo ou motorista
  const findViagemVinculada = (veiculoPlaca?: string, motoristaNome?: string): Viagem | undefined => {
    if (!viagens || viagens.length === 0) return undefined;
    const pNorm = normalizePlaca(veiculoPlaca);
    const mNorm = (motoristaNome || '').toLowerCase().trim();

    // 1. Prioriza viagem em trânsito ou no cliente com match de placa
    let v = viagens.find(
      (v) =>
        normalizePlaca(v.placaCavalo) === pNorm &&
        (v.status === 'Em Trânsito' || v.status === 'No Cliente' || v.status === 'Carregando' || v.status === 'Descarregando')
    );
    if (v) return v;

    // 2. Viagem ativa com match de motorista
    if (mNorm) {
      v = viagens.find(
        (v) =>
          v.motorista.toLowerCase().includes(mNorm) &&
          (v.status === 'Em Trânsito' || v.status === 'No Cliente' || v.status === 'Carregando' || v.status === 'Descarregando')
      );
      if (v) return v;
    }

    // 3. Fallback: última viagem registrada para aquela placa
    v = viagens.find((v) => normalizePlaca(v.placaCavalo) === pNorm);
    if (v) return v;

    // 4. Fallback: última viagem do motorista
    if (mNorm) {
      v = viagens.find((v) => v.motorista.toLowerCase().includes(mNorm));
    }
    return v;
  };

  // Helper para calcular duração da jornada
  const calcDuracao = (saidaStr?: string, retornoStr?: string) => {
    if (!saidaStr || !retornoStr) return undefined;
    try {
      const s = new Date(saidaStr.replace(' ', 'T')).getTime();
      const r = new Date(retornoStr.replace(' ', 'T')).getTime();
      if (isNaN(s) || isNaN(r) || r < s) return undefined;
      const diffMins = Math.floor((r - s) / (1000 * 60));
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      return `${h}h ${m}m`;
    } catch {
      return undefined;
    }
  };

  // Helper para alerta de revisão preventiva
  const getManutencaoAlerta = (veiculo?: Veiculo) => {
    if (!veiculo || !veiculo.proximaRevisaoKm) return null;
    const kmAtual = veiculo.odometroAtualKm || 0;
    const kmProx = veiculo.proximaRevisaoKm;
    const diff = kmProx - kmAtual;
    if (diff <= 0) {
      return {
        status: 'critico',
        label: `🚨 Revisão Preventiva Vencida há ${formatNumber(Math.abs(diff))} km!`,
        diff,
      };
    } else if (diff <= 2000) {
      return {
        status: 'atencao',
        label: `⚠️ Revisão Preventiva próxima em ${formatNumber(diff)} km`,
        diff,
      };
    }
    return {
      status: 'ok',
      label: `Revisão Preventiva em dia (restam ${formatNumber(diff)} km)`,
      diff,
    };
  };

  // Form State para lançamento manual pelo analista
  const [formData, setFormData] = useState<Partial<ChecklistDiario>>({
    veiculoPlaca: veiculos[0]?.placa || '',
    motoristaNome: motoristas[0]?.nome || '',
    kmInicial: 50000,
    tipoInspecao: 'Saída para Viagem',
    pneusPressaoEEstado: true,
    freiosEstacionamentoEServico: true,
    luzesESinalizacao: true,
    extintoresPQSValidade: true,
    kitEmergenciaAmbipar: true,
    vazamentoFluidos: true,
    documentacaoMTRCIVCIPP: true,
    tacografoDiscoOuDigital: true,
    episObrigatorios: true,
    niveisOleoRadiador: true,
    limpezaCabine: true,
    possuiAvarias: false,
    descricaoAvarias: '',
    severidadeAvaria: 'Nenhuma',
    observacoes: '',
  });

  // Agrupamento de Jornadas (Saída + Retorno do mesmo veículo/dia)
  const todasJornadas = useMemo(() => {
    const grupos: { [key: string]: { saida?: ChecklistDiario; retorno?: ChecklistDiario } } = {};

    checklists.forEach((c) => {
      const dataChave = c.dataHora.slice(0, 10);
      const chave = c.jornadaId || `${c.veiculoPlaca}-${dataChave}`;

      if (!grupos[chave]) {
        grupos[chave] = {};
      }

      if (c.tipoInspecao === 'Saída para Viagem') {
        grupos[chave].saida = c;
      } else {
        grupos[chave].retorno = c;
      }
    });

    const lista: JornadaPareada[] = Object.entries(grupos).map(([chave, g]) => {
      const saida = g.saida;
      const retorno = g.retorno;
      const veiculoPlaca = saida?.veiculoPlaca || retorno?.veiculoPlaca || 'AMB';
      const placaCarreta = saida?.placaCarreta || retorno?.placaCarreta;
      const motoristaNome = saida?.motoristaNome || retorno?.motoristaNome || 'Motorista';
      const motoristaCpf = saida?.motoristaCpf || retorno?.motoristaCpf;
      const segundoMotoristaNome = saida?.segundoMotoristaNome || retorno?.segundoMotoristaNome;
      const ajudanteNome = saida?.ajudanteNome || retorno?.ajudanteNome;
      const data = saida?.dataHora.slice(0, 10) || retorno?.dataHora.slice(0, 10) || '';

      const kmInicial = saida?.kmInicial ?? retorno?.kmInicial;
      const kmFinal = retorno?.kmFinal ?? (retorno ? retorno.kmInicial : undefined);
      const kmPercorrido =
        retorno?.kmPercorrido !== undefined
          ? retorno.kmPercorrido
          : kmInicial && kmFinal && kmFinal >= kmInicial
          ? kmFinal - kmInicial
          : undefined;

      const duracaoHoras = calcDuracao(saida?.dataHora, retorno?.dataHoraRetorno || retorno?.dataHora);

      const status: JornadaPareada['status'] =
        saida && retorno
          ? 'Concluída'
          : saida
          ? 'Em Andamento'
          : 'Retorno Registrado';

      let resultadoGeral: JornadaPareada['resultadoGeral'] = 'Aprovado - Liberado';
      if (saida?.resultado === 'Reprovado - Bloqueado' || retorno?.resultado === 'Reprovado - Bloqueado') {
        resultadoGeral = 'Reprovado - Bloqueado';
      } else if (
        saida?.resultado === 'Aprovado com Restrição Leve' ||
        retorno?.resultado === 'Aprovado com Restrição Leve'
      ) {
        resultadoGeral = 'Aprovado com Restrição Leve';
      }

      const viagem = findViagemVinculada(veiculoPlaca, motoristaNome);
      const veiculo = findVeiculo(veiculoPlaca);
      const motObj = findMotorista(motoristaCpf || motoristaNome);

      return {
        chave,
        jornadaId: saida?.jornadaId || retorno?.jornadaId || chave,
        data,
        veiculoPlaca,
        placaCarreta,
        motoristaNome,
        motoristaCpf,
        motoristaTelefone: motObj?.telefone,
        segundoMotoristaNome,
        ajudanteNome,
        saida,
        retorno,
        kmInicial,
        kmFinal,
        kmPercorrido,
        temAvariaSaida: Boolean(saida?.possuiAvarias),
        temAvariaRetorno: Boolean(retorno?.avariasRetornoDetectadas),
        duracaoHoras,
        status,
        resultadoGeral,
        viagem,
        veiculo,
      };
    });

    // Ordenar jornadas da mais recente para a mais antiga
    return lista.sort((a, b) => {
      const dataA = a.saida?.dataHora || a.retorno?.dataHora || a.data;
      const dataB = b.saida?.dataHora || b.retorno?.dataHora || b.data;
      return dataB.localeCompare(dataA);
    });
  }, [checklists, veiculos, motoristas, viagens]);

  // Filtragem Geral aplicada a Checklists e Jornadas
  const hojeStr = getTodayLocalBR();

  const isDentroDoPeriodo = (dataHoraStr: string) => {
    if (filterPeriodo === 'todos') return true;
    const dataOnly = dataHoraStr.slice(0, 10);
    if (filterPeriodo === 'hoje') {
      return dataOnly === hojeStr;
    }
    if (filterPeriodo === '7dias') {
      const diffMs = Date.now() - new Date(dataOnly).getTime();
      return diffMs <= 7 * 24 * 60 * 60 * 1000;
    }
    if (filterPeriodo === 'mes') {
      return dataOnly.slice(0, 7) === hojeStr.slice(0, 7);
    }
    return true;
  };

  // Checklists Filtrados
  const filteredChecklists = useMemo(() => {
    return checklists.filter((c) => {
      const matchSearch =
        !searchTerm.trim() ||
        c.veiculoPlaca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.motoristaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.placaCarreta && c.placaCarreta.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.descricaoAvarias && c.descricaoAvarias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.descricaoAvariasRetorno && c.descricaoAvariasRetorno.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.resultado && c.resultado.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchMotorista =
        filterMotorista === 'todos' ||
        c.motoristaNome.toLowerCase() === filterMotorista.toLowerCase();

      const matchPlaca =
        filterPlaca === 'todos' ||
        normalizePlaca(c.veiculoPlaca) === normalizePlaca(filterPlaca);

      const matchPeriodo = isDentroDoPeriodo(c.dataHora);

      const matchStatus =
        filterStatus === 'todos' ||
        (filterStatus === 'em_rota' && c.statusJornada === 'Em Jornada') ||
        (filterStatus === 'concluidos' && c.tipoInspecao === 'Retorno à Base') ||
        (filterStatus === 'com_avarias' && (c.possuiAvarias || c.avariasRetornoDetectadas)) ||
        (filterStatus === 'bloqueados' && c.resultado === 'Reprovado - Bloqueado');

      return matchSearch && matchMotorista && matchPlaca && matchPeriodo && matchStatus;
    });
  }, [checklists, searchTerm, filterMotorista, filterPlaca, filterPeriodo, filterStatus]);

  // Jornadas Filtradas
  const filteredJornadas = useMemo(() => {
    return todasJornadas.filter((j) => {
      const matchSearch =
        !searchTerm.trim() ||
        j.veiculoPlaca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.motoristaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.placaCarreta && j.placaCarreta.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (j.viagem?.cliente && j.viagem.cliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (j.viagem?.origem && j.viagem.origem.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (j.viagem?.destino && j.viagem.destino.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (j.saida?.descricaoAvarias && j.saida.descricaoAvarias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (j.retorno?.descricaoAvariasRetorno && j.retorno.descricaoAvariasRetorno.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchMotorista =
        filterMotorista === 'todos' ||
        j.motoristaNome.toLowerCase() === filterMotorista.toLowerCase();

      const matchPlaca =
        filterPlaca === 'todos' ||
        normalizePlaca(j.veiculoPlaca) === normalizePlaca(filterPlaca);

      const dataHoraRef = j.saida?.dataHora || j.retorno?.dataHora || j.data;
      const matchPeriodo = isDentroDoPeriodo(dataHoraRef);

      const matchStatus =
        filterStatus === 'todos' ||
        (filterStatus === 'em_rota' && j.status === 'Em Andamento') ||
        (filterStatus === 'concluidos' && j.status === 'Concluída') ||
        (filterStatus === 'com_avarias' && (j.temAvariaSaida || j.temAvariaRetorno)) ||
        (filterStatus === 'bloqueados' && j.resultadoGeral === 'Reprovado - Bloqueado');

      return matchSearch && matchMotorista && matchPlaca && matchPeriodo && matchStatus;
    });
  }, [todasJornadas, searchTerm, filterMotorista, filterPlaca, filterPeriodo, filterStatus]);

  // Lista de Checklists com Avarias
  const checklistsComAvarias = useMemo(() => {
    return filteredChecklists.filter((c) => c.possuiAvarias || c.avariasRetornoDetectadas);
  }, [filteredChecklists]);

  // Agrupamento por Motorista
  const motoristasAgrupados = useMemo(() => {
    const mapa = new Map<
      string,
      {
        nome: string;
        motorista?: Motorista;
        jornadas: JornadaPareada[];
        checklists: ChecklistDiario[];
        veiculoAtual?: string;
        placaCarretaAtual?: string;
        viagemAtual?: Viagem;
        totalKmRodado: number;
        statusOperacional: 'Em Rota' | 'Jornada Concluída' | 'Sem Atividade Hoje';
      }
    >();

    // Inicializar com motoristas cadastrados
    motoristas.forEach((m) => {
      mapa.set(m.nome.toLowerCase(), {
        nome: m.nome,
        motorista: m,
        jornadas: [],
        checklists: [],
        totalKmRodado: 0,
        statusOperacional: 'Sem Atividade Hoje',
      });
    });

    // Associar Jornadas
    todasJornadas.forEach((j) => {
      const k = j.motoristaNome.toLowerCase();
      if (!mapa.has(k)) {
        mapa.set(k, {
          nome: j.motoristaNome,
          motorista: findMotorista(j.motoristaNome),
          jornadas: [],
          checklists: [],
          totalKmRodado: 0,
          statusOperacional: 'Sem Atividade Hoje',
        });
      }
      const entry = mapa.get(k)!;
      entry.jornadas.push(j);
      if (j.kmPercorrido) {
        entry.totalKmRodado += j.kmPercorrido;
      }
      if (j.status === 'Em Andamento') {
        entry.statusOperacional = 'Em Rota';
        entry.veiculoAtual = j.veiculoPlaca;
        entry.placaCarretaAtual = j.placaCarreta;
        entry.viagemAtual = j.viagem;
      } else if (entry.statusOperacional !== 'Em Rota' && j.status === 'Concluída' && j.data === hojeStr) {
        entry.statusOperacional = 'Jornada Concluída';
        entry.veiculoAtual = j.veiculoPlaca;
        entry.placaCarretaAtual = j.placaCarreta;
        entry.viagemAtual = j.viagem;
      }
    });

    // Associar Checklists
    checklists.forEach((c) => {
      const k = c.motoristaNome.toLowerCase();
      if (mapa.has(k)) {
        mapa.get(k)!.checklists.push(c);
      }
    });

    return Array.from(mapa.values())
      .filter((m) => {
        if (filterMotorista !== 'todos' && m.nome.toLowerCase() !== filterMotorista.toLowerCase()) {
          return false;
        }
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          return (
            m.nome.toLowerCase().includes(s) ||
            (m.veiculoAtual && m.veiculoAtual.toLowerCase().includes(s)) ||
            (m.viagemAtual?.destino && m.viagemAtual.destino.toLowerCase().includes(s)) ||
            (m.motorista?.cnh && m.motorista.cnh.toLowerCase().includes(s))
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Ordenar: Em Rota primeiro, depois Jornada Concluída, depois Sem Atividade
        const prioridade = { 'Em Rota': 0, 'Jornada Concluída': 1, 'Sem Atividade Hoje': 2 };
        return prioridade[a.statusOperacional] - prioridade[b.statusOperacional];
      });
  }, [motoristas, todasJornadas, checklists, filterMotorista, searchTerm, hojeStr]);

  // KPIs em Tempo Real
  const kpis = useMemo(() => {
    const jornadasHoje = todasJornadas.filter((j) => j.data === hojeStr);
    const concluidasHoje = jornadasHoje.filter((j) => j.status === 'Concluída');
    const emRota = todasJornadas.filter((j) => j.status === 'Em Andamento');
    const totalKmHoje = concluidasHoje.reduce((acc, j) => acc + (j.kmPercorrido || 0), 0);
    const comAvariasTotal = checklists.filter((c) => c.possuiAvarias || c.avariasRetornoDetectadas).length;
    const bloqueiosCriticos = checklists.filter((c) => c.resultado === 'Reprovado - Bloqueado').length;

    return {
      concluidasHoje: concluidasHoje.length,
      emRota: emRota.length,
      totalKmHoje,
      comAvariasTotal,
      bloqueiosCriticos,
    };
  }, [todasJornadas, checklists, hojeStr]);

  // Exportar Tabela para CSV
  const handleExportCSV = () => {
    const headers = [
      'ID Inspeção',
      'Data/Hora',
      'Placa Cavalo',
      'Placa Carreta',
      'Motorista',
      'CPF',
      'Momento',
      'Hodômetro (km)',
      'Pneus',
      'Freios',
      'Kit Emergência',
      'Extintor',
      'Isenção Vazamento',
      'Documentos MTR/CIV',
      'Tacógrafo',
      'Avarias Detectadas',
      'Resultado SASSMAQ',
    ];

    const rows = filteredChecklists.map((c) => [
      c.id,
      c.dataHora,
      c.veiculoPlaca,
      c.placaCarreta || '-',
      c.motoristaNome,
      c.motoristaCpf || '-',
      c.tipoInspecao,
      c.tipoInspecao === 'Retorno à Base' ? c.kmFinal || c.kmInicial : c.kmInicial,
      c.pneusPressaoEEstado ? 'Conforme' : 'Falha',
      c.freiosEstacionamentoEServico ? 'Operante' : 'Falha',
      c.kitEmergenciaAmbipar ? 'Completo' : 'Incompleto',
      c.extintoresPQSValidade ? 'Válido' : 'Vencido',
      c.vazamentoFluidos ? 'Isento' : 'Vazamento',
      c.documentacaoMTRCIVCIPP ? 'Conforme' : 'Falta',
      c.tacografoDiscoOuDigital ? 'Conforme' : 'Falha',
      c.possuiAvarias || c.avariasRetornoDetectadas
        ? `"${(c.descricaoAvarias || c.descricaoAvariasRetorno || '').replace(/"/g, '""')}"`
        : 'Nenhuma',
      c.resultado,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_checklists_ambipar_${hojeStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit manual pelo analista
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();

    const hasCriticalFail =
      !formData.freiosEstacionamentoEServico ||
      !formData.vazamentoFluidos ||
      !formData.kitEmergenciaAmbipar ||
      !formData.extintoresPQSValidade ||
      (formData.possuiAvarias && formData.severidadeAvaria?.includes('Crítica'));

    const hasMinorFail =
      !formData.pneusPressaoEEstado ||
      !formData.luzesESinalizacao ||
      !formData.documentacaoMTRCIVCIPP ||
      !formData.tacografoDiscoOuDigital ||
      formData.possuiAvarias;

    let resultado: ChecklistDiario['resultado'] = 'Aprovado - Liberado';
    if (hasCriticalFail) {
      resultado = 'Reprovado - Bloqueado';
    } else if (hasMinorFail) {
      resultado = 'Aprovado com Restrição Leve';
    }

    const mot = motoristas.find((m) => m.nome === formData.motoristaNome);
    const dataHoraLocal = getNowLocalBR();

    const newChk: ChecklistDiario = {
      id: `chk-${Date.now()}`,
      jornadaId: `jornada-${Date.now()}`,
      dataHora: dataHoraLocal,
      veiculoPlaca: formData.veiculoPlaca || 'AMB-0000',
      placaCarreta: formData.placaCarreta?.trim() || undefined,
      motoristaNome: formData.motoristaNome || 'Motorista Operacional',
      motoristaCpf: mot?.cpf,
      segundoMotoristaNome: formData.segundoMotoristaNome?.trim() || undefined,
      ajudanteNome: formData.ajudanteNome?.trim() || undefined,
      kmInicial: Number(formData.kmInicial) || 0,
      tipoInspecao: (formData.tipoInspecao as any) || 'Saída para Viagem',
      pneusPressaoEEstado: Boolean(formData.pneusPressaoEEstado),
      freiosEstacionamentoEServico: Boolean(formData.freiosEstacionamentoEServico),
      luzesESinalizacao: Boolean(formData.luzesESinalizacao),
      extintoresPQSValidade: Boolean(formData.extintoresPQSValidade),
      kitEmergenciaAmbipar: Boolean(formData.kitEmergenciaAmbipar),
      vazamentoFluidos: Boolean(formData.vazamentoFluidos),
      documentacaoMTRCIVCIPP: Boolean(formData.documentacaoMTRCIVCIPP),
      tacografoDiscoOuDigital: Boolean(formData.tacografoDiscoOuDigital),
      episObrigatorios: Boolean(formData.episObrigatorios),
      niveisOleoRadiador: Boolean(formData.niveisOleoRadiador),
      limpezaCabine: Boolean(formData.limpezaCabine),
      possuiAvarias: Boolean(formData.possuiAvarias),
      descricaoAvarias: formData.possuiAvarias ? formData.descricaoAvarias : 'Nenhuma avaria prévia',
      severidadeAvaria: formData.possuiAvarias ? formData.severidadeAvaria : 'Nenhuma',
      resultado,
      observacoes: formData.observacoes,
      statusJornada: formData.tipoInspecao === 'Saída para Viagem' ? 'Em Jornada' : 'Jornada Concluída',
      assinaturaDigitalMotorista: `${formData.motoristaNome} (Lançamento Analista de Tráfego)`,
    };

    onAddChecklist(newChk);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================
          CABEÇALHO PRINCIPAL DO MÓDULO
          ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-cyan-500/20">
              SASSMAQ • ISO 14001 • AMBIPAR RESPONSE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Sincronização Ativa com Frota & Manutenção
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5 mt-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <span>Centro de Controle de Checklists & Monitoramento de Rotas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Inspeção preventiva de saída e retorno vinculada à viagem operacional do condutor, atualização
            automática do hodômetro para revisões e controle de avarias em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onSincronizarOdometros && (
            <button
              onClick={handleTriggerSync}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition active:scale-95"
              title="Recalcular e sincronizar odômetros dos veículos com os últimos checklists e abastecimentos"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sincronizar Odômetros</span>
            </button>
          )}

          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.open(portalUrl, '_blank');
              } else if (onOpenPortalMotorista) {
                onOpenPortalMotorista();
              }
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            title="Abrir o Portal do Motorista em uma nova janela isolada"
          >
            <Smartphone className="w-4 h-4" />
            <span>Portal do Motorista</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Checklist Manual</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK DE SINCRONIZAÇÃO */}
      {syncFeedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* =========================================================
          BANNER INFORMATIVO DO LINK DEDICADO DO MOTORISTA
          ========================================================= */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
              Link Único & Dedicado para os Motoristas da Frota
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Envie este link no WhatsApp para os condutores. O motorista acessa no celular, digita seu{' '}
            <strong>CPF</strong> e conclui os 2 momentos obrigatórios:{' '}
            <strong>1. Saída (Pré-Jornada)</strong> com registro de avarias prévias e{' '}
            <strong>2. Retorno à Base</strong> com hodômetro final que atualiza a plataforma para o cálculo de manutenção.
          </p>
          <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-cyan-300 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 w-fit select-all">
            <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>{portalUrl}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition ${
              copiedLink
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          5 KPIS OPERACIONAIS REDESENHADOS
          ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Concluídas Hoje</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1.5">
            {kpis.concluidasHoje}
          </div>
          <span className="text-[10px] text-slate-500">Jornadas com Saída + Retorno</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Em Rota Agora</span>
            <Truck className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1.5">
            {kpis.emRota}
          </div>
          <span className="text-[10px] text-slate-500">Aguardando checklist retorno</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">KM Rodado Hoje</span>
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1.5">
            {formatNumber(kpis.totalKmHoje)} <span className="text-xs text-slate-400 font-sans">km</span>
          </div>
          <span className="text-[10px] text-slate-500">Total apurado nas rotas</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Com Avarias / Alertas</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1.5">
            {kpis.comAvariasTotal}
          </div>
          <span className="text-[10px] text-amber-400/80">Exigem revisão técnica</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Bloqueios SASSMAQ</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1.5">
            {kpis.bloqueiosCriticos}
          </div>
          <span className="text-[10px] text-rose-400/80">Veículos retidos</span>
        </div>
      </div>

      {/* =========================================================
          BARRA DE MODOS DE VISUALIZAÇÃO & FILTROS
          ========================================================= */}
      <div className="space-y-3">
        {/* Modos de Exibição */}
        <div className="flex items-center justify-between border-b border-slate-800 overflow-x-auto pb-px gap-2">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setViewMode('jornadas')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 ${
                viewMode === 'jornadas'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Jornadas & Rotas ({filteredJornadas.length})</span>
            </button>

            <button
              onClick={() => setViewMode('motoristas')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 ${
                viewMode === 'motoristas'
                  ? 'border-purple-500 text-purple-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Por Motorista ({motoristasAgrupados.length})</span>
            </button>

            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 ${
                viewMode === 'timeline'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Linha do Tempo ({filteredChecklists.length})</span>
            </button>

            <button
              onClick={() => setViewMode('tabela')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 ${
                viewMode === 'tabela'
                  ? 'border-blue-500 text-blue-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Tabela Auditoria SASSMAQ</span>
            </button>

            <button
              onClick={() => setViewMode('avarias')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 ${
                viewMode === 'avarias'
                  ? 'border-amber-500 text-amber-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Radar de Avarias ({checklistsComAvarias.length})</span>
            </button>
          </div>

          {viewMode === 'tabela' && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 shrink-0 transition"
              title="Baixar planilha de auditoria em CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exportar CSV</span>
            </button>
          )}
        </div>

        {/* Toolbar de Filtros */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por motorista, placa, rota, cliente, avaria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filtro de Motorista */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterMotorista}
                onChange={(e) => setFilterMotorista(e.target.value)}
                className="bg-transparent text-white focus:outline-none text-xs"
              >
                <option value="todos" className="bg-slate-800">Todos os Motoristas</option>
                {motoristas.map((m) => (
                  <option key={m.id} value={m.nome} className="bg-slate-800">
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Placa */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterPlaca}
                onChange={(e) => setFilterPlaca(e.target.value)}
                className="bg-transparent text-white font-mono focus:outline-none text-xs"
              >
                <option value="todos" className="bg-slate-800">Todas as Placas</option>
                {veiculos.map((v) => (
                  <option key={v.id} value={v.placa} className="bg-slate-800">
                    {v.placa}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Período */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterPeriodo}
                onChange={(e) => setFilterPeriodo(e.target.value as any)}
                className="bg-transparent text-white focus:outline-none text-xs"
              >
                <option value="todos" className="bg-slate-800">Todo o Período</option>
                <option value="hoje" className="bg-slate-800">Somente Hoje</option>
                <option value="7dias" className="bg-slate-800">Últimos 7 Dias</option>
                <option value="mes" className="bg-slate-800">Mês Vigente</option>
              </select>
            </div>

            {/* Filtro de Status */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-white focus:outline-none text-xs"
              >
                <option value="todos" className="bg-slate-800">Todos os Status</option>
                <option value="em_rota" className="bg-slate-800">Em Rota (Aguardando Retorno)</option>
                <option value="concluidos" className="bg-slate-800">Jornadas Concluídas</option>
                <option value="com_avarias" className="bg-slate-800">Com Avarias / Danos</option>
                <option value="bloqueados" className="bg-slate-800">Bloqueios Críticos</option>
              </select>
            </div>

            {(searchTerm || filterMotorista !== 'todos' || filterPlaca !== 'todos' || filterPeriodo !== 'todos' || filterStatus !== 'todos') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterMotorista('todos');
                  setFilterPlaca('todos');
                  setFilterPeriodo('todos');
                  setFilterStatus('todos');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          MODO 1: JORNADAS DIÁRIAS & ROTAS (RECOMENDADO)
          ========================================================= */}
      {viewMode === 'jornadas' && (
        <div className="space-y-4">
          {filteredJornadas.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
              <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Nenhuma jornada localizada com esses filtros</h3>
              <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
                Tente ajustar os filtros de motorista, placa ou período para encontrar as viagens realizadas.
              </p>
            </div>
          ) : (
            filteredJornadas.map((j) => {
              const alertaRevisao = getManutencaoAlerta(j.veiculo);
              const isConcluida = j.status === 'Concluída';
              const isEmRota = j.status === 'Em Andamento';
              const isBloqueado = j.resultadoGeral === 'Reprovado - Bloqueado';

              return (
                <div
                  key={j.chave}
                  className={`p-5 rounded-2xl bg-slate-900 border transition shadow-sm space-y-4 ${
                    isBloqueado
                      ? 'border-rose-500/50 bg-gradient-to-br from-slate-900 to-rose-950/20'
                      : isEmRota
                      ? 'border-cyan-500/40 bg-gradient-to-br from-slate-900 to-cyan-950/15'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Cabeçalho do Card da Jornada */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        <Truck className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono text-sm font-black text-white">{j.veiculoPlaca}</span>
                      </div>

                      {j.placaCarreta ? (
                        <div className="flex items-center gap-1.5 bg-cyan-950/50 px-2.5 py-1.5 rounded-xl border border-cyan-500/30">
                          <span className="text-[10px] text-cyan-400 font-semibold uppercase">Carreta:</span>
                          <span className="font-mono text-xs font-bold text-cyan-200">{j.placaCarreta}</span>
                        </div>
                      ) : isVeiculoSemCarreta(j.veiculo || j.veiculoPlaca) ? (
                        <div className="flex items-center gap-1.5 bg-emerald-950/50 px-2.5 py-1.5 rounded-xl border border-emerald-500/30" title="Veículo rígido: sem carreta acoplada">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-300 font-bold uppercase">Rígido (Sem Carreta)</span>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-white">{j.motoristaNome}</span>
                        </div>

                        {j.motoristaTelefone && (
                          <a
                            href={`https://api.whatsapp.com/send?phone=55${j.motoristaTelefone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                            title={`Conversar com ${j.motoristaNome} no WhatsApp`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {j.segundoMotoristaNome && (
                          <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            2º Mot: {j.segundoMotoristaNome}
                          </span>
                        )}

                        {j.ajudanteNome && (
                          <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Ajudante: {j.ajudanteNome}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {j.duracaoHoras && (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{j.duracaoHoras}</span>
                        </span>
                      )}

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                          isConcluida
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isEmRota
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {isConcluida ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isEmRota ? (
                          <Navigation className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isConcluida
                            ? 'Jornada Concluída (2 Checklists OK)'
                            : isEmRota
                            ? 'Em Rota (Aguardando Retorno)'
                            : j.status}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* FAIXA DA ROTA / VIAGEM VINCULADA */}
                  {j.viagem ? (
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold">
                            {j.viagem.codigoViagem}
                          </span>
                          <span className="text-slate-400 font-medium">Cliente:</span>
                          <strong className="text-white">{j.viagem.cliente}</strong>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">Carga:</span>
                          <span className="text-slate-300 font-semibold">{j.viagem.classeResiduo}</span>
                          {j.viagem.pesoToneladas > 0 && (
                            <span className="text-slate-400 font-mono">({j.viagem.pesoToneladas} t)</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-slate-300 flex-wrap">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <strong className="text-slate-200">{j.viagem.origem}</strong>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <strong className="text-emerald-400">{j.viagem.destino}</strong>
                          {j.viagem.numeroMTR && (
                            <span className="text-slate-500 text-[11px] font-mono">
                              MTR: {j.viagem.numeroMTR}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {j.viagem.status}
                        </span>
                        {onNavigateToTab && (
                          <button
                            onClick={() => onNavigateToTab('viagens')}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[11px] font-bold flex items-center gap-1 border border-blue-500/20 transition"
                          >
                            <span>Ver no Despacho</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-3.5 h-3.5 text-slate-500" />
                        <span>Deslocamento Operacional Local / Apoio Operacional (Sem Viagem Formal Atrelada)</span>
                      </div>
                      {onNavigateToTab && (
                        <button
                          onClick={() => onNavigateToTab('viagens')}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          Vincular no Despacho →
                        </button>
                      )}
                    </div>
                  )}

                  {/* GRID COMPARATIVO: SAÍDA VS RETORNO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Bloco 1: Saída para Viagem (Pré-Jornada) */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                          <span className="text-[11px] uppercase font-bold text-cyan-400">
                            1. Checklist de Saída (Pré-Jornada)
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-300">
                          {j.saida ? formatDateTime(j.saida.dataHora) : 'Não realizado'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Hodômetro Inicial:</span>
                          <strong className="text-white font-mono text-sm">
                            {j.kmInicial ? `${formatNumber(j.kmInicial)} km` : '-'}
                          </strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Tanque / Combustível:</span>
                          <span className="text-slate-200 font-semibold">
                            {j.saida?.nivelCombustivel || 'Conforme'}
                          </span>
                        </div>
                      </div>

                      {/* Itens Inspecionados */}
                      {j.saida && (
                        <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-400 pt-1">
                          <div className={`p-1.5 rounded ${j.saida.pneusPressaoEEstado ? 'bg-slate-900 text-slate-300' : 'bg-rose-500/10 text-rose-300'}`}>
                            Pneus: {j.saida.pneusPressaoEEstado ? '✓ OK' : '✕ Falha'}
                          </div>
                          <div className={`p-1.5 rounded ${j.saida.freiosEstacionamentoEServico ? 'bg-slate-900 text-slate-300' : 'bg-rose-500/10 text-rose-300'}`}>
                            Freios: {j.saida.freiosEstacionamentoEServico ? '✓ OK' : '✕ Falha'}
                          </div>
                          <div className={`p-1.5 rounded ${j.saida.kitEmergenciaAmbipar ? 'bg-slate-900 text-emerald-400' : 'bg-rose-500/10 text-rose-300'}`}>
                            Kit Químico: {j.saida.kitEmergenciaAmbipar ? '✓ OK' : '✕ Falta'}
                          </div>
                        </div>
                      )}

                      {/* Avarias na Saída */}
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Avarias Prévias:</span>
                        {j.temAvariaSaida ? (
                          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px]">
                            <span className="font-bold uppercase text-[9px] block text-amber-400">
                              {j.saida?.severidadeAvaria || 'Avaria Relatada'}
                            </span>
                            {j.saida?.descricaoAvarias}
                          </div>
                        ) : (
                          <span className="text-emerald-400 font-semibold text-[11px]">
                            ✓ Veículo liberado sem avarias prévias
                          </span>
                        )}
                      </div>

                      {j.saida && (
                        <button
                          onClick={() => setSelectedChecklistForPrint(j.saida!)}
                          className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-slate-800 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimir Laudo de Saída</span>
                        </button>
                      )}
                    </div>

                    {/* Bloco 2: Retorno à Base (Pós-Jornada) */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              j.retorno ? 'bg-emerald-400' : 'bg-slate-500 animate-pulse'
                            }`}
                          ></span>
                          <span className="text-[11px] uppercase font-bold text-emerald-400">
                            2. Checklist de Retorno à Base
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-300">
                          {j.retorno
                            ? formatDateTime(j.retorno.dataHoraRetorno || j.retorno.dataHora)
                            : 'Pendente de envio'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Hodômetro Final:</span>
                          <strong className="text-white font-mono text-sm">
                            {j.kmFinal ? `${formatNumber(j.kmFinal)} km` : '-'}
                          </strong>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                          <span className="text-emerald-400 block text-[10px] font-semibold">
                            KM Rodado na Rota:
                          </span>
                          <strong className="text-emerald-300 font-mono text-sm">
                            {j.kmPercorrido !== undefined ? `${formatNumber(j.kmPercorrido)} km` : 'Em andamento'}
                          </strong>
                        </div>
                      </div>

                      {/* Avarias no Retorno */}
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Avarias da Viagem:</span>
                        {j.temAvariaRetorno ? (
                          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-[11px]">
                            <span className="font-bold uppercase text-[9px] block text-rose-400">
                              Dano Ocorrido na Rota ({j.retorno?.severidadeAvariaRetorno || 'Avaria'})
                            </span>
                            {j.retorno?.descricaoAvariasRetorno}
                          </div>
                        ) : j.retorno ? (
                          <span className="text-emerald-400 font-semibold text-[11px]">
                            ✓ Retorno concluído sem danos adicionais
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            Aguardando motorista chegar à base para inspecionar
                          </span>
                        )}
                      </div>

                      {j.retorno ? (
                        <button
                          onClick={() => setSelectedChecklistForPrint(j.retorno!)}
                          className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-slate-800 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimir Laudo de Retorno</span>
                        </button>
                      ) : (
                        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center text-slate-500 text-[11px]">
                          Motorista em trânsito com o veículo
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RODAPÉ DO CARD: SAÚDE DO VEÍCULO & ALERTA DE MANUTENÇÃO */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-400">Status de Manutenção:</span>
                      {alertaRevisao ? (
                        <span
                          className={`font-semibold ${
                            alertaRevisao.status === 'critico'
                              ? 'text-rose-400 font-bold'
                              : alertaRevisao.status === 'atencao'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {alertaRevisao.label}
                        </span>
                      ) : (
                        <span className="text-slate-500">Dados do veículo em conformidade</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {onAtualizarKmManual && j.kmFinal && (
                        <button
                          onClick={() => onAtualizarKmManual(j.veiculoPlaca, j.kmFinal!)}
                          className="text-[11px] text-cyan-400 hover:underline font-semibold"
                          title="Garantir que o hodômetro da frota receba este KM final"
                        >
                          Confirmar KM na Frota
                        </button>
                      )}

                      {onNavigateToTab && (
                        <button
                          onClick={() => onNavigateToTab('manutencao')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition"
                        >
                          <span>Ordens de Serviço</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =========================================================
          MODO 2: AGRUPADO POR MOTORISTA OPERACIONAL
          ========================================================= */}
      {viewMode === 'motoristas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {motoristasAgrupados.map((m) => {
            const isEmRota = m.statusOperacional === 'Em Rota';
            const isConcluida = m.statusOperacional === 'Jornada Concluída';

            return (
              <div
                key={m.nome}
                className={`p-5 rounded-2xl bg-slate-900 border transition shadow-sm space-y-4 ${
                  isEmRota
                    ? 'border-cyan-500/40 bg-gradient-to-br from-slate-900 to-cyan-950/20'
                    : isConcluida
                    ? 'border-emerald-500/30'
                    : 'border-slate-800'
                }`}
              >
                {/* Header do Motorista */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                      {m.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{m.nome}</h4>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {m.motorista?.cpf ? `CPF: ${m.motorista.cpf}` : 'Motorista Ativo'}
                        {m.motorista?.cnh && ` • CNH ${m.motorista.cnh}`}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isEmRota
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse'
                        : isConcluida
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {m.statusOperacional}
                  </span>
                </div>

                {/* Veículo & Rota em Andamento */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Veículo em Operação:</span>
                    <strong className="text-white font-mono">
                      {m.veiculoAtual || 'Nenhum atribuído'}
                    </strong>
                  </div>

                  {m.placaCarretaAtual && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Carreta Vinculada:</span>
                      <strong className="text-cyan-300 font-mono">{m.placaCarretaAtual}</strong>
                    </div>
                  )}

                  {m.viagemAtual && (
                    <div className="pt-1 border-t border-slate-800/80">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Rota Atual:</div>
                      <div className="text-slate-200 font-bold flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{m.viagemAtual.origem} ➔ {m.viagemAtual.destino}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Cliente: <strong>{m.viagemAtual.cliente}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Métricas do Motorista */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Jornadas Registradas</span>
                    <strong className="text-white font-mono text-base">{m.jornadas.length}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">KM Total Rodado</span>
                    <strong className="text-emerald-400 font-mono text-base">
                      {formatNumber(m.totalKmRodado)}
                    </strong>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="flex items-center gap-2 pt-1">
                  {m.motorista?.telefone && (
                    <a
                      href={`https://api.whatsapp.com/send?phone=55${m.motorista.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-500/30 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setFilterMotorista(m.nome);
                      setViewMode('jornadas');
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700 transition"
                  >
                    <span>Ver Jornadas</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================
          MODO 3: LINHA DO TEMPO CRONOLÓGICA (FEED AO VIVO)
          ========================================================= */}
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {filteredChecklists.map((c) => {
              const isSaida = c.tipoInspecao === 'Saída para Viagem';
              const isAprovado = c.resultado === 'Aprovado - Liberado';
              const isBloqueado = c.resultado === 'Reprovado - Bloqueado';
              const temAvaria = c.possuiAvarias || c.avariasRetornoDetectadas;
              const viagem = findViagemVinculada(c.veiculoPlaca, c.motoristaNome);

              return (
                <div key={c.id} className="relative group">
                  {/* Ponto na linha */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${
                      isBloqueado
                        ? 'bg-rose-950 border-rose-500 text-rose-400'
                        : isSaida
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-400'
                        : 'bg-emerald-950 border-emerald-500 text-emerald-400'
                    }`}
                  >
                    {isSaida ? 'S' : 'R'}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-white bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                          {c.veiculoPlaca}
                        </span>
                        {c.placaCarreta && (
                          <span className="font-mono text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                            {c.placaCarreta}
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-200">{c.motoristaNome}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-300">
                          {c.tipoInspecao}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-semibold text-slate-300">
                          {formatDateTime(c.dataHora)}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isAprovado
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isBloqueado
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {c.resultado}
                        </span>
                        <button
                          onClick={() => setSelectedChecklistForPrint(c)}
                          className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                          title="Imprimir Laudo A4"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {viagem && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 bg-slate-950/40 p-2 rounded-lg">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>Rota: {viagem.origem} ➔ {viagem.destino} ({viagem.cliente})</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                      <div className="text-slate-400">
                        Odômetro registrado:{' '}
                        <strong className="text-white font-mono">
                          {formatNumber(c.tipoInspecao === 'Retorno à Base' ? c.kmFinal || c.kmInicial : c.kmInicial)} km
                        </strong>
                        {c.kmPercorrido !== undefined && (
                          <span className="text-emerald-400 font-semibold ml-2 font-mono">
                            (+{formatNumber(c.kmPercorrido)} km percorridos)
                          </span>
                        )}
                      </div>

                      {temAvaria && (
                        <span className="text-amber-400 font-semibold text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Avaria Apontada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          MODO 4: TABELA DE AUDITORIA SASSMAQ / CONFORMIDADE
          ========================================================= */}
      {viewMode === 'tabela' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Data / Hora Local</th>
                  <th className="py-3 px-4">Placa / Carreta</th>
                  <th className="py-3 px-4">Motorista & Equipe</th>
                  <th className="py-3 px-4">Momento</th>
                  <th className="py-3 px-4">Hodômetro</th>
                  <th className="py-3 px-4 text-center">Itens SASSMAQ</th>
                  <th className="py-3 px-4">Avarias</th>
                  <th className="py-3 px-4">Resultado</th>
                  <th className="py-3 px-4 text-right">Laudo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredChecklists.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      Nenhum checklist registrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredChecklists.map((c) => {
                    const isAprovado = c.resultado === 'Aprovado - Liberado';
                    const isBloqueado = c.resultado === 'Reprovado - Bloqueado';
                    const temAvaria = c.possuiAvarias || c.avariasRetornoDetectadas;
                    const kmExibido = c.tipoInspecao === 'Retorno à Base' ? c.kmFinal || c.kmInicial : c.kmInicial;

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-medium text-slate-300 whitespace-nowrap">
                          {formatDateTime(c.dataHora)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {c.veiculoPlaca}
                          </span>
                          {c.placaCarreta && (
                            <span className="font-mono text-[10px] text-cyan-300 block mt-0.5">
                              {c.placaCarreta}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{c.motoristaNome}</div>
                          {c.motoristaCpf && (
                            <div className="text-[10px] font-mono text-slate-500">CPF: {c.motoristaCpf}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[11px]">
                            {c.tipoInspecao}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                          {formatNumber(kmExibido)} km
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 text-[11px]">
                            <span
                              title={c.pneusPressaoEEstado ? 'Pneus Conformes' : 'Falha Pneus'}
                              className={c.pneusPressaoEEstado ? 'text-emerald-400' : 'text-rose-400'}
                            >
                              ●
                            </span>
                            <span
                              title={c.freiosEstacionamentoEServico ? 'Freios Operantes' : 'Falha Freios'}
                              className={c.freiosEstacionamentoEServico ? 'text-emerald-400' : 'text-rose-400'}
                            >
                              ●
                            </span>
                            <span
                              title={c.kitEmergenciaAmbipar ? 'Kit Emergência Conforme' : 'Kit Incompleto'}
                              className={c.kitEmergenciaAmbipar ? 'text-emerald-400' : 'text-rose-400'}
                            >
                              ●
                            </span>
                            <span
                              title={c.extintoresPQSValidade ? 'Extintores Válidos' : 'Extintores Vencidos'}
                              className={c.extintoresPQSValidade ? 'text-emerald-400' : 'text-rose-400'}
                            >
                              ●
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">
                          {temAvaria ? (
                            <span className="text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                {c.descricaoAvarias || c.descricaoAvariasRetorno || 'Avaria Relatada'}
                              </span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-[11px]">Sem avarias</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                              isAprovado
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : isBloqueado
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {c.resultado}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedChecklistForPrint(c)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Visualizar e Imprimir Laudo Técnico A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          MODO 5: RADAR DE AVARIAS & MANUTENÇÃO PREVENTIVA
          ========================================================= */}
      {viewMode === 'avarias' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Radar de Avarias Apontadas pelos Motoristas</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Relatos de danos, anomalias e quebras reportadas na inspeção para abertura de ordens de serviço.
              </p>
            </div>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('manutencao')}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Gerenciar Ordens na Oficina</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklistsComAvarias.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-white font-bold text-sm">Nenhuma avaria registrada no momento!</p>
                <p className="text-xs text-slate-400 mt-1">Todos os veículos inspecionados encontram-se em perfeitas condições.</p>
              </div>
            ) : (
              checklistsComAvarias.map((c) => {
                const veiculo = findVeiculo(c.veiculoPlaca);
                const alerta = getManutencaoAlerta(veiculo);

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-white text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          {c.veiculoPlaca}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{c.motoristaNome}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {formatDateTime(c.dataHora)} • {c.tipoInspecao}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">
                        {c.severidadeAvaria || c.severidadeAvariaRetorno || 'Avaria Relatada'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-400">
                        <span>Local: {c.localAvaria || c.localAvariaRetorno || 'Lataria / Estrutura Geral'}</span>
                        <span>Hodômetro: {formatNumber(c.kmFinal || c.kmInicial)} km</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {c.descricaoAvarias || c.descricaoAvariasRetorno}
                      </p>
                    </div>

                    {alerta && (
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                        <span>{alerta.label}</span>
                        {onNavigateToTab && (
                          <button
                            onClick={() => onNavigateToTab('manutencao')}
                            className="text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>Abrir OS</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
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
          MODAL DE LANÇAMENTO MANUAL DE CHECKLIST PELO ANALISTA
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-4 text-xs shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Checklist Diário de Inspeção Manual</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitManual} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Veículo (Cavalo Mecânico) *</label>
                  <select
                    value={formData.veiculoPlaca}
                    onChange={(e) => setFormData({ ...formData, veiculoPlaca: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    {veiculos.map((v) => (
                      <option key={v.id} value={v.placa}>
                        {v.placa} ({v.tipoEquipamento})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Placa da Carreta (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: CAR-1234"
                    value={formData.placaCarreta || ''}
                    onChange={(e) => setFormData({ ...formData, placaCarreta: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Motorista Titular *</label>
                  <select
                    value={formData.motoristaNome}
                    onChange={(e) => setFormData({ ...formData, motoristaNome: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {motoristas.map((m) => (
                      <option key={m.id} value={m.nome}>{m.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">2º Motorista (Revezamento)</label>
                  <select
                    value={formData.segundoMotoristaNome || ''}
                    onChange={(e) => setFormData({ ...formData, segundoMotoristaNome: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="">Sem 2º Motorista</option>
                    {motoristas.map((m) => (
                      <option key={m.id} value={m.nome}>{m.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Ajudante Operacional</label>
                  <input
                    type="text"
                    placeholder="Nome do Ajudante (opcional)"
                    value={formData.ajudanteNome || ''}
                    onChange={(e) => setFormData({ ...formData, ajudanteNome: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Inspeção</label>
                  <select
                    value={formData.tipoInspecao}
                    onChange={(e) => setFormData({ ...formData, tipoInspecao: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Saída para Viagem">Saída para Viagem (Pré-Jornada)</option>
                    <option value="Retorno à Base">Retorno à Base (Pós-Jornada)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Km do Odômetro</label>
                  <input
                    type="number"
                    value={formData.kmInicial}
                    onChange={(e) => setFormData({ ...formData, kmInicial: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Itens Críticos de Inspeção */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Itens de Inspeção Obrigatória (SASSMAQ)
                </span>

                {[
                  { key: 'pneusPressaoEEstado', label: '1. Pneus calibrados, sem cortes e com sulco regulamentar' },
                  { key: 'freiosEstacionamentoEServico', label: '2. Freio de serviço e de estacionamento operantes (Crítico)' },
                  { key: 'luzesESinalizacao', label: '3. Faróis, setas, luzes de freio e placas refletivas' },
                  { key: 'extintoresPQSValidade', label: '4. Extintores de pó químico PQS na validade (Crítico)' },
                  { key: 'kitEmergenciaAmbipar', label: '5. Kit Emergência Ambipar Response completo (Crítico)' },
                  { key: 'vazamentoFluidos', label: '6. Isenção total de vazamento sob o chassi (Crítico)' },
                  { key: 'documentacaoMTRCIVCIPP', label: '7. Documentação obrigatória a bordo (MTR, CIV, CIPP)' },
                  { key: 'tacografoDiscoOuDigital', label: '8. Tacógrafo com disco inserido ou fita digital ativa' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 transition"
                  >
                    <span className="text-slate-300 font-medium text-xs pr-2">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean((formData as any)[item.key])}
                      onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                    />
                  </label>
                ))}
              </div>

              {/* Campo de Avarias */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Registro de Avarias
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-slate-400 text-[11px]">Possui avaria?</span>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.possuiAvarias)}
                      onChange={(e) => setFormData({ ...formData, possuiAvarias: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                  </label>
                </div>

                {formData.possuiAvarias && (
                  <textarea
                    rows={2}
                    placeholder="Descreva a avaria identificada..."
                    value={formData.descricaoAvarias}
                    onChange={(e) => setFormData({ ...formData, descricaoAvarias: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  ></textarea>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Observações da Inspeção</label>
                <textarea
                  rows={2}
                  placeholder="Relate qualquer anomalia mecânica ou observação..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
                >
                  Gravar Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE IMPRESSÃO A4 (LAUDO TÉCNICO DO CHECKLIST)
          ========================================================= */}
      {selectedChecklistForPrint && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-4 sm:p-6 space-y-4 max-h-[95vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Laudo de Inspeção Diária de Frota (A4)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir em A4</span>
                </button>
                <button
                  onClick={() => setSelectedChecklistForPrint(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Documento A4 Estilizado para Impressão */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 rounded-2xl font-sans text-xs space-y-4 shadow-inner border border-slate-300">
              <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                <div>
                  <div className="font-black text-sm uppercase text-slate-950">AMBIPAR LOGISTICS S.A.</div>
                  <div className="text-[11px] font-bold text-slate-700">
                    LAUDO DE INSPEÇÃO DIÁRIA DE SEGURANÇA OPERACIONAL & AMBIENTAL
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Procedimento Operacional Padrão SASSMAQ • ISO 9001 / 14001 / 45001
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-black text-slate-950">{selectedChecklistForPrint.id}</div>
                  <div className="text-[10px] text-slate-600">{formatDateTime(selectedChecklistForPrint.dataHora)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Placa do Veículo:</span>
                  <strong className="text-sm font-mono">{selectedChecklistForPrint.veiculoPlaca}</strong>
                  {selectedChecklistForPrint.placaCarreta && (
                    <div className="text-[10px] text-slate-600 font-mono">
                      Carreta: {selectedChecklistForPrint.placaCarreta}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Condutor Titular:</span>
                  <strong className="text-xs">{selectedChecklistForPrint.motoristaNome}</strong>
                  {selectedChecklistForPrint.motoristaCpf && (
                    <div className="text-[10px] text-slate-600">CPF: {selectedChecklistForPrint.motoristaCpf}</div>
                  )}
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Resultado Técnico:</span>
                  <strong className="text-xs text-emerald-700">{selectedChecklistForPrint.resultado}</strong>
                  <div className="text-[10px] text-slate-600">
                    Odômetro: {formatNumber(selectedChecklistForPrint.kmFinal || selectedChecklistForPrint.kmInicial)} km
                  </div>
                </div>
              </div>

              {/* Tabela de Itens Inspecionados */}
              <table className="w-full text-left border border-slate-300">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700">
                  <tr>
                    <th className="py-2 px-3">Item Inspecionado</th>
                    <th className="py-2 px-3 text-center">Status de Conformidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  <tr>
                    <td className="py-2 px-3">Pneus, Calibragem & Sulco Regulamentar</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">
                      {selectedChecklistForPrint.pneusPressaoEEstado ? 'CONFORME' : 'NÃO CONFORME'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Freios de Serviço & Estacionamento</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">
                      {selectedChecklistForPrint.freiosEstacionamentoEServico ? 'OPERANTE' : 'FALHA'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Kit Químico Ambipar Response</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">
                      {selectedChecklistForPrint.kitEmergenciaAmbipar ? '100% COMPLETO' : 'INCOMPLETO'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Extintor de Incêndio PQS na Validade</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">
                      {selectedChecklistForPrint.extintoresPQSValidade ? 'VÁLIDO' : 'VENCIDO'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Isenção de Vazamentos Sob o Chassi</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">
                      {selectedChecklistForPrint.vazamentoFluidos ? 'ISENTO' : 'DETECTADO'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Documentação de Porte Obrigatório (MTR/CIV)</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">
                      {selectedChecklistForPrint.documentacaoMTRCIVCIPP ? 'CONFORME' : 'FALTA'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Registro de Avarias */}
              {(selectedChecklistForPrint.possuiAvarias || selectedChecklistForPrint.avariasRetornoDetectadas) && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
                  <span className="font-bold text-[10px] uppercase text-amber-900">
                    Avarias Registradas pelo Condutor:
                  </span>
                  <p className="text-xs text-slate-800">
                    {selectedChecklistForPrint.descricaoAvarias || selectedChecklistForPrint.descricaoAvariasRetorno}
                  </p>
                </div>
              )}

              {/* Assinaturas Digitais */}
              <div className="grid grid-cols-2 gap-6 pt-6 text-center border-t border-slate-300">
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-xs">{selectedChecklistForPrint.motoristaNome}</div>
                  <div className="text-[10px] text-slate-500">Condutor Operacional (Assinatura Digital)</div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-xs">Ambipar Logistics</div>
                  <div className="text-[10px] text-slate-500">Supervisão de Frota, CCO & Manutenção</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
