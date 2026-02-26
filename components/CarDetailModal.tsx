
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
  const InfoRow = ({ label, value, icon, fullWidth = false }: { label: string, value: string | undefined, icon: string, fullWidth?: boolean }) => (
    <div className={`flex flex-col border-b border-gray-50 pb-2 ${fullWidth ? 'col-span-2' : ''}`}>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] flex items-center gap-2 mb-0.5">
        <span>{icon}</span> {label}
      </p>
      <p className={`text-sm font-bold text-slate-800 uppercase tracking-tighter ${fullWidth ? '' : 'truncate'}`}>{value || '---'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto max-w-5xl sm:rounded-[48px] shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row sm:max-h-[95vh] animate-in zoom-in duration-300">
        <div 
          className="md:w-1/2 bg-[#F8FAFF] flex flex-col relative shrink-0 sticky top-0 z-10 h-[35vh] md:h-auto shadow-md md:shadow-none"
        >
          {/* Mobile Header Buttons Row */}
          <div className="flex justify-between items-center py-1 px-4 md:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 shrink-0">
             <button 
               onClick={(e) => { e.stopPropagation(); onClose(); }} 
               className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-900 border border-gray-100 active:scale-90 transition-transform"
             >
               <span className="text-lg">✕</span>
             </button>
             <div className="bg-white shadow-sm px-3 h-8 rounded-xl border border-gray-100 flex items-center gap-2">
                <span className="text-xs">🔍</span>
                <span className="text-[9px] font-black uppercase tracking-widest">Zoom</span>
             </div>
          </div>

          <div 
            className="flex-1 p-2 sm:p-10 flex items-center justify-center cursor-zoom-in group relative overflow-hidden"
            onClick={() => car.photo && onViewImage(car.photo)}
          >
            {/* Desktop Zoom Indicator */}
            <div className="hidden md:flex absolute top-8 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-gray-100 shadow-sm items-center gap-2 z-10 transition-all group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white">
              <span className="text-sm">🔍</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Ver Foto em Detalhes</span>
            </div>

            {car.photo ? (
              <img src={car.photo} alt={car.minatureName} className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="text-9xl opacity-10">🚗</div>
            )}
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col md:overflow-hidden">
          <div className="p-4 sm:p-10 border-b border-gray-50 flex justify-between items-start shrink-0">
             <div>
                <p className="text-indigo-600 font-black text-[10px] sm:text-xs uppercase tracking-[3px] mb-1">{car.miniatureBrand} {car.line}</p>
                <h2 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tighter leading-[0.9]">{car.minatureName}</h2>
             </div>
             <button onClick={onClose} className="hidden md:flex w-12 h-12 rounded-full bg-gray-50 hover:bg-gray-100 items-center justify-center text-2xl font-light text-slate-400 transition-all">×</button>
          </div>

          <div className="flex-1 md:overflow-hidden p-4 sm:p-10 space-y-4 sm:space-y-10">
            <div>
              <h4 className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-[4px] mb-3 sm:mb-6">Especificações da Miniatura</h4>
              <div className="grid grid-cols-2 gap-x-4 sm:gap-x-10 gap-y-3 sm:gap-y-6">
                 <InfoRow label="História / Descrição" value={car.description} icon="📝" />
                 <InfoRow label="Escala" value={car.scale} icon="📏" />
                 <InfoRow label="Ano" value={car.year} icon="📅" />
                 <InfoRow label="Estado" value={car.condition} icon="💎" />
                 <InfoRow label="Material" value={car.material} icon="🛠️" />
                 <InfoRow label="Cor Predominante" value={car.mainColor} icon="🎨" />
              </div>
            </div>

            <div>
              <h4 className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-[4px] mb-3 sm:mb-6">Origem do Modelo</h4>
              <div className="grid grid-cols-2 gap-x-4 sm:gap-x-10 gap-y-3 sm:gap-y-6 bg-gray-50 p-4 sm:p-6 rounded-2xl sm:rounded-[32px]">
                 <InfoRow label="Origem" value={car.origin} icon="🌍" />
                 <InfoRow label="Marca Real" value={car.realCarBrand} icon="🏭" />
                 <InfoRow label="Modelo Real" value={car.realCarModel} icon="🚘" />
                 <InfoRow label="Segmento" value={car.segment} icon="🏁" />
                 <InfoRow label="ID Imagem" value={car.imageDesc} icon="🖼️" />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-10 bg-gray-50/50 grid grid-cols-2 gap-3 sm:gap-8 shrink-0">
             <button onClick={onEdit} className="w-full bg-white border border-indigo-100 text-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-sm hover:bg-indigo-600 hover:text-white transition-all">Editar</button>
             <button onClick={onDelete} className="w-full bg-white border border-red-100 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-sm hover:bg-red-500 hover:text-white transition-all">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailModal;
