import React from 'react';
import Link from 'next/link';
import { Licitacao } from '../types/licitacao';

interface LicitacaoTableProps {
  licitacoes: Licitacao[];
  favoritos: string[];
  onToggleFavorito: (idCompra: string) => void;
}

export default function LicitacaoTable({ licitacoes, favoritos, onToggleFavorito }: LicitacaoTableProps) {
  
  const formatCurrency = (value: number | null) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  if (!licitacoes || licitacoes.length === 0) {
    return (
      <div className="bg-white p-8 text-center text-gray-500 rounded-lg shadow-sm border border-gray-200">
        Nenhuma licitação encontrada com os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile/Tablet Card Layout */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {licitacoes.map((lic) => {
          const isHighValue = (lic.valorTotalEstimado || 0) > 100000;
          const isFavorito = favoritos.includes(lic.idCompra);
          
          return (
            <div key={lic.idCompra} className="bg-card p-5 rounded-2xl border border-card-border shadow-premium flex flex-col justify-between hover:shadow-lg transition-all relative group">
              <div className="flex justify-between items-start mb-4 gap-2">
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20 max-w-[200px] truncate" title={lic.modalidadeNome || ''}>
                  {lic.modalidadeNome}
                </span>
                <button 
                  onClick={() => onToggleFavorito(lic.idCompra)}
                  className={`focus:outline-none p-1.5 rounded-full bg-secondary/50 hover:bg-secondary border border-card-border transition-all hover:scale-110 active:scale-95 ${isFavorito ? 'text-accent' : 'text-muted/40 hover:text-muted'}`}
                  title={isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isFavorito ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>

              <div className="flex-grow space-y-3">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest line-clamp-1 leading-none opacity-80" title={lic.orgaoEntidadeRazaoSocial || ''}>
                  🏢 {lic.orgaoEntidadeRazaoSocial}
                </p>
                <h4 className="font-bold text-foreground text-base leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                  {lic.objetoCompra}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 my-3 border-t border-b border-card-border/60 text-xs">
                <div>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Abertura</p>
                  <p className="font-black text-foreground/80 mt-0.5">{formatDate(lic.dataAberturaPropostaPncp)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Encerramento</p>
                  <p className="font-black text-foreground/80 mt-0.5">{formatDate(lic.dataEncerramentoPropostaPncp)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Valor Estimado</p>
                  <div className={`font-black text-base flex items-center gap-1 ${isHighValue ? 'text-green-600' : 'text-foreground'}`}>
                    {formatCurrency(lic.valorTotalEstimado)}
                    {isHighValue && (
                      <span className="text-green-500 animate-pulse" title="Alto Valor">●</span>
                    )}
                  </div>
                </div>
                
                <Link 
                  href={`/licitacao/${lic.idCompra}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-primary/20 text-xs font-black rounded-xl text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  Detalhes
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block overflow-hidden bg-card rounded-xl shadow-premium border border-card-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-card-border">
            <thead className="bg-secondary/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-widest">Ação</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-widest">Abertura</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-widest">Encerramento</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-widest">Órgão</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-widest">Objeto</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-widest">Modalidade</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-muted uppercase tracking-widest">Valor Estimado</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-muted uppercase tracking-widest">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border bg-card">
              {licitacoes.map((lic) => {
                const isHighValue = (lic.valorTotalEstimado || 0) > 100000;
                const isFavorito = favoritos.includes(lic.idCompra);
                
                return (
                  <tr key={lic.idCompra} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <button 
                        onClick={() => onToggleFavorito(lic.idCompra)}
                        className={`focus:outline-none transform transition-all hover:scale-110 active:scale-95 ${isFavorito ? 'text-accent' : 'text-muted/40 hover:text-muted'}`}
                        title={isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorito ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-muted font-medium">
                      {formatDate(lic.dataAberturaPropostaPncp)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-muted font-medium">
                      {formatDate(lic.dataEncerramentoPropostaPncp)}
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <div className="font-semibold text-foreground max-w-xs truncate" title={lic.orgaoEntidadeRazaoSocial || ''}>
                        {lic.orgaoEntidadeRazaoSocial}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <div className="text-muted line-clamp-2 leading-relaxed" title={lic.objetoCompra || ''}>
                        {lic.objetoCompra}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
                        {lic.modalidadeNome}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className={`font-bold text-sm ${isHighValue ? 'text-green-600' : 'text-foreground'}`}>
                        {formatCurrency(lic.valorTotalEstimado)}
                        {isHighValue && (
                          <span className="ml-1 inline-block text-green-500 animate-pulse" title="Alto Valor">●</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <Link 
                        href={`/licitacao/${lic.idCompra}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-1.5 border border-primary/20 text-xs font-bold rounded-lg text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
