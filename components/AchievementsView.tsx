
import React from 'react';
import { Can } from '../types';

interface AchievementsViewProps {
  cans: Can[];
  onBack: () => void;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({ cans, onBack }) => {
  const cansCount = cans.length;

  const achievementsList = [
    { label: 'Iniciante', count: 1, icon: '🌱', desc: 'Sua primeira lata registrada!' },
    { label: 'Entusiasta', count: 10, icon: '⭐', desc: 'Dez itens de pura dedicação.' },
    { label: 'Colecionador', count: 50, icon: '🏆', desc: 'Uma estante que já impõe respeito.' },
    { label: 'Veterano', count: 100, icon: '🔥', desc: 'Centenário de latas! Incrível.' },
    { label: 'Elite', count: 200, icon: '💎', desc: 'Sua coleção é agora uma referência.' },
    { label: 'Mestre', count: 500, icon: '👑', desc: 'O mestre supremo do colecionismo.' },
    { label: 'Lenda', count: 1000, icon: '🌌', desc: 'Um feito histórico. Mil itens!' },
    { label: 'Imortal', count: 2000, icon: '🪐', desc: 'Sua coleção viverá para sempre.' },
    { label: 'Divindade', count: 5000, icon: '✨', desc: 'Um deus entre os colecionadores.' },
    { label: 'Ancestral', count: 7500, icon: '☄️', desc: 'Sabedoria e raridade em cada item.' },
    { label: 'Omnipotente', count: 10000, icon: '♾️', desc: 'O limite final foi ultrapassado.' },
  ];

  const nextAchievement = achievementsList.find(a => cansCount < a.count);
  const progress = nextAchievement 
    ? Math.min(100, (cansCount / nextAchievement.count) * 100) 
    : 100;

  return (
    <div className="min-h-screen gradient-bg text-white overflow-x-hidden pb-20 pt-4 sm:pt-0">
      {/* Persisted Header Style */}
      <header className="w-full p-4 sm:p-6 sm:px-10 flex justify-between items-center animate-in fade-in duration-700">
        <div className="flex items-center gap-3 sm:gap-4">
           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#5549ED] flex items-center justify-center font-black text-lg sm:text-xl shadow-lg">🏆</div>
           <div className="flex flex-col text-left">
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[2px] text-white/50 leading-none mb-1">Status Global</span>
            <span className="text-xs sm:text-sm font-black tracking-tight text-white uppercase">Conquistas</span>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 sm:px-8 sm:py-3.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[2.5px] transition-all active:scale-95 shadow-md"
        >
          VOLTAR
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        {/* Progress Section */}
        <div className="text-center mb-10 sm:mb-16 animate-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl sm:text-8xl font-black tracking-tighter mb-2 sm:mb-4">Seu Progresso</h1>
          <p className="text-white/40 text-[10px] sm:text-sm font-bold uppercase tracking-[2px] sm:tracking-[4px] mb-8 sm:mb-12">Rumo ao nível de divindade</p>
          
          {nextAchievement && (
            <div className="max-w-2xl mx-auto bg-black/20 backdrop-blur-xl rounded-[24px] sm:rounded-[40px] p-6 sm:p-8 border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-4 sm:mb-5">
                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[3px] text-indigo-400">Próxima: {nextAchievement.label}</p>
                <p className="text-xs sm:text-sm font-black text-white">{cansCount} / {nextAchievement.count}</p>
              </div>
              <div className="w-full h-3 sm:h-4 bg-white/5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-[#5549ED] via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 sm:mt-4 text-[8px] sm:text-[10px] text-white/30 font-bold uppercase tracking-widest">
                Faltam {nextAchievement.count - cansCount} itens
              </p>
            </div>
          )}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {achievementsList.map((ach, idx) => {
            const isUnlocked = cansCount >= ach.count;
            return (
              <div 
                key={idx}
                className={`
                  relative p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] border transition-all duration-700
                  ${isUnlocked 
                    ? 'bg-white shadow-2xl border-white scale-100' 
                    : 'bg-white/5 border-white/10 opacity-30 scale-95 grayscale'}
                `}
              >
                {/* Achievement Icon */}
                <div className={`
                  w-16 h-16 sm:w-24 sm:h-24 rounded-full mb-6 sm:mb-8 flex items-center justify-center text-2xl sm:text-4xl shadow-inner transition-transform duration-500
                  ${isUnlocked 
                    ? 'bg-gradient-to-br from-[#5549ED] to-purple-600 text-white scale-110' 
                    : 'bg-black/20 text-white/20'}
                `}>
                  {ach.icon}
                </div>

                <div className="space-y-2">
                  <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isUnlocked ? 'text-slate-900' : 'text-white'}`}>
                    {ach.label}
                  </h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isUnlocked ? 'text-indigo-600' : 'text-white/40'}`}>
                    {ach.count.toLocaleString()}+ ITENS
                  </p>
                  <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isUnlocked ? 'text-slate-500' : 'text-white/20'}`}>
                    {ach.desc}
                  </p>
                </div>
                
                {isUnlocked && (
                  <div className="absolute top-6 right-6 sm:top-8 sm:right-10 bg-green-500 text-white text-[8px] sm:text-[9px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-bounce">
                    ADQUIRIDO
                  </div>
                )}

                {!isUnlocked && (
                   <div className="mt-4 sm:mt-6 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500/50" style={{ width: `${(cansCount / ach.count) * 100}%` }}></div>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsView;
