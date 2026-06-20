import { listAllMovementsAction } from '@/app/actions/products'
import { listProductsAction } from '@/app/actions/products'
import { MovimentacoesView } from '@/components/products/movimentacoes-view'

export default async function MovimentacoesPage() {
  const [movimentacoes, produtos] = await Promise.all([
    listAllMovementsAction().catch(() => []),
    listProductsAction().catch(() => []),
  ])
  return <MovimentacoesView initialMovimentacoes={movimentacoes} produtos={produtos} />
}
