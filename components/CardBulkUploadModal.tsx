
import React, { useState, useMemo } from 'react';
import { Firestore, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { CreditCard, BulkMatch } from '../types';

interface CardBulkProps {
  cards: CreditCard[];
  onClose: () => void;
  db: Firestore;
  user: any;
}

interface ProgressState {
  current: number;
  total: number;
  type: 'loading' | 'saving' | 'success' | null;
}

const CardBulkUploadModal: React.FC<CardBulkProps> = ({ cards, onClose, db, user }) => {
  const [matches, setMatches] = useState<BulkMatch[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({ current: 0, total: 0, type: null });

  const cardsWithoutPhotoCount = useMemo(() => cards.filter(c => !c.photo).length, [cards]);

  const resizeImage = (base64Str: string, maxWidth = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth * height) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setProcessing(true);
    setProgress({ current: 0, total: files.length, type: 'loading' });
    
    const results: BulkMatch[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(prev => ({ ...prev, current: i + 1 }));
      await new Promise(r => setTimeout(r, 0));
      if (!file.type.startsWith('image/')) continue;

      const rawBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });

      const compressedBase64 = await resizeImage(rawBase64);
      const fileName = file.name.replace(/\.[^/.]+$/, "").toLowerCase().trim();
      const matchedCard = cards.find(c => c.imageDesc.toLowerCase().trim() === fileName);

      results.push({
        photo: { fileName, fullName: file.name, data: compressedBase64 },
        card: matchedCard as CreditCard,
        status: matchedCard ? 'matched' : 'unmatched'
      });
    }

    setMatches(results);
    setProcessing(false);
    setProgress({ current: 0, total: 0, type: null });
  };

  const handleSave = async () => {
    const validMatches = matches.filter(m => m.status === 'matched');
    if (validMatches.length === 0) return;

    setProcessing(true);
    setProgress({ current: 0, total: validMatches.length, type: 'saving' });

    const CHUNK_SIZE = 5; 
    const totalToSave = validMatches.length;
    let savedSoFar = 0;

    try {
      for (let i = 0; i < totalToSave; i += CHUNK_SIZE) {
        const batch = writeBatch(db);
        const chunk = validMatches.slice(i, i + CHUNK_SIZE);
        chunk.forEach(m => {
          if (m.card?.id) {
            batch.update(doc(db, 'users', user.uid, 'cards', m.card.id), {
              photo: m.photo.data,
              updatedAt: serverTimestamp()
            });
          }
        });
        await batch.commit();
        savedSoFar += chunk.length;
        setProgress(prev => ({ ...prev, current: savedSoFar }));
        await new Promise(r => setTimeout(r, 200));
      }
      setProgress({ current: totalToSave, total: totalToSave, type: 'success' });
    } catch (e: any) {
      alert('Erro ao salvar as fotos.');
      setProcessing(false);
      setProgress({ current: 0, total: 0, type: null });
    }
  };

  const matchedCount = matches.filter(m => m.status === 'matched').length;
  const progressPercentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
      <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] relative">
        
        {(processing || progress.type === 'success') && (
          <div className="absolute inset-0 z-[110] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-12 rounded-[32px]">
            {progress.type === 'success' ? (
              <div className="text-center animate-in zoom-in">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto">✅</div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">Concluído!</h3>
                <p className="text-gray-500 font-medium mb-8">{progress.total} fotos vinculadas.</p>
                <button onClick={onClose} className="px-12 py-4 bg-green-500 text-white font-black rounded-2xl">Fechar Janela</button>
              </div>
            ) : (
              <div className="w-full max-w-md">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-2xl font-black text-slate-800">{progress.type === 'loading' ? 'Lendo...' : 'Salvando...'}</h3>
                  <span className="text-4xl font-black text-indigo-600">{progressPercentage}%</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-indigo-600 transition-all rounded-full" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-8 py-6 flex justify-between items-center shrink-0 border-b">
          <div className="flex items-center gap-3"><span className="text-2xl">📷</span><h2 className="text-[22px] font-bold text-indigo-600">Vincular Fotos (Cards)</h2></div>
          <button onClick={onClose} className="p-2">×</button>
        </div>

        <div className="grid grid-cols-4 gap-4 px-8 py-6 bg-[#F8FAFF] shrink-0">
          <div className="text-center"><p className="text-[20px] font-black text-red-500">{cardsWithoutPhotoCount}</p><p className="text-[9px] font-bold text-gray-400 uppercase">Cards sem Foto</p></div>
          <div className="text-center border-l"><p className="text-[20px] font-black text-indigo-600">{matches.length}</p><p className="text-[9px] font-bold text-gray-400 uppercase">Lidos</p></div>
          <div className="text-center border-l"><p className="text-[20px] font-black text-green-500">{matchedCount}</p><p className="text-[9px] font-bold text-gray-400 uppercase">OK</p></div>
          <div className="text-center border-l"><p className="text-[20px] font-black text-amber-500">{matches.length - matchedCount}</p><p className="text-[9px] font-bold text-gray-400 uppercase">Não Batidas</p></div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col">
          {matches.length === 0 ? (
            <div className="flex-1 min-h-[250px] border-2 border-dashed border-indigo-200 rounded-[24px] bg-[#F8FAFF] flex flex-col items-center justify-center p-12 text-center relative">
              <input type="file" multiple accept="image/*" onChange={handleFiles} disabled={processing} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-xl font-bold">Clique para selecionar fotos</h3>
              <p className="text-gray-400 text-sm mt-2">Nome do arquivo = Desc Imagem (ex: mastercard-black.jpg)</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {matches.map((m, idx) => (
                <div key={idx} className={`relative p-2 rounded-xl border ${m.status === 'matched' ? 'border-green-100 bg-green-50/30' : 'border-amber-100 bg-amber-50/30'}`}>
                   <img src={m.photo.data} className="w-full h-24 object-cover rounded-lg mb-2" />
                   <p className="text-[9px] font-bold truncate">{m.photo.fileName}</p>
                   <div className="absolute top-1 right-1">{m.status === 'matched' ? '✅' : '❓'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-3 font-bold text-gray-400">Cancelar</button>
          {matches.length > 0 && <button onClick={handleSave} disabled={matchedCount === 0 || processing} className="px-10 py-3 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-30">
            {processing ? 'Salvando...' : `Vincular ${matchedCount} Fotos`}
          </button>}
        </div>
      </div>
    </div>
  );
};

export default CardBulkUploadModal;
