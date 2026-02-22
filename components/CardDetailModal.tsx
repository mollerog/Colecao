
import React from 'react';
import { CreditCard } from '../types';

interface CardDetailModalProps {
  card: CreditCard;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewImage: (url: string) => void;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose, onEdit, onDelete, onViewImage }) => {
  const InfoRow = ({ label, value, icon }: { label: string, value: string | undefined, icon: string }) => (
    <div className="flex flex-col border-b border-gray-50 pb-3">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <span>{icon}</span> {label}
      </p>
      <p className="text-base font-bold text-slate-800 truncate">{value || '---'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] animate-in zoom-in duration-300">
        <div 
          className="md:w-1/2 bg-[#F8FAFF] p-10 flex items-center justify-center relative overflow-hidden shrink-0 cursor-zoom-in group"
          onClick={() => card.photo && onViewImage(card.photo)}
        >
          {/* Zoom Indicator no Topo */}
          <div className="absolute top-8 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2 z-10 transition-all group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white">
            <span className="text-sm">🔍</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Ver em Tela Cheia</span>
          </div>

          {card.photo ? (
            <img src={card.photo} alt={card.cardName} className="max-h-full max-w-full object-contain drop-shadow-2xl rounded-2xl transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="text-9xl opacity-10">💳</div>
          )}
          
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white/80 backdrop-blur border border-gray-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all md:hidden">×</button>
        </div>

        <div className="md:w-1/2 flex flex-col overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex justify-between items-start shrink-0">
             <div>
                <p className="text-indigo-600 font-black text-xs uppercase tracking-[3px] mb-1">{card.issuer}</p>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{card.cardName}</h2>
             </div>
             <button onClick={onClose} className="hidden md:flex w-12 h-12 rounded-full bg-gray-50 hover:bg-gray-100 items-center justify-center text-2xl font-light text-slate-400 transition-all">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-8">
            <div className="grid grid-cols-2 gap-8">
               <InfoRow label="Bandeira" value={card.network} icon="🌐" />
               <InfoRow label="Categoria" value={card.category} icon="💎" />
               <InfoRow label="Ano" value={card.year} icon="📅" />
               <InfoRow label="Final" value={card.lastFourDigits ? `Final ${card.lastFourDigits}` : '****'} icon="🔢" />
               <InfoRow label="ID Imagem" value={card.imageDesc} icon="🖼️" />
            </div>

            {card.description && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">📝 Detalhes do Cartão</p>
                <p className="text-gray-500 font-medium leading-relaxed italic border-l-4 border-indigo-100 pl-4">
                  "{card.description}"
                </p>
              </div>
            )}
          </div>

          <div className="p-10 bg-gray-50/50 flex gap-4 shrink-0">
             <button onClick={onEdit} className="flex-1 bg-white border border-indigo-100 text-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm hover:bg-indigo-600 hover:text-white transition-all">Editar</button>
             <button onClick={onDelete} className="flex-1 bg-white border border-red-100 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm hover:bg-red-500 hover:text-white transition-all">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;
