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
  Sparkles,
  AlertTriangle,
  Download,
  Trash2,
  CheckCircle2,
  Calendar,
  Building,
  Filter,
  Leaf,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertOctagon,
  FileText
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
  ReferenceLine
} from 'recharts';

interface AbastecimentoViewProps {
  abastecimentos: Abastecimento[];
  veiculos: Veiculo[];
  motoristas: Motorista[];
  onAddAbastecimento: (abastecimento: Abastecimento) => void;
  onDeleteAbastecimento?: (id: string) => void;
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
  onDeleteAbastecimento,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [combustivelFilter, setCombustivelFilter] = useState<string>('TODOS');
  const [filtroAnomaliasApenas, setFiltroAnomaliasApenas] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Abastecimento>>({
    veiculoPlaca: veiculos[0]?.placa || '',
    motoristaNome: motoristas[0]?.nome || '',
    odometroKm: 0,
    kmRodadosDesdeUltimo: 0,
    litrosAbastecidos: 100,
    precoLitro: 5.89,
    valorTotal: 589,
    tipoCombustivel: 'Diesel S10',
    posto: 'Posto Interno Base Paulínia',
    tipoPosto: 'Interno (Base Ambipar)',
    tanqueCheio: true,
    numeroNotaFiscal: '',
    arla32Litros: 0,
    arla32Valor: 0,
    observacoes: '',
  });

  // Autofill kmRodados and precoLitro when selecting vehicle
  const handleVeiculoChange = (placa: string) => {
    const veic = veiculos.find((v) => v.placa === placa);
    const odometroAnterior = veic?.odometroAtualKm || 0;
    
    // Procura o último abastecimento desse veículo
    const ultimosDesteVeiculo = abastecimentos
      .filter((a) => a.veiculoPlaca === placa)
      .sort((a, b) => b.odometroKm - a.odometroKm);
    
    const baseOdo = ultimosDesteVeiculo.length > 0 ? ultimosDesteVeiculo[0].odometroKm : odometroAnterior;

    setFormData((prev) => ({
      ...prev,
      veiculoPlaca: placa,
      odometroKm: baseOdo > 0 ? baseOdo + 350 : 0,
      kmRodadosDesdeUltimo: 350,
      tipoCombustivel: veic?.tipoCombustivelPadrao || prev.tipoCombustivel || 'Diesel S10',
    }));
  };

  // Live calculation in form
  const handleLitrosChange = (litros: number) => {
    const preco = Number(formData.precoLitro) || 5.89;
    const total = Math.round(litros * preco * 100) / 100;
    setFormData((prev) => ({
      ...prev,
      litrosAbastecidos: litros,
      valorTotal: total,
    }));
  };

  const handlePrecoChange = (preco: number) => {
    const litros = Number(formData.litrosAbastecidos) || 0;
    const total = Math.round(litros * preco * 100) / 100;
    setFormData((prev) => ({
      ...prev,
      precoLitro: preco,
      valorTotal: total,
    }));
  };

  const handleTotalChange = (total: number) => {
    const litros = Number(formData.litrosAbastecidos) || 1;
    const preco = litros > 0 ? Math.round((total / litros) * 100) / 100 : 0;
    setFormData((prev) => ({
      ...prev,
      valorTotal: total,
      precoLitro: preco,
    }));
  };

  // Aggregation: Média de Cada Motorista em Cada Carro
  const motoristaVeiculoMap: Record<
    string,
    {
      motorista: string;
      veiculo: string;
      totalKm: number;
      totalLitros: number;
      totalValor: number;
      count: number;
      mediaKmL: number;
      custoPorKm: number;
    }
  > = {};

  abastecimentos.forEach((a) => {
    const key = `${a.motoristaNome}__${a.veiculoPlaca}`;
    if (!motoristaVeiculoMap[key]) {
      motoristaVeiculoMap[key] = {
        motorista: a.motoristaNome,
        veiculo: a.veiculoPlaca,
        totalKm: 0,
        totalLitros: 0,
        totalValor: 0,
        count: 0,
        mediaKmL: 0,
        custoPorKm: 0,
      };
    }
    const km = a.kmRodadosDesdeUltimo || 0;
    const l = a.litrosAbastecidos || 0;
    const val = a.valorTotal || 0;

    motoristaVeiculoMap[key].totalKm += km;
    motoristaVeiculoMap[key].totalLitros += l;
    motoristaVeiculoMap[key].totalValor += val;
    motoristaVeiculoMap[key].count += 1;
  });

  const motoristaVeiculoList = Object.values(motoristaVeiculoMap).map((item) => {
    const media = item.totalLitros > 0 && item.totalKm > 0 ? item.totalKm / item.totalLitros : 0;
    const custoKm = item.totalKm > 0 ? item.totalValor / item.totalKm : 0;
    return {
      ...item,
      mediaKmL: Math.round(media * 100) / 100,
      custoPorKm: Math.round(custoKm * 100) / 100,
    };
  });

  // Posto Aggregation for intelligence
  const postoMap: Record<string, { posto: string; tipo: string; totalLitros: number; totalValor: number; count: number }> = {};
  abastecimentos.forEach((a) => {
    const pNome = a.posto || 'Posto Não Informado';
    if (!postoMap[pNome]) {
      postoMap[pNome] = {
        posto: pNome,
        tipo: a.tipoPosto || 'Rede Credenciada',
        totalLitros: 0,
        totalValor: 0,
        count: 0,
      };
    }
    postoMap[pNome].totalLitros += a.litrosAbastecidos || 0;
    postoMap[pNome].totalValor += a.valorTotal || 0;
    postoMap[pNome].count += 1;
  });
  const postoRanking = Object.values(postoMap)
    .map((p) => ({
      ...p,
      precoMedio: p.totalLitros > 0 ? p.totalValor / p.totalLitros : 0,
    }))
    .sort((a, b) => b.totalLitros - a.totalLitros);

  // Filtered List
  const filtered = abastecimentos.filter((a) => {
    const matchesSearch =
      a.veiculoPlaca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.motoristaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.posto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.numeroNotaFiscal && a.numeroNotaFiscal.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.tipoCombustivel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCombustivel = combustivelFilter === 'TODOS' || a.tipoCombustivel === combustivelFilter;

    const isAnomalo = (a.mediaKmL && (a.mediaKmL < 1.9 || a.mediaKmL > 4.5)) || a.anomaliaDetectada;
    const matchesAnomalia = !filtroAnomaliasApenas || isAnomalo;

    return matchesSearch && matchesCombustivel && matchesAnomalia;
  });

  // Global KPIs
  const totalLitrosGeral = abastecimentos.reduce((acc, a) => acc + (a.litrosAbastecidos || 0), 0);
  const totalGastoGeral = abastecimentos.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
  const totalKmGeral = abastecimentos.reduce((acc, a) => acc + (a.kmRodadosDesdeUltimo || 0), 0);

  const mediaFrotaGeral = totalLitrosGeral > 0 && totalKmGeral > 0
    ? (totalKmGeral / totalLitrosGeral).toFixed(2)
    : motoristaVeiculoList.length > 0
    ? (motoristaVeiculoList.reduce((acc, i) => acc + i.mediaKmL, 0) / motoristaVeiculoList.length).toFixed(2)
    : '0.00';

  const custoMedioPorKm = totalKmGeral > 0 && totalGastoGeral > 0
    ? (totalGastoGeral / totalKmGeral).toFixed(2)
    : '0.00';

  const precoMedioLitroGeral = totalLitrosGeral > 0
    ? (totalGastoGeral / totalLitrosGeral).toFixed(2)
    : '0.00';

  const litrosVerdes = abastecimentos
    .filter((a) => a.tipoCombustivel === 'HVO (Diesel Verde)' || a.tipoCombustivel === '100% Elétrico' || a.tipoCombustivel === 'Biodiesel B20')
    .reduce((acc, a) => acc + (a.litrosAbastecidos || 0), 0);
  
  const percentualVerde = totalLitrosGeral > 0 ? Math.round((litrosVerdes / totalLitrosGeral) * 100) : 0;

  const anomaliasCount = abastecimentos.filter(
    (a) => (a.mediaKmL && (a.mediaKmL < 1.9 || a.mediaKmL > 4.5)) || a.anomaliaDetectada
  ).length;

  // Chart Data
  const rankingChartData = motoristaVeiculoList
    .slice(0, 10)
    .map((item) => ({
      name: `${item.motorista.split(' ')[0]} (${item.veiculo})`,
      media: item.mediaKmL,
      custoKm: item.custoPorKm,
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const litros = Number(formData.litrosAbastecidos) || 1;
    const kmRodados = Number(formData.kmRodadosDesdeUltimo) || 0;
    const valorTotal = Number(formData.valorTotal) || 0;
    const mediaKmL = kmRodados > 0 && litros > 0 ? Math.round((kmRodados / litros) * 100) / 100 : 0;
    const custoPorKm = kmRodados > 0 ? Math.round((valorTotal / kmRodados) * 100) / 100 : 0;
    const precoLitro = litros > 0 ? Math.round((valorTotal / litros) * 100) / 100 : 0;

    // Detecção automática de anomalias
    let anomaliaDetectada = false;
    let motivoAnomalia = '';
    if (mediaKmL > 0 && mediaKmL < 1.9) {
      anomaliaDetectada = true;
      motivoAnomalia = 'Média excessivamente baixa (< 1.9 km/L) - Verificar vazamento ou má condução';
    } else if (mediaKmL > 4.5) {
      anomaliaDetectada = true;
      motivoAnomalia = 'Média improvável para carga pesada (> 4.5 km/L) - Verificar digitação de km';
    }

    const newAba: Abastecimento = {
      id: `aba-${Date.now()}`,
      dataHora: new Date().toISOString().slice(0, 16).replace('T', ' '),
      veiculoPlaca: formData.veiculoPlaca || 'AMB-0000',
      motoristaNome: formData.motoristaNome || 'Motorista',
      odometroKm: Number(formData.odometroKm) || 0,
      litrosAbastecidos: litros,
      tipoCombustivel: formData.tipoCombustivel as TipoCombustivel,
      valorTotal: valorTotal,
      precoLitro: precoLitro,
      custoPorKm: custoPorKm,
      posto: formData.posto || 'Posto Base Paulínia',
      tipoPosto: formData.tipoPosto as any,
      tanqueCheio: formData.tanqueCheio,
      numeroNotaFiscal: formData.numeroNotaFiscal,
      kmRodadosDesdeUltimo: kmRodados,
      mediaKmL,
      arla32Litros: Number(formData.arla32Litros) || 0,
      arla32Valor: Number(formData.arla32Valor) || 0,
      anomaliaDetectada,
      motivoAnomalia,
      observacoes: formData.observacoes,
    };

    onAddAbastecimento(newAba);
    setIsModalOpen(false);
  };

  const handleExportCsv = () => {
    if (abastecimentos.length === 0) {
      alert('Nenhum abastecimento para exportar.');
      return;
    }

    const headers = [
      'ID',
      'Data Hora',
      'Placa Veiculo',
      'Motorista Condutor',
      'Tipo Combustivel',
      'Posto',
      'Tipo Posto',
      'Numero NF',
      'Odometro Km',
      'Km Rodados Trecho',
      'Litros',
      'Preco por Litro (R$)',
      'Valor Total (R$)',
      'Media (km/L)',
      'Custo por Km (R$/km)',
      'Tanque Cheio',
      'Arla 32 Litros',
      'Arla 32 Valor (R$)',
      'Anomalia Detectada',
    ];

    const rows = abastecimentos.map((a) => [
      `"${a.id}"`,
      `"${a.dataHora}"`,
      `"${a.veiculoPlaca}"`,
      `"${a.motoristaNome}"`,
      `"${a.tipoCombustivel}"`,
      `"${a.posto}"`,
      `"${a.tipoPosto || 'Rede Credenciada'}"`,
      `"${a.numeroNotaFiscal || ''}"`,
      `"${a.odometroKm}"`,
      `"${a.kmRodadosDesdeUltimo || 0}"`,
      `"${a.litrosAbastecidos}"`,
      `"${a.precoLitro || (a.litrosAbastecidos > 0 ? (a.valorTotal / a.litrosAbastecidos).toFixed(2) : 0)}"`,
      `"${a.valorTotal}"`,
      `"${a.mediaKmL || 0}"`,
      `"${a.custoPorKm || (a.kmRodadosDesdeUltimo ? (a.valorTotal / a.kmRodadosDesdeUltimo).toFixed(2) : 0)}"`,
      `"${a.tanqueCheio ? 'SIM' : 'NÃO'}"`,
      `"${a.arla32Litros || 0}"`,
      `"${a.arla32Valor || 0}"`,
      `"${a.anomaliaDetectada ? 'SIM' : 'NÃO'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ambipar_Abastecimentos_Combustivel_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Fuel className="w-5 h-5 text-emerald-400" />
            <span>Controle de Abastecimento, Custo por Km & Auditoria de Médias</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestão integral de combustível, acompanhamento do R$/km, média real de cada condutor por veículo, auditoria de postos e programa de ecocondução Ambipar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Exportar planilha de abastecimentos para conferência financeira"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Abastecimento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Visão Executiva Completa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Média Geral Frota</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{mediaFrotaGeral} km/L</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">Meta: &ge; 2.50 km/L</span>
            <span>&bull;</span>
            <span>Frota Pesada</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Custo Médio / Km</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">R$ {custoMedioPorKm}</div>
          <div className="text-[11px] text-slate-500">Custo direto por quilômetro rodado</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Volume Consumido</span>
            <Fuel className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatNumber(totalLitrosGeral, 0)} L</div>
          <div className="text-[11px] text-slate-500">Preço médio: R$ {precoMedioLitroGeral} / litro</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Gasto Acumulado</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{formatCurrency(totalGastoGeral)}</div>
          <div className="text-[11px] text-slate-500">{abastecimentos.length} notas fiscais lançadas</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Combustível Verde (ESG)</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{percentualVerde}%</div>
          <div className="text-[11px] text-slate-500">
            {anomaliasCount > 0 ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" /> {anomaliasCount} anomalia(s)
              </span>
            ) : (
              '100% em conformidade'
            )}
          </div>
        </div>
      </div>

      {/* Core Table: Média de Cada Motorista em Cada Carro */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Média de Desempenho & Custo: Motorista &times; Veículo
              </h3>
              <p className="text-xs text-slate-400">Relação exata do consumo médio (km/L) e custo por km (R$/km) alcançado por cada condutor em cada caminhão</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Meta Frota Ambipar: &ge; 2.50 km/L
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Motorista Condutor</th>
                <th className="py-3 px-4">Veículo / Placa</th>
                <th className="py-3 px-4 text-right">Km Rodados</th>
                <th className="py-3 px-4 text-right">Litros Totais</th>
                <th className="py-3 px-4 text-right">Gasto Total</th>
                <th className="py-3 px-4 text-right">Custo / Km</th>
                <th className="py-3 px-4 text-right">Média Real</th>
                <th className="py-3 px-4 text-center">Classificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {motoristaVeiculoList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhum abastecimento registrado ainda. Lance os abastecimentos para apurar as médias e custos de cada motorista em cada veículo.
                  </td>
                </tr>
              ) : (
                motoristaVeiculoList.map((item, idx) => {
                  const isAltaEficiencia = item.mediaKmL >= 2.6;
                  const isMediaRegular = item.mediaKmL >= 2.3 && item.mediaKmL < 2.6;
                  const diffMeta = item.mediaKmL - 2.5;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-ambipar-400 font-black">
                          {item.motorista.charAt(0)}
                        </div>
                        <div>
                          <span>{item.motorista}</span>
                          <span className="block text-[10px] text-slate-500 font-normal">{item.count} abastecimento(s)</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-white font-semibold">
                          {item.veiculo}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatNumber(item.totalKm, 0)} km
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatNumber(item.totalLitros, 1)} L
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-200">
                        {formatCurrency(item.totalValor)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                        R$ {item.custoPorKm.toFixed(2)}/km
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <strong
                            className={`text-sm font-black font-mono ${
                              isAltaEficiencia ? 'text-emerald-400' : isMediaRegular ? 'text-amber-400' : 'text-rose-400'
                            }`}
                          >
                            {item.mediaKmL.toFixed(2)} km/L
                          </strong>
                          {diffMeta >= 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {diffMeta >= 0 ? `+${diffMeta.toFixed(2)} vs meta` : `${diffMeta.toFixed(2)} vs meta`}
                        </span>
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

      {/* Grid: Visual Chart & Inteligência de Postos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Consumption Comparison Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Comparativo Visual: Médias de Consumo por Condutor e Veículo</span>
            </h3>
            <span className="text-[11px] text-slate-400">Linha tracejada: Meta 2.50 km/L</span>
          </div>

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
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 4]} />
                  <Tooltip
                    formatter={(val: any, name: string) => [
                      name === 'media' ? `${val} km/L` : `R$ ${val}/km`,
                      name === 'media' ? 'Média de Consumo' : 'Custo por Km',
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                  />
                  <ReferenceLine y={2.5} stroke="#00a859" strokeDasharray="4 4" label={{ value: 'Meta: 2.5 km/L', fill: '#00a859', fontSize: 10 }} />
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

        {/* Postos & Inteligência de Preços */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Inteligência de Postos & Preços</span>
            </h3>
            <span className="text-[10px] text-slate-500">{postoRanking.length} pontos</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-56 pr-1">
            {postoRanking.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Nenhum posto registrado ainda.
              </div>
            ) : (
              postoRanking.map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-[11px] truncate max-w-[170px]" title={p.posto}>
                      {p.posto}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded border bg-slate-800 text-slate-300 border-slate-700">
                      {p.tipo.includes('Interno') ? 'Base Própria' : 'Externo'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Preço Médio Pago:</span>
                    <strong className="text-emerald-400 font-mono font-bold">R$ {p.precoMedio.toFixed(2)}/L</strong>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Volume: {formatNumber(p.totalLitros, 0)} L</span>
                    <span>{formatCurrency(p.totalValor)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* History of Fuelings Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Histórico Detalhado de Abastecimentos & Conferência</h3>
            <p className="text-xs text-slate-400">Lançamentos individuais com número de NF, odômetro, preço unitário e cálculo de R$/km</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar placa, condutor, NF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500"
              />
            </div>

            <select
              value={combustivelFilter}
              onChange={(e) => setCombustivelFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none"
            >
              <option value="TODOS">Todos Combustíveis</option>
              {COMBUSTIVEIS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => setFiltroAnomaliasApenas(!filtroAnomaliasApenas)}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1 ${
                filtroAnomaliasApenas
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Anomalias ({anomaliasCount})</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Veículo / Motorista</th>
                <th className="py-2.5 px-3">Combustível / NF</th>
                <th className="py-2.5 px-3">Posto</th>
                <th className="py-2.5 px-3 text-right">Odômetro</th>
                <th className="py-2.5 px-3 text-right">Km Trecho</th>
                <th className="py-2.5 px-3 text-right">Litros</th>
                <th className="py-2.5 px-3 text-right">R$ / Litro</th>
                <th className="py-2.5 px-3 text-right">Valor Total</th>
                <th className="py-2.5 px-3 text-right">Média</th>
                <th className="py-2.5 px-3 text-right">R$ / Km</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                {onDeleteAbastecimento && <th className="py-2.5 px-3 text-right">Ação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-500">
                    Nenhum registro de abastecimento encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const precoL = a.precoLitro || (a.litrosAbastecidos > 0 ? a.valorTotal / a.litrosAbastecidos : 0);
                  const custoKm = a.custoPorKm || (a.kmRodadosDesdeUltimo ? a.valorTotal / a.kmRodadosDesdeUltimo : 0);
                  const isAnomalo = (a.mediaKmL && (a.mediaKmL < 1.9 || a.mediaKmL > 4.5)) || a.anomaliaDetectada;

                  return (
                    <tr key={a.id} className={`hover:bg-slate-800/40 transition ${isAnomalo ? 'bg-rose-950/15' : ''}`}>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{a.dataHora}</td>

                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-white mr-1.5">{a.veiculoPlaca}</span>
                        <span className="text-slate-300 text-[11px]">({a.motoristaNome})</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="text-emerald-400 font-semibold block">{a.tipoCombustivel}</span>
                        {a.numeroNotaFiscal && (
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <FileText className="w-3 h-3" /> NF: {a.numeroNotaFiscal}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-[140px]" title={a.posto}>
                        {a.posto}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-white">{formatNumber(a.odometroKm, 0)} km</td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {a.kmRodadosDesdeUltimo ? `${formatNumber(a.kmRodadosDesdeUltimo, 0)} km` : '-'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-white">{formatNumber(a.litrosAbastecidos, 1)} L</td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        R$ {precoL.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-amber-400">{formatCurrency(a.valorTotal)}</td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {a.mediaKmL ? (
                          <span className={a.mediaKmL >= 2.5 ? 'text-emerald-400' : 'text-amber-400'}>
                            {a.mediaKmL.toFixed(2)} km/L
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-cyan-400">
                        {custoKm > 0 ? `R$ ${custoKm.toFixed(2)}` : '-'}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {isAnomalo ? (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 inline-flex items-center gap-1"
                            title={a.motivoAnomalia || 'Média fora do padrão'}
                          >
                            <AlertOctagon className="w-3 h-3" /> Anomalia
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Regular
                          </span>
                        )}
                      </td>

                      {onDeleteAbastecimento && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onDeleteAbastecimento(a.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Excluir abastecimento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          MODAL: LANÇAR NOVO ABASTECIMENTO (COM CÁLCULOS DINÂMICOS)
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-5 sm:p-6 space-y-4 text-xs shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Lançar Registro de Abastecimento</h3>
                  <p className="text-[11px] text-slate-400">Apuração de consumo médio, custo por km e conformidade fiscal</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Veículo (Placa) *</label>
                  <select
                    value={formData.veiculoPlaca}
                    onChange={(e) => handleVeiculoChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {veiculos.map((v) => (
                      <option key={v.id} value={v.placa}>
                        {v.placa} - {v.marca} {v.modelo} ({v.tipoCombustivelPadrao})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Motorista Condutor *</label>
                  <select
                    value={formData.motoristaNome}
                    onChange={(e) => setFormData({ ...formData, motoristaNome: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {motoristas.map((m) => (
                      <option key={m.id} value={m.nome}>{m.nome} (Cat. {m.categoriaCnh})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Odômetro Atual (Km) *</label>
                  <input
                    type="number"
                    required
                    value={formData.odometroKm}
                    onChange={(e) => setFormData({ ...formData, odometroKm: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Km Rodados no Trecho</label>
                  <input
                    type="number"
                    value={formData.kmRodadosDesdeUltimo}
                    onChange={(e) => setFormData({ ...formData, kmRodadosDesdeUltimo: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Número NF-e / Cupom</label>
                  <input
                    type="text"
                    placeholder="Ex: NF-40892"
                    value={formData.numeroNotaFiscal}
                    onChange={(e) => setFormData({ ...formData, numeroNotaFiscal: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Fuel & Value Grid */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Valores & Combustível
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Litros Abastecidos *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.litrosAbastecidos}
                      onChange={(e) => handleLitrosChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Preço / Litro (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.precoLitro}
                      onChange={(e) => handlePrecoChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Valor Total Pago (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.valorTotal}
                      onChange={(e) => handleTotalChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Instant Calculation Preview */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Média Calculada:</span>
                    <strong className="text-emerald-400 font-mono font-bold text-sm">
                      {formData.kmRodadosDesdeUltimo && formData.litrosAbastecidos && formData.litrosAbastecidos > 0
                        ? `${(formData.kmRodadosDesdeUltimo / formData.litrosAbastecidos).toFixed(2)} km/L`
                        : '0.00 km/L'}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Custo Estimado / Km:</span>
                    <strong className="text-amber-400 font-mono font-bold text-sm">
                      {formData.kmRodadosDesdeUltimo && formData.valorTotal && formData.kmRodadosDesdeUltimo > 0
                        ? `R$ ${(formData.valorTotal / formData.kmRodadosDesdeUltimo).toFixed(2)}`
                        : 'R$ 0.00'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Combustível</label>
                  <select
                    value={formData.tipoCombustivel}
                    onChange={(e) => setFormData({ ...formData, tipoCombustivel: e.target.value as TipoCombustivel })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {COMBUSTIVEIS.map((cb) => (
                      <option key={cb} value={cb}>{cb}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Ponto / Posto</label>
                  <select
                    value={formData.tipoPosto}
                    onChange={(e) => setFormData({ ...formData, tipoPosto: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="Interno (Base Ambipar)">Interno (Tanque Base Ambipar)</option>
                    <option value="Rede Credenciada (Ticket Log / Sem Parar)">Rede Credenciada (Cartão Combustível)</option>
                    <option value="Posto Rodovia">Posto Rodovia Avulso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nome do Posto / Base</label>
                  <input
                    type="text"
                    value={formData.posto}
                    onChange={(e) => setFormData({ ...formData, posto: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              {/* ARLA 32 & Tanque Cheio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Tanque Cheio (Completou até a trava)</span>
                    <span className="text-[10px] text-slate-400">Garante precisão matemática da média km/L</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.tanqueCheio ?? true}
                    onChange={(e) => setFormData({ ...formData, tanqueCheio: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-slate-400 text-[10px] font-semibold">ARLA 32 (Litros)</label>
                    <input
                      type="number"
                      placeholder="0 L"
                      value={formData.arla32Litros || ''}
                      onChange={(e) => setFormData({ ...formData, arla32Litros: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-slate-400 text-[10px] font-semibold">ARLA 32 (R$)</label>
                    <input
                      type="number"
                      placeholder="R$ 0.00"
                      value={formData.arla32Valor || ''}
                      onChange={(e) => setFormData({ ...formData, arla32Valor: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Odômetro do veículo será sincronizado automaticamente
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  >
                    Gravar Abastecimento
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
