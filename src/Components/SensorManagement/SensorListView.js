// SensorListView.js
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { FaSearch, FaSync } from 'react-icons/fa';
import { DetailViewHeader } from '../shared/DetailedViewComponents';
import { calculateOverallStatus } from '../../utils/statusCalculations';
import { dataSync } from '../../utils/server-api';
import { 
  Thermometer, Battery, Ruler, Lock, 
  BarChart2, HelpCircle 
} from 'lucide-react';

const POLLING_INTERVAL = 5000; // 5 Sekunden

const FilterBar = ({ onFilterChange, onSearchChange, onSortChange, onManualSync, isSyncing }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-8">
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 min-w-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Sensoren durchsuchen..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500"
          />
          <FaSearch className="w-5 h-5 text-gray-500 dark:text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
        <select 
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="">Alle Sensortypen</option>
          <option value="climate">Klimasensoren</option>
          <option value="distance">Abstandssensoren</option>
          <option value="energy">Energiesensoren</option>
        </select>

        <select 
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="newest">Neueste zuerst</option>
          <option value="oldest">Älteste zuerst</option>
        </select>
      </div>
    </div>
  </div>
);

const SensorCard = ({ sensor, onClick, rooms, assets, categories }) => {
  // Bestimme ob der Sensor eingerichtet ist
  const isConfigured = sensor.matchedUseCase !== null && sensor.parameters;
  const status = isConfigured ? calculateOverallStatus([sensor]) : null;

  // Sensor Typ Icon und Label
  const getSensorTypeInfo = () => {
    switch(sensor.type) {
      case 'climate':
        return {
          label: 'Klimasensor',
          icon: <Thermometer className="w-5 h-5 text-teal-500" />,
          iconBg: 'bg-teal-500/20'
        };
      case 'energy':
        return {
          label: 'Energiesensor',
          icon: <Battery className="w-5 h-5 text-amber-500" />,
          iconBg: 'bg-amber-500/20'
        };
      case 'distance':
        if (!isConfigured) {
          return {
            label: 'Abstandssensor',
            icon: <Ruler className="w-5 h-5 text-purple-500" />,
            iconBg: 'bg-purple-500/20'
          };
        }
        return sensor.matchedUseCase === 1 ? {
          label: 'Füllstandssensor',
          icon: <BarChart2 className="w-5 h-5 text-blue-500" />,
          iconBg: 'bg-blue-500/20'
        } : {
          label: 'Türsensor',
          icon: <Lock className="w-5 h-5 text-indigo-500" />,
          iconBg: 'bg-indigo-500/20'
        };
      default:
        return {
          label: 'Unbekannter Sensor',
          icon: <HelpCircle className="w-5 h-5 text-gray-500" />,
          iconBg: 'bg-gray-500/20'
        };
    }
  };

  const { label: sensorType, icon, iconBg } = getSensorTypeInfo();

  // Standortinformationen
  const room = rooms.find(r => r.id === sensor.roomId);
  const asset = assets.find(a => a.id === sensor.assetId);
  const category = categories.find(c => c.id === (asset?.categoryId));

  const renderLocationInfo = () => {
    const parts = [];
    if (room) parts.push(room.name);
    if (category) parts.push(category.name);
    if (asset) parts.push(asset.name);
    
    return parts.length > 0 ? parts.join(' → ') : 'Kein Standort zugewiesen';
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-600 transition-all cursor-pointer relative"
      onClick={onClick}
    >
      {/* Status Badge - absolut positioniert oben rechts */}
      <div className="absolute top-3 right-3">
        {isConfigured ? (
          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
            status === 'Normal' ? 'bg-green-500/20 text-green-500' :
            status === 'Warnung' ? 'bg-amber-500/20 text-amber-500' :
            status === 'Kritisch' ? 'bg-red-500/20 text-red-500' :
            'bg-gray-500/20 text-gray-500'
          }`}>
            {status}
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-500 whitespace-nowrap">
            Nicht eingerichtet
          </span>
        )}
      </div>

      {/* Hauptinhalt - vertikales Layout */}
      <div className="flex flex-col">
        {/* Icon und ID - mit genügend Platz für Status-Badge */}
        <div className="flex items-center pr-24"> {/* Padding rechts für Status-Badge */}
          <div className={`p-2 rounded-lg ${iconBg} flex-shrink-0 mr-3`}>
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-medium truncate">Sensor {sensor.id}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">({sensorType})</span>
          </div>
        </div>

        {/* Standortinfo - unter dem Icon */}
        <div style={{textAlign: "left"}}className="mt-3 text-sm text-gray-500 dark:text-gray-400 truncate pl-0">
          {renderLocationInfo()}
        </div>
      </div>
    </div>
  );
};

const useSensorSync = (initialSensors, onSensorUpdate) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const lastSyncTimestamp = useRef(Date.now());
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const syncSensors = useCallback(async () => {
    if (isSyncing) return;

    console.log('Syncing sensors...')
    try {
      setIsSyncing(true);
      const currentData = await dataSync.fetchAllData();
      
      // Vergleiche die Sensoren mit den vorhandenen
      if (JSON.stringify(currentData.sensors) !== JSON.stringify(initialSensors)) {
        onSensorUpdate(currentData.sensors);
        setLastUpdateTime(new Date());
      }
      
      lastSyncTimestamp.current = Date.now();
    } catch (error) {
      console.error('Error syncing sensors:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [initialSensors, onSensorUpdate]);

  // Automatisches Polling
  useEffect(() => {
    const pollInterval = setInterval(() => {
      syncSensors();
    }, POLLING_INTERVAL);

    // Initial sync
    syncSensors();

    return () => clearInterval(pollInterval);
  }, [syncSensors]);

  return { syncSensors, isSyncing, lastUpdateTime };
};

const SensorListView = ({ sensors: initialSensors, onSelectSensor, onClose, onSensorUpdate, rooms, assets, categories }) => {
  const [filters, setFilters] = useState({ type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  const { syncSensors, isSyncing } = useSensorSync(initialSensors, onSensorUpdate);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Process sensors based on filters and sort order
  const processedSensors = useMemo(() => {
    let result = initialSensors.filter(sensor => {
      if (filters.type && sensor.type !== filters.type) return false;
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          sensor.id.toString().includes(searchLower) ||
          sensor.room?.name?.toLowerCase().includes(searchLower) ||
          sensor.asset?.name?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.id - a.id;
      } else {
        return a.id - b.id;
      }
    });

    const typeNames = {
      climate: 'Klimasensoren',
      distance: 'Abstandssensoren',
      energy: 'Energiesensoren'
    };

    const title = filters.type ? typeNames[filters.type] || 'Sensoren' : 'Alle Sensoren';

    return {
      sensors: {
        title: title,
        items: result
      }
    };
  }, [initialSensors, filters, searchQuery, sortOrder]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
        <DetailViewHeader
        title="Sensoren verwalten"
        subtitle={`${initialSensors.length} Sensoren`}
        breadcrumbs={['Verwaltung']} // Nur Dashboard anzeigen
        onClose={onClose}
        actions={
          <button
            onClick={syncSensors}
            disabled={isSyncing}
            className={`p-2 rounded-lg transition-all ${
              isSyncing ? 'bg-gray-200 dark:bg-gray-700/50 cursor-not-allowed' : 'bg-white dark:bg-gray-800/50 hover:bg-gray-700/50'
            }`}
            title="Aktualisieren"
          >
            <FaSync className={`w-5 h-5 text-gray-500 dark:text-gray-400 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        <FilterBar 
          onFilterChange={handleFilterChange}
          onSearchChange={setSearchQuery}
          onSortChange={setSortOrder}
          onManualSync={syncSensors}
          isSyncing={isSyncing}
        />

        {Object.entries(processedSensors).map(([type, group]) => 
          group.items.length > 0 && (
            <section key={type} className="mb-8">
              <h2 className="text-lg font-medium mb-4">{group.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.items.map(sensor => (
                  <SensorCard
                    key={sensor.id}
                    sensor={sensor}
                    onClick={() => onSelectSensor(sensor)}
                    rooms={rooms}
                    assets={assets}
                    categories={categories}
                  />
                ))}
              </div>
            </section>
          )
        )}
      </main>
    </div>
  );
};

export default SensorListView;