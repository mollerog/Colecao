
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
    <div className="relative flex-1 min-w-[120px]">
      <select 
        value={activeFilters[field] || ''} 
        onChange={e => updateFilter(field as string, e.target.value)}
        className="w-full bg-white text-indigo-600 px-4 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-wider appearance-none outline-none cursor-pointer transition-all hover:bg-indigo-50 shadow-sm pr-10 truncate"
      >
        <option value="">{label}</option>
        <option value={BLANK_VALUE}>[ Vazio ]</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 text-[10px]">
        ▼
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white rounded-[24px] px-6 sm:px-10 py-2.5 flex items-center justify-between shadow-xl transition-all hover:bg-gray-50 group"
      >
        <div className="flex items-center gap-4">
          <span className="text-xl sm:text-2xl">🔍</span>
          <span className="text-sm sm:text-lg font-black text-slate-800 tracking-[2px] uppercase">Filtros Avançados</span>
        </div>
        <span className={`text-xl sm:text-2xl text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-6 flex flex-wrap justify-center items-center gap-3 w-full animate-in slide-in-from-top-4 duration-300">
          <FilterSelect label="Grupo" icon="🏢" field="group" options={getOptions('group')} />
          <FilterSelect label="Sigla" icon="🔠" field="acronym" options={getOptions('acronym')} />
          <FilterSelect label="Marca" icon="🥤" field="brand" options={getOptions('brand')} />
          <FilterSelect label="Ano" icon="📅" field="year" options={getOptions('year')} />
          <FilterSelect label="Tamanho" icon="📏" field="size" options={getOptions('size')} />
          
          {Object.keys(activeFilters).length > 0 && (
            <button 
              onClick={() => setActiveFilters({})}
              className="px-6 py-3 bg-[#E11D48] text-white text-[11px] font-black uppercase tracking-widest rounded-[20px] hover:bg-red-700 transition-all shadow-lg"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Filters;
