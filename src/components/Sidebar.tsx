import React from 'react';
import {
  LayoutDashboard,
  Truck,
  FileCheck2,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Calculator,
  Leaf
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'viagens'
  | 'mtr'
  | 'ocorrencias'
  | 'kpis'
  | 'importador'
  | 'relatorio'
  | 'calculadora';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  ocorrenciasCount: number;
  viagensCount: number;
  mtrsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  ocorrenciasCount,
  viagensCount,
  mtrsCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Torre de Controle',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'viagens' as TabType,
      label: 'Gestão de Frotas & Viagens',
      icon: Truck,
      badge: viagensCount,
    },
    {
      id: 'mtr' as TabType,
      label: 'Conformidade MTR & Licenças',
      icon: FileCheck2,
      badge: mtrsCount,
    },
    {
      id: 'ocorrencias' as TabType,
      label: 'Ocorrências & Resposta 24h',
      icon: AlertTriangle,
      badge: ocorrenciasCount > 0 ? ocorrenciasCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
    },
    {
      id: 'kpis' as TabType,
      label: 'KPIs Operacionais & ESG',
      icon: BarChart3,
      badge: 'ESG',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    },
    {
      id: 'importador' as TabType,
      label: 'Importador Excel / CSV',
      icon: FileSpreadsheet,
      badge: 'PRO',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
    },
    {
      id: 'calculadora' as TabType,
      label: 'Calculadora de Frete & Rota',
      icon: Calculator,
      badge: null,
    },
    {
      id: 'relatorio' as TabType,
      label: 'Relatório Executivo Gerencial',
      icon: FileText,
      badge: null,
    },
  ];

  return (
    <aside className="w-full lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navegação Principal
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-ambipar-600 text-white shadow-lg shadow-ambipar-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor
                      ? item.badgeColor
                      : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ambipar Eco commitment footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 m-3 rounded-2xl">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
          <Leaf className="w-4 h-4" />
          <span>Compromisso ESG Ambipar</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Monitoramento contínuo de emissões de carbono e rastreabilidade 100% de resíduos com MTR SINIR.
        </p>
      </div>
    </aside>
  );
};
