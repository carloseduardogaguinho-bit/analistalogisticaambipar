import React from 'react';
import { Viagem } from '../types';
import {
  BarChart3,
  Leaf,
  Target,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Award,
  Zap,
  Sparkles
} from 'lucide-react';
import { formatNumber, formatCurrency } from '../utils/formatters';
import { calculateEsgMetrics } from '../utils/esgCalculator';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

interface EsgKpiViewProps {
  viagens: Viagem[];
}

export const EsgKpiView: React.FC<EsgKpiViewProps> = ({ viagens }) => {
  const totalViagens = viagens.length;
  const totalVolumeTon = viagens.reduce((acc, v) => acc + (v.pesoToneladas || 0), 0);
  const totalDistanciaKm = viagens.reduce((acc, v) => acc + (v.distanciaKm || 0), 0);
  const totalCusto = viagens.reduce((acc, v) => acc + (v.custoTotal || 0), 0);

  const custoMedioPorKm = totalDistanciaKm > 0 ? totalCusto / totalDistanciaKm : 0;
  const custoMedioPorTon = totalVolumeTon > 0 ? totalCusto / totalVolumeTon : 0;

  // ESG details
  let totalCo2Emitido = 0;
  let totalCo2Evitado = 0;

  // Breakdown by fuel type
  const fuelUsage: Record<string, { km: number; emitido: number; evitado: number; count: number }> = {};

  viagens.forEach((v) => {
    const esg = calculateEsgMetrics(v.distanciaKm, v.tipoCombustivel);
    totalCo2Emitido += esg.co2EmitidoKg;
    totalCo2Evitado += esg.co2EvitadoKg;

    if (!fuelUsage[v.tipoCombustivel]) {
      fuelUsage[v.tipoCombustivel] = { km: 0, emitido: 0, evitado: 0, count: 0 };
    }
    fuelUsage[v.tipoCombustivel].km += v.distanciaKm;
    fuelUsage[v.tipoCombustivel].emitido += esg.co2EmitidoKg;
    fuelUsage[v.tipoCombustivel].evitado += esg.co2EvitadoKg;
    fuelUsage[v.tipoCombustivel].count += 1;
  });

  const fuelChartData = Object.entries(fuelUsage).map(([combustivel, data]) => ({
    name: combustivel,
    emitido: Math.round(data.emitido),
    evitado: Math.round(data.evitado),
    km: data.km,
  }));

  // Circular Economy (Coprocessamento / Reciclagem vs Aterro)
  const coprocessadoOuReciclado = viagens
    .filter((v) => v.classeResiduo.includes('Valorizado') || v.classeResiduo.includes('Reversa'))
    .reduce((acc, v) => acc + v.pesoToneladas, 0);

  const circularidadePercent = totalVolumeTon > 0
    ? Math.round((coprocessadoOuReciclado / totalVolumeTon) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-ambipar-400" />
          <span>Painel Estratégico de Indicadores (KPIs) & Descarbonização ESG</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Métricas de eficiência operacional, custos logísticos e redução da pegada de carbono alinhados à liderança global da Ambipar.
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Custo Médio por km */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Custo Médio / km</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {formatCurrency(custoMedioPorKm)}
          </div>
          <div className="text-[11px] text-slate-400">
            Total rodado: <strong className="text-white">{formatNumber(totalDistanciaKm, 0)} km</strong>
          </div>
        </div>

        {/* Custo Médio por Tonelada */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Custo Médio / Tonelada</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {formatCurrency(custoMedioPorTon)}
          </div>
          <div className="text-[11px] text-slate-400">
            Total transportado: <strong className="text-white">{formatNumber(totalVolumeTon)} t</strong>
          </div>
        </div>

        {/* CO2 Total Evitado */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 bg-gradient-to-br from-slate-900 to-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
            <span>CO2e Evitado (Frota Verde)</span>
            <Leaf className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {formatNumber(totalCo2Evitado, 1)} kg
          </div>
          <div className="text-[11px] text-slate-400">
            Equivalente a <strong className="text-emerald-300">~{Math.round(totalCo2Evitado / 15)} árvores</strong> plantadas
          </div>
        </div>

        {/* Taxa de Desvio de Aterro (Economia Circular) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 bg-gradient-to-br from-slate-900 to-ambipar-950/20">
          <div className="flex items-center justify-between text-ambipar-400 text-xs font-bold">
            <span>Economia Circular (Desvio Aterro)</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {circularidadePercent}%
          </div>
          <div className="text-[11px] text-slate-400">
            {formatNumber(coprocessadoOuReciclado)} t valorizadas p/ coprocessamento
          </div>
        </div>
      </div>

      {/* Chart: Emissões vs Reduções por Combustível */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Emissões Emitidas vs Evitadas por Tipo de Combustível (kg CO2e)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparativo entre a pegada real gerada e a pegada que seria gerada em motor diesel fóssil padrão
            </p>
          </div>
        </div>

        <div className="h-72">
          {fuelChartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
              <Leaf className="w-8 h-8 text-slate-700 mb-2" />
              <span>Nenhum dado de viagem ou combustível registrado para gerar gráfico de emissões</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} kg CO2e`]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="emitido" name="CO2e Emitido (kg)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="evitado" name="CO2e Evitado / Poupado (kg)" fill="#00a859" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Ambipar Decarbonization Policy & Tips */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Recomendações Logísticas para o Analista de Operação
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <strong className="text-emerald-400 block font-semibold">1. Roteirização Inteligente</strong>
            <p className="text-slate-400 leading-relaxed">
              Consolidar cargas fracionadas de coletas de logística reversa para diminuir viagens vazias ("backhaul") entre bases de transbordo.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <strong className="text-teal-400 block font-semibold">2. Prioridade HVO / Elétricos</strong>
            <p className="text-slate-400 leading-relaxed">
              Destinar veículos elétricos e movidos a HVO (Diesel Verde) para clientes com metas severas de escopo 3 de emissões de GEE.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <strong className="text-amber-400 block font-semibold">3. Zero Tempo de Ociosidade</strong>
            <p className="text-slate-400 leading-relaxed">
              Manter SLA de carga/descarga abaixo de 2h nas portarias para evitar consumo excessivo de combustível com motor ligado na fila.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
