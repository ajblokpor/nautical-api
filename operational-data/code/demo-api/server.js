const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load sample data from JSON file
const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const { arrivals, departures } = data;

app.get('/port-arrival/:shipReportingSystemEntryPortCode/:shipImoNumber/:shipStayReferenceNumber', (req, res) => {
  var { shipReportingSystemEntryPortCode, shipImoNumber, shipStayReferenceNumber } = req.params;

  const arrival = arrivals.find(a => a.shipReportingSystemEntryPortCode === shipReportingSystemEntryPortCode && a.shipImoNumber === shipImoNumber && a.shipStayReferenceNumber === shipStayReferenceNumber);
  if (arrival) {
    return res.json(arrival);
  }
  res.status(404).json({ error: 'Not found' });
});

app.get('/port-departure/:shipReportingSystemEntryPortCode/:shipImoNumber/:shipStayReferenceNumber', (req, res) => {
  var { shipReportingSystemEntryPortCode, shipImoNumber, shipStayReferenceNumber } = req.params;

  const departure = departures.find(d => d.shipReportingSystemEntryPortCode === shipReportingSystemEntryPortCode && d.shipImoNumber === shipImoNumber && d.shipStayReferenceNumber === shipStayReferenceNumber);
  if (departure) {
    return res.json(departure);
  }
  res.status(404).json({ error: 'Not found' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Operational demo API listening on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /port-arrival/:shipReportingSystemEntryPortCode/:shipImoNumber/:shipStayReferenceNumber - Request Operational Data for Port Arrival`);
  console.log(`  GET /port-departure/:shipReportingSystemEntryPortCode/:shipImoNumber/:shipStayReferenceNumber - Request Operational Data for Port Departure`);
  console.log('  GET /health');
});

module.exports = app;