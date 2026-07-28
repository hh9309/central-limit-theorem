var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/ai-insight", async (req, res) => {
    try {
      const { skewness, kurtosis, sampleSize, distributionName, shapiroPValue } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "Missing GEMINI_API_KEY",
          insight: "\u7CFB\u7EDF\u672A\u68C0\u6D4B\u5230 GEMINI_API_KEY \u73AF\u5883\u53D8\u91CF\uFF0C\u5DF2\u4F7F\u7528\u5185\u7F6E\u79BB\u7EBF\u89C4\u5219\u8BCA\u65AD\u5F15\u64CE\u3002"
        });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const prompt = `\u4F60\u662F\u4E00\u4F4D\u9AD8\u9636\u6570\u7406\u7EDF\u8BA1\u4E13\u5BB6\u4E0E\u6570\u636E\u79D1\u5B66\u987E\u95EE\u3002\u8BF7\u5206\u6790\u4EE5\u4E0B\u62BD\u6837\u5206\u5E03\u6307\u6807\uFF0C\u8BC4\u4F30 $n=${sampleSize}$ \u65F6\u4E2D\u5FC3\u6781\u9650\u5B9A\u7406\uFF08CLT\uFF09\u6B63\u6001\u8FD1\u4F3C\u7684\u62DF\u5408\u8D28\u91CF\uFF0C\u5E76\u7834\u9664\u201Cn>=30 \u76F2\u76EE\u9002\u7528\u201D\u7684\u8BEF\u533A\uFF1A

\u5206\u5E03\u7C7B\u578B: ${distributionName}
\u603B\u4F53\u504F\u5EA6 (Skewness): ${skewness}
\u603B\u4F53\u5CF0\u5EA6 (Kurtosis): ${kurtosis}
\u5F53\u524D\u6837\u672C\u91CF (n): ${sampleSize}
Shapiro-Wilk \u6B63\u6001\u68C0\u9A8C p-value: ${shapiroPValue ?? "N/A"}

\u8BF7\u8F93\u51FA\u4E00\u4EFD\u7B80\u660E\u3001\u4E13\u4E1A\u3001\u5177\u6709\u6D1E\u5BDF\u529B\u7684\u4E2D\u6587\u5206\u6790\uFF08150-250\u5B57\uFF09\uFF0C\u5305\u542B\uFF1A
1. **\u6536\u655B\u8D28\u91CF\u8BC4\u4F30**\uFF1A\u8BF4\u660E\u5F53\u524D $n$ \u4E0B\u5747\u503C\u62BD\u6837\u5206\u5E03\u7684\u504F\u659C\u6B8B\u5B58\u60C5\u51B5\u4E0E\u5C3E\u90E8\u98CE\u9669\uFF08\u5982\u6781\u503C\u4F30\u8BA1\u5931\u771F\u6982\u7387\uFF09\u3002
2. **\u8BEF\u5DEE\u5B9A\u91CF\u8BF4\u660E**\uFF1A\u5BF9\u6BD4\u7ECF\u9A8C\u89C4\u5219 $n=30$ \u4E0E\u771F\u5B9E\u9002\u7528\u6837\u672C\u91CF\u3002
3. **\u7CBE\u51C6\u5EFA\u8BAE**\uFF1A\u7ED9\u51FA\u82E5\u8981\u4FDD\u8BC1 95% \u663E\u8457\u6027\u6C34\u5E73\u4E0B\u6B63\u6001\u8FD1\u4F3C\u8BEF\u5DEE\u5C0F\u4E8E 3% \u6240\u63A8\u8350\u7684\u6700\u5C0F\u6837\u672C\u91CF $n_{rec}$\uFF0C\u4EE5\u53CA\u66FF\u4EE3\u65B9\u6848\uFF08\u5982 Bootstrapping \u91CD\u62BD\u6837\uFF09\u3002`;
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.3
        }
      });
      res.json({
        insight: response.text || "\u65E0\u6CD5\u751F\u6210 AI \u8BCA\u65AD\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"
      });
    } catch (err) {
      console.error("AI Insight Error:", err);
      res.status(500).json({ error: err.message || "\u670D\u52A1\u5668\u751F\u6210 AI \u6D1E\u5BDF\u5931\u8D25" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
