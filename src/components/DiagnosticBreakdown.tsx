import React, { useState, useMemo } from 'react';
import { DistributionType } from '../types';
import { DISTRIBUTIONS, runCLTSimulation } from '../lib/mathStats';
import { MathFormula } from './MathFormula';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  AlertTriangle,
  Activity,
  Zap,
  RotateCcw,
  Sliders,
  XCircle,
  HelpCircle,
} from 'lucide-react';

interface DiagnosticBreakdownProps {
  currentDist: DistributionType;
  setCurrentDist: (dist: DistributionType) => void;
  sampleSize: number;
  setSampleSize: (n: number) => void;
}

export const DiagnosticBreakdown: React.FC<DiagnosticBreakdownProps> = ({
  currentDist,
  setCurrentDist,
  sampleSize,
  setSampleSize,
}) => {
  const [cauchyN, setCauchyN] = useState<number>(1000);
  const [cauchyMeans, setCauchyMeans] = useState<number[]>([]);

  // Run simulation for Q-Q plot
  const simResult = useMemo(() => {
    return runCLTSimulation(currentDist, sampleSize, 5000);
  }, [currentDist, sampleSize]);

  // Handle Cauchy simulation on demand
  const handleRunCauchy = () => {
    const means: number[] = [];
    for (let k = 0; k < 200; k++) {
      let sum = 0;
      for (let i = 0; i < cauchyN; i++) {
        const u = Math.random();
        sum += Math.tan(Math.PI * (u - 0.5));
      }
      means.push(sum / cauchyN);
    }
    setCauchyMeans(means);
  };

  const distInfo = DISTRIBUTIONS[currentDist];

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium text-xs">
            <AlertTriangle className="w-3.5 h-3.5" /> 拟合诊断与失效边界 (Diagnostic & Breakdown)
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-serif mt-1">
            Q-Q 图（Quantile-Quantile Plot）定量诊断 & 中心极限定理失效边界
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            正态 Q-Q 图是检验样本均值是否成功收敛于标准正态分布的最严谨可视化诊断工具。
          </p>
        </div>

        {/* Distribution & Slider Controls for Q-Q Plot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">选择诊断分布:</label>
            <select
              value={currentDist}
              onChange={(e) => setCurrentDist(e.target.value as DistributionType)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {(Object.keys(DISTRIBUTIONS) as DistributionType[]).map((d) => (
                <option key={d} value={d}>
                  {DISTRIBUTIONS[d].name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>拖动调节样本量 <MathFormula tex="n" />:</span>
              <span className="font-mono font-bold text-indigo-600">n = {sampleSize}</span>
            </div>
            <input
              type="range"
              min="1"
              max="200"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span><MathFormula tex="n = 1" /> (粗糙原始分布)</span>
              <span><MathFormula tex="n = 30" /> (传统经验准则)</span>
              <span><MathFormula tex="n = 200" /> (极高精拟合)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Q-Q Plot Diagnostic Card & Cauchy Failure Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Q-Q Plot Diagnostic Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                实时正态 Q-Q 图诊断 (Quantile-Quantile Plot)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                若散点紧贴 <MathFormula tex="y=x" /> 45° 倾斜参考线，证明成功正态化
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                simResult.fitScore >= 80
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              拟合得分: {simResult.fitScore}/100
            </span>
          </div>

          <div className="h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="theoreticalQuantile"
                  name="理论分位数 N(0,1)"
                  domain={[-3, 3]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: '理论正态分位数 (Theoretical Quantile)', position: 'insideBottom', offset: -12, fontSize: 10, fill: '#94a3b8' }}
                />
                <YAxis
                  type="number"
                  dataKey="sampleQuantile"
                  name="实测标准化分位数"
                  domain={[-4, 4]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: '实测分位数 (Sample Quantile)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded text-xs font-mono shadow-md">
                          <div>理论 Quantile: {data.theoreticalQuantile}</div>
                          <div>实测 Quantile: {data.sampleQuantile}</div>
                          <div className="text-slate-400">
                            偏差: {Math.abs(data.sampleQuantile - data.theoreticalQuantile).toFixed(3)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Reference line y = x */}
                <ReferenceLine
                  segment={[
                    { x: -3.5, y: -3.5 },
                    { x: 3.5, y: 3.5 },
                  ]}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Scatter data={simResult.qqData} fill="#4f46e5" shape="circle" size={40} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-900">Q-Q 图诊断读图秘笈:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
              <li><strong>S型弯曲 / 尾部上翘</strong>：代表实测分布存在长尾高偏态，极值出现的概率显著高于正态预估。</li>
              <li><strong>两端散点贴合红线</strong>：代表中心极限定理已经全面起效，尾部风险已被高斯分布完备包容。</li>
            </ul>
          </div>
        </div>

        {/* Extreme Breakdown: Cauchy Distribution */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-4 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="text-base font-bold text-amber-300 font-serif">
                定理失效奇观：柯西分布 (Cauchy Breakdown)
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              方差无穷大 σ²=∞
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            中心极限定理成立的核心前提是**总体必须具备有限方差（<MathFormula tex="\sigma^2 < \infty" />）**。柯西分布 <MathFormula tex="f(x) = \frac{1}{\pi(1+x^2)}" /> 的尾部衰减极其缓慢，导致其期望与方差均不存在。
          </p>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">把样本量放大到极端超大级别:</span>
              <span className="font-mono font-bold text-amber-400">n = {cauchyN.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2">
              {[10, 100, 1000, 10000, 100000].map((num) => (
                <button
                  key={num}
                  onClick={() => setCauchyN(num)}
                  className={`px-2.5 py-1 text-xs rounded font-mono transition-all cursor-pointer ${
                    cauchyN === num
                      ? 'bg-amber-400 text-slate-900 font-bold'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  n={num >= 1000 ? `${num / 1000}k` : num}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunCauchy}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-rose-600 text-slate-900 font-bold text-xs rounded-lg shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 触发 n={cauchyN.toLocaleString()} 级柯西均值抽样模拟
            </button>
          </div>

          {/* Cauchy Simulation Output Log */}
          {cauchyMeans.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                <span>模拟结果 (200 次独立抽样均值 X̄):</span>
                <span className="text-[10px] text-slate-400">均值散点出现剧烈离群峰值</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 max-h-36 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1">
                <p className="text-rose-400">
                  [警告] 即使在 n = {cauchyN.toLocaleString()} 条件下，样本均值的波动范围仍高达 [{Math.min(...cauchyMeans).toFixed(1)}, {Math.max(...cauchyMeans).toFixed(1)}]！
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {cauchyMeans.slice(0, 18).map((m, idx) => (
                    <span
                      key={idx}
                      className={`px-1.5 py-0.5 rounded ${
                        Math.abs(m) > 10 ? 'bg-rose-900/60 text-rose-300 font-bold' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {m.toFixed(1)}
                    </span>
                  ))}
                  <span className="text-slate-500">...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
