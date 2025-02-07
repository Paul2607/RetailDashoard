import React, { useMemo, useState } from 'react';
import { calculateOverallStatus } from '../../utils/statusCalculations';
import { useFavorites } from '../../utils/FavoritesContext';
import FavoriteButton from '../../utils/FavoriteButton';
import {
  DetailViewHeader,
  DetailViewContainer,
  DetailCard,
  MetricsGrid,
} from '../shared/DetailedViewComponents';
import {
  Thermometer, Battery, Lock, Box,
  BarChart2, TrendingUp, TrendingDown,
  Waves, Activity
} from 'lucide-react';
import { ClimateDisplay, EnergyDisplay, DoorDisplay, FillLevelDisplay } from './SensorView';

// Hilfskomponenten
const StatusBadge = ({ status, size = 'md' }) => (
  <span className={`
    ${status === 'Normal' ? 'bg-green-500/20 text-green-500' :
    status === 'Warnung' ? 'bg-amber-500/20 text-amber-500' :
    'bg-red-500/20 text-red-500'}
    ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'}
    rounded-full font-medium
  `}>
    {status}
  </span>
);

const MetricCard = ({ icon: Icon, label, children, status }) => (
  <div className="bg-white dark:bg-gray-900/50 p-4 rounded-lg">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      {status && <StatusBadge status={status} size="sm" />}
    </div>
    <div className="mt-2">
      {children}
    </div>
  </div>
);

const SensorCard = ({ sensor, onClick }) => {
  const status = calculateOverallStatus([sensor]);
  const renderMetrics = () => {
    switch(sensor.type) {
      case 'climate':
        return (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-gray-900/50 p-2 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Temp.</div>
                <div className="font-medium">{sensor.data.temperature.toFixed(1)}°C</div>
              </div>
              <div className="bg-white dark:bg-gray-900/50 p-2 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Feuchte</div>
                <div className="font-medium">{Math.round(sensor.data.humidity)}%</div>
              </div>
              <div className="bg-white dark:bg-gray-900/50 p-2 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">CO₂</div>
                <div className="font-medium">{Math.round(sensor.data.co2)} ppm</div>
              </div>
            </div>
            {sensor.data["moldy?"] && (
              <div className="mt-2 text-yellow-500 text-sm">
                Erhöhtes Schimmelrisiko
              </div>
            )}
          </>
        );

      case 'energy':
        const power = (sensor.data.voltage * sensor.data.current) / 1000;
        return (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white dark:bg-gray-900/50 p-2 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Leistung</div>
              <div className="font-medium">{power.toFixed(1)} kW</div>
            </div>
            <div className="bg-white dark:bg-gray-900/50 p-2 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Spannung</div>
              <div className="font-medium">{sensor.data.voltage.toFixed(0)} V</div>
            </div>
            <div className="bg-white dark:bg-gray-900/50 p-2 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Strom</div>
              <div className="font-medium">{sensor.data.current.toFixed(1)} A</div>
            </div>
          </div>
        );

      case 'distance':
        if (sensor.matchedUseCase === 1) {
          const { maxDistance, minDistance } = sensor.parameters;
          const fillLevel = ((maxDistance - sensor.data.distance) / (maxDistance - minDistance)) * 100;
          return (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">{Math.round(fillLevel)}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Füllstand</div>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    fillLevel < 30 ? 'bg-red-500' :
                    fillLevel < 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(Math.max(fillLevel, 0), 100)}%` }}
                />
              </div>
            </div>
          );
        } else {
          const isOpen = sensor.data.distance > (sensor.parameters.targetDistance + sensor.parameters.tolerance);
          return (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
              <div className="font-medium">{isOpen ? 'Geöffnet' : 'Geschlossen'}</div>
            </div>
          );
        }

      default:
        return null;
    }
  };

  const getIcon = () => {
    switch(sensor.type) {
      case 'climate': return Thermometer;
      case 'energy': return Battery;
      case 'distance': 
        return sensor.matchedUseCase === 1 ? BarChart2 : Lock;
      default: return Activity;
    }
  };
  
  const Icon = getIcon();

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 
                hover:bg-white dark:bg-gray-800/80 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20">
            <Icon className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="font-medium">Sensor {sensor.id}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {sensor.type === 'climate' ? 'Klima' :
               sensor.type === 'energy' ? 'Energie' :
               sensor.matchedUseCase === 1 ? 'Füllstand' : 'Öffnung'}
            </p>
          </div>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      {renderMetrics()}
    </div>
  );
};

const AssetView = ({ asset, room, category, sensors = [], onClose, onSensorClick }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedSensor, setSelectedSensor] = useState(null);
  
  // Filter sensors for this asset
  const assetSensors = useMemo(() => 
    sensors.filter(s => s.assetId === asset.id),
    [sensors, asset.id]
  );

  // Group sensors by type
  const sensorGroups = useMemo(() => ({
    climate: assetSensors.filter(s => s.type === 'climate'),
    energy: assetSensors.filter(s => s.type === 'energy'),
    fillLevel: assetSensors.filter(s => s.type === 'distance' && s.matchedUseCase === 1),
    doors: assetSensors.filter(s => s.type === 'distance' && s.matchedUseCase === 3)
  }), [assetSensors]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const result = {
      temperature: null,
      energy: null,
      fillLevels: null,
      doors: null
    };

    if (sensorGroups.climate.length > 0) {
      // Gruppiere Temperatursensoren nach Bereich
      const tempRanges = {
        cold: sensorGroups.climate.filter(s => s.data.temperature < 8),
        normal: sensorGroups.climate.filter(s => s.data.temperature >= 8 && s.data.temperature <= 25),
        warm: sensorGroups.climate.filter(s => s.data.temperature > 25)
      };

      result.temperature = Object.entries(tempRanges)
        .filter(([_, sensors]) => sensors.length > 0)
        .map(([range, sensors]) => ({
          range,
          avgTemp: sensors.reduce((acc, s) => acc + s.data.temperature, 0) / sensors.length,
          count: sensors.length,
          status: calculateOverallStatus(sensors)
        }));
    }

    if (sensorGroups.energy.length > 0) {
      const totalPower = sensorGroups.energy.reduce((acc, s) => 
        acc + (s.data.voltage * s.data.current), 0) / 1000;
      
      const historicalPower = sensorGroups.energy.reduce((acc, s) => {
        const firstEntry = s.history[0];
        return acc + (firstEntry.data.voltage * firstEntry.data.current);
      }, 0) / 1000;

      result.energy = {
        current: totalPower,
        trend: totalPower > historicalPower ? 'up' : 'down',
        totalConsumption: totalPower * 24
      };
    }

    if (sensorGroups.fillLevel.length > 0) {
      const levels = sensorGroups.fillLevel.map(s => {
        const { maxDistance, minDistance } = s.parameters;
        return ((maxDistance - s.data.distance) / (maxDistance - minDistance)) * 100;
      });

      result.fillLevels = {
        average: levels.reduce((acc, val) => acc + val, 0) / levels.length,
        low: levels.filter(l => l < 30).length,
        critical: levels.filter(l => l < 10).length,
        distribution: {
          high: levels.filter(l => l >= 70).length,
          medium: levels.filter(l => l >= 30 && l < 70).length,
          low: levels.filter(l => l < 30).length
        }
      };
    }

    if (sensorGroups.doors.length > 0) {
      const openDoors = sensorGroups.doors.filter(s => 
        s.data.distance > (s.parameters.targetDistance + s.parameters.tolerance)
      );

      result.doors = {
        open: openDoors.length,
        total: sensorGroups.doors.length,
        avgOpenTime: openDoors.reduce((acc, s) => {
          const openEvents = s.history.filter(h => 
            h.data.distance > (s.parameters.targetDistance + s.parameters.tolerance)
          );
          return acc + (openEvents.length * 15);
        }, 0) / Math.max(openDoors.length, 1)
      };
    }

    return result;
  }, [sensorGroups]);

  // Render detailed sensor view if a sensor is selected
  if (selectedSensor) {
    const SensorComponent = {
      climate: ClimateDisplay,
      energy: EnergyDisplay,
      distance: selectedSensor.matchedUseCase === 1 ? FillLevelDisplay : DoorDisplay
    }[selectedSensor.type];

    return (
      <>
        <DetailViewHeader
          title={`Sensor ${selectedSensor.id}`}
          subtitle={`${asset.name} • ${room?.name || 'Kein Raum zugewiesen'}`}
          status={calculateOverallStatus([selectedSensor])}
          breadcrumbs={['Geräte/Objekte', room?.name || category?.name, asset.name, `Sensor ${selectedSensor.id}`]}
          onClose={() => setSelectedSensor(null)}
        />
        <DetailViewContainer>
          {SensorComponent && <SensorComponent sensor={selectedSensor} />}
        </DetailViewContainer>
      </>
    );
  }

  return (
    <>
      <DetailViewHeader
        title={asset.name}
        subtitle={`${assetSensors.length} Sensor${assetSensors.length !== 1 ? 'en' : ''} • ${room?.name || 'Kein Raum zugewiesen'}`}
        status={calculateOverallStatus(assetSensors)}
        breadcrumbs={['Geräte/Objekte', room?.name || category?.name, asset.name]}
        entityType="asset"
        entityId={asset.id}
        onClose={onClose}
      />

      <DetailViewContainer>
        <div className="space-y-6">

          {/* Sensor Cards */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Sensoren</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assetSensors.map(sensor => (
                <SensorCard 
                  key={sensor.id} 
                  sensor={sensor}
                  onClick={() => setSelectedSensor(sensor)}
                />
              ))}
            </div>
          </div>
        </div>
      </DetailViewContainer>
    </>
  );
};

export default AssetView;