import { NextRequest, NextResponse } from 'next/server';
import { syncLicitacaoCompleta } from '@/src/services/pncpSync';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const idCompra = resolvedParams.id;
    
    if (!idCompra) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const data = await syncLicitacaoCompleta(idCompra);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erro na rota de sync:", error);
    return NextResponse.json({ error: 'Erro ao sincronizar' }, { status: 500 });
  }
}
