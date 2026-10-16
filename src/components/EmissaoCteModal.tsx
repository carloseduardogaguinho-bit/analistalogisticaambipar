import React, { useState } from 'react';
import { CteDocumento, Viagem, EmpresaFiscalConfig, Veiculo, Motorista } from '../types';
import { FileText, Send, X, RefreshCw, CheckCircle2, AlertCircle, Building, Truck } from 'lucide-react';
import { gerarChaveAcessoCte } from '../utils/fiscalUtils';

interface EmissaoCteModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: EmpresaFiscalConfig;
  viagens: Viagem[];
  veiculos: Veiculo[];
  motoristas: Motorista[];
  onEmitirCte: (cte: CteDocumento) => void;
}

export const EmissaoCteModal: React.FC<EmissaoCteModalProps> = ({
  isOpen,
  onClose,
  empresa,
  viagens,
  veiculos,
  motoristas,
  onEmitirCte,
}) => {
  const [selectedViagemId, setSelectedViagemId] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionSuccess, setTransmissionSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<CteDocumento>>({
    numeroCte: String(Math.floor(10000 + Math.random() * 90000)).padStart(9, '0'),
    serie: '1',
    cfop: '5353',
    ambiente: empresa.ambienteSefaz,
    remetenteNome: '',
    remetenteCnpj: '',
    remetenteIe: '535.109.840.119',
    remetenteEndereco: 'Avenida Industrial, 1000',
    remetenteMunicipio: 'Paulínia',
    remetenteUf: 'SP',
    destinatarioNome: 'Ambipar Valorização & Destinação de Resíduos S.A.',
    destinatarioCnpj: '12.648.266/0002-05',
    destinatarioIe: '535.889.120.334',
    destinatarioEndereco: 'Estrada Municipal Fazenda São Jorge, 1000',
    destinatarioMunicipio: 'Nova Odessa',
    destinatarioUf: 'SP',
    tomadorServico: 'Remetente',
    valorFretePeso: 1500,
    valorPedagio: 180,
    valorGris: 120,
    valorOutros: 50,
    aliquotaIcms: 12.0,
    produtoPredominante: 'Resíduos Químicos Industriais / Efluentes Oleosos',
    pesoBrutoKg: 20000,
    pesoLiquidoKg: 20000,
    valorCargaAverbada: 75000,
    numeroNfeCarga: '35261012345678000199550010000089121891230491',
    numeroMtrVinculado: 'MTR-SINIR-892102',
    placaTracao: veiculos[0]?.placa || 'ABC-4E21',
    placaReboque: 'AMB-8910',
    motoristaNome: motoristas[0]?.nome || 'Carlos Alberto Ferreira',
    motoristaCpf: motoristas[0]?.cpf || '123.456.789-01',
    rntrc: empresa.rntrc,
    observacoesFiscais: 'Transporte de resíduo para destinação/coprocessamento com Manifesto MTR SINIR anexo. CT-e emitido sob regime de tributação normal.',
  });

  if (!isOpen) return null;

  // Auto-fill from Trip
  const handleSelectViagem = (viagemId: string) => {
    setSelectedViagemId(viagemId);
    const viagem = viagens.find((v) => v.id === viagemId);
    if (!viagem) return;

    setFormData((prev) => ({
      ...prev,
      remetenteNome: viagem.cliente,
      remetenteCnpj: '33.000.167/0842-89',
      remetenteMunicipio: viagem.origem.split('-')[0].trim(),
      remetenteUf: viagem.origem.split('-')[1]?.trim() || 'SP',
      destinatarioNome: viagem.destino,
      destinatarioMunicipio: viagem.destino.split('-')[0].trim(),
      destinatarioUf: viagem.destino.split('-')[1]?.trim() || 'SP',
      produtoPredominante: viagem.classeResiduo,
      pesoBrutoKg: (viagem.pesoToneladas || 15) * 1000,
      pesoLiquidoKg: (viagem.pesoToneladas || 15) * 1000,
      numeroMtrVinculado: viagem.numeroMTR,
      placaTracao: viagem.placaCavalo,
      placaReboque: viagem.placaCarreta || '',
      motoristaNome: viagem.motorista,
      valorFretePeso: viagem.custoTotal ? viagem.custoTotal * 0.8 : 1500,
      valorPedagio: viagem.custoTotal ? viagem.custoTotal * 0.12 : 200,
    }));
  };

  const valorTotalServico =
    (Number(formData.valorFretePeso) || 0) +
    (Number(formData.valorPedagio) || 0) +
    (Number(formData.valorGris) || 0) +
    (Number(formData.valorOutros) || 0);

  const valorIcms = (valorTotalServico * (Number(formData.aliquotaIcms) || 0)) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransmitting(true);

    // Generate standard 44-digit Access Key
    const chaveAcesso = gerarChaveAcessoCte(
      formData.remetenteUf || 'SP',
      empresa.cnpj,
      formData.serie || '1',
      formData.numeroCte || '000000001'
    );

    const now = new Date();
    const dataHoraStr = now.toISOString().slice(0, 19).replace('T', ' ');
    const protocolo = `135${now.getFullYear().toString().slice(-2)}${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    setTimeout(() => {
      const newCte: CteDocumento = {
        id: `cte-${Date.now()}`,
        numeroCte: formData.numeroCte || '000000001',
        serie: formData.serie || '1',
        chaveAcesso,
        dataEmissao: dataHoraStr,
        status: 'Autorizado',
        protocoloAutorizacao: protocolo,
        dataAutorizacao: dataHoraStr,
        ambiente: empresa.ambienteSefaz,
        remetenteNome: formData.remetenteNome || 'Empresa Remetente',
        remetenteCnpj: formData.remetenteCnpj || '00.000.000/0001-00',
        remetenteIe: formData.remetenteIe || 'ISENTO',
        remetenteEndereco: formData.remetenteEndereco || 'Logradouro Remetente',
        remetenteMunicipio: formData.remetenteMunicipio || 'São Paulo',
        remetenteUf: formData.remetenteUf || 'SP',
        destinatarioNome: formData.destinatarioNome || 'Ambipar Destinação',
        destinatarioCnpj: formData.destinatarioCnpj || empresa.cnpj,
        destinatarioIe: formData.destinatarioIe || empresa.inscricaoEstadual,
        destinatarioEndereco: formData.destinatarioEndereco || empresa.logradouro,
        destinatarioMunicipio: formData.destinatarioMunicipio || empresa.municipio,
        destinatarioUf: formData.destinatarioUf || empresa.uf,
        tomadorServico: formData.tomadorServico as any,
        valorFretePeso: Number(formData.valorFretePeso) || 0,
        valorPedagio: Number(formData.valorPedagio) || 0,
        valorGris: Number(formData.valorGris) || 0,
        valorOutros: Number(formData.valorOutros) || 0,
        valorTotalServico,
        aliquotaIcms: Number(formData.aliquotaIcms) || 0,
        valorIcms,
        cfop: formData.cfop || '5353',
        produtoPredominante: formData.produtoPredominante || 'Carga Geral',
        classeRiscoOnu: formData.classeRiscoOnu,
        pesoBrutoKg: Number(formData.pesoBrutoKg) || 1000,
        pesoLiquidoKg: Number(formData.pesoLiquidoKg) || 1000,
        valorCargaAverbada: Number(formData.valorCargaAverbada) || 10000,
        numeroNfeCarga: formData.numeroNfeCarga || '35261000000000000000550010000000011000000001',
        numeroMtrVinculado: formData.numeroMtrVinculado,
        placaTracao: formData.placaTracao || 'ABC-4E21',
        placaReboque: formData.placaReboque,
        motoristaNome: formData.motoristaNome || 'Motorista Ambipar',
        motoristaCpf: formData.motoristaCpf || '000.000.000-00',
        rntrc: empresa.rntrc,
        observacoesFiscais: formData.observacoesFiscais,
      };

      onEmitirCte(newCte);
      setIsTransmitting(false);
      setTransmissionSuccess(true);

      setTimeout(() => {
        setTransmissionSuccess(false);
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ambipar-500/10 border border-ambipar-500/20 text-ambipar-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Emissor de CT-e &middot; Conhecimento de Transporte</h3>
              <p className="text-xs text-slate-400">
                Transmissão eletrônica padrão SEFAZ Modelo 57 com geração de DACTE e XML oficial.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto">
          {/* Quick pull from trip */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-ambipar-400 font-semibold">
              <Truck className="w-4 h-4" />
              <span>Importar dados de uma Viagem Operacional:</span>
            </div>
            <select
              value={selectedViagemId}
              onChange={(e) => handleSelectViagem(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs font-semibold focus:outline-none"
            >
              <option value="">Selecione para preenchimento automático...</option>
              {viagens.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.codigoViagem} &middot; {v.cliente} ({v.origem} &rarr; {v.destino})
                </option>
              ))}
            </select>
          </div>

          {/* Section 1: Identificação do CT-e */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
              1. Identificação do Documento Fiscal & Natureza
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Número CT-e *</label>
                <input
                  type="text"
                  required
                  value={formData.numeroCte}
                  onChange={(e) => setFormData({ ...formData, numeroCte: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Série</label>
                <input
                  type="text"
                  value={formData.serie}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">CFOP de Transporte</label>
                <select
                  value={formData.cfop}
                  onChange={(e) => setFormData({ ...formData, cfop: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                >
                  <option value="5353">5353 - Transporte Industrial (Estadual)</option>
                  <option value="6353">6353 - Transporte Industrial (Interestadual)</option>
                  <option value="5357">5357 - Transporte a Não Contribuinte</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tomador do Frete</label>
                <select
                  value={formData.tomadorServico}
                  onChange={(e) => setFormData({ ...formData, tomadorServico: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Remetente">Remetente (FOB)</option>
                  <option value="Destinatário">Destinatário (CIF)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Remetente e Destinatário */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
              2. Remetente (Origem) & Destinatário (Destino)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Remetente */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <span className="font-bold text-white block text-xs">Remetente (Gerador / Embarcador)</span>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">Razão Social / Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.remetenteNome}
                    onChange={(e) => setFormData({ ...formData, remetenteNome: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">CNPJ Remetente *</label>
                    <input
                      type="text"
                      required
                      value={formData.remetenteCnpj}
                      onChange={(e) => setFormData({ ...formData, remetenteCnpj: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">Inscrição Estadual</label>
                    <input
                      type="text"
                      value={formData.remetenteIe}
                      onChange={(e) => setFormData({ ...formData, remetenteIe: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-slate-400 text-[10px] mb-0.5">Município</label>
                    <input
                      type="text"
                      value={formData.remetenteMunicipio}
                      onChange={(e) => setFormData({ ...formData, remetenteMunicipio: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">UF</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.remetenteUf}
                      onChange={(e) => setFormData({ ...formData, remetenteUf: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white uppercase text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Destinatário */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <span className="font-bold text-white block text-xs">Destinatário (Destinador / Descarga)</span>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">Razão Social / Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.destinatarioNome}
                    onChange={(e) => setFormData({ ...formData, destinatarioNome: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">CNPJ Destinatário *</label>
                    <input
                      type="text"
                      required
                      value={formData.destinatarioCnpj}
                      onChange={(e) => setFormData({ ...formData, destinatarioCnpj: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">Inscrição Estadual</label>
                    <input
                      type="text"
                      value={formData.destinatarioIe}
                      onChange={(e) => setFormData({ ...formData, destinatarioIe: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-slate-400 text-[10px] mb-0.5">Município</label>
                    <input
                      type="text"
                      value={formData.destinatarioMunicipio}
                      onChange={(e) => setFormData({ ...formData, destinatarioMunicipio: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">UF</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.destinatarioUf}
                      onChange={(e) => setFormData({ ...formData, destinatarioUf: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white uppercase text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Carga, NF-e & MTR */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
              3. Dados da Carga, DANFE / NF-e & MTR Vinculados
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Produto Predominante *</label>
                <input
                  type="text"
                  required
                  value={formData.produtoPredominante}
                  onChange={(e) => setFormData({ ...formData, produtoPredominante: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Peso Bruto (kg) *</label>
                <input
                  type="number"
                  required
                  value={formData.pesoBrutoKg}
                  onChange={(e) => setFormData({ ...formData, pesoBrutoKg: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Valor da Carga (Averbação R$)</label>
                <input
                  type="number"
                  value={formData.valorCargaAverbada}
                  onChange={(e) => setFormData({ ...formData, valorCargaAverbada: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Chave da NF-e da Carga (44 dígitos) *</label>
                <input
                  type="text"
                  required
                  placeholder="3526 10..."
                  value={formData.numeroNfeCarga}
                  onChange={(e) => setFormData({ ...formData, numeroNfeCarga: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Número MTR SINIR Vinculado</label>
                <input
                  type="text"
                  placeholder="MTR-SINIR-892102"
                  value={formData.numeroMtrVinculado}
                  onChange={(e) => setFormData({ ...formData, numeroMtrVinculado: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Composição do Frete & ICMS */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs">4. Composição do Frete & Impostos</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 text-[10px] mb-0.5">Frete Peso (R$)</label>
                <input
                  type="number"
                  value={formData.valorFretePeso}
                  onChange={(e) => setFormData({ ...formData, valorFretePeso: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] mb-0.5">Pedágio (R$)</label>
                <input
                  type="number"
                  value={formData.valorPedagio}
                  onChange={(e) => setFormData({ ...formData, valorPedagio: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] mb-0.5">GRIS / Risco (R$)</label>
                <input
                  type="number"
                  value={formData.valorGris}
                  onChange={(e) => setFormData({ ...formData, valorGris: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] mb-0.5">Alíquota ICMS (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.aliquotaIcms}
                  onChange={(e) => setFormData({ ...formData, aliquotaIcms: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Total da Prestação: <strong className="text-white text-sm">R$ {valorTotalServico.toFixed(2)}</strong></span>
              <span className="text-slate-400">ICMS Calculado: <strong className="text-emerald-400">R$ {valorIcms.toFixed(2)}</strong></span>
            </div>
          </div>

          {/* Section 5: Modal Rodoviário (Veículo / Motorista) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 text-[10px] mb-0.5">Placa Cavalo / Tração</label>
              <input
                type="text"
                value={formData.placaTracao}
                onChange={(e) => setFormData({ ...formData, placaTracao: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] mb-0.5">Placa Carreta / Reboque</label>
              <input
                type="text"
                value={formData.placaReboque}
                onChange={(e) => setFormData({ ...formData, placaReboque: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] mb-0.5">Motorista</label>
              <input
                type="text"
                value={formData.motoristaNome}
                onChange={(e) => setFormData({ ...formData, motoristaNome: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] mb-0.5">RNTRC Ambipar</label>
              <input
                type="text"
                value={formData.rntrc}
                onChange={(e) => setFormData({ ...formData, rntrc: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between sticky bottom-0 bg-slate-900 z-10">
            <span className="text-[10px] text-slate-400 font-mono">
              Ambiente: <strong className="text-emerald-400">{empresa.ambienteSefaz}</strong> &middot; Certificado A1 Ativo
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isTransmitting || transmissionSuccess}
                className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                {isTransmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitindo SEFAZ...</span>
                  </>
                ) : transmissionSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Autorizado SEFAZ!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transmitir & Autorizar CT-e</span>
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
