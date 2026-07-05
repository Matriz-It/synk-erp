'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Lock, Shield, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePasswordAction, updateProfileAction } from '@/app/actions/profile'
import { saveTenantConfigAction } from '@/app/actions/tenant-config'
import type { MeData } from '@/app/actions/auth'

const ROLE_LABEL: Record<string, string> = {
  proprietario: 'Proprietário',
  admin: 'Administrador',
  financeiro: 'Financeiro',
  vendedor: 'Vendedor',
  user: 'Usuário',
}

const ROLE_BADGE: Record<string, string> = {
  proprietario: 'bg-[#fef9c3] text-[#ca8a04]',
  admin: 'bg-synk-indigo-light text-synk-indigo',
  financeiro: 'bg-[#d1fae5] text-[#14b87e]',
  vendedor: 'bg-[#dbeafe] text-[#2563eb]',
}

function maskCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

interface Props {
  me: MeData | null
}

export function PerfilView({ me }: Props) {
  const router = useRouter()
  const user = me?.user
  const tenant = me?.tenant

  // ── Dados pessoais ───────────────────────────────────────────
  const [name, setName] = useState(user?.name ?? '')
  const [document, setDocument] = useState(user?.document ? maskCPF(user.document) : '')
  const [savingProfile, setSavingProfile] = useState(false)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Nome deve ter ao menos 2 caracteres')
      return
    }
    setSavingProfile(true)
    const err = await updateProfileAction({
      name: name.trim(),
      document: document ? document.replace(/\D/g, '') : undefined,
    })
    setSavingProfile(false)
    if (err) { toast.error(err.error); return }
    toast.success('Perfil atualizado com sucesso')
    // Atualiza os componentes do servidor (sidebar, topbar) com o novo nome
    router.refresh()
  }

  // ── Alterar senha ────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword) { toast.error('Informe a senha atual'); return }
    if (newPassword.length < 6) { toast.error('Nova senha deve ter ao menos 6 caracteres'); return }
    if (newPassword !== confirmPassword) { toast.error('Senhas não conferem'); return }
    setSavingPassword(true)
    const err = await changePasswordAction({ currentPassword, newPassword })
    setSavingPassword(false)
    if (err) { toast.error(err.error); return }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    toast.success('Senha alterada com sucesso')
  }

  // ── Segmento da empresa ──────────────────────────────────────
  const [segmento, setSegmento] = useState(tenant?.segmento ?? '')
  const [savedSegmento, setSavedSegmento] = useState(tenant?.segmento ?? '')
  const [savingSegmento, setSavingSegmento] = useState(false)

  async function handleSaveSegmento() {
    if (!segmento || segmento === savedSegmento) return
    setSavingSegmento(true)
    const err = await saveTenantConfigAction({ segmento })
    setSavingSegmento(false)
    if (err) {
      toast.error(err.error)
      return
    }
    setSavedSegmento(segmento)
    toast.success('Segmento atualizado com sucesso')
    // Atualiza os componentes do servidor (sidebar depende do segmento)
    router.refresh()
  }

  const role = user?.role ?? ''
  const canEditSegmento = role === 'proprietario' || role === 'admin'

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-synk-navy">Meu Perfil</h1>
        <p className="text-sm text-[#64748B]">Gerencie suas informações pessoais e segurança</p>
      </div>

      {/* Identidade */}
      <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-synk-indigo text-2xl font-bold text-white">
          {initials(user?.name ?? '')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[18px] font-bold text-synk-navy">{user?.name ?? '—'}</p>
          <p className="text-sm text-[#64748B]">{user?.email ?? ''}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-[5px] px-2 py-0.5 text-[11px] font-bold ${ROLE_BADGE[role] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
              {ROLE_LABEL[role] ?? role}
            </span>
            {tenant && (
              <span className="text-[12px] text-[#94A3B8]">
                {tenant.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dados pessoais */}
      <section className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-synk-indigo-light">
            <User className="size-4 text-synk-indigo" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-[15px] font-bold text-synk-navy">Dados pessoais</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-name">Nome completo</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-email">E-mail</Label>
            <Input
              id="profile-email"
              value={user?.email ?? ''}
              disabled
              className="h-10 cursor-not-allowed bg-[#F8F9FC] text-[#94A3B8]"
            />
            <p className="text-[11px] text-[#94A3B8]">O e-mail não pode ser alterado.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-doc">CPF <span className="font-normal text-[#94A3B8]">(opcional)</span></Label>
            <Input
              id="profile-doc"
              value={document}
              onChange={(e) => setDocument(maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
              className="h-10"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={savingProfile}
              className="bg-synk-indigo hover:bg-synk-indigo-hover"
            >
              {savingProfile
                ? <><Loader2 className="size-4 animate-spin" strokeWidth={1.5} />Salvando...</>
                : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </section>

      {/* Alterar senha */}
      <section className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#d1fae5]">
            <Lock className="size-4 text-[#14b87e]" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-[15px] font-bold text-synk-navy">Alterar senha</h2>
        </div>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4 p-5">
          <PasswordField
            id="current-password"
            label="Senha atual"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggleShow={() => setShowCurrent((s) => !s)}
            placeholder="Digite sua senha atual"
          />
          <PasswordField
            id="new-password"
            label="Nova senha"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggleShow={() => setShowNew((s) => !s)}
            placeholder="Mínimo 6 caracteres"
          />
          <PasswordField
            id="confirm-password"
            label="Confirmar nova senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggleShow={() => setShowConfirm((s) => !s)}
            placeholder="Repita a nova senha"
          />

          {/* Força da senha */}
          {newPassword.length > 0 && (
            <PasswordStrength password={newPassword} />
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={savingPassword}
              className="bg-synk-indigo hover:bg-synk-indigo-hover"
            >
              {savingPassword
                ? <><Loader2 className="size-4 animate-spin" strokeWidth={1.5} />Alterando...</>
                : 'Alterar senha'}
            </Button>
          </div>
        </form>
      </section>

      {/* Info da conta */}
      <section className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#F1F5F9]">
            <Shield className="size-4 text-[#64748B]" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-[15px] font-bold text-synk-navy">Informações da conta</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-5">
          <InfoRow label="Empresa" value={tenant?.name ?? '—'} />
          <InfoRow label="Plano" value={PLAN_LABEL[tenant?.plan ?? ''] ?? '—'} />
          <InfoRow label="Função" value={ROLE_LABEL[role] ?? role} />
          <InfoRow label="CNPJ" value={tenant?.document ? formatCNPJ(tenant.document) : '—'} />
          {canEditSegmento ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Segmento</p>
              <div className="mt-1 flex items-center gap-2">
                <select
                  value={segmento}
                  disabled={savingSegmento}
                  onChange={(e) => setSegmento(e.target.value)}
                  className="h-9 min-w-0 flex-1 rounded-md border border-[#E2E8F0] bg-white px-2 text-[14px] font-medium text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="" disabled>Selecione</option>
                  {SEGMENTO_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={handleSaveSegmento}
                  disabled={savingSegmento || !segmento || segmento === savedSegmento}
                  className="h-9 shrink-0 bg-synk-indigo hover:bg-synk-indigo-hover"
                >
                  {savingSegmento
                    ? <><Loader2 className="size-4 animate-spin" strokeWidth={1.5} />Alterando...</>
                    : 'Alterar'}
                </Button>
              </div>
            </div>
          ) : (
            <InfoRow label="Segmento" value={SEGMENTO_LABEL[segmento] ?? '—'} />
          )}
        </div>
      </section>
    </div>
  )
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '?'
}

function formatCNPJ(raw: string) {
  const d = raw.replace(/\D/g, '').padStart(14, '0')
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`
}

const PLAN_LABEL: Record<string, string> = {
  free: 'Plano Free',
  pro: 'Plano Pro',
  enterprise: 'Enterprise',
}

const SEGMENTO_OPTIONS = [
  { value: 'comercio',  label: 'Comércio' },
  { value: 'industria', label: 'Indústria' },
  { value: 'servicos',  label: 'Serviços' },
  { value: 'outros',    label: 'Outros' },
]

const SEGMENTO_LABEL: Record<string, string> = Object.fromEntries(
  SEGMENTO_OPTIONS.map((o) => [o.value, o.label]),
)

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className="mt-0.5 text-[14px] font-medium text-synk-navy">{value}</p>
    </div>
  )
}

function PasswordField({
  id, label, value, onChange, show, onToggleShow, placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggleShow: () => void
  placeholder: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 pr-10"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-synk-navy"
          tabIndex={-1}
        >
          {show
            ? <EyeOff className="size-4" strokeWidth={1.5} />
            : <Eye className="size-4" strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const len = password.length
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const score = [len >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length

  const labels = ['Muito fraca', 'Fraca', 'Razoável', 'Forte', 'Muito forte']
  const colors = ['#ef4444', '#f59e0b', '#f59e0b', '#14b87e', '#14b87e']

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ background: i < score ? colors[score] : '#E2E8F0' }}
          />
        ))}
      </div>
      <p className="text-[11px]" style={{ color: colors[score] ?? '#94A3B8' }}>
        {labels[score] ?? ''}
      </p>
    </div>
  )
}
