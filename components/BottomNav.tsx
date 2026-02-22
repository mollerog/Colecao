
import React from 'react';

interface BottomNavProps {
  currentView: 'menu' | 'cans' | 'achievements' | 'cards' | 'cars';
  onNavigate: (view: 'menu' | 'cans' | 'achievements' | 'cards' | 'cars') => void;
  onAdd: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, onAdd }) => {
  const isDashboard = ['cans', 'cards', 'cars'].includes(currentView);

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-2xl border-t border-white/20 px-6 py-3 flex items-center justify-between z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      <button 
        onClick={() => onNavigate('menu')}
        className={`flex flex-col items-center gap-1 transition-all ${currentView === 'menu' ? 'text-white scale-110' : 'text-white/40'}`}
      >
        <span className="text-xl">🏠</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Início</span>
      </button>

      <button 
        onClick={() => onNavigate('achievements')}
        className={`flex flex-col items-center gap-1 transition-all ${currentView === 'achievements' ? 'text-white scale-110' : 'text-white/40'}`}
      >
        <span className="text-xl">🏆</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Conquistas</span>
      </button>

      {isDashboard && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <button 
            onClick={onAdd}
            className="w-16 h-16 bg-[#F43F5E] rounded-full shadow-2xl border-4 border-[#764ba2] flex items-center justify-center text-white text-3xl font-light active:scale-90 transition-all"
          >
            +
          </button>
        </div>
      )}

      <div className="w-12"></div> {/* Spacer for FAB */}

      <button 
        onClick={() => {
          if (currentView === 'cans') onNavigate('cards');
          else if (currentView === 'cards') onNavigate('cars');
          else onNavigate('cans');
        }}
        className="flex flex-col items-center gap-1 text-white/40"
      >
        <span className="text-xl">🔄</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Trocar</span>
      </button>

      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex flex-col items-center gap-1 text-white/40"
      >
        <span className="text-xl">☝️</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Topo</span>
      </button>
    </div>
  );
};

export default BottomNav;
