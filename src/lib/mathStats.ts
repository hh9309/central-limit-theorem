import {
  DistributionType,
  DistributionInfo,
  HistogramBin,
  QQPoint,
  SimulationResult,
  BootstrapResult,
} from '../types';

export const DISTRIBUTIONS: Record<DistributionType, DistributionInfo> = {
  uniform: {
    id: 'uniform',
    name: '连续均匀分布 U(0,1)',
    shortName: '均匀分布',
    category: '连续对称 (Continuous Symmetric)',
    skewness: 0,
    kurtosis: -1.2,
    description: '概率密度在区间内恒定，极轻度平顶分布，无长尾效应。',
    formula: 'f(x) = 1, \\quad x \\in [0, 1]',
    cltBehavior: '极速收敛：n = 5 时即可完美正态化，极罕见离群误差。',
    recommendedN: 5,
    color: '#0284c7', // Sky blue
  },
  binomial: {
    id: 'binomial',
    name: '对称二项分布 B(10, 0.5)',
    shortName: '对称二项',
    category: '离散分布 (Discrete)',
    skewness: 0,
    kurtosis: -0.2,
    description: '硬币抛掷模型，离散取值点对称分布，无偏移方向。',
    formula: 'P(X=k) = \\binom{10}{k} 0.5^k 0.5^{10-k}',
    cltBehavior: '快速收敛：n = 15 时离散直方图包络线逼近高斯钟形。',
    recommendedN: 15,
    color: '#0d9488', // Teal
  },
  poisson: {
    id: 'poisson',
    name: '泊松分布 Poisson(λ=3)',
    shortName: '泊松分布',
    category: '离散分布 (Discrete)',
    skewness: 0.58,
    kurtosis: 0.33,
    description: '单位时间内随机事件发生次数（如呼叫中心到达量），离散右偏。',
    formula: 'P(X=k) = \\frac{3^k e^{-3}}{k!}',
    cltBehavior: '中快速收敛：n = 20 时即可有效平滑离散阶梯并正态化。',
    recommendedN: 20,
    color: '#10b981', // Emerald
  },
  geometric: {
    id: 'geometric',
    name: '几何分布 Geom(p=0.3)',
    shortName: '几何分布',
    category: '离散分布 (Discrete)',
    skewness: 2.03,
    kurtosis: 6.13,
    description: '首次成功所需尝试次数（如故障重试），离散高右偏特征。',
    formula: 'P(X=k) = (1-0.3)^{k-1} 0.3',
    cltBehavior: '中慢速收敛：由于离散高偏态，至少需 n ≥ 75 消除非对称性。',
    recommendedN: 75,
    color: '#f59e0b', // Amber
  },
  bernoulli_skewed: {
    id: 'bernoulli_skewed',
    name: '偏斜伯努利分布 Bern(p=0.1)',
    shortName: '稀有事件',
    category: '离散分布 (Discrete)',
    skewness: 2.67,
    kurtosis: 5.11,
    description: '罕见事件触发概率（如网络欺诈/违约率），离散双值极强偏态。',
    formula: 'P(X=1) = 0.1, \\quad P(X=0) = 0.9',
    cltBehavior: '慢速收敛：n < 50 时展现严重离散跳跃，需 n ≥ 100 消除尾部误差。',
    recommendedN: 100,
    color: '#e11d48', // Rose
  },
  exponential: {
    id: 'exponential',
    name: '指数分布 Exp(λ=0.5)',
    shortName: '指数分布',
    category: '连续偏态 (Continuous Skewed)',
    skewness: 2.0,
    kurtosis: 6.0,
    description: '常见于排队等待时间、设备寿命，概率密度的尾部向右延伸。',
    formula: 'f(x) = 0.5 e^{-0.5 x}, \\quad x \\ge 0',
    cltBehavior: '中速收敛：n = 30 时右侧仍有显著残余偏斜，至少需 n ≥ 80。',
    recommendedN: 80,
    color: '#d97706', // Amber dark
  },
  pareto: {
    id: 'pareto',
    name: '帕累托/理赔极值分布 Pareto(α=3)',
    shortName: '极值理赔',
    category: '连续偏态 (Continuous Skewed)',
    skewness: 3.8,
    kurtosis: 18.5,
    description: '保险大额理赔、财富分布，典型的长尾高偏态巨灾风险数据。',
    formula: 'f(x) = \\frac{3 \\cdot 1.5^3}{x^4}, \\quad x \\ge 1.5',
    cltBehavior: '极慢收敛：n = 30 时严重右倾，强行使用正态会导致极大风险漏估，需 n ≥ 150+。',
    recommendedN: 150,
    color: '#dc2626', // Red
  },
  lognormal: {
    id: 'lognormal',
    name: '对数正态分布 LN(μ=0, σ=0.75)',
    shortName: '对数正态',
    category: '连续偏态 (Continuous Skewed)',
    skewness: 2.8,
    kurtosis: 15.2,
    description: '金融资产收益、薪资收入与生物生长的典型右偏连续分布。',
    formula: 'f(x) = \\frac{1}{x \\cdot 0.75 \\sqrt{2\\pi}} e^{-\\frac{(\\ln x)^2}{2 \\cdot 0.75^2}}',
    cltBehavior: '慢速收敛：n = 30 时仍有长右尾残余，需 n ≥ 100 趋于对称正态。',
    recommendedN: 100,
    color: '#ea580c', // Orange
  },
  bimodal: {
    id: 'bimodal',
    name: '对称双峰混合高斯分布',
    shortName: '对称双峰',
    category: '混合分布 (Mixtures)',
    skewness: 0,
    kurtosis: -1.5,
    description: '由两组不同均值的高斯群体（如男女身高混合）叠加形成的双峰分布。',
    formula: '0.5 N(2, 0.36) + 0.5 N(8, 0.36)',
    cltBehavior: '波浪形收敛：n = 10 时仍可见双峰凹槽，n = 30 时融合为标准单峰高斯。',
    recommendedN: 30,
    color: '#8b5cf6', // Violet
  },
  asymmetric_bimodal: {
    id: 'asymmetric_bimodal',
    name: '非对称双峰混合分布',
    shortName: '非对称双峰',
    category: '混合分布 (Mixtures)',
    skewness: 1.25,
    kurtosis: 0.8,
    description: '两组不平衡群体混合（70% 主群体 + 30% 异常离群群体）。',
    formula: '0.7 N(2, 0.36) + 0.3 N(8, 1.44)',
    cltBehavior: '复杂收敛：兼具双峰凹槽与偏态右尾，推荐 n ≥ 50 平滑凹槽。',
    recommendedN: 50,
    color: '#6366f1', // Indigo
  },
  tri_mixture: {
    id: 'tri_mixture',
    name: '三峰混合高斯分布',
    shortName: '三峰混合',
    category: '混合分布 (Mixtures)',
    skewness: 0.15,
    kurtosis: -1.3,
    description: '由三组群体（如高中低三挡消费客群）叠加构成的多峰混合形态。',
    formula: '0.35 N(1, 0.16) + 0.35 N(5, 0.16) + 0.3 N(9, 0.16)',
    cltBehavior: '多波谷收敛：n = 15 时三峰融合为宽顶，n = 40 时圆润呈现高斯钟形。',
    recommendedN: 40,
    color: '#a855f7', // Purple
  },
  cauchy: {
    id: 'cauchy',
    name: '柯西分布 Cauchy(0, 1) [失效边界]',
    shortName: '柯西分布',
    category: '定理失效 (CLT Breakdown)',
    skewness: NaN,
    kurtosis: NaN,
    description: '肥尾分布的极极端情况，期望与方差均不存在（无穷大）。',
    formula: 'f(x) = \\frac{1}{\\pi (1 + x^2)}',
    cltBehavior: '永远无法收敛！即使 n = 100,000，样本均值分布仍为纯柯西分布。',
    recommendedN: Infinity,
    color: '#475569', // Slate
  },
};

// Box-Muller transform for standard normal random numbers
export function randomStandardNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Generate a single random sample from specified population distribution
export function generatePopulationSample(type: DistributionType): number {
  switch (type) {
    case 'uniform':
      return Math.random(); // U(0,1)

    case 'binomial': {
      let successes = 0;
      for (let i = 0; i < 10; i++) {
        if (Math.random() < 0.5) successes++;
      }
      return successes; // B(10, 0.5)
    }

    case 'poisson': {
      const L = Math.exp(-3);
      let k = 0;
      let p = 1;
      do {
        k++;
        p *= Math.random();
      } while (p > L);
      return k - 1;
    }

    case 'geometric': {
      const u = Math.random();
      return Math.floor(Math.log(1 - u) / Math.log(1 - 0.3)) + 1;
    }

    case 'bernoulli_skewed': {
      return Math.random() < 0.1 ? 1 : 0;
    }

    case 'exponential': {
      // Exp(lambda = 0.5), mean = 2
      const u = Math.random();
      return -Math.log(1 - u) / 0.5;
    }

    case 'pareto': {
      // Pareto(alpha=3, xm=1.5)
      const u = Math.random();
      return 1.5 / Math.pow(1 - u, 1 / 3);
    }

    case 'lognormal': {
      // LN(mu=0, sigma=0.75)
      const z = randomStandardNormal();
      return Math.exp(0.75 * z);
    }

    case 'bimodal': {
      // 50% N(2, 0.6^2) + 50% N(8, 0.6^2)
      const isFirst = Math.random() < 0.5;
      const z = randomStandardNormal();
      return isFirst ? 2 + 0.6 * z : 8 + 0.6 * z;
    }

    case 'asymmetric_bimodal': {
      // 70% N(2, 0.6^2) + 30% N(8, 1.2^2)
      const isFirst = Math.random() < 0.7;
      const z = randomStandardNormal();
      return isFirst ? 2 + 0.6 * z : 8 + 1.2 * z;
    }

    case 'tri_mixture': {
      // 35% N(1, 0.4^2) + 35% N(5, 0.4^2) + 30% N(9, 0.4^2)
      const r = Math.random();
      const z = randomStandardNormal();
      if (r < 0.35) return 1 + 0.4 * z;
      if (r < 0.70) return 5 + 0.4 * z;
      return 9 + 0.4 * z;
    }

    case 'cauchy': {
      // Cauchy(0,1) = tan(pi * (u - 0.5))
      const u = Math.random();
      return Math.tan(Math.PI * (u - 0.5));
    }
  }
}

// Theoretical population parameters
export function getTheoreticalParams(type: DistributionType): { mean: number; std: number } {
  switch (type) {
    case 'uniform':
      return { mean: 0.5, std: Math.sqrt(1 / 12) };
    case 'binomial':
      return { mean: 5, std: Math.sqrt(2.5) };
    case 'poisson':
      return { mean: 3, std: Math.sqrt(3) };
    case 'geometric':
      return { mean: 1 / 0.3, std: Math.sqrt(0.7 / 0.09) };
    case 'bernoulli_skewed':
      return { mean: 0.1, std: Math.sqrt(0.09) };
    case 'exponential':
      return { mean: 2, std: 2 };
    case 'pareto': {
      const mean = 2.25;
      const variance = 1.6875;
      return { mean, std: Math.sqrt(variance) };
    }
    case 'lognormal': {
      // mu=0, sigma=0.75 => mean = exp(0.28125) ≈ 1.3248, var = (exp(0.5625) - 1)*exp(0.5625) ≈ 1.3251
      const mean = Math.exp(0.28125);
      const variance = (Math.exp(0.5625) - 1) * Math.exp(0.5625);
      return { mean, std: Math.sqrt(variance) };
    }
    case 'bimodal':
      return { mean: 5, std: Math.sqrt(9.36) };
    case 'asymmetric_bimodal':
      return { mean: 3.8, std: Math.sqrt(8.244) };
    case 'tri_mixture':
      return { mean: 4.8, std: Math.sqrt(10.52) };
    case 'cauchy':
      return { mean: NaN, std: NaN };
  }
}

// Statistical metrics calculations
export function calculateMean(arr: number[]): number {
  if (arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
}

export function calculateStdDev(arr: number[], mean?: number): number {
  if (arr.length <= 1) return 0;
  const m = mean ?? calculateMean(arr);
  let sumSq = 0;
  for (let i = 0; i < arr.length; i++) {
    const diff = arr[i] - m;
    sumSq += diff * diff;
  }
  return Math.sqrt(sumSq / (arr.length - 1));
}

export function calculateSkewness(arr: number[], mean?: number, std?: number): number {
  if (arr.length < 3) return 0;
  const m = mean ?? calculateMean(arr);
  const s = std ?? calculateStdDev(arr, m);
  if (s === 0) return 0;
  let sumCubed = 0;
  for (let i = 0; i < arr.length; i++) {
    const diff = (arr[i] - m) / s;
    sumCubed += diff * diff * diff;
  }
  const n = arr.length;
  return (n / ((n - 1) * (n - 2))) * sumCubed;
}

export function calculateKurtosis(arr: number[], mean?: number, std?: number): number {
  if (arr.length < 4) return 0;
  const m = mean ?? calculateMean(arr);
  const s = std ?? calculateStdDev(arr, m);
  if (s === 0) return 0;
  let sumFourth = 0;
  for (let i = 0; i < arr.length; i++) {
    const diff = (arr[i] - m) / s;
    sumFourth += Math.pow(diff, 4);
  }
  const n = arr.length;
  // Excess kurtosis
  return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sumFourth - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
}

// Normal PDF
export function normalPDF(x: number, mean: number, std: number): number {
  if (std <= 0) return 0;
  const z = (x - mean) / std;
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
}

// Approximation of Inverse Normal Cumulative Distribution Function (Acklam's algorithm)
export function inverseNormalCDF(p: number): number {
  if (p <= 0 || p >= 1) return p <= 0 ? -4 : 4;
  if (p < 0.02425) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((-7.784695709041462e-3 * q - 0.3223964580411365) * q - 2.400758277161838) * q -
        2.549732539343734) *
        q +
        4.374664141464968) *
        q +
        2.938163982698783) /
      ((((7.784695709041462e-3 * q + 0.3224671290700398) * q + 2.445134137142996) * q +
        3.754408661907416) *
        q +
        1)
    );
  }
  if (p > 0.97575) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((-7.784695709041462e-3 * q - 0.3223964580411365) * q - 2.400758277161838) * q -
        2.549732539343734) *
        q +
        4.374664141464968) *
        q +
        2.938163982698783) /
      ((((7.784695709041462e-3 * q + 0.3224671290700398) * q + 2.445134137142996) * q +
        3.754408661907416) *
        q +
        1)
    );
  }
  const q = p - 0.5;
  const r = q * q;
  return (
    (((((-3.969683028665376e1 * r + 2.209460984245205e2) * r - 2.759285104469687e2) * r +
      1.38357751867269e2) *
      r -
      3.066479806614716e1) *
      r +
      2.506628277459239) *
    q /
    (((((-5.447609879822406e1 * r + 1.615858368580409e2) * r - 1.556989798598866e2) * r +
      6.680131188771972e1) *
      r -
      1.328068155288572e1) *
      r +
      1)
  );
}

// Approximate Shapiro-Wilk p-value estimation for sampling means
export function approximateShapiroPValue(data: number[], skewness: number, sampleSize: number): number {
  if (data.length === 0) return 0;
  const absSkew = Math.abs(skewness);

  // If skewness is near 0 and sample size is reasonably normal, high p-value
  // Formula for p-value proxy based on skewness & sample size relative to skewness
  const residualSkew = absSkew / Math.sqrt(sampleSize);
  if (residualSkew < 0.08) {
    return Math.min(0.95, 0.5 + Math.random() * 0.4);
  } else if (residualSkew < 0.25) {
    return Math.max(0.06, 0.45 - residualSkew * 1.2);
  } else if (residualSkew < 0.5) {
    return Math.max(0.01, 0.08 - (residualSkew - 0.25) * 0.25);
  } else {
    return Math.max(0.0001, 0.005 / (1 + residualSkew * 5));
  }
}

// Core CLT Simulation Engine
export function runCLTSimulation(
  distributionId: DistributionType,
  sampleSize: number,
  numSimulations: number = 10000
): SimulationResult {
  const sampleMeans: number[] = new Array(numSimulations);

  // Special handle Cauchy breakdown
  if (distributionId === 'cauchy') {
    for (let k = 0; k < numSimulations; k++) {
      let sum = 0;
      for (let i = 0; i < sampleSize; i++) {
        sum += generatePopulationSample('cauchy');
      }
      // Trim extreme spikes for chart display sanity while keeping raw Cauchy nature
      const rawMean = sum / sampleSize;
      sampleMeans[k] = rawMean;
    }

    // Filter outliers for histogram plotting bounds
    const sorted = [...sampleMeans].sort((a, b) => a - b);
    const p5 = sorted[Math.floor(numSimulations * 0.02)];
    const p95 = sorted[Math.floor(numSimulations * 0.98)];
    const filtered = sampleMeans.filter((m) => m >= p5 && m <= p95);

    const obsMean = calculateMean(filtered);
    const obsStd = calculateStdDev(filtered, obsMean);

    // Build histogram for filtered cauchy
    const minVal = p5;
    const maxVal = p95;
    const numBins = 30;
    const binWidth = (maxVal - minVal) / numBins || 1;

    const bins: HistogramBin[] = [];
    for (let i = 0; i < numBins; i++) {
      const bStart = minVal + i * binWidth;
      const bEnd = bStart + binWidth;
      const bCenter = (bStart + bEnd) / 2;
      const count = filtered.filter((v) => v >= bStart && v < bEnd).length;
      const freq = count / filtered.length;
      bins.push({
        binLabel: bCenter.toFixed(2),
        binCenter: Number(bCenter.toFixed(2)),
        frequency: Number(freq.toFixed(4)),
        normalDensity: 0, // Normal fit fails completely
        count,
      });
    }

    // Generate Q-Q plot points for Cauchy (sample quantile vs theoretical normal)
    const sortedFiltered = [...filtered].sort((a, b) => a - b);
    const qqData: QQPoint[] = [];
    const qqSteps = 50;
    const fStd = obsStd || 1;
    for (let i = 1; i < qqSteps; i++) {
      const p = i / qqSteps;
      const theoQuantile = inverseNormalCDF(p);
      const idx = Math.floor(p * sortedFiltered.length);
      const rawVal = sortedFiltered[idx];
      const stdSampleQuantile = (rawVal - obsMean) / fStd;
      qqData.push({
        theoreticalQuantile: Number(theoQuantile.toFixed(3)),
        sampleQuantile: Number(stdSampleQuantile.toFixed(3)),
      });
    }

    return {
      distributionId,
      sampleSize,
      numSimulations,
      sampleMeans,
      observedMean: obsMean,
      observedStd: obsStd,
      theoreticalMean: NaN,
      theoreticalStd: NaN,
      skewness: NaN,
      kurtosis: NaN,
      shapiroPValue: 0.00001,
      fitScore: 0,
      histogram: bins,
      qqData,
    };
  }

  // Normal CLT calculation
  const theo = getTheoreticalParams(distributionId);
  const theoMean = theo.mean;
  const theoStd = theo.std / Math.sqrt(sampleSize);

  for (let k = 0; k < numSimulations; k++) {
    let sum = 0;
    for (let i = 0; i < sampleSize; i++) {
      sum += generatePopulationSample(distributionId);
    }
    sampleMeans[k] = sum / sampleSize;
  }

  const obsMean = calculateMean(sampleMeans);
  const obsStd = calculateStdDev(sampleMeans, obsMean);
  const skew = calculateSkewness(sampleMeans, obsMean, obsStd);
  const kurt = calculateKurtosis(sampleMeans, obsMean, obsStd);
  const pVal = approximateShapiroPValue(sampleMeans, skew, sampleSize);

  // Compute Histogram Bins
  const minVal = Math.min(theoMean - 3.8 * theoStd, obsMean - 3.8 * obsStd);
  const maxVal = Math.max(theoMean + 3.8 * theoStd, obsMean + 3.8 * obsStd);
  const numBins = 32;
  const binWidth = (maxVal - minVal) / numBins;

  const histogram: HistogramBin[] = [];
  for (let i = 0; i < numBins; i++) {
    const bStart = minVal + i * binWidth;
    const bEnd = bStart + binWidth;
    const bCenter = (bStart + bEnd) / 2;

    const count = sampleMeans.filter((v) => v >= bStart && v < bEnd).length;
    const frequency = count / numSimulations;
    // Scale density to frequency
    const normalDensity = normalPDF(bCenter, theoMean, theoStd) * binWidth;

    histogram.push({
      binLabel: bCenter.toFixed(2),
      binCenter: Number(bCenter.toFixed(2)),
      frequency: Number(frequency.toFixed(4)),
      normalDensity: Number(normalDensity.toFixed(4)),
      count,
    });
  }

  // Compute Q-Q plot points (sample quantiles vs standard normal theoretical quantiles)
  const sortedMeans = [...sampleMeans].sort((a, b) => a - b);
  const qqData: QQPoint[] = [];
  const qqSteps = 50;

  for (let i = 1; i < qqSteps; i++) {
    const p = i / qqSteps;
    const theoQuantile = inverseNormalCDF(p); // Standard N(0,1)
    const idx = Math.floor(p * sortedMeans.length);
    const rawVal = sortedMeans[idx];
    // Standardize raw sample quantile
    const stdSampleQuantile = (rawVal - obsMean) / (obsStd || 1);

    qqData.push({
      theoreticalQuantile: Number(theoQuantile.toFixed(3)),
      sampleQuantile: Number(stdSampleQuantile.toFixed(3)),
    });
  }

  // Normality Fitness Score (0 - 100%)
  const skewPenalty = Math.min(60, Math.abs(skew) * 35);
  const kurtPenalty = Math.min(30, Math.abs(kurt) * 10);
  const fitScore = Math.max(5, Math.min(100, Math.round(100 - skewPenalty - kurtPenalty)));

  return {
    distributionId,
    sampleSize,
    numSimulations,
    sampleMeans,
    observedMean: Number(obsMean.toFixed(4)),
    observedStd: Number(obsStd.toFixed(4)),
    theoreticalMean: Number(theoMean.toFixed(4)),
    theoreticalStd: Number(theoStd.toFixed(4)),
    skewness: Number(skew.toFixed(3)),
    kurtosis: Number(kurt.toFixed(3)),
    shapiroPValue: Number(pVal.toFixed(4)),
    fitScore,
    histogram,
    qqData,
  };
}

// Bootstrap Resampling Engine
export function runBootstrap(
  originalData: number[],
  numBootstraps: number = 2000
): BootstrapResult {
  const N = originalData.length;
  const origMean = calculateMean(originalData);
  const origStd = calculateStdDev(originalData, origMean);

  const bootstrapMeans: number[] = new Array(numBootstraps);

  for (let b = 0; b < numBootstraps; b++) {
    let sum = 0;
    for (let i = 0; i < N; i++) {
      const randomIdx = Math.floor(Math.random() * N);
      sum += originalData[randomIdx];
    }
    bootstrapMeans[b] = sum / N;
  }

  const sortedBoot = [...bootstrapMeans].sort((a, b) => a - b);
  const lowerPercentile = sortedBoot[Math.floor(0.025 * numBootstraps)];
  const upperPercentile = sortedBoot[Math.floor(0.975 * numBootstraps)];

  // Standard Normal CI assumption: mean +/- 1.96 * (s / sqrt(N))
  const se = origStd / Math.sqrt(N);
  const lowerNormal = origMean - 1.96 * se;
  const upperNormal = origMean + 1.96 * se;

  // Calculate percentage error in upper percentile risk estimation
  const upperDiff = Math.abs(upperPercentile - upperNormal);
  const underestimationPercent = Number(((upperDiff / origMean) * 100).toFixed(1));

  return {
    originalSample: originalData,
    bootstrapMeans,
    originalMean: Number(origMean.toFixed(2)),
    originalStd: Number(origStd.toFixed(2)),
    ci95Percentile: [Number(lowerPercentile.toFixed(2)), Number(upperPercentile.toFixed(2))],
    ci95Normal: [Number(lowerNormal.toFixed(2)), Number(upperNormal.toFixed(2))],
    underestimationPercent,
  };
}
