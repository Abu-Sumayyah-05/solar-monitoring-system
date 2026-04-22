// Initial mock data mimicking ESP32 IoT sensor readings
const INITIAL_PANELS = [
  { 
    id: "panel-001", 
    ratio: 0.92, 
    voltage: 18.4, 
    current: 2.1, 
    timestamp: new Date().toISOString(),
    location: "Roof Section A",
    temperature: 45.2
  },
  { 
    id: "panel-002", 
    ratio: 0.85, 
    voltage: 17.9, 
    current: 1.9, 
    timestamp: new Date().toISOString(),
    location: "Roof Section B",
    temperature: 46.8
  },
  { 
    id: "panel-003", 
    ratio: 0.72, 
    voltage: 16.2, 
    current: 1.5, 
    timestamp: new Date().toISOString(),
    location: "Roof Section C",
    temperature: 48.1
  },
  { 
    id: "panel-004", 
    ratio: 0.95, 
    voltage: 19.1, 
    current: 2.3, 
    timestamp: new Date().toISOString(),
    location: "Roof Section A",
    temperature: 44.5
  },
  { 
    id: "panel-005", 
    ratio: 0.81, 
    voltage: 17.5, 
    current: 1.8, 
    timestamp: new Date().toISOString(),
    location: "Roof Section B",
    temperature: 47.2
  },
  { 
    id: "panel-006", 
    ratio: 0.68, 
    voltage: 15.8, 
    current: 1.4, 
    timestamp: new Date().toISOString(),
    location: "Roof Section C",
    temperature: 49.5
  },
];

/**
 * Generate mock historical data for charts
 */
const generateHistory = (baseRatio, points = 20) => {
  const history = [];
  let currentRatio = baseRatio;
  
  for (let i = points; i >= 0; i--) {
    const fluctuation = (Math.random() - 0.5) * 0.08;
    currentRatio = Math.max(0.6, Math.min(1.0, currentRatio + fluctuation));
    
    history.push({
      time: new Date(Date.now() - i * 300000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      ratio: Number(currentRatio.toFixed(3)),
      voltage: Number((18 + Math.random() * 2).toFixed(1)),
      power: Number((currentRatio * 40).toFixed(1))
    });
  }
  return history;
};

/**
 * Get all panels - replace with Firebase Realtime Database call
 * Example: firebase.database().ref('panels').once('value')
 */
export const getPanels = () => {
  return Promise.resolve([...INITIAL_PANELS]);
};

/**
 * Get single panel by ID - replace with Firebase call
 * Example: firebase.database().ref(`panels/${id}`).once('value')
 */
export const getPanelById = (id) => {
  const panel = INITIAL_PANELS.find(p => p.id === id);
  if (!panel) return Promise.resolve(null);
  
  return Promise.resolve({
    ...panel,
    history: generateHistory(panel.ratio),
    alerts: panel.ratio < 0.75 ? ['Low efficiency detected', 'Cleaning recommended'] : []
  });
};

/**
 * Simulate real-time IoT updates from ESP32 devices
 * This mimics Firebase onValue() listener behavior
 */
export const simulateIoTUpdate = (panels) => {
  return panels.map(panel => {
    // 70% chance of update per panel (simulating network jitter)
    if (Math.random() > 0.3) {
      const fluctuation = (Math.random() - 0.5) * 0.015;
      const newRatio = Math.max(0.6, Math.min(1.0, panel.ratio + fluctuation));
      
      return {
        ...panel,
        ratio: Number(newRatio.toFixed(3)),
        voltage: Number((panel.voltage + (Math.random() - 0.5) * 0.3).toFixed(1)),
        current: Number((panel.current + (Math.random() - 0.5) * 0.1).toFixed(2)),
        temperature: Number((panel.temperature + (Math.random() - 0.5) * 0.5).toFixed(1)),
        timestamp: new Date().toISOString()
      };
    }
    return panel;
  });
};

/**
 * Subscribe to real-time updates (simulates Firebase onValue)
 * Returns unsubscribe function
 */
export const subscribeToPanels = (callback, interval = 3000) => {
  let panels = [...INITIAL_PANELS];
  
  const intervalId = setInterval(() => {
    panels = simulateIoTUpdate(panels);
    callback(panels);
  }, interval);
  
  // Return unsubscribe function
  return () => clearInterval(intervalId);
};