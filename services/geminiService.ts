
import { GoogleGenAI } from "@google/genai";
import { DistributionType, AIModelType } from "../types";

export async function getStatisticalInsight(
  distType: DistributionType,
  sampleSize: number,
  numSamples: number,
  observedMean: number,
  observedStd: number,
  apiKey: string,
  model: AIModelType,
  customQuestion?: string
): Promise<string> {
  const context = `
    当前实验上下文：
    - 总体分布：${distType}
    - 样本容量 (n)：${sampleSize}
    - 模拟次数：${numSamples}
    - 观测均值：${observedMean.toFixed(4)}
    - 均值标准误 (SE)：${observedStd.toFixed(4)}
  `;

  const systemInstruction = `你是一位世界顶尖的统计学教授。你的任务是解释中心极限定理（CLT）。
    你的回答应该学术严谨、富有启发性且语言简练。
    请使用 Markdown 格式。
    如果用户问了非统计学相关的问题，请礼貌地引导回本次实验。`;

  const prompt = customQuestion 
    ? `${context}\n\n用户提问：${customQuestion}\n\n请结合实验数据回答。`
    : `${context}\n\n请作为统计学专家，对本次实验结果的正态性、收敛特征及抽样分布的统计学意义做一个全面的深度评估。`;

  try {
    if (model.startsWith('gemini')) {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      return response.text || "专家暂时无法给出回答。";
    } else if (model === 'deepseek-r1') {
      // DeepSeek API implementation
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner', // deepseek-r1 maps to deepseek-reasoner in their API usually
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'DeepSeek API error');
      }

      const data = await response.json();
      return data.choices[0].message.content || "专家暂时无法给出回答。";
    }
    
    return "未知的模型类型。";
  } catch (error) {
    console.error("AI Insight Error:", error);
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("Authorization")) {
        return "❌ **认证失败**：请在设置中检查您的 API Key 是否正确。";
      }
      return `❌ **实验中断**：${error.message}`;
    }
    return "❌ **实验中断**：无法连接到远程专家系统，请检查网络。";
  }
}
