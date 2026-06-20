import { getMeAction } from '@/app/actions/auth'
import { PerfilView } from '@/components/perfil/perfil-view'

export default async function PerfilPage() {
  const me = await getMeAction()
  return <PerfilView me={me} />
}
