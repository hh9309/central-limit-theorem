
import React from 'react';
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Scatter
} from 'recharts';

interface Props {
  data: { n: number; theoretical: number; observed: number }[];
  currentN: number;
  currentObservedSE: number;
}

const ConvergenceChart: React.FC<Props> = ({ data, currentN, currentObservedSE }) => {
  // 构造散点数据，用于 Legend 显示和点渲染
  const scatterData = [{ n: currentN, observed: currentObservedSE }];

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white h-80 flex flex-col relative overflow-hidden">
      <h3 className="text-[11px] font-black text-slate-700 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
        SE 收敛动力学 (1/√n 规律)
      </h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="n" 
              type="number"
              domain={[0, 200]}
              fontSize={9} 
              tick={{fill: '#64748b', fontWeight: 600}} 
              axisLine={{stroke: '#f1f5f9'}}
              tickLine={false}
              label={{ value: '样本容量 n', position: 'insideBottomRight', offset: -5, fontSize: 9, fill: '#64748b', fontWeight: 'bold' }}
            />
            <YAxis 
              fontSize={9} 
              tick={{fill: '#64748b', fontWeight: 600}} 
              axisLine={{stroke: '#f1f5f9'}}
              tickLine={false}
              label={{ value: '标准误 SE', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#64748b', fontWeight: 'bold' }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', fontSize: '12px' }}
              labelClassName="text-slate-700 font-black"
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#334155' }} />
            
            {/* 理论 SE 曲线 - 始终保持不动 */}
            <Line 
              name="理论收敛曲线"
              type="monotone" 
              dataKey="theoretical" 
              stroke="#6366f1" 
              strokeWidth={4}
              dot={false}
              isAnimationActive={false}
            />

            {/* 动态标记当前 N 的垂直线 */}
            <ReferenceLine 
              x={currentN} 
              stroke="#f43f5e" 
              strokeDasharray="3 3" 
            />
            
            {/* 动态标记当前观测 SE 的水平线 */}
            <ReferenceLine 
              y={currentObservedSE} 
              stroke="#f43f5e" 
              strokeDasharray="3 3" 
            />

            {/* 当前观测点 - 使用 Scatter 以便在 Legend 中显示 */}
            <Scatter 
              name="第一次观察SE" 
              data={scatterData} 
              dataKey="observed"
              fill="#f43f5e" 
              stroke="white"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* 动态背景装饰 */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <div className="text-4xl font-black text-indigo-500 italic">1/√n</div>
      </div>
    </div>
  );
};

export default ConvergenceChart;
