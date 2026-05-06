export interface Cliente {
  id: string
  tipo: 'PJ' | 'PF'
  razaoSocial: string
  nomeFantasia: string
  documento: string
  email: string
  telefone: string
  ativo: boolean
  cidade: string
  uf: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  criadoEm: string
  totalPedidos: number
  totalGasto: number
}

export function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR')
}

export function maskCPF(v: string): string {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
}

export function maskCNPJ(v: string): string {
  return v.replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function maskCEP(v: string): string {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
}

export function maskTelefone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}

export const UFs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] as const

export const CLIENTES_MOCK: Cliente[] = [
  { id:'1', tipo:'PJ', razaoSocial:'Lima Distribuidora Ltda', nomeFantasia:'Lima Dist.', documento:'12.345.678/0001-90', email:'contato@limadist.com.br', telefone:'(11) 3456-7890', ativo:true, cidade:'São Paulo', uf:'SP', cep:'01310-100', logradouro:'Av. Paulista', numero:'1000', complemento:'Sala 5', bairro:'Bela Vista', criadoEm:'2026-01-10', totalPedidos:8, totalGasto:45200 },
  { id:'2', tipo:'PF', razaoSocial:'João Carlos Mendes', nomeFantasia:'', documento:'123.456.789-00', email:'joao@email.com', telefone:'(11) 98765-4321', ativo:true, cidade:'Campinas', uf:'SP', cep:'13010-050', logradouro:'Rua Barão de Jaguara', numero:'123', complemento:'', bairro:'Centro', criadoEm:'2026-01-15', totalPedidos:3, totalGasto:8400 },
  { id:'3', tipo:'PJ', razaoSocial:'Padaria São Jorge Eireli', nomeFantasia:'Padaria São Jorge', documento:'98.765.432/0001-10', email:'saojorge@padaria.com', telefone:'(21) 2345-6789', ativo:true, cidade:'Rio de Janeiro', uf:'RJ', cep:'20040-020', logradouro:'Av. Rio Branco', numero:'45', complemento:'Loja 2', bairro:'Centro', criadoEm:'2026-02-01', totalPedidos:12, totalGasto:18500 },
  { id:'4', tipo:'PJ', razaoSocial:'Construtora Velez S.A.', nomeFantasia:'Velez', documento:'55.443.321/0001-77', email:'financeiro@velez.com.br', telefone:'(11) 4567-8901', ativo:true, cidade:'São Paulo', uf:'SP', cep:'04538-133', logradouro:'Av. Brigadeiro Faria Lima', numero:'3144', complemento:'12º andar', bairro:'Itaim Bibi', criadoEm:'2026-02-10', totalPedidos:5, totalGasto:62300 },
  { id:'5', tipo:'PF', razaoSocial:'Ana Paula Ribeiro', nomeFantasia:'', documento:'987.654.321-00', email:'ana.ribeiro@gmail.com', telefone:'(19) 99876-5432', ativo:false, cidade:'Ribeirão Preto', uf:'SP', cep:'14010-040', logradouro:'Rua Álvares Cabral', numero:'789', complemento:'Apto 32', bairro:'Centro', criadoEm:'2026-02-20', totalPedidos:1, totalGasto:1980 },
  { id:'6', tipo:'PJ', razaoSocial:'Mercado Boa Vista ME', nomeFantasia:'Boa Vista', documento:'33.221.100/0001-55', email:'compras@boavista.com', telefone:'(51) 3210-9876', ativo:true, cidade:'Porto Alegre', uf:'RS', cep:'90010-150', logradouro:'Rua dos Andradas', numero:'567', complemento:'', bairro:'Centro Histórico', criadoEm:'2026-03-01', totalPedidos:7, totalGasto:24750 },
  { id:'7', tipo:'PF', razaoSocial:'Carlos Eduardo Lima', nomeFantasia:'', documento:'456.789.123-00', email:'carlos.lima@hotmail.com', telefone:'(31) 97654-3210', ativo:true, cidade:'Belo Horizonte', uf:'MG', cep:'30130-170', logradouro:'Av. Afonso Pena', numero:'3000', complemento:'', bairro:'Centro', criadoEm:'2026-03-05', totalPedidos:2, totalGasto:3200 },
  { id:'8', tipo:'PJ', razaoSocial:'Café Central Comércio Ltda', nomeFantasia:'Café Central', documento:'77.654.321/0001-33', email:'cafe@central.com.br', telefone:'(41) 3333-4444', ativo:true, cidade:'Curitiba', uf:'PR', cep:'80010-010', logradouro:'Rua XV de Novembro', numero:'900', complemento:'Sobreloja', bairro:'Centro', criadoEm:'2026-03-10', totalPedidos:4, totalGasto:9640 },
]
