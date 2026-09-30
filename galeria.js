// ===== Galeria de novidades (carrossel) =====
//
// No servidor (nginx ou Apache com listagem da pasta ativada, veja DEPLOY.md):
//   basta enviar as imagens para a pasta fotos/. O carrossel lê a pasta sozinho,
//   em qualquer formato (JPG, PNG, WEBP, GIF, AVIF, SVG) e proporção.
//
// Sem listagem da pasta (ou para testar no Windows):
//   dê dois cliques em atualizar-galeria.bat, que preenche a lista abaixo.
//
// Legenda e botão (opcionais): acrescente um bloco com o caminho da imagem, por exemplo
//   {
//     imagem: "fotos/promocao-outubro.jpg",
//     alt: "Arte da promoção de outubro",   // descrição para quem não enxerga
//     titulo: "Promoção de outubro",
//     texto: "Instalação grátis no plano de 500 Mega.",
//     link: "whatsapp",                      // ou um endereço https://...
//     botao: "Quero a promoção",
//   },
// Fotos sem bloco aparecem sem legenda. Esses campos são mantidos pelo atualizar-galeria.bat.

const GALERIA = [];

// Slides de exemplo: aparecem quando ainda não há nenhuma foto na pasta fotos/,
// para o carrossel nunca ficar vazio. Pode editar ou apagar.
const GALERIA_EXEMPLOS = [
  {
    imagem: "img/novidade-ebooks.svg",
    alt: "Ilustração de uma pilha de livros",
    titulo: "Chegou a Estante Digital",
    texto: "E-books inclusos nos planos a partir de 300 Mega.",
    link: "#ebooks",
    botao: "Conhecer",
  },
  {
    imagem: "img/novidade-app.svg",
    alt: "Ilustração de um celular com o app WebNet SE",
    titulo: "Baixe o app WebNet SE",
    texto: "Faturas, 2ª via e chamados na palma da mão.",
    link: "#app",
    botao: "Baixar o app",
  },
  {
    imagem: "img/novidade-cobertura.svg",
    alt: "Ilustração de um marcador de mapa com sinal de internet",
    titulo: "Internet em Propriá e região",
    texto: "Atendemos 6 cidades. Veja se chegamos na sua rua.",
    link: "#cobertura",
    botao: "Consultar",
  },
];

// Troca automática de slide, em segundos. Use 0 para desligar.
const GALERIA_AUTOPLAY = 7;
