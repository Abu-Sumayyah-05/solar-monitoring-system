import React from 'react';
import { getStatus } from '../utils/getStatus';

/**
 * StatusBadge
 * Displays a colour-coded pill for the panel's current soiling status.
 * Uses getStatus() as the single source of truth for thresholds.
 */
const StatusBadge = ({ ratio }) => {
  const { label, color, colorDim } = getStatus(ratio);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 500,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em',
        background: colorDim,
        color: color,
        border: `0.5px solid ${color}44`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
};

export default StatusBadge;