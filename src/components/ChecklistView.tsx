import React, { useState } from 'react';
import { ChecklistDiario, Veiculo, Motorista } from '../types';
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Truck,
  User,
  X
} from 'lucide-react';
import { formatDateTime, formatNumber } from '../utils/formatters';

interface ChecklistViewProps {
  checklists: ChecklistDiario[];
  veiculos: Veiculo[];
  motoristas: Motorista[];
  onAddChecklist: (checklist: ChecklistDiario) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklists,
  veiculos,
  motoristas,
  onAddChecklist,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<ChecklistDiario>>({
    veiculoPlaca: veiculos[0]?.placa || '',
    motoristaNome: motoristas[0]?.nome || '',
    kmInicial: 50000,
    tipoInspecao: 'Saída para Viagem',
    pneusPressaoEEstado: true,
    freiosEstacionamentoEServico: true,
    luzesESinalizacao: true,
    extintoresPQSValidade: true,
    kitEmergenciaAmbipar: true,
    vazamentoFluidos: true,
    documentacaoMTRCIVCIPP: true,
    tacografoDiscoOuDigital: true,
    observacoes: '',
  });

  const filtered = checklists.filter((c) =>
    c.veiculoPlaca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.motoristaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.resultado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Critical check logic:
    // If brakes or leaks or emergency kit fails -> REPROVADO
    const hasCriticalFail =
      !formData.freiosEstacionamentoEServico ||
      !formData.vazamentoFluidos ||
      !formData.kitEmergenciaAmbipar ||
      !formData.extintoresPQSValidade;

    const hasMinorFail =
      !formData.pneusPressaoEEstado ||
      !formData.luzesESinalizacao ||
      !formData.documentacaoMTRCIVCIPP ||
      !formData.tacografoDiscoOuDigital;

    let resultado: ChecklistDiario['resultado'] = 'Aprovado - Liberado';
    if (hasCriticalFail) {
      resultado = 'Reprovado - Bloqueado';
    } else if (hasMinorFail) {
      resultado = 'Aprovado com Restrição Leve';
    }

    const newChk: ChecklistDiario = {
      id: `chk-${Date.now()}`,
      dataHora: new Date().toISOString().slice(0, 16).replace('T', ' '),
      veiculoPlaca: formData.veiculoPlaca || 'AMB-0000',
      motoristaNome: formData.motoristaNome || 'Motorista',
      kmInicial: Number(formData.kmInicial) || 0,
      tipoInspecao: formData.tipoInspecao as any,
      pneusPressaoEEstado: Boolean(formData.pneusPressaoEEstado),
      freiosEstacionamentoEServico: Boolean(formData.freiosEstacionamentoEServico),
      luzesESinalizacao: Boolean(formData.luzesESinalizacao),
      extintoresPQSValidade: Boolean(formData.extintoresPQSValidade),
      kitEmergenciaAmbipar: Boolean(formData.kitEmergenciaAmbipar),
      vazamentoFluidos: Boolean(formData.vazamentoFluidos),
      documentacaoMTRCIVCIPP: Boolean(formData.documentacaoMTRCIVCIPP),
      tacografoDiscoOuDigital: Boolean(formData.tacografoDiscoOuDigital),
      resultado,
      observacoes: formData.observacoes,
    };

    onAddChecklist(newChk);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-cyan-400" />
            <span>Checklist Diário de Inspeção Pré-Viagem & Retorno</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Garantia de segurança operacional: inspeção de pneus, freios, tacógrafo e conformidade do kit químico Ambipar Response.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Realizar Novo Checklist</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por placa, motorista ou resultado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="text-xs text-slate-400">
          Total de inspeções: <strong className="text-white">{checklists.length}</strong>
        </div>
      </div>

      {/* Checklist History Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Nenhum checklist registrado</h3>
            <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
              Realize a inspeção pré-viagem diária de segurança (pneus, freios, vazamentos e kit de emergência Ambipar Response) antes do despacho.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Realizar Primeiro Checklist
            </button>
          </div>
        ) : (
          filtered.map((c) => {
          const isAprovado = c.resultado === 'Aprovado - Liberado';
          const isBloqueado = c.resultado === 'Reprovado - Bloqueado';

          return (
            <div
              key={c.id}
              className={`p-5 rounded-2xl bg-slate-900 border ${
                isBloqueado
                  ? 'border-rose-500/50 bg-gradient-to-r from-slate-900 to-rose-950/20'
                  : isAprovado
                  ? 'border-slate-800 hover:border-emerald-500/40'
                  : 'border-amber-500/40'
              } shadow-sm space-y-3 transition`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {c.veiculoPlaca}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {c.motoristaNome}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    &middot; {c.tipoInspecao}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">
                    {c.dataHora}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      isAprovado
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isBloqueado
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {isAprovado ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isBloqueado ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>{c.resultado}</span>
                  </span>
                </div>
              </div>

              {/* Items Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                <div className={`p-2 rounded-lg ${c.pneusPressaoEEstado ? 'bg-slate-950/60 text-slate-300' : 'bg-rose-500/10 text-rose-300'}`}>
                  <span>Pneus: {c.pneusPressaoEEstado ? '✓ OK' : '✕ Falha'}</span>
                </div>
                <div className={`p-2 rounded-lg ${c.freiosEstacionamentoEServico ? 'bg-slate-950/60 text-slate-300' : 'bg-rose-500/10 text-rose-300'}`}>
                  <span>Freios: {c.freiosEstacionamentoEServico ? '✓ OK' : '✕ Falha'}</span>
                </div>
                <div className={`p-2 rounded-lg ${c.kitEmergenciaAmbipar ? 'bg-slate-950/60 text-emerald-400' : 'bg-rose-500/10 text-rose-300'}`}>
                  <span>Kit Químico Ambipar: {c.kitEmergenciaAmbipar ? '✓ 100%' : '✕ Incompleto'}</span>
                </div>
                <div className={`p-2 rounded-lg ${c.vazamentoFluidos ? 'bg-slate-950/60 text-slate-300' : 'bg-rose-500/10 text-rose-300'}`}>
                  <span>Vazamentos: {c.vazamentoFluidos ? '✓ Isento' : '✕ Detectado'}</span>
                </div>
              </div>

              {c.observacoes && (
                <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg">
                  Observações: <strong className="text-slate-200">{c.observacoes}</strong>
                </div>
              )}
            </div>
          );
        }))}
      </div>

      {/* Modal Realizar Checklist */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 text-xs shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 sticky top-0 bg-slate-900">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Checklist Diário de Inspeção</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                        {v.placa} ({v.tipoEquipamento})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Motorista Responsável *</label>
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
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Inspeção</label>
                  <select
                    value={formData.tipoInspecao}
                    onChange={(e) => setFormData({ ...formData, tipoInspecao: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Saída para Viagem">Saída para Viagem (Pré-Operação)</option>
                    <option value="Retorno à Base">Retorno à Base (Pós-Operação)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Km do Odômetro</label>
                  <input
                    type="number"
                    value={formData.kmInicial}
                    onChange={(e) => setFormData({ ...formData, kmInicial: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Toggles for 8 Checklist items */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-2">
                  Itens Críticos de Inspeção Obrigatória
                </span>

                {[
                  { key: 'pneusPressaoEEstado', label: '1. Pneus calibrados, sem cortes e com sulco regulamentar' },
                  { key: 'freiosEstacionamentoEServico', label: '2. Freio de serviço e de estacionamento operantes (Crítico)' },
                  { key: 'luzesESinalizacao', label: '3. Faróis, setas, luzes de freio e placas refletivas' },
                  { key: 'extintoresPQSValidade', label: '4. Extintores de carga pó químico PQS na validade (Crítico)' },
                  { key: 'kitEmergenciaAmbipar', label: '5. Kit Emergência Ambipar Response completo (EPI químico, mantas, pá antichispa, cones)' },
                  { key: 'vazamentoFluidos', label: '6. Isenção total de vazamento de óleos/químicos sob o chassi (Crítico)' },
                  { key: 'documentacaoMTRCIVCIPP', label: '7. Documentação obrigatória a bordo (MTR SINIR, CIV, CIPP, CRLV)' },
                  { key: 'tacografoDiscoOuDigital', label: '8. Tacógrafo com disco inserido ou fita digital ativa' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 transition"
                  >
                    <span className="text-slate-300 font-medium text-xs pr-2">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean((formData as any)[item.key])}
                      onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                    />
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Observações da Inspeção</label>
                <textarea
                  rows={2}
                  placeholder="Relate qualquer anomalia ou necessidade de ajuste mecânico..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                ></textarea>
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
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
                >
                  Gravar Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
