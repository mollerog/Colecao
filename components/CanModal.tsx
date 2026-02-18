
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center gradient-bg text-white">
          <h2 className="text-xl font-bold">{can ? '✏️ Editar Lata' : '➕ Adicionar Nova Lata'}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl font-light">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Photo Section */}
          <div className="flex flex-col items-center">
            <div className="w-full h-48 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden relative group cursor-pointer">
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {formData.photo ? (
                <img src={formData.photo} className="w-full h-full object-contain" alt="Preview" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                  <span className="text-4xl mb-2">📸</span>
                  <p className="text-sm font-medium">Clique para carregar foto</p>
                </div>
              )}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-purple-600/80 flex items-center justify-center text-white font-bold animate-pulse z-20">
                  🪄 AI Analisando...
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">🏢 Grupo</label>
              <input required value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ex: Coca-Cola" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">🔤 Sigla</label>
              <input required value={formData.acronym} onChange={e => setFormData({...formData, acronym: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ex: TCCC" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">🥤 Marca</label>
              <input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ex: Fanta" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">🏷️ Nome</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ex: Fanta Uva" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">📅 Ano</label>
              <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ex: 2024" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">📏 Tamanho</label>
              <input required value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ex: 350ml" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">🖼️ Descrição da Imagem (para busca interna)</label>
            <input required value={formData.imageDesc} onChange={e => setFormData({...formData, imageDesc: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ex: fanta-uva-lata-2024" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">📝 Descrição da Lata</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]" placeholder="Características especiais..." />
          </div>

          <button type="submit" className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow-xl transition-all">
            💾 Salvar Lata
          </button>
        </form>
      </div>
    </div>
  );
};

export default CanModal;
