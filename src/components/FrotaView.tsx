import React, { useState } from 'react';
import {
  Veiculo,
  TipoEquipamento,
  TipoCombustivel,
  StatusVeiculo,
  TipoPropriedadeVeiculo,
  TipoTracaoVeiculo,
} from '../types';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Wrench,
  Gauge,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  MapPin,
  Tag,
  ShieldCheck,
  Download,
  Printer,
  Edit2,
  Trash2,
  Eye,
  Award,
  AlertOctagon,
  Fuel,
  Activity,
  HardHat,
  FileText,
  Check,
  DollarSign,
  Layers,
  Sparkles,
  Building,
  UserCheck,
  Scale
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

interface FrotaViewProps {
  veiculos: Veiculo[];
  onAddVeiculo: (veiculo: Veiculo) => void;
  onUpdateVeiculo?: (veiculo: Veiculo) => void;
  onDeleteVeiculo?: (id: string) => void;
  onUpdateVeiculoStatus: (id: string, status: StatusVeiculo) => void;
}

const EQUIPAMENTOS: TipoEquipamento[] = [
  'Carreta Tanque Inox',
  'Roll-on / Roll-off',
  'Poliguindaste Duplo',
  'Carreta Baú Carga Seca',
  'Sider Especial',
  'VUC Coleta Urbana',
  'Veículo Rápido Emergência',
  'Tanque Sucção a Vácuo',
  'Prancha Carrega-Tudo',
];

const COMBUSTIVEIS: TipoCombustivel[] = [
  'Diesel S10',
  'HVO (Diesel Verde)',
  '100% Elétrico',
  'GNV',
  'Biodiesel B20',
];

const TRACCOES: TipoTracaoVeiculo[] = [
  '4x2 (Toco)',
  '6x2 (Trucado)',
  '6x4 (Traçado)',
  '8x2 (Bitruck)',
  'Semirreboque / Carreta',
];

const PROPRIEDADES: TipoPropriedadeVeiculo[] = [
  'Frota Própria Ambipar',
  'Locado / Leasing',
  'Terceiro / Agregado',
];

export const FrotaView: React.FC<FrotaViewProps> = ({
  veiculos,
  onAddVeiculo,
  onUpdateVeiculo,
  onDeleteVeiculo,
  onUpdateVeiculoStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterEquipamento, setFilterEquipamento] = useState<string>('TODOS');
  const [filterPropriedade, setFilterPropriedade] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'cards' | 'tabela'>('cards');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dossieVeiculo, setDossieVeiculo] = useState<Veiculo | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'veiculo' | 'implemento' | 'manutencao' | 'laudos'>('veiculo');

  // Form State
  const initialFormState: Partial<Veiculo> = {
    placa: '',
    modelo: '',
    marca: 'Scania',
    ano: 2024,
    anoModelo: 2024,
    chassi: '',
    renavam: '',
    cor: 'Branco Ambipar',
    tipoTracao: '6x2 (Trucado)',
    tipoEquipamento: 'Roll-on / Roll-off',
    tipoPropriedade: 'Frota Própria Ambipar',
    baseOperacional: 'Base Central Paulínia/Campinas',
    motoristaTitularNome: '',
    capacidadeCargaTon: 25,
    volumeTanqueM3: 35,
    materialTanque: 'Inox 316L',
    odometroAtualKm: 50000,
    status: 'Disponível',
    proximaRevisaoKm: 60000,
    dataUltimaRevisao: new Date().toISOString().slice(0, 10),
    scoreSaudeMecanica: 95,
    tipoCombustivelPadrao: 'HVO (Diesel Verde)',
    mediaConsumoMeta: 2.65,
    numeroCiv: `CIV-SP-${Math.floor(10000 + Math.random() * 90000)}`,
    validadeCiv: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    numeroCipp: `CIPP-INM-${Math.floor(10000 + Math.random() * 90000)}`,
    validadeCipp: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    numeroCronotacografo: `TAC-INM-${Math.floor(100000 + Math.random() * 900000)}`,
    validadeCronotacografo: new Date(Date.now() + 730 * 86400 * 1000).toISOString().slice(0, 10),
    licencaAmbientalTransporte: 'CETESB LO 45009182',
    validadeLicencaAmbiental: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    apoliceSeguro: 'AP-AMB-2026-904',
    seguradoraNome: 'Porto Seguro Cargas / Ambiental',
    validadeSeguro: new Date(Date.now() + 365 * 86400 * 1000).toISOString().slice(0, 10),
    observacoes: '',
  };

  const [formData, setFormData] = useState<Partial<Veiculo>>(initialFormState);

  // Helper: cálculo de dias para vencimento de laudos
  const getLaudoMeta = (dateStr?: string) => {
    if (!dateStr) return { label: 'Não informado', status: 'neutro', days: null, badgeClass: 'text-slate-500 bg-slate-800/40 border-slate-700' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Vencido há ${Math.abs(diffDays)}d`,
        status: 'vencido',
        days: diffDays,
        badgeClass: 'text-rose-400 bg-rose-500/15 border-rose-500/40 font-bold',
      };
    }
    if (diffDays <= 30) {
      return {
        label: `Vence em ${diffDays}d`,
        status: 'alerta',
        days: diffDays,
        badgeClass: 'text-amber-400 bg-amber-500/15 border-amber-500/40 font-bold',
      };
    }
    return {
      label: `Regular (${diffDays}d)`,
      status: 'ok',
      days: diffDays,
      badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-medium',
    };
  };

  // Veículo tem laudo crítico vencido? (CIV ou CIPP vencidos impedem circulação de produtos perigosos)
  const hasCriticalExpiredLaudo = (v: Veiculo) => {
    const civ = getLaudoMeta(v.validadeCiv);
    const cipp = getLaudoMeta(v.validadeCipp);
    return civ.status === 'vencido' || cipp.status === 'vencido';
  };

  // Veículo tem revisão iminente? (< 3.000 km)
  const isRevisaoProxima = (v: Veiculo) => {
    const diffKm = v.proximaRevisaoKm - v.odometroAtualKm;
    return diffKm <= 3000;
  };

  // Filtros
  const filtered = veiculos.filter((v) => {
    const matchesSearch =
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.chassi && v.chassi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.renavam && v.renavam.includes(searchTerm)) ||
      v.baseOperacional.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.motoristaTitularNome && v.motoristaTitularNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      v.tipoEquipamento.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === 'Disponível') matchesStatus = v.status === 'Disponível';
    else if (filterStatus === 'Em Viagem') matchesStatus = v.status === 'Em Viagem';
    else if (filterStatus === 'Em Manutenção') matchesStatus = v.status === 'Em Manutenção';
    else if (filterStatus === 'Inativo') matchesStatus = v.status === 'Inativo';
    else if (filterStatus === 'Alerta Revisão/Laudo') matchesStatus = isRevisaoProxima(v) || hasCriticalExpiredLaudo(v);

    let matchesEquipamento = true;
    if (filterEquipamento !== 'TODOS') matchesEquipamento = v.tipoEquipamento === filterEquipamento;

    let matchesPropriedade = true;
    if (filterPropriedade !== 'TODOS') matchesPropriedade = v.tipoPropriedade === filterPropriedade;

    return matchesSearch && matchesStatus && matchesEquipamento && matchesPropriedade;
  });

  // KPIs
  const totalVeiculos = veiculos.length;
  const disponiveisCount = veiculos.filter((v) => v.status === 'Disponível').length;
  const emViagemCount = veiculos.filter((v) => v.status === 'Em Viagem').length;
  const emManutencaoCount = veiculos.filter((v) => v.status === 'Em Manutenção').length;
  const revisaoUrgenteCount = veiculos.filter((v) => isRevisaoProxima(v)).length;
  const laudosVencidosCount = veiculos.filter((v) => hasCriticalExpiredLaudo(v)).length;
  const frotaPropriaCount = veiculos.filter((v) => (v.tipoPropriedade || 'Frota Própria Ambipar') === 'Frota Própria Ambipar').length;

  const taxaDisponibilidade = totalVeiculos > 0 ? Math.round((disponiveisCount / totalVeiculos) * 100) : 100;

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setActiveFormTab('veiculo');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: Veiculo) => {
    setEditingId(v.id);
    setFormData({ ...v });
    setActiveFormTab('veiculo');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa || !formData.modelo) {
      alert('Preencha os campos obrigatórios: Placa e Modelo do veículo.');
      return;
    }

    if (editingId) {
      // Edit
      const updatedVeic: Veiculo = {
        ...(formData as Veiculo),
        id: editingId,
        placa: formData.placa.toUpperCase().trim(),
      };
      if (onUpdateVeiculo) {
        onUpdateVeiculo(updatedVeic);
      } else {
        onAddVeiculo(updatedVeic);
      }
    } else {
      // Create
      const newVeic: Veiculo = {
        ...(formData as Veiculo),
        id: `veic-${Date.now()}`,
        placa: formData.placa.toUpperCase().trim(),
        modelo: formData.modelo.trim(),
        marca: formData.marca || 'Ambipar Fleet',
        ano: Number(formData.ano) || 2024,
        anoModelo: Number(formData.anoModelo) || Number(formData.ano) || 2024,
        tipoEquipamento: formData.tipoEquipamento as TipoEquipamento,
        tipoPropriedade: formData.tipoPropriedade as TipoPropriedadeVeiculo,
        baseOperacional: formData.baseOperacional || 'Base Operacional Paulínia',
        odometroAtualKm: Number(formData.odometroAtualKm) || 0,
        capacidadeCargaTon: Number(formData.capacidadeCargaTon) || 15,
        status: (formData.status as StatusVeiculo) || 'Disponível',
        proximaRevisaoKm: Number(formData.proximaRevisaoKm) || 10000,
        tipoCombustivelPadrao: formData.tipoCombustivelPadrao as TipoCombustivel,
        dataUltimaRevisao: formData.dataUltimaRevisao || new Date().toISOString().slice(0, 10),
      };
      onAddVeiculo(newVeic);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, placa: string) => {
    if (confirm(`Deseja realmente excluir o veículo placa ${placa} da frota? Esta ação removerá o prontuário patrimonial.`)) {
      if (onDeleteVeiculo) {
        onDeleteVeiculo(id);
      }
    }
  };

  // Exportar Frota em CSV
  const handleExportCsv = () => {
    if (veiculos.length === 0) {
      alert('Nenhum veículo cadastrado na frota para exportar.');
      return;
    }

    const headers = [
      'Placa',
      'Marca',
      'Modelo',
      'Ano Fabricacao',
      'Ano Modelo',
      'Chassi',
      'Renavam',
      'Tracao',
      'Equipamento Implemento',
      'Propriedade',
      'Base Operacional',
      'Motorista Titular',
      'Capacidade Carga Ton',
      'Volume Tanque M3',
      'Odometro Atual Km',
      'Proxima Revisao Km',
      'Status Operacional',
      'Combustivel Padrao',
      'Numero CIV',
      'Validade CIV',
      'Numero CIPP',
      'Validade CIPP',
      'Tacografo Validade',
      'Seguro Validade',
    ];

    const rows = veiculos.map((v) => [
      `"${v.placa}"`,
      `"${v.marca}"`,
      `"${v.modelo}"`,
      `"${v.ano}"`,
      `"${v.anoModelo || v.ano}"`,
      `"${v.chassi || ''}"`,
      `"${v.renavam || ''}"`,
      `"${v.tipoTracao || '6x2'}"`,
      `"${v.tipoEquipamento}"`,
      `"${v.tipoPropriedade || 'Frota Própria Ambipar'}"`,
      `"${v.baseOperacional}"`,
      `"${v.motoristaTitularNome || 'Rotativo'}"`,
      `"${v.capacidadeCargaTon}"`,
      `"${v.volumeTanqueM3 || 0}"`,
      `"${v.odometroAtualKm}"`,
      `"${v.proximaRevisaoKm}"`,
      `"${v.status}"`,
      `"${v.tipoCombustivelPadrao}"`,
      `"${v.numeroCiv || ''}"`,
      `"${v.validadeCiv || ''}"`,
      `"${v.numeroCipp || ''}"`,
      `"${v.validadeCipp || ''}"`,
      `"${v.validadeCronotacografo || ''}"`,
      `"${v.validadeSeguro || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ambipar_Frota_Patrimonio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-ambipar-400" />
            <span>Controle, Cadastro & Gestão Patrimonial da Frota de Veículos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestão técnica de cavalos mecânicos, carretas tanques inox, implementos roll-on, laudos CIV/CIPP e conformidade SASSMAQ Ambipar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Exportar inventário patrimonial da frota em CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-ambipar-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Veículo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Visão Patrimonial & Disponibilidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Frota Total Cadastrada</span>
            <Truck className="w-4 h-4 text-ambipar-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalVeiculos}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">{frotaPropriaCount} Próprios</span>
            <span>&bull;</span>
            <span>{totalVeiculos - frotaPropriaCount} Locados/Terc.</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Disponíveis para Carga</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{disponiveisCount}</div>
          <div className="text-[11px] text-slate-500">
            <span className="text-emerald-400 font-bold">{taxaDisponibilidade}%</span> da frota apta para escala imediata
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Em Viagem / Operação</span>
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{emViagemCount}</div>
          <div className="text-[11px] text-slate-500">Caminhões em rota com MTR/CT-e</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Em Manutenção</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{emManutencaoCount}</div>
          <div className="text-[11px] text-slate-500">Ordens de serviço abertas em oficina</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Alertas de Laudos / Revisão</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className={`text-2xl font-black ${laudosVencidosCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
            {laudosVencidosCount + revisaoUrgenteCount}
          </div>
          <div className="text-[11px] text-slate-500">
            {laudosVencidosCount > 0 ? (
              <span className="text-rose-400 font-bold">{laudosVencidosCount} laudo(s) CIV/CIPP vencido(s)!</span>
            ) : revisaoUrgenteCount > 0 ? (
              <span className="text-amber-400 font-bold">{revisaoUrgenteCount} revisão(ões) iminente(s)</span>
            ) : (
              '100% da frota regularizada'
            )}
          </div>
        </div>
      </div>

      {/* Filter and View Switcher Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por placa, modelo, marca, chassi, renavam, base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ambipar-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Status: Todos</option>
              <option value="Disponível" className="bg-slate-900 text-emerald-400">Disponível para Carga</option>
              <option value="Em Viagem" className="bg-slate-900 text-blue-400">Em Viagem / Trânsito</option>
              <option value="Em Manutenção" className="bg-slate-900 text-amber-400">Em Oficina / Manutenção</option>
              <option value="Alerta Revisão/Laudo" className="bg-slate-900 text-rose-400">Alertas (Revisão ou CIV/CIPP)</option>
              <option value="Inativo" className="bg-slate-900 text-slate-400">Inativo / Reserva</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <span className="text-slate-400 font-medium">Equip:</span>
            <select
              value={filterEquipamento}
              onChange={(e) => setFilterEquipamento(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todos Equipamentos</option>
              {EQUIPAMENTOS.map((eq) => (
                <option key={eq} value={eq} className="bg-slate-900 text-white">{eq}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <span className="text-slate-400 font-medium">Propriedade:</span>
            <select
              value={filterPropriedade}
              onChange={(e) => setFilterPropriedade(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todas Propriedades</option>
              {PROPRIEDADES.map((pr) => (
                <option key={pr} value={pr} className="bg-slate-900 text-white">{pr}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl p-0.5 ml-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'cards' ? 'bg-ambipar-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('tabela')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'tabela' ? 'bg-ambipar-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tabela Patrimonial
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Truck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhum veículo encontrado na frota</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'TODOS'
              ? 'Nenhum caminhão atende aos critérios de pesquisa ou filtros selecionados.'
              : 'Cadastre os cavalos mecânicos, carretas tanques inox, roll-on e poliguindastes para iniciar a gestão de frota.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Veículo</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Grid of Vehicle Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v) => {
            const kmParaRevisao = v.proximaRevisaoKm - v.odometroAtualKm;
            const alertaRevisao = kmParaRevisao <= 3000;
            const revisaoVencida = kmParaRevisao <= 0;
            const isBlocked = hasCriticalExpiredLaudo(v);
            const civMeta = getLaudoMeta(v.validadeCiv);
            const cippMeta = getLaudoMeta(v.validadeCipp);

            // Revisao progress percentage
            const odoBase = Math.max(0, v.proximaRevisaoKm - 15000);
            const progressoRevisao = Math.min(100, Math.max(0, Math.round(((v.odometroAtualKm - odoBase) / 15000) * 100)));

            return (
              <div
                key={v.id}
                className={`p-5 rounded-2xl bg-slate-900 border transition shadow-sm space-y-4 flex flex-col justify-between ${
                  isBlocked
                    ? 'border-rose-500/50 bg-gradient-to-b from-rose-950/20 to-slate-900'
                    : alertaRevisao
                    ? 'border-amber-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Bar: Placa, Ano, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 tracking-wider">
                          {v.placa}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {v.ano}/{v.anoModelo || v.ano}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-800/80 text-amber-400">
                          {v.tipoTracao || '6x2'}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-xs mt-1.5 flex items-center gap-1.5">
                        <span>{v.marca} {v.modelo}</span>
                      </h4>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="text-ambipar-400 font-semibold">{v.tipoEquipamento}</span>
                        <span>&bull;</span>
                        <span>{v.tipoPropriedade || 'Frota Própria'}</span>
                      </div>
                    </div>

                    <select
                      value={v.status}
                      onChange={(e) => onUpdateVeiculoStatus(v.id, e.target.value as StatusVeiculo)}
                      className={`text-[10px] font-bold rounded-lg px-2.5 py-1 border bg-slate-950 focus:outline-none cursor-pointer ${
                        v.status === 'Disponível'
                          ? 'text-emerald-400 border-emerald-500/40'
                          : v.status === 'Em Viagem'
                          ? 'text-blue-400 border-blue-500/40'
                          : v.status === 'Em Manutenção'
                          ? 'text-amber-400 border-amber-500/40'
                          : 'text-slate-400 border-slate-700'
                      }`}
                    >
                      <option value="Disponível">Disponível</option>
                      <option value="Em Viagem">Em Viagem</option>
                      <option value="Em Manutenção">Em Manutenção</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>

                  {/* Impediment Alert if CIV/CIPP expired */}
                  {isBlocked && (
                    <div className="mt-3 p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center gap-2 text-[11px] text-rose-300 font-semibold animate-pulse">
                      <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Impedido: Laudo CIV ou CIPP vencido para produtos perigosos!</span>
                    </div>
                  )}

                  {/* Operational Details Grid */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Capacidade Carga</span>
                      <strong className="text-white text-xs font-mono">{v.capacidadeCargaTon} Ton</strong>
                      {v.volumeTanqueM3 && (
                        <span className="text-[10px] text-slate-400 block">({v.volumeTanqueM3} m³ - {v.materialTanque || 'Inox'})</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Combustível Padrão</span>
                      <strong className="text-emerald-400 text-xs font-semibold">{v.tipoCombustivelPadrao}</strong>
                      <span className="text-[10px] text-slate-400 block">Meta: {v.mediaConsumoMeta ? `${v.mediaConsumoMeta.toFixed(2)} km/L` : '2.65 km/L'}</span>
                    </div>

                    <div className="col-span-2 pt-1.5 border-t border-slate-800/80 flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Base Alocada:</span>
                      <strong className="text-slate-200">{v.baseOperacional}</strong>
                    </div>

                    {v.motoristaTitularNome && (
                      <div className="col-span-2 flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Motorista Titular:</span>
                        <strong className="text-ambipar-400 font-bold">{v.motoristaTitularNome}</strong>
                      </div>
                    )}
                  </div>

                  {/* Maintenance Odometers Radar */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Odômetro Atual:</span>
                      </span>
                      <strong className="font-mono text-white text-xs">{formatNumber(v.odometroAtualKm, 0)} km</strong>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        <span>Próxima Revisão:</span>
                      </span>
                      <strong className="font-mono text-slate-200 text-xs">{formatNumber(v.proximaRevisaoKm, 0)} km</strong>
                    </div>

                    {/* Progress Bar towards revision */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          revisaoVencida ? 'bg-rose-500' : alertaRevisao ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, progressoRevisao)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Última: {v.dataUltimaRevisao || 'N/A'}</span>
                      <span className={revisaoVencida ? 'text-rose-400 font-bold' : alertaRevisao ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                        {revisaoVencida
                          ? `Atrasada há ${formatNumber(Math.abs(kmParaRevisao), 0)} km`
                          : `Faltam ${formatNumber(kmParaRevisao, 0)} km`}
                      </span>
                    </div>
                  </div>

                  {/* Laudos Regulamentares (CIV / CIPP) */}
                  <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-3 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>CIV (Inspeção Veicular):</span>
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[10px] border ${civMeta.badgeClass}`}>
                        {civMeta.label}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-cyan-400" />
                        <span>CIPP (Produtos Perigosos):</span>
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[10px] border ${cippMeta.badgeClass}`}>
                        {cippMeta.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setDossieVeiculo(v)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition"
                    title="Visualizar e Imprimir Dossiê Técnico A4"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dossiê A4</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(v)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Editar cadastro do veículo"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-ambipar-400" />
                    </button>

                    <button
                      onClick={() => handleDelete(v.id, v.placa)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                      title="Excluir veículo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Full Audit Patrimonial Table View */
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Placa / Modelo</th>
                <th className="py-3 px-3">Equipamento / Implemento</th>
                <th className="py-3 px-3">Base & Motorista</th>
                <th className="py-3 px-3 text-right">Capacidade</th>
                <th className="py-3 px-3 text-right">Odômetro</th>
                <th className="py-3 px-3 text-right">Próxima Revisão</th>
                <th className="py-3 px-3">CIV / CIPP</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((v) => {
                const kmParaRevisao = v.proximaRevisaoKm - v.odometroAtualKm;
                const alertaRevisao = kmParaRevisao <= 3000;
                const civMeta = getLaudoMeta(v.validadeCiv);
                const cippMeta = getLaudoMeta(v.validadeCipp);
                const isBlocked = hasCriticalExpiredLaudo(v);

                return (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-white text-xs">{v.placa}</div>
                      <div className="text-[11px] text-slate-400">{v.marca} {v.modelo} ({v.ano})</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-ambipar-400 font-semibold block">{v.tipoEquipamento}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {v.tipoPropriedade || 'Frota Própria'} &bull; {v.tipoTracao || '6x2'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-300 text-xs">{v.baseOperacional}</div>
                      <div className="text-[10px] text-slate-500">
                        {v.motoristaTitularNome ? `Titular: ${v.motoristaTitularNome}` : 'Pool / Rotativo'}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-white">
                      {v.capacidadeCargaTon} Ton
                      {v.volumeTanqueM3 && <span className="block text-[10px] text-slate-500">{v.volumeTanqueM3} m³</span>}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-white">
                      {formatNumber(v.odometroAtualKm, 0)} km
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      <span className={kmParaRevisao <= 0 ? 'text-rose-400 font-bold' : alertaRevisao ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                        {formatNumber(v.proximaRevisaoKm, 0)} km
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {kmParaRevisao > 0 ? `Faltam ${formatNumber(kmParaRevisao, 0)} km` : `Atrasada`}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border w-fit ${civMeta.badgeClass}`}>
                          CIV: {civMeta.label}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border w-fit ${cippMeta.badgeClass}`}>
                          CIPP: {cippMeta.label}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          isBlocked
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                            : v.status === 'Disponível'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : v.status === 'Em Viagem'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : v.status === 'Em Manutenção'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isBlocked ? '🚨 Impedido' : v.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDossieVeiculo(v)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Ver Dossiê A4"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(v)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-ambipar-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.placa)}
                          className="p-1 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          title="Excluir"
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

      {/* =========================================================
          MODAL: CADASTRO & EDIÇÃO COMPLETA DO VEÍCULO
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-4 text-xs shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-ambipar-500/20 border border-ambipar-500/30 flex items-center justify-center text-ambipar-400 font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingId ? 'Editar Cadastro do Veículo' : 'Cadastrar Novo Veículo na Frota'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Controle patrimonial, laudos de produtos perigosos e manutenção preventiva Ambipar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
              {[
                { id: 'veiculo', label: '1. Veículo & Chassi', icon: Truck },
                { id: 'implemento', label: '2. Implemento & Carga', icon: Scale },
                { id: 'manutencao', label: '3. Odômetro & Revisão', icon: Wrench },
                { id: 'laudos', label: '4. Laudos (CIV/CIPP)', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFormTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFormTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-ambipar-600 text-white shadow'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* TAB 1: Veículo & Chassi */}
              {activeFormTab === 'veiculo' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Placa do Veículo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: ABC-4E21"
                        value={formData.placa}
                        onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase text-xs focus:border-ambipar-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Marca *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Scania, Volvo, VW..."
                        value={formData.marca}
                        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-ambipar-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Modelo Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: R 450 6x2 Highline"
                        value={formData.modelo}
                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-ambipar-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Ano Fabricação</label>
                      <input
                        type="number"
                        value={formData.ano}
                        onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) || 2024 })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Ano Modelo</label>
                      <input
                        type="number"
                        value={formData.anoModelo}
                        onChange={(e) => setFormData({ ...formData, anoModelo: parseInt(e.target.value) || 2024 })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Configuração Tração</label>
                      <select
                        value={formData.tipoTracao}
                        onChange={(e) => setFormData({ ...formData, tipoTracao: e.target.value as TipoTracaoVeiculo })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      >
                        {TRACCOES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Cor Predominante</label>
                      <input
                        type="text"
                        placeholder="Branco Ambipar"
                        value={formData.cor}
                        onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Número do Chassi (17 dígitos)</label>
                      <input
                        type="text"
                        placeholder="9BM..."
                        value={formData.chassi}
                        onChange={(e) => setFormData({ ...formData, chassi: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Código RENAVAM (11 dígitos)</label>
                      <input
                        type="text"
                        placeholder="00123456789"
                        value={formData.renavam}
                        onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Tipo de Propriedade</label>
                      <select
                        value={formData.tipoPropriedade}
                        onChange={(e) => setFormData({ ...formData, tipoPropriedade: e.target.value as any })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      >
                        {PROPRIEDADES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Base Operacional Alocada *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Base Regional Paulínia"
                        value={formData.baseOperacional}
                        onChange={(e) => setFormData({ ...formData, baseOperacional: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Status Operacional</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      >
                        <option value="Disponível">Disponível</option>
                        <option value="Em Viagem">Em Viagem</option>
                        <option value="Em Manutenção">Em Manutenção</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Implemento & Carga */}
              {activeFormTab === 'implemento' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Tipo de Equipamento / Implemento *</label>
                    <select
                      value={formData.tipoEquipamento}
                      onChange={(e) => setFormData({ ...formData, tipoEquipamento: e.target.value as TipoEquipamento })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                    >
                      {EQUIPAMENTOS.map((eq) => (
                        <option key={eq} value={eq}>{eq}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Capacidade de Carga (Ton) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.capacidadeCargaTon}
                        onChange={(e) => setFormData({ ...formData, capacidadeCargaTon: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Volume do Tanque / Caçamba (m³)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 35 m³"
                        value={formData.volumeTanqueM3 || ''}
                        onChange={(e) => setFormData({ ...formData, volumeTanqueM3: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Material do Tanque / Revestimento</label>
                      <input
                        type="text"
                        placeholder="Ex: Inox 316L, Epóxi, Aço"
                        value={formData.materialTanque}
                        onChange={(e) => setFormData({ ...formData, materialTanque: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Motorista Titular Vinculado (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Nome do motorista fixo que opera este caminhão"
                      value={formData.motoristaTitularNome}
                      onChange={(e) => setFormData({ ...formData, motoristaTitularNome: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Manutenção & Odômetro */}
              {activeFormTab === 'manutencao' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Odômetro Atual (Km) *</label>
                      <input
                        type="number"
                        required
                        value={formData.odometroAtualKm}
                        onChange={(e) => setFormData({ ...formData, odometroAtualKm: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Próxima Revisão Programada (Km) *</label>
                      <input
                        type="number"
                        required
                        value={formData.proximaRevisaoKm}
                        onChange={(e) => setFormData({ ...formData, proximaRevisaoKm: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Data Última Revisão</label>
                      <input
                        type="date"
                        value={formData.dataUltimaRevisao}
                        onChange={(e) => setFormData({ ...formData, dataUltimaRevisao: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Combustível Padrão</label>
                      <select
                        value={formData.tipoCombustivelPadrao}
                        onChange={(e) => setFormData({ ...formData, tipoCombustivelPadrao: e.target.value as TipoCombustivel })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      >
                        {COMBUSTIVEIS.map((cb) => (
                          <option key={cb} value={cb}>{cb}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Meta Consumo (km/L)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={formData.mediaConsumoMeta}
                        onChange={(e) => setFormData({ ...formData, mediaConsumoMeta: parseFloat(e.target.value) || 2.65 })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Laudos Regulamentares (CIV / CIPP) */}
              {activeFormTab === 'laudos' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Laudos Obrigatórios para Transporte de Produtos Perigosos & Químicos</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-0.5 font-semibold">Número CIV</label>
                        <input
                          type="text"
                          placeholder="CIV-SP-90412"
                          value={formData.numeroCiv}
                          onChange={(e) => setFormData({ ...formData, numeroCiv: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-0.5 font-semibold">Validade CIV</label>
                        <input
                          type="date"
                          value={formData.validadeCiv}
                          onChange={(e) => setFormData({ ...formData, validadeCiv: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-0.5 font-semibold">Número CIPP</label>
                        <input
                          type="text"
                          placeholder="CIPP-INM-88412"
                          value={formData.numeroCipp}
                          onChange={(e) => setFormData({ ...formData, numeroCipp: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-0.5 font-semibold">Validade CIPP</label>
                        <input
                          type="date"
                          value={formData.validadeCipp}
                          onChange={(e) => setFormData({ ...formData, validadeCipp: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Validade Cronotacógrafo (Inmetro)</label>
                      <input
                        type="date"
                        value={formData.validadeCronotacografo}
                        onChange={(e) => setFormData({ ...formData, validadeCronotacografo: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Licença Ambiental Transporte</label>
                      <input
                        type="text"
                        placeholder="Ex: CETESB LO 45009182"
                        value={formData.licencaAmbientalTransporte}
                        onChange={(e) => setFormData({ ...formData, licencaAmbientalTransporte: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Observações Técnicas</label>
                    <textarea
                      rows={2}
                      placeholder="Informações sobre pneus, histórico de sinistros, tacógrafo digital..."
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  {editingId ? 'Editando registro de veículo existente' : 'Veículo será inserido no banco operacional'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold shadow-lg shadow-ambipar-500/20"
                  >
                    {editingId ? 'Salvar Alterações' : 'Concluir Cadastro'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: DOSSIÊ TÉCNICO PATRIMONIAL DO VEÍCULO (A4 / IMPRESSÃO)
          ========================================================= */}
      {dossieVeiculo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Top Bar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  Dossiê Patrimonial & Laudo Técnico do Veículo (SASSMAQ / ANTT)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Prontuário A4</span>
                </button>
                <button
                  onClick={() => setDossieVeiculo(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Body */}
            <div className="p-6 overflow-y-auto bg-slate-900 text-slate-200 space-y-6 text-xs print:p-0 print:bg-white print:text-black">
              {/* Header */}
              <div className="border-b-2 border-ambipar-500 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl text-white print:text-black tracking-tight">AMBIPAR</span>
                    <span className="text-[10px] font-bold bg-ambipar-500/20 text-ambipar-400 print:text-emerald-700 px-2 py-0.5 rounded border border-ambipar-500/30">
                      GESTÃO PATRIMONIAL & FROTA
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-300 print:text-slate-700 mt-1">
                    PRONTUÁRIO TÉCNICO VEICULAR & CERTIFICADO DE CONFORMIDADE
                  </h4>
                  <p className="text-[10px] text-slate-500 print:text-slate-600">
                    Inspeção Veicular, Capacidades Mecânicas e Licenças de Transporte de Resíduos
                  </p>
                </div>

                <div className="text-right text-[11px] text-slate-400 print:text-slate-600">
                  <div>Data de Emissão: <strong className="text-white print:text-black">{new Date().toLocaleDateString('pt-BR')}</strong></div>
                  <div>Placa: <strong className="text-white print:text-black font-mono text-base">{dossieVeiculo.placa}</strong></div>
                  <div>Status: <strong className="text-emerald-400 print:text-emerald-700">{dossieVeiculo.status}</strong></div>
                </div>
              </div>

              {/* Quadro 1: Dados do Chassi e Registro */}
              <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-2">
                <h5 className="font-bold text-white print:text-black uppercase tracking-wider text-[11px] text-ambipar-400 print:text-emerald-800">
                  1. IDENTIFICAÇÃO DO VEÍCULO & DOCUMENTAÇÃO
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Marca / Modelo:</span>
                    <strong className="text-white print:text-black font-bold">{dossieVeiculo.marca} {dossieVeiculo.modelo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Ano Fabricação / Modelo:</span>
                    <strong className="text-white print:text-black font-mono">{dossieVeiculo.ano} / {dossieVeiculo.anoModelo || dossieVeiculo.ano}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Configuração Tração:</span>
                    <strong className="text-white print:text-black font-mono">{dossieVeiculo.tipoTracao || '6x2 (Trucado)'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Propriedade:</span>
                    <strong className="text-white print:text-black">{dossieVeiculo.tipoPropriedade || 'Frota Própria'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Chassi:</span>
                    <strong className="text-white print:text-black font-mono">{dossieVeiculo.chassi || 'NÃO INFORMADO'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">RENAVAM:</span>
                    <strong className="text-white print:text-black font-mono">{dossieVeiculo.renavam || 'NÃO INFORMADO'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Base Operacional:</span>
                    <strong className="text-white print:text-black">{dossieVeiculo.baseOperacional}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Motorista Titular:</span>
                    <strong className="text-white print:text-black">{dossieVeiculo.motoristaTitularNome || 'Pool / Rotativo'}</strong>
                  </div>
                </div>
              </div>

              {/* Quadro 2: Implemento e Capacidades */}
              <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-2">
                <h5 className="font-bold text-white print:text-black uppercase tracking-wider text-[11px] text-ambipar-400 print:text-emerald-800">
                  2. IMPLEMENTO, CAPACIDADE DE CARGA & TELEMETRIA
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Tipo de Equipamento:</span>
                    <strong className="text-emerald-400 print:text-emerald-700 font-bold">{dossieVeiculo.tipoEquipamento}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Capacidade Líquida:</span>
                    <strong className="text-white print:text-black font-mono">{dossieVeiculo.capacidadeCargaTon} Toneladas</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Volume Tanque / Caçamba:</span>
                    <strong className="text-white print:text-black font-mono">{dossieVeiculo.volumeTanqueM3 ? `${dossieVeiculo.volumeTanqueM3} m³` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Combustível Padrão:</span>
                    <strong className="text-white print:text-black">{dossieVeiculo.tipoCombustivelPadrao}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Odômetro Atual:</span>
                    <strong className="text-white print:text-black font-mono">{formatNumber(dossieVeiculo.odometroAtualKm, 0)} km</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Próxima Revisão:</span>
                    <strong className="text-amber-400 print:text-amber-800 font-mono">{formatNumber(dossieVeiculo.proximaRevisaoKm, 0)} km</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Data Última Revisão:</span>
                    <strong className="text-white print:text-black font-mono">{dossieVeiculo.dataUltimaRevisao || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 text-[10px] block">Meta de Média:</span>
                    <strong className="text-emerald-400 print:text-emerald-700 font-mono">{dossieVeiculo.mediaConsumoMeta ? `${dossieVeiculo.mediaConsumoMeta.toFixed(2)} km/L` : '2.65 km/L'}</strong>
                  </div>
                </div>
              </div>

              {/* Quadro 3: Laudos e Certificações Obrigatórias */}
              <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-3">
                <h5 className="font-bold text-white print:text-black uppercase tracking-wider text-[11px] text-ambipar-400 print:text-emerald-800">
                  3. LAUDOS REGULAMENTARES & LICENÇAS AMBIENTAIS (SASSMAQ / INMETRO)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 flex justify-between items-center">
                    <div>
                      <strong className="text-white print:text-black block">CIV (Inspeção Veicular)</strong>
                      <span className="text-[10px] text-slate-500 print:text-slate-600 font-mono">{dossieVeiculo.numeroCiv || 'S/N'}</span>
                    </div>
                    <span className="font-mono font-bold text-white print:text-black">{dossieVeiculo.validadeCiv || 'Válido'}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 flex justify-between items-center">
                    <div>
                      <strong className="text-white print:text-black block">CIPP (Produtos Perigosos)</strong>
                      <span className="text-[10px] text-slate-500 print:text-slate-600 font-mono">{dossieVeiculo.numeroCipp || 'S/N'}</span>
                    </div>
                    <span className="font-mono font-bold text-white print:text-black">{dossieVeiculo.validadeCipp || 'Válido'}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 flex justify-between items-center">
                    <div>
                      <strong className="text-white print:text-black block">Cronotacógrafo Inmetro</strong>
                      <span className="text-[10px] text-slate-500 print:text-slate-600 font-mono">{dossieVeiculo.numeroCronotacografo || 'S/N'}</span>
                    </div>
                    <span className="font-mono font-bold text-white print:text-black">{dossieVeiculo.validadeCronotacografo || 'Válido'}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 flex justify-between items-center">
                    <div>
                      <strong className="text-white print:text-black block">Licença Ambiental</strong>
                      <span className="text-[10px] text-slate-500 print:text-slate-600">{dossieVeiculo.licencaAmbientalTransporte || 'Estadual/Federal'}</span>
                    </div>
                    <span className="font-mono font-bold text-white print:text-black">{dossieVeiculo.validadeLicencaAmbiental || 'Válida'}</span>
                  </div>
                </div>
              </div>

              {/* Assinaturas */}
              <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="border-t border-slate-700 print:border-black pt-2">
                  <strong className="block text-white print:text-black">Carlos Eduardo (Analista de Logística)</strong>
                  <span className="text-slate-500 print:text-slate-600 text-[10px]">Gestão de Frotas Ambipar</span>
                </div>

                <div className="border-t border-slate-700 print:border-black pt-2">
                  <strong className="block text-white print:text-black">Engenharia Mecânica / Vistoria Técnica</strong>
                  <span className="text-slate-500 print:text-slate-600 text-[10px]">Responsável Técnico de Frota</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
