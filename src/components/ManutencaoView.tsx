import React, { useState } from 'react';
import { Manutencao, Veiculo, TipoManutencao, StatusManutencao } from '../types';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  Building,
  Calendar,
  X,
  FileCheck
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/formatters';

interface ManutencaoViewProps {
  manutencoes: Manutencao[];
  veiculos: Veiculo[];
  onAddManutencao: (manutencao: Manutencao) => void;
  onConcluirManutencao: (id: string, kmProximaRevisao: number) => void;
}

const TIPOS_MANUTENCAO: TipoManutencao[] = [
  'Preventiva Programada',
  'Corretiva Emergencial',
  'Revisão de Pneus',
  'Inspeção Tanque / CIV',
  'Troca de Óleo e Filtros',
  'Sistema de Freios',
];

export const ManutencaoView: React.FC<ManutencaoViewProps> = ({
  manutencoes,
  veiculos,
  onAddManutencao,
  onConcluirManutencao,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Manutencao>>({
    veiculoPlaca: veiculos[0]?.placa || 'ABC-4E21',
    tipo: 'Preventiva Programada',
    descricao: '',
    kmNoMomento: 85000,
    kmProximaRevisao: 95000,
    dataEntrada: new Date().toISOString().slice(0, 10),
    dataPrevisaoSaida: new Date(Date.now() + 2 * 86400 * 1000).toISOString().slice(0, 10),
    oficina: 'Oficina Central Ambipar',
    custoTotal: 2500,
    status: 'Agendada',
    responsavelAprovacao: 'Carlos Eduardo (Analista Logística)',
  });

  const filtered = manutencoes.filter((m) => {
    const matchesSearch =
      m.veiculoPlaca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.oficina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tipo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const custoTotalManutencoes = manutencoes.reduce((acc, m) => acc + (m.custoTotal || 0), 0);
  const emExecucaoCount = manutencoes.filter((m) => m.status === 'Em Execução').length;
  const agendadasCount = manutencoes.filter((m) => m.status === 'Agendada').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.veiculoPlaca || !formData.descricao) {
      alert('Preencha a Placa do veículo e a Descrição do serviço.');
      return;
    }

    const newMan: Manutencao = {
      id: `man-${Date.now()}`,
      veiculoPlaca: formData.veiculoPlaca,
      tipo: formData.tipo as TipoManutencao,
      descricao: formData.descricao,
      kmNoMomento: Number(formData.kmNoMomento) || 0,
      kmProximaRevisao: Number(formData.kmProximaRevisao) || (Number(formData.kmNoMomento) + 10000),
      dataEntrada: formData.dataEntrada || new Date().toISOString().slice(0, 10),
      dataPrevisaoSaida: formData.dataPrevisaoSaida,
      oficina: formData.oficina || 'Oficina Credenciada',
      custoTotal: Number(formData.custoTotal) || 0,
      status: formData.status as StatusManutencao,
      responsavelAprovacao: formData.responsavelAprovacao || 'Analista Logística',
    };

    onAddManutencao(newMan);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>Área de Manutenções Programadas & Ordens de Serviço</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Plano de manutenção preventiva, controle de desgastes, calibração, troca de fluidos e conformidade mecânica da frota.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar / Abrir Ordem de Serviço</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Em Manutenção Agora</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{emExecucaoCount} veículos</div>
          <div className="text-[11px] text-slate-500">{agendadasCount} ordens agendadas para próximos dias</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Investimento em Frota</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatCurrency(custoTotalManutencoes)}</div>
          <div className="text-[11px] text-slate-500">Custo acumulado de oficina e peças</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Confiabilidade Mecânica</span>
            <CheckCircle2 className="w-4 h-4 text-ambipar-400" />
          </div>
          <div className="text-2xl font-black text-ambipar-400">97.8%</div>
          <div className="text-[11px] text-slate-500">Disponibilidade operacional acima da meta</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por placa, serviço, oficina ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['TODOS', 'Agendada', 'Em Execução', 'Concluída'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance Cards / List */}
      <div className="space-y-3">
        {filtered.map((m) => {
          return (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {m.veiculoPlaca}
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {m.tipo}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      m.status === 'Concluída'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : m.status === 'Em Execução'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="text-right text-xs font-bold text-white">
                  {formatCurrency(m.custoTotal)}
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                {m.descricao}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>Oficina: <strong className="text-white">{m.oficina}</strong></span>
                  </span>
                  <span>Km na entrada: <strong className="font-mono text-white">{formatNumber(m.kmNoMomento, 0)} km</strong></span>
                  {m.kmProximaRevisao && (
                    <span>Próxima: <strong className="font-mono text-amber-400">{formatNumber(m.kmProximaRevisao, 0)} km</strong></span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {m.status !== 'Concluída' && (
                    <button
                      onClick={() => {
                        const proxima = prompt('Informe a quilometragem da próxima revisão programada:', String(m.kmNoMomento + 10000));
                        if (proxima) {
                          onConcluirManutencao(m.id, parseInt(proxima) || (m.kmNoMomento + 10000));
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Concluir e Liberar Veículo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nova Manutenção */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Abrir Ordem de Manutenção</h3>
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
                      <option key={v.id} value={v.placa}>
                        {v.placa} - {v.marca} ({v.tipoEquipamento})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Manutenção</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoManutencao })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {TIPOS_MANUTENCAO.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descrição do Serviço / Peças a Trocar *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Troca de lonas de freio, filtro separador de água, calibração..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Km Atual no Momento</label>
                  <input
                    type="number"
                    value={formData.kmNoMomento}
                    onChange={(e) => setFormData({ ...formData, kmNoMomento: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Km da Próxima Revisão</label>
                  <input
                    type="number"
                    value={formData.kmProximaRevisao}
                    onChange={(e) => setFormData({ ...formData, kmProximaRevisao: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Oficina / Concessionária</label>
                  <input
                    type="text"
                    value={formData.oficina}
                    onChange={(e) => setFormData({ ...formData, oficina: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Custo Estimado (R$)</label>
                  <input
                    type="number"
                    value={formData.custoTotal}
                    onChange={(e) => setFormData({ ...formData, custoTotal: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  Abrir Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
