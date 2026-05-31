import { listSuppliersAction } from "@/app/actions/suppliers"
import { FornecedoresView } from "@/components/suppliers/fornecedores-view"

export default async function FornecedoresPage() {
  const initialFornecedores = await listSuppliersAction().catch(() => [])
  return <FornecedoresView initialFornecedores={initialFornecedores} />
}
