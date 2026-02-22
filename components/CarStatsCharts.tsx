
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
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
    const lChart = new Chart(lineChartRef.current, {
      type: 'bar',
      data: { labels: stats.lineData.map(d=>d[0]), datasets: [{ data: stats.lineData.map(d=>d[1]), backgroundColor: '#6366F1' }] },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
    return () => { bChart.destroy(); lChart.destroy(); };
  }, [stats]);

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-10 py-8 border-b bg-indigo-600 text-white rounded-t-[40px]">
          <h2 className="text-3xl font-black">Estatísticas de Garagem</h2>
          <button onClick={onClose} className="absolute top-8 right-10 text-3xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50">
          <div className="bg-white p-8 rounded-[32px] shadow-sm">
            <h3 className="font-bold mb-4">Fabricantes Dominantes</h3>
            <canvas ref={brandChartRef}></canvas>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm">
            <h3 className="font-bold mb-4">Linhas de Coleção</h3>
            <canvas ref={lineChartRef}></canvas>
          </div>
        </div>
        <div className="p-8 border-t flex justify-end bg-white rounded-b-[40px]">
          <button onClick={onClose} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default CarStatsCharts;
