import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  SUPABASE_URL: 'ambipar_supabase_url',
  SUPABASE_KEY: 'ambipar_supabase_anon_key',
};

// Default fallback env vars or localStorage
export const getSupabaseCredentials = () => {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || '';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || envUrl;
  const storedKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || envKey;

  return {
    url: storedUrl.trim(),
    anonKey: storedKey.trim(),
    isConfigured: Boolean(storedUrl.trim() && storedKey.trim()),
  };
};

export const saveSupabaseCredentials = (url: string, anonKey: string) => {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, anonKey.trim());
  // Reset client instance
  supabaseInstance = null;
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
  supabaseInstance = null;
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error('Falha ao inicializar cliente Supabase:', err);
    return null;
  }
};

/**
 * Script SQL para o usuário rodar no SQL Editor do Supabase
 */
export const SUPABASE_SCHEMA_SQL = `-- ========================================================
-- SCHEMA AMBIPAR LOGISTICS CONTROL TOWER & FROTA (SUPABASE)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

-- 1. Tabela de Veículos da Frota
CREATE TABLE IF NOT EXISTS public.veiculos (
  id TEXT PRIMARY KEY,
  placa TEXT NOT NULL UNIQUE,
  modelo TEXT NOT NULL,
  marca TEXT NOT NULL,
  ano INT NOT NULL,
  tipo_equipamento TEXT NOT NULL,
  base_operacional TEXT NOT NULL,
  odometro_atual_km INT NOT NULL DEFAULT 0,
  capacidade_carga_ton NUMERIC(6,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Disponível',
  proxima_revisao_km INT NOT NULL DEFAULT 10000,
  data_ultima_revisao DATE,
  tipo_combustivel_padrao TEXT DEFAULT 'Diesel S10',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Motoristas
CREATE TABLE IF NOT EXISTS public.motoristas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  cnh TEXT NOT NULL,
  categoria_cnh TEXT NOT NULL DEFAULT 'E',
  validade_cnh DATE NOT NULL,
  validade_mopp DATE NOT NULL,
  validade_toxico DATE NOT NULL,
  base_operacional TEXT NOT NULL,
  veiculo_fixo_placa TEXT,
  status TEXT NOT NULL DEFAULT 'Ativo',
  media_consumo_geral NUMERIC(4,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Manutenções da Frota
CREATE TABLE IF NOT EXISTS public.manutencoes (
  id TEXT PRIMARY KEY,
  veiculo_placa TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  km_no_momento INT NOT NULL,
  km_proxima_revisao INT,
  data_entrada DATE NOT NULL,
  data_previsao_saida DATE,
  data_conclusao DATE,
  oficina TEXT NOT NULL,
  custo_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Agendada',
  responsavel_aprovacao TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Checklist Diário (Inspeção Pré-Viagem)
CREATE TABLE IF NOT EXISTS public.checklists (
  id TEXT PRIMARY KEY,
  data_hora TIMESTAMPTZ DEFAULT now(),
  veiculo_placa TEXT NOT NULL,
  motorista_nome TEXT NOT NULL,
  km_inicial INT NOT NULL,
  tipo_inspecao TEXT NOT NULL,
  pneus_pressao_e_estado BOOLEAN DEFAULT true,
  freios_estacionamento_e_servico BOOLEAN DEFAULT true,
  luzes_e_sinalizacao BOOLEAN DEFAULT true,
  extintores_pqs_validade BOOLEAN DEFAULT true,
  kit_emergencia_ambipar BOOLEAN DEFAULT true,
  vazamento_fluidos BOOLEAN DEFAULT true,
  documentacao_mtr_civ_cipp BOOLEAN DEFAULT true,
  tacografo_disco_ou_digital BOOLEAN DEFAULT true,
  resultado TEXT NOT NULL DEFAULT 'Aprovado - Liberado',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de Abastecimentos & Média de Combustível
CREATE TABLE IF NOT EXISTS public.abastecimentos (
  id TEXT PRIMARY KEY,
  data_hora TIMESTAMPTZ DEFAULT now(),
  veiculo_placa TEXT NOT NULL,
  motorista_nome TEXT NOT NULL,
  odometro_km INT NOT NULL,
  litros_abastecidos NUMERIC(8,2) NOT NULL,
  tipo_combustivel TEXT NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  posto TEXT NOT NULL,
  km_rodados_desde_ultimo INT,
  media_km_l NUMERIC(4,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabela de Viagens
CREATE TABLE IF NOT EXISTS public.viagens (
  id TEXT PRIMARY KEY,
  codigo_viagem TEXT NOT NULL UNIQUE,
  cliente TEXT NOT NULL,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  base_operacional TEXT NOT NULL,
  motorista TEXT NOT NULL,
  placa_cavalo TEXT NOT NULL,
  placa_carreta TEXT,
  tipo_equipamento TEXT NOT NULL,
  classe_residuo TEXT NOT NULL,
  peso_toneladas NUMERIC(8,2) NOT NULL,
  distancia_km INT NOT NULL,
  data_saida_prevista TEXT NOT NULL,
  data_chegada_prevista TEXT NOT NULL,
  status TEXT NOT NULL,
  numero_mtr TEXT,
  numero_cte TEXT,
  tipo_combustivel TEXT,
  custo_total NUMERIC(10,2),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Desabilitar RLS inicialmente para permitir leitura/escrita rápida com Anon Key
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Total Veiculos" ON public.veiculos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Motoristas" ON public.motoristas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Manutencoes" ON public.manutencoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Checklists" ON public.checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Abastecimentos" ON public.abastecimentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Viagens" ON public.viagens FOR ALL USING (true) WITH CHECK (true);
`;
