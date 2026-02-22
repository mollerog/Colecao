
import React, { useState } from 'react';
import { Firestore, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { CarMiniature, BulkMatch } from '../types';

const CarBulkUploadModal: React.FC<{ cars: CarMiniature[], onClose: () => void, db: Firestore, user: any }> = ({ cars, onClose, db, user }) => {
  const [matches, setMatches] = useState<BulkMatch[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    setProcessing(true);
    const results: BulkMatch[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const data = await new Promise<string>(r => { const reader = new FileReader(); reader.onload = ev => r(ev.target?.result as string); reader.readAsDataURL(file); });
      const name = file.name.replace(/\.[^/.]+$/, "").toLowerCase().trim();
      const matched = cars.find(c => c.imageDesc.toLowerCase().trim() === name);
      results.push({ photo: { fileName: name, fullName: file.name, data }, car: matched as CarMiniature, status: matched ? 'matched' : 'unmatched' });
    }
    setMatches(results);
    setProcessing(false);
  };

  const handleSave = async () => {
    const valid = matches.filter(m => m.status === 'matched');
    setProcessing(true);
    for (let i = 0; i < valid.length; i += 5) {
      const batch = writeBatch(db);
      valid.slice(i, i+5).forEach(m => { if (m.car?.id) batch.update(doc(db, 'users', user.uid, 'cars', m.car.id), { photo: m.photo.data, updatedAt: serverTimestamp() }); });
      await batch.commit();
    }
    alert('Garagem fotografada!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 border-b flex justify-between items-center"><h2 className="text-2xl font-bold">Vincular Fotos da Garagem</h2><button onClick={onClose}>×</button></div>
        <div className="p-8 overflow-y-auto">
          {matches.length === 0 ? (
            <div className="h-64 border-2 border-dashed rounded-3xl flex items-center justify-center relative"><input type="file" multiple accept="image/*" onChange={handleFiles} className="absolute inset-0 opacity-0 cursor-pointer" /><p>Selecione as fotos (nome do arquivo = ID Imagem)</p></div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {matches.map((m, i) => <div key={i} className={`p-2 rounded border ${m.status === 'matched' ? 'border-green-200' : 'border-amber-200'}`}><img src={m.photo.data} className="h-24 w-full object-cover rounded"/></div>)}
            </div>
          )}
        </div>
        <div className="p-8 border-t flex justify-end gap-4 bg-white rounded-b-[32px]">
          <button onClick={onClose}>Cancelar</button>
          {matches.length > 0 && <button onClick={handleSave} disabled={processing} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Vincular {matches.filter(m => m.status === 'matched').length} fotos</button>}
        </div>
      </div>
    </div>
  );
};

export default CarBulkUploadModal;
