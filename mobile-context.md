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
| 2       | Formulário de pedido/orçamento | ⏳ Pendente |
| 3       | Telas de listagem (tabelas) | ⏳ Pendente |
| 4       | Telas de detalhe (modais)   | ⏳ Pendente |
| 5       | Autenticação                | ⏳ Pendente |
| 6       | Gráficos e dashboard        | ⏳ Pendente |
| 7       | Ajustes finos               | ⏳ Pendente |

---

## Estágio 1 — Layout base + Modais ✅

### O que foi feito
- **ModalWrapper**: tela cheia em mobile, slide from bottom, padding adaptativo
- **Cabeçalho do modal**: fonte e padding menores em telas pequenas
- **Conteúdo dos modais**: padding reduzido em mobile (`p-4 sm:p-6`)

### Arquivos alterados
- `src/components/products/modal-wrapper.tsx`

---

## Estágio 2 — Formulário de pedido/orçamento ⏳

### O que precisa ser feito
- `novo-pedido.tsx`: botões do header sobrepõem em telas < 640px
- `novo-pedido.tsx`: sidebar sticky some em mobile (já colapsa via `lg:grid-cols-[1fr_320px]` ✅)
- `novo-pedido.tsx`: botões de ação ("Gerar NF-e", "Concluir sem NF-e") precisam ficar em linha ou empilhar
- Tabela de itens: colunas "Desc. R$" e "Total" podem ocultar em mobile

### Arquivos a alterar
- `src/components/orders/novo-pedido.tsx`

---

## Estágio 3 — Telas de listagem ⏳

### Status atual (por tela)
| Tela           | KPI grid | Tabela overflow | Filtros | Status |
|----------------|----------|-----------------|---------|--------|
| Produtos       | ✅ 2→5 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |
| Clientes       | ✅ 2→5 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |
| Pedidos        | ✅ 2→4 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |
| Orçamentos     | ✅ 2→4 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |
| Contas a Pagar | ✅ 2→4 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |
| Fornecedores   | ✅ 2→4 col | ✅ overflow-x  | ✅ flex-col sm:row | ✅ OK |

### O que precisa ser feito
- Nas tabelas com muitas colunas (pedidos: 9 col), ocultar colunas menos importantes em mobile (`hidden sm:table-cell`)
- Considerar card view alternativo para mobile em substituição à tabela

---

## Estágio 4 — Modais de detalhe e formulário ⏳

### O que precisa ser feito
- `modal-form.tsx` (clientes/fornecedores): grids internos `grid-cols-2` ficam apertados em mobile → `grid-cols-1 sm:grid-cols-2`
- `modal-conta-form.tsx`: mesmo problema com grid 2 colunas
- `modal-detalhe.tsx` (clientes): cards "Total em pedidos / Total gasto" já são `grid-cols-2` ✅
- Padding interno dos modais: `p-6` → `p-4 sm:p-6` (feito no ModalWrapper)

---

## Estágio 5 — Autenticação ⏳

### Status atual
- Layout auth: painel de marca some em mobile (`lg:grid-cols-[...]`) ✅
- Login form: inputs full-width ✅, botões h-11 ✅
- Signup flow 2 etapas: grid `grid-cols-2` nos campos de Segmento/Tamanho → OK em sm, apertado em 320px

### O que precisa ser feito
- SignupFlow: garantir legibilidade do indicador de força de senha em muito pequeno
- Verificar telas < 375px (iPhone SE)

---

## Estágio 6 — Dashboard e gráficos ⏳

### O que precisa ser feito
- `cashflow-chart.tsx`: altura `h-[260px]` fixa → considerar `h-[200px] sm:h-[260px]`
- `fluxo-view.tsx` (SVG chart): `width` calculado pelo SVG, funciona mas pode ficar pequeno
- Dashboard header: botões "Exportar" e "Novo pedido" podem sobrepor em mobile
- `DashboardHeader`: row de botões → wrap corretamente

---

## Estágio 7 — Ajustes finos ⏳

### O que precisa ser feito
- Touch targets: verificar todos os botões icon-only (mínimo 44×44px)
- Tipografia: `text-[26px]` nos KPI cards → pode reduzir em mobile
- Espaçamentos internos das sections: `gap-6` → `gap-4 sm:gap-6` em páginas
- Notificações (topbar): painel de 300px pode vazar em telas < 320px
- Sidebar mobile: verificar scroll da lista de nav em telas pequenas

---

## Convenções adotadas

- **Mobile-first**: classes base para mobile, `sm:`/`lg:` para progressivo
- **Modais**: slide from bottom em mobile, centered em `sm:`+
- **Tabelas**: sempre `overflow-x-auto` no wrapper
- **Grids**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N` padrão
- **Padding adaptativo**: `p-4 sm:p-6` para content areas, `px-4 sm:px-6 lg:px-8` para page padding
- **Texto de botões**: ocultar texto em mobile, manter só ícone via `hidden sm:inline` quando necessário
