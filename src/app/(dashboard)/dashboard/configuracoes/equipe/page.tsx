import { getMeAction } from '@/app/actions/auth'
import { listEmployeesAction } from '@/app/actions/employees'
import { EquipeView } from '@/components/equipe/equipe-view'

export default async function EquipePage() {
  const [employees, me] = await Promise.all([
    listEmployeesAction().catch(() => []),
    getMeAction(),
  ])
  return <EquipeView initialEmployees={employees} currentUserId={me?.user.id ?? ''} />
}
