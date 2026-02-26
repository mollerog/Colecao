
import React, { useEffect, useRef, useMemo } from 'react';
import { CarMiniature } from '../types';

declare const Chart: any;

const CarStatsCharts: React.FC<{ cars: CarMiniature[], onClose: () => void }> = ({ cars, onClose }) => {
  const brandChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);

  const stats = useMemo(() => {
    const brands: Record<string, number> = {};
    const lines: Record<string, number> = {};
    cars.forEach(c => {
      brands[c.miniatureBrand] = (brands[c.miniatureBrand] || 0) + 1;
      lines[c.line] = (lines[c.line] || 0) + 1;
    });
    return {
      brandData: Object.entries(brands).sort((a,b) => b[1]-a[1]),
      lineData: Object.entries(lines).sort((a,b) => b[1]-a[1])
    };
  }, [cars]);

  useEffect(() => {
    if (!brandChartRef.current || !lineChartRef.current) return;
    const bChart = new Chart(brandChartRef.current, {
      type: 'doughnut',
      data: { labels: stats.brandData.map(d=>d[0]), datasets: [{ data: stats.brandData.map(d=>d[1]), backgroundColor: ['#6366F1', '#8B5CF6', '#F59E0B'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
    const lChart = new Chart(lineChartRef.current, {
      type: 'bar',
      data: { labels: stats.lineData.map(d=>d[0]), datasets: [{ data: stats.lineData.map(d=>d[1]), backgroundColor: '#6366F1' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    return () => { bChart.destroy(); lChart.destroy(); };
  }, [stats]);

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-5xl rounded-[24px] sm:rounded-[40px] shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="px-6 py-6 sm:px-10 sm:py-8 border-b bg-indigo-600 text-white relative">
          <h2 className="text-xl sm:text-3xl font-black">Estatísticas de Garagem</h2>
          <button onClick={onClose} className="absolute top-6 right-6 sm:top-8 sm:right-10 text-2xl sm:text-3xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-8 bg-gray-50">
          <div className="bg-white p-3 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm">
            <h3 className="font-bold mb-1 text-xs sm:text-base">Fabricantes Dominantes</h3>
            <div className="h-[180px] sm:h-auto flex justify-center">
              <canvas ref={brandChartRef}></canvas>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm">
            <h3 className="font-bold mb-1 text-xs sm:text-base">Linhas de Coleção</h3>
            <div className="h-[180px] sm:h-auto">
              <canvas ref={lineChartRef}></canvas>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-8 border-t flex justify-end bg-white">
          <button onClick={onClose} className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default CarStatsCharts;
