import React, { useState } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Lock,
  Key,
  CheckCircle2,
  AlertTriangle,
  Send,
  Truck,
  UserCheck,
  Cpu,
  FileCheck,
  Clock,
  Compass,
  QrCode,
  Share2
} from 'lucide-react';
import { Viagem } from '../types';

interface ModalLiberacaoPgrSmProps {
  isOpen: boolean;
  onClose: () => void;
  viagem: Viagem | null;
}

export const ModalLiberacaoPgrSm: React.FC<ModalLiberacaoPgrSmProps> = ({
  isOpen,
  onClose,
  viagem
}) => {
  if (!isOpen || !viagem) return null;

  // Gerenciadora de Risco Selecionada
  const [gerenciadora, setGerenciadora] = useState<'Buonny' | 'Pamcary' | 'Brasil Risk' | 'OpenTech'>('Buonny');
  const [numeroSm, setNumeroSm] = useState(`SM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
  const [rastreadorPrincipal, setRastreadorPrincipal] = useState('Omnilink / Sascar Dual Sim (Satélite + GPRS)');
  const [iscaAtiva, setIscaAtiva] = useState(true);
  const [codigoIsca, setCodigoIsca] = useState('ISC-AMB-9982-SUL');
  const [analistaResponsavel, setAnalistaResponsavel] = useState('Carlos Eduardo - Analista de Logística Sênior');

  // Checklist de Sensores e Testes do PGR
  const [checklist, setChecklist] = useState({
    motoristaAprovadoGR: true,
    rntrcValido: true,
    botaoPanicoTestado: true,
    travaQuintaRoda: true,
    travaValvulaDescarga: true,
    bloqueadorRemoto: true,
    tecladoBordoMacro: true,
    sensorPortaCabine: true,
    janelaHorarioPGR: true,
    rotaAprovadaCentral: true,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const todosConformes = Object.values(checklist).every(Boolean);

  const handlePrint = () => {
    window.print();
  };

  const handleEnviarWhatsApp = () => {
    const texto = `🛡️ *LIBERAÇÃO DE SM & PGR - AMBIPAR LOGISTICS*
----------------------------------------
📋 *Nº SM:* ${numeroSm}
🚛 *Veículo:* ${viagem.placaCavalo} | *Carreta:* ${viagem.placaCarreta || 'Engatada'}
👤 *Motorista:* ${viagem.motorista}
🏢 *Gerenciadora:* ${gerenciadora}
🛰️ *Rastreador:* ${rastreadorPrincipal}
📍 *Origem:* ${viagem.origem}
🏁 *Destino:* ${viagem.destino}
📦 *Carga:* ${viagem.classeResiduo} (MTR: ${viagem.numeroMTR})
⏰ *Horário Liberação:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}

✅ *STATUS:* LIBERAÇÃO CONCLUÍDA
- Botão de Pânico: Testado & Aprovado
- Trava 5ª Roda / Válvulas: Travadas
- Bloqueio Remoto & Macros: OK
- Isca de Carga: ${iscaAtiva ? `Ativa (${codigoIsca})` : 'Não exigida'}

✍️ *Analista Responsável:* ${analistaResponsavel}
_Sistema Integrado Ambipar SASSMAQ / PGR_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col print:bg-white print:border-none print:shadow-none print:max-h-none print:w-full print:m-0">
        
        {/* Barra Superior / Ações */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Checklist de Liberação SM & PGR</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  PGR / SASSMAQ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gerenciamento de Risco e Checklist de Sensores antes da saída da portaria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnviarWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
              title="Compartilhar via WhatsApp"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-600 transition"
              title="Imprimir Voucher para Portaria"
            >
              <Printer className="w-4 h-4 text-ambipar-400" />
              <span className="hidden sm:inline">Imprimir Voucher A4</span>
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

        {/* Conteúdo Principal / Documento Oficial */}
        <div className="p-6 space-y-6 text-slate-200 print:text-black print:p-6 print:space-y-4">
          
          {/* Cabeçalho Oficial do Voucher */}
          <div className="border border-slate-700 print:border-black rounded-xl p-4 bg-slate-950/60 print:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-ambipar-500 text-slate-950 rounded-xl flex items-center justify-center font-black text-xl tracking-tighter">
                AMB
              </div>
              <div>
                <h2 className="text-base font-black text-white print:text-black tracking-tight uppercase">
                  Ambipar Logistics &bull; Gerenciamento de Risco (PGR)
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  Voucher Oficial de Liberação de Viagem em Portaria / Solicitação de Monitoramento
                </p>
                <div className="text-[11px] text-slate-400 print:text-slate-700 mt-1 flex flex-wrap gap-x-3">
                  <span><strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span><strong>Analista Emissor:</strong> {analistaResponsavel}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end border-t sm:border-t-0 sm:border-l border-slate-800 print:border-black pt-3 sm:pt-0 sm:pl-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 print:text-slate-600">Nº SM / MONITORAMENTO</span>
              <span className="font-mono text-lg font-black text-ambipar-400 print:text-black">{numeroSm}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 print:text-black print:border print:border-black mt-1">
                {gerenciadora.toUpperCase()} HOMOLOGADA
              </span>
            </div>
          </div>

          {/* Dados da Viagem e Frota */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 flex items-center gap-1.5 mb-1">
                <Truck className="w-3.5 h-3.5 text-ambipar-400 print:text-black" /> Conjunto Veicular
              </span>
              <div className="font-bold text-white print:text-black text-sm">{viagem.placaCavalo}</div>
              <div className="text-slate-300 print:text-slate-700 text-[11px] mt-0.5">
                Carreta: {viagem.placaCarreta || 'Sem placa carreta informada'}
              </div>
              <div className="text-slate-400 print:text-slate-600 text-[10px] mt-0.5">
                Equipamento: {viagem.tipoEquipamento}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 flex items-center gap-1.5 mb-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-400 print:text-black" /> Motorista / Cadastro
              </span>
              <div className="font-bold text-white print:text-black text-sm">{viagem.motorista}</div>
              <div className="text-emerald-400 print:text-emerald-800 text-[11px] font-semibold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ficha GR Válida até 90 dias
              </div>
              <div className="text-slate-400 print:text-slate-600 text-[10px] mt-0.5">
                Vínculo: Frota Própria Ambipar (Dedicação Exclusiva)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 flex items-center gap-1.5 mb-1">
                <Compass className="w-3.5 h-3.5 text-rose-400 print:text-black" /> Rota & Carga Crítica
              </span>
              <div className="font-semibold text-white print:text-black text-xs truncate">
                {viagem.origem} &rarr; {viagem.destino}
              </div>
              <div className="text-slate-300 print:text-slate-700 text-[11px] mt-0.5">
                {viagem.pesoToneladas} t &bull; MTR: {viagem.numeroMTR}
              </div>
              <div className="text-amber-400 print:text-amber-800 text-[10px] font-mono mt-0.5 truncate">
                {viagem.classeResiduo}
              </div>
            </div>
          </div>

          {/* Configuração da Operação de Risco (Interativa no APP, Estática no Print) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-ambipar-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Configurações de Monitoramento de Risco
              </h4>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">Gerenciadora de Risco</label>
                  <select
                    value={gerenciadora}
                    onChange={(e) => setGerenciadora(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value="Buonny">Buonny Gerenciamento</option>
                    <option value="Pamcary">Pamcary GPS</option>
                    <option value="Brasil Risk">Brasil Risk</option>
                    <option value="OpenTech">OpenTech GR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">Nº da SM / Viagem</label>
                  <input
                    type="text"
                    value={numeroSm}
                    onChange={(e) => setNumeroSm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Tecnologia Rastreador Embarcado</label>
                <input
                  type="text"
                  value={rastreadorPrincipal}
                  onChange={(e) => setRastreadorPrincipal(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-slate-300 text-xs flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={iscaAtiva}
                    onChange={(e) => setIscaAtiva(e.target.checked)}
                    className="rounded accent-ambipar-500 w-4 h-4"
                  />
                  <span>Exigência de Isca Eletrônica de Carga (Apólice RCF-DC)</span>
                </label>
                {iscaAtiva && (
                  <input
                    type="text"
                    value={codigoIsca}
                    onChange={(e) => setCodigoIsca(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-ambipar-400 w-36"
                    placeholder="Código Isca"
                  />
                )}
              </div>
            </div>

            {/* Status Geral de Liberação */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              todosConformes 
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {todosConformes ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-400" />
                  )}
                  <h4 className="text-sm font-bold">
                    {todosConformes ? 'CONJUNTO 100% LIBERADO PARA VIAGEM' : 'PENDÊNCIAS BLOQUEIAM A SAÍDA'}
                  </h4>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {todosConformes
                    ? 'Todos os atuadores, sensores de segurança e checagens cadastrais foram validados com sucesso pela torre de controle. A portaria está autorizada a liberar o veículo.'
                    : 'Atenção! Existem itens reprovados no checklist de sensores e travas. A liberação na portaria está suspensa conforme Procedimento Operacional Padrão Ambipar.'}
                </p>
              </div>

              <div className="pt-3 border-t border-current/20 flex items-center justify-between text-xs font-mono">
                <span>STATUS DA PORTARIA:</span>
                <span className={`px-2.5 py-1 rounded font-black ${
                  todosConformes ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  {todosConformes ? 'PORTARIA AUTORIZADA' : 'BLOQUEIO DE SAÍDA'}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist Detalhado dos Sensores e Procedimentos (Aparece no Print e na Tela) */}
          <div className="border border-slate-800 print:border-black rounded-xl overflow-hidden">
            <div className="bg-slate-950/80 print:bg-slate-100 p-3 border-b border-slate-800 print:border-black flex items-center justify-between">
              <span className="text-xs font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-ambipar-400 print:text-black" />
                Matriz de Teste de Sensores, Atuadores e Regras PGR
              </span>
              <span className="text-[11px] text-slate-400 print:text-slate-700">
                Norma Operacional Ambipar POP-LOG-014
              </span>
            </div>

            <div className="divide-y divide-slate-800 print:divide-slate-300 text-xs">
              {[
                { key: 'motoristaAprovadoGR', titulo: 'Consulta de Motorista na Gerenciadora', desc: 'Pesquisa cadastral válida (Buonny/Pamcary) com limite segurado ativo.' },
                { key: 'rntrcValido', titulo: 'RNTRC & CNH em Dia', desc: 'Registro Nacional de Transportadores Rodoviários de Cargas e CNH com EAR vigentes.' },
                { key: 'botaoPanicoTestado', titulo: 'Teste de Botão de Pânico', desc: 'Acionamento silencioso realizado e confirmado pelo operador da central 24h.' },
                { key: 'travaQuintaRoda', titulo: 'Sensor & Trava da 5ª Roda', desc: 'Bloqueio mecânico de desengate ativo contra desacoplamento indevido.' },
                { key: 'travaValvulaDescarga', titulo: 'Sensor & Lacre das Válvulas do Tanque / Baú', desc: 'Válvula de fundo e mangote de descarregamento travados e monitorados eletronicamente.' },
                { key: 'bloqueadorRemoto', titulo: 'Teste de Bloqueio Remoto de Ignição / Combustível', desc: 'Comando de parada segura via satélite testado nos últimos 30 dias.' },
                { key: 'tecladoBordoMacro', titulo: 'Teclado de Bordo e Macro 01', desc: 'Macro "Início de Viagem Ambipar" disparada e confirmada na tela de bordo.' },
                { key: 'sensorPortaCabine', titulo: 'Sensor de Abertura de Portas da Cabine', desc: 'Avisos de porta aberta comunicando com telemetria sem fio.' },
                { key: 'janelaHorarioPGR', titulo: 'Janela de Tráfego Autorizada (05:00 às 22:00)', desc: 'Conformidade com a proibição de rodagem noturna para cargas perigosas da apólice.' },
                { key: 'rotaAprovadaCentral', titulo: 'Espelhamento de Rota e Postos Credenciados', desc: 'Plano de viagem inserido na torre de controle com paradas obrigatórias demarcadas.' },
              ].map((item) => {
                const checked = checklist[item.key as keyof typeof checklist];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleCheck(item.key as keyof typeof checklist)}
                    className="p-3 flex items-start justify-between gap-4 hover:bg-slate-800/40 print:hover:bg-transparent cursor-pointer transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                        checked
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                          : 'border-slate-600 bg-slate-800'
                      }`}>
                        {checked && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-white print:text-black">{item.titulo}</div>
                        <div className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">{item.desc}</div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        checked
                          ? 'bg-emerald-500/20 text-emerald-400 print:text-emerald-900 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 print:text-rose-900 border border-rose-500/30'
                      }`}>
                        {checked ? 'CONFORME' : 'NÃO CONFORME'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campo de Assinatura para Portaria e Motorista (A4) */}
          <div className="pt-4 border-t border-slate-700 print:border-black grid grid-cols-3 gap-4 text-center text-[10px]">
            <div className="border-t border-slate-600 print:border-black pt-1">
              <strong className="block text-white print:text-black">{analistaResponsavel}</strong>
              <span className="text-slate-400 print:text-slate-600">Analista de Logística &bull; Torre Ambipar</span>
            </div>
            <div className="border-t border-slate-600 print:border-black pt-1">
              <strong className="block text-white print:text-black">Portaria / Guarita de Saída</strong>
              <span className="text-slate-400 print:text-slate-600">Visto de Liberação Física</span>
            </div>
            <div className="border-t border-slate-600 print:border-black pt-1">
              <strong className="block text-white print:text-black">{viagem.motorista}</strong>
              <span className="text-slate-400 print:text-slate-600">Condutor &bull; Ciente das Regras PGR</span>
            </div>
          </div>

        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${todosConformes ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span>{todosConformes ? 'Voucher pronto para emissão e liberação' : 'Atenção: pendências ativas'}</span>
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
