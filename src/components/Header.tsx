import React from 'react';
import { TabModule, DistributionType } from '../types';
import { DISTRIBUTIONS } from '../lib/mathStats';
import {
  BookOpen,
  Activity,
  Briefcase,
  AlertTriangle,
  Code2,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabModule;
  setActiveTab: (tab: TabModule) => void;
  sampleSize: number;
  currentDist: DistributionType;
  fitScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  sampleSize,
  currentDist,
  fitScore,
}) => {
  const tabs: { id: TabModule; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'guide', label: '1. 知识引导', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'morphing', label: '2. 动态演化', icon: <Activity className="w-4 h-4" />, badge: '核心动效' },
    { id: 'cases', label: '3. 经典案例', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'diagnostic', label: '4. 拟合诊断', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'python', label: '5. Python验证', icon: <Code2 className="w-4 h-4" /> },
    { id: 'ai', label: '6. AI洞察', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'report', label: '7. 报告导出', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  const distInfo = DISTRIBUTIONS[currentDist];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Brand & Title */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-sm">
                CLT
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
                中心极限定理与高斯涌现智能实验室
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                v2.0 学术版
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              破除“$n \ge 30$ 绝对化”误区 · 总体偏度与正态收敛速度关系定量分析
            </p>
          </div>

          {/* Quick Status Slices */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Current Distribution Slice */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="text-slate-400">当前总体:</span>
              <span className="font-semibold text-slate-700">{distInfo.shortName}</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: distInfo.color }}
              />
            </div>

            {/* Sample Size n Slice */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="text-slate-400">样本量 n:</span>
              <span className="font-mono font-bold text-indigo-600">{sampleSize}</span>
              {sampleSize >= distInfo.recommendedN ? (
                <span className="text-emerald-600 font-medium text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  超标达合
                </span>
              ) : (
                <span className="text-amber-600 font-medium text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  建议 n≥{distInfo.recommendedN}
                </span>
              )}
            </div>

            {/* Fit Score Slice */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="text-slate-400">正态拟合度:</span>
              <span
                className={`font-mono font-bold ${
                  fitScore >= 85
                    ? 'text-emerald-600'
                    : fitScore >= 60
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {fitScore}%
              </span>
              {fitScore >= 80 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Slices */}
        <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200/70 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
