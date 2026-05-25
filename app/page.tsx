"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FilterBar from '@/src/components/FilterBar';
import LicitacaoTable from '@/src/components/LicitacaoTable';
import { fetchLicitacoes } from '@/src/services/api';
import { Licitacao, LicitacaoFiltros } from '@/src/types/licitacao';

export default function Home() {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [mostrarApenasFavoritos, setMostrarApenasFavoritos] = useState<boolean>(false);

  // Pagination State
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [filtrosAtuais, setFiltrosAtuais] = useState<LicitacaoFiltros | null>(null);
  const [categorizing, setCategorizing] = useState<boolean>(false);
  const [pendentesCount, setPendentesCount] = useState<number | null>(null);

  useEffect(() => {
    // Carregar favoritos do localStorage ao iniciar
    const favs = localStorage.getItem('favoritosLicitacoes');
    if (favs) {
      try {
        setFavoritos(JSON.parse(favs));
      } catch (e) {
        console.error("Erro ao carregar favoritos", e);
      }
    }

    // Busca inicial: últimos 15 dias
    const hoje = new Date();
    const defaultInitialDate = new Date();
    defaultInitialDate.setDate(defaultInitialDate.getDate() + 15);

    const initialFiltros: LicitacaoFiltros = {
      dataInicial: hoje.toISOString().split('T')[0],
      dataFinal: defaultInitialDate.toISOString().split('T')[0],
      pagina: 1,
      tamanhoPagina: 10
    };

    setFiltrosAtuais(initialFiltros);
    handleSearch(initialFiltros);

    // Buscar status da fila de IA
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status-ia');
        const data = await res.json();
        setPendentesCount(data.pendentes);
      } catch (e) {
        console.error("Erro ao buscar status da IA", e);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // Atualiza a cada 15s
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (filtros: LicitacaoFiltros) => {
    setLoading(true);
    setFiltrosAtuais(filtros);
    try {
      const response = await fetchLicitacoes(filtros);
      const data = response.resultado;

      // Ordenar por dataEncerramentoPropostaPncp crescente (mais perto de encerrar primeiro)
      const sortedData = data.sort((a, b) => {
        const dateA = a.dataEncerramentoPropostaPncp ? new Date(a.dataEncerramentoPropostaPncp).getTime() : Infinity;
        const dateB = b.dataEncerramentoPropostaPncp ? new Date(b.dataEncerramentoPropostaPncp).getTime() : Infinity;
        return dateA - dateB;
      });

      setLicitacoes(sortedData);
      setTotalPaginas(response.totalPaginas || 1);
      setPaginaAtual(filtros.pagina || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (novaPagina: number) => {
    if (filtrosAtuais) {
      const novosFiltros = { ...filtrosAtuais, pagina: novaPagina };
      handleSearch(novosFiltros);
    }
  };

  const toggleFavorito = (idCompra: string) => {
    setFavoritos(prev => {
      const isFav = prev.includes(idCompra);
      const newFavs = isFav ? prev.filter(id => id !== idCompra) : [...prev, idCompra];

      localStorage.setItem('favoritosLicitacoes', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const handleCategorizar = async () => {
    if (!confirm("Deseja iniciar a categorização por IA? Isso processará os próximos 20 itens pendentes.")) return;
    
    setCategorizing(true);
    try {
      const res = await fetch('/api/categorizar');
      const data = await res.json();
      if (res.ok) {
        alert(`Sucesso! ${data.processados} itens foram categorizados.`);
        window.location.reload();
      } else {
        alert(`Erro: ${data.details || data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao chamar API de categorização.");
    } finally {
      setCategorizing(false);
    }
  };

  const filteredLicitacoes = mostrarApenasFavoritos
    ? licitacoes.filter(lic => favoritos.includes(lic.idCompra))
    : licitacoes;

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Decorative Header Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-center lg:items-start gap-6">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl">
              Painel de <span className="text-primary">Licitações</span> RJ
            </h1>
            <p className="text-muted mt-3 text-base sm:text-lg max-w-2xl font-medium">
              Inteligência de mercado e monitoramento estratégico de compras públicas em tempo real.
            </p>

            {pendentesCount !== null && pendentesCount > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
                  IA processando: {pendentesCount.toLocaleString()} itens na fila
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
            <Link
              href="/inteligencia"
              className="flex items-center px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold bg-secondary text-foreground text-sm sm:text-base border border-card-border hover:border-primary/30 hover:text-primary transition-all shadow-sm"
            >
              <span className="mr-2">📊</span>
              Inteligência de Mercado
            </Link>

            <button
              onClick={handleCategorizar}
              disabled={categorizing}
              className={`flex items-center px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all shadow-sm border ${categorizing 
                ? 'bg-secondary text-muted cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 border-primary/20'}`}
            >
              <span className="mr-2">{categorizing ? '⌛' : '🪄'}</span>
              {categorizing ? 'Categorizando...' : 'Categorizar Itens (IA)'}
            </button>

            <button
              onClick={() => setMostrarApenasFavoritos(!mostrarApenasFavoritos)}
              className={`group flex items-center px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all shadow-sm ${mostrarApenasFavoritos
                ? 'bg-accent text-white hover:bg-amber-600'
                : 'bg-card text-foreground border border-card-border hover:border-accent hover:text-accent'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 transition-transform group-hover:scale-110 ${mostrarApenasFavoritos ? 'text-white' : 'text-muted group-hover:text-accent'}`} viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.518-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {mostrarApenasFavoritos ? 'Ver Todas' : 'Meus Favoritos'}
            </button>
          </div>
        </header>

        <FilterBar onSearch={(filtros) => handleSearch({ ...filtros, pagina: 1, tamanhoPagina: 10 })} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-primary/10"></div>
              </div>
            </div>
            <p className="text-muted font-bold tracking-widest uppercase text-xs">Sincronizando Oportunidades...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            <LicitacaoTable
              licitacoes={filteredLicitacoes}
              favoritos={favoritos}
              onToggleFavorito={toggleFavorito}
            />

            {!mostrarApenasFavoritos && totalPaginas > 1 && (
              <div className="mt-12 flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className="px-6 py-2.5 border border-card-border rounded-xl text-sm font-bold text-foreground bg-card hover:bg-secondary hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  Anterior
                </button>

                <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-xl border border-card-border">
                  <span className="text-xs font-bold text-muted uppercase tracking-tighter">Página</span>
                  <span className="text-sm font-black text-primary">{paginaAtual}</span>
                  <span className="text-xs font-bold text-muted uppercase tracking-tighter">de</span>
                  <span className="text-sm font-black text-foreground">{totalPaginas}</span>
                </div>

                <button
                  onClick={() => handlePageChange(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className="px-6 py-2.5 border border-card-border rounded-xl text-sm font-bold text-foreground bg-card hover:bg-secondary hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Próxima
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
