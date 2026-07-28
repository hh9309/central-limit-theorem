import React, { useState, useMemo } from 'react';
import { DistributionType, SimulationResult } from '../types';
import { DISTRIBUTIONS, runCLTSimulation } from '../lib/mathStats';
import { MathFormula } from './MathFormula';
import { motion, AnimatePresence } from 'motion/react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Activity,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
} from 'lucide-react';

interface MorphingSandboxProps {
  currentDist: DistributionType;
  setCurrentDist: (dist: DistributionType) => void;
  sampleSize: number;
  setSampleSize: (n: number) => void;
  simResult: SimulationResult;
  onRefreshSimulation: () => void;
}

export const MorphingSandbox: React.FC<MorphingSandboxProps> = ({
  currentDist,
  setCurrentDist,
  sampleSize,
  setSampleSize,
  simResult,
  onRefreshSimulation,
}) => {
  const [numSimulations, setNumSimulations] = useState<number>(10000);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'discrete' | 'mixtures' | 'continuous' | 'breakdown'>('all');

  const distInfo = DISTRIBUTIONS[currentDist];

  // Re-run simulation when controls change
  const currentSimResult = useMemo(() => {
    return runCLTSimulation(currentDist, sampleSize, numSimulations);
  }, [currentDist, sampleSize, numSimulations]);

  const presetNs = [1, 5, 15, 30, 60, 100, 180];

  type DistCategoryFilter = 'all' | 'discrete' | 'mixtures' | 'continuous' | 'breakdown';
  const categoryMap: Record<DistCategoryFilter, { label: string }> = {
    all: { label: '全部分布 (12)' },
    discrete: { label: '离散分布 (4)' },
    mixtures: { label: '混合分布 (3)' },
    continuous: { label: '连续分布 (4)' },
    breakdown: { label: '失效边界 (1)' },
  };

  const filteredDistKeys = (Object.keys(DISTRIBUTIONS) as DistributionType[]).filter((key) => {
    const cat = DISTRIBUTIONS[key].category;
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'discrete') return cat.includes('离散');
    if (categoryFilter === 'mixtures') return cat.includes('混合');
    if (categoryFilter === 'continuous') return cat.includes('连续');
    if (categoryFilter === 'breakdown') return cat.includes('失效');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-xs">
              <Activity className="w-3.5 h-3.5" /> 动态演化沙盒 (Dynamic Sandbox)
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-serif mt-1">
              总体偏度 vs 样本量 <MathFormula tex="n" /> 正态收敛演化器
            </h2>
          </div>

          <button
            onClick={onRefreshSimulation}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重新抽样实验
          </button>
        </div>

        {/* Distribution Selector Slices */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              选择生成总体概率分布 (Population Distribution):
            </label>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(['all', 'discrete', 'mixtures', 'continuous', 'breakdown'] as DistCategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-[11px] rounded-full font-medium transition-all cursor-pointer shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {categoryMap[cat].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
            {filteredDistKeys.map((key) => {
              const info = DISTRIBUTIONS[key];
              const isSelected = currentDist === key;
              return (
                <button
                  key={key}
                  onClick={() => setCurrentDist(key)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30 -translate-y-0.5'
                      : 'bg-slate-50/70 text-slate-700 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold truncate">{info.shortName}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: info.color }}
                      />
                    </div>
                    <div
                      className={`text-[10px] px-1.5 py-0.5 rounded inline-block font-mono mb-1.5 ${
                        isSelected ? 'bg-slate-800 text-indigo-300' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {info.category.split(' ')[0]}
                    </div>
                  </div>

                  <div className="text-[10px] opacity-80 pt-1 border-t border-current/10 font-mono flex items-center justify-between">
                    <span>{isNaN(info.skewness) ? '偏度: ∞' : `偏度: ${info.skewness}`}</span>
                    <span className="opacity-70">n≥{info.recommendedN === Infinity ? '∞' : info.recommendedN}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic n Slider & Preset Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-800">
              <span className="flex items-center gap-1.5">
                拖动样本量 <MathFormula tex="n" /> (1 至 200):
                <span className="text-slate-400 font-normal">(每一个样本点代表 n 个随机数的均值)</span>
              </span>
              <span className="text-base font-mono font-bold text-indigo-600 bg-white px-2.5 py-0.5 rounded border border-indigo-200 shadow-2xs">
                n = {sampleSize}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="200"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />

            {/* Presets */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-slate-400 shrink-0">快选 Preset:</span>
              {presetNs.map((p) => (
                <button
                  key={p}
                  onClick={() => setSampleSize(p)}
                  className={`px-2.5 py-1 text-xs rounded font-mono transition-all cursor-pointer ${
                    sampleSize === p
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  n={p}
                </button>
              ))}
            </div>
          </div>

          {/* Simulation Count K */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-800">
              <span>模拟重复次数 <MathFormula tex="K" />:</span>
              <span className="font-mono font-semibold text-slate-700">{numSimulations.toLocaleString()} 次</span>
            </div>
            <select
              value={numSimulations}
              onChange={(e) => setNumSimulations(Number(e.target.value))}
              className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value={1000}>K = 1,000 次抽样</option>
              <option value={5000}>K = 5,000 次抽样</option>
              <option value={10000}>K = 10,000 次抽样 (推荐)</option>
              <option value={20000}>K = 20,000 次高精模拟</option>
            </select>

            <div className="text-[11px] text-slate-500 pt-1">
              理论推荐达标样本量: <strong className="text-indigo-600">n ≥ {distInfo.recommendedN}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Simulation Interactive Chart Panel */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 font-serif">
              均值抽样分布直方图 vs 理论高斯钟形包络线
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded font-medium border border-indigo-200">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-xs inline-block" />
              实际抽样频率直方图
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded font-medium border border-amber-200">
              <span className="w-3 h-0.5 bg-amber-500 inline-block" />
              理论高斯密度曲线 N(μ, σ²/n)
            </span>
          </div>
        </div>

        {/* Chart Rendering */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={currentSimResult.histogram}
              margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="binLabel"
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: '样本均值 X̄ 区间', position: 'insideBottom', offset: -12, fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: '概率密度/频率', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg text-xs space-y-1 shadow-lg border border-slate-700 font-mono">
                        <div className="text-indigo-300 font-bold border-b border-slate-700 pb-1">
                          均值中心: {data.binLabel}
                        </div>
                        <div>观察频率 (Empirical): {(data.frequency * 100).toFixed(2)}%</div>
                        <div>理论高斯密度 (Gaussian): {(data.normalDensity * 100).toFixed(2)}%</div>
                        <div className="text-slate-400">频数: {data.count} 次</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="frequency" name="实测频率" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.85} />
              <Line
                type="monotone"
                dataKey="normalDensity"
                name="理论高斯曲线"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Special Warning Banner for Cauchy */}
        {currentDist === 'cauchy' && (
          <div className="bg-slate-900 text-amber-300 p-4 rounded-xl text-xs space-y-1 border border-amber-500/40">
            <div className="font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              警告：柯西分布导致中心极限定理失效（CLT Breakdown）！
            </div>
            <p className="text-slate-300">
              柯西分布因缺乏有限一阶矩（期望）和二阶矩（方差），不论样本量增至多大（即使 <MathFormula tex="n=100,000" />），样本均值依然服从纯正态无法收敛的柯西分布！
            </p>
          </div>
        )}

        {/* Quantitative Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-0.5">
            <div className="text-[11px] text-slate-500">观察均值 E(X̄)</div>
            <div className="text-sm font-mono font-bold text-slate-900">
              {isNaN(currentSimResult.observedMean) ? '不存在' : currentSimResult.observedMean}
            </div>
            <div className="text-[10px] text-slate-400">
              理论: {isNaN(currentSimResult.theoreticalMean) ? '不存在 (无一阶矩)' : currentSimResult.theoreticalMean}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-0.5">
            <div className="text-[11px] text-slate-500">观察标准误差 SE</div>
            <div className="text-sm font-mono font-bold text-slate-900">
              {isNaN(currentSimResult.observedStd) ? '不存在' : currentSimResult.observedStd}
            </div>
            <div className="text-[10px] text-slate-400">
              理论 σ/√n: {isNaN(currentSimResult.theoreticalStd) ? '不存在 (无二阶矩)' : currentSimResult.theoreticalStd}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-0.5">
            <div className="text-[11px] text-slate-500">残存偏度 Skewness</div>
            <div
              className={`text-sm font-mono font-bold ${
                isNaN(currentSimResult.skewness)
                  ? 'text-rose-600'
                  : Math.abs(currentSimResult.skewness) < 0.2
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {isNaN(currentSimResult.skewness) ? '不存在' : currentSimResult.skewness}
            </div>
            <div className="text-[10px] text-slate-400">正态标准 = 0</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-0.5">
            <div className="text-[11px] text-slate-500">残存峰度 Kurtosis</div>
            <div className="text-sm font-mono font-bold text-slate-900">
              {isNaN(currentSimResult.kurtosis) ? '不存在' : currentSimResult.kurtosis}
            </div>
            <div className="text-[10px] text-slate-400">正态标准 = 0</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-0.5">
            <div className="text-[11px] text-slate-500">Shapiro p-value</div>
            <div className="text-sm font-mono font-bold text-indigo-600">
              {currentSimResult.shapiroPValue}
            </div>
            <div className="text-[10px] text-slate-400">p &gt; 0.05 接受正态</div>
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-200 space-y-0.5">
            <div className="text-[11px] text-indigo-800 font-medium">正态拟合综合得分</div>
            <div className="text-sm font-mono font-bold text-indigo-950">
              {currentSimResult.fitScore} / 100
            </div>
            <div className="text-[10px] text-indigo-700">
              {currentSimResult.fitScore >= 85 ? '优秀 (Qualified)' : '需增大样本量'}
            </div>
          </div>
        </div>

        {/* Natural Language AI Observation Slice */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Info className="w-4 h-4 text-indigo-600" />
            演化实验室实时观察评语 (Real-time Morphing Observation):
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            当前总体为【{distInfo.name}】（偏度 = {isNaN(distInfo.skewness) ? '无穷大' : distInfo.skewness}）。当样本量处于 <strong className="text-indigo-600">n = {sampleSize}</strong> 时，均值抽样分布的偏度为 <strong className="font-mono">{isNaN(currentSimResult.skewness) ? '不存在 (柯西失效)' : currentSimResult.skewness}</strong>。
            {sampleSize < distInfo.recommendedN ? (
              <span className="text-amber-800 font-medium ml-1">
                因为总体存在较高偏态，传统 <MathFormula tex="n=30" /> 的经验法则在此处过于乐观，直方图右尾仍然存在可见残斜。建议继续增大样本量至 <MathFormula tex="n \ge" /> {isFinite(distInfo.recommendedN) ? distInfo.recommendedN : '∞'} 以获得安全的高斯近似。
              </span>
            ) : (
              <span className="text-emerald-700 font-medium ml-1">
                样本量已充分克服总体的原始偏度，直方图包络线与理论高斯曲线拟合优异，正态近似可以安全应用！
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
