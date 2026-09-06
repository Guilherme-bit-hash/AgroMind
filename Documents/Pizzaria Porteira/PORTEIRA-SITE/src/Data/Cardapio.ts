// src/Data/Cardapio.ts

export interface MenuItem {
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
}

export interface Menu {
  pizzas: MenuItem[];
  hamburgueres: MenuItem[];
  combos: MenuItem[];
  bebidas: MenuItem[];
  sucos: MenuItem[];
  especiais: MenuItem[];
  sobremesas: MenuItem[];
}

export const cardapio: Menu = {
  pizzas: [
    {
      nome: "Mussarela",
      descricao: "mussarela, molho de tomate, orégano",
      preco: 32.90,
      categoria: "pizza"
    },
    {
      nome: "Portuguesa",
      descricao: "presunto, calabresa, ovo, cebola, pimentão, azeitonas, mussarela",
      preco: 39.90,
      categoria: "pizza"
    },
    {
      nome: "Calabresa",
      descricao: "calabresa, cebola, mussarela, orégano",
      preco: 34.90,
      categoria: "pizza"
    },
    {
      nome: "Frango com Catupiry",
      descricao: "frango desfiado, Catupiry, milho, mussarela",
      preco: 42.90,
      categoria: "pizza"
    },
    {
      nome: "Margherita",
      descricao: "mussarela, tomate, manjericão",
      preco: 36.90,
      categoria: "pizza"
    },
    {
      nome: "Quatro Queijos",
      descricao: "mussarela, provolone, gorgonzola, parmesão",
      preco: 42.90,
      categoria: "pizza"
    }
  ],

  hamburgueres: [
    {
      nome: "Clássico",
      descricao: "150g de carne, queijo cheddar, alface, tomate, maionese, molho especial",
      preco: 26.90,
      categoria: "hamburguer"
    },
    {
      nome: "Porteira",
      descricao: "180g de carne, bacon, queijo cheddar, cebola caramelizada, alface, tomate",
      preco: 29.90,
      categoria: "hamburguer"
    },
    {
      nome: "Texano",
      descricao: "180g de carne, queijo cheddar, cebola crispy, barbecue, bacon, alface",
      preco: 31.90,
      categoria: "hamburguer"
    },
    {
      nome: "Vegetariano",
      descricao: "",
      preco: 24.90,
      categoria: "hamburguer"
    }
  ],

  combos: [
    {
      nome: "Combo Pizza",
      descricao: "1 Pizza Grande + 1 Refrigerante (litro)",
      preco: 0, // Valor não especificado na imagem
      categoria: "combo"
    },
    {
      nome: "Combo Duplo Clássico",
      descricao: "2 Clássico Burgers + 1 porção de batata frita + 2 Refrigerantes (lata)",
      preco: 0,
      categoria: "combo"
    },
    {
      nome: "Combo Porteira & Texano",
      descricao: "1 Porteira Burger + 1 Texano Burger + 1 porção de batata frita + 2 Refrigerantes (lata)",
      preco: 0,
      categoria: "combo"
    }
  ],

  bebidas: [
    {
      nome: "Refrigerante (lata)",
      descricao: "",
      preco: 6.00,
      categoria: "bebida"
    },
    {
      nome: "Suco Natural",
      descricao: "",
      preco: 8.00,
      categoria: "bebida"
    },
    {
      nome: "Água sem gás 500ml",
      descricao: "",
      preco: 4.00,
      categoria: "bebida"
    },
    {
      nome: "Água com gás 500ml",
      descricao: "",
      preco: 5.00,
      categoria: "bebida"
    },
    {
      nome: "Cerveja (long neck)",
      descricao: "",
      preco: 9.00,
      categoria: "bebida"
    }
  ],

  sucos: [
    {
      nome: "Suco de Polpa (400ml)",
      descricao: "Abacaxi, Acerola, Maracujá, Morango",
      preco: 8.00,
      categoria: "suco"
    },
    {
      nome: "Suco Natural (400ml)",
      descricao: "Abacaxi, Laranja, Limão, Morango",
      preco: 8.00,
      categoria: "suco"
    }
  ],

  especiais: [
    {
      nome: "X-Burguer",
      descricao: "hamburguer, linguiça, queijo, tomate, milho, batata palha",
      preco: 17.90,
      categoria: "especial"
    },
    {
      nome: "X-Picanha",
      descricao: "hamburguer artesanal de picanha, linguiça, queijo, bacon, calabresa, vinagrete, milho, batata palha",
      preco: 22.90,
      categoria: "especial"
    }
  ],

  sobremesas: [
    {
      nome: "Pudim",
      descricao: "",
      preco: 12.00,
      categoria: "sobremesa"
    },
    {
      nome: "Mousse de Chocolate",
      descricao: "",
      preco: 10.00,
      categoria: "sobremesa"
    },
    {
      nome: "Mousse de Maracujá",
      descricao: "",
      preco: 10.00,
      categoria: "sobremesa"
    },
    {
      nome: "Petit Gâteau",
      descricao: "",
      preco: 19.90,
      categoria: "sobremesa"
    }
  ]
};