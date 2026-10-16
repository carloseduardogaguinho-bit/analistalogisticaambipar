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
  Wrench,
  ClipboardCheck,
  Fuel,
  Users,
  Database,
  Leaf,
  DollarSign
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'viagens'
  | 'frota'
  | 'manutencao'
  | 'cotacoes'
  | 'checklist'
  | 'abastecimento'
  | 'motoristas'
  | 'medicoes'
  | 'fiscal'
  | 'mtr'
  | 'ocorrencias'
  | 'kpis'
  | 'importador'
  | 'calculadora'
  | 'relatorio';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  ocorrenciasCount: number;
  viagensCount: number;
  veiculosCount: number;
  manutencoesCount: number;
  ctesCount: number;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  ocorrenciasCount,
  viagensCount,
  veiculosCount,
  manutencoesCount,
  ctesCount,
  onOpenSupabaseModal,
  isSupabaseConnected,
}) => {
  const operacaoItems = [
    { id: 'dashboard' as TabType, label: 'Torre de Controle', icon: LayoutDashboard, badge: null },
    { id: 'viagens' as TabType, label: 'Viagens & Despacho', icon: Truck, badge: viagensCount },
    { id: 'frota' as TabType, label: 'Controle de Frota & Placas', icon: Truck, badge: veiculosCount },
    { id: 'manutencao' as TabType, label: 'Manutenções Programadas', icon: Wrench, badge: manutencoesCount > 0 ? manutencoesCount : null, badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' },
    { id: 'cotacoes' as TabType, label: 'Cotações & Oficinas (Saving)', icon: DollarSign, badge: 'SAVING', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
    { id: 'checklist' as TabType, label: 'Checklist Diário', icon: ClipboardCheck, badge: null },
    { id: 'abastecimento' as TabType, label: 'Controle Combustível & Médias', icon: Fuel, badge: 'km/L', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
    { id: 'motoristas' as TabType, label: 'Cadastro de Motoristas', icon: Users, badge: null },
  ];

  const complianceItems = [
    { id: 'medicoes' as TabType, label: 'Medições Clientes & Fornecedores', icon: FileSpreadsheet, badge: 'BM', badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' },
    { id: 'fiscal' as TabType, label: 'Emissão CT-e / DACTE / SEFAZ', icon: FileText, badge: ctesCount > 0 ? `${ctesCount}` : 'SEFAZ', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
    { id: 'mtr' as TabType, label: 'Conformidade MTR & SINIR', icon: FileCheck2, badge: null },
    { id: 'ocorrencias' as TabType, label: 'Ocorrências & Resposta 24h', icon: AlertTriangle, badge: ocorrenciasCount > 0 ? ocorrenciasCount : null, badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/40' },
    { id: 'kpis' as TabType, label: 'KPIs Operacionais & ESG', icon: BarChart3, badge: 'ESG', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
    { id: 'importador' as TabType, label: 'Importador Excel / CSV', icon: FileSpreadsheet, badge: 'PRO', badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' },
    { id: 'calculadora' as TabType, label: 'Calculadora de Frete', icon: Calculator, badge: null },
    { id: 'relatorio' as TabType, label: 'Relatório Executivo', icon: FileText, badge: null },
  ];

  return (
    <aside className="w-full lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Section 1: Operação de Frota */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Gestão Operacional & Frota
          </div>

          {operacaoItems.map((item) => {
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
                  <span className="truncate">{item.label}</span>
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

        {/* Section 2: Compliance, KPIs & Relatórios */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Compliance & Tático
          </div>

          {complianceItems.map((item) => {
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
                  <span className="truncate">{item.label}</span>
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
      </div>

      {/* Supabase External DB & Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <button
          onClick={onOpenSupabaseModal}
          className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
            isSupabaseConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase DB & Auth</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
        </button>

        <div className="px-2 py-1 text-[10px] text-slate-500 flex items-center gap-1.5">
          <Leaf className="w-3 h-3 text-ambipar-400" />
          <span>Ambipar ESG &middot; Logística Verde</span>
        </div>
      </div>
    </aside>
  );
};
