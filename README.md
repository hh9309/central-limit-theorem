# 中心极限定理 (CLT) 与高斯涌现智能实验室

一个基于 React 19、TypeScript、Tailwind CSS v4 与 SciPy/Matplotlib 的交互式高阶数理统计探索实验室。旨在打破传统教科书中“$n \ge 30$ 万能论”的误区，定量展示偏态分布向正态分布收敛的过程与残余误差。

---

## 🌟 核心功能模块

1. **知识引导切片 (Conceptual Guide)**：数理标准化公式推导、LaTeX KaTeX 实时渲染、标准误 $\text{SE} = \sigma/\sqrt{n}$ 交互式公式探针。
2. **演化实验室 (Morphing Sandbox)**：支持指数分布、Pareto 极值理赔分布、柯西分布（无一阶矩/二阶矩）、均匀分布及二项分布的样本量 $n$ 动态调节与高斯拟合曲线叠加。
3. **经典案例 Bootstrap 分析 (Classic Cases & Bootstrap)**：保险理赔极端长尾、金融高频交易高狭峰度、医学微量抗体测量等的非参数 Bootstrap 置信区间对比。
4. **诊断报告导出 (Export Report)**：支持生成与下载 Markdown / Print 格式的 CLT 高斯拟合学术诊断报告。
5. **Python 验证模块 (Python Code Sandbox)**：提供可直接运行的 Python 科学计算脚本，支持 Shapiro-Wilk 正态性假设检验、Matplotlib 双子图渲染（直方图 + Q-Q Plot）与 Bootstrapping 重抽样。
6. **Gemini AI 专家诊断 (AI Insights)**：结合后端 Gemini 3.6 Flash API 针对当前分布的残余偏度和样本量给出统计专家意见。

---

## 🚀 项目部署指南 (Deployment Guide)

### 1. Netlify 部署

项目已配置 `netlify.toml`，支持一键部署到 Netlify：

```bash
# 构建静态产物
npm run build:static

# 发布目录：dist/
```

- **Netlify 构建命令**: `npm run build:static` 或 `npm run build`
- **发布目录 (Publish Directory)**: `dist`
- **环境变量 (Optional)**: `GEMINI_API_KEY` (用于 AI 洞察分析)

---

### 2. GitHub 仓库与 GitHub Pages / Actions 部署

#### 步骤一：推送到 GitHub

```bash
git init
git add .
git commit -m "feat: complete CLT laboratory application with Netlify & Python sandbox"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/clt-gaussian-lab.git
git push -u origin main
```

#### 步骤二：项目代码检验

在 GitHub CI 或本地执行以下命令检查代码：

```bash
# 类型检查与静态构建打包
npm run check
```

---

## 💻 本地开发 (Local Development)

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器 (支持 Express + Vite 模式)
npm run dev

# 3. 访问本地服务
http://localhost:3000
```

---

## ⚙️ 环境变量

复制 `.env.example` 并重命名为 `.env`：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```
