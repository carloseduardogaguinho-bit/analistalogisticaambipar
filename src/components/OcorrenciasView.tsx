import React, { useState } from 'react';
import { Ocorrencia, SeveridadeOcorrencia } from '../types';
import {
  AlertTriangle,
  Plus,
  ShieldAlert,
  Clock,
  CheckCircle,
  FileWarning,
  Search,
  X,
  PhoneCall
} from 'lucide-react';
import { getStatusColor } from '../utils/formatters';

interface OcorrenciasViewProps {
  ocorrencias: Ocorrencia[];
  onAddOcorrencia: (ocorrencia: Ocorrencia) => void;
  onUpdateOcorrenciaStatus: (id: string, newStatus: Ocorrencia['status']) => void;
}

export const OcorrenciasView: React.FC<OcorrenciasViewProps> = ({
  ocorrencias,
  onAddOcorrencia,
  onUpdateOcorrenciaStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Ocorrencia>>({
    codigoViagem: 'AMB-SP-2026-1041',
    dataHora: new Date().toISOString().slice(0, 16).replace('T', ' '),
    tipo: 'Atraso em Janela de Carga',
    severidade: 'Média',
    descricao: '',
    status: 'Aberta',
    responsavelTratativa: 'Carlos Eduardo (Analista Logística)',
  });

  const filtered = ocorrencias.filter((o) =>
    o.codigoViagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao) {
      alert('Preencha a descrição da ocorrência.');
      return;
    }

    const newOco: Ocorrencia = {
      id: `oco-${Date.now()}`,
      viagemId: formData.viagemId || 'v-manual',
      codigoViagem: formData.codigoViagem || 'AMB-GERAL',
      dataHora: formData.dataHora || new Date().toISOString().slice(0, 16).replace('T', ' '),
      tipo: formData.tipo as any,
      severidade: formData.severidade as SeveridadeOcorrencia,
      descricao: formData.descricao || '',
      status: 'Aberta',
      responsavelTratativa: formData.responsavelTratativa || 'Analista de Logística',
    };

    onAddOcorrencia(newOco);
    setIsModalOpen(false);
    setFormData({
      codigoViagem: 'AMB-SP-2026-1041',
      dataHora: new Date().toISOString().slice(0, 16).replace('T', ' '),
      tipo: 'Atraso em Janela de Carga',
      severidade: 'Média',
      descricao: '',
      status: 'Aberta',
      responsavelTratativa: 'Carlos Eduardo (Analista Logística)',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Torre de Ocorrências & Gestão de Risco</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro de não-conformidades, atrasos em janelas e acionamento de protocolos Ambipar Response 24h.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>Canal de Emergência Ambipar Response: 0800 117 2020</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Ocorrência</span>
          </button>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por código de viagem, tipo ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
          />
        </div>
      </div>

      {/* Ocorrencias Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((item) => {
          const badge = getStatusColor(item.severidade);
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl bg-slate-900 border ${
                item.severidade === 'Crítica (Emergência)'
                  ? 'border-rose-500/60 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/20'
                  : 'border-slate-800'
              } shadow-sm space-y-3`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                    Severidade: {item.severidade}
                  </span>
                  <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {item.codigoViagem}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {item.tipo}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {item.dataHora}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {item.descricao}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
                <div className="text-slate-400">
                  Responsável: <strong className="text-white">{item.responsavelTratativa}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Status da tratativa:</span>
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateOcorrenciaStatus(item.id, e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Aberta">Aberta</option>
                    <option value="Em Análise">Em Análise</option>
                    <option value="Ação Corretiva Implementada">Ação Corretiva</option>
                    <option value="Concluída">Concluída (Resolvida)</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nova Ocorrencia */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">Registrar Nova Ocorrência Operacional</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Código da Viagem</label>
                  <input
                    type="text"
                    required
                    value={formData.codigoViagem}
                    onChange={(e) => setFormData({ ...formData, codigoViagem: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Grau de Severidade</label>
                  <select
                    value={formData.severidade}
                    onChange={(e) => setFormData({ ...formData, severidade: e.target.value as SeveridadeOcorrencia })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                  >
                    <option value="Baixa">Baixa (Pequeno desvio)</option>
                    <option value="Média">Média (Atraso de janela / divergência)</option>
                    <option value="Alta">Alta (Problema mecânico / risco de transbordo)</option>
                    <option value="Crítica (Emergência)">Crítica (Incidente Ambiental / Resposta 24h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tipo de Ocorrência</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Atraso em Janela de Carga">Atraso em Janela de Carga</option>
                  <option value="Divergência de Peso / MTR">Divergência de Peso / MTR</option>
                  <option value="Problema Mecânico">Problema Mecânico no Veículo</option>
                  <option value="Avaria na Embalagem">Avaria na Embalagem / Tambor</option>
                  <option value="Incidente / Protocolo Emergência">Incidente / Protocolo de Emergência Química</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descrição Detalhada do Fato *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Relate o que ocorreu, local, tempo estimado de retenção e se houve acionamento da brigada..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Responsável pela Tratativa</label>
                <input
                  type="text"
                  value={formData.responsavelTratativa}
                  onChange={(e) => setFormData({ ...formData, responsavelTratativa: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
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
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
                >
                  Salvar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
