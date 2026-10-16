import React, { useState } from 'react';
import { Motorista, Veiculo } from '../types';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calendar,
  Truck,
  X,
  Phone,
  ShieldCheck
} from 'lucide-react';

interface MotoristasViewProps {
  motoristas: Motorista[];
  veiculos: Veiculo[];
  onAddMotorista: (motorista: Motorista) => void;
  onUpdateMotoristaStatus: (id: string, status: Motorista['status']) => void;
}

export const MotoristasView: React.FC<MotoristasViewProps> = ({
  motoristas,
  veiculos,
  onAddMotorista,
  onUpdateMotoristaStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Motorista>>({
    nome: '',
    cpf: '',
    cnh: '',
    categoriaCnh: 'E',
    validadeCnh: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    validadeMopp: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    validadeToxico: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    baseOperacional: 'Base Regional Campinas/Paulínia',
    veiculoFixoPlaca: veiculos[0]?.placa || 'ABC-4E21',
    status: 'Ativo',
  });

  const filtered = motoristas.filter((m) =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.cpf.includes(searchTerm) ||
    m.cnh.includes(searchTerm) ||
    m.baseOperacional.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.veiculoFixoPlaca && m.veiculoFixoPlaca.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.cpf || !formData.cnh) {
      alert('Preencha os campos obrigatórios (Nome, CPF e CNH).');
      return;
    }

    const newMot: Motorista = {
      id: `mot-${Date.now()}`,
      nome: formData.nome.trim(),
      cpf: formData.cpf.trim(),
      cnh: formData.cnh.trim(),
      categoriaCnh: formData.categoriaCnh as 'D' | 'E',
      validadeCnh: formData.validadeCnh || '',
      validadeMopp: formData.validadeMopp || '',
      validadeToxico: formData.validadeToxico || '',
      baseOperacional: formData.baseOperacional || 'Base Operacional',
      veiculoFixoPlaca: formData.veiculoFixoPlaca,
      status: formData.status as any,
      mediaConsumoGeral: 2.65,
      viagensRealizadasCount: 0,
    };

    onAddMotorista(newMot);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-ambipar-400" />
            <span>Cadastro & Gestão de Motoristas Operacionais</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle de condutores habilitados, categoria CNH D/E, cursos MOPP de produtos perigosos e exames toxicológicos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Motorista</span>
        </button>
      </div>

      {/* Search and Summary */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, CNH, base ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
          />
        </div>

        <div className="text-xs text-slate-400">
          Motoristas cadastrados: <strong className="text-white">{motoristas.length}</strong>
        </div>
      </div>

      {/* Driver Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum motorista cadastrado</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
            Cadastre os motoristas condutores com CNH, cursos MOPP de produtos perigosos e exames toxicológicos para controle da operação.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeiro Motorista
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => {
            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ambipar-600 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-sm">
                      {m.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{m.nome}</h4>
                      <p className="text-[11px] text-slate-400">CPF: {m.cpf}</p>
                    </div>
                  </div>

                  <select
                    value={m.status}
                    onChange={(e) => onUpdateMotoristaStatus(m.id, e.target.value as any)}
                    className={`text-[10px] font-bold rounded-lg px-2 py-0.5 border bg-slate-950 focus:outline-none cursor-pointer ${
                      m.status === 'Ativo'
                        ? 'text-emerald-400 border-emerald-500/40'
                        : m.status === 'Em Férias'
                        ? 'text-blue-400 border-blue-500/40'
                        : 'text-amber-400 border-amber-500/40'
                    }`}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Em Férias">Em Férias</option>
                    <option value="Afastado">Afastado</option>
                  </select>
                </div>

                {/* Badges and Details */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">CNH & Categoria:</span>
                    <span className="font-mono font-bold text-white">
                      {m.cnh} (Cat. {m.categoriaCnh})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Veículo Fixo:</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-ambipar-400 font-bold text-[11px]">
                      {m.veiculoFixoPlaca || 'Rotativo'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Base Alocada:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{m.baseOperacional}</span>
                  </div>
                </div>

                {/* Compliance & Certifications */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Curso MOPP:</span>
                    </span>
                    <strong className="text-white font-mono">{m.validadeMopp}</strong>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Exame Toxicológico:</span>
                    </span>
                    <strong className="text-white font-mono">{m.validadeToxico}</strong>
                  </div>

                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Média Consumo Geral:</span>
                    <strong className="text-emerald-400 font-bold font-mono">
                      {m.mediaConsumoGeral ? `${m.mediaConsumoGeral.toFixed(2)} km/L` : '-'}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Novo Motorista */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-ambipar-400" />
                <h3 className="font-bold text-white text-base">Cadastrar Novo Motorista</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do motorista condutor"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Número CNH *</label>
                  <input
                    type="text"
                    required
                    placeholder="Número do registro CNH"
                    value={formData.cnh}
                    onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Categoria CNH</label>
                  <select
                    value={formData.categoriaCnh}
                    onChange={(e) => setFormData({ ...formData, categoriaCnh: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="E">Categoria E (Carretas pesadas / Articulados)</option>
                    <option value="D">Categoria D (Caminhões médios / VUCs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Veículo Fixo (Placa)</label>
                  <select
                    value={formData.veiculoFixoPlaca}
                    onChange={(e) => setFormData({ ...formData, veiculoFixoPlaca: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    {veiculos.map((v) => (
                      <option key={v.id} value={v.placa}>{v.placa} ({v.modelo})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Validade CNH</label>
                  <input
                    type="date"
                    value={formData.validadeCnh}
                    onChange={(e) => setFormData({ ...formData, validadeCnh: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Validade MOPP</label>
                  <input
                    type="date"
                    value={formData.validadeMopp}
                    onChange={(e) => setFormData({ ...formData, validadeMopp: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Toxicológico</label>
                  <input
                    type="date"
                    value={formData.validadeToxico}
                    onChange={(e) => setFormData({ ...formData, validadeToxico: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white text-xs font-mono"
                  />
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
                  Cadastrar Motorista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
