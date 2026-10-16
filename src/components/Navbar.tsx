import React from 'react';
import { Truck, ShieldCheck, RefreshCw, GitBranch, Bell, Database, Trash2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onRefresh: () => void;
  ocorrenciasCount: number;
  isSupabaseConnected: boolean;
  onOpenSupabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  ocorrenciasCount,
  isSupabaseConnected,
  onOpenSupabaseModal,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
      {/* Brand & Ambipar Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ambipar-500 to-ambipar-700 flex items-center justify-center shadow-lg shadow-ambipar-500/20 text-white font-black text-xl tracking-tighter">
          <Truck className="w-6 h-6" />
        </div>
        <div>
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

      {/* Center status badges */}
      <div className="hidden md:flex items-center gap-3">
        {/* Supabase status button */}
        <button
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
            isSupabaseConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Supabase: {isSupabaseConnected ? 'Conectado (PostgreSQL)' : 'Conectar Banco'}</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SINIR / MTR: Ativo</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-ambipar-400" />
          <span>Ambipar Response 24h</span>
        </div>
      </div>

      {/* Right User & Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          title="Recarregar dados"
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            if (confirm('Deseja limpar todos os dados locais e reiniciar o sistema totalmente limpo?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          title="Limpar todos os dados locais e reiniciar limpo"
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {ocorrenciasCount > 0 && (
          <div className="relative">
            <button className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition flex items-center gap-1.5 text-xs font-semibold">
              <Bell className="w-4 h-4 animate-bounce" />
              <span>{ocorrenciasCount} Alerta{ocorrenciasCount > 1 ? 's' : ''}</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-ambipar-600 to-emerald-400 flex items-center justify-center font-bold text-xs text-slate-950">
            CE
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">Carlos Eduardo</p>
            <p className="text-[10px] text-ambipar-400 font-medium">Analista de Logística</p>
          </div>
        </div>
      </div>
    </header>
  );
};
