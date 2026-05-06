import { listProductsAction } from "@/app/actions/products"
import { ProdutosView } from "@/components/products/produtos-view"

export default async function ProdutosPage() {
  const initialProdutos = await listProductsAction().catch(() => [])
  return <ProdutosView initialProdutos={initialProdutos} />
}
