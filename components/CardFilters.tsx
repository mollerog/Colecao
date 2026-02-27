
import React, { useState, useRef, useEffect } from 'react';
import { CreditCard } from '../types';

interface CardFiltersProps {
  cards: CreditCard[];
  activeFilters: any;
  setActiveFilters: (f: any) => void;
}

const CardFilters: React.FC<CardFiltersProps> = ({ cards, activeFilters, setActiveFilters }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getOptions = (key: keyof CreditCard): string[] => {
    let filteredCards = [...cards];
    
    // Filter options based on OTHER active filters
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterKey !== key && filterValue) {
        filteredCards = filteredCards.filter(c => String((c as any)[filterKey] || '').trim() === String(filterValue).trim());
      }
    });

    const values = filteredCards.map(c => String(c[key] || '').trim());
    const uniqueValues = Array.from(new Set<string>(values));
    return uniqueValues.filter((v): v is string => v !== '').sort();
  };

  const updateFilter = (key: string, value: string) => {
    const next = { ...activeFilters };
    if (!value) delete next[key];
    else next[key] = value;
    setActiveFilters(next);
  };

  const FilterSelect = ({ label, field, options }: { label: string, field: keyof CreditCard, options: string[] }) => {
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const currentValue = activeFilters[field] || '';

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsSelectOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative flex-1 min-w-[140px]" ref={dropdownRef}>
        <button
          onClick={() => setIsSelectOpen(!isSelectOpen)}
          className={`w-full bg-white text-indigo-600 px-4 py-3 rounded-[20px] text-[10px] sm:text-[11px] font-black uppercase tracking-wider outline-none cursor-pointer transition-all shadow-sm flex items-center justify-between gap-2 border-2 ${currentValue ? 'border-indigo-200' : 'border-transparent'} hover:border-indigo-100`}
        >
          <span className="truncate">{currentValue || label}</span>
          <span className={`text-[8px] transition-transform duration-300 ${isSelectOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {isSelectOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[20px] shadow-2xl border border-indigo-50 overflow-hidden z-[200] max-h-[300px] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div 
              className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-50"
              onClick={() => { updateFilter(field as string, ''); setIsSelectOpen(false); }}
            >
              {label} (Todos)
            </div>
            {options.map(o => (
              <div 
                key={o} 
                className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${currentValue === o ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
                onClick={() => { updateFilter(field as string, o); setIsSelectOpen(false); }}
              >
                {o}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
        <div className="mt-6 flex flex-wrap justify-center items-center gap-3 w-full animate-in slide-in-from-top-4 duration-300 relative z-[70]">
          <FilterSelect label="Banco" field="issuer" options={getOptions('issuer')} />
          <FilterSelect label="Bandeira" field="network" options={getOptions('network')} />
          <FilterSelect label="Categoria" field="category" options={getOptions('category')} />
          <FilterSelect label="Ano" field="year" options={getOptions('year')} />
          
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

export default CardFilters;
