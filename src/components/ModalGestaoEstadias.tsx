import React, { useState } from 'react';
import {
  X,
  Printer,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Truck,
  Building,
  User,
  FileText,
  Calendar,
  Timer,
  ChevronRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { Viagem } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface ModalGestaoEstadiasProps {
  isOpen: boolean;
  onClose: () => void;
  viagens: Viagem[];
}

export interface RegistroEstadia {
  id: string;
  viagemId?: string;
  placa: string;
  cliente: string;
  localOperacao: string;
  motorista: string;
  tipoOperacao: 'Carregamento de Resíduo' | 'Descarregamento / Destinação' | 'Aguardando Descontaminação de Tanque';
  capacidadeCargaToneladas: number;
  dataHoraChegada: string;
  dataHoraLiberacao?: string;
  status: 'Aguardando Carga/Descarga' | 'Janela de Tolerância (Até 5h)' | 'Estadia Ativa (Cobrança)' | 'Finalizada / Cobrada' | 'Isento / Abonado';
  observacao?: string;
}

export const ModalGestaoEstadias: React.FC<ModalGestaoEstadiasProps> = ({
  isOpen,
  onClose,
  viagens
}) => {
  if (!isOpen) return null;

  // Valor atualizado da ANTT por tonelada/hora (conforme IPCA / Lei 11.442)
  const VALOR_ANTT_TONELADA_HORA = 2.45;

  // Lista de estadias em monitoramento (inicializada com algumas viagens ativas e personalizáveis)
  const [estadias, setEstadias] = useState<RegistroEstadia[]>([
    {
      id: 'est-001',
      placa: 'AMB-8891',
      cliente: 'Braskem Polímeros S/A',
      localOperacao: 'Pátio de Expedição Química - Polo Mauá SP',
      motorista: 'Marcos Vinicius Ribeiro',
      tipoOperacao: 'Carregamento de Resíduo',
      capacidadeCargaToneladas: 32,
      dataHoraChegada: new Date(Date.now() - 7.5 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      status: 'Estadia Ativa (Cobrança)',
      observacao: 'Falta de operador no braço de carregamento do cliente. Aguardando desde as 07h00.',
    },
    {
      id: 'est-002',
      placa: 'LOG-4420',
      cliente: 'Petrobras Refinaria Replan',
      localOperacao: 'Base de Transbordo Paulínia SP',
      motorista: 'João Paulo Fernandes',
      tipoOperacao: 'Descarregamento / Destinação',
      capacidadeCargaToneladas: 28,
      dataHoraChegada: new Date(Date.now() - 3.2 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      status: 'Janela de Tolerância (Até 5h)',
      observacao: 'Análise laboratorial do laudo de entrada em andamento.',
    },
    {
      id: 'est-003',
      placa: 'ECO-9912',
      cliente: 'Suzano Papel & Celulose',
      localOperacao: 'Unidade Industrial Limeira SP',
      motorista: 'Carlos Alberto Ferreira',
      tipoOperacao: 'Carregamento de Resíduo',
      capacidadeCargaToneladas: 35,
      dataHoraChegada: new Date(Date.now() - 9.0 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      status: 'Estadia Ativa (Cobrança)',
      observacao: 'Balança de pesagem quebrada no pátio interno da fábrica.',
    }
  ]);

  const [novoModalOpen, setNovoModalOpen] = useState(false);
  const [estadiaSelecionada, setEstadiaSelecionada] = useState<RegistroEstadia | null>(null);

  // Form para nova estadia
  const [formPlaca, setFormPlaca] = useState(viagens[0]?.placaCavalo || 'AMB-7711');
  const [formCliente, setFormCliente] = useState(viagens[0]?.cliente || 'Cliente Ambipar');
  const [formMotorista, setFormMotorista] = useState(viagens[0]?.motorista || 'Motorista Titular');
  const [formLocal, setFormLocal] = useState('Pátio Industrial');
  const [formCapacidade, setFormCapacidade] = useState(30);
  const [formTipo, setFormTipo] = useState<RegistroEstadia['tipoOperacao']>('Carregamento de Resíduo');
  const [formChegada, setFormChegada] = useState(new Date().toISOString().slice(0, 16).replace('T', ' '));

  // Função para calcular horas paradas desde a chegada
  const calcularHoras = (dataHoraChegada: string, dataHoraLiberacao?: string) => {
    const chegada = new Date(dataHoraChegada.replace(' ', 'T')).getTime();
    const fim = dataHoraLiberacao ? new Date(dataHoraLiberacao.replace(' ', 'T')).getTime() : Date.now();
    const diffMs = Math.max(0, fim - chegada);
    const horasDecimais = diffMs / (1000 * 3600);
    return Math.round(horasDecimais * 10) / 10;
  };

  // Cálculo de Horas Excedentes (Lei 11.442: Acima de 5 horas)
  const calcularExcedente = (horasTotais: number) => {
    return Math.max(0, Math.round((horasTotais - 5.0) * 10) / 10);
  };

  // Cálculo do Valor Total da Estadia
  const calcularValorEstadia = (capacidadeTon: number, horasExcedentes: number) => {
    if (horasExcedentes <= 0) return 0;
    return Math.round(capacidadeTon * horasExcedentes * VALOR_ANTT_TONELADA_HORA * 100) / 100;
  };

  const handleCadastrarEstadia = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: RegistroEstadia = {
      id: `est-${Date.now()}`,
      placa: formPlaca,
      cliente: formCliente,
      localOperacao: formLocal,
      motorista: formMotorista,
      tipoOperacao: formTipo,
      capacidadeCargaToneladas: formCapacidade,
      dataHoraChegada: formChegada,
      status: 'Janela de Tolerância (Até 5h)',
      observacao: 'Registro de portaria inserido pelo analista de logística.',
    };
    setEstadias([nova, ...estadias]);
    setNovoModalOpen(false);
  };

  const handleLiberarEstadia = (id: string) => {
    const agora = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setEstadias(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          dataHoraLiberacao: agora,
          status: 'Finalizada / Cobrada',
        };
      }
      return item;
    }));
  };

  // Cálculos globais
  const totalEstadiasAtivas = estadias.filter(e => {
    const h = calcularHoras(e.dataHoraChegada, e.dataHoraLiberacao);
    return h > 5.0 && e.status !== 'Finalizada / Cobrada' && e.status !== 'Isento / Abonado';
  }).length;

  const totalValorRecuperavel = estadias.reduce((acc, item) => {
    const horas = calcularHoras(item.dataHoraChegada, item.dataHoraLiberacao);
    const exc = calcularExcedente(horas);
    return acc + calcularValorEstadia(item.capacidadeCargaToneladas, exc);
  }, 0);

  const handleWhatsAppNotificacao = (item: RegistroEstadia) => {
    const horas = calcularHoras(item.dataHoraChegada, item.dataHoraLiberacao);
    const exc = calcularExcedente(horas);
    const valor = calcularValorEstadia(item.capacidadeCargaToneladas, exc);

    const texto = `⚠️ *NOTIFICAÇÃO FORMAL DE ESTADIA - LEI 11.442/2007 (ART. 11, § 5º)*
*AMBIPAR LOGISTICS &bull; CONTROLE OPERACIONAL DE FROTA*
--------------------------------------------------
🏢 *Cliente Contratante:* ${item.cliente}
🚛 *Veículo Ambipar:* ${item.placa} (Capacidade: ${item.capacidadeCargaToneladas} t)
👤 *Motorista:* ${item.motorista}
📍 *Local:* ${item.localOperacao}
🔄 *Operação:* ${item.tipoOperacao}

⏱️ *Chegada no Local:* ${item.dataHoraChegada}
⏳ *Tempo Total Parado:* ${horas} horas
🛡️ *Franquia Legal Gratuita:* 5 horas (Excedida em *${exc}h*)

💰 *VALOR DEVIDO DA ESTADIA (ANTT):* ${formatCurrency(valor)}
_Base de cálculo: ${item.capacidadeCargaToneladas}t &times; ${exc}h &times; R$ ${VALOR_ANTT_TONELADA_HORA}/t.h_

Solicitamos a imediata liberação do conjunto para mitigar acréscimos na fatura.
Emissor: Carlos Eduardo (Analista de Logística Sênior &bull; Ambipar)`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col print:bg-white print:border-none print:shadow-none print:max-h-none print:w-full print:m-0">
        
        {/* Barra Superior */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Gestão de Estadias &amp; Cobrança de Paradas</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  Lei 11.442 / ANTT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoria de caminhões parados em clientes após 5h e cálculo de ressarcimento por tonelada/hora
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNovoModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <span>+ Registrar Chegada de Veículo</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6 space-y-6 text-slate-200 print:text-black print:p-6 print:space-y-4">
          
          {/* Banner da Lei 11.442 & Regulação ANTT */}
          <div className="border border-slate-700 print:border-black rounded-xl p-4 bg-gradient-to-r from-slate-950 via-amber-950/20 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  LEI FEDERAL Nº 11.442/2007 &bull; ART. 11, § 5º
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Coeficiente ANTT: R$ {VALOR_ANTT_TONELADA_HORA}/ton.hora
                </span>
              </div>
              <h3 className="text-base font-bold text-white print:text-black">
                Recuperação Financeira de Ociosidade &bull; Cobrança de Estadia em Clientes
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                O prazo máximo para carga e descarga de resíduos em clientes e plantas industriais é de <strong>5 (cinco) horas</strong>. Após este limite legal, cada hora ou fração adicional é faturada compulsoriamente contra o embarcador.
              </p>
            </div>

            <div className="flex sm:flex-col items-end justify-between border-t md:border-t-0 md:border-l border-slate-800 pl-0 md:pl-6 pt-3 md:pt-0">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total a Ressarcir / Cobrar</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                {formatCurrency(totalValorRecuperavel)}
              </span>
              <span className="text-[11px] text-rose-400 font-bold mt-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {totalEstadiasAtivas} veículo(s) gerando estadia
              </span>
            </div>
          </div>

          {/* Tabela de Monitoramento de Estadias */}
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-ambipar-400" />
                Painel Ativo de Estadias e Veículos em Pátios de Clientes ({estadias.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Tolerância regulamentar: 05:00h
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Veículo / Placa</th>
                    <th className="py-2.5 px-3">Cliente / Local</th>
                    <th className="py-2.5 px-3">Operação</th>
                    <th className="py-2.5 px-3 text-right">Capacidade</th>
                    <th className="py-2.5 px-3">Chegada</th>
                    <th className="py-2.5 px-3 text-center">Tempo Total</th>
                    <th className="py-2.5 px-3 text-center">Horas Excedentes</th>
                    <th className="py-2.5 px-3 text-right">Valor Estadia</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {estadias.map((item) => {
                    const horasTotais = calcularHoras(item.dataHoraChegada, item.dataHoraLiberacao);
                    const excedente = calcularExcedente(horasTotais);
                    const valorEstadia = calcularValorEstadia(item.capacidadeCargaToneladas, excedente);
                    const emCobranca = excedente > 0 && item.status !== 'Finalizada / Cobrada';

                    return (
                      <tr key={item.id} className={`hover:bg-slate-800/40 transition ${emCobranca ? 'bg-rose-950/15' : ''}`}>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-white text-xs block">{item.placa}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{item.motorista}</span>
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          <strong className="text-slate-200 block truncate">{item.cliente}</strong>
                          <span className="text-[11px] text-slate-400 block truncate">{item.localOperacao}</span>
                        </td>

                        <td className="py-3 px-3 text-slate-300">
                          <span className="text-[11px] block">{item.tipoOperacao}</span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-white">
                          {item.capacidadeCargaToneladas} t
                        </td>

                        <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                          {item.dataHoraChegada}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                            horasTotais > 5.0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {horasTotais}h
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-mono">
                          {excedente > 0 ? (
                            <span className="text-rose-400 font-black">+{excedente}h</span>
                          ) : (
                            <span className="text-slate-500">0.0h</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-sm">
                          {valorEstadia > 0 ? (
                            <span className="text-amber-400">{formatCurrency(valorEstadia)}</span>
                          ) : (
                            <span className="text-slate-500">R$ 0,00</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Finalizada / Cobrada'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : excedente > 0
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {item.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {excedente > 0 && (
                              <button
                                type="button"
                                onClick={() => handleWhatsAppNotificacao(item)}
                                title="Enviar Notificação Formal ao Cliente via WhatsApp"
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {item.status !== 'Finalizada / Cobrada' && (
                              <button
                                type="button"
                                onClick={() => handleLiberarEstadia(item.id)}
                                title="Registrar Liberação e Faturar Estadia"
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700 font-semibold transition"
                              >
                                Liberar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal de Cadastro de Nova Chegada */}
          {novoModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 space-y-4 text-xs shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    Registrar Chegada de Conjunto para Carga/Descarga
                  </h3>
                  <button onClick={() => setNovoModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCadastrarEstadia} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Placa do Veículo</label>
                      <input
                        type="text"
                        value={formPlaca}
                        onChange={(e) => setFormPlaca(e.target.value.toUpperCase())}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Capacidade Líquida (t)</label>
                      <input
                        type="number"
                        value={formCapacidade}
                        onChange={(e) => setFormCapacidade(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Cliente Contratante</label>
                    <input
                      type="text"
                      value={formCliente}
                      onChange={(e) => setFormCliente(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Pátio / Endereço da Operação</label>
                    <input
                      type="text"
                      value={formLocal}
                      onChange={(e) => setFormLocal(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Tipo de Operação</label>
                      <select
                        value={formTipo}
                        onChange={(e) => setFormTipo(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="Carregamento de Resíduo">Carregamento de Resíduo</option>
                        <option value="Descarregamento / Destinação">Descarregamento / Destinação</option>
                        <option value="Aguardando Descontaminação de Tanque">Aguardando Descontaminação</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Data/Hora Chegada na Portaria</label>
                      <input
                        type="text"
                        value={formChegada}
                        onChange={(e) => setFormChegada(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setNovoModalOpen(false)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold"
                    >
                      Salvar Chegada
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <span>Relatório gerado em conformidade com o Procedimento Operacional Padrão Ambipar &bull; Lei 11.442</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
