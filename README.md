# Painel de Licitações RJ - Inteligência de Mercado

Este é um painel avançado para monitoramento e análise de licitações públicas do Estado do Rio de Janeiro, utilizando dados oficiais do PNCP (Portal Nacional de Contratações Públicas).

## 🚀 Funcionalidades

- **Monitoramento em Tempo Real**: Captura de licitações diretamente da API do PNCP.
- **Sincronização Completa**: Download automático de itens e arquivos (editais/anexos) para o banco de dados local.
- **Categorização via IA**: Utiliza Inteligência Artificial (OpenRouter/OpenAI) para processar descrições brutas e extrair:
  - **Item Macro**: Nome simplificado e padronizado do produto.
  - **Categoria Geral**: Agrupamento por área de atuação (TI, Construção, Alimentação, etc).
- **Inteligência de Mercado**: Painel exclusivo para busca filtrada por categorias mapeadas por IA, facilitando a descoberta de oportunidades específicas.
- **Gestão de Favoritos**: Salve licitações de interesse para acompanhamento posterior.

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL / SQLite com [Prisma ORM](https://www.prisma.io/)
- **Estilização**: Tailwind CSS
- **IA**: OpenAI SDK + OpenRouter (Modelo: `openrouter/owl-alpha`)

## 🏁 Como Iniciar

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Configure o ambiente**:
   Crie um arquivo `.env` na raiz com as seguintes variáveis:
   ```env
   DATABASE_URL="file:./dev.db"
   OPENROUTER_API_KEY="sua_chave_aqui"
   ```

3. **Sincronize o Banco de Dados**:
   ```bash
   npx prisma db push
   ```

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

5. **Acesse**:
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura de Pastas

- `app/`: Rotas e páginas da aplicação (Next.js App Router).
- `app/api/`: Endpoints de backend (Categorização, Busca Inteligente, Sync).
- `src/components/`: Componentes de interface (Tabelas, Filtros, Dashboards).
- `src/services/`: Lógica de negócio e integração (Banco de Dados, Sincronização PNCP).
- `prisma/`: Definição do schema e migrations.
