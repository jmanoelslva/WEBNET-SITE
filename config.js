// ===== Contatos e links da WebNet — usados em todas as páginas =====

// WhatsApp: DDI + DDD + número, só dígitos — (79) 9844-1264
const WHATSAPP = "557998441264";

// Aplicativo WebNet SE nas lojas
const APP_IOS = "https://apps.apple.com/br/app/webnet-se/id6747210768";
const APP_ANDROID = "https://play.google.com/store/apps/details?id=br.com.webnetse&hl=pt_BR";

// Área do cliente pelo navegador (portal de login). Cole aqui o endereço.
// Se ficar vazio, o botão "Continuar no navegador" abre o WhatsApp.
const AREA_CLIENTE_WEB = "https://webnetse.com.br/client";

// ===== Rodapé =====
// Contrato de prestação de serviço: coloque o PDF na pasta docs/ e informe o caminho,
// ex.: "docs/contrato-webnet.pdf". Vazio = o link não aparece.
const CONTRATO_URL = "";
// "Trabalhe conosco": abre um e-mail já com o assunto preenchido.
const TRABALHE_CONOSCO_EMAIL = "gerente@webnetprovedor.com";

// ===== Aviso no topo do site (manutenção, instabilidade ou comunicado) =====
// Para ligar, use ativo: true. O aviso some sozinho depois da data em "ate".
// tipo: "manutencao" (amarelo), "instabilidade" (vermelho) ou "info" (azul).
const AVISO = {
  ativo: false,
  tipo: "manutencao",
  texto: "Manutenção programada em Telha nesta quinta (02/10), das 14h às 16h. A internet pode oscilar nesse período.",
  ate: "2026-10-02T16:00",   // data e hora de Brasília em que o aviso deixa de aparecer ("" = sem prazo)
};

// ===== Acessibilidade =====
// Tradutor de Libras do governo federal (VLibras): botão azul na lateral da tela.
const VLIBRAS_ATIVO = true;

// ===== Depoimentos =====
// Use SOMENTE depoimentos reais, com autorização de quem escreveu. Com ativo: false (ou lista vazia),
// a seção não aparece. O link de avaliação leva à página da WebNet no Google Maps.
const DEPOIMENTOS = {
  ativo: false,
  avaliarGoogleUrl: "",   // ex.: link "Escrever avaliação" do Perfil da Empresa no Google
  lista: [
    // { nome: "Nome do cliente", cidade: "Propriá", texto: "Depoimento autorizado pelo cliente." },
  ],
};

// ===== Teste de velocidade =====
// Endereço do teste de velocidade. Se instalar o LibreSpeed no servidor da WebNet
// (veja DEPLOY.md), troque por ele, ex.: "https://velocidade.webnetse.com.br".
const TESTE_VELOCIDADE_URL = "https://fast.com/pt/";

// ===== Estatísticas de acesso (sem cookies) =====
// Opcional. Crie uma conta gratuita em https://www.goatcounter.com e informe só o código,
// ex.: "webnet" para https://webnet.goatcounter.com. Vazio = nenhuma estatística é coletada.
const ESTATISTICAS_GOATCOUNTER = "";

// ===== Planos empresariais =====
// ATENÇÃO: textos de EXEMPLO. Ajuste aos serviços reais ou use ativo: false para esconder.
const PLANOS_EMPRESA = {
  ativo: true,
  titulo: "Internet para empresas",
  descricao: "Soluções para comércios, escritórios e empresas de Propriá e região, com atendimento dedicado.",
  itens: [
    { titulo: "Planos sob medida",       texto: "Velocidade dimensionada para a sua operação." },
    { titulo: "Atendimento prioritário", texto: "Canal direto com o suporte técnico." },
    { titulo: "IP fixo",                 texto: "Para câmeras, servidores e acesso remoto (consulte)." },
    { titulo: "Link dedicado",           texto: "Banda garantida para quem não pode parar (consulte)." },
  ],
};

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
