import { getCashflowAction } from "@/app/actions/cashflow"
import { FluxoView } from "@/components/finance/fluxo-view"

export default async function FluxoCaixaPage() {
  const mes = new Date().toISOString().slice(0, 7)
  const initialData = await getCashflowAction({ mes }).catch(() => ({
    saldoInicial: 0,
    totais: { entradas: 0, saidas: 0, saldo: 0, saldoAtual: 0 },
    lancamentos: [],
  }))

  return <FluxoView initialData={initialData} />
}
