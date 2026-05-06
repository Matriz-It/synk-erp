'use client'

import { useState, useMemo, useEffect } from 'react'

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const T = {
  indigo: '#3d3ebf', indigoHover: '#5b5ee8', indigoLight: '#eef0ff',
  navy: '#0f172a', navyCard: '#1e293b', navyBorder: '#334155',
  success: '#14b87e', successBg: '#d1fae5',
  warning: '#f59e0b', warningBg: '#fef3c7',
  danger: '#ef4444', dangerBg: '#fee2e2',
  gray50: '#f8f9fc', gray100: '#f1f5f9', gray200: '#e2e8f0',
  gray400: '#94a3b8', gray500: '#64748b', gray700: '#334155',
  white: '#ffffff',
}

// ─── ICONS ────────────────────────────────────────────────────────
const ICONS: Record<string, (s: Record<string, unknown>) => JSX.Element> = {
  check: (s) => <svg {...s as React.SVGProps<SVGSVGElement>} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x: (s) => <svg {...s as React.SVGProps<SVGSVGElement>} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  plus: (s) => <svg {...s as React.SVGProps<SVGSVGElement>} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search: (s) => <svg {...s as React.SVGProps<SVGSVGElement>} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  wallet: (s) => <svg {...s as React.SVGProps<SVGSVGElement>} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>,
  building: (s) => <svg {...s as React.SVGProps<SVGSVGElement>} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><rect x="9" y="12" width="6" height="10"/></svg>,
  alertCircle: (s) => <svg {...s as React.SVGProps<SVGSVGElement>} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  loader: (s) => <svg {...s as React.SVGProps<SVGSVGElement>} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  calendar: (s) => <svg {...s as React.SVGProps<SVGSVGElement>} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chevronDown: (s) => <svg {...s as React.SVGProps<SVGSVGElement>} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  chevronRight: (s) => <svg {...s as React.SVGProps<SVGSVGElement>} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
}
function Icon({ name, size = 16, color = 'currentColor', strokeWidth = 1.5, style: extraStyle }: { name: string; size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }) {
  const fn = ICONS[name]
  if (!fn) return null
  const s: React.SVGProps<SVGSVGElement> = { width: size, height: size, strokeWidth, color, style: { display: 'inline-block', flexShrink: 0, ...extraStyle } }
  return fn(s as Record<string, unknown>)
}

// ─── DATA ─────────────────────────────────────────────────────────
const CONTAS_FIN = [
  { id: 'cc-itau',     nome: 'Conta Corrente Itaú',    numero: 'Ag 1234 · CC 56789-0', saldo:  184320.55, cor: '#EC7000' },
  { id: 'cc-bradesco', nome: 'Conta Corrente Bradesco', numero: 'Ag 0987 · CC 12345-6', saldo:   92480.10, cor: '#CC092F' },
  { id: 'cartao-pj',   nome: 'Cartão Pessoa Jurídica',  numero: 'Final ••• 4421',       saldo:  -18450.00, cor: '#1F2937' },
]

const FORMAS_PGTO = [
  { id: 'pix',      label: 'Pix' },
  { id: 'cartao_c', label: 'Cartão de Crédito' },
  { id: 'cartao_d', label: 'Cartão de Débito' },
  { id: 'boleto',   label: 'Boleto' },
  { id: 'ted',      label: 'Transferência TED/DOC' },
  { id: 'dinheiro', label: 'Dinheiro' },
]

const CATEGORIAS_FIN: Record<string, { id: string; nome: string; subs: { id: string; nome: string }[] }[]> = {
  pagar: [
    { id: 'fornecedores', nome: 'Fornecedores', subs: [{ id: 'mat-prima', nome: 'Matéria-prima' }, { id: 'mercadorias', nome: 'Mercadorias para revenda' }, { id: 'servicos-terc', nome: 'Serviços terceirizados' }] },
    { id: 'ocupacao', nome: 'Ocupação', subs: [{ id: 'aluguel', nome: 'Aluguel' }, { id: 'condom', nome: 'Condomínio' }, { id: 'energia', nome: 'Energia' }, { id: 'agua', nome: 'Água' }, { id: 'internet', nome: 'Internet/Telefonia' }] },
    { id: 'pessoal', nome: 'Pessoal', subs: [{ id: 'salarios', nome: 'Salários' }, { id: 'beneficios', nome: 'Benefícios' }, { id: 'pro-labore', nome: 'Pró-labore' }] },
    { id: 'tributos', nome: 'Tributos', subs: [{ id: 'das-simples', nome: 'DAS Simples Nacional' }, { id: 'icms', nome: 'ICMS' }, { id: 'iss', nome: 'ISS' }] },
  ],
  receber: [
    { id: 'vendas', nome: 'Vendas', subs: [{ id: 'mercadoria', nome: 'Mercadoria' }, { id: 'servico', nome: 'Serviço' }, { id: 'devolucoes', nome: 'Devoluções (negativo)' }] },
    { id: 'financeiras', nome: 'Receitas Financeiras', subs: [{ id: 'rendimentos', nome: 'Rendimentos de aplicação' }, { id: 'juros-rec', nome: 'Juros recebidos' }] },
  ],
}

const TAXA_JUROS_PADRAO = 2.5

interface Lancamento {
  id: string; paiId: string; parcela: number; totalParcelas: number
  descricao: string; favorecido: string; documento: string
  categoria: string; subcategoria: string
  valor: number; vencimento: string; emissao: string
  status: 'aberto' | 'baixado'; conta: string
  baixa?: { data: string; forma: string; conta: string; juros: number; desconto: number; valorPago: number; obs: string; taxa: number }
}

const HOJE = '2026-05-06'

function diasEntre(de: string, ate: string) { return Math.round((new Date(ate).getTime() - new Date(de).getTime()) / 86400000) }
function calcJurosSimples(valor: number, diasAtraso: number, taxaMes = TAXA_JUROS_PADRAO) { return Math.max(0, valor * (taxaMes / 100) * (diasAtraso / 30)) }
function numF(v: string) { const n = parseFloat(String(v || '').replace(',', '.')); return isNaN(n) ? 0 : n }

function statusVencimento(vencimento: string, hoje: string) {
  const d = diasEntre(vencimento, hoje)
  if (d > 0)  return { label: `${d}d em atraso`, color: T.danger,  bg: T.dangerBg }
  if (d === 0) return { label: 'Vence hoje',     color: T.warning, bg: T.warningBg }
  if (d >= -3) return { label: `em ${-d}d`,      color: T.warning, bg: T.warningBg }
  return          { label: `em ${-d}d`,           color: T.gray500, bg: T.gray100 }
}

function findCat(tipo: string, catId: string, subId: string) {
  const cat = CATEGORIAS_FIN[tipo]?.find(c => c.id === catId)
  const sub = cat?.subs.find(s => s.id === subId)
  return { cat, sub }
}

function fmtBRL(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0) }

function gerarMockLancamentos(tipo: string): Lancamento[] {
  const hoje = new Date(HOJE)
  const d = (offset: number) => { const dt = new Date(hoje); dt.setDate(dt.getDate() + offset); return dt.toISOString().slice(0, 10) }
  if (tipo === 'pagar') return [
    { id: 'L-001-1', paiId: 'L-001', parcela: 1, totalParcelas: 3, descricao: 'Aluguel comercial · Mai/26', favorecido: 'Imobiliária Veridiana SA', documento: '12.345.678/0001-90', categoria: 'ocupacao', subcategoria: 'aluguel', valor: 8500, vencimento: d(-3), emissao: d(-15), status: 'aberto', conta: 'cc-itau' },
    { id: 'L-001-2', paiId: 'L-001', parcela: 2, totalParcelas: 3, descricao: 'Aluguel comercial · Jun/26', favorecido: 'Imobiliária Veridiana SA', documento: '12.345.678/0001-90', categoria: 'ocupacao', subcategoria: 'aluguel', valor: 8500, vencimento: d(27), emissao: d(-15), status: 'aberto', conta: 'cc-itau' },
    { id: 'L-001-3', paiId: 'L-001', parcela: 3, totalParcelas: 3, descricao: 'Aluguel comercial · Jul/26', favorecido: 'Imobiliária Veridiana SA', documento: '12.345.678/0001-90', categoria: 'ocupacao', subcategoria: 'aluguel', valor: 8500, vencimento: d(58), emissao: d(-15), status: 'aberto', conta: 'cc-itau' },
    { id: 'L-002-1', paiId: 'L-002', parcela: 1, totalParcelas: 1, descricao: 'NF 8821 · Embalagens', favorecido: 'Plásticos Andrade Ltda', documento: '45.678.900/0001-22', categoria: 'fornecedores', subcategoria: 'mat-prima', valor: 4280.50, vencimento: d(2), emissao: d(-8), status: 'aberto', conta: 'cc-itau' },
    { id: 'L-003-1', paiId: 'L-003', parcela: 1, totalParcelas: 1, descricao: 'Energia elétrica', favorecido: 'Enel SP', documento: '61.695.227/0001-93', categoria: 'ocupacao', subcategoria: 'energia', valor: 2145.30, vencimento: d(-7), emissao: d(-22), status: 'aberto', conta: 'cc-bradesco' },
    { id: 'L-004-1', paiId: 'L-004', parcela: 1, totalParcelas: 2, descricao: 'Folha mai/26 · Adiantamento', favorecido: 'Folha de Pagamento', documento: '-', categoria: 'pessoal', subcategoria: 'salarios', valor: 18500, vencimento: d(8), emissao: d(-5), status: 'aberto', conta: 'cc-itau' },
    { id: 'L-004-2', paiId: 'L-004', parcela: 2, totalParcelas: 2, descricao: 'Folha mai/26 · Final', favorecido: 'Folha de Pagamento', documento: '-', categoria: 'pessoal', subcategoria: 'salarios', valor: 32400, vencimento: d(24), emissao: d(-5), status: 'aberto', conta: 'cc-itau' },
    { id: 'L-005-1', paiId: 'L-005', parcela: 1, totalParcelas: 1, descricao: 'DAS Simples Nacional · Abr/26', favorecido: 'Receita Federal', documento: '-', categoria: 'tributos', subcategoria: 'das-simples', valor: 6840.22, vencimento: d(-12), emissao: d(-30), status: 'aberto', conta: 'cc-itau' },
    { id: 'L-006-1', paiId: 'L-006', parcela: 1, totalParcelas: 1, descricao: 'Link dedicado 500MB', favorecido: 'Vivo Empresas', documento: '02.558.157/0001-62', categoria: 'ocupacao', subcategoria: 'internet', valor: 1290, vencimento: d(11), emissao: d(-3), status: 'aberto', conta: 'cartao-pj' },
  ]
  return [
    { id: 'R-001-1', paiId: 'R-001', parcela: 1, totalParcelas: 3, descricao: 'NF-e 000142 · Lima Distribuidora', favorecido: 'Lima Distribuidora Ltda', documento: '12.345.678/0001-90', categoria: 'vendas', subcategoria: 'mercadoria', valor: 4150.27, vencimento: d(-5), emissao: d(-15), status: 'aberto', conta: 'cc-itau' },
    { id: 'R-001-2', paiId: 'R-001', parcela: 2, totalParcelas: 3, descricao: 'NF-e 000142 · Lima Distribuidora', favorecido: 'Lima Distribuidora Ltda', documento: '12.345.678/0001-90', categoria: 'vendas', subcategoria: 'mercadoria', valor: 4150.27, vencimento: d(25), emissao: d(-15), status: 'aberto', conta: 'cc-itau' },
    { id: 'R-001-3', paiId: 'R-001', parcela: 3, totalParcelas: 3, descricao: 'NF-e 000142 · Lima Distribuidora', favorecido: 'Lima Distribuidora Ltda', documento: '12.345.678/0001-90', categoria: 'vendas', subcategoria: 'mercadoria', valor: 4150.26, vencimento: d(55), emissao: d(-15), status: 'aberto', conta: 'cc-itau' },
    { id: 'R-002-1', paiId: 'R-002', parcela: 1, totalParcelas: 1, descricao: 'NF-e 000141 · Construtora Velez', favorecido: 'Construtora Velez S.A.', documento: '55.443.321/0001-77', categoria: 'vendas', subcategoria: 'mercadoria', valor: 38970.00, vencimento: d(8), emissao: d(-1), status: 'aberto', conta: 'cc-bradesco' },
    { id: 'R-003-1', paiId: 'R-003', parcela: 1, totalParcelas: 2, descricao: 'Pedido 1080 · Padaria São Jorge', favorecido: 'Padaria São Jorge Eireli', documento: '98.765.432/0001-10', categoria: 'vendas', subcategoria: 'mercadoria', valor: 910.25, vencimento: d(2), emissao: d(-10), status: 'aberto', conta: 'cc-itau' },
    { id: 'R-003-2', paiId: 'R-003', parcela: 2, totalParcelas: 2, descricao: 'Pedido 1080 · Padaria São Jorge', favorecido: 'Padaria São Jorge Eireli', documento: '98.765.432/0001-10', categoria: 'vendas', subcategoria: 'mercadoria', valor: 910.25, vencimento: d(32), emissao: d(-10), status: 'aberto', conta: 'cc-itau' },
    { id: 'R-004-1', paiId: 'R-004', parcela: 1, totalParcelas: 1, descricao: 'Mensalidade software', favorecido: 'Mercado Boa Vista ME', documento: '33.221.100/0001-55', categoria: 'vendas', subcategoria: 'servico', valor: 2400.00, vencimento: d(-2), emissao: d(-12), status: 'aberto', conta: 'cc-itau' },
    { id: 'R-005-1', paiId: 'R-005', parcela: 1, totalParcelas: 1, descricao: 'Rendimento CDB Itaú', favorecido: 'Itaú Investimentos', documento: '-', categoria: 'financeiras', subcategoria: 'rendimentos', valor: 1820.50, vencimento: d(0), emissao: d(-30), status: 'aberto', conta: 'cc-itau' },
  ]
}

// ─── KPI CARDS — saldo por conta ──────────────────────────────────
function ContasKPIs() {
  const total = CONTAS_FIN.reduce((a, c) => a + c.saldo, 0)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${CONTAS_FIN.length + 1}, 1fr)`, gap: 12 }}>
      {CONTAS_FIN.map(c => (
        <div key={c.id} style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${T.gray200}`, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: c.cor }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: `${c.cor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="building" size={14} color={c.cor} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nome}</p>
              <p style={{ fontSize: 10, color: T.gray400, fontFamily: 'JetBrains Mono, monospace' }}>{c.numero}</p>
            </div>
          </div>
          <p style={{ fontSize: 10, fontWeight: 600, color: T.gray400, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Saldo atual</p>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 20, fontWeight: 700, color: c.saldo < 0 ? T.danger : T.navy }}>{fmtBRL(c.saldo)}</p>
        </div>
      ))}
      <div style={{ padding: '14px 16px', borderRadius: 10, background: `linear-gradient(135deg, ${T.indigo} 0%, ${T.indigoHover} 100%)`, color: '#fff', boxShadow: '0 4px 12px rgba(61,62,191,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="wallet" size={14} color="#fff" />
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Saldo consolidado</p>
        </div>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Total em caixa</p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>{fmtBRL(total)}</p>
      </div>
    </div>
  )
}

// ─── FIELD HELPERS ────────────────────────────────────────────────
function FField({ label, value, onChange, mono, type = 'text', prefix, placeholder, disabled, span = 1, hint }: { label?: string; value: string; onChange?: (v: string) => void; mono?: boolean; type?: string; prefix?: string; placeholder?: string; disabled?: boolean; span?: number; hint?: string }) {
  const [foc, setFoc] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: `span ${span}` }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: T.navy }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {prefix && <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: T.gray400, pointerEvents: 'none' }}>{prefix}</span>}
        <input value={value ?? ''} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} type={type} disabled={disabled}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
          style={{ width: '100%', height: 38, borderRadius: 6, border: `1.5px solid ${foc ? T.indigo : T.gray200}`, paddingLeft: prefix ? 30 : 10, paddingRight: 10, fontSize: 13, outline: 'none', fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit', background: disabled ? T.gray50 : '#fff', color: disabled ? T.gray500 : T.navy, boxShadow: foc ? '0 0 0 3px rgba(61,62,191,0.08)' : 'none', transition: 'border 0.15s' }}
        />
      </div>
      {hint && <p style={{ fontSize: 11, color: T.gray400 }}>{hint}</p>}
    </div>
  )
}

function FSelect({ label, value, onChange, options, span = 1, disabled }: { label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; span?: number; disabled?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: `span ${span}` }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: T.navy }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{ height: 38, borderRadius: 6, border: `1.5px solid ${T.gray200}`, padding: '0 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: disabled ? T.gray50 : '#fff', cursor: disabled ? 'default' : 'pointer', color: T.navy }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ─── MODAL BAIXA ──────────────────────────────────────────────────
function ModalBaixa({ tipo, lanc, onClose, onConfirm }: { tipo: string; lanc: Lancamento; onClose: () => void; onConfirm: (l: Lancamento) => void }) {
  const dias = Math.max(0, diasEntre(lanc.vencimento, HOJE))
  const jurosSugerido = +calcJurosSimples(lanc.valor, dias).toFixed(2)

  const [dataBaixa, setDataBaixa] = useState(HOJE)
  const [forma, setForma]         = useState(tipo === 'receber' ? 'pix' : 'boleto')
  const [conta, setConta]         = useState(lanc.conta || CONTAS_FIN[0].id)
  const [taxa, setTaxa]           = useState(String(TAXA_JUROS_PADRAO).replace('.', ','))
  const [juros, setJuros]         = useState(String(jurosSugerido.toFixed(2)).replace('.', ','))
  const [desconto, setDesconto]   = useState('0,00')
  const [valorPago, setValorPago] = useState(String((lanc.valor + jurosSugerido).toFixed(2)).replace('.', ','))
  const [obs, setObs]             = useState('')
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    const t = numF(taxa)
    const j = +calcJurosSimples(lanc.valor, dias, t).toFixed(2)
    setJuros(String(j.toFixed(2)).replace('.', ','))
  }, [taxa, lanc.valor, dias])

  useEffect(() => {
    const v = +(lanc.valor + numF(juros) - numF(desconto)).toFixed(2)
    setValorPago(String(v.toFixed(2)).replace('.', ','))
  }, [juros, desconto, lanc.valor])

  const valorPagoNum = numF(valorPago)
  const cat = findCat(tipo, lanc.categoria, lanc.subcategoria)
  const contaSel = CONTAS_FIN.find(c => c.id === conta)

  async function confirmar() {
    setConfirmando(true)
    await new Promise(r => setTimeout(r, 700))
    onConfirm({ ...lanc, status: 'baixado', baixa: { data: dataBaixa, forma, conta, juros: numF(juros), desconto: numF(desconto), valorPago: valorPagoNum, obs, taxa: numF(taxa) } })
    setConfirmando(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 640, background: '#fff', borderRadius: 14, boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.gray200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: tipo === 'receber' ? T.successBg : T.indigoLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={18} color={tipo === 'receber' ? T.success : T.indigo} strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 700, color: T.navy }}>Baixa de {tipo === 'receber' ? 'recebimento' : 'pagamento'}</h2>
              <p style={{ fontSize: 12, color: T.gray500, marginTop: 2 }}>{lanc.descricao}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', color: T.gray400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.gray100 }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          ><Icon name="x" size={16} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Resumo */}
          <div style={{ padding: '12px 14px', borderRadius: 10, background: T.gray50, border: `1px solid ${T.gray200}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.gray400, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{tipo === 'receber' ? 'Pagador' : 'Favorecido'}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{lanc.favorecido}</p>
                <p style={{ fontSize: 11, color: T.gray500, marginTop: 2 }}>{cat.cat?.nome} · {cat.sub?.nome}{lanc.totalParcelas > 1 ? ` · Parcela ${lanc.parcela}/${lanc.totalParcelas}` : ''}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.gray400, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Vencimento</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: dias > 0 ? T.danger : T.navy }}>{lanc.vencimento}</p>
                {dias > 0 && <p style={{ fontSize: 11, color: T.danger, fontWeight: 500, marginTop: 1 }}>{dias} dias em atraso</p>}
              </div>
            </div>
          </div>

          {/* Linha 1: Data e Forma */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FField label="Data da baixa *" type="date" value={dataBaixa} onChange={setDataBaixa} />
            <FSelect label="Forma de pagamento *" value={forma} onChange={setForma} options={FORMAS_PGTO.map(f => ({ value: f.id, label: f.label }))} />
          </div>

          {/* Conta */}
          <FSelect label={`Conta financeira ${tipo === 'receber' ? '(crédito)' : '(débito)'} *`} value={conta} onChange={setConta}
            options={CONTAS_FIN.map(c => ({ value: c.id, label: `${c.nome} · ${c.numero} · saldo ${fmtBRL(c.saldo)}` }))} />

          {/* Juros */}
          <div style={{ padding: 14, borderRadius: 10, background: dias > 0 ? T.warningBg : T.gray50, border: `1px solid ${dias > 0 ? T.warning + '40' : T.gray200}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="alertCircle" size={13} color={dias > 0 ? T.warning : T.gray500} />
              <p style={{ fontSize: 12, fontWeight: 600, color: dias > 0 ? T.warning : T.gray500 }}>Juros simples · {dias} dia{dias === 1 ? '' : 's'} em atraso</p>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: T.gray500, fontFamily: 'JetBrains Mono, monospace' }}>
                {fmtBRL(lanc.valor)} × {numF(taxa)}%/mês × ({dias}/30) = <strong style={{ color: T.navy }}>{fmtBRL(numF(juros))}</strong>
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <FField label="Taxa (% ao mês)" mono value={taxa} onChange={setTaxa} />
              <FField label="Juros (editável)" mono prefix="R$" value={juros} onChange={setJuros} />
              <FField label="Desconto" mono prefix="R$" value={desconto} onChange={setDesconto} />
            </div>
          </div>

          {/* Observação */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: T.navy }}>Observação</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
              placeholder="Ex.: Pagamento via Pix, comprovante anexado..."
              style={{ width: '100%', borderRadius: 6, border: `1.5px solid ${T.gray200}`, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${T.gray200}`, background: T.gray50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 18, fontSize: 11.5, color: T.gray500 }}>
            <span>Original <strong style={{ color: T.navy, fontFamily: 'JetBrains Mono, monospace' }}>{fmtBRL(lanc.valor)}</strong></span>
            {numF(juros) > 0 && <span>+ Juros <strong style={{ color: T.warning, fontFamily: 'JetBrains Mono, monospace' }}>{fmtBRL(numF(juros))}</strong></span>}
            {numF(desconto) > 0 && <span>− Desconto <strong style={{ color: T.success, fontFamily: 'JetBrains Mono, monospace' }}>{fmtBRL(numF(desconto))}</strong></span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: T.gray400, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor a {tipo === 'receber' ? 'receber' : 'pagar'}</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 700, color: tipo === 'receber' ? T.success : T.indigo }}>{fmtBRL(valorPagoNum)}</p>
            </div>
            <button onClick={onClose} style={{ height: 38, padding: '0 14px', borderRadius: 6, border: `1px solid ${T.gray200}`, background: '#fff', fontSize: 13, fontWeight: 500, color: T.navy, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={confirmar} disabled={confirmando}
              style={{ height: 38, padding: '0 18px', borderRadius: 6, border: 'none', background: tipo === 'receber' ? T.success : T.indigo, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: confirmando ? 0.7 : 1 }}
            >
              {confirmando
                ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-flex' }}><Icon name="loader" size={13} color="#fff" /></span>Confirmando...</>
                : <><Icon name="check" size={13} color="#fff" strokeWidth={2.5} />Confirmar baixa</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MODAL NOVO LANÇAMENTO ────────────────────────────────────────
function ModalNovoLanc({ tipo, onClose, onCreate }: { tipo: string; onClose: () => void; onCreate: (d: { descricao: string; favorecido: string; valor: number; qtd: number; intervalo: number; primVenc: string; emissao: string; conta: string; categoria: string; subcategoria: string; parcelas: { num: number; data: string; valor: number }[] }) => void }) {
  const [descricao, setDescricao] = useState('')
  const [favorecido, setFavorecido] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [emissao, setEmissao]     = useState(HOJE)
  const [primVenc, setPrimVenc]   = useState(HOJE)
  const [qtdParc, setQtdParc]     = useState('1')
  const [intervalo, setIntervalo] = useState('30')
  const [conta, setConta]         = useState(CONTAS_FIN[0].id)
  const [categoria, setCategoria] = useState(CATEGORIAS_FIN[tipo][0].id)
  const [subcat, setSubcat]       = useState(CATEGORIAS_FIN[tipo][0].subs[0].id)

  useEffect(() => {
    const cat = CATEGORIAS_FIN[tipo].find(c => c.id === categoria)
    if (cat && !cat.subs.find(s => s.id === subcat)) setSubcat(cat.subs[0].id)
  }, [categoria, subcat, tipo])

  const qtd = Math.max(1, Math.min(36, parseInt(qtdParc) || 1))
  const valor = numF(valorTotal)
  const valorPorParc = qtd > 0 ? +(valor / qtd).toFixed(2) : 0
  const ajusteUlt = +(valor - valorPorParc * qtd).toFixed(2)

  const previewParcelas = Array.from({ length: qtd }, (_, i) => {
    const dt = new Date(primVenc)
    dt.setDate(dt.getDate() + i * (parseInt(intervalo || '0')))
    return { num: i + 1, data: dt.toISOString().slice(0, 10), valor: i === qtd - 1 ? +(valorPorParc + ajusteUlt).toFixed(2) : valorPorParc }
  })

  const valido = descricao.trim() && favorecido.trim() && valor > 0 && qtd >= 1
  const catObj = CATEGORIAS_FIN[tipo].find(c => c.id === categoria)

  function criar() {
    if (!valido) return
    onCreate({ descricao, favorecido, valor, qtd, intervalo: parseInt(intervalo) || 30, primVenc, emissao, conta, categoria, subcategoria: subcat, parcelas: previewParcelas })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 720, background: '#fff', borderRadius: 14, boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.gray200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 700, color: T.navy }}>Novo lançamento — {tipo === 'receber' ? 'Conta a Receber' : 'Conta a Pagar'}</h2>
            <p style={{ fontSize: 12, color: T.gray500, marginTop: 2 }}>Lançamento-pai + parcelas filhas (cada parcela = 1 linha na lista)</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', color: T.gray400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          ><Icon name="x" size={16} /></button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FField label="Descrição *" value={descricao} onChange={setDescricao} placeholder="Ex.: NF 1234 · Aluguel comercial..." span={2} />
            <FField label={tipo === 'receber' ? 'Pagador *' : 'Favorecido *'} value={favorecido} onChange={setFavorecido} placeholder="Razão social ou nome" span={2} />
            <FSelect label="Categoria" value={categoria} onChange={setCategoria} options={CATEGORIAS_FIN[tipo].map(c => ({ value: c.id, label: c.nome }))} />
            <FSelect label="Subcategoria" value={subcat} onChange={setSubcat} options={(catObj?.subs || []).map(s => ({ value: s.id, label: s.nome }))} />
            <FField label="Valor total *" mono prefix="R$" placeholder="0,00" value={valorTotal} onChange={setValorTotal} />
            <FField label="Data de emissão" type="date" value={emissao} onChange={setEmissao} />
            <FSelect label="Conta financeira" value={conta} onChange={setConta} span={2} options={CONTAS_FIN.map(c => ({ value: c.id, label: `${c.nome} · ${c.numero}` }))} />
          </div>

          <div style={{ padding: 14, borderRadius: 10, background: T.indigoLight, border: `1px solid ${T.indigo}20`, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="calendar" size={13} color={T.indigo} />
              <p style={{ fontSize: 12, fontWeight: 600, color: T.indigo }}>Parcelamento</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <FField label="Qtd parcelas" mono value={qtdParc} onChange={setQtdParc} />
              <FField label="Intervalo (dias)" mono value={intervalo} onChange={setIntervalo} />
              <FField label="1º vencimento" type="date" value={primVenc} onChange={setPrimVenc} />
            </div>
          </div>

          {valido && (
            <div style={{ border: `1px solid ${T.gray200}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: T.gray50, borderBottom: `1px solid ${T.gray200}`, display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.gray500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pré-visualização das parcelas ({qtd})</p>
                <p style={{ fontSize: 11, color: T.gray500, fontFamily: 'JetBrains Mono, monospace' }}>Total: <strong style={{ color: T.navy }}>{fmtBRL(valor)}</strong></p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: T.gray500 }}>
                    <th style={{ padding: '8px 14px', textAlign: 'left', width: 60 }}>Parc.</th>
                    <th style={{ padding: '8px 14px', textAlign: 'left' }}>Vencimento</th>
                    <th style={{ padding: '8px 14px', textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {previewParcelas.map(p => (
                    <tr key={p.num} style={{ borderTop: `1px solid ${T.gray100}` }}>
                      <td style={{ padding: '6px 14px', fontFamily: 'JetBrains Mono, monospace', color: T.gray500 }}>{p.num}/{qtd}</td>
                      <td style={{ padding: '6px 14px', fontFamily: 'JetBrains Mono, monospace', color: T.navy }}>{p.data}</td>
                      <td style={{ padding: '6px 14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: T.navy, textAlign: 'right' }}>{fmtBRL(p.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ padding: '14px 24px', borderTop: `1px solid ${T.gray200}`, background: T.gray50, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ height: 38, padding: '0 14px', borderRadius: 6, border: `1px solid ${T.gray200}`, background: '#fff', fontSize: 13, fontWeight: 500, color: T.navy, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={criar} disabled={!valido}
            style={{ height: 38, padding: '0 18px', borderRadius: 6, border: 'none', background: valido ? T.indigo : T.gray200, fontSize: 13, fontWeight: 600, color: '#fff', cursor: valido ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}
          ><Icon name="plus" size={13} color="#fff" strokeWidth={2.5} />Criar lançamento</button>
        </div>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────
export function FinanceiroView({ tipo }: { tipo: 'pagar' | 'receber' }) {
  const titulo = tipo === 'receber' ? 'Contas a Receber' : 'Contas a Pagar'
  const colorAcento = tipo === 'receber' ? T.success : T.indigo

  const [lancamentos, setLancamentos] = useState<Lancamento[]>(() => gerarMockLancamentos(tipo))
  const [search, setSearch]           = useState('')
  const [statusFilt, setStatusFilt]   = useState<'aberto' | 'baixado' | 'all'>('aberto')
  const [catFilt, setCatFilt]         = useState('all')
  const [contaFilt, setContaFilt]     = useState('all')
  const [agrupar, setAgrupar]         = useState<'vencimento' | 'pai'>('vencimento')
  const [baixaModal, setBaixaModal]   = useState<Lancamento | null>(null)
  const [novoModal, setNovoModal]     = useState(false)
  const [expandedPais, setExpandedPais] = useState<Set<string>>(new Set())

  useEffect(() => {
    setLancamentos(gerarMockLancamentos(tipo))
    setStatusFilt('aberto')
    setCatFilt('all')
    setContaFilt('all')
  }, [tipo])

  const filtrados = useMemo(() => lancamentos.filter(l => {
    const q = search.toLowerCase()
    const ms = !q || l.descricao.toLowerCase().includes(q) || l.favorecido.toLowerCase().includes(q) || l.documento.includes(q)
    const mst = statusFilt === 'all' || l.status === statusFilt
    const mc = catFilt === 'all' || l.categoria === catFilt
    const mco = contaFilt === 'all' || l.conta === contaFilt
    return ms && mst && mc && mco
  }), [lancamentos, search, statusFilt, catFilt, contaFilt])

  const totalAberto  = filtrados.filter(l => l.status === 'aberto').reduce((a, l) => a + l.valor, 0)
  const totalVencido = filtrados.filter(l => l.status === 'aberto' && diasEntre(l.vencimento, HOJE) > 0).reduce((a, l) => a + l.valor, 0)
  const totalHoje    = filtrados.filter(l => l.status === 'aberto' && diasEntre(l.vencimento, HOJE) === 0).reduce((a, l) => a + l.valor, 0)
  const total7dias   = filtrados.filter(l => { const d = diasEntre(l.vencimento, HOJE); return l.status === 'aberto' && d < 0 && d >= -7 }).reduce((a, l) => a + l.valor, 0)

  const grupos = useMemo(() => {
    if (agrupar === 'pai') {
      const m: Record<string, Lancamento[]> = {}
      filtrados.forEach(l => { (m[l.paiId] ||= []).push(l) })
      return Object.values(m).sort((a, b) => a[0].descricao.localeCompare(b[0].descricao))
    }
    return [[...filtrados].sort((a, b) => a.vencimento.localeCompare(b.vencimento))]
  }, [filtrados, agrupar])

  function confirmarBaixa(atualizado: Lancamento) {
    setLancamentos(prev => prev.map(l => l.id === atualizado.id ? atualizado : l))
    setBaixaModal(null)
  }

  function criarLancamento(d: { descricao: string; favorecido: string; valor: number; qtd: number; intervalo: number; primVenc: string; emissao: string; conta: string; categoria: string; subcategoria: string; parcelas: { num: number; data: string; valor: number }[] }) {
    const paiId = `N-${Date.now()}`
    const novos: Lancamento[] = d.parcelas.map(p => ({
      id: `${paiId}-${p.num}`, paiId, parcela: p.num, totalParcelas: d.qtd,
      descricao: d.descricao + (d.qtd > 1 ? ` · ${p.num}/${d.qtd}` : ''),
      favorecido: d.favorecido, documento: '-', categoria: d.categoria, subcategoria: d.subcategoria,
      valor: p.valor, vencimento: p.data, emissao: d.emissao, status: 'aberto', conta: d.conta,
    }))
    setLancamentos(prev => [...novos, ...prev])
    setNovoModal(false)
  }

  function togglePai(paiId: string) {
    setExpandedPais(prev => { const s = new Set(prev); if (s.has(paiId)) s.delete(paiId); else s.add(paiId); return s })
  }

  function renderLinha(l: Lancamento, indented: boolean) {
    const sv = statusVencimento(l.vencimento, HOJE)
    const dias = diasEntre(l.vencimento, HOJE)
    const juros = dias > 0 ? +calcJurosSimples(l.valor, dias).toFixed(2) : 0
    const cat = findCat(tipo, l.categoria, l.subcategoria)
    const conta = CONTAS_FIN.find(c => c.id === l.conta)
    const baixado = l.status === 'baixado'
    return (
      <tr key={l.id} style={{ borderTop: `1px solid ${T.gray100}`, opacity: baixado ? 0.6 : 1 }}>
        <td style={{ padding: '11px 16px', paddingLeft: indented ? 40 : 16 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: T.navy }}>{l.descricao}</p>
          <p style={{ fontSize: 11, color: T.gray500, fontFamily: 'JetBrains Mono, monospace' }}>{l.favorecido} · {l.documento}</p>
        </td>
        <td style={{ padding: '11px 12px' }}>
          <p style={{ fontSize: 12, color: T.navy }}>{cat.cat?.nome}</p>
          <p style={{ fontSize: 11, color: T.gray400 }}>{cat.sub?.nome}</p>
        </td>
        <td style={{ padding: '11px 12px', textAlign: 'center' }}>
          {l.totalParcelas > 1
            ? <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: T.indigoLight, color: T.indigo, fontFamily: 'JetBrains Mono, monospace' }}>{l.parcela}/{l.totalParcelas}</span>
            : <span style={{ fontSize: 11, color: T.gray400 }}>—</span>
          }
        </td>
        <td style={{ padding: '11px 12px' }}>
          {conta && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: conta.cor }} />
              <span style={{ fontSize: 11.5, color: T.gray700 }}>{conta.nome.replace('Conta Corrente ', '')}</span>
            </div>
          )}
        </td>
        <td style={{ padding: '11px 12px' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: T.navy }}>{l.vencimento}</p>
          {!baixado && <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: sv.bg, color: sv.color, marginTop: 2 }}>{sv.label}</span>}
        </td>
        <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: T.navy }}>{fmtBRL(l.valor)}</td>
        <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: juros > 0 ? T.warning : T.gray400 }}>
          {juros > 0 ? `+${fmtBRL(juros)}` : '—'}
        </td>
        <td style={{ padding: '11px 16px', textAlign: 'right' }}>
          {baixado
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: T.successBg, color: T.success }}><Icon name="check" size={11} color={T.success} strokeWidth={2.5} />Baixado</span>
            : <button onClick={() => setBaixaModal(l)}
                style={{ height: 30, padding: '0 12px', borderRadius: 6, border: `1px solid ${colorAcento}`, background: '#fff', fontSize: 12, fontWeight: 600, color: colorAcento, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = colorAcento; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.color = colorAcento }}
              ><Icon name="check" size={12} strokeWidth={2.5} />Baixar</button>
          }
        </td>
      </tr>
    )
  }

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: '-0.4px', color: T.navy }}>{titulo}</h1>
          <p style={{ fontSize: 14, color: T.gray500, marginTop: 2 }}>{filtrados.length} lançamento{filtrados.length === 1 ? '' : 's'} · Em aberto: <strong style={{ color: T.navy, fontFamily: 'JetBrains Mono, monospace' }}>{fmtBRL(totalAberto)}</strong></p>
        </div>
        <button onClick={() => setNovoModal(true)}
          style={{ height: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px', borderRadius: 6, border: 'none', background: colorAcento, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
        ><Icon name="plus" size={15} color="#fff" strokeWidth={2.5} />Novo lançamento</button>
      </div>

      {/* KPIs Saldo por Conta */}
      <ContasKPIs />

      {/* Resumo de status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: tipo === 'receber' ? 'A receber em aberto' : 'A pagar em aberto', value: fmtBRL(totalAberto), color: colorAcento, bg: tipo === 'receber' ? T.successBg : T.indigoLight },
          { label: 'Vencidos', value: fmtBRL(totalVencido), color: T.danger, bg: T.dangerBg },
          { label: 'Vence hoje', value: fmtBRL(totalHoje), color: T.warning, bg: T.warningBg },
          { label: 'Próximos 7 dias', value: fmtBRL(total7dias), color: T.gray700, bg: T.gray50 },
        ].map(k => (
          <div key={k.label} style={{ padding: '12px 16px', borderRadius: 10, border: `1px solid ${T.gray200}`, background: k.bg }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: T.gray500, marginBottom: 4 }}>{k.label}</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><Icon name="search" size={14} color={T.gray400} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Buscar por descrição, ${tipo === 'receber' ? 'pagador' : 'favorecido'} ou documento...`}
            style={{ width: '100%', height: 38, borderRadius: 6, border: `1.5px solid ${T.gray200}`, background: '#fff', paddingLeft: 32, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <select value={catFilt} onChange={e => setCatFilt(e.target.value)}
          style={{ height: 38, borderRadius: 6, border: `1.5px solid ${T.gray200}`, padding: '0 10px', fontSize: 13, background: '#fff', cursor: 'pointer', color: T.navy }}>
          <option value="all">Todas categorias</option>
          {CATEGORIAS_FIN[tipo].map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select value={contaFilt} onChange={e => setContaFilt(e.target.value)}
          style={{ height: 38, borderRadius: 6, border: `1.5px solid ${T.gray200}`, padding: '0 10px', fontSize: 13, background: '#fff', cursor: 'pointer', color: T.navy }}>
          <option value="all">Todas contas</option>
          {CONTAS_FIN.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6 }}>
          {([{ v: 'aberto', l: 'Em aberto' }, { v: 'all', l: 'Todos' }, { v: 'baixado', l: 'Baixados' }] as { v: typeof statusFilt; l: string }[]).map(opt => (
            <button key={opt.v} onClick={() => setStatusFilt(opt.v)}
              style={{ height: 38, padding: '0 12px', borderRadius: 6, border: `1.5px solid ${statusFilt === opt.v ? T.indigo : T.gray200}`, background: statusFilt === opt.v ? T.indigoLight : '#fff', fontSize: 12, fontWeight: statusFilt === opt.v ? 600 : 400, color: statusFilt === opt.v ? T.indigo : T.gray500, cursor: 'pointer' }}
            >{opt.l}</button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 0, border: `1.5px solid ${T.gray200}`, borderRadius: 6, overflow: 'hidden' }}>
          {([{ v: 'vencimento', l: 'Por vencimento' }, { v: 'pai', l: 'Agrupar por lançamento' }] as { v: typeof agrupar; l: string }[]).map(opt => (
            <button key={opt.v} onClick={() => setAgrupar(opt.v)}
              style={{ height: 38, padding: '0 12px', border: 'none', background: agrupar === opt.v ? T.indigoLight : '#fff', fontSize: 12, fontWeight: agrupar === opt.v ? 600 : 400, color: agrupar === opt.v ? T.indigo : T.gray500, cursor: 'pointer' }}
            >{opt.l}</button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div style={{ borderRadius: 10, border: `1px solid ${T.gray200}`, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {filtrados.length === 0
          ? <div style={{ padding: 64, textAlign: 'center' }}>
              <Icon name="wallet" size={36} color={T.gray400} />
              <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginTop: 12 }}>Nenhum lançamento</p>
              <p style={{ fontSize: 13, color: T.gray400, marginTop: 4 }}>Ajuste os filtros ou crie um novo lançamento.</p>
            </div>
          : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.gray50, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: T.gray500, borderBottom: `1px solid ${T.gray200}` }}>
                  <th style={{ padding: '11px 16px', textAlign: 'left' }}>Descrição / {tipo === 'receber' ? 'Pagador' : 'Favorecido'}</th>
                  <th style={{ padding: '11px 12px', textAlign: 'left', width: 170 }}>Categoria</th>
                  <th style={{ padding: '11px 12px', textAlign: 'center', width: 90 }}>Parcela</th>
                  <th style={{ padding: '11px 12px', textAlign: 'left', width: 120 }}>Conta</th>
                  <th style={{ padding: '11px 12px', textAlign: 'left', width: 160 }}>Vencimento</th>
                  <th style={{ padding: '11px 12px', textAlign: 'right', width: 120 }}>Valor</th>
                  <th style={{ padding: '11px 12px', textAlign: 'right', width: 120 }}>Juros est.</th>
                  <th style={{ padding: '11px 16px', textAlign: 'right', width: 130 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {grupos.map((grp) => {
                  if (agrupar === 'pai') {
                    const pai = grp[0]
                    const expand = expandedPais.has(pai.paiId)
                    const totalGrp = grp.reduce((a, l) => a + l.valor, 0)
                    const baixados = grp.filter(l => l.status === 'baixado').length
                    return (
                      <>
                        <tr key={pai.paiId + '-header'} style={{ borderTop: `1px solid ${T.gray100}`, background: T.gray50, cursor: 'pointer' }} onClick={() => togglePai(pai.paiId)}>
                          <td style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name={expand ? 'chevronDown' : 'chevronRight'} size={13} color={T.gray500} />
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{pai.descricao.replace(/ · \d+\/\d+$/, '')}</p>
                              <p style={{ fontSize: 11, color: T.gray500 }}>{pai.favorecido}</p>
                            </div>
                          </td>
                          <td colSpan={2} style={{ padding: '11px 12px', fontSize: 12, color: T.gray500 }}>{grp.length} parcela{grp.length === 1 ? '' : 's'} · {baixados} baixada{baixados === 1 ? '' : 's'}</td>
                          <td colSpan={3} style={{ padding: '11px 12px' }} />
                          <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: T.navy }}>{fmtBRL(totalGrp)}</td>
                          <td />
                        </tr>
                        {expand && grp.map(l => renderLinha(l, true))}
                      </>
                    )
                  }
                  return grp.map(l => renderLinha(l, false))
                })}
              </tbody>
            </table>
        }
      </div>

      {baixaModal && <ModalBaixa tipo={tipo} lanc={baixaModal} onClose={() => setBaixaModal(null)} onConfirm={confirmarBaixa} />}
      {novoModal && <ModalNovoLanc tipo={tipo} onClose={() => setNovoModal(false)} onCreate={criarLancamento} />}
    </div>
  )
}
