// utils/server-api.js
import { dbOperations } from './db';

// Get IP from environment variable or fallback to localhost
const SERVER_IP = process.env.REACT_APP_SERVER_IP || 'localhost';
const API_BASE_URL = `http://${SERVER_IP}:3001/api`;

console.log('API Base URL:', API_BASE_URL);

class APIService {
  static async fetchAllData() {
    const response = await fetch(`${API_BASE_URL}/data`);
    const data = await response.json();
    return data;
  }

  static async updateData(data) {
    const response = await fetch(`${API_BASE_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Neue Methode für partielle Updates
  static async updatePartial(entityType, entityId, data) {
    const response = await fetch(`${API_BASE_URL}/data/${entityType}/${entityId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

class DataSyncService {
  constructor() {
    this.syncInProgress = false;
    this.pendingChanges = new Map();
  }

  async initialize() {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.syncInProgress = true;

    try {
      const serverData = await APIService.fetchAllData();
      await this.clearLocalDatabase();
      await this.populateLocalDatabase(serverData);

      this.syncInProgress = false;
      return serverData;
    } catch (error) {
      this.syncInProgress = false;
      console.error('Fehler bei der Datensynchronisation:', error);
      throw error;
    }
  }

  async clearLocalDatabase() {
    try {
      const stores = ['sensors', 'rooms', 'assets', 'categories', 'favorites'];
      for (const store of stores) {
        const items = await dbOperations[store].getAll();
        for (const item of items) {
          await dbOperations[store].remove(item.id);
        }
      }
    } catch (error) {
      console.error('Fehler beim Löschen der lokalen Datenbank:', error);
      throw error;
    }
  }

  async populateLocalDatabase(data) {
    try {
      const { sensors = [], rooms = [], assets = [], categories = [], favorites = [] } = data;

      for (const category of categories) {
        await dbOperations.categories.add(category);
      }

      for (const room of rooms) {
        await dbOperations.rooms.add(room);
      }

      for (const asset of assets) {
        await dbOperations.assets.add(asset);
      }

      for (const sensor of sensors) {
        await dbOperations.sensors.add(sensor);
      }

      for (const favorite of favorites) {
        await dbOperations.favorites.add(favorite);
      }
    } catch (error) {
      console.error('Fehler beim Befüllen der lokalen Datenbank:', error);
      throw error;
    }
  }

  async syncEntity(type, data) {
    try {
      // Füge Änderung zur Warteschlange hinzu
      if (!this.pendingChanges.has(type)) {
        this.pendingChanges.set(type, new Map());
      }
      this.pendingChanges.get(type).set(data.id, data);

      // Hole aktuelle Server-Daten
      const currentData = await APIService.fetchAllData();
      
      // Aktualisiere die entsprechende Entität
      if (!currentData[type]) {
        currentData[type] = [];
      }

      const index = currentData[type].findIndex(item => item.id === data.id);
      if (index >= 0) {
        currentData[type][index] = { ...currentData[type][index], ...data };
      } else {
        currentData[type].push(data);
      }

      // Update Server-Daten
      await APIService.updateData(currentData);

      // Update lokale DB
      await dbOperations[type].update(data);

      // Entferne verarbeitete Änderung
      this.pendingChanges.get(type).delete(data.id);

      return currentData;
    } catch (error) {
      console.error(`Fehler beim Synchronisieren von ${type}:`, error);
      throw error;
    }
  }

  async fetchAllData() {
    return APIService.fetchAllData();
  }

  async updateData(data) {
    return APIService.updateData(data);
  }
}

export const dataSync = new DataSyncService();
export default APIService;