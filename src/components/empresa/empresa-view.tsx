'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Building2, FileKey, Loader2, ShieldCheck, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveTenantConfigAction, type TenantConfigData } from '@/app/actions/tenant-config'

const UFs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const CRT_OPTIONS = [
  { value: '1', label: '1 — Simples Nacional' },
  { value: '2', label: '2 — Simples Nacional – Excesso de sublimite' },
  { value: '3', label: '3 — Regime Normal (Lucro Presumido / Real)' },
]

const AMBIENTE_OPTIONS = [
  { value: 'homologacao', label: 'Homologação (testes)' },
  { value: 'producao',    label: 'Produção (real)' },
]

const SEGMENTO_OPTIONS = [
  { value: 'comercio',  label: 'Comércio' },
  { value: 'industria', label: 'Indústria' },
  { value: 'servicos',  label: 'Serviços' },
  { value: 'outros',    label: 'Outros' },
]

function maskCNPJ(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

function maskCEP(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.replace(/(\d{5})(\d{1,3})$/, '$1-$2')
}

interface Props {
  initialConfig: TenantConfigData | null
  tenantName: string
  tenantDocument: string | null
  tenantSegmento: string | null
}

export function EmpresaView({ initialConfig: ic, tenantName, tenantDocument, tenantSegmento }: Props) {
  // ── Dados da empresa ─────────────────────────────────────────────
  const [segmento,       setSegmento]       = useState(tenantSegmento      ?? '')
  const [nomeFantasia,   setNomeFantasia]   = useState(ic?.nomeFantasia   ?? '')
  const [ie,             setIe]             = useState(ic?.ie             ?? '')
  const [im,             setIm]             = useState(ic?.im             ?? '')
  const [cnae,           setCnae]           = useState(ic?.cnae           ?? '')
  const [telefone,       setTelefone]       = useState(ic?.telefone       ?? '')
  const [emailComercial, setEmailComercial] = useState(ic?.emailComercial ?? '')
  const [cep,            setCep]            = useState(ic?.cep            ?? '')
  const [logradouro,     setLogradouro]     = useState(ic?.logradouro     ?? '')
  const [numero,         setNumero]         = useState(ic?.numero         ?? '')
  const [complemento,    setComplemento]    = useState(ic?.complemento    ?? '')
  const [bairro,         setBairro]         = useState(ic?.bairro         ?? '')
  const [cidade,         setCidade]         = useState(ic?.cidade         ?? '')
  const [uf,             setUf]             = useState(ic?.uf             ?? '')
  const [savingEmpresa,  setSavingEmpresa]  = useState(false)

  // ── Dados fiscais / NFe ──────────────────────────────────────────
  const [crt,        setCrt]        = useState(ic?.crt        ?? '1')
  const [serieNfe,   setSerieNfe]   = useState(ic?.serieNfe   ?? '1')
  const [ambienteNfe,setAmbienteNfe]= useState(ic?.ambienteNfe?? 'homologacao')
  const [cfopPadrao, setCfopPadrao] = useState(ic?.cfopPadrao ?? '5102')
  const [cstPadrao,  setCstPadrao]  = useState(ic?.cstPadrao  ?? '')
  const [aliqIcms,   setAliqIcms]   = useState(ic?.aliqIcms   != null ? String(ic.aliqIcms)   : '')
  const [aliqIbs,    setAliqIbs]    = useState(ic?.aliqIbs    != null ? String(ic.aliqIbs)    : '')
  const [aliqCbs,    setAliqCbs]    = useState(ic?.aliqCbs    != null ? String(ic.aliqCbs)    : '')
  const [emailNfe,   setEmailNfe]   = useState(ic?.emailNfe   ?? '')
  const [savingFiscal, setSavingFiscal] = useState(false)

  // ── Certificado Digital ──────────────────────────────────────────
  const [temCert,     setTemCert]     = useState(ic?.temCertificado ?? false)
  const [certNome,    setCertNome]    = useState(ic?.certificadoNome     ?? '')
  const [certValidade,setCertValidade]= useState(ic?.certificadoValidade ?? '')
  const [certSenha,   setCertSenha]   = useState('')
  const [certBase64,  setCertBase64]  = useState('')
  const [savingCert,  setSavingCert]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.match(/\.(pfx|p12)$/i)) {
      toast.error('Selecione um arquivo .pfx ou .p12')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1]
      setCertBase64(base64)
      setCertNome(file.name)
    }
    reader.readAsDataURL(file)
  }

  async function saveEmpresa(e: React.FormEvent) {
    e.preventDefault()
    setSavingEmpresa(true)
    const err = await saveTenantConfigAction({
      segmento: segmento || undefined,
      nomeFantasia: nomeFantasia || undefined,
      ie: ie || undefined, im: im || undefined, cnae: cnae || undefined,
      telefone: telefone || undefined, emailComercial: emailComercial || undefined,
      cep: cep.replace(/\D/g, '') || undefined,
      logradouro: logradouro || undefined, numero: numero || undefined,
      complemento: complemento || undefined, bairro: bairro || undefined,
      cidade: cidade || undefined, uf: uf || undefined,
    })
    setSavingEmpresa(false)
    if (err) { toast.error(err.error); return }
    toast.success('Dados da empresa salvos!')
  }

  async function saveFiscal(e: React.FormEvent) {
    e.preventDefault()
    setSavingFiscal(true)
    const err = await saveTenantConfigAction({
      crt: crt || undefined,
      serieNfe: serieNfe || undefined,
      ambienteNfe: ambienteNfe || undefined,
      cfopPadrao: cfopPadrao || undefined,
      cstPadrao: cstPadrao || undefined,
      aliqIcms: aliqIcms ? parseFloat(aliqIcms) : undefined,
      aliqIbs:  aliqIbs  ? parseFloat(aliqIbs)  : undefined,
      aliqCbs:  aliqCbs  ? parseFloat(aliqCbs)  : undefined,
      emailNfe: emailNfe || undefined,
    })
    setSavingFiscal(false)
    if (err) { toast.error(err.error); return }
    toast.success('Configurações fiscais salvas!')
  }

  async function saveCertificado(e: React.FormEvent) {
    e.preventDefault()
    if (!certBase64 && !temCert) { toast.error('Selecione o arquivo do certificado'); return }
    if (!certSenha) { toast.error('Informe a senha do certificado'); return }
    setSavingCert(true)
    const payload: Record<string, string | undefined> = { certificadoSenha: certSenha }
    if (certBase64) {
      payload.certificadoBase64 = certBase64
      payload.certificadoNome   = certNome
    }
    const err = await saveTenantConfigAction(payload)
    setSavingCert(false)
    if (err) { toast.error(err.error); return }
    setTemCert(true)
    setCertBase64('')
    setCertSenha('')
    toast.success('Certificado digital salvo com segurança!')
  }

  function formatCNPJ(raw: string | null) {
    if (!raw) return '—'
    const d = raw.replace(/\D/g, '').padStart(14, '0')
    return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12,14)}`
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-synk-navy">Empresa</h1>
        <p className="text-sm text-[#64748B]">Configurações gerais, dados fiscais e certificado digital</p>
      </div>

      {/* Card identidade (read-only do Tenant) */}
      <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex size-12 items-center justify-center rounded-xl bg-synk-indigo-light">
          <Building2 className="size-6 text-synk-indigo" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-display text-[17px] font-bold text-synk-navy">{tenantName}</p>
          <p className="text-[13px] text-[#64748B]">CNPJ {formatCNPJ(tenantDocument)}</p>
        </div>
      </div>

      {/* ── Seção 1: Dados da Empresa ─────────────────────────────── */}
      <Section icon={<Building2 className="size-4 text-synk-indigo" strokeWidth={1.5} />} iconBg="bg-synk-indigo-light" title="Dados da Empresa">
        <form onSubmit={saveEmpresa} className="flex flex-col gap-4 p-5">
          <Row2>
            <F label="Nome Fantasia">
              <Input value={nomeFantasia} onChange={e => setNomeFantasia(e.target.value)} placeholder="Nome comercial" />
            </F>
            <F label="Segmento">
              <select value={segmento} onChange={e => setSegmento(e.target.value)}
                className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20">
                <option value="">Selecione</option>
                {SEGMENTO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </F>
          </Row2>
          <Row2>
            <F label="CNAE">
              <Input value={cnae} onChange={e => setCnae(e.target.value)} placeholder="0000-0/00" maxLength={10} />
            </F>
          </Row2>
          <Row2>
            <F label="Inscrição Estadual (IE)">
              <Input value={ie} onChange={e => setIe(e.target.value)} placeholder="000.000.000.000" maxLength={20} />
            </F>
            <F label="Inscrição Municipal (IM)">
              <Input value={im} onChange={e => setIm(e.target.value)} placeholder="000000/001-0" maxLength={20} />
            </F>
          </Row2>
          <Row2>
            <F label="Telefone">
              <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" maxLength={20} />
            </F>
            <F label="E-mail Comercial">
              <Input type="email" value={emailComercial} onChange={e => setEmailComercial(e.target.value)} placeholder="contato@empresa.com" />
            </F>
          </Row2>

          <div className="border-t border-[#F1F5F9] pt-4">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[#94A3B8]">Endereço</p>
            <div className="flex flex-col gap-4">
              <Row2>
                <F label="CEP">
                  <Input value={cep} onChange={e => setCep(maskCEP(e.target.value))} placeholder="00000-000" maxLength={9} />
                </F>
                <F label="UF">
                  <select value={uf} onChange={e => setUf(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20">
                    <option value="">Selecione</option>
                    {UFs.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </F>
              </Row2>
              <Row2>
                <F label="Logradouro" cls="sm:col-span-2">
                  <Input value={logradouro} onChange={e => setLogradouro(e.target.value)} placeholder="Rua, Av, etc." />
                </F>
              </Row2>
              <Row2>
                <F label="Número">
                  <Input value={numero} onChange={e => setNumero(e.target.value)} placeholder="123" maxLength={20} />
                </F>
                <F label="Complemento">
                  <Input value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Sala, Apto..." maxLength={100} />
                </F>
              </Row2>
              <Row2>
                <F label="Bairro">
                  <Input value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" />
                </F>
                <F label="Cidade">
                  <Input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" />
                </F>
              </Row2>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={savingEmpresa} className="bg-synk-indigo hover:bg-synk-indigo-hover">
              {savingEmpresa ? <><Loader2 className="size-4 animate-spin" />Salvando...</> : 'Salvar dados da empresa'}
            </Button>
          </div>
        </form>
      </Section>

      {/* ── Seção 2: Configurações Fiscais ────────────────────────── */}
      <Section icon={<ShieldCheck className="size-4 text-[#14b87e]" strokeWidth={1.5} />} iconBg="bg-[#d1fae5]" title="Configurações Fiscais / NFe">
        <form onSubmit={saveFiscal} className="flex flex-col gap-4 p-5">
          <Row2>
            <F label="Regime Tributário (CRT)">
              <select value={crt} onChange={e => setCrt(e.target.value)}
                className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20">
                {CRT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </F>
            <F label="Ambiente NFe">
              <select value={ambienteNfe} onChange={e => setAmbienteNfe(e.target.value)}
                className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20">
                {AMBIENTE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </F>
          </Row2>
          <Row2>
            <F label="Série da NFe">
              <Input value={serieNfe} onChange={e => setSerieNfe(e.target.value)} placeholder="1" maxLength={3} />
            </F>
            <F label="CFOP Padrão">
              <Input value={cfopPadrao} onChange={e => setCfopPadrao(e.target.value)} placeholder="5102" maxLength={5} />
            </F>
          </Row2>
          <Row2>
            <F label="CST / CSOSN Padrão">
              <Input value={cstPadrao} onChange={e => setCstPadrao(e.target.value)} placeholder="400" maxLength={3} />
            </F>
            <F label="E-mail para envio das NFes">
              <Input type="email" value={emailNfe} onChange={e => setEmailNfe(e.target.value)} placeholder="nfe@empresa.com" />
            </F>
          </Row2>

          <div className="border-t border-[#F1F5F9] pt-4">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[#94A3B8]">Alíquotas Padrão (%)</p>
            <div className="grid grid-cols-3 gap-4">
              <F label="ICMS">
                <Input type="number" step="0.01" min="0" max="100" value={aliqIcms} onChange={e => setAliqIcms(e.target.value)} placeholder="12,00" />
              </F>
              <F label="IBS (CBS 2026+)">
                <Input type="number" step="0.01" min="0" max="100" value={aliqIbs} onChange={e => setAliqIbs(e.target.value)} placeholder="0,00" />
              </F>
              <F label="CBS (PIS/COFINS 2026+)">
                <Input type="number" step="0.01" min="0" max="100" value={aliqCbs} onChange={e => setAliqCbs(e.target.value)} placeholder="0,00" />
              </F>
            </div>
            <p className="mt-2 text-[11px] text-[#94A3B8]">
              IBS e CBS são os novos tributos da Reforma Tributária (2026+). Deixe 0 se ainda não aplicável.
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={savingFiscal} className="bg-synk-indigo hover:bg-synk-indigo-hover">
              {savingFiscal ? <><Loader2 className="size-4 animate-spin" />Salvando...</> : 'Salvar configurações fiscais'}
            </Button>
          </div>
        </form>
      </Section>

      {/* ── Seção 3: Certificado Digital ─────────────────────────── */}
      <Section icon={<FileKey className="size-4 text-[#f59e0b]" strokeWidth={1.5} />} iconBg="bg-[#fef3c7]" title="Certificado Digital A1">
        <form onSubmit={saveCertificado} className="flex flex-col gap-4 p-5">
          {/* Status atual */}
          {temCert && !certBase64 && (
            <div className="flex items-center gap-3 rounded-lg border border-[#d1fae5] bg-[#f0fdf4] p-3">
              <ShieldCheck className="size-5 text-[#14b87e]" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#14b87e]">Certificado instalado</p>
                {certNome && <p className="text-[11px] text-[#64748B]">{certNome}</p>}
                {certValidade && <p className="text-[11px] text-[#64748B]">Válido até: {certValidade}</p>}
              </div>
              <button type="button" onClick={() => { setCertBase64(''); setTemCert(false); setCertNome(''); setCertValidade('') }}
                className="text-[11px] font-medium text-[#ef4444] hover:underline">
                substituir
              </button>
            </div>
          )}

          {/* Upload */}
          {(!temCert || certBase64) && (
            <div
              onClick={() => fileRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
                certBase64
                  ? 'border-[#14b87e] bg-[#f0fdf4]'
                  : 'border-[#E2E8F0] bg-[#F8F9FC] hover:border-synk-indigo/40'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pfx,.p12"
                className="hidden"
                onChange={handleFileSelect}
              />
              {certBase64 ? (
                <>
                  <ShieldCheck className="size-8 text-[#14b87e]" strokeWidth={1.5} />
                  <p className="text-[13px] font-semibold text-[#14b87e]">{certNome}</p>
                  <p className="text-[11px] text-[#64748B]">Arquivo carregado · clique para trocar</p>
                </>
              ) : (
                <>
                  <Upload className="size-8 text-[#94A3B8]" strokeWidth={1.5} />
                  <p className="text-[13px] font-semibold text-synk-navy">Clique para selecionar o certificado</p>
                  <p className="text-[11px] text-[#94A3B8]">Arquivo .pfx ou .p12 (certificado A1)</p>
                </>
              )}
            </div>
          )}

          {/* Validade manual e Senha */}
          <Row2>
            <F label="Data de validade do certificado">
              <input
                type="date"
                value={certValidade}
                onChange={e => setCertValidade(e.target.value)}
                className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:border-synk-indigo focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
              />
            </F>
            <F label="Senha do certificado *">
              <Input
                type="password"
                value={certSenha}
                onChange={e => setCertSenha(e.target.value)}
                placeholder="Senha do arquivo .pfx"
                autoComplete="new-password"
              />
            </F>
          </Row2>

          <div className="rounded-lg border border-[#fef3c7] bg-[#fffbeb] px-4 py-3 text-[12px] text-[#92400e]">
            🔒 O certificado é armazenado de forma segura e usado exclusivamente para assinatura de NFe. Nunca compartilhe a senha.
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={savingCert || (!certBase64 && !temCert)} className="bg-synk-indigo hover:bg-synk-indigo-hover">
              {savingCert ? <><Loader2 className="size-4 animate-spin" />Salvando...</> : 'Salvar certificado'}
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

// ── Helpers de layout ─────────────────────────────────────────────

function Section({ icon, iconBg, title, children }: {
  icon: React.ReactNode
  iconBg: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4">
        <div className={`flex size-8 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
        <h2 className="font-display text-[15px] font-bold text-synk-navy">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}

function F({ label, children, cls }: { label: string; children: React.ReactNode; cls?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${cls ?? ''}`}>
      <Label className="text-[13px] font-medium text-synk-navy">{label}</Label>
      {children}
    </div>
  )
}
