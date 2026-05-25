import { LicitacaoFiltros, Licitacao } from '../types/licitacao';

export interface FetchLicitacoesResult {
  resultado: Licitacao[];
  totalRegistros: number;
  totalPaginas: number;
}

export async function fetchLicitacoes(filtros: LicitacaoFiltros): Promise<FetchLicitacoesResult> {
  try {
    const baseUrl = '/api/licitacoes';
    
    // Format dates to YYYY-MM-DD
    const formatDate = (date: string | Date) => {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    const params = new URLSearchParams({
      pagina: (filtros.pagina || 1).toString(),
      tamanhoPagina: (filtros.tamanhoPagina || 10).toString(),
      dataInicial: formatDate(filtros.dataInicial),
      dataFinal: formatDate(filtros.dataFinal),
    });

    if (filtros.codigoModalidade) {
      params.append('codigoModalidade', filtros.codigoModalidade.toString());
    }

    if (filtros.tipoObjeto) {
      params.append('tipoObjeto', filtros.tipoObjeto);
    }

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    
    if (response.status === 404 || response.status >= 500) {
      return { resultado: [], totalRegistros: 0, totalPaginas: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erro na API: ${response.status} - ${errorData.details || response.statusText}`);
    }

    const data = await response.json();
    return {
      resultado: data.resultado || [],
      totalRegistros: data.totalRegistros || 0,
      totalPaginas: data.totalPaginas || 0
    };
  } catch (error) {
    console.error('Erro ao buscar licitações:', error);
    return { resultado: [], totalRegistros: 0, totalPaginas: 0 };
  }
}
