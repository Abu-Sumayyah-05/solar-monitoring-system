/**
 * Single source of truth for soiling ratio thresholds.
 * Used by Dashboard, Chart, StatusBadge — everywhere.
 *
 * ratio >= 0.88  → optimal
 * ratio >= 0.75  → warning
 * ratio <  0.75  → critical
 */
export const getStatus = (ratio) => {
  if (ratio < 0.75) {
    return {
      key: 'critical',
      label: 'Critical',
      sub: 'Clean immediately',
      badge: 'Critical',
      color: '#EF4444',
      colorDim: 'rgba(239,68,68,0.12)',
      colorBorder: 'rgba(239,68,68,0.25)',
    };
  }
  if (ratio < 0.88) {
    return {
      key: 'warning',
      label: 'Warning',
      sub: 'Needs cleaning soon',
      badge: 'Warning',
      color: '#F59E0B',
      colorDim: 'rgba(245,158,11,0.12)',
      colorBorder: 'rgba(245,158,11,0.25)',
    };
  }
  return {
    key: 'optimal',
    label: 'Optimal',
    sub: 'Performing well',
    badge: 'Optimal',
    color: '#14B8A6',
    colorDim: 'rgba(20,184,166,0.12)',
    colorBorder: 'rgba(20,184,166,0.25)',
  };
};