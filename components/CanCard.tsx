
import React from 'react';
import { Can } from '../types';
import { ViewLayout } from './Dashboard';

interface CanCardProps {
  can: Can;
  variant?: ViewLayout;
  onEdit: () => void;
  onDelete: () => void;
  onViewImage: (url: string) => void;
  onViewDetail: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isSelectionMode?: boolean;
}

const CanCard: React.FC<CanCardProps> = ({ 
  can, variant = 'grid', onEdit, onDelete, onViewImage, onViewDetail, isSelected, onToggleSelect, isSelectionMode 
}) => {
  const truncate = (str: string | undefined, n: number) => {
    if (!str) return '';
    return str.length > n ? str.slice(0, n - 1) + '...' : str;
  };

  const SelectionOverlay = () => {
    if (!isSelectionMode && !isSelected) return null;
    return (
      <div 
        onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}
        className={`absolute top-4 left-4 w-8 h-8 rounded-full border-2 z-30 flex items-center justify-center cursor-pointer transition-all animate-in zoom-in duration-300 ${isSelected ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-lg' : 'bg-black/10 border-white/60 shadow-md hover:scale-105 hover:bg-black/20'}`}
      >
        {isSelected && <span className="text-white text-sm font-black">✓</span>}
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <div 
        onClick={onViewDetail}
        className={`bg-white rounded-[24px] shadow-sm overflow-hidden flex flex-col group border transition-all duration-500 animate-in fade-in zoom-in h-full relative cursor-pointer ${isSelected ? 'ring-4 ring-indigo-500/30 border-indigo-500 scale-[1.05]' : 'border-gray-100 hover:shadow-xl hover:scale-[1.05]'}`}>
        <SelectionOverlay />
        <div 
          className="h-28 sm:h-40 bg-[#F8FAFF] relative flex items-center justify-center p-2 shrink-0 overflow-hidden cursor-zoom-in"
          onClick={(e) => { e.stopPropagation(); can.photo && onViewImage(can.photo); }}
        >
          {can.photo ? <img src={can.photo} alt={can.brand} className="w-full h-full object-contain" /> : <div className="text-2xl sm:text-3xl opacity-10">🥤</div>}
        </div>
        <div className="p-2 sm:p-3">
          <p className="text-[9px] sm:text-[11px] font-black text-[#6366F1] truncate mb-0.5">{(can.group || '')}</p>
          <h3 className="text-[10px] sm:text-[12px] font-bold text-gray-800 truncate leading-tight">{can.brand}</h3>
        </div>
        <div className="absolute inset-0 bg-indigo-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2" onClick={(e) => e.stopPropagation()}>
           <button onClick={onEdit} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm shadow-lg">✏️</button>
           <button onClick={onDelete} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm shadow-lg">🗑️</button>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div 
        onClick={onViewDetail}
        className={`bg-white rounded-[24px] shadow-sm flex items-center gap-6 p-4 group border cursor-pointer transition-all animate-in fade-in slide-in-from-left-4 ${isSelected ? 'ring-4 ring-indigo-500/30 border-indigo-500 bg-indigo-50/20' : 'border-gray-100 hover:shadow-lg'}`}>
        {(isSelectionMode || isSelected) && (
          <div onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-100 border-gray-300'}`}>
            {isSelected && <span className="text-white text-sm">✓</span>}
          </div>
        )}
        <div 
          className="w-20 h-20 bg-[#F8FAFF] rounded-xl flex items-center justify-center shrink-0 cursor-zoom-in overflow-hidden"
          onClick={(e) => { e.stopPropagation(); can.photo && onViewImage(can.photo); }}
        >
           {can.photo ? <img src={can.photo} className="w-full h-full object-contain" /> : <div className="text-2xl opacity-10">🥤</div>}
        </div>
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 items-center">
           <div>
              <p className="text-[10px] font-black text-[#6366F1] uppercase tracking-wider mb-0.5">{can.group}</p>
              <h3 className="text-base font-bold text-gray-800 leading-tight">{can.brand} <span className="text-gray-400 font-medium text-sm block lg:inline">{can.name}</span></h3>
           </div>
           <div className="hidden lg:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Tamanho / Ano</p>
              <p className="text-sm font-semibold text-gray-600">{can.size || '--'} | {can.year || '--'}</p>
           </div>
           <div className="hidden lg:block truncate">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Descrição Imagem</p>
              <p className="text-sm font-medium text-gray-400">{can.imageDesc}</p>
           </div>
           <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
              <button onClick={onEdit} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all">Editar</button>
              <button onClick={onDelete} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all">Excluir</button>
           </div>
        </div>
      </div>
    );
  }

  const isLarge = variant === 'large';
  return (
    <div 
      onClick={onViewDetail}
      className={`bg-white rounded-[32px] shadow-sm overflow-hidden flex flex-col group border transition-all cursor-pointer duration-500 h-full animate-in fade-in slide-in-from-bottom-4 relative ${isLarge ? 'max-w-4xl mx-auto w-full' : ''} ${isSelected ? 'ring-4 ring-indigo-500/30 border-indigo-500 scale-[1.03] -translate-y-1' : 'border-gray-100 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1'}`}>
      <SelectionOverlay />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6366F1] to-[#9333EA] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div 
        className={`${isLarge ? 'h-[300px] sm:h-[400px]' : 'h-48 sm:h-64'} bg-[#F8FAFF] relative flex items-center justify-center p-3 sm:p-4 shrink-0 overflow-hidden cursor-zoom-in`}
        onClick={(e) => { e.stopPropagation(); can.photo && onViewImage(can.photo); }}
      >
        {can.photo ? <img src={can.photo} alt={can.brand} className="w-full h-full object-contain drop-shadow-md" /> : <div className={`${isLarge ? 'text-7xl sm:text-9xl' : 'text-5xl sm:text-6xl'} opacity-10`}>🥤</div>}
      </div>
      <div className={`p-4 sm:p-5 ${isLarge ? 'sm:p-10' : ''} flex-1 flex flex-col`}>
        <p className={`${isLarge ? 'text-lg sm:text-xl' : 'text-[12px] sm:text-[14px]'} font-bold text-[#6366F1] leading-tight mb-0.5 truncate`}>{(can.group || '')} {can.acronym ? `(${can.acronym})` : ''}</p>
        <h3 className={`${isLarge ? 'text-xl sm:text-2xl' : 'text-[14px] sm:text-[16px]'} font-semibold text-[#333] leading-tight mb-0.5 truncate`}>{can.brand || ''}</h3>
        <div className="mb-1"><p className={`${isLarge ? 'text-base sm:text-lg' : 'text-[11px] sm:text-[13px]'} font-medium text-gray-600 leading-tight truncate`}>{can.name || ''}</p></div>
        {can.description && <div className="mt-1"><p className={`${isLarge ? 'text-sm sm:text-base' : 'text-[10px] sm:text-[12px]'} font-medium text-gray-400 italic leading-snug line-clamp-2`}>"{truncate(can.description, isLarge ? 200 : 80)}"</p></div>}
        <div className="h-[1px] bg-gray-50 w-full my-2 sm:my-3"></div>
        <div className={`space-y-1 sm:space-y-1.5 mb-4 sm:mb-5 ${isLarge ? 'grid grid-cols-3 gap-6 space-y-0' : ''}`}>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]"><span className="shrink-0 text-sm sm:text-base">📅</span><span className="text-gray-400 font-medium"><span className="text-gray-500 font-bold mr-1">Ano:</span>{can.year || '--'}</span></div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]"><span className="shrink-0 text-sm sm:text-base">📏</span><span className="text-gray-400 font-medium"><span className="text-gray-500 font-bold mr-1">Tam:</span>{can.size || '--'}</span></div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]"><span className="shrink-0 text-sm sm:text-base">🖼️</span><span className="text-gray-400 font-medium truncate uppercase tracking-tighter"><span className="text-gray-500 font-bold mr-1">ID:</span> {can.imageDesc}</span></div>
        </div>
        <div className={`flex gap-1.5 sm:gap-2 mt-auto ${isLarge ? 'sm:gap-6' : ''}`} onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className={`flex-1 bg-[#F1F3FF] hover:bg-[#6366F1] text-[#6366F1] hover:text-white font-bold py-2 sm:py-2.5 rounded-xl transition-all ${isLarge ? 'sm:py-4 sm:text-base' : 'text-[10px] sm:text-[11px]'} border border-[#6366F1]/10`}>✏️ Editar</button>
          <button onClick={onDelete} className={`flex-1 bg-[#FFF1F1] hover:bg-[#F43F5E] text-[#F43F5E] hover:text-white font-bold py-2 sm:py-2.5 rounded-xl transition-all ${isLarge ? 'sm:py-4 sm:text-base' : 'text-[10px] sm:text-[11px]'} border border-[#F43F5E]/10`}>🗑️ Deletar</button>
        </div>
      </div>
    </div>
  );
};

export default CanCard;
