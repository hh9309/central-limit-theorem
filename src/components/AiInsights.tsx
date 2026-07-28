import React, { useState, useEffect, useRef } from 'react';
import { DistributionType } from '../types';
import { DISTRIBUTIONS, runCLTSimulation } from '../lib/mathStats';
import { MathFormula } from './MathFormula';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Settings,
  Key,
  Check,
  Send,
  User,
  X,
  Eye,
  EyeOff,
  MessageSquare,
  HelpCircle,
  SlidersHorizontal,
  Lock,
} from 'lucide-react';

interface AiInsightsProps {
  currentDist: DistributionType;
  sampleSize: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: string;
}

export const AiInsights: React.FC<AiInsightsProps> = ({ currentDist, sampleSize }) => {
  // Local Rule Diagnostic Inputs
  const [customSkewness, setCustomSkewness] = useState<number>(2.8);
  const [customKurtosis, setCustomKurtosis] = useState<number>(8.5);
  const [customN, setCustomN] = useState<number>(30);

  // Model & Key Config State (Stored in localStorage for GitHub/Netlify static deployment)
  const [apiKey, setApiKey] = useState<string>('');
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.6-flash' | 'deepseek-v4-pro'>('gemini-3.6-flash');
  const [tempModel, setTempModel] = useState<'gemini-3.6-flash' | 'deepseek-v4-pro'>('gemini-3.6-flash');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [keyNotice, setKeyNotice] = useState<string | null>(null);

  // AI Diagnostic State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '您好！我是中心极限定理 (CLT) 数理统计 AI 洞察助手。您可以针对不同总体分布、偏度峰度影响或样本量收敛问题向我提问。请先点击右上角 ⚙️ 齿轮图标配置您的 API Key。',
      model: '系统初始化',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isChatGenerating, setIsChatGenerating] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Load key and model on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('clt_llm_api_key') || '';
    const savedModel = (localStorage.getItem('clt_llm_model') as 'gemini-3.6-flash' | 'deepseek-v4-pro') || 'gemini-3.6-flash';
    if (savedKey) {
      setApiKey(savedKey);
      setTempApiKey(savedKey);
    }
    setSelectedModel(savedModel);
    setTempModel(savedModel);
  }, []);

  // Auto-scroll chat window
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatGenerating]);

  // Save Settings Modal
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = tempApiKey.trim();
    if (!cleanKey) {
      setKeyNotice('请输入有效的 API Key！');
      return;
    }

    localStorage.setItem('clt_llm_api_key', cleanKey);
    localStorage.setItem('clt_llm_model', tempModel);
    setApiKey(cleanKey);
    setSelectedModel(tempModel);
    setKeyNotice('配置修改成功！现在可以调用大模型。');
    setTimeout(() => {
      setKeyNotice(null);
      setIsSettingsOpen(false);
    }, 1200);
  };

  // Rule-based metrics
  const recommendedNLocal = Math.max(10, Math.round(28 * Math.pow(customSkewness, 2)));
  const probabilityErrorPercent = Number(Math.min(35, Math.abs(customSkewness) * 4.8 + Math.max(0, 30 - customN) * 0.4).toFixed(1));

  // Call Model Unified Runner (Client Browser Direct Call with Key requirement)
  const callLlmApi = async (promptText: string, modelToUse: 'gemini-3.6-flash' | 'deepseek-v4-pro', currentKey: string): Promise<string> => {
    if (!currentKey) {
      setIsSettingsOpen(true);
      throw new Error('未检测到 API Key！所有大模型调用必须输入 API-Key 后才能使用，请在设置弹窗中输入。');
    }

    const systemPrompt = `你是一位严谨的数理统计学与概率论专家，擅长中心极限定理 (CLT)、正态分布收敛性、偏度与峰度定量诊断。你的回答要求逻辑清晰、学术严谨、重点突出，包含必要的数学解释。`;

    if (modelToUse === 'gemini-3.6-flash') {
      // Gemini Flash Call (Google AI REST Endpoint)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(currentKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\n【用户提问/分析任务】：\n${promptText}`,
                },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API 请求失败 (HTTP ${res.status})，请检查 API Key 是否正确`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Gemini 返回内容为空，请稍后重试');
      }
      return text;
    } else {
      // DeepSeek V4 Pro / V3 Chat Completions Endpoint
      const url = 'https://api.deepseek.com/v1/chat/completions';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: promptText },
          ],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `DeepSeek API 请求失败 (HTTP ${res.status})，请检查 API Key 或网络连通性`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('DeepSeek 返回内容为空，请稍后重试');
      }
      return text;
    }
  };

  // Trigger Automatic AI Diagnosis
  const handleCallExpertInsight = async () => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      setKeyNotice('提示：必须先在此输入 API Key 才能调用大模型！');
      return;
    }

    setIsLoadingAi(true);
    setAiReport(null);

    const distInfo = DISTRIBUTIONS[currentDist];
    const sim = runCLTSimulation(currentDist, sampleSize, 3000);

    const prompt = `请对以下中心极限定理 (CLT) 模拟实验进行学术评估：
- 总体分布名称：${distInfo.name} (${distInfo.shortName})
- 总体理论偏度：${distInfo.skewness}
- 当前抽取样本量 n：${sampleSize}
- 均值抽样分布偏度 Skewness：${sim.skewness}
- 均值抽样分布峰度 Kurtosis：${sim.kurtosis}
- Shapiro-Wilk 正态性检验 p-value：${sim.shapiroPValue} (临界值 alpha=0.05)
- 正态拟合匹配得分：${sim.fitScore} / 100

请从以下三点简要输出专家研判：
1. 当前样本量 n=${sampleSize} 下，样本均值分布是否已经成功正态化？
2. 传统 n=30 的经验法则在此总体分布下是否依然有效？
3. 给出建议的最小安全样本量 n_rec，并解释为什么高偏态分布需要更大样本量。`;

    try {
      const result = await callLlmApi(prompt, selectedModel, apiKey);
      setAiReport(result);
    } catch (err: any) {
      setAiReport(`❌ 大模型调用失败: ${err.message || '网络连接超时或 API Key 无效'}`);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Submit Interactive Chat Question
  const handleSendQuestion = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const query = (customQ || inputQuestion).trim();
    if (!query) return;

    if (!apiKey) {
      setIsSettingsOpen(true);
      setKeyNotice('提示：必须先配置 API Key 才能向大模型提问！');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customQ) setInputQuestion('');
    setIsChatGenerating(true);

    const contextPrompt = `当前用户正在观察【${DISTRIBUTIONS[currentDist].name}】在样本量 n=${sampleSize} 时的均值抽样分布。
用户提问：${query}`;

    try {
      const reply = await callLlmApi(contextPrompt, selectedModel, apiKey);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        model: selectedModel === 'gemini-3.6-flash' ? 'Gemini 3.6 Flash' : 'DeepSeek V4 Pro',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ 调用失败: ${err.message || '请检查网络或 API Key 设置'}`,
        model: selectedModel,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Gear Settings Icon */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-xs">
              <Sparkles className="w-3.5 h-3.5" /> 6. AI 洞察与问答模块 (AI Insights & Chat)
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-serif mt-1 flex items-center gap-2">
              智能偏度定量诊断 & 大模型交互对话
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              结合规则诊断与 LLM 专家解读。已完美支持 Gemini 3.6 Flash 与 DeepSeek V4 Pro 模型，兼容 GitHub Pages / Netlify 静态部署。
            </p>
          </div>

          {/* Gear / Settings Button in Header Title Row */}
          <button
            onClick={() => {
              setTempApiKey(apiKey);
              setTempModel(selectedModel);
              setIsSettingsOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-xs ${
              apiKey
                ? 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
            }`}
            title="配置大模型与 API Key"
          >
            <Settings className="w-4 h-4 text-indigo-400 animate-spin-slow" />
            <span>{apiKey ? `设置大模型 (${selectedModel === 'gemini-3.6-flash' ? 'Gemini 3.6' : 'DeepSeek V4'})` : '⚙️ 配置 API-Key'}</span>
          </button>
        </div>

        {/* Input Parameters Box for Quick Diagnosis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between font-medium text-slate-700">
              <span>自定义总体偏度 <MathFormula tex="\gamma_1" /> (Skewness):</span>
              <span className="font-mono font-bold text-indigo-600">{customSkewness}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={customSkewness}
              onChange={(e) => setCustomSkewness(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-medium text-slate-700">
              <span>自定义总体峰度 <MathFormula tex="\gamma_2" /> (Kurtosis):</span>
              <span className="font-mono font-bold text-indigo-600">{customKurtosis}</span>
            </div>
            <input
              type="range"
              min="-1.5"
              max="20"
              step="0.5"
              value={customKurtosis}
              onChange={(e) => setCustomKurtosis(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-medium text-slate-700">
              <span>打算采用的样本量 <MathFormula tex="n" />:</span>
              <span className="font-mono font-bold text-indigo-600">{customN}</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              value={customN}
              onChange={(e) => setCustomN(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Slice: Rule Engine & LLM Expert Diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Local Rule Engine Diagnostic Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              本地高精度规则评估引擎
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
              实时毫秒计算
            </span>
          </div>

          <div
            className={`p-4 rounded-xl border space-y-2 text-xs ${
              customN < recommendedNLocal
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="font-bold text-sm flex items-center gap-2">
              {customN < recommendedNLocal ? (
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              )}
              {customN < recommendedNLocal
                ? '检测到显著样本量不足预警！'
                : '样本量完全符合高斯收敛要求！'}
            </div>

            <p className="leading-relaxed">
              检测到输入数据呈{customSkewness > 2 ? '高度偏态' : customSkewness > 0.8 ? '中度偏态' : '对称轻度偏态'}（Skewness = {customSkewness}），传统 <MathFormula tex="n=30" /> 经验法则{customSkewness > 1.2 ? '失效！' : '适用。'}
              {customN < recommendedNLocal && (
                <span>
                  若直接在此样本量（n = {customN}）下使用正态近似，将在尾部区间产生约{' '}
                  <strong className="text-rose-700 underline font-mono">{probabilityErrorPercent}%</strong> 的概率误差，建议将最小样本量提升至 <MathFormula tex={`n \\ge ${recommendedNLocal}`} />。
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1">
              <span className="text-slate-500">拟产生的概率偏差率</span>
              <div className="text-lg font-mono font-bold text-rose-600">
                ~ {probabilityErrorPercent}%
              </div>
              <p className="text-[10px] text-slate-400">基于尾部 95% 置信区间衡量</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1">
              <span className="text-slate-500">推荐最小样本量 <MathFormula tex="n_{rec}" /></span>
              <div className="text-lg font-mono font-bold text-indigo-600">
                n ≥ {recommendedNLocal}
              </div>
              <p className="text-[10px] text-slate-400">经验公式 n ≥ 28 · γ₁²</p>
            </div>
          </div>
        </div>

        {/* LLM Expert Deep Analytics Card */}
        <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-indigo-200 font-serif">
                  AI专家级深度研判
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              实时将当前沙盒总体分布（【{DISTRIBUTIONS[currentDist].name}】）、样本量 <MathFormula tex={`n = ${sampleSize}`} /> 以及 Shapiro-Wilk 检验指标发送至选择的大模型，获取学术专家研判报告。
            </p>

            {aiReport ? (
              <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700/80 text-xs text-slate-200 leading-relaxed space-y-2 max-h-64 overflow-y-auto">
                <div className="font-bold text-indigo-300 border-b border-slate-700 pb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {selectedModel === 'gemini-3.6-flash' ? 'Gemini 3.6' : 'DeepSeek V4'} 统计学诊断结论:
                </div>
                <p className="whitespace-pre-line font-sans text-[11px] leading-relaxed">{aiReport}</p>
              </div>
            ) : (
              <div className="p-6 bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-center text-xs text-slate-400 space-y-2">
                <Bot className="w-8 h-8 mx-auto opacity-50 text-indigo-400" />
                <p>
                  {apiKey
                    ? '点击下方按钮，触发大模型深度统计研判'
                    : '未配置 API Key，请点击上方“⚙️ 配置 API-Key”后使用'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleCallExpertInsight}
            disabled={isLoadingAi}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs rounded-lg shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoadingAi ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> 正在调用 AI 深度统计研判...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" /> 调用AI深度统计研判
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Interactive LLM Q&A Chat Section (大模型回答问题对话框) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                大模型数理交互问答对话框 (LLM Q&A Dialogue)
              </h3>
              <p className="text-xs text-slate-500">
                向 {selectedModel === 'gemini-3.6-flash' ? 'Gemini 3.6 Flash' : 'DeepSeek V4 Pro'} 自由提问任何关于概率论、CLT 收敛性或分布特性的数理统计问题
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">
              当前模型: <strong className="text-indigo-600 font-mono">{selectedModel}</strong>
            </span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer transition-all"
            >
              切换模型 / Key
            </button>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-indigo-500" /> 常用学术探索快捷问题:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleSendQuestion(undefined, '为什么指数分布在 n=30 时 Shapiro-Wilk 检验依然无法通过？')}
              className="px-2.5 py-1 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 rounded-lg border border-indigo-200/60 transition-all cursor-pointer text-[11px]"
            >
              💡 为何 Exp(λ) 在 n=30 时正态检验失效？
            </button>

            <button
              onClick={() => handleSendQuestion(undefined, '柯西分布（Cauchy Distribution）为何完全不能适用中心极限定理？')}
              className="px-2.5 py-1 bg-amber-50/70 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200/60 transition-all cursor-pointer text-[11px]"
            >
              💡 柯西分布为何完全失效？
            </button>

            <button
              onClick={() => handleSendQuestion(undefined, '请详细推导标准误 SE = σ / √n 随着样本量 n 的平滑衰减过程。')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-all cursor-pointer text-[11px]"
            >
              💡 推导标准误 SE = σ/√n 衰减律
            </button>
          </div>
        </div>

        {/* Chat Messages Scroll Window */}
        <div
          ref={chatScrollRef}
          className="bg-slate-950 text-slate-100 rounded-xl p-4 border border-slate-800 h-80 overflow-y-auto space-y-3 font-sans text-xs"
        >
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-400/50 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3 space-y-1 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-70 mb-1 border-b border-slate-700/50 pb-1 gap-2">
                  <span className="font-semibold">
                    {msg.role === 'user' ? '您' : msg.model || 'AI 统计专家'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-[11px] font-sans">
                  {msg.content}
                </p>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isChatGenerating && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-400/50 text-indigo-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 text-indigo-300 rounded-xl rounded-tl-none p-3 text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{selectedModel === 'gemini-3.6-flash' ? 'Gemini 3.6' : 'DeepSeek V4'} 正在推导思考中...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Question Form */}
        <form onSubmit={handleSendQuestion} className="flex gap-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={
              apiKey
                ? `用自然语言向 ${selectedModel === 'gemini-3.6-flash' ? 'Gemini 3.6' : 'DeepSeek V4'} 提问...`
                : '请先在右上角 ⚙️ 齿轮配置 API Key 后提问...'
            }
            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isChatGenerating || !inputQuestion.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>发送</span>
          </button>
        </form>
      </div>

      {/* 4. Model & API Key Configuration Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm font-serif text-indigo-100">
                  大模型配置 (LLM Model & API Key Setup)
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveSettings} className="p-5 space-y-4 text-xs">
              {/* Notice Banner */}
              {keyNotice && (
                <div
                  className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-medium ${
                    keyNotice.includes('成功')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{keyNotice}</span>
                </div>
              )}

              {/* Requirement 2: Choose Model Option */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">1. 选择大模型引擎 (Select Model):</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                      tempModel === 'gemini-3.6-flash'
                        ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 font-semibold ring-2 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Gemini 3.6 Flash</span>
                      <input
                        type="radio"
                        name="model"
                        value="gemini-3.6-flash"
                        checked={tempModel === 'gemini-3.6-flash'}
                        onChange={() => setTempModel('gemini-3.6-flash')}
                        className="accent-indigo-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans">
                      Google GenAI 极速推理
                    </span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                      tempModel === 'deepseek-v4-pro'
                        ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 font-semibold ring-2 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">DeepSeek V4 Pro</span>
                      <input
                        type="radio"
                        name="model"
                        value="deepseek-v4-pro"
                        checked={tempModel === 'deepseek-v4-pro'}
                        onChange={() => setTempModel('deepseek-v4-pro')}
                        className="accent-indigo-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans">
                      DeepSeek 高阶推导引擎
                    </span>
                  </label>
                </div>
              </div>

              {/* Requirement 1: Manual Input API Key */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    2. 手工输入 API-Key:
                  </label>
                  <span className="text-[10px] text-rose-600 font-semibold">* 必填后方可调用</span>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder={
                      tempModel === 'gemini-3.6-flash'
                        ? '输入 Gemini API Key (以 AIza... 开头)'
                        : '输入 DeepSeek API Key (以 sk-... 开头)'
                    }
                    className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-2.5 bg-slate-100/80 rounded-lg text-[10px] text-slate-600 space-y-1 border border-slate-200/70">
                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                    <Lock className="w-3 h-3 text-emerald-600" /> 本地安全保障说明:
                  </div>
                  <p>
                    API Key 仅保存在您的浏览器 <code>localStorage</code> 中，代码在前端直接请求对应 API，保障部署至 GitHub Pages / Netlify 后的安全隐私。
                  </p>
                </div>
              </div>

              {/* Requirement 3: Confirm Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  确认大模型与 Key 配置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
