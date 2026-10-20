import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Printer,
  Share2,
  Download,
  Copy,
  Check,
  Truck,
  Smartphone,
  ShieldCheck,
  Info,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { Veiculo, Motorista } from '../types';

interface ModalQrCodeChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  veiculos: Veiculo[];
  motoristas: Motorista[];
  placaInicial?: string;
}

export const ModalQrCodeChecklist: React.FC<ModalQrCodeChecklistProps> = ({
  isOpen,
  onClose,
  veiculos,
  motoristas,
  placaInicial,
}) => {
  const [selectedPlaca, setSelectedPlaca] = useState<string>(placaInicial || '');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');
  const printableRef = useRef<HTMLDivElement>(null);

  // Determinar veículo selecionado
  const veiculoSelecionado = veiculos.find(
    (v) => v.placa.toUpperCase() === selectedPlaca.toUpperCase()
  );

  // Determinar motorista titular vinculado
  const motoristaTitular = motoristas.find(
    (m) =>
      (m.veiculoFixoPlaca &&
        m.veiculoFixoPlaca.toUpperCase() === selectedPlaca.toUpperCase()) ||
      (veiculoSelecionado?.motoristaTitularNome &&
        m.nome.toLowerCase() ===
          veiculoSelecionado.motoristaTitularNome.toLowerCase())
  );

  // Definir URL do Checklist
  const getChecklistUrl = () => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://analistalogisticaambipar.vercel.app';

    if (selectedPlaca) {
      return `${origin}/?portal=motorista&placa=${encodeURIComponent(
        selectedPlaca.toUpperCase()
      )}`;
    }
    return `${origin}/?portal=motorista`;
  };

  const checklistUrl = getChecklistUrl();

  // Gerar QR Code sempre que mudar a placa
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
      `*AMBIPAR LOGISTICS - CHECKLIST DIÁRIO*\n\n` +
        `Olá ${motoristaTitular ? motoristaTitular.nome : 'Motorista'},\n` +
        `Acesse o link abaixo para realizar a vistoria e checklist pré/pós-jornada do veículo *${
          selectedPlaca || 'da Frota'
        }*:\n\n` +
        `🔗 ${checklistUrl}\n\n` +
        `_Lembrete: Digite seu CPF para autenticar e registre eventuais avarias fotográficas. Protocolo SASSMAQ / Ambipar 24h._`
    );

    const waUrl = telefone
      ? `https://api.whatsapp.com/send?phone=55${telefone}&text=${texto}`
      : `https://api.whatsapp.com/send?text=${texto}`;

    window.open(waUrl, '_blank');
  };

  const veiculosFiltrados = veiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      v.modelo.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      (v.motoristaTitularNome &&
        v.motoristaTitularNome.toLowerCase().includes(filtroBusca.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      {/* Estilo CSS exclusivo para impressão da Plaqueta de Cabine */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #plaqueta-ambipar-print, #plaqueta-ambipar-print * {
            visibility: visible;
          }
          #plaqueta-ambipar-print {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 150mm !important;
            box-shadow: none !important;
            border: 2px solid #00A859 !important;
            background: white !important;
            color: #0f172a !important;
            padding: 16px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ambipar-500/10 border border-ambipar-500/30 flex items-center justify-center text-ambipar-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Gerador de QR Code Operacional &middot; Frota Ambipar
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ambipar-500/20 text-ambipar-400 border border-ambipar-500/30 uppercase">
                  Plaqueta de Cabine SASSMAQ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gere e imprima o adesivo de cabine / para-brisa para os motoristas realizarem o checklist diário pelo celular.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Seletor de Veículo & Configurações */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Selecione o Caminhão ou Totem Geral
              </label>
              <input
                type="text"
                placeholder="Buscar placa, modelo ou motorista..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-ambipar-500 mb-2"
              />

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-slate-800/80 rounded-xl p-2 bg-slate-950/60">
                {/* Opção Totem Geral */}
                <button
                  type="button"
                  onClick={() => setSelectedPlaca('')}
                  className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between ${
                    selectedPlaca === ''
                      ? 'bg-ambipar-500/15 border-ambipar-500 text-white font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Totem Geral da Base</p>
                      <p className="text-[11px] text-slate-400">
                        O motorista seleciona a placa na tela
                      </p>
                    </div>
                  </div>
                  {selectedPlaca === '' && (
                    <span className="w-2 h-2 rounded-full bg-ambipar-400"></span>
                  )}
                </button>

                {veiculosFiltrados.map((v) => {
                  const isSelected =
                    v.placa.toUpperCase() === selectedPlaca.toUpperCase();
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedPlaca(v.placa)}
                      className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-ambipar-500/15 border-ambipar-500 text-white font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Truck
                          className={`w-4 h-4 ${
                            isSelected ? 'text-ambipar-400' : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black tracking-wider text-white">
                              {v.placa}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {v.tipoTracao || 'Frota'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-[190px]">
                            {v.modelo}
                          </p>
                          {v.motoristaTitularNome && (
                            <p className="text-[10px] text-emerald-400 truncate max-w-[190px]">
                              Titular: {v.motoristaTitularNome}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-ambipar-400"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Informações do Veículo Selecionado */}
            {veiculoSelecionado ? (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Equipamento:</span>
                  <span className="text-white font-medium">{veiculoSelecionado.tipoEquipamento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estrutura:</span>
                  <span className="text-white font-medium">
                    {veiculoSelecionado.isSemCarreta
                      ? 'Rígido (Sem Carreta)'
                      : 'Articulado (Cavalo + Carreta)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Odômetro Atual:</span>
                  <span className="text-cyan-400 font-bold">
                    {veiculoSelecionado.odometroAtualKm.toLocaleString('pt-BR')} km
                  </span>
                </div>
                {motoristaTitular && (
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Motorista Fixo:</span>
                    <span className="text-emerald-400 font-medium">{motoristaTitular.nome}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs text-cyan-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                <p>
                  Modo <strong>Totem Geral da Base</strong>: O motorista lerá o QR Code com a câmera do celular e selecionará a placa do veículo na tela inicial.
                </p>
              </div>
            )}

            {/* Link Direto */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Link de Acesso Direto
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={checklistUrl}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copiar Link"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Botões de Ações Rápidas */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleEnviarWhatsapp}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Motorista</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Imagem PNG</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleImprimirPlaqueta}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-ambipar-600 to-emerald-600 hover:from-ambipar-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-ambipar-600/30 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Plaqueta Oficial (Cabine)</span>
            </button>
          </div>

          {/* Coluna Direita: Preview da Plaqueta de Cabine Timbrada Ambipar */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-ambipar-400" />
              Preview da Plaqueta de Identificação de Cabine (Adesivo Para-brisa)
            </span>

            {/* Plaqueta Timbrada Ambipar para Impressão */}
            <div
              id="plaqueta-ambipar-print"
              ref={printableRef}
              className="w-full max-w-[370px] bg-white text-slate-900 rounded-2xl shadow-2xl border-4 border-emerald-600 p-4 flex flex-col items-center text-center transition-all"
            >
              {/* Tarja Superior Ambipar */}
              <div className="w-full bg-emerald-700 text-white py-1.5 px-3 rounded-lg mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-white text-emerald-800 font-black flex items-center justify-center text-xs">
                    A
                  </div>
                  <span className="font-extrabold text-xs tracking-wider">AMBIPAR LOGISTICS</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-200">
                  SASSMAQ &middot; ESG
                </span>
              </div>

              {/* Subtítulo */}
              <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">
                Checklist Obrigatório Diário &middot; Pré / Pós Jornada
              </p>

              {/* Box Placa Mercosul */}
              <div className="w-full max-w-[260px] border-2 border-slate-800 rounded-lg overflow-hidden shadow-sm mb-3">
                <div className="bg-blue-800 text-white text-[9px] font-extrabold py-0.5 px-2 flex justify-between items-center">
                  <span>BRASIL</span>
                  <span className="text-[8px] bg-white text-blue-900 px-1 rounded font-black">BR</span>
                </div>
                <div className="bg-white py-1 px-3">
                  <span className="font-black text-2xl tracking-widest text-slate-900 font-mono">
                    {selectedPlaca ? selectedPlaca.toUpperCase() : 'FROTA GERAL'}
                  </span>
                </div>
              </div>

              {/* Veículo Especificado */}
              {veiculoSelecionado && (
                <div className="text-[11px] font-bold text-slate-700 mb-2">
                  <span>{veiculoSelecionado.modelo}</span>
                  <span className="text-slate-400 mx-1">&middot;</span>
                  <span className="text-emerald-700">
                    {veiculoSelecionado.tipoTracao || 'Frota Ambipar'}
                  </span>
                </div>
              )}

              {/* QR Code Container */}
              <div className="p-2 bg-white rounded-xl border-2 border-dashed border-emerald-500 shadow-inner my-1">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`QR Code Checklist ${selectedPlaca}`}
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                    Gerando QR Code...
                  </div>
                )}
              </div>

              {/* Instruções de Uso */}
              <div className="mt-3 text-left w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-black">
                    1
                  </span>
                  <span>Aponte a câmera do seu celular para este QR Code</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span className="w-4 h-4 rounded-full bg-slate-700 text-white text-[10px] flex items-center justify-center font-black">
                    2
                  </span>
                  <span>Digite seu CPF para validar o acesso</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span className="w-4 h-4 rounded-full bg-slate-700 text-white text-[10px] flex items-center justify-center font-black">
                    3
                  </span>
                  <span>Realize a vistoria de 26 itens e registre fotos de avarias</span>
                </div>
              </div>

              {/* Rodapé de Emergência e Suporte */}
              <div className="mt-3 pt-2 border-t border-slate-200 w-full flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                <span>Ambipar Response 24h: 0800 771 3778</span>
                <span className="text-emerald-700 font-bold">Base Operacional Paulínia/SP</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 text-center">
              Recomendação: Imprima em papel adesivo laminado ou plastificado e afixe no canto inferior do para-brisa ou no painel do veículo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
