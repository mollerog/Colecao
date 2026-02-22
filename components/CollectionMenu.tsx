
import React from 'react';
import { User, signOut } from 'firebase/auth';
import { Can, CreditCard, CarMiniature } from '../types';

interface CollectionMenuProps {
  user: User;
  cans: Can[];
  cards: CreditCard[];
  cars: CarMiniature[];
  onSelectCans: () => void;
  onSelectCards: () => void;
  onSelectCars: () => void;
  onViewAchievements: () => void;
  auth: any;
}

const CollectionMenu: React.FC<CollectionMenuProps> = ({ user, cans, cards, cars, onSelectCans, onSelectCards, onSelectCars, onViewAchievements, auth }) => {
  const cansCount = cans.length;
  const cardsCount = cards.length;
  const carsCount = cars.length;

  const handleLogout = () => {
    if (confirm('Deseja sair?')) signOut(auth);
  };

  const categories = [
    { 
      id: 'cans', 
      title: 'Latas de Bebidas', 
      desc: 'Gerencie sua coleção de latas de refrigerante, sucos e energéticos.', 
      icon: '🥤', 
      active: true,
      count: `${cansCount} ITENS`,
      action: onSelectCans
    },
    { 
      id: 'credit', 
      title: 'Cartão de Crédito', 
      desc: 'Exiba seus cartões de crédito raros, edições especiais e clássicos.', 
      icon: '💳', 
      active: true,
      count: `${cardsCount} ITENS`,
      action: onSelectCards
    },
    { 
      id: 'cars', 
      title: 'Miniaturas Autos', 
      desc: 'Sua garagem Hot Wheels, Matchbox e outras marcas em escala.', 
      icon: '🚗', 
      active: true,
      count: `${carsCount} ITENS`,
      action: onSelectCars
    },
    { 
      id: 'phone', 
      title: 'Cartão Telefônico', 
      desc: 'Novas categorias de colecionáveis serão adicionadas futuramente.', 
      icon: '📞', 
      active: false,
      badge: 'EM BREVE'
    },
    { 
      id: 'coins', 
      title: 'Moedas e Cédulas', 
      desc: 'Novas categorias de colecionáveis serão adicionadas futuramente.', 
      icon: '🏛️', 
      active: false,
      badge: 'EM BREVE'
    },
    { 
      id: 'packaging', 
      title: 'Embalagens', 
      desc: 'Novas categorias de colecionáveis serão adicionadas futuramente.', 
      icon: '📦', 
      active: false,
      badge: 'EM BREVE'
    },
    { 
      id: 'figures', 
      title: 'Action Figures', 
      desc: 'Novas categorias de colecionáveis serão adicionadas futuramente.', 
      icon: '🦸', 
      active: false,
      badge: 'EM BREVE'
    },
  ];

  return (
    <div className="min-h-screen gradient-bg text-white pb-20">
      <header className="w-full p-6 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-6 animate-in fade-in duration-700">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-2xl shadow-xl shrink-0">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black uppercase tracking-[2px] text-white/50 leading-none mb-1">
              Colecionador Ativo
            </span>
            <span className="text-sm sm:text-base font-bold tracking-tight text-white">
              {user.email}
            </span>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={onViewAchievements}
            className="flex-1 sm:flex-none bg-[#5549ED] hover:bg-[#4338CA] border border-white/20 px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[2.5px] transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
          >
            <span className="text-sm">🏆</span> CONQUISTAS
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 border border-white/10 px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[2.5px] transition-all active:scale-95 shadow-md"
          >
            SAIR
          </button>
        </div>
      </header>

      <div className="flex flex-col items-center text-center mt-6 mb-16 px-4 animate-in slide-in-from-top-4 duration-1000">
        <div className="text-8xl sm:text-9xl mb-4 drop-shadow-2xl">🏠</div>
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-4 text-white">
          Minhas Coleção
        </h1>
        <p className="text-white/70 text-base sm:text-xl font-medium tracking-tight">
          Escolha qual coleção deseja gerenciar hoje.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {categories.map((cat) => (
          <div 
            key={cat.id}
            onClick={cat.action}
            className={`
              relative flex flex-col p-10 rounded-[48px] border transition-all duration-500
              ${cat.active 
                ? 'bg-white/15 border-white/20 cursor-pointer hover:bg-white/20 hover:scale-[1.02] shadow-2xl group' 
                : 'bg-white/5 border-white/10 opacity-60 grayscale-[0.5]'}
            `}
          >
            {cat.count && (
              <div className="absolute top-8 right-8 bg-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                {cat.count}
              </div>
            )}
            {cat.badge && (
              <div className="absolute top-8 right-8 bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
                {cat.badge}
              </div>
            )}

            <div className={`text-7xl mb-10 ${cat.active ? 'group-hover:rotate-12 transition-transform duration-500' : ''}`}>
              {cat.icon}
            </div>

            <h2 className="text-3xl font-black mb-4 tracking-tight">{cat.title}</h2>
            <p className="text-white/50 font-medium leading-relaxed mb-12">
              {cat.desc}
            </p>

            {cat.active && (
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-white/40 group-hover:text-white transition-colors">
                ACESSAR COLEÇÃO <span className="text-xl">→</span>
              </div>
            )}
          </div>
        ))}
        
        <div className="bg-white/5 border border-white/10 border-dashed rounded-[48px] p-10 flex flex-col items-center justify-center text-center opacity-40">
           <div className="text-5xl mb-4">✨</div>
           <p className="text-2xl font-black italic tracking-tighter">Em breve mais novidades...</p>
        </div>
      </div>
    </div>
  );
};

export default CollectionMenu;
