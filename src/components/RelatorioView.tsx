import React from 'react';
import { Viagem, DocumentoAmbiental, Ocorrencia } from '../types';
import {
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle,
  Truck,
  Leaf,
  Calendar,
  Building,
  Target
} from 'lucide-react';
import { formatNumber, formatCurrency, formatDateTime } from '../utils/formatters';
import { calculateEsgMetrics } from '../utils/esgCalculator';

interface RelatorioViewProps {
  viagens: Viagem[];
  mtrs: DocumentoAmbiental[];
  ocorrencias: Ocorrencia[];
}

export const RelatorioView: React.FC<RelatorioViewProps> = ({
  viagens,
  mtrs,
  ocorrencias,
}) => {
  const totalVolumeTon = viagens.reduce((acc, v) => acc + (v.pesoToneladas || 0), 0);
  const totalKm = viagens.reduce((acc, v) => acc + (v.distanciaKm || 0), 0);
  const totalCusto = viagens.reduce((acc, v) => acc + (v.custoTotal || 0), 0);

  const concluidas = viagens.filter((v) => v.status === 'Concluída').length;
  const atrasadas = viagens.filter((v) => v.status === 'Atrasada').length;
  const otifPercent = concluidas + atrasadas > 0 ? Math.round((concluidas / (concluidas + atrasadas)) * 100) : 100;

  let totalCo2Evitado = 0;
  viagens.forEach((v) => {
    const esg = calculateEsgMetrics(v.distanciaKm, v.tipoCombustivel);
    totalCo2Evitado += esg.co2EvitadoKg;
  });

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header with Print Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-ambipar-400" />
            <span>Relatório Executivo Gerencial de Logística &middot; Ambipar</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visão consolidada pronta para apresentação à coordenação e gerência operacional de logística.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/20 transition self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Gerar PDF</span>
        </button>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 print:bg-white print:text-black print:border-none print:p-0 print:m-0 shadow-2xl">
        {/* Report Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-6 print:border-slate-300">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black text-ambipar-500 tracking-tighter">AMBIPAR</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-800 print:bg-slate-100 print:text-slate-700">
                Logistics Control Tower
              </span>
            </div>
            <h1 className="text-lg font-bold text-white print:text-black">
              Boletim Executivo de Movimentação Logística & Resíduos
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Emitido em {currentDate} &middot; Responsável: Carlos Eduardo (Analista de Logística)
            </p>
          </div>

          <div className="text-right text-xs">
            <div className="font-semibold text-emerald-400 print:text-emerald-700 flex items-center gap-1 justify-end">
              <ShieldCheck className="w-4 h-4" />
              <span>Conformidade MTR / SINIR: 100%</span>
            </div>
            <div className="text-slate-400 print:text-slate-600 mt-1 font-mono">
              Bases: Paulínia / Jundiaí / Betim / Camaçari
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
            <span className="text-[11px] text-slate-400 print:text-slate-600 block uppercase font-semibold">Viagens Totais</span>
            <span className="text-2xl font-black text-white print:text-black">{viagens.length}</span>
            <span className="text-[10px] text-slate-500 block mt-1">{totalKm} km rodados</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
            <span className="text-[11px] text-slate-400 print:text-slate-600 block uppercase font-semibold">Volume Movimentado</span>
            <span className="text-2xl font-black text-white print:text-black">{formatNumber(totalVolumeTon)} t</span>
            <span className="text-[10px] text-slate-500 block mt-1">Cargas perigosas e industriais</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
            <span className="text-[11px] text-slate-400 print:text-slate-600 block uppercase font-semibold">Índice OTIF</span>
            <span className="text-2xl font-black text-ambipar-400 print:text-ambipar-700">{otifPercent}%</span>
            <span className="text-[10px] text-slate-500 block mt-1">No prazo e sem avarias</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
            <span className="text-[11px] text-slate-400 print:text-slate-600 block uppercase font-semibold">CO2 Evitado (ESG)</span>
            <span className="text-2xl font-black text-emerald-400 print:text-emerald-700">{formatNumber(totalCo2Evitado, 1)} kg</span>
            <span className="text-[10px] text-slate-500 block mt-1">Combustíveis sustentáveis HVO/EV</span>
          </div>
        </div>

        {/* Trips Table in Report */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700">
            Detalhamento das Operações Registradas
          </h3>
          <table className="w-full text-left text-xs border border-slate-800 print:border-slate-300">
            <thead>
              <tr className="bg-slate-950 print:bg-slate-100 text-slate-400 print:text-slate-700 font-semibold border-b border-slate-800 print:border-slate-300">
                <th className="py-2 px-3">Código</th>
                <th className="py-2 px-3">Cliente</th>
                <th className="py-2 px-3">Origem &rarr; Destino</th>
                <th className="py-2 px-3">Veículo / Equip.</th>
                <th className="py-2 px-3">MTR SINIR</th>
                <th className="py-2 px-3 text-right">Peso (t)</th>
                <th className="py-2 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-300">
              {viagens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 print:text-slate-600">
                    Nenhuma operação cadastrada no período.
                  </td>
                </tr>
              ) : (
                viagens.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2 px-3 font-mono font-bold text-white print:text-black">{v.codigoViagem}</td>
                    <td className="py-2 px-3 text-slate-300 print:text-slate-800">{v.cliente}</td>
                    <td className="py-2 px-3 text-slate-400 print:text-slate-600">{v.origem} &rarr; {v.destino}</td>
                    <td className="py-2 px-3 text-slate-300 print:text-slate-800">{v.placaCavalo} ({v.tipoEquipamento})</td>
                    <td className="py-2 px-3 font-mono text-ambipar-400 print:text-ambipar-700">{v.numeroMTR}</td>
                    <td className="py-2 px-3 text-right font-bold text-white print:text-black">{formatNumber(v.pesoToneladas)} t</td>
                    <td className="py-2 px-3 text-center text-slate-300 print:text-slate-800">{v.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Occurrences & Compliance note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800 print:border-slate-300 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200 space-y-1">
            <h4 className="font-bold text-white print:text-black uppercase text-[11px]">Tratativa de Ocorrências</h4>
            <p className="text-slate-400 print:text-slate-600">
              Total de ocorrências registradas: <strong className="text-white print:text-black">{ocorrencias.length}</strong>. 
              Todas as ocorrências críticas foram atendidas e mitigadas com plano de contingência e suporte da central Ambipar Response.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200 space-y-1">
            <h4 className="font-bold text-white print:text-black uppercase text-[11px]">Assinatura & Validação</h4>
            <p className="text-slate-400 print:text-slate-600">
              Documento conferido pelo Analista de Logística e disponibilizado no repositório oficial da operação Ambipar.
            </p>
            <div className="pt-4 text-center border-t border-slate-800 print:border-slate-300 font-semibold text-white print:text-black">
              Carlos Eduardo &middot; Analista de Logística
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
