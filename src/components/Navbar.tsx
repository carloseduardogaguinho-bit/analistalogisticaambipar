import React from 'react';
import {
  Truck,
  ShieldCheck,
  RefreshCw,
  Bell,
  Database,
  Trash2,
  Smartphone,
  Search,
  QrCode,
  Sparkles,
  BookOpen,
  HardDrive,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onRefresh: () => void;
  ocorrenciasCount: number;
  sassmaqAlertasCount?: number;
  isSupabaseConnected: boolean;
  onOpenSupabaseModal: () => void;
  onOpenPortalMotorista?: () => void;
  onOpenQrCodeModal?: () => void;
  onOpenRadarSassmaq?: () => void;
  onOpenBuscaGlobal?: () => void;
  onCarregarCenarioDemo?: () => void;
  onOpenBackupModal?: () => void;
  onOpenManualPopModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  ocorrenciasCount,
  sassmaqAlertasCount = 0,
  isSupabaseConnected,
  onOpenSupabaseModal,
  onOpenPortalMotorista,
  onOpenQrCodeModal,
  onOpenRadarSassmaq,
  onOpenBuscaGlobal,
  onCarregarCenarioDemo,
  onOpenBackupModal,
  onOpenManualPopModal,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-4 lg:px-8 flex items-center justify-between gap-2">
      {/* Brand & Ambipar Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ambipar-500 to-ambipar-700 flex items-center justify-center shadow-lg shadow-ambipar-500/20 text-white font-black text-xl tracking-tighter">
          <Truck className="w-6 h-6" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-ambipar-400 bg-clip-text text-transparent">
              AMBIPAR
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-ambipar-500/10 text-ambipar-400 border border-ambipar-500/20 font-semibold tracking-wide uppercase">
              Control Tower & Frota
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Portal Operacional &middot; Analista de Logística
          </p>
        </div>
      </div>

      {/* Center Action & Quick Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md mx-2">
        {onOpenBuscaGlobal && (
          <button
            type="button"
            onClick={onOpenBuscaGlobal}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium transition shadow-inner group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-ambipar-400 transition" />
              <span className="truncate">Buscar placas, motoristas, MTRs, viagens...</span>
            </div>
            <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono font-bold group-hover:border-ambipar-500/40 group-hover:text-ambipar-400">
              Ctrl+K
            </kbd>
          </button>
        )}
      </div>

      {/* Right User & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Radar SASSMAQ */}
        {onOpenRadarSassmaq && (
          <button
            type="button"
            onClick={onOpenRadarSassmaq}
            title="Radar SASSMAQ 360° - Auditoria de CNHs, MOPP, laudos CIV/CIPP e revisões mecânicas"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Radar SASSMAQ</span>
            {sassmaqAlertasCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {sassmaqAlertasCount}
              </span>
            )}
          </button>
        )}

        {/* QR Code dos Caminhões */}
        {onOpenQrCodeModal && (
          <button
            type="button"
            onClick={onOpenQrCodeModal}
            title="Gerar e imprimir QR Code para para-brisa/cabine dos caminhões"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">QR Code Cabine</span>
          </button>
        )}

        {/* Cenário Demonstração Ambipar */}
        {onCarregarCenarioDemo && (
          <button
            type="button"
            onClick={onCarregarCenarioDemo}
            title="Carregar Cenário Operacional Ambipar com 1 clique (8 veículos, 6 motoristas/ajudantes, viagens, MTRs e cotações com saving)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-ambipar-500/20 to-emerald-500/20 hover:from-ambipar-500/30 hover:to-emerald-500/30 text-ambipar-300 border border-ambipar-500/40 text-xs font-extrabold transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-ambipar-400" />
            <span className="hidden md:inline">Demo Ambipar</span>
          </button>
        )}

        {/* Portal do Motorista */}
        {onOpenPortalMotorista && (
          <button
            type="button"
            onClick={onOpenPortalMotorista}
            title="Abrir Portal do Motorista para Checklist Diário (Mobile/Totem)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal Motorista</span>
          </button>
        )}

        {/* Manual Operacional POP */}
        {onOpenManualPopModal && (
          <button
            type="button"
            onClick={onOpenManualPopModal}
            title="Manual Operacional do Analista &middot; POP Ambipar (SASSMAQ, MTR/SINIR, Emergências 24h e Saving)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-ambipar-400" />
            <span className="hidden 2xl:inline">Manual POP</span>
          </button>
        )}

        {/* Central de Backup de Dados */}
        {onOpenBackupModal && (
          <button
            type="button"
            onClick={onOpenBackupModal}
            title="Central de Backup &amp; Restauração de Dados (Exportar/Importar JSON seguro)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden 2xl:inline">Backup</span>
          </button>
        )}

        {/* Supabase status button */}
        <button
          type="button"
          onClick={onOpenSupabaseModal}
          title={isSupabaseConnected ? 'Supabase Conectado' : 'Conectar Banco Cloud'}
          className={`p-2 rounded-lg border text-xs font-semibold transition ${
            isSupabaseConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        {/* Recarregar */}
        <button
          type="button"
          onClick={onRefresh}
          title="Recarregar dados"
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Limpar tudo para Produção Limpa */}
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                'Deseja limpar todos os dados locais e iniciar o modo PRODUÇÃO LIMPO para inserção dos veículos reais?'
              )
            ) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          title="Limpar todos os dados locais (Modo Produção Limpo)"
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Ocorrências */}
        {ocorrenciasCount > 0 && (
          <div className="relative">
            <button
              type="button"
              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>{ocorrenciasCount}</span>
            </button>
          </div>
        )}

        {/* Usuário Logado Carlos Eduardo */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-ambipar-600 to-emerald-400 flex items-center justify-center font-bold text-xs text-slate-950 shadow-md">
            CE
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">Carlos Eduardo</p>
            <p className="text-[10px] text-ambipar-400 font-medium">Analista de Logística</p>
          </div>
        </div>
      </div>
    </header>
  );
};
