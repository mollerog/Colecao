
import React, { useState, useMemo, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Firestore, collection, doc, deleteDoc, writeBatch, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { CreditCard } from '../types';
import CardStatsCards from './CardStatsCards';
import Toolbar from './Toolbar';
import CardFilters from './CardFilters';
import CardCard from './CardCard';
import CardModal from './CardModal';
import CardDetailModal from './CardDetailModal';
import CardStatsCharts from './CardStatsCharts';
import CardImportModal from './CardImportModal';
import CardExportModal from './CardExportModal';
import CardBulkUploadModal from './CardBulkUploadModal';
import FullScreenViewer from './FullScreenViewer';

interface CardDashboardProps {
  user: User;
  cards: CreditCard[];
  db: Firestore;
  auth: any;
  syncStatus: string;
  onBack: () => void;
}

export type ViewLayout = 'grid' | 'large' | 'list' | 'compact';
export type SortOption = 'name' | 'recent' | 'year';
export type SortOrder = 'asc' | 'desc';

const CardDashboard: React.FC<CardDashboardProps> = ({ user, cards, db, auth, syncStatus, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [detailCard, setDetailCard] = useState<CreditCard | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewLayout, setViewLayout] = useState<ViewLayout>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isAnyModalOpen = isModalOpen || isBulkOpen || isStatsOpen || isImportOpen || isExportOpen || !!detailCard || !!selectedImage;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAnyModalOpen]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
        setDetailCard(null);
        setIsStatsOpen(false);
        if (selectedIds.size === 0) setIsSelectionMode(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedIds.size]);

  const processedCards = useMemo(() => {
    let result = [...cards];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.cardName.toLowerCase().includes(lower) ||
        c.issuer.toLowerCase().includes(lower) ||
        c.network.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower) ||
        (c.year && c.year.toLowerCase().includes(lower))
      );
    }
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(c => String((c as any)[key] || '').trim() === String(value).trim());
      }
    });
    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') comp = a.cardName.localeCompare(b.cardName);
      else if (sortBy === 'year') comp = (parseInt(a.year || '0') || 0) - (parseInt(b.year || '0') || 0);
      else comp = (a.updatedAt?.seconds || 0) - (b.updatedAt?.seconds || 0);
      return sortOrder === 'asc' ? comp : comp * -1;
    });
    return result;
  }, [cards, searchTerm, activeFilters, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este cartão permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cards', id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setDetailCard(null);
    } catch (e) { alert("Erro ao excluir"); }
  };

  const handleSave = async (data: any) => {
    try {
      const cardsRef = collection(db, 'users', user.uid, 'cards');
      if (editingCard) {
        await updateDoc(doc(db, 'users', user.uid, 'cards', editingCard.id), { ...data, updatedAt: serverTimestamp() });
      } else {
        await addDoc(cardsRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      setIsModalOpen(false);
      setEditingCard(null);
      setDetailCard(null);
    } catch (e) { alert("Erro ao salvar"); }
  };

  const selectAllFiltered = () => {
    const allFilteredIds = processedCards.map(c => c.id);
    setSelectedIds(new Set(allFilteredIds));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const gridClass = {
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8",
    large: "grid grid-cols-1 md:grid-cols-2 gap-12",
    compact: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4",
    list: "flex flex-col gap-4"
  }[viewLayout];

  const sortLabels = {
    name: 'ALFABÉTICA',
    recent: 'RECENTES',
    year: 'ANO'
  };

  return (
    <div className="min-h-screen gradient-bg">
      <header className="text-white pt-8 pb-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center mb-8 px-4 gap-2">
          <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-[8px] sm:text-[10px] font-black uppercase tracking-[1px] sm:tracking-[2px] px-4 sm:px-8 py-3 rounded-full transition-all border border-white/10 whitespace-nowrap">← Menu Principal</button>
          <button onClick={() => setIsStatsOpen(true)} className="bg-white text-indigo-600 hover:scale-105 active:scale-95 text-[8px] sm:text-[10px] font-black uppercase tracking-[1px] sm:tracking-[2px] px-4 sm:px-8 py-3 rounded-full transition-all shadow-xl whitespace-nowrap">⭐ Estatísticas</button>
        </div>
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="flex flex-col items-center justify-center gap-2">
             <span className="text-3xl sm:text-5xl drop-shadow-lg">💳</span>
             <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white text-center">Meus Cartões</h1>
          </div>
          <button 
            onClick={() => { setEditingCard(null); setIsModalOpen(true); }}
            className="sm:hidden bg-[#F43F5E] hover:bg-[#E11D48] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[2px] shadow-xl active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="text-lg">+</span> ADICIONAR NOVO ITEM
          </button>
        </div>
        <CardStatsCards cards={cards} />
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-40 space-y-4">
        <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-2xl p-2 sm:p-3 transition-all duration-300">
           <Toolbar onOpenImport={() => setIsImportOpen(true)} onOpenExport={() => setIsExportOpen(true)} onClearAll={() => {}} />
        </div>
        <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-2xl p-2 sm:p-3 transition-all duration-300">
          <CardFilters cards={cards} activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
        </div>
        <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-2xl p-2 sm:p-3 transition-all duration-300">
          <div className="bg-white rounded-[24px] flex items-center relative overflow-hidden shadow-xl border border-white">
            <span className="absolute left-6 sm:left-10 text-xl sm:text-2xl z-10">🔍</span>
            <input 
              type="text" 
              placeholder="Pesquisar cartões..." 
              className="w-full pl-16 sm:pl-24 pr-10 sm:pr-16 py-2.5 rounded-[24px] bg-transparent outline-none text-base sm:text-lg font-bold text-gray-800 transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* Separador de Contagem */}
        <div className="flex items-center gap-6 my-10 opacity-60">
          <div className="h-[1px] flex-1 bg-white/20"></div>
          <span className="text-white text-[10px] font-black uppercase tracking-[3px] whitespace-nowrap">
            {processedCards.length} CARTÕES NA LISTAGEM
          </span>
          <div className="h-[1px] flex-1 bg-white/20"></div>
        </div>

        {/* Barra de Visualização e Ordenação */}
        <div className="flex flex-wrap justify-between sm:justify-end items-center gap-2 sm:gap-4 mb-8 px-2 sm:px-4 opacity-70 sm:opacity-50 transition-opacity hover:opacity-100">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[1px] sm:tracking-[2px] text-white/50">VISUALIZAR:</span>
            <div className="flex gap-0.5 items-center">
              {[
                { id: 'grid', icon: '⠿' },
                { id: 'large', icon: '▢' },
                { id: 'compact', icon: '∷' },
                { id: 'list', icon: '☰' }
              ].map(v => (
                <button 
                  key={v.id}
                  onClick={() => setViewLayout(v.id as ViewLayout)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${viewLayout === v.id ? 'bg-white/10 text-white shadow-lg backdrop-blur-md' : 'text-white/30 hover:text-white/50'} ${(v.id === 'grid' || v.id === 'compact') ? 'hidden sm:flex' : 'flex'}`}
                >
                  <span className="text-base sm:text-lg">{v.icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:block w-[1px] h-3 bg-white/10 mx-1"></div>

          <div className="flex items-center gap-1.5 sm:gap-2">
             <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[1px] sm:tracking-[2px] text-white/50">ORDENAR:</span>
             <div className="relative group">
                <button className="text-[8px] sm:text-[9px] font-black uppercase tracking-[1px] text-white flex items-center gap-1 hover:opacity-100 transition-all whitespace-nowrap">
                  {sortLabels[sortBy]} <span className="text-[6px] opacity-40">▼</span>
                </button>
                <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-1.5 w-32 sm:w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                   {(['name', 'recent', 'year'] as SortOption[]).map(opt => (
                     <button 
                       key={opt}
                       onClick={() => setSortBy(opt)}
                       className={`w-full text-left px-4 sm:px-5 py-2 text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === opt ? 'text-indigo-400 bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                     >
                       {sortLabels[opt]}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <button 
            onClick={scrollToTop}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-white/20 hover:text-white transition-all ml-0.5"
          >
            <span className="text-base sm:text-lg font-thin">↑</span>
          </button>
        </div>

        {processedCards.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-20 px-10 border-2 border-dashed border-white/10 rounded-[64px] transition-all animate-in fade-in zoom-in duration-700">
            <div className="w-28 h-14 bg-white/5 rounded-[100%] shadow-inner flex items-center justify-center border border-white/5 mb-8">
               <div className="w-20 h-8 bg-indigo-500/20 rounded-[100%] blur-xl animate-pulse"></div>
            </div>
            <span className="text-white/30 text-3xl font-black uppercase tracking-[12px] ml-3">Vazio</span>
          </div>
        ) : (
          <div className={gridClass}>
            {processedCards.map(card => (
              <CardCard 
                key={card.id} 
                card={card} 
                variant={viewLayout}
                onEdit={() => { setEditingCard(card); setIsModalOpen(true); }}
                onDelete={() => handleDelete(card.id)}
                onViewImage={(url) => setSelectedImage(url)}
                onViewDetail={() => setDetailCard(card)}
                isSelected={selectedIds.has(card.id)}
                onToggleSelect={() => { setIsSelectionMode(true); toggleSelect(card.id); }}
                isSelectionMode={isSelectionMode}
              />
            ))}
          </div>
        )}
      </main>

      {isSelectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-[95%] max-w-2xl animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg shadow-indigo-500/40 animate-pulse">
                {selectedIds.size}
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[10px] font-black uppercase tracking-widest leading-none">Selecionados</span>
                <span className="text-white/40 text-[8px] font-bold uppercase tracking-tighter mt-1">Pronto para exportar</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={selectAllFiltered}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10"
              >
                Selecionar Tudo
              </button>
              <button 
                onClick={deselectAll}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10"
              >
                Limpar
              </button>
              <button 
                onClick={() => setIsExportOpen(true)}
                disabled={selectedIds.size === 0}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                Exportar
              </button>
              <button 
                onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }}
                className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => { setEditingCard(null); setIsModalOpen(true); }} 
        className={`fixed bottom-6 right-6 sm:bottom-12 sm:right-12 w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[32px] bg-[#F43F5E] shadow-2xl text-white text-4xl sm:text-6xl font-light flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] border-2 sm:border-4 border-white/20 ${isSelectionMode ? 'translate-x-40 opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        +
      </button>
      
      {selectedImage && (
        <FullScreenViewer 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}

      {isModalOpen && <CardModal card={editingCard} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
      {detailCard && <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} onEdit={() => { setEditingCard(detailCard); setIsModalOpen(true); }} onDelete={() => handleDelete(detailCard.id)} onViewImage={(url) => setSelectedImage(url)} />}
      {isStatsOpen && <CardStatsCharts cards={cards} onClose={() => setIsStatsOpen(false)} />}
      {isImportOpen && <CardImportModal db={db} user={user} onClose={() => setIsImportOpen(false)} currentCount={cards.length} onOpenBulk={() => { setIsImportOpen(false); setIsBulkOpen(true); }} />}
      {isExportOpen && <CardExportModal allCards={cards} selectedCards={cards.filter(c => selectedIds.has(c.id))} onClose={() => setIsExportOpen(false)} onEnterSelectionMode={() => { setIsExportOpen(false); setIsSelectionMode(true); }} />}
      {isBulkOpen && <CardBulkUploadModal cards={cards} onClose={() => setIsBulkOpen(false)} db={db} user={user} />}
    </div>
  );
};

export default CardDashboard;
