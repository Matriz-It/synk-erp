import { listSuppliersAction } from "@/app/actions/suppliers"
import { listProductsAction } from "@/app/actions/products"
import {
  listPurchaseOrdersAction,
  createPurchaseOrderAction,
  updatePurchaseOrderAction,
  getPurchaseOrderAction,
} from "@/app/actions/purchase-orders"
import { PedidosView } from "@/components/orders/pedidos-view"

const PEDIDO_COMPRA_CONFIG = {
  title: 'Pedidos de Compra',
  entity: 'pedido de compra',
  entityPlural: 'pedidos de compra',
  entityCapital: 'Pedido de Compra',
  novoLabel: 'Novo pedido',
  confirmarLabel: 'Confirmar pedido',
  parceiroLabel: 'Fornecedor',
  allowedStatuses: ['rascunho', 'pendente', 'aprovado', 'recebido', 'cancelado'] as const,
  editableStatuses: ['rascunho', 'pendente'] as const,
}

const PEDIDO_COMPRA_ACTIONS = {
  create:     createPurchaseOrderAction,
  updateFull: updatePurchaseOrderAction,
  getDetail:  getPurchaseOrderAction,
}

export default async function PedidosCompraPage() {
  const [initialPedidos, fornecedores, produtos] = await Promise.all([
    listPurchaseOrdersAction().catch(() => []),
    listSuppliersAction().catch(() => []),
    listProductsAction().catch(() => []),
  ])

  return (
    <PedidosView
      initialPedidos={initialPedidos}
      clientes={fornecedores}
      produtos={produtos}
      config={PEDIDO_COMPRA_CONFIG}
      actions={PEDIDO_COMPRA_ACTIONS}
    />
  )
}
