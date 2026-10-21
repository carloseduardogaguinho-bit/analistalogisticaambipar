import React, { useState } from 'react';
import {
  X,
  Printer,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Skull,
  Atom,
  FlaskConical,
  Search,
  HelpCircle,
  FileCheck2,
  Share2
} from 'lucide-react';

interface ModalIncompatibilidadeQuimicaProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ClassePerigo {
  codigo: string;
  nome: string;
  descricao: string;
  cor: string;
}

const CLASSES_PERIGO: ClassePerigo[] = [
  { codigo: '1', nome: 'Classe 1 - Explosivos', descricao: 'Substâncias com risco de explosão em massa ou projeção', cor: 'bg-orange-600' },
  { codigo: '2.1', nome: 'Classe 2.1 - Gases Inflamáveis', descricao: 'Gases que inflamam a 20°C e 101,3 kPa', cor: 'bg-rose-600' },
  { codigo: '2.2', nome: 'Classe 2.2 - Gases Não Tóxicos / Não Inflamáveis', descricao: 'Gases asfixiantes ou oxidantes (ex: Nitrogênio, CO2)', cor: 'bg-emerald-600' },
  { codigo: '2.3', nome: 'Classe 2.3 - Gases Tóxicos', descricao: 'Gases que sabidamente causam danos à saúde humana (ex: Cloro)', cor: 'bg-purple-600' },
  { codigo: '3', nome: 'Classe 3 - Líquidos Inflamáveis', descricao: 'Líquidos com ponto de fulgor <= 60°C (Solventes, Combustíveis)', cor: 'bg-rose-600' },
  { codigo: '4.1', nome: 'Classe 4.1 - Sólidos Inflamáveis', descricao: 'Sólidos facilmente combustíveis e auto-reativos', cor: 'bg-amber-600' },
  { codigo: '4.2', nome: 'Classe 4.2 - Combustão Espontânea', descricao: 'Substâncias pirofóricas ou que se auto-aquecem', cor: 'bg-amber-700' },
  { codigo: '4.3', nome: 'Classe 4.3 - Emitem Gases Inflamáveis c/ Água', descricao: 'Substâncias que em contato com umidade geram gases explosivos', cor: 'bg-blue-600' },
  { codigo: '5.1', nome: 'Classe 5.1 - Oxidantes / Comburentes', descricao: 'Substâncias que liberam oxigênio e intensificam combustão (ex: Peróxido)', cor: 'bg-yellow-500 text-black' },
  { codigo: '5.2', nome: 'Classe 5.2 - Peróxidos Orgânicos', descricao: 'Substâncias termicamente instáveis com risco de decomposição explosiva', cor: 'bg-yellow-600 text-black' },
  { codigo: '6.1', nome: 'Classe 6.1 - Substâncias Tóxicas', descricao: 'Venenos que podem causar morte ou lesões por inalação/ingestão', cor: 'bg-violet-700' },
  { codigo: '6.2', nome: 'Classe 6.2 - Substâncias Infecciosas', descricao: 'Patógenos, resíduos biológicos e hospitalares', cor: 'bg-indigo-700' },
  { codigo: '8A', nome: 'Classe 8 (Ácidos) - Corrosivos Ácidos', descricao: 'Substâncias ácidas que causam corrosão profunda (ex: Ácido Sulfúrico)', cor: 'bg-slate-700' },
  { codigo: '8B', nome: 'Classe 8 (Bases) - Corrosivos Alcalinos', descricao: 'Substâncias alcalinas/cáusticas (ex: Soda Cáustica, Amônia)', cor: 'bg-slate-600' },
  { codigo: '9', nome: 'Classe 9 - Substâncias Perigosas Diversas', descricao: 'Resíduos perigosos industriais, óleos minerais, poluentes marinhos', cor: 'bg-teal-700' },
];

// Matriz de Incompatibilidade NBR 14619:
// 'I' = Incompatível (PROIBIDO o transporte simultâneo)
// 'S' = Permitido mediante segregação estanque física
// 'C' = Compatível (permitido co-transporte)
type StatusIncompatibilidade = 'I' | 'S' | 'C';

const REGRAS_INCOMPATIBILIDADE: Record<string, Record<string, { status: StatusIncompatibilidade; motivo: string }>> = {
  '3': {
    '5.1': { status: 'I', motivo: 'Risco de explosão extrema e combustão incontrolável: oxidantes intensificam violentamente o fogo em líquidos inflamáveis.' },
    '5.2': { status: 'I', motivo: 'Decomposição violenta ou explosiva de peróxidos orgânicos na presença de solventes inflamáveis.' },
    '4.2': { status: 'I', motivo: 'Risco de ignição espontânea que pode propagar imediatamente para os líquidos inflamáveis.' },
    '1': { status: 'I', motivo: 'Proibido: risco crítico de detonação em massa e incêndio generalizado.' },
    '8A': { status: 'S', motivo: 'Permitido apenas com segregação física estanque: vapores ácidos podem corroer tambores de inflamáveis.' },
    '9': { status: 'C', motivo: 'Compatível para transporte conjunto de resíduos industriais em conformidade.' },
  },
  '5.1': {
    '3': { status: 'I', motivo: 'Risco de explosão extrema e combustão acelerada violenta.' },
    '4.1': { status: 'I', motivo: 'Reação fortemente exotérmica e ignição rápida de sólidos combustíveis.' },
    '4.2': { status: 'I', motivo: 'Autoignição com ejeção de material e risco de explosão.' },
    '4.3': { status: 'I', motivo: 'Liberação acelerada de hidrogênio e oxigênio com altíssimo risco de choque de onda.' },
    '8A': { status: 'I', motivo: 'Muitos oxidantes reagem com ácidos liberando gases extremamente tóxicos ou corrosivos (ex: cloro molecular).' },
  },
  '8A': {
    '8B': { status: 'I', motivo: 'Reação de neutralização fortemente exotérmica: gera fervura imediata, projeção de líquido cáustico e calor extremo.' },
    '5.1': { status: 'I', motivo: 'Liberação violenta de gases tóxicos e vapores halogenados.' },
    '6.1': { status: 'S', motivo: 'Requer segregação física: ácidos em contato com compostos cianídricos ou sulfetos geram gases letais instantâneos (ácido cianídrico).' },
    '4.3': { status: 'I', motivo: 'Contato com ácidos desencadeia evolução massiva de gás hidrogênio altamente explosivo.' },
  },
  '8B': {
    '8A': { status: 'I', motivo: 'Neutralização exotérmica violenta com ebulição e projeção cáustica perigosa.' },
    '5.1': { status: 'I', motivo: 'Decomposição instável gerando calor e sobrepressão em tanques/tambores.' },
    '1': { status: 'I', motivo: 'Incompatibilidade absoluta com materiais explosivos.' },
  },
  '1': {
    '3': { status: 'I', motivo: 'Proibição absoluta: explosivos nunca podem viajar com produtos inflamáveis.' },
    '2.1': { status: 'I', motivo: 'Proibição absoluta de transporte simultâneo de explosivos e gases inflamáveis.' },
    '5.1': { status: 'I', motivo: 'Proibição absoluta de transporte conjunto.' },
  }
};

export const ModalIncompatibilidadeQuimica: React.FC<ModalIncompatibilidadeQuimicaProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [produtoA, setProdutoA] = useState<string>('3');
  const [produtoB, setProdutoB] = useState<string>('5.1');
  const [nomeComercialA, setNomeComercialA] = useState('Resíduo de Solvente / Tolueno (ONU 1993)');
  const [nomeComercialB, setNomeComercialB] = useState('Solução de Peróxido de Hidrogênio (ONU 2014)');

  // Consulta da regra
  const regraDireta = REGRAS_INCOMPATIBILIDADE[produtoA]?.[produtoB];
  const regraInversa = REGRAS_INCOMPATIBILIDADE[produtoB]?.[produtoA];
  const regraFinal = regraDireta || regraInversa || {
    status: (produtoA === produtoB ? 'C' : 'S') as StatusIncompatibilidade,
    motivo: produtoA === produtoB
      ? 'Produtos da mesma classe de risco são compatíveis para carregamento conjunto, desde que embalados conforme ANTT.'
      : 'Não há restrição de incompatibilidade química crítica na NBR 14619, porém recomenda-se estiva segura e segregação por paletes.'
  };

  const getStatusBadge = (status: StatusIncompatibilidade) => {
    switch (status) {
      case 'I':
        return {
          label: 'INCOMPATÍVEL - PROIBIDO O CO-TRANSPORTE',
          corBg: 'bg-rose-950/40 border-rose-500/60 text-rose-300',
          icone: <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />,
          statusText: 'PROIBIÇÃO LEGAL (NBR 14619 & ANTT 5998)'
        };
      case 'S':
        return {
          label: 'PERMITIDO COM SEGREGAÇÃO FÍSICA ESTANQUE',
          corBg: 'bg-amber-950/40 border-amber-500/60 text-amber-300',
          icone: <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />,
          statusText: 'EXIGE CONTENÇÃO INTERMEDIÁRIA'
        };
      case 'C':
      default:
        return {
          label: 'COMPATÍVEL - CARREGAMENTO SIMULTÂNEO AUTORIZADO',
          corBg: 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300',
          icone: <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />,
          statusText: 'CO-TRANSPORTE AUTORIZADO'
        };
    }
  };

  const badgeInfo = getStatusBadge(regraFinal.status);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col print:bg-white print:border-none print:shadow-none print:max-h-none print:w-full print:m-0">
        
        {/* Barra Superior */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Matriz de Incompatibilidade Química de Cargas</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold">
                  ABNT NBR 14619
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoria de periculosidade para co-transporte em baús e carretas tanque compartimentadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-600 transition"
            >
              <Printer className="w-4 h-4 text-ambipar-400" />
              <span className="hidden sm:inline">Imprimir Laudo A4</span>
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

        {/* Conteúdo */}
        <div className="p-6 space-y-6 text-slate-200 print:text-black print:p-6 print:space-y-4">
          
          {/* Header Institucional */}
          <div className="border border-slate-700 print:border-black rounded-xl p-4 bg-slate-950/60 print:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-ambipar-400 print:text-black font-bold">
                DIRETRIZ TÉCNICA OPERACIONAL &bull; AMBIPAR HAZMAT LOGISTICS
              </span>
              <h2 className="text-base font-black text-white print:text-black uppercase">
                Validador de Co-transporte e Segregação de Resíduos Químicos
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Resolução ANTT nº 5.998 e Norma ABNT NBR 14619 (Incompatibilidade Química)
              </p>
            </div>

            <div className="text-right text-xs text-slate-400 print:text-slate-700">
              <span className="block font-semibold">Responsável Técnico:</span>
              <strong className="text-white print:text-black">Carlos Eduardo (Analista Sênior)</strong>
            </div>
          </div>

          {/* Seleção Interativa das 2 Cargas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Atom className="w-4 h-4" /> Carga / Resíduo A (Primeiro Compartimento)
              </span>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Classe de Risco ONU</label>
                <select
                  value={produtoA}
                  onChange={(e) => setProdutoA(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  {CLASSES_PERIGO.map((cl) => (
                    <option key={cl.codigo} value={cl.codigo}>
                      {cl.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Identificação / Nome Apropriado</label>
                <input
                  type="text"
                  value={nomeComercialA}
                  onChange={(e) => setNomeComercialA(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Atom className="w-4 h-4" /> Carga / Resíduo B (Segundo Compartimento / Carga Conjunta)
              </span>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Classe de Risco ONU</label>
                <select
                  value={produtoB}
                  onChange={(e) => setProdutoB(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  {CLASSES_PERIGO.map((cl) => (
                    <option key={cl.codigo} value={cl.codigo}>
                      {cl.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Identificação / Nome Apropriado</label>
                <input
                  type="text"
                  value={nomeComercialB}
                  onChange={(e) => setNomeComercialB(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Resultado do Parecer Técnico de Incompatibilidade */}
          <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 ${badgeInfo.corBg}`}>
            {badgeInfo.icone}
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/40">
                  {badgeInfo.statusText}
                </span>
                <span className="text-xs opacity-75 font-mono">
                  {CLASSES_PERIGO.find(c => c.codigo === produtoA)?.codigo} &times; {CLASSES_PERIGO.find(c => c.codigo === produtoB)?.codigo}
                </span>
              </div>
              <h3 className="text-base font-black tracking-tight">{badgeInfo.label}</h3>
              <p className="text-xs leading-relaxed opacity-90">{regraFinal.motivo}</p>
            </div>
          </div>

          {/* Orientações Operacionais para o Motorista e Armazém */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
              <strong className="block text-white print:text-black uppercase text-[10px] mb-1 font-bold">
                1. Emissão Fiscal & MTR
              </strong>
              <p className="text-slate-400 print:text-slate-600 leading-relaxed text-[11px]">
                {regraFinal.status === 'I'
                  ? 'É proibida a inclusão destas cargas no mesmo MDF-e para o mesmo veículo. Cada resíduo deve seguir em veículo dedicado.'
                  : 'Autorizada emissão de MTRs distintos com declaração expressa do expedidor.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
              <strong className="block text-white print:text-black uppercase text-[10px] mb-1 font-bold">
                2. Equipamento & Segregação
              </strong>
              <p className="text-slate-400 print:text-slate-600 leading-relaxed text-[11px]">
                {regraFinal.status === 'S'
                  ? 'Obrigatório uso de bacia de contenção intermediária ou carreta tanque compartimentada com teste de estanqueidade válido.'
                  : regraFinal.status === 'I'
                  ? 'Bloqueio imediato na portaria. O analista de logística não deve emitir a liberação de SM.'
                  : 'Carregamento liberado em baú ou sider com amarração de carga com cintas de poliéster.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
              <strong className="block text-white print:text-black uppercase text-[10px] mb-1 font-bold">
                3. Fiscalização PRF & IBAMA
              </strong>
              <p className="text-slate-400 print:text-slate-600 leading-relaxed text-[11px]">
                O transporte de cargas incompatíveis sem segregação constitui infração gravíssima com retenção do conjunto, multa ambiental e crime inafiançável.
              </p>
            </div>
          </div>

          {/* Campo de Assinatura do Laudo Técnico (A4) */}
          <div className="pt-6 border-t border-slate-700 print:border-black grid grid-cols-2 gap-8 text-center text-[10px]">
            <div className="border-t border-slate-600 print:border-black pt-1">
              <strong className="block text-white print:text-black">Carlos Eduardo (Analista de Logística Sênior)</strong>
              <span className="text-slate-400 print:text-slate-600">Ambipar Logistics &bull; Expedição e Planejamento</span>
            </div>
            <div className="border-t border-slate-600 print:border-black pt-1">
              <strong className="block text-white print:text-black">Supervisão de Operações &amp; SASSMAQ</strong>
              <span className="text-slate-400 print:text-slate-600">Visto de Conformidade Técnica NBR 14619</span>
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <span>Base de dados atualizada de acordo com a ABNT NBR 14619 e Resolução ANTT 5998</span>
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
