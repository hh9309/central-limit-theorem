
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line 
} from 'recharts';
import { binData } from '../utils/statistics';

interface Props {
  data: number[];
  title: string;
  color: string;
  theoretical?: { mu: number; sigma: number };
}

const DistributionChart: React.FC<Props> = ({ data, title, color, theoretical }) => {
  const binned = binData(data, 40);

  // 如果提供了理论参数，计算正态分布曲线点
  const chartData = binned.map(b => {
    let theoryValue = null;
    if (theoretical) {
      const x = parseFloat(b.bin);
      const { mu, sigma } = theoretical;
      // 正态分布概率密度函数 (PDF)
      theoryValue = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    }
    return { ...b, theory: theoryValue };
  });

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white h-80 flex flex-col">
      <h3 className="text-[11px] font-black text-slate-700 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: color}}></div>
        {title}
      </h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="bin" 
              fontSize={9} 
              tick={{fill: '#94a3b8', fontWeight: 500}} 
              axisLine={{stroke: '#f1f5f9'}}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', fontSize: '12px' }}
              labelClassName="text-slate-400 font-bold"
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#gradient-${color})`} 
              strokeWidth={2.5}
              animationDuration={1500}
            />
            {theoretical && (
              <Line 
                type="monotone" 
                dataKey="theory" 
                stroke="#94a3b8" 
                strokeWidth={1} 
                strokeDasharray="3 3" 
                dot={false} 
                yAxisId={0}
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DistributionChart;
