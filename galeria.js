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

// Troca automática de slide, em segundos. Use 0 para desligar.
const GALERIA_AUTOPLAY = 7;
