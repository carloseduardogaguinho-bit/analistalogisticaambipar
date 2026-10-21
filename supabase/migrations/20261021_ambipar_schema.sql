-- ========================================================
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
  ano_modelo INT,
  tipo_equipamento TEXT NOT NULL,
  tipo_propriedade TEXT,
  tipo_tracao TEXT,
  base_operacional TEXT NOT NULL,
  motorista_titular_nome TEXT,
  odometro_atual_km INT NOT NULL DEFAULT 0,
  capacidade_carga_ton NUMERIC(8,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Disponível',
  proxima_revisao_km INT NOT NULL DEFAULT 10000,
  data_ultima_revisao DATE,
  tipo_combustivel_padrao TEXT DEFAULT 'Diesel S10',
  is_sem_carreta BOOLEAN DEFAULT false,
  renavam TEXT,
  chassi TEXT,
  cor TEXT,
  pbt_kg NUMERIC(10,2),
  numero_civ TEXT,
  validade_civ DATE,
  numero_cipp TEXT,
  validade_cipp DATE,
  numero_cronotacografo TEXT,
  validade_cronotacografo DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Motoristas & Ajudantes
CREATE TABLE IF NOT EXISTS public.motoristas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  rg TEXT,
  telefone TEXT,
  email TEXT,
  funcao TEXT NOT NULL DEFAULT 'Motorista Titular',
  matricula TEXT,
  data_admissao DATE,
  regime_contratacao TEXT DEFAULT 'CLT Ambipar',
  base_operacional TEXT NOT NULL,
  veiculo_fixo_placa TEXT,
  status TEXT NOT NULL DEFAULT 'Ativo',
  cnh TEXT NOT NULL,
  categoria_cnh TEXT NOT NULL DEFAULT 'E',
  validade_cnh DATE NOT NULL,
  validade_mopp DATE NOT NULL,
  validade_toxico DATE NOT NULL,
  validade_aso DATE,
  validade_nr20 DATE,
  validade_nr35 DATE,
  score_ecoconducao INT DEFAULT 90,
  media_consumo_geral NUMERIC(4,2) DEFAULT 2.65,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Viagens
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
  status TEXT NOT NULL DEFAULT 'Programada',
  numero_mtr TEXT,
  numero_cte TEXT,
  tipo_combustivel TEXT,
  custo_total NUMERIC(10,2),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Manutenções da Frota
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

-- 5. Tabela de Checklist Diário (Inspeção Pré-Viagem)
CREATE TABLE IF NOT EXISTS public.checklists (
  id TEXT PRIMARY KEY,
  data_hora TIMESTAMPTZ DEFAULT now(),
  veiculo_placa TEXT NOT NULL,
  motorista_nome TEXT NOT NULL,
  km_inicial INT NOT NULL,
  km_retorno INT,
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
  status_jornada TEXT DEFAULT 'Em Jornada',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabela de Abastecimentos & Média de Combustível
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

-- 7. Tabela de Gestão de Pneus & CPK
CREATE TABLE IF NOT EXISTS public.pneus (
  id TEXT PRIMARY KEY,
  numero_fogo TEXT NOT NULL UNIQUE,
  numero_serie TEXT,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  medida TEXT NOT NULL,
  vida_atual TEXT NOT NULL DEFAULT '1ª Vida (Novo)',
  status TEXT NOT NULL DEFAULT 'Em Uso',
  veiculo_placa TEXT,
  posicao TEXT,
  sulco_atual_mm NUMERIC(4,1) NOT NULL,
  sulco_original_mm NUMERIC(4,1) NOT NULL,
  pressao_psi NUMERIC(5,1),
  km_atual_pneu INT NOT NULL DEFAULT 0,
  km_instalacao INT,
  custo_aquisicao NUMERIC(10,2) NOT NULL DEFAULT 0,
  custo_recapagens NUMERIC(10,2) NOT NULL DEFAULT 0,
  data_aquisicao DATE NOT NULL,
  data_ultima_inspecao DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tabela de Documentos Ambientais (MTR & SINIR)
CREATE TABLE IF NOT EXISTS public.documentos_ambientais (
  id TEXT PRIMARY KEY,
  numero_mtr TEXT NOT NULL UNIQUE,
  sistema_emissor TEXT NOT NULL DEFAULT 'SINIR',
  gerador TEXT NOT NULL,
  cnpj_gerador TEXT,
  destinador TEXT NOT NULL,
  cnpj_destinador TEXT,
  transportador_nome TEXT DEFAULT 'Ambipar Logistics S.A.',
  cnpj_transportador TEXT,
  placa_cavalo TEXT,
  placa_carreta TEXT,
  motorista_nome TEXT,
  codigo_ibama TEXT NOT NULL,
  descricao_residuo TEXT NOT NULL,
  classe_residuo TEXT,
  estado_fisico TEXT,
  tipo_acondicionamento TEXT,
  quantidade_ton NUMERIC(8,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Em Transporte',
  data_emissao DATE NOT NULL,
  data_validade_mtr DATE NOT NULL,
  tecnologia_destinacao TEXT,
  numero_cdf TEXT,
  viagem_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Tabela de Licenças e Laudos dos Veículos
CREATE TABLE IF NOT EXISTS public.licencas_veiculos (
  id TEXT PRIMARY KEY,
  placa TEXT,
  entidade TEXT DEFAULT 'Veículo da Frota',
  tipo_documento TEXT NOT NULL,
  numero_certificado TEXT NOT NULL,
  orgao_emissor TEXT,
  data_emissao DATE,
  data_validade DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Válido',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Tabela de Cotações de Oficinas (Auditoria de Saving)
CREATE TABLE IF NOT EXISTS public.cotacoes_oficinas (
  id TEXT PRIMARY KEY,
  veiculo_placa TEXT NOT NULL,
  sistema_afetado TEXT NOT NULL,
  descricao_servico TEXT NOT NULL,
  oficina_a_nome TEXT NOT NULL,
  oficina_a_valor NUMERIC(10,2) NOT NULL,
  oficina_b_nome TEXT NOT NULL,
  oficina_b_valor NUMERIC(10,2) NOT NULL,
  oficina_c_nome TEXT,
  oficina_c_valor NUMERIC(10,2),
  oficina_vencedora TEXT NOT NULL,
  valor_fechado NUMERIC(10,2) NOT NULL,
  saving_obtido NUMERIC(10,2) NOT NULL DEFAULT 0,
  status_aprovacao TEXT NOT NULL DEFAULT 'Aprovado',
  data_cotacao DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) & POLÍTICAS DE ACESSO
-- ========================================================
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pneus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_ambientais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licencas_veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotacoes_oficinas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Dropar políticas anteriores se existirem para evitar conflitos
  DROP POLICY IF EXISTS "Acesso Total Veiculos" ON public.veiculos;
  DROP POLICY IF EXISTS "Acesso Total Motoristas" ON public.motoristas;
  DROP POLICY IF EXISTS "Acesso Total Viagens" ON public.viagens;
  DROP POLICY IF EXISTS "Acesso Total Manutencoes" ON public.manutencoes;
  DROP POLICY IF EXISTS "Acesso Total Checklists" ON public.checklists;
  DROP POLICY IF EXISTS "Acesso Total Abastecimentos" ON public.abastecimentos;
  DROP POLICY IF EXISTS "Acesso Total Pneus" ON public.pneus;
  DROP POLICY IF EXISTS "Acesso Total Documentos Ambientais" ON public.documentos_ambientais;
  DROP POLICY IF EXISTS "Acesso Total Licencas Veiculos" ON public.licencas_veiculos;
  DROP POLICY IF EXISTS "Acesso Total Cotacoes Oficinas" ON public.cotacoes_oficinas;

  -- Criar políticas abertas para leitura/escrita com a chave anônima (Anon Key)
  CREATE POLICY "Acesso Total Veiculos" ON public.veiculos FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Acesso Total Motoristas" ON public.motoristas FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Acesso Total Viagens" ON public.viagens FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Acesso Total Manutencoes" ON public.manutencoes FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Acesso Total Checklists" ON public.checklists FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Acesso Total Abastecimentos" ON public.abastecimentos FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Acesso Total Pneus" ON public.pneus FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Acesso Total Documentos Ambientais" ON public.documentos_ambientais FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Acesso Total Licencas Veiculos" ON public.licencas_veiculos FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Acesso Total Cotacoes Oficinas" ON public.cotacoes_oficinas FOR ALL USING (true) WITH CHECK (true);
END $$;
