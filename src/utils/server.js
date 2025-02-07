// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const os = require('os');
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const DATA_FILE = path.join(__dirname, '..', 'data', 'sensorData.json');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');
const MAX_BACKUPS = 5;

// Cache für häufig abgefragte Daten
let dataCache = null;
let lastDataRead = 0;
const CACHE_TIMEOUT = 5000; // 5 Sekunden Cache-Timeout

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Nur IPv4 und keine internen Adressen
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback auf localhost
}

async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating backup directory:', error);
  }
}

async function manageBackups() {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const backups = files.filter(f => f.startsWith('sensorData') && f.endsWith('.backup'));
    
    if (backups.length >= MAX_BACKUPS) {
      const sortedBackups = backups
        .map(f => ({
          name: f,
          time: new Date(f.split('.')[1]).getTime()
        }))
        .sort((a, b) => a.time - b.time);

      while (sortedBackups.length >= MAX_BACKUPS) {
        const oldest = sortedBackups.shift();
        await fs.unlink(path.join(BACKUP_DIR, oldest.name));
      }
    }
  } catch (error) {
    console.error('Error managing backups:', error);
  }
}

async function readCurrentData(forceRefresh = false) {
  const now = Date.now();
  
  // Verwende Cache wenn möglich
  if (!forceRefresh && dataCache && (now - lastDataRead) < CACHE_TIMEOUT) {
    return dataCache;
  }
  
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    
    // Aktualisiere Cache
    dataCache = {
      sensors: parsedData.sensors || [],
      rooms: parsedData.rooms || [],
      assets: parsedData.assets || [],
      categories: parsedData.categories || [],
      favorites: parsedData.favorites || []
    };
    lastDataRead = now;
    
    return dataCache;
  } catch (error) {
    console.error('Error reading file:', error);
    return {
      sensors: [],
      rooms: [],
      assets: [],
      categories: [],
      favorites: []
    };
  }
}

async function writeData(data) {
  try {
    await ensureBackupDir();
    
    // Erstelle Backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `sensorData.${timestamp}.backup`);
    await fs.copyFile(DATA_FILE, backupFile);
    
    await manageBackups();
    
    // Schreibe neue Daten
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    // Aktualisiere Cache
    dataCache = data;
    lastDataRead = Date.now();
    
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
}

// Bestehende Endpunkte
app.get('/api/data', async (req, res) => {
  try {
    const data = await readCurrentData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const newData = req.body;
    
    if (!newData || !newData.sensors) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    await writeData(newData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Neuer Endpunkt für IP-Adresse
app.get('/api/ip', (req, res) => {
  const ipAddress = getLocalIpAddress();
  res.json({ ip: ipAddress });
});

// Neuer Endpunkt für partielle Updates
app.patch('/api/data/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const updateData = req.body;
    
    const data = await readCurrentData(true);
    if (!data[entityType]) {
      return res.status(404).json({ error: `Entity type ${entityType} not found` });
    }

    const index = data[entityType].findIndex(item => item.id.toString() === entityId);
    if (index === -1) {
      return res.status(404).json({ error: `Entity with id ${entityId} not found` });
    }

    // Nur geänderte Felder aktualisieren
    data[entityType][index] = {
      ...data[entityType][index],
      ...updateData
    };

    await writeData(data);
    res.json(data[entityType][index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  const ipAddress = getLocalIpAddress();
  console.log(`Server running on:`);
  console.log(`- Local:   http://localhost:${PORT}`);
  console.log(`- Network: http://${ipAddress}:${PORT}`);
});