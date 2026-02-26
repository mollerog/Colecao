
import React, { useState, useEffect } from 'react';
import { CarMiniature } from '../types';
import { analyzeCarMiniatureImage } from '../geminiService';

interface CarModalProps {
  car: CarMiniature | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const CarModal: React.FC<CarModalProps> = ({ car, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<CarMiniature>>({
    minatureName: '', miniatureBrand: '', line: '', year: '', scale: '1:64',
    condition: 'Mint', mainColor: '', material: 'Diecast', origin: 'real',
    realCarBrand: '', realCarModel: '', segment: '', imageDesc: '', photo: '', description: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => { if (car) setFormData(car); }, [car]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, photo: base64 }));
        if (!car) {
          setIsAnalyzing(true);
          const aiData = await analyzeCarMiniatureImage(base64);
          if (aiData) setFormData(prev => ({ ...prev, ...aiData }));
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full h-full sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in flex flex-col">
        <div className="p-4 sm:p-6 gradient-bg text-white flex justify-between items-center shrink-0">
          <h2 className="text-lg sm:text-xl font-bold">{car ? '✏️ Editar Miniatura' : '🚗 Nova Miniatura'}</h2>
          <button onClick={onClose} className="text-3xl font-light p-2">×</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-5 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          <div className="flex flex-col items-center">
            <div className="w-full h-36 sm:h-40 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden relative group flex items-center justify-center">
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {formData.photo ? <img src={formData.photo} className="w-full h-full object-contain" /> : <p className="text-xs sm:text-sm font-bold text-gray-400 px-4 text-center">Clique para carregar foto da miniatura</p>}
              {isAnalyzing && <div className="absolute inset-0 bg-indigo-600/80 flex items-center justify-center text-white font-black animate-pulse z-20">🪄 IA Analisando...</div>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Nome da Miniatura *</label><input required value={formData.minatureName} onChange={e => setFormData({...formData, minatureName: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="Ex: '17 Nissan GT-R (R35)" /></div>
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Marca (Miniatura) *</label><input required value={formData.miniatureBrand} onChange={e => setFormData({...formData, miniatureBrand: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="Hot Wheels, Matchbox..." /></div>
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Linha *</label><input required value={formData.line} onChange={e => setFormData({...formData, line: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="Mainline, STH, Premium..." /></div>
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Ano Lançamento</label><input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" /></div>
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Escala</label><input value={formData.scale} onChange={e => setFormData({...formData, scale: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="1:64" /></div>
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Estado Conservação</label><input value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="Mint, Loose, Carded" /></div>
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Cor Principal</label><input value={formData.mainColor} onChange={e => setFormData({...formData, mainColor: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" /></div>
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Material</label><input value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" /></div>
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Origem</label><select value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value as any})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base"><option value="real">Real</option><option value="fantasia">Fantasia</option><option value="conceito">Conceito</option></select></div>
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Marca do Carro Real</label><input value={formData.realCarBrand} onChange={e => setFormData({...formData, realCarBrand: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" /></div>
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Modelo Real</label><input value={formData.realCarModel} onChange={e => setFormData({...formData, realCarModel: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" /></div>
            <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Segmento</label><input value={formData.segment} onChange={e => setFormData({...formData, segment: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="Muscle, Supercar, SUV..." /></div>
          </div>
          <div className="space-y-1"><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase">Descrição da Imagem (ID Busca) *</label><input required value={formData.imageDesc} onChange={e => setFormData({...formData, imageDesc: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="hotwheels-gtr-r35-white" /></div>
          <div className="pt-2">
            <button type="submit" className="w-full py-3.5 sm:py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-xl uppercase tracking-widest text-sm sm:text-base active:scale-95 transition-all">Salvar Miniatura</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarModal;
