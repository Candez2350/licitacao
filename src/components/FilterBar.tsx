import React, { useState } from 'react';
import { LicitacaoFiltros } from '../types/licitacao';

interface FilterBarProps {
  onSearch: (filtros: LicitacaoFiltros) => void;
}

export default function FilterBar({ onSearch }: FilterBarProps) {
  // Padrão: Hoje
  const defaultInitialStr = new Date().toISOString().split('T')[0];
  
  // Padrão: 15 dias no futuro
  const defaultFinalDate = new Date();
  defaultFinalDate.setDate(defaultFinalDate.getDate() + 15);
  const defaultFinalStr = defaultFinalDate.toISOString().split('T')[0];

  const [dataInicial, setDataInicial] = useState(defaultInitialStr);
  const [dataFinal, setDataFinal] = useState(defaultFinalStr);
  const [modalidade, setModalidade] = useState<string>('');
  const [tipoObjeto, setTipoObjeto] = useState<string>('');
  const [erroData, setErroData] = useState<string>('');

  const handleSearch = () => {
    const start = new Date(dataInicial);
    const end = new Date(dataFinal);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (start > end) {
      setErroData('A data inicial não pode ser maior que a data final.');
      return;
    }

    if (diffDays > 30) {
      setErroData('O período de busca não pode ser superior a 30 dias para evitar sobrecarga no servidor do governo.');
      return;
    }

    setErroData('');
    onSearch({
      dataInicial,
      dataFinal,
      codigoModalidade: modalidade ? Number(modalidade) : undefined,
      tipoObjeto: tipoObjeto || undefined,
    });
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-premium mb-8 border border-card-border transition-all hover:shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-4 items-end">
        <div className="flex flex-col w-full lg:w-auto lg:min-w-[150px]">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Data Inicial</label>
          <input 
            type="date" 
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="w-full bg-secondary border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="flex flex-col w-full lg:w-auto lg:min-w-[150px]">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Data Final</label>
          <input 
            type="date" 
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="w-full bg-secondary border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="flex flex-col w-full lg:w-auto lg:flex-grow lg:min-w-[200px]">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Modalidade</label>
          <select 
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value)}
            className="w-full bg-secondary border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Todas as Modalidades</option>
            <option value="5">Pregão Eletrônico</option>
            <option value="3">Concorrência</option>
            <option value="6">Dispensa de Licitação</option>
          </select>
        </div>

        <div className="flex flex-col w-full lg:w-auto lg:flex-grow lg:min-w-[150px]">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Tipo de Objeto</label>
          <select 
            value={tipoObjeto}
            onChange={(e) => setTipoObjeto(e.target.value)}
            className="w-full bg-secondary border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Todos os Objetos</option>
            <option value="M">Material</option>
            <option value="S">Serviço</option>
          </select>
        </div>

        <button 
          onClick={handleSearch}
          className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto bg-primary text-primary-foreground font-bold py-2.5 px-8 rounded-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Buscar
        </button>
      </div>
      {erroData && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {erroData}
        </div>
      )}
    </div>
  );
}
