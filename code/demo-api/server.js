const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Load sample data from JSON file
const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const { terminals, berths } = data;

// Validate GLN pattern
function isValidGln(gln) {
  return /^[1-9][0-9]{12,}$/.test(gln);
}

// GET /terminals - Returns GLN and name for all terminals
app.get('/terminals', (req, res) => {
  const result = terminals.map(terminal => ({
    gln: terminal.gln,
    name: terminal.name,
    ...(terminal.shortName && { shortName: terminal.shortName })
  }));
  res.json(result);
});

// GET /terminals/:gln - Returns detailed terminal information with berths
app.get('/terminals/:gln', (req, res) => {
  const { gln } = req.params;

  if (!isValidGln(gln)) {
    return res.status(400).json({ error: 'Invalid GLN format' });
  }

  const terminal = terminals.find(t => t.gln === gln);

  if (!terminal) {
    return res.status(404).json({ error: 'Terminal not found' });
  }

  const result = {
    gln: terminal.gln,
    name: terminal.name,
    ...(terminal.shortName && { shortName: terminal.shortName }),
    geoCoordinate: terminal.geoCoordinate,
    portFacilityNumber: terminal.portFacilityNumber,
    terminalType: terminal.terminalType,
    berths: terminal.berths.map(berth => ({
      gln: berth.gln,
      name: berth.name
    }))
  };

  res.json(result);
});

// GET /berths/:gln - Returns detailed berth information with berth positions
app.get('/berths/:gln', (req, res) => {
  const { gln } = req.params;

  if (!isValidGln(gln)) {
    return res.status(400).json({ error: 'Invalid GLN format' });
  }

  const berth = berths.find(b => b.gln === gln);

  if (!berth) {
    return res.status(404).json({ error: 'Berth not found' });
  }

  const result = {
    gln: berth.gln,
    name: berth.name,
    ...(berth.shortName && { shortName: berth.shortName }),
    berthType: berth.berthType,
    unloCode: berth.unloCode,
    geoCoordinates: berth.geoCoordinates,
    ...(berth.positions && berth.positions.length > 0 && { positions: berth.positions })
  };

  res.json(result);
});

// GET /fetchAll - Returns all information as a complete dataset
app.get('/fetchAll', (req, res) => {
  const result = terminals.map(terminal => {
    // Get full berth details for each terminal's berths
    const berthsWithPositions = terminal.berths.map(terminalBerth => {
      const fullBerth = berths.find(b => b.gln === terminalBerth.gln);
      if (fullBerth) {
        return {
          gln: fullBerth.gln,
          name: fullBerth.name,
          ...(fullBerth.shortName && { shortName: fullBerth.shortName }),
          berthType: fullBerth.berthType,
          unloCode: fullBerth.unloCode,
          geoCoordinates: fullBerth.geoCoordinates,
          ...(fullBerth.positions && fullBerth.positions.length > 0 && { positions: fullBerth.positions })
        };
      }
      // Fallback if berth details not found
      return {
        gln: terminalBerth.gln,
        name: terminalBerth.name,
        berthType: 'Unknown',
        unloCode: 'NLRTM',
        geoCoordinates: []
      };
    });

    return {
      gln: terminal.gln,
      name: terminal.name,
      ...(terminal.shortName && { shortName: terminal.shortName }),
      geoCoordinate: terminal.geoCoordinate,
      portFacilityNumber: terminal.portFacilityNumber,
      terminalType: terminal.terminalType,
      berths: berthsWithPositions
    };
  });

  if (result.length === 0) {
    return res.status(404).json({ error: 'No terminals and berths found' });
  }

  res.json(result);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Nautical API server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /terminals          - List all terminals`);
  console.log(`  GET /terminals/:gln     - Get terminal details with berths`);
  console.log(`  GET /berths/:gln        - Get berth details with positions`);
  console.log(`  GET /fetchAll           - Get all data`);
  console.log(`  GET /health             - Health check`);
});

module.exports = app;
