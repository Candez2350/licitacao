import { prisma } from '@/src/services/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Busca todas as categorias e itens macros únicos que foram processados
    const items = await prisma.item.findMany({
      where: {
        // @ts-ignore
        statusCategorizacao: "CONCLUIDO",
        // @ts-ignore
        categoriaGeral: { not: null },
        // @ts-ignore
        itemMacro: { not: null }
      },
      select: {
        // @ts-ignore
        categoriaGeral: true,
        // @ts-ignore
        itemMacro: true
      },
      // @ts-ignore
      distinct: ['categoriaGeral', 'itemMacro']
    });

    // Agrupa os itens por categoria
    const dictionary: Record<string, string[]> = {};

    items.forEach(item => {
      // @ts-ignore
      const cat = item.categoriaGeral as string;
      // @ts-ignore
      const mac = item.itemMacro as string;
      
      if (!cat || !mac) return;

      if (!dictionary[cat]) {
        dictionary[cat] = [];
      }
      
      if (!dictionary[cat].includes(mac)) {
        dictionary[cat].push(mac);
      }
    });

    return NextResponse.json(dictionary);
  } catch (error: any) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json({ error: "Erro ao buscar categorias", details: error.message }, { status: 500 });
  }
}
