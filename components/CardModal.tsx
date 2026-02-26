
import React, { useState, useEffect } from 'react';
import { CreditCard } from '../types';
import { analyzeCreditCardImage } from '../geminiService';

interface CardModalProps {
  card: CreditCard | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<CreditCard>>({
    cardName: '',
    issuer: '',
    network: '',
    category: '',
    year: '',
    imageDesc: '',
    lastFourDigits: '',
    photo: '',
    description: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (card) setFormData(card);
  }, [card]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, photo: base64 }));
        if (!card) {
          setIsAnalyzing(true);
          const aiData = await analyzeCreditCardImage(base64);
          if (aiData) setFormData(prev => ({ ...prev, ...aiData }));
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full h-full sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200 flex flex-col">
        <div className="p-4 sm:p-6 gradient-bg text-white flex justify-between items-center shrink-0">
          <h2 className="text-lg sm:text-xl font-bold">{card ? '✏️ Editar Cartão' : '➕ Novo Cartão'}</h2>
          <button onClick={onClose} className="text-3xl font-light p-2">×</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-5 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          <div className="flex flex-col items-center">
            <div className="w-full h-36 sm:h-40 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden relative group cursor-pointer flex items-center justify-center">
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {formData.photo ? <img src={formData.photo} className="w-full h-full object-contain" alt="Preview" /> : <p className="text-xs sm:text-sm font-bold text-gray-400 px-4 text-center">Clique para carregar foto do cartão</p>}
              {isAnalyzing && <div className="absolute inset-0 bg-indigo-600/80 flex items-center justify-center text-white font-black animate-pulse z-20">🪄 IA Analisando...</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Cartão</label>
              <input required value={formData.cardName} onChange={e => setFormData({...formData, cardName: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="Nubank Ultravioleta" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Banco / Emissor</label>
              <input required value={formData.issuer} onChange={e => setFormData({...formData, issuer: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="Nubank" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Bandeira</label>
              <input required value={formData.network} onChange={e => setFormData({...formData, network: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="Mastercard" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</label>
              <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="Black" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Ano Lançamento</label>
              <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="2021" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Últimos 4 Dígitos</label>
              <input value={formData.lastFourDigits} onChange={e => setFormData({...formData, lastFourDigits: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="1234" maxLength={4} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição da Imagem</label>
            <input required value={formData.imageDesc} onChange={e => setFormData({...formData, imageDesc: e.target.value})} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 outline-none text-sm sm:text-base" placeholder="nubank-uv-front" />
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full py-3.5 sm:py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-sm sm:text-base active:scale-95">Salvar Cartão</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardModal;
