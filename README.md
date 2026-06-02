# GameVault — Integração Supabase

Instruções rápidas para integrar o projeto com Supabase (persistência em nuvem).

1) Crie um projeto no Supabase
  - Acesse https://app.supabase.com e crie um novo projeto.

2) Crie o schema
  - Abra o **SQL Editor** no painel do Supabase e cole o conteúdo de `supabase/schema.sql`.
  - Execute para criar as tabelas `profiles` e `jogos`.

3) Obtenha as variáveis de ambiente
  - No painel do projeto, copie a `API URL` (será semelhante a `https://xxx.supabase.co`) e a `anon public` key.
  - Crie um arquivo `.env.local` na raiz do projeto com estas variáveis (ou use `.env`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4) Instale dependências e rode em dev

```bash
npm install
npm run dev
```

5) Teste
  - Abra o app em `http://localhost:5173` (ou URL mostrada pelo Vite).
  - Cadastre um usuário / faça login para usar a persistência do Supabase.

Observações
- O projeto já contém um cliente Supabase em `src/lib/supabase.ts` e o uso está implementado em `src/contexts/AuthContext.tsx` e em `src/pages/DashboardPage.tsx`.
- Se as variáveis de ambiente não estiverem configuradas, o app entra em modo *demo* (dados locais). Para usar o banco, preencha as variáveis acima.
