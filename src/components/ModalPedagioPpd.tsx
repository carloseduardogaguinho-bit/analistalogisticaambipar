import React, { useState } from 'react';
import {
  X,
  Printer,
  Send,
  MapPin,
  Truck,
  CreditCard,
  ShieldCheck,
  Compass,
  DollarSign,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ModalPedagioPpdProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PracaPedagio {
  concessionaria: string;
  rodovia: string;
  km: string;
  tarifaBaseEixo: number;
}

interface PontoDescansoPPD {
  nome: string;
  rodovia: string;
  km: string;
  municipio: string;
  vagasPesados: number;
  vigilancia24h: boolean;
  pisoPavimentado: boolean;
  chuveirosGratuitos: boolean;
  restaurante: boolean;
  autorizadoPerigosos: boolean;
}

const ROTAS_PREDEFINIDAS = [
  {
    nome: 'São Paulo (Paulínia) &rarr; Santos (Porto)',
    distanciaKm: 185,
    pracas: [
      { concessionaria: 'CCR AutoBAn', rodovia: 'SP-330 (Anhanguera)', km: 'Km 26 - Valinhos', tarifaBaseEixo: 12.80 },
      { concessionaria: 'CCR AutoBAn', rodovia: 'SP-330 (Anhanguera)', km: 'Km 53 - Jundiaí', tarifaBaseEixo: 13.40 },
      { concessionaria: 'Ecovias', rodovia: 'SP-160 (Imigrantes)', km: 'Km 32 - Diadema/Planalto', tarifaBaseEixo: 36.80 },
      { concessionaria: 'Ecovias', rodovia: 'SP-160 (Imigrantes)', km: 'Km 58 - Piratininga', tarifaBaseEixo: 16.20 },
    ]
  },
  {
    nome: 'São Paulo (Paulínia) &rarr; Rio de Janeiro (Polo Duque de Caxias)',
    distanciaKm: 490,
    pracas: [
      { concessionaria: 'CCR AutoBAn', rodovia: 'SP-330', km: 'Km 26', tarifaBaseEixo: 12.80 },
      { concessionaria: 'CCR RioSP', rodovia: 'BR-116 (Dutra)', km: 'Km 182 - Moreira César', tarifaBaseEixo: 18.20 },
      { concessionaria: 'CCR RioSP', rodovia: 'BR-116 (Dutra)', km: 'Km 110 - Taubaté', tarifaBaseEixo: 18.20 },
      { concessionaria: 'CCR RioSP', rodovia: 'BR-116 (Dutra)', km: 'Km 59 - Guaratinguetá', tarifaBaseEixo: 18.20 },
      { concessionaria: 'CCR RioSP', rodovia: 'BR-116 (Dutra)', km: 'Km 207 - Viúva Graça RJ', tarifaBaseEixo: 19.50 },
    ]
  },
  {
    nome: 'São Paulo (Paulínia) &rarr; Curitiba (CIC / Araucária)',
    distanciaKm: 420,
    pracas: [
      { concessionaria: 'Arteris Régis Bittencourt', rodovia: 'BR-116 Sul', km: 'Km 298 - Itapecerica', tarifaBaseEixo: 4.80 },
      { concessionaria: 'Arteris Régis Bittencourt', rodovia: 'BR-116 Sul', km: 'Km 370 - Miracatu', tarifaBaseEixo: 4.80 },
      { concessionaria: 'Arteris Régis Bittencourt', rodovia: 'BR-116 Sul', km: 'Km 426 - Juquiá', tarifaBaseEixo: 4.80 },
      { concessionaria: 'Arteris Régis Bittencourt', rodovia: 'BR-116 Sul', km: 'Km 485 - Cajati', tarifaBaseEixo: 4.80 },
      { concessionaria: 'Arteris Régis Bittencourt', rodovia: 'BR-116 Sul', km: 'Km 542 - Barra do Turvo', tarifaBaseEixo: 4.80 },
      { concessionaria: 'Arteris Régis Bittencourt', rodovia: 'BR-116 Sul', km: 'Km 01 - Campina Grande do Sul PR', tarifaBaseEixo: 4.80 },
    ]
  }
];

const PPDS_HOMOLOGADOS: PontoDescansoPPD[] = [
  {
    nome: 'Posto Graal 56 (CCR AutoBAn)',
    rodovia: 'SP-330 (Anhanguera)',
    km: 'Km 56 - Jundiaí SP',
    municipio: 'Jundiaí - SP',
    vagasPesados: 120,
    vigilancia24h: true,
    pisoPavimentado: true,
    chuveirosGratuitos: true,
    restaurante: true,
    autorizadoPerigosos: true,
  },
  {
    nome: 'Posto Sakamoto / Shell Select',
    rodovia: 'BR-116 (Dutra)',
    km: 'Km 214 - Guarulhos SP',
    municipio: 'Guarulhos - SP',
    vagasPesados: 180,
    vigilancia24h: true,
    pisoPavimentado: true,
    chuveirosGratuitos: true,
    restaurante: true,
    autorizadoPerigosos: true,
  },
  {
    nome: 'PPD Homologado Arco-Íris Roseira',
    rodovia: 'BR-116 (Dutra)',
    km: 'Km 82 - Roseira SP',
    municipio: 'Roseira - SP',
    vagasPesados: 150,
    vigilancia24h: true,
    pisoPavimentado: true,
    chuveirosGratuitos: true,
    restaurante: true,
    autorizadoPerigosos: true,
  },
  {
    nome: 'Posto Fazendeiro & Cargas Perigosas',
    rodovia: 'BR-116 (Régis Bittencourt)',
    km: 'Km 450 - Registro SP',
    municipio: 'Registro - SP',
    vagasPesados: 95,
    vigilancia24h: true,
    pisoPavimentado: true,
    chuveirosGratuitos: true,
    restaurante: true,
    autorizadoPerigosos: true,
  }
];

export const ModalPedagioPpd: React.FC<ModalPedagioPpdProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [rotaIndex, setRotaIndex] = useState(0);
  const [quantidadeEixos, setQuantidadeEixos] = useState<number>(6); // Padrão: Carreta 6 eixos
  const [eixoSuspensoVazio, setEixoSuspensoVazio] = useState<boolean>(false);
  const [eixosSuspensosQtd, setEixosSuspensosQtd] = useState<number>(1);
  const [tagEletronica, setTagEletronica] = useState<'Sem Parar' | 'ConectCar' | 'Veloe' | 'Vale-Pedágio Obrigatório Repom'>('Sem Parar');

  const rotaAtual = ROTAS_PREDEFINIDAS[rotaIndex];

  // Cálculo de eixos faturáveis (Lei 13.103: Eixos suspensos são isentos em caminhão vazio)
  const eixosFaturados = eixoSuspensoVazio ? Math.max(2, quantidadeEixos - eixosSuspensosQtd) : quantidadeEixos;

  // Cálculo total de pedágio
  const pedagioTotal = rotaAtual.pracas.reduce((acc, p) => {
    return acc + (p.tarifaBaseEixo * eixosFaturados);
  }, 0);

  const economiaEixoSuspenso = eixoSuspensoVazio
    ? rotaAtual.pracas.reduce((acc, p) => acc + (p.tarifaBaseEixo * eixosSuspensosQtd), 0)
    : 0;

  const custoPorKmPedagio = rotaAtual.distanciaKm > 0
    ? (pedagioTotal / rotaAtual.distanciaKm).toFixed(2)
    : '0.00';

  const handlePrint = () => {
    window.print();
  };

  const handleEnviarWhatsApp = () => {
    const texto = `🛣️ *PLANO DE PEDÁGIOS & PONTOS DE DESCANSO (LEI 13.103)*
*AMBIPAR LOGISTICS &bull; ROTEIRIZAÇÃO INTELIGENTE*
--------------------------------------------------
📍 *Rota:* ${rotaAtual.nome.replace('&rarr;', '->')}
📏 *Distância:* ${rotaAtual.distanciaKm} km
🚛 *Conjunto:* ${quantidadeEixos} Eixos ${eixoSuspensoVazio ? `(${eixosSuspensosQtd} eixo suspenso - Retorno Vazio)` : '(Carregado)'}
💳 *Meio de Pagamento:* ${tagEletronica}

💰 *CUSTO ESTIMADO DE PEDÁGIO:* ${formatCurrency(pedagioTotal)}
💸 *Economia com Eixo Erguido:* ${formatCurrency(economiaEixoSuspenso)}
📊 *Custo Médio de Pedágio / Km:* R$ ${custoPorKmPedagio}/km

🛑 *PONTOS DE PARADA E DESCANSO HOMOLOGADOS (PPDs):*
${PPDS_HOMOLOGADOS.map(p => `• *${p.nome}* (${p.rodovia}, ${p.km}) - Vagas: ${p.vagasPesados} | Segurança 24h & Chuveiros | Carga Perigosa: OK`).join('\n')}

_Planejamento Operacional por Carlos Eduardo (Analista de Logística Ambipar)_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col print:bg-white print:border-none print:shadow-none print:max-h-none print:w-full print:m-0">
        
        {/* Barra Superior */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Calculador de Pedágio por Eixos &amp; PPDs Homologados</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold">
                  Lei 13.103 / ANTT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoria de tarifas por praça, isenção de eixos suspensos e paradas credenciadas de descanso
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnviarWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
              title="Disparar Rota e PPDs para o Motorista"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar Motorista</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-600 transition"
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
          
          {/* Seletor de Rota e Configuração do Veículo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Rota Operacional Ambipar</label>
              <select
                value={rotaIndex}
                onChange={(e) => setRotaIndex(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                {ROTAS_PREDEFINIDAS.map((r, idx) => (
                  <option key={idx} value={idx}>
                    {r.nome.replace('&rarr;', '->')} ({r.distanciaKm} km)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Configuração de Eixos do Conjunto</label>
              <select
                value={quantidadeEixos}
                onChange={(e) => setQuantidadeEixos(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value={2}>2 Eixos - Caminhão Toco / VUC</option>
                <option value={3}>3 Eixos - Truck 6x2 / 6x4</option>
                <option value={4}>4 Eixos - Bitruck 8x2</option>
                <option value={5}>5 Eixos - Cavalo 4x2 + Carreta 3 eixos</option>
                <option value={6}>6 Eixos - Cavalo 6x2 + Carreta 3 eixos</option>
                <option value={7}>7 Eixos - Bitrem / Tanque Especial</option>
                <option value={9}>9 Eixos - Rodotrem 30 Metros</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Meio de Pagamento / Tag</label>
              <select
                value={tagEletronica}
                onChange={(e) => setTagEletronica(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="Sem Parar">Sem Parar (Faturamento Automático)</option>
                <option value="ConectCar">ConectCar Frotas</option>
                <option value="Veloe">Veloe Go</option>
                <option value="Vale-Pedágio Obrigatório Repom">Vale-Pedágio Repom (Lei 10.209)</option>
              </select>
            </div>
          </div>

          {/* Isenção de Eixo Suspenso (Lei 13.103) */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs print:hidden">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="eixoSuspensoCheck"
                checked={eixoSuspensoVazio}
                onChange={(e) => setEixoSuspensoVazio(e.target.checked)}
                className="w-4 h-4 rounded text-ambipar-500 accent-ambipar-500 cursor-pointer"
              />
              <label htmlFor="eixoSuspensoCheck" className="text-slate-300 font-semibold cursor-pointer">
                Retorno Vazio com Eixo Suspenso Erguido (Isenção Tarifária Legal - Lei 13.103/15)
              </label>
            </div>

            {eixoSuspensoVazio && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Eixos erguidos:</span>
                <select
                  value={eixosSuspensosQtd}
                  onChange={(e) => setEixosSuspensosQtd(parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs font-mono"
                >
                  <option value={1}>1 Eixo</option>
                  <option value={2}>2 Eixos</option>
                </select>
                <span className="text-emerald-400 font-bold text-[11px]">
                  Economia de {formatCurrency(economiaEixoSuspenso)}
                </span>
              </div>
            )}
          </div>

          {/* Cards de Resumo Financeiro da Rota */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Custo Total Pedágio</span>
              <span className="text-2xl font-black text-amber-400 print:text-black font-mono mt-0.5 block">
                {formatCurrency(pedagioTotal)}
              </span>
              <span className="text-[10px] text-slate-500">{rotaAtual.pracas.length} praças de pedágio</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Custo Pedágio / Km</span>
              <span className="text-2xl font-black text-blue-400 print:text-black font-mono mt-0.5 block">
                R$ {custoPorKmPedagio}
              </span>
              <span className="text-[10px] text-slate-500">por quilômetro percorrido</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Eixos Faturáveis</span>
              <span className="text-2xl font-black text-white print:text-black font-mono mt-0.5 block">
                {eixosFaturados} Eixos
              </span>
              <span className="text-[10px] text-slate-500">
                {eixoSuspensoVazio ? `${eixosSuspensosQtd} eixo(s) suspenso(s)` : 'Sem eixos suspensos'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Modalidade Tag</span>
              <span className="text-base font-bold text-emerald-400 print:text-black mt-1 block truncate">
                {tagEletronica}
              </span>
              <span className="text-[10px] text-slate-500">Passagem direta sem fila</span>
            </div>
          </div>

          {/* Praças de Pedágio da Rota */}
          <div className="border border-slate-800 print:border-black rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-950 p-2.5 border-b border-slate-800 print:border-black flex items-center justify-between">
              <span className="text-xs font-bold text-white print:text-black uppercase tracking-wider">
                Praças Concessionadas no Trecho ({rotaAtual.pracas.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {rotaAtual.distanciaKm} km rodados
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 print:bg-slate-100 text-slate-400 print:text-black border-b border-slate-800 text-[10px] uppercase">
                <tr>
                  <th className="py-2 px-3">Concessionária</th>
                  <th className="py-2 px-3">Rodovia & KM</th>
                  <th className="py-2 px-3 text-right">Tarifa Unitária / Eixo</th>
                  <th className="py-2 px-3 text-right">Eixos Cobrados</th>
                  <th className="py-2 px-3 text-right">Valor Praça</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                {rotaAtual.pracas.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-semibold text-white print:text-black">{p.concessionaria}</td>
                    <td className="py-2 px-3 text-slate-300 print:text-black">{p.rodovia} ({p.km})</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">R$ {p.tarifaBaseEixo.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-white print:text-black">{eixosFaturados}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-amber-400 print:text-black">
                      {formatCurrency(p.tarifaBaseEixo * eixosFaturados)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pontos de Parada e Descanso Homologados (PPDs) */}
          <div className="border border-slate-800 print:border-black rounded-xl p-4 bg-slate-950/60 print:bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-2">
                <Coffee className="w-4 h-4 text-ambipar-400" />
                Pontos de Parada e Descanso Homologados &middot; Lei do Motorista 13.103
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                100% Homologados MT / ANTT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {PPDS_HOMOLOGADOS.map((ppd, index) => (
                <div key={index} className="p-3 rounded-lg bg-slate-900 border border-slate-800 print:border-slate-300 print:bg-slate-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-white print:text-black text-xs font-bold">{ppd.nome}</strong>
                    <span className="text-[10px] font-mono text-ambipar-400 font-bold">{ppd.vagasPesados} vagas</span>
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{ppd.rodovia} &bull; {ppd.km} ({ppd.municipio})</span>
                  </div>
                  <div className="pt-1 flex flex-wrap gap-1 text-[9px] font-semibold text-slate-300 print:text-slate-700">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Segurança 24h</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Chuveiros Gratuitos</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Pátio Pavimentado</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold">
                      Aprovado Cargas Perigosas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assinatura do Planejamento de Rota */}
          <div className="pt-4 border-t border-slate-700 print:border-black grid grid-cols-2 gap-8 text-center text-[10px]">
            <div className="border-t border-slate-600 print:border-black pt-1">
              <strong className="block text-white print:text-black">Carlos Eduardo (Analista de Logística Sênior)</strong>
              <span className="text-slate-400 print:text-slate-600">Roteirização &bull; Ambipar Logistics</span>
            </div>
            <div className="border-t border-slate-600 print:border-black pt-1">
              <strong className="block text-white print:text-black">Condutor / Motorista Titular</strong>
              <span className="text-slate-400 print:text-slate-600">Declaração de Ciência dos PPDs da Rota</span>
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <span>Tabelas de tarifas atualizadas de acordo com ARTESP e ANTT 2026</span>
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
