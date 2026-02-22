
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
      <div className="bg-white/95 rounded-[32px] p-6 shadow-sm border border-white">
        <div className="flex justify-between items-center" onClick={() => setIsOpen(!isOpen)}>
          <button className="flex items-center gap-3 text-slate-800 font-black text-lg uppercase tracking-widest">🔍 Filtros de Garagem</button>
          <button className={`text-slate-400 transition-all ${isOpen ? 'rotate-180' : ''}`}>▼</button>
        </div>
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
