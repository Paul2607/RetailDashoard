// scripts/get-ip.js
const os = require('os');
const fs = require('fs');

// Funktion zum Finden der IPv4-Adresse
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
  return 'localhost';
}

// IP-Adresse ermitteln
const ip = getLocalIpAddress();

// .env Datei erstellen/aktualisieren
const envContent = `REACT_APP_SERVER_IP=${ip}\n`;
fs.writeFileSync('.env', envContent);

console.log('IP address set to:', ip);