
import React, { useState } from 'react';
import { Can } from '../types';

interface FiltersProps {
  cans: Can[];
  activeFilters: any;
  setActiveFilters: (f: any) => void;
}

const BLANK_VALUE = '__BLANK__';

const Filters: React.FC<FiltersProps> = ({ cans, activeFilters, setActiveFilters }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getOptions = (key: keyof Can): string[] => {
    const uniqueValues: string[] = Array.from(new Set<string>(cans.map((c: Can) => String(c[key] || '').trim()))).filter((v): v is string => v !== '');
    
    if (key === 'year') {
      return [...uniqueValues].sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numB - numA;
      });
    }

    if (key === 'size') {
      const mlOptions = uniqueValues.filter(v => v.toLowerCase().endsWith('ml'));
      const otherOptions = uniqueValues.filter(v => !v.toLowerCase().endsWith('ml'));
      const sortedMl = mlOptions.sort((a, b) => {
        const valA = parseFloat(a.replace(/[^0-9.]/g, '')) || 0;
        const valB = parseFloat(b.replace(/[^0-9.]/g, '')) || 0;
        return valB - valA;
      });
      const sortedOther = otherOptions.sort((a, b) => a.localeCompare(b));
      return [...sortedMl, ...sortedOther];
    }
    return [...uniqueValues].sort((a, b) => a.localeCompare(b));
  };

  const updateFilter = (key: string, value: string) => {
    const next = { ...activeFilters };
    if (!value || value === '') delete next[key];
    else next[key] = value;
    setActiveFilters(next);
  };

  const FilterSelect = ({ label, icon, field, options }: { label: string, icon: string, field: keyof Can, options: string[] }) => (
    <div className="flex flex-col gap-1.5 min-w-[180px] flex-1">
      <label className="text-[10px] font-black text-gray-400 flex items-center gap-1.5 ml-1 uppercase tracking-widest">
        <span>{icon}</span> {label}
      </label>
      <div className="relative">
        <select 
          value={activeFilters[field] || ''} 
          onChange={e => updateFilter(field as string, e.target.value)}
          className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-2xl appearance-none focus:ring-2 focus:ring-indigo-500/10 outline-none text-[12px] font-bold text-gray-700 cursor-pointer transition-all"
        >
          <option value="">Todos</option>
          <option value={BLANK_VALUE} className="text-red-500 font-bold">[ Em Branco ]</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 text-[10px]">
          ▼
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="bg-white/95 rounded-[32px] p-6 shadow-sm border border-white">
        <div className="flex justify-between items-center">
          <button 
            className="flex items-center gap-3 text-slate-800 font-black text-lg uppercase tracking-widest"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="text-2xl">🔍</span> Filtros Avançados
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-indigo-600 transition-all duration-500"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 mt-6 pt-6 border-t border-gray-50">
            <div className="flex flex-wrap gap-5">
              <FilterSelect label="Grupo" icon="🏢" field="group" options={getOptions('group')} />
              <FilterSelect label="Sigla" icon="🔠" field="acronym" options={getOptions('acronym')} />
              <FilterSelect label="Marca" icon="🥤" field="brand" options={getOptions('brand')} />
              <FilterSelect label="Ano" icon="📅" field="year" options={getOptions('year')} />
              <FilterSelect label="Tamanho" icon="📏" field="size" options={getOptions('size')} />
            </div>

            {Object.keys(activeFilters).length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 items-center justify-center pt-6 border-t border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Ativos:</span>
                {Object.entries(activeFilters).map(([key, value]) => (
                  <span key={key} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2 border border-indigo-100">
                    {value === BLANK_VALUE ? '[Em Branco]' : String(value)}
                    <button onClick={() => updateFilter(key, '')} className="hover:text-red-500 font-bold transition-colors">×</button>
                  </span>
                ))}
                <button 
                  onClick={() => setActiveFilters({})}
                  className="text-[10px] font-black text-red-400 hover:text-red-500 ml-2 uppercase tracking-widest transition-colors"
                >
                  Limpar tudo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;
