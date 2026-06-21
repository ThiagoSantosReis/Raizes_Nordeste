/**
 * Banco de Dados Mockado (Raízes do Nordeste)
 * RU do Aluno: 4769288
 */

export const UNIDADES = [
  {
    id: "recife",
    nome: "Recife - Marco Zero",
    cidade: "Recife",
    estado: "PE",
    telefone: "(81) 3224-1020",
    endereco: "Av. Alfredo Lisboa, s/n - Bairro do Recife",
    tipoCozinha: "Completa",
    funcionamento: "Todos os dias, das 07h às 22h"
  },
  {
    id: "salvador",
    nome: "Salvador - Barra",
    cidade: "Salvador",
    estado: "BA",
    telefone: "(71) 3264-3040",
    endereco: "Av. Oceanica, 1402 - Barra",
    tipoCozinha: "Completa",
    funcionamento: "Todos os dias, das 07h às 23h"
  },
  {
    id: "fortaleza",
    nome: "Fortaleza - Meireles",
    cidade: "Fortaleza",
    estado: "CE",
    telefone: "(85) 3242-5060",
    endereco: "Av. Beira Mar, 2500 - Meireles",
    tipoCozinha: "Reduzida",
    funcionamento: "Segunda a Sábado, das 08h às 21h"
  }
];

export const CARDAPIO = [
  // --- TAPIOCAS ---
  {
    id: "tap_queijo",
    nome: "Tapioca com Queijo Coalho",
    categoria: "tapiocas",
    descricao: "Tapioca tradicional recheada com queijo coalho grelhado na chapa e manteiga de garrafa.",
    preco: 14.90,
    pontosFidelidade: 15,
    imagem: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
    disponibilidade: ["recife", "salvador", "fortaleza"],
    sazonal: false
  },
  {
    id: "tap_carne_sol",
    nome: "Tapioca de Carne de Sol com Nata",
    categoria: "tapiocas",
    descricao: "Tapioca recheada com carne de sol desfiada e salteada na manteiga de garrafa, finalizada com nata fresca.",
    preco: 21.90,
    pontosFidelidade: 22,
    imagem: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    disponibilidade: ["recife", "salvador"], // Cozinha reduzida de Fortaleza não faz carne de sol desfiada na hora
    sazonal: false
  },
  {
    id: "tap_cartola",
    nome: "Tapioca Cartola",
    categoria: "tapiocas",
    descricao: "Tapioca doce recheada com banana frita, queijo coalho derretido, açúcar e canela.",
    preco: 16.90,
    pontosFidelidade: 17,
    imagem: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80",
    disponibilidade: ["recife", "salvador", "fortaleza"],
    sazonal: false
  },

  // --- CUSCUZ ---
  {
    id: "cus_manteiga",
    nome: "Cuscuz na Manteiga de Garrafa",
    categoria: "cuscuz",
    descricao: "Cuscuz de milho tradicional, cozido no vapor, servido quentinho com generosa manteiga de garrafa da casa.",
    preco: 9.90,
    pontosFidelidade: 10,
    imagem: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=600&q=80",
    disponibilidade: ["recife", "salvador", "fortaleza"],
    sazonal: false
  },
  {
    id: "cus_completo",
    nome: "Cuscuz Completo Nordestino",
    categoria: "cuscuz",
    descricao: "Cuscuz de milho molhadinho, acompanhado de queijo coalho grelhado, ovo frito e carne de sol picadinha.",
    preco: 22.90,
    pontosFidelidade: 23,
    imagem: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    disponibilidade: ["recife", "salvador"],
    sazonal: false
  },

  // --- REGIONAIS E SAZONAIS ---
  {
    id: "bolo_macaxeira",
    nome: "Bolo de Macaxeira com Coco",
    categoria: "regionais",
    descricao: "Fatia generosa de bolo artesanal de macaxeira ralada com coco fresco queimado.",
    preco: 8.50,
    pontosFidelidade: 8,
    imagem: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=600&q=80",
    disponibilidade: ["recife", "salvador", "fortaleza"],
    sazonal: false
  },
  {
    id: "canjica_junina",
    nome: "Canjica Nordestina com Canela (Sazonal)",
    categoria: "regionais",
    descricao: "Creme de milho verde tradicional cozido com leite de coco e polvilhado com canela em pó. Item sazonal de São João.",
    preco: 11.90,
    pontosFidelidade: 12,
    imagem: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    disponibilidade: ["recife", "salvador"], // Apenas em lojas com cozinha completa no período festivo
    sazonal: true
  },

  // --- BEBIDAS ---
  {
    id: "cafe_coado",
    nome: "Café Coado na Hora",
    categoria: "bebidas",
    descricao: "Café especial coado individualmente na mesa do cliente. Acompanhamento perfeito para o cuscuz.",
    preco: 6.00,
    pontosFidelidade: 6,
    imagem: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
    disponibilidade: ["recife", "salvador", "fortaleza"],
    sazonal: false
  },
  {
    id: "suco_caju",
    nome: "Suco Natural de Caju",
    categoria: "bebidas",
    descricao: "Suco natural feito com a polpa de cajus selecionados do Nordeste. Muito refrescante.",
    preco: 9.00,
    pontosFidelidade: 9,
    imagem: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    disponibilidade: ["recife", "salvador", "fortaleza"],
    sazonal: false
  }
];

// Transações e Histórico Administrativo Fictício (Auditoria do Franqueado/Matriz)
export const DADOS_ADMINISTRATIVOS = {
  vendasTotais: 145890.75,
  vendasPorRegiao: [
    { regiao: "Pernambuco (Recife)", valor: 68450.30, transacoes: 2840 },
    { regiao: "Bahia (Salvador)", valor: 48920.45, transacoes: 1950 },
    { regiao: "Ceará (Fortaleza)", valor: 28520.00, transacoes: 1250 }
  ],
  produtosMaisVendidos: [
    { nome: "Cuscuz na Manteiga", quantidade: 1420 },
    { nome: "Tapioca com Queijo Coalho", quantidade: 1105 },
    { nome: "Café Coado na Hora", quantidade: 980 },
    { nome: "Bolo de Macaxeira", quantidade: 760 }
  ],
  logsAuditoria: [
    { id: "AUD-001", data: "2026-06-20 10:15", operador: "Gerente Recife", acao: "Desconto Concedido", detalhes: "Desconto de 15% para cliente fidelidade com erro no leitor." },
    { id: "AUD-002", data: "2026-06-20 11:20", operador: "Supervisor Matriz", acao: "Alteração de Estoque", detalhes: "Ajuste de inventário manual: -10kg de queijo coalho devido a perda." },
    { id: "AUD-003", data: "2026-06-20 11:45", operador: "Caixa Salvador", acao: "Cancelamento de Pedido", detalhes: "Pedido #9283 cancelado: Cliente desistiu antes do preparo." },
    { id: "AUD-004", data: "2026-06-20 12:02", operador: "Gerente Fortaleza", acao: "Estorno de Pagamento", detalhes: "Estorno manual de R$ 22,90 devido a falha de comunicação com gateway de cartão." }
  ]
};
