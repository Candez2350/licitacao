import { NextResponse } from 'next/server';
import { prisma } from '../../../src/services/db';
import { syncLicitacaoItens } from '../../../src/services/pncpSync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max duration on Vercel

export async function GET(request: Request) {
  try {
    // Validar autorização em produção
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET;
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        console.warn('[SYNC] Unauthorized sync request blocked.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Obter quantidade de dias do parâmetro de busca (padrão: 2 dias)
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam && !isNaN(parseInt(daysParam, 10)) ? Math.max(1, parseInt(daysParam, 10)) : 2;

    const today = new Date();
    const pastDays = new Date(today);
    pastDays.setDate(pastDays.getDate() - days);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const modalidades = ['05', '06']; // 05 = Pregão, 06 = Dispensa
    let totalInserted = 0;
    let totalUpdated = 0;

    const parseDateStr = (dateStr: string | null) => {
        if (!dateStr) return null;
        return new Date(dateStr);
    };

    const processLicitacoes = async (licitacoes: any[], modalidade: string) => {
      let inserted = 0;
      let updated = 0;
      
      const upsertPromises = licitacoes.map(async (licitacao) => {
        if (!licitacao.idCompra) return;

        if (modalidade === '06') {
          if (!licitacao.dataAberturaPropostaPncp || !licitacao.dataEncerramentoPropostaPncp) {
            return;
          }
        }

        const recordData = {
          numeroControlePNCP: licitacao.numeroControlePNCP,
          anoCompraPncp: licitacao.anoCompraPncp,
          sequencialCompraPncp: licitacao.sequencialCompraPncp,
          orgaoEntidadeCnpj: licitacao.orgaoEntidadeCnpj,
          orgaoSubrogadoCnpj: licitacao.orgaoSubrogadoCnpj,
          codigoOrgao: licitacao.codigoOrgao,
          orgaoEntidadeRazaoSocial: licitacao.orgaoEntidadeRazaoSocial,
          orgaoSubrogadoRazaoSocial: licitacao.orgaoSubrogadoRazaoSocial,
          orgaoEntidadeEsferaId: licitacao.orgaoEntidadeEsferaId,
          orgaoSubrogadoEsferaId: licitacao.orgaoSubrogadoEsferaId,
          orgaoEntidadePoderId: licitacao.orgaoEntidadePoderId,
          orgaoSubrogadoPoderId: licitacao.orgaoSubrogadoPoderId,
          unidadeOrgaoCodigoUnidade: licitacao.unidadeOrgaoCodigoUnidade,
          unidadeSubrogadaCodigoUnidade: licitacao.unidadeSubrogadaCodigoUnidade,
          unidadeOrgaoNomeUnidade: licitacao.unidadeOrgaoNomeUnidade,
          unidadeSubrogadaNomeUnidade: licitacao.unidadeSubrogadaNomeUnidade,
          unidadeOrgaoUfSigla: licitacao.unidadeOrgaoUfSigla,
          unidadeSubrogadaUfSigla: licitacao.unidadeSubrogadaUfSigla,
          unidadeOrgaoMunicipioNome: licitacao.unidadeOrgaoMunicipioNome,
          unidade_subrogada_municipio_nome: licitacao.unidade_subrogada_municipio_nome,
          unidadeOrgaoCodigoIbge: licitacao.unidadeOrgaoCodigoIbge,
          unidadeSubrogadaCodigoIbge: licitacao.unidadeSubrogadaCodigoIbge,
          numeroCompra: licitacao.numeroCompra,
          modalidadeIdPncp: licitacao.modalidadeIdPncp,
          codigoModalidade: licitacao.codigoModalidade,
          modalidadeNome: licitacao.modalidadeNome,
          srp: licitacao.srp,
          modoDisputaIdPncp: licitacao.modoDisputaIdPncp,
          codigoModoDisputa: licitacao.codigoModoDisputa,
          amparoLegalCodigoPncp: licitacao.amparoLegalCodigoPncp,
          amparoLegalNome: licitacao.amparoLegalNome,
          amparoLegalDescricao: licitacao.amparoLegalDescricao,
          informacaoComplementar: licitacao.informacaoComplementar,
          processo: licitacao.processo,
          objetoCompra: licitacao.objetoCompra,
          existeResultado: licitacao.existeResultado,
          orcamentoSigilosoCodigo: licitacao.orcamentoSigilosoCodigo,
          orcamentoSigilosoDescricao: licitacao.orcamentoSigilosoDescricao,
          situacaoCompraIdPncp: licitacao.situacaoCompraIdPncp,
          situacaoCompraNomePncp: licitacao.situacaoCompraNomePncp,
          tipoInstrumentoConvocatorioCodigoPncp: licitacao.tipoInstrumentoConvocatorioCodigoPncp,
          tipoInstrumentoConvocatorioNome: licitacao.tipoInstrumentoConvocatorioNome,
          modoDisputaNomePncp: licitacao.modoDisputaNomePncp,
          valorTotalEstimado: licitacao.valorTotalEstimado,
          valorTotalHomologado: licitacao.valorTotalHomologado,
          dataInclusaoPncp: parseDateStr(licitacao.dataInclusaoPncp),
          dataAtualizacaoPncp: parseDateStr(licitacao.dataAtualizacaoPncp),
          dataPublicacaoPncp: parseDateStr(licitacao.dataPublicacaoPncp),
          dataAberturaPropostaPncp: parseDateStr(licitacao.dataAberturaPropostaPncp),
          dataEncerramentoPropostaPncp: parseDateStr(licitacao.dataEncerramentoPropostaPncp),
          contratacaoExcluida: licitacao.contratacaoExcluida,
        };

        try {
          const result = await prisma.licitacao.upsert({
            where: { idCompra: licitacao.idCompra },
            update: recordData,
            create: {
              idCompra: licitacao.idCompra,
              ...recordData
            },
            include: {
              _count: {
                select: { itens: true }
              }
            }
          });

          // Sincronizar itens se não existirem (essencial para o filtro de Material/Serviço)
          if (result._count.itens === 0 && licitacao.orgaoEntidadeCnpj) {
            await syncLicitacaoItens(
              licitacao.idCompra,
              licitacao.orgaoEntidadeCnpj,
              licitacao.anoCompraPncp,
              licitacao.sequencialCompraPncp
            );
          }

          if (result.createdAt.getTime() === result.updatedAt.getTime()) {
            inserted++;
          } else {
            updated++;
          }
        } catch (err) {
          console.error(`[SYNC] Failed to upsert ${licitacao.idCompra}:`, err);
        }
      });

      // Process in batches of 10 to avoid overwhelming SQLite
      for (let i = 0; i < upsertPromises.length; i += 10) {
        await Promise.all(upsertPromises.slice(i, i + 10));
      }
      
      return { inserted, updated };
    };

    const fetchPage = async (modalidade: string, page: number) => {
      const params = new URLSearchParams({
        pagina: page.toString(),
        tamanhoPagina: '100',
        dataPublicacaoPncpInicial: formatDate(pastDays),
        dataPublicacaoPncpFinal: formatDate(today),
        codigoModalidade: modalidade,
        unidadeOrgaoUfSigla: 'RJ'
      });
      const url = `https://dadosabertos.compras.gov.br/modulo-contratacoes/1_consultarContratacoes_PNCP_14133?${params.toString()}`;
      console.log(`[SYNC] Fetching ${modalidade} page ${page} from: ${url}`);
      const res = await fetch(url, { headers: { 'Accept': '*/*' } });
      if (!res.ok) {
        if (res.status === 404) return { resultado: [], totalPaginas: 0 };
        throw new Error(`API error ${res.status}`);
      }
      return await res.json();
    };

    for (const modalidade of modalidades) {
      console.log(`[SYNC] Starting modalidade ${modalidade}...`);
      
      // Fetch page 1 to get totalPages
      const firstPageData = await fetchPage(modalidade, 1);
      const licitacoes = firstPageData.resultado || [];
      const totalPages = firstPageData.totalPaginas || 1;
      
      const { inserted, updated } = await processLicitacoes(licitacoes, modalidade);
      totalInserted += inserted;
      totalUpdated += updated;

      // Fetch remaining pages sequentially but processing faster
      for (let page = 2; page <= totalPages; page++) {
        try {
          const pageData = await fetchPage(modalidade, page);
          const pageLicitacoes = pageData.resultado || [];
          const { inserted: ins, updated: upd } = await processLicitacoes(pageLicitacoes, modalidade);
          totalInserted += ins;
          totalUpdated += upd;
        } catch (e) {
          console.error(`[SYNC] Error on page ${page} modalidade ${modalidade}:`, e);
        }
      }
    }

    const message = `Sync completed. ${totalInserted} new inserted, ${totalUpdated} updated.`;
    console.log(`[SYNC] ${message}`);
    return NextResponse.json({ success: true, message, insertedCount: totalInserted, updatedCount: totalUpdated });

  } catch (error) {
    console.error('[SYNC] Fatal error during sync:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  }
}
