# Synk ERP — Contexto Frontend (Next.js)

## Stack

| Tecnologia               | Versão   | Uso                                     |
| ------------------------ | -------- | --------------------------------------- |
| Next.js                  | 16.2.4   | Framework React (App Router)            |
| React                    | 19.2.4   | UI                                      |
| TypeScript               | ^5       | Tipagem estática                        |
| Tailwind CSS             | ^4       | Estilização utility-first               |
| Radix UI                 | vários   | Componentes acessíveis (base do shadcn) |
| lucide-react             | ^1.12.0  | Ícones                                  |
| sonner                   | ^2.0.7   | Toasts                                  |
| recharts                 | ^3.8.1   | Gráficos                                |
| React Compiler           | 1.0.0    | Otimização de re-renders                |

---

## Breaking Changes do Next.js 16

- **`middleware.ts` → `proxy.ts`** — função exportada: `proxy` (não default)
- **`searchParams`** em pages é `Promise<...>` — usar `await searchParams`
- **React Compiler** ativo (`reactCompiler: true` em `next.config.ts`)

---

## Estrutura de Diretórios

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx           # Painel de marca + coluna de formulário
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Server Component async — busca /auth/me
│   │   └── dashboard/
│   │       ├── page.tsx         # Dashboard principal
│   │       ├── financeiro/      # + pagar/, receber/, fluxo/, dre/
│   │       ├── vendas/          # + pedidos/, orcamentos/, clientes/, nfe/
│   │       ├── estoque/         # + produtos/ (real), movimentacoes/, inventario/
│   │       ├── compras/         # + pedidos/, fornecedores/
│   │       ├── relatorios/
│   │       └── configuracoes/
│   ├── actions/
│   │   ├── auth.ts              # loginAction, registerAction, logoutAction, getMeAction
│   │   ├── products.ts          # listProductsAction, createProductAction, …
│   │   └── clients.ts           # listClientesAction, createClienteAction, …
│   ├── globals.css
│   ├── layout.tsx               # Root layout (fontes, Toaster)
│   └── page.tsx                 # Landing page pública
├── components/
│   ├── auth/                    # LoginForm, SignupFlow, etc.
│   ├── clients/                 # ClientesView + 3 modais + types.ts
│   ├── dashboard/
│   │   ├── coming-soon.tsx      # Página genérica para módulos não implementados
│   │   ├── dashboard-header.tsx # Server Component — busca nome real do usuário
│   │   ├── dashboard-shell.tsx  # Layout principal (recebe MeData como prop)
│   │   ├── mobile-sidebar.tsx
│   │   ├── navigation.ts        # Estrutura de rotas do sidebar
│   │   ├── sidebar.tsx          # CompanySwitcher + footer com dados reais
│   │   └── topbar.tsx           # Breadcrumbs + notificações + menu usuário
│   ├── products/                # ProdutosView + 4 modais + types.ts
│   └── ui/                      # Design system (Button, Input, Label, etc.)
├── lib/
│   ├── api.ts                   # apiGet / apiPost / apiPatch / apiDelete + auth header
│   ├── session.ts               # createSession / deleteSession (cookies httpOnly)
│   └── utils.ts                 # cn()
└── proxy.ts                     # Proteção de rotas (Next.js 16)
```

---

## Padrão de página autenticada

Todas as páginas do dashboard seguem este padrão:

```
(dashboard)/layout.tsx   (Server, async)
  → getMeAction()        → GET /auth/me
  → <DashboardShell me={me}>
      → Sidebar (CompanySwitcher + footer com dados reais)
      → Topbar (nome, plano, email reais)
      → <page>           (Server Component, fetches seus dados iniciais)
          → <XyzView initialData={data} />  (Client Component, gerencia estado)
```

---

## Padrão Server Action + Update Otimista

```typescript
// Página (Server Component)
export default async function XyzPage() {
  const data = await listXyzAction().catch(() => [])
  return <XyzView initialData={data} />
}

// View (Client Component)
export function XyzView({ initialData }: { initialData: Xyz[] }) {
  const [items, setItems] = useState(initialData)

  async function handleCreate(dto) {
    const tempId = `temp-${Date.now()}`
    setItems(prev => [...prev, { ...dto, id: tempId }])   // otimista
    try {
      const real = await createXyzAction(dto)
      setItems(prev => prev.map(i => i.id === tempId ? real : i))
    } catch {
      setItems(prev => prev.filter(i => i.id !== tempId)) // rollback
      throw err
    }
  }
}
```

---

## Autenticação

- `proxy.ts` — protege `/dashboard/**`, redireciona `/login|/signup` se já logado
- `logoutAction()` — apaga cookies, **sem** `redirect()` (causaria erro em onClick)
- No cliente: `await logoutAction(); window.location.replace('/login')`

---

## Telas implementadas

| Tela                        | Rota                                  | Status |
| --------------------------- | ------------------------------------- | ------ |
| Landing page                | `/`                                   | ✅     |
| Login                       | `/login`                              | ✅     |
| Cadastro (2 etapas)         | `/signup`                             | ✅     |
| Dashboard                   | `/dashboard`                          | ✅     |
| Produtos                    | `/dashboard/estoque/produtos`         | ✅ API |
| Clientes                    | `/dashboard/vendas/clientes`          | ✅ API |
| Demais módulos              | Todas as outras rotas do nav          | 🚧 Em breve |

---

## MeData — dados do usuário logado

```typescript
interface MeData {
  user:   { name: string; email: string; role: string }
  tenant: { name: string; document: string | null; plan: string }
}
```

Carregado uma vez no `DashboardLayout` e passado por props para `Sidebar` e `Topbar`. Componentes que precisam isoladamente (ex: `DashboardHeader`) chamam `getMeAction()` diretamente por serem Server Components.

---

## Padrões de Código

- **Server Actions** em `src/app/actions/` — `'use server'`, `apiGet/Post/Patch/Delete` com Bearer token automático
- **`api.ts` e `session.ts`** são server-only — nunca importar em `'use client'`
- **Toasts** via `sonner` para feedback de mutações
- **Modais** com `ModalWrapper` de `@/components/products/modal-wrapper`
- **Cores**: `synk-navy`, `synk-indigo`, `synk-indigo-hover`, `synk-indigo-light`, `synk-danger`
- **Fontes**: Inter (sans), DM Sans (display/títulos), JetBrains Mono (mono/valores)
- **`id` de entidades**: sempre `string` (UUID do backend) — nunca `number`
