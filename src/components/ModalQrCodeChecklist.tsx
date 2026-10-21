import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  Truck,
  Smartphone,
  ShieldCheck,
  Info,
  MessageCircle,
  Search,
  Filter,
  Layers,
  FileText,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import { Veiculo, Motorista } from '../types';

interface ModalQrCodeChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  veiculos: Veiculo[];
  motoristas: Motorista[];
  placaInicial?: string;
  onNavigateToCadastroVeiculo?: () => void;
}

export const ModalQrCodeChecklist: React.FC<ModalQrCodeChecklistProps> = ({
  isOpen,
  onClose,
  veiculos,
  motoristas,
  placaInicial,
  onNavigateToCadastroVeiculo,
}) => {
  const [selectedPlaca, setSelectedPlaca] = useState<string>(placaInicial || '');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [batchQrCodes, setBatchQrCodes] = useState<Record<string, string>>({});
  const [modoExibicao, setModoExibicao] = useState<'individual' | 'lote'>('individual');
  const [copied, setCopied] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'cavalos' | 'rigidos' | 'disponiveis'>('todos');
  const printableRef = useRef<HTMLDivElement>(null);

  // Normalizar placas para comparação segura
  const normPlaca = (p?: string) => (p || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  // Determinar veículo selecionado
  const veiculoSelecionado = veiculos.find(
    (v) => normPlaca(v.placa) === normPlaca(selectedPlaca)
  );

  // Determinar motorista titular vinculado
  const motoristaTitular = motoristas.find(
    (m) =>
      (m.veiculoFixoPlaca && normPlaca(m.veiculoFixoPlaca) === normPlaca(selectedPlaca)) ||
      (veiculoSelecionado?.motoristaTitularNome &&
        m.nome.toLowerCase() === veiculoSelecionado.motoristaTitularNome.toLowerCase())
  );

  // Definir URL do Checklist para o veículo selecionado
  const getChecklistUrl = (placa?: string) => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://analistalogisticaambipar.vercel.app';

    const p = placa !== undefined ? placa : selectedPlaca;
    if (p) {
      return `${origin}/?portal=motorista&placa=${encodeURIComponent(p.toUpperCase())}`;
    }
    return `${origin}/?portal=motorista`;
  };

  const checklistUrl = getChecklistUrl();

  // Gerar QR Code para o veículo selecionado
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(checklistUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#032c1c', // Verde escuro corporativo Ambipar
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H', // Alta redundância para leitura perfeita mesmo com sujeira ou reflexo no parabrisa
    })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Erro ao gerar QR Code:', err);
      });
  }, [isOpen, selectedPlaca, checklistUrl]);

  // Gerar QR Codes em Lote quando no modo lote ou quando a frota mudar
  useEffect(() => {
    if (!isOpen || modoExibicao !== 'lote' || veiculos.length === 0) return;

    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://analistalogisticaambipar.vercel.app';

    const promises = veiculos.map(async (v) => {
      const url = `${origin}/?portal=motorista&placa=${encodeURIComponent(v.placa.toUpperCase())}`;
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: 320,
          margin: 2,
          color: { dark: '#032c1c', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
        return { placa: v.placa, dataUrl };
      } catch (e) {
        return { placa: v.placa, dataUrl: '' };
      }
    });

    Promise.all(promises).then((results) => {
      const map: Record<string, string> = {};
      results.forEach((r) => {
        map[r.placa] = r.dataUrl;
      });
      setBatchQrCodes(map);
    });
  }, [isOpen, modoExibicao, veiculos]);

  // Sincronizar placa inicial
  useEffect(() => {
    if (placaInicial) {
      setSelectedPlaca(placaInicial);
    } else if (veiculos.length > 0 && !selectedPlaca) {
      setSelectedPlaca(veiculos[0].placa);
    }
  }, [placaInicial, veiculos]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(checklistUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPng = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `QRCode-Checklist-Ambipar-${selectedPlaca || 'Base-Geral'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImprimirPlaqueta = () => {
    window.print();
  };

  const handleEnviarWhatsapp = () => {
    const telefone = motoristaTitular?.telefone?.replace(/\D/g, '') || '';
    const texto = encodeURIComponent(
      `*AMBIPAR LOGISTICS - CHECKLIST DIÁRIO OBRIGATÓRIO*\n\n` +
        `Olá ${motoristaTitular ? motoristaTitular.nome : 'Motorista'},\n` +
        `Acesse o link oficial abaixo para realizar a vistoria pré/pós-jornada do veículo *${
          selectedPlaca || 'da Frota'
        }* (${veiculoSelecionado?.modelo || 'Frota Ambipar'}):\n\n` +
        `🔗 ${checklistUrl}\n\n` +
        `_Lembrete: Digite seu CPF para autenticar sua jornada. Registre eventuais avarias fotográficas e confirme os itens de segurança SASSMAQ / Ambipar Response 24h._`
    );

    const waUrl = telefone
      ? `https://api.whatsapp.com/send?phone=55${telefone}&text=${texto}`
      : `https://api.whatsapp.com/send?text=${texto}`;

    window.open(waUrl, '_blank');
  };

  // Filtragem inteligente dos veículos
  const veiculosFiltrados = veiculos.filter((v) => {
    const q = filtroBusca.toLowerCase();
    const matchesTexto =
      v.placa.toLowerCase().includes(q) ||
      v.modelo.toLowerCase().includes(q) ||
      (v.tipoEquipamento && v.tipoEquipamento.toLowerCase().includes(q)) ||
      (v.tipoTracao && v.tipoTracao.toLowerCase().includes(q)) ||
      (v.motoristaTitularNome && v.motoristaTitularNome.toLowerCase().includes(q));

    if (!matchesTexto) return false;

    if (filtroCategoria === 'disponiveis') {
      return v.status === 'Disponível';
    }
    if (filtroCategoria === 'cavalos') {
      return !v.isSemCarreta && !['passeio', 'carro', 'vuc', '3/4', 'toco'].some((t) => (v.tipoEquipamento || '').toLowerCase().includes(t));
    }
    if (filtroCategoria === 'rigidos') {
      return v.isSemCarreta || ['passeio', 'carro', 'vuc', '3/4', 'toco', 'truck', 'bitruck'].some((t) => (v.tipoEquipamento || '').toLowerCase().includes(t));
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      {/* Estilo CSS exclusivo para impressão em Alta Resolução da Plaqueta de Cabine */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #impressao-plaquetas-container, #impressao-plaquetas-container * {
            visibility: visible;
          }
          #impressao-plaquetas-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
          }
          .plaqueta-ambipar-print-item {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 12mm;
            border: 2px solid #004724 !important;
            box-shadow: none !important;
            background: white !important;
            color: #0f172a !important;
            padding: 14px !important;
            width: 140mm !important;
            margin-left: auto;
            margin-right: auto;
          }
          .plaqueta-grid-print {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10mm !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header Superior com Tabs */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-ambipar-500/20 to-emerald-500/10 border border-ambipar-500/30 flex items-center justify-center text-ambipar-400 shadow-inner">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Gerador de QR Code Operacional &middot; Frota Ambipar
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-ambipar-500/20 text-ambipar-300 border border-ambipar-500/40 uppercase tracking-wider">
                  Padrão SASSMAQ / Cabine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Selecione o veículo cadastrado para gerar o adesivo oficial de cabine com placa Mercosul e leitura direta pelo celular do motorista.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Seletor de Modo: Individual vs Lote */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setModoExibicao('individual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  modoExibicao === 'individual'
                    ? 'bg-ambipar-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Plaqueta Individual</span>
              </button>
              <button
                type="button"
                onClick={() => setModoExibicao('lote')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  modoExibicao === 'lote'
                    ? 'bg-ambipar-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Lote da Frota ({veiculos.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Fechar Janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================
            MODO 1: VISUALIZAÇÃO E GERAÇÃO INDIVIDUAL
            ========================================================= */}
        {modoExibicao === 'individual' && (
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coluna Esquerda: Seletor de Veículo & Configurações */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-ambipar-400" />
                    <span>Veículos Cadastrados na Frota ({veiculos.length})</span>
                  </label>
                  {veiculos.length > 0 && (
                    <span className="text-[10px] text-slate-400">
                      {veiculosFiltrados.length} listados
                    </span>
                  )}
                </div>

                {/* Barra de Busca de Veículos */}
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por placa, modelo, titular..."
                    value={filtroBusca}
                    onChange={(e) => setFiltroBusca(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-ambipar-500 transition"
                  />
                </div>

                {/* Filtros Rápidos de Categoria */}
                <div className="flex items-center gap-1 mb-2.5 overflow-x-auto pb-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFiltroCategoria('todos')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                      filtroCategoria === 'todos'
                        ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Todos ({veiculos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroCategoria('cavalos')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                      filtroCategoria === 'cavalos'
                        ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Cavalos / Carretas
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroCategoria('rigidos')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                      filtroCategoria === 'rigidos'
                        ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Rígidos (Toco / Truck)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroCategoria('disponiveis')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                      filtroCategoria === 'disponiveis'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-bold'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Disponíveis
                  </button>
                </div>

                {/* Lista de Seleção de Veículos com Cards Mercosul */}
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 border border-slate-800/80 rounded-2xl p-2.5 bg-slate-950/60">
                  {/* Opção Totem Geral da Base */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlaca('')}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                      selectedPlaca === ''
                        ? 'bg-ambipar-500/15 border-ambipar-500 text-white font-semibold ring-1 ring-ambipar-500/30'
                        : 'bg-slate-900/90 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white">Totem Geral da Base</p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                            Guarita / Pátio
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          O motorista escaneia e escolhe qualquer veículo na tela
                        </p>
                      </div>
                    </div>
                    {selectedPlaca === '' ? (
                      <CheckCircle2 className="w-4 h-4 text-ambipar-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                    )}
                  </button>

                  {/* Veículos Cadastrados */}
                  {veiculosFiltrados.map((v) => {
                    const isSelected = normPlaca(v.placa) === normPlaca(selectedPlaca);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedPlaca(v.placa)}
                        className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-ambipar-500/15 border-ambipar-500 text-white font-semibold ring-1 ring-ambipar-500/30'
                            : 'bg-slate-900/90 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Mini Placa Mercosul Estilizada */}
                          <div className="w-16 rounded border border-slate-700 overflow-hidden bg-white text-slate-950 shrink-0 shadow-sm">
                            <div className="bg-[#003399] text-white text-[7px] font-black px-1 py-0.2 flex items-center justify-between">
                              <span>BR</span>
                              <span>🇧🇷</span>
                            </div>
                            <div className="text-[10px] font-mono font-black text-center py-0.5 tracking-wider">
                              {v.placa}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white truncate max-w-[170px]">
                                {v.modelo}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                  v.status === 'Disponível'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : v.status === 'Em Viagem'
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {v.status || 'Disponível'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400 truncate max-w-[210px]">
                              {v.tipoTracao || v.tipoEquipamento} &middot;{' '}
                              <span className="text-slate-500">
                                {v.odometroAtualKm ? `${v.odometroAtualKm.toLocaleString('pt-BR')} km` : '0 km'}
                              </span>
                            </p>

                            {v.motoristaTitularNome && (
                              <p className="text-[10px] text-emerald-400 truncate max-w-[210px] flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <span>Titular: {v.motoristaTitularNome}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-ambipar-400 shrink-0 ml-2" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-700 shrink-0 ml-2"></span>
                        )}
                      </button>
                    );
                  })}

                  {/* Empty State na Lista Filtrada */}
                  {veiculosFiltrados.length === 0 && veiculos.length > 0 && (
                    <div className="py-6 px-3 text-center text-xs text-slate-500 space-y-1">
                      <p>Nenhum veículo encontrado para a busca "{filtroBusca}".</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFiltroBusca('');
                          setFiltroCategoria('todos');
                        }}
                        className="text-ambipar-400 hover:underline font-bold"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  )}

                  {/* Empty State Geral se a Frota estiver vazia */}
                  {veiculos.length === 0 && (
                    <div className="py-6 px-4 text-center space-y-3 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Nenhum veículo cadastrado na frota</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Cadastre caminhões ou importe o CRLV Digital para gerar plaquetas individuais de cabine.
                        </p>
                      </div>
                      {onNavigateToCadastroVeiculo && (
                        <button
                          type="button"
                          onClick={onNavigateToCadastroVeiculo}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs shadow-md transition"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Cadastrar Veículo / Importar CRLV</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Informações Detalhadas do Veículo Selecionado */}
              {veiculoSelecionado ? (
                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Ficha Técnica do Veículo</span>
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {veiculoSelecionado.placa}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Modelo / Fabricante:</span>
                      <strong className="text-slate-200">{veiculoSelecionado.modelo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tipo & Estrutura:</span>
                      <strong className="text-slate-200">
                        {veiculoSelecionado.isSemCarreta
                          ? 'Rígido (Sem Carreta)'
                          : 'Articulado (Cavalo + Carreta)'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Odômetro Atual:</span>
                      <strong className="text-emerald-400 font-mono">
                        {veiculoSelecionado.odometroAtualKm.toLocaleString('pt-BR')} km
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Motorista Titular:</span>
                      <strong className="text-slate-200">
                        {motoristaTitular?.nome || veiculoSelecionado.motoristaTitularNome || 'Livre na Base'}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-2xl text-xs text-cyan-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                  <p>
                    Modo <strong>Totem Geral da Base</strong>: Ideal para imprimir uma placa fixa para a guarita ou recepção. Ao ler o QR Code, o condutor escolhe seu caminhão na tela do celular.
                  </p>
                </div>
              )}

              {/* Link de Acesso Direto com Botão de Copiar */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Link Direto do Checklist (Motorista)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={checklistUrl}
                    className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono select-all focus:outline-none shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    title="Copiar Link para a Área de Transferência"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Botões de Ações Rápidas */}
              <div className="pt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleEnviarWhatsapp}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Motorista</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar QR Code PNG</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleImprimirPlaqueta}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-ambipar-600 to-emerald-600 hover:from-ambipar-500 hover:to-emerald-500 text-white font-black text-sm shadow-xl shadow-ambipar-600/30 transition active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Plaqueta Oficial de Cabine</span>
              </button>
            </div>

            {/* Coluna Direita: Preview da Plaqueta de Cabine Timbrada Ambipar */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950/70 p-4 sm:p-6 rounded-3xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-ambipar-400" />
                Preview em Alta Resolução &middot; Adesivo de Cabine SASSMAQ
              </span>

              {/* Plaqueta Timbrada Ambipar para Impressão */}
              <div
                id="impressao-plaquetas-container"
                className="w-full flex justify-center"
              >
                <div
                  ref={printableRef}
                  className="plaqueta-ambipar-print-item w-full max-w-[370px] bg-white text-slate-900 rounded-2xl shadow-2xl border-4 border-[#004724] p-4 flex flex-col items-center text-center transition-all select-none"
                >
                  {/* Tarja Superior Ambipar */}
                  <div className="w-full bg-[#004724] text-white py-2 px-3 rounded-xl mb-2.5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white text-[#004724] font-black flex items-center justify-center text-xs shadow-sm">
                        A
                      </div>
                      <div className="text-left leading-tight">
                        <span className="font-extrabold text-xs tracking-wider block">AMBIPAR LOGISTICS</span>
                        <span className="text-[8px] text-emerald-200 block uppercase font-medium">Gestão de Frotas & Segurança Viária</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-200 bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-700">
                      SASSMAQ &middot; ESG
                    </span>
                  </div>

                  {/* Subtítulo Operacional */}
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2.5">
                    Checklist Obrigatório Diário &middot; Pré / Pós Jornada
                  </p>

                  {/* Placa Padrão Mercosul Oficial de Alta Fidelidade */}
                  <div className="w-full max-w-[270px] border-2 border-slate-900 rounded-xl overflow-hidden shadow-md mb-2 bg-white">
                    {/* Faixa Azul Mercosul */}
                    <div className="bg-[#003399] text-white text-[10px] font-black py-0.5 px-3 flex justify-between items-center">
                      <span className="text-[8px] opacity-80 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
                        MERCOSUL
                      </span>
                      <span className="tracking-widest">BRASIL</span>
                      <span className="text-xs">🇧🇷</span>
                    </div>

                    {/* Caracteres da Placa com relevo sutil */}
                    <div className="bg-white py-1.5 px-3 flex items-center justify-center">
                      <span className="font-black text-3xl tracking-[0.18em] text-slate-950 font-mono uppercase">
                        {selectedPlaca ? selectedPlaca.toUpperCase() : 'FROTA GERAL'}
                      </span>
                    </div>

                    {/* Especificação Técnica na Placa */}
                    {veiculoSelecionado && (
                      <div className="bg-slate-100 border-t border-slate-300 py-1 px-2 text-[9px] font-bold text-slate-700 flex justify-between items-center">
                        <span className="truncate max-w-[150px]">{veiculoSelecionado.modelo}</span>
                        <span className="text-emerald-800 uppercase font-black">
                          {veiculoSelecionado.tipoTracao || 'Frota Ambipar'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* QR Code Container Nítido */}
                  <div className="p-2.5 bg-white rounded-2xl border-2 border-dashed border-[#004724] shadow-inner my-1 flex flex-col items-center">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt={`QR Code Checklist ${selectedPlaca}`}
                        className="w-48 h-48 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                        Gerando QR Code...
                      </div>
                    )}
                    <span className="text-[9px] font-mono text-slate-500 mt-1 select-all truncate max-w-[230px]">
                      {checklistUrl}
                    </span>
                  </div>

                  {/* Instruções de Uso em 3 Passos */}
                  <div className="mt-2.5 text-left w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-700 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <span className="w-4 h-4 rounded-full bg-[#004724] text-white text-[10px] flex items-center justify-center font-black shrink-0">
                        1
                      </span>
                      <span>Aponte a câmera do seu celular para este QR Code</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-white text-[10px] flex items-center justify-center font-black shrink-0">
                        2
                      </span>
                      <span>Digite seu CPF para validar o acesso à jornada</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-white text-[10px] flex items-center justify-center font-black shrink-0">
                        3
                      </span>
                      <span>Realize o checklist de 26 itens e fotografe eventuais avarias</span>
                    </div>
                  </div>

                  {/* Rodapé de Emergência e Suporte */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200 w-full flex items-center justify-between text-[9px] text-slate-600 font-bold">
                    <span>Ambipar 24h: 0800 771 3778</span>
                    <span className="text-[#004724]">Base Operacional Paulínia/SP</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-3 text-center">
                Dica operacional: Imprima em papel adesivo vinílico ou plastifique para fixação duradoura no canto inferior direito do para-brisa.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================
            MODO 2: IMPRESSÃO EM LOTE DE TODA A FROTA (A4)
            ========================================================= */}
        {modoExibicao === 'lote' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-ambipar-400" />
                  <span>Impressão em Lote das Plaquetas de Toda a Frota</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gera todas as plaquetas da frota ({veiculos.length} veículos) organizadas para impressão e corte rápido em papel A4 ou folha adesiva.
                </p>
              </div>

              <button
                type="button"
                onClick={handleImprimirPlaqueta}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-ambipar-600 to-emerald-600 hover:from-ambipar-500 hover:to-emerald-500 text-white font-black text-xs shadow-lg shadow-ambipar-600/30 transition shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Todas as Plaquetas ({veiculos.length})</span>
              </button>
            </div>

            {veiculos.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-950/60 rounded-3xl border border-dashed border-slate-800">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-bold text-white">Nenhum veículo cadastrado na frota</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Para gerar o lote de impressão, cadastre seus veículos na aba Frota ou importe o CRLV Digital.
                </p>
                {onNavigateToCadastroVeiculo && (
                  <button
                    type="button"
                    onClick={onNavigateToCadastroVeiculo}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs shadow-md transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Cadastrar Veículos Agora</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                id="impressao-plaquetas-container"
                className="max-h-[60vh] overflow-y-auto p-4 bg-slate-950/50 rounded-3xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 plaqueta-grid-print"
              >
                {veiculos.map((v) => {
                  const qrUrl = batchQrCodes[v.placa];
                  const mot = motoristas.find(
                    (m) =>
                      (m.veiculoFixoPlaca && normPlaca(m.veiculoFixoPlaca) === normPlaca(v.placa)) ||
                      (v.motoristaTitularNome && m.nome.toLowerCase() === v.motoristaTitularNome.toLowerCase())
                  );

                  return (
                    <div
                      key={v.id}
                      className="plaqueta-ambipar-print-item bg-white text-slate-900 rounded-2xl shadow-md border-2 border-[#004724] p-3.5 flex flex-col items-center text-center"
                    >
                      {/* Tarja Superior Ambipar */}
                      <div className="w-full bg-[#004724] text-white py-1 px-2.5 rounded-lg mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded bg-white text-[#004724] font-black flex items-center justify-center text-xs">
                            A
                          </div>
                          <span className="font-extrabold text-[11px] tracking-wider">AMBIPAR LOGISTICS</span>
                        </div>
                        <span className="text-[8px] font-bold uppercase text-emerald-200">
                          SASSMAQ &middot; ESG
                        </span>
                      </div>

                      {/* Placa Mercosul */}
                      <div className="w-full max-w-[220px] border border-slate-900 rounded-lg overflow-hidden shadow-sm mb-2 bg-white">
                        <div className="bg-[#003399] text-white text-[8px] font-black py-0.2 px-2 flex justify-between items-center">
                          <span>MERCOSUL</span>
                          <span>BRASIL 🇧🇷</span>
                        </div>
                        <div className="bg-white py-1 px-2">
                          <span className="font-black text-2xl tracking-widest text-slate-950 font-mono">
                            {v.placa}
                          </span>
                        </div>
                      </div>

                      {/* Dados Técnicos */}
                      <div className="text-[10px] font-bold text-slate-700 mb-1.5 truncate max-w-full">
                        <span>{v.modelo}</span> &middot;{' '}
                        <span className="text-[#004724]">{v.tipoTracao || 'Frota Ambipar'}</span>
                      </div>

                      {/* QR Code */}
                      <div className="p-1.5 bg-white rounded-xl border border-dashed border-[#004724] my-1">
                        {qrUrl ? (
                          <img
                            src={qrUrl}
                            alt={`QR Code ${v.placa}`}
                            className="w-36 h-36 object-contain"
                          />
                        ) : (
                          <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                            Gerando...
                          </div>
                        )}
                      </div>

                      {/* Instrução Breve */}
                      <p className="text-[9px] text-slate-600 font-semibold mt-1">
                        Aponte a câmera &bull; Digite o CPF &bull; Inicie o Checklist
                      </p>

                      {/* Rodapé */}
                      <div className="mt-2 pt-1 border-t border-slate-200 w-full flex items-center justify-between text-[8px] text-slate-500 font-bold">
                        <span>{mot ? `Titular: ${mot.nome}` : 'Frota Geral'}</span>
                        <span className="text-[#004724]">0800 771 3778</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
