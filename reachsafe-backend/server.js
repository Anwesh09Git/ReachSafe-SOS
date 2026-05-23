import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment configuration variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows our server to read JSON incoming data payloads

// Temporary In-Memory Database Array to hold incoming SOS alerts
const emergencyLog = [];

// API Endpoint 1: Health Check / Home Route
app.get('/', (req, res) => {
  res.send('ReachSafe Secure Core Backend Engine Operational.');
});

// API Endpoint 2: Receive Live SOS Telemetry from Frontend Node
app.post('/api/sos/trigger', (req, res) => {
  const { email, lat, lng, timestamp } = req.body;

  // Structural Data Validation Validation
  if (!email || !lat || !lng) {
    return res.status(400).json({ success: false, message: 'Invalid telemetry structure.' });
  }

  const alertPayload = {
    id: `ALERT_${Date.now()}`,
    email,
    coordinates: { lat, lng },
    timestamp: timestamp || new Date().toISOString()
  };

  // Push incoming coordinates data straight into our system array log
  emergencyLog.push(alertPayload);
  
  console.log(`🚨 EMERGENCY NODE TRIGGERED BY [${email}] -> Lat: ${lat}, Lng: ${lng}`);

  res.status(201).json({
    success: true,
    message: 'SOS Alert locked and logged successfully.',
    alertId: alertPayload.id
  });
});

// API Endpoint 3: Fetch Active SOS History (For Dashboard Monitors)
app.get('/api/sos/history', (req, res) => {
  res.json(emergencyLog);
});

// Launch Server Listening State
app.listen(PORT, () => {
  console.log(`🚀 ReachSafe core backend server streaming live on port ${PORT}`);
});