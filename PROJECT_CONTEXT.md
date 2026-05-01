# Synk ERP — Contexto Frontend (Next.js)

## Stack

| Tecnologia             | Versão   | Uso                                       |
| ---------------------- | -------- | ----------------------------------------- |
| Next.js                | 16.2.4   | Framework React (App Router)              |
| React                  | 19.2.4   | UI                                        |
| TypeScript             | ^5       | Tipagem estática                          |
| Tailwind CSS           | ^4       | Estilização utility-first                 |
| Radix UI               | vários   | Componentes acessíveis (base do shadcn)   |
| class-variance-authority | ^0.7.1 | Variantes de componentes                  |
| lucide-react           | ^1.12.0  | Ícones                                    |
| sonner                 | ^2.0.7   | Toast notifications                       |
| recharts               | ^3.8.1   | Gráficos                                  |
| next-themes            | ^0.4.6   | Dark/light mode                           |
| React Compiler         | 1.0.0    | Otimização automática de re-renders       |

---

## Atenção: Breaking Changes do Next.js 16

- **`middleware.ts` foi renomeado para `proxy.ts`** — a função exportada se chama `proxy`, não `default`.
- **`searchParams`** nas pages é agora uma `Promise<...>` e deve ser aguardada com `await`.
- React Compiler está habilitado (`reactCompiler: true` em `next.config.ts`).

---

## Estrutura de Diretórios

```
src/
├── app/
│   ├── (auth)/                  # Route group — sem prefixo na URL
│   │   ├── layout.tsx           # Layout com painel de marca à esquerda
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (dashboard)/             # Route group — sem prefixo na URL
│   │   ├── layout.tsx           # Layout com sidebar + topbar
│   │   └── dashboard/page.tsx
│   ├── actions/
│   │   └── auth.ts              # Server Actions de autenticação
│   ├── globals.css
│   ├── layout.tsx               # Root layout (fontes, Toaster)
│   └── page.tsx                 # Landing page pública
├── components/
│   ├── auth/                    # Formulários de auth (client components)
│   ├── dashboard/               # Componentes do dashboard
│   ├── ui/                      # Design system (shadcn/ui based)
│   └── ...
├── lib/
│   ├── api.ts                   # Fetch wrapper para a API NestJS (server-only)
│   ├── session.ts               # Gestão de cookies de sessão (server-only)
│   └── utils.ts                 # cn() helper
└── proxy.ts                     # Proteção de rotas (substitui middleware.ts)
```

---

## Autenticação

### Estratégia
- Nenhuma biblioteca de auth de terceiros (sem NextAuth)
- Tokens JWT recebidos da API NestJS armazenados em cookies httpOnly
- `synk_access` — access token (15 min)
- `synk_refresh` — refresh token (7 dias)

### Fluxo
1. Usuário preenche `LoginForm` ou `SignupFlow` (client components)
2. Ao submeter, chama Server Action (`loginAction` / `registerAction`)
3. Server Action faz POST para a API NestJS, recebe tokens
4. Tokens salvos em cookies httpOnly via `session.ts`
5. `proxy.ts` lê `synk_access` cookie para proteger rotas

### Proteção de rotas (`src/proxy.ts`)
- Rotas protegidas: `/dashboard/**`
- Rotas públicas: `/`, `/login`, `/signup`, `/forgot-password`, `/verify-email`
- Sem token → redirect para `/login`
- Com token em rota pública → redirect para `/dashboard`

---

## Componentes de Auth

### `LoginForm` (`src/components/auth/login-form.tsx`)
- Client component com validação inline (blur + submit)
- Chama `loginAction(email, password)` da Server Action
- Exibe erro retornado pela action; redirect é feito pela action

### `SignupFlow` (`src/components/auth/signup-flow.tsx`)
- Multi-step: Etapa 1 (dados pessoais) → Etapa 2 (dados da empresa)
- Chama `registerAction(data)` da Server Action no submit final
- CNPJ é opcional no UI — se fornecido, validado com máscara `XX.XXX.XXX/XXXX-XX`

---

## Variáveis de Ambiente

| Variável      | Exemplo                           | Descrição                     |
| ------------- | --------------------------------- | ----------------------------- |
| `API_URL`     | `http://localhost:3000/api/v1`    | URL base da API NestJS        |

> Variáveis sem prefixo `NEXT_PUBLIC_` são server-only (não expostas ao browser).

---

## Padrões de Código

- Componentes de UI reutilizáveis em `src/components/ui/` (Radix + CVA)
- Server Actions em `src/app/actions/` com `'use server'` no topo
- `src/lib/api.ts` e `src/lib/session.ts` são server-only — nunca importar em client components
- Classes utilitárias compostas com `cn()` de `src/lib/utils.ts`
- Fontes: Inter (corpo), DM Sans (display/títulos), JetBrains Mono (código/valores)
- Cores do design system: `synk-navy`, `synk-indigo`, `synk-indigo-hover`, `synk-indigo-light`, `synk-danger`, `synk-danger-bg`
