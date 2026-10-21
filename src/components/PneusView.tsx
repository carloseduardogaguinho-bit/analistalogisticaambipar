import React, { useState } from 'react';
import {
  Disc,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Download,
  RotateCcw,
  Gauge,
  Ruler,
  TrendingDown,
  DollarSign,
  Layers,
  Wrench,
  Trash2,
  Edit3,
  X,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Pneu, Veiculo, PosicaoEixoPneu, StatusPneu, VidaPneu } from '../types';
import { formatCurrency, formatNumber, getTodayLocalBR } from '../utils/formatters';

interface PneusViewProps {
  pneus: Pneu[];
  veiculos: Veiculo[];
  onAddPneu: (pneu: Pneu) => void;
  onUpdatePneu: (pneu: Pneu) => void;
  onDeletePneu: (id: string) => void;
}

export const PneusView: React.FC<PneusViewProps> = ({
  pneus,
  veiculos,
  onAddPneu,
  onUpdatePneu,
  onDeletePneu,
}) => {
  const [selectedVeiculoPlaca, setSelectedVeiculoPlaca] = useState<string>(
    veiculos[0]?.placa || ''
  );
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPneu, setEditingPneu] = useState<Pneu | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Pneu>>({
    numeroFogo: '',
    numeroSerie: '',
    marca: 'Michelin',
    modelo: 'X Multiway 3D',
    medida: '295/80 R22.5',
    vidaAtual: '1ª Vida (Novo)',
    status: 'Em Uso',
    veiculoPlaca: veiculos[0]?.placa || '',
    posicao: '1E',
    sulcoAtualMm: 14.5,
    sulcoOriginalMm: 15.0,
    pressaoPsi: 110,
    kmAtualPneu: 0,
    kmInstalacao: 0,
    custoAquisicao: 2850,
    custoRecapagens: 0,
    dataAquisicao: getTodayLocalBR(),
    observacoes: '',
  });

  // Métricas de Pneus
  const totalPneus = pneus.length;
  const pneusEmUso = pneus.filter((p) => p.status === 'Em Uso').length;
  const pneusEstoque = pneus.filter((p) => p.status === 'Estoque / Almoxarifado').length;
  const pneusRecapagem = pneus.filter((p) => p.status === 'Em Recapagem').length;

  // Pneus em Alerta (< 3.0mm ou TWI)
  const pneusAlerta = pneus.filter((p) => p.sulcoAtualMm <= 3.5 && p.status === 'Em Uso');
  const pneusCriticos = pneus.filter((p) => p.sulcoAtualMm <= 2.0 && p.status === 'Em Uso');

  // CPK Médio (Custo por Quilômetro): Total Investido / Total Km
  const custoTotalPneus = pneus.reduce(
    (acc, p) => acc + (p.custoAquisicao || 0) + (p.custoRecapagens || 0),
    0
  );
  const kmTotalPneus = pneus.reduce((acc, p) => acc + (p.kmAtualPneu || 0), 0);
  const cpkMedioMilKm = kmTotalPneus > 0 ? (custoTotalPneus / kmTotalPneus) * 1000 : 0;

  // Filtragem da Lista
  const pneusFiltrados = pneus.filter((p) => {
    const q = filtroBusca.toLowerCase();
    const matchesTexto =
      p.numeroFogo.toLowerCase().includes(q) ||
      p.marca.toLowerCase().includes(q) ||
      p.modelo.toLowerCase().includes(q) ||
      (p.veiculoPlaca && p.veiculoPlaca.toLowerCase().includes(q));

    if (!matchesTexto) return false;

    if (filtroStatus === 'em_uso') return p.status === 'Em Uso';
    if (filtroStatus === 'estoque') return p.status === 'Estoque / Almoxarifado';
    if (filtroStatus === 'recapagem') return p.status === 'Em Recapagem';
    if (filtroStatus === 'alerta') return p.sulcoAtualMm <= 3.5;

    return true;
  });

  // Pneus do Veículo Selecionado no Mapa de Eixos
  const pneusDoVeiculo = pneus.filter(
    (p) =>
      p.veiculoPlaca &&
      p.veiculoPlaca.replace(/[^A-Za-z0-9]/g, '').toUpperCase() ===
        selectedVeiculoPlaca.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  );

  const getPneuNaPosicao = (pos: PosicaoEixoPneu) => {
    return pneusDoVeiculo.find((p) => p.posicao === pos);
  };

  // Abrir Modal de Criação / Edição
  const handleOpenModal = (pneu?: Pneu) => {
    if (pneu) {
      setEditingPneu(pneu);
      setFormData(pneu);
    } else {
      setEditingPneu(null);
      setFormData({
        numeroFogo: `AMB-${Math.floor(1000 + Math.random() * 9000)}`,
        numeroSerie: '',
        marca: 'Michelin',
        modelo: 'X Multiway 3D',
        medida: '295/80 R22.5',
        vidaAtual: '1ª Vida (Novo)',
        status: 'Em Uso',
        veiculoPlaca: selectedVeiculoPlaca || veiculos[0]?.placa || '',
        posicao: '1E',
        sulcoAtualMm: 15.0,
        sulcoOriginalMm: 15.0,
        pressaoPsi: 110,
        kmAtualPneu: 0,
        kmInstalacao: 0,
        custoAquisicao: 2850,
        custoRecapagens: 0,
        dataAquisicao: getTodayLocalBR(),
        observacoes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSavePneu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numeroFogo) {
      alert('Por favor, informe o Número de Fogo do Pneu.');
      return;
    }

    if (editingPneu) {
      onUpdatePneu({
        ...editingPneu,
        ...(formData as Pneu),
      });
    } else {
      const novoPneu: Pneu = {
        id: `pneu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        numeroFogo: formData.numeroFogo.toUpperCase(),
        numeroSerie: formData.numeroSerie || '',
        marca: formData.marca || 'Michelin',
        modelo: formData.modelo || '',
        medida: formData.medida || '295/80 R22.5',
        vidaAtual: formData.vidaAtual || '1ª Vida (Novo)',
        status: formData.status || 'Em Uso',
        veiculoPlaca: formData.status === 'Em Uso' ? formData.veiculoPlaca?.toUpperCase() : undefined,
        posicao: formData.status === 'Em Uso' ? formData.posicao : undefined,
        sulcoAtualMm: Number(formData.sulcoAtualMm) || 0,
        sulcoOriginalMm: Number(formData.sulcoOriginalMm) || 15,
        pressaoPsi: Number(formData.pressaoPsi) || 110,
        kmAtualPneu: Number(formData.kmAtualPneu) || 0,
        kmInstalacao: Number(formData.kmInstalacao) || 0,
        custoAquisicao: Number(formData.custoAquisicao) || 0,
        custoRecapagens: Number(formData.custoRecapagens) || 0,
        dataAquisicao: formData.dataAquisicao || getTodayLocalBR(),
        dataUltimaInspecao: getTodayLocalBR(),
        observacoes: formData.observacoes || '',
      };
      onAddPneu(novoPneu);
    }
    setIsModalOpen(false);
  };

  // Exportar Relatório de Pneus para CSV
  const handleExportCSV = () => {
    if (pneus.length === 0) {
      alert('Nenhum pneu para exportar.');
      return;
    }
    const headers = [
      'Numero de Fogo',
      'Marca',
      'Modelo',
      'Medida',
      'Vida Atual',
      'Status',
      'Placa Veiculo',
      'Posicao Eixo',
      'Sulco Atual (mm)',
      'Sulco Original (mm)',
      'Pressao (PSI)',
      'Km Rodados',
      'Custo Aquisicao (R$)',
      'Custo Recapagens (R$)',
      'CPK (R$/1000km)',
    ];

    const rows = pneus.map((p) => {
      const cpk = p.kmAtualPneu > 0 ? ((p.custoAquisicao + p.custoRecapagens) / p.kmAtualPneu) * 1000 : 0;
      return [
        p.numeroFogo,
        p.marca,
        p.modelo,
        p.medida,
        p.vidaAtual,
        p.status,
        p.veiculoPlaca || 'Almoxarifado',
        p.posicao || '-',
        p.sulcoAtualMm,
        p.sulcoOriginalMm,
        p.pressaoPsi || 110,
        p.kmAtualPneu,
        p.custoAquisicao,
        p.custoRecapagens,
        cpk.toFixed(2),
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gestao_Pneus_Ambipar_${getTodayLocalBR()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderizador do Card de Pneu no Mapa de Eixos
  const renderSlotPneu = (pos: PosicaoEixoPneu, label: string) => {
    const pneu = getPneuNaPosicao(pos);

    if (!pneu) {
      return (
        <button
          type="button"
          onClick={() => {
            setEditingPneu(null);
            setFormData((prev) => ({
              ...prev,
              veiculoPlaca: selectedVeiculoPlaca,
              posicao: pos,
              status: 'Em Uso',
            }));
            setIsModalOpen(true);
          }}
          className="w-full p-2.5 rounded-xl border-2 border-dashed border-slate-800 hover:border-ambipar-500/50 bg-slate-950/40 text-slate-500 hover:text-white transition flex flex-col items-center justify-center text-center gap-1 group"
        >
          <Disc className="w-5 h-5 text-slate-700 group-hover:text-ambipar-400 transition" />
          <span className="text-[10px] font-mono font-bold text-slate-400">{pos}</span>
          <span className="text-[9px] text-slate-600 group-hover:text-slate-400">+ Montar</span>
        </button>
      );
    }

    const isAlerta = pneu.sulcoAtualMm <= 3.5;
    const isCritico = pneu.sulcoAtualMm <= 2.0;

    return (
      <div
        onClick={() => handleOpenModal(pneu)}
        className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between shadow-md relative group ${
          isCritico
            ? 'bg-rose-950/30 border-rose-500/50 text-rose-300 hover:border-rose-400'
            : isAlerta
            ? 'bg-amber-950/30 border-amber-500/50 text-amber-300 hover:border-amber-400'
            : 'bg-slate-900 border-slate-700/80 text-slate-200 hover:border-ambipar-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-white font-bold">
            {pos}
          </span>
          <span className="text-[10px] font-mono font-black text-ambipar-400">
            {pneu.numeroFogo}
          </span>
        </div>

        <div className="my-1.5 text-center">
          <span className="text-xs font-bold text-white block truncate">{pneu.marca}</span>
          <span className="text-[10px] text-slate-400 block truncate">{pneu.modelo}</span>
        </div>

        {/* Barra de Sulco em mm */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="text-slate-400">Sulco:</span>
            <span
              className={`font-mono font-black ${
                isCritico ? 'text-rose-400' : isAlerta ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {pneu.sulcoAtualMm.toFixed(1)} mm
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isCritico ? 'bg-rose-500' : isAlerta ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (pneu.sulcoAtualMm / (pneu.sulcoOriginalMm || 15)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
          <span>{pneu.vidaAtual.split(' ')[0]}</span>
          <span className="font-mono">{pneu.pressaoPsi || 110} PSI</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* =========================================================
          1. HEADER DO MÓDULO DE PNEUS
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Disc className="w-6 h-6 text-amber-400" />
              <span>Gestão de Pneus &amp; CPK da Frota Ambipar</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
              2º Maior Custo Operacional
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Controle de número de fogo, profundidade de sulco (mm), rodízio de eixos, recapagens e Custo por Quilômetro (CPK).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 text-xs font-black shadow-lg shadow-ambipar-500/25 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Pneu (Número de Fogo)</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. CARDS DE KPIS EXECUTIVOS DE PNEUS
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total de Pneus */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Frota de Pneus</span>
            <Disc className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{totalPneus}</span>
            <span className="text-xs text-slate-400">pneus cadastrados</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{pneusEmUso} em caminhões</span>
            <span>{pneusEstoque} no estoque</span>
          </div>
        </div>

        {/* KPI 2: Pneus em Risco / Alerta SASSMAQ */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-wider">
            <span>Alerta de Sulco (&le; 3.5mm)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono">
              {pneusAlerta.length}
            </span>
            <span className="text-xs text-slate-400">
              {pneusCriticos.length > 0 ? `(${pneusCriticos.length} críticos TWI)` : 'em atenção'}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
            {pneusCriticos.length > 0 ? (
              <span className="text-rose-400 font-bold">Risco de multa PRF &bull; Troca urgente</span>
            ) : (
              <span className="text-emerald-400 font-medium">Nenhum pneu na lona (seguro)</span>
            )}
          </div>
        </div>

        {/* KPI 3: CPK Médio (R$ por 1.000 km) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-wider">
            <span>CPK Médio da Frota</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              R$ {cpkMedioMilKm > 0 ? cpkMedioMilKm.toFixed(2) : '32.50'}
            </span>
            <span className="text-xs text-slate-400">/ 1.000 km</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Investido: {formatCurrency(custoTotalPneus)}</span>
          </div>
        </div>

        {/* KPI 4: Recapagens & Economia Circular (ESG) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-purple-400 font-bold uppercase tracking-wider">
            <span>Recapagem &amp; ESG</span>
            <RotateCcw className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-300 font-mono">
              {pneus.filter((p) => p.vidaAtual.includes('Recapagem')).length}
            </span>
            <span className="text-xs text-slate-400">pneus recapados</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-purple-400 font-medium">
            Economia média de 60% vs pneu novo
          </div>
        </div>
      </div>

      {/* =========================================================
          3. MAPA VISUAL DE EIXOS DO CAMINHÃO (CHASSI INTERATIVO)
          ========================================================= */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-ambipar-400" />
              <span>Mapa Visual dos Eixos do Caminhão &bull; Disposição de Rodagem</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clique em qualquer posição para inspecionar, medir sulco, realizar rodízio ou trocar o pneu.
            </p>
          </div>

          {/* Seletor de Veículo para o Mapa de Eixos */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Veículo Inspecionado:</span>
            {veiculos.length > 0 ? (
              <select
                value={selectedVeiculoPlaca}
                onChange={(e) => setSelectedVeiculoPlaca(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-ambipar-500"
              >
                {veiculos.map((v) => (
                  <option key={v.id} value={v.placa}>
                    {v.placa} - {v.modelo} ({v.tipoTracao || 'Cavalo'})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-500 font-mono">Nenhum caminhão cadastrado</span>
            )}
          </div>
        </div>

        {/* Diagrama Esquemático dos Eixos do Cavalo Mecânico */}
        <div className="p-6 bg-slate-950/70 rounded-2xl border border-slate-800/80 max-w-3xl mx-auto space-y-6">
          {/* Eixo 1: Dianteiro Direcional (2 Pneus) */}
          <div>
            <div className="text-center mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                1º Eixo &bull; Dianteiro Direcional
              </span>
            </div>
            <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
              <div>{renderSlotPneu('1E', '1E - Diant. Esquerdo')}</div>
              <div>{renderSlotPneu('1D', '1D - Diant. Direito')}</div>
            </div>
          </div>

          {/* Eixo 2: Tração (4 Pneus Duplos) */}
          <div>
            <div className="text-center mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                2º Eixo &bull; Tração Principal (Rodagem Dupla)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto">
              <div>{renderSlotPneu('2EE', '2EE - Ext. Esq.')}</div>
              <div>{renderSlotPneu('2EI', '2EI - Int. Esq.')}</div>
              <div>{renderSlotPneu('2DI', '2DI - Int. Dir.')}</div>
              <div>{renderSlotPneu('2DE', '2DE - Ext. Dir.')}</div>
            </div>
          </div>

          {/* Eixo 3: Truque / Apoio (4 Pneus Duplos) */}
          <div>
            <div className="text-center mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                3º Eixo &bull; Truque Auxiliar (Rodagem Dupla)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto">
              <div>{renderSlotPneu('3EE', '3EE - Ext. Esq.')}</div>
              <div>{renderSlotPneu('3EI', '3EI - Int. Esq.')}</div>
              <div>{renderSlotPneu('3DI', '3DI - Int. Dir.')}</div>
              <div>{renderSlotPneu('3DE', '3DE - Ext. Dir.')}</div>
            </div>
          </div>

          {/* Estepe */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Pneu de Estepe:</span>
            <div className="w-32">{renderSlotPneu('Estepe', 'Estepe')}</div>
          </div>
        </div>
      </div>

      {/* =========================================================
          4. TABELA DE INVENTÁRIO DE PNEUS
          ========================================================= */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Inventário Geral de Pneus Cadastrados ({pneusFiltrados.length})</span>
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por fogo, marca, placa..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-ambipar-500"
              />
            </div>

            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setFiltroStatus('todos')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filtroStatus === 'todos' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('em_uso')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filtroStatus === 'em_uso' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Em Uso
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('estoque')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filtroStatus === 'estoque' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Estoque
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('alerta')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filtroStatus === 'alerta' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'
                }`}
              >
                Alertas
              </button>
            </div>
          </div>
        </div>

        {pneusFiltrados.length === 0 ? (
          <div className="py-12 text-center space-y-2 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-500">
            <Disc className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-400">Nenhum pneu encontrado</p>
            <p className="text-[11px] text-slate-600">
              Cadastre novos pneus com número de fogo para gerenciar o desgaste e o custo por quilômetro.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nº de Fogo</th>
                  <th className="py-3 px-4">Marca &amp; Modelo</th>
                  <th className="py-3 px-4">Medida</th>
                  <th className="py-3 px-4">Veículo / Eixo</th>
                  <th className="py-3 px-4">Vida</th>
                  <th className="py-3 px-4 text-center">Sulco (mm)</th>
                  <th className="py-3 px-4 text-right">Km Rodados</th>
                  <th className="py-3 px-4 text-right">CPK (1.000 km)</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {pneusFiltrados.map((p) => {
                  const cpk =
                    p.kmAtualPneu > 0
                      ? ((p.custoAquisicao + p.custoRecapagens) / p.kmAtualPneu) * 1000
                      : 0;
                  const isCritico = p.sulcoAtualMm <= 2.0;
                  const isAlerta = p.sulcoAtualMm <= 3.5;

                  return (
                    <tr key={p.id} className="hover:bg-slate-850/60 transition">
                      <td className="py-3 px-4 font-mono font-black text-amber-400">
                        {p.numeroFogo}
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-white block">{p.marca}</strong>
                        <span className="text-[11px] text-slate-400">{p.modelo}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">{p.medida}</td>
                      <td className="py-3 px-4">
                        {p.veiculoPlaca ? (
                          <div>
                            <span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.2 rounded">
                              {p.veiculoPlaca}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1.5">
                              Pos: {p.posicao || '-'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Almoxarifado</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                          {p.vidaAtual}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-black text-xs px-2 py-0.5 rounded ${
                            isCritico
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : isAlerta
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {p.sulcoAtualMm.toFixed(1)} mm
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-200">
                        {p.kmAtualPneu.toLocaleString('pt-BR')} km
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {cpk > 0 ? `R$ ${cpk.toFixed(2)}` : '--'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(p)}
                            title="Editar / Medir Sulco"
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja remover o pneu ${p.numeroFogo}?`)) {
                                onDeletePneu(p.id);
                              }
                            }}
                            title="Excluir Pneu"
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================
          5. MODAL DE CADASTRO / INSPEÇÃO DE PNEU
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Disc className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingPneu ? `Editar Pneu ${editingPneu.numeroFogo}` : 'Cadastrar Novo Pneu'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Controle de número de fogo, vida útil e medição milimétrica de sulco.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePneu} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Número de Fogo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: AMB-0412"
                    value={formData.numeroFogo}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroFogo: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Marca do Pneu</label>
                  <select
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Michelin">Michelin</option>
                    <option value="Goodyear">Goodyear</option>
                    <option value="Bridgestone">Bridgestone</option>
                    <option value="Pirelli">Pirelli</option>
                    <option value="Continental">Continental</option>
                    <option value="Dunlop">Dunlop</option>
                    <option value="Outra">Outra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Modelo Comercial</label>
                  <input
                    type="text"
                    placeholder="Ex: X Multiway 3D"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Medida Técnica</label>
                  <input
                    type="text"
                    placeholder="Ex: 295/80 R22.5"
                    value={formData.medida}
                    onChange={(e) => setFormData({ ...formData, medida: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Vida Atual</label>
                  <select
                    value={formData.vidaAtual}
                    onChange={(e) => setFormData({ ...formData, vidaAtual: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="1ª Vida (Novo)">1ª Vida (Novo)</option>
                    <option value="2ª Vida (1ª Recapagem)">2ª Vida (1ª Recapagem)</option>
                    <option value="3ª Vida (2ª Recapagem)">3ª Vida (2ª Recapagem)</option>
                    <option value="Sucateado">Sucateado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status Operacional</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Em Uso">Em Uso no Veículo</option>
                    <option value="Estoque / Almoxarifado">Estoque / Almoxarifado</option>
                    <option value="Em Recapagem">Em Recapagem na Oficina</option>
                    <option value="Descartado / Sucata">Descartado / Sucata</option>
                  </select>
                </div>
              </div>

              {formData.status === 'Em Uso' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Veículo Instalado</label>
                    <select
                      value={formData.veiculoPlaca}
                      onChange={(e) => setFormData({ ...formData, veiculoPlaca: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono font-bold"
                    >
                      <option value="">Selecione a placa...</option>
                      {veiculos.map((v) => (
                        <option key={v.id} value={v.placa}>
                          {v.placa} - {v.modelo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Posição no Eixo</label>
                    <select
                      value={formData.posicao}
                      onChange={(e) =>
                        setFormData({ ...formData, posicao: e.target.value as PosicaoEixoPneu })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono font-bold"
                    >
                      <option value="1E">1E (Diant. Esquerdo)</option>
                      <option value="1D">1D (Diant. Direito)</option>
                      <option value="2EE">2EE (Tração Ext. Esq.)</option>
                      <option value="2EI">2EI (Tração Int. Esq.)</option>
                      <option value="2DI">2DI (Tração Int. Dir.)</option>
                      <option value="2DE">2DE (Tração Ext. Dir.)</option>
                      <option value="3EE">3EE (Truque Ext. Esq.)</option>
                      <option value="3EI">3EI (Truque Int. Esq.)</option>
                      <option value="3DI">3DI (Truque Int. Dir.)</option>
                      <option value="3DE">3DE (Truque Ext. Dir.)</option>
                      <option value="Estepe">Estepe</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sulco Atual (mm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="25"
                    value={formData.sulcoAtualMm}
                    onChange={(e) =>
                      setFormData({ ...formData, sulcoAtualMm: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Limite TWI: 1.6mm</span>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pressão (PSI)</label>
                  <input
                    type="number"
                    value={formData.pressaoPsi}
                    onChange={(e) =>
                      setFormData({ ...formData, pressaoPsi: parseInt(e.target.value) || 110 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Padrão: 110 PSI</span>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Km Rodados</label>
                  <input
                    type="number"
                    value={formData.kmAtualPneu}
                    onChange={(e) =>
                      setFormData({ ...formData, kmAtualPneu: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Para cálculo CPK</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Custo Aquisição (R$)</label>
                  <input
                    type="number"
                    value={formData.custoAquisicao}
                    onChange={(e) =>
                      setFormData({ ...formData, custoAquisicao: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Custo Recapagens (R$)</label>
                  <input
                    type="number"
                    value={formData.custoRecapagens}
                    onChange={(e) =>
                      setFormData({ ...formData, custoRecapagens: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-black shadow-lg shadow-ambipar-500/25 transition"
                >
                  {editingPneu ? 'Salvar Alterações' : 'Cadastrar Pneu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
