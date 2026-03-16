
import React from 'react';

const TheoryModule: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-white mt-8">
      <h3 className="text-lg font-black mb-8 text-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shadow-sm">
           <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
           </svg>
        </div>
        统计学理论基石
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Law of Large Numbers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[11px]">
            <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
            伯努利大数定律 (LLN)
          </div>
          <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
            描述了随机现象的平均结果具有稳定性。对于独立重复试验，事件发生的频率会随试验次数增加而趋近于其概率。
          </p>
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 font-serif italic text-center text-slate-600 shadow-inner">
            P(|m/n - p| &lt; ε) → 1 (当 n → ∞)
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            注：m 为事件发生次数，n 为试验总数，p 为概率。这解释了模拟次数越多，观测越趋于稳定。
          </p>
        </div>

        {/* Central Limit Theorem */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-[11px]">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            林德伯格-列维定理 (CLT)
          </div>
          <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
            无论总体分布如何，独立同分布的随机变量之和（或均值）在样本量足够大时，其分布趋向于正态分布。
          </p>
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 font-serif italic text-center text-slate-600 shadow-inner">
            Zn = (X̄ - μ) / (σ/√n)  →  N(0, 1)
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            注：X̄ 为样本均值，μ 为总体均值。这是统计推断（如置信区间、假设检验）成立的根本。
          </p>
        </div>
      </div>

      <div className="mt-10 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
        <h4 className="text-xs font-black text-indigo-600 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          学者视角
        </h4>
        <p className="text-[12px] text-indigo-400/80 leading-relaxed font-medium">
          大数定律解释了均值<strong>趋向于中心</strong>的过程，而中心极限定理则揭示了均值<strong>偏离中心的分布规律</strong>。在本次实验中，n 的大小决定了正态分布形态的“成熟度”。
        </p>
      </div>
    </div>
  );
};

export default TheoryModule;
