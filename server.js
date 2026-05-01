// PATCH endpoint to update any panel data fields for a panel
app.patch('/api/panel-data/:panelId', async (req, res) => {
  const { panelId } = req.params;
  const updateFields = req.body;
  if (!panelId || typeof updateFields !== 'object' || Array.isArray(updateFields)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  // Constant panel efficiency value
  const panelEfficiency = 21;
  try {
    await db.ref(`panels/${panelId}/latest`).update(updateFields);
    res.status(200).json({ message: 'Panel data updated', panelId, updated: updateFields });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Firebase Admin SDK setup
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Place your Firebase service account key here

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || '<YOUR_DATABASE_URL>' // Replace with your database URL or use env
  });
}

const db = admin.database();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// In-memory storage for received panel data
let panelData = [];

// POST endpoint to receive panel data from hardware
app.post('/api/panel-data', (req, res) => {
  const {
    panelId,
    lux,
    voltage,
    current,
    actualPower,
    expectedPower,
    ratio,
    timestamp
  } = req.body;
  if (
    !panelId ||
    lux === undefined ||
    voltage === undefined ||
    current === undefined ||
    actualPower === undefined ||
    expectedPower === undefined ||
    ratio === undefined ||
    !timestamp
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Store the data in memory
  panelData.push({
    panelId,
    lux,
    voltage,
    current,
    actualPower,
    expectedPower,
    ratio,
    timestamp
  });
  console.log('Received data:', {
    panelId,
    lux,
    voltage,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                current,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                actualPower,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                expectedPower,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ratio,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                sensor1,
    sensor2,
    timestamp
  });
  res.status(200).json({ message: 'Data received successfully' });
});

// GET endpoint to view all received panel data
app.get('/api/panel-data', (req, res) => {
  res.json(panelData);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
