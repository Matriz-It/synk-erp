'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import type { Employee } from '@/app/actions/employees'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador — acesso total' },
  { value: 'financeiro', label: 'Financeiro — contas a pagar/receber, fluxo de caixa' },
  { value: 'vendedor', label: 'Vendedor — vendas, estoque e compras' },
]

interface Props {
  open: boolean
  employee: Employee | null
  onClose: () => void
  onCreate: (data: { name: string; email: string; password: string; role: string; document?: string }) => Promise<boolean>
  onUpdate: (id: string, data: { name?: string; role?: string; status?: string }) => Promise<boolean>
}

export function ModalEmployeeForm({ open, employee, onClose, onCreate, onUpdate }: Props) {
  const isEdit = !!employee

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('vendedor')
  const [status, setStatus] = useState('active')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    if (employee) {
      setName(employee.name)
      setEmail(employee.email)
      setRole(employee.role)
      setStatus(employee.status)
      setPassword('')
    } else {
      setName('')
      setEmail('')
      setPassword('')
      setRole('vendedor')
      setStatus('active')
    }
    setErrors({})
  }, [open, employee])

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) e.name = 'Nome deve ter ao menos 2 caracteres'
    if (!isEdit) {
      if (!email.trim() || !email.includes('@')) e.email = 'E-mail inválido'
      if (!password || password.length < 6) e.password = 'Senha deve ter ao menos 6 caracteres'
    }
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    let ok: boolean
    if (isEdit) {
      ok = await onUpdate(employee.id, { name: name.trim(), role, status })
    } else {
      ok = await onCreate({ name: name.trim(), email: email.trim(), password, role })
    }
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar funcionário' : 'Novo funcionário'}
      width="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
        {/* Nome */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emp-name">Nome completo *</Label>
          <Input
            id="emp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: João da Silva"
            className="h-10"
          />
          {errors.name && <p className="text-[12px] text-synk-danger">{errors.name}</p>}
        </div>

        {/* E-mail (apenas criação) */}
        {!isEdit && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emp-email">E-mail *</Label>
            <Input
              id="emp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="funcionario@empresa.com"
              className="h-10"
            />
            {errors.email && <p className="text-[12px] text-synk-danger">{errors.email}</p>}
          </div>
        )}

        {/* Senha (apenas criação) */}
        {!isEdit && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emp-password">Senha temporária *</Label>
            <Input
              id="emp-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="h-10"
            />
            {errors.password && <p className="text-[12px] text-synk-danger">{errors.password}</p>}
          </div>
        )}

        {/* Função */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emp-role">Função *</Label>
          <select
            id="emp-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy shadow-sm focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Status (apenas edição) */}
        {isEdit && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emp-status">Status</Label>
            <select
              id="emp-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy shadow-sm focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-synk-indigo hover:bg-synk-indigo-hover"
          >
            {saving
              ? <><Loader2 className="size-4 animate-spin" strokeWidth={1.5} />{isEdit ? 'Salvando...' : 'Cadastrando...'}</>
              : isEdit ? 'Salvar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
