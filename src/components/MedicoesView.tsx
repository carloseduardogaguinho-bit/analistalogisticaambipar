import React, { useState } from 'react';
import { MedicaoContrato, ItemMedicao, TipoMedicao, StatusMedicao, Viagem } from '../types';
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  X,
  Building,
  User,
  DollarSign,
  TrendingDown,
  Check,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/formatters';

interface MedicoesViewProps {
  medicoes: MedicaoContrato[];
  viagens: Viagem[];
  onAddMedicao: (medicao: MedicaoContrato) => void;
  onUpdateMedicaoStatus: (
    id: string,
    status: StatusMedicao,
    valorAprovado?: number,
    justificativa?: string,
    numeroNf?: string
  ) => void;
}

export const MedicoesView: React.FC<MedicoesViewProps> = ({
  medicoes,
  viagens,
  onAddMedicao,
  onUpdateMedicaoStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'clientes' | 'fornecedores' | 'divergencias'>('clientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicaoForBm, setSelectedMedicaoForBm] = useState<MedicaoContrato | null>(null);
  const [divergenciaModalMedicao, setDivergenciaModalMedicao] = useState<MedicaoContrato | null>(null);
  const [valorAprovadoInput, setValorAprovadoInput] = useState<number>(0);
  const [justificativaInput, setJustificativaInput] = useState<string>('');
  const [nfInput, setNfInput] = useState<string>('');

  // Form State
  const [tipoForm, setTipoForm] = useState<TipoMedicao>('Cliente (Faturamento)');
  const [contraparteNome, setContraparteNome] = useState('');
  const [contraparteCnpj, setContraparteCnpj] = useState('');
  const [contratoNumero, setContratoNumero] = useState(`CONT-AMB-${new Date().getFullYear()}-0${Math.floor(10 + Math.random() * 90)}`);
  const [periodoInicio, setPeriodoInicio] = useState(new Date(Date.now() - 15 * 86400 * 1000).toISOString().slice(0, 10));
  const [periodoFim, setPeriodoFim] = useState(new Date().toISOString().slice(0, 10));
  const [observacoes, setObservacoes] = useState('');
  
  // Itens da Medição
  const [itens, setItens] = useState<ItemMedicao[]>([
    {
      id: `item-${Date.now()}-1`,
      descricao: 'Transporte de Resíduos Classe I - Granel',
      quantidade: 32.5,
      unidade: 'ton',
      valorUnitario: 145.0,
      valorTotal: 4712.5,
      viagemCodigo: viagens[0]?.codigoViagem || 'VG-001',
      ticketBalanca: 'TK-89421',
      numeroMtr: 'MTR-SINIR-89210',
    }
  ]);

  const [novoItemDesc, setNovoItemDesc] = useState('');
  const [novoItemQtd, setNovoItemQtd] = useState<number>(1);
  const [novoItemUn, setNovoItemUn] = useState<'ton' | 'km' | 'diária' | 'hora' | 'viagem'>('ton');
  const [novoItemVlrUnit, setNovoItemVlrUnit] = useState<number>(100);

  const handleAddItem = () => {
    if (!novoItemDesc) return;
    const total = novoItemQtd * novoItemVlrUnit;
    const newItem: ItemMedicao = {
      id: `item-${Date.now()}-${Math.random()}`,
      descricao: novoItemDesc,
      quantidade: Number(novoItemQtd) || 1,
      unidade: novoItemUn,
      valorUnitario: Number(novoItemVlrUnit) || 0,
      valorTotal: total,
    };
    setItens((prev) => [...prev, newItem]);
    setNovoItemDesc('');
    setNovoItemQtd(1);
    setNovoItemVlrUnit(100);
  };

  const handleRemoveItem = (id: string) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  };

  const valorTotalMedido = itens.reduce((acc, i) => acc + i.valorTotal, 0);

  const handleSaveMedicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contraparteNome || itens.length === 0) {
      alert('Informe o nome da contraparte e adicione ao menos um item de medição.');
      return;
    }

    const newMed: MedicaoContrato = {
      id: `med-${Date.now()}`,
      numeroMedicao: `BM-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      tipo: tipoForm,
      contraparteNome,
      contraparteCnpj: contraparteCnpj || '00.000.000/0001-00',
      contratoNumero,
      periodoInicio,
      periodoFim,
      dataEmissao: new Date().toISOString().slice(0, 10),
      status: 'Em Aberto',
      itens,
      valorTotalMedido,
      responsavelAmbipar: 'Carlos Eduardo (Analista Logística)',
      observacoes,
    };

    onAddMedicao(newMed);
    setIsModalOpen(false);
    // Reset
    setContraparteNome('');
    setContraparteCnpj('');
    setObservacoes('');
  };

  // Filtered lists
  const filteredMedicoes = medicoes.filter((m) => {
    const matchesSearch =
      m.numeroMedicao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.contraparteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.contratoNumero.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeSubTab === 'clientes') {
      return m.tipo === 'Cliente (Faturamento)';
    }
    if (activeSubTab === 'fornecedores') {
      return m.tipo === 'Fornecedor (Contas a Pagar)';
    }
    if (activeSubTab === 'divergencias') {
      return m.status === 'Divergência / Em Contestação';
    }
    return true;
  });

  // KPI Calculations
  const totalClientes = medicoes
    .filter((m) => m.tipo === 'Cliente (Faturamento)')
    .reduce((acc, m) => acc + m.valorTotalMedido, 0);

  const totalFornecedores = medicoes
    .filter((m) => m.tipo === 'Fornecedor (Contas a Pagar)')
    .reduce((acc, m) => acc + m.valorTotalMedido, 0);

  const totalDivergencias = medicoes
    .filter((m) => m.status === 'Divergência / Em Contestação')
    .reduce((acc, m) => acc + (m.valorDivergencia || (m.valorTotalMedido - (m.valorAprovadoContraparte || 0))), 0);

  const aprovadasCount = medicoes.filter((m) => m.status === 'Aprovada' || m.status === 'Faturada / Liquidada').length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-ambipar-400" />
            <span>Medições & Conferência de Contratos (Clientes & Fornecedores)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Apuração de serviços prestados, conferência de pesagens/balanças, conciliação de fretes terceiros e emissão de Boletins de Medição (BM).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Medição de Contrato</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Medições de Clientes (Receita)</span>
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">
            {formatCurrency(totalClientes)}
          </div>
          <p className="text-[10px] text-slate-500">Total apurado para faturamento</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Medições Fornecedores (Contas)</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-400">
            {formatCurrency(totalFornecedores)}
          </div>
          <p className="text-[10px] text-slate-500">Terceiros, destinações e oficinas</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Divergências em Contestação</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">
            {formatCurrency(totalDivergencias)}
          </div>
          <p className="text-[10px] text-slate-500">Diferenças de pesagem ou glosas</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Medições Aprovadas</span>
            <CheckCircle2 className="w-4 h-4 text-ambipar-400" />
          </div>
          <div className="text-xl font-black text-white">
            {aprovadasCount} <span className="text-xs font-normal text-slate-400">de {medicoes.length}</span>
          </div>
          <p className="text-[10px] text-slate-500">Prontas para faturamento / liquidadas</p>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex border-b border-slate-800 gap-3">
        <button
          onClick={() => setActiveSubTab('clientes')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'clientes'
              ? 'border-ambipar-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4 text-emerald-400" />
          <span>Medições de Clientes (Faturamento) ({medicoes.filter((m) => m.tipo === 'Cliente (Faturamento)').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fornecedores')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'fornecedores'
              ? 'border-ambipar-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Medições de Fornecedores & Terceiros ({medicoes.filter((m) => m.tipo === 'Fornecedor (Contas a Pagar)').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('divergencias')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'divergencias'
              ? 'border-ambipar-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Divergências & Contestações ({medicoes.filter((m) => m.status === 'Divergência / Em Contestação').length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por número da medição, cliente, fornecedor ou contrato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Boletim / Contrato</th>
                <th className="py-3 px-4">Contraparte (Cliente / Fornecedor)</th>
                <th className="py-3 px-4">Período de Apuração</th>
                <th className="py-3 px-4 text-center">Itens</th>
                <th className="py-3 px-4 text-right">Valor Medido</th>
                <th className="py-3 px-4 text-right">Valor Aprovado</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredMedicoes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhuma medição registrada nesta categoria. Clique em "Nova Medição de Contrato" para iniciar o fechamento quinzenal/mensal.
                  </td>
                </tr>
              ) : (
                filteredMedicoes.map((m) => {
                  const hasDivergencia = m.status === 'Divergência / Em Contestação';
                  const isAprovada = m.status === 'Aprovada' || m.status === 'Faturada / Liquidada';

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white text-xs block">
                          {m.numeroMedicao}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {m.contratoNumero}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-white font-semibold truncate">{m.contraparteNome}</div>
                        <div className="text-[10px] text-slate-500 font-mono">CNPJ: {m.contraparteCnpj}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-300 font-medium">
                          {m.periodoInicio} &rarr; {m.periodoFim}
                        </div>
                        <div className="text-[10px] text-slate-500">Emitido: {m.dataEmissao}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold text-[10px]">
                          {m.itens.length} item(ns)
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatCurrency(m.valorTotalMedido)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono">
                        {m.valorAprovadoContraparte ? (
                          <span className={`font-bold ${m.valorAprovadoContraparte === m.valorTotalMedido ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {formatCurrency(m.valorAprovadoContraparte)}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Aguardando aceite</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isAprovada
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : hasDivergencia
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedMedicaoForBm(m)}
                            title="Visualizar / Imprimir Boletim de Medição (BM)"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setDivergenciaModalMedicao(m);
                              setValorAprovadoInput(m.valorAprovadoContraparte || m.valorTotalMedido);
                              setJustificativaInput(m.justificativaDivergencia || '');
                              setNfInput(m.numeroNotaFiscal || '');
                            }}
                            title="Conferir / Apontar Divergência ou Aprovar"
                            className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-amber-500/20 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
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

      {/* Modal: Nova Medição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-ambipar-500/10 border border-ambipar-500/20 flex items-center justify-center text-ambipar-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nova Medição de Contrato</h3>
                  <p className="text-xs text-slate-400">Geração de Boletim de Medição para faturamento ou contas a pagar.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicao} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo da Medição *</label>
                  <select
                    value={tipoForm}
                    onChange={(e) => setTipoForm(e.target.value as TipoMedicao)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                  >
                    <option value="Cliente (Faturamento)">Cliente (Faturamento de Serviços)</option>
                    <option value="Fornecedor (Contas a Pagar)">Fornecedor (Contas a Pagar / Terceiros)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Número do Contrato *</label>
                  <input
                    type="text"
                    required
                    value={contratoNumero}
                    onChange={(e) => setContratoNumero(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nome da Contraparte (Cliente ou Fornecedor) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Braskem S.A., Petrobras, Suzano..."
                    value={contraparteNome}
                    onChange={(e) => setContraparteNome(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">CNPJ da Contraparte</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={contraparteCnpj}
                    onChange={(e) => setContraparteCnpj(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Período Início *</label>
                  <input
                    type="date"
                    required
                    value={periodoInicio}
                    onChange={(e) => setPeriodoInicio(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Período Fim *</label>
                  <input
                    type="date"
                    required
                    value={periodoFim}
                    onChange={(e) => setPeriodoFim(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Itens da Medição */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">Itens / Serviços Medidos ({itens.length})</h4>
                  <span className="font-bold text-emerald-400 font-mono">
                    Total: {formatCurrency(valorTotalMedido)}
                  </span>
                </div>

                {/* Add Item form */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Descrição do serviço/pesagem..."
                      value={novoItemDesc}
                      onChange={(e) => setNovoItemDesc(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      placeholder="Qtd"
                      step="any"
                      value={novoItemQtd}
                      onChange={(e) => setNovoItemQtd(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={novoItemUn}
                      onChange={(e) => setNovoItemUn(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      <option value="ton">ton</option>
                      <option value="km">km</option>
                      <option value="diária">diária</option>
                      <option value="hora">hora</option>
                      <option value="viagem">viagem</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      placeholder="R$ Unit"
                      step="any"
                      value={novoItemVlrUnit}
                      onChange={(e) => setNovoItemVlrUnit(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="p-1.5 rounded-lg bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Itens List */}
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {itens.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div>
                        <strong className="text-white block">{item.descricao}</strong>
                        <span className="text-[10px] text-slate-400">
                          {item.quantidade} {item.unidade} &times; {formatCurrency(item.valorUnitario)}
                          {item.ticketBalanca ? ` &middot; Balança: ${item.ticketBalanca}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white font-mono">{formatCurrency(item.valorTotal)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Observações do Fechamento</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais, MTRs anexos, regras de retenção contratual..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold transition shadow-lg shadow-ambipar-500/20"
                >
                  Salvar Medição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Conferência & Divergência */}
      {divergenciaModalMedicao && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Conferência & Conciliação de Medição</h3>
                <span className="font-mono text-xs text-ambipar-400">{divergenciaModalMedicao.numeroMedicao}</span>
              </div>
              <button onClick={() => setDivergenciaModalMedicao(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Contraparte:</span>
                <strong className="text-white">{divergenciaModalMedicao.contraparteNome}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Medido pela Ambipar:</span>
                <strong className="text-emerald-400 font-mono">{formatCurrency(divergenciaModalMedicao.valorTotalMedido)}</strong>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Valor Aceito / Aprovado (R$) *</label>
                <input
                  type="number"
                  step="any"
                  value={valorAprovadoInput}
                  onChange={(e) => setValorAprovadoInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              {valorAprovadoInput !== divergenciaModalMedicao.valorTotalMedido && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Divergência / Glosa:</span>
                    <span>{formatCurrency(divergenciaModalMedicao.valorTotalMedido - valorAprovadoInput)}</span>
                  </div>
                  <p className="text-[10px] text-amber-400/80">
                    O valor aceito difere do valor medido originalmente. Registre a justificativa abaixo.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Justificativa / Apontamento de Divergência</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Diferença de pesagem na balança, estadia não aceita, desconto contratual..."
                  value={justificativaInput}
                  onChange={(e) => setJustificativaInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Número da Nota Fiscal (NF-e de Faturamento)</label>
                <input
                  type="text"
                  placeholder="Ex: NF-e 004812"
                  value={nfInput}
                  onChange={(e) => setNfInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  onUpdateMedicaoStatus(
                    divergenciaModalMedicao.id,
                    'Divergência / Em Contestação',
                    valorAprovadoInput,
                    justificativaInput,
                    nfInput
                  );
                  setDivergenciaModalMedicao(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold text-xs"
              >
                Registrar Divergência
              </button>

              <button
                onClick={() => {
                  const novoStatus = nfInput ? 'Faturada / Liquidada' : 'Aprovada';
                  onUpdateMedicaoStatus(
                    divergenciaModalMedicao.id,
                    novoStatus,
                    valorAprovadoInput,
                    justificativaInput,
                    nfInput
                  );
                  setDivergenciaModalMedicao(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
              >
                Aprovar & Conciliar Medição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Visualizador e Impressão de Boletim de Medição (BM) */}
      {selectedMedicaoForBm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:max-h-none print:w-full">
            {/* Top action bar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 print:hidden">
              <span className="text-xs font-bold text-ambipar-400">
                Visualizador de Boletim de Medição Oficial &middot; {selectedMedicaoForBm.numeroMedicao}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-ambipar-500/20 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir BM (PDF)</span>
                </button>
                <button onClick={() => setSelectedMedicaoForBm(null)} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable BM Sheet (A4) */}
            <div className="p-8 overflow-y-auto bg-white text-black font-sans text-[11px] leading-tight print:p-0 print:overflow-visible">
              {/* Header */}
              <div className="border border-black p-3 mb-3 flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-black text-emerald-800 tracking-tight">AMBIPAR LOGISTICS</h1>
                  <p className="text-[10px] font-bold uppercase text-gray-700">BOLETIM DE MEDIÇÃO DE SERVIÇOS LOGÍSTICOS & AMBIENTAIS</p>
                  <p className="text-[9px] text-gray-600">Ambipar Logistics & Environmental Services S.A. &middot; CNPJ: 12.648.266/0001-24</p>
                </div>
                <div className="text-right border-l border-black pl-4">
                  <span className="text-xs font-bold block text-gray-600">BOLETIM Nº</span>
                  <span className="text-sm font-black font-mono block">{selectedMedicaoForBm.numeroMedicao}</span>
                  <span className="text-[9px] block">CONTRATO: {selectedMedicaoForBm.contratoNumero}</span>
                </div>
              </div>

              {/* Dados da Medição */}
              <div className="border border-black p-3 mb-3 grid grid-cols-2 gap-3 text-[9px] bg-gray-50">
                <div>
                  <p><strong>CONTRAPARTE:</strong> {selectedMedicaoForBm.contraparteNome}</p>
                  <p><strong>CNPJ:</strong> {selectedMedicaoForBm.contraparteCnpj}</p>
                  <p><strong>FINALIDADE:</strong> {selectedMedicaoForBm.tipo.toUpperCase()}</p>
                </div>
                <div>
                  <p><strong>PERÍODO DE APURAÇÃO:</strong> {selectedMedicaoForBm.periodoInicio} até {selectedMedicaoForBm.periodoFim}</p>
                  <p><strong>DATA DE EMISSÃO:</strong> {selectedMedicaoForBm.dataEmissao}</p>
                  <p><strong>STATUS CONTRATUAL:</strong> {selectedMedicaoForBm.status.toUpperCase()}</p>
                  {selectedMedicaoForBm.numeroNotaFiscal && (
                    <p><strong>NOTA FISCAL VINCULADA:</strong> {selectedMedicaoForBm.numeroNotaFiscal}</p>
                  )}
                </div>
              </div>

              {/* Tabela de Itens */}
              <div className="border border-black mb-3">
                <table className="w-full text-left text-[9px]">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black font-bold uppercase">
                      <th className="py-1.5 px-2">Item / Descrição do Serviço</th>
                      <th className="py-1.5 px-2 text-center">Qtd</th>
                      <th className="py-1.5 px-2 text-center">Unid.</th>
                      <th className="py-1.5 px-2 text-right">Valor Unitário</th>
                      <th className="py-1.5 px-2 text-right">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {selectedMedicaoForBm.itens.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2">
                          <strong>{it.descricao}</strong>
                          {it.ticketBalanca && <span className="block text-[8px] text-gray-600">Balança Ticket: {it.ticketBalanca} &middot; MTR: {it.numeroMtr}</span>}
                        </td>
                        <td className="py-1.5 px-2 text-center font-mono">{it.quantidade}</td>
                        <td className="py-1.5 px-2 text-center">{it.unidade}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{formatCurrency(it.valorUnitario)}</td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold">{formatCurrency(it.valorTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totais & Divergência */}
              <div className="border border-black p-3 mb-3 bg-gray-50 flex justify-between items-center text-xs">
                <div>
                  {selectedMedicaoForBm.justificativaDivergencia && (
                    <div className="text-[9px] text-gray-700">
                      <strong>OBSERVAÇÃO / DIVERGÊNCIA CONCILIADA:</strong> {selectedMedicaoForBm.justificativaDivergencia}
                    </div>
                  )}
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-[10px] text-gray-600">
                    VALOR TOTAL MEDIDO: <strong>{formatCurrency(selectedMedicaoForBm.valorTotalMedido)}</strong>
                  </div>
                  <div className="text-sm font-black text-emerald-800">
                    VALOR APROVADO: {formatCurrency(selectedMedicaoForBm.valorAprovadoContraparte || selectedMedicaoForBm.valorTotalMedido)}
                  </div>
                </div>
              </div>

              {/* Assinaturas de Aprovação */}
              <div className="border border-black p-4 mt-8 grid grid-cols-2 gap-8 text-[9px] text-center">
                <div className="border-t border-black pt-2">
                  <strong>AMBIPAR LOGISTICS</strong>
                  <p>Carlos Eduardo &middot; Analista de Logística</p>
                </div>
                <div className="border-t border-black pt-2">
                  <strong>CONTRAPARTE (CLIENTE / FORNECEDOR)</strong>
                  <p>Aprovação do Fiscal de Contrato / Medições</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
