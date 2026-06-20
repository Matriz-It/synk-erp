'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { fmtDate } from '@/lib/utils'
import { Plus, Search, Settings, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createEmployeeAction,
  removeEmployeeAction,
  updateEmployeeAction,
  type Employee,
} from '@/app/actions/employees'
import { ModalEmployeeForm } from './modal-form'
import { ModalConfirmRemove } from './modal-confirm-remove'

const ROLE_LABEL: Record<string, string> = {
  proprietario: 'Proprietário',
  admin: 'Administrador',
  financeiro: 'Financeiro',
  vendedor: 'Vendedor',
}

const ROLE_BADGE: Record<string, string> = {
  proprietario: 'bg-[#fef9c3] text-[#ca8a04]',
  admin: 'bg-synk-indigo-light text-synk-indigo',
  financeiro: 'bg-[#d1fae5] text-[#14b87e]',
  vendedor: 'bg-[#dbeafe] text-[#2563eb]',
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '?'
}

interface Props {
  initialEmployees: Employee[]
  currentUserId: string
}

export function EquipeView({ initialEmployees, currentUserId }: Props) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Employee | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return employees.filter((e) => {
      const matchSearch = !q
        || e.name.toLowerCase().includes(q)
        || e.email.toLowerCase().includes(q)
      const matchRole = roleFilter === 'all' || e.role === roleFilter
      return matchSearch && matchRole
    })
  }, [employees, search, roleFilter])

  const kpis = useMemo(() => ({
    total: employees.length,
    ativos: employees.filter((e) => e.status === 'active').length,
    inativos: employees.filter((e) => e.status === 'inactive').length,
  }), [employees])

  function openEditar(emp: Employee) { setEditTarget(emp); setFormOpen(true) }

  async function handleCreate(data: {
    name: string; email: string; password: string; role: string; document?: string
  }) {
    const err = await createEmployeeAction(data)
    if (err) { toast.error(err.error); return false }
    const fresh = await import('@/app/actions/employees').then((m) => m.listEmployeesAction())
    setEmployees(fresh)
    toast.success('Funcionário cadastrado com sucesso')
    return true
  }

  async function handleUpdate(id: string, data: { name?: string; role?: string; status?: string }) {
    const err = await updateEmployeeAction(id, data)
    if (err) { toast.error(err.error); return false }
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)))
    toast.success('Funcionário atualizado')
    return true
  }

  async function handleRemove() {
    if (!removeTarget) return
    const backup = removeTarget
    setEmployees((prev) => prev.filter((e) => e.id !== backup.id))
    const err = await removeEmployeeAction(backup.id)
    if (err) {
      setEmployees((prev) => [...prev, backup])
      toast.error(err.error)
      return
    }
    setRemoveTarget(null)
    toast.success('Funcionário removido')
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-synk-navy">Equipe</h1>
          <p className="text-sm text-[#64748B]">
            {kpis.ativos} membro{kpis.ativos !== 1 ? 's' : ''} ativo{kpis.ativos !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => { setEditTarget(null); setFormOpen(true) }}
          className="bg-synk-indigo hover:bg-synk-indigo-hover"
        >
          <Plus className="size-4" strokeWidth={2} />Novo funcionário
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <KpiCard label="Total de membros" value={kpis.total} />
        <KpiCard label="Ativos" value={kpis.ativos} color="#14b87e" bg="#d1fae5" />
        <KpiCard label="Inativos" value={kpis.inativos} color="#94A3B8" bg="#F1F5F9" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'proprietario', 'admin', 'financeiro', 'vendedor'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${roleFilter === r ? 'border-synk-indigo bg-synk-indigo-light text-synk-indigo' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-synk-indigo/40'}`}
            >
              {r === 'all' ? 'Todos' : ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Users className="size-10 text-[#CBD5E1]" strokeWidth={1.5} />
            <p className="text-[15px] font-semibold text-synk-navy">Nenhum membro encontrado</p>
            <p className="text-[13px] text-[#94A3B8]">Tente ajustar os filtros ou cadastre um novo funcionário.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                  {['Funcionário', 'Função', 'Status', 'Cadastrado em', 'Ações'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] ${i === 4 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => {
                  const isOwner = emp.role === 'proprietario'
                  const isSelf = emp.id === currentUserId
                  return (
                    <tr
                      key={emp.id}
                      className={`transition-colors hover:bg-[#F8F9FC] ${i < filtered.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-synk-indigo-light text-[11px] font-bold text-synk-indigo">
                            {initials(emp.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-synk-navy">
                              {emp.name}
                              {isSelf && <span className="ml-1.5 text-[11px] font-normal text-[#94A3B8]">(você)</span>}
                            </p>
                            <p className="text-[12px] text-[#64748B]">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-[5px] px-2 py-0.5 text-[11px] font-bold ${ROLE_BADGE[emp.role] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                          {ROLE_LABEL[emp.role] ?? emp.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold ${emp.status === 'active' ? 'bg-[#d1fae5] text-[#14b87e]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                          <span className={`size-[5px] rounded-full ${emp.status === 'active' ? 'bg-[#14b87e]' : 'bg-[#94A3B8]'}`} />
                          {emp.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">{fmtDate(emp.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!isOwner && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditar(emp)}
                                className="flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-synk-indigo transition-colors hover:border-synk-indigo hover:bg-synk-indigo-light"
                              >
                                <Settings className="size-3 text-synk-indigo" strokeWidth={1.5} />Editar
                              </button>
                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() => setRemoveTarget(emp)}
                                  className="flex size-8 items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-synk-danger transition-colors hover:border-synk-danger hover:bg-[#fee2e2]"
                                  aria-label="Remover"
                                >
                                  <Trash2 className="size-3.5" strokeWidth={1.5} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8F9FC] px-4 py-3 text-[12px] text-[#94A3B8]">
            <span>Mostrando {filtered.length} de {employees.length} {employees.length === 1 ? 'membro' : 'membros'}</span>
          </div>
        )}
      </div>

      <ModalEmployeeForm
        open={formOpen}
        employee={editTarget}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <ModalConfirmRemove
        open={!!removeTarget}
        employee={removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
      />
    </div>
  )
}

function KpiCard({ label, value, color, bg }: { label: string; value: number; color?: string; bg?: string }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ background: bg ?? '#fff' }}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold" style={{ color: color ?? '#0f172a' }}>{value}</p>
    </div>
  )
}
