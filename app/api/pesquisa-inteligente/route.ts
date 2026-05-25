import { prisma } from '@/src/services/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get('categoria');
  const macro = searchParams.get('macro');

  try {
    const licitacoes = await prisma.licitacao.findMany({
      where: {
        itens: {
          some: {
            ...(categoria && categoria !== 'Todas' && { categoriaGeral: categoria }),
            // @ts-ignore
            ...(macro && macro !== 'Todos' && { itemMacro: macro }),
            // @ts-ignore
            statusCategorizacao: "CONCLUIDO"
          }
        }
      },
      include: {
        itens: {
          where: {
            ...(categoria && categoria !== 'Todas' && { categoriaGeral: categoria }),
            // @ts-ignore
            ...(macro && macro !== 'Todos' && { itemMacro: macro }),
            // @ts-ignore
            statusCategorizacao: "CONCLUIDO"
          }
        }
      },
      orderBy: {
        dataAberturaPropostaPncp: 'desc'
      },
      take: 50 
    });

    return NextResponse.json(licitacoes);
  } catch (error: any) {
    console.error("Erro na busca inteligente:", error);
    return NextResponse.json({ error: "Erro na busca", details: error.message }, { status: 500 });
  }
}
