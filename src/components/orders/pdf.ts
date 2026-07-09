import {
  type StatusPedido,
  STATUS_CFG, FORMAS_PAGAMENTO, formatBRL, formatDate,
} from './types'

export interface PdfItem {
  nome: string
  sku: string
  tipo: 'produto' | 'servico'
  qtd: number
  preco: number
  desconto: number
}

export interface PdfPedidoData {
  titulo: string            // ex.: "Pedido #1082"
  status: StatusPedido
  parceiroLabel: string     // "Cliente" ou "Fornecedor"
  parceiroNome: string
  parceiroDoc?: string
  criadoEm?: string         // ISO date — omitido quando ainda não salvo
  formaPagamento?: string | null
  dataPagamento?: string | null
  obs?: string
  itens: PdfItem[]
  descontoGlobal: number
}

function esc(v: string): string {
  return v.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!
  ))
}

export function renderPedidoPdfHtml(data: PdfPedidoData): string {
  const cfg = STATUS_CFG[data.status]
  const subtotalBruto = data.itens.reduce((acc, i) => acc + i.preco * i.qtd, 0)
  const descontoItens = data.itens.reduce((acc, i) => acc + i.desconto, 0)
  const total = Math.max(0, subtotalBruto - descontoItens - data.descontoGlobal)
  const formaPagLabel = data.formaPagamento
    ? (FORMAS_PAGAMENTO.find((f) => f.value === data.formaPagamento)?.label ?? data.formaPagamento)
    : null

  const infoBoxes = [
    `<div class="box"><div class="lbl">${esc(data.parceiroLabel)}</div><div class="val">${esc(data.parceiroNome)}</div>${data.parceiroDoc ? `<div class="sub">${esc(data.parceiroDoc)}</div>` : ''}</div>`,
    data.criadoEm ? `<div class="box"><div class="lbl">Data de emissão</div><div class="val">${formatDate(data.criadoEm)}</div></div>` : '',
    formaPagLabel ? `<div class="box"><div class="lbl">Forma de pagamento</div><div class="val">${esc(formaPagLabel)}</div></div>` : '',
    data.dataPagamento ? `<div class="box"><div class="lbl">Data de pagamento</div><div class="val">${formatDate(data.dataPagamento)}</div></div>` : '',
  ].filter(Boolean).join('')

  const linhas = data.itens.map((i, idx) => `
    <tr>
      <td class="num muted">${idx + 1}</td>
      <td>
        <div class="nome">${esc(i.nome)}<span class="tipo ${i.tipo}">${i.tipo === 'servico' ? 'Serviço' : 'Produto'}</span></div>
        ${i.sku ? `<div class="sku">${esc(i.sku)}</div>` : ''}
      </td>
      <td class="num">${i.qtd}</td>
      <td class="num">${formatBRL(i.preco)}</td>
      <td class="num ${i.desconto > 0 ? 'neg' : 'muted'}">${i.desconto > 0 ? `-${formatBRL(i.desconto)}` : '—'}</td>
      <td class="num bold">${formatBRL(i.preco * i.qtd - i.desconto)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${esc(data.titulo)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', 'Segoe UI', sans-serif; padding: 40px 48px; color: #0f172a; font-size: 14px; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    h1 { margin: 0; font-size: 20px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 4px;
             background: ${cfg.bg}; color: ${cfg.color}; font-size: 12px; font-weight: 600; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: ${cfg.dot}; display: inline-block; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .box { background: #f8f9fc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; }
    .lbl { font-size: 10px; letter-spacing: .05em; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
    .val { font-weight: 600; font-size: 13px; }
    .sub { font-size: 11px; color: #64748b; margin-top: 1px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #64748b;
         padding: 8px 10px; background: #f8f9fc; border-bottom: 1px solid #e2e8f0; }
    th.num { text-align: right; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; font-size: 13px; }
    .num { text-align: right; font-family: ui-monospace, monospace; white-space: nowrap; }
    .nome { font-weight: 500; }
    .sku { font-size: 11px; color: #94a3b8; font-family: ui-monospace, monospace; margin-top: 1px; }
    .tipo { display: inline-block; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 3px; margin-left: 6px; vertical-align: 1px; }
    .tipo.produto { background: #eef0ff; color: #3d3ebf; }
    .tipo.servico { background: #d1fae5; color: #0e9f6e; }
    .muted { color: #94a3b8; }
    .neg { color: #ef4444; }
    .bold { font-weight: 600; }
    .totais { margin-left: auto; width: 300px; }
    .trow { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .trow .num { font-family: ui-monospace, monospace; }
    .total-final { border-top: 1px solid #e2e8f0; margin-top: 6px; padding-top: 10px; font-weight: 700; font-size: 15px; }
    .total-final .num { color: #3d3ebf; font-size: 18px; }
    .obs { background: #fef3c7; border: 1px solid #f59e0b40; border-radius: 8px; padding: 10px 14px; margin-top: 20px; }
    footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;
             display: flex; justify-content: space-between; }
  </style></head><body>
  <header><h1>${esc(data.titulo)}</h1><span class="badge"><span class="dot"></span>${cfg.label}</span></header>
  <div class="info-grid">${infoBoxes}</div>
  <table>
    <thead><tr>
      <th class="num" style="width:32px">#</th><th>Item</th><th class="num">Qtd</th>
      <th class="num">Preço unit.</th><th class="num">Desconto</th><th class="num">Total</th>
    </tr></thead>
    <tbody>${linhas}</tbody>
  </table>
  <div class="totais">
    <div class="trow"><span>Subtotal (${data.itens.length} ite${data.itens.length !== 1 ? 'ns' : 'm'})</span><span class="num">${formatBRL(subtotalBruto)}</span></div>
    ${descontoItens > 0 ? `<div class="trow"><span>Descontos nos itens</span><span class="num neg">-${formatBRL(descontoItens)}</span></div>` : ''}
    ${data.descontoGlobal > 0 ? `<div class="trow"><span>Desconto geral</span><span class="num neg">-${formatBRL(data.descontoGlobal)}</span></div>` : ''}
    <div class="trow total-final"><span>Total</span><span class="num">${formatBRL(total)}</span></div>
  </div>
  ${data.obs ? `<div class="obs"><div class="lbl">Observações</div><div style="font-size:13px">${esc(data.obs)}</div></div>` : ''}
  <footer><span>Gerado em ${new Date().toLocaleString('pt-BR')}</span><span>Synk ERP</span></footer>
  </body></html>`
}

/** Escreve o PDF na janela já aberta (abra-a de forma síncrona no clique para não ser bloqueada) e dispara a impressão. */
export function imprimirPedidoPdf(win: Window, data: PdfPedidoData) {
  win.document.open()
  win.document.write(renderPedidoPdfHtml(data))
  win.document.close()
  win.focus()
  win.print()
}
