
export enum DistributionType {
  UNIFORM = '均匀分布',
  EXPONENTIAL = '指数分布',
  NORMAL = '正态分布',
  BIMODAL = '双峰分布',
  BINOMIAL = '二项分布',
  POISSON = '泊松分布'
}

export interface SimulationResult {
  parentData: number[];
  samplingMeans: number[];
  theoreticalMean: number;
  theoreticalStd: number;
  observedMean: number;
  observedStd: number;
}

export interface ChartDataItem {
  bin: string;
  count: number;
}

export type AIModelType = 'gemini-3-flash-preview' | 'deepseek-r1';
