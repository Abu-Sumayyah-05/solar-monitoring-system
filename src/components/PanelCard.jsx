import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowUpRight } from 'lucide-react';

const PanelCard = ({ panel, index }) => {
  const efficiency = panel.ratio;
  const color =
    efficiency >= 0.85 ? 'bg-green-500' :
    efficiency >= 0.7 ? 'bg-yellow-500' :
    'bg-red-500';

  return (
    <Link
      to={`/panel/${panel.id}`}
      className="block border rounded-lg p-4 shadow hover:shadow-md transition"
    >
      {/* Header */}
      <div className="flex justify-between mb-3">
        <span className="text-sm font-bold">{panel.id}</span>
        <span className="text-sm font-semibold">
          {(efficiency * 100).toFixed(1)}%
        </span>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-200 h-2 rounded mb-3">
        <div
          className={`h-2 rounded ${color}`}
          style={{ width: `${efficiency * 100}%` }}
        />
      </div>

      {/* Voltage + Ratio */}
      <div className="text-sm space-y-1">
        <p>
          ⚡ Voltage: {panel.expectedVoltage ?? 'N/A'}V / {panel.actualVoltage ?? panel.voltage ?? 'N/A'}V
        </p>
        <p className="flex items-center gap-1">
          <Zap size={14} /> Soiling: {(efficiency * 100).toFixed(1)}%
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-3 text-xs text-gray-500">
        <span>{panel.timestamp}</span>
        <span className="flex items-center gap-1">
          Details <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
};

export default PanelCard;