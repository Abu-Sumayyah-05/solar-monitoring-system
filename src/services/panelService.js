
// Utility function to set all panel config values at once (call manually when needed)
export const setPanelConfigExample = () => {
  setPanelArea('panel-001', 1.25);           // Sets panelArea to 1.25 for panel-001
  setPanelEfficiency('panel-001', 0.18);     // Sets panelEfficiency to 0.18 for panel-001
  setReportingInterval('panel-001', 1800);   // Sets reportingInterval to 1800 for panel-001
};

// ─── Mark panel as cleaned ────────────────────────────────────────────────
// Updates /panels/{panelId}/latest/lastCleaned to the current date string
export const markPanelAsCleaned = (panelId) => {
  const now = new Date();
  const dateString = now.toISOString().split('T')[0]; // e.g., '2026-04-27'
  return set(ref(db, `panels/${panelId}/latest/lastCleaned`), dateString);
};
import { db } from '../firebase';
import {
  ref,
  onValue,
  get,
  set,
  push,
  query,
  limitToLast,
  serverTimestamp,
} from 'firebase/database';

// ─── Get all panels (for PanelSelector dropdown) ─────────────────────────────
// Reads from /panels and returns id, label, location, reportingInterval

export const getPanels = async () => {
  const snap = await get(ref(db, 'panels'));
  if (!snap.exists()) return [];

  return Object.entries(snap.val()).map(([id, p]) => ({
    id,
    label: p.meta?.label ?? id,
    location: p.meta?.location ?? '',
    reportingInterval: p.reportingInterval ?? 1800,
  }));
};

// ─── Subscribe to one panel's live data ──────────────────────────────────────
// Listens to /panels/{panelId}/latest in real time.
// Calls callback(data) every time ESP32 writes a new reading.
// Returns an unsubscribe function — call it when component unmounts.

export const subscribeToPanel = (panelId, callback) => {
  const latestRef = ref(db, `panels/${panelId}/latest`);

  const unsub = onValue(latestRef, (snap) => {
    if (snap.exists()) {
      const data = snap.val();
      callback({
        ...data,
        // Ensure these fields always exist with fallbacks
        expectedPower: data.expectedPower ?? 1000,
        actualPower: data.actualPower ?? Math.round((data.ratio ?? 0.9) * 1000),
        lastCleaned: data.lastCleaned ?? 'Unknown',
        temperature: data.temperature ?? 0,
        voltage: data.voltage ?? 0,
        current: data.current ?? 0,
        lux: data.lux ?? 0,
      });
    }
  });

  return unsub;
};

// ─── Get chart history for a panel ───────────────────────────────────────────
// Reads the last 20 records from /history/{panelId}
// Returns array sorted oldest → newest with a formatted `time` field

export const generateHistory = async (panelId) => {
  const histQuery = query(
    ref(db, `history/${panelId}`),
    limitToLast(20)
  );

  const snap = await get(histQuery);
  if (!snap.exists()) return [];

  return Object.values(snap.val())
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
    .map((r) => ({
      ...r,
      time: r.timestamp
        ? new Date(r.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '--:--',
      ratio: r.ratio ?? 0,
      voltage: r.voltage ?? 0,
      current: r.current ?? 0,
      lux: r.lux ?? 0,
      actualPower: r.actualPower ?? 0,
      expectedPower: r.expectedPower ?? 0,
      power: r.power ?? r.actualPower ?? 0,
    }));
};

// ─── Save reporting interval ──────────────────────────────────────────────────
// Writes to /panels/{panelId}/reportingInterval
// ESP32 reads this value before going to deep sleep

export const setReportingInterval = (panelId, seconds) => {
  return set(ref(db, `panels/${panelId}/reportingInterval`), seconds);
};

// ─── Push a history record ────────────────────────────────────────────────────
// Called by ESP32 firmware (not the dashboard).
// Shown here so you understand the exact write shape.
// In Arduino: Firebase.RTDB.pushJSON(&fbdo, "/history/panel-001", &json)

export const pushHistoryRecord = (panelId, record) => {
  return push(ref(db, `history/${panelId}`), {
    ...record,
    timestamp: Date.now(),
  });
};

// ─── Save panel area ─────────────────────────────────────────────────────────
// Writes to /panels/{panelId}/panelArea
export const setPanelArea = (panelId, area) => {
  return set(ref(db, `panels/${panelId}/panelArea`), area);
};

// ─── Save panel efficiency ───────────────────────────────────────────────────
// Writes to /panels/{panelId}/panelEfficiency
export const setPanelEfficiency = (panelId, efficiency) => {
  return set(ref(db, `panels/${panelId}/panelEfficiency`), efficiency);
};