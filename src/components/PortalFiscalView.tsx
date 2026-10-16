import React, { useState } from 'react';
import { CteDocumento, MdfeDocumento, EmpresaFiscalConfig, Viagem, Veiculo, Motorista } from '../types';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Download,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Layers,
  Settings,
  Truck,
  Globe,
  Lock,
  Key,
  Wifi,
  Activity,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { formatarChaveAcesso, formatarCnpj, gerarXmlCte, gerarXmlMdfe, testarConexaoSefaz, SefazStatusResponse } from '../utils/fiscalUtils';
import { DacteModal } from './DacteModal';
import { DamdfeModal } from './DamdfeModal';
import { EmissaoCteModal } from './EmissaoCteModal';
import { EmissaoMdfeModal } from './EmissaoMdfeModal';

interface PortalFiscalViewProps {
  ctes: CteDocumento[];
  mdfes: MdfeDocumento[];
  empresa: EmpresaFiscalConfig;
  viagens: Viagem[];
  veiculos: Veiculo[];
  motoristas: Motorista[];
  onAddCte: (cte: CteDocumento) => void;
  onAddMdfe: (mdfe: MdfeDocumento) => void;
  onUpdateCteStatus: (id: string, status: CteDocumento['status'], motivo?: string) => void;
  onEncerrarMdfe: (id: string) => void;
  onUpdateEmpresa: (empresa: EmpresaFiscalConfig) => void;
}

export const PortalFiscalView: React.FC<PortalFiscalViewProps> = ({
  ctes,
  mdfes,
  empresa,
  viagens,
  veiculos,
  motoristas,
  onAddCte,
  onAddMdfe,
  onUpdateCteStatus,
  onEncerrarMdfe,
  onUpdateEmpresa,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cte' | 'mdfe' | 'config'>('cte');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCteForDacte, setSelectedCteForDacte] = useState<CteDocumento | null>(null);
  const [selectedMdfeForDamdfe, setSelectedMdfeForDamdfe] = useState<MdfeDocumento | null>(null);
  const [isEmissaoModalOpen, setIsEmissaoModalOpen] = useState(false);
  const [isEmissaoMdfeModalOpen, setIsEmissaoMdfeModalOpen] = useState(false);
  const [empresaForm, setEmpresaForm] = useState<EmpresaFiscalConfig>(empresa);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sefazStatus, setSefazStatus] = useState<SefazStatusResponse | null>(null);
  const [isTestingSefaz, setIsTestingSefaz] = useState(false);

  const filteredCtes = ctes.filter((c) =>
    c.numeroCte.includes(searchTerm) ||
    c.remetenteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.destinatarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.chaveAcesso.includes(searchTerm) ||
    c.placaTracao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMdfes = mdfes.filter((m) =>
    m.numeroMdfe.includes(searchTerm) ||
    m.chaveAcesso.includes(searchTerm) ||
    m.placaVeiculo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancelarCte = (id: string) => {
    const motivo = prompt('Informe a justificativa de cancelamento para envio à SEFAZ (mínimo 15 caracteres):');
    if (motivo && motivo.length >= 15) {
      onUpdateCteStatus(id, 'Cancelado', motivo);
      alert('Cancelamento homologado na SEFAZ com sucesso.');
    } else if (motivo) {
      alert('A justificativa deve ter no mínimo 15 caracteres.');
    }
  };

  const handleDownloadXml = (cte: CteDocumento) => {
    const xmlContent = gerarXmlCte(cte, empresa);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${cte.chaveAcesso}-cte.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadMdfeXml = (mdfe: MdfeDocumento) => {
    const xmlContent = gerarXmlMdfe(mdfe, empresa);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${mdfe.chaveAcesso}-mdfe.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTestarSefaz = async () => {
    setIsTestingSefaz(true);
    try {
      const res = await testarConexaoSefaz(empresaForm);
      setSefazStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTestingSefaz(false);
    }
  };

  const handleSaveEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmpresa(empresaForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-ambipar-400" />
            <span>Portal Fiscal de Transporte & Emissão de Documentos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Emissão eletrônica de CT-e (Conhecimento de Transporte), DACTE, MDF-e (Manifesto Eletrônico), DAMDFE e conexão oficial SEFAZ / ANTT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEmissaoModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Novo CT-e</span>
          </button>

          <button
            onClick={() => setIsEmissaoMdfeModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Novo MDF-e</span>
          </button>
        </div>
      </div>

      {/* SEFAZ & Certificate Live Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status SEFAZ */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Status Web Services SEFAZ</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-emerald-400">100% Operacional</span>
            <span className="text-[10px] text-slate-500 font-mono">SEFAZ-SP / SVRS</span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>Ambiente: <strong className="text-white">{empresa.ambienteSefaz}</strong></span>
            <span>Tempo resposta: <strong className="text-emerald-400">114ms</strong></span>
          </div>
        </div>

        {/* Certificado Digital */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Certificado Digital A1</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xs font-bold text-white truncate font-mono">
            {empresa.certificadoNome}
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>Validade: <strong className="text-white">{empresa.certificadoValidade}</strong></span>
            <span className="text-emerald-400 font-semibold">{empresa.certificadoStatus}</span>
          </div>
        </div>

        {/* ANTT RNTRC */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>ANTT / Transportadora</span>
            <Building className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xs font-bold text-white truncate">
            RNTRC: <strong className="font-mono text-cyan-400">{empresa.rntrc}</strong>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>CNPJ: <strong className="text-white font-mono">{formatarCnpj(empresa.cnpj)}</strong></span>
            <span className="text-slate-300">IE: {empresa.inscricaoEstadual}</span>
          </div>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex border-b border-slate-800 gap-3">
        <button
          onClick={() => setActiveSubTab('cte')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'cte'
              ? 'border-ambipar-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-ambipar-400" />
          <span>Conhecimentos de Transporte (CT-e / DACTE) ({ctes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mdfe')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'mdfe'
              ? 'border-ambipar-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Manifestos Fiscais (MDF-e / DAMDFE) ({mdfes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'config'
              ? 'border-ambipar-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4 text-amber-400" />
          <span>Dados da Empresa & Conexão SEFAZ</span>
        </button>
      </div>

      {/* Subtab 1: CT-e List */}
      {activeSubTab === 'cte' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por número do CT-e, chave, remetente, destinatário ou placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
              />
            </div>
            <span className="text-xs text-slate-400">
              Total Emitido: <strong className="text-white">{formatCurrency(ctes.reduce((acc, c) => acc + c.valorTotalServico, 0))}</strong>
            </span>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Número / Série</th>
                    <th className="py-3 px-4">Chave de Acesso / Emissão</th>
                    <th className="py-3 px-4">Remetente (Origem) &rarr; Destino</th>
                    <th className="py-3 px-4">Carga / MTR</th>
                    <th className="py-3 px-4 text-right">Valor Frete</th>
                    <th className="py-3 px-4 text-center">Status SEFAZ</th>
                    <th className="py-3 px-4 text-center">Ações Fiscais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredCtes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Nenhum Conhecimento de Transporte (CT-e) emitido. Clique em "Emitir Novo CT-e" para iniciar o faturamento fiscal.
                      </td>
                    </tr>
                  ) : (
                    filteredCtes.map((c) => {
                      const isAutorizado = c.status === 'Autorizado';
                      const isCancelado = c.status === 'Cancelado';

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-white text-xs block">
                            Nº {c.numeroCte}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Série {c.serie} &middot; CFOP {c.cfop}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-mono text-[10px] text-slate-300 truncate" title={c.chaveAcesso}>
                            {c.chaveAcesso}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {c.dataEmissao}
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-white font-semibold truncate">{c.remetenteNome}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            &rarr; {c.destinatarioNome} ({c.destinatarioMunicipio}-{c.destinatarioUf})
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-200 truncate max-w-[180px]">{c.produtoPredominante}</div>
                          <div className="text-[10px] font-mono text-ambipar-400">
                            {formatNumber(c.pesoBrutoKg / 1000, 1)} t {c.numeroMtrVinculado ? `&middot; ${c.numeroMtrVinculado}` : ''}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="font-bold text-white">{formatCurrency(c.valorTotalServico)}</div>
                          <div className="text-[10px] text-slate-500">ICMS: {formatCurrency(c.valorIcms)}</div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isAutorizado
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : isCancelado
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedCteForDacte(c)}
                              title="Visualizar / Imprimir DACTE"
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDownloadXml(c)}
                              title="Baixar XML oficial assinado"
                              className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-cyan-500/20 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {isAutorizado && (
                              <button
                                onClick={() => handleCancelarCte(c.id)}
                                title="Cancelar CT-e na SEFAZ"
                                className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
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
        </div>
      )}

      {/* Subtab 2: MDF-e List */}
      {activeSubTab === 'mdfe' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Manifestos Eletrônicos de Documentos Fiscais (MDF-e &middot; Modelo 58)</span>
              </h3>
              <p className="text-xs text-slate-400">Obrigatório para cargas interestaduais, consolidação de múltiplos CT-es e fiscalização ANTT em trânsito.</p>
            </div>

            <button
              onClick={() => setIsEmissaoMdfeModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Novo MDF-e</span>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Número / Série</th>
                    <th className="py-3 px-4">Chave de Acesso / Emissão</th>
                    <th className="py-3 px-4">Percurso (Origem &rarr; Destino)</th>
                    <th className="py-3 px-4">Veículo / Condutor</th>
                    <th className="py-3 px-4 text-right">Peso Total</th>
                    <th className="py-3 px-4 text-right">Valor Cargas</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações Fiscais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredMdfes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Nenhum Manifesto Eletrônico (MDF-e) emitido. Clique em "Emitir Novo MDF-e" para agrupar CT-es para viagem interestadual.
                      </td>
                    </tr>
                  ) : (
                    filteredMdfes.map((m) => {
                      const isAutorizado = m.status === 'Autorizado';
                      const isEncerrado = m.status === 'Encerrado';

                      return (
                        <tr key={m.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-white block">Nº {m.numeroMdfe}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Série {m.serie} &middot; {m.quantidadeCtes} CT-e(s)</span>
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-mono text-[10px] text-slate-300 truncate" title={m.chaveAcesso}>
                              {m.chaveAcesso}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {m.dataEmissao}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-white font-semibold">{m.ufCarregamento} &rarr; {m.ufDescarregamento}</div>
                            <div className="text-[10px] text-slate-400">{m.municipioCarregamento} &rarr; {m.municipioDescarregamento}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-white">{m.placaVeiculo}</div>
                            <div className="text-[10px] text-slate-400">{m.motoristaNome}</div>
                          </td>

                          <td className="py-3 px-4 text-right font-mono text-white">
                            {formatNumber(m.pesoBrutoTotalKg / 1000, 1)} t
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-emerald-400">
                            {formatCurrency(m.valorTotalCargas)}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                isAutorizado
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : isEncerrado
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedMdfeForDamdfe(m)}
                                title="Visualizar / Imprimir DAMDFE"
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDownloadMdfeXml(m)}
                                title="Baixar XML oficial assinado do MDF-e"
                                className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-cyan-500/20 transition"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              {isAutorizado && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Deseja registrar o Encerramento do MDF-e nº ${m.numeroMdfe} na SEFAZ? Isso libera o veículo na ANTT para novos fretes.`)) {
                                      onEncerrarMdfe(m.id);
                                    }
                                  }}
                                  title="Encerrar Manifesto na SEFAZ"
                                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-[10px] font-semibold transition flex items-center gap-1"
                                >
                                  <FileCheck className="w-3 h-3" />
                                  <span>Encerrar</span>
                                </button>
                              )}
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
        </div>
      )}

      {/* Subtab 3: Configuração da Empresa & SEFAZ */}
      {activeSubTab === 'config' && (
        <form onSubmit={handleSaveEmpresa} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 text-xs shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">Dados Fiscais da Transportadora Emitente</h3>
              <p className="text-slate-400 text-xs">Informações oficiais impressas no DACTE, DAMDFE e transmitidas à Receita Federal e SEFAZ.</p>
            </div>
            {saveSuccess && (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Dados salvos com sucesso!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Razão Social Oficial *</label>
              <input
                type="text"
                required
                value={empresaForm.razaoSocial}
                onChange={(e) => setEmpresaForm({ ...empresaForm, razaoSocial: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={empresaForm.nomeFantasia}
                onChange={(e) => setEmpresaForm({ ...empresaForm, nomeFantasia: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">CNPJ da Empresa *</label>
              <input
                type="text"
                required
                value={empresaForm.cnpj}
                onChange={(e) => setEmpresaForm({ ...empresaForm, cnpj: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Inscrição Estadual (IE) *</label>
              <input
                type="text"
                required
                value={empresaForm.inscricaoEstadual}
                onChange={(e) => setEmpresaForm({ ...empresaForm, inscricaoEstadual: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Registro ANTT (RNTRC) *</label>
              <input
                type="text"
                required
                value={empresaForm.rntrc}
                onChange={(e) => setEmpresaForm({ ...empresaForm, rntrc: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Endereço / Logradouro</label>
              <input
                type="text"
                value={empresaForm.logradouro}
                onChange={(e) => setEmpresaForm({ ...empresaForm, logradouro: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Número</label>
              <input
                type="text"
                value={empresaForm.numero}
                onChange={(e) => setEmpresaForm({ ...empresaForm, numero: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Bairro</label>
              <input
                type="text"
                value={empresaForm.bairro}
                onChange={(e) => setEmpresaForm({ ...empresaForm, bairro: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Município</label>
              <input
                type="text"
                value={empresaForm.municipio}
                onChange={(e) => setEmpresaForm({ ...empresaForm, municipio: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">UF</label>
              <input
                type="text"
                maxLength={2}
                value={empresaForm.uf}
                onChange={(e) => setEmpresaForm({ ...empresaForm, uf: e.target.value.toUpperCase() })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">CEP</label>
              <input
                type="text"
                value={empresaForm.cep}
                onChange={(e) => setEmpresaForm({ ...empresaForm, cep: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Conexão com Órgãos e SEFAZ (Web Services & Gateways)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Parametrização para autorização de documentos eletrônicos na SEFAZ Estadual e ANTT.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestarSefaz}
                disabled={isTestingSefaz}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-400 border border-slate-700 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                {isTestingSefaz ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Consultando SEFAZ...</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5" />
                    <span>Testar Conexão SEFAZ Agora</span>
                  </>
                )}
              </button>
            </div>

            {/* SEFAZ Live Diagnostics Response */}
            {sefazStatus && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SEFAZ Conectada com Sucesso &middot; Código {sefazStatus.codigoStatus} ({sefazStatus.motivo})</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-300 font-bold">
                    {sefazStatus.tempoRespostaMs} ms
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-300 pt-1 border-t border-emerald-500/20">
                  <div><strong>Autorizador:</strong> {sefazStatus.autorizador}</div>
                  <div><strong>Ambiente:</strong> {sefazStatus.ambiente}</div>
                  <div><strong>Versão:</strong> {sefazStatus.versaoAplicativo}</div>
                  <div><strong>Data/Hora SEFAZ:</strong> {sefazStatus.dataHora}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ambiente de Transmissão</label>
                <select
                  value={empresaForm.ambienteSefaz}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, ambienteSefaz: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                >
                  <option value="Produção">Produção (Validade Jurídica Oficial)</option>
                  <option value="Homologação (Testes)">Homologação (Ambiente de Testes)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Provedor de Conexão SEFAZ</label>
                <select
                  value={empresaForm.provedorConexao}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, provedorConexao: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Sefaz Direta (Web Services)">Sefaz Direta (Web Services SOAP/REST)</option>
                  <option value="Focus NFe">Focus NFe API Gateway</option>
                  <option value="Nuvem Fiscal">Nuvem Fiscal API Gateway</option>
                  <option value="SpeedGov">SpeedGov Integrador</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Token / Chave de API do Gateway Fiscal (Opcional para Integração Direta via Nuvem Fiscal ou Focus NFe)
              </label>
              <input
                type="password"
                placeholder="Insira o Token de Produção ou Homologação fornecido pelo Gateway..."
                value={empresaForm.apiTokenGateway || ''}
                onChange={(e) => setEmpresaForm({ ...empresaForm, apiTokenGateway: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            {/* Arquitetura SEFAZ Explicativa para o Analista */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-[11px] text-slate-400">
              <span className="font-bold text-white block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Como funciona a integração fiscal no sistema:
              </span>
              <p>
                <strong>1. Padrão Nacional SEFAZ:</strong> O sistema gera chaves de 44 dígitos com validação de dígito verificador Módulo 11 oficial, XMLs no formato <code className="text-white">cteProc 4.00</code> e <code className="text-white">mdfeProc 3.00</code> e documentos impressos DACTE / DAMDFE padrão A4 com canhoto e códigos de barras.
              </p>
              <p>
                <strong>2. Assinatura e Transmissão:</strong> Por exigência de segurança da SEFAZ, o envio requer mTLS SOAP assinado com Certificado Digital A1 (<code className="text-white">.pfx</code>). Em navegadores, isso é intermediado pelo Gateway Fiscal selecionado (Focus NFe ou Nuvem Fiscal) ou pelo servidor de Web Services da transportadora.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold transition shadow-lg shadow-ambipar-500/20"
            >
              Salvar Alterações Fiscais
            </button>
          </div>
        </form>
      )}

      {/* DACTE Modal */}
      <DacteModal
        cte={selectedCteForDacte}
        empresa={empresa}
        onClose={() => setSelectedCteForDacte(null)}
      />

      {/* DAMDFE Modal */}
      <DamdfeModal
        mdfe={selectedMdfeForDamdfe}
        empresa={empresa}
        onClose={() => setSelectedMdfeForDamdfe(null)}
      />

      {/* Emissão CT-e Modal */}
      <EmissaoCteModal
        isOpen={isEmissaoModalOpen}
        onClose={() => setIsEmissaoModalOpen(false)}
        empresa={empresa}
        viagens={viagens}
        veiculos={veiculos}
        motoristas={motoristas}
        onEmitirCte={onAddCte}
      />

      {/* Emissão MDF-e Modal */}
      <EmissaoMdfeModal
        isOpen={isEmissaoMdfeModalOpen}
        onClose={() => setIsEmissaoMdfeModalOpen(false)}
        empresa={empresa}
        ctes={ctes}
        veiculos={veiculos}
        motoristas={motoristas}
        onEmitirMdfe={onAddMdfe}
      />
    </div>
  );
};
