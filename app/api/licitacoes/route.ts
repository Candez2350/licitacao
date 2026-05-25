import { NextResponse } from 'next/server';
import { prisma } from '../../../src/services/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const dataInicial = searchParams.get('dataInicial');
  const dataFinal = searchParams.get('dataFinal');
  const codigoModalidade = searchParams.get('codigoModalidade');
  const tipoObjeto = searchParams.get('tipoObjeto');
  const pagina = parseInt(searchParams.get('pagina') || '1', 10);
  const tamanhoPagina = parseInt(searchParams.get('tamanhoPagina') || '10', 10);
  
  try {
    const whereClause: any = {};

    if (dataInicial && dataFinal) {
      whereClause.dataEncerramentoPropostaPncp = {
        gte: new Date(`${dataInicial}T00:00:00.000Z`),
        lte: new Date(`${dataFinal}T23:59:59.999Z`),
      };
    }

    if (codigoModalidade) {
      whereClause.codigoModalidade = parseInt(codigoModalidade, 10);
    }

    if (tipoObjeto) {
      whereClause.itens = {
        some: {
          materialOuServico: tipoObjeto
        }
      };
    }

    // Always filter by RJ as requested in MVP
    whereClause.unidadeOrgaoUfSigla = 'RJ';

    // Garantir que modalidades 6 com datas nulas não sejam retornadas
    whereClause.AND = [
      {
        OR: [
          { codigoModalidade: { not: 6 } },
          {
            codigoModalidade: 6,
            dataAberturaPropostaPncp: { not: null },
            dataEncerramentoPropostaPncp: { not: null }
          }
        ]
      }
    ];

    const totalRegistros = await prisma.licitacao.count({ where: whereClause });

    const licitacoes = await prisma.licitacao.findMany({
      where: whereClause,
      orderBy: {
        dataEncerramentoPropostaPncp: 'asc'
      },
      skip: (pagina - 1) * tamanhoPagina,
      take: tamanhoPagina,
    });

    return NextResponse.json({ 
      resultado: licitacoes, 
      totalRegistros,
      totalPaginas: Math.ceil(totalRegistros / tamanhoPagina)
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar no DB:', error);
    return NextResponse.json({ error: 'Erro ao conectar ao banco de dados', details: (error as Error).message }, { status: 500 });
  }
}
