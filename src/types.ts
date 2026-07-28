export type DistributionType =
  | 'uniform'
  | 'binomial'
  | 'poisson'
  | 'geometric'
  | 'bernoulli_skewed'
  | 'exponential'
  | 'pareto'
  | 'lognormal'
  | 'bimodal'
  | 'asymmetric_bimodal'
  | 'tri_mixture'
  | 'cauchy';

export interface DistributionInfo {
  id: DistributionType;
  name: string;
  shortName: string;
  category: string;
  skewness: number;
  kurtosis: number;
  description: string;
  formula: string;
  cltBehavior: string;
  recommendedN: number;
  color: string;
}

export interface HistogramBin {
  binLabel: string;
  binCenter: number;
  frequency: number;
  normalDensity: number;
  count: number;
}

export interface QQPoint {
  theoreticalQuantile: number;
  sampleQuantile: number;
}

export interface SimulationResult {
  distributionId: DistributionType;
  sampleSize: number; // n
  numSimulations: number; // K
  sampleMeans: number[];
  observedMean: number;
  observedStd: number;
  theoreticalMean: number;
  theoreticalStd: number;
  skewness: number;
  kurtosis: number;
  shapiroPValue: number;
  fitScore: number; // 0 to 100%
  histogram: HistogramBin[];
  qqData: QQPoint[];
}

export type ScenarioType = 'insurance' | 'elevator' | 'call_center';

export interface ClassicScenario {
  id: ScenarioType;
  title: string;
  subtitle: string;
  industry: string;
  description: string;
  skewnessNote: string;
  n30Pitfall: string;
  bootstrapSolution: string;
  defaultSampleSize: number;
  dataGenerator: (count: number) => number[];
  unit: string;
}

export interface BootstrapResult {
  originalSample: number[];
  bootstrapMeans: number[];
  originalMean: number;
  originalStd: number;
  ci95Percentile: [number, number];
  ci95Normal: [number, number];
  underestimationPercent: number;
}

export interface CodeSandboxState {
  n: number;
  simulations: number;
  distribution: DistributionType;
  customCode: string;
  executionOutput: string | null;
  isRunning: boolean;
  testPassed: boolean;
  pvalue: number;
}

export type TabModule =
  | 'guide'
  | 'morphing'
  | 'cases'
  | 'diagnostic'
  | 'python'
  | 'ai'
  | 'report';
