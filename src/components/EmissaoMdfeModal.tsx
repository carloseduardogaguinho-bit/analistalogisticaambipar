import React, { useState } from 'react';
import { MdfeDocumento, CteDocumento, EmpresaFiscalConfig, Veiculo, Motorista } from '../types';
import { Layers, Send, X, RefreshCw, CheckCircle2, ShieldCheck, Truck, User } from 'lucide-react';
import { gerarChaveAcessoMdfe } from '../utils/fiscalUtils';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface EmissaoMdfeModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: EmpresaFiscalConfig;
  ctes: CteDocumento[];
  veiculos: Veiculo[];
  motoristas: Motorista[];
  onEmitirMdfe: (mdfe: MdfeDocumento) => void;
}

export const EmissaoMdfeModal: React.FC<EmissaoMdfeModalProps> = ({
  isOpen,
  onClose,
  empresa,
  ctes,
  veiculos,
  motoristas,
  onEmitirMdfe,
}) => {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionSuccess, setTransmissionSuccess] = useState(false);

  // Selected CT-e IDs
  const [selectedCteIds, setSelectedCteIds] = useState<string[]>([]);

  // Form State
  const [numeroMdfe, setNumeroMdfe] = useState(
    String(Math.floor(1000 + Math.random() * 9000)).padStart(9, '0')
  );
  const [serie, setSerie] = useState('1');
  const [ufCarregamento, setUfCarregamento] = useState(empresa.uf || 'SP');
  const [municipioCarregamento, setMunicipioCarregamento] = useState(empresa.municipio || 'Nova Odessa');
  const [ufDescarregamento, setUfDescarregamento] = useState('SP');
  const [municipioDescarregamento, setMunicipioDescarregamento] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState(veiculos[0]?.placa || '');
  const [motoristaNome, setMotoristaNome] = useState(motoristas[0]?.nome || '');
  const [motoristaCpf, setMotoristaCpf] = useState(motoristas[0]?.cpf || '');
  const [seguradoraNome, setSeguradoraNome] = useState('Porto Seguro Cargas S.A.');
  const [seguradoraApolice, setSeguradoraApolice] = useState('APOL-AMB-2026-99');
  const [ciot, setCiot] = useState('');

  // Manual fallback key if no CT-e is in memory
  const [manualCteChave, setManualCteChave] = useState('');

  if (!isOpen) return null;

  // Toggle CT-e selection
  const handleToggleCte = (cteId: string) => {
    setSelectedCteIds((prev) => {
      const exists = prev.includes(cteId);
      const next = exists ? prev.filter((id) => id !== cteId) : [...prev, cteId];

      // Auto-update destination and vehicle from first selected CT-e
      if (!exists) {
        const found = ctes.find((c) => c.id === cteId);
        if (found) {
          if (!municipioDescarregamento) {
            setMunicipioDescarregamento(found.destinatarioMunicipio);
            setUfDescarregamento(found.destinatarioUf);
          }
          if (!placaVeiculo && found.placaTracao) {
            setPlacaVeiculo(found.placaTracao);
          }
          if (!motoristaNome && found.motoristaNome) {
            setMotoristaNome(found.motoristaNome);
            setMotoristaCpf(found.motoristaCpf);
          }
        }
      }
      return next;
    });
  };

  // Compute aggregated totals
  const selectedCtes = ctes.filter((c) => selectedCteIds.includes(c.id));
  const totalPesoKg = selectedCtes.reduce((acc, c) => acc + (c.pesoBrutoKg || 0), 0);
  const totalValorCargas = selectedCtes.reduce((acc, c) => acc + (c.valorCargaAverbada || c.valorTotalServico || 0), 0);

  const handleSelectMotorista = (nome: string) => {
    setMotoristaNome(nome);
    const mot = motoristas.find((m) => m.nome === nome);
    if (mot) {
      setMotoristaCpf(mot.cpf);
      if (mot.veiculoFixoPlaca) {
        setPlacaVeiculo(mot.veiculoFixoPlaca);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let chavesParaIncluir: string[] = selectedCtes.map((c) => c.chaveAcesso);
    if (chavesParaIncluir.length === 0 && manualCteChave.trim()) {
      chavesParaIncluir = [manualCteChave.trim().replace(/\s+/g, '')];
    }

    if (chavesParaIncluir.length === 0) {
      alert('Por favor, selecione ao menos 1 Conhecimento de Transporte (CT-e) ou informe uma chave de acesso para compor o MDF-e.');
      return;
    }

    setIsTransmitting(true);

    const chaveAcesso = gerarChaveAcessoMdfe(
      ufCarregamento,
      empresa.cnpj,
      serie,
      numeroMdfe
    );

    const now = new Date();
    const dataHoraStr = now.toISOString().slice(0, 19).replace('T', ' ');
    const protocolo = `135${now.getFullYear().toString().slice(-2)}${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    setTimeout(() => {
      const newMdfe: MdfeDocumento = {
        id: `mdfe-${Date.now()}`,
        numeroMdfe,
        serie,
        chaveAcesso,
        dataEmissao: dataHoraStr,
        status: 'Autorizado',
        protocoloAutorizacao: protocolo,
        ufCarregamento,
        ufDescarregamento,
        municipioCarregamento,
        municipioDescarregamento: municipioDescarregamento || 'Destino da Carga',
        pesoBrutoTotalKg: totalPesoKg > 0 ? totalPesoKg : 5000,
        valorTotalCargas: totalValorCargas > 0 ? totalValorCargas : 25000,
        quantidadeCtes: chavesParaIncluir.length,
        ctesChaves: chavesParaIncluir,
        placaVeiculo: placaVeiculo || 'ABC-4E21',
        motoristaNome: motoristaNome || 'Motorista Ambipar',
        motoristaCpf: motoristaCpf || '000.000.000-00',
        rntrc: empresa.rntrc,
        ciot: ciot || undefined,
        seguradoraNome,
        seguradoraApolice,
      };

      onEmitirMdfe(newMdfe);
      setIsTransmitting(false);
      setTransmissionSuccess(true);

      setTimeout(() => {
        setTransmissionSuccess(false);
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Emissão de Manifesto Eletrônico de Documentos Fiscais</span>
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  MDF-e 3.0 / Modelo 58
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Consolidação fiscal de múltiplos CT-es para circulação rodoviária interestadual autorizada na SEFAZ.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Identificação Geral do MDF-e */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Dados de Identificação do Manifesto & Órgão Autorizador</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Número do MDF-e *</label>
                <input
                  type="text"
                  required
                  value={numeroMdfe}
                  onChange={(e) => setNumeroMdfe(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Série *</label>
                <input
                  type="text"
                  required
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ambiente SEFAZ</label>
                <input
                  type="text"
                  disabled
                  value={empresa.ambienteSefaz}
                  className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Código CIOT (ANTT)</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={ciot}
                  onChange={(e) => setCiot(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Percurso do Transporte */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <Truck className="w-4 h-4 text-ambipar-400" />
              <span>Percurso do Transporte (Origem &rarr; Destino)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">UF Carregamento *</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={ufCarregamento}
                  onChange={(e) => setUfCarregamento(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Município Carregamento *</label>
                <input
                  type="text"
                  required
                  value={municipioCarregamento}
                  onChange={(e) => setMunicipioCarregamento(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">UF Descarregamento *</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={ufDescarregamento}
                  onChange={(e) => setUfDescarregamento(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Município Descarregamento *</label>
                <input
                  type="text"
                  required
                  value={municipioDescarregamento}
                  onChange={(e) => setMunicipioDescarregamento(e.target.value)}
                  placeholder="Ex: Paulínia"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Veículo & Condutor */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Modal Rodoviário: Veículo Tração e Condutor</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Placa Veículo Tração (Cavalo) *</label>
                <select
                  value={placaVeiculo}
                  onChange={(e) => setPlacaVeiculo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                >
                  <option value="">Selecione um veículo...</option>
                  {veiculos.map((v) => (
                    <option key={v.id} value={v.placa}>
                      {v.placa} &middot; {v.modelo}
                    </option>
                  ))}
                  {placaVeiculo && !veiculos.some((v) => v.placa === placaVeiculo) && (
                    <option value={placaVeiculo}>{placaVeiculo} (Informado)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Motorista Responsável *</label>
                <select
                  value={motoristaNome}
                  onChange={(e) => handleSelectMotorista(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                >
                  <option value="">Selecione um motorista...</option>
                  {motoristas.map((m) => (
                    <option key={m.id} value={m.nome}>
                      {m.nome} (CPF: {m.cpf})
                    </option>
                  ))}
                  {motoristaNome && !motoristas.some((m) => m.nome === motoristaNome) && (
                    <option value={motoristaNome}>{motoristaNome} (Informado)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">CPF do Motorista *</label>
                <input
                  type="text"
                  required
                  value={motoristaCpf}
                  onChange={(e) => setMotoristaCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Seguro de Carga (Obrigatório por Lei) */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Seguro Obrigatório de Carga (RCTR-C / RCF-DC)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome da Seguradora *</label>
                <input
                  type="text"
                  required
                  value={seguradoraNome}
                  onChange={(e) => setSeguradoraNome(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Número da Apólice *</label>
                <input
                  type="text"
                  required
                  value={seguradoraApolice}
                  onChange={(e) => setSeguradoraApolice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Seleção de CT-es Emitidos */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Vincular Conhecimentos de Transporte (CT-e) a este Manifesto</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Selecionados: <strong className="text-white">{selectedCteIds.length}</strong>
              </span>
            </div>

            {ctes.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-dashed border-slate-800 text-center space-y-2">
                <p className="text-slate-400 text-xs">
                  Nenhum CT-e registrado no sistema para seleção automática.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Você pode informar a chave de acesso de 44 dígitos de um CT-e manualmente abaixo:
                </p>
                <input
                  type="text"
                  maxLength={44}
                  placeholder="Cole aqui a chave de 44 dígitos do CT-e..."
                  value={manualCteChave}
                  onChange={(e) => setManualCteChave(e.target.value)}
                  className="w-full max-w-lg mx-auto bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center"
                />
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {ctes.map((cte) => {
                  const isChecked = selectedCteIds.includes(cte.id);
                  return (
                    <div
                      key={cte.id}
                      onClick={() => handleToggleCte(cte.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <div>
                          <div className="font-mono font-bold text-xs">
                            CT-e Nº {cte.numeroCte} (Série {cte.serie})
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {cte.remetenteMunicipio}-{cte.remetenteUf} &rarr; {cte.destinatarioMunicipio}-{cte.destinatarioUf} &middot; {cte.produtoPredominante}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-emerald-400">
                          {formatCurrency(cte.valorCargaAverbada || cte.valorTotalServico)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {formatNumber(cte.pesoBrutoKg / 1000, 1)} t
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Totais do Manifesto */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Qtd. Documentos</span>
                <span className="text-sm font-black text-white">{selectedCteIds.length || (manualCteChave ? 1 : 0)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Peso Total Consolidado</span>
                <span className="text-sm font-black text-white">{formatNumber(totalPesoKg / 1000, 2)} t</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Valor Total das Cargas</span>
                <span className="text-sm font-black text-emerald-400">{formatCurrency(totalValorCargas)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              * O MDF-e gerará XML 3.00 oficial com assinatura e protocolo SEFAZ/SVRS.
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition font-medium"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isTransmitting || transmissionSuccess}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isTransmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Autorizando na SEFAZ...</span>
                  </>
                ) : transmissionSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>MDF-e Autorizado!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transmitir e Autorizar MDF-e</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
