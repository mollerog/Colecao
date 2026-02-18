
import React from 'react';
import { Can } from '../types';

interface StatsProps {
  cans: Can[];
}

const StatsCards: React.FC<StatsProps> = ({ cans }) => {
  const brandsCount = new Set(cans.map(c => c.brand)).size;
  const groupsCount = new Set(cans.map(c => c.group)).size;

  return (
    <div className="flex justify-center flex-wrap gap-6 mt-10">
      {/* Latas */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-12 py-8 rounded-[32px] min-w-[180px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="text-5xl font-black text-white leading-none mb-2">{cans.length}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[2px]">Latas</p>
      </div>

      {/* Grupos */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-12 py-8 rounded-[32px] min-w-[180px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-700">
        <p className="text-5xl font-black text-white leading-none mb-2">{groupsCount}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[2px]">Grupos</p>
      </div>

      {/* Marcas */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-12 py-8 rounded-[32px] min-w-[180px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-1000">
        <p className="text-5xl font-black text-white leading-none mb-2">{brandsCount}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[2px]">Marcas</p>
      </div>
    </div>
  );
};

export default StatsCards;
