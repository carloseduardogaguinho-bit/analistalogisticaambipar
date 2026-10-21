import React, { useState } from 'react';
import {
  X,
  Printer,
  ShieldAlert,
  AlertTriangle,
  Flame,
  PhoneCall,
  HardHat,
  FileCheck2,
  CheckCircle2,
  Eye,
  Truck,
  Building,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { Viagem } from '../types';

interface ModalFichaEmergenciaNbr7503Props {
  isOpen: boolean;
  onClose: () => void;
  viagem: Viagem | null;
}

interface PerfilQuimico {
  numeroOnu: string;
  numeroRisco: string;
  classeRisco: string;
  subclasse: string;
  nomeApropriado: string;
  aspectoFisico: string;
  riscoFogo: string;
  riscoSaude: string;
  riscoAmbiente: string;
  episObrigatorios: string[];
  acoesVazamento: string;
  acoesFogo: string;
  primeirosSocorros: string;
}

const PERFIS_PADRAO: Record<string, PerfilQuimico> = {
  '3082': {
    numeroOnu: '3082',
    numeroRisco: '90',
    classeRisco: 'Classe 9 - Substâncias Perigosas Diversas',
    subclasse: '9',
    nomeApropriado: 'SUBSTÂNCIA QUE APRESENTA RISCO PARA O MEIO AMBIENTE, LÍQUIDA, N.E. (RESÍDUOS QUÍMICOS / ÓLEOS INDUSTRIAIS)',
    aspectoFisico: 'Líquido viscoso de coloração âmbar a preta, odor característico de hidrocarbonetos e solventes.',
    riscoFogo: 'Combustível quando submetido a altas temperaturas. Vapores aquecidos podem inflamar ao contato com fontes de ignição.',
    riscoSaude: 'Nocivo por inalação de vapores e contato dérmico prolongado. Pode provocar irritação ocular severa e dermatites.',
    riscoAmbiente: 'ALTAMENTE TÓXICO PARA A VIDA AQUÁTICA COM EFEITOS PROLONGADOS. Risco severo de contaminação de lençóis freáticos e mananciais.',
    episObrigatorios: [
      'Luvas de Nitrila / Neoprene cano longo',
      'Óculos de proteção panorâmico ampla visão',
      'Botas de PVC com solado antiderrapante e biqueira',
      'Máscara semifacial com filtro químico para vapores orgânicos',
      'Avental impermeável de PVC / Tyvek',
      'Capacete de segurança com carneira jugular'
    ],
    acoesVazamento: 'Eliminar todas as fontes de ignição. Conter imediatamente o produto com mantas absorventes e cordões de retenção Ambipar. Impedir a entrada em galerias pluviais, bueiros e cursos de água. Se o vazamento atingir rio, lançar imediatamente barreiras de contenção.',
    acoesFogo: 'Utilizar extintor de Pó Químico Seco (PQS 8kg), Espuma Mecânica AFFF ou neblina de água. Resfriar os tanques laterais com água. NUNCA jogar jato d\'água direto no produto líquido em chamas.',
    primeirosSocorros: 'Inalação: Remover a vítima para local ventilado. Contato dérmico: Lavar abundantemente com água e sabão por 15 min. Contato ocular: Lavar com água corrente em abundância. Ingestão: NÃO provocar vômito, acionar socorro médico imediato.'
  },
  '1993': {
    numeroOnu: '1993',
    numeroRisco: '33',
    classeRisco: 'Classe 3 - Líquidos Inflamáveis',
    subclasse: '3',
    nomeApropriado: 'LÍQUIDO INFLAMÁVEL, N.E. (MISTURA DE RESÍDUOS ORGÂNICOS E SOLVENTES INDUSTRIAIS)',
    aspectoFisico: 'Líquido límpido a translúcido, volátil, com forte odor de solventes orgânicos. Ponto de fulgor inferior a 23°C.',
    riscoFogo: 'ALTAMENTE INFLAMÁVEL. Os vapores formam misturas explosivas com o ar. Podem se deslocar até fontes de ignição e provocar retrocesso de chama.',
    riscoSaude: 'Os vapores provocam tontura, sonolência e perda de consciência. Tóxico por inalação, contato cutâneo e ingestão.',
    riscoAmbiente: 'Extremamente danoso ao ecossistema aquático e terrestre. Pode formar películas impermeabilizantes na superfície da água.',
    episObrigatorios: [
      'Luvas de PVA ou borracha butílica',
      'Óculos ampla visão estanque anti-embaçante',
      'Calçado de segurança antiestático com biqueira',
      'Máscara respiratória com filtro VO/GA (Vapores Orgânicos)',
      'Traje antiestático e antichama (Norma NFPA 2112)'
    ],
    acoesVazamento: 'Isolar a área em 100m. Não fumar. Usar ferramentas antifaiscantes. Cobrir derramamentos com areia seca, terra ou pó absorvente inerte. Recolher em tambores metálicos aterrados.',
    acoesFogo: 'Espuma mecânica para líquidos polares, pó químico PQS e CO2. Não usar jato maciço d\'água. Resfriar recipientes expostos.',
    primeirosSocorros: 'Manter a vítima em repouso. Se houver parada cardiorrespiratória, realizar massagem sem contato boca a boca. Procurar atendimento médico urgente.'
  },
  '1202': {
    numeroOnu: '1202',
    numeroRisco: '30',
    classeRisco: 'Classe 3 - Líquidos Inflamáveis / Combustíveis',
    subclasse: '3',
    nomeApropriado: 'ÓLEO DIESEL / COMBUSTÍVEL PARA MOTORES / RESÍDUO DE HIDROCARBONETOS',
    aspectoFisico: 'Líquido oleoso amarelado ou avermelhado, insolúvel em água, odor característico de diesel.',
    riscoFogo: 'Líquido combustível. Ponto de fulgor > 60°C. Queima liberando fumaça densa e fuligem rica em monóxido de carbono.',
    riscoSaude: 'Irritante leve a moderado para mucosas e vias respiratórias. O contato prolongado pode ressecar a pele.',
    riscoAmbiente: 'Contamina a água formando camada oleosa que impede a oxigenação. Mata fauna e flora aquática por asfixia.',
    episObrigatorios: [
      'Luvas de Nitrila impermeáveis',
      'Óculos de proteção com ventilação indireta',
      'Botina com biqueira e solado resistente a derivados de petróleo',
      'Macacão de algodão de manga longa',
      'Máscara contra névoas e vapores leves'
    ],
    acoesVazamento: 'Conter o óleo utilizando turfa absorvente, serragem especial ou manta hidrofóbica. Bloquear bueiros de drenagem pluvial.',
    acoesFogo: 'Extintor PQS, Espuma ou Neblina. Resfriar os tanques do caminhão com água nebulizada.',
    primeirosSocorros: 'Lavar áreas atingidas com água e sabão. Em caso de ingestão acidental, dar água para beber sem induzir vômito.'
  }
};

export const ModalFichaEmergenciaNbr7503: React.FC<ModalFichaEmergenciaNbr7503Props> = ({
  isOpen,
  onClose,
  viagem
}) => {
  const [onuSelecionada, setOnuSelecionada] = useState<string>('3082');

  if (!isOpen || !viagem) return null;

  const perfilAtual = PERFIS_PADRAO[onuSelecionada] || PERFIS_PADRAO['3082'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-300 print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Barra de Ações Superior (Oculta na Impressão) */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ambipar-500/20 border border-ambipar-500/40 text-ambipar-400 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Ficha de Emergência &amp; Envelope de Transporte (NBR 7503)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">
                  Obrigatório ANTT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Documento regulamentar para transporte de produtos perigosos e resíduos químicos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de Perfil Químico */}
            <select
              value={onuSelecionada}
              onChange={(e) => setOnuSelecionada(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-bold"
            >
              <option value="3082">ONU 3082 &bull; Resíduos Classe 9</option>
              <option value="1993">ONU 1993 &bull; Inflamáveis Classe 3</option>
              <option value="1202">ONU 1202 &bull; Óleos / Diesel Classe 3</option>
            </select>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-ambipar-500/25 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ficha A4</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================
            CORPO DA FICHA DE EMERGÊNCIA (LAYOUT OFICIAL ABNT NBR 7503)
            ========================================================= */}
        <div className="p-6 sm:p-8 space-y-4 text-[11px] leading-tight font-sans print:p-4 print:text-[10px]">
          {/* Cabeçalho Oficial */}
          <div className="border-2 border-black p-3 text-center space-y-1 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-widest text-emerald-800">
                AMBIPAR LOGISTICS S.A.
              </span>
              <span className="text-[10px] font-bold text-slate-600">
                CONFORME NORMA ABNT NBR 7503 &bull; RESOLUÇÃO ANTT Nº 5.998
              </span>
            </div>
            <h1 className="text-base font-black uppercase tracking-wider text-black">
              FICHA DE EMERGÊNCIA DE TRANSPORTE RODOVIÁRIO
            </h1>
            <p className="text-[10px] text-slate-700 font-semibold">
              DOCUMENTO DE PORTE OBRIGATÓRIO NA CABINE DO VEÍCULO &bull; FISCALIZAÇÃO PRF E ÓRGÃOS AMBIENTAIS
            </p>
          </div>

          {/* Seção 1: Identificação do Produto & Painel de Risco */}
          <div className="border border-black p-3 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Painel Laranja Oficial & Diamante de Risco */}
            <div className="flex items-center justify-center gap-4 border-r border-slate-300 pr-3">
              {/* Painel Laranja Oficial */}
              <div className="w-24 border-2 border-black bg-amber-500 text-black font-black text-center shadow-sm">
                <div className="py-1 text-sm border-b-2 border-black font-mono">
                  {perfilAtual.numeroRisco}
                </div>
                <div className="py-1 text-sm font-mono tracking-wider">
                  {perfilAtual.numeroOnu}
                </div>
              </div>

              {/* Rótulo de Risco (Diamante) */}
              <div className="w-16 h-16 border-2 border-black rotate-45 flex items-center justify-center bg-white shadow-sm shrink-0">
                <div className="-rotate-45 text-center">
                  <Flame className="w-5 h-5 mx-auto text-amber-600" />
                  <span className="text-[11px] font-black">{perfilAtual.subclasse}</span>
                </div>
              </div>
            </div>

            {/* Dados do Produto */}
            <div className="md:col-span-3 space-y-1.5">
              <div>
                <span className="font-bold text-black uppercase text-[10px] block">
                  Nome Apropriado para Embarque:
                </span>
                <strong className="text-xs font-black text-black block leading-snug">
                  {perfilAtual.nomeApropriado}
                </strong>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-600 block">Número da ONU:</span>
                  <strong className="text-black font-mono">UN {perfilAtual.numeroOnu}</strong>
                </div>
                <div>
                  <span className="text-slate-600 block">Classe / Subclasse:</span>
                  <strong className="text-black">{perfilAtual.classeRisco}</strong>
                </div>
                <div>
                  <span className="text-slate-600 block">Número de Risco:</span>
                  <strong className="text-black font-mono">{perfilAtual.numeroRisco}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Dados da Viagem & Manifesto */}
          <div className="border border-black p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 text-[10px]">
            <div>
              <span className="text-slate-600 block uppercase font-bold">Código da Viagem:</span>
              <strong className="text-black font-mono">{viagem.codigoViagem}</strong>
            </div>
            <div>
              <span className="text-slate-600 block uppercase font-bold">Manifesto MTR / SINIR:</span>
              <strong className="text-emerald-700 font-mono">{viagem.numeroMTR || 'MTR-SINIR-EMITIDO'}</strong>
            </div>
            <div>
              <span className="text-slate-600 block uppercase font-bold">Placa Cavalo / Tração:</span>
              <strong className="text-black font-mono">{viagem.placaCavalo}</strong>
            </div>
            <div>
              <span className="text-slate-600 block uppercase font-bold">Motorista Condutor:</span>
              <strong className="text-black">{viagem.motorista}</strong>
            </div>
            <div>
              <span className="text-slate-600 block uppercase font-bold">Expedidor / Cliente:</span>
              <strong className="text-black truncate block">{viagem.cliente}</strong>
            </div>
            <div>
              <span className="text-slate-600 block uppercase font-bold">Origem &rarr; Destino:</span>
              <strong className="text-black truncate block">{viagem.origem} &rarr; {viagem.destino}</strong>
            </div>
            <div>
              <span className="text-slate-600 block uppercase font-bold">Peso Total Carga:</span>
              <strong className="text-black">{viagem.pesoToneladas} Toneladas</strong>
            </div>
            <div>
              <span className="text-slate-600 block uppercase font-bold">Equipamento:</span>
              <strong className="text-black truncate block">{viagem.tipoEquipamento}</strong>
            </div>
          </div>

          {/* Seção 3: Aspecto e Perigos Principais */}
          <div className="border border-black divide-y divide-black">
            <div className="p-2.5 bg-slate-100 font-black uppercase text-xs text-black">
              1. ASPECTO FÍSICO E PERIGOS POTENCIAIS
            </div>
            <div className="p-3 space-y-1.5">
              <p><strong>Aspecto: </strong>{perfilAtual.aspectoFisico}</p>
              <p><strong>Risco de Fogo / Explosão: </strong>{perfilAtual.riscoFogo}</p>
              <p><strong>Efeitos à Saúde Humana: </strong>{perfilAtual.riscoSaude}</p>
              <p><strong>Efeitos ao Meio Ambiente: </strong>{perfilAtual.riscoAmbiente}</p>
            </div>
          </div>

          {/* Seção 4: Equipamentos de Proteção Individual (EPI NBR 9735) */}
          <div className="border border-black divide-y divide-black">
            <div className="p-2.5 bg-slate-100 font-black uppercase text-xs text-black flex items-center justify-between">
              <span>2. EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL (KIT OBRIGATÓRIO NBR 9735)</span>
              <span className="text-[10px] font-bold text-rose-700">USO EXCLUSIVO EM CASO DE EMERGÊNCIA</span>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {perfilAtual.episObrigatorios.map((epi, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{epi}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Seção 5: Medidas Imediatas em Caso de Emergência */}
          <div className="border border-black divide-y divide-black">
            <div className="p-2.5 bg-slate-100 font-black uppercase text-xs text-black">
              3. PROCEDIMENTOS OPERACIONAIS DE EMERGÊNCIA
            </div>
            <div className="p-3 space-y-2">
              <div>
                <strong className="text-black uppercase block text-[10px]">Ações em Caso de Vazamento / Tombamento:</strong>
                <p className="text-slate-800 mt-0.5">{perfilAtual.acoesVazamento}</p>
              </div>
              <div>
                <strong className="text-black uppercase block text-[10px]">Ações em Caso de Fogo / Incêndio:</strong>
                <p className="text-slate-800 mt-0.5">{perfilAtual.acoesFogo}</p>
              </div>
              <div>
                <strong className="text-black uppercase block text-[10px]">Primeiros Socorros à Tripulação ou Terceiros:</strong>
                <p className="text-slate-800 mt-0.5">{perfilAtual.primeirosSocorros}</p>
              </div>
            </div>
          </div>

          {/* Seção 6: Telefones de Emergência 24 Horas */}
          <div className="border-2 border-black p-3 bg-slate-50 space-y-2">
            <div className="text-center font-black uppercase text-xs text-rose-700">
              TELEFONES NACIONAIS DE EMERGÊNCIA &bull; PRONTA RESPOSTA 24 HORAS
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
              <div className="p-2 border border-slate-300 rounded bg-white">
                <span className="text-slate-600 block uppercase font-bold">Ambipar Response 24h</span>
                <strong className="text-xs font-black text-emerald-800 block mt-0.5 font-mono">0800 771 3778</strong>
                <span className="text-[9px] text-slate-500">0800 117 2020</span>
              </div>
              <div className="p-2 border border-slate-300 rounded bg-white">
                <span className="text-slate-600 block uppercase font-bold">Corpo de Bombeiros</span>
                <strong className="text-xs font-black text-rose-700 block mt-0.5 font-mono">193</strong>
                <span className="text-[9px] text-slate-500">Nacional Gratuito</span>
              </div>
              <div className="p-2 border border-slate-300 rounded bg-white">
                <span className="text-slate-600 block uppercase font-bold">Polícia Rodoviária Federal</span>
                <strong className="text-xs font-black text-blue-800 block mt-0.5 font-mono">191</strong>
                <span className="text-[9px] text-slate-500">Rodovias Federais</span>
              </div>
              <div className="p-2 border border-slate-300 rounded bg-white">
                <span className="text-slate-600 block uppercase font-bold">Defesa Civil / Ambiental</span>
                <strong className="text-xs font-black text-amber-700 block mt-0.5 font-mono">199</strong>
                <span className="text-[9px] text-slate-500">CETESB: 0800 011 3560</span>
              </div>
            </div>
          </div>

          {/* Campo de Assinatura do Envelope de Transporte */}
          <div className="pt-4 grid grid-cols-2 gap-8 text-center text-[10px]">
            <div className="border-t border-black pt-1">
              <strong>Carlos Eduardo (Analista de Logística)</strong>
              <span className="text-slate-600 block">Responsável pela Expedição &bull; Ambipar Logistics</span>
            </div>
            <div className="border-t border-black pt-1">
              <strong>{viagem.motorista}</strong>
              <span className="text-slate-600 block">Condutor / Tripulação &bull; Declaração de Recebimento de EPI</span>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal (Oculto na Impressão) */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Documento em conformidade com as diretrizes SASSMAQ e ANTT da Ambipar</span>
          </div>
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
