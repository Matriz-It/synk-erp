# Synk ERP — Responsividade Mobile

## Breakpoints Tailwind utilizados

| Prefix | Min-width | Uso |
|--------|-----------|-----|
| (base) | 0px       | Mobile first |
| `sm:`  | 640px     | Tablet pequeno |
| `lg:`  | 1024px    | Desktop |

---

## Progresso geral

| Estágio | Área                        | Status      |
|---------|-----------------------------|-------------|
| 1       | Layout base + Modais        | ✅ Concluído |
| 2       | Formulário de pedido/orçamento | ✅ Concluído |
| 3       | Telas de listagem (tabelas) | ✅ Concluído |
| 4       | Telas de detalhe (modais)   | ✅ Concluído |
| 5       | Autenticação                | ✅ Concluído |
| 6       | Gráficos e dashboard        | ✅ Concluído |
| 7       | Ajustes finos               | ✅ Concluído |

---

## Estágio 1 — Layout base + Modais ✅

### O que foi feito
- **ModalWrapper**: slide from bottom em mobile (`items-end sm:items-center`), rounded-t-2xl em mobile
- **Cabeçalho do modal**: `px-4 py-3 sm:px-6 sm:py-4`, fonte `text-[15px] sm:text-[17px]`
- **max-height**: `max-h-[85vh] sm:max-h-[90vh]`

### Arquivos alterados
- `src/components/products/modal-wrapper.tsx`

---

## Estágio 2 — Formulário de pedido/orçamento ✅

### O que foi feito
- **Header botões**: `flex flex-wrap justify-end gap-2` — wrap automático em mobile
- **Tabela de itens**: wrapper `overflow-x-auto`, colunas Unit. e Desc. R$ ocultas em mobile (`hidden sm:table-cell`)
- **Grid pagamento**: `grid-cols-1 sm:grid-cols-2`

### Arquivos alterados
- `src/components/orders/novo-pedido.tsx`

---

## Estágio 3 — Telas de listagem ✅

### Status atual (por tela)
| Tela           | KPI grid | Tabela overflow | Filtros | Status |
|----------------|----------|-----------------|---------|--------|
| Produtos       | ✅ 2→5 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |
| Clientes       | ✅ 2→5 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |
| Pedidos        | ✅ 2→4 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |
| Orçamentos     | ✅ 2→4 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |
| Contas a Pagar | ✅ 2→4 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |
| Fornecedores   | ✅ 2→4 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |

### O que foi feito
- **Tabela pedidos**: colunas Itens, Subtotal, Desconto, Data ocultas em mobile (`hidden sm:table-cell`) — ficam: #, Cliente, Total, Status, Ver
- **Gap views**: `gap-4 sm:gap-6` em todos os wrappers de listagem

### Arquivos alterados
- `src/components/orders/pedidos-view.tsx`
- `src/components/clients/clientes-view.tsx`
- `src/components/products/produtos-view.tsx`
- `src/components/finance/contas-view.tsx`
- `src/components/suppliers/fornecedores-view.tsx`

---

## Estágio 4 — Modais de detalhe e formulário ✅

### O que foi feito
- **Todos os modais**: `p-6` → `p-4 sm:p-6` no content area
- **modal-form.tsx** (clientes/fornecedores): `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`, `grid-cols-3` → `grid-cols-1 sm:grid-cols-3`
- **modal-conta-form.tsx**: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`
- **modal-baixa.tsx**: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`
- **modal-cadastro.tsx** (produtos): dois `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`
- **modal-detalhe.tsx** (orders): padding + pagamento `grid-cols-1 sm:grid-cols-2`

### Arquivos alterados
- `src/components/clients/modal-form.tsx`
- `src/components/clients/modal-detalhe.tsx`
- `src/components/clients/modal-excluir.tsx`
- `src/components/finance/modal-conta-form.tsx`
- `src/components/finance/modal-baixa.tsx`
- `src/components/products/modal-cadastro.tsx`
- `src/components/products/modal-detalhe.tsx`
- `src/components/products/modal-movimentacao.tsx`
- `src/components/orders/modal-detalhe.tsx`

---

## Estágio 5 — Autenticação ✅

### Status atual
- Layout auth: painel de marca some em mobile (`lg:grid-cols-[...]`) ✅
- Login form: inputs full-width ✅, botões h-11 ✅
- SignupFlow etapa 2: `grid-cols-1 sm:grid-cols-2` para Segmento/Tamanho ✅
- Indicador de força de senha: barra `flex h-1` + `text-xs` — OK em mobile ✅

### Nenhuma alteração necessária nesta etapa

---

## Estágio 6 — Dashboard e gráficos ✅

### O que foi feito
- **DashboardHeader**: texto dos botões Calendar e "Novo pedido" ocultos em mobile (`hidden sm:inline`)
- **CashflowChart**: `h-[200px] sm:h-[260px]` (antes era h-[260px] fixo)
- **Dashboard page**: `gap-4 sm:gap-6` no wrapper e grid interno

### Arquivos alterados
- `src/components/dashboard/dashboard-header.tsx`
- `src/components/dashboard/cashflow-chart.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`

---

## Estágio 7 — Ajustes finos ✅

### O que foi feito
- **KPI cards**: `text-[22px] sm:text-[26px]` para o valor principal
- **Notificações**: painel com `max-w-[calc(100vw-1rem)]` para não vazar em < 320px
- **Spacings**: `gap-4 sm:gap-6` aplicado em todas as views de listagem

### Arquivos alterados
- `src/components/dashboard/kpi-cards.tsx`
- `src/components/dashboard/topbar.tsx`

---

## Convenções adotadas

- **Mobile-first**: classes base para mobile, `sm:`/`lg:` para progressivo
- **Modais**: slide from bottom em mobile (`items-end sm:items-center`), `rounded-t-2xl sm:rounded-xl`
- **Tabelas**: sempre `overflow-x-auto` no wrapper + `hidden sm:table-cell` em colunas menos importantes
- **Grids de formulário**: `grid-cols-1 sm:grid-cols-2` ou `grid-cols-1 sm:grid-cols-3` (nunca fixo)
- **Padding adaptativo**: `p-4 sm:p-6` para content areas, `px-4 sm:px-6 lg:px-8` para page padding
- **Texto de botões**: ocultar texto em mobile com `hidden sm:inline` quando o ícone já comunica
- **Gaps de página**: `gap-4 sm:gap-6` para todos os wrappers de listagem/página
- **Tipografia KPI**: `text-[22px] sm:text-[26px]` para valores de destaque
