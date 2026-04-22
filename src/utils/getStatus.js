/**
 * Centralized status logic for solar panel efficiency
 * @param {number} ratio - Soiling ratio (0-1)
 * @returns {Object} Status configuration
 */
export const getStatus = (ratio) => {
  if (ratio >= 0.88) {
    return {
      label: 'Optimal',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      icon: 'check',
      description: 'Peak performance'
    };
  }
  if (ratio >= 0.75) {
    return {
      label: 'Warning',
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      icon: 'alert',
      description: 'Performance degraded'
    };
  }
  return {
    label: 'Critical',
    color: 'bg-rose-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    icon: 'alert-triangle',
    description: 'Immediate cleaning required'
  };
};

/**
 * Format ratio as percentage
 */
export const formatPercentage = (ratio) => {
  return `${(ratio * 100).toFixed(1)}%`;
};

/**
 * Format timestamp to readable time
 */
export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};