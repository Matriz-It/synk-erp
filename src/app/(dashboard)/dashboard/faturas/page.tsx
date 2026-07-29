import { getMeAction } from '@/app/actions/auth'
import { listFaturasAction } from '@/app/actions/faturas'
import { FaturasView } from '@/components/faturas/faturas-view'

export default async function FaturasPage() {
  const [faturas, me] = await Promise.all([
    listFaturasAction().catch(() => []),
    getMeAction(),
  ])

  return <FaturasView initialFaturas={faturas} tenant={me?.tenant ?? null} email={me?.user.email ?? ''} />
}
