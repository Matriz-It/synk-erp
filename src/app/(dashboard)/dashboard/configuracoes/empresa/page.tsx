import { getMeAction } from '@/app/actions/auth'
import { getTenantConfigAction } from '@/app/actions/tenant-config'
import { EmpresaView } from '@/components/empresa/empresa-view'

export default async function EmpresaPage() {
  const [config, me] = await Promise.all([
    getTenantConfigAction().catch(() => null),
    getMeAction(),
  ])
  return (
    <EmpresaView
      initialConfig={config}
      tenantName={me?.tenant.name ?? ''}
      tenantDocument={me?.tenant.document ?? null}
      tenantSegmento={me?.tenant.segmento ?? null}
    />
  )
}
