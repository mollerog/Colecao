
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
    <div className="flex flex-col gap-1.5 min-w-[160px] flex-1">
      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <select value={activeFilters[field] || ''} onChange={e => updateFilter(field as string, e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none text-[11px] font-bold text-gray-700">
        <option value="">Todos</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="w-full">
      <div className="bg-white/95 rounded-2xl sm:rounded-[40px] p-1.5 sm:p-2 shadow-sm border border-white">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center px-4 py-3 sm:px-6 sm:py-4 hover:bg-gray-50/50 rounded-xl sm:rounded-[38px] transition-colors group"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">🔍</span>
            <span className="text-sm sm:text-lg font-black text-slate-800 uppercase tracking-[2px] sm:tracking-[4px]">Filtros de Garagem</span>
          </div>
          <div className={`text-slate-400 transition-all ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}>▼</div>
        </button>
        {isOpen && (
          <div className="mt-6 pt-6 border-t flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-2">
            <FilterSelect label="Fabricante (Min)" field="miniatureBrand" options={getOptions('miniatureBrand')} />
            <FilterSelect label="Linha" field="line" options={getOptions('line')} />
            <FilterSelect label="Escala" field="scale" options={getOptions('scale')} />
            <FilterSelect label="Marca Carro" field="realCarBrand" options={getOptions('realCarBrand')} />
            <FilterSelect label="Segmento" field="segment" options={getOptions('segment')} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CarFilters;
