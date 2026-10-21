import React, { useState } from 'react';
import {
  X,
  Printer,
  Send,
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  Flame,
  Radio,
  MapPin,
  Clock,
  Compass,
  FileText,
  LifeBuoy,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Viagem } from '../types';

interface ModalPaeEmergenciaProps {
  isOpen: boolean;
  onClose: () => void;
  viagens: Viagem[];
}

export const ModalPaeEmergencia: React.FC<ModalPaeEmergenciaProps> = ({
  isOpen,
  onClose,
  viagens
}) => {
  if (!isOpen) return null;

  // Estados da Simulação / Chamado Real
  const [viagemSelecionada, setViagemSelecionada] = useState<Viagem | null>(viagens[0] || null);
  const [tipoOcorrencia, setTipoOcorrencia] = useState<'Vazamento / Derrame na Pista' | 'Tombamento com Risco de Atingir Manancial' | 'Princípio de Incêndio no Conjunto' | 'Ruptura de Válvula / Despressurização'>('Vazamento / Derrame na Pista');
  const [localKm, setLocalKm] = useState('Rodovia Anhanguera (SP-330), Km 128 - Sentido Interior');
  const [climaVento, setClimaVento] = useState<'Vento Fraco (1 a 5 km/h)' | 'Vento Moderado (Direção Norte)' | 'Chuva com Enxurrada'>('Vento Moderado (Direção Norte)');
  const [gravidade, setGravidade] = useState<'Nível 1 (Localizado)' | 'Nível 2 (Grave - Rodovia Interrompida)' | 'Nível 3 (Crítico - Atinge Água / Comunidade)'>('Nível 2 (Grave - Rodovia Interrompida)');
  const [analistaNotificante, setAnalistaNotificante] = useState('Carlos Eduardo - Analista de Logística Sênior');

  // Parâmetros automáticos baseados no tipo e produto
  const raioIsolamento = tipoOcorrencia === 'Princípio de Incêndio no Conjunto'
    ? '800 metros em todas as direções'
    : tipoOcorrencia === 'Tombamento com Risco de Atingir Manancial'
    ? '300 metros & montante do rio'
    : '100 metros (Isolamento Imediato)';

  const acoesContencao = [
    'Lançamento imediato de barreiras absorventes oleofílicas na sarjeta e canaleta de drenagem',
    'Aplicação de turfa bioabsorvente mineral Ambipar para estancar espalhamento de resíduos oleosos',
    'Construção de dique de terra e contenção provisória para bloquear entrada em bueiros de escoamento',
    'Desconexão das baterias do cavalo mecânico para eliminar fontes de faísca elétrica',
    'Sinalização a 200m com cones refletivos e pisca-alerta em ambos os sentidos da via',
    'Acionamento do Centro de Controle de Emergências 24h Ambipar Response (0800 014 3636)'
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleEnviarWhatsAppEmergencia = () => {
    const texto = `🚨 *COMUNICADO URGENTE DE EMERGÊNCIA AMBIENTAL - PAE 24H*
*AMBIPAR RESPONSE &bull; TORRE DE CONTROLE LOGÍSTICO*
--------------------------------------------------
⚠️ *OCORRÊNCIA:* ${tipoOcorrencia}
🔥 *GRAVIDADE:* ${gravidade}
📍 *LOCAL:* ${localKm}
🚛 *VEÍCULO:* ${viagemSelecionada?.placaCavalo || 'AMB-8891'}
👤 *MOTORISTA:* ${viagemSelecionada?.motorista || 'Motorista Titular'}
📦 *CARGA:* ${viagemSelecionada?.classeResiduo || 'Resíduo Classe I Perigoso'} (MTR: ${viagemSelecionada?.numeroMTR || 'S/N'})

🛑 *RAIO DE ISOLAMENTO INICIAL (ABIQUIM):* ${raioIsolamento}
🌪️ *CONDIÇÕES METEOROLÓGICAS:* ${climaVento}

🚒 *AÇÕES DE CONTENÇÃO IMEDIATAS:*
- Barreiras oleofílicas instaladas na drenagem
- Dique de contenção ativo
- PRF (191) e Bombeiros (193) notificados
- CETESB / Órgão Ambiental comunicado

📞 *CENTRAL 24H AMBIPAR:* 0800 014 3636
✍️ *ANALISTA DE PLANTÃO:* ${analistaNotificante}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col print:bg-white print:border-none print:shadow-none print:max-h-none print:w-full print:m-0">
        
        {/* Barra Superior */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Plano de Atendimento a Emergências (PAE 24h)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold">
                  AMBIPAR RESPONSE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Protocolo de Resposta Imediata a Acidentes Químicos e Ambientais em Rodovias
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnviarWhatsAppEmergencia}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition"
              title="Disparar Alerta no WhatsApp para Equipe de Pronta Resposta"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Disparar Alerta 24h</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-600 transition"
            >
              <Printer className="w-4 h-4 text-ambipar-400" />
              <span className="hidden sm:inline">Imprimir Relatório PAE</span>
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
          
          {/* Alerta de Linha Direta 24h */}
          <div className="border border-rose-500/40 rounded-xl p-4 bg-gradient-to-r from-rose-950/30 via-slate-950 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-600/30">
                <PhoneCall className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                  CENTRAL DE COMANDO DE EMERGÊNCIAS QUÍMICAS & AMBIENTAIS
                </span>
                <strong className="text-xl font-black text-white print:text-black tracking-tight block">
                  0800 014 3636 &bull; 0800 770 3636
                </strong>
                <span className="text-xs text-slate-400">
                  Pronta Resposta Ambipar Response (Bases Operacionais em Paulínia, Santos, RJ, Curitiba, Betim e Salvador)
                </span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-800 pl-0 sm:pl-4 pt-2 sm:pt-0">
              <span className="block font-semibold">Tempo de Resposta Médio:</span>
              <strong className="text-emerald-400 text-sm font-mono">&le; 45 minutos</strong>
              <span className="text-[10px] text-slate-500 block">Equipes de nível Hazmat NBR 14064</span>
            </div>
          </div>

          {/* Configuração da Simulação / Incidente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4" /> Dados do Sinistro e Veículo Envolvido
              </span>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Selecionar Viagem Ativa</label>
                <select
                  value={viagemSelecionada?.id || ''}
                  onChange={(e) => {
                    const v = viagens.find(item => item.id === e.target.value);
                    if (v) setViagemSelecionada(v);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  {viagens.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.codigoViagem} - {v.placaCavalo} ({v.motorista})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Tipo de Evento Acidental</label>
                <select
                  value={tipoOcorrencia}
                  onChange={(e) => setTipoOcorrencia(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  <option value="Vazamento / Derrame na Pista">Vazamento / Derrame na Pista</option>
                  <option value="Tombamento com Risco de Atingir Manancial">Tombamento com Risco de Atingir Manancial</option>
                  <option value="Princípio de Incêndio no Conjunto">Princípio de Incêndio no Conjunto</option>
                  <option value="Ruptura de Válvula / Despressurização">Ruptura de Válvula / Despressurização</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Localização Exata (Rodovia / KM)</label>
                <input
                  type="text"
                  value={localKm}
                  onChange={(e) => setLocalKm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Classificação de Severidade & Clima
              </span>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Nível de Gravidade</label>
                <select
                  value={gravidade}
                  onChange={(e) => setGravidade(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  <option value="Nível 1 (Localizado)">Nível 1 (Localizado - Contenção rápida)</option>
                  <option value="Nível 2 (Grave - Rodovia Interrompida)">Nível 2 (Grave - Rodovia Interrompida)</option>
                  <option value="Nível 3 (Crítico - Atinge Água / Comunidade)">Nível 3 (Crítico - Risco de Contaminação Maior)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Condição do Vento e Meteorologia</label>
                <select
                  value={climaVento}
                  onChange={(e) => setClimaVento(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  <option value="Vento Fraco (1 a 5 km/h)">Vento Fraco (1 a 5 km/h)</option>
                  <option value="Vento Moderado (Direção Norte)">Vento Moderado (Direção Norte)</option>
                  <option value="Chuva com Enxurrada">Chuva com Enxurrada (Risco de arraste)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Analista de Logística Responsável</label>
                <input
                  type="text"
                  value={analistaNotificante}
                  onChange={(e) => setAnalistaNotificante(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Diretrizes Técnicas do Manual ABIQUIM / DOT ERG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:border-black print:bg-slate-50 space-y-2">
              <span className="text-xs font-bold text-rose-400 print:text-black uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> Raio de Isolamento Inicial (Manual ABIQUIM)
              </span>
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 print:bg-white print:border-black">
                <div className="text-lg font-black text-white print:text-black font-mono">{raioIsolamento}</div>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                  Evacuar a área na direção à favor do vento. Proibir aglomeração de curiosos e tráfego de veículos com motor a combustão no raio demarcado.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:border-black print:bg-slate-50 space-y-2">
              <span className="text-xs font-bold text-emerald-400 print:text-black uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Checklist de Contenção & Ações Imediatas
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300 print:text-slate-700">
                {acoesContencao.map((acao, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <span>{acao}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contatos Oficiais de Notificação de Sinistro */}
          <div className="border border-slate-800 print:border-black rounded-xl p-4 bg-slate-950 print:bg-white">
            <span className="text-xs font-bold text-white print:text-black uppercase tracking-wider block mb-3">
              Grade de Notificação Imediata das Autoridades (POP-AMB-09)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Polícia Rodoviária (PRF)</span>
                <strong className="text-blue-400 print:text-black font-mono text-sm block mt-0.5">191</strong>
                <span className="text-[10px] text-slate-500">Bloqueio da pista</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Corpo de Bombeiros</span>
                <strong className="text-rose-400 print:text-black font-mono text-sm block mt-0.5">193</strong>
                <span className="text-[10px] text-slate-500">Resgate e contenção</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">CETESB / Ambiental</span>
                <strong className="text-emerald-400 print:text-black font-mono text-sm block mt-0.5">0800 011 3560</strong>
                <span className="text-[10px] text-slate-500">Perícia ambiental</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Ambipar Response</span>
                <strong className="text-ambipar-400 print:text-black font-mono text-sm block mt-0.5">0800 014 3636</strong>
                <span className="text-[10px] text-slate-500">Base Pronta Resposta</span>
              </div>
            </div>
          </div>

          {/* Assinatura do Relatório PAE */}
          <div className="pt-4 border-t border-slate-700 print:border-black grid grid-cols-2 gap-8 text-center text-[10px]">
            <div className="border-t border-slate-600 print:border-black pt-1">
              <strong className="block text-white print:text-black">{analistaNotificante}</strong>
              <span className="text-slate-400 print:text-slate-600">Analista de Logística &bull; Notificante PAE</span>
            </div>
            <div className="border-t border-slate-600 print:border-black pt-1">
              <strong className="block text-white print:text-black">Coordenação Ambipar Response</strong>
              <span className="text-slate-400 print:text-slate-600">Equipe de Pronta Resposta Técnica</span>
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <span>Ambipar Response &bull; Certificações ISO 9001, ISO 14001, ISO 45001 e SASSMAQ</span>
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
