import { listClientesAction } from "@/app/actions/clients"
import { listOrdersAction } from "@/app/actions/orders"
import { listProductsAction } from "@/app/actions/products"
import { PedidosView } from "@/components/orders/pedidos-view"

const PEDIDO_CONFIG = {
  title: 'Pedidos de Venda',
  entity: 'pedido',
  entityPlural: 'pedidos',
  entityCapital: 'Pedido',
  novoLabel: 'Novo pedido',
  confirmarLabel: 'Confirmar pedido',
  allowedStatuses: ['pendente', 'em_andamento', 'concluido'] as const,
  editableStatuses: ['pendente'] as const,
  showNFe: true,
}

export default async function PedidosPage() {
  const [initialPedidos, clientes, produtos] = await Promise.all([
    listOrdersAction().catch(() => []),
    listClientesAction().catch(() => []),
    listProductsAction().catch(() => []),
  ])

  return (
    <PedidosView
      initialPedidos={initialPedidos}
      clientes={clientes}
      produtos={produtos}
      config={PEDIDO_CONFIG}
    />
  )
}
