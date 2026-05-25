import { prisma } from './db';

// Utils para lidar com a API do PNCP
const PNCP_BASE_URL = 'https://pncp.gov.br/api/pncp/v1';

export async function syncLicitacaoItens(licitacaoId: string, cnpj: string, ano: number, sequencial: number) {
  try {
    const response = await fetch(`${PNCP_BASE_URL}/orgaos/${cnpj}/compras/${ano}/${sequencial}/itens?tamanhoPagina=500`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      if (response.status === 404) return []; // Ainda não tem itens
      throw new Error(`Erro ao buscar itens: ${response.statusText}`);
    }

    const data = await response.json();
    const itens = data.resultado || data || [];

    if (!Array.isArray(itens) || itens.length === 0) return [];

    // Processar e salvar no banco
    const itensSalvos = [];
    for (const item of itens) {
      const savedItem = await prisma.item.upsert({
        where: { id: item.id?.toString() || `${licitacaoId}-${item.numeroItem}` },
        update: {
          numeroItem: item.numeroItem,
          descricao: item.descricao,
          materialOuServico: item.materialOuServico,
          materialOuServicoNome: item.materialOuServicoNome,
          valorUnitarioEstimado: item.valorUnitarioEstimado,
          valorTotal: item.valorTotal,
          quantidade: item.quantidade,
          unidadeMedida: item.unidadeMedida,
          criterioJulgamentoNome: item.criterioJulgamentoNome,
          situacaoCompraItemNome: item.situacaoCompraItemNome,
          dataInclusao: item.dataInclusao ? new Date(item.dataInclusao) : null,
        },
        create: {
          id: item.id?.toString() || `${licitacaoId}-${item.numeroItem}`,
          licitacaoId,
          numeroItem: item.numeroItem,
          descricao: item.descricao,
          materialOuServico: item.materialOuServico,
          materialOuServicoNome: item.materialOuServicoNome,
          valorUnitarioEstimado: item.valorUnitarioEstimado,
          valorTotal: item.valorTotal,
          quantidade: item.quantidade,
          unidadeMedida: item.unidadeMedida,
          criterioJulgamentoNome: item.criterioJulgamentoNome,
          situacaoCompraItemNome: item.situacaoCompraItemNome,
          dataInclusao: item.dataInclusao ? new Date(item.dataInclusao) : null,
        }
      });
      itensSalvos.push(savedItem);
    }

    return itensSalvos;
  } catch (error) {
    console.error("Erro no syncLicitacaoItens:", error);
    return [];
  }
}

export async function syncLicitacaoArquivos(licitacaoId: string, cnpj: string, ano: number, sequencial: number) {
  try {
    const response = await fetch(`${PNCP_BASE_URL}/orgaos/${cnpj}/compras/${ano}/${sequencial}/arquivos?tamanhoPagina=100`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      if (response.status === 404) return []; // Ainda não tem arquivos
      throw new Error(`Erro ao buscar arquivos: ${response.statusText}`);
    }

    const arquivos = await response.json();
    
    if (!Array.isArray(arquivos) || arquivos.length === 0) return [];

    // Processar e salvar no banco
    const arquivosSalvos = [];
    for (const arquivo of arquivos) {
      const savedArquivo = await prisma.arquivo.upsert({
        where: { id: arquivo.id?.toString() || `${licitacaoId}-${arquivo.titulo}` },
        update: {
          uri: arquivo.uri,
          url: arquivo.url,
          statusAtivo: arquivo.statusAtivo,
          dataPublicacaoPncp: arquivo.dataPublicacaoPncp ? new Date(arquivo.dataPublicacaoPncp) : null,
          titulo: arquivo.titulo,
          tipoDocumentoNome: arquivo.tipoDocumentoNome,
          tipoDocumentoDescricao: arquivo.tipoDocumentoDescricao,
        },
        create: {
          id: arquivo.id?.toString() || `${licitacaoId}-${arquivo.titulo}`,
          licitacaoId,
          uri: arquivo.uri,
          url: arquivo.url,
          statusAtivo: arquivo.statusAtivo,
          dataPublicacaoPncp: arquivo.dataPublicacaoPncp ? new Date(arquivo.dataPublicacaoPncp) : null,
          titulo: arquivo.titulo,
          tipoDocumentoNome: arquivo.tipoDocumentoNome,
          tipoDocumentoDescricao: arquivo.tipoDocumentoDescricao,
        }
      });
      arquivosSalvos.push(savedArquivo);
    }

    return arquivosSalvos;
  } catch (error) {
    console.error("Erro no syncLicitacaoArquivos:", error);
    return [];
  }
}

export async function syncLicitacaoCompleta(licitacaoId: string) {
  const licitacao = await prisma.licitacao.findUnique({
    where: { idCompra: licitacaoId }
  });

  if (!licitacao) {
    throw new Error('Licitação não encontrada no banco de dados');
  }

  const { orgaoEntidadeCnpj, anoCompraPncp, sequencialCompraPncp } = licitacao;

  if (!orgaoEntidadeCnpj || !anoCompraPncp || !sequencialCompraPncp) {
    console.log("Faltam dados essenciais para sync da licitação:", licitacaoId);
    return { itens: [], arquivos: [] };
  }

  const itens = await syncLicitacaoItens(licitacaoId, orgaoEntidadeCnpj, anoCompraPncp, sequencialCompraPncp);
  const arquivos = await syncLicitacaoArquivos(licitacaoId, orgaoEntidadeCnpj, anoCompraPncp, sequencialCompraPncp);

  return { itens, arquivos };
}
