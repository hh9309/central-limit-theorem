import React, { useState } from 'react';
import { MathFormula } from './MathFormula';
import { BookOpen, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, HelpCircle } from 'lucide-react';

export const ConceptualGuide: React.FC = () => {
  // Interactive formula explorer states
  const [mu, setMu] = useState<number>(10);
  const [sigma, setSigma] = useState<number>(4);
  const [n, setN] = useState<number>(30);
  const [sampleMean, setSampleMean] = useState<number>(11.2);

  const stdError = sigma / Math.sqrt(n);
  const zScore = (sampleMean - mu) / stdError;

  return (
    <div className="space-y-6">
      {/* Banner / Hero Statement */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 font-serif text-9xl font-bold select-none text-white">
          CLT
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5" /> 知识引导 · 统计学直觉重建
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
            中心极限定理（CLT）与高斯涌现本质
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            无论总体服从何种概率分布（只要方差有限），随着样本量 <MathFormula tex="n" /> 的增大，样本均值 <MathFormula tex="\bar{X}" /> 的标准化变量都会收敛于标准正态分布 <MathFormula tex="N(0,1)" />。然而，**收敛速度极度依赖于总体的偏度（Skewness）**！
          </p>
        </div>
      </div>

      {/* Grid of Modular Slices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slice 1: Strict Formula Statement */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-serif">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              1.1 严格标准化定义
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
              数学形式
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-5 text-center space-y-3">
            <p className="text-xs text-slate-500">
              设独立同分布（i.i.d.）随机变量序列 <MathFormula tex="X_1, X_2, \dots, X_n" />，总体均值为 <MathFormula tex="E(X_i) = \mu" />，总体方差满足 <MathFormula tex="\operatorname{Var}(X_i) = \sigma^2 < \infty" />：
            </p>
            <div className="text-lg font-serif text-indigo-950 py-3 bg-white rounded border border-slate-200/60 shadow-xs overflow-x-auto">
              <MathFormula tex="Z_n = \frac{\bar{X} - \mu}{\sigma / \sqrt{n}} = \frac{\sum_{i=1}^n X_i - n\mu}{\sigma \sqrt{n}} \xrightarrow{d} N(0, 1) \quad (n \to \infty)" block />
            </div>
            <p className="text-xs text-slate-500">
              注：<MathFormula tex="\bar{X} = \frac{1}{n}\sum_{i=1}^n X_i" /> 为样本均值；<MathFormula tex="\xrightarrow{d}" /> 表示依分布收敛（Convergence in Distribution）。
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>均值无偏性</strong>：<MathFormula tex="E(\bar{X}) = \mu" />，与样本量 <MathFormula tex="n" /> 无关，即样本均值的数学期望恒等于总体均值。</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>标准误衰减律</strong>：<MathFormula tex="\text{SE}(\bar{X}) = \frac{\sigma}{\sqrt{n}}" />，均值抽样分布的波动性随 <MathFormula tex="\sqrt{n}" /> 成反比平滑收缩。</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>渐近方差</strong>：<MathFormula tex="\operatorname{Var}(\bar{X}) = \frac{\sigma^2}{n}" />，当 <MathFormula tex="n \to \infty" /> 时，<MathFormula tex="\bar{X}" /> 依概率收敛于 <MathFormula tex="\mu" />（依大数定律）。</span>
            </div>
          </div>
        </div>

        {/* Slice 2: Dismantling the n>=30 Dogma */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 font-serif">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>1.2 破除“<MathFormula tex="n \ge 30" /> 绝对化”误区</span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium">
              统计学避坑
            </span>
          </div>

          <div className="bg-rose-50/50 border border-rose-200/80 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>为何教科书常写 “<MathFormula tex="n \ge 30" /> 即可正态近似”？</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              传统的 <MathFormula tex="n \ge 30" /> 规则源于早期计算资源匮乏时代的经验提炼。**它仅适用于近乎对称或低偏态（<MathFormula tex="|\gamma_1| < 0.5" />）的分布！**
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center justify-between">
                <span>轻偏态分布（如均匀分布、二项分布）</span>
                <span className="text-emerald-600 font-mono"><MathFormula tex="n = 5 \sim 15" /> 达标</span>
              </div>
              <p className="text-slate-500 text-[11px]">对称性强，钟形几乎瞬间涌现，尾部无显著长尾风险。</p>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/60 space-y-1">
              <div className="font-semibold text-amber-900 flex items-center justify-between">
                <span>高偏态分布（如金融巨灾理赔、排队等待时间）</span>
                <span className="text-amber-700 font-mono font-bold"><MathFormula tex="n \ge 100" />+ 方可达标</span>
              </div>
              <p className="text-amber-800/80 text-[11px]">
                若硬套 <MathFormula tex="n=30" />，正态近似在右尾（极值概率）会产生 <strong>15%~30% 的严重漏估</strong>！
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slice 3: Interactive Parameter Explorer */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              1.3 交互式公式探针 (Formula Interactive Explorer)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              实时调整参数，体验样本量 <MathFormula tex="n" /> 如何通过标准误 <MathFormula tex="\text{SE} = \frac{\sigma}{\sqrt{n}}" /> 挤压 Z 值的分布区间
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
            Z-Score: {zScore.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
          {/* Parameter 1: Mu */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>总体均值 <MathFormula tex="\mu" /></span>
              <span className="font-mono">{mu}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={mu}
              onChange={(e) => setMu(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Parameter 2: Sigma */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>总体标准差 <MathFormula tex="\sigma" /></span>
              <span className="font-mono">{sigma}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={sigma}
              onChange={(e) => setSigma(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Parameter 3: n */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>样本量 <MathFormula tex="n" /></span>
              <span className="font-mono text-indigo-600 font-bold">{n}</span>
            </div>
            <input
              type="range"
              min="1"
              max="200"
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Parameter 4: Sample Mean */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>观察样本均值 <MathFormula tex="\bar{X}" /></span>
              <span className="font-mono">{sampleMean}</span>
            </div>
            <input
              type="range"
              min={mu - 10}
              max={mu + 10}
              step="0.1"
              value={sampleMean}
              onChange={(e) => setSampleMean(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Live Calculation Output Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="text-slate-500">标准误 Standard Error</span>
            <div className="text-base font-mono font-bold text-slate-900">
              <MathFormula tex={`\\text{SE} = \\frac{${sigma}}{\\sqrt{${n}}} = ${stdError.toFixed(3)}`} />
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="text-slate-500">标准化 Z-Score</span>
            <div className="text-base font-mono font-bold text-indigo-600">
              <MathFormula tex={`Z = \\frac{${sampleMean} - ${mu}}{${stdError.toFixed(3)}} = ${zScore.toFixed(2)}`} />
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="text-slate-500">正态概率评估 (95% 置信区间)</span>
            <div className="text-xs font-semibold text-slate-800">
              {Math.abs(zScore) <= 1.96 ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 位于 95% 置信区间内 (|Z| ≤ 1.96)
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> 属于小概率事件 (|Z| &gt; 1.96)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slice 4: Skewness vs Recommended N Threshold Matrix */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 font-serif">
            1.4 总体偏度 vs 推荐最小样本量定量对照矩阵
          </h3>
          <span className="text-xs text-slate-500">经验准则：<MathFormula tex="n \ge 28 \cdot \text{Skewness}^2" /></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-800 font-medium border-b border-slate-200">
              <tr>
                <th className="p-3">总体分布形态</th>
                <th className="p-3">绝对偏度 <MathFormula tex="|\gamma_1|" /></th>
                <th className="p-3">传统法则 <MathFormula tex="n=30" /> 评估</th>
                <th className="p-3">推荐最小样本量 <MathFormula tex="n_{rec}" /></th>
                <th className="p-3">典型工程代表</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-semibold text-slate-900">连续均匀分布</td>
                <td className="p-3 font-mono">0.0</td>
                <td className="p-3"><span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">严重冗余</span></td>
                <td className="p-3 font-bold font-mono text-indigo-600"><MathFormula tex="n \ge 5" /></td>
                <td className="p-3 text-slate-500">传感器随机热噪声</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-semibold text-slate-900">对称二项分布</td>
                <td className="p-3 font-mono">0.0</td>
                <td className="p-3"><span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">完全充足</span></td>
                <td className="p-3 font-bold font-mono text-indigo-600"><MathFormula tex="n \ge 15" /></td>
                <td className="p-3 text-slate-500">AB测试二值转化率</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-semibold text-slate-900">指数分布 Exp(λ)</td>
                <td className="p-3 font-mono">2.0</td>
                <td className="p-3"><span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">存右尾偏斜</span></td>
                <td className="p-3 font-bold font-mono text-indigo-600"><MathFormula tex="n \ge 80 \sim 100" /></td>
                <td className="p-3 text-slate-500">服务器请求响应延迟</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-semibold text-slate-900">极值理赔分布 Pareto</td>
                <td className="p-3 font-mono">&gt; 3.5</td>
                <td className="p-3"><span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">严重失效</span></td>
                <td className="p-3 font-bold font-mono text-indigo-600"><MathFormula tex="n \ge 150 \sim 300+" /></td>
                <td className="p-3 text-slate-500">保险巨灾理赔、金融风险VaR</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
