import React, { useState } from 'react';
import { Viagem, StatusViagem, TipoEquipamento, ClasseResiduo, TipoCombustivel } from '../types';
import {
  Truck,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  FileText,
  Trash2,
  Edit,
  Eye,
  X,
  CheckCircle,
  FileCheck,
  AlertCircle,
  Download,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { formatNumber, formatCurrency, getStatusColor, formatDateTime } from '../utils/formatters';
import { getCombustivelColor } from '../utils/esgCalculator';
import { ModalFichaEmergenciaNbr7503 } from './ModalFichaEmergenciaNbr7503';
import { ModalLiberacaoPgrSm } from './ModalLiberacaoPgrSm';

interface ViagensViewProps {
  viagens: Viagem[];
  onAddViagem: (viagem: Viagem) => void;
  onUpdateViagemStatus: (id: string, newStatus: StatusViagem) => void;
  onDeleteViagem: (id: string) => void;
}

const EQUIPAMENTOS: TipoEquipamento[] = [
  'Carreta Tanque Inox',
  'Roll-on / Roll-off',
  'Poliguindaste Duplo',
  'Carreta Baú Carga Seca',
  'Sider Especial',
  'VUC Coleta Urbana',
  'Veículo Rápido Emergência',
];

const RESIDUOS: ClasseResiduo[] = [
  'Classe I - Perigoso (Inflamável / Tóxico)',
  'Classe I - Químico Industrial',
  'Classe II-A - Não Inerte (Orgânico / Industrial)',
  'Classe II-B - Inerte',
  'Logística Reversa / Eletrônicos',
  'Material Valorizado (Coprocessamento)',
];

const COMBUSTIVEIS: TipoCombustivel[] = [
  'Diesel S10',
  'Biodiesel B20',
  'HVO (Diesel Verde)',
  'GNV',
  '100% Elétrico',
];

export const ViagensView: React.FC<ViagensViewProps> = ({
  viagens,
  onAddViagem,
  onUpdateViagemStatus,
  onDeleteViagem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedViagem, setSelectedViagem] = useState<Viagem | null>(null);
  const [fichaEmergenciaViagem, setFichaEmergenciaViagem] = useState<Viagem | null>(null);
  const [liberacaoPgrViagem, setLiberacaoPgrViagem] = useState<Viagem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Viagem>>({
    codigoViagem: `AMB-SP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    cliente: '',
    origem: '',
    destino: '',
    baseOperacional: 'Base Operacional Ambipar',
    motorista: '',
    placaCavalo: '',
    placaCarreta: '',
    tipoEquipamento: 'Roll-on / Roll-off',
    classeResiduo: 'Classe I - Perigoso (Inflamável / Tóxico)',
    pesoToneladas: 0,
    distanciaKm: 0,
    dataSaidaPrevista: new Date().toISOString().slice(0, 16).replace('T', ' '),
    dataChegadaPrevista: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
    status: 'Programada',
    numeroMTR: '',
    numeroCTe: '',
    tipoCombustivel: 'Diesel S10',
    custoTotal: 0,
    observacoes: '',
  });

  const filteredViagens = viagens.filter((v) => {
    const matchesSearch =
      v.codigoViagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.motorista.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.placaCavalo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.numeroMTR.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente || !formData.origem || !formData.destino) {
      alert('Por favor, preencha os campos obrigatórios (Cliente, Origem, Destino).');
      return;
    }

    const newTrip: Viagem = {
      id: `v-${Date.now()}`,
      codigoViagem: formData.codigoViagem || `AMB-${Date.now()}`,
      cliente: formData.cliente || '',
      origem: formData.origem || '',
      destino: formData.destino || '',
      baseOperacional: formData.baseOperacional || 'Base Operacional',
      motorista: formData.motorista || 'Motorista Ambipar',
      placaCavalo: formData.placaCavalo || 'AMB-0000',
      placaCarreta: formData.placaCarreta || '',
      tipoEquipamento: formData.tipoEquipamento as TipoEquipamento,
      classeResiduo: formData.classeResiduo as ClasseResiduo,
      pesoToneladas: Number(formData.pesoToneladas) || 1,
      distanciaKm: Number(formData.distanciaKm) || 1,
      dataSaidaPrevista: formData.dataSaidaPrevista || '',
      dataChegadaPrevista: formData.dataChegadaPrevista || '',
      status: (formData.status as StatusViagem) || 'Programada',
      numeroMTR: formData.numeroMTR || '',
      numeroCTe: formData.numeroCTe || '',
      tipoCombustivel: formData.tipoCombustivel as TipoCombustivel,
      custoTotal: Number(formData.custoTotal) || 0,
      observacoes: formData.observacoes || '',
    };

    onAddViagem(newTrip);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      codigoViagem: `AMB-SP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      cliente: '',
      origem: '',
      destino: '',
      baseOperacional: 'Base Operacional Ambipar',
      motorista: '',
      placaCavalo: '',
      placaCarreta: '',
      tipoEquipamento: 'Roll-on / Roll-off',
      classeResiduo: 'Classe I - Perigoso (Inflamável / Tóxico)',
      pesoToneladas: 0,
      distanciaKm: 0,
      dataSaidaPrevista: new Date().toISOString().slice(0, 16).replace('T', ' '),
      dataChegadaPrevista: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      status: 'Programada',
      numeroMTR: '',
      numeroCTe: '',
      tipoCombustivel: 'Diesel S10',
      custoTotal: 0,
      observacoes: '',
    });
  };

  const handleExportViagensCsv = () => {
    if (viagens.length === 0) {
      alert('Nenhuma viagem cadastrada para exportar.');
      return;
    }
    const headers = [
      'Codigo Viagem',
      'Cliente',
      'Origem',
      'Destino',
      'Motorista',
      'Placa Cavalo',
      'Placa Carreta',
      'Tipo Equipamento',
      'Classe Residuo',
      'Peso Toneladas',
      'Distancia Km',
      'Data Saida Prevista',
      'Data Chegada Prevista',
      'Status Operacional',
      'Numero MTR SINIR',
      'Numero CTe',
      'Tipo Combustivel',
      'Custo Total R$'
    ];
    const rows = viagens.map((v) => [
      `"${v.codigoViagem || ''}"`,
      `"${v.cliente || ''}"`,
      `"${v.origem || ''}"`,
      `"${v.destino || ''}"`,
      `"${v.motorista || ''}"`,
      `"${v.placaCavalo || ''}"`,
      `"${v.placaCarreta || ''}"`,
      `"${v.tipoEquipamento || ''}"`,
      `"${v.classeResiduo || ''}"`,
      v.pesoToneladas?.toString().replace('.', ',') || '0',
      v.distanciaKm?.toString() || '0',
      `"${v.dataSaidaPrevista || ''}"`,
      `"${v.dataChegadaPrevista || ''}"`,
      `"${v.status || ''}"`,
      `"${v.numeroMTR || ''}"`,
      `"${v.numeroCTe || ''}"`,
      `"${v.tipoCombustivel || ''}"`,
      v.custoTotal?.toString().replace('.', ',') || '0',
    ]);
    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `viagens_operacionais_ambipar_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-ambipar-400" />
            <span>Gestão Operacional de Viagens & Frotas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Programação, monitoramento em tempo real, documentação e status de entregas/coletas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportViagensCsv}
            title="Exportar todas as viagens em formato CSV para Excel"
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Viagem</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por código, cliente, motorista, placa ou MTR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['TODOS', 'Em Trânsito', 'No Cliente', 'Carregando', 'Concluída', 'Atrasada'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === status
                  ? 'bg-ambipar-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Código / CTe</th>
                <th className="py-3.5 px-4">Cliente / Origem &rarr; Destino</th>
                <th className="py-3.5 px-4">Motorista / Frota</th>
                <th className="py-3.5 px-4">Resíduo / MTR</th>
                <th className="py-3.5 px-4">Combustível & ESG</th>
                <th className="py-3.5 px-4 text-right">Peso (t)</th>
                <th className="py-3.5 px-4 text-center">Status Operacional</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredViagens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhuma viagem encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredViagens.map((v) => {
                  const badge = getStatusColor(v.status);
                  const fuelBadge = getCombustivelColor(v.tipoCombustivel);
                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-white text-xs">{v.codigoViagem}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">CT-e: {v.numeroCTe}</div>
                      </td>

                      {/* Client & Route */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-200 truncate">{v.cliente}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-ambipar-400 shrink-0" />
                          <span>{v.origem} &rarr; {v.destino}</span>
                        </div>
                      </td>

                      {/* Driver & Truck */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{v.motorista}</div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">{v.placaCavalo}</span>
                          <span>&middot; {v.tipoEquipamento}</span>
                        </div>
                      </td>

                      {/* Waste & MTR */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-medium truncate max-w-[180px]">{v.classeResiduo}</div>
                        <div className="text-[10px] font-mono text-ambipar-400 flex items-center gap-1 mt-0.5">
                          <FileText className="w-3 h-3" />
                          <span>{v.numeroMTR}</span>
                        </div>
                      </td>

                      {/* Fuel / ESG */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${fuelBadge}`}>
                          {v.tipoCombustivel}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{v.distanciaKm} km</div>
                      </td>

                      {/* Weight */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-white text-sm">{formatNumber(v.pesoToneladas)} t</div>
                        <div className="text-[10px] text-slate-500">{formatCurrency(v.custoTotal)}</div>
                      </td>

                      {/* Status selector */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={v.status}
                          onChange={(e) => onUpdateViagemStatus(v.id, e.target.value as StatusViagem)}
                          className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border bg-slate-900 focus:outline-none cursor-pointer ${badge.text} ${badge.border}`}
                        >
                          <option value="Programada">Programada</option>
                          <option value="Em Trânsito">Em Trânsito</option>
                          <option value="No Cliente">No Cliente</option>
                          <option value="Carregando">Carregando</option>
                          <option value="Descarregando">Descarregando</option>
                          <option value="Concluída">Concluída</option>
                          <option value="Atrasada">Atrasada</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setFichaEmergenciaViagem(v)}
                            title="Ficha de Emergência NBR 7503 & Envelope de Transporte (Res. ANTT 5998)"
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1 font-bold text-[10px]"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">NBR 7503</span>
                          </button>
                          <button
                            onClick={() => setLiberacaoPgrViagem(v)}
                            title="Checklist de Liberação SM & PGR (Buonny / Pamcary / Sensores)"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition flex items-center gap-1 font-bold text-[10px]"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">SM / PGR</span>
                          </button>
                          <button
                            onClick={() => setSelectedViagem(v)}
                            title="Ver Ficha Completa da Viagem"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteViagem(v.id)}
                            title="Excluir Viagem"
                            className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastrar Nova Viagem */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-ambipar-400" />
                <h3 className="font-bold text-white text-base">Cadastrar Nova Viagem Operacional</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-slate-400 font-semibold mb-1">Cliente Gerador *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Petrobras Replan, Klabin..."
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Origem (Cidade/UF) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Paulínia - SP"
                    value={formData.origem}
                    onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Destino (Destinador/Aterro) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ambipar Ecoparque Nova Odessa"
                    value={formData.destino}
                    onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Motorista</label>
                  <input
                    type="text"
                    placeholder="Nome completo do motorista"
                    value={formData.motorista}
                    onChange={(e) => setFormData({ ...formData, motorista: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Placa Cavalo / Carreta</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Placa Cavalo"
                      value={formData.placaCavalo}
                      onChange={(e) => setFormData({ ...formData, placaCavalo: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Placa Carreta"
                      value={formData.placaCarreta}
                      onChange={(e) => setFormData({ ...formData, placaCarreta: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Equipamento</label>
                  <select
                    value={formData.tipoEquipamento}
                    onChange={(e) => setFormData({ ...formData, tipoEquipamento: e.target.value as TipoEquipamento })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {EQUIPAMENTOS.map((eq) => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Classe do Resíduo</label>
                  <select
                    value={formData.classeResiduo}
                    onChange={(e) => setFormData({ ...formData, classeResiduo: e.target.value as ClasseResiduo })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {RESIDUOS.map((res) => (
                      <option key={res} value={res}>{res}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Peso Líquido (Toneladas)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.pesoToneladas}
                    onChange={(e) => setFormData({ ...formData, pesoToneladas: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Distância (km)</label>
                  <input
                    type="number"
                    value={formData.distanciaKm}
                    onChange={(e) => setFormData({ ...formData, distanciaKm: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Número MTR (SINIR/SIGOR)</label>
                  <input
                    type="text"
                    value={formData.numeroMTR}
                    onChange={(e) => setFormData({ ...formData, numeroMTR: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Número CT-e</label>
                  <input
                    type="text"
                    value={formData.numeroCTe}
                    onChange={(e) => setFormData({ ...formData, numeroCTe: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Combustível & Pegada ESG</label>
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
                  <label className="block text-slate-400 font-semibold mb-1">Custo Estimado da Viagem (R$)</label>
                  <input
                    type="number"
                    value={formData.custoTotal}
                    onChange={(e) => setFormData({ ...formData, custoTotal: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Observações Operacionais / Emergenciais</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais de rota, EPIs necessários, kits de emergência..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold"
                >
                  Salvar e Ativar Viagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Visualizar Detalhes da Viagem */}
      {selectedViagem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-ambipar-400" />
                <h3 className="font-bold text-white text-base">Ficha Operacional de Viagem</h3>
              </div>
              <button onClick={() => setSelectedViagem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 font-medium">Código Ambipar:</span>
                <span className="font-mono font-bold text-white text-sm">{selectedViagem.codigoViagem}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-800/40">
                  <span className="text-slate-500 block text-[10px] uppercase">Cliente:</span>
                  <span className="font-semibold text-white">{selectedViagem.cliente}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40">
                  <span className="text-slate-500 block text-[10px] uppercase">Base Responsável:</span>
                  <span className="font-semibold text-white">{selectedViagem.baseOperacional}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40">
                  <span className="text-slate-500 block text-[10px] uppercase">Motorista:</span>
                  <span className="font-semibold text-white">{selectedViagem.motorista}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40">
                  <span className="text-slate-500 block text-[10px] uppercase">Placa / Veículo:</span>
                  <span className="font-mono font-semibold text-white">{selectedViagem.placaCavalo} ({selectedViagem.tipoEquipamento})</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40">
                  <span className="text-slate-500 block text-[10px] uppercase">Manifesto MTR:</span>
                  <span className="font-mono font-semibold text-ambipar-400">{selectedViagem.numeroMTR}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40">
                  <span className="text-slate-500 block text-[10px] uppercase">Peso / Carga:</span>
                  <span className="font-semibold text-white">{selectedViagem.pesoToneladas} t ({selectedViagem.classeResiduo.split('-')[0]})</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase mb-1">Rota Traçada:</span>
                <div className="text-slate-200 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ambipar-400" />
                  <span>{selectedViagem.origem} &rarr; {selectedViagem.destino} ({selectedViagem.distanciaKm} km)</span>
                </div>
              </div>

              {selectedViagem.observacoes && (
                <div className="p-3 rounded-xl bg-slate-800/40 text-slate-300">
                  <span className="text-slate-400 block text-[10px] uppercase mb-0.5">Observações:</span>
                  <p>{selectedViagem.observacoes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFichaEmergenciaViagem(selectedViagem)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold border border-amber-500/40 flex items-center gap-1.5 transition text-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Ficha NBR 7503</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLiberacaoPgrViagem(selectedViagem)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold border border-emerald-500/40 flex items-center gap-1.5 transition text-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Liberação SM &amp; PGR</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedViagem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ficha de Emergência NBR 7503 & Envelope de Transporte */}
      <ModalFichaEmergenciaNbr7503
        isOpen={!!fichaEmergenciaViagem}
        onClose={() => setFichaEmergenciaViagem(null)}
        viagem={fichaEmergenciaViagem}
      />

      {/* Modal: Checklist de Liberação de SM & Gerenciamento de Risco (PGR) */}
      <ModalLiberacaoPgrSm
        isOpen={!!liberacaoPgrViagem}
        onClose={() => setLiberacaoPgrViagem(null)}
        viagem={liberacaoPgrViagem}
      />
    </div>
  );
};
