/**
 * Módulo de Renderização de Interface (UI)
 * RU do Aluno: 4769288
 */

import { UNIDADES, CARDAPIO, DADOS_ADMINISTRATIVOS } from "./data.js";
import { 
  getUnidadeSelecionada, 
  getUsuarioLogado, 
  getCarrinho, 
  calcularTotaisCarrinho,
  getPedidos
} from "./state.js";

// --- MAPEAMENTO DE ELEMENTOS DO DOM ---
export const DOM = {
  // Navegação e Telas
  views: document.querySelectorAll(".view"),
  navLinks: document.querySelectorAll("[data-target]"),
  unidadeBanner: document.getElementById("unidade-selecionada-banner"),
  unidadeNomeText: document.getElementById("unidade-nome-text"),
  btnAlterarUnidade: document.getElementById("btn-alterar-unidade"),
  userHeaderArea: document.getElementById("user-header-area"),
  cartBadge: document.getElementById("cart-badge"),

  // Tela Unidade
  unidadesGrid: document.getElementById("unidades-grid"),

  // Tela Cardápio
  categoriaFiltros: document.getElementById("categoria-filtros"),
  produtosGrid: document.getElementById("produtos-grid"),

  // Tela Carrinho
  carrinhoItens: document.getElementById("carrinho-itens"),
  resumoValores: document.getElementById("resumo-valores"),
  carrinhoVazioMsg: document.getElementById("carrinho-vazio"),
  carrinhoConteudo: document.getElementById("carrinho-conteudo"),
  fidelidadeCheckboxArea: document.getElementById("fidelidade-checkbox-area"),
  cbUsarPontos: document.getElementById("cb-usar-pontos"),
  btnFinalizarCompra: document.getElementById("btn-finalizar-compra"),

  // Modais
  modalLogin: document.getElementById("modal-login"),
  loginForm: document.getElementById("login-form"),
  btnFecharModal: document.getElementById("btn-fechar-modal"),
  lgpdCheckbox: document.getElementById("cb-lgpd"),

  // Tela Pagamento (Gateway Externo)
  gatewayStatus: document.getElementById("gateway-status"),
  gatewayControles: document.getElementById("gateway-controles"),
  btnSimularSucesso: document.getElementById("btn-simular-sucesso"),
  btnSimularErro: document.getElementById("btn-simular-erro"),
  btnSimularConexao: document.getElementById("btn-simular-conexao"),
  btnVoltarCarrinho: document.getElementById("btn-voltar-carrinho"),

  // Tela Status do Pedido
  pedidosStatusLista: document.getElementById("pedidos-status-lista"),

  // Tela Dashboard Admin
  adminDashboard: document.getElementById("admin-dashboard")
};

// --- NAVEGAÇÃO ENTRE TELAS (SPA) ---
export function irParaTela(targetId) {
  DOM.views.forEach(view => {
    if (view.id === targetId) {
      view.classList.remove("hidden");
    } else {
      view.classList.add("hidden");
    }
  });

  // Atualiza estado ativo nos links de navegação
  DOM.navLinks.forEach(link => {
    if (link.getAttribute("data-target") === targetId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Se for a tela de dashboard, renderiza o admin
  if (targetId === "view-admin") {
    renderizarDashboardAdmin();
  }
}

// --- RENDERIZAÇÃO DE UNIDADES ---
export function renderizarUnidades(onSelectUnidade) {
  if (!DOM.unidadesGrid) return;
  DOM.unidadesGrid.innerHTML = "";

  UNIDADES.forEach(unidade => {
    const card = document.createElement("div");
    card.className = "unidade-card card";
    card.innerHTML = `
      <div class="unidade-card-header">
        <h3>${unidade.nome}</h3>
        <span class="badge ${unidade.tipoCozinha === 'Completa' ? 'badge-primary' : 'badge-secondary'}">
          Cozinha ${unidade.tipoCozinha}
        </span>
      </div>
      <div class="unidade-card-body">
        <p><strong>Endereço:</strong> ${unidade.endereco}</p>
        <p><strong>Funcionamento:</strong> ${unidade.funcionamento}</p>
        <p><strong>Telefone:</strong> ${unidade.telefone}</p>
      </div>
      <button class="btn btn-block btn-primary btn-selecionar-unidade" data-id="${unidade.id}">
        Selecionar Unidade e Ver Cardápio
      </button>
    `;

    card.querySelector(".btn-selecionar-unidade").addEventListener("click", () => {
      onSelectUnidade(unidade.id);
    });

    DOM.unidadesGrid.appendChild(card);
  });
}

// --- RENDERIZAÇÃO DO CARDÁPIO DINÂMICO ---
let categoriaAtiva = "todas";

export function renderizarCardapio(onAdicionarCarrinho) {
  const unidadeId = getUnidadeSelecionada();
  if (!unidadeId || !DOM.produtosGrid) return;

  DOM.produtosGrid.innerHTML = "";

  // Filtra produtos pela unidade selecionada (cardápio dinâmico)
  // Alguns pratos só estão disponíveis em lojas com cozinha completa ou unidades específicas
  let produtosFiltrados = CARDAPIO.filter(produto => {
    return produto.disponibilidade.includes(unidadeId);
  });

  // Filtra por categoria ativa
  if (categoriaAtiva !== "todas") {
    produtosFiltrados = produtosFiltrados.filter(p => p.categoria === categoriaAtiva);
  }

  if (produtosFiltrados.length === 0) {
    DOM.produtosGrid.innerHTML = `<p class="no-products">Nenhum produto disponível nesta categoria para a unidade selecionada.</p>`;
    return;
  }

  produtosFiltrados.forEach(produto => {
    const card = document.createElement("div");
    card.className = `produto-card card ${produto.sazonal ? 'sazonal-card' : ''}`;
    card.innerHTML = `
      <div class="produto-imagem-container">
        <img class="produto-imagem" src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
        ${produto.sazonal ? '<span class="sazonal-badge">Sazonal de São João</span>' : ''}
      </div>
      <div class="produto-info">
        <h3 class="produto-titulo">${produto.nome}</h3>
        <p class="produto-desc">${produto.descricao}</p>
        <div class="produto-fidelidade">
          Acumula <strong>+${produto.pontosFidelidade} pontos</strong> no fidelidade
        </div>
        <div class="produto-footer">
          <span class="produto-preco">R$ ${produto.preco.toFixed(2)}</span>
          <button class="btn btn-add" data-id="${produto.id}">
            Adicionar
          </button>
        </div>
      </div>
    `;

    card.querySelector(".btn-add").addEventListener("click", () => {
      onAdicionarCarrinho(produto);
    });

    DOM.produtosGrid.appendChild(card);
  });
}

// Inicializa filtros de categorias
export function inicializarFiltrosCategorias(onFiltroMuda) {
  if (!DOM.categoriaFiltros) return;

  DOM.categoriaFiltros.querySelectorAll(".filtro-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      DOM.categoriaFiltros.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      categoriaAtiva = e.target.getAttribute("data-categoria");
      onFiltroMuda();
    });
  });
}

// --- RENDERIZAÇÃO DO CARRINHO ---
export function renderizarCarrinho(onAlterarQtd, onRemover) {
  const carrinho = getCarrinho();
  const usuario = getUsuarioLogado();

  if (!DOM.carrinhoItens) return;

  // Atualiza badge de navegação
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  if (DOM.cartBadge) {
    DOM.cartBadge.textContent = totalItens;
    DOM.cartBadge.style.display = totalItens > 0 ? "flex" : "none";
  }

  if (carrinho.length === 0) {
    DOM.carrinhoVazioMsg.classList.remove("hidden");
    DOM.carrinhoConteudo.classList.add("hidden");
    return;
  }

  DOM.carrinhoVazioMsg.classList.add("hidden");
  DOM.carrinhoConteudo.classList.remove("hidden");
  DOM.carrinhoItens.innerHTML = "";

  carrinho.forEach(item => {
    const itemRow = document.createElement("div");
    itemRow.className = "carrinho-item-row";
    itemRow.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}" class="carrinho-item-img">
      <div class="carrinho-item-detalhes">
        <h4>${item.nome}</h4>
        <span class="carrinho-item-preco">R$ ${item.preco.toFixed(2)}</span>
      </div>
      <div class="carrinho-item-controles">
        <button class="btn-qty btn-menos" data-id="${item.id}">-</button>
        <span class="qty-num">${item.quantidade}</span>
        <button class="btn-qty btn-mais" data-id="${item.id}">+</button>
      </div>
      <div class="carrinho-item-total">
        R$ ${(item.preco * item.quantidade).toFixed(2)}
      </div>
      <button class="btn-remover" data-id="${item.id}" title="Remover item">×</button>
    `;

    // Eventos de controles de quantidade
    itemRow.querySelector(".btn-menos").addEventListener("click", () => {
      onAlterarQtd(item.id, item.quantidade - 1);
    });
    itemRow.querySelector(".btn-mais").addEventListener("click", () => {
      onAlterarQtd(item.id, item.quantidade + 1);
    });
    itemRow.querySelector(".btn-remover").addEventListener("click", () => {
      onRemover(item.id);
    });

    DOM.carrinhoItens.appendChild(itemRow);
  });

  // Mostra ou esconde controles do programa de fidelidade
  if (DOM.fidelidadeCheckboxArea) {
    if (usuario && usuario.pontos >= 50) {
      DOM.fidelidadeCheckboxArea.style.display = "block";
      document.getElementById("user-fidelidade-saldo").textContent = usuario.pontos;
      // Calcula desconto máximo de 5 reais por 50 pontos
      const descontoMaximo = Math.floor(usuario.pontos / 50) * 5;
      document.getElementById("fidelidade-desconto-simulado").textContent = descontoMaximo.toFixed(2);
    } else if (usuario) {
      DOM.fidelidadeCheckboxArea.style.display = "block";
      DOM.fidelidadeCheckboxArea.innerHTML = `
        <div class="fidelidade-banner-informativo">
          Você tem <strong>${usuario.pontos} pontos</strong>. 
          Alcance <strong>50 pontos</strong> para começar a resgatar descontos!
        </div>
      `;
    } else {
      DOM.fidelidadeCheckboxArea.style.display = "block";
      DOM.fidelidadeCheckboxArea.innerHTML = `
        <div class="fidelidade-banner-informativo">
          Faça <a href="#" id="fidelidade-link-login">Login ou Cadastre-se</a> no programa de fidelidade para resgatar descontos e acumular pontos!
        </div>
      `;
      document.getElementById("fidelidade-link-login").addEventListener("click", (e) => {
        e.preventDefault();
        abrirModalLogin();
      });
    }
  }

  renderizarTotaisCarrinho();
}

export function renderizarTotaisCarrinho() {
  const usarPontos = DOM.cbUsarPontos ? DOM.cbUsarPontos.checked : false;
  const totais = calcularTotaisCarrinho(usarPontos);

  if (!DOM.resumoValores) return;

  DOM.resumoValores.innerHTML = `
    <div class="resumo-linha">
      <span>Subtotal:</span>
      <span>R$ ${totais.subtotal.toFixed(2)}</span>
    </div>
    ${totais.desconto > 0 ? `
      <div class="resumo-linha desconto">
        <span>Desconto Fidelidade (${totais.pontosGastos} pts):</span>
        <span>- R$ ${totais.desconto.toFixed(2)}</span>
      </div>
    ` : ""}
    <div class="resumo-linha total">
      <span>Total:</span>
      <span>R$ ${totais.total.toFixed(2)}</span>
    </div>
    <div class="resumo-linha pontos-ganhos">
      <span>Pontos a acumular:</span>
      <span class="color-success">+${totais.totalPointsGenerated || totais.totalPontosGerados} pts</span>
    </div>
  `;
}

// --- RENDERIZAÇÃO DO MODAL DE LOGIN/CADASTRO (LGPD) ---
export function abrirModalLogin() {
  if (DOM.modalLogin) {
    DOM.modalLogin.classList.remove("hidden");
    DOM.lgpdCheckbox.checked = false;
  }
}

export function fecharModalLogin() {
  if (DOM.modalLogin) {
    DOM.modalLogin.classList.add("hidden");
    DOM.loginForm.reset();
  }
}

// --- RENDERIZAÇÃO DA BARRA DE USUÁRIO (HEADER) ---
export function renderizarBarraUsuario(onLogout) {
  const usuario = getUsuarioLogado();
  const unidadeId = getUnidadeSelecionada();

  // Atualiza banner de unidade selecionada
  if (unidadeId) {
    const unidadeObj = UNIDADES.find(u => u.id === unidadeId);
    DOM.unidadeNomeText.textContent = unidadeObj ? unidadeObj.nome : "Raízes do Nordeste";
    DOM.unidadeBanner.classList.remove("hidden");
  } else {
    DOM.unidadeBanner.classList.add("hidden");
  }

  if (!DOM.userHeaderArea) return;

  if (usuario) {
    DOM.userHeaderArea.innerHTML = `
      <div class="user-logged-info">
        <span class="user-welcome">Olá, <strong>${usuario.nome}</strong> (RU: 4769288)</span>
        <div class="user-points-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F4B838" style="margin-right:4px;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <span><strong>${usuario.pontos}</strong> pts</span>
        </div>
        <button id="btn-logout" class="btn btn-sm btn-outline">Sair</button>
      </div>
    `;
    document.getElementById("btn-logout").addEventListener("click", onLogout);
  } else {
    DOM.userHeaderArea.innerHTML = `
      <button id="btn-login-fidelidade" class="btn btn-sm btn-secondary">
        Login / Fidelidade
      </button>
    `;
    document.getElementById("btn-login-fidelidade").addEventListener("click", abrirModalLogin);
  }
}

// --- RENDERIZAÇÃO DE STATUS E TIMELINE DO PEDIDO ---
export function renderizarTimelinePedidos() {
  const pedidos = getPedidos();
  if (!DOM.pedidosStatusLista) return;

  if (pedidos.length === 0) {
    DOM.pedidosStatusLista.innerHTML = `<p class="no-orders">Você ainda não realizou nenhum pedido neste navegador.</p>`;
    return;
  }

  DOM.pedidosStatusLista.innerHTML = "";

  pedidos.forEach(pedido => {
    const unidade = UNIDADES.find(u => u.id === pedido.unidadeId);
    const dataFormatada = new Date(pedido.data).toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit"
    });

    const card = document.createElement("div");
    card.className = "pedido-status-card card";
    
    // Define progresso de classes
    const statusIdx = ["Recebido", "Em Preparo", "Pronto para Retirada"].indexOf(pedido.status);
    
    card.innerHTML = `
      <div class="pedido-status-header">
        <div>
          <h4>Pedido #${pedido.id}</h4>
          <span class="pedido-data">${dataFormatada} - Unidade: ${unidade ? unidade.nome : ""}</span>
        </div>
        <span class="status-badge status-${pedido.status.toLowerCase().replace(/\s+/g, "-")}">
          ${pedido.status}
        </span>
      </div>

      <div class="pedido-status-timeline">
        <div class="timeline-step ${statusIdx >= 0 ? 'active' : ''}">
          <div class="step-bullet">1</div>
          <span>Recebido</span>
        </div>
        <div class="timeline-line ${statusIdx >= 1 ? 'active' : ''}"></div>
        <div class="timeline-step ${statusIdx >= 1 ? 'active' : ''}">
          <div class="step-bullet">2</div>
          <span>Cozinha (Preparo)</span>
        </div>
        <div class="timeline-line ${statusIdx >= 2 ? 'active' : ''}"></div>
        <div class="timeline-step ${statusIdx >= 2 ? 'active' : ''}">
          <div class="step-bullet">3</div>
          <span>Pronto para Retirada</span>
        </div>
      </div>

      <div class="pedido-status-itens">
        <h5>Itens do Pedido:</h5>
        <ul>
          ${pedido.itens.map(item => `
            <li>${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}</li>
          `).join("")}
        </ul>
      </div>

      <div class="pedido-status-footer">
        <div>
          ${pedido.desconto > 0 ? `<div class="fidelidade-desconto">Desconto: - R$ ${pedido.desconto.toFixed(2)}</div>` : ""}
          <div class="valor-final"><strong>Total Pago: R$ ${pedido.total.toFixed(2)}</strong></div>
        </div>
        <div class="pontos-acumulados color-success">
          +${pedido.pontosGerados} pts acumulados
        </div>
      </div>
    `;

    DOM.pedidosStatusLista.appendChild(card);
  });
}

// --- RENDERIZAÇÃO DO DASHBOARD ADMINISTRATIVO ---
function renderizarDashboardAdmin() {
  if (!DOM.adminDashboard) return;

  const data = DADOS_ADMINISTRATIVOS;

  // Calcula maior valor para normalizar os gráficos em CSS
  const maxVendasRegiao = Math.max(...data.vendasPorRegiao.map(r => r.valor));
  const maxQtdProduto = Math.max(...data.produtosMaisVendidos.map(p => p.quantidade));

  DOM.adminDashboard.innerHTML = `
    <!-- CARDS DE INFORMAÇÃO -->
    <div class="admin-kpis">
      <div class="kpi-card card">
        <span class="kpi-titulo">Faturamento Total Consolidado</span>
        <span class="kpi-valor">R$ ${data.vendasTotais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        <span class="kpi-sub">Faturamento bruto anual da rede</span>
      </div>
      <div class="kpi-card card">
        <span class="kpi-titulo">Unidades Ativas</span>
        <span class="kpi-valor">${UNIDADES.length}</span>
        <span class="kpi-sub">PE, BA e CE</span>
      </div>
      <div class="kpi-card card">
        <span class="kpi-titulo">Operações Sob Auditoria</span>
        <span class="kpi-valor">${data.logsAuditoria.length}</span>
        <span class="kpi-sub">Registros de risco nas últimas 24h</span>
      </div>
    </div>

    <div class="admin-charts-grid">
      <!-- GRÁFICO 1: Vendas por Região -->
      <div class="card chart-card">
        <h3>Vendas por Região e Unidade</h3>
        <div class="css-chart-container">
          ${data.vendasPorRegiao.map(regiao => {
            const pct = (regiao.valor / maxVendasRegiao) * 100;
            return `
              <div class="chart-row">
                <span class="chart-label">${regiao.regiao}</span>
                <div class="chart-bar-container">
                  <div class="chart-bar" style="width: ${pct}%"></div>
                </div>
                <span class="chart-value">R$ ${regiao.valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- GRÁFICO 2: Produtos mais consumidos -->
      <div class="card chart-card">
        <h3>Produtos Mais Populares</h3>
        <div class="css-chart-container">
          ${data.produtosMaisVendidos.map(prod => {
            const pct = (prod.quantidade / maxQtdProduto) * 100;
            return `
              <div class="chart-row">
                <span class="chart-label">${prod.nome}</span>
                <div class="chart-bar-container">
                  <div class="chart-bar bar-secondary" style="width: ${pct}%"></div>
                </div>
                <span class="chart-value">${prod.quantidade} un.</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>

    <!-- LOGS DE AUDITORIA (Exigência de Segurança e Rastreabilidade) -->
    <div class="card auditoria-card">
      <div class="auditoria-header">
        <h3>Logs de Auditoria de Segurança</h3>
        <span class="badge badge-danger">LGPD e Prevenção de Fraudes</span>
      </div>
      <p class="auditoria-desc">Conforme exigido pelas normas regulatórias da franquia, descontos e cancelamentos de pedidos são logados com carimbo de data, hora e operador.</p>
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID Log</th>
              <th>Data/Hora</th>
              <th>Operador</th>
              <th>Ação</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            ${data.logsAuditoria.map(log => `
              <tr>
                <td><code>${log.id}</code></td>
                <td>${log.data}</td>
                <td><strong>${log.operador}</strong></td>
                <td><span class="badge badge-sm badge-alert">${log.acao}</span></td>
                <td>${log.detalhes}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
