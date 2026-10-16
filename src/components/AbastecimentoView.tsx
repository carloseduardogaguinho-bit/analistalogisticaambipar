import React, { useState } from 'react';
import { Abastecimento, Veiculo, Motorista, TipoCombustivel } from '../types';
import {
  Fuel,
  Plus,
  Search,
  TrendingUp,
  Award,
  DollarSign,
  Gauge,
  User,
  Truck,
  X,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface AbastecimentoViewProps {
  abastecimentos: Abastecimento[];
  veiculos: Veiculo[];
  motoristas: Motorista[];
  onAddAbastecimento: (abastecimento: Abastecimento) => void;
}

const COMBUSTIVEIS: TipoCombustivel[] = [
  'HVO (Diesel Verde)',
  'Diesel S10',
  '100% Elétrico',
  'GNV',
  'Biodiesel B20',
];

export const AbastecimentoView: React.FC<AbastecimentoViewProps> = ({
  abastecimentos,
  veiculos,
  motoristas,
  onAddAbastecimento,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Abastecimento>>({
    veiculoPlaca: veiculos[0]?.placa || '',
    motoristaNome: motoristas[0]?.nome || '',
    odometroKm: 0,
    litrosAbastecidos: 100,
    tipoCombustivel: 'HVO (Diesel Verde)',
    valorTotal: 0,
    posto: '',
    kmRodadosDesdeUltimo: 0,
  });

  const filtered = abastecimentos.filter((a) =>
    a.veiculoPlaca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.motoristaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.posto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.tipoCombustivel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aggregation: Média de Cada Motorista em Cada Carro
  // Key: `${motorista}__${veiculo}`
  const motoristaVeiculoMap: Record<string, { motorista: string; veiculo: string; totalKm: number; totalLitros: number; count: number; mediaKmL: number }> = {};

  abastecimentos.forEach((a) => {
    const key = `${a.motoristaNome}__${a.veiculoPlaca}`;
    if (!motoristaVeiculoMap[key]) {
      motoristaVeiculoMap[key] = {
        motorista: a.motoristaNome,
        veiculo: a.veiculoPlaca,
        totalKm: 0,
        totalLitros: 0,
        count: 0,
        mediaKmL: 0,
      };
    }
    const km = a.kmRodadosDesdeUltimo || 0;
    const l = a.litrosAbastecidos || 0;
    motoristaVeiculoMap[key].totalKm += km;
    motoristaVeiculoMap[key].totalLitros += l;
    motoristaVeiculoMap[key].count += 1;
  });

  // Calculate actual average km/l
  const motoristaVeiculoList = Object.values(motoristaVeiculoMap).map((item) => {
    const media = item.totalLitros > 0 && item.totalKm > 0 ? item.totalKm / item.totalLitros : 0;
    return {
      ...item,
      mediaKmL: Math.round(media * 100) / 100,
    };
  });

  // Ranking data for chart
  const rankingChartData = motoristaVeiculoList
    .slice(0, 8)
    .map((item) => ({
      name: `${item.motorista.split(' ')[0]} (${item.veiculo})`,
      media: item.mediaKmL,
    }));

  const totalLitrosGeral = abastecimentos.reduce((acc, a) => acc + a.litrosAbastecidos, 0);
  const totalGastoGeral = abastecimentos.reduce((acc, a) => acc + a.valorTotal, 0);
  const mediaFrotaGeral = motoristaVeiculoList.length > 0
    ? (motoristaVeiculoList.reduce((acc, i) => acc + i.mediaKmL, 0) / motoristaVeiculoList.length).toFixed(2)
    : '0.00';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const litros = Number(formData.litrosAbastecidos) || 1;
    const kmRodados = Number(formData.kmRodadosDesdeUltimo) || 0;
    const mediaKmL = kmRodados > 0 && litros > 0 ? Math.round((kmRodados / litros) * 100) / 100 : 0;

    const newAba: Abastecimento = {
      id: `aba-${Date.now()}`,
      dataHora: new Date().toISOString().slice(0, 16).replace('T', ' '),
      veiculoPlaca: formData.veiculoPlaca || 'AMB-0000',
      motoristaNome: formData.motoristaNome || 'Motorista',
      odometroKm: Number(formData.odometroKm) || 0,
      litrosAbastecidos: litros,
      tipoCombustivel: formData.tipoCombustivel as TipoCombustivel,
      valorTotal: Number(formData.valorTotal) || 0,
      posto: formData.posto || 'Posto Credenciado',
      kmRodadosDesdeUltimo: kmRodados,
      mediaKmL,
    };

    onAddAbastecimento(newAba);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Fuel className="w-5 h-5 text-emerald-400" />
            <span>Controle de Abastecimento & Médias de Consumo por Motorista</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de combustível, acompanhamento da média (km/l) de cada condutor por veículo e programa de ecocondução.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Abastecimento</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Média Geral da Frota</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{mediaFrotaGeral} km/L</div>
          <div className="text-[11px] text-slate-500">Média ponderada da frota pesada e média</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Combustível Consumido</span>
            <Fuel className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatNumber(totalLitrosGeral, 0)} Litros</div>
          <div className="text-[11px] text-slate-500">Total registrado em {abastecimentos.length} abastecimentos</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Custo com Combustível</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{formatCurrency(totalGastoGeral)}</div>
          <div className="text-[11px] text-slate-500">Diesel S10, HVO e eletricidade</div>
        </div>
      </div>

      {/* Core Table: Média de Cada Motorista em Cada Carro */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Média de Desempenho: Motorista &times; Veículo
              </h3>
              <p className="text-xs text-slate-400">Relação exata do consumo médio alcançado por cada condutor em cada caminhão</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            Meta Frota: &ge; 2.50 km/L
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Motorista Condutor</th>
                <th className="py-3 px-4">Veículo / Placa</th>
                <th className="py-3 px-4 text-right">Km Rodados</th>
                <th className="py-3 px-4 text-right">Litros Totais</th>
                <th className="py-3 px-4 text-right">Média de Consumo</th>
                <th className="py-3 px-4 text-center">Classificação de Eficiência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {motoristaVeiculoList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhum abastecimento registrado ainda. Lance os abastecimentos para calcular as médias de consumo de cada condutor e caminhão.
                  </td>
                </tr>
              ) : (
                motoristaVeiculoList.map((item, idx) => {
                  const isAltaEficiencia = item.mediaKmL >= 2.6;
                  const isMediaRegular = item.mediaKmL >= 2.3 && item.mediaKmL < 2.6;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-ambipar-400">
                          {item.motorista.charAt(0)}
                        </div>
                        <span>{item.motorista}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 font-semibold">
                          {item.veiculo}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatNumber(item.totalKm, 0)} km
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatNumber(item.totalLitros, 1)} L
                      </td>

                      <td className="py-3 px-4 text-right">
                        <strong className={`text-sm font-black font-mono ${
                          isAltaEficiencia ? 'text-emerald-400' : isMediaRegular ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {item.mediaKmL.toFixed(2)} km/L
                        </strong>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                            isAltaEficiencia
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isMediaRegular
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isAltaEficiencia ? '🌟 Excelente (Econômico)' : isMediaRegular ? '⚠️ Regular' : '🚨 Alto Consumo'}
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

      {/* Consumption Comparison Chart */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Comparativo Visual de Desempenho (km/L por Motorista)</span>
        </h3>

        <div className="h-64">
          {rankingChartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
              <Fuel className="w-8 h-8 text-slate-700 mb-2" />
              <span>Nenhum dado de abastecimento para gerar o comparativo</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 4.5]} />
                <Tooltip
                  formatter={(val: any) => [`${val} km/L`, 'Consumo Médio']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="media" radius={[6, 6, 0, 0]}>
                  {rankingChartData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.media >= 2.6 ? '#00a859' : entry.media >= 2.3 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* History of Fuelings Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Histórico Detalhado de Abastecimentos</h3>
          <span className="text-xs text-slate-400">{filtered.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Veículo / Motorista</th>
                <th className="py-2.5 px-3">Combustível</th>
                <th className="py-2.5 px-3">Posto</th>
                <th className="py-2.5 px-3 text-right">Odômetro</th>
                <th className="py-2.5 px-3 text-right">Litros</th>
                <th className="py-2.5 px-3 text-right">Valor Total</th>
                <th className="py-2.5 px-3 text-right">Média do Tiro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhum registro de abastecimento encontrado. Clique em "Lançar Abastecimento" para inserir notas fiscais de combustível.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{a.dataHora}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-white mr-1.5">{a.veiculoPlaca}</span>
                      <span className="text-slate-300">({a.motoristaNome})</span>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">{a.tipoCombustivel}</td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{a.posto}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-white">{formatNumber(a.odometroKm, 0)} km</td>
                    <td className="py-2.5 px-3 text-right font-mono text-white">{formatNumber(a.litrosAbastecidos, 1)} L</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400">{formatCurrency(a.valorTotal)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {a.mediaKmL ? `${a.mediaKmL.toFixed(2)} km/L` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lançar Abastecimento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Lançar Novo Abastecimento</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Veículo (Placa) *</label>
                  <select
                    value={formData.veiculoPlaca}
                    onChange={(e) => setFormData({ ...formData, veiculoPlaca: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    {veiculos.map((v) => (
                      <option key={v.id} value={v.placa}>{v.placa} - {v.marca} {v.modelo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Motorista Condutor *</label>
                  <select
                    value={formData.motoristaNome}
                    onChange={(e) => setFormData({ ...formData, motoristaNome: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {motoristas.map((m) => (
                      <option key={m.id} value={m.nome}>{m.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Odômetro Atual (Km) *</label>
                  <input
                    type="number"
                    required
                    value={formData.odometroKm}
                    onChange={(e) => setFormData({ ...formData, odometroKm: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Km Rodados Desde o Último</label>
                  <input
                    type="number"
                    value={formData.kmRodadosDesdeUltimo}
                    onChange={(e) => setFormData({ ...formData, kmRodadosDesdeUltimo: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Litros Abastecidos *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.litrosAbastecidos}
                    onChange={(e) => setFormData({ ...formData, litrosAbastecidos: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Valor Total Pago (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.valorTotal}
                    onChange={(e) => setFormData({ ...formData, valorTotal: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Combustível</label>
                  <select
                    value={formData.tipoCombustivel}
                    onChange={(e) => setFormData({ ...formData, tipoCombustivel: e.target.value as TipoCombustivel })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {COMBUSTIVEIS.map((cb) => (
                      <option key={cb} value={cb}>{cb}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Posto / Ponto de Abastecimento</label>
                  <input
                    type="text"
                    value={formData.posto}
                    onChange={(e) => setFormData({ ...formData, posto: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                >
                  Gravar Abastecimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
