# 🚛 Ambipar Logistics Control Tower &middot; Portal do Analista

Plataforma integrada de gestão operacional e tática desenvolvida sob medida para **Analista de Logística** na **Ambipar**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcarloseduardogaguinho-bit%2Fanalistalogisticaambipar)

---

## 🌟 Visão Geral da Plataforma

Este sistema foi construído para centralizar as rotinas críticas da logística ambiental e industrial da Ambipar:
- **Torre de Controle (Control Tower)**: Visão consolidada em tempo real de viagens em trânsito, veículos em cliente, alertas e desempenho diário.
- **Gestão de Viagens & Frotas**: Controle de equipamentos pesados (Carretas Tanque Inox, Roll-on/Roll-off, Poliguindastes, Sider, VUCs), motoristas, placas e status de transporte.
- **Conformidade Ambiental & MTR**: Rastreabilidade completa de **MTR (SINIR / SIGOR / FEPAM / INEA)**, emissão e baixa de **CDF (Certificado de Destinação Final)** e controle de validade de licenças **CIPP / CIV / IBAMA**.
- **Torre de Ocorrências & Resposta 24h**: Gestão de não-conformidades de carga, atrasos de janela e integração com o canal de acionamento de emergência **Ambipar Response**.
- **Painel de Indicadores (KPIs) & Descarbonização ESG**: Cálculo de OTIF, custo médio por km/tonelada e calculadora da pegada de carbono evitada com combustíveis verdes (**HVO / Diesel Verde**, **Frota Elétrica** e **GNV**).
- **Importador & Exportador Inteligente (Excel/CSV)**: Leitura automática de planilhas de rastreadores (Autotrac, Sascar, OnixSat) e ERPs com exportação completa em formato `.xlsx`.
- **Calculadora Rápida de Fretes**: Ferramenta para composição de custos diretos (combustível, pedágios por eixo, diária de motorista e margem operacional).
- **Boletim Executivo Gerencial**: Relatório pronto para envio ou impressão limpa em PDF para coordenação e gerência.

---

## 🚀 Como Hospedar na Vercel (Passo a Passo)

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard).
2. Clique em **"Add New..."** &rarr; **"Project"**.
3. Importe o repositório GitHub: **`carloseduardogaguinho-bit/analistalogisticaambipar`**.
4. A Vercel detectará automaticamente o framework Vite:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Clique em **"Deploy"**! Em menos de 1 minuto seu sistema estará no ar com link público HTTPS.

---

## 💻 Como Executar Localmente

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor local de desenvolvimento
npm run dev

# 3. Gerar a versão de produção
npm run build
```

---

## 🛠️ Tecnologias Utilizadas

- **React 18** + **TypeScript**
- **Vite** (Build ultrarrápido)
- **Tailwind CSS** (Paleta oficial Ambipar Verde / Slate)
- **Lucide Icons**
- **Recharts** (Gráficos interativos)
- **SheetJS (xlsx)** (Processamento de planilhas em memória)
- **Vercel Zero-Config** (`vercel.json`)

---

*Desenvolvido com foco na excelência operacional da Ambipar.*
