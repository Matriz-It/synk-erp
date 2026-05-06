import { listClientesAction } from "@/app/actions/clients"
import { ClientesView } from "@/components/clients/clientes-view"

export default async function ClientesPage() {
  const initialClientes = await listClientesAction().catch(() => [])
  return <ClientesView initialClientes={initialClientes} />
}
