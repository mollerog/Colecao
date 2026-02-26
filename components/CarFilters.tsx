
import React, { useState } from 'react';
import { CarMiniature } from '../types';

interface CarFiltersProps {
  cars: CarMiniature[];
  activeFilters: any;
  setActiveFilters: (f: any) => void;
}

const CarFilters: React.FC<CarFiltersProps> = ({ cars, activeFilters, setActiveFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const getOptions = (key: keyof CarMiniature): string[] => {
    const values = cars.map(c => String(c[key] || '').trim());
    return Array.from(new Set<string>(values)).filter((v): v is string => v !== '').sort();
  };

  const updateFilter = (key: string, value: string) => {
    const next = { ...activeFilters };
    if (!value) delete next[key];
    else next[key] = value;
    setActiveFilters(next);
  };

  const FilterSelect = ({ label, field, options }: { label: string, field: keyof CarMiniature, options: string[] }) => (
    <div className="relative flex-1 min-w-[120px]">
      <select 
        value={activeFilters[field] || ''} 
        onChange={e => updateFilter(field as string, e.target.value)}
        className="w-full bg-white text-indigo-600 px-4 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-wider appearance-none outline-none cursor-pointer transition-all hover:bg-indigo-50 shadow-sm pr-10 truncate"
      >
        <option value="">{label}</option>
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
          <FilterSelect label="Fabricante" field="miniatureBrand" options={getOptions('miniatureBrand')} />
          <FilterSelect label="Linha" field="line" options={getOptions('line')} />
          <FilterSelect label="Escala" field="scale" options={getOptions('scale')} />
          <FilterSelect label="Marca Carro" field="realCarBrand" options={getOptions('realCarBrand')} />
          <FilterSelect label="Segmento" field="segment" options={getOptions('segment')} />
          
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

export default CarFilters;
