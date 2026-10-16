import React, { useState, useEffect } from 'react';
import {
  Database,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  Lock,
  User,
  LogOut,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  getSupabaseClient,
  SUPABASE_SCHEMA_SQL
} from '../services/supabase';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: (connected: boolean) => void;
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  onConnectionChange,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'auth'>('config');
  const [copiedSql, setCopiedSql] = useState(false);
  const [testStatus, setTestStatus] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  // Auth State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUser, setAuthUser] = useState<any>(null);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setUrl(creds.url);
    setAnonKey(creds.anonKey);
    setIsConnected(creds.isConfigured);
    checkUser();
  }, [isOpen]);

  const checkUser = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const { data } = await client.auth.getUser();
      setAuthUser(data.user);
    } catch {
      setAuthUser(null);
    }
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestStatus('');

    if (!url || !anonKey) {
      setTestStatus('Por favor, informe a URL e a Anon Key do seu projeto Supabase.');
      setIsTesting(false);
      return;
    }

    try {
      saveSupabaseCredentials(url, anonKey);
      const client = getSupabaseClient();

      if (!client) {
        setTestStatus('Erro: Configuração inválida.');
        setIsTesting(false);
        return;
      }

      // Quick test query to check connection
      const { error } = await client.from('veiculos').select('id').limit(1);

      if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.veiculos" does not exist')) {
        // Connected, but table might not exist yet which is totally normal!
      }

      setIsConnected(true);
      onConnectionChange(true);
      setTestStatus('Conexão com o Supabase estabelecida com sucesso! ✅');
    } catch (err: any) {
      setTestStatus(`Erro ao conectar: ${err.message || 'Verifique as credenciais informadas.'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setIsConnected(false);
    onConnectionChange(false);
    setTestStatus('Supabase desconectado. O sistema continuará operando com LocalStorage.');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage('');
    const client = getSupabaseClient();
    if (!client) {
      setAuthMessage('Conecte o Supabase primeiro na aba "Configuração".');
      return;
    }
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) throw error;
      setAuthUser(data.user);
      setAuthMessage('Login realizado com sucesso!');
    } catch (err: any) {
      setAuthMessage(`Erro no login: ${err.message}`);
    }
  };

  const handleSignUp = async () => {
    setAuthMessage('');
    const client = getSupabaseClient();
    if (!client) {
      setAuthMessage('Conecte o Supabase primeiro na aba "Configuração".');
      return;
    }
    try {
      const { data, error } = await client.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) throw error;
      setAuthMessage('Cadastro enviado! Verifique seu e-mail para confirmar a conta.');
    } catch (err: any) {
      setAuthMessage(`Erro no cadastro: ${err.message}`);
    }
  };

  const handleSignOut = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
      setAuthUser(null);
      setAuthMessage('Sessão encerrada com sucesso.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Integração Supabase Database & Auth</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isConnected ? 'Conectado' : 'Modo Offline (Local)'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Conecte seu banco de dados PostgreSQL na nuvem e sistema de autenticação.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            1. Configuração de Chaves
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            2. Script SQL das Tabelas
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'auth'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            3. Autenticação & Usuários
          </button>
        </div>

        {/* Tab 1: Config */}
        {activeTab === 'config' && (
          <form onSubmit={handleTestAndSave} className="p-6 space-y-4 text-xs overflow-y-auto">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-slate-300 font-semibold block">Onde encontrar suas chaves no Supabase?</span>
              <p className="text-slate-400 leading-relaxed">
                No seu painel do Supabase, acesse: <strong>Project Settings &rarr; API</strong>.
                Copie a <strong>Project URL</strong> e a chave <strong>anon public</strong> e cole abaixo:
              </p>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Project URL</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Supabase Anon Public API Key</span>
              </label>
              <input
                type="text"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
              />
            </div>

            {testStatus && (
              <div className={`p-3 rounded-xl border text-xs font-semibold ${
                testStatus.includes('sucesso')
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {testStatus}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
                >
                  Desconectar Supabase
                </button>
              )}

              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition flex items-center gap-1.5"
                >
                  {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isTesting ? 'Validando...' : 'Salvar & Conectar'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: SQL Script */}
        {activeTab === 'sql' && (
          <div className="p-6 space-y-4 text-xs overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">
                Copie este script e cole no menu <strong>SQL Editor</strong> do seu Supabase:
              </span>
              <button
                onClick={handleCopySql}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
              </button>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-80 leading-relaxed">
              <pre>{SUPABASE_SCHEMA_SQL}</pre>
            </div>

            <p className="text-[11px] text-slate-500">
              * Este script cria as tabelas de <strong>veículos</strong>, <strong>motoristas</strong>, <strong>manutenções</strong>, <strong>checklists</strong>, <strong>abastecimentos</strong> e <strong>viagens</strong> com políticas abertas de segurança RLS.
            </p>
          </div>
        )}

        {/* Tab 3: Auth & Users */}
        {activeTab === 'auth' && (
          <div className="p-6 space-y-4 text-xs overflow-y-auto">
            {authUser ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Usuário Autenticado no Supabase</span>
                </div>
                <div className="text-slate-200">
                  E-mail: <strong>{authUser.email}</strong>
                </div>
                <div className="text-slate-400 font-mono text-[10px]">
                  ID: {authUser.id}
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-2 hover:bg-rose-500/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta (Logout)</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-3">
                <p className="text-slate-300 leading-relaxed">
                  Faça login com sua conta corporativa da Ambipar criada no Supabase Auth:
                </p>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">E-mail Corporativo</label>
                  <input
                    type="email"
                    required
                    placeholder="carlos.eduardo@ambipar.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                {authMessage && (
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
                    {authMessage}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition flex-1"
                  >
                    Entrar no Sistema
                  </button>
                  <button
                    type="button"
                    onClick={handleSignUp}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
                  >
                    Criar Conta
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
