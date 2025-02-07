import React, { useMemo } from 'react';
import { calculateOverallStatus } from '../../utils/statusCalculations';
import { useFavorites } from '../../utils/FavoritesContext';
import FavoriteButton from '../../utils/FavoriteButton';
import {
  DetailViewHeader,
  DetailViewContainer,
  DetailCard,
  MetricsGrid
} from '../shared/DetailedViewComponents';
import {
  Thermometer, Battery, Lock, Box,
  BarChart2, TrendingUp, TrendingDown,
  Layers, Activity
} from 'lucide-react';

// Hilfskomponenten
export const StatusBadge = ({ status, size = 'md' }) => (
  <span className={`
    ${status === 'Normal' ? 'bg-green-500/20 text-green-500 dark:bg-green-500/10' :
    status === 'Warnung' ? 'bg-amber-500/20 text-amber-500 dark:bg-amber-500/10' :
    'bg-red-500/20 text-red-500 dark:bg-red-500/10'}
    ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'}
    rounded-full font-medium
  `}>
    {status}
  </span>
);

const TrendIndicator = ({ value, showIcon = true, className = '' }) => (
  <span className={`inline-flex items-center gap-1 ${
    value > 0 ? 'text-red-500 dark:text-red-400' : 
    value < 0 ? 'text-green-500 dark:text-green-400' : 
    'text-gray-500 dark:text-gray-400'
  } ${className}`}>
    {showIcon && (value !== 0) && (
      value > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
    )}
    {value !== 0 && (
      <span>{Math.abs(value).toFixed(1)}%</span>
    )}
  </span>
);

const MetricCard = ({ icon: Icon, label, children, status, trend = null }) => (
  <div className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 p-4 rounded-lg">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {trend !== null && <TrendIndicator value={trend} />}
        {status && <StatusBadge status={status} size="sm" />}
      </div>
    </div>
    <div className="mt-2">
      {children}
    </div>
  </div>
);

const ProgressBar = ({ value, colorClass = '', showLabel = true }) => (
  <div className="space-y-1">
    {showLabel && (
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">{Math.round(value)}%</span>
      </div>
    )}
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-300 ${
          colorClass || (
            value < 30 ? 'bg-red-500' :
            value < 70 ? 'bg-amber-500' :
            'bg-green-500'
          )
        }`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  </div>
);

const MetricDisplay = ({ icon: Icon, label, value, unit, subValue, trend }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {value}
      </span>
      {unit && <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>}
      {trend !== undefined && <TrendIndicator value={trend} />}
    </div>
    {subValue && (
      <div className="text-sm text-gray-500 dark:text-gray-400">{subValue}</div>
    )}
  </div>
);

const SectionCard = ({ title, icon: Icon, children, status, onFavoriteToggle, isFavorite }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/20 dark:bg-indigo-500/10">
          <Icon className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onFavoriteToggle && (
          <FavoriteButton isFavorite={isFavorite} onToggle={onFavoriteToggle} />
        )}
        {status && <StatusBadge status={status} size="sm" />}
      </div>
    </div>
    {children}
  </div>
);

const MetricGrid = ({ children }) => (
  <div className="grid grid-cols-2 gap-2">{children}</div>
);

// Hauptkomponente
const RoomView = ({ room, assets = [], categories = [], sensors = [], onClose, onAssetClick }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  // Base Filters and Groups
  const roomAssets = useMemo(() => 
    assets.filter(a => a.roomId === room.id),
    [assets, room.id]
  );

  const assetsWithSensors = useMemo(() => 
    roomAssets.filter(asset => 
      sensors.some(sensor => sensor.assetId === asset.id)
    ),
    [roomAssets, sensors]
  );

  const assetsByCategory = useMemo(() => {
    const grouped = {};
    
    // Initialisiere "Ohne Kategorie"
    grouped.uncategorized = {
      category: { id: 'uncategorized', name: 'Ohne Kategorie' },
      assets: []
    };
  
    // Gruppiere Assets nach Kategorien
    roomAssets.forEach(asset => {
      if (!asset.categoryId) {
        // Asset ohne Kategorie
        grouped.uncategorized.assets.push(asset);
      } else {
        // Asset mit Kategorie
        const category = categories.find(c => c.id === asset.categoryId);
        if (category) { // Prüfe ob Kategorie existiert
          if (!grouped[category.id]) {
            grouped[category.id] = {
              category,
              assets: []
            };
          }
          grouped[category.id].assets.push(asset);
        } else {
          // Falls Kategorie nicht gefunden, behandle als unkategorisiert
          grouped.uncategorized.assets.push(asset);
        }
      }
    });
    
    // Entferne leere "Ohne Kategorie" Gruppe
    if (grouped.uncategorized.assets.length === 0) {
      delete grouped.uncategorized;
    }
    
    return grouped;
  }, [roomAssets, categories]);

  const roomSensors = useMemo(() => 
    sensors.filter(s => assetsWithSensors.some(a => a.id === s.assetId)),
    [sensors, assetsWithSensors]
  );

  // Sensor Gruppierung und Metriken
  const sensorGroups = useMemo(() => ({
    climate: roomSensors.filter(s => s.type === 'climate'),
    energy: roomSensors.filter(s => s.type === 'energy'),
    fillLevel: roomSensors.filter(s => s.type === 'distance' && s.matchedUseCase === 1),
    doors: roomSensors.filter(s => s.type === 'distance' && s.matchedUseCase === 3)
  }), [roomSensors]);

  const metrics = useMemo(() => {
    const result = {
      temperature: null,
      energy: null,
      fillLevels: null,
      doors: null
    };

    if (sensorGroups.climate.length > 0) {
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

  return (
    <>
      <DetailViewHeader
        title={room.name}
        subtitle={`${assetsWithSensors.length} Gerät${assetsWithSensors.length !== 1 ? 'e' : ''} in ${Object.keys(assetsByCategory).length} Kategorie${Object.keys(assetsByCategory).length !== 1 ? 'n' : ''}`}
        status={calculateOverallStatus(roomSensors)}
        breadcrumbs={['Orte', room.name]}
        entityType="room"
        entityId={room.id}
        onClose={onClose}
      />

      <DetailViewContainer>
        <div className="space-y-6">
          {/* Overview Card */}
          <DetailCard>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Übersicht</h3>
            <MetricsGrid>
              {metrics.temperature && (
                <MetricCard 
                  icon={Thermometer} 
                  label="Temperaturbereiche"
                  status={calculateOverallStatus(sensorGroups.climate)}
                >
                  <div className="space-y-3">
                    {metrics.temperature.map(({ range, avgTemp, count }) => (
                      <div key={range} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {range === 'cold' ? 'Kühlung' : 
                             range === 'warm' ? 'Wärme' : 'Normal'}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {avgTemp.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">°C</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {count} Sensor{count !== 1 ? 'en' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </MetricCard>
              )}

              {metrics.energy && (
                <MetricCard 
                  icon={Battery} 
                  label="Energieverbrauch"
                  status={calculateOverallStatus(sensorGroups.energy)}

                >
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-medium text-gray-900 dark:text-gray-100">
                        {metrics.energy.current.toFixed(1)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">kW</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Prognose: {metrics.energy.totalConsumption.toFixed(1)} kWh/Tag
                    </div>
                  </div>
                </MetricCard>
              )}

              {metrics.fillLevels && (
                <MetricCard 
                  icon={BarChart2} 
                  label="Füllstände"
                  status={calculateOverallStatus(sensorGroups.fillLevel)}
                >
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Durchschnitt</span>
                      <span className="text-xl font-medium text-gray-900 dark:text-gray-100">
                        {Math.round(metrics.fillLevels.average)}%
                      </span>
                    </div>
                    <ProgressBar value={metrics.fillLevels.average} showLabel={false} />
                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        <span>{metrics.fillLevels.distribution.high}</span> gut
                      </div>
                      <div>
                        <span>{metrics.fillLevels.distribution.medium}</span> mittel
                      </div>
                      <div>
                        <span>{metrics.fillLevels.distribution.low}</span> niedrig
                      </div>
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
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-l font-medium text-gray-900 dark:text-gray-100">
                        {metrics.doors.open}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        von {metrics.doors.total} geöffnet
                      </span>
                    </div>
                    {metrics.doors.open > 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Ø {Math.round(metrics.doors.avgOpenTime)} Minuten offen
                      </div>
                    )}
                  </div>
                </MetricCard>
              )}
            </MetricsGrid>
          </DetailCard>

          {/* Assets by Category */}
          <div className="space-y-8">
            {Object.entries(assetsByCategory).map(([categoryId, { category, assets: categoryAssets }]) => (
              <div key={categoryId} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {category.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryAssets.map(asset => {
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
                                 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/20 dark:bg-indigo-500/10">
                              <Box className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                {asset.name}
                              </h3>
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
                          {assetSensorGroups.climate.map(sensor => (
                            <div key={sensor.id} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                <Thermometer className="w-4 h-4" />
                                <span>Temperatur</span>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                  {sensor.data.temperature.toFixed(1)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">°C</span>
                              </div>
                            </div>
                          ))}

                          {assetSensorGroups.energy.map(sensor => {
                            const power = (sensor.data.voltage * sensor.data.current) / 1000;
                            return (
                              <div key={sensor.id} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                  <Battery className="w-4 h-4" />
                                  <span>Leistung</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    {power.toFixed(1)}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">kW</span>
                                </div>
                              </div>
                            );
                          })}

                          {assetSensorGroups.fillLevel.map(sensor => {
                            const { maxDistance, minDistance } = sensor.parameters;
                            const fillLevel = ((maxDistance - sensor.data.distance) / 
                              (maxDistance - minDistance)) * 100;
                            return (
                              <div key={sensor.id} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                  <BarChart2 className="w-4 h-4" />
                                  <span>Füllstand</span>
                                </div>
                                <div className="flex items-baseline gap-1 mb-2">
                                  <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    {Math.round(fillLevel)}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                                </div>
                                <ProgressBar value={fillLevel} showLabel={false} />
                              </div>
                            );
                          })}

                          {assetSensorGroups.doors.map(sensor => {
                            const isOpen = sensor.data.distance > 
                              (sensor.parameters.targetDistance + sensor.parameters.tolerance);
                            const lastClosedEntry = sensor.history.find(h => 
                              h.data.distance <= sensor.parameters.targetDistance
                            );
                            const openDuration = isOpen && lastClosedEntry ? 
                              Math.round((new Date() - new Date(lastClosedEntry.timestamp)) / (1000 * 60)) : 0;

                            return (
                              <div key={sensor.id} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                  <Lock className="w-4 h-4" />
                                  <span>Status</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className={`font-medium`}>
                                    {isOpen ? 'Geöffnet' : 'Geschlossen'}
                                  </span>
                                  {isOpen && openDuration > 0 && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      seit {openDuration} Min
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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

export default RoomView;