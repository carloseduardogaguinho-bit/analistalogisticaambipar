import React, { useState } from 'react';
import {
  X,
  Printer,
  Send,
  Clock,
  UserCheck,
  Truck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
  ClipboardList,
  Flame,
  ShieldAlert,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { Viagem, Veiculo, Motorista, Manutencao, Ocorrencia, DocumentoAmbiental } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ModalPassagemPlantaoProps {
  isOpen: boolean;
  onClose: () => void;
  viagens: Viagem[];
  veiculos: Veiculo[];
  motoristas: Motorista[];
  manutencoes: Manutencao[];
  ocorrencias: Ocorrencia[];
  mtrs: DocumentoAmbiental[];
}

export const ModalPassagemPlantao: React.FC<ModalPassagemPlantaoProps> = ({
  isOpen,
  onClose,
  viagens,
  veiculos,
  motoristas,
  manutencoes,
  ocorrencias,
  mtrs
}) => {
  if (!isOpen) return null;

  const [turno, setTurno] = useState<'Diurno (06:00 às 18:00)' | 'Noturno (18:00 às 06:00)' | 'Turno Administrativo'>('Diurno (06:00 às 18:00)');
  const [analistaEntregando, setAnalistaEntregando] = useState('Carlos Eduardo - Analista de Logística Sênior');
  const [analistaRecebendo, setAnalistaRecebendo] = useState('Plantão Noturno / Próximo Turno');
  const [dataFechamento] = useState(new Date().toLocaleDateString('pt-BR'));
  const [horaFechamento] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

  // Anotações operacionais do analista
  const [prioridadesProximoTurno, setPrioridadesProximoTurno] = useState(
    '1. Acompanhar descarga da Carreta Tanque na Base Paulínia até as 21h30.\n' +
    '2. Conferir liberação de SM Buonny para os 2 primeiros veículos da manhã de amanhã.\n' +
    '3. Cobrar retorno da oficina sobre troca de tambor de freio da placa FGH-3344.\n' +
    '4. Monitorar MTRs pendentes de baixa no sistema SINIR / CETESB.'
  );

  const [destaquesPositivos, setDestaquesPositivos] = useState(
    'Zero acidentes ambientais no turno. 100% dos checklists pré-viagem realizados sem evasão. Economia de frete mantida acima de 12% na tabela ANTT.'
  );

  // KPIs dinâmicos calculados do sistema
  const viagensEmTransito = viagens.filter(v => v.status === 'Em Trânsito');
  const viagensNoCliente = viagens.filter(v => v.status === 'No Cliente' || v.status === 'Carregando' || v.status === 'Descarregando');
  const viagensProgramadas = viagens.filter(v => v.status === 'Programada');
  const viagensConcluidas = viagens.filter(v => v.status === 'Concluída');
  const viagensAtrasadas = viagens.filter(v => v.status === 'Atrasada');

  const veiculosOficina = manutencoes.filter(m => m.status === 'Agendada' || m.status === 'Em Execução');
  const motoristasAtivos = motoristas.filter(m => m.status === 'Ativo');
  const ocorrenciasPendentes = ocorrencias.filter(o => o.status !== 'Concluída');
  const mtrsPendentes = mtrs.filter(m => m.status !== 'CDF Gerado' && m.status !== 'Recebido no Destino');

  const volumeTotalTurno = viagens.reduce((acc, v) => acc + (v.pesoToneladas || 0), 0);
  const custoTotalTurno = viagens.reduce((acc, v) => acc + (v.custoTotal || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleEnviarWhatsApp = () => {
    const texto = `📋 *PASSAGEM DE PLANTÃO & FECHAMENTO DE TURNO*
*AMBIPAR LOGISTICS - TORRE DE CONTROLE*
----------------------------------------
📅 *Data:* ${dataFechamento} às ${horaFechamento}
⏱️ *Turno:* ${turno}
👤 *Analista Responsável:* ${analistaEntregando}
🤝 *Recebendo Plantão:* ${analistaRecebendo}

📊 *RESUMO OPERACIONAL DO TURNO:*
🚛 *Viagens em Trânsito:* ${viagensEmTransito.length}
🏢 *Operando em Clientes/Bases:* ${viagensNoCliente.length}
⏳ *Programadas para Próximo Turno:* ${viagensProgramadas.length}
✅ *Viagens Concluídas:* ${viagensConcluidas.length}
⚠️ *Atrasadas / Atenção:* ${viagensAtrasadas.length}
🔧 *Veículos em Manutenção:* ${veiculosOficina.length}
🚨 *Ocorrências em Aberto:* ${ocorrenciasPendentes.length}
📄 *MTRs Pendentes de Baixa:* ${mtrsPendentes.length}
⚖️ *Volume Transportado:* ${volumeTotalTurno.toFixed(1)} t

📌 *PRIORIDADES CRÍTICAS P/ PRÓXIMO TURNO:*
${prioridadesProximoTurno}

🌟 *DESTAQUES & SEGURANÇA:*
${destaquesPositivos}

----------------------------------------
_Relatório emitido via Sistema de Logística Ambipar (Carlos Eduardo)_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col print:bg-white print:border-none print:shadow-none print:max-h-none print:w-full print:m-0">
        
        {/* Barra Superior / Ações */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ambipar-500/20 border border-ambipar-500/40 flex items-center justify-center text-ambipar-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Passagem de Plantão & Fechamento de Turno</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-ambipar-500/10 text-ambipar-400 border border-ambipar-500/30 font-bold">
                  SOP-LOG-02
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Relatório executivo de transição operacional da Torre de Logística Ambipar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnviarWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
              title="Disparar no grupo da gerência"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-600 transition"
              title="Imprimir Relatório Oficial"
            >
              <Printer className="w-4 h-4 text-ambipar-400" />
              <span className="hidden sm:inline">Imprimir A4</span>
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
          
          {/* Header Oficial do Relatório */}
          <div className="border border-slate-700 print:border-black rounded-xl p-4 bg-slate-950/60 print:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-ambipar-500 text-slate-950 rounded-xl flex items-center justify-center font-black text-xl tracking-tighter">
                AMB
              </div>
              <div>
                <h2 className="text-base font-black text-white print:text-black tracking-tight uppercase">
                  Ambipar Logistics &bull; Torre de Controle Operacional
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  Ata Executiva de Passagem de Turno & Indicadores Logísticos
                </p>
                <div className="text-[11px] text-slate-400 print:text-slate-700 mt-1 flex flex-wrap gap-x-3">
                  <span><strong>Data:</strong> {dataFechamento}</span>
                  <span><strong>Horário:</strong> {horaFechamento}</span>
                  <span><strong>Turno:</strong> {turno}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end border-t sm:border-t-0 sm:border-l border-slate-800 print:border-black pt-3 sm:pt-0 sm:pl-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 print:text-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-ambipar-400 print:text-black" />
                <span>Analista Responsável:</span>
              </div>
              <strong className="text-white print:text-black text-sm">{analistaEntregando}</strong>
              <span className="text-[11px] text-emerald-400 print:text-emerald-800 font-semibold mt-0.5">
                Plantão Ativo &bull; Ambipar Base SP
              </span>
            </div>
          </div>

          {/* Configuração dos Analistas do Turno (Oculto no Print) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Turno de Trabalho</label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="Diurno (06:00 às 18:00)">Diurno (06:00 às 18:00)</option>
                <option value="Noturno (18:00 às 06:00)">Noturno (18:00 às 06:00)</option>
                <option value="Turno Administrativo">Turno Administrativo</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Analista que Entrega</label>
              <input
                type="text"
                value={analistaEntregando}
                onChange={(e) => setAnalistaEntregando(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Analista que Recebe</label>
              <input
                type="text"
                value={analistaRecebendo}
                onChange={(e) => setAnalistaRecebendo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
          </div>

          {/* Grid de Métricas do Fechamento */}
          <div>
            <h3 className="text-xs font-bold text-white print:text-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-ambipar-400 print:text-black" />
              Painel Consolidado de Status da Frota e Viagens
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">Em Trânsito</span>
                <span className="text-xl font-black text-blue-400 print:text-black mt-0.5 block">{viagensEmTransito.length}</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600">monitoramento ativo</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">Clientes / Carga</span>
                <span className="text-xl font-black text-amber-400 print:text-black mt-0.5 block">{viagensNoCliente.length}</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600">em pátios externos</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">Programadas Próximo</span>
                <span className="text-xl font-black text-purple-400 print:text-black mt-0.5 block">{viagensProgramadas.length}</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600">aguardando saída</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">Viagens Concluídas</span>
                <span className="text-xl font-black text-emerald-400 print:text-black mt-0.5 block">{viagensConcluidas.length}</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600">descargas finalizadas</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">Oficina / Manutenção</span>
                <span className="text-xl font-black text-orange-400 print:text-black mt-0.5 block">{veiculosOficina.length}</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600">veículos parados</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">Ocorrências Abertas</span>
                <span className="text-xl font-black text-rose-400 print:text-black mt-0.5 block">{ocorrenciasPendentes.length}</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600">exigem tratamento</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">MTRs Pendentes</span>
                <span className="text-xl font-black text-cyan-400 print:text-black mt-0.5 block">{mtrsPendentes.length}</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600">baixa no SINIR</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">Volume Total</span>
                <span className="text-xl font-black text-ambipar-400 print:text-black mt-0.5 block">{volumeTotalTurno.toFixed(1)} t</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600">resíduos expedidos</span>
              </div>
            </div>
          </div>

          {/* Seção de Prioridades Críticas & Repasse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:border-black print:bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-amber-400 print:text-black uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 print:text-black" />
                Prioridades Críticas para o Próximo Analista
              </label>
              <textarea
                rows={5}
                value={prioridadesProximoTurno}
                onChange={(e) => setPrioridadesProximoTurno(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 print:bg-white print:border-black rounded-lg p-2.5 text-xs text-white print:text-black leading-relaxed"
              ></textarea>
              <span className="text-[10px] text-slate-500 print:hidden block">
                Itens prioritários que o analista que assume deve verificar na primeira hora.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:border-black print:bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-emerald-400 print:text-black uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-black" />
                Destaques de Segurança & ESG do Turno
              </label>
              <textarea
                rows={5}
                value={destaquesPositivos}
                onChange={(e) => setDestaquesPositivos(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 print:bg-white print:border-black rounded-lg p-2.5 text-xs text-white print:text-black leading-relaxed"
              ></textarea>
              <span className="text-[10px] text-slate-500 print:hidden block">
                Registros de conformidade, zero acidentes e desempenho econômico.
              </span>
            </div>
          </div>

          {/* Tabela Rápida de Viagens que Permanecem em Trânsito */}
          {viagensEmTransito.length > 0 && (
            <div className="border border-slate-800 print:border-black rounded-xl overflow-hidden">
              <div className="bg-slate-950 p-2.5 border-b border-slate-800 print:border-black flex items-center justify-between">
                <span className="text-xs font-bold text-white print:text-black uppercase tracking-wider">
                  Viagens que Permanecem Rodando no Plantão Seguinte ({viagensEmTransito.length})
                </span>
                <span className="text-[10px] text-slate-400 print:text-slate-600 font-mono">
                  Monitoramento 24h
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 print:bg-slate-100 text-slate-400 print:text-black border-b border-slate-800 print:border-black text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Veículo / Motorista</th>
                      <th className="py-2 px-3">Origem &rarr; Destino</th>
                      <th className="py-2 px-3">Resíduo / MTR</th>
                      <th className="py-2 px-3">Previsão Chegada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {viagensEmTransito.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono font-bold text-white print:text-black">{v.codigoViagem}</td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-white print:text-black">{v.placaCavalo}</span>
                          <span className="text-slate-400 print:text-slate-600 text-[10px] block">{v.motorista}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-300 print:text-black truncate max-w-xs">{v.origem} &rarr; {v.destino}</td>
                        <td className="py-2 px-3 text-slate-400 print:text-slate-700 font-mono text-[11px]">{v.numeroMTR}</td>
                        <td className="py-2 px-3 text-ambipar-400 print:text-black font-semibold">{v.dataChegadaPrevista}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Assinaturas de Fechamento de Plantão */}
          <div className="pt-6 border-t border-slate-700 print:border-black grid grid-cols-2 gap-8 text-center text-[10px]">
            <div className="border-t border-slate-600 print:border-black pt-1">
              <strong className="block text-white print:text-black">{analistaEntregando}</strong>
              <span className="text-slate-400 print:text-slate-600">Analista de Logística Entregante &bull; Ambipar</span>
            </div>
            <div className="border-t border-slate-600 print:border-black pt-1">
              <strong className="block text-white print:text-black">{analistaRecebendo}</strong>
              <span className="text-slate-400 print:text-slate-600">Analista Receptor do Plantão &bull; Ciente das Prioridades</span>
            </div>
          </div>

        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ambipar-500"></span>
            <span>Relatório executivo pronto para arquivo de auditoria SASSMAQ / ISO 14001</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
