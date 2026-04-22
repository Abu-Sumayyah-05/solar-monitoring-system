import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getStatus } from '../utils/getStatus';

// ─── Tooltip ──────────────────────────────────────────────────────────────────
// Defined OUTSIDE Chart to prevent recreation on every render (fixes flicker).

const CustomTooltip = ({ active, payload, label, dataKey }) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const formatted =
    dataKey === 'ratio'
      ? `${(value * 100).toFixed(1)}%`
      : dataKey === 'power'
      ? `${value} W`
      : dataKey === 'voltage'
      ? `${value} V`
      : value;

  return (
    <div
      style={{
        background: '#0C1220',
        border: '0.5px solid #1E293B',
        borderRadius: 10,
        padding: '8px 12px',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <p style={{ color: '#64748B', fontSize: 10, marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#F0F4FF', fontSize: 13, fontWeight: 500 }}>{formatted}</p>
    </div>
  );
};

// ─── Chart ────────────────────────────────────────────────────────────────────

const Chart = ({ data = [], dataKey = 'ratio', showArea = true }) => {
  const lastValue = data[data.length - 1]?.[dataKey] ?? 0;
  const { color } = getStatus(dataKey === 'ratio' ? lastValue : 0.92);

  // Memoise to avoid recreating gradient id strings on every render
  const gradientId = useMemo(
    () => `grad-${dataKey}-${Math.random().toString(36).slice(2, 6)}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const domainMap = {
    ratio: [0.55, 1.0],
    voltage: ['auto', 'auto'],
    power: [0, 1100],
  };

  const tickFormatter =
    dataKey === 'ratio'
      ? (v) => `${(v * 100).toFixed(0)}%`
      : dataKey === 'power'
      ? (v) => `${v}W`
      : (v) => `${v}V`;

  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />

          <XAxis
            dataKey="time"
            stroke="#2D3F55"
            tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            dy={8}
            interval="preserveStartEnd"
          />

          <YAxis
            stroke="#2D3F55"
            tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            domain={domainMap[dataKey] ?? ['auto', 'auto']}
            tickFormatter={tickFormatter}
          />

          <Tooltip
            content={<CustomTooltip dataKey={dataKey} />}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }}
          />

          {showArea && (
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
            />
          )}

          {!showArea && (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;