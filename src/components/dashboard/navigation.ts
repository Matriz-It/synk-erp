import {
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  Package,
  Factory,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react"

export interface NavSubItem {
  label: string
  href: string
  badge?: string
}

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  children?: NavSubItem[]
}

export const NAVIGATION: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Financeiro",
    href: "/dashboard/financeiro",
    icon: Wallet,
    children: [
      { label: "Contas a Pagar", href: "/dashboard/financeiro/pagar" },
      { label: "Contas a Receber", href: "/dashboard/financeiro/receber" },
      { label: "Fluxo de Caixa", href: "/dashboard/financeiro/fluxo" },
      { label: "DRE", href: "/dashboard/financeiro/dre" },
    ],
  },
  {
    label: "Vendas",
    href: "/dashboard/vendas",
    icon: ShoppingCart,
    children: [
      { label: "Pedidos", href: "/dashboard/vendas/pedidos" },
      { label: "Orçamentos", href: "/dashboard/vendas/orcamentos" },
      { label: "Clientes", href: "/dashboard/vendas/clientes" },
      { label: "NF-e", href: "/dashboard/vendas/nfe" },
    ],
  },
  {
    label: "Estoque",
    href: "/dashboard/estoque",
    icon: Package,
    children: [
      { label: "Produtos", href: "/dashboard/estoque/produtos" },
      { label: "Movimentações", href: "/dashboard/estoque/movimentacoes" },
      { label: "Inventário", href: "/dashboard/estoque/inventario" },
    ],
  },
  {
    label: "Compras",
    href: "/dashboard/compras",
    icon: Factory,
    children: [
      { label: "Pedidos de Compra", href: "/dashboard/compras/pedidos" },
      { label: "Fornecedores", href: "/dashboard/compras/fornecedores" },
    ],
  },
  { label: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3 },
  { label: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
]
