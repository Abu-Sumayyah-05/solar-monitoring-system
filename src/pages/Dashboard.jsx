import React, { useEffect, useState } from "react";
import { Sun, AlertTriangle, Zap, Droplets, Clock, Activity, Wind, Thermometer, Gauge, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const Dashboard = () => {
  const [data, setData] = useState({
    expectedPower: 1000,
    actualPower: 920,
    soilingRatio: 0.92,
    lastCleaned: "2 days ago",
  });

  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const fluctuation = (Math.random() - 0.5) * 30;
        const actualPower = Math.max(500, Math.min(prev.expectedPower, prev.actualPower + fluctuation));
        const soilingRatio = +(actualPower / prev.expectedPower).toFixed(2);
        return { ...prev, actualPower: Math.round(actualPower), soilingRatio };
      });
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const status = data.soilingRatio < 0.75 ? "critical" : data.soilingRatio < 0.88 ? "warning" : "optimal";

  const themes = {
    critical: {
      primary: "text-[#FF6B6B]",
      bg: "bg-[#FF6B6B]/10",
      border: "border-[#FF6B6B]/30",
      glow: "shadow-[0_0_40px_-10px_rgba(255,107,107,0.3)]",
      accent: "#FF6B6B",
      label: "Critical",
      sub: "Clean Immediately"
    },
    warning: {
      primary: "text-[#FFB347]",
      bg: "bg-[#FFB347]/10",
      border: "border-[#FFB347]/30",
      glow: "shadow-[0_0_40px_-10px_rgba(255,179,71,0.3)]",
      accent: "#FFB347",
      label: "Warning",
      sub: "Needs Cleaning"
    },
    optimal: {
      primary: "text-[#4ECDC4]",
      bg: "bg-[#4ECDC4]/10",
      border: "border-[#4ECDC4]/30",
      glow: "shadow-[0_0_40px_-10px_rgba(78,205,196,0.3)]",
      accent: "#4ECDC4",
      label: "Optimal",
      sub: "Performing Well"
    }
  };

  const t = themes[status];
  const powerLoss = data.expectedPower - data.actualPower;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFB347]/20 blur-xl rounded-full animate-pulse" />
              <Sun size={32} className="text-[#FFB347] relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F8FAFC]">Solar Monitor</h1>
              <p className="text-[#94A3B8] text-xs tracking-widest uppercase">Live IoT Stream</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] rounded-full border border-[#334155]">
            <div className={`w-2 h-2 rounded-full ${status === 'optimal' ? 'bg-[#4ECDC4]' : status === 'warning' ? 'bg-[#FFB347]' : 'bg-[#FF6B6B]'} animate-pulse`} />
            <span className="text-[#CBD5E1] text-xs font-medium">Connected</span>
          </div>
        </div>

        {/* Main Layout: Panel Box + Floating Metrics */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT: The Solar Panel Box */}
          <div className="lg:w-5/12">
            <div className={`relative bg-[#1E293B]/80 backdrop-blur-md border ${t.border} rounded-3xl p-8 ${t.glow} transition-all duration-500`}>
              
              {/* Panel Visualization */}
              <div className="relative mb-6">
                <div className="aspect-square max-w-[280px] mx-auto relative">
                  {/* Outer Ring */}
                  <div className={`absolute inset-0 rounded-3xl border-2 ${t.border} opacity-30`} />
                  
                  {/* Panel Grid */}
                  <div className="absolute inset-4 bg-[#0F172A] rounded-2xl border border-[#334155] overflow-hidden">
                    <div className="grid grid-cols-3 grid-rows-3 h-full gap-1 p-2">
                      {[...Array(9)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-lg transition-all duration-700 ${pulse ? 'scale-95' : 'scale-100'}`}
                          style={{
                            background: `linear-gradient(135deg, ${t.accent}${Math.random() > 0.3 ? '40' : '15'}, transparent)`,
                            opacity: data.soilingRatio > 0.8 ? 0.9 : 0.4 + (i * 0.05)
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Glass Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  </div>

                  {/* Status Ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="50%" cy="50%" r="46%"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="3"
                    />
                    <circle
                      cx="50%" cy="50%" r="46%"
                      fill="none"
                      stroke={t.accent}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${data.soilingRatio * 289} 289`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  {/* Center Data */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center mt-16">
                      <span className={`text-5xl font-black ${t.primary} tabular-nums`}>
                        {(data.soilingRatio * 100).toFixed(0)}
                      </span>
                      <span className={`text-xl ${t.primary} opacity-60`}>%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Info */}
              <div className="text-center space-y-2">
                <h3 className={`text-xl font-bold ${t.primary}`}>{t.label}</h3>
                <p className="text-[#94A3B8] text-sm">{t.sub}</p>
                
                {status === "critical" && (
                  <div className="mt-4 bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-xl p-3 flex items-center gap-3 justify-center">
                    <AlertTriangle size={16} className="text-[#FF6B6B]" />
                    <span className="text-[#FF6B6B] text-sm font-semibold">Clean immediately!</span>
                  </div>
                )}
              </div>

              {/* Decorative Corner Accents */}
              <div className={`absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 ${t.border} rounded-tl-3xl`} />
              <div className={`absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 ${t.border} rounded-br-3xl`} />
            </div>

            {/* Last Cleaned - Attached Below */}
            <div className="mt-4 bg-[#1E293B]/50 backdrop-blur-sm border border-[#334155] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#818CF8]/10 rounded-xl">
                  <Clock size={18} className="text-[#818CF8]" />
                </div>
                <div>
                  <p className="text-[#94A3B8] text-xs">Last Maintenance</p>
                  <p className="text-[#F8FAFC] font-semibold">{data.lastCleaned}</p>
                </div>
              </div>
              <Sparkles size={16} className="text-[#818CF8] opacity-50" />
            </div>
          </div>

          {/* RIGHT: Floating Metric Cards */}
          <div className="lg:w-7/12 space-y-4">
            
            {/* Power Comparison - Big Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1E293B]/60 backdrop-blur-sm border border-[#334155] rounded-3xl p-6 hover:bg-[#1E293B]/80 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[#60A5FA]/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <Zap size={24} className="text-[#60A5FA]" />
                  </div>
                  <span className="text-[#60A5FA] text-xs font-bold bg-[#60A5FA]/10 px-2 py-1 rounded-lg">Target</span>
                </div>
                <p className="text-[#94A3B8] text-sm mb-1">Expected Power</p>
                <p className="text-4xl font-bold text-[#F8FAFC] tabular-nums">
                  {data.expectedPower}<span className="text-lg text-[#64748B] ml-1">W</span>
                </p>
              </div>

              <div className="bg-[#1E293B]/60 backdrop-blur-sm border border-[#334155] rounded-3xl p-6 hover:bg-[#1E293B]/80 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${t.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                    <Activity size={24} className={t.primary} />
                  </div>
                  <span className={`${t.primary} text-xs font-bold ${t.bg} px-2 py-1 rounded-lg`}>{status === 'optimal' ? 'Good' : 'Low'}</span>
                </div>
                <p className="text-[#94A3B8] text-sm mb-1">Actual Power</p>
                <p className={`text-4xl font-bold tabular-nums ${pulse ? 'scale-105' : ''} transition-transform duration-300`}>
                  <span className={data.actualPower < data.expectedPower * 0.8 ? 'text-[#FF6B6B]' : 'text-[#F8FAFC]'}>
                    {data.actualPower}
                  </span>
                  <span className="text-lg text-[#64748B] ml-1">W</span>
                </p>
              </div>
            </div>

            {/* Loss Indicator */}
            <div className="bg-[#1E293B]/60 backdrop-blur-sm border border-[#334155] rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B6B]/5 rounded-full blur-3xl" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#FF6B6B]/10 rounded-2xl">
                    <Gauge size={24} className="text-[#FF6B6B]" />
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-sm">Power Loss</p>
                    <p className="text-3xl font-bold text-[#FF6B6B] tabular-nums">
                      -{powerLoss}<span className="text-lg text-[#FF6B6B]/60 ml-1">W</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#64748B] text-xs mb-1">Efficiency Drop</p>
                  <p className="text-2xl font-bold text-[#FF6B6B]">
                    {((1 - data.soilingRatio) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-[#0F172A] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB347] rounded-full transition-all duration-1000"
                  style={{ width: `${(1 - data.soilingRatio) * 100}%` }}
                />
              </div>
            </div>

            

            {/* Secondary Metrics removed as requested */}

            {/* Environmental Tip */}
            <div className="bg-[#4ECDC4]/5 border border-[#4ECDC4]/20 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-2 bg-[#4ECDC4]/10 rounded-xl">
                <Droplets size={20} className="text-[#4ECDC4]" />
              </div>
              <div>
                <p className="text-[#4ECDC4] text-sm font-semibold">Pro Tip</p>
                <p className="text-[#94A3B8] text-xs">Morning dew reduces efficiency by 3-5%. Clean panels before 9 AM for best results.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;