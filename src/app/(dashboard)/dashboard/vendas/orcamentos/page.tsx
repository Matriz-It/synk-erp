import { listClientesAction } from "@/app/actions/clients"
import { listProductsAction } from "@/app/actions/products"
import {
  listQuotesAction,
  createQuoteAction,
  updateQuoteFullAction,
  getQuoteAction,
  convertQuoteToOrderAction,
} from "@/app/actions/quotes"
import { PedidosView } from "@/components/orders/pedidos-view"

const ORCAMENTO_CONFIG = {
  title: 'Orçamentos',
  entity: 'orçamento',
  entityPlural: 'orçamentos',
  entityCapital: 'Orçamento',
  novoLabel: 'Novo orçamento',
  confirmarLabel: 'Confirmar orçamento',
  allowedStatuses: ['rascunho', 'pendente', 'cancelado', 'aprovado', 'concluido'] as const,
  editableStatuses: ['rascunho', 'pendente', 'cancelado'] as const,
}

const ORCAMENTO_ACTIONS = {
  create: createQuoteAction,
  updateFull: updateQuoteFullAction,
  getDetail: getQuoteAction,
  convertToOrder: convertQuoteToOrderAction,
}

export default async function OrcamentosPage() {
  const [initialPedidos, clientes, produtos] = await Promise.all([
    listQuotesAction().catch(() => []),
    listClientesAction().catch(() => []),
    listProductsAction().catch(() => []),
  ])

  return (
    <PedidosView
      initialPedidos={initialPedidos}
      clientes={clientes}
      produtos={produtos}
      config={ORCAMENTO_CONFIG}
      actions={ORCAMENTO_ACTIONS}
    />
  )
}
