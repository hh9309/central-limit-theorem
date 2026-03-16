
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DistributionType, AIModelType } from './types';
import { generateParentData, runSimulation, getTheoreticalParams } from './utils/statistics';
import DistributionChart from './components/DistributionChart';
import ConvergenceChart from './components/ConvergenceChart';
import PrinciplesModule from './components/PrinciplesModule';
import TheoryModule from './components/TheoryModule';
import { getStatisticalInsight } from './services/geminiService';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const App: React.FC = () => {
  const [distType, setDistType] = useState<DistributionType>(DistributionType.UNIFORM);
  const [sampleSize, setSampleSize] = useState<number>(30);
  const [numSamples, setNumSamples] = useState<number>(1000);
  
  const [parentData, setParentData] = useState<number[]>([]);
  const [samplingMeans, setSamplingMeans] = useState<number[]>([]);
  const [ciData, setCiData] = useState<{ low: number; high: number; contains: boolean }[]>([]);
  const [stats, setStats] = useState({ mean: 0, std: 0, skewness: 0, kurtosis: 0, firstObservedSE: 0 });
  const [convergenceData, setConvergenceData] = useState<{ n: number; theoretical: number; observed: number }[]>([]);
  
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModelType | null>(null);
  const [geminiKey, setGeminiKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [savedGeminiKey, setSavedGeminiKey] = useState('');
  const [savedDeepseekKey, setSavedDeepseekKey] = useState('');

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [chatHistory, isAiLoading]);

  const simulate = useCallback(() => {
    const parent = generateParentData(distType, 2000);
    const result = runSimulation(distType, sampleSize, numSamples);
    setParentData(parent);
    setSamplingMeans(result.samplingMeans);
    setCiData(result.ciList);
    setStats({ 
      mean: result.observedMean, 
      std: result.observedStd,
      firstObservedSE: result.firstObservedSE,
      skewness: result.skewness,
      kurtosis: result.kurtosis
    });
  }, [distType, sampleSize, numSamples]);

  useEffect(() => { simulate(); }, [simulate]);

  const calculateConvergence = useCallback(() => {
    const { sigma } = getTheoreticalParams(distType);
    const data = [];
    const nValues = [2, 5, 10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 180, 200];
    
    for (const n of nValues) {
      const theoreticalSE = sigma / Math.sqrt(n);
      const miniNumSamples = 300; 
      let sumSE = 0;
      for (let i = 0; i < miniNumSamples; i++) {
        const sample = generateParentData(distType, n);
        const mean = sample.reduce((a, b) => a + b, 0) / n;
        
        let s = 0;
        if (n > 1) {
          const variance = sample.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1);
          s = Math.sqrt(variance);
        }
        sumSE += s / Math.sqrt(n);
      }
      
      data.push({
        n,
        theoretical: parseFloat(theoreticalSE.toFixed(4)),
        observed: parseFloat((sumSE / miniNumSamples).toFixed(4))
      });
    }
    setConvergenceData(data);
  }, [distType]);

  useEffect(() => {
    calculateConvergence();
  }, [calculateConvergence]);

  const handleAskAi = async (question?: string) => {
    const query = question || userInput;
    if (!selectedModel || !query.trim()) return;
    const currentKey = selectedModel?.startsWith('gemini') 
      ? (savedGeminiKey || (process.env.GEMINI_API_KEY as string)) 
      : savedDeepseekKey;
    
    if (!currentKey) { 
      alert("请先在设置中保存 API Key"); 
      setShowSettings(true); 
      return; 
    }

    setChatHistory(prev => [...prev, { role: 'user', text: query }]);
    if (!question) setUserInput('');
    setIsAiLoading(true);
    
    try {
      const insight = await getStatisticalInsight(distType, sampleSize, numSamples, stats.mean, stats.std, currentKey, selectedModel, query);
      setChatHistory(prev => [...prev, { role: 'ai', text: insight }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "❌ 专家连接异常。" }]);
    } finally { setIsAiLoading(false); }
  };

  const saveKeys = () => {
    setSavedGeminiKey(geminiKey); 
    setSavedDeepseekKey(deepseekKey);
    setShowSettings(false);
  };

  const theoretical = getTheoreticalParams(distType);
  const ciSuccessCount = ciData.filter(d => d.contains).length;

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-700 pb-20">
      <nav className="bg-white/70 backdrop-blur-xl border-b border-indigo-50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
              <span className="text-white font-bold text-xl">Σ</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none text-slate-800">CLT 统计实验室</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Statistical Interactive Platform</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧控制栏与 AI 洞察 */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-400 rounded-full"></span> 实验控制中心
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-tighter">总体分布</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(DistributionType).map(type => (
                    <button key={type} onClick={() => setDistType(type)} className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${distType === type ? 'bg-indigo-500 text-white shadow-md shadow-indigo-100' : 'bg-white text-slate-500 hover:bg-indigo-50 border border-slate-100'}`}>{type}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-tighter">样本容量 n</label>
                    <span className="text-lg font-black text-indigo-500">{sampleSize}</span>
                  </div>
                  <input type="range" min="1" max="200" value={sampleSize} onChange={(e) => setSampleSize(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-400" />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-tighter">迭代模拟次数</label>
                    <span className="text-lg font-black text-indigo-500">{numSamples}</span>
                  </div>
                  <input type="range" min="100" max="5000" step="100" value={numSamples} onChange={(e) => setNumSamples(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-400" />
                </div>
              </div>
              <button onClick={simulate} className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all active:scale-[0.97] shadow-lg shadow-indigo-100">生成统计序列</button>
            </div>
          </div>

          {/* AI 洞察模块 - 莫兰迪色系优化 */}
          <div className="bg-white/40 backdrop-blur-2xl p-6 rounded-[2.5rem] text-slate-600 shadow-xl flex flex-col h-[560px] border border-white/60 overflow-hidden relative transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50">
            <div className="flex justify-between items-center mb-6 z-10">
              <h3 className="text-sm font-black flex items-center gap-2.5 text-slate-700 tracking-tight">
                <div className="w-2 h-2 bg-slate-400 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.05)]"></div> 
                智能统计专家
              </h3>
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className={`p-2 rounded-xl transition-all duration-300 ${showSettings ? 'bg-slate-200/50 text-slate-600 rotate-90' : 'hover:bg-slate-100 text-slate-400'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
              </button>
            </div>

            {showSettings ? (
              <div className="flex-1 space-y-5 animate-fade-in z-10">
                <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-white/80 backdrop-blur-sm space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-black ml-1 tracking-widest uppercase">Gemini 密钥</label>
                      <input type="password" placeholder="••••••••" value={geminiKey} onChange={e=>setGeminiKey(e.target.value)} className="w-full bg-white/60 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-200 outline-none text-slate-600 placeholder:text-slate-300 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-black ml-1 tracking-widest uppercase">DeepSeek 密钥</label>
                      <input type="password" placeholder="••••••••" value={deepseekKey} onChange={e=>setDeepseekKey(e.target.value)} className="w-full bg-white/60 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-200 outline-none text-slate-600 placeholder:text-slate-300 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-black ml-1 tracking-widest uppercase">模型引擎</label>
                    <div className="relative">
                      <select 
                        value={selectedModel || ''} 
                        onChange={(e) => setSelectedModel(e.target.value as AIModelType)}
                        className="w-full bg-white/60 border border-slate-100 rounded-2xl px-4 py-3 text-sm appearance-none focus:ring-2 focus:ring-slate-200 outline-none text-slate-600 cursor-pointer transition-all"
                      >
                        <option value="" disabled>请选择模型...</option>
                        <option value="gemini-3-flash-preview">Gemini 3 Flash (推荐)</option>
                        <option value="deepseek-r1">DeepSeek R1 (深度推理)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <button onClick={saveKeys} className="w-full bg-slate-700 text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] mt-2">保存配置</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full z-10">
                <div className="flex-1 overflow-y-auto pr-2 space-y-5 scrollbar-hide">
                  {(savedGeminiKey || savedDeepseekKey) && chatHistory.length === 0 && (
                    <div className="animate-fade-in space-y-5">
                      <div className="p-5 bg-slate-50/50 rounded-[2rem] border border-white/80">
                         <p className="text-[10px] font-black text-slate-500 uppercase mb-2.5 tracking-widest">当前活跃引擎</p>
                         <div className="flex items-center gap-3">
                           <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.4)]"></div>
                           <span className="text-xs font-bold text-slate-600">{selectedModel === 'gemini-3-flash-preview' ? 'Gemini 3 Flash' : 'DeepSeek R1'}</span>
                         </div>
                      </div>
                      {selectedModel && (
                        <div className="animate-slide-in">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-3.5 tracking-widest">快捷指令</p>
                          <div className="space-y-2.5">
                            {["深度评估正态性", "解释 SE 递减规律"].map(opt => (
                              <button key={opt} onClick={()=>handleAskAi(opt)} className="w-full text-left text-xs p-4 bg-white/60 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:shadow-slate-100 transition-all font-bold text-slate-500 group flex items-center justify-between">
                                <span>专家视角：{opt}</span>
                                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {chatHistory.map((m,i)=>(
                    <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[88%] p-4 rounded-[1.5rem] text-[13px] leading-relaxed shadow-sm ${m.role==='user'?'bg-slate-700 text-white rounded-tr-none':'bg-white/80 text-slate-600 rounded-tl-none border border-slate-100 font-medium'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="p-5 bg-white/40 rounded-[1.5rem] rounded-tl-none border border-white/60 flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 tracking-tight">正在构建统计洞察...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef}></div>
                </div>

                {selectedModel && (
                  <div className="mt-5 pt-5 border-t border-slate-100 relative">
                    <input 
                      type="text" 
                      value={userInput} 
                      onChange={e=>setUserInput(e.target.value)} 
                      onKeyDown={e=>e.key==='Enter'&&handleAskAi()} 
                      placeholder="探讨统计学深层逻辑..." 
                      className="w-full bg-white/60 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-slate-200 pr-14 text-slate-600 placeholder:text-slate-300 transition-all" 
                    />
                    <button onClick={()=>handleAskAi()} className="absolute right-3 top-[32px] p-2 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-90 shadow-md shadow-slate-200">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2z"/></svg>
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-slate-100/50 blur-3xl rounded-full pointer-events-none"></div>
          </div>

          <PrinciplesModule 
            distType={distType} 
            sampleSize={sampleSize} 
            metrics={{ skewness: stats.skewness, kurtosis: stats.kurtosis }} 
          />
        </aside>

        {/* 右侧主视窗 */}
        <section className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DistributionChart data={parentData} title="总体概率密度分布" color="#6366f1" />
            <DistributionChart 
              data={samplingMeans} 
              title={`抽样均值分布 (n=${sampleSize})`} 
              color="#10b981" 
              theoretical={{ mu: theoretical.mu, sigma: theoretical.sigma / Math.sqrt(sampleSize) }}
            />
          </div>

          <ConvergenceChart 
            data={convergenceData} 
            currentN={sampleSize} 
            currentObservedSE={stats.firstObservedSE} 
          />

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-white">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-8 flex items-center justify-between">
              实时统计摘要
              <div className="flex gap-4">
                <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">μ理论: {theoretical.mu.toFixed(2)}</span>
                <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">σ理论: {theoretical.sigma.toFixed(2)}</span>
              </div>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">观测样本均值 X̄</p>
                <p className="text-4xl font-black text-slate-700 font-mono tracking-tighter">{stats.mean.toFixed(4)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">观测标准误 SE</p>
                <p className="text-4xl font-black text-emerald-500 font-mono tracking-tighter">{stats.std.toFixed(4)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">正态收敛评估</p>
                <p className={`text-4xl font-black tracking-tighter ${sampleSize >= 30 ? 'text-indigo-500' : 'text-amber-400'}`}>
                  {sampleSize >= 100 ? '卓越' : sampleSize >= 30 ? '稳健' : '初级'}
                </p>
              </div>
            </div>

            {/* 置信区间雨点图预览 - 调色为淡雅绿与灰 */}
            <div className="mt-12 pt-8 border-t border-indigo-50">
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-xs font-black text-slate-700 uppercase flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div> 95% 置信区间覆盖监测 (Top 100)
                </h4>
                <div className="text-xs font-black text-slate-700">
                  当前覆盖率: <span className={ciSuccessCount >= 90 ? 'text-emerald-500' : 'text-rose-500'}>{ciSuccessCount}%</span>
                </div>
              </div>
              <div className="h-16 w-full bg-slate-50/50 rounded-2xl flex items-center gap-[1px] px-4 border border-slate-100 overflow-hidden">
                {ciData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-center h-full">
                    <div className={`w-full ${d.contains ? 'bg-emerald-300' : 'bg-rose-300'} rounded-full`} style={{ height: '30%', opacity: 0.5 }}></div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-slate-400 leading-relaxed font-medium">
                专家解读：随着样本量 <span className="font-mono text-indigo-500 italic">n</span> 的增加，置信区间的宽度将逐步收窄。
              </p>
            </div>
          </div>

          <TheoryModule />
          
          <footer className="text-center py-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
            Center Limit Theorem Lab · Interactive Education Platform
          </footer>
        </section>
      </main>
    </div>
  );
};

export default App;
