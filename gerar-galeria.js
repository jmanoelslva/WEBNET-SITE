// Atualiza galeria.js com todas as imagens da pasta fotos/.
// Uso: dê dois cliques em atualizar-galeria.bat (ou rode: node gerar-galeria.js)
//
// - Imagens novas entram no início do carrossel (as mais recentes primeiro).
// - Imagens que já estavam na lista mantêm título, texto, link e posição.
// - Imagens apagadas da pasta saem da lista.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = __dirname;
const PASTA = path.join(RAIZ, "fotos");
const ARQUIVO = path.join(RAIZ, "galeria.js");
const FORMATOS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg", ".bmp"];

// Lê a lista atual (se existir) para preservar textos e ordem
let atual = [];
let autoplay = 7;
if (fs.existsSync(ARQUIVO)) {
  const ctx = {};
  vm.runInNewContext(fs.readFileSync(ARQUIVO, "utf8") + "\n;this.G = GALERIA; this.A = GALERIA_AUTOPLAY;", ctx);
  atual = Array.isArray(ctx.G) ? ctx.G : [];
  if (typeof ctx.A === "number") autoplay = ctx.A;
}

const arquivos = fs.readdirSync(PASTA)
  .filter((f) => FORMATOS.includes(path.extname(f).toLowerCase()))
  .map((f) => ({ imagem: `fotos/${f}`, data: fs.statSync(path.join(PASTA, f)).mtimeMs }));
const existentes = new Set(arquivos.map((a) => a.imagem));

// Descrição automática a partir do nome do arquivo: "inauguracao-bairro-novo.jpg" -> "Inauguracao bairro novo"
// Nomes sem significado (códigos, "Captura de Tela", "IMG_1234"...) viram uma descrição genérica.
const GENERICO = /^([0-9a-f]{12,}|captura de tela.*|screenshot.*|img[\s_-]?\d+.*|dsc[\s_-]?\d+.*|whatsapp image.*|\d+)$/i;
const descricao = (img) => {
  const nome = path.basename(img, path.extname(img)).replace(/[-_]+/g, " ").trim();
  if (GENERICO.test(nome)) return "Novidade da WebNet";
  return nome.charAt(0).toUpperCase() + nome.slice(1);
};

const mantidos = atual.filter((g) => existentes.has(g.imagem)).map(({ tipo, ...resto }) => resto);
const conhecidos = new Set(mantidos.map((g) => g.imagem));
const novos = arquivos
  .filter((a) => !conhecidos.has(a.imagem))
  .sort((a, b) => b.data - a.data)
  .map((a) => ({ imagem: a.imagem, alt: descricao(a.imagem) }));

const lista = [...novos, ...mantidos];

const campo = (k, v) => `    ${k}: ${JSON.stringify(v)},`;
const blocos = lista.map((g) => ["  {", ...Object.entries(g).map(([k, v]) => campo(k, v)), "  },"].join("\n"));

const saida = `// ===== Galeria de novidades (carrossel) =====
//
// No servidor (nginx ou Apache com listagem da pasta ativada, veja DEPLOY.md):
//   basta enviar as imagens para a pasta fotos/. O carrossel lê a pasta sozinho,
//   em qualquer formato (JPG, PNG, WEBP, GIF, AVIF, SVG) e proporção.
//
// Sem listagem da pasta (ou para testar no Windows):
//   dê dois cliques em atualizar-galeria.bat, que preenche a lista abaixo.
//
// Campos opcionais em cada bloco:
//   alt     descrição da foto para quem não enxerga
//   titulo  texto em destaque sobre a foto
//   texto   uma ou duas frases
//   link    endereço para um botão. Use "whatsapp" para abrir o WhatsApp da empresa.
//   botao   texto do botão (padrão "Saiba mais")
// Fotos sem título, texto ou link aparecem sem legenda. Esses campos são mantidos pelo atualizar-galeria.bat.

const GALERIA = [${blocos.length ? "\n" + blocos.join("\n") + "\n" : ""}];

// Troca automática de slide, em segundos. Use 0 para desligar.
const GALERIA_AUTOPLAY = ${autoplay};
`;

fs.writeFileSync(ARQUIVO, saida);
console.log(`Galeria atualizada: ${lista.length} imagem(ns) (${novos.length} nova(s)).`);
lista.forEach((g, i) => console.log(`  ${i + 1}. ${g.imagem}`));
