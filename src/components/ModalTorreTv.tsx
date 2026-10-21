import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Clock,
  Truck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Fuel,
  Leaf,
  Users,
  Calendar,
  Activity,
  Radio,
  Sparkles,
  ClipboardCheck,
  Wrench,
  TrendingUp,
} from 'lucide-react';
import {
  Viagem,
  Veiculo,
  Motorista,
  ChecklistDiario,
  Manutencao,
  DocumentoAmbiental,
  Ocorrencia,
} from '../types';
import { formatNumber, formatCurrency, getTodayLocalBR } from '../utils/formatters';
import { calculateEsgMetrics } from '../utils/esgCalculator';

interface ModalTorreTvProps {
  isOpen: boolean;
  onClose: () => void;
  veiculos: Veiculo[];
  motoristas: Motorista[];
  viagens: Viagem[];
  checklists: ChecklistDiario[];
  manutencoes: Manutencao[];
  mtrs: DocumentoAmbiental[];
  ocorrencias: Ocorrencia[];
}

export const ModalTorreTv: React.FC<ModalTorreTvProps> = ({
  isOpen,
  onClose,
  veiculos,
  motoristas,
  viagens,
  checklists,
  manutencoes,
  mtrs,
  ocorrencias,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Relógio ao vivo atualizado a cada 1 segundo
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Tecla ESC para sair ou F11
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Controle de Fullscreen nativo
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Erro ao ativar tela cheia:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Erro ao sair da tela cheia:', err);
      });
    }
  };

  if (!isOpen) return null;

  // Cálculos Operacionais
  const hoje = getTodayLocalBR();
  const viagensEmTransito = viagens.filter((v) => v.status === 'Em Trânsito');
  const viagensNoCliente = viagens.filter(
    (v) => v.status === 'No Cliente' || v.status === 'Carregando' || v.status === 'Descarregando'
  );
  const viagensAtrasadas = viagens.filter((v) => v.status === 'Atrasada');
  const viagensConcluidas = viagens.filter((v) => v.status === 'Concluída');
  const totalToneladas = viagens.reduce((acc, v) => acc + (v.pesoToneladas || 0), 0);

  const veiculosDisponiveis = veiculos.filter(
    (v) => v.status === 'Disponível' || !v.status
  ).length;
  const veiculosEmViagem = veiculos.filter((v) => v.status === 'Em Viagem').length;
  const veiculosManutencao = veiculos.filter((v) => v.status === 'Em Manutenção').length;

  const checklistsHoje = checklists.filter((c) => c.dataHora.startsWith(hoje));
  const checklistsAvariados = checklistsHoje.filter(
    (c) => c.possuiAvarias || c.avariasRetornoDetectadas
  );

  const ocorrenciasAbertas = ocorrencias.filter((o) => o.status !== 'Concluída');

  // Cálculos ESG
  let totalCo2Evitado = 0;
  viagens.forEach((v) => {
    const esg = calculateEsgMetrics(v.distanciaKm, v.tipoCombustivel);
    totalCo2Evitado += esg.co2EvitadoKg;
  });

  // Formatação de data e hora do relógio
  const horaFormatada = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dataFormatada = currentTime.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none animate-fadeIn">
      {/* =========================================================
          1. HEADER SUPERIOR - ESTILO CCO / NASA DA AMBIPAR
          ========================================================= */}
      <header className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur flex items-center justify-between gap-4 shrink-0 shadow-2xl">
        <div className="flex items-center gap-4">
          {/* Logo Corporativo Ambipar */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-950 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-600/30 border border-emerald-400/30 ring-2 ring-emerald-500/20">
            A
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-xl tracking-tight text-white flex items-center gap-1.5">
                <span>AMBIPAR LOGISTICS</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>CCO &bull; Torre de Controle Ativa</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                Base Operacional Paulínia/SP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Monitoramento em Tempo Real &bull; Conformidade SASSMAQ &bull; Rastreabilidade MTR/SINIR
            </p>
          </div>
        </div>

        {/* Relógio Digital em Tempo Real */}
        <div className="hidden md:flex items-center gap-4 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block capitalize">
              {dataFormatada}
            </span>
            <span className="text-2xl font-black font-mono tracking-widest text-emerald-400 leading-none">
              {horaFormatada} <span className="text-xs text-slate-500 font-sans">BRT</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Controles de Janela */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Expandir para Tela Cheia (F11)'}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-cyan-400" />
            )}
            <span className="hidden sm:inline">
              {isFullscreen ? 'Janela Normal' : 'Modo Telão (F11)'}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition"
            title="Fechar Modo Torre TV (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* =========================================================
          2. CARDS DE KPIS GIGANTES (GRID SUPERIOR)
          ========================================================= */}
      <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 shrink-0">
        {/* KPI 1: Viagens em Rota */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-blue-400 font-bold uppercase tracking-wider">
            <span>Em Rota</span>
            <Truck className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono">
              {viagensEmTransito.length}
            </span>
            <span className="text-[11px] text-slate-400">cargas</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {totalToneladas ? `${totalToneladas.toFixed(1)} ton transportadas` : 'Sem viagens ativas'}
          </p>
        </div>

        {/* KPI 2: No Cliente */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-indigo-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-bold uppercase tracking-wider">
            <span>No Cliente</span>
            <MapPin className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono">
              {viagensNoCliente.length}
            </span>
            <span className="text-[11px] text-slate-400">em operação</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Carga / descarga química
          </p>
        </div>

        {/* KPI 3: Frota Disponível */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-wider">
            <span>Pátio Livre</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono">
              {veiculosDisponiveis}
            </span>
            <span className="text-[11px] text-slate-400">veículos</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Prontos para despacho
          </p>
        </div>

        {/* KPI 4: Manutenção / Oficina */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-wider">
            <span>Manutenção</span>
            <Wrench className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono">
              {veiculosManutencao}
            </span>
            <span className="text-[11px] text-slate-400">em revisão</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {manutencoes.filter((m) => m.status === 'Agendada' || m.status === 'Em Execução').length} OS programadas
          </p>
        </div>

        {/* KPI 5: Checklists Hoje */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <span>Checklists Hoje</span>
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono">
              {checklistsHoje.length}
            </span>
            <span className="text-[11px] text-slate-400">concluídos</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {checklistsAvariados.length > 0 ? (
              <span className="text-rose-400 font-bold">{checklistsAvariados.length} avarias anotadas</span>
            ) : (
              <span className="text-emerald-400 font-bold">100% sem avarias</span>
            )}
          </p>
        </div>

        {/* KPI 6: ESG & SASSMAQ */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-wider">
            <span>SASSMAQ &bull; ESG</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {ocorrenciasAbertas.length === 0 ? '100%' : 'ATENÇÃO'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {ocorrenciasAbertas.length === 0
              ? 'Conformidade total SASSMAQ'
              : `${ocorrenciasAbertas.length} ocorrência(s) em aberto`}
          </p>
        </div>
      </div>

      {/* =========================================================
          3. PAINEL CENTRAL DIVIDIDO (MONITORAMENTO AO VIVO)
          ========================================================= */}
      <div className="flex-1 px-4 sm:px-6 pb-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Coluna Esquerda: Viagens e Cargas em Tempo Real (7 colunas) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col overflow-hidden shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Viagens &amp; Despachos Operacionais em Andamento
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {viagens.length} viagens registradas
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-3">
            {viagens.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
                <Truck className="w-12 h-12 text-slate-600 animate-bounce" />
                <p className="text-sm font-bold text-slate-300">Nenhuma viagem em trânsito no momento</p>
                <p className="text-xs text-slate-500 max-w-sm">
                  Quando você cadastrar viagens ou despachar caminhões na aba Viagens, elas aparecerão ao vivo neste telão.
                </p>
              </div>
            ) : (
              viagens.slice(0, 10).map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner"
                >
                  <div className="flex items-center gap-3">
                    {/* Placa Mercosul Estilizada */}
                    <div className="w-20 rounded border border-slate-700 overflow-hidden bg-white text-slate-950 shrink-0 shadow-sm">
                      <div className="bg-[#003399] text-white text-[7px] font-black px-1 py-0.2 flex items-center justify-between">
                        <span>BR</span>
                        <span>🇧🇷</span>
                      </div>
                      <div className="text-[11px] font-mono font-black text-center py-0.5 tracking-wider">
                        {v.placaCavalo}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-xs font-bold">
                          {v.codigoViagem} &bull; {v.origem} &rarr; {v.destino}
                        </strong>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            v.status === 'Em Trânsito'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : v.status === 'No Cliente' || v.status === 'Carregando' || v.status === 'Descarregando'
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : v.status === 'Concluída'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        <span className="text-slate-300 font-semibold">{v.motorista}</span> &bull;{' '}
                        Cliente: <span className="text-white font-medium">{v.cliente}</span>
                      </p>
                      <p className="text-[10px] text-emerald-400 mt-0.5">
                        Resíduo: {v.classeResiduo} &bull; {v.pesoToneladas} Ton &bull; MTR: {v.numeroMTR || 'Emitido'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Distância / Previsão</span>
                    <span className="text-xs font-mono font-bold text-slate-200 block">
                      {v.distanciaKm} km &bull; {v.dataChegadaPrevista ? v.dataChegadaPrevista.slice(11, 16) || v.dataChegadaPrevista.slice(0, 10) : '--:--'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna Direita: Checklists da Madrugada & Pátio (5 colunas) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col overflow-hidden shadow-xl space-y-4">
          {/* Box 1: Últimos Checklists Operacionais */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Checklists Pré &amp; Pós-Jornada (Hoje)
                </h4>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">
                {checklistsHoje.length} realizados
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mt-2.5">
              {checklists.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Nenhum checklist registrado ainda. Os motoristas registram pelo QR Code da cabine.
                </div>
              ) : (
                checklists.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-xs text-white bg-slate-800 px-2 py-0.5 rounded">
                        {c.veiculoPlaca}
                      </span>
                      <div>
                        <span className="text-slate-300 font-bold block">{c.motoristaNome}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {c.tipoInspecao} &bull; {c.dataHora.slice(11, 16)} &bull; Odômetro: {c.kmInicial.toLocaleString('pt-BR')} km
                        </span>
                      </div>
                    </div>
                    {c.possuiAvarias ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                        Avaria
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        Aprovado
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Box 2: Radar de Manutenções & Frota no Pátio */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2 shrink-0">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Radar de Prevenção &amp; SASSMAQ</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold">Oficina &amp; Validades</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Caminhões Prontos no Pátio</span>
                <strong className="text-white text-sm font-mono">{veiculosDisponiveis} veículos</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Revisões Programadas</span>
                <strong className="text-amber-400 text-sm font-mono">
                  {manutencoes.filter((m) => m.status === 'Agendada').length} agendadas
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          4. TICKER DIGITAL ANIMADO (RODAPÉ ESTILO CENTRAL DA NASA)
          ========================================================= */}
      <footer className="h-10 bg-slate-900 border-t border-slate-800 flex items-center px-4 overflow-hidden shrink-0">
        <div className="flex items-center gap-2 shrink-0 bg-emerald-950/90 text-emerald-400 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border border-emerald-800 mr-4 z-10 shadow-sm">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>PLANTÃO 24H</span>
        </div>

        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee text-xs font-mono text-slate-300 space-x-8">
            <span className="text-emerald-400 font-bold">
              [SISTEMA AMBIPAR RESPONSE] Monitoramento ativo da Base Paulínia/SP
            </span>
            <span>&bull;</span>
            <span>
              FROTA: {veiculos.length} VEÍCULOS HOMOLOGADOS SASSMAQ
            </span>
            <span>&bull;</span>
            <span className="text-cyan-400">
              VIAGENS: {viagensEmTransito.length} EM TRÂNSITO COM MTR SINIR REGULAR
            </span>
            <span>&bull;</span>
            <span>
              CHECKLISTS DE CABINE: {checklistsHoje.length} VISTORIAS HOJE VIA QR CODE
            </span>
            <span>&bull;</span>
            <span className="text-emerald-400">
              CENTRAL QUÍMICA 24H: 0800 771 3778 / 0800 117 2020
            </span>
            <span>&bull;</span>
            <span>
              CONFORMIDADE ESG: {totalCo2Evitado.toFixed(0)} KG DE CO2 EVITADO
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
