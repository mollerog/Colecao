
import React from 'react';
import { CarMiniature } from '../types';

interface CarStatsProps {
  cars: CarMiniature[];
}

const CarStatsCards: React.FC<CarStatsProps> = ({ cars }) => {
  const brandCount = new Set(cars.map(c => c.miniatureBrand)).size;
  const sthCount = cars.filter(c => c.line.toUpperCase().includes('STH') || c.line.toUpperCase().includes('SUPER TREASURE')).length;

  return (
    <div className="flex justify-center flex-wrap gap-6 mt-10">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-12 py-8 rounded-[32px] min-w-[180px] shadow-2xl">
        <p className="text-5xl font-black text-white leading-none mb-2">{cars.length}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[2px]">Miniaturas</p>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-12 py-8 rounded-[32px] min-w-[180px] shadow-2xl">
        <p className="text-5xl font-black text-white leading-none mb-2">{brandCount}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[2px]">Fabricantes</p>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-12 py-8 rounded-[32px] min-w-[180px] shadow-2xl">
        <p className="text-5xl font-black text-amber-400 leading-none mb-2">{sthCount}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[2px]">STH / Raros</p>
      </div>
    </div>
  );
};

export default CarStatsCards;
