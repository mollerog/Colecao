
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { Firestore, collection, doc, deleteDoc, writeBatch, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Can } from '../types';
import StatsCards from './StatsCards';
import Toolbar from './Toolbar';
import Filters from './Filters';
import CanCard from './CanCard';
import CanModal from './CanModal';
import BulkUploadModal from './BulkUploadModal';
import StatsCharts from './StatsCharts';
import ImportModal from './ImportModal';
import ExportModal from './ExportModal';

interface DashboardProps {
  user: User;
  cans: Can[];
  db: Firestore;
  auth: any;
  syncStatus: string;
  onBack: () => void;
}

export type ViewLayout = 'grid' | 'large' | 'list' | 'compact';
export type SortOption = 'name' | 'recent' | 'year';
export type SortOrder = 'asc' | 'desc';

const Dashboard: React.FC<DashboardProps> = ({ user, cans, db, auth, syncStatus, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingCan, setEditingCan] = useState<Can | null>(null);
  
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

  const processedCans = useMemo(() => {
    let result = [...cans];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.brand.toLowerCase().includes(lower) ||
        (c.name && c.name.toLowerCase().includes(lower)) ||
        c.group.toLowerCase().includes(lower) ||
        c.imageDesc.toLowerCase().includes(lower) ||
        (c.year && c.year.toLowerCase().includes(lower))
      );
    }
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value === '__BLANK__') {
        result = result.filter(c => {
          const val = (c as any)[key];
          return val === undefined || val === null || String(val).trim() === '';
        });
      } else if (value) {
        result = result.filter(c => String((c as any)[key] || '').trim() === String(value).trim());
      }
    });
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        const strA = (a.brand + (a.name || '')).toLowerCase();
        const strB = (b.brand + (b.name || '')).toLowerCase();
        comparison = strA.localeCompare(strB);
      } else if (sortBy === 'year') {
        comparison = (parseInt(a.year || '0') || 0) - (parseInt(b.year || '0') || 0);
      } else {
        const timeA = a.updatedAt?.seconds || 0;
        const timeB = b.updatedAt?.seconds || 0;
        comparison = timeA - timeB;
      }
      return sortOrder === 'asc' ? comparison : comparison * -1;
    });
    return result;
  }, [cans, searchTerm, activeFilters, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta lata permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cans', id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) { alert("Erro ao excluir"); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Excluir permanentemente as ${selectedIds.size} latas selecionadas?`)) return;
    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => { batch.delete(doc(db, 'users', user.uid, 'cans', id)); });
      await batch.commit();
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      alert('Itens excluídos com sucesso!');
    } catch (e) { alert("Erro na exclusão em massa"); }
  };

  const handleClearAll = async () => {
    if (cans.length === 0) return;
    const confirmText = prompt(`Para apagar todas as ${cans.length} latas, digite: DELETAR TUDO`);
    if (confirmText === 'DELETAR TUDO') {
      const batch = writeBatch(db);
      cans.forEach(c => { batch.delete(doc(db, 'users', user.uid, 'cans', c.id)); });
      await batch.commit();
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      alert('Coleção limpa!');
    }
  };

  const handleSave = async (data: any) => {
    try {
      const cansRef = collection(db, 'users', user.uid, 'cans');
      if (editingCan) {
        await updateDoc(doc(db, 'users', user.uid, 'cans', editingCan.id), { ...data, updatedAt: serverTimestamp() });
      } else {
        await addDoc(cansRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      setIsModalOpen(false);
      setEditingCan(null);
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
    const allCurrentlyVisibleIds = processedCans.map(c => c.id);
    const areAllVisibleSelected = allCurrentlyVisibleIds.every(id => selectedIds.has(id));
    if (areAllVisibleSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        allCurrentlyVisibleIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        allCurrentlyVisibleIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const handleExitSelection = () => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const sectionClass = "max-w-7xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl p-6 transition-all duration-300";

  const gridClass = {
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8",
    large: "grid grid-cols-1 md:grid-cols-2 gap-12",
    compact: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4",
    list: "flex flex-col gap-4"
  }[viewLayout];

  const allVisibleSelected = processedCans.length > 0 && processedCans.every(c => selectedIds.has(c.id));

  const controlContainerClass = "flex bg-black/20 p-1 rounded-[24px] border border-white/5 h-14 items-center";
  const controlBtnBase = "h-12 flex items-center justify-center rounded-[20px] transition-all duration-300 ease-out font-black uppercase tracking-[2px] text-[10px]";

  return (
    <div className="min-h-screen gradient-bg">
      <header className="text-white pt-8 pb-12 px-4 text-center">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 px-4">
          <button 
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 text-[10px] font-black uppercase tracking-[2px] px-8 py-3 rounded-full transition-all border border-white/10"
          >
            ← Painel Principal
          </button>
          
          <button 
            onClick={() => setIsStatsOpen(true)}
            className="bg-white text-indigo-600 hover:scale-105 active:scale-95 text-[10px] font-black uppercase tracking-[2px] px-8 py-3 rounded-full transition-all shadow-xl"
          >
            ⭐ Estatísticas Avançadas
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex items-center justify-center gap-4">
             <span className="text-5xl drop-shadow-lg">🥤</span>
             <h1 className="text-6xl font-black tracking-tighter text-white">Minha coleção de latas</h1>
          </div>
          <p className="text-white/60 text-sm font-bold uppercase tracking-widest">{user.email}</p>
        </div>

        <StatsCards cans={cans} />
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-40 space-y-6">
        {/* 1. Toolbar Section */}
        <div className={sectionClass}>
           <Toolbar 
            onOpenImport={() => setIsImportOpen(true)} 
            onOpenExport={() => setIsExportOpen(true)} 
            onClearAll={handleClearAll}
          />
        </div>

        {/* 2. Filters Section */}
        <div className={sectionClass}>
          <Filters 
            cans={cans} 
            activeFilters={activeFilters} 
            setActiveFilters={setActiveFilters} 
          />
        </div>

        {/* 3. Search Bar Section */}
        <div className={sectionClass}>
          <div className="bg-white/95 rounded-[32px] p-2 flex items-center relative overflow-hidden shadow-sm border border-white">
            <span className="absolute left-6 text-2xl z-10">🔍</span>
            <input 
              type="text" 
              placeholder="O que você está procurando? (Marca, Nome, Ano...)"
              className="w-full pl-16 pr-6 py-4 rounded-[24px] bg-transparent outline-none text-xl font-bold text-gray-800 placeholder:text-gray-300 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 4. Controls Section - Redesigned for Maximum Fluidity and Balance */}
        <div className={sectionClass}>
          <div className="flex flex-wrap items-end justify-between gap-10">
            {/* Visualização Group */}
            <div className="flex flex-col gap-2.5 ml-2">
              <span className="text-[11px] font-black text-white/50 uppercase tracking-[4px] ml-1">Visualização</span>
              <div className={controlContainerClass}>
                {(['grid', 'large', 'compact', 'list'] as ViewLayout[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewLayout(mode)}
                    className={`${controlBtnBase} w-14 ${viewLayout === mode ? 'bg-white text-indigo-600 shadow-xl' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                    title={mode}
                  >
                    {mode === 'grid' && <span className="text-lg">⠿</span>}
                    {mode === 'large' && <span className="text-lg">▣</span>}
                    {mode === 'compact' && <span className="text-lg">▦</span>}
                    {mode === 'list' && <span className="text-lg">☰</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-12 mr-2">
              {/* Ordenação Group */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-black text-white/50 uppercase tracking-[4px] ml-1">Ordenar por</span>
                <div className={controlContainerClass}>
                  {(['name', 'recent', 'year'] as SortOption[]).map(option => (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`${controlBtnBase} w-32 ${sortBy === option ? 'bg-white text-indigo-600 shadow-xl' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                    >
                      {option === 'name' ? 'Alfabética' : option === 'recent' ? 'Recentes' : 'Ano'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Direction Toggle - Perfectly Balanced with Order Buttons */}
              <div className="flex items-center">
                <div className={controlContainerClass}>
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`${controlBtnBase} w-16 text-xl ${sortOrder === 'asc' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
                    title="Crescente"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`${controlBtnBase} w-16 text-xl ${sortOrder === 'desc' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
                    title="Decrescente"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-6 flex flex-col items-center justify-center gap-2 min-h-[60px]">
           <div className="flex items-center justify-center gap-6 w-full">
              <div className="h-[2px] bg-white/20 flex-1 max-w-[120px] rounded-full"></div>
              <p className="text-[12px] font-black text-white uppercase tracking-[5px]">
                {processedCans.length} Itens na Listagem
              </p>
              <div className="h-[2px] bg-white/20 flex-1 max-w-[120px] rounded-full"></div>
           </div>
           
           {(isSelectionMode || selectedIds.size > 0) && processedCans.length > 0 && (
              <button 
                onClick={handleToggleSelectAll}
                className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-[3px] transition-all mt-1 animate-in fade-in slide-in-from-top-1"
              >
                {allVisibleSelected ? '[ Desmarcar Tudo ]' : '[ Selecionar Tudo ]'}
              </button>
           )}
        </div>

        <div className={gridClass}>
          {processedCans.map(can => (
            <CanCard 
              key={can.id} 
              can={can} 
              variant={viewLayout}
              onEdit={() => { setEditingCan(can); setIsModalOpen(true); }}
              onDelete={() => handleDelete(can.id)}
              onViewImage={(url) => setSelectedImage(url)}
              isSelected={selectedIds.has(can.id)}
              onToggleSelect={() => {
                setIsSelectionMode(true);
                toggleSelect(can.id);
              }}
              isSelectionMode={isSelectionMode}
            />
          ))}
          {processedCans.length === 0 && (
            <div className="col-span-full text-center py-40 bg-white/5 rounded-[64px] backdrop-blur-xl border-2 border-dashed border-white/10">
              <div className="text-9xl mb-8 grayscale opacity-20">🕳️</div>
              <h3 className="text-3xl font-black text-white/40 uppercase tracking-[8px]">Vazio</h3>
            </div>
          )}
        </div>
      </main>

      <button 
        onClick={() => { setEditingCan(null); setIsModalOpen(true); }}
        className="fixed bottom-12 right-12 w-24 h-24 rounded-[32px] bg-[#F43F5E] shadow-2xl text-white text-6xl font-light flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] hover:rotate-90 duration-500 border-4 border-white/20"
      >
        +
      </button>

      {(isSelectionMode || selectedIds.size > 0) && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-white/10 px-10 py-5 rounded-[32px] shadow-2xl flex items-center gap-10 z-[100] animate-in slide-in-from-bottom-10 duration-500">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Selecionados</span>
              <span className="text-xl font-black text-white">{selectedIds.size} Itens</span>
           </div>
           <div className="h-10 w-[1px] bg-white/10"></div>
           <div className="flex gap-4">
              <button onClick={() => setIsExportOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">Exportar Seleção</button>
              <button onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">Excluir Seleção</button>
              <button onClick={handleExitSelection} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">Sair da Seleção</button>
           </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex items-center justify-center overflow-hidden" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} className="max-w-[95vw] max-h-[95vh] object-contain drop-shadow-2xl rounded-2xl animate-in zoom-in duration-300" alt="Fullscreen" />
          <button className="absolute top-10 right-10 text-white text-6xl font-thin hover:rotate-90 transition-transform">×</button>
        </div>
      )}

      {isModalOpen && <CanModal can={editingCan} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
      {isBulkOpen && <BulkUploadModal cans={cans} onClose={() => setIsBulkOpen(false)} db={db} user={user} />}
      {isStatsOpen && <StatsCharts cans={cans} onClose={() => setIsStatsOpen(false)} />}
      {isImportOpen && <ImportModal db={db} user={user} onClose={() => setIsImportOpen(false)} currentCount={cans.length} onOpenBulk={() => { setIsImportOpen(false); setIsBulkOpen(true); }} />}
      {isExportOpen && <ExportModal allCans={cans} selectedCans={cans.filter(c => selectedIds.has(c.id))} onClose={() => setIsExportOpen(false)} onEnterSelectionMode={() => { setIsExportOpen(false); setIsSelectionMode(true); }} />}
    </div>
  );
};

export default Dashboard;
