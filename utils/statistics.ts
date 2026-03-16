
import { DistributionType } from '../types';

// 获取总体分布的理论参数
export const getTheoreticalParams = (type: DistributionType) => {
  switch (type) {
    case DistributionType.UNIFORM: return { mu: 0.5, sigma: Math.sqrt(1/12) };
    case DistributionType.EXPONENTIAL: return { mu: 1, sigma: 1 };
    case DistributionType.NORMAL: return { mu: 0, sigma: 1 };
    case DistributionType.BIMODAL: return { mu: 0, sigma: 2.06 }; // 近似值
    case DistributionType.BINOMIAL: return { mu: 10, sigma: Math.sqrt(5) }; // n=20, p=0.5
    case DistributionType.POISSON: return { mu: 4, sigma: 2 }; // lambda=4
    default: return { mu: 0, sigma: 1 };
  }
};

export const generateParentData = (type: DistributionType, count: number): number[] => {
  const data: number[] = [];
  for (let i = 0; i < count; i++) {
    switch (type) {
      case DistributionType.UNIFORM: data.push(Math.random()); break;
      case DistributionType.EXPONENTIAL: data.push(-Math.log(1 - Math.random())); break;
      case DistributionType.NORMAL: data.push(boxMullerTransform()); break;
      case DistributionType.BIMODAL: data.push(Math.random() > 0.5 ? boxMullerTransform() * 0.5 - 2 : boxMullerTransform() * 0.5 + 2); break;
      case DistributionType.BINOMIAL:
        let successes = 0;
        for (let j = 0; j < 20; j++) if (Math.random() < 0.5) successes++;
        data.push(successes);
        break;
      case DistributionType.POISSON:
        const L = Math.exp(-4);
        let k = 0, prob = 1;
        do { k++; prob *= Math.random(); } while (prob > L);
        data.push(k - 1);
        break;
    }
  }
  return data;
};

const boxMullerTransform = (): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export const runSimulation = (type: DistributionType, sampleSize: number, numSamples: number) => {
  const samplingMeans: number[] = [];
  const ciList: { low: number; high: number; contains: boolean }[] = [];
  const { mu } = getTheoreticalParams(type);
  
  let sumSE = 0;
  let firstObservedSE = 0;

  for (let i = 0; i < numSamples; i++) {
    const sample = generateParentData(type, sampleSize);
    const mean = sample.reduce((a, b) => a + b, 0) / sampleSize;
    samplingMeans.push(mean);

    // 计算样本标准差 s 和标准误 SE = s / sqrt(n)
    let s = 0;
    if (sampleSize > 1) {
      const variance = sample.reduce((a, b) => a + (b - mean) ** 2, 0) / (sampleSize - 1);
      s = Math.sqrt(variance);
    }
    const se = s / Math.sqrt(sampleSize);
    sumSE += se;
    if (i === 0) firstObservedSE = se;

    // 计算 95% 置信区间 (使用样本标准差作为近似)
    if (i < 100) { // 只记录前 100 个用于可视化
      const margin = 1.96 * se;
      ciList.push({
        low: mean - margin,
        high: mean + margin,
        contains: (mean - margin) <= mu && (mean + margin) >= mu
      });
    }
  }

  const observedMean = samplingMeans.reduce((a, b) => a + b, 0) / numSamples;
  const m2 = samplingMeans.reduce((a, b) => a + (b - observedMean) ** 2, 0) / numSamples;
  const m3 = samplingMeans.reduce((a, b) => a + (b - observedMean) ** 3, 0) / numSamples;
  const m4 = samplingMeans.reduce((a, b) => a + (b - observedMean) ** 4, 0) / numSamples;
  
  const skewness = m2 === 0 ? 0 : m3 / Math.pow(m2, 1.5);
  const kurtosis = m2 === 0 ? 0 : (m4 / Math.pow(m2, 2)) - 3; // Excess Kurtosis
  
  return {
    samplingMeans,
    observedMean,
    observedStd: sumSE / numSamples, // 用户要求：每次SE的平均数
    firstObservedSE,
    skewness,
    kurtosis,
    ciList
  };
};

export const binData = (data: number[], binCount: number = 30) => {
  if (data.length === 0) return [];
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min;
  const step = range === 0 ? 1 : range / binCount;
  const bins = Array(binCount).fill(0);
  data.forEach(val => {
    const index = Math.min(Math.floor((val - min) / step), binCount - 1);
    bins[index >= 0 ? index : 0]++;
  });
  return bins.map((count, i) => ({ bin: (min + i * step).toFixed(2), count }));
};
