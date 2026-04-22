/**
 * panelService.js
 *
 * All functions here are Firebase-ready. Each function has a comment
 * showing the exact Firebase Realtime Database call that replaces it.
 *
 * When you're ready to connect Firebase:
 *  1. Run: npm install firebase
 *  2. Create src/firebase.js (see Firebase Setup guide)
 *  3. Replace each function body with the Firebase call shown in its comment
 */

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PANELS = [
  {
    id: 'panel-001',
    label: 'Panel 001',
    location: 'Roof Section A',
    ratio: 0.92,
    voltage: 18.4,
    current: 2.1,
    lux: 54000,
    expectedPower: 1000,
    actualPower: 920,
    temperature: 45.2,
    lastCleaned: '2 days ago',
    reportingInterval: 1800,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'panel-002',
    label: 'Panel 002',
    location: 'Roof Section B',
    ratio: 0.76,
    voltage: 17.1,
    current: 1.7,
    lux: 49000,
    expectedPower: 1000,
    actualPower: 760,
    temperature: 46.8,
    lastCleaned: '5 days ago',
    reportingInterval: 1800,
    timestamp: new Date().toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate mock historical readings for the chart.
 * Replace with: firebase.database().ref(`history/${panelId}`).limitToLast(20).once('value')
 */
export const generateHistory = (baseRatio, points = 20) => {
  const history = [];
  let r = baseRatio;
  for (let i = points; i >= 0; i--) {
    r = Math.max(0.6, Math.min(1.0, r + (Math.random() - 0.5) * 0.06));
    history.push({
      time: new Date(Date.now() - i * 300_000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ratio: parseFloat(r.toFixed(3)),
      voltage: parseFloat((17.5 + Math.random() * 2).toFixed(1)),
      power: parseFloat((r * 1000).toFixed(0)),
    });
  }
  return history;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get all registered panels (metadata only — no live data).
 *
 * Firebase replacement:
 *   const snap = await get(ref(db, 'panels'));
 *   return Object.entries(snap.val()).map(([id, p]) => ({ id, ...p.meta, reportingInterval: p.reportingInterval }));
 */
export const getPanels = () => {
  return Promise.resolve(
    MOCK_PANELS.map(({ id, label, location, reportingInterval }) => ({
      id,
      label,
      location,
      reportingInterval,
    }))
  );
};

/**
 * Get a single panel's latest reading + history.
 *
 * Firebase replacement:
 *   const [latestSnap, histSnap] = await Promise.all([
 *     get(ref(db, `panels/${id}/latest`)),
 *     get(ref(db, `history/${id}`)),
 *   ]);
 *   const latest = latestSnap.val();
 *   const history = Object.values(histSnap.val() || {})
 *     .sort((a, b) => a.timestamp - b.timestamp)
 *     .map(r => ({ ...r, time: new Date(r.timestamp).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) }));
 *   return { ...latest, history };
 */
export const getPanelById = (id) => {
  const panel = MOCK_PANELS.find((p) => p.id === id);
  if (!panel) return Promise.resolve(null);
  return Promise.resolve({
    ...panel,
    history: generateHistory(panel.ratio),
    alerts: panel.ratio < 0.75 ? ['Low efficiency detected', 'Cleaning recommended'] : [],
  });
};

/**
 * Subscribe to real-time updates for ONE panel.
 * Simulates Firebase onValue() — returns an unsubscribe function.
 *
 * Firebase replacement:
 *   const panelRef = ref(db, `panels/${panelId}/latest`);
 *   const unsub = onValue(panelRef, (snap) => callback(snap.val()));
 *   return unsub;
 */
export const subscribeToPanel = (panelId, callback, intervalMs = 3000) => {
  let panel = MOCK_PANELS.find((p) => p.id === panelId);
  if (!panel) return () => {};

  // Emit initial value immediately
  callback({ ...panel });

  const id = setInterval(() => {
    const fluctuation = (Math.random() - 0.5) * 0.015;
    panel = {
      ...panel,
      ratio: parseFloat(
        Math.max(0.6, Math.min(1.0, panel.ratio + fluctuation)).toFixed(3)
      ),
      voltage: parseFloat(
        (panel.voltage + (Math.random() - 0.5) * 0.3).toFixed(1)
      ),
      current: parseFloat(
        (panel.current + (Math.random() - 0.5) * 0.1).toFixed(2)
      ),
      temperature: parseFloat(
        (panel.temperature + (Math.random() - 0.5) * 0.5).toFixed(1)
      ),
      actualPower: Math.round(panel.ratio * 1000),
      timestamp: new Date().toISOString(),
    };
    callback({ ...panel });
  }, intervalMs);

  return () => clearInterval(id);
};

/**
 * Save a new reporting interval for a panel.
 *
 * Firebase replacement:
 *   return set(ref(db, `panels/${panelId}/reportingInterval`), seconds);
 */
export const setReportingInterval = (panelId, seconds) => {
  const panel = MOCK_PANELS.find((p) => p.id === panelId);
  if (panel) panel.reportingInterval = seconds;
  return Promise.resolve();
};

/**
 * Push a new history record (called by ESP32 firmware via Firebase, not the dashboard).
 * Shown here so you understand the write shape.
 *
 * Firebase replacement:
 *   return push(ref(db, `history/${panelId}`), {
 *     ratio, voltage, lux, timestamp: serverTimestamp()
 *   });
 */
export const pushHistoryRecord = (panelId, record) => {
  return Promise.resolve();
};