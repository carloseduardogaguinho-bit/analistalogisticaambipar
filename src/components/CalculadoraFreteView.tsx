import React, { useState } from 'react';
import { Calculator, DollarSign, Fuel, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const CalculadoraFreteView: React.FC = () => {
  const [distanciaKm, setDistanciaKm] = useState<number>(180);
  const [pesoTon, setPesoTon] = useState<number>(25);
  const [eixos, setEixos] = useState<number>(6); // Carreta 6 eixos
  const [tipoCombustivel, setTipoCombustivel] = useState<string>('HVO (Diesel Verde)');
  const [consumoKmL, setConsumoKmL] = useState<number>(2.4);
  const [precoLitro, setPrecoLitro] = useState<number>(6.20);
  const [pedagioPorEixoKm, setPedagioPorEixoKm] = useState<number>(0.28);
  const [diariaMotorista, setDiariaMotorista] = useState<number>(280);
  const [manutencaoPorKm, setManutencaoPorKm] = useState<number>(0.75);
  const [margemPercent, setMargemPercent] = useState<number>(20);

  // Calculations
  const litrosCombustivel = distanciaKm > 0 && consumoKmL > 0 ? distanciaKm / consumoKmL : 0;
  const custoCombustivel = litrosCombustivel * precoLitro;
  const custoPedagio = distanciaKm * eixos * (pedagioPorEixoKm / 10);
  const custoManutencaoPneus = distanciaKm * manutencaoPorKm;
  const custoDiretoTotal = custoCombustivel + custoPedagio + diariaMotorista + custoManutencaoPneus;

  const precoComMargem = custoDiretoTotal * (1 + margemPercent / 100);
  const precoPorKm = distanciaKm > 0 ? precoComMargem / distanciaKm : 0;
  const precoPorTon = pesoTon > 0 ? precoComMargem / pesoTon : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calculator className="w-5 h-5 text-ambipar-400" />
          <span>Calculadora Rápida de Custos & Formação de Frete Logístico</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Ferramenta tática para o analista calcular custos operacionais de viagens, consumo de combustível, pedágio e estimativa de frete por tonelada.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Truck className="w-4 h-4 text-ambipar-400" />
            <span>Parâmetros Operacionais da Rota</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Distância Ida & Volta (km)</label>
              <input
                type="number"
                value={distanciaKm}
                onChange={(e) => setDistanciaKm(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Carga Líquida (Toneladas)</label>
              <input
                type="number"
                value={pesoTon}
                onChange={(e) => setPesoTon(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Número de Eixos do Conjunto</label>
              <select
                value={eixos}
                onChange={(e) => setEixos(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value={2}>2 Eixos (VUC / Toco)</option>
                <option value={3}>3 Eixos (Truck 6x2)</option>
                <option value={5}>5 Eixos (Cavalo + Carreta 2 eixos)</option>
                <option value={6}>6 Eixos (Cavalo + Carreta 3 eixos)</option>
                <option value={9}>9 Eixos (Bitrem / Rodotrem)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tipo de Combustível</label>
              <select
                value={tipoCombustivel}
                onChange={(e) => setTipoCombustivel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="HVO (Diesel Verde)">HVO (Diesel Verde / ESG)</option>
                <option value="Diesel S10">Diesel S10 Comum</option>
                <option value="GNV">GNV / Biometano</option>
                <option value="100% Elétrico">100% Elétrico</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Consumo Médio (km/litro)</label>
              <input
                type="number"
                step="0.1"
                value={consumoKmL}
                onChange={(e) => setConsumoKmL(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Preço do Litro / Unidade (R$)</label>
              <input
                type="number"
                step="0.05"
                value={precoLitro}
                onChange={(e) => setPrecoLitro(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Diária / Custo Motorista (R$)</label>
              <input
                type="number"
                value={diariaMotorista}
                onChange={(e) => setDiariaMotorista(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Margem Operacional Alvo (%)</label>
              <input
                type="number"
                value={margemPercent}
                onChange={(e) => setMargemPercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-5 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-[11px] font-bold text-ambipar-400 uppercase tracking-wider block mb-1">
              Resultado da Composição de Frete
            </span>
            <div className="text-3xl font-black text-white">
              {formatCurrency(precoComMargem)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Valor sugerido com {margemPercent}% de margem</p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Combustível ({formatNumber(litrosCombustivel)} L):</span>
              <strong className="text-white">{formatCurrency(custoCombustivel)}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Pedágio Estimado:</span>
              <strong className="text-white">{formatCurrency(custoPedagio)}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Motorista / Diária:</span>
              <strong className="text-white">{formatCurrency(diariaMotorista)}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Manutenção / Desgaste:</span>
              <strong className="text-white">{formatCurrency(custoManutencaoPneus)}</strong>
            </div>
            <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800 font-semibold">
              <span className="text-slate-300">Custo Direto Total:</span>
              <strong className="text-rose-400">{formatCurrency(custoDiretoTotal)}</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Valor / km:</span>
              <strong className="text-emerald-400 font-bold">{formatCurrency(precoPorKm)}/km</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Valor / Tonelada:</span>
              <strong className="text-cyan-400 font-bold">{formatCurrency(precoPorTon)}/t</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
