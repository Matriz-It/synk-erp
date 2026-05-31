import { listBillsAction, createBillAction, updateBillAction, payBillAction, deleteBillAction } from "@/app/actions/bills"
import { ContasView } from "@/components/finance/contas-view"
import { CATEGORIAS_PAGAR } from "@/components/finance/types"

export default async function ContasPagarPage() {
  const initialData = await listBillsAction().catch(() => [])

  return (
    <ContasView
      config={{
        title: 'Contas a Pagar',
        parceiroLabel: 'Credor / Fornecedor',
        baixaLabel: 'Baixar pagamento',
        baixaModalTitle: 'Registrar pagamento',
        novoLabel: 'Nova conta',
        categorias: CATEGORIAS_PAGAR,
        initialData,
        actions: {
          create: createBillAction,
          update: updateBillAction,
          pay:    payBillAction,
          remove: deleteBillAction,
        },
      }}
    />
  )
}
