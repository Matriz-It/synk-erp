import { getMeAction } from '@/app/actions/auth'
import { PlanoView } from '@/components/plano/plano-view'

export default async function PlanoPage() {
  const me = await getMeAction()
  return <PlanoView planoAtual={me?.tenant.plan ?? 'pro'} />
}
