import React from 'react';
import { Viagem, DocumentoAmbiental, Ocorrencia, Veiculo, Motorista } from '../types';
import {
  Truck,
  Scale,
  Target,
  Leaf,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  QrCode,
  Users,
  Sparkles,
  Tv,
} from 'lucide-react';
import { formatNumber, formatCurrency, getStatusColor } from '../utils/formatters';
import { calculateEsgMetrics } from '../utils/esgCalculator';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  viagens: Viagem[];
  mtrs: DocumentoAmbiental[];
  ocorrencias: Ocorrencia[];
  veiculos?: Veiculo[];
  motoristas?: Motorista[];
  onNavigateToTab: (tab: any) => void;
  onOpenQrCode?: () => void;
  onOpenTorreTv?: () => void;
  onCarregarDemo?: () => void;
  onOpenBackup?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  viagens,
  mtrs,
  ocorrencias,
  veiculos = [],
  motoristas = [],
  onNavigateToTab,
  onOpenQrCode,
  onOpenTorreTv,
  onCarregarDemo,
  onOpenBackup,
}) => {
  // Calculations
  const totalViagens = viagens.length;
  const viagensEmTransito = viagens.filter((v) => v.status === 'Em Trânsito').length;
  const viagensConcluidas = viagens.filter((v) => v.status === 'Concluída').length;
  const viagensAtrasadas = viagens.filter((v) => v.status === 'Atrasada').length;
  const viagensNoCliente = viagens.filter((v) => v.status === 'No Cliente' || v.status === 'Carregando' || v.status === 'Descarregando').length;

  const totalVolumeTon = viagens.reduce((acc, v) => acc + (v.pesoToneladas || 0), 0);
  const totalDistanciaKm = viagens.reduce((acc, v) => acc + (v.distanciaKm || 0), 0);
  const totalCusto = viagens.reduce((acc, v) => acc + (v.custoTotal || 0), 0);

  // ESG aggregation
  let totalCo2Emitido = 0;
  let totalCo2Evitado = 0;
  viagens.forEach((v) => {
    const esg = calculateEsgMetrics(v.distanciaKm, v.tipoCombustivel);
    totalCo2Emitido += esg.co2EmitidoKg;
    totalCo2Evitado += esg.co2EvitadoKg;
  });

  // OTIF Calculation (On Time In Full)
  const viagensFinalizadasOuAtrasadas = viagensConcluidas + viagensAtrasadas;
  const otifPercent = viagensFinalizadasOuAtrasadas > 0
    ? Math.round((viagensConcluidas / viagensFinalizadasOuAtrasadas) * 100)
    : 100;

  // Waste category aggregation for Pie Chart
  const wasteCategoryMap: Record<string, number> = {};
  viagens.forEach((v) => {
    const cat = v.classeResiduo.split('-')[0].trim();
    wasteCategoryMap[cat] = (wasteCategoryMap[cat] || 0) + v.pesoToneladas;
  });
  const wasteData = Object.entries(wasteCategoryMap).map(([name, value]) => ({
    name,
    value: Math.round(value * 10) / 10,
  }));

  const COLORS_PIE = ['#00a859', '#38d58c', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  // Status aggregation for Bar Chart
  const statusCounts = [
    { name: 'Em Trânsito', count: viagensEmTransito, fill: '#3b82f6' },
    { name: 'No Cliente', count: viagensNoCliente, fill: '#6366f1' },
    { name: 'Concluída', count: viagensConcluidas, fill: '#00a859' },
    { name: 'Atrasada', count: viagensAtrasadas, fill: '#f43f5e' },
    { name: 'Programada', count: viagens.filter((v) => v.status === 'Programada').length, fill: '#64748b' },
  ];

  const ocorrenciasAbertas = ocorrencias.filter((o) => o.status !== 'Concluída');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-ambipar-950/70 border border-slate-700/60 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ambipar-400 animate-ping"></span>
              <span className="text-xs uppercase tracking-wider font-bold text-ambipar-400">
                Torre de Controle Logística Ativa
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Olá, Carlos Eduardo &middot; Ambipar Logistics
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Painel operacional tático de monitoramento de frotas, transporte de resíduos perigosos e conformidade MTR/SINIR para a sua rotina diária como analista.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onOpenTorreTv && (
              <button
                type="button"
                onClick={onOpenTorreTv}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-[0.98] border border-emerald-400/30"
              >
                <Tv className="w-4 h-4 text-emerald-200" />
                <span>Modo Telão (Torre TV)</span>
              </button>
            )}
            <button
              onClick={() => onNavigateToTab('viagens')}
              className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/25 transition"
            >
              <Truck className="w-4 h-4" />
              <span>Gerenciar Viagens</span>
            </button>
            <button
              onClick={() => onNavigateToTab('relatorio')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition"
            >
              <span>Relatório do Dia</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guia de Ativação / Onboarding da Unidade (quando a base está sendo implantada) */}
      {(totalViagens === 0 || veiculos.length === 0 || motoristas.length === 0) && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-ambipar-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-ambipar-400" />
                <span>Primeiros Passos &middot; Implantação da Operação Ambipar</span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">
                Checklist de Ativação da Frota e Despacho
              </h3>
              <p className="text-xs text-slate-400">
                Siga este roteiro para colocar a operação da sua unidade rodando com conformidade total SASSMAQ.
              </p>
            </div>

            {/* Barra de Progresso da Implantação */}
            <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Progresso</span>
                <span className="text-xs font-black text-emerald-400">
                  {((veiculos.length > 0 ? 1 : 0) + (motoristas.length > 0 ? 1 : 0) + (viagens.length > 0 ? 1 : 0) + (mtrs.length > 0 ? 1 : 0))} de 4 etapas
                </span>
              </div>
              <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(((veiculos.length > 0 ? 1 : 0) + (motoristas.length > 0 ? 1 : 0) + (viagens.length > 0 ? 1 : 0) + (mtrs.length > 0 ? 1 : 0)) / 4) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Banner de Demonstração VIP vs Operação Real */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-950/60 to-teal-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Deseja demonstrar o sistema completo para os gestores da Ambipar?</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    1 Clique
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Carregue instantaneamente frota pesada realística (Volvo, Scania, carretas tanque com CIV/CIPP, viagens ativas Paulínia-Betim/Camaçari e pneus mapeados).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {onCarregarDemo && (
                <button
                  type="button"
                  onClick={onCarregarDemo}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Carregar Demonstração VIP</span>
                </button>
              )}
              {onOpenBackup && (
                <button
                  type="button"
                  onClick={onOpenBackup}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  <span>Backup / Limpar</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Etapa 1: Veículos */}
            <div
              className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                veiculos.length > 0
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">1. Cadastrar Frota</span>
                  {veiculos.length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Truck className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {veiculos.length > 0
                    ? `${veiculos.length} veículo(s) cadastrado(s) na frota.`
                    : 'Importe o CRLV Digital ou cadastre caminhões e implementos.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab('frota')}
                className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  veiculos.length > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 shadow-sm'
                }`}
              >
                <span>{veiculos.length > 0 ? 'Ver Frota' : 'Cadastrar Frota'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Etapa 2: Motoristas */}
            <div
              className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                motoristas.length > 0
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">2. Motoristas &amp; Ajudantes</span>
                  {motoristas.length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Users className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {motoristas.length > 0
                    ? `${motoristas.length} condutor(es) cadastrado(s).`
                    : 'Registre titulares, segundo motorista e ajudantes com CNH/MOPP.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab('motoristas')}
                className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  motoristas.length > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                <span>{motoristas.length > 0 ? 'Ver Motoristas' : 'Cadastrar Equipe'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Etapa 3: QR Code Cabine */}
            <div className="p-4 rounded-xl border bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 transition flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">3. QR Code de Cabine</span>
                  <QrCode className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Gere a plaqueta adesiva de para-brisa para os motoristas fazerem checklist no celular.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onOpenQrCode) onOpenQrCode();
                  else onNavigateToTab('checklist');
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Gerar Plaqueta</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Etapa 4: Viagens */}
            <div
              className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                viagens.length > 0
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">4. Viagens &amp; Escalas</span>
                  {viagens.length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Truck className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {viagens.length > 0
                    ? `${viagens.length} viagem(ns) em andamento.`
                    : 'Programe rotas, clientes químicos e gere MTRs de transporte.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab('viagens')}
                className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  viagens.length > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                <span>{viagens.length > 0 ? 'Ver Viagens' : 'Programar Viagem'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Viagens em Operação */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Viagens em Operação</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {viagensEmTransito + viagensNoCliente}
            </span>
            <span className="text-xs font-medium text-slate-400">
              de {totalViagens} cadastradas
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-blue-400 font-medium">{viagensEmTransito} em trânsito</span>
            <span className="text-indigo-400 font-medium">{viagensNoCliente} em cliente</span>
          </div>
        </div>

        {/* Card 2: Volume Total Transportado */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Volume Total</span>
            <div className="w-9 h-9 rounded-xl bg-ambipar-500/10 text-ambipar-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {formatNumber(totalVolumeTon)}
            </span>
            <span className="text-xs font-bold text-ambipar-400">toneladas</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Distância percorrida</span>
            <span className="text-white font-medium">{formatNumber(totalDistanciaKm, 0)} km</span>
          </div>
        </div>

        {/* Card 3: Indicador OTIF */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Nível de Serviço (OTIF)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {otifPercent}%
            </span>
            <span className={`text-xs font-semibold ${otifPercent >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {otifPercent >= 90 ? 'Meta Atingida' : 'Abaixo da meta (95%)'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${otifPercent >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${otifPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 4: Descarbonização ESG */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Impacto ESG (CO2 Evitado)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {formatNumber(totalCo2Evitado, 1)}
            </span>
            <span className="text-xs font-bold text-slate-400">kg CO2e</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Frota Verde (HVO/Elétricos)</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Compromisso Net Zero
            </span>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner (if any occurrences or pending documents) */}
      {ocorrenciasAbertas.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                Atenção Operacional &middot; {ocorrenciasAbertas.length} Ocorrência(s) em Aberto
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {ocorrenciasAbertas[0].descricao} ({ocorrenciasAbertas[0].codigoViagem})
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('ocorrencias')}
            className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition shrink-0"
          >
            Ver Detalhes
          </button>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Status das Viagens */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Status Operacional das Frotas</h3>
              <p className="text-xs text-slate-400">Distribuição em tempo real das viagens</p>
            </div>
            <span className="text-xs font-medium text-slate-400">Hoje</span>
          </div>

          <div className="h-64">
            {totalViagens === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <Truck className="w-8 h-8 text-slate-700 mb-2" />
                <span>Nenhuma viagem despachada para exibir status</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Categoria de Resíduos Transportados */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Volume por Categoria de Carga</h3>
              <p className="text-xs text-slate-400">Distribuição em toneladas transportadas</p>
            </div>
            <span className="text-xs font-medium text-slate-400">Total: {formatNumber(totalVolumeTon)} t</span>
          </div>

          <div className="h-64">
            {wasteData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <Scale className="w-8 h-8 text-slate-700 mb-2" />
                <span>Nenhuma carga registrada para exibir distribuição</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {wasteData.map((_, index) => (
                      <Cell key={`pie-cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} Ton`, 'Peso']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Live Fleet Table Preview */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Monitoramento de Viagens em Destaque</h3>
            <p className="text-xs text-slate-400">Últimas cargas despachadas e em trânsito</p>
          </div>
          <button
            onClick={() => onNavigateToTab('viagens')}
            className="text-xs font-semibold text-ambipar-400 hover:text-ambipar-300 flex items-center gap-1 transition"
          >
            <span>Ver todas as viagens</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Cliente Gerador</th>
                <th className="py-3 px-3">Origem &rarr; Destino</th>
                <th className="py-3 px-3">Equipamento / Placa</th>
                <th className="py-3 px-3">Carga / MTR</th>
                <th className="py-3 px-3 text-right">Peso</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {viagens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhuma viagem registrada no momento. Clique em "Gerenciar Viagens" para cadastrar a primeira carga operacional.
                  </td>
                </tr>
              ) : (
                viagens.slice(0, 5).map((v) => {
                  const badge = getStatusColor(v.status);
                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {v.codigoViagem}
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {v.cliente}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-ambipar-400 shrink-0" />
                          <span>{v.origem} &rarr; {v.destino}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div>{v.tipoEquipamento}</div>
                        <span className="font-mono text-[10px] text-slate-500">{v.placaCavalo}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-300 block">{v.classeResiduo.split('-')[0]}</span>
                        <span className="font-mono text-[10px] text-ambipar-400">{v.numeroMTR}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {formatNumber(v.pesoToneladas)} t
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {v.status}
                        </span>
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
  );
};
