
import React, { useState, useEffect } from 'react';
import { Can } from '../types';
import { analyzeCanImage } from '../geminiService';

interface CanModalProps {
  can: Can | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const CanModal: React.FC<CanModalProps> = ({ can, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Can>>({
    group: '',
    acronym: '',
    brand: '',
    name: '',
    description: '',
    year: '',
    size: '',
    imageDesc: '',
    photo: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (can) setFormData(can);
  }, [can]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, photo: base64 }));
        
        // AI Auto-fill if it's a new entry
        if (!can) {
          setIsAnalyzing(true);
          const aiData = await analyzeCanImage(base64);
          if (aiData) {
            setFormData(prev => ({ ...prev, ...aiData }));
          }
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full h-full sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center gradient-bg text-white shrink-0">
          <h2 className="text-lg sm:text-xl font-bold">{can ? '✏️ Editar Lata' : '➕ Adicionar Nova Lata'}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-3xl font-light p-2">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Photo Section */}
          <div className="flex flex-col items-center">
            <div className="w-full h-40 sm:h-48 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden relative group cursor-pointer">
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {formData.photo ? (
                <img src={formData.photo} className="w-full h-full object-contain" alt="Preview" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                  <span className="text-3xl sm:text-4xl mb-2">📸</span>
                  <p className="text-xs sm:text-sm font-medium">Clique para carregar foto</p>
                </div>
              )}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-purple-600/80 flex items-center justify-center text-white font-bold animate-pulse z-20">
                  🪄 AI Analisando...
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">🏢 Grupo</label>
              <input required value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none text-sm sm:text-base" placeholder="Ex: Coca-Cola" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">🔤 Sigla</label>
              <input required value={formData.acronym} onChange={e => setFormData({...formData, acronym: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none text-sm sm:text-base" placeholder="Ex: TCCC" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">🥤 Marca</label>
              <input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none text-sm sm:text-base" placeholder="Ex: Fanta" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">🏷️ Nome</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none text-sm sm:text-base" placeholder="Ex: Fanta Uva" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">📅 Ano</label>
              <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none text-sm sm:text-base" placeholder="Ex: 2024" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">📏 Tamanho</label>
              <input required value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none text-sm sm:text-base" placeholder="Ex: 350ml" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">🖼️ Descrição da Imagem (para busca interna)</label>
            <input required value={formData.imageDesc} onChange={e => setFormData({...formData, imageDesc: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none text-sm sm:text-base" placeholder="Ex: fanta-uva-lata-2024" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">📝 Descrição da Lata</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none min-h-[80px] sm:min-h-[100px] text-sm sm:text-base" placeholder="Características especiais..." />
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full py-3.5 sm:py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base sm:text-lg shadow-xl transition-all active:scale-95">
              💾 Salvar Lata
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CanModal;
