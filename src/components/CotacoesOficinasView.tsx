import React, { useState } from 'react';
import { CotacaoManutencao, PropostaOficina, Veiculo, StatusCotacao, Manutencao } from '../types';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Award,
  Clock,
  Building,
  Check,
  X,
  AlertCircle,
  Truck,
  Sparkles,
  PhoneCall,
  Calendar,
  Layers
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/formatters';

interface CotacoesOficinasViewProps {
  cotacoes: CotacaoManutencao[];
  veiculos: Veiculo[];
  onAddCotacao: (cotacao: CotacaoManutencao) => void;
  onAddProposta: (cotacaoId: string, proposta: PropostaOficina) => void;
  onAprovarCotacao: (cotacaoId: string, propostaId: string, motivo: string) => void;
}

export const CotacoesOficinasView: React.FC<CotacoesOficinasViewProps> = ({
  cotacoes,
  veiculos,
  onAddCotacao,
  onAddProposta,
  onAprovarCotacao,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');
  const [isNovaCotacaoModalOpen, setIsNovaCotacaoModalOpen] = useState(false);
  const [selectedCotacaoParaProposta, setSelectedCotacaoParaProposta] = useState<CotacaoManutencao | null>(null);

  // Form State Nova Cotação
  const [veiculoPlaca, setVeiculoPlaca] = useState(veiculos[0]?.placa || '');
  const [tipoServico, setTipoServico] = useState('Sistema de Freios');
  const [descricaoNecessidade, setDescricaoNecessidade] = useState('');
  const [dataLimiteResposta, setDataLimiteResposta] = useState(
    new Date(Date.now() + 3 * 86400 * 1000).toISOString().slice(0, 10)
  );

  // Form State Nova Proposta
  const [oficinaNome, setOficinaNome] = useState('');
  const [oficinaCidade, setOficinaCidade] = useState('Campinas / Região');
  const [telefoneContato, setTelefoneContato] = useState('(19) 3000-0000');
  const [valorPecas, setValorPecas] = useState<number>(0);
  const [valorMaoDeObra, setValorMaoDeObra] = useState<number>(0);
  const [prazoDias, setPrazoDias] = useState<number>(2);
  const [condicaoPagamento, setCondicaoPagamento] = useState('Boleto Faturado 30 dias');
  const [garantiaMeses, setGarantiaMeses] = useState<number>(6);
  const [propostaObservacoes, setPropostaObservacoes] = useState('');

  // Handle Nova Cotação
  const handleSaveCotacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!veiculoPlaca || !descricaoNecessidade) {
      alert('Selecione o veículo e descreva a necessidade.');
      return;
    }

    const veic = veiculos.find((v) => v.placa === veiculoPlaca);

    const newCotacao: CotacaoManutencao = {
      id: `cot-${Date.now()}`,
      codigoCotacao: `COT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      veiculoPlaca,
      modeloVeiculo: veic?.modelo || 'Caminhão Pesado',
      tipoServico,
      descricaoNecessidade,
      kmAtualVeiculo: veic?.odometroAtualKm || 50000,
      dataAbertura: new Date().toISOString().slice(0, 10),
      dataLimiteResposta,
      status: 'Aberta (Em Cotação)',
      propostas: [],
      responsavelCotacao: 'Carlos Eduardo (Analista Logística)',
    };

    onAddCotacao(newCotacao);
    setIsNovaCotacaoModalOpen(false);
    setDescricaoNecessidade('');
  };

  // Handle Adicionar Proposta
  const handleSaveProposta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCotacaoParaProposta || !oficinaNome) return;

    const valorTotal = (Number(valorPecas) || 0) + (Number(valorMaoDeObra) || 0);

    const newProposta: PropostaOficina = {
      id: `prop-${Date.now()}`,
      oficinaNome,
      oficinaCidade,
      telefoneContato,
      valorPecas: Number(valorPecas) || 0,
      valorMaoDeObra: Number(valorMaoDeObra) || 0,
      valorTotal,
      prazoDias: Number(prazoDias) || 1,
      condicaoPagamento,
      garantiaMeses: Number(garantiaMeses) || 3,
      observacoes: propostaObservacoes,
    };

    onAddProposta(selectedCotacaoParaProposta.id, newProposta);
    setSelectedCotacaoParaProposta(null);
    // Reset
    setOficinaNome('');
    setValorPecas(0);
    setValorMaoDeObra(0);
  };

  // Metrics
  const totalSavingReais = cotacoes.reduce((acc, c) => acc + (c.economiaSavingReais || 0), 0);
  const emCotacaoCount = cotacoes.filter((c) => c.status === 'Aberta (Em Cotação)').length;
  const aprovadasCount = cotacoes.filter((c) => c.status === 'Aprovada (Gerou OS)').length;

  const filteredCotacoes = cotacoes.filter((c) => {
    const matchesSearch =
      c.codigoCotacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.veiculoPlaca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tipoServico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.propostas.some((p) => p.oficinaNome.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'TODAS' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-ambipar-400" />
            <span>Cotações com Oficinas & Gestão de Melhores Preços (Saving)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mapeamento de fornecedores mecânicos, disputa de preços entre oficinas credenciadas, cálculo automático de saving e geração de OS.
          </p>
        </div>

        <button
          onClick={() => setIsNovaCotacaoModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Cotação de Oficina</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Saving Total Gerado</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">
            {formatCurrency(totalSavingReais)}
          </div>
          <p className="text-[10px] text-slate-500">Economia negociada com oficinas</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Cotações em Andamento</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">
            {emCotacaoCount} <span className="text-xs font-normal text-slate-400">processos</span>
          </div>
          <p className="text-[10px] text-slate-500">Aguardando orçamentos</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Ordens de Serviço Aprovadas</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white">
            {aprovadasCount} <span className="text-xs font-normal text-slate-400">de {cotacoes.length}</span>
          </div>
          <p className="text-[10px] text-slate-500">Com menores preços homologados</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Meta de Saving Frota</span>
            <Award className="w-4 h-4 text-ambipar-400" />
          </div>
          <div className="text-xl font-black text-ambipar-400">
            18.5% <span className="text-xs font-normal text-emerald-400">Meta: 15%</span>
          </div>
          <p className="text-[10px] text-slate-500">Eficiência de compras corporativa</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por código da cotação, placa, serviço ou oficina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {['TODAS', 'Aberta (Em Cotação)', 'Aprovada (Gerou OS)'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-ambipar-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Cotacoes List */}
      <div className="space-y-4">
        {filteredCotacoes.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
            Nenhuma cotação de oficina encontrada. Clique em "Nova Cotação de Oficina" para iniciar uma cotação com múltiplos concorrentes.
          </div>
        ) : (
          filteredCotacoes.map((cotacao) => {
            const isAprovada = cotacao.status === 'Aprovada (Gerou OS)';
            const sortedPropostas = [...cotacao.propostas].sort((a, b) => a.valorTotal - b.valorTotal);
            const menorPreco = sortedPropostas[0]?.valorTotal;
            const maiorPreco = sortedPropostas[sortedPropostas.length - 1]?.valorTotal;
            const saving = maiorPreco && menorPreco && sortedPropostas.length > 1 ? maiorPreco - menorPreco : 0;

            return (
              <div
                key={cotacao.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm hover:border-slate-700/80 transition"
              >
                {/* Header da Cotação */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-ambipar-400 font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {cotacao.codigoCotacao} &middot; {cotacao.veiculoPlaca}
                        </span>
                        <span className="text-xs text-slate-400">({cotacao.modeloVeiculo})</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isAprovada
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {cotacao.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-semibold mt-0.5">
                        {cotacao.tipoServico}: <span className="font-normal text-slate-400">{cotacao.descricaoNecessidade}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isAprovada && (
                      <button
                        onClick={() => setSelectedCotacaoParaProposta(cotacao)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Orçamento de Oficina</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid de Propostas / Comparativo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-cyan-400" />
                      Orçamentos Recebidos ({cotacao.propostas.length} oficinas concorrentes)
                    </span>

                    {saving > 0 && (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Economia / Saving de {formatCurrency(saving)} ({Math.round((saving / maiorPreco) * 100)}%)
                      </span>
                    )}
                  </div>

                  {cotacao.propostas.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                      Nenhum orçamento cadastrado para esta cotação ainda. Clique em "Adicionar Orçamento de Oficina" para registrar os preços recebidos.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {sortedPropostas.map((proposta, idx) => {
                        const isMenor = idx === 0 && sortedPropostas.length > 1;
                        const isGanhadora = proposta.id === cotacao.propostaVencedoraId || proposta.isVencedora;

                        return (
                          <div
                            key={proposta.id}
                            className={`p-3.5 rounded-xl border flex flex-col justify-between transition ${
                              isGanhadora
                                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                : isMenor
                                ? 'bg-slate-950/80 border-cyan-500/40'
                                : 'bg-slate-950/40 border-slate-800'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <strong className="text-white text-xs block">{proposta.oficinaNome}</strong>
                                  <span className="text-[10px] text-slate-400">{proposta.oficinaCidade} &middot; {proposta.telefoneContato}</span>
                                </div>
                                {isGanhadora ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase">
                                    Aprovada
                                  </span>
                                ) : isMenor ? (
                                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[9px] font-black uppercase">
                                    Menor Preço
                                  </span>
                                ) : null}
                              </div>

                              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                                <div className="flex justify-between text-slate-400">
                                  <span>Peças:</span>
                                  <span className="font-mono text-white">{formatCurrency(proposta.valorPecas)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                  <span>Mão de Obra:</span>
                                  <span className="font-mono text-white">{formatCurrency(proposta.valorMaoDeObra)}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t border-slate-800 pt-1 text-xs">
                                  <span className="text-slate-200">Total:</span>
                                  <span className="font-mono text-emerald-400 text-sm">{formatCurrency(proposta.valorTotal)}</span>
                                </div>
                              </div>

                              <div className="text-[10px] text-slate-400 space-y-0.5">
                                <p><strong>Prazo:</strong> {proposta.prazoDias} dia(s) úteis de parada</p>
                                <p><strong>Pagamento:</strong> {proposta.condicaoPagamento}</p>
                                <p><strong>Garantia:</strong> {proposta.garantiaMeses} meses</p>
                              </div>
                            </div>

                            {!isAprovada && (
                              <button
                                onClick={() => {
                                  const motivo = prompt('Informe a justificativa de escolha desta oficina (ex: Menor preço e menor prazo):', 'Menor preço homologado com garantia');
                                  if (motivo) {
                                    onAprovarCotacao(cotacao.id, proposta.id, motivo);
                                  }
                                }}
                                className="w-full mt-3 py-1.5 rounded-lg bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Aprovar & Gerar OS</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nova Cotação */}
      {isNovaCotacaoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Nova Cotação de Manutenção</h3>
                <p className="text-[11px] text-slate-400">Abrir solicitação de orçamento com oficinas mecânicas concorrentes.</p>
              </div>
              <button onClick={() => setIsNovaCotacaoModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCotacao} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Veículo / Placa *</label>
                <select
                  value={veiculoPlaca}
                  onChange={(e) => setVeiculoPlaca(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                >
                  {veiculos.map((v) => (
                    <option key={v.id} value={v.placa}>
                      {v.placa} &middot; {v.modelo} ({formatNumber(v.odometroAtualKm, 0)} km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tipo de Serviço *</label>
                <select
                  value={tipoServico}
                  onChange={(e) => setTipoServico(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                >
                  <option value="Sistema de Freios">Sistema de Freios (Lonas, Discos, Válvula)</option>
                  <option value="Kit de Embreagem">Kit de Embreagem & Platô</option>
                  <option value="Pneus & Recapagem">Pneus, Alinhamento & Recapagem</option>
                  <option value="Suspensão & Bolsas de Ar">Suspensão, Molas & Bolsas de Ar</option>
                  <option value="Revisão Motor & Bicos">Motor, Turbina & Bicos Injetores</option>
                  <option value="Autoelétrica & Alternador">Autoelétrica, Baterias & Motor de Partida</option>
                  <option value="Inspeção Tanque CIV/CIPP">Inspeção do Tanque / Válvulas CIV/CIPP</option>
                  <option value="Tacógrafo & Calibração">Aferição de Tacógrafo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descrição Detalhada da Avaria / Peças *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Troca completa do jogo de lonas dos 3 eixos, retífica dos tambores e substituição da cuíca de freio..."
                  value={descricaoNecessidade}
                  onChange={(e) => setDescricaoNecessidade(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Data Limite de Resposta das Oficinas</label>
                <input
                  type="date"
                  value={dataLimiteResposta}
                  onChange={(e) => setDataLimiteResposta(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNovaCotacaoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold transition shadow-lg shadow-ambipar-500/20"
                >
                  Criar Cotação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Proposta de Oficina */}
      {selectedCotacaoParaProposta && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Cadastrar Orçamento de Oficina</h3>
                <span className="font-mono text-xs text-ambipar-400">
                  {selectedCotacaoParaProposta.codigoCotacao} &middot; {selectedCotacaoParaProposta.veiculoPlaca}
                </span>
              </div>
              <button onClick={() => setSelectedCotacaoParaProposta(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProposta} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Nome da Oficina / Concessionária *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Scania Codema, Truck Diesel Paulínia..."
                    value={oficinaNome}
                    onChange={(e) => setOficinaNome(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Cidade / Região</label>
                  <input
                    type="text"
                    value={oficinaCidade}
                    onChange={(e) => setOficinaCidade(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Telefone / Contato</label>
                  <input
                    type="text"
                    value={telefoneContato}
                    onChange={(e) => setTelefoneContato(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Valor das Peças (R$)</label>
                  <input
                    type="number"
                    step="any"
                    value={valorPecas}
                    onChange={(e) => setValorPecas(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Valor da Mão de Obra (R$)</label>
                  <input
                    type="number"
                    step="any"
                    value={valorMaoDeObra}
                    onChange={(e) => setValorMaoDeObra(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="col-span-2 flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="font-bold text-white">Valor Total da Proposta:</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {formatCurrency((Number(valorPecas) || 0) + (Number(valorMaoDeObra) || 0))}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Prazo (Dias)</label>
                  <input
                    type="number"
                    value={prazoDias}
                    onChange={(e) => setPrazoDias(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Garantia (Meses)</label>
                  <input
                    type="number"
                    value={garantiaMeses}
                    onChange={(e) => setGarantiaMeses(parseInt(e.target.value) || 3)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Condição Pgto</label>
                  <input
                    type="text"
                    value={condicaoPagamento}
                    onChange={(e) => setCondicaoPagamento(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCotacaoParaProposta(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold transition shadow-lg shadow-ambipar-500/20"
                >
                  Salvar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
