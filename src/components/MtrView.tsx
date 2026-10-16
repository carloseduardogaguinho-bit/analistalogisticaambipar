import React, { useState } from 'react';
import { DocumentoAmbiental, LicencaVeiculo, StatusMTR } from '../types';
import {
  FileCheck2,
  Plus,
  Search,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  BookOpen
} from 'lucide-react';
import { getStatusColor, formatNumber } from '../utils/formatters';

interface MtrViewProps {
  mtrs: DocumentoAmbiental[];
  licencas: LicencaVeiculo[];
  onAddMtr: (mtr: DocumentoAmbiental) => void;
  onUpdateMtrStatus: (id: string, newStatus: StatusMTR, cdf?: string) => void;
}

const COMMON_IBAMA_CODES = [
  { code: '13 02 05*', desc: 'Óleos de motor, de engrenagens e de lubrificação minerais não clorados' },
  { code: '16 01 07*', desc: 'Filtros de óleo automotivos e industriais' },
  { code: '07 01 01*', desc: 'Soluções aquosas de lavagem e licores-mãe de processos químicos' },
  { code: '17 05 03*', desc: 'Solos e rochas contendo substâncias perigosas (contaminação / emergência)' },
  { code: '15 01 10*', desc: 'Embalagens contendo resíduos ou contaminadas por substâncias perigosas' },
  { code: '12 01 05', desc: 'Aparas e raspas de materiais plásticos (Logística Reversa / Não perigoso)' },
  { code: '03 03 09', desc: 'Lodos de tratamento de efluentes da indústria de papel e celulose' },
];

export const MtrView: React.FC<MtrViewProps> = ({
  mtrs,
  licencas,
  onAddMtr,
  onUpdateMtrStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showIbamaGuide, setShowIbamaGuide] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<DocumentoAmbiental>>({
    numeroMTR: `MTR-SINIR-${Math.floor(100000 + Math.random() * 900000)}`,
    sistemaEmissor: 'SINIR',
    gerador: '',
    destinador: 'Ambipar Centro de Valorização & Coprocessamento',
    codigoIbama: '13 02 05* - Óleos minerais não clorados',
    descricaoResiduo: '',
    quantidadeTon: 15,
    status: 'Emitido no SINIR',
    dataEmissao: new Date().toISOString().slice(0, 10),
    dataValidadeMTR: new Date(Date.now() + 7 * 86400 * 1000).toISOString().slice(0, 10),
  });

  const filteredMtrs = mtrs.filter((m) =>
    m.numeroMTR.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.gerador.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.destinador.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.codigoIbama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gerador || !formData.descricaoResiduo) {
      alert('Preencha os campos obrigatórios (Gerador e Descrição do Resíduo).');
      return;
    }

    const newMtr: DocumentoAmbiental = {
      id: `doc-${Date.now()}`,
      numeroMTR: formData.numeroMTR || `MTR-${Date.now()}`,
      sistemaEmissor: formData.sistemaEmissor || 'SINIR',
      gerador: formData.gerador || '',
      destinador: formData.destinador || '',
      codigoIbama: formData.codigoIbama || '',
      descricaoResiduo: formData.descricaoResiduo || '',
      quantidadeTon: Number(formData.quantidadeTon) || 0,
      status: formData.status as StatusMTR,
      dataEmissao: formData.dataEmissao || '',
      dataValidadeMTR: formData.dataValidadeMTR || '',
      numeroCDF: formData.status === 'CDF Gerado' ? `CDF-AMB-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
    };

    onAddMtr(newMtr);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-ambipar-400" />
            <span>Conformidade Ambiental: MTR, CDF & Licenças</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle do Manifesto de Transporte de Resíduos (SINIR/SIGOR), baixa de CDF e validade das licenças de transporte de produtos perigosos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIbamaGuide(!showIbamaGuide)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition"
          >
            <BookOpen className="w-4 h-4 text-ambipar-400" />
            <span>Tabela Códigos IBAMA</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir / Registrar MTR</span>
          </button>
        </div>
      </div>

      {/* IBAMA Quick Reference Drawer / Box */}
      {showIbamaGuide && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-ambipar-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ambipar-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Guia Prático de Códigos IBAMA Frequentes na Ambipar
            </span>
            <button onClick={() => setShowIbamaGuide(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {COMMON_IBAMA_CODES.map((item) => (
              <div key={item.code} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                  {item.code}
                </span>
                <span className="text-slate-300">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Table */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por número de MTR, gerador, destinador ou resíduo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Total de Manifestos: <strong className="text-white">{mtrs.length}</strong>
        </div>
      </div>

      {/* MTR List Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Número MTR / Sistema</th>
                <th className="py-3.5 px-4">Gerador (Origem)</th>
                <th className="py-3.5 px-4">Destinador Final</th>
                <th className="py-3.5 px-4">Código & Descrição do Resíduo</th>
                <th className="py-3.5 px-4 text-right">Quantidade</th>
                <th className="py-3.5 px-4">Certificado CDF</th>
                <th className="py-3.5 px-4 text-center">Status MTR</th>
                <th className="py-3.5 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredMtrs.map((m) => {
                const badge = getStatusColor(m.status);
                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white">{m.numeroMTR}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 inline-block mt-0.5">
                        {m.sistemaEmissor}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-200 font-medium max-w-[200px] truncate">
                      {m.gerador}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate">
                      {m.destinador}
                    </td>

                    <td className="py-3.5 px-4 max-w-[240px]">
                      <div className="font-mono text-[11px] text-ambipar-400 font-semibold">{m.codigoIbama}</div>
                      <div className="text-[11px] text-slate-400 truncate">{m.descricaoResiduo}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      {formatNumber(m.quantidadeTon)} t
                    </td>

                    <td className="py-3.5 px-4">
                      {m.numeroCDF ? (
                        <div className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{m.numeroCDF}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Pendente descarga</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        {m.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {m.status !== 'CDF Gerado' ? (
                        <button
                          onClick={() => {
                            const cdfNum = prompt('Digite o número do CDF gerado pelo destinador:', `CDF-AMB-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                            if (cdfNum) {
                              onUpdateMtrStatus(m.id, 'CDF Gerado', cdfNum);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition"
                        >
                          Baixar CDF
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-semibold">100% Conforme</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Certifications (CIV, CIPP, Licença IBAMA) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-ambipar-400" />
            <h3 className="font-bold text-white text-sm">
              Validade das Licenças da Frota & Veículos (Produtos Perigosos)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Exigência ANTT / IBAMA / CETESB</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {licencas.map((lic) => {
            const badge = getStatusColor(lic.status);
            return (
              <div key={lic.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-xs">{lic.placa}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {lic.status}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium">{lic.tipoDocumento}</div>
                <div className="text-[10px] text-slate-500 font-mono">Reg: {lic.numeroCertificado}</div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                  <span>Vencimento:</span>
                  <strong className="text-white">{lic.dataValidade}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Nova MTR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-ambipar-400" />
                <h3 className="font-bold text-white text-base">Registrar Manifesto de Transporte (MTR)</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Número MTR</label>
                <input
                  type="text"
                  required
                  value={formData.numeroMTR}
                  onChange={(e) => setFormData({ ...formData, numeroMTR: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sistema Emissor</label>
                  <select
                    value={formData.sistemaEmissor}
                    onChange={(e) => setFormData({ ...formData, sistemaEmissor: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="SINIR">SINIR (Federal)</option>
                    <option value="SIGOR SP">SIGOR SP</option>
                    <option value="FEPAM RS">FEPAM RS</option>
                    <option value="INEA RJ">INEA RJ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Quantidade (Ton)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantidadeTon}
                    onChange={(e) => setFormData({ ...formData, quantidadeTon: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Gerador do Resíduo (Cliente) *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente gerador"
                  value={formData.gerador}
                  onChange={(e) => setFormData({ ...formData, gerador: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Destinador Final *</label>
                <input
                  type="text"
                  required
                  placeholder="Unidade de Coprocessamento / Aterro"
                  value={formData.destinador}
                  onChange={(e) => setFormData({ ...formData, destinador: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Código IBAMA do Resíduo</label>
                <input
                  type="text"
                  placeholder="Ex: 13 02 05* - Óleos minerais"
                  value={formData.codigoIbama}
                  onChange={(e) => setFormData({ ...formData, codigoIbama: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descrição do Resíduo *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Borra oleosa recuperada de tanques decantadores..."
                  value={formData.descricaoResiduo}
                  onChange={(e) => setFormData({ ...formData, descricaoResiduo: e.target.value })}
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
                  className="px-5 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
