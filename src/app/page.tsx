import Link from "next/link"

export default function Home() {
  return (
    <>
      <nav className="navbar">
        <span className="logo">Synk</span>
        <ul className="nav-links">
          <li>
            <a href="#features">Produto</a>
          </li>
          <li>
            <a href="#features">Funcionalidades</a>
          </li>
          <li>
            <a href="#pricing">Preços</a>
          </li>
          <li>
            <a href="#">Blog</a>
          </li>
        </ul>
        <div className="nav-actions">
          <Link href="/login" className="btn-ghost">
            Entrar
          </Link>
          <Link href="/signup" className="btn-primary">
            Começar grátis
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="badge">
            ✦ Trial gratuito por 14 dias — sem cartão de crédito
          </div>

          <h1>
            Gestão para PMEs,
            <br />
            finalmente simples.
          </h1>

          <p className="hero-sub">
            ERP completo com financeiro, estoque e vendas em um só lugar.
            Onboarding em menos de 10 minutos, sem necessidade de consultoria.
          </p>

          <div className="hero-buttons">
            <Link href="/signup" className="btn-primary btn-primary-lg">
              Começar grátis — é de graça
            </Link>
            <a href="#features" className="btn-outline-light">
              Ver demonstração →
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">&lt; 10 min</span>
              <span className="stat-label">Onboarding</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">99.5%</span>
              <span className="stat-label">Uptime SLA</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Dados isolados</span>
            </div>
          </div>
        </div>

        <div className="dashboard-mockup">
          <div className="mockup-bar">
            <span className="mockup-title">Synk ERP — Dashboard</span>
            <div className="window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
          </div>
          <div className="mockup-body">
            <div className="kpi-row">
              <div className="kpi-card">
                <span className="kpi-label">Faturamento</span>
                <span className="kpi-value">R$ 48.200</span>
                <span className="kpi-delta up">+12%</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Inadimplência</span>
                <span className="kpi-value">R$ 3.100</span>
                <span className="kpi-delta down">-5%</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Estoque</span>
                <span className="kpi-value">1.842 itens</span>
                <span className="kpi-delta ok">OK</span>
              </div>
            </div>
            <div className="chart-area">
              <div className="chart-label">Fluxo de Caixa — Maio 2026</div>
              <div className="chart-bars">
                <div className="bar" style={{ height: '65%' }}></div>
                <div className="bar" style={{ height: '50%' }}></div>
                <div className="bar" style={{ height: '78%' }}></div>
                <div className="bar" style={{ height: '58%' }}></div>
                <div className="bar" style={{ height: '85%' }}></div>
                <div className="bar" style={{ height: '45%' }}></div>
                <div className="bar" style={{ height: '72%' }}></div>
                <div className="bar" style={{ height: '60%' }}></div>
                <div className="bar" style={{ height: '90%' }}></div>
                <div className="bar" style={{ height: '42%' }}></div>
                <div className="bar" style={{ height: '75%' }}></div>
                <div className="bar" style={{ height: '55%' }}></div>
              </div>
            </div>
            <div className="tx-list">
              <div className="tx-header">Contas a Receber</div>
              <div className="tx-row">
                <span className="tx-name">Pedido #1042 — Loja ABC</span>
                <div className="tx-right">
                  <span className="tx-value">R$ 1.850,00</span>
                  <span className="status-pill status-pago">Pago</span>
                </div>
              </div>
              <div className="tx-row">
                <span className="tx-name">Pedido #1041 — Comercial XYZ</span>
                <div className="tx-right">
                  <span className="tx-value">R$ 3.200,00</span>
                  <span className="status-pill status-vencendo">Vencendo</span>
                </div>
              </div>
              <div className="tx-row">
                <span className="tx-name">Pedido #1040 — Tech Solutions</span>
                <div className="tx-right">
                  <span className="tx-value">R$ 750,00</span>
                  <span className="status-pill status-vencido">Vencido</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section features" id="features">
        <div className="section-center">
          <span className="section-label">FUNCIONALIDADES</span>
          <h2 className="section-headline">
            Tudo que sua empresa precisa,
            <br />
            em um só lugar
          </h2>
          <p className="section-sub">
            Do financeiro ao estoque, do pedido à nota fiscal — o Synk integra
            todos os módulos do seu negócio automaticamente.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#EEF0FF' }}>
              💰
            </div>
            <h3 className="feature-title">Financeiro Completo</h3>
            <p className="feature-desc">
              Contas a pagar e receber, fluxo de caixa, DRE simplificada e
              conciliação bancária. Alertas de vencimento em D-3, D-1 e vencido.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#D1FAE5' }}>
              🛒
            </div>
            <h3 className="feature-title">Vendas & Pedidos</h3>
            <p className="feature-desc">
              Do orçamento ao faturamento com 1 clique. Emissão de NF-e
              integrada, baixa automática de estoque e geração de contas a
              receber.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#FEF3C7' }}>
              📦
            </div>
            <h3 className="feature-title">Controle de Estoque</h3>
            <p className="feature-desc">
              Saldo em tempo real por produto e depósito, custo médio ponderado,
              alertas de estoque mínimo e histórico completo de movimentações.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#EEF2FF' }}>
              📊
            </div>
            <h3 className="feature-title">Dashboard & Relatórios</h3>
            <p className="feature-desc">
              KPIs de faturamento, margem e inadimplência em tempo real.
              Gráficos por período, ranking de clientes e exportação em
              PDF/Excel.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#FEE2E2' }}>
              🏭
            </div>
            <h3 className="feature-title">Compras & Fornecedores</h3>
            <p className="feature-desc">
              Gestão completa do ciclo de compras com aprovação, recebimento e
              entrada automática no estoque e contas a pagar.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#F0FDF4' }}>
              🏢
            </div>
            <h3 className="feature-title">Multi-tenancy Seguro</h3>
            <p className="feature-desc">
              Isolamento total de dados por empresa. Convite de usuários, RBAC
              com permissões granulares e log de acesso completo.
            </p>
          </div>
        </div>
      </section>

      <section className="section social-proof">
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-value">500+</div>
            <div className="metric-label">Empresas Ativas</div>
            <div className="metric-sub">e crescendo todo mês</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">10 min</div>
            <div className="metric-label">Onboarding médio</div>
            <div className="metric-sub">sem necessidade de consultoria</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">99.5%</div>
            <div className="metric-label">Uptime garantido</div>
            <div className="metric-sub">SLA incluído no plano Pro+</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">NF-e</div>
            <div className="metric-label">Emissão fiscal integrada</div>
            <div className="metric-sub">via API Focus NFe nativa</div>
          </div>
        </div>
      </section>

      <section className="section pricing" id="pricing">
        <div className="section-center">
          <span className="section-label">PLANOS</span>
          <h2 className="section-headline">Simples e transparente</h2>
          <p className="section-sub">
            Comece grátis e escale conforme seu negócio crescer. Sem taxas
            escondidas.
          </p>
        </div>
        <div className="plans-grid">
          <div className="plan-card">
            <div style={{ height: '32px' }}></div>
            <div className="plan-name" style={{ color: 'var(--gray-700)' }}>
              Free
            </div>
            <div className="plan-price-row">
              <span className="plan-price">R$ 0</span>
            </div>
            <div className="plan-period">/mês</div>
            <div className="plan-desc">Para conhecer o Synk</div>
            <div className="plan-divider"></div>
            <div className="plan-features">
              <div className="plan-feature">
                <span className="check-icon">✓</span>Até 50 NF-e por mês
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>1 usuário
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Financeiro básico
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Estoque básico
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Suporte por e-mail
              </div>
            </div>
            <a href="#" className="btn-plan btn-plan-outline">
              Criar conta grátis
            </a>
          </div>

          <div className="plan-card highlighted">
            <div className="plan-tag">✦ MAIS POPULAR</div>
            <div className="plan-name">Pro</div>
            <div className="plan-price-row">
              <span className="plan-price" style={{ color: 'var(--white)' }}>
                R$ 149
              </span>
            </div>
            <div className="plan-period">/mês</div>
            <div className="plan-desc">Para PMEs em crescimento</div>
            <div className="plan-divider"></div>
            <div className="plan-features">
              <div className="plan-feature">
                <span className="check-icon">✓</span>NF-e ilimitadas
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Até 5 usuários
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Financeiro completo + DRE
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Estoque multi-depósito
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Relatórios avançados
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Suporte via chat (8×5)
              </div>
            </div>
            <a href="#" className="btn-plan btn-plan-white">
              Começar trial gratuito
            </a>
          </div>

          <div className="plan-card">
            <div style={{ height: '32px' }}></div>
            <div className="plan-name" style={{ color: 'var(--gray-700)' }}>
              Business
            </div>
            <div className="plan-price-row">
              <span className="plan-price">R$ 349</span>
            </div>
            <div className="plan-period">/mês</div>
            <div className="plan-desc">Para operações maiores</div>
            <div className="plan-divider"></div>
            <div className="plan-features">
              <div className="plan-feature">
                <span className="check-icon">✓</span>Tudo do Pro
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Usuários ilimitados
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Multi-tenancy avançado
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>API aberta
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Integrações customizadas
              </div>
              <div className="plan-feature">
                <span className="check-icon">✓</span>Suporte prioritário 24×7
              </div>
            </div>
            <a href="#" className="btn-plan btn-plan-outline">
              Falar com vendas
            </a>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <h2>
          Pronto para simplificar
          <br />
          sua gestão?
        </h2>
        <p>Junte-se a centenas de PMEs que já trocaram planilhas pelo Synk.</p>
        <div className="cta-buttons">
          <Link href="/signup" className="btn-primary btn-primary-lg">
            Criar conta grátis agora
          </Link>
          <a href="#features" className="btn-outline-light">
            Agendar demonstração
          </a>
        </div>
        <p className="cta-note">
          Trial de 14 dias · Sem cartão de crédito · Cancele quando quiser
        </p>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="logo">Synk</span>
            <p className="footer-tagline">
              ERP moderno para pequenas e médias empresas brasileiras. Simples,
              rápido e acessível.
            </p>
            <div className="footer-social">
              <a href="#" className="social-btn" title="LinkedIn">
                in
              </a>
              <a href="#" className="social-btn" title="Twitter/X">
                𝕏
              </a>
              <a href="#" className="social-btn" title="Instagram">
                ig
              </a>
              <a href="#" className="social-btn" title="YouTube">
                ▶
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Produto</h4>
            <div className="footer-links">
              <a href="#">Funcionalidades</a>
              <a href="#">Preços</a>
              <a href="#">Changelog</a>
              <a href="#">Roadmap</a>
              <a href="#">Status</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Empresa</h4>
            <div className="footer-links">
              <a href="#">Sobre nós</a>
              <a href="#">Blog</a>
              <a href="#">Carreiras</a>
              <a href="#">Parceiros</a>
              <a href="#">Contato</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Suporte</h4>
            <div className="footer-links">
              <a href="#">Central de ajuda</a>
              <a href="#">Documentação</a>
              <a href="#">API Docs</a>
              <a href="#">Comunidade</a>
              <a href="#">Falar com vendas</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">
            © 2026 Synk ERP. Todos os direitos reservados. CNPJ
            00.000.000/0001-00
          </span>
          <div className="footer-legal">
            <a href="#">Termos de Uso</a>
            <a href="#">Privacidade</a>
            <a href="#">LGPD</a>
          </div>
        </div>
      </footer>
    </>
  );
}
