
import React from 'react';
import { DistributionType } from '../types';
import { getTheoreticalParams } from '../utils/statistics';

interface Props {
  distType: DistributionType;
  sampleSize: number;
  metrics: { skewness: number; kurtosis: number };
}

const PrinciplesModule: React.FC<Props> = ({ distType, sampleSize, metrics }) => {
  const { mu, sigma } = getTheoreticalParams(distType);
  const theoreticalSE = sigma / Math.sqrt(sampleSize);

  return (
    <div className="bg-white/40 backdrop-blur-2xl p-7 rounded-[2.5rem] border border-white/60 shadow-xl mt-6 relative overflow-hidden group flex flex-col">
      <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
        统计学原理看板
      </h3>
      
      <div className="space-y-4 relative z-10 flex-1">
        {/* 动态公式 - 缩小占位 */}
        <div className="p-3.5 bg-slate-50/50 rounded-2xl border border-white/80 shadow-inner">
          <p className="text-[9px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">抽样分布理论模型</p>
          <div className="font-serif text-lg text-slate-700 italic flex items-center justify-center gap-2 py-1">
            <span>X̄ ~ N(</span>
            <span className="text-indigo-500 font-bold">{mu.toFixed(2)}</span>
            <span>,</span>
            <span className="text-emerald-500 font-bold">{theoreticalSE.toFixed(4)}²</span>
            <span>)</span>
          </div>
        </div>

        {/* 矩估计指标 (Skewness & Kurtosis) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/60 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-500 uppercase mb-0.5">偏度 (Skewness)</p>
            <p className={`text-base font-black font-mono ${Math.abs(metrics.skewness) < 0.1 ? 'text-emerald-500' : 'text-slate-600'}`}>
              {metrics.skewness.toFixed(3)}
            </p>
          </div>
          <div className="p-3 bg-white/60 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-500 uppercase mb-0.5">超额峰度 (Kurtosis)</p>
            <p className={`text-base font-black font-mono ${Math.abs(metrics.kurtosis) < 0.2 ? 'text-emerald-500' : 'text-slate-600'}`}>
              {metrics.kurtosis.toFixed(3)}
            </p>
          </div>
        </div>

        {/* 6 Sigma 工业标准 */}
        <div className="space-y-2.5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">置信区间 (Sigma Limits)</p>
          <div className="space-y-1.5">
            {[
              { label: '3σ', range: 3, color: 'bg-indigo-100 text-indigo-600' },
              { label: '6σ', range: 6, color: 'bg-emerald-100 text-emerald-600' }
            ].map(rule => (
              <div key={rule.label} className="flex items-center justify-between text-[10px] p-2 rounded-xl bg-white/40 border border-white/60">
                <span className={`px-2 py-0.5 rounded-full font-bold ${rule.color}`}>{rule.label}</span>
                <span className="font-mono text-slate-500">
                  [{(mu - rule.range * theoreticalSE).toFixed(3)}, {(mu + rule.range * theoreticalSE).toFixed(3)}]
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 知识卡片 */}
        <div className="space-y-2 pt-1 border-t border-slate-100/50">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-black uppercase tracking-tighter">CLT 适用度</span>
            <span className={`font-black ${sampleSize >= 30 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {sampleSize >= 100 ? '极高' : sampleSize >= 30 ? '高' : '中低'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${sampleSize >= 30 ? 'bg-emerald-400' : 'bg-amber-400'}`}
              style={{ width: `${Math.min((sampleSize / 100) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 背景装饰 */}
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-amber-100/30 blur-2xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
    </div>
  );
};

export default PrinciplesModule;
