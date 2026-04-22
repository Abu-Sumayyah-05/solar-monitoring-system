import React, { useEffect, useState, useCallback } from 'react';
import {
  Sun, AlertTriangle, Zap, Activity, Gauge,
  Droplets, Clock, Thermometer, Wifi, ChevronRight,
} from 'lucide-react';
import Chart from '../components/Chart';
import StatusBadge from '../components/StatusBadge';
import PanelSelector from '../components/PanelSelector';
import { getStatus } from '../utils/getStatus';
import {
  getPanels,
  subscribeToPanel,
  setReportingInterval,
  generateHistory,
} from '../services/panelService';

// ─── Sub-components ───────────────────────────────────────────────────────────

const MetricCard = ({ icon, label, value, unit, accent = '#64748B' }) => (
  <div
    style={{
      background: '#0C1220',
      border: '0.5px solid #1E293B',
      borderRadius: 14,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: `${accent}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
        }}
      >
        {icon}
      </div>
    </div>
    <div>
      <p style={{ fontSize: 10, color: '#64748B', marginBottom: 3, letterSpacing: '0.04em' }}>
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#F0F4FF', lineHeight: 1 }}>
        {value}
        {unit && (
          <span style={{ fontSize: 12, color: '#334155', marginLeft: 3 }}>{unit}</span>
        )}
      </p>
    </div>
  </div>
);

const InfoRow = ({ icon, label, value, accent = '#475569' }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 14px',
      background: '#0C1220',
      border: '0.5px solid #1E293B',
      borderRadius: 12,
    }}
  >
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: `${accent}18`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: accent,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 9, color: '#475569', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 13, color: '#CBD5E1', fontWeight: 500, marginTop: 1 }}>{value}</p>
    </div>
  </div>
);

// ─── Ring SVG ─────────────────────────────────────────────────────────────────

const CIRC = 2 * Math.PI * 80;

const RatioRing = ({ ratio, color, pulse }) => (
  <svg
    viewBox="0 0 190 190"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
  >
    <circle cx="95" cy="95" r="80" fill="none" stroke="#1E293B" strokeWidth="3" />
    <circle
      cx="95" cy="95" r="80"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray={`${(ratio * CIRC).toFixed(1)} ${CIRC}`}
      style={{ transition: 'stroke-dasharray 1s ease, stroke 0.5s ease' }}
    />
    {/* Tick marks at 75% and 88% thresholds */}
    <circle cx="95" cy="95" r="80" fill="none" stroke="#EF4444" strokeWidth="2"
      strokeDasharray={`2 ${CIRC - 2}`}
      strokeDashoffset={-(0.75 * CIRC)}
      opacity="0.4"
    />
    <circle cx="95" cy="95" r="80" fill="none" stroke="#F59E0B" strokeWidth="2"
      strokeDasharray={`2 ${CIRC - 2}`}
      strokeDashoffset={-(0.88 * CIRC)}
      opacity="0.4"
    />
  </svg>
);

// ─── Panel cell grid ─────────────────────────────────────────────────────────

const PanelGrid = ({ ratio, color, pulse }) => (
  <div
    style={{
      position: 'absolute',
      inset: 22,
      background: '#06090F',
      borderRadius: 13,
      border: '0.5px solid #1E293B',
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gridTemplateRows: 'repeat(3,1fr)',
      gap: 3,
      padding: 7,
      overflow: 'hidden',
    }}
  >
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        style={{
          borderRadius: 5,
          background: color,
          opacity: ratio > 0.8
            ? parseFloat((0.3 + i * 0.06).toFixed(2))
            : parseFloat((0.06 + i * 0.04).toFixed(2)),
          transform: pulse ? 'scale(0.92)' : 'scale(1)',
          transition: 'opacity 0.6s ease, transform 0.5s ease, background 0.5s ease',
        }}
      />
    ))}
    {/* Glass sheen */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }}
    />
  </div>
);

// ─── INTERVALS ────────────────────────────────────────────────────────────────

const INTERVAL_OPTIONS = [
  { value: 10,    label: '10 seconds'  },
  { value: 30,    label: '30 seconds'  },
  { value: 60,    label: '1 minute'    },
  { value: 900,   label: '15 minutes'  },
  { value: 1800,  label: '30 minutes'  },
  { value: 3600,  label: '1 hour'      },
  { value: 86400, label: 'Once daily'  },
];

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [panels, setPanels] = useState([]);
  const [activePanelId, setActivePanelId] = useState(null);
  const [panelData, setPanelData] = useState(null);
  const [history, setHistory] = useState([]);
  const [pulse, setPulse] = useState(false);
  const [interval, setIntervalVal] = useState(1800);

  // Load panel list on mount
  useEffect(() => {
    getPanels().then((list) => {
      setPanels(list);
      if (list.length > 0) {
        setActivePanelId(list[0].id);
        setIntervalVal(list[0].reportingInterval ?? 1800);
      }
    });
  }, []);

  // Subscribe to live data whenever active panel changes
  useEffect(() => {
    if (!activePanelId) return;

    // Reset history on panel switch
    setHistory([]);
    setPanelData(null);

    const unsub = subscribeToPanel(activePanelId, (data) => {
      setPanelData(data);
      setPulse(true);
      setTimeout(() => setPulse(false), 600);

      // Append to history (keep last 20)
      setHistory((prev) => {
        const newPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          ratio: data.ratio,
          voltage: data.voltage,
          power: data.actualPower,
        };
        const next = [...prev, newPoint];
        return next.slice(-20);
      });
    });

    // Seed with initial history
    setHistory(generateHistory(
      panels.find((p) => p.id === activePanelId)?.ratio ?? 0.9
    ));

    return unsub;
  }, [activePanelId]);

  const handleIntervalChange = (e) => {
    const val = parseInt(e.target.value);
    setIntervalVal(val);
    setReportingInterval(activePanelId, val);
  };

  const handlePanelChange = (id) => {
    setActivePanelId(id);
    const p = panels.find((panel) => panel.id === id);
    setIntervalVal(p?.reportingInterval ?? 1800);
  };

  if (!panelData) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <Sun size={28} style={{ color: '#F59E0B', opacity: 0.6 }} />
        <p style={{ color: '#475569', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
          Connecting to panel…
        </p>
      </div>
    );
  }

  const status = getStatus(panelData.ratio);
  const powerLoss = panelData.expectedPower - panelData.actualPower;
  const efficiencyDrop = ((1 - panelData.ratio) * 100).toFixed(1);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        padding: '24px',
        fontFamily: 'var(--font-display)',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* ── Header ── */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: '#BA7517',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sun size={18} style={{ color: '#FFF' }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#F0F4FF',
                  letterSpacing: '-0.01em',
                }}
              >
                SolarIQ
              </h1>
              <p style={{ fontSize: 10, color: '#475569', letterSpacing: '0.08em' }}>
                PANEL MONITOR
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PanelSelector
              panels={panels}
              activePanelId={activePanelId}
              onChange={handlePanelChange}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                background: '#0C1220',
                border: '0.5px solid #1E293B',
                borderRadius: 99,
              }}
            >
              <Wifi
                size={12}
                style={{
                  color: status.color,
                  animation: 'pulse 2s infinite',
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: '#94A3B8',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Live · ESP32
              </span>
            </div>
          </div>
        </header>

        {/* ── Alert banner ── */}
        {status.key === 'critical' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              background: 'rgba(239,68,68,0.07)',
              border: '0.5px solid rgba(239,68,68,0.25)',
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <AlertTriangle size={15} style={{ color: '#EF4444', flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: '#EF4444', fontWeight: 500 }}>
              Critical soiling detected on {panels.find(p => p.id === activePanelId)?.label ?? 'this panel'} —
              efficiency is below 75%. Clean immediately to restore output.
            </p>
          </div>
        )}

        {/* ── Main layout ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '420px 1fr',
            gap: 14,
            alignItems: 'start',
          }}
        >

          {/* ── LEFT: Panel visualisation ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Panel card */}
            <div
              style={{
                background: '#0C1220',
                border: `0.5px solid ${status.colorBorder}`,
                borderRadius: 22,
                padding: '28px 24px 22px',
                transition: 'border-color .5s',
              }}
            >
              {/* Ring + panel grid */}
              <div
                style={{
                  position: 'relative',
                  width: 190,
                  height: 190,
                  margin: '0 auto 20px',
                }}
              >
                <PanelGrid ratio={panelData.ratio} color={status.color} pulse={pulse} />
                <RatioRing ratio={panelData.ratio} color={status.color} pulse={pulse} />

                {/* Centre number */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 46,
                      fontWeight: 700,
                      color: status.color,
                      lineHeight: 1,
                      fontFamily: 'var(--font-mono)',
                      transition: 'color .5s',
                    }}
                  >
                    {Math.round(panelData.ratio * 100)}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      color: status.color,
                      opacity: 0.5,
                      marginTop: 2,
                      transition: 'color .5s',
                    }}
                  >
                    %
                  </span>
                </div>
              </div>

              {/* Status label */}
              <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <StatusBadge ratio={panelData.ratio} />
                <p style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>
                  {status.sub} · Soiling ratio
                </p>
              </div>

              {/* Threshold legend */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 14,
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: '0.5px solid #1E293B',
                }}
              >
                {[
                  { label: 'Critical', color: '#EF4444', threshold: '< 75%' },
                  { label: 'Warning',  color: '#F59E0B', threshold: '< 88%' },
                  { label: 'Optimal',  color: '#14B8A6', threshold: '≥ 88%' },
                ].map(({ label, color, threshold }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--font-mono)' }}>
                      {label} {threshold}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info rows */}
            <InfoRow
              icon={<Clock size={14} />}
              label="LAST MAINTENANCE"
              value={panelData.lastCleaned}
              accent="#818CF8"
            />
            <InfoRow
              icon={<Thermometer size={14} />}
              label="PANEL TEMPERATURE"
              value={`${panelData.temperature}°C`}
              accent="#F59E0B"
            />

            {/* Reporting interval */}
            <div
              style={{
                background: '#0C1220',
                border: '0.5px solid #1E293B',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <p style={{ fontSize: 9, color: '#475569', letterSpacing: '0.05em' }}>
                  REPORTING INTERVAL
                </p>
                <p style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 500, marginTop: 2 }}>
                  {INTERVAL_OPTIONS.find((o) => o.value === interval)?.label ?? 'Custom'}
                </p>
              </div>
              <select
                value={interval}
                onChange={handleIntervalChange}
                style={{
                  background: '#111827',
                  border: '0.5px solid #1E293B',
                  color: '#94A3B8',
                  fontSize: 11,
                  padding: '4px 8px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {INTERVAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── RIGHT: Metrics + chart ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Power metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <MetricCard
                icon={<Zap size={15} />}
                label="EXPECTED POWER"
                value={panelData.expectedPower}
                unit="W"
                accent="#378ADD"
              />
              <MetricCard
                icon={<Activity size={15} />}
                label="ACTUAL POWER"
                value={panelData.actualPower}
                unit="W"
                accent={status.color}
              />
              <MetricCard
                icon={<Gauge size={15} />}
                label="VOLTAGE"
                value={panelData.voltage}
                unit="V"
                accent="#A78BFA"
              />
              <MetricCard
                icon={<Activity size={15} />}
                label="CURRENT"
                value={panelData.current}
                unit="A"
                accent="#34D399"
              />
            </div>

            {/* Power loss card */}
            <div
              style={{
                background: '#0C1220',
                border: '0.5px solid #1E293B',
                borderRadius: 14,
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: 'rgba(239,68,68,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Gauge size={15} style={{ color: '#EF4444' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 9, color: '#475569', letterSpacing: '0.04em' }}>POWER LOSS</p>
                    <p
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: '#EF4444',
                        fontFamily: 'var(--font-mono)',
                        lineHeight: 1.1,
                      }}
                    >
                      -{powerLoss}
                      <span style={{ fontSize: 12, color: '#7F1D1D', marginLeft: 3 }}>W</span>
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>EFFICIENCY DROP</p>
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#EF4444',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {efficiencyDrop}%
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div
                style={{
                  height: 3,
                  background: '#06090F',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${efficiencyDrop}%`,
                    background: '#EF4444',
                    borderRadius: 99,
                    transition: 'width 1s ease',
                  }}
                />
              </div>
            </div>

            {/* Chart */}
            <div
              style={{
                background: '#0C1220',
                border: '0.5px solid #1E293B',
                borderRadius: 14,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <p style={{ fontSize: 10, color: '#475569', letterSpacing: '0.06em' }}>
                  SOILING RATIO — HISTORY
                </p>
                <span
                  style={{
                    fontSize: 10,
                    color: status.color,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {Math.round(panelData.ratio * 100)}% now
                </span>
              </div>
              <div style={{ height: 160 }}>
                <Chart data={history} dataKey="ratio" showArea={true} />
              </div>
            </div>

            {/* Tip */}
            <div
              style={{
                background: 'rgba(20,184,166,0.05)',
                border: '0.5px solid rgba(20,184,166,0.18)',
                borderRadius: 12,
                padding: '11px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: 'rgba(20,184,166,0.1)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Droplets size={14} style={{ color: '#14B8A6' }} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#14B8A6' }}>Pro tip</p>
                <p style={{ fontSize: 10, color: '#475569', marginTop: 2, lineHeight: 1.5 }}>
                  Harmattan dust can cut efficiency by 26–53%. Schedule cleaning before 9 AM for
                  best results, and set your reporting interval to 30 sec during high-dust periods.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
};

export default Dashboard;