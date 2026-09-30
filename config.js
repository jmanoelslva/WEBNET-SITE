// ===== Contatos e links da WebNet — usados em todas as páginas =====

// WhatsApp: DDI + DDD + número, só dígitos — (79) 9844-1264
const WHATSAPP = "557998441264";

// Aplicativo WebNet SE nas lojas
const APP_IOS = "https://apps.apple.com/br/app/webnet-se/id6747210768";
const APP_ANDROID = "https://play.google.com/store/apps/details?id=br.com.webnetse&hl=pt_BR";

// Área do cliente pelo navegador (portal de login). Cole aqui o endereço.
// Se ficar vazio, o botão "Continuar no navegador" abre o WhatsApp.
const AREA_CLIENTE_WEB = "https://webnetse.com.br/client";

// ===== SVA de e-books =====
// ATENÇÃO: nome, números e textos abaixo são FICTÍCIOS, só para mostrar a estrutura.
// Troque pelos dados do fornecedor contratado. Para esconder tudo, use ativo: false.
const SVA_EBOOKS = {
  ativo: true,
  nome: "Estante Digital",                       // nome fictício do serviço
  chamada: "E-books inclusos no seu plano",
  descricao: "Milhares de livros digitais para ler no celular, no tablet ou no computador, sem pagar nada a mais na sua fatura.",
  planos: [300, 500, 600, 800],                  // velocidades (em Mega) que incluem o serviço
  destaques: [
    { icone: "livros",      titulo: "+ de 5 mil títulos",  texto: "Romances, infantis, autoajuda, negócios e concursos." },
    { icone: "download",    titulo: "Leia sem internet",   texto: "Baixe o livro e continue a leitura em qualquer lugar." },
    { icone: "dispositivos",titulo: "Em qualquer tela",    texto: "Celular, tablet ou computador, com a leitura sincronizada." },
    { icone: "familia",     titulo: "Para a família toda", texto: "Até 3 perfis por assinatura, com área infantil." },
  ],
  passos: [
    "Contrate ou mude para um plano participante.",
    "Receba o convite de acesso por e-mail ou WhatsApp.",
    "Baixe o app da Estante Digital e comece a ler.",
  ],
  // Livros de exemplo exibidos na vitrine (títulos fictícios)
  vitrine: [
    { titulo: "O Rio e a Ponte",          autor: "Clara Menezes" },
    { titulo: "Receitas do Sertão",       autor: "Dona Lurdes" },
    { titulo: "Excel em 7 Dias",          autor: "Paulo Rocha" },
    { titulo: "Contos do São Francisco",  autor: "Vários autores" },
    { titulo: "Finanças para Todos",      autor: "Marina Lopes" },
    { titulo: "A Menina e o Farol",       autor: "Tiago Alves" },
  ],
};

const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
