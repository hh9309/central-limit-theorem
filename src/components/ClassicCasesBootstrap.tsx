import React, { useState, useMemo } from 'react';
import { ClassicScenario, ScenarioType, BootstrapResult } from '../types';
import { runBootstrap, calculateMean, calculateStdDev, calculateSkewness } from '../lib/mathStats';
import { MathFormula } from './MathFormula';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Briefcase,
  RefreshCw,
  ShieldAlert,
  Sliders,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

export const SCENARIOS: Record<ScenarioType, ClassicScenario> = {
  insurance: {
    id: 'insurance',
    title: '保险极值理赔风险评估 (Insurance Loss)',
    subtitle: '高偏态长尾数据 · 巨灾理赔风险',
    industry: '保险精算 & 金融风险控制',
    unit: '万元',
    defaultSampleSize: 25,
    description:
      '大部分日常小额理赔在 10~50 万元，但偶发特大火灾或化工厂爆炸理赔高达 2,000 万元。分布呈严重右偏长尾特征。',
    skewnessNote: '总体偏度 Skewness ≈ 3.5 ~ 4.2',
    n30Pitfall:
      '精算师若盲目套用 n=30 正态近似计算 99% VaR (Value at Risk) 准备金，将导致准备金缺口高达 18%~25%，引发资金链断裂风险！',
    bootstrapSolution:
      'Bootstrapping 经验重抽样无需假设总体服从高斯分布，直接对原始经验分布有放回抽样，能够精准捕获非对称右尾区间。',
    dataGenerator: (count: number) => {
      const data: number[] = [];
      for (let i = 0; i < count; i++) {
        // Pareto heavy tail: 80% small claims, 20% massive claims
        const u = Math.random();
        const base = 20 + -Math.log(1 - u) * 35;
        const extreme = Math.random() < 0.12 ? Math.pow(Math.random(), -2.2) * 120 : 0;
        data.push(Number((base + extreme).toFixed(2)));
      }
      return data;
    },
  },
  elevator: {
    id: 'elevator',
    title: '电梯超载概率预测 (Elevator Overload)',
    subtitle: '小样本 n=12 · 乘客+重型物品叠加',
    industry: '特种设备工程与安全设计',
    unit: 'kg',
    defaultSampleSize: 12,
    description:
      '一艘载客电梯额定载重为 1000kg（12名乘客），乘客体重本身呈右偏分布，加上携带行李后呈现明显的不对称偏度。',
    skewnessNote: '总体偏度 Skewness ≈ 1.8',
    n30Pitfall:
      '电梯核载人数仅为 n=12，远未达到 n=30！若直接套用高斯标准差叠加，会低估多名重物乘客同时乘梯时的极值过载风险。',
    bootstrapSolution:
      '通过重抽样估计 12 人总重分布，可得出真实的 99.5% 安全边界，避免硬件剪切安全事故。',
    dataGenerator: (count: number) => {
      const data: number[] = [];
      for (let i = 0; i < count; i++) {
        const weight = 62 + Math.pow(Math.random(), 3) * 60 + (Math.random() < 0.2 ? Math.random() * 25 : 0);
        data.push(Number(weight.toFixed(1)));
      }
      return data;
    },
  },
  call_center: {
    id: 'call_center',
    title: '客服等待时长与排队论 (Call Center Wait)',
    subtitle: '指数分布到达 · 峰值排队',
    industry: '运筹学 & 服务运营管理',
    unit: '分钟',
    defaultSampleSize: 30,
    description:
      '客户呼入等待时长服从指数分布 Exp(λ)。管理者希望评估每 30 钟批次内客户平均等待时长的 upper-bound 承诺。',
    skewnessNote: '总体偏度 Skewness = 2.0',
    n30Pitfall:
      '即使批次大小刚好 n=30，指数分布的右尾残余偏态仍会导致高斯近似算出的 SLA 违约概率偏低。',
    bootstrapSolution:
      '重抽样评估非对称置信上限，帮助精准规划动态客服坐席数量。',
    dataGenerator: (count: number) => {
      const data: number[] = [];
      for (let i = 0; i < count; i++) {
        const wait = -Math.log(1 - Math.random()) * 4.5;
        data.push(Number(wait.toFixed(2)));
      }
      return data;
    },
  },
};

export const ClassicCasesBootstrap: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('insurance');
  const [sampleSizeN, setSampleSizeN] = useState<number>(25);

  const scenario = SCENARIOS[selectedScenario];

  // Generate original small sample
  const originalSample = useMemo(() => {
    return scenario.dataGenerator(sampleSizeN);
  }, [selectedScenario, sampleSizeN]);

  // Run Bootstrap
  const [numBootstraps, setNumBootstraps] = useState<number>(3000);
  const bootstrapRes = useMemo(() => {
    return runBootstrap(originalSample, numBootstraps);
  }, [originalSample, numBootstraps]);

  // Calculate stats on original sample
  const sampleMean = calculateMean(originalSample);
  const sampleStd = calculateStdDev(originalSample, sampleMean);
  const sampleSkew = calculateSkewness(originalSample, sampleMean, sampleStd);

  // Prepare Histogram Data for Bootstrap Means Distribution
  const bootHistogram = useMemo(() => {
    const means = bootstrapRes.bootstrapMeans;
    if (!means || means.length === 0) return [];
    const minVal = Math.min(...means);
    const maxVal = Math.max(...means);
    if (isNaN(minVal) || isNaN(maxVal) || minVal === maxVal) {
      return [{ binLabel: '0', binCenter: 0, count: means.length, frequency: 1 }];
    }
    const numBins = 28;
    const binWidth = (maxVal - minVal) / numBins || 1;

    const bins = [];
    for (let i = 0; i < numBins; i++) {
      const bStart = minVal + i * binWidth;
      const bEnd = bStart + binWidth;
      const bCenter = Number(((bStart + bEnd) / 2).toFixed(2));
      const count = means.filter((v) => v >= bStart && v < bEnd).length;
      bins.push({
        binLabel: bCenter.toFixed(1),
        binCenter: bCenter,
        count,
        frequency: count / means.length,
      });
    }
    return bins;
  }, [bootstrapRes]);

  return (
    <div className="space-y-6">
      {/* Scenario Selector Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-xs">
              <Briefcase className="w-3.5 h-3.5" /> 经典案例与现代重抽样 (Cases & Bootstrap)
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-serif mt-1">
              真实工程场景中的 <MathFormula tex="n=30" /> 陷阱与小样本解法
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">场景切换:</span>
            {(Object.keys(SCENARIOS) as ScenarioType[]).map((key) => {
              const sc = SCENARIOS[key];
              const isSelected = selectedScenario === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedScenario(key);
                    setSampleSizeN(sc.defaultSampleSize);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sc.subtitle.split('·')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Scenario Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 text-xs">
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>{scenario.title}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{scenario.description}</p>
            <div className="text-indigo-700 font-mono font-medium">{scenario.skewnessNote}</div>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200/60 space-y-1">
            <div className="font-bold text-rose-800 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              盲套 n=30 正态近似的隐患
            </div>
            <p className="text-rose-900/80 leading-relaxed">{scenario.n30Pitfall}</p>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/60 space-y-1">
            <div className="font-bold text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Bootstrapping 现代重抽样突破
            </div>
            <p className="text-emerald-900/80 leading-relaxed">{scenario.bootstrapSolution}</p>
          </div>
        </div>
      </div>

      {/* Main Bootstrap Resampling Visualizer */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Bootstrapping 有放回重抽样模拟器 (K = {numBootstraps.toLocaleString()} 次)
          </h3>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">观测样本量 N:</span>
              <input
                type="number"
                min="8"
                max="100"
                value={sampleSizeN}
                onChange={(e) => setSampleSizeN(Math.max(5, Math.min(100, Number(e.target.value))))}
                className="w-16 p-1 border border-slate-200 rounded font-mono text-xs text-center focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={() => setSampleSizeN((n) => n)} // Trigger re-gen
              className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> 重新抽样样本数据
            </button>
          </div>
        </div>

        {/* Small Original Sample Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              获取的原始单次小样本（N = {sampleSizeN} 份观测，单位: {scenario.unit}）:
            </span>
            <span className="font-mono text-slate-500">
              均值 x̄ = {sampleMean.toFixed(2)} | 标准差 s = {sampleStd.toFixed(2)} | 偏度 = {sampleSkew.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200/60 max-h-24 overflow-y-auto">
            {originalSample.map((val, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-800 shadow-2xs"
              >
                {val}
              </span>
            ))}
          </div>
        </div>

        {/* Bootstrap Means Distribution Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 font-serif">
              Bootstrap 重抽样均值 X̄* 分布直方图
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
                95% Bootstrap 百分位数置信区间
              </span>
              <span className="flex items-center gap-1 text-rose-600 font-medium">
                <span className="w-3 h-0.5 bg-rose-500 stroke-dasharray-2 inline-block" />
                传统 95% 高斯正态分布假设区间
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={bootHistogram} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  type="number"
                  dataKey="binCenter"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded text-xs font-mono shadow-md">
                          <div>均值区间: {data.binLabel} {scenario.unit}</div>
                          <div>频数: {data.count} 次</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[2, 2, 0, 0]} opacity={0.8} />

                {/* Reference lines for 95% CIs */}
                {bootstrapRes.ci95Percentile[0] != null && !isNaN(bootstrapRes.ci95Percentile[0]) && (
                  <ReferenceLine
                    x={bootstrapRes.ci95Percentile[0]}
                    stroke="#10b981"
                    strokeWidth={2}
                    label={{ value: 'Bootstrap 2.5%', fill: '#059669', fontSize: 10, position: 'top' }}
                  />
                )}
                {bootstrapRes.ci95Percentile[1] != null && !isNaN(bootstrapRes.ci95Percentile[1]) && (
                  <ReferenceLine
                    x={bootstrapRes.ci95Percentile[1]}
                    stroke="#10b981"
                    strokeWidth={2}
                    label={{ value: 'Bootstrap 97.5%', fill: '#059669', fontSize: 10, position: 'top' }}
                  />
                )}

                {bootstrapRes.ci95Normal[0] != null && !isNaN(bootstrapRes.ci95Normal[0]) && (
                  <ReferenceLine
                    x={bootstrapRes.ci95Normal[0]}
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{ value: 'Normal 2.5%', fill: '#e11d48', fontSize: 10, position: 'bottom' }}
                  />
                )}
                {bootstrapRes.ci95Normal[1] != null && !isNaN(bootstrapRes.ci95Normal[1]) && (
                  <ReferenceLine
                    x={bootstrapRes.ci95Normal[1]}
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{ value: 'Normal 97.5%', fill: '#e11d48', fontSize: 10, position: 'bottom' }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantified Comparison Table Slices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="font-bold text-emerald-900 text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Bootstrap 经验重抽样 95% 置信区间
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[11px]">
                精准捕获右尾
              </span>
            </div>
            <div className="text-xl font-mono font-bold text-emerald-950">
              [{bootstrapRes.ci95Percentile[0]} ~ {bootstrapRes.ci95Percentile[1]}] {scenario.unit}
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              基于 3,000 次重抽样的真实经验分布百分位数，完全保留了右端极端概率峰值，能够提供真实无偏的安全准备金上限。
            </p>
          </div>

          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200/80 space-y-2">
            <div className="font-bold text-rose-900 text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                盲套 n=30 正态假设 95% 置信区间
              </span>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-mono text-[11px]">
                对称低估右尾
              </span>
            </div>
            <div className="text-xl font-mono font-bold text-rose-950">
              [{bootstrapRes.ci95Normal[0]} ~ {bootstrapRes.ci95Normal[1]}] {scenario.unit}
            </div>
            <p className="text-rose-900/80 text-[11px] leading-relaxed">
              高斯对称公式强制左右等宽扩展（<MathFormula tex="\bar{x} \pm 1.96 \cdot s/\sqrt{N}" />），导致右侧极值上限被估低约{' '}
              <strong className="text-rose-700 underline font-mono">{bootstrapRes.underestimationPercent}%</strong>！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
