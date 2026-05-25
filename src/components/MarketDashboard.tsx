"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Licitacao {
  idCompra: string;
  orgaoEntidadeRazaoSocial: string;
  objetoCompra: string;
  valorTotalEstimado: number;
  dataAberturaPropostaPncp: string;
  itens: any[];
}

export default function MarketDashboard() {
  const [categoriasData, setCategoriasData] = useState<Record<string, string[]>>({});
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [macroSelecionado, setMacroSelecionado] = useState<string>('');
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadDictionary() {
      try {
        const res = await fetch('/api/categorias');
        const data = await res.json();
        setCategoriasData(data);
      } catch (e) {
        console.error("Erro ao carregar dicionário", e);
      }
    }
    loadDictionary();
  }, []);

  useEffect(() => {
    async function search() {
      if (!categoriaSelecionada) {
        setLicitacoes([]);
        return;
      }

      setLoading(true);
      try {
        const url = `/api/pesquisa-inteligente?categoria=${encodeURIComponent(categoriaSelecionada)}&macro=${encodeURIComponent(macroSelecionado)}`;
        const res = await fetch(url);
        const data = await res.json();
        setLicitacoes(data);
      } catch (e) {
        console.error("Erro na busca inteligente", e);
      } finally {
        setLoading(false);
      }
    }
    search();
  }, [categoriaSelecionada, macroSelecionado]);

  const formatCurrency = (value: number | null) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar de Filtros */}
      <aside className="w-full md:w-80 space-y-6">
        <div className="bg-card rounded-2xl p-6 border border-card-border shadow-sm lg:sticky lg:top-8">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filtros Inteligentes
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-tight ml-1">Categoria Geral</label>
              <select
                value={categoriaSelecionada}
                onChange={(e) => {
                  setCategoriaSelecionada(e.target.value);
                  setMacroSelecionado('');
                }}
                className="w-full bg-secondary border border-card-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer hover:border-primary/30"
              >
                <option value="">Todas as Categorias</option>
                {Object.keys(categoriasData).sort().map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-tight ml-1">Item Macro</label>
              <select
                disabled={!categoriaSelecionada}
                value={macroSelecionado}
                onChange={(e) => setMacroSelecionado(e.target.value)}
                className="w-full bg-secondary border border-card-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/30"
              >
                <option value="">Todos os itens desta categoria</option>
                {categoriaSelecionada && categoriasData[categoriaSelecionada]?.sort().map(mac => (
                  <option key={mac} value={mac}>{mac}</option>
                ))}
              </select>
            </div>
            
            <p className="text-[10px] text-muted font-medium italic pt-2 leading-tight">
              Os dados acima são extraídos automaticamente via IA a partir das descrições brutas dos itens.
            </p>
          </div>
        </div>
      </aside>

      {/* Grid de Resultados */}
      <main className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-primary/10"></div>
              </div>
            </div>
            <p className="text-muted font-bold tracking-widest uppercase text-xs">Mapeando Oportunidades...</p>
          </div>
        ) : licitacoes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {licitacoes.map((lic) => (
              <div key={lic.idCompra} className="bg-card rounded-2xl border border-card-border shadow-premium overflow-hidden hover:shadow-2xl transition-all group flex flex-col">
                <div className="p-6 flex-1 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{lic.orgaoEntidadeRazaoSocial}</p>
                    <h4 className="font-bold text-foreground text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {lic.objetoCompra}
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {lic.itens.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-card-border text-foreground text-[10px] font-black uppercase tracking-tighter">
                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
                        {item.itemMacro}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-card-border flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Valor Estimado</p>
                      <p className="text-xl font-black text-foreground tabular-nums">{formatCurrency(lic.valorTotalEstimado)}</p>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/licitacao/${lic.idCompra}`}
                  target="_blank"
                  className="bg-secondary/50 hover:bg-primary hover:text-white transition-all py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] border-t border-card-border"
                >
                  Ver Detalhes Completos
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-[2rem] border-2 border-dashed border-card-border p-20 text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-4xl shadow-inner opacity-60">
              {categoriaSelecionada ? '📭' : '💡'}
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-2xl font-black text-foreground tracking-tight">
                {categoriaSelecionada ? 'Nenhum item encontrado' : 'Inicie sua Pesquisa'}
              </h3>
              <p className="text-muted text-sm font-medium leading-relaxed">
                {categoriaSelecionada 
                  ? 'Não encontramos licitações recentes com os filtros aplicados. Tente uma categoria diferente ou amplie o item macro.'
                  : 'Selecione uma Categoria Geral na barra lateral para descobrir oportunidades de mercado categorizadas automaticamente por nossa IA.'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
