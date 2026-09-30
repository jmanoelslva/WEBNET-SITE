// ===== Contatos e links da WebNet — usados em todas as páginas =====

// WhatsApp: DDI + DDD + número, só dígitos — (79) 9844-1264
const WHATSAPP = "557998441264";

// Aplicativo WebNet SE nas lojas
const APP_IOS = "https://apps.apple.com/br/app/webnet-se/id6747210768";
const APP_ANDROID = "https://play.google.com/store/apps/details?id=br.com.webnetse&hl=pt_BR";

// Área do cliente pelo navegador (portal de login). Cole aqui o endereço.
// Se ficar vazio, o botão "Continuar no navegador" abre o WhatsApp.
const AREA_CLIENTE_WEB = "https://webnetse.com.br/client";

const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
