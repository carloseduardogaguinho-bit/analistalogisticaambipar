import React, { useState } from 'react';
import { Veiculo, TipoEquipamento, TipoCombustivel, StatusVeiculo } from '../types';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Wrench,
  Gauge,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  MapPin,
  Tag
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

interface FrotaViewProps {
  veiculos: Veiculo[];
  onAddVeiculo: (veiculo: Veiculo) => void;
  onUpdateVeiculoStatus: (id: string, status: StatusVeiculo) => void;
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

const COMBUSTIVEIS: TipoCombustivel[] = [
  'Diesel S10',
  'HVO (Diesel Verde)',
  '100% Elétrico',
  'GNV',
  'Biodiesel B20',
];

export const FrotaView: React.FC<FrotaViewProps> = ({
  veiculos,
  onAddVeiculo,
  onUpdateVeiculoStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Veiculo>>({
    placa: '',
    modelo: '',
    marca: 'Scania',
    ano: 2024,
    tipoEquipamento: 'Roll-on / Roll-off',
    baseOperacional: 'Base Regional Campinas/Paulínia',
    odometroAtualKm: 50000,
    capacidadeCargaTon: 20,
    status: 'Disponível',
    proximaRevisaoKm: 60000,
    tipoCombustivelPadrao: 'HVO (Diesel Verde)',
  });

  const filtered = veiculos.filter((v) => {
    const matchesSearch =
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.baseOperacional.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.tipoEquipamento.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'TODOS' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa || !formData.modelo) {
      alert('Preencha a Placa e o Modelo do veículo.');
      return;
    }

    const newVeic: Veiculo = {
      id: `veic-${Date.now()}`,
      placa: formData.placa.toUpperCase().trim(),
      modelo: formData.modelo.trim(),
      marca: formData.marca || 'Ambipar Fleet',
      ano: Number(formData.ano) || 2024,
      tipoEquipamento: formData.tipoEquipamento as TipoEquipamento,
      baseOperacional: formData.baseOperacional || 'Base Operacional',
      odometroAtualKm: Number(formData.odometroAtualKm) || 0,
      capacidadeCargaTon: Number(formData.capacidadeCargaTon) || 10,
      status: (formData.status as StatusVeiculo) || 'Disponível',
      proximaRevisaoKm: Number(formData.proximaRevisaoKm) || 10000,
      tipoCombustivelPadrao: formData.tipoCombustivelPadrao as TipoCombustivel,
      dataUltimaRevisao: new Date().toISOString().slice(0, 10),
    };

    onAddVeiculo(newVeic);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-ambipar-400" />
            <span>Controle & Cadastro da Frota de Veículos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestão patrimonial de caminhões, carretas tanques, roll-on e poliguindastes operacionais da Ambipar.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Veículo</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-semibold uppercase">Frota Total</span>
          <span className="text-2xl font-black text-white">{veiculos.length} veículos</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-emerald-400 block font-semibold uppercase">Disponíveis</span>
          <span className="text-2xl font-black text-emerald-400">{veiculos.filter(v => v.status === 'Disponível').length}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-blue-400 block font-semibold uppercase">Em Viagem</span>
          <span className="text-2xl font-black text-blue-400">{veiculos.filter(v => v.status === 'Em Viagem').length}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-amber-400 block font-semibold uppercase">Em Manutenção</span>
          <span className="text-2xl font-black text-amber-400">{veiculos.filter(v => v.status === 'Em Manutenção').length}</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por placa, modelo, marca, base ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['TODOS', 'Disponível', 'Em Viagem', 'Em Manutenção'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === st
                  ? 'bg-ambipar-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum veículo cadastrado na frota</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
            Cadastre os cavalos mecânicos, carretas tanques, implementos roll-on e poliguindastes da Ambipar para iniciar a gestão de frota.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeiro Veículo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => {
          const kmParaRevisao = v.proximaRevisaoKm - v.odometroAtualKm;
          const alertaRevisao = kmParaRevisao <= 3000;

          return (
            <div
              key={v.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {v.placa}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400">
                      {v.ano}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-xs mt-1.5">{v.marca} {v.modelo}</h4>
                </div>

                <select
                  value={v.status}
                  onChange={(e) => onUpdateVeiculoStatus(v.id, e.target.value as StatusVeiculo)}
                  className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border bg-slate-950 focus:outline-none cursor-pointer ${
                    v.status === 'Disponível'
                      ? 'text-emerald-400 border-emerald-500/40'
                      : v.status === 'Em Viagem'
                      ? 'text-blue-400 border-blue-500/40'
                      : v.status === 'Em Manutenção'
                      ? 'text-amber-400 border-amber-500/40'
                      : 'text-slate-400 border-slate-700'
                  }`}
                >
                  <option value="Disponível">Disponível</option>
                  <option value="Em Viagem">Em Viagem</option>
                  <option value="Em Manutenção">Em Manutenção</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Equipamento:</span>
                  <strong className="text-white">{v.tipoEquipamento}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacidade de Carga:</span>
                  <strong className="text-white">{v.capacidadeCargaTon} Ton</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Combustível Padrão:</span>
                  <span className="text-ambipar-400 font-semibold">{v.tipoCombustivelPadrao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Alocada:</span>
                  <span className="text-slate-300 truncate max-w-[150px]">{v.baseOperacional}</span>
                </div>
              </div>

              {/* Maintenance & Odometers */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    <span>Odômetro Atual:</span>
                  </div>
                  <strong className="font-mono text-white">{formatNumber(v.odometroAtualKm, 0)} km</strong>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <span>Próxima Revisão:</span>
                  </div>
                  <strong className="font-mono text-slate-200">{formatNumber(v.proximaRevisaoKm, 0)} km</strong>
                </div>

                {alertaRevisao && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Revisão próxima (faltam {formatNumber(kmParaRevisao, 0)} km)!</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Modal Novo Veículo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-ambipar-400" />
                <h3 className="font-bold text-white text-base">Cadastrar Novo Veículo na Frota</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Placa do Veículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ABC-4E21"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Ano de Fabricação</label>
                  <input
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) || 2024 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ex: Scania, Volvo, VW..."
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Modelo Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: R 450 6x2"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Odômetro Inicial (Km)</label>
                  <input
                    type="number"
                    value={formData.odometroAtualKm}
                    onChange={(e) => setFormData({ ...formData, odometroAtualKm: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Próxima Revisão (Km)</label>
                  <input
                    type="number"
                    value={formData.proximaRevisaoKm}
                    onChange={(e) => setFormData({ ...formData, proximaRevisaoKm: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Capacidade de Carga (Ton)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.capacidadeCargaTon}
                    onChange={(e) => setFormData({ ...formData, capacidadeCargaTon: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Combustível</label>
                  <select
                    value={formData.tipoCombustivelPadrao}
                    onChange={(e) => setFormData({ ...formData, tipoCombustivelPadrao: e.target.value as TipoCombustivel })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {COMBUSTIVEIS.map((cb) => (
                      <option key={cb} value={cb}>{cb}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Base Operacional Alocada</label>
                <input
                  type="text"
                  placeholder="Ex: Base Regional Campinas/Paulínia"
                  value={formData.baseOperacional}
                  onChange={(e) => setFormData({ ...formData, baseOperacional: e.target.value })}
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
                  className="px-5 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold"
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
