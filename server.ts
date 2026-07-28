import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Diagnostic endpoint
  app.post("/api/ai-insight", async (req, res) => {
    try {
      const { skewness, kurtosis, sampleSize, distributionName, shapiroPValue } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "Missing GEMINI_API_KEY",
          insight: "系统未检测到 GEMINI_API_KEY 环境变量，已使用内置离线规则诊断引擎。"
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `你是一位高阶数理统计专家与数据科学顾问。请分析以下抽样分布指标，评估 $n=${sampleSize}$ 时中心极限定理（CLT）正态近似的拟合质量，并破除“n>=30 盲目适用”的误区：

分布类型: ${distributionName}
总体偏度 (Skewness): ${skewness}
总体峰度 (Kurtosis): ${kurtosis}
当前样本量 (n): ${sampleSize}
Shapiro-Wilk 正态检验 p-value: ${shapiroPValue ?? 'N/A'}

请输出一份简明、专业、具有洞察力的中文分析（150-250字），包含：
1. **收敛质量评估**：说明当前 $n$ 下均值抽样分布的偏斜残存情况与尾部风险（如极值估计失真概率）。
2. **误差定量说明**：对比经验规则 $n=30$ 与真实适用样本量。
3. **精准建议**：给出若要保证 95% 显著性水平下正态近似误差小于 3% 所推荐的最小样本量 $n_{rec}$，以及替代方案（如 Bootstrapping 重抽样）。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
        }
      });

      res.json({
        insight: response.text || "无法生成 AI 诊断，请稍后重试。"
      });
    } catch (err: any) {
      console.error("AI Insight Error:", err);
      res.status(500).json({ error: err.message || "服务器生成 AI 洞察失败" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
