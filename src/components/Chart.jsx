import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  
  AreaChart
} from 'recharts';
import { getStatus } from '../utils/getStatus';

const Chart = ({ data, type = 'line', dataKey = 'ratio', showArea = false }) => {
  const lastValue = data[data.length - 1]?.[dataKey] || 0;
  const status = getStatus(lastValue);
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="text-slate-500 text-xs mb-1">{label}</p>
          <p className="text-slate-900 font-semibold">
            {dataKey === 'ratio' 
              ? `${(payload[0].value * 100).toFixed(1)}%`
              : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const ChartComponent = showArea ? AreaChart : LineChart;
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={status.color.replace('bg-', '').includes('emerald') ? '#10b981' : status.color.replace('bg-', '').includes('amber') ? '#f59e0b' : '#ef4444'} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={status.color.replace('bg-', '').includes('emerald') ? '#10b981' : status.color.replace('bg-', '').includes('amber') ? '#f59e0b' : '#ef4444'} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0.6, 1.0]}
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {showArea && (
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={status.color.replace('bg-', '').includes('emerald') ? '#10b981' : status.color.replace('bg-', '').includes('amber') ? '#f59e0b' : '#ef4444'}
              fillOpacity={1}
              fill="url(#colorRatio)"
              strokeWidth={2}
            />
          )}
          
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={status.color.replace('bg-', '').includes('emerald') ? '#10b981' : status.color.replace('bg-', '').includes('amber') ? '#f59e0b' : '#ef4444'}
            strokeWidth={3}
            dot={{ r: 0 }}
            activeDot={{ r: 6, strokeWidth: 0, fill: status.color.replace('bg-', '').includes('emerald') ? '#10b981' : status.color.replace('bg-', '').includes('amber') ? '#f59e0b' : '#ef4444' }}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;