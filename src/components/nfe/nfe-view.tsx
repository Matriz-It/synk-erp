'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Cliente } from '@/components/clients/types'
import type { Produto } from '@/components/products/types'
import { listNfesAction, createNfeAction, type Nfe, type NFeStatus } from '@/app/actions/nfes'
import { listClientesAction } from '@/app/actions/clients'
import { listProductsAction } from '@/app/actions/products'

// ─── Design tokens ────────────────────────────────────────────────
const T = {
  indigo:      '#3D3EBF',
  indigoHover: '#3234A8',
  indigoLight: '#EEEEFF',
  navy:        '#0F172A',
  gray50:      '#F8FAFC',
  gray100:     '#F1F5F9',
  gray200:     '#E2E8F0',
  gray400:     '#94A3B8',
  gray500:     '#64748B',
  success:     '#16A34A',
  successBg:   '#F0FDF4',
  danger:      '#DC2626',
  dangerBg:    '#FEF2F2',
  warning:     '#D97706',
  warningBg:   '#FFFBEB',
}

// ─── Types ────────────────────────────────────────────────────────
interface NFeItem {
  id: number
  produtoId: string | number
  sku: string
  nome: string
  qtd: string | number
  preco: string | number
  desconto: string | number
  cfop: string
  cst: string
  bcICMS: string | number
  aliqICMS: string | number
}

interface Vencimento {
  id: number
  data: string
  valor: string
  obs: string
}

type NFeStatusFilter = 'autorizada' | 'rascunho' | 'rejeitada' | 'cancelada'

const NFE_STATUS: Record<NFeStatusFilter, { label: string; bg: string; color: string; dot: string }> = {
  autorizada: { label:'Autorizada', bg:T.successBg, color:T.success, dot:T.success },
  rascunho:   { label:'Rascunho',   bg:'#F1F5F9',   color:T.gray500, dot:T.gray400 },
  rejeitada:  { label:'Rejeitada',  bg:T.dangerBg,  color:T.danger,  dot:T.danger  },
  cancelada:  { label:'Cancelada',  bg:T.warningBg, color:T.warning, dot:T.warning },
}

const FINALIDADES = [
  { value:'NORMAL',       label:'NORMAL' },
  { value:'COMPLEMENTAR', label:'COMPLEMENTAR' },
  { value:'DEVOLUÇÃO',    label:'DEVOLUÇÃO' },
]

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const ABAS = [
  { id:'gerais',         label:'Dados Gerais',        icon:'idCard'    },
  { id:'itens',          label:'Itens da Nota',       icon:'package'   },
  { id:'valores',        label:'Valores da Nota',     icon:'wallet'    },
  { id:'dados',          label:'Dados da Nota',       icon:'building'  },
  { id:'observacao',     label:'Observação',          icon:'mail'      },
  { id:'vencimentos',    label:'Vencimentos',         icon:'calendar'  },
  { id:'complementares', label:'Dados Complementares',icon:'database'  },
  { id:'importacao',     label:'NFe Importação',      icon:'download'  },
  { id:'intermediador',  label:'Intermediador',       icon:'shield'    },
]

// ─── Helpers ──────────────────────────────────────────────────────
const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v)
const num = (v: string | number) => { const n = parseFloat(String(v).replace(',','.')); return isNaN(n) ? 0 : n }
const today = () => new Date().toISOString().slice(0,10)
const in30d = () => new Date(Date.now() + 30 * 864e5).toISOString().slice(0,10)
const padNum = (n: number) => String(n).padStart(6, '0')

// ─── UI helpers ───────────────────────────────────────────────────
function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:12, marginTop:4 }}>
      <span style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:T.gray500 }}>{children}</span>
      {hint && <span style={{ fontSize:11, color:T.gray400 }}>{hint}</span>}
      <span style={{ flex:1, height:1, background:T.gray200 }} />
    </div>
  )
}

function FieldNFE({
  label, value, onChange, err, mono, placeholder, type='text',
  readOnly, prefix, hint, span=1,
}: {
  label: string
  value: string | number
  onChange?: (v: string) => void
  err?: string
  mono?: boolean
  placeholder?: string
  type?: string
  readOnly?: boolean
  prefix?: string
  hint?: string
  span?: number
}) {
  const [foc, setFoc] = useState(false)
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5, gridColumn:`span ${span}` }}>
      <label style={{ fontSize:12, fontWeight:500, color:T.navy }}>{label}</label>
      <div style={{ position:'relative' }}>
        {prefix && (
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:12, color:T.gray400, pointerEvents:'none' }}>
            {prefix}
          </span>
        )}
        <input
          value={value ?? ''} type={type} readOnly={readOnly}
          placeholder={placeholder}
          onChange={e => onChange?.(e.target.value)}
          onFocus={() => setFoc(true)}
          onBlur={() => setFoc(false)}
          style={{
            width:'100%', height:38, borderRadius:6,
            border:`1.5px solid ${err ? T.danger : foc ? T.indigo : T.gray200}`,
            padding:'0 10px',
            paddingLeft: prefix ? 30 : 10,
            fontSize:13, outline:'none',
            fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit',
            background: readOnly ? T.gray50 : '#fff',
            color: readOnly ? T.gray500 : T.navy,
            boxShadow: foc ? `0 0 0 3px rgba(61,62,191,0.08)` : 'none',
            transition:'border 0.15s',
          }}
        />
      </div>
      {err && <p style={{ fontSize:11, color:T.danger }}>{err}</p>}
      {hint && !err && <p style={{ fontSize:11, color:T.gray400 }}>{hint}</p>}
    </div>
  )
}

function SelectNFE({
  label, value, onChange, options, err, span=1,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  err?: string
  span?: number
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5, gridColumn:`span ${span}` }}>
      <label style={{ fontSize:12, fontWeight:500, color:T.navy }}>{label}</label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          height:38, borderRadius:6,
          border:`1.5px solid ${err ? T.danger : T.gray200}`,
          padding:'0 10px', fontSize:13, fontFamily:'inherit',
          outline:'none', background:'#fff', cursor:'pointer', color:T.navy,
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {err && <p style={{ fontSize:11, color:T.danger }}>{err}</p>}
    </div>
  )
}

// ─── LIST PAGE ────────────────────────────────────────────────────
function NFeListPage({ onNova }: { onNova: () => void }) {
  const [nfes, setNfes]               = useState<Nfe[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilt, setStatusFilt]   = useState<'all' | NFeStatus>('all')

  useEffect(() => {
    listNfesAction().then(setNfes).finally(() => setLoading(false))
  }, [])

  const filtradas = nfes.filter(n => {
    const q = search.toLowerCase()
    const ms  = !q || n.cliente.toLowerCase().includes(q) || String(n.numero).includes(q) || n.clienteCnpj.includes(q)
    const mst = statusFilt === 'all' || n.status === statusFilt
    return ms && mst
  })

  const totalEmitido = nfes.filter(n => n.status === 'autorizada').reduce((a,n) => a + n.valorTotal, 0)
  const totalAutoriz = nfes.filter(n => n.status === 'autorizada').length
  const totalRascunh = nfes.filter(n => n.status === 'rascunho').length

  return (
    <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'DM Sans, sans-serif', fontSize:24, fontWeight:700, letterSpacing:'-0.4px', color:T.navy }}>Notas Fiscais Eletrônicas</h1>
          <p style={{ fontSize:14, color:T.gray500, marginTop:2 }}>{nfes.length} NF-e · {totalAutoriz} autorizadas · {totalRascunh} rascunhos</p>
        </div>
        <button
          onClick={onNova}
          style={{ height:40, display:'flex', alignItems:'center', gap:8, padding:'0 18px', borderRadius:6, border:'none', background:T.indigo, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = T.indigoHover)}
          onMouseLeave={e => (e.currentTarget.style.background = T.indigo)}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova NF-e
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total emitidas', value: nfes.length,      color:T.navy,    bg:'#fff'         },
          { label:'Autorizadas',    value: totalAutoriz,      color:T.success, bg:T.successBg    },
          { label:'Faturado (mês)', value: fmt(totalEmitido), color:T.indigo,  bg:T.indigoLight  },
          { label:'Rascunhos',      value: totalRascunh,      color:T.gray500, bg:T.gray50       },
        ].map(k => (
          <div key={k.label} style={{ padding:'14px 16px', borderRadius:10, border:`1px solid ${T.gray200}`, background:k.bg, boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em', color:T.gray400, marginBottom:4 }}>{k.label}</p>
            <p style={{ fontFamily:'DM Sans, sans-serif', fontSize: typeof k.value === 'string' ? 15 : 22, fontWeight:700, color:k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:220 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.gray400} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, nº da NF ou CNPJ..."
            style={{ width:'100%', height:38, borderRadius:6, border:`1px solid ${T.gray200}`, background:'#fff', paddingLeft:32, fontSize:13, outline:'none', fontFamily:'inherit' }}
            onFocus={e => { e.target.style.borderColor = T.indigo; e.target.style.boxShadow = `0 0 0 3px rgba(61,62,191,0.08)` }}
            onBlur={e => { e.target.style.borderColor = T.gray200; e.target.style.boxShadow = 'none' }}
          />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {([{ v:'all', l:'Todas' }, ...Object.entries(NFE_STATUS).map(([v,s]) => ({ v, l: s.label }))] as { v: string; l: string }[]).map(opt => (
            <button
              key={opt.v} onClick={() => setStatusFilt(opt.v as 'all' | NFeStatus)}
              style={{ height:34, padding:'0 12px', borderRadius:20, border:`1.5px solid ${statusFilt===opt.v ? T.indigo : T.gray200}`, background: statusFilt===opt.v ? T.indigoLight : '#fff', fontSize:12, fontWeight: statusFilt===opt.v ? 600 : 400, color: statusFilt===opt.v ? T.indigo : T.gray500, cursor:'pointer' }}
            >{opt.l}</button>
          ))}
        </div>
      </div>

      <div style={{ borderRadius:10, border:`1px solid ${T.gray200}`, background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:'64px', textAlign:'center' }}>
            <p style={{ fontSize:14, color:T.gray400 }}>Carregando...</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div style={{ padding:'64px', textAlign:'center' }}>
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={T.gray400} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p style={{ fontSize:15, fontWeight:600, color:T.navy, marginTop:12 }}>Nenhuma NF-e encontrada</p>
            <p style={{ fontSize:13, color:T.gray400, marginTop:4 }}>Ajuste os filtros ou emita uma nova nota.</p>
          </div>
        ) : (
          <>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:T.gray50, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:T.gray500, borderBottom:`1px solid ${T.gray200}` }}>
                  {['Nº / Série','Cliente','CNPJ/CPF','Emissão','Finalidade','Total','Status',''].map((h,i) => (
                    <th key={i} style={{ padding:'11px 18px', textAlign: i===5 ? 'right' : i===6 ? 'center' : 'left', fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map(n => {
                  const st = NFE_STATUS[n.status as NFeStatusFilter]
                  return (
                    <tr key={n.id}
                      style={{ borderTop:`1px solid ${T.gray100}`, cursor:'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = T.gray50)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding:'12px 18px' }}>
                        <p style={{ fontFamily:'JetBrains Mono, monospace', fontWeight:700, color:T.indigo }}>{padNum(n.numero)}</p>
                        <p style={{ fontSize:11, color:T.gray400 }}>Série {n.serie}</p>
                      </td>
                      <td style={{ padding:'12px 18px', fontWeight:500, color:T.navy }}>{n.cliente}</td>
                      <td style={{ padding:'12px 18px', fontFamily:'JetBrains Mono, monospace', fontSize:12, color:T.gray500 }}>{n.clienteCnpj}</td>
                      <td style={{ padding:'12px 18px', fontFamily:'JetBrains Mono, monospace', fontSize:12, color:T.gray500 }}>{n.dataEmissao}</td>
                      <td style={{ padding:'12px 18px' }}>
                        <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600, background:T.indigoLight, color:T.indigo, letterSpacing:'0.03em' }}>{n.finalidade}</span>
                      </td>
                      <td style={{ padding:'12px 18px', textAlign:'right', fontFamily:'JetBrains Mono, monospace', fontWeight:700, color:T.navy }}>{fmt(n.valorTotal)}</td>
                      <td style={{ padding:'12px 18px', textAlign:'center' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, borderRadius:4, padding:'3px 8px', fontSize:11, fontWeight:600, background:st?.bg, color:st?.color }}>
                          <span style={{ width:5, height:5, borderRadius:'50%', background:st?.dot }} />
                          {st?.label ?? n.status}
                        </span>
                      </td>
                      <td style={{ padding:'12px 18px', textAlign:'right' }}>
                        <button
                          style={{ height:30, padding:'0 10px', borderRadius:6, border:`1px solid ${T.gray200}`, background:'#fff', fontSize:12, fontWeight:500, color:T.indigo, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4 }}
                          onMouseEnter={e => { e.currentTarget.style.background = T.indigoLight; e.currentTarget.style.borderColor = T.indigo }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = T.gray200 }}
                        >
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          Ver
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ padding:'12px 18px', borderTop:`1px solid ${T.gray100}`, display:'flex', justifyContent:'space-between', background:T.gray50 }}>
              <span style={{ fontSize:12, color:T.gray400 }}>Mostrando {filtradas.length} de {nfes.length} NF-e</span>
              <span style={{ fontSize:12, color:T.gray400 }}>Total filtrado: <strong style={{ color:T.navy }}>{fmt(filtradas.reduce((a,n) => a + n.valorTotal, 0))}</strong></span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── NOVA NF-e FORM ───────────────────────────────────────────────
function NovaNFePage({ onVoltar }: { onVoltar: () => void }) {
  const [aba, setAba] = useState('gerais')

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => {
    listClientesAction().then(setClientes)
    listProductsAction().then(setProdutos)
  }, [])

  const [gerais, setGerais] = useState({
    serie:           '1',
    dataEmissao:     today(),
    dataSaida:       today(),
    naturezaOp:      'Venda de mercadoria',
    cfopPadrao:      '5102',
    finalidade:      'NORMAL',
    tipoNF:          'SAÍDA',
    operacao:        'NORMAL',
    tipoAtendimento: 'OPERAÇÃO NÃO PRESENCIAL',
    consumidorFinal: 'NÃO',
  })

  const [clienteSel, setClienteSel]     = useState<Cliente | null>(null)
  const [buscaCliente, setBuscaCliente] = useState('')
  const [showSugCli, setShowSugCli]     = useState(false)

  const [itens, setItens]               = useState<NFeItem[]>([])
  const [buscaProd, setBuscaProd]       = useState('')
  const [showSugProd, setShowSugProd]   = useState(false)

  const [valBaseIBS, setValBaseIBS]     = useState('')
  const [valBaseCBS, setValBaseCBS]     = useState('')
  const [valFrete,   setValFrete]       = useState('')
  const [valSeguro,  setValSeguro]      = useState('')
  const [valOutras,  setValOutras]      = useState('')
  const [valDesc,    setValDesc]        = useState('')

  const [dadosNota, setDadosNota] = useState({
    tipoFrete:      '9',
    transportadora: '',
    transpCNPJ:     '',
    placa:          '',
    ufPlaca:        'SP',
    pesoBruto:      '',
    pesoLiquido:    '',
    quantidade:     '',
    especie:        'CAIXA',
  })

  const [obsContrib, setObsContrib] = useState('')
  const [obsFisco,   setObsFisco]   = useState('')

  const [vencs, setVencs] = useState<Vencimento[]>([
    { id:1, data:in30d(), valor:'', obs:'' },
  ])

  const [complementares, setComplementares] = useState({
    infoContribuinte: '',
    infoFisco:        '',
    pedidoCompra:     '',
    contrato:         '',
  })

  const [importacao, setImportacao] = useState({
    docImportacao: '', dataReg: '', localDesemb: '', ufDesemb: 'SP', dataDesemb: '',
    viaTransp: '1', valorAFRMM: '', formaImport: '1',
  })

  const [intermed, setIntermed] = useState({
    indicador: 'SEM INTERMEDIADOR (SITE PRÓPRIO)',
    cnpj:      '',
    idIntermed:'',
  })

  const [salvando,      setSalvando]      = useState(false)
  const [errosGlobais,  setErrosGlobais]  = useState<string[]>([])

  // ─── Derivados ────────────────────────────────────────────────
  const totalProd      = itens.reduce((a,i) => a + num(i.qtd) * num(i.preco), 0)
  const totalDescItens = itens.reduce((a,i) => a + num(i.desconto), 0)
  const totalICMS      = itens.reduce((a,i) => a + (num(i.bcICMS) * num(i.aliqICMS) / 100), 0)
  const baseIBSn       = num(valBaseIBS)
  const baseCBSn       = num(valBaseCBS)
  const totalNF        = Math.max(0,
    totalProd - totalDescItens - num(valDesc)
    + num(valFrete) + num(valSeguro) + num(valOutras)
    + baseIBSn + baseCBSn
  )
  const totalVencs = vencs.reduce((a,v) => a + num(v.valor), 0)
  const diffVencs  = +(totalNF - totalVencs).toFixed(2)

  const clientesFiltrados = useMemo(() =>
    clientes.filter(c => c.ativo && (
      buscaCliente === '' ||
      c.razaoSocial.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      c.documento.includes(buscaCliente)
    )).slice(0, 6),
  [buscaCliente, clientes])

  const prodsFiltrados = useMemo(() =>
    produtos.filter(p => p.ativo && p.qtd > 0 && (
      buscaProd === '' ||
      p.nome.toLowerCase().includes(buscaProd.toLowerCase()) ||
      p.sku.toLowerCase().includes(buscaProd.toLowerCase())
    )).slice(0, 8),
  [buscaProd, produtos])

  // ─── Items ────────────────────────────────────────────────────
  function addItem(prod: Produto) {
    setItens(its => [...its, {
      id: Date.now(),
      produtoId: prod.id, sku: prod.sku, nome: prod.nome,
      qtd: 1, preco: prod.preco, desconto: 0,
      cfop: '5102', cst: '00',
      bcICMS: prod.preco, aliqICMS: 18,
    }])
    setBuscaProd(''); setShowSugProd(false)
  }
  function updItem(id: number, key: keyof NFeItem, val: string | number) {
    setItens(its => its.map(i => i.id === id ? { ...i, [key]: val } : i))
  }
  function rmItem(id: number) {
    setItens(its => its.filter(i => i.id !== id))
  }

  // ─── Vencimentos ──────────────────────────────────────────────
  function addVenc() {
    setVencs(vs => [...vs, { id: Date.now(), data: today(), valor:'', obs:'' }])
  }
  function updVenc(id: number, key: keyof Vencimento, val: string) {
    setVencs(vs => vs.map(v => v.id === id ? { ...v, [key]: val } : v))
  }
  function rmVenc(id: number) {
    setVencs(vs => vs.filter(v => v.id !== id))
  }
  function distribuirVencs() {
    if (vencs.length === 0) return
    const por = +(totalNF / vencs.length).toFixed(2)
    const ajuste = +(totalNF - por * vencs.length).toFixed(2)
    setVencs(vs => vs.map((v,i) => ({
      ...v,
      valor: String((i === vs.length - 1 ? por + ajuste : por).toFixed(2)).replace('.',','),
    })))
  }

  // ─── Validation ───────────────────────────────────────────────
  function validar() {
    const errs: string[] = []
    if (!['NORMAL','COMPLEMENTAR','DEVOLUÇÃO'].includes(gerais.finalidade))
      errs.push('Finalidade inválida — aceita apenas NORMAL, COMPLEMENTAR ou DEVOLUÇÃO.')
    if (!clienteSel) errs.push('Cliente é obrigatório.')
    if (itens.length === 0) errs.push('Adicione ao menos 1 item à nota.')
    if (totalNF <= 0) errs.push('Total da nota deve ser maior que zero.')
    itens.forEach((item, idx) => {
      if (num(item.qtd) <= 0) errs.push(`Item ${idx+1}: quantidade deve ser maior que zero.`)
      if (num(item.preco) < 0) errs.push(`Item ${idx+1}: preço unitário não pode ser negativo.`)
    })
    if (vencs.length > 0 && Math.abs(diffVencs) > 0.01)
      errs.push(`Soma dos vencimentos (${fmt(totalVencs)}) não confere com o total da nota (${fmt(totalNF)}). Diferença: ${fmt(Math.abs(diffVencs))}.`)
    return errs
  }

  async function salvar(comoRascunho: boolean) {
    if (!comoRascunho) {
      const errs = validar()
      if (errs.length) { setErrosGlobais(errs); return }
    }
    if (!clienteSel) { setErrosGlobais(['Cliente é obrigatório.']); return }
    setErrosGlobais([])
    setSalvando(true)
    try {
      await createNfeAction({
        clientId: clienteSel.id,
        dataEmissao: gerais.dataEmissao,
        dataSaida: gerais.dataSaida || undefined,
        naturezaOperacao: gerais.naturezaOp,
        finalidade: gerais.finalidade,
        serie: gerais.serie,
        status: 'rascunho',
        baseICMS: itens.reduce((a,i) => a + num(i.bcICMS), 0) || undefined,
        valorICMS: totalICMS || undefined,
        baseIBS: baseIBSn || undefined,
        valorCBS: baseCBSn || undefined,
        valorFrete: num(valFrete) || undefined,
        valorSeguro: num(valSeguro) || undefined,
        valorDesconto: (totalDescItens + num(valDesc)) || undefined,
        valorOutro: num(valOutras) || undefined,
        valorTotal: totalNF,
        modalidadeFrete: dadosNota.tipoFrete as '0'|'1'|'2'|'3'|'4'|'9',
        transportadora: dadosNota.transportadora || undefined,
        placaVeiculo: dadosNota.placa || undefined,
        pesoLiquido: num(dadosNota.pesoLiquido) || undefined,
        pesoBruto: num(dadosNota.pesoBruto) || undefined,
        qtdVolumes: num(dadosNota.quantidade) || undefined,
        especieVolumes: dadosNota.especie || undefined,
        obsContribuinte: obsContrib || undefined,
        obsFisco: obsFisco || undefined,
        numeroPedido: complementares.pedidoCompra || undefined,
        numeroContrato: complementares.contrato || undefined,
        items: itens.map(item => ({
          produtoId: String(item.produtoId) || undefined,
          sku: item.sku,
          nome: item.nome,
          qtd: num(item.qtd),
          preco: num(item.preco),
          desconto: num(item.desconto) || undefined,
          cfop: item.cfop,
          cst: item.cst,
          bcICMS: num(item.bcICMS) || undefined,
          aliqICMS: num(item.aliqICMS) || undefined,
          valorICMS: (num(item.bcICMS) * num(item.aliqICMS) / 100) || undefined,
        })),
        vencimentos: vencs.filter(v => num(v.valor) > 0).map(v => ({
          data: v.data,
          valor: num(v.valor),
          obs: v.obs || undefined,
        })),
      })
      onVoltar()
    } catch (err) {
      setErrosGlobais([err instanceof Error ? err.message : 'Erro ao salvar a NF-e.'])
    } finally {
      setSalvando(false)
    }
  }

  const errosCount = errosGlobais.length

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', flexDirection:'column', gap:18 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button
            onClick={onVoltar}
            style={{ width:36, height:36, borderRadius:8, border:`1px solid ${T.gray200}`, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.gray500 }}
            onMouseEnter={e => (e.currentTarget.style.background = T.gray50)}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <h1 style={{ fontFamily:'DM Sans, sans-serif', fontSize:22, fontWeight:700, color:T.navy }}>Nova NF-e</h1>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, borderRadius:4, padding:'3px 10px', fontSize:11, fontWeight:600, background:T.gray100, color:T.gray500 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:T.gray400 }} />Em edição
              </span>
              <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:4, fontSize:11, fontWeight:600, background:T.indigoLight, color:T.indigo, letterSpacing:'0.03em' }}>{gerais.finalidade}</span>
            </div>
            <p style={{ fontSize:13, color:T.gray500, marginTop:2 }}>
              Tipo: <strong>{gerais.tipoNF}</strong> · Operação: <strong>{gerais.operacao}</strong> · Atendimento: <strong>{gerais.tipoAtendimento}</strong>
            </p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={() => salvar(true)} disabled={salvando}
            style={{ height:38, padding:'0 14px', borderRadius:6, border:`1px solid ${T.gray200}`, background:'#fff', fontSize:13, fontWeight:500, color:T.navy, cursor:'pointer', opacity: salvando ? 0.7 : 1 }}
          >Salvar rascunho</button>
          <button
            onClick={() => salvar(false)} disabled={salvando}
            style={{ height:38, padding:'0 16px', borderRadius:6, border:'none', background:T.indigo, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', opacity: salvando ? 0.8 : 1 }}
            onMouseEnter={e => { if (!salvando) e.currentTarget.style.background = T.indigoHover }}
            onMouseLeave={e => { if (!salvando) e.currentTarget.style.background = T.indigo }}
          >
            {salvando ? 'Salvando...' : 'Emitir NF-e'}
          </button>
        </div>
      </div>

      {/* Global errors */}
      {errosCount > 0 && (
        <div style={{ padding:'12px 16px', borderRadius:10, border:`1px solid ${T.danger}30`, background:T.dangerBg }}>
          <p style={{ fontSize:13, fontWeight:600, color:T.danger, marginBottom:4 }}>
            {errosCount} {errosCount===1 ? 'problema impede' : 'problemas impedem'} a emissão:
          </p>
          <ul style={{ listStyle:'disc', paddingLeft:20, fontSize:12, color:T.danger, display:'flex', flexDirection:'column', gap:2 }}>
            {errosGlobais.map((e,i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, alignItems:'flex-start' }}>
        {/* Main column */}
        <div style={{ borderRadius:10, border:`1px solid ${T.gray200}`, background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', overflow:'hidden' }}>
          {/* Tabs */}
          <div style={{ display:'flex', overflowX:'auto', borderBottom:`1px solid ${T.gray200}`, background:T.gray50, scrollbarWidth:'none' }}>
            {ABAS.map(a => {
              const active = aba === a.id
              return (
                <button key={a.id} onClick={() => setAba(a.id)}
                  style={{
                    flexShrink:0, padding:'12px 16px', border:'none',
                    borderBottom: active ? `2px solid ${T.indigo}` : '2px solid transparent',
                    background:'transparent', cursor:'pointer',
                    display:'flex', alignItems:'center', gap:7,
                    fontSize:13, fontWeight: active ? 600 : 500,
                    color: active ? T.indigo : T.gray500,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = T.navy }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = T.gray500 }}
                >
                  {a.label}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div style={{ padding:'22px 24px' }}>

            {/* ── DADOS GERAIS ─────────────────────────────── */}
            {aba === 'gerais' && (
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <SectionTitle hint="Identificação fiscal e finalidade">Identificação</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
                  <FieldNFE label="Série" value={gerais.serie} onChange={v => setGerais(g => ({ ...g, serie:v }))} mono span={1} />
                  <FieldNFE label="Data emissão" value={gerais.dataEmissao} onChange={v => setGerais(g => ({ ...g, dataEmissao:v }))} type="date" span={2} />
                  <FieldNFE label="Data saída/entrada" value={gerais.dataSaida} onChange={v => setGerais(g => ({ ...g, dataSaida:v }))} type="date" span={2} />
                  <FieldNFE label="Natureza da operação" value={gerais.naturezaOp} onChange={v => setGerais(g => ({ ...g, naturezaOp:v }))} span={4} />
                  <FieldNFE label="CFOP padrão" value={gerais.cfopPadrao} onChange={v => setGerais(g => ({ ...g, cfopPadrao:v }))} mono span={2} />
                </div>

                <SectionTitle hint="Finalidade aceita apenas NORMAL · COMPLEMENTAR · DEVOLUÇÃO">Finalidade & Tipo</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
                  <SelectNFE label="Finalidade *" value={gerais.finalidade}
                    onChange={v => setGerais(g => ({ ...g, finalidade:v }))}
                    options={FINALIDADES} span={2}
                  />
                  <SelectNFE label="Tipo da NF" value={gerais.tipoNF}
                    onChange={v => setGerais(g => ({ ...g, tipoNF:v }))}
                    options={[{ value:'SAÍDA', label:'SAÍDA' },{ value:'ENTRADA', label:'ENTRADA' }]} span={2}
                  />
                  <SelectNFE label="Operação" value={gerais.operacao}
                    onChange={v => setGerais(g => ({ ...g, operacao:v }))}
                    options={[{ value:'NORMAL', label:'NORMAL' },{ value:'CONSUMIDOR', label:'CONSUMIDOR' }]} span={2}
                  />
                  <SelectNFE label="Tipo de atendimento" value={gerais.tipoAtendimento}
                    onChange={v => setGerais(g => ({ ...g, tipoAtendimento:v }))}
                    options={[
                      { value:'OPERAÇÃO NÃO PRESENCIAL', label:'OPERAÇÃO NÃO PRESENCIAL' },
                      { value:'OPERAÇÃO PRESENCIAL', label:'OPERAÇÃO PRESENCIAL' },
                      { value:'OUTROS', label:'OUTROS' },
                    ]} span={3}
                  />
                  <SelectNFE label="Consumidor final" value={gerais.consumidorFinal}
                    onChange={v => setGerais(g => ({ ...g, consumidorFinal:v }))}
                    options={[{ value:'NÃO', label:'NÃO' },{ value:'SIM', label:'SIM' }]} span={3}
                  />
                </div>

                <SectionTitle hint="Cliente da nota — busca por razão social ou CNPJ">Destinatário</SectionTitle>
                {clienteSel ? (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderRadius:8, border:`1px solid ${T.indigo}30`, background:T.indigoLight }}>
                    <div style={{ width:42, height:42, borderRadius:8, background:T.indigo, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14, flexShrink:0 }}>
                      {clienteSel.razaoSocial.split(' ').slice(0,2).map(s => s[0]).join('').toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:600, color:T.navy }}>{clienteSel.razaoSocial}</p>
                      <p style={{ fontSize:12, color:T.gray500, marginTop:2 }}>
                        <span style={{ fontFamily:'JetBrains Mono, monospace' }}>{clienteSel.documento}</span>
                        {' · '}{clienteSel.cidade}/{clienteSel.uf}
                      </p>
                    </div>
                    <button onClick={() => { setClienteSel(null); setBuscaCliente('') }}
                      style={{ height:34, padding:'0 12px', borderRadius:6, border:`1px solid ${T.gray200}`, background:'#fff', fontSize:12, fontWeight:500, color:T.gray500, cursor:'pointer' }}
                    >Trocar</button>
                  </div>
                ) : (
                  <div style={{ position:'relative' }}>
                    <input
                      value={buscaCliente}
                      onChange={e => { setBuscaCliente(e.target.value); setShowSugCli(true) }}
                      onFocus={() => setShowSugCli(true)}
                      onBlur={() => setTimeout(() => setShowSugCli(false), 150)}
                      placeholder="Buscar cliente por razão social ou CNPJ..."
                      style={{ width:'100%', height:42, borderRadius:8, border:`1.5px solid ${T.gray200}`, padding:'0 14px', fontSize:13, outline:'none', fontFamily:'inherit' }}
                    />
                    {showSugCli && clientesFiltrados.length > 0 && (
                      <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:20, background:'#fff', border:`1px solid ${T.gray200}`, borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.08)', maxHeight:280, overflowY:'auto' }}>
                        {clientesFiltrados.map(c => (
                          <button key={c.id}
                            onMouseDown={() => { setClienteSel(c); setBuscaCliente(''); setShowSugCli(false) }}
                            style={{ width:'100%', padding:'10px 14px', border:'none', background:'#fff', borderBottom:`1px solid ${T.gray100}`, cursor:'pointer', textAlign:'left', display:'flex', gap:10, alignItems:'center' }}
                            onMouseEnter={e => (e.currentTarget.style.background = T.gray50)}
                            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                          >
                            <span style={{ width:30, height:30, borderRadius:6, background:T.indigoLight, display:'flex', alignItems:'center', justifyContent:'center', color:T.indigo, fontWeight:700, fontSize:11, flexShrink:0 }}>
                              {c.tipo}
                            </span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:13, fontWeight:500, color:T.navy }}>{c.razaoSocial}</p>
                              <p style={{ fontSize:11, color:T.gray500, fontFamily:'JetBrains Mono, monospace' }}>{c.documento} · {c.cidade}/{c.uf}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── ITENS DA NOTA ──────────────────────────── */}
            {aba === 'itens' && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <SectionTitle hint="Produto, quantidade, preço, CFOP, CST, BC ICMS, alíquota">Produtos da nota</SectionTitle>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.gray400} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input
                    value={buscaProd}
                    onChange={e => { setBuscaProd(e.target.value); setShowSugProd(true) }}
                    onFocus={() => setShowSugProd(true)}
                    onBlur={() => setTimeout(() => setShowSugProd(false), 150)}
                    placeholder="Buscar produto por nome ou SKU para adicionar..."
                    style={{ width:'100%', height:40, borderRadius:8, border:`1.5px solid ${T.gray200}`, paddingLeft:36, paddingRight:14, fontSize:13, outline:'none', fontFamily:'inherit' }}
                  />
                  {showSugProd && prodsFiltrados.length > 0 && (
                    <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:20, background:'#fff', border:`1px solid ${T.gray200}`, borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.08)', maxHeight:280, overflowY:'auto' }}>
                      {prodsFiltrados.map(p => (
                        <button key={p.id}
                          onMouseDown={() => addItem(p)}
                          style={{ width:'100%', padding:'10px 14px', border:'none', background:'#fff', borderBottom:`1px solid ${T.gray100}`, cursor:'pointer', textAlign:'left', display:'flex', gap:10, alignItems:'center' }}
                          onMouseEnter={e => (e.currentTarget.style.background = T.gray50)}
                          onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                        >
                          <span style={{ width:32, height:32, borderRadius:6, background:T.indigoLight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.indigo} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                          </span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:500, color:T.navy }}>{p.nome}</p>
                            <p style={{ fontSize:11, color:T.gray500, fontFamily:'JetBrains Mono, monospace' }}>{p.sku} · estoque: {p.qtd} · {fmt(p.preco)}</p>
                          </div>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.indigo} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {itens.length === 0 ? (
                  <div style={{ padding:'40px', textAlign:'center', background:T.gray50, borderRadius:10, border:`1px dashed ${T.gray200}` }}>
                    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={T.gray400} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ margin:'0 auto' }}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                    <p style={{ fontSize:13, color:T.gray400, marginTop:8 }}>Nenhum item adicionado. Busque um produto acima para começar.</p>
                  </div>
                ) : (
                  <div style={{ border:`1px solid ${T.gray200}`, borderRadius:10, overflow:'hidden' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                      <thead>
                        <tr style={{ background:T.gray50, fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:T.gray500 }}>
                          {['Produto','Qtd','Preço un.','Desc.','CFOP','CST','BC ICMS','Alíq %','Total',''].map((h,i) => (
                            <th key={i} style={{ padding:'10px 8px', textAlign: [2,3,6,8].includes(i) ? 'right' : i===4||i===5||i===7 ? 'center' : 'left', fontWeight:600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {itens.map(item => {
                          const linha = num(item.qtd) * num(item.preco) - num(item.desconto)
                          const inpStyle: React.CSSProperties = { width:'100%', height:32, borderRadius:5, border:`1px solid ${T.gray200}`, padding:'0 6px', fontSize:12, fontFamily:'JetBrains Mono, monospace', outline:'none' }
                          return (
                            <tr key={item.id} style={{ borderTop:`1px solid ${T.gray100}` }}>
                              <td style={{ padding:'8px 8px' }}>
                                <p style={{ fontSize:12, fontWeight:600, color:T.navy }}>{item.nome}</p>
                                <p style={{ fontSize:10, color:T.gray400, fontFamily:'JetBrains Mono, monospace' }}>{item.sku}</p>
                              </td>
                              <td style={{ padding:'6px 4px' }}>
                                <input value={item.qtd} onChange={e => updItem(item.id,'qtd',e.target.value)} inputMode="decimal" style={{ ...inpStyle, textAlign:'center', width:56 }} />
                              </td>
                              <td style={{ padding:'6px 4px' }}>
                                <input value={item.preco} onChange={e => updItem(item.id,'preco',e.target.value)} inputMode="decimal" style={{ ...inpStyle, textAlign:'right', width:88 }} />
                              </td>
                              <td style={{ padding:'6px 4px' }}>
                                <input value={item.desconto} onChange={e => updItem(item.id,'desconto',e.target.value)} inputMode="decimal" style={{ ...inpStyle, textAlign:'right', width:72 }} />
                              </td>
                              <td style={{ padding:'6px 4px' }}>
                                <input value={item.cfop} onChange={e => updItem(item.id,'cfop',e.target.value)} style={{ ...inpStyle, textAlign:'center', width:56 }} />
                              </td>
                              <td style={{ padding:'6px 4px' }}>
                                <input value={item.cst} onChange={e => updItem(item.id,'cst',e.target.value)} style={{ ...inpStyle, textAlign:'center', width:48 }} />
                              </td>
                              <td style={{ padding:'6px 4px' }}>
                                <input value={item.bcICMS} onChange={e => updItem(item.id,'bcICMS',e.target.value)} inputMode="decimal" style={{ ...inpStyle, textAlign:'right', width:88 }} />
                              </td>
                              <td style={{ padding:'6px 4px' }}>
                                <input value={item.aliqICMS} onChange={e => updItem(item.id,'aliqICMS',e.target.value)} inputMode="decimal" style={{ ...inpStyle, textAlign:'center', width:56 }} />
                              </td>
                              <td style={{ padding:'8px 6px', textAlign:'right', fontFamily:'JetBrains Mono, monospace', fontWeight:700, color:T.navy }}>{fmt(Math.max(0,linha))}</td>
                              <td style={{ padding:'6px' }}>
                                <button onClick={() => rmItem(item.id)}
                                  style={{ width:30, height:30, borderRadius:6, border:'none', background:'transparent', color:T.gray400, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = T.dangerBg; e.currentTarget.style.color = T.danger }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.gray400 }}
                                >
                                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ background:T.gray50, borderTop:`1px solid ${T.gray200}` }}>
                          <td colSpan={8} style={{ padding:'10px 8px', textAlign:'right', fontSize:11, fontWeight:600, color:T.gray500, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                            ICMS calculado: <span style={{ fontFamily:'JetBrains Mono, monospace', color:T.navy }}>{fmt(totalICMS)}</span>
                          </td>
                          <td style={{ padding:'10px 6px', textAlign:'right', fontFamily:'JetBrains Mono, monospace', fontWeight:700, color:T.indigo, fontSize:13 }}>{fmt(totalProd - totalDescItens)}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── VALORES DA NOTA ─────────────────────────── */}
            {aba === 'valores' && (
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <SectionTitle hint="Tributos calculados a partir dos itens">Resumo de impostos</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  {[
                    { label:'Total dos produtos', value:fmt(totalProd),                             color:T.navy },
                    { label:'Descontos itens',    value:fmt(totalDescItens),                        color:T.danger },
                    { label:'Base de cálc. ICMS', value:fmt(itens.reduce((a,i)=>a+num(i.bcICMS),0)), color:T.navy },
                    { label:'Valor ICMS',          value:fmt(totalICMS),                            color:T.indigo },
                  ].map(s => (
                    <div key={s.label} style={{ padding:'12px 14px', borderRadius:8, background:T.gray50, border:`1px solid ${T.gray200}` }}>
                      <p style={{ fontSize:10, fontWeight:600, color:T.gray400, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>{s.label}</p>
                      <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:16, fontWeight:700, color:s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <SectionTitle hint="IBS e CBS — entram no cálculo do total da nota">Reforma Tributária — Bases IBS / CBS</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
                  <FieldNFE label="Valor Base IBS" value={valBaseIBS} onChange={setValBaseIBS} mono prefix="R$" placeholder="0,00" hint="Imposto sobre Bens e Serviços (estadual/municipal)" />
                  <FieldNFE label="Valor Base CBS" value={valBaseCBS} onChange={setValBaseCBS} mono prefix="R$" placeholder="0,00" hint="Contribuição sobre Bens e Serviços (federal)" />
                </div>

                <SectionTitle>Outros valores</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  <FieldNFE label="Valor frete"     value={valFrete}  onChange={setValFrete}  mono prefix="R$" placeholder="0,00" />
                  <FieldNFE label="Valor seguro"    value={valSeguro} onChange={setValSeguro} mono prefix="R$" placeholder="0,00" />
                  <FieldNFE label="Outras despesas" value={valOutras} onChange={setValOutras} mono prefix="R$" placeholder="0,00" />
                  <FieldNFE label="Desconto geral"  value={valDesc}   onChange={setValDesc}   mono prefix="R$" placeholder="0,00" />
                </div>

                <div style={{ display:'flex', gap:10, padding:'10px 14px', borderRadius:8, background:T.indigoLight, border:`1px solid ${T.indigo}20` }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.indigo} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p style={{ fontSize:12, color:T.indigo, lineHeight:1.5 }}>
                    A antiga seção <strong>&ldquo;Valores Cliente Consumidor Final — Fora do Estado&rdquo;</strong> foi removida.
                    O recolhimento interestadual passa a ser representado pelas bases <strong>IBS</strong> e <strong>CBS</strong> acima.
                  </p>
                </div>
              </div>
            )}

            {/* ── DADOS DA NOTA (transporte) ────────────── */}
            {aba === 'dados' && (
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <SectionTitle hint="Modalidade do frete e responsável">Transporte</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
                  <SelectNFE label="Tipo de frete" value={dadosNota.tipoFrete}
                    onChange={v => setDadosNota(d => ({ ...d, tipoFrete:v }))} span={3}
                    options={[
                      { value:'0', label:'0 — Por conta do emitente' },
                      { value:'1', label:'1 — Por conta do destinatário' },
                      { value:'2', label:'2 — Por conta de terceiros' },
                      { value:'3', label:'3 — Transporte próprio (remetente)' },
                      { value:'4', label:'4 — Transporte próprio (destinatário)' },
                      { value:'9', label:'9 — Sem frete' },
                    ]}
                  />
                  <FieldNFE label="Transportadora" value={dadosNota.transportadora} onChange={v => setDadosNota(d => ({ ...d, transportadora:v }))} placeholder="Razão social" span={3} />
                  <FieldNFE label="CNPJ transportadora" value={dadosNota.transpCNPJ} onChange={v => setDadosNota(d => ({ ...d, transpCNPJ:v }))} mono placeholder="00.000.000/0000-00" span={2} />
                  <FieldNFE label="Placa do veículo" value={dadosNota.placa} onChange={v => setDadosNota(d => ({ ...d, placa:v.toUpperCase() }))} mono placeholder="ABC-1D23" span={2} />
                  <SelectNFE label="UF da placa" value={dadosNota.ufPlaca}
                    onChange={v => setDadosNota(d => ({ ...d, ufPlaca:v }))}
                    options={ESTADOS.map(uf => ({ value:uf, label:uf }))} span={2}
                  />
                </div>
                <SectionTitle hint="Volumes e peso">Volumes</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  <FieldNFE label="Quantidade"        value={dadosNota.quantidade}  onChange={v => setDadosNota(d => ({ ...d, quantidade:v }))}  mono placeholder="0" />
                  <FieldNFE label="Espécie"           value={dadosNota.especie}     onChange={v => setDadosNota(d => ({ ...d, especie:v }))}     placeholder="CAIXA, PALLET..." />
                  <FieldNFE label="Peso bruto (kg)"   value={dadosNota.pesoBruto}   onChange={v => setDadosNota(d => ({ ...d, pesoBruto:v }))}   mono placeholder="0,000" />
                  <FieldNFE label="Peso líquido (kg)" value={dadosNota.pesoLiquido} onChange={v => setDadosNota(d => ({ ...d, pesoLiquido:v }))} mono placeholder="0,000" />
                </div>
              </div>
            )}

            {/* ── OBSERVAÇÃO ─────────────────────────────── */}
            {aba === 'observacao' && (
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <SectionTitle hint="Texto livre — aparece na DANFE">Informações ao contribuinte</SectionTitle>
                <textarea
                  value={obsContrib} onChange={e => setObsContrib(e.target.value)} rows={5}
                  placeholder="Ex.: Mercadoria entregue conforme pedido nº 1082. Validade do produto: 12 meses..."
                  style={{ width:'100%', borderRadius:8, border:`1.5px solid ${T.gray200}`, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', lineHeight:1.5 }}
                />
                <SectionTitle hint="Visível ao Fisco — uso restrito">Informações ao fisco</SectionTitle>
                <textarea
                  value={obsFisco} onChange={e => setObsFisco(e.target.value)} rows={3}
                  placeholder="Texto reservado a observações fiscais..."
                  style={{ width:'100%', borderRadius:8, border:`1.5px solid ${T.gray200}`, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', lineHeight:1.5 }}
                />
              </div>
            )}

            {/* ── VENCIMENTOS ────────────────────────────── */}
            {aba === 'vencimentos' && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <SectionTitle hint="A soma deve coincidir com o total da nota">Parcelas de cobrança</SectionTitle>
                <div style={{ border:`1px solid ${T.gray200}`, borderRadius:10, overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ background:T.gray50, fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:T.gray500 }}>
                        <th style={{ padding:'10px 12px', textAlign:'left', width:40 }}>#</th>
                        <th style={{ padding:'10px 12px', textAlign:'left', width:160 }}>Data de vencimento</th>
                        <th style={{ padding:'10px 12px', textAlign:'right', width:140 }}>Valor</th>
                        <th style={{ padding:'10px 12px', textAlign:'left' }}>Observação</th>
                        <th style={{ width:40 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {vencs.map((v, idx) => (
                        <tr key={v.id} style={{ borderTop:`1px solid ${T.gray100}` }}>
                          <td style={{ padding:'8px 12px', fontFamily:'JetBrains Mono, monospace', color:T.gray500 }}>{String(idx+1).padStart(2,'0')}</td>
                          <td style={{ padding:'8px 12px' }}>
                            <input type="date" value={v.data} onChange={e => updVenc(v.id,'data',e.target.value)}
                              style={{ width:'100%', height:34, borderRadius:5, border:`1px solid ${T.gray200}`, padding:'0 8px', fontSize:12, fontFamily:'JetBrains Mono, monospace', outline:'none' }} />
                          </td>
                          <td style={{ padding:'8px 12px' }}>
                            <input value={v.valor} onChange={e => updVenc(v.id,'valor',e.target.value)} inputMode="decimal" placeholder="0,00"
                              style={{ width:'100%', height:34, borderRadius:5, border:`1px solid ${T.gray200}`, padding:'0 8px', fontSize:12, fontFamily:'JetBrains Mono, monospace', textAlign:'right', outline:'none' }} />
                          </td>
                          <td style={{ padding:'8px 12px' }}>
                            <input value={v.obs} onChange={e => updVenc(v.id,'obs',e.target.value)} placeholder="(opcional)"
                              style={{ width:'100%', height:34, borderRadius:5, border:`1px solid ${T.gray200}`, padding:'0 8px', fontSize:12, outline:'none', fontFamily:'inherit' }} />
                          </td>
                          <td style={{ padding:'8px 12px' }}>
                            <button onClick={() => rmVenc(v.id)}
                              style={{ width:30, height:30, borderRadius:6, border:'none', background:'transparent', color:T.gray400, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                              onMouseEnter={e => { e.currentTarget.style.background = T.dangerBg; e.currentTarget.style.color = T.danger }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.gray400 }}
                            >
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={addVenc}
                    style={{ height:36, padding:'0 14px', borderRadius:6, border:`1px dashed ${T.gray400}`, background:'#fff', fontSize:12, fontWeight:500, color:T.indigo, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.indigoLight; e.currentTarget.style.borderColor = T.indigo }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = T.gray400 }}
                  >
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Adicionar parcela
                  </button>
                  <button onClick={distribuirVencs}
                    style={{ height:36, padding:'0 14px', borderRadius:6, border:`1px solid ${T.gray200}`, background:'#fff', fontSize:12, fontWeight:500, color:T.navy, cursor:'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = T.gray50)}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >Distribuir total em {vencs.length} parcela{vencs.length === 1 ? '' : 's'}</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                  {[
                    { label:'Total da nota',    value:fmt(totalNF),    ok:true  },
                    { label:'Soma das parcelas',value:fmt(totalVencs), ok:true  },
                    { label:'Diferença',        value:fmt(diffVencs),  ok:Math.abs(diffVencs)<0.01 },
                  ].map((c,i) => (
                    <div key={i} style={{ padding:'12px 14px', borderRadius:8, background: i===2 ? (c.ok ? T.successBg : T.warningBg) : T.gray50, border:`1px solid ${i===2 ? (c.ok ? T.success : T.warning)+'40' : T.gray200}` }}>
                      <p style={{ fontSize:10, fontWeight:600, color: i===2 ? (c.ok ? T.success : T.warning) : T.gray400, textTransform:'uppercase', letterSpacing:'0.05em' }}>{c.label}</p>
                      <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:15, fontWeight:700, color: i===2 ? (c.ok ? T.success : T.warning) : T.navy, marginTop:2 }}>
                        {i===2 && c.ok ? '✓ ' : ''}{c.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── DADOS COMPLEMENTARES ─────────────────── */}
            {aba === 'complementares' && (
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <SectionTitle hint="Apenas campos editáveis na inclusão manual">Informações complementares</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
                  <FieldNFE label="Pedido de compra" value={complementares.pedidoCompra}
                    onChange={v => setComplementares(c => ({ ...c, pedidoCompra:v }))} placeholder="Nº do pedido do cliente" />
                  <FieldNFE label="Contrato" value={complementares.contrato}
                    onChange={v => setComplementares(c => ({ ...c, contrato:v }))} placeholder="Nº do contrato (se houver)" />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:12, fontWeight:500, color:T.navy }}>Informações complementares de interesse do contribuinte</label>
                  <textarea value={complementares.infoContribuinte}
                    onChange={e => setComplementares(c => ({ ...c, infoContribuinte:e.target.value }))} rows={3}
                    placeholder="Texto livre..."
                    style={{ width:'100%', borderRadius:8, border:`1.5px solid ${T.gray200}`, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', lineHeight:1.5 }} />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:12, fontWeight:500, color:T.navy }}>Informações complementares de interesse do fisco</label>
                  <textarea value={complementares.infoFisco}
                    onChange={e => setComplementares(c => ({ ...c, infoFisco:e.target.value }))} rows={3}
                    placeholder="Texto livre..."
                    style={{ width:'100%', borderRadius:8, border:`1.5px solid ${T.gray200}`, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', lineHeight:1.5 }} />
                </div>
                <div style={{ display:'flex', gap:10, padding:'12px 14px', borderRadius:8, background:T.gray50, border:`1px solid ${T.gray200}` }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.gray500} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:T.navy, marginBottom:2 }}>Campos automáticos da SEFAZ</p>
                    <p style={{ fontSize:11, color:T.gray500, lineHeight:1.5 }}>
                      <strong>Chave de Acesso</strong>, <strong>Protocolo</strong>, <strong>Recibo</strong> e <strong>Local do Arquivo XML</strong> são gerados automaticamente após a autorização e não podem ser preenchidos manualmente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── NFe IMPORTAÇÃO ─────────────────────────── */}
            {aba === 'importacao' && (
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <SectionTitle hint="Preencher apenas para mercadorias importadas">Declaração de importação</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  <FieldNFE label="Documento de importação" value={importacao.docImportacao}
                    onChange={v => setImportacao(i => ({ ...i, docImportacao:v }))} mono placeholder="DI / DSI" span={2} />
                  <FieldNFE label="Data de registro" value={importacao.dataReg}
                    onChange={v => setImportacao(i => ({ ...i, dataReg:v }))} type="date" span={1} />
                  <FieldNFE label="Data desembaraço" value={importacao.dataDesemb}
                    onChange={v => setImportacao(i => ({ ...i, dataDesemb:v }))} type="date" span={1} />
                  <FieldNFE label="Local do desembaraço" value={importacao.localDesemb}
                    onChange={v => setImportacao(i => ({ ...i, localDesemb:v }))} placeholder="Ex.: Porto de Santos" span={3} />
                  <SelectNFE label="UF desembaraço" value={importacao.ufDesemb}
                    onChange={v => setImportacao(i => ({ ...i, ufDesemb:v }))}
                    options={ESTADOS.map(uf => ({ value:uf, label:uf }))} span={1} />
                  <SelectNFE label="Via de transporte" value={importacao.viaTransp}
                    onChange={v => setImportacao(i => ({ ...i, viaTransp:v }))} span={2}
                    options={[
                      { value:'1', label:'1 — Marítima' },{ value:'2', label:'2 — Fluvial' },
                      { value:'3', label:'3 — Lacustre' },{ value:'4', label:'4 — Aérea' },
                      { value:'5', label:'5 — Postal' }, { value:'6', label:'6 — Ferroviária' },
                      { value:'7', label:'7 — Rodoviária' },
                    ]} />
                  <FieldNFE label="Valor AFRMM" value={importacao.valorAFRMM}
                    onChange={v => setImportacao(i => ({ ...i, valorAFRMM:v }))} mono prefix="R$" placeholder="0,00" span={2} />
                </div>
              </div>
            )}

            {/* ── INTERMEDIADOR ──────────────────────────── */}
            {aba === 'intermediador' && (
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <SectionTitle hint="Plataforma intermediadora da venda (marketplace), se aplicável">Intermediador da transação</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  <SelectNFE label="Indicador" value={intermed.indicador}
                    onChange={v => setIntermed(i => ({ ...i, indicador:v }))} span={4}
                    options={[
                      { value:'SEM INTERMEDIADOR (SITE PRÓPRIO)', label:'SEM INTERMEDIADOR (SITE PRÓPRIO)' },
                      { value:'OPERAÇÃO COM INTERMEDIADOR (MARKETPLACE)', label:'OPERAÇÃO COM INTERMEDIADOR (MARKETPLACE)' },
                    ]} />
                  <FieldNFE label="CNPJ do intermediador" value={intermed.cnpj}
                    onChange={v => setIntermed(i => ({ ...i, cnpj:v }))} mono placeholder="00.000.000/0000-00" span={2} />
                  <FieldNFE label="Identificador no intermediador" value={intermed.idIntermed}
                    onChange={v => setIntermed(i => ({ ...i, idIntermed:v }))} mono placeholder="login / código" span={2} />
                </div>
                <div style={{ display:'flex', gap:10, padding:'12px 14px', borderRadius:8, background:T.indigoLight, border:`1px solid ${T.indigo}20` }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.indigo} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <p style={{ fontSize:12, color:T.indigo, lineHeight:1.5 }}>
                    Padrão da operação: <strong>SEM INTERMEDIADOR (SITE PRÓPRIO)</strong>. Altere apenas se a venda foi realizada por marketplace ou plataforma de terceiros.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ─── Sidebar resumo ───────────────────────────────────── */}
        <div style={{ position:'sticky', top:20, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ borderRadius:10, border:`1px solid ${T.gray200}`, background:'#fff', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.gray100}`, background:T.gray50, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontFamily:'DM Sans, sans-serif', fontSize:14, fontWeight:600, color:T.navy }}>Resumo da NF-e</h3>
              <span style={{ fontSize:11, fontWeight:600, color:T.gray400, fontFamily:'JetBrains Mono, monospace' }}>Série {gerais.serie}</span>
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:9 }}>
              {[
                { label:`Subtotal (${itens.length} ${itens.length===1?'item':'itens'})`, val:fmt(totalProd) },
                ...(totalDescItens > 0 ? [{ label:'Descontos por item', val:`-${fmt(totalDescItens)}`, neg:true }] : []),
                ...(num(valDesc)   > 0 ? [{ label:'Desconto geral',     val:`-${fmt(num(valDesc))}`,  neg:true }] : []),
                ...(num(valFrete)  > 0 ? [{ label:'Frete',              val:fmt(num(valFrete))                 }] : []),
                ...(num(valSeguro) > 0 ? [{ label:'Seguro',             val:fmt(num(valSeguro))                }] : []),
                ...(num(valOutras) > 0 ? [{ label:'Outras despesas',    val:fmt(num(valOutras))                }] : []),
                ...(baseIBSn       > 0 ? [{ label:'Base IBS',           val:fmt(baseIBSn), highlight:true      }] : []),
                ...(baseCBSn       > 0 ? [{ label:'Base CBS',           val:fmt(baseCBSn), highlight:true      }] : []),
              ].map((row, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, color: (row as { neg?: boolean }).neg ? T.danger : (row as { highlight?: boolean }).highlight ? T.indigo : T.gray500 }}>
                  <span>{row.label}</span>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontWeight: (row as { highlight?: boolean }).highlight ? 600 : 500, color: (row as { neg?: boolean }).neg ? T.danger : (row as { highlight?: boolean }).highlight ? T.indigo : T.navy }}>{row.val}</span>
                </div>
              ))}
              <div style={{ height:1, background:T.gray200, margin:'4px 0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:14, fontWeight:600, color:T.navy }}>Total da NF-e</span>
                <span style={{ fontFamily:'DM Sans, sans-serif', fontSize:22, fontWeight:700, color:T.indigo }}>{fmt(totalNF)}</span>
              </div>

              {!clienteSel && (
                <div style={{ padding:'8px 10px', borderRadius:6, background:T.warningBg, border:`1px solid ${T.warning}30`, display:'flex', gap:7, alignItems:'flex-start', marginTop:6 }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={T.warning} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginTop:1, flexShrink:0 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <p style={{ fontSize:11.5, color:T.warning, fontWeight:500 }}>Selecione um cliente.</p>
                </div>
              )}
              {itens.length === 0 && (
                <div style={{ padding:'8px 10px', borderRadius:6, background:T.warningBg, border:`1px solid ${T.warning}30`, display:'flex', gap:7, alignItems:'flex-start' }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={T.warning} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginTop:1, flexShrink:0 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <p style={{ fontSize:11.5, color:T.warning, fontWeight:500 }}>Adicione ao menos 1 item.</p>
                </div>
              )}
              {vencs.length > 0 && Math.abs(diffVencs) > 0.01 && (
                <div style={{ padding:'8px 10px', borderRadius:6, background:T.warningBg, border:`1px solid ${T.warning}30`, display:'flex', gap:7, alignItems:'flex-start' }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={T.warning} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginTop:1, flexShrink:0 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <p style={{ fontSize:11.5, color:T.warning, fontWeight:500 }}>Vencimentos não batem com o total ({fmt(diffVencs)}).</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderRadius:10, border:`1px solid ${T.gray200}`, background:'#fff', padding:'14px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize:11, fontWeight:600, color:T.gray500, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Padrões da operação</p>
            <div style={{ display:'flex', flexDirection:'column', gap:7, fontSize:12 }}>
              {[
                { l:'Tipo NF',       v: gerais.tipoNF },
                { l:'Operação',      v: gerais.operacao },
                { l:'Atendimento',   v: gerais.tipoAtendimento },
                { l:'Intermediador', v: intermed.indicador.split(' (')[0] },
                { l:'Finalidade',    v: gerais.finalidade },
              ].map(d => (
                <div key={d.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                  <span style={{ color:T.gray500 }}>{d.l}</span>
                  <span style={{ color:T.navy, fontWeight:600, textAlign:'right', fontSize:11.5 }}>{d.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Public wrapper ───────────────────────────────────────────────
export function NfeView() {
  const [view, setView] = useState<'list' | 'nova'>('list')
  if (view === 'nova') return <NovaNFePage onVoltar={() => setView('list')} />
  return <NFeListPage onNova={() => setView('nova')} />
}
