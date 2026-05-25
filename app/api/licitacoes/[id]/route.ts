import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/services/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const idCompra = resolvedParams.id;
    
    if (!idCompra) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const licitacao = await prisma.licitacao.findUnique({
      where: { idCompra },
      include: {
        itens: true,
        arquivos: true
      }
    });

    if (!licitacao) {
      return NextResponse.json({ error: 'Licitação não encontrada no banco' }, { status: 404 });
    }

    return NextResponse.json(licitacao);
  } catch (error) {
    console.error("Erro ao buscar licitacao:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
