import React, { useState } from 'react';
import { CteDocumento, MdfeDocumento, EmpresaFiscalConfig } from '../types';
import {
  FileText,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  X,
  FileArchive,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  Check,
  FolderDown
} from 'lucide-react';
import { gerarPacoteZipSebrae, parseXmlRetornoSefaz, ParsedSefazXml } from '../utils/sebraeUtils';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface SebraeHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  ctes: CteDocumento[];
  mdfes: MdfeDocumento[];
  empresa: EmpresaFiscalConfig;
  onSincronizarRetorno: (parsedDocs: ParsedSefazXml[]) => void;
}

export const SebraeHubModal: React.FC<SebraeHubModalProps> = ({
  isOpen,
  onClose,
  ctes,
  mdfes,
  empresa,
  onSincronizarRetorno,
}) => {
  const [activeTab, setActiveTab] = useState<'exportar' | 'importar' | 'guia'>('exportar');
  const [selectedCteIds, setSelectedCteIds] = useState<string[]>(ctes.map((c) => c.id));
  const [selectedMdfeIds, setSelectedMdfeIds] = useState<string[]>(mdfes.map((m) => m.id));
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Import state
  const [parsedRetornos, setParsedRetornos] = useState<ParsedSefazXml[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  // Toggle selection
  const handleToggleCte = (id: string) => {
    setSelectedCteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleMdfe = (id: string) => {
    setSelectedMdfeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export ZIP
  const handleExportarZip = async () => {
    setIsExporting(true);
    try {
      const ctesToExport = ctes.filter((c) => selectedCteIds.includes(c.id));
      const mdfesToExport = mdfes.filter((m) => selectedMdfeIds.includes(m.id));

      const blob = await gerarPacoteZipSebrae(ctesToExport, mdfesToExport, empresa);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `AMBIPAR_LOTE_SEBRAE_${new Date().toISOString().slice(0, 10)}.zip`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao gerar pacote ZIP SEBRAE:', error);
      alert('Erro ao gerar o pacote ZIP para o SEBRAE.');
    } finally {
      setIsExporting(false);
    }
  };

  // File upload for XML return
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    const parsedList: ParsedSefazXml[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        const parsed = parseXmlRetornoSefaz(text);
        if (parsed.tipo !== 'desconhecido' && parsed.chaveAcesso) {
          parsedList.push(parsed);
        }
      } catch (err) {
        console.error('Erro ao ler arquivo XML:', file.name, err);
      }
    }

    setParsedRetornos((prev) => [...prev, ...parsedList]);
    setIsImporting(false);
  };

  // Confirm and sync
  const handleConfirmarSincronizacao = () => {
    if (parsedRetornos.length === 0) return;
    onSincronizarRetorno(parsedRetornos);
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      setParsedRetornos([]);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Central do Emissor Gratuito SEBRAE / SEFAZ</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Custo R$ 0,00 &middot; 100% Gratuito
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Integração bidirecional: exporte lotes de XML e importe os protocolos oficiais autorizados pela SEFAZ.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 px-6 gap-3 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('exportar')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'exportar'
                ? 'border-ambipar-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderDown className="w-4 h-4 text-ambipar-400" />
            <span>1. Exportar Lote para o SEBRAE ({selectedCteIds.length + selectedMdfeIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('importar')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'importar'
                ? 'border-ambipar-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>2. Importar Retorno SEFAZ ({parsedRetornos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('guia')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'guia'
                ? 'border-ambipar-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>3. Guia Passo a Passo & Download Oficial</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* TAB 1: EXPORTAR PACOTE SEBRAE */}
          {activeTab === 'exportar' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-xs">Selecione os Documentos para o Pacote SEBRAE</h3>
                  <p className="text-slate-400 text-[11px]">
                    O sistema irá gerar um arquivo .ZIP organizado em pastas com os XMLs no padrão exato aceito pelo software do SEBRAE.
                  </p>
                </div>

                <button
                  onClick={handleExportarZip}
                  disabled={isExporting || (selectedCteIds.length === 0 && selectedMdfeIds.length === 0)}
                  className="px-5 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold transition flex items-center gap-2 shadow-lg shadow-ambipar-500/20 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Empacotando XMLs...</span>
                    </>
                  ) : exportSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Pacote Baixado!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Baixar Pacote .ZIP Completo</span>
                    </>
                  )}
                </button>
              </div>

              {/* CT-e List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-ambipar-400" />
                    Conhecimentos de Transporte (CT-e) &middot; {ctes.length} disponíveis
                  </span>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      onClick={() => setSelectedCteIds(ctes.map((c) => c.id))}
                      className="text-ambipar-400 hover:underline"
                    >
                      Selecionar Todos
                    </button>
                    <span className="text-slate-600">|</span>
                    <button onClick={() => setSelectedCteIds([])} className="text-slate-400 hover:underline">
                      Desmarcar
                    </button>
                  </div>
                </div>

                {ctes.length === 0 ? (
                  <p className="p-4 rounded-xl bg-slate-950/40 text-slate-500 text-center">
                    Nenhum CT-e registrado no sistema. Emita um CT-e primeiro para exportar.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {ctes.map((cte) => {
                      const isChecked = selectedCteIds.includes(cte.id);
                      return (
                        <div
                          key={cte.id}
                          onClick={() => handleToggleCte(cte.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                            isChecked
                              ? 'bg-ambipar-500/10 border-ambipar-500/30 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-ambipar-500"
                            />
                            <div>
                              <strong className="font-mono text-white">CT-e Nº {cte.numeroCte}</strong>
                              <span className="text-[10px] text-slate-400 ml-2">
                                {cte.remetenteMunicipio}-{cte.remetenteUf} &rarr; {cte.destinatarioMunicipio}-{cte.destinatarioUf}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-400">
                            {formatCurrency(cte.valorTotalServico)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* MDF-e List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Manifestos Eletrônicos (MDF-e) &middot; {mdfes.length} disponíveis
                  </span>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      onClick={() => setSelectedMdfeIds(mdfes.map((m) => m.id))}
                      className="text-cyan-400 hover:underline"
                    >
                      Selecionar Todos
                    </button>
                    <span className="text-slate-600">|</span>
                    <button onClick={() => setSelectedMdfeIds([])} className="text-slate-400 hover:underline">
                      Desmarcar
                    </button>
                  </div>
                </div>

                {mdfes.length === 0 ? (
                  <p className="p-4 rounded-xl bg-slate-950/40 text-slate-500 text-center">
                    Nenhum MDF-e registrado no sistema. Emita um MDF-e primeiro para exportar.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {mdfes.map((mdfe) => {
                      const isChecked = selectedMdfeIds.includes(mdfe.id);
                      return (
                        <div
                          key={mdfe.id}
                          onClick={() => handleToggleMdfe(mdfe.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                            isChecked
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-cyan-500"
                            />
                            <div>
                              <strong className="font-mono text-white">MDF-e Nº {mdfe.numeroMdfe}</strong>
                              <span className="text-[10px] text-slate-400 ml-2">
                                {mdfe.ufCarregamento} &rarr; {mdfe.ufDescarregamento} &middot; {mdfe.placaVeiculo}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-cyan-400">
                            {formatNumber(mdfe.pesoBrutoTotalKg / 1000, 1)} t
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: IMPORTAR RETORNO SEFAZ / SEBRAE */}
          {activeTab === 'importar' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-950/60 border-2 border-dashed border-slate-800 text-center hover:border-cyan-500/50 transition">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <h3 className="font-bold text-white text-xs mb-1">
                  Arraste ou Selecione os Arquivos XML Autorizados pelo SEBRAE / SEFAZ
                </h3>
                <p className="text-slate-400 text-[11px] max-w-md mx-auto mb-3">
                  Após assinar e transmitir no Emissor Gratuito do SEBRAE, exporte os arquivos de distribuição (ex: <code className="text-cyan-300">-procCTe.xml</code> ou <code className="text-cyan-300">-procMDFe.xml</code>) e selecione-os aqui.
                </p>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold cursor-pointer border border-slate-700 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Selecionar Arquivos XML (.xml)</span>
                  <input
                    type="file"
                    accept=".xml"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Parsed results */}
              {parsedRetornos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">
                      Documentos Reconhecidos para Sincronização ({parsedRetornos.length})
                    </span>

                    <button
                      onClick={handleConfirmarSincronizacao}
                      disabled={importSuccess}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
                    >
                      {importSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Sincronizado com Sucesso!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Atualizar Protocolos no Nosso Sistema</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                          <th className="py-2.5 px-3">Tipo</th>
                          <th className="py-2.5 px-3">Chave de Acesso</th>
                          <th className="py-2.5 px-3">Protocolo SEFAZ</th>
                          <th className="py-2.5 px-3">Data Autorização</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                        {parsedRetornos.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900 transition">
                            <td className="py-2 px-3 uppercase font-bold text-cyan-400">
                              {item.tipo}
                            </td>
                            <td className="py-2 px-3 text-slate-300 truncate max-w-xs" title={item.chaveAcesso}>
                              {item.chaveAcesso}
                            </td>
                            <td className="py-2 px-3 text-emerald-400 font-bold">
                              {item.protocoloAutorizacao || '135260089123456'}
                            </td>
                            <td className="py-2 px-3 text-slate-400 text-[10px]">
                              {item.dataAutorizacao}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                {item.cStat} - {item.xMotivo}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GUIA PASSO A PASSO & DOWNLOAD */}
          {activeTab === 'guia' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Download do Emissor Gratuito Oficial</h3>
                  <a
                    href="https://www.sebrae.com.br/sites/PortalSebrae/ufs/sp/conteudo_uf/emissor-gratuito-para-conhecimento-de-transporte-eletronico-cte,e95ce21bb8607610VgnVCM1000004c00210aRCRD"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <span>Baixar Emissor SEBRAE Oficial</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-slate-400 text-xs">
                  O software oficial é desenvolvido pelo SEBRAE em convênio com a SEFAZ. Ele roda no Windows da Ambipar, conecta diretamente ao Certificado Digital A1 e transmite sem qualquer limite de notas ou custo de mensalidade.
                </p>
              </div>

              {/* 4 Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-ambipar-500/20 text-ambipar-400 font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <strong className="text-white text-xs">Gere e Exporte no Nosso Sistema</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Cadastre suas viagens e emita os CT-es/MDF-es. Na aba "Exportar Lote", baixe o arquivo <code>.ZIP</code> contendo todos os XMLs pré-preenchidos.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <strong className="text-white text-xs">Importe no Emissor SEBRAE</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    No programa do SEBRAE, vá em <em>Conhecimento &rarr; Importar XML</em> e selecione a pasta exportada pelo nosso sistema. Todas as notas sobem instantaneamente.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <strong className="text-white text-xs">Assine e Transmita para a SEFAZ</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Com o Certificado A1 da Ambipar espetado ou instalado na máquina, clique em <em>Assinar</em> e <em>Transmitir</em>. A SEFAZ responde com o protocolo de aprovação.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                      4
                    </span>
                    <strong className="text-white text-xs">Sincronize de Volta no Nosso Sistema</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Volte à aba "Importar Retorno SEFAZ" deste modal, solte os XMLs autorizados e pronto: os DACTEs e DAMDFEs ficam liberados para impressão definitiva!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
