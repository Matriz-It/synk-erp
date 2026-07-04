import { listServicesAction } from "@/app/actions/services"
import { ServicosView } from "@/components/services/servicos-view"

export default async function ServicosPage() {
  const initialServicos = await listServicesAction().catch(() => [])
  return <ServicosView initialServicos={initialServicos} />
}
