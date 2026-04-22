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
  const { panelId, ratio, voltage, timestamp } = req.body;
  if (!panelId || ratio === undefined || voltage === undefined || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Store the data in memory
  panelData.push({ panelId, ratio, voltage, timestamp });
  console.log('Received data:', { panelId, ratio, voltage, timestamp });
  res.status(200).json({ message: 'Data received successfully' });
});

// GET endpoint to view all received panel data
app.get('/api/panel-data', (req, res) => {
  res.json(panelData);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
