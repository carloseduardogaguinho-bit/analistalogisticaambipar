import React, { useState } from 'react';
import {
  Calculator,
  DollarSign,
  Fuel,
  Truck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Printer,
  ShieldCheck,
  TrendingUp,
  Percent,
  Coins,
  FileText,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { formatCurrency, formatNumber, getTodayLocalBR } from '../utils/formatters';

export const CalculadoraFreteView: React.FC = () => {
  // Parâmetros Operacionais da Rota
  const [origem, setOrigem] = useState<string>('Paulínia/SP (Base Ambipar)');
  const [destino, setDestino] = useState<string>('Betim/MG (Polo Químico)');
  const [distanciaKm, setDistanciaKm] = useState<number>(540);
  const [pesoTon, setPesoTon] = useState<number>(27);
  const [eixos, setEixos] = useState<number>(6); // Carreta 6 eixos
  const [tipoCarga, setTipoCarga] = useState<'quimica' | 'geral' | 'granel_liquido' | 'perigosa'>('perigosa');

  // Parâmetros de Combustível & Veículo
  const [tipoCombustivel, setTipoCombustivel] = useState<string>('HVO (Diesel Verde)');
  const [consumoKmL, setConsumoKmL] = useState<number>(2.3);
  const [precoLitro, setPrecoLitro] = useState<number>(6.25);
  const [consumoArla32L, setConsumoArla32L] = useState<number>(5); // 5% do diesel
  const [precoArla32L, setPrecoArla32L] = useState<number>(3.80);

  // Pedágio & Custos Diretos
  const [pedagioPorEixoKm, setPedagioPorEixoKm] = useState<number>(0.28);
  const [diariaMotorista, setDiariaMotorista] = useState<number>(320);
  const [diasViagem, setDiasViagem] = useState<number>(2);
  const [manutencaoPorKm, setManutencaoPorKm] = useState<number>(0.85); // Mecânica + Pneus (CPK)
  const [ajudanteChapa, setAjudanteChapa] = useState<number>(180);

  // Impostos & Margem
  const [aliquotaIcms, setAliquotaIcms] = useState<number>(12); // ICMS Transporte Interestadual
  const [aliquotaPisCofins, setAliquotaPisCofins] = useState<number>(3.65);
  const [margemLucroDesejada, setMargemLucroDesejada] = useState<number>(22);
  const [copied, setCopied] = useState(false);

  // =========================================================
  // CÁLCULOS OPERACIONAIS E FINANCEIROS DETALHADOS
  // =========================================================
  const litrosCombustivel = distanciaKm > 0 && consumoKmL > 0 ? distanciaKm / consumoKmL : 0;
  const custoCombustivel = litrosCombustivel * precoLitro;

  const litrosArla = (litrosCombustivel * consumoArla32L) / 100;
  const custoArla = litrosArla * precoArla32L;

  const custoPedagio = distanciaKm * eixos * (pedagioPorEixoKm / 10);
  const custoMotoristaTotal = diariaMotorista * diasViagem + ajudanteChapa;
  const custoManutencaoPneus = distanciaKm * manutencaoPorKm;

  // Custo Direto Variável Total da Viagem
  const custoVariavelTotal = custoCombustivel + custoArla + custoPedagio + custoMotoristaTotal + custoManutencaoPneus;

  // Alíquota Total de Impostos
  const totalImpostosPercent = aliquotaIcms + aliquotaPisCofins;

  // Formação de Preço pelo Markup Divisor: Preço = Custos / (1 - (Impostos + Margem))
  const markupDivisor = 1 - (totalImpostosPercent + margemLucroDesejada) / 100;
  const precoSugeridoFrete = markupDivisor > 0 ? custoVariavelTotal / markupDivisor : custoVariavelTotal * 1.5;

  // DRE da Viagem
  const impostosReais = (precoSugeridoFrete * totalImpostosPercent) / 100;
  const receitaLiquida = precoSugeridoFrete - impostosReais;
  const lucroOperacionalReais = receitaLiquida - custoVariavelTotal;
  const margemOperacionalRealPercent = precoSugeridoFrete > 0 ? (lucroOperacionalReais / precoSugeridoFrete) * 100 : 0;

  // Indicadores Unitários
  const precoPorKm = distanciaKm > 0 ? precoSugeridoFrete / distanciaKm : 0;
  const precoPorTon = pesoTon > 0 ? precoSugeridoFrete / pesoTon : 0;
  const custoPorKm = distanciaKm > 0 ? custoVariavelTotal / distanciaKm : 0;

  // =========================================================
  // CÁLCULO OFICIAL DA TABELA DE PISO MÍNIMO ANTT (LEI 13.703)
  // Coeficientes aproximados vigentes ANTT (Custo de Deslocamento CCD + Custo de Carga/Descarga CC)
  // =========================================================
  const getCoeficientesAntt = (e: number, tipo: string) => {
    // Multiplicador por tipo de carga (Química/Perigosa tem taxa adicional de risco e SASSMAQ)
    const fatorRisco = tipo === 'perigosa' || tipo === 'quimica' ? 1.25 : tipo === 'granel_liquido' ? 1.15 : 1.0;
    const ccdPorKm = (e * 0.95 + 1.2) * fatorRisco; // Coeficiente de deslocamento
    const ccCargaDescarga = (e * 75 + 250) * fatorRisco; // Custo de carga/descarga
    return { ccdPorKm, ccCargaDescarga };
  };

  const { ccdPorKm, ccCargaDescarga } = getCoeficientesAntt(eixos, tipoCarga);
  const pisoMinimoAntt = distanciaKm * ccdPorKm + ccCargaDescarga;
  const freteEstaConformeAntt = precoSugeridoFrete >= pisoMinimoAntt;
  const diferencaAntt = precoSugeridoFrete - pisoMinimoAntt;

  // Ponto de Equilíbrio (Break-Even): Receita que cobre exatamente os custos e impostos com lucro zero
  const breakEvenReais = (1 - totalImpostosPercent / 100) > 0 ? custoVariavelTotal / (1 - totalImpostosPercent / 100) : custoVariavelTotal;
  const breakEvenTon = precoPorTon > 0 ? breakEvenReais / precoPorTon : 0;

  const handleCopiarProposta = () => {
    const texto =
      `*AMBIPAR LOGISTICS - PROPOSTA OPERACIONAL DE FRETE*\n\n` +
      `Rota: ${origem} ➔ ${destino}\n` +
      `Distância: ${distanciaKm} km | Peso: ${pesoTon} Ton | Eixos: ${eixos}\n` +
      `Classificação de Carga: ${tipoCarga.toUpperCase()} (Conformidade SASSMAQ / MTR)\n\n` +
      `*Valor Total Sugerido de Frete: ${formatCurrency(precoSugeridoFrete)}*\n` +
      `Valor por Tonelada: ${formatCurrency(precoPorTon)}/t\n` +
      `Valor por Km Rodado: ${formatCurrency(precoPorKm)}/km\n\n` +
      `_Tabela ANTT Obrigatória: ${formatCurrency(pisoMinimoAntt)} [${freteEstaConformeAntt ? 'CONFORME ANTT' : 'AJUSTAR'}]_\n` +
      `_Impostos inclusos (ICMS ${aliquotaIcms}% + PIS/COFINS ${aliquotaPisCofins}%)_\n` +
      `Base Operacional Ambipar Paulínia/SP &bull; 0800 771 3778`;

    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================
          1. HEADER
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Calculator className="w-6 h-6 text-ambipar-400" />
              <span>Simulador de Frete, DRE da Viagem &amp; Tabela ANTT</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              Formação de Preço Sênior
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Análise completa de custos operacionais (Diesel, Arla 32, Pedágios, Pneus/CPK), DRE da rota e auditoria contra o Piso Mínimo Obrigatório da ANTT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopiarProposta}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Proposta Copiada!' : 'Copiar Proposta'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 text-xs font-black shadow-lg shadow-ambipar-500/25 transition active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir DRE / PDF</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. CARDS DE KPIS RESUMIDOS
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Frete Total Sugerido */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 shadow-xl relative overflow-hidden">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Frete Total Sugerido
          </span>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {formatCurrency(precoSugeridoFrete)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
            <span>{formatCurrency(precoPorTon)} / ton</span>
            <span className="font-bold text-emerald-400">{formatCurrency(precoPorKm)} / km</span>
          </div>
        </div>

        {/* KPI 2: Margem Operacional Líquida */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
            Margem Líquida da Rota
          </span>
          <div className="text-3xl font-black text-cyan-300 font-mono mt-1">
            {formatCurrency(lucroOperacionalReais)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Margem Real:</span>
            <span className="font-bold text-cyan-400 font-mono">
              {margemOperacionalRealPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* KPI 3: Auditoria Piso Mínimo ANTT */}
        <div
          className={`p-4 rounded-2xl border shadow-sm relative overflow-hidden ${
            freteEstaConformeAntt
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
            <span>Piso Mínimo ANTT (Lei 13.703)</span>
            {freteEstaConformeAntt ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(pisoMinimoAntt)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span>Status Legal:</span>
            <span
              className={`font-black uppercase ${
                freteEstaConformeAntt ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {freteEstaConformeAntt
                ? `+ ${formatCurrency(diferencaAntt)} acima`
                : `${formatCurrency(diferencaAntt)} abaixo!`}
            </span>
          </div>
        </div>

        {/* KPI 4: Ponto de Equilíbrio (Break-Even) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Ponto de Equilíbrio (Break-Even)
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(breakEvenReais)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Carga Mínima:</span>
            <span className="font-bold text-amber-300 font-mono">
              {breakEvenTon.toFixed(1)} toneladas
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. FORMULÁRIO DE ENTRADA & DRE DA VIAGEM
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Parâmetros Operacionais (7 colunas) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Truck className="w-4 h-4 text-ambipar-400" />
            <span>Configuração da Rota &amp; Composição de Custo</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Origem do Carregamento</label>
              <input
                type="text"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-ambipar-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Destino da Entrega</label>
              <input
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-ambipar-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Distância Ida (km)</label>
              <input
                type="number"
                value={distanciaKm}
                onChange={(e) => setDistanciaKm(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-ambipar-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Carga Líquida (Ton)</label>
              <input
                type="number"
                value={pesoTon}
                onChange={(e) => setPesoTon(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-ambipar-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Número de Eixos</label>
              <select
                value={eixos}
                onChange={(e) => setEixos(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-ambipar-500"
              >
                <option value={2}>2 Eixos (VUC / Toco)</option>
                <option value={3}>3 Eixos (Truck 6x2)</option>
                <option value={4}>4 Eixos (Bitruck 8x2)</option>
                <option value={5}>5 Eixos (Cavalo + 2 Eixos)</option>
                <option value={6}>6 Eixos (Cavalo + 3 Eixos)</option>
                <option value={7}>7 Eixos (Bitrem)</option>
                <option value={9}>9 Eixos (Rodotrem)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Classificação de Risco (ANTT)</label>
              <select
                value={tipoCarga}
                onChange={(e) => setTipoCarga(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-ambipar-500"
              >
                <option value="perigosa">Carga Perigosa (Química / Classe I)</option>
                <option value="granel_liquido">Granel Líquido (Tanque Inox)</option>
                <option value="geral">Carga Geral Seca (Baú / Sider)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Combustível Utilizado</label>
              <select
                value={tipoCombustivel}
                onChange={(e) => setTipoCombustivel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-ambipar-500"
              >
                <option value="HVO (Diesel Verde)">HVO (Diesel Verde / ESG)</option>
                <option value="Diesel S10">Diesel S10 Comum</option>
                <option value="GNV / Biometano">GNV / Biometano</option>
              </select>
            </div>
          </div>

          {/* Custos Operacionais Unitários */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block">
              Parâmetros de Custo Unitário &amp; Insumos
            </span>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-0.5">Consumo (km/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={consumoKmL}
                  onChange={(e) => setConsumoKmL(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-0.5">Preço Diesel (R$/L)</label>
                <input
                  type="number"
                  step="0.05"
                  value={precoLitro}
                  onChange={(e) => setPrecoLitro(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-0.5">Manutenção + Pneu (R$/km)</label>
                <input
                  type="number"
                  step="0.05"
                  value={manutencaoPorKm}
                  onChange={(e) => setManutencaoPorKm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <label className="block text-slate-400 mb-0.5">Pedágio Estimado / Eixo</label>
                <input
                  type="number"
                  step="0.01"
                  value={pedagioPorEixoKm}
                  onChange={(e) => setPedagioPorEixoKm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-0.5">Diária Condutor (R$/dia)</label>
                <input
                  type="number"
                  value={diariaMotorista}
                  onChange={(e) => setDiariaMotorista(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-0.5">Dias de Rota</label>
                <input
                  type="number"
                  value={diasViagem}
                  onChange={(e) => setDiasViagem(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Margens e Impostos */}
          <div className="grid grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">ICMS Transporte (%)</label>
              <input
                type="number"
                value={aliquotaIcms}
                onChange={(e) => setAliquotaIcms(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">PIS/COFINS (%)</label>
              <input
                type="number"
                value={aliquotaPisCofins}
                onChange={(e) => setAliquotaPisCofins(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Margem Alvo (%)</label>
              <input
                type="number"
                value={margemLucroDesejada}
                onChange={(e) => setMargemLucroDesejada(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Coluna Direita: DRE Completa da Rota (5 colunas) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>DRE Operacional da Rota</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Por Viagem
              </span>
            </div>

            {/* Linhas da DRE */}
            <div className="space-y-2 pt-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="font-bold text-white">(+) Receita Bruta de Frete:</span>
                <strong className="text-emerald-400 font-mono text-sm">
                  {formatCurrency(precoSugeridoFrete)}
                </strong>
              </div>

              <div className="flex justify-between text-slate-400 py-0.5">
                <span>(-) Impostos Fiscais ({totalImpostosPercent}%):</span>
                <span className="font-mono text-rose-300">
                  - {formatCurrency(impostosReais)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800 font-semibold text-slate-200">
                <span>(=) Receita Líquida Operacional:</span>
                <span className="font-mono">{formatCurrency(receitaLiquida)}</span>
              </div>

              {/* Custos Variáveis Detalhados */}
              <div className="pt-1.5 space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>&bull; Diesel / Combustível ({formatNumber(litrosCombustivel)} L):</span>
                  <span className="font-mono">{formatCurrency(custoCombustivel)}</span>
                </div>
                <div className="flex justify-between">
                  <span>&bull; Arla 32 ({formatNumber(litrosArla)} L):</span>
                  <span className="font-mono">{formatCurrency(custoArla)}</span>
                </div>
                <div className="flex justify-between">
                  <span>&bull; Pedágio Obrigatório (ANTT):</span>
                  <span className="font-mono">{formatCurrency(custoPedagio)}</span>
                </div>
                <div className="flex justify-between">
                  <span>&bull; Diárias &amp; Alimentação Motorista:</span>
                  <span className="font-mono">{formatCurrency(custoMotoristaTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>&bull; Desgaste Pneus (CPK) &amp; Manutenção:</span>
                  <span className="font-mono">{formatCurrency(custoManutencaoPneus)}</span>
                </div>
              </div>

              <div className="flex justify-between py-1 border-t border-slate-800 font-semibold text-rose-400">
                <span>(-) Custo Variável Total:</span>
                <span className="font-mono">- {formatCurrency(custoVariavelTotal)}</span>
              </div>

              <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-500/40 mt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                    Margem de Contribuição Líquida
                  </span>
                  <strong className="text-xl font-black text-white font-mono">
                    {formatCurrency(lucroOperacionalReais)}
                  </strong>
                </div>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {margemOperacionalRealPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Destaque Legal e Ambiental */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Piso ANTT Mínimo Legal:</span>
              </span>
              <strong className="font-mono text-white">{formatCurrency(pisoMinimoAntt)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Custo Médio por Km:</span>
              <strong className="font-mono text-slate-300">{formatCurrency(custoPorKm)}/km</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
