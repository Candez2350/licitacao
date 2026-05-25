const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function runBatch() {
  const items = await prisma.item.findMany({
    where: {
      statusCategorizacao: "PENDENTE",
    },
    take: 20,
    select: {
      id: true,
      descricao: true,
    },
  });

  if (items.length === 0) return 0;

  const systemPrompt = `Você é um classificador de compras governamentais. Analise as descrições dos itens fornecidos e extraia duas informações:
'itemMacro': O nome genérico do produto (Ex: 'Unidade Disco ssd' vira 'Unidade de Disco SSD', 'Parafuso sextavado 10mm' vira 'Parafuso').
'categoriaGeral': Escolha APENAS UMA da lista: 'Equipamentos de TI e Informática', 'Materiais de Construção e Ferramentas', 'Gêneros Alimentícios', 'Serviços de Manutenção e Engenharia', 'Mobiliário e Decoração', 'Material de Escritório', 'Equipamentos Médicos e Hospitalares', 'Outros'.
Retorne APENAS um JSON no formato: { "itens": [ { "id": "id-do-item", "itemMacro": "nome", "categoriaGeral": "categoria" } ] }`;

  const response = await openai.chat.completions.create({
    model: "openrouter/owl-alpha",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(items) },
    ],
    response_format: { type: "json_object" },
  });

  let content = response.choices[0].message.content;
  if (!content) throw new Error("Resposta vazia da IA.");
  
  content = content.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(content);
  
  if (!parsed.itens || !Array.isArray(parsed.itens)) {
     throw new Error("Formato de resposta inválido.");
  }

  for (const res of parsed.itens) {
    if (!res.id) continue;
    await prisma.item.update({
      where: { id: res.id },
      data: {
        itemMacro: res.itemMacro || "Não identificado",
        categoriaGeral: res.categoriaGeral || "Outros",
        statusCategorizacao: "CONCLUIDO",
      },
    });
  }

  return items.length;
}

async function main() {
  console.log("=== INICIANDO CATEGORIZAÇÃO EM MASSA ===");
  let total = 0;
  let errorCount = 0;

  while (true) {
    try {
      const count = await runBatch();
      if (count === 0) {
        console.log("Nenhum item pendente restante.");
        break;
      }
      total += count;
      console.log(`[${new Date().toLocaleTimeString()}] Processados: ${total} itens...`);
      errorCount = 0; // Reseta erros se tiver sucesso
      
      // Delay de 1.5s entre lotes para evitar rate limits e gargalos
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      errorCount++;
      console.error(`Erro no lote (Tentativa ${errorCount}):`, e.message);
      
      if (errorCount > 10) {
        console.error("Muitos erros consecutivos. Abortando.");
        break;
      }
      
      // Espera maior em caso de erro
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  console.log(`=== CONCLUÍDO! TOTAL DE ${total} ITENS PROCESSADOS ===`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
