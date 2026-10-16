import React, { useState, useMemo } from 'react';
import { ChecklistDiario, Veiculo, Motorista, SeveridadeAvaria } from '../types';
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
  Download
} from 'lucide-react';
import { formatDateTime, formatNumber } from '../utils/formatters';

interface ChecklistViewProps {
  checklists: ChecklistDiario[];
  veiculos: Veiculo[];
  motoristas: Motorista[];
  onAddChecklist: (checklist: ChecklistDiario) => void;
  onOpenPortalMotorista?: () => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklists,
  veiculos,
  motoristas,
  onAddChecklist,
  onOpenPortalMotorista,
}) => {
  // Sub-abas: 'todos' | 'jornadas' | 'avarias'
  const [activeSubTab, setActiveSubTab] = useState<'todos' | 'jornadas' | 'avarias'>('todos');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterResultado, setFilterResultado] = useState<string>('todos');
  const [filterAvarias, setFilterAvarias] = useState<string>('todos');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChecklistForPrint, setSelectedChecklistForPrint] = useState<ChecklistDiario | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Link único do motorista
  const portalUrl = typeof window !== 'undefined'
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

  // Form State para lançamento interno pelo analista/despachante
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

  // Filtragem
  const filtered = useMemo(() => {
    return checklists.filter((c) => {
      const matchSearch =
        c.veiculoPlaca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.motoristaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.resultado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.descricaoAvarias && c.descricaoAvarias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.descricaoAvariasRetorno && c.descricaoAvariasRetorno.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTipo = filterTipo === 'todos' || c.tipoInspecao === filterTipo;
      const matchResultado = filterResultado === 'todos' || c.resultado === filterResultado;
      const matchAvarias =
        filterAvarias === 'todos' ||
        (filterAvarias === 'com_avarias' && (c.possuiAvarias || c.avariasRetornoDetectadas)) ||
        (filterAvarias === 'sem_avarias' && !c.possuiAvarias && !c.avariasRetornoDetectadas);

      return matchSearch && matchTipo && matchResultado && matchAvarias;
    });
  }, [checklists, searchTerm, filterTipo, filterResultado, filterAvarias]);

  // Agrupamento de Jornadas (Saída + Retorno do mesmo veículo/dia)
  const jornadasAgrupadas = useMemo(() => {
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

    return Object.entries(grupos).map(([chave, g]) => ({
      chave,
      saida: g.saida,
      retorno: g.retorno,
      veiculoPlaca: g.saida?.veiculoPlaca || g.retorno?.veiculoPlaca || 'AMB',
      placaCarreta: g.saida?.placaCarreta || g.retorno?.placaCarreta,
      motoristaNome: g.saida?.motoristaNome || g.retorno?.motoristaNome || 'Motorista',
      segundoMotoristaNome: g.saida?.segundoMotoristaNome || g.retorno?.segundoMotoristaNome,
      ajudanteNome: g.saida?.ajudanteNome || g.retorno?.ajudanteNome,
      data: g.saida?.dataHora.slice(0, 10) || g.retorno?.dataHora.slice(0, 10) || '',
      kmInicial: g.saida?.kmInicial,
      kmFinal: g.retorno?.kmFinal,
      kmPercorrido:
        g.retorno?.kmPercorrido !== undefined
          ? g.retorno.kmPercorrido
          : g.saida?.kmInicial && g.retorno?.kmFinal
          ? Math.max(0, g.retorno.kmFinal - g.saida.kmInicial)
          : undefined,
      temAvariaSaida: g.saida?.possuiAvarias,
      temAvariaRetorno: g.retorno?.avariasRetornoDetectadas,
      status: g.saida && g.retorno ? 'Jornada Concluída (2 Checklists OK)' : g.saida ? 'Em Jornada (Aguardando Retorno)' : 'Retorno Registrado',
    }));
  }, [checklists]);

  // Avarias detectadas
  const checklistsComAvarias = useMemo(() => {
    return checklists.filter((c) => c.possuiAvarias || c.avariasRetornoDetectadas);
  }, [checklists]);

  // Submit manual
  const handleSubmit = (e: React.FormEvent) => {
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

    const newChk: ChecklistDiario = {
      id: `chk-${Date.now()}`,
      jornadaId: `jornada-${Date.now()}`,
      dataHora: new Date().toISOString().slice(0, 16).replace('T', ' '),
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-cyan-500/20">
              SASSMAQ • ISO 14001 • AMBIPAR RESPONSE
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5 mt-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <span>Checklist Diário: Pré-Jornada & Retorno à Base</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Inspeção preventiva obrigatória de saída e encerramento de viagem. O motorista realiza as 2 etapas
            em link único pelo smartphone logando com o CPF, com registro fotográfico e descritivo de avarias.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.open(portalUrl, '_blank');
              } else if (onOpenPortalMotorista) {
                onOpenPortalMotorista();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            title="Abrir o Portal do Motorista em uma nova janela/aba isolada"
          >
            <Smartphone className="w-4 h-4" />
            <span>Abrir Portal do Motorista (Nova Aba)</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Checklist Manual</span>
          </button>
        </div>
      </div>

      {/* BANNER DO LINK ÚNICO DO MOTORISTA */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
              Link Único & Dedicado para os Motoristas da Frota
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Envie este link para os motoristas no WhatsApp. O condutor acessa de qualquer celular, faz login
            com seu <strong>CPF</strong> e preenche os dois momentos: <strong>1. Checklist Inicial (Saída)</strong> com avarias prévias e <strong>2. Checklist Final (Retorno)</strong> com hodômetro final e avarias da rota.
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

      {/* Indicadores do Módulo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total de Inspeções</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{checklists.length}</div>
          <span className="text-[10px] text-slate-500">Registradas no sistema</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Aprovados 100%</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {checklists.filter((c) => c.resultado === 'Aprovado - Liberado').length}
          </div>
          <span className="text-[10px] text-emerald-400/80">Veículos liberados</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Com Avarias / Alertas</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {checklistsComAvarias.length}
          </div>
          <span className="text-[10px] text-amber-400/80">Registros com avarias</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Bloqueios Críticos</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {checklists.filter((c) => c.resultado === 'Reprovado - Bloqueado').length}
          </div>
          <span className="text-[10px] text-rose-400/80">Impedidos de circular</span>
        </div>
      </div>

      {/* Sub-Abas de Navegação */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('todos')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'todos'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Todos os Checklists ({checklists.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('jornadas')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'jornadas'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Jornadas Diárias Pareadas ({jornadasAgrupadas.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('avarias')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'avarias'
              ? 'border-amber-500 text-amber-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Radar de Avarias Registradas ({checklistsComAvarias.length})</span>
        </button>
      </div>

      {/* =========================================================
          SUB-ABA 1: TODOS OS CHECKLISTS
          ========================================================= */}
      {activeSubTab === 'todos' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por placa, motorista, resultado ou avaria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="todos">Todos os Momentos</option>
                <option value="Saída para Viagem">Saída para Viagem (Pré-Jornada)</option>
                <option value="Retorno à Base">Retorno à Base (Pós-Jornada)</option>
              </select>

              <select
                value={filterResultado}
                onChange={(e) => setFilterResultado(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="todos">Todos os Resultados</option>
                <option value="Aprovado - Liberado">Aprovado - Liberado</option>
                <option value="Aprovado com Restrição Leve">Aprovado c/ Restrição</option>
                <option value="Reprovado - Bloqueado">Reprovado - Bloqueado</option>
              </select>

              <select
                value={filterAvarias}
                onChange={(e) => setFilterAvarias(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="todos">Todas as Avarias</option>
                <option value="com_avarias">Apenas COM Avarias</option>
                <option value="sem_avarias">Apenas SEM Avarias</option>
              </select>
            </div>
          </div>

          {/* Cards dos Checklists */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
                <ClipboardCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Nenhum checklist localizado</h3>
                <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
                  Envie o link do portal para os motoristas ou lance manualmente para alimentar a base.
                </p>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar Link do Motorista</span>
                </button>
              </div>
            ) : (
              filtered.map((c) => {
                const isAprovado = c.resultado === 'Aprovado - Liberado';
                const isBloqueado = c.resultado === 'Reprovado - Bloqueado';
                const temAvaria = c.possuiAvarias || c.avariasRetornoDetectadas;

                return (
                  <div
                    key={c.id}
                    className={`p-5 rounded-2xl bg-slate-900 border transition shadow-sm space-y-3 ${
                      isBloqueado
                        ? 'border-rose-500/50 bg-gradient-to-r from-slate-900 to-rose-950/20'
                        : isAprovado
                        ? 'border-slate-800 hover:border-slate-700'
                        : 'border-amber-500/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          {c.veiculoPlaca}
                        </span>
                        {c.placaCarreta && (
                          <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                            Carreta: {c.placaCarreta}
                          </span>
                        )}
                        <div>
                          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 flex-wrap">
                            <span>{c.motoristaNome}</span>
                            {c.segundoMotoristaNome && (
                              <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
                                2º Mot: {c.segundoMotoristaNome}
                              </span>
                            )}
                            {c.ajudanteNome && (
                              <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                Ajudante: {c.ajudanteNome}
                              </span>
                            )}
                          </div>
                          {c.motoristaCpf && (
                            <span className="text-[10px] font-mono text-slate-500">CPF: {c.motoristaCpf}</span>
                          )}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {c.tipoInspecao}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-slate-400">{c.dataHora}</span>
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                            isAprovado
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isBloqueado
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isAprovado ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : isBloqueado ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          <span>{c.resultado}</span>
                        </span>

                        <button
                          onClick={() => setSelectedChecklistForPrint(c)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Imprimir Relatório Técnico do Checklist (A4)"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Resumo dos Itens de Inspeção */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                      <div className={`p-2 rounded-lg ${c.pneusPressaoEEstado ? 'bg-slate-950/60 text-slate-300' : 'bg-rose-500/10 text-rose-300'}`}>
                        <span>Pneus: {c.pneusPressaoEEstado ? '✓ Conforme' : '✕ Falha'}</span>
                      </div>
                      <div className={`p-2 rounded-lg ${c.freiosEstacionamentoEServico ? 'bg-slate-950/60 text-slate-300' : 'bg-rose-500/10 text-rose-300'}`}>
                        <span>Freios: {c.freiosEstacionamentoEServico ? '✓ Operante' : '✕ Defeito'}</span>
                      </div>
                      <div className={`p-2 rounded-lg ${c.kitEmergenciaAmbipar ? 'bg-slate-950/60 text-emerald-400' : 'bg-rose-500/10 text-rose-300'}`}>
                        <span>Kit Químico: {c.kitEmergenciaAmbipar ? '✓ Completo' : '✕ Falta Item'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 text-slate-300">
                        <span>Odômetro: <strong className="text-white font-mono">{formatNumber(c.kmInicial)} km</strong></span>
                      </div>
                    </div>

                    {/* Destaque de Avarias Registradas */}
                    {temAvaria && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Avaria Relatada pelo Motorista:</span>
                          {c.severidadeAvaria && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                              {c.severidadeAvaria}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-200">
                          {c.descricaoAvarias || c.descricaoAvariasRetorno}
                        </p>
                      </div>
                    )}

                    {c.observacoes && (
                      <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg">
                        Observações: <strong className="text-slate-200">{c.observacoes}</strong>
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
          SUB-ABA 2: JORNADAS DIÁRIAS PAREADAS (SAÍDA + RETORNO)
          ========================================================= */}
      {activeSubTab === 'jornadas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Jornadas Diárias Fechadas (Checklist de Saída + Checklist de Retorno)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Acompanhe a quilometragem percorrida pelo motorista na jornada e a comparação de avarias antes vs. após o trajeto.
            </p>
          </div>

          <div className="space-y-3">
            {jornadasAgrupadas.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
                Nenhuma jornada registrada até o momento.
              </div>
            ) : (
              jornadasAgrupadas.map((j) => (
                <div key={j.chave} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-white text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        {j.veiculoPlaca}
                      </span>
                      {j.placaCarreta && (
                        <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                          Carreta: {j.placaCarreta}
                        </span>
                      )}
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span>{j.motoristaNome}</span>
                          {j.segundoMotoristaNome && (
                            <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
                              2º Mot: {j.segundoMotoristaNome}
                            </span>
                          )}
                          {j.ajudanteNome && (
                            <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              Ajudante: {j.ajudanteNome}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">Data: {j.data}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      j.retorno
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {j.status}
                    </span>
                  </div>

                  {/* Grid Comparativo Saída vs Retorno */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bloco Saída */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-cyan-400">1. Checklist de Saída</span>
                        <span className="font-mono text-[11px] text-slate-400">{j.saida?.dataHora || 'Não realizado'}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500">Km Inicial:</span>{' '}
                        <strong className="text-white font-mono">{j.kmInicial ? `${formatNumber(j.kmInicial)} km` : '-'}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400">Avarias na Saída:</span>{' '}
                        {j.temAvariaSaida ? (
                          <span className="text-amber-400 font-semibold text-[11px]">
                            {j.saida?.descricaoAvarias}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold text-[11px]">Sem avarias prévias</span>
                        )}
                      </div>
                    </div>

                    {/* Bloco Retorno */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-emerald-400">2. Checklist de Retorno</span>
                        <span className="font-mono text-[11px] text-slate-400">{j.retorno?.dataHora || 'Pendente de envio'}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500">Km Final:</span>{' '}
                        <strong className="text-white font-mono">{j.kmFinal ? `${formatNumber(j.kmFinal)} km` : '-'}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400">Avarias na Viagem:</span>{' '}
                        {j.temAvariaRetorno ? (
                          <span className="text-rose-400 font-semibold text-[11px]">
                            {j.retorno?.descricaoAvariasRetorno}
                          </span>
                        ) : j.retorno ? (
                          <span className="text-emerald-400 font-semibold text-[11px]">Nenhuma avaria sofrida</span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Aguardando motorista</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resumo de Distância */}
                  {j.kmPercorrido !== undefined && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Quilometragem Total Rodada no Turno:</span>
                      <span className="text-base font-black font-mono text-emerald-400">{formatNumber(j.kmPercorrido)} KM</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-ABA 3: RADAR DE AVARIAS REGISTRADAS
          ========================================================= */}
      {activeSubTab === 'avarias' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Radar de Avarias & Não Conformidades para a Oficina / Manutenção</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Todos os relatos de danos, riscos, quebras ou anomalias apontados pelos motoristas para providência técnica imediata.
            </p>
          </div>

          <div className="space-y-3">
            {checklistsComAvarias.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-white font-bold text-sm">Nenhuma avaria registrada no momento!</p>
                <p className="text-xs text-slate-400 mt-1">Todos os veículos inspecionados encontram-se em perfeitas condições.</p>
              </div>
            ) : (
              checklistsComAvarias.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        {c.veiculoPlaca}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-200">{c.motoristaNome}</span>
                        <div className="text-[10px] text-slate-500 font-mono">{c.dataHora} • {c.tipoInspecao}</div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {c.severidadeAvaria || c.severidadeAvariaRetorno || 'Avaria Relatada'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400">
                      Local: {c.localAvaria || c.localAvariaRetorno || 'Lataria Geral'}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {c.descricaoAvarias || c.descricaoAvariasRetorno}
                    </p>
                  </div>
                </div>
              ))
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
                <h3 className="font-bold text-white text-base">Checklist Diário de Inspeção</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Ex: REB-9081 ou CAR-1234"
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

              {/* Itens Críticos */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Itens Críticos de Inspeção Obrigatória
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
          MODAL DE IMPRESSÃO A4 DO DOSSIÊ TÉCNICO DO CHECKLIST
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

            {/* Documento A4 */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 rounded-2xl font-sans text-xs space-y-4 shadow-inner border border-slate-300">
              <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                <div>
                  <div className="font-black text-sm uppercase text-slate-950">AMBIPAR LOGISTICS S.A.</div>
                  <div className="text-[11px] font-bold text-slate-700">LAUDO DE INSPEÇÃO DIÁRIA DE SEGURANÇA OPERACIONAL</div>
                  <div className="text-[9px] text-slate-500">Procedimento Operacional Padrão SASSMAQ • ISO 9001 / 14001 / 45001</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-black text-slate-950">{selectedChecklistForPrint.id}</div>
                  <div className="text-[10px] text-slate-600">{selectedChecklistForPrint.dataHora}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Placa:</span>
                  <strong className="text-sm font-mono">{selectedChecklistForPrint.veiculoPlaca}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Condutor:</span>
                  <strong className="text-xs">{selectedChecklistForPrint.motoristaNome}</strong>
                  {selectedChecklistForPrint.motoristaCpf && (
                    <div className="text-[10px] text-slate-600">CPF: {selectedChecklistForPrint.motoristaCpf}</div>
                  )}
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Resultado:</span>
                  <strong className="text-xs text-emerald-700">{selectedChecklistForPrint.resultado}</strong>
                </div>
              </div>

              {/* Tabela de Itens */}
              <table className="w-full text-left border border-slate-300">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700">
                  <tr>
                    <th className="py-2 px-3">Item Inspecionado</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  <tr>
                    <td className="py-2 px-3">Pneus, Calibragem & Sulco Regulamentar</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">{selectedChecklistForPrint.pneusPressaoEEstado ? 'CONFORME' : 'NÃO CONFORME'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Freios de Serviço & Estacionamento</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">{selectedChecklistForPrint.freiosEstacionamentoEServico ? 'OPERANTE' : 'FALHA'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Kit Químico Ambipar Response</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">{selectedChecklistForPrint.kitEmergenciaAmbipar ? '100% COMPLETO' : 'INCOMPLETO'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Extintor de Incêndio PQS</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">{selectedChecklistForPrint.extintoresPQSValidade ? 'VÁLIDO' : 'VENCIDO'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Isenção de Vazamentos Sob o Chassi</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">{selectedChecklistForPrint.vazamentoFluidos ? 'ISENTO' : 'DETECTADO'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Documentação de Porte Obrigatório</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">{selectedChecklistForPrint.documentacaoMTRCIVCIPP ? 'CONFORME' : 'FALTA'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Avarias */}
              {(selectedChecklistForPrint.possuiAvarias || selectedChecklistForPrint.avariasRetornoDetectadas) && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
                  <span className="font-bold text-[10px] uppercase text-amber-900">Avarias Registradas pelo Condutor:</span>
                  <p className="text-xs text-slate-800">
                    {selectedChecklistForPrint.descricaoAvarias || selectedChecklistForPrint.descricaoAvariasRetorno}
                  </p>
                </div>
              )}

              {/* Assinaturas */}
              <div className="grid grid-cols-2 gap-6 pt-6 text-center border-t border-slate-300">
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-xs">{selectedChecklistForPrint.motoristaNome}</div>
                  <div className="text-[10px] text-slate-500">Condutor Operacional (Assinatura Digital)</div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-xs">Ambipar Logistics</div>
                  <div className="text-[10px] text-slate-500">Supervisão de Frota & Segurança</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
