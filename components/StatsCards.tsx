
import React from 'react';
import { Can } from '../types';

interface StatsProps {
  cans: Can[];
}

const StatsCards: React.FC<StatsProps> = ({ cans }) => {
  const brandsCount = new Set(cans.map(c => c.brand)).size;
  const groupsCount = new Set(cans.map(c => c.group)).size;

  return (
    <div className="grid grid-cols-3 gap-3 sm:flex sm:justify-center sm:flex-wrap sm:gap-6 mt-10 px-4 sm:px-0">
      {/* Latas */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-6 sm:px-12 sm:py-8 rounded-2xl sm:rounded-[32px] min-w-0 sm:min-w-[180px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center justify-center text-center">
        <p className="text-3xl sm:text-5xl font-black text-white leading-none mb-2">{cans.length}</p>
        <p className="text-[8px] sm:text-[10px] font-bold text-white/60 uppercase tracking-[1px] sm:tracking-[2px]">Latas</p>
      </div>

      {/* Grupos */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-6 sm:px-12 sm:py-8 rounded-2xl sm:rounded-[32px] min-w-0 sm:min-w-[180px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col items-center justify-center text-center">
        <p className="text-3xl sm:text-5xl font-black text-white leading-none mb-2">{groupsCount}</p>
        <p className="text-[8px] sm:text-[10px] font-bold text-white/60 uppercase tracking-[1px] sm:tracking-[2px]">Grupos</p>
      </div>

      {/* Marcas */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-6 sm:px-12 sm:py-8 rounded-2xl sm:rounded-[32px] min-w-0 sm:min-w-[180px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-1000 flex flex-col items-center justify-center text-center">
        <p className="text-3xl sm:text-5xl font-black text-white leading-none mb-2">{brandsCount}</p>
        <p className="text-[8px] sm:text-[10px] font-bold text-white/60 uppercase tracking-[1px] sm:tracking-[2px]">Marcas</p>
      </div>
    </div>
  );
};

export default StatsCards;
