import React, { useMemo } from 'react';
import { calculateOverallStatus } from '../../utils/statusCalculations';
import { useFavorites } from '../../utils/FavoritesContext';
import FavoriteButton from '../../utils/FavoriteButton';
import {
  DetailViewHeader,
  DetailViewContainer,
  DetailCard,
  MetricsGrid,
  MetricDisplay
} from '../shared/DetailedViewComponents';
import {
  Thermometer, Battery, Lock, Box, ArrowLeft,
  BarChart2, Wind, TrendingUp, TrendingDown,
  AlertTriangle, Layers, Store
} from 'lucide-react';

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

const CategoryView = ({ category, assets = [], rooms = [], sensors = [], onClose, onAssetClick }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const categoryAssets = assets.filter(a => a.categoryId === category.id);
  const categorySensors = sensors.filter(s => 
    categoryAssets.some(a => a.id === s.assetId)
  );

  // Status Verteilung
  const statusCounts = useMemo(() => ({
    critical: categorySensors.filter(s => calculateOverallStatus([s]) === 'Kritisch').length,
    warning: categorySensors.filter(s => calculateOverallStatus([s]) === 'Warnung').length,
    normal: categorySensors.filter(s => calculateOverallStatus([s]) === 'Normal').length
  }), [categorySensors]);

  // Sensor Gruppierung
  const sensorGroups = useMemo(() => ({
    climate: categorySensors.filter(s => s.type === 'climate'),
    energy: categorySensors.filter(s => s.type === 'energy'),
    fillLevel: categorySensors.filter(s => s.type === 'distance' && s.matchedUseCase === 1),
    doors: categorySensors.filter(s => s.type === 'distance' && s.matchedUseCase === 3)
  }), [categorySensors]);

  // Aggregierte Metriken
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

// Filtern der Assets ohne Sensoren
const assetsWithSensors = useMemo(() => {
  return categoryAssets.filter(asset => 
    sensors.some(sensor => sensor.assetId === asset.id)
  );
}, [categoryAssets, sensors]);

// Gruppiere gefilterte Assets nach Räumen
const assetsByRoom = useMemo(() => {
  const grouped = {};
  
  // Initialisiere "Kein Raum zugewiesen"
  grouped.unassigned = {
    room: { id: 'unassigned', name: 'Kein Raum zugewiesen' },
    assets: []
  };

  // Gruppiere Assets nach Räumen
  categoryAssets.forEach(asset => {
    if (!asset.roomId) {
      // Asset ohne Raum
      grouped.unassigned.assets.push(asset);
    } else {
      // Asset mit Raum
      const room = rooms.find(r => r.id === asset.roomId);
      if (!grouped[room.id]) {
        grouped[room.id] = {
          room,
          assets: []
        };
      }
      grouped[room.id].assets.push(asset);
    }
  });

  // Entferne leere "Kein Raum zugewiesen" Gruppe
  if (grouped.unassigned.assets.length === 0) {
    delete grouped.unassigned;
  }
  
  return grouped;
}, [categoryAssets, rooms]);

return (
  <>
    <DetailViewHeader
      title={category.name}
      subtitle={`${assetsWithSensors.length} Gerät${assetsWithSensors.length !== 1 ? 'e' : ''} in ${Object.keys(assetsByRoom).length} Raum/Räume${Object.keys(assetsByRoom).length !== 1 ? 'n' : ''}`}
      status={calculateOverallStatus(categorySensors)}
      breadcrumbs={['Geräte/Objekte', category.name]}
      entityType="category"
      entityId={category.id}
      onClose={onClose}
    />

    <DetailViewContainer>
      <div className="space-y-6">
        {/* Overview Card */}
        <DetailCard>
        <p style={{paddingBottom: "10px"}}>Zusammenfassung</p>
          <MetricsGrid>
            {metrics.temperature && (
              <MetricCard 
                icon={Thermometer} 
                label="Temperaturbereiche"
                status={calculateOverallStatus(sensorGroups.climate)}
              >
                {metrics.temperature.map(({ range, avgTemp, count }) => (
                  <div key={range} className="mt-2">
                    <div className="font-medium">{avgTemp.toFixed(1)}°C</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {count} {range === 'cold' ? 'Kühlung' : 
                             range === 'warm' ? 'Wärme' : 'Normal'}
                    </div>
                  </div>
                ))}
              </MetricCard>
            )}

            {metrics.energy && (
              <MetricCard 
                icon={Battery} 
                label="Gesamtverbrauch"
                status={calculateOverallStatus(sensorGroups.energy)}
              >
                <div className="font-medium">
                  {metrics.energy.current.toFixed(1)} kW
                  {metrics.energy.trend && (
                    <span className={`ml-2 ${metrics.energy.trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                      {metrics.energy.trend === 'up' ? <TrendingUp className="w-4 h-4 inline" /> : 
                                                     <TrendingDown className="w-4 h-4 inline" />}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ≈ {metrics.energy.totalConsumption.toFixed(1)} kWh/Tag
                </div>
              </MetricCard>
            )}

            {metrics.fillLevels && (
              <MetricCard 
                icon={BarChart2} 
                label="Füllstände"
                status={calculateOverallStatus(sensorGroups.fillLevel)}
              >
                <div className="font-medium">Ø {Math.round(metrics.fillLevels.average)}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="text-green-400">{metrics.fillLevels.distribution.high}</span> gut gefüllt,{" "}
                  <span className="text-yellow-400">{metrics.fillLevels.distribution.medium}</span> mittel,{" "}
                  <span className="text-red-400">{metrics.fillLevels.distribution.low}</span> niedrig
                </div>
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        metrics.fillLevels.average < 30 ? 'bg-red-500' :
                        metrics.fillLevels.average < 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(Math.max(metrics.fillLevels.average, 0), 100)}%` }}
                    />
                  </div>
                </div>
              </MetricCard>
            )}

            {metrics.doors && (
              <MetricCard 
                icon={Lock} 
                label="Türen/Zugänge"
                status={metrics.doors.open > 0 ? 'Warnung' : 'Normal'}
              >
                <div className="font-medium">{metrics.doors.open} offen</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {metrics.doors.open > 0 ? 
                    `Ø ${Math.round(metrics.doors.avgOpenTime)} Min. offen` : 
                    'Alle geschlossen'
                  }
                </div>
              </MetricCard>
            )}
          </MetricsGrid>
        </DetailCard>

        {/* Assets by Room */}
        <div className="space-y-8">
          {Object.entries(assetsByRoom).map(([roomId, { room, assets: roomAssets }]) => (
            <div key={roomId} className="space-y-4">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h2 className="text-lg font-medium">{room.name}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomAssets.map(asset => {
                  const assetSensors = sensors.filter(s => s.assetId === asset.id);
                  if (assetSensors.length === 0) return null;
                  
                  const assetStatus = calculateOverallStatus(assetSensors);
                  const assetSensorGroups = {
                    climate: assetSensors.filter(s => s.type === 'climate'),
                    energy: assetSensors.filter(s => s.type === 'energy'),
                    fillLevel: assetSensors.filter(s => s.type === 'distance' && s.matchedUseCase === 1),
                    doors: assetSensors.filter(s => s.type === 'distance' && s.matchedUseCase === 3)
                  };

                  return (
                    <div 
                      key={asset.id}
                      onClick={() => onAssetClick(asset)}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 
                               hover:bg-white dark:bg-gray-800/80 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-500/20">
                            <Box className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <h3 className="font-medium">{asset.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {assetSensors.length} Sensor{assetSensors.length !== 1 ? 'en' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FavoriteButton
                            isFavorite={isFavorite('asset', asset.id)}
                            onToggle={() => toggleFavorite('asset', asset.id)}
                          />
                          <StatusBadge status={assetStatus} size="sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Climate Metrics */}
                        {assetSensorGroups.climate.length > 0 && (
                          <div className="bg-white dark:bg-gray-900/50 p-2 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Temperatur</div>
                            <div className="font-medium">
                              {assetSensorGroups.climate[0].data.temperature.toFixed(1)}°C
                            </div>
                          </div>
                        )}

                        {/* Energy Metrics */}
                        {assetSensorGroups.energy.length > 0 && (
                          <div className="bg-white dark:bg-gray-900/50 p-2 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Leistung</div>
                            <div className="font-medium">
                              {((assetSensorGroups.energy[0].data.voltage * 
                                assetSensorGroups.energy[0].data.current) / 1000).toFixed(1)} kW
                            </div>
                          </div>
                        )}

                        {/* Fill Level Metrics */}
                        {assetSensorGroups.fillLevel.length > 0 && (
                          <div className="bg-white dark:bg-gray-900/50 p-2 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Füllstand</div>
                            <div className="space-y-1">
                              {assetSensorGroups.fillLevel.map(sensor => {
                                const { maxDistance, minDistance } = sensor.parameters;
                                const fillLevel = ((maxDistance - sensor.data.distance) / 
                                  (maxDistance - minDistance)) * 100;
                                return (
                                  <div key={sensor.id} className="font-medium">
                                    {Math.round(fillLevel)}%
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Door Status */}
                        {assetSensorGroups.doors.length > 0 && (
                          <div className="bg-white dark:bg-gray-900/50 p-2 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                            <div className="space-y-1">
                              {assetSensorGroups.doors.map(sensor => {
                                const isOpen = sensor.data.distance > 
                                  (sensor.parameters.targetDistance + sensor.parameters.tolerance);
                                return (
                                  <div key={sensor.id} className="font-medium">
                                    {isOpen ? 'Geöffnet' : 'Geschlossen'}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DetailViewContainer>
  </>
);
};

export default CategoryView;
