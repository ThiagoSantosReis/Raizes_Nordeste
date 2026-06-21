/**
 * Gerenciador de Estados (State Management) com LocalStorage
 * RU do Aluno: 4769288
 */

const STORAGE_KEYS = {
  UNIDADE: "raizes_unidade",
  USUARIO: "raizes_usuario",
  CARRINHO: "raizes_carrinho",
  PEDIDOS: "raizes_pedidos"
};

// --- ESTADO INICIAL ---
const estado = {
  unidadeSelecionada: localStorage.getItem(STORAGE_KEYS.UNIDADE) || null,
  usuarioLogado: JSON.parse(localStorage.getItem(STORAGE_KEYS.USUARIO)) || null,
  carrinho: JSON.parse(localStorage.getItem(STORAGE_KEYS.CARRINHO)) || [],
  pedidos: JSON.parse(localStorage.getItem(STORAGE_KEYS.PEDIDOS)) || [],
  listeners: [] // Callbacks executadas quando o estado muda
};

// --- SISTEMA DE EVENTOS / OBSERVER ---
export function subscreverEstado(callback) {
  estado.listeners.push(callback);
}

function notificarMudanca() {
  estado.listeners.forEach(cb => cb({ ...estado }));
}

// --- CONTROLE DE UNIDADE ---
export function setUnidade(unidadeId) {
  estado.unidadeSelecionada = unidadeId;
  if (unidadeId) {
    localStorage.setItem(STORAGE_KEYS.UNIDADE, unidadeId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.UNIDADE);
  }
  // Se trocar de unidade, limpa o carrinho para evitar misturar pedidos de locais diferentes
  limparCarrinhoSilent();
  notificarMudanca();
}

export function getUnidadeSelecionada() {
  return estado.unidadeSelecionada;
}

// --- CONTROLE DE USUÁRIO & LGPD ---
export function logarOuCadastrarUsuario(nome, cpf, aceitouLGPD) {
  if (!aceitouLGPD) {
    throw new Error("É necessário aceitar os termos de privacidade (LGPD) para prosseguir.");
  }
  
  // Limpa o CPF para manter um padrão (apenas números)
  const cpfLimpo = cpf.replace(/\D/g, "");
  if (cpfLimpo.length !== 11) {
    throw new Error("CPF inválido. Insira 11 dígitos.");
  }

  // Verifica se já existe um usuário com esse CPF salvo no histórico para recuperar os pontos,
  // ou cria um novo perfil com 100 pontos iniciais de boas-vindas.
  const chaveHistorico = `user_points_${cpfLimpo}`;
  let pontosSalvos = parseInt(localStorage.getItem(chaveHistorico));
  
  if (isNaN(pontosSalvos)) {
    pontosSalvos = 100; // Pontos de boas-vindas
    localStorage.setItem(chaveHistorico, pontosSalvos);
  }

  const usuario = {
    nome: nome.trim(),
    cpf: cpfLimpo,
    pontos: pontosSalvos,
    aceitouLGPD: true,
    dataAceite: new Date().toISOString()
  };

  estado.usuarioLogado = usuario;
  localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuario));
  notificarMudanca();
  return usuario;
}

export function deslogarUsuario() {
  estado.usuarioLogado = null;
  localStorage.removeItem(STORAGE_KEYS.USUARIO);
  notificarMudanca();
}

export function getUsuarioLogado() {
  return estado.usuarioLogado;
}

export function atualizarPontosUsuario(pontosAdicionar, pontosRemover = 0) {
  if (!estado.usuarioLogado) return;

  const novoSaldo = Math.max(0, estado.usuarioLogado.pontos + pontosAdicionar - pontosRemover);
  estado.usuarioLogado.pontos = novoSaldo;
  
  // Salva no perfil e no histórico do CPF
  localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(estado.usuarioLogado));
  localStorage.setItem(`user_points_${estado.usuarioLogado.cpf}`, novoSaldo);
  
  notificarMudanca();
}

// --- CONTROLE DE CARRINHO ---
export function adicionarAoCarrinho(produto, quantidade = 1) {
  const itemExistente = estado.carrinho.find(item => item.id === produto.id);

  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    estado.carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      pontosFidelidade: produto.pontosFidelidade,
      imagem: produto.imagem,
      quantidade: quantidade
    });
  }

  localStorage.setItem(STORAGE_KEYS.CARRINHO, JSON.stringify(estado.carrinho));
  notificarMudanca();
}

export function alterarQuantidadeCarrinho(produtoId, novaQuantidade) {
  if (novaQuantidade <= 0) {
    estado.carrinho = estado.carrinho.filter(item => item.id !== produtoId);
  } else {
    const item = estado.carrinho.find(item => item.id === produtoId);
    if (item) {
      item.quantidade = novaQuantidade;
    }
  }

  localStorage.setItem(STORAGE_KEYS.CARRINHO, JSON.stringify(estado.carrinho));
  notificarMudanca();
}

export function removerDoCarrinho(produtoId) {
  estado.carrinho = estado.carrinho.filter(item => item.id !== produtoId);
  localStorage.setItem(STORAGE_KEYS.CARRINHO, JSON.stringify(estado.carrinho));
  notificarMudanca();
}

export function limparCarrinho() {
  limparCarrinhoSilent();
  notificarMudanca();
}

function limparCarrinhoSilent() {
  estado.carrinho = [];
  localStorage.removeItem(STORAGE_KEYS.CARRINHO);
}

export function getCarrinho() {
  return estado.carrinho;
}

export function calcularTotaisCarrinho(resgatarPontos = false) {
  const subtotal = estado.carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const totalPontosGerados = estado.carrinho.reduce((acc, item) => acc + (item.pontosFidelidade * item.quantidade), 0);
  
  let desconto = 0;
  let pontosGastos = 0;

  // Regra de resgate de pontos: Cada 50 pontos vale R$ 5,00 de desconto, limitado ao valor total da compra.
  if (resgatarPontos && estado.usuarioLogado && estado.usuarioLogado.pontos >= 50) {
    const blocosDeDesconto = Math.floor(estado.usuarioLogado.pontos / 50);
    const descontoMaximoPossivel = blocosDeDesconto * 5;
    
    if (descontoMaximoPossivel >= subtotal) {
      // Cobre toda a compra
      desconto = subtotal;
      pontosGastos = Math.ceil(subtotal / 5) * 50;
    } else {
      desconto = descontoMaximoPossivel;
      pontosGastos = blocosDeDesconto * 50;
    }
  }

  const total = Math.max(0, subtotal - desconto);

  return {
    subtotal,
    desconto,
    total,
    pontosGastos,
    totalPontosGerados
  };
}

// --- CONTROLE DE PEDIDOS ---
export function criarPedido(totais) {
  const novoPedido = {
    id: `PED-${Math.floor(100000 + Math.random() * 900000)}`,
    data: new Date().toISOString(),
    unidadeId: estado.unidadeSelecionada,
    itens: [...estado.carrinho],
    subtotal: totais.subtotal,
    desconto: totais.desconto,
    total: totais.total,
    pontosGerados: totais.totalPontosGerados,
    pontosGastos: totais.pontosGastos,
    status: "Pendente" // Pendente -> Em Preparo -> Pronto -> Retirado
  };

  estado.pedidos.unshift(novoPedido);
  localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(estado.pedidos));
  
  // Atualiza pontos do usuário fidelidade
  if (estado.usuarioLogado) {
    atualizarPontosUsuario(totais.totalPontosGerados, totais.pontosGastos);
  }

  limparCarrinhoSilent();
  notificarMudanca();
  
  return novoPedido;
}

export function atualizarStatusPedidoSimulado(pedidoId, callbackStatus) {
  const pedido = estado.pedidos.find(p => p.id === pedidoId);
  if (!pedido) return;

  const fluxos = ["Recebido", "Em Preparo", "Pronto para Retirada"];
  let step = 0;

  pedido.status = fluxos[step];
  localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(estado.pedidos));
  callbackStatus(pedido.status);

  const intervalo = setInterval(() => {
    step++;
    if (step < fluxos.length) {
      pedido.status = fluxos[step];
      localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(estado.pedidos));
      callbackStatus(pedido.status);
    } else {
      clearInterval(intervalo);
    }
  }, 7000); // 7 segundos para cada alteração de estado para simular a cozinha real
}

export function getPedidos() {
  return estado.pedidos;
}
