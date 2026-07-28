import React, { useState } from 'react';
import { DistributionType } from '../types';
import { DISTRIBUTIONS, runCLTSimulation } from '../lib/mathStats';
import { MathFormula } from './MathFormula';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  FileText,
  Calculator,
  AlertOctagon,
  BarChart2,
  CheckSquare,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface ExportReportProps {
  currentDist: DistributionType;
  sampleSize: number;
}

export const ExportReport: React.FC<ExportReportProps> = ({ currentDist, sampleSize }) => {
  const [copiedMd, setCopiedMd] = useState<boolean>(false);

  const distInfo = DISTRIBUTIONS[currentDist];
  const sim = runCLTSimulation(currentDist, sampleSize, 5000);

  const recommendedN = isNaN(sim.skewness)
    ? 200
    : Math.max(10, Math.round(28 * Math.pow(Math.abs(sim.skewness), 2)));
  const isPassed = sim.shapiroPValue > 0.05 && sim.fitScore >= 80;

  // Calculate estimated tail risk probability error percent
  const tailRiskError = Number(
    Math.min(42, Math.abs(distInfo.skewness) * 5.2 + Math.max(0, 30 - sampleSize) * 0.6).toFixed(1)
  );

  // Derive risk level
  const riskLevel =
    tailRiskError < 5 ? '低风险 (Low)' : tailRiskError < 18 ? '中等风险 (Moderate)' : '高危风险 (Critical High)';

  // Markdown Report Content with 6 Complete Sections
  const reportMarkdown = `# 中心极限定理 (CLT) 与高斯涌现拟合全维度诊断报告

**实验主题**: 破除 "n>=30 绝对化" 误区 & 总体偏度对正态收敛速度的定量诊断
**生成时间**: ${new Date().toLocaleString('zh-CN')}  
**实验环境**: 中心极限定理与高斯涌现智能实验室 v2.0  
**报告编号**: CLT-DIAG-${Date.now().toString().slice(-6)}

---

## 1. 实验基本参数与总体分布属性 (Experimental Base Parameters)
- **总体概率分布名称**: ${distInfo.name} (${distInfo.shortName})
- **总体理论均值 μ**: ${distInfo.mean}
- **总体理论方差 σ²**: ${distInfo.variance}
- **总体理论偏度 (Skewness γ₁)**: ${distInfo.skewness}
- **总体理论峰度 (Kurtosis γ₂)**: ${distInfo.kurtosis}
- **测试样本量 n**: ${sampleSize}
- **Monte Carlo 重复抽样次数 K**: 5,000 次

---

## 2. 样本均值抽样分布统计检验 (Statistical Testing & Metrics)
- **观察均值 E(X̄)**: ${sim.observedMean} (理论值 μ: ${sim.theoreticalMean})
- **均值估计无偏误差率**: ${Math.abs(
    ((sim.observedMean - sim.theoreticalMean) / (sim.theoreticalMean || 1)) * 100
  ).toFixed(3)}%
- **观察标准误差 SE**: ${sim.observedStd} (理论值 σ/√n: ${sim.theoreticalStd})
- **均值抽样分布残存偏度**: ${sim.skewness} (期望收敛目标: 0.0)
- **均值抽样分布残存峰度**: ${sim.kurtosis} (期望收敛目标: 0.0)
- **Shapiro-Wilk 正态性检验 p-value**: ${sim.shapiroPValue} (显著性水平 α = 0.05)
- **高斯正态拟合综合匹配得分**: ${sim.fitScore} / 100

---

## 3. 理论数学方程与衰减规律 (Theoretical Equations & Decay Laws)
根据 Lindeberg-Lévy 中心极限定理（i.i.d. 独立同分布条件）：
$$Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} \\xrightarrow{d} N(0, 1) \\quad (n \\to \\infty)$$

均值分布参数衰减方程：
$$\\text{SE}(\\bar{X}) = \\frac{\\sigma}{\\sqrt{n}}, \\quad \\text{Skewness}(\\bar{X}) = \\frac{\\gamma_1}{\\sqrt{n}}, \\quad \\text{Kurtosis}(\\bar{X}) = \\frac{\\gamma_2}{n}$$

---

## 4. 假设检验与尾部区间风险评估 (Hypothesis Test & Tail Risk)
- **正态近似综合判定**: ${isPassed ? '✅ 达成正态收敛 (Qualified)' : '⚠️ 否定正态近似假设 (Rejected)'}
- **“n ≥ 30 万能法则”适用性**: ${
    sampleSize >= 30 && !isPassed
      ? '❌ 失效！极高偏度导致 n=30 下仍严重偏离正态'
      : sampleSize < 30 && !isPassed
      ? '⚠️ 不满足，样本量不足且总体高偏'
      : '✅ 成立，样本量已满足当前分布的收敛要求'
  }
- **尾部双侧 95% 置信区间估计误差**: ~ ${tailRiskError}%
- **风险等级评定**: ${riskLevel}

---

## 5. 最小安全样本量推导与修正建议 (Recommended Sample Size & Bootstrap)
- **模型推导最小安全样本量 n_rec**: ${recommendedN}
- **采样修正推算**: ${
    sampleSize < recommendedN
      ? `建议将样本量扩充至少 ${recommendedN - sampleSize} 个观测单位 (n ≥ ${recommendedN})`
      : '当前样本量已满足或超过理论推荐阈值'
  }
- **替代拟合策略建议**: ${
    isPassed
      ? '可直接使用标准正态分布 Z 统计量进行置信区间估计与假设检验。'
      : '推荐使用 Bootstrap 非参数重抽样或 Cornish-Fisher 偏度修正展开式更新区间下限。'
  }

---

## 6. 实验室学术总结与工程落地指南 (Academic Summary & Engineering Guidance)
- **专家研判结论**: 测试总体为【${distInfo.name}】，原始偏度为 ${distInfo.skewness}。在样本量 n=${sampleSize} 条件下，均值分布残存偏度为 ${sim.skewness}，Shapiro-Wilk 检验 p-value = ${sim.shapiroPValue}。
- **实操落地避坑指南**: ${
    isPassed
      ? '当前数据规模可以安全支撑基于 t 检验或 Z 检验的大样本推断，无需额外进行复杂重抽样。'
      : '在金融高频理赔、网络时延异常分析或医学小样本实验中，切勿盲目套用正态分布！应优先扩充样本量或使用 Bootstrap/广义极值分布 (GEV)。'
  }
`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CLT_Diagnostic_Report_${currentDist}_n${sampleSize}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Export Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5" /> 7. 报告导出模块 (Export Report - 6 Dimensions)
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-serif mt-1">
              中心极限定理与高斯涌现全维度学术诊断报告
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              包含 6 大核心维度：基本参数、检验指标、数学方程、尾部风险评估、推荐样本量推导及工程避坑指南。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> 打印 / 保存 PDF
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> 下载完整 Markdown (.md)
            </button>
          </div>
        </div>

        {/* Printable Comprehensive Report Preview Card */}
        <div
          id="printable-report"
          className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 space-y-6 font-sans"
        >
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 tracking-wider uppercase font-mono">
                CLT FULL-DIMENSION STATISTICAL CERTIFICATE
              </span>
              <h3 className="text-xl font-bold font-serif text-slate-900 mt-0.5">
                中心极限定理 (CLT) 与高斯涌现拟合学术诊断报告
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                生成时间: {new Date().toLocaleString('zh-CN')} · 总体分布: {distInfo.name} · 报告编号: CLT-DIAG-{sampleSize}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isPassed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {isPassed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 正态拟合达标 (Qualified)
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" /> 正态拟合预警 (Warning)
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Experimental Base Parameters */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-l-2 border-indigo-600 pl-2">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
              项 1：实验基本参数与总体分布特征 (Base Parameters)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-slate-500">总体分布类型</span>
                <div className="text-sm font-bold text-slate-900">{distInfo.shortName}</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-slate-500">理论偏度 γ₁ / 峰度 γ₂</span>
                <div className="text-sm font-mono font-bold text-slate-900">
                  {distInfo.skewness} / {distInfo.kurtosis}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-slate-500">测试样本量 n</span>
                <div className="text-sm font-mono font-bold text-indigo-600">n = {sampleSize}</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-slate-500">抽样试验重复次数</span>
                <div className="text-sm font-mono font-bold text-slate-900">5,000 次</div>
              </div>
            </div>
          </div>

          {/* Section 2: Statistical Tests & Fitting Metrics */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-l-2 border-indigo-600 pl-2">
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              项 2：样本均值抽样分布统计检验指标 (Statistical Metrics)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-slate-500">观察均值 E(X̄)</span>
                <div className="text-sm font-mono font-bold text-slate-900">{sim.observedMean}</div>
                <span className="text-[10px] text-slate-400">理论值: {sim.theoreticalMean}</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-slate-500">标准误差 SE (σ/√n)</span>
                <div className="text-sm font-mono font-bold text-slate-900">{sim.observedStd}</div>
                <span className="text-[10px] text-slate-400">理论值: {sim.theoreticalStd}</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-slate-500">Shapiro-Wilk p-value</span>
                <div
                  className={`text-sm font-mono font-bold ${
                    sim.shapiroPValue > 0.05 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {sim.shapiroPValue}
                </div>
                <span className="text-[10px] text-slate-400">α = 0.05 临界值</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-slate-500">高斯拟合匹配得分</span>
                <div className="text-sm font-mono font-bold text-indigo-600">{sim.fitScore} / 100</div>
                <span className="text-[10px] text-slate-400">基于拟合优度判定</span>
              </div>
            </div>
          </div>

          {/* Section 3: Standard LaTeX Formulas */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-l-2 border-indigo-600 pl-2">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              项 3：LaTeX 标准推导方程与衰减规律 (LaTeX Equations)
            </h4>
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="p-3 bg-slate-50 rounded border border-slate-200/60 text-center text-sm font-serif text-slate-900 overflow-x-auto">
                <MathFormula
                  tex="Z_n = \frac{\bar{X} - \mu}{\sigma / \sqrt{n}} = \frac{\sum_{i=1}^n X_i - n\mu}{\sigma \sqrt{n}} \xrightarrow{d} N(0, 1) \quad (n \to \infty)"
                  block
                />
              </div>
              <div className="text-[11px] text-slate-500 flex flex-wrap justify-around pt-1 font-mono">
                <span>SE(X̄) = σ / √n = {sim.observedStd}</span>
                <span>Skewness(X̄) = γ₁ / √n = {sim.skewness}</span>
                <span>Kurtosis(X̄) = γ₂ / n = {sim.kurtosis}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Tail Risk Analysis */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-l-2 border-indigo-600 pl-2">
              <AlertOctagon className="w-3.5 h-3.5 text-indigo-600" />
              项 4：假设检验与尾部风险评估 (Tail Risk Analysis)
            </h4>
            <div className="p-4 bg-white rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <span className="text-slate-500 font-medium">“n ≥ 30 法则”适用性</span>
                <div
                  className={`font-bold text-xs ${
                    sampleSize >= 30 && !isPassed ? 'text-rose-600' : 'text-slate-800'
                  }`}
                >
                  {sampleSize >= 30 && !isPassed
                    ? '失效！强偏态下 n=30 仍偏离正态'
                    : isPassed
                    ? '有效，已成功满足正态拟合'
                    : '未达成，样本量需更进一步扩展'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <span className="text-slate-500 font-medium">95% 置信区间估计误差</span>
                <div className="font-bold text-xs text-rose-600 font-mono">
                  ~ {tailRiskError}% 概率偏差
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <span className="text-slate-500 font-medium">尾部风险等级</span>
                <div
                  className={`font-bold text-xs ${
                    tailRiskError > 18 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {riskLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Minimum Recommended Sample Size */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-l-2 border-indigo-600 pl-2">
              <TrendingDown className="w-3.5 h-3.5 text-indigo-600" />
              项 5：推荐最小安全样本量推导 (Minimum Safe Sample Size)
            </h4>
            <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200/80 text-xs text-indigo-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900">
                  基于偏度衰减模型推导的最小安全样本量:
                </span>
                <span className="font-mono font-bold text-indigo-700 text-sm bg-white px-2.5 py-0.5 rounded border border-indigo-300">
                  n_rec ≥ {recommendedN}
                </span>
              </div>
              <p className="leading-relaxed">
                依据公式 <MathFormula tex="n_{\text{rec}} = \max(10, \lceil 28 \cdot \gamma_1^2 \rceil)" /> 推算，总体偏度越大，克服右尾非对称性所需的样本量呈二次方增长。
                {sampleSize < recommendedN ? (
                  <span className="text-amber-800 font-semibold block mt-1">
                    当前样本量 (n={sampleSize}) 小于推荐阈值 ({recommendedN})，建议扩充样本或采用 Bootstrap 非参数估计。
                  </span>
                ) : (
                  <span className="text-emerald-800 font-semibold block mt-1">
                    当前样本量 (n={sampleSize}) 已安全达到推荐阈值 ({recommendedN})。
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Section 6: Academic Summary & Practical Guidance */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-l-2 border-indigo-600 pl-2">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              项 6：实验室学术研判总结与工程落地方案 (Academic Summary & Guidance)
            </h4>
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                学术研判与落地避坑指南:
              </div>
              <p className="leading-relaxed text-slate-300 text-[11px]">
                测试总体【{distInfo.name}】属于典型{distInfo.skewness > 1.5 ? '长尾重偏态分布' : '分布'}。在样本量 n={sampleSize} 时，均值抽样分布偏度为 {sim.skewness}，Shapiro p-value = {sim.shapiroPValue}。在实际保险理赔计算、金融风控 VaR 估计以及 A/B 测试中，切忌盲目套用正态分布高斯近似！若样本量不足，请优先使用 Bootstrapping 重抽样法。
              </p>
            </div>
          </div>
        </div>

        {/* Markdown Source Code Preview Card */}
        <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
            <span className="font-mono text-indigo-400 font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 6 维度 Markdown 诊断报告源码 (.md)
            </span>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              {copiedMd ? '已复制 Markdown 源码!' : '复制源码'}
            </button>
          </div>

          <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono leading-relaxed text-slate-300 max-h-56 overflow-y-auto whitespace-pre-wrap">
            {reportMarkdown}
          </pre>
        </div>
      </div>
    </div>
  );
};
