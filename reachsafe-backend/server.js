import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const emergencyLog = [];

app.get('/', (req, res) => {
  res.send('ReachSafe Secure Core Backend Engine Operational.');
});

app.post('/api/sos/trigger', (req, res) => {
  const { email, lat, lng, timestamp } = req.body;

  if (!email || !lat || !lng) {
    return res.status(400).json({ success: false, message: 'Invalid telemetry structure.' });
  }

  const alertPayload = {
    id: `ALERT_${Date.now()}`,
    email,
    coordinates: { lat, lng },
    timestamp: timestamp || new Date().toISOString()
  };

  emergencyLog.push(alertPayload);
  
  console.log(`🚨 EMERGENCY NODE TRIGGERED BY [${email}] -> Lat: ${lat}, Lng: ${lng}`);

  res.status(201).json({
    success: true,
    message: 'SOS Alert locked and logged successfully.',
    alertId: alertPayload.id
  });
});

app.get('/api/sos/history', (req, res) => {
  res.json(emergencyLog);
});

app.listen(PORT, () => {
  console.log(`🚀 ReachSafe core backend server streaming live on port ${PORT}`);
});
