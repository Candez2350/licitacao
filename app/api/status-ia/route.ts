import { prisma } from '@/src/services/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const count = await prisma.item.count({
      where: {
        // @ts-ignore
        statusCategorizacao: 'PENDENTE'
      }
    });
    return NextResponse.json({ pendentes: count });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar status" }, { status: 500 });
  }
}
