import React, { useState, useMemo } from 'react';
import { TabModule, DistributionType } from './types';
import { runCLTSimulation } from './lib/mathStats';
import { Header } from './components/Header';
import { MathFormula } from './components/MathFormula';
import { ConceptualGuide } from './components/ConceptualGuide';
import { MorphingSandbox } from './components/MorphingSandbox';
import { ClassicCasesBootstrap } from './components/ClassicCasesBootstrap';
import { DiagnosticBreakdown } from './components/DiagnosticBreakdown';
import { PythonSandbox } from './components/PythonSandbox';
import { AiInsights } from './components/AiInsights';
import { ExportReport } from './components/ExportReport';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabModule>('guide');
  const [currentDist, setCurrentDist] = useState<DistributionType>('exponential');
  const [sampleSize, setSampleSize] = useState<number>(30);
  const [simCounter, setSimCounter] = useState<number>(0);

  // Run live simulation whenever distribution, sample size, or sim counter changes
  const simResult = useMemo(() => {
    return runCLTSimulation(currentDist, sampleSize, 10000);
  }, [currentDist, sampleSize, simCounter]);

  const handleRefreshSimulation = () => {
    setSimCounter((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sampleSize={sampleSize}
        currentDist={currentDist}
        fitScore={simResult.fitScore}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'guide' && <ConceptualGuide />}

            {activeTab === 'morphing' && (
              <MorphingSandbox
                currentDist={currentDist}
                setCurrentDist={setCurrentDist}
                sampleSize={sampleSize}
                setSampleSize={setSampleSize}
                simResult={simResult}
                onRefreshSimulation={handleRefreshSimulation}
              />
            )}

            {activeTab === 'cases' && <ClassicCasesBootstrap />}

            {activeTab === 'diagnostic' && (
              <DiagnosticBreakdown
                currentDist={currentDist}
                setCurrentDist={setCurrentDist}
                sampleSize={sampleSize}
                setSampleSize={setSampleSize}
              />
            )}

            {activeTab === 'python' && <PythonSandbox />}

            {activeTab === 'ai' && (
              <AiInsights currentDist={currentDist} sampleSize={sampleSize} />
            )}

            {activeTab === 'report' && (
              <ExportReport currentDist={currentDist} sampleSize={sampleSize} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <strong>中心极限定理与高斯涌现智能实验室</strong>
            <span>·</span>
            <span>破除“<MathFormula tex="n \ge 30" /> 绝对化”误区</span>
          </div>
          <div className="text-slate-400">
            Powered by Gemini 3.6 Flash & SciPy Engine · 界面淡雅切片布局
          </div>
        </div>
      </footer>
    </div>
  );
}
