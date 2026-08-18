# CesucaCode — Frontend

Frontend da IA acadêmica dos cursos de Tecnologia do Centro Universitário
Cesuca, consumindo a API do
[CesucaCode-backend](../CesucaCode-backend).

## Stack

- **React 19** + **Vite** + **TypeScript**
- **React Router v7** — roteamento e guards de autenticação/papel
- **TanStack Query v5** — cache e chamadas à API
- **React Hook Form + Zod** — formulários e validação
- **Tailwind CSS 4** — estilo
- **Biome** — lint e format (substitui ESLint + Prettier)
- **Radix UI** — só nos componentes onde acessibilidade é genuinamente
  difícil de fazer à mão (Dialog, DropdownMenu, Tabs); o resto é Tailwind
  puro, sem biblioteca de componentes completa

Sem suíte de testes automatizada por enquanto — verificação é manual,
rodando contra o backend real (mesmo padrão usado no backend).

## Pré-requisitos

- **Node.js 20+** (testado com Node 24)
- O [backend do CesucaCode](../CesucaCode-backend) rodando localmente (veja
  o README dele) — este frontend não funciona sozinho, ele só consome a API

## Como rodar o projeto (primeira vez)

### 1. Instalar as dependências

```bash
npm install
```

### 2. Configurar as variáveis de ambiente

```bash
cp .env.example .env
```

Por padrão já aponta pro backend local (`http://localhost:8000`). Só
precisa editar o `.env` se o backend estiver rodando em outro endereço.

### 3. Ter o backend rodando

Em outro terminal, na pasta do backend:

```bash
python manage.py runserver
```

(veja o README do backend se ainda não configurou o banco/dependências
dele — inclusive o CORS já vem liberado por padrão pra
`localhost:5173`/`127.0.0.1:5173`, que é a porta padrão do Vite).

### 4. Subir o frontend

```bash
npm run dev
```

Acesse **http://localhost:5173**. Use um usuário CSAdmin/CSCoordinator/
CSStudent já existente no backend pra logar (login único: e-mail ou RGM).

## Rodando no dia a dia

Só o passo 4 (`npm run dev`) — os passos 1-3 são de configuração inicial.

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento (porta 5173) |
| `npm run build` | Checa os tipos e gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente, pra testar antes de publicar |
| `npm run lint` | Roda o Biome (lint + format check + imports) |
| `npm run format` | Aplica correções do Biome (format, lint safe, organize imports) |

## Arquitetura do projeto

Organização por feature, não por tipo de arquivo — cada pasta em
`features/` é dona das suas próprias telas, hooks e validações.

```
src/
  app/                  Composição raiz: rotas, providers, App
    router.tsx            Árvore de rotas + guards aninhados (auth, papel,
                           troca de senha obrigatória)
    providers.tsx          QueryClientProvider + AuthProvider
  api/
    client.ts              fetch com header de auth e refresh automático
                            de token no 401 (sem duplicar refresh em
                            chamadas paralelas)
    endpoints/              Uma função por chamada de API (auth, documents,
                            accounts), sem lógica de UI
    types/                  Tipos TypeScript espelhando os serializers do
                            backend
  features/
    auth/                   Login, troca de senha obrigatória, contexto de
                            autenticação
    documents/              Materiais didáticos: listar, enviar, detalhe,
                            chunks extraídos
    accounts/               Contas (CSAdmin): listar, criar aluno/
                            coordenador, importar CSV, resetar senha
  shared/
    ui/                     Componentes de interface reaproveitáveis
                            (Button, Input, Select, Dialog, Tabs, ...)
    layout/                 Sidebar, menu do usuário, shell da aplicação
    auth/                   Guards de rota (autenticado, papel, senha em
                            dia) — feitos pra UX, quem garante permissão de
                            verdade é sempre o backend
    hooks/                  Hooks compartilhados entre features (cursos,
                            debounce, ...)
    lib/                    Utilidades (variáveis de ambiente, formatação
                            de data, merge de classes CSS)
```

## Papéis e permissões

Os mesmos três papéis do backend, refletidos na interface:

| Papel | Vê "Materiais" | Vê "Contas" | Gerencia materiais |
|---|---|---|---|
| **CSAdmin** | Sim, todos | Sim | Sim, qualquer curso |
| **CSCoordinator** | Sim, todos | Não | Só dos cursos que coordena |
| **CSStudent** | Sim, só do próprio curso | Não | Não |

As checagens de papel no frontend (esconder botão, bloquear rota) são só
conveniência de navegação — a autorização de verdade é sempre imposta pelo
backend, então mesmo que alguém force uma URL manualmente, a API já
recusa a ação.

## Login e troca de senha obrigatória

O login é único pra todo mundo: `identifier` aceita e-mail (CSAdmin/
CSCoordinator) ou RGM (CSStudent), detectado automaticamente. Contas
recém-criadas pelo CSAdmin vêm com `must_change_password: true` — nesse
estado, o app bloqueia qualquer outra tela e força a passagem pela troca
de senha antes de liberar o resto (ver `shared/auth/RequirePasswordCurrent.tsx`).

## Solução de problemas comuns

**Tela em branco / erro sobre `VITE_API_BASE_URL`** — o `.env` não foi
criado. Rode `cp .env.example .env`.

**Erro de CORS no console do navegador** — confirme que o backend está
rodando e que `CORS_ALLOWED_ORIGINS` no `.env` dele inclui
`http://localhost:5173`.

**Login funciona mas todas as outras telas dão erro/ficam em branco** —
provavelmente o backend não está rodando ou está em outra porta; confira
`VITE_API_BASE_URL` no `.env`.

**Sessão caindo sozinha depois de um tempo** — o token de acesso dura 2h e
o de refresh 7 dias (configurado no backend); depois disso é esperado
precisar logar de novo.
