import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Truck,
  User,
  Navigation,
  FileText,
  FileCheck,
  LayoutDashboard,
  Wrench,
  Fuel,
  Receipt,
  Scale,
  Leaf,
  UploadCloud,
  Calculator,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Sparkles,
} from 'lucide-react';
import {
  Veiculo,
  Motorista,
  Viagem,
  DocumentoAmbiental,
  CertificadoDestinacaoFinalCDF,
  CteDocumento,
} from '../types';
import { TabType } from './Sidebar';

interface ModalBuscaGlobalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: TabType) => void;
  onOpenQrCode?: (placa?: string) => void;
  onOpenRadarSassmaq?: () => void;
  veiculos: Veiculo[];
  motoristas: Motorista[];
  viagens: Viagem[];
  mtrs: DocumentoAmbiental[];
  cdfs?: CertificadoDestinacaoFinalCDF[];
  ctes?: CteDocumento[];
}

interface ItemResultadoBusca {
  id: string;
  tipo: 'modulo' | 'veiculo' | 'motorista' | 'viagem' | 'mtr' | 'fiscal' | 'acao';
  titulo: string;
  subtitulo: string;
  badge?: string;
  badgeCor?: string;
  tabDestino?: TabType;
  acaoCallback?: () => void;
  icone: React.ReactNode;
}

export const ModalBuscaGlobal: React.FC<ModalBuscaGlobalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenQrCode,
  onOpenRadarSassmaq,
  veiculos,
  motoristas,
  viagens,
  mtrs,
  cdfs = [],
  ctes = [],
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Módulos e telas do sistema para navegação rápida
  const modulosSistema: ItemResultadoBusca[] = useMemo(
    () => [
      {
        id: 'mod-dash',
        tipo: 'modulo',
        titulo: 'Dashboard Operacional & Indicadores',
        subtitulo: 'Visão executiva da Control Tower, viagens em trânsito e status da frota',
        badge: 'Painel Central',
        tabDestino: 'dashboard',
        icone: <LayoutDashboard className="w-4 h-4 text-emerald-400" />,
      },
      {
        id: 'mod-viagens',
        tipo: 'modulo',
        titulo: 'Viagens & Escalas de Carga',
        subtitulo: 'Controle de rotas, transportes químicos, clientes e ordens de coleta',
        badge: 'Operação',
        tabDestino: 'viagens',
        icone: <Navigation className="w-4 h-4 text-cyan-400" />,
      },
      {
        id: 'mod-frota',
        tipo: 'modulo',
        titulo: 'Controle & Cadastro da Frota',
        subtitulo: 'Caminhões Truck, Bitruck, VUC, Carros, importação de CRLV e odômetros',
        badge: 'Frota',
        tabDestino: 'frota',
        icone: <Truck className="w-4 h-4 text-emerald-400" />,
      },
      {
        id: 'mod-manut',
        tipo: 'modulo',
        titulo: 'Manutenção de Frota & Preventivas',
        subtitulo: 'OS de oficina, histórico mecânico, revisões por quilometragem e borracharia',
        badge: 'Oficina',
        tabDestino: 'manutencao',
        icone: <Wrench className="w-4 h-4 text-amber-400" />,
      },
      {
        id: 'mod-cotacoes',
        tipo: 'modulo',
        titulo: 'Cotações de Oficinas & Saving Financeiro',
        subtitulo: 'Equalização de propostas comerciais, economia gerada e aprovações',
        badge: 'Saving',
        tabDestino: 'cotacoes',
        icone: <Receipt className="w-4 h-4 text-teal-400" />,
      },
      {
        id: 'mod-checklist',
        tipo: 'modulo',
        titulo: 'Auditoria de Checklist Diário',
        subtitulo: 'Checklists pré/pós-jornada, 26 itens SASSMAQ, fotos de avarias e odômetro',
        badge: 'Inspeção',
        tabDestino: 'checklist',
        icone: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
      },
      {
        id: 'mod-abastec',
        tipo: 'modulo',
        titulo: 'Controle de Abastecimento & Médias',
        subtitulo: 'Consumo por motorista (km/L), Diesel S10, HVO, GNV e metas de telemetria',
        badge: 'Combustível',
        tabDestino: 'abastecimento',
        icone: <Fuel className="w-4 h-4 text-rose-400" />,
      },
      {
        id: 'mod-motoristas',
        tipo: 'modulo',
        titulo: 'Motoristas, Revezamento & Ajudantes',
        subtitulo: 'Cadastro de condutores, CNH, MOPP, exames toxicológicos e dados de contato',
        badge: 'Equipe',
        tabDestino: 'motoristas',
        icone: <User className="w-4 h-4 text-blue-400" />,
      },
      {
        id: 'mod-medicoes',
        tipo: 'modulo',
        titulo: 'Medições & Faturamento de Clientes',
        subtitulo: 'Fechamentos mensais de fretes e contratos por tonelada ou km rodado',
        badge: 'Financeiro',
        tabDestino: 'medicoes',
        icone: <Scale className="w-4 h-4 text-indigo-400" />,
      },
      {
        id: 'mod-mtr',
        tipo: 'modulo',
        titulo: 'Conformidade Ambiental: MTR, CDF & Licenças',
        subtitulo: 'Manifestos SINIR / SIGOR, Certificados de Destinação Final e laudos',
        badge: 'Meio Ambiente',
        tabDestino: 'mtr',
        icone: <FileCheck className="w-4 h-4 text-emerald-400" />,
      },
      {
        id: 'mod-esg',
        tipo: 'modulo',
        titulo: 'Indicadores ESG & Emissões de Carbono (GEE)',
        subtitulo: 'Cálculo de CO2e evitado com biocombustíveis e resíduos valorizados',
        badge: 'Sustentabilidade',
        tabDestino: 'kpis',
        icone: <Leaf className="w-4 h-4 text-emerald-400" />,
      },
      {
        id: 'mod-fiscal',
        tipo: 'modulo',
        titulo: 'Portal Fiscal SEFAZ (CT-e & MDF-e)',
        subtitulo: 'Emissão eletrônica, DACTE, DAMDFE e integração XML com a Receita',
        badge: 'Fiscal',
        tabDestino: 'fiscal',
        icone: <FileText className="w-4 h-4 text-amber-400" />,
      },
      {
        id: 'mod-calc',
        tipo: 'modulo',
        titulo: 'Calculadora de Fretes & Tabela ANTT',
        subtitulo: 'Simulador de custo operacional, pedágios, diesel e margem de frete',
        badge: 'Simulador',
        tabDestino: 'calculadora',
        icone: <Calculator className="w-4 h-4 text-purple-400" />,
      },
      {
        id: 'mod-import',
        tipo: 'modulo',
        titulo: 'Importador de Cargas & XMLs SEFAZ',
        subtitulo: 'Importação massiva de planilhas Excel/CSV e notas fiscais',
        badge: 'Integração',
        tabDestino: 'importador',
        icone: <UploadCloud className="w-4 h-4 text-blue-400" />,
      },
    ],
    []
  );

  // Ações especiais do sistema
  const acoesEspeciais: ItemResultadoBusca[] = useMemo(() => {
    const actions: ItemResultadoBusca[] = [];
    if (onOpenQrCode) {
      actions.push({
        id: 'action-qr',
        tipo: 'acao',
        titulo: 'Gerar QR Code de Checklist dos Caminhões',
        subtitulo: 'Criar e imprimir plaqueta oficial para colar no para-brisa da cabine',
        badge: 'Operação SASSMAQ',
        acaoCallback: () => onOpenQrCode(),
        icone: <QrCode className="w-4 h-4 text-cyan-400" />,
      });
    }
    if (onOpenRadarSassmaq) {
      actions.push({
        id: 'action-sassmaq',
        tipo: 'acao',
        titulo: 'Abrir Radar SASSMAQ 360°',
        subtitulo: 'Auditoria de CNHs, MOPP, laudos CIV/CIPP de produtos perigosos e revisões',
        badge: 'Conformidade Total',
        acaoCallback: () => onOpenRadarSassmaq(),
        icone: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      });
    }
    return actions;
  }, [onOpenQrCode, onOpenRadarSassmaq]);

  // Listener global do teclado para abrir com Ctrl+K ou Cmd+K
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filtragem dinâmica de resultados
  const resultadosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Se busca estiver vazia, sugerir módulos principais e ações
    if (!q) {
      return [...acoesEspeciais, ...modulosSistema.slice(0, 6)];
    }

    const items: ItemResultadoBusca[] = [];

    // 1. Ações e Telas
    acoesEspeciais.forEach((a) => {
      if (a.titulo.toLowerCase().includes(q) || a.subtitulo.toLowerCase().includes(q)) {
        items.push(a);
      }
    });

    modulosSistema.forEach((m) => {
      if (
        m.titulo.toLowerCase().includes(q) ||
        m.subtitulo.toLowerCase().includes(q) ||
        (m.badge && m.badge.toLowerCase().includes(q))
      ) {
        items.push(m);
      }
    });

    // 2. Veículos da Frota
    veiculos.forEach((v) => {
      const matchPlaca = v.placa.toLowerCase().includes(q);
      const matchModelo = v.modelo.toLowerCase().includes(q);
      const matchMarca = v.marca.toLowerCase().includes(q);
      const matchMotorista =
        v.motoristaTitularNome && v.motoristaTitularNome.toLowerCase().includes(q);

      if (matchPlaca || matchModelo || matchMarca || matchMotorista) {
        items.push({
          id: `veic-${v.id}`,
          tipo: 'veiculo',
          titulo: `Veículo ${v.placa} &middot; ${v.modelo}`,
          subtitulo: `${v.tipoEquipamento} &middot; Odômetro: ${v.odometroAtualKm.toLocaleString(
            'pt-BR'
          )} km &middot; ${v.motoristaTitularNome ? `Titular: ${v.motoristaTitularNome}` : 'Sem titular'}`,
          badge: v.status,
          badgeCor:
            v.status === 'Disponível'
              ? 'text-emerald-400 bg-emerald-500/20'
              : v.status === 'Em Viagem'
              ? 'text-cyan-400 bg-cyan-500/20'
              : 'text-amber-400 bg-amber-500/20',
          tabDestino: 'frota',
          icone: <Truck className="w-4 h-4 text-emerald-400" />,
        });
      }
    });

    // 3. Motoristas
    motoristas.forEach((m) => {
      const matchNome = m.nome.toLowerCase().includes(q);
      const matchCpf = m.cpf.toLowerCase().includes(q);
      const matchCnh = m.cnh.toLowerCase().includes(q);

      if (matchNome || matchCpf || matchCnh) {
        items.push({
          id: `mot-${m.id}`,
          tipo: 'motorista',
          titulo: `${m.nome} (${m.funcao || 'Motorista'})`,
          subtitulo: `CPF: ${m.cpf} &middot; CNH Cat. ${m.categoriaCnh} (vence: ${m.validadeCnh}) &middot; Base: ${m.baseOperacional}`,
          badge: m.status,
          tabDestino: 'motoristas',
          icone: <User className="w-4 h-4 text-blue-400" />,
        });
      }
    });

    // 4. Viagens
    viagens.forEach((vg) => {
      const matchCod = vg.codigoViagem.toLowerCase().includes(q);
      const matchCliente = vg.cliente.toLowerCase().includes(q);
      const matchOrigem = vg.origem.toLowerCase().includes(q);
      const matchDestino = vg.destino.toLowerCase().includes(q);
      const matchPlaca = vg.placaCavalo.toLowerCase().includes(q);

      if (matchCod || matchCliente || matchOrigem || matchDestino || matchPlaca) {
        items.push({
          id: `viag-${vg.id}`,
          tipo: 'viagem',
          titulo: `Viagem ${vg.codigoViagem} &middot; ${vg.cliente}`,
          subtitulo: `${vg.origem} &rarr; ${vg.destino} &middot; Placa: ${vg.placaCavalo} &middot; ${vg.classeResiduo}`,
          badge: vg.status,
          tabDestino: 'viagens',
          icone: <Navigation className="w-4 h-4 text-cyan-400" />,
        });
      }
    });

    // 5. Documentos Ambientais MTR
    mtrs.forEach((mtr) => {
      const matchMtr = mtr.numeroMTR.toLowerCase().includes(q);
      const matchResiduo = mtr.descricaoResiduo.toLowerCase().includes(q);
      const matchGerador = mtr.gerador ? mtr.gerador.toLowerCase().includes(q) : false;

      if (matchMtr || matchResiduo || matchGerador) {
        items.push({
          id: `mtr-${mtr.id}`,
          tipo: 'mtr',
          titulo: `MTR ${mtr.numeroMTR} (${mtr.sistemaEmissor})`,
          subtitulo: `Resíduo: ${mtr.descricaoResiduo} &middot; ${mtr.quantidadeTon} Ton &middot; Gerador: ${mtr.gerador || 'Ambipar'}`,
          badge: mtr.status,
          tabDestino: 'mtr',
          icone: <FileCheck className="w-4 h-4 text-emerald-400" />,
        });
      }
    });

    // 6. CT-es
    ctes.forEach((cte) => {
      const matchCte = cte.numeroCte.toLowerCase().includes(q);
      const matchRemetente = cte.remetenteNome.toLowerCase().includes(q);
      const matchChave = cte.chaveAcesso.toLowerCase().includes(q);

      if (matchCte || matchRemetente || matchChave) {
        items.push({
          id: `cte-${cte.id}`,
          tipo: 'fiscal',
          titulo: `CT-e Nº ${cte.numeroCte} (Série ${cte.serie})`,
          subtitulo: `Remetente: ${cte.remetenteNome} &middot; R$ ${cte.valorTotalServico.toLocaleString(
            'pt-BR',
            { minimumFractionDigits: 2 }
          )} &middot; Placa: ${cte.placaTracao}`,
          badge: cte.status,
          tabDestino: 'fiscal',
          icone: <FileText className="w-4 h-4 text-amber-400" />,
        });
      }
    });

    return items.slice(0, 15);
  }, [query, modulosSistema, acoesEspeciais, veiculos, motoristas, viagens, mtrs, ctes]);

  // Tratar seleção e teclas
  const handleSelect = (item: ItemResultadoBusca) => {
    onClose();
    if (item.acaoCallback) {
      item.acaoCallback();
    } else if (item.tabDestino) {
      onNavigateToTab(item.tabDestino);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < resultadosFiltrados.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : resultadosFiltrados.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (resultadosFiltrados[selectedIndex]) {
        handleSelect(resultadosFiltrados[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Busca Superior */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite para buscar placas, motoristas, MTRs, viagens, CT-es ou telas..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-white rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-bold mr-2">
              ESC para fechar
            </span>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-800/40">
          {resultadosFiltrados.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="font-semibold text-slate-300">
                Nenhum resultado encontrado para &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tente buscar por placa, nome do motorista, número do MTR ou nome do módulo.
              </p>
            </div>
          ) : (
            resultadosFiltrados.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-ambipar-500/15 border border-ambipar-500/40 text-white'
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/60">
                      {item.icone}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-white truncate">
                          {item.titulo}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              item.badgeCor || 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitulo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-xs shrink-0">
                    <span className="text-[10px] hidden sm:inline">Acessar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé com Dicas de Atalho */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                &uarr; &darr;
              </kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                ENTER
              </kbd>
              <span>Abrir</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-ambipar-400 font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Busca Global Rápida (Ctrl + K)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
