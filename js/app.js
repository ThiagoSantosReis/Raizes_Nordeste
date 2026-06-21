/**
 * Controlador Principal da Aplicação (App Entry Point)
 * RU do Aluno: 4769288
 */

import { 
  DOM, 
  irParaTela, 
  renderizarUnidades, 
  renderizarCardapio, 
  inicializarFiltrosCategorias, 
  renderizarCarrinho, 
  renderizarBarraUsuario, 
  renderizarTimelinePedidos,
  abrirModalLogin,
  fecharModalLogin
} from "./ui.js";

import { 
  setUnidade, 
  getUnidadeSelecionada, 
  logarOuCadastrarUsuario, 
  deslogarUsuario, 
  adicionarAoCarrinho, 
  alterarQuantidadeCarrinho, 
  removerDoCarrinho,
  calcularTotaisCarrinho,
  criarPedido,
  atualizarStatusPedidoSimulado,
  subscreverEstado
} from "./state.js";

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
  inicializarEventosGlobais();
  inicializarFluxoPagamento();

  // Inscreve a UI para atualizar automaticamente quando o estado mudar
  subscreverEstado((novoEstado) => {
    renderizarBarraUsuario(handleLogout);
    renderizarCarrinho(handleAlterarQuantidade, handleRemoverItem);
    renderizarCardapio(handleAdicionarCarrinho);
    renderizarTimelinePedidos();
  });

  // Renderização inicial
  renderizarBarraUsuario(handleLogout);
  renderizarUnidades(handleSelecionarUnidade);
  inicializarFiltrosCategorias(() => renderizarCardapio(handleAdicionarCarrinho));

  // Verifica se o usuário já escolheu uma unidade anteriormente
  const unidadeAtiva = getUnidadeSelecionada();
  if (unidadeAtiva) {
    renderizarCardapio(handleAdicionarCarrinho);
    renderizarCarrinho(handleAlterarQuantidade, handleRemoverItem);
    irParaTela("view-cardapio");
  } else {
    irParaTela("view-unidade");
  }
});

// --- GERENCIADORES DE EVENTOS DO ESTADO (CALLBACKS) ---
function handleSelecionarUnidade(unidadeId) {
  setUnidade(unidadeId);
  irParaTela("view-cardapio");
}

function handleAdicionarCarrinho(produto) {
  adicionarAoCarrinho(produto);
  // Feedback sutil visual de item adicionado (sem alertas chatos)
  const btn = document.querySelector(`.btn-add[data-id="${produto.id}"]`);
  if (btn) {
    const originalText = btn.textContent;
    btn.textContent = "Adicionado!";
    btn.classList.add("btn-success");
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove("btn-success");
    }, 1500);
  }
}

function handleAlterarQuantidade(produtoId, novaQtd) {
  alterarQuantidadeCarrinho(produtoId, novaQtd);
}

function handleRemoverItem(produtoId) {
  removerDoCarrinho(produtoId);
}

function handleLogout() {
  deslogarUsuario();
}

// --- EVENTOS E MODAIS GLOBAIS ---
function inicializarEventosGlobais() {
  // Alteração de unidade no banner do cabeçalho
  if (DOM.btnAlterarUnidade) {
    DOM.btnAlterarUnidade.addEventListener("click", () => {
      irParaTela("view-unidade");
    });
  }

  // Links de navegação global (SPA)
  DOM.navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-target");

      // Impede ir para cardápio ou carrinho se não tiver unidade selecionada
      if ((target === "view-cardapio" || target === "view-carrinho") && !getUnidadeSelecionada()) {
        irParaTela("view-unidade");
        return;
      }

      irParaTela(target);
    });
  });

  // Fechar modal de login
  if (DOM.btnFecharModal) {
    DOM.btnFecharModal.addEventListener("click", fecharModalLogin);
  }

  // Envio do formulário de Login e Cadastro (LGPD)
  if (DOM.loginForm) {
    DOM.loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("txt-nome").value;
      const cpf = document.getElementById("txt-cpf").value;
      const aceitouLGPD = DOM.lgpdCheckbox.checked;

      try {
        logarOuCadastrarUsuario(nome, cpf, aceitouLGPD);
        fecharModalLogin();
      } catch (err) {
        alert(err.message); // Validação de campos simples
      }
    });
  }

  // Checkbox de resgate de pontos de fidelidade
  if (DOM.cbUsarPontos) {
    DOM.cbUsarPontos.addEventListener("change", () => {
      renderizarCarrinho(handleAlterarQuantidade, handleRemoverItem);
    });
  }

  // Botão de finalizar compra
  if (DOM.btnFinalizarCompra) {
    DOM.btnFinalizarCompra.addEventListener("click", () => {
      const carrinho = getCarrinho();
      if (carrinho.length === 0) return;

      const usuario = getUsuarioLogado();
      if (!usuario) {
        // Exige login/cadastro fidelidade com consentimento LGPD antes da compra
        abrirModalLogin();
      } else {
        irParaTela("view-pagamento");
        processarPagamentoSimulado();
      }
    });
  }
}

// --- FLUXO DO GATEWAY DE PAGAMENTO SIMULADO (INTEGRAÇÃO EXTERNA) ---
function inicializarFluxoPagamento() {
  if (DOM.btnSimularSucesso) {
    DOM.btnSimularSucesso.addEventListener("click", () => {
      const usarPontos = DOM.cbUsarPontos ? DOM.cbUsarPontos.checked : false;
      const totais = calcularTotaisCarrinho(usarPontos);
      const novoPedido = criarPedido(totais);

      DOM.gatewayStatus.innerHTML = `
        <div class="gateway-feedback success">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#22C55E" style="margin-bottom:12px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <h3>Pagamento Aprovado!</h3>
          <p>Seu pagamento foi confirmado com sucesso pelo gateway externo.</p>
          <p>Redirecionando para acompanhamento...</p>
        </div>
      `;
      DOM.gatewayControles.classList.add("hidden");

      // Simula a cozinha do restaurante mudando os status do pedido
      atualizarStatusPedidoSimulado(novoPedido.id, (novoStatus) => {
        renderizarTimelinePedidos();
      });

      setTimeout(() => {
        irParaTela("view-status");
        if (DOM.cbUsarPontos) DOM.cbUsarPontos.checked = false; // Reseta checkbox de pontos
      }, 2500);
    });
  }

  if (DOM.btnSimularErro) {
    DOM.btnSimularErro.addEventListener("click", () => {
      DOM.gatewayStatus.innerHTML = `
        <div class="gateway-feedback error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#EF4444" style="margin-bottom:12px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <h3>Transação Recusada</h3>
          <p>O banco emissor ou a operadora do cartão negou a transação. Verifique o limite ou digite outros dados.</p>
        </div>
      `;
      // Habilita controles para tentar novamente
      DOM.gatewayControles.classList.remove("hidden");
    });
  }

  if (DOM.btnSimularConexao) {
    DOM.btnSimularConexao.addEventListener("click", () => {
      DOM.gatewayStatus.innerHTML = `
        <div class="gateway-feedback error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#EAB308" style="margin-bottom:12px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <h3>Erro de Comunicação (Timeout)</h3>
          <p>Não foi possível estabelecer conexão segura com o gateway externo de pagamentos. Verifique sua rede local.</p>
        </div>
      `;
      DOM.gatewayControles.classList.remove("hidden");
    });
  }

  if (DOM.btnVoltarCarrinho) {
    DOM.btnVoltarCarrinho.addEventListener("click", () => {
      irParaTela("view-carrinho");
    });
  }
}

function processarPagamentoSimulado() {
  DOM.gatewayControles.classList.add("hidden");
  DOM.gatewayStatus.innerHTML = `
    <div class="gateway-loading">
      <div class="spinner"></div>
      <h3>Conexão Segura Estabelecida</h3>
      <p>Solicitando autorização de pagamento ao gateway de pagamento externo...</p>
      <span class="nota-seguranca">Transação criptografada (SSL) - RU: 4769288</span>
    </div>
  `;

  // Simula a latência de rede do gateway (2.5 segundos) antes de apresentar os controladores de teste para o avaliador
  setTimeout(() => {
    DOM.gatewayStatus.innerHTML = `
      <div class="gateway-loading">
        <h3>Aguardando Resposta do Serviço Externo</h3>
        <p>Utilize as opções abaixo para simular as diferentes respostas de retorno do gateway:</p>
      </div>
    `;
    DOM.gatewayControles.classList.remove("hidden");
  }, 2500);
}
