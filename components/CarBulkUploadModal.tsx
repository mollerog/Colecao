
import React, { useState, useMemo } from 'react';
import { Firestore, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { CarMiniature, BulkMatch } from '../types';

interface CarBulkProps {
  cars: CarMiniature[];
  onClose: () => void;
  db: Firestore;
  user: any;
}

interface ProgressState {
  current: number;
  total: number;
  type: 'loading' | 'saving' | 'success' | null;
}

const CarBulkUploadModal: React.FC<CarBulkProps> = ({ cars, onClose, db, user }) => {
  const [matches, setMatches] = useState<BulkMatch[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({ current: 0, total: 0, type: null });

  const carsWithoutPhotoCount = useMemo(() => cars.filter(c => !c.photo).length, [cars]);

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
      const matchedCar = cars.find(c => c.imageDesc.toLowerCase().trim() === fileName);

      results.push({
        photo: { fileName, fullName: file.name, data: compressedBase64 },
        car: matchedCar as CarMiniature,
        status: matchedCar ? 'matched' : 'unmatched'
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
          if (m.car?.id) {
            batch.update(doc(db, 'users', user.uid, 'cars', m.car.id), {
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
  const unmatchedCount = matches.filter(m => m.status === 'unmatched').length;
  const progressPercentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
      <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300 relative">
        
        {(processing || progress.type === 'success') && (
          <div className="absolute inset-0 z-[110] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-12 rounded-[32px] transition-all duration-500">
            {progress.type === 'success' ? (
              <div className="text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto shadow-lg shadow-green-100">✅</div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">Concluído!</h3>
                <p className="text-gray-500 font-medium text-lg mb-8">{progress.total} fotos vinculadas com sucesso.</p>
                <button onClick={onClose} className="px-12 py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 transition-all uppercase tracking-widest">Fechar Janela</button>
              </div>
            ) : (
              <div className="w-full max-w-md">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">{progress.type === 'loading' ? 'Lendo Arquivos...' : 'Salvando na Nuvem...'}</h3>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">{progress.current} de {progress.total} processados</p>
                  </div>
                  <span className="text-4xl font-black text-[#6366F1]">{progressPercentage}%</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
                  <div className="h-full bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#9333EA] transition-all duration-300 ease-out rounded-full shadow-sm" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-8 py-6 flex justify-between items-center shrink-0 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚗</span>
            <h2 className="text-[22px] font-bold text-[#6366F1]">Upload de Fotos em Lote</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 divide-x divide-gray-100 px-2 sm:px-8 py-6 bg-[#F8FAFF] shrink-0 border-b border-gray-50">
          <div className="text-center flex flex-col justify-between h-full px-1">
            <p className="text-[18px] sm:text-[22px] font-black text-red-500 leading-none mb-2">{carsWithoutPhotoCount}</p>
            <p className="text-[7px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tight sm:tracking-tighter leading-tight">Carros sem Foto</p>
          </div>
          <div className="text-center flex flex-col justify-between h-full px-1">
            <p className="text-[18px] sm:text-[22px] font-black text-[#6366F1] leading-none mb-2">{matches.length}</p>
            <p className="text-[7px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tight sm:tracking-tighter leading-tight">Imagens Selecionadas</p>
          </div>
          <div className="text-center flex flex-col justify-between h-full px-1">
            <p className="text-[18px] sm:text-[22px] font-black text-green-500 leading-none mb-2">{matchedCount}</p>
            <p className="text-[7px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tight sm:tracking-tighter leading-tight">Imagens Atribuídas</p>
          </div>
          <div className="text-center flex flex-col justify-between h-full px-1">
            <p className="text-[18px] sm:text-[22px] font-black text-amber-500 leading-none mb-2">{unmatchedCount}</p>
            <p className="text-[7px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tight sm:tracking-tighter leading-tight">Não Vinculadas</p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col">
          {matches.length === 0 ? (
            <div className="flex-1 min-h-[180px] sm:min-h-[250px] border-2 border-dashed border-[#6366F1]/30 rounded-[24px] bg-[#F8FAFF] flex flex-col items-center justify-center p-6 sm:p-12 text-center relative hover:border-[#6366F1] transition-all group">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFiles} 
                disabled={processing}
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
              <div className="bg-white p-3 sm:p-5 rounded-2xl mb-3 sm:mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Clique para selecionar as fotos</h3>
              <p className="text-gray-400 text-[11px] sm:text-sm mt-1 sm:mt-2 max-w-xs mx-auto">
                Certifique-se que o nome do arquivo seja igual ao campo 'Desc Imagem' (ex: ferrari-f40.jpg).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {matches.map((m, idx) => (
                <div key={idx} className={`relative p-2 rounded-xl border ${m.status === 'matched' ? 'border-green-100 bg-green-50/30' : 'border-amber-100 bg-amber-50/30'}`}>
                   <img src={m.photo.data} className="w-full h-24 object-cover rounded-lg mb-2" />
                   <p className="text-[9px] font-bold truncate text-gray-500">{m.photo.fileName}</p>
                   <div className="absolute top-1 right-1">
                      {m.status === 'matched' ? '✅' : '❓'}
                   </div>
                </div>
              ))}
              <div className="col-span-full mt-6">
                <button 
                  onClick={() => setMatches([])}
                  className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest"
                >
                  Limpar Seleção e Recomeçar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 text-sm">Cancelar</button>
          <button 
            onClick={handleSave}
            disabled={matchedCount === 0 || processing}
            className="px-10 py-3 rounded-xl bg-[#6366F1] text-white font-bold shadow-lg shadow-indigo-200 disabled:opacity-30 transition-all text-sm uppercase tracking-wider"
          >
            {processing ? 'Salvando...' : `Vincular ${matchedCount} Fotos`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarBulkUploadModal;
