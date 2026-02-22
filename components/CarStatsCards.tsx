
import React from 'react';
import { CarMiniature } from '../types';

interface CarStatsProps {
  cars: CarMiniature[];
}

const CarStatsCards: React.FC<CarStatsProps> = ({ cars }) => {
  const brandCount = new Set(cars.map(c => c.miniatureBrand)).size;
  const sthCount = cars.filter(c => c.line.toUpperCase().includes('STH') || c.line.toUpperCase().includes('SUPER TREASURE')).length;

  return (
    <div className="grid grid-cols-3 gap-3 sm:flex sm:justify-center sm:flex-wrap sm:gap-6 mt-10 px-4 sm:px-0">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-6 sm:px-12 sm:py-8 rounded-2xl sm:rounded-[32px] min-w-0 sm:min-w-[180px] shadow-2xl flex flex-col items-center justify-center text-center">
        <p className="text-3xl sm:text-5xl font-black text-white leading-none mb-2">{cars.length}</p>
        <p className="text-[8px] sm:text-[10px] font-bold text-white/60 uppercase tracking-[1px] sm:tracking-[2px]">Miniaturas</p>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-6 sm:px-12 sm:py-8 rounded-2xl sm:rounded-[32px] min-w-0 sm:min-w-[180px] shadow-2xl flex flex-col items-center justify-center text-center">
        <p className="text-3xl sm:text-5xl font-black text-white leading-none mb-2">{brandCount}</p>
        <p className="text-[8px] sm:text-[10px] font-bold text-white/60 uppercase tracking-[1px] sm:tracking-[2px]">Fabricantes</p>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-6 sm:px-12 sm:py-8 rounded-2xl sm:rounded-[32px] min-w-0 sm:min-w-[180px] shadow-2xl flex flex-col items-center justify-center text-center">
        <p className="text-3xl sm:text-5xl font-black text-amber-400 leading-none mb-2">{sthCount}</p>
        <p className="text-[8px] sm:text-[10px] font-bold text-white/60 uppercase tracking-[1px] sm:tracking-[2px]">STH / Raros</p>
      </div>
    </div>
  );
};

export default CarStatsCards;
