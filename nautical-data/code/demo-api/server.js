const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load sample data from JSON file
const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const { terminals, berths } = data;

if(terminals === undefined || berths === undefined) {
  console.error('Terminals and/or berths data is undefined.');
  process.exit(1);
}

if(terminals.length === 0 || berths.length === 0) {
  console.error('No terminals or berths found in the data.');
  process.exit(1);
}

// Validate GLN pattern
function isValidGln(gln) {
  return /^[1-9][0-9]{12,}$/.test(gln);
}

let errorInData = false;
for(const terminal of terminals) {
  if(!isValidGln(terminal.gln)) {
    console.error(`Invalid GLN format for terminal: ${terminal.name} (${terminal.gln})`);
    errorInData = true;
  }
  if(!terminal.name) {
    console.error(`Terminal name is missing for GLN: ${terminal.gln}`);
    errorInData = true;
  }
  if(!terminal.geoCoordinate || !terminal.geoCoordinate.latitude || !terminal.geoCoordinate.longitude) {
    console.error(`Geo coordinates are missing or incomplete for terminal: ${terminal.name} (${terminal.gln})`);
    errorInData = true;
  }
  if(!terminal.berths) {
    console.error(`Berths array is missing for terminal: ${terminal.name} (${terminal.gln})`);
    errorInData = true;
  }
  if(terminal.berths && terminal.berths.length > 0) {
    for(const berth of terminal.berths) {
      if(!isValidGln(berth.gln)) {
        console.error(`Invalid GLN format for berth: ${berth.name} (${berth.gln}) in terminal: ${terminal.name}`);
        errorInData = true;
      }
      if(!berth.name) {
        console.error(`Berth name is missing for GLN: ${berth.gln} in terminal: ${terminal.name}`);
        errorInData = true;
      }
      if(!berths.find(b => b.gln === berth.gln)) {
        console.error(`Berth with GLN ${berth.gln} referenced in terminal ${terminal.name} not found in berths data.`);
        errorInData = true;
      }
    }
  }
}

for(const berth of berths) {
  if(!isValidGln(berth.gln)) {
    console.error(`Invalid GLN format for berth: ${berth.name} (${berth.gln})`);
    errorInData = true;
  }
  if(!berth.name) {
    console.error(`Berth name is missing for GLN: ${berth.gln}`);
    errorInData = true;
  }
  if(!berth.geoCoordinates || !Array.isArray(berth.geoCoordinates) || berth.geoCoordinates.length === 0) {
    console.error(`Geo coordinates are missing or incomplete for berth: ${berth.name} (${berth.gln})`);
    errorInData = true;
  }
  for(const position of berth.geoCoordinates) {
    if(!position.latitude || !position.longitude) {
      console.error(`Geo coordinate position is missing latitude or longitude for berth: ${berth.name} (${berth.gln})`);
      errorInData = true;
    }
  }

  if(berth.positions && Array.isArray(berth.positions)) {
    for(pos of berth.positions) {
      if(!pos.glnWithExt) {
        console.error(`Position is missing GLN with extension for berth: ${berth.name} (${berth.gln})`);
        errorInData = true;
      }
      if(!pos.name) {
        console.error(`Position name is missing for berth: ${berth.name} (${berth.gln})`);
        errorInData = true;
      }
      if(!pos.type) {
        console.error(`Position type is missing for berth: ${berth.name} (${berth.gln})`);
        errorInData = true;
      }
      if(!pos.geoCoordinate || !pos.geoCoordinate.latitude || !pos.geoCoordinate.longitude) {
        console.error(`Geo coordinate is missing or incomplete for position: ${pos.name} in berth: ${berth.name} (${berth.gln})`);
        errorInData = true;
      }
    }
  }
}

if(errorInData) {
  console.error('Errors found in data. Please fix the issues and restart the server.');
  process.exit(1);
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
