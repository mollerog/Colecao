
import React from 'react';
import { CreditCard } from '../types';

interface CardStatsProps {
  cards: CreditCard[];
}

const CardStatsCards: React.FC<CardStatsProps> = ({ cards }) => {
  const networksCount = new Set(cards.map(c => c.network)).size;
  const issuersCount = new Set(cards.map(c => c.issuer)).size;

  return (
    <div className="grid grid-cols-3 gap-3 sm:flex sm:justify-center sm:flex-wrap sm:gap-6 mt-10 px-4 sm:px-0">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-6 sm:px-12 sm:py-8 rounded-2xl sm:rounded-[32px] min-w-0 sm:min-w-[180px] shadow-2xl flex flex-col items-center justify-center text-center">
        <p className="text-3xl sm:text-5xl font-black text-white leading-none mb-2">{cards.length}</p>
        <p className="text-[8px] sm:text-[10px] font-bold text-white/60 uppercase tracking-[1px] sm:tracking-[2px]">Cartões</p>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-6 sm:px-12 sm:py-8 rounded-2xl sm:rounded-[32px] min-w-0 sm:min-w-[180px] shadow-2xl flex flex-col items-center justify-center text-center">
        <p className="text-3xl sm:text-5xl font-black text-white leading-none mb-2">{issuersCount}</p>
        <p className="text-[8px] sm:text-[10px] font-bold text-white/60 uppercase tracking-[1px] sm:tracking-[2px]">Emissores</p>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-6 sm:px-12 sm:py-8 rounded-2xl sm:rounded-[32px] min-w-0 sm:min-w-[180px] shadow-2xl flex flex-col items-center justify-center text-center">
        <p className="text-3xl sm:text-5xl font-black text-white leading-none mb-2">{networksCount}</p>
        <p className="text-[8px] sm:text-[10px] font-bold text-white/60 uppercase tracking-[1px] sm:tracking-[2px]">Bandeiras</p>
      </div>
    </div>
  );
};

export default CardStatsCards;
