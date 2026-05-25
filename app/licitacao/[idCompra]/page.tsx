import { prisma } from '../../../src/services/db';
import { syncLicitacaoCompleta } from '@/src/services/pncpSync';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface LicitacaoPageProps {
  params: Promise<{ idCompra: string }>;
}

export default async function LicitacaoPage({ params }: LicitacaoPageProps) {
  const { idCompra } = await params;

  let licitacao = await prisma.licitacao.findUnique({
    where: { idCompra },
    include: { itens: true, arquivos: true }
  });

  if (!licitacao) {
    notFound();
  }

  // Sincronizar caso não tenha itens nem arquivos
  if ((!licitacao.itens || licitacao.itens.length === 0) && (!licitacao.arquivos || licitacao.arquivos.length === 0)) {
    await syncLicitacaoCompleta(idCompra);
    licitacao = await prisma.licitacao.findUnique({
      where: { idCompra },
      include: { itens: true, arquivos: true }
    });
  }

  if (!licitacao) {
    notFound();
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Premium Header Banner */}
      <div className="bg-primary pt-12 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-20deg] translate-x-20" />
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center text-primary-foreground/70 hover:text-primary-foreground text-sm font-bold transition-colors group mb-4">
                <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Voltar para o Painel
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-primary-foreground text-xs font-bold uppercase tracking-widest">
                  {licitacao.modalidadeNome}
                </span>
                {licitacao.numeroCompra && (
                  <span className="px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold">
                    Nº {licitacao.numeroCompra}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
                  {licitacao.situacaoCompraNomePncp}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white leading-tight max-w-4xl">
                {licitacao.objetoCompra ? licitacao.objetoCompra.split('\n')[0] : 'Licitação sem objeto definido'}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-primary-foreground/80 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  {licitacao.orgaoEntidadeRazaoSocial}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {licitacao.unidadeOrgaoMunicipioNome} - {licitacao.unidadeOrgaoUfSigla}
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl md:min-w-[280px] w-full md:w-auto">
              <p className="text-primary-foreground/60 text-xs font-bold uppercase tracking-widest mb-1">Valor Total Estimado</p>
              <p className="text-3xl font-black text-white">{formatCurrency(licitacao.valorTotalEstimado)}</p>
              {licitacao.valorTotalHomologado && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest mb-1">Valor Homologado</p>
                  <p className="text-xl font-bold text-accent">{formatCurrency(licitacao.valorTotalHomologado)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description Card */}
            <div className="bg-card rounded-2xl shadow-premium border border-card-border overflow-hidden">
              <div className="px-6 py-4 bg-secondary/30 border-b border-card-border flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="font-bold text-foreground">Objeto Completo</h3>
              </div>
              <div className="p-8">
                <p className="text-foreground leading-relaxed text-lg whitespace-pre-wrap">{licitacao.objetoCompra || 'Nenhuma descrição detalhada fornecida.'}</p>
                {licitacao.informacaoComplementar && (
                  <div className="mt-8 p-6 bg-secondary/50 rounded-xl border border-card-border">
                    <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">Informações Complementares</h4>
                    <p className="text-sm text-muted leading-relaxed font-medium">{licitacao.informacaoComplementar}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table Card */}
            <div className="bg-card rounded-2xl shadow-premium border border-card-border overflow-hidden">
              <div className="px-6 py-4 bg-secondary/30 border-b border-card-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  </div>
                  <h3 className="font-bold text-foreground">Itens da Licitação</h3>
                </div>
                <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full uppercase">
                  {licitacao.itens.length} Itens
                </span>
              </div>

              {/* Mobile/Tablet Items Layout */}
              <div className="md:hidden divide-y divide-card-border">
                {licitacao.itens.map((item) => (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-primary">Item #{item.numeroItem}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${item.materialOuServico === 'M' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.materialOuServico === 'M' ? 'Material' : 'Serviço'}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                      {item.descricao}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {/* @ts-ignore */}
                      {item.itemMacro && (
                        <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-xs font-black text-primary uppercase tracking-tighter">
                          {/* @ts-ignore */}
                          🏷️ {item.itemMacro}
                        </span>
                      )}
                      {/* @ts-ignore */}
                      {item.categoriaGeral && (
                        <span className="px-2 py-0.5 rounded bg-secondary border border-card-border text-[10px] font-bold text-muted uppercase">
                          {/* @ts-ignore */}
                          📁 {item.categoriaGeral}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 text-xs">
                      <div>
                        <span className="text-muted font-medium">Qtd: </span>
                        <span className="font-black text-foreground">{item.quantidade} <span className="text-[10px] opacity-60 font-semibold">{item.unidadeMedida}</span></span>
                      </div>
                      <div>
                        <span className="text-muted font-medium">V. Total: </span>
                        <span className="font-black text-foreground text-sm">{formatCurrency(item.valorTotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {licitacao.itens.length === 0 && (
                  <div className="py-12 text-center text-muted font-bold italic">Nenhum item listado para esta licitação.</div>
                )}
              </div>

              {/* Desktop Items Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-card-border">
                  <thead className="bg-secondary/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-muted uppercase tracking-widest">#</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-muted uppercase tracking-widest">Descrição do Item</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-muted uppercase tracking-widest">Macro (IA)</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-muted uppercase tracking-widest">Categoria</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-muted uppercase tracking-widest">Tipo</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-muted uppercase tracking-widest">Qtd</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-muted uppercase tracking-widest">V. Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {licitacao.itens.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-black text-primary">{item.numeroItem}</td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground whitespace-normal leading-relaxed">
                          {item.descricao}
                        </td>
                        <td className="px-6 py-4 text-xs font-black text-primary uppercase italic whitespace-nowrap">
                          {/* @ts-ignore */}
                          {item.itemMacro || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-secondary text-muted uppercase border border-card-border whitespace-nowrap">
                            {/* @ts-ignore */}
                            {item.categoriaGeral || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.materialOuServico === 'M' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                            {item.materialOuServico === 'M' ? 'Material' : 'Serviço'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-muted font-bold">{item.quantidade} <span className="text-[10px] opacity-50">{item.unidadeMedida}</span></td>
                        <td className="px-6 py-4 text-right text-sm font-black text-foreground">{formatCurrency(item.valorTotal)}</td>
                      </tr>
                    ))}
                    {licitacao.itens.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted font-bold italic">Nenhum item listado para esta licitação.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Attachments Card */}
            <div className="bg-card rounded-2xl shadow-premium border border-card-border overflow-hidden">
              <div className="px-6 py-4 bg-secondary/30 border-b border-card-border flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="font-bold text-foreground">Documentos e Anexos</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {licitacao.arquivos.map((arquivo) => (
                  <div key={arquivo.id} className="p-4 border border-card-border rounded-xl hover:shadow-md transition-all group bg-secondary/10 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-0.5 rounded bg-white text-[9px] font-black text-primary uppercase border border-card-border">
                          {arquivo.tipoDocumentoNome}
                        </span>
                        <span className="text-[10px] text-muted font-bold">{formatDate(arquivo.dataPublicacaoPncp)}</span>
                      </div>
                      <h4 className="font-bold text-foreground text-sm line-clamp-2 mb-4 group-hover:text-primary transition-colors">
                        {arquivo.titulo}
                      </h4>
                    </div>
                    {arquivo.url && (
                      <a href={arquivo.url} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-card-border rounded-lg text-xs font-bold text-primary hover:bg-primary hover:text-white hover:border-primary transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download do Documento
                      </a>
                    )}
                  </div>
                ))}
                {licitacao.arquivos.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted font-bold italic">Não há documentos disponíveis para download.</div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Timeline Card */}
            <div className="bg-card rounded-2xl shadow-premium border border-card-border overflow-hidden">
              <div className="px-6 py-4 bg-secondary/30 border-b border-card-border flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-bold text-foreground">Cronograma</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-card-border">
                  <div className="relative mb-8 last:mb-0">
                    <div className="absolute -left-8 w-6 h-6 rounded-full bg-green-500 border-4 border-white shadow-sm" />
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Abertura de Propostas</p>
                    <p className="text-sm font-black text-foreground">{formatDate(licitacao.dataAberturaPropostaPncp)}</p>
                  </div>
                  <div className="relative mb-8 last:mb-0">
                    <div className="absolute -left-8 w-6 h-6 rounded-full bg-red-500 border-4 border-white shadow-sm" />
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Encerramento de Propostas</p>
                    <p className="text-sm font-black text-foreground">{formatDate(licitacao.dataEncerramentoPropostaPncp)}</p>
                  </div>
                  <div className="relative last:mb-0">
                    <div className="absolute -left-8 w-6 h-6 rounded-full bg-primary border-4 border-white shadow-sm" />
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Publicação PNCP</p>
                    <p className="text-sm font-black text-foreground">{formatDate(licitacao.dataPublicacaoPncp)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal / Disputa Card */}
            <div className="bg-card rounded-2xl shadow-premium border border-card-border overflow-hidden">
              <div className="px-6 py-4 bg-secondary/30 border-b border-card-border flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                </div>
                <h3 className="font-bold text-foreground">Regras de Disputa</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Amparo Legal</p>
                  <p className="text-sm font-bold text-foreground leading-relaxed">{licitacao.amparoLegalNome}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Modo de Disputa</p>
                  <span className="px-3 py-1 rounded bg-secondary text-primary text-[11px] font-black uppercase">
                    {licitacao.modoDisputaNomePncp || 'Não Informado'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Sigilo do Orçamento</p>
                  <p className="text-sm font-bold text-foreground">{licitacao.orcamentoSigilosoDescricao || 'Aberto'}</p>
                </div>
              </div>
            </div>

            {/* Portal PNCP Redirect Card */}
            <div className="bg-card rounded-2xl shadow-premium border border-card-border overflow-hidden">
              <div className="px-6 py-4 bg-secondary/30 border-b border-card-border flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <h3 className="font-bold text-foreground">Página da Licitação</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs font-medium text-muted leading-relaxed">
                  Acesse a publicação oficial desta licitação diretamente no Portal Nacional de Contratações Públicas (PNCP) para consultar o edital original, histórico de retificações e andamento oficial.
                </p>
                {licitacao.orgaoEntidadeCnpj && licitacao.anoCompraPncp && licitacao.sequencialCompraPncp ? (
                  <a
                    href={`https://pncp.gov.br/app/editais/${licitacao.orgaoEntidadeCnpj}/${licitacao.anoCompraPncp}/${licitacao.sequencialCompraPncp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary hover:bg-primary/95 text-white hover:text-white rounded-xl text-sm font-black transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] duration-200"
                  >
                    <span>Ir para o Portal PNCP</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-xs font-semibold">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Dados insuficientes para gerar o link do portal.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Agency Card */}
            <div className="bg-card rounded-2xl shadow-premium border border-card-border overflow-hidden">
              <div className="px-6 py-4 bg-secondary/30 border-b border-card-border flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h3 className="font-bold text-foreground">Informações do Órgão</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">CNPJ</p>
                  <p className="text-sm font-black text-foreground tabular-nums">{licitacao.orgaoEntidadeCnpj}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Unidade</p>
                  <p className="text-sm font-bold text-foreground leading-tight">{licitacao.unidadeOrgaoNomeUnidade}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Localidade</p>
                  <p className="text-sm font-bold text-foreground">{licitacao.unidadeOrgaoMunicipioNome} / {licitacao.unidadeOrgaoUfSigla}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
