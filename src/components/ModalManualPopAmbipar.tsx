import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  FileCheck2,
  DollarSign,
  AlertTriangle,
  Truck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Printer,
  Scale,
} from 'lucide-react';

interface ModalManualPopAmbiparProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalManualPopAmbipar: React.FC<ModalManualPopAmbiparProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'sassmaq' | 'mtr' | 'emergencia' | 'saving'>('sassmaq');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ambipar-500/10 border border-ambipar-500/30 flex items-center justify-center text-ambipar-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Manual Operacional do Analista &middot; POP Ambipar
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ambipar-500/20 text-ambipar-400 border border-ambipar-500/30 uppercase">
                  Procedimentos Padrão
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guia de referência rápida para vistorias SASSMAQ, conformidade MTR/SINIR, emergências químicas 24h e saving.
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

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection('sassmaq')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeSection === 'sassmaq'
                ? 'bg-ambipar-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. Vistoria &amp; SASSMAQ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('mtr')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeSection === 'mtr'
                ? 'bg-ambipar-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>2. MTR, SINIR &amp; CDF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('emergencia')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeSection === 'emergencia'
                ? 'bg-ambipar-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>3. Ambipar Response 24h</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('saving')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeSection === 'saving'
                ? 'bg-ambipar-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>4. Equalização de Saving</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
          {/* Seção 1: SASSMAQ & Checklists */}
          {activeSection === 'sassmaq' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Diretrizes de Vistoria Pré-Viagem (Norma SASSMAQ / ISO 14001)</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Todo veículo antes de iniciar a jornada operacional deve ser submetido à vistoria completa de 26 itens realizada pelo motorista no Portal Mobile. Como Analista de Logística, você é o responsável técnico por auditar as avarias registradas e aprovar ou vetar saídas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Itens Eliminatórios */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Critérios de Bloqueio Imediato (Reprovação)</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li>Pneus com sulco menor que 1.6 mm (indicador TWI atingido).</li>
                    <li>Vazamento ativo de óleo, combustível ou ar comprimido dos freios.</li>
                    <li>Falta de kit de emergência NBR 9735 ou EPI químico completo.</li>
                    <li>Luzes de freio, ré ou seta queimadas.</li>
                    <li>Laudo CIV ou CIPP de produtos perigosos vencido.</li>
                    <li>Extintor de carga perigosa (pó ABC 8kg) despressurizado.</li>
                  </ul>
                </div>

                {/* Itens com Restrição Tolerada */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Itens com Restrição (Tratativa em até 48h)</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li>Arranhões superficiais ou pequenos amassados na lataria.</li>
                    <li>Palheta do limpador com leve desgaste sem comprometer visão.</li>
                    <li>Farol auxiliar de milha desalinhado.</li>
                    <li>Revisão preventiva faltando menos de 1.000 km (agendar OS).</li>
                    <li>Nível de Arla 32 abaixo de 30% (abastecer na base).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Seção 2: MTR, SINIR & CDF */}
          {activeSection === 'mtr' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Fluxo Regulatório de Resíduos: SINIR (Federal) e SIGOR (CETESB SP)</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  O transporte de resíduos perigosos (Classe I) e industriais (Classe II) no Brasil exige rastreabilidade eletrônica de ponta a ponta. Nenhum veículo Ambipar pode transitar sem o MTR impresso ou digital acompanhado da Ficha de Emergência e Envelope de Transporte.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-white">Emissão do MTR pelo Gerador</h5>
                    <p className="text-slate-400 mt-0.5">
                      O cliente gerador (Braskem, Klabin, Petrobras, etc.) emite o manifesto no SINIR ou SIGOR com código IBAMA, classe de resíduo, peso estimado e acondicionamento.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-white">Conferência e Transporte pelo Analista/Motorista</h5>
                    <p className="text-slate-400 mt-0.5">
                      Conferir se a placa de tração e semirreboque constam na Licença de Operação do órgão ambiental (LO CETESB/IBAMA). Pesar na balança de saída e registrar ticket.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-white">Recebimento e Emissão do CDF (Certificado de Destinação Final)</h5>
                    <p className="text-slate-400 mt-0.5">
                      O destinador final (coprocessamento, incineração ou aterro industrial) confere a carga e emite o CDF no SINIR em até 60 dias. O CDF comprova a destinação correta e desonera o cliente civil e ambientalmente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Seção 3: Ambipar Response 24h */}
          {activeSection === 'emergencia' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4" />
                    <span>Protocolo de Acionamento Emergencial &middot; Ambipar Response 24h</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-black uppercase">
                    Emergência Crítica
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Em caso de tombamento, colisão, vazamento ou princípio de incêndio envolvendo veículo com produtos químicos ou resíduos Classe I, siga rigorosamente o procedimento:
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Telefone de Pronta Resposta &amp; PAE (Nacional 24 Horas)
                </p>
                <p className="text-2xl font-black text-emerald-400 tracking-wider font-mono">
                  0800 771 3778 &middot; 0800 117 2020
                </p>
                <p className="text-[11px] text-slate-500">
                  Central Integrada de Operações de Emergência Ambiental &middot; Base Paulínia/SP
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white">Passos Obrigatórios do Analista no Momento do Incidente:</h5>
                <ol className="space-y-1.5 list-decimal list-inside text-slate-300">
                  <li><strong>Contatar o Motorista:</strong> Confirmar se há vítimas e se a tripulação está segura a favor do vento.</li>
                  <li><strong>Identificar a Carga:</strong> Consultar na tela de Viagens o Código ONU, Classe de Risco e Quantidade transportada.</li>
                  <li><strong>Acionar Ambipar Response:</strong> Informar KM da rodovia, produto envolvido e se há risco de atingir cursos d&rsquo;água.</li>
                  <li><strong>Registrar Ocorrência Crítica:</strong> Abrir chamado no módulo de Ocorrências com status &ldquo;Protocolo Emergência Ativo&rdquo;.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Seção 4: Equalização de Cotações & Saving */}
          {activeSection === 'saving' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Política de Suprimentos &amp; Equalização Financeira de Oficinas</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Para garantir a melhor rentabilidade da frota Ambipar e transparência em auditorias, todo reparo de oficina mecânica, funilaria, suspensão ou borracharia deve seguir o fluxo de saving.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
                    Fórmula de Saving Homologado
                  </h5>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-white">
                    Saving (R$) = Maior Cotação - Proposta Vencedora
                  </div>
                  <p className="text-[11px] text-slate-400">
                    O saving demonstra o valor financeiro economizado pelo Analista através da negociação técnica entre oficinas credenciadas.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
                    Regra das 3 Propostas
                  </h5>
                  <p className="text-slate-300">
                    Serviços acima de R$ 3.000,00 exigem no mínimo 3 propostas comerciais (peças originais + mão de obra equalizada com garantia mínima de 90 dias).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Manual atualizado conforme Diretrizes de Compliance Ambipar 2026</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Fechar Manual
          </button>
        </div>
      </div>
    </div>
  );
};
