
import React, { useState, useMemo, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Firestore, collection, doc, deleteDoc, writeBatch, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { CreditCard } from '../types';
import CardStatsCards from './CardStatsCards';
import Toolbar from './Toolbar';
import CardFilters from './CardFilters';
import CardCard from './CardCard';
import CardModal from './CardModal';
import CardStatsCharts from './CardStatsCharts';
import CardImportModal from './CardImportModal';
import CardExportModal from './CardExportModal';
import CardBulkUploadModal from './CardBulkUploadModal';

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
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const [viewLayout, setViewLayout] = useState<ViewLayout>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
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
    } catch (e) { alert("Erro ao excluir"); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Excluir permanentemente os ${selectedIds.size} cartões selecionados?`)) return;
    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => { batch.delete(doc(db, 'users', user.uid, 'cards', id)); });
      await batch.commit();
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      alert('Itens excluídos com sucesso!');
    } catch (e) { alert("Erro na exclusão em massa"); }
  };

  const handleClearAll = async () => {
    if (cards.length === 0) return;
    const confirmText = prompt(`Para apagar todos os ${cards.length} cartões, digite: DELETAR TUDO`);
    if (confirmText === 'DELETAR TUDO') {
      const batch = writeBatch(db);
      cards.forEach(c => { batch.delete(doc(db, 'users', user.uid, 'cards', c.id)); });
      await batch.commit();
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      alert('Coleção limpa!');
    }
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
    } catch (e) { alert("Erro ao salvar"); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const allVisible = processedCards.map(c => c.id);
    const allSelected = allVisible.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) allVisible.forEach(id => next.delete(id));
      else allVisible.forEach(id => next.add(id));
      return next;
    });
  };

  const sectionClass = "max-w-7xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl p-6 transition-all duration-300";

  const gridClass = {
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8",
    large: "grid grid-cols-1 md:grid-cols-2 gap-12",
    compact: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4",
    list: "flex flex-col gap-4"
  }[viewLayout];

  return (
    <div className="min-h-screen gradient-bg">
      <header className="text-white pt-8 pb-12 px-4 text-center">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 px-4">
          <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-[10px] font-black uppercase tracking-[2px] px-8 py-3 rounded-full transition-all border border-white/10">← Painel Principal</button>
          <button 
            onClick={() => setIsStatsOpen(true)}
            className="bg-white text-indigo-600 hover:scale-105 active:scale-95 text-[10px] font-black uppercase tracking-[2px] px-8 py-3 rounded-full transition-all shadow-xl"
          >
            ⭐ Estatísticas Avançadas
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex items-center justify-center gap-4">
             <span className="text-5xl drop-shadow-lg">💳</span>
             <h1 className="text-6xl font-black tracking-tighter text-white">Meus Cartões</h1>
          </div>
          <p className="text-white/60 text-sm font-bold uppercase tracking-widest">{user.email}</p>
        </div>

        <CardStatsCards cards={cards} />
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-40 space-y-6">
        <div className={sectionClass}>
           <Toolbar 
            onOpenImport={() => setIsImportOpen(true)} 
            onOpenExport={() => setIsExportOpen(true)} 
            onClearAll={handleClearAll}
          />
        </div>

        <div className={sectionClass}>
          <CardFilters cards={cards} activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
        </div>

        <div className={sectionClass}>
          <div className="bg-white/95 rounded-[32px] p-2 flex items-center relative overflow-hidden shadow-sm border border-white">
            <span className="absolute left-6 text-2xl z-10">🔍</span>
            <input 
              type="text" 
              placeholder="Pesquisar cartões (Nome, Banco, Bandeira...)"
              className="w-full pl-16 pr-6 py-4 rounded-[24px] bg-transparent outline-none text-xl font-bold text-gray-800 placeholder:text-gray-300 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-6 w-full mb-4">
             <div className="h-[1px] bg-white/20 flex-1 rounded-full"></div>
             <p className="text-[12px] font-black text-white uppercase tracking-[5px] whitespace-nowrap">{processedCards.length} Cartões na Listagem</p>
             <div className="h-[1px] bg-white/20 flex-1 rounded-full"></div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-white/50 px-4 mb-10 transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[1.5px] opacity-60">Visualização</span>
              <div className="flex items-center gap-0.5">
                {(['grid', 'large', 'compact', 'list'] as ViewLayout[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewLayout(mode)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${viewLayout === mode ? 'text-white bg-white/10' : 'hover:text-white/80 hover:bg-white/5'}`}
                  >
                    {mode === 'grid' && <span className="text-xs">⠿</span>}
                    {mode === 'large' && <span className="text-xs">▣</span>}
                    {mode === 'compact' && <span className="text-xs">▦</span>}
                    {mode === 'list' && <span className="text-xs">☰</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-[1px] h-3 bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[1.5px] opacity-60">Ordenar:</span>
              <div className="relative group">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-white font-bold text-[10px] uppercase tracking-wider outline-none cursor-pointer hover:text-white transition-colors appearance-none pr-3"
                >
                  <option value="name" className="text-gray-900 bg-white">Alfabética</option>
                  <option value="recent" className="text-gray-900 bg-white">Recentes</option>
                  <option value="year" className="text-gray-900 bg-white">Ano</option>
                </select>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[7px] pointer-events-none group-hover:text-white transition-colors">▾</span>
              </div>
            </div>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="text-white/60 hover:text-white transition-all font-black text-base p-1">{sortOrder === 'asc' ? '↑' : '↓'}</button>
            {(isSelectionMode || selectedIds.size > 0) && (
              <>
                <div className="w-[1px] h-3 bg-white/10 hidden sm:block"></div>
                <button onClick={handleToggleSelectAll} className="text-[9px] font-black text-white/30 hover:text-white uppercase tracking-[1.5px]">
                  {processedCards.every(c => selectedIds.has(c.id)) ? '[ Desmarcar ]' : '[ Selecionar ]'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className={gridClass}>
          {processedCards.map(card => (
            <CardCard 
              key={card.id} 
              card={card} 
              variant={viewLayout}
              onEdit={() => { setEditingCard(card); setIsModalOpen(true); }}
              onDelete={() => handleDelete(card.id)}
              onViewImage={(url) => setSelectedImage(url)}
              isSelected={selectedIds.has(card.id)}
              onToggleSelect={() => { setIsSelectionMode(true); toggleSelect(card.id); }}
              isSelectionMode={isSelectionMode}
            />
          ))}
          {processedCards.length === 0 && (
            <div className="col-span-full text-center py-40 bg-white/5 rounded-[64px] border-2 border-dashed border-white/10">
              <div className="text-9xl mb-8 grayscale opacity-20">🕳️</div>
              <h3 className="text-3xl font-black text-white/40 uppercase tracking-[8px]">Vazio</h3>
            </div>
          )}
        </div>
      </main>

      <button 
        onClick={() => { setEditingCard(null); setIsModalOpen(true); }}
        className="fixed bottom-12 right-12 w-24 h-24 rounded-[32px] bg-[#F43F5E] shadow-2xl text-white text-6xl font-light flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] border-4 border-white/20"
      >
        +
      </button>

      {(isSelectionMode || selectedIds.size > 0) && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-white/10 px-10 py-5 rounded-[32px] shadow-2xl flex items-center gap-10 z-[100] animate-in slide-in-from-bottom-10 duration-500">
           <div className="flex flex-col text-white">
              <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Selecionados</span>
              <span className="text-xl font-black">{selectedIds.size} Cartões</span>
           </div>
           <div className="h-10 w-[1px] bg-white/10"></div>
           <div className="flex gap-4">
              <button onClick={() => setIsExportOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">Exportar Seleção</button>
              <button onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">Excluir Seleção</button>
              <button onClick={() => { setSelectedIds(new Set()); setIsSelectionMode(false); }} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">Sair</button>
           </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex items-center justify-center overflow-hidden" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} className="max-w-[95vw] max-h-[95vh] object-contain rounded-2xl animate-in zoom-in" alt="Fullscreen" />
          <button className="absolute top-10 right-10 text-white text-6xl font-thin">×</button>
        </div>
      )}

      {isModalOpen && <CardModal card={editingCard} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
      {isStatsOpen && <CardStatsCharts cards={cards} onClose={() => setIsStatsOpen(false)} />}
      {isImportOpen && <CardImportModal db={db} user={user} onClose={() => setIsImportOpen(false)} currentCount={cards.length} onOpenBulk={() => { setIsImportOpen(false); setIsBulkOpen(true); }} />}
      {isExportOpen && <CardExportModal allCards={cards} selectedCards={cards.filter(c => selectedIds.has(c.id))} onClose={() => setIsExportOpen(false)} onEnterSelectionMode={() => { setIsExportOpen(false); setIsSelectionMode(true); }} />}
      {isBulkOpen && <CardBulkUploadModal cards={cards} onClose={() => setIsBulkOpen(false)} db={db} user={user} />}
    </div>
  );
};

export default CardDashboard;
