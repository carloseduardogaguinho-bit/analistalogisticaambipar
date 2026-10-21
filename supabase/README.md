# 🗄️ Guia de Conexão & Migrations Supabase &middot; Ambipar Logistics

Este diretório contém o schema oficial e os scripts de migration para persistir todos os dados da plataforma na nuvem (Supabase PostgreSQL).

---

## 🚀 Como Executar a Migration no Supabase (Passo a Passo)

1. Acesse o seu painel do Supabase em [https://app.supabase.com](https://app.supabase.com).
2. Entre no seu projeto (ou crie um novo projeto gratuito, ex: `ambipar-logistica`).
3. No menu lateral esquerdo, clique no ícone **SQL Editor** (ícone de terminal `>_`).
4. Clique em **+ New Query**.
5. Abra o arquivo `supabase/migrations/20261021_ambipar_schema.sql` deste projeto, copie todo o código e cole no SQL Editor do Supabase.
6. Clique no botão verde **Run** (ou pressione `Ctrl + Enter`).
7. **Sucesso!** Todas as 10 tabelas serão criadas com as permissões de leitura e gravação (RLS) habilitadas.

---

## 🔑 Como Conectar o Sistema ao Supabase

1. No Supabase, vá em **Project Settings** (ícone de engrenagem) > **API**.
2. Copie:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon public key** (chave longa começando com `eyJ...`)
3. Na aplicação Web da Ambipar:
   - Clique no ícone de **Banco de Dados (Nuvem / Supabase)** no topo direito ou no rodapé.
   - Cole a **URL do Projeto** e a **Chave Anônima (Anon Key)**.
   - Clique em **Salvar e Testar Conexão**.
   - Quando o badge ficar **Verde (Conectado à Nuvem)**, clique no botão **☁️ Subir Todos os Dados Locais para o Supabase Agora**.

---

## 📊 Tabelas Criadas pela Migration

| Tabela | Descrição |
|---|---|
| `public.veiculos` | Cadastro de caminhões, cavalos mecânicos, trucks e carretas tanque com laudos CIV/CIPP. |
| `public.motoristas` | Condutores, validade de CNH, MOPP, Toxicológico, ASO e score de ecocondução. |
| `public.viagens` | Viagens ativas, MTR associado, rotas, clientes químicos e status em tempo real. |
| `public.manutencoes` | Ordens de serviço preventivas, corretivas e custos de oficina. |
| `public.checklists` | Vistorias pré-viagem de 26 itens realizadas pelos motoristas pelo celular. |
| `public.abastecimentos` | Abastecimentos de diesel S10, HVO e cálculo de km/litro. |
| `public.pneus` | Eixos, posições (1E, 1D, tração, estepe), sulco TWI e cálculo de CPK. |
| `public.documentos_ambientais` | Manifestos MTR, SINIR, SIGOR e certificados CDF. |
| `public.licencas_veiculos` | Licenças ambientais CETESB/IBAMA e cronotacógrafo Inmetro. |
| `public.cotacoes_oficinas` | Equalização de 3 propostas de oficinas e cálculo de saving auditado. |
