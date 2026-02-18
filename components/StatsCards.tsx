
import React from 'react';
import { Can } from '../types';

interface StatsProps {
  cans: Can[];
}

const StatsCards: React.FC<StatsProps> = ({ cans }) => {
  const brandsCount = new Set(cans.map(c => c.brand)).size;

  return (
    <div className="flex justify-center gap-6 mt-10">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-16 py-8 rounded-[32px] min-w-[200px] shadow-2xl">
        <p className="text-5xl font-black text-white leading-none mb-2">{cans.length}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[2px]">Latas</p>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-16 py-8 rounded-[32px] min-w-[200px] shadow-2xl">
        <p className="text-5xl font-black text-white leading-none mb-2">{brandsCount}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[2px]">Marcas</p>
      </div>
    </div>
  );
};

export default StatsCards;
