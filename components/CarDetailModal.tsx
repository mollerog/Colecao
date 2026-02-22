
import React from 'react';
import { CarMiniature } from '../types';

interface CarDetailModalProps {
  car: CarMiniature;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewImage: (url: string) => void;
}

const CarDetailModal: React.FC<CarDetailModalProps> = ({ car, onClose, onEdit, onDelete, onViewImage }) => {
  const InfoRow = ({ label, value, icon }: { label: string, value: string | undefined, icon: string }) => (
    <div className="flex flex-col border-b border-gray-50 pb-2">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] flex items-center gap-2 mb-0.5">
        <span>{icon}</span> {label}
      </p>
      <p className="text-sm font-bold text-slate-800 truncate uppercase tracking-tighter">{value || '---'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] animate-in zoom-in duration-300">
        <div 
          className="md:w-1/2 bg-[#F8FAFF] p-10 flex items-center justify-center relative overflow-hidden shrink-0 cursor-zoom-in group"
          onClick={() => car.photo && onViewImage(car.photo)}
        >
          {/* Zoom Indicator no Topo */}
          <div className="absolute top-8 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2 z-10 transition-all group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white">
            <span className="text-sm">🔍</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Ver Foto em Detalhes</span>
          </div>

          {car.photo ? (
            <img src={car.photo} alt={car.minatureName} className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="text-9xl opacity-10">🚗</div>
          )}
          
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white/80 backdrop-blur border border-gray-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all md:hidden">×</button>
        </div>

        <div className="md:w-1/2 flex flex-col overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex justify-between items-start shrink-0">
             <div>
                <p className="text-indigo-600 font-black text-xs uppercase tracking-[3px] mb-1">{car.miniatureBrand} {car.line}</p>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-[0.9]">{car.minatureName}</h2>
             </div>
             <button onClick={onClose} className="hidden md:flex w-12 h-12 rounded-full bg-gray-50 hover:bg-gray-100 items-center justify-center text-2xl font-light text-slate-400 transition-all">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-10">
            <div>
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[4px] mb-6">Especificações da Miniatura</h4>
              <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                 <InfoRow label="Escala" value={car.scale} icon="📏" />
                 <InfoRow label="Ano" value={car.year} icon="📅" />
                 <InfoRow label="Estado" value={car.condition} icon="💎" />
                 <InfoRow label="Material" value={car.material} icon="🛠️" />
                 <InfoRow label="Cor Predominante" value={car.mainColor} icon="🎨" />
                 <InfoRow label="ID Imagem" value={car.imageDesc} icon="🖼️" />
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[4px] mb-6">Origem do Modelo</h4>
              <div className="grid grid-cols-2 gap-x-10 gap-y-6 bg-gray-50 p-6 rounded-[32px]">
                 <InfoRow label="Origem" value={car.origin} icon="🌍" />
                 <InfoRow label="Marca Real" value={car.realCarBrand} icon="🏭" />
                 <InfoRow label="Modelo Real" value={car.realCarModel} icon="🚘" />
                 <InfoRow label="Segmento" value={car.segment} icon="🏁" />
              </div>
            </div>

            {car.description && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">📝 História / Descrição</p>
                <p className="text-gray-500 font-medium leading-relaxed italic border-l-4 border-indigo-100 pl-6">
                  "{car.description}"
                </p>
              </div>
            )}
          </div>

          <div className="p-10 bg-white border-t border-gray-50 flex gap-4 shrink-0">
             <button onClick={onEdit} className="flex-1 bg-indigo-50 border border-indigo-100 text-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm hover:bg-indigo-600 hover:text-white transition-all">Editar Item</button>
             <button onClick={onDelete} className="flex-1 bg-red-50 border border-red-100 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm hover:bg-red-500 hover:text-white transition-all">Remover</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailModal;
