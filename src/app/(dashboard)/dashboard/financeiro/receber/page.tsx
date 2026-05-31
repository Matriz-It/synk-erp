import { listReceivablesAction, createReceivableAction, updateReceivableAction, receiveReceivableAction, deleteReceivableAction } from "@/app/actions/receivables"
import { ContasView } from "@/components/finance/contas-view"
import { CATEGORIAS_RECEBER } from "@/components/finance/types"

export default async function ContasReceberPage() {
  const initialData = await listReceivablesAction().catch(() => [])

  return (
    <ContasView
      config={{
        title: 'Contas a Receber',
        parceiroLabel: 'Cliente',
        baixaLabel: 'Baixar recebimento',
        baixaModalTitle: 'Registrar recebimento',
        novoLabel: 'Novo recebimento',
        categorias: CATEGORIAS_RECEBER,
        initialData,
        actions: {
          create: createReceivableAction,
          update: updateReceivableAction,
          pay:    receiveReceivableAction,
          remove: deleteReceivableAction,
        },
      }}
    />
  )
}
