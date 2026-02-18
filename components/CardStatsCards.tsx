
import React from 'react';
import { CreditCard } from '../types';

interface CardStatsProps {
  cards: CreditCard[];
}

const CardStatsCards: React.FC<CardStatsProps> = ({ cards }) => {
  const networksCount = new Set(cards.map(c => c.network)).size;
  const issuersCount = new Set(cards.map(c => c.issuer)).size;

  return (
    <div className="flex justify-center flex-wrap gap-6 mt-10">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-12 py-8 rounded-[32px] min-w-[180px] shadow-2xl">
        <p className="text-5xl font-black text-white leading-none mb-2">{cards.length}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[2px]">Cartões</p>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-12 py-8 rounded-[32px] min-w-[180px] shadow-2xl">
        <p className="text-5xl font-black text-white leading-none mb-2">{issuersCount}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[2px]">Emissores</p>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-12 py-8 rounded-[32px] min-w-[180px] shadow-2xl">
        <p className="text-5xl font-black text-white leading-none mb-2">{networksCount}</p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[2px]">Bandeiras</p>
      </div>
    </div>
  );
};

export default CardStatsCards;
