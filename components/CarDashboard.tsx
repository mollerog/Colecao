
import React, { useState, useMemo, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Firestore, collection, doc, deleteDoc, writeBatch, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { CarMiniature } from '../types';
import CarStatsCards from './CarStatsCards';
import Toolbar from './Toolbar';
import CarFilters from './CarFilters';
import CarCard from './CarCard';
import CarModal from './CarModal';
import CarDetailModal from './CarDetailModal';
import CarStatsCharts from './CarStatsCharts';
import CarImportModal from './CarImportModal';
import CarExportModal from './CarExportModal';
import CarBulkUploadModal from './CarBulkUploadModal';
import FullScreenViewer from './FullScreenViewer';

interface CarDashboardProps {
  user: User;
  cars: CarMiniature[];
  db: Firestore;
  auth: any;
  syncStatus: string;
  onBack: () => void;
}

export type ViewLayout = 'grid' | 'large' | 'list' | 'compact';
export type SortOption = 'name' | 'recent' | 'year' | 'brand';
export type SortOrder = 'asc' | 'desc';

const CarDashboard: React.FC<CarDashboardProps> = ({ user, cars, db, auth, syncStatus, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarMiniature | null>(null);
  const [detailCar, setDetailCar] = useState<CarMiniature | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewLayout, setViewLayout] = useState<ViewLayout>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        setDetailCar(null);
        setIsStatsOpen(false);
        if (selectedIds.size === 0) setIsSelectionMode(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedIds.size]);

  const processedCars = useMemo(() => {
    let result = [...cars];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.minatureName.toLowerCase().includes(lower) ||
        c.miniatureBrand.toLowerCase().includes(lower) ||
        c.realCarBrand.toLowerCase().includes(lower) ||
        c.realCarModel.toLowerCase().includes(lower) ||
        c.line.toLowerCase().includes(lower) ||
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
      if (sortBy === 'name') comp = a.minatureName.localeCompare(b.minatureName);
      else if (sortBy === 'brand') comp = a.miniatureBrand.localeCompare(b.miniatureBrand);
      else if (sortBy === 'year') comp = (parseInt(a.year || '0') || 0) - (parseInt(b.year || '0') || 0);
      else comp = (a.updatedAt?.seconds || 0) - (b.updatedAt?.seconds || 0);
      return sortOrder === 'asc' ? comp : comp * -1;
    });
    return result;
  }, [cars, searchTerm, activeFilters, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta miniatura permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cars', id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setDetailCar(null);
    } catch (e) { alert("Erro ao excluir"); }
  };

  const handleSave = async (data: any) => {
    try {
      const carsRef = collection(db, 'users', user.uid, 'cars');
      if (editingCar) {
        await updateDoc(doc(db, 'users', user.uid, 'cars', editingCar.id), { ...data, updatedAt: serverTimestamp() });
      } else {
        await addDoc(carsRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      setIsModalOpen(false);
      setEditingCar(null);
      setDetailCar(null);
    } catch (e) { alert("Erro ao salvar"); }
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
    brand: 'FABRICANTE',
    recent: 'RECENTES',
    year: 'ANO'
  };

  return (
    <div className="min-h-screen gradient-bg">
      <header className="text-white pt-8 pb-12 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center mb-8 px-4 gap-2">
          <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-[8px] sm:text-[10px] font-black uppercase tracking-[1px] sm:tracking-[2px] px-4 sm:px-8 py-3 rounded-full transition-all border border-white/10 whitespace-nowrap">← Painel Principal</button>
          <button onClick={() => setIsStatsOpen(true)} className="bg-white text-indigo-600 hover:scale-105 active:scale-95 text-[8px] sm:text-[10px] font-black uppercase tracking-[1px] sm:tracking-[2px] px-4 sm:px-8 py-3 rounded-full transition-all shadow-xl whitespace-nowrap">⭐ Estatísticas</button>
        </div>
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex items-center justify-center gap-4">
             <span className="text-3xl sm:text-5xl drop-shadow-lg">🚗</span>
             <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white">Minhas Miniaturas</h1>
          </div>
          <p className="text-white/60 text-xs sm:text-sm font-bold uppercase tracking-widest">{user.email}</p>
        </div>
        <CarStatsCards cars={cars} />
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-40 space-y-6">
        <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl p-6 transition-all duration-300">
           <Toolbar onOpenImport={() => setIsImportOpen(true)} onOpenExport={() => setIsExportOpen(true)} onClearAll={() => {}} />
        </div>
        <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl p-6 transition-all duration-300">
          <CarFilters cars={cars} activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
        </div>
        <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl p-6 transition-all duration-300">
          <div className="bg-white/95 rounded-[32px] p-2 flex items-center relative overflow-hidden shadow-sm border border-white">
            <span className="absolute left-6 text-2xl z-10">🔍</span>
            <input type="text" placeholder="Pesquisar..." className="w-full pl-16 pr-6 py-4 rounded-[24px] bg-transparent outline-none text-xl font-bold text-gray-800 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Separador de Contagem */}
        <div className="flex items-center gap-6 my-10 opacity-60">
          <div className="h-[1px] flex-1 bg-white/20"></div>
          <span className="text-white text-[10px] font-black uppercase tracking-[3px] whitespace-nowrap">
            {processedCars.length} MINIATURAS NA LISTAGEM
          </span>
          <div className="h-[1px] flex-1 bg-white/20"></div>
        </div>

        {/* Barra de Visualização e Ordenação */}
        <div className="flex justify-end items-center gap-4 mb-8 px-4 opacity-50 transition-opacity hover:opacity-100">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase tracking-[2px] text-white/50">VISUALIZAÇÃO</span>
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
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewLayout === v.id ? 'bg-white/10 text-white shadow-lg backdrop-blur-md' : 'text-white/30 hover:text-white/50'}`}
                >
                  <span className="text-lg">{v.icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-[1px] h-3 bg-white/10 mx-1"></div>

          <div className="flex items-center gap-2">
             <span className="text-[8px] font-black uppercase tracking-[2px] text-white/50">ORDENAR:</span>
             <div className="relative group">
                <button className="text-[9px] font-black uppercase tracking-[1px] text-white flex items-center gap-1 hover:opacity-100 transition-all">
                  {sortLabels[sortBy]} <span className="text-[6px] opacity-40">▼</span>
                </button>
                <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-1.5 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                   {(['name', 'brand', 'recent', 'year'] as SortOption[]).map(opt => (
                     <button 
                       key={opt}
                       onClick={() => setSortBy(opt)}
                       className={`w-full text-left px-5 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === opt ? 'text-indigo-400 bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                     >
                       {sortLabels[opt]}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <button 
            onClick={scrollToTop}
            className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-white transition-all ml-0.5"
          >
            <span className="text-lg font-thin">↑</span>
          </button>
        </div>

        {processedCars.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-20 px-10 border-2 border-dashed border-white/10 rounded-[64px] transition-all animate-in fade-in zoom-in duration-700">
            <div className="w-28 h-14 bg-white/5 rounded-[100%] shadow-inner flex items-center justify-center border border-white/5 mb-8">
               <div className="w-20 h-8 bg-indigo-500/20 rounded-[100%] blur-xl animate-pulse"></div>
            </div>
            <span className="text-white/30 text-3xl font-black uppercase tracking-[12px] ml-3">Vazio</span>
          </div>
        ) : (
          <div className={gridClass}>
            {processedCars.map(car => (
              <CarCard 
                key={car.id} 
                car={car} 
                variant={viewLayout}
                onEdit={() => { setEditingCar(car); setIsModalOpen(true); }}
                onDelete={() => handleDelete(car.id)}
                onViewImage={(url) => setSelectedImage(url)}
                onViewDetail={() => setDetailCar(car)}
                isSelected={selectedIds.has(car.id)}
                onToggleSelect={() => { setIsSelectionMode(true); toggleSelect(car.id); }}
                isSelectionMode={isSelectionMode}
              />
            ))}
          </div>
        )}
      </main>

      <button onClick={() => { setEditingCar(null); setIsModalOpen(true); }} className="fixed bottom-12 right-12 w-24 h-24 rounded-[32px] bg-[#F43F5E] shadow-2xl text-white text-6xl font-light flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] border-4 border-white/20">+</button>
      
      {selectedImage && (
        <FullScreenViewer 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}

      {isModalOpen && <CarModal car={editingCar} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
      {detailCar && <CarDetailModal car={detailCar} onClose={() => setDetailCar(null)} onEdit={() => { setEditingCar(detailCar); setIsModalOpen(true); }} onDelete={() => handleDelete(detailCar.id)} onViewImage={(url) => setSelectedImage(url)} />}
      {isStatsOpen && <CarStatsCharts cars={cars} onClose={() => setIsStatsOpen(false)} />}
      {isImportOpen && <CarImportModal db={db} user={user} onClose={() => setIsImportOpen(false)} currentCount={cars.length} onOpenBulk={() => { setIsImportOpen(false); setIsBulkOpen(true); }} />}
      {isExportOpen && <CarExportModal allCars={cars} selectedCars={cars.filter(c => selectedIds.has(c.id))} onClose={() => setIsExportOpen(false)} onEnterSelectionMode={() => { setIsExportOpen(false); setIsSelectionMode(true); }} />}
      {isBulkOpen && <CarBulkUploadModal cars={cars} onClose={() => setIsBulkOpen(false)} db={db} user={user} />}
    </div>
  );
};

export default CarDashboard;
