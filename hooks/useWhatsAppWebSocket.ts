// Estado/conexão movidos para o WhatsAppProvider (raiz do app) para que o
// progresso da cobrança sobreviva à troca de página. Mantido aqui como
// re-export para não quebrar os imports existentes.
export { useWhatsAppWebSocket } from '@/providers/WhatsAppProvider';
