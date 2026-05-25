import { prisma } from '@/src/services/db';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function GET() {
  try {
    // 1. Busca itens PENDENTES (até 20 por vez para não estourar contexto/tempo)
    const items = await prisma.item.findMany({
      where: {
        // @ts-ignore - Os tipos podem demorar a atualizar no IDE após o prisma generate
        statusCategorizacao: "PENDENTE",
      },
      take: 20,
      select: {
        id: true,
        descricao: true,
      },
    });

    if (items.length === 0) {
      return NextResponse.json({ message: "Nenhum item pendente encontrado.", processados: 0 });
    }

    // 2. Prepara o prompt
    const systemPrompt = `Você é um classificador de compras governamentais. Analise as descrições dos itens fornecidos e extraia duas informações:

'itemMacro': O nome genérico do produto (Ex: 'Unidade Disco ssd' vira 'Unidade de Disco SSD', 'Parafuso sextavado 10mm' vira 'Parafuso').

'categoriaGeral': Escolha APENAS UMA da lista: 'Equipamentos de TI e Informática', 'Materiais de Construção e Ferramentas', 'Gêneros Alimentícios', 'Serviços de Manutenção e Engenharia', 'Mobiliário e Decoração', 'Material de Escritório', 'Equipamentos Médicos e Hospitalares', 'Outros'.

Retorne APENAS um JSON no formato: { "itens": [ { "id": "id-do-item", "itemMacro": "nome", "categoriaGeral": "categoria" } ] }`;

    const userPrompt = JSON.stringify(items);

    // 3. Chama a API do OpenRouter
    const response = await openai.chat.completions.create({
      model: "openrouter/owl-alpha",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      // @ts-ignore - response_format might not be in the types but is supported by OpenRouter
      response_format: { type: "json_object" },
    });

    let content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Resposta vazia da IA.");
    }

    // Limpeza básica para garantir robustez (remove blocos de código se o modelo ignorar o json_object)
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON da IA:", content);
      throw new Error("A IA retornou um JSON mal formatado.");
    }

    const resultados = parsedResponse.itens;

    if (!Array.isArray(resultados)) {
      throw new Error("Formato de resposta inválido: 'itens' não é um array.");
    }

    // 4. Atualiza os itens no banco
    let atualizadosCount = 0;
    for (const res of resultados) {
      // Pequena validação para garantir que temos o ID
      if (!res.id) continue;

      await prisma.item.update({
        where: { id: res.id },
        data: {
          // @ts-ignore
          itemMacro: res.itemMacro || "Não identificado",
          // @ts-ignore
          categoriaGeral: res.categoriaGeral || "Outros",
          // @ts-ignore
          statusCategorizacao: "CONCLUIDO",
        },
      });
      atualizadosCount++;
    }

    return NextResponse.json({
      message: "Sucesso",
      processados: atualizadosCount,
      totalEncontrados: items.length
    });

  } catch (error: any) {
    console.error("Erro na rota de categorização:", error);
    return NextResponse.json(
      { error: "Erro ao processar categorização.", details: error.message },
      { status: 500 }
    );
  }
}
