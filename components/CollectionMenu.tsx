
import React from 'react';
import { User, signOut } from 'firebase/auth';
import { Can } from '../types';

interface CollectionMenuProps {
  user: User;
  cans: Can[];
  onSelectCans: () => void;
  auth: any;
}

const CollectionMenu: React.FC<CollectionMenuProps> = ({ user, cans, onSelectCans, auth }) => {
  const cansCount = cans.length;

  const handleLogout = () => {
    if (confirm('Deseja sair?')) signOut(auth);
  };

  // Definição dos marcos de conquista expandidos até 10.000
  const achievements = [
    { label: 'Iniciante', count: 1, icon: '🌱' },
    { label: 'Entusiasta', count: 10, icon: '⭐' },
    { label: 'Colecionador', count: 50, icon: '🏆' },
    { label: 'Veterano', count: 100, icon: '🔥' },
    { label: 'Elite', count: 200, icon: '💎' },
    { label: 'Mestre', count: 500, icon: '👑' },
    { label: 'Lenda', count: 1000, icon: '🌌' },
    { label: 'Imortal', count: 2000, icon: '🪐' },
    { label: 'Divindade', count: 5000, icon: '✨' },
    { label: 'Ancestral', count: 7500, icon: '☄️' },
    { label: 'Omnipotente', count: 10000, icon: '♾️' },
  ];

  const categories = [
    { 
      id: 'cans', 
      title: 'Latas de Bebidas', 
      desc: 'Gerencie sua coleção de latas de refrigerante, sucos e energéticos.', 
      icon: '🥤', 
      active: true,
      count: `${cansCount} ITENS`
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
      id: 'credit', 
      title: 'Cartão de Crédito', 
      desc: 'Novas categorias de colecionáveis serão adicionadas futuramente.', 
      icon: '💳', 
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
      id: 'cars', 
      title: 'Miniaturas Autos', 
      desc: 'Novas categorias de colecionáveis serão adicionadas futuramente.', 
      icon: '🚗', 
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
    <div className="min-h-screen gradient-bg text-white">
      {/* Top Bar */}
      <header className="w-full p-8 flex justify-between items-center animate-in fade-in duration-700">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[22px] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center font-black text-2xl shadow-xl">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[2px] text-white/50 leading-none mb-1">
              Usuário Autenticado
            </span>
            <span className="text-[15px] font-bold tracking-tight">
              {user.email}
            </span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 border border-white/20 px-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[2.5px] transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          Sair do Sistema
        </button>
      </header>

      {/* Main Title Section */}
      <div className="flex flex-col items-center text-center mt-4 mb-10 animate-in slide-in-from-top-4 duration-700">
        <div className="text-7xl mb-4 drop-shadow-2xl">🏠</div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 text-white">Minhas Coleção</h1>
        <p className="text-white/60 font-medium text-xl">Escolha qual coleção deseja gerenciar hoje.</p>
      </div>

      {/* Conquests Section - ALIGNED WITH CARDS STYLE */}
      <div className="max-w-7xl mx-auto px-8 mb-16">
        <div className="bg-white/15 backdrop-blur-xl rounded-[48px] border border-white/20 p-10 shadow-2xl">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-sm font-black uppercase tracking-[5px] text-white/50">Suas Conquistas</h3>
              <div className="bg-indigo-600 px-6 py-2 rounded-full text-[12px] font-black text-white shadow-lg">
                {achievements.filter(a => cansCount >= a.count).length} / {achievements.length} DESBLOQUEADAS
              </div>
           </div>
           
           <div className="flex flex-wrap justify-center gap-8">
              {achievements.map((ach) => {
                const isUnlocked = cansCount >= ach.count;
                return (
                  <div 
                    key={ach.count} 
                    className={`flex flex-col items-center gap-4 group relative transition-all duration-500 ${isUnlocked ? 'scale-110' : ''}`}
                  >
                    {/* Badge Icon Container */}
                    <div className={`
                      w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-all duration-700
                      ${isUnlocked 
                        ? 'bg-gradient-to-br from-indigo-400 to-purple-600 border-2 border-white/30 scale-100' 
                        : 'bg-white/5 border border-white/10 grayscale opacity-40'}
                    `}>
                      {ach.icon}
                    </div>

                    {/* Text Label - ALWAYS READABLE */}
                    <div className="text-center">
                      <p className={`text-[12px] font-black uppercase tracking-widest leading-tight mb-1 ${isUnlocked ? 'text-white' : 'text-white/70'}`}>
                        {ach.label}
                      </p>
                      <p className={`text-[11px] font-bold ${isUnlocked ? 'text-indigo-300' : 'text-white/40'}`}>
                        {ach.count.toLocaleString()}+ itens
                      </p>
                    </div>

                    {/* Tooltip on hover */}
                    {isUnlocked && (
                      <div className="absolute -top-14 bg-white text-indigo-900 px-4 py-2 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap shadow-2xl z-10 border border-indigo-100">
                        MARCO ALCANÇADO! 🏆
                      </div>
                    )}
                  </div>
                );
              })}
           </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {categories.map((cat) => (
          <div 
            key={cat.id}
            onClick={cat.active ? onSelectCans : undefined}
            className={`
              relative flex flex-col p-10 rounded-[48px] border transition-all duration-500
              ${cat.active 
                ? 'bg-white/15 border-white/20 cursor-pointer hover:scale-[1.03] hover:bg-white/20 shadow-2xl group' 
                : 'bg-white/5 border-white/10 opacity-60 grayscale-[0.5]'}
            `}
          >
            {/* Badges */}
            {cat.count && (
              <div className="absolute top-8 right-8 bg-indigo-600/80 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                {cat.count}
              </div>
            )}
            {cat.badge && (
              <div className="absolute top-8 right-8 bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
                {cat.badge}
              </div>
            )}

            {/* Icon */}
            <div className={`text-6xl mb-10 ${cat.active ? 'group-hover:rotate-12 transition-transform duration-500' : ''}`}>
              {cat.icon}
            </div>

            {/* Text Content */}
            <h2 className="text-3xl font-black mb-4 tracking-tight">{cat.title}</h2>
            <p className="text-white/50 font-medium leading-relaxed mb-10">
              {cat.desc}
            </p>

            {/* Action */}
            {cat.active && (
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-white/40 group-hover:text-white transition-colors">
                Entrar <span className="text-xl">→</span>
              </div>
            )}
          </div>
        ))}

        {/* Extra Empty Card Style */}
        <div className="bg-white/5 border border-white/10 border-dashed rounded-[48px] p-10 flex flex-col items-center justify-center text-center opacity-40">
           <div className="text-5xl mb-4">✨</div>
           <p className="text-2xl font-black italic tracking-tighter">Em breve...</p>
        </div>
      </div>
    </div>
  );
};

export default CollectionMenu;
