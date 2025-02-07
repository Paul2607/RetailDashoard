// DashboardCards.js
import React from 'react';
import { useFavorites } from '../utils/FavoritesContext';
import FavoriteButton from '../utils/FavoriteButton';
import { calculateOverallStatus } from '../utils/statusCalculations';
import { 
  Thermometer, Battery, Lock, Box, MapPin,
  AlertTriangle, TrendingUp, TrendingDown,
  BarChart2, Wind, Droplet
} from 'lucide-react';

// Status Badge Component
export const StatusBadge = ({ status, size = 'md', count }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Kritisch': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'Warnung': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'Normal': return 'bg-green-500/20 text-green-500 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  return (
    <span className={`
      ${getStatusColor()}
      ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}
      rounded-full font-medium border inline-flex items-center gap-1.5
    `}>
      {count ? `${count} ${status}` : status}
    </span>
  );
};

// Base Card Component
export const BaseCard = ({ 
  icon: Icon, 
  iconColor, 
  title, 
  subtitle, 
  status, 
  onFavoriteToggle, 
  isFavorite, 
  children, 
  onClick 
}) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
             rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 
             transition-all cursor-pointer shadow-sm"
  >
    <div className="flex justify-between mb-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${iconColor} bg-opacity-20 flex-shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white text-left truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
        <div onClick={e => e.stopPropagation()}>
          <FavoriteButton isFavorite={isFavorite} onToggle={onFavoriteToggle} />
        </div>
        <StatusBadge status={status} size="sm" />
      </div>
    </div>
    {children}
  </div>
);

// Fill Level Bar Component
export const FillLevelBar = ({ value }) => {
  const getBarColor = () => {
    if (value < 20) return 'bg-red-500';
    if (value < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div 
        className={`h-full ${getBarColor()} transition-all duration-500`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
};

// Metric Display Component
export const MetricDisplay = ({ 
  label, 
  value, 
  subValue, 
  status, 
  trend, 
  icon: Icon, 
  showBar 
}) => (
  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-gray-500 dark:text-gray-400" />}
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-lg font-medium mt-0.5 text-gray-900 dark:text-white flex items-center gap-1">
            {value}
            {trend && (
              <span className={trend === 'up' ? 'text-red-400' : 'text-green-400'}>
                {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              </span>
            )}
          </div>
          {subValue && <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subValue}</div>}
        </div>
      </div>
      {status && <StatusBadge status={status} size="sm" />}
    </div>
    {showBar && <div className="mt-2"><FillLevelBar value={parseFloat(value)} /></div>}
  </div>
);


// Climate Group Display Component
const ClimateGroupDisplay = ({ sensors }) => {
  const groups = {
    cold: { label: 'Kühlung', sensors: sensors.filter(s => s.data.temperature < 8) },
    normal: { label: 'Normal', sensors: sensors.filter(s => s.data.temperature >= 8 && s.data.temperature <= 25) },
    warm: { label: 'Wärme', sensors: sensors.filter(s => s.data.temperature > 25) }
  };

  return (
    <div className="space-y-2">
      {Object.entries(groups).map(([key, group]) => 
        group.sensors.length > 0 && (
          <div 
            key={key}
            className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg"
          >
            {/* Flexbox für horizontale Anordnung */}
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-gray-400">{group.label}</span>
                <div className="font-medium">
                  {(group.sensors.reduce((acc, s) => acc + s.data.temperature, 0) / group.sensors.length).toFixed(1)}°C
                </div>
              </div>
              <span className="text-sm text-gray-400">
                {group.sensors.length} Sensor{group.sensors.length !== 1 ? 'en' : ''}
              </span>
            </div>
            
            {/* Weitere Klimawerte */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium">
                    {(group.sensors.reduce((acc, s) => acc + s.data.humidity, 0) / group.sensors.length).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Luftfeuchte</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium">
                    {(group.sensors.reduce((acc, s) => acc + s.data.co2, 0) / group.sensors.length).toFixed(0)} ppm
                  </div>
                  <div className="text-xs text-gray-400">CO₂</div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );

};


// UseCase Card
export const UseCaseCard = ({
  useCase,
  sensors = [],
  isDragModeActive,
  index,
  handleDragStart,
  handleDragOver,
  handleDrop,
  openDetailView
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const matchedSensors = sensors.filter(s => s.matchedUseCase === useCase.id);
  
  const getUseCaseConfig = () => {
    switch (useCase.id) {
      case 1: // Füllstände
        const avgFillLevel = matchedSensors.reduce((acc, s) => {
          const { maxDistance, minDistance } = s.parameters;
          const level = ((maxDistance - s.data.distance) / (maxDistance - minDistance)) * 100;
          return acc + level;
        }, 0) / matchedSensors.length;

        return {
          icon: BarChart2,
          color: 'text-blue-500',
          content: (
            <MetricDisplay
              label="Füllstand"
              value={`${Math.round(avgFillLevel)}%`}
              icon={BarChart2}
              showBar={true}
            />
          )
        };

      case 2: // Luftqualität
        return {
          icon: Wind,
          color: 'text-teal-500',
          content: <ClimateGroupDisplay sensors={matchedSensors} />
        };

      case 3: // Öffnungen
        const openCount = matchedSensors.filter(s => 
          s.data.distance > (s.parameters.targetDistance + s.parameters.tolerance)
        ).length;

        return {
          icon: Lock,
          color: 'text-violet-500',
          content: (
            <MetricDisplay
              label="Aktuell geöffnet"
              value={`${openCount} von ${matchedSensors.length}`}
              icon={Lock}
            />
          )
        };

      case 4: // Stromversorgung
        const totalPower = matchedSensors.reduce((acc, s) => 
          acc + (s.data.voltage * s.data.current), 0) / 1000;
        
        const powerTrend = matchedSensors.some(s => 
          s.data.voltage * s.data.current > s.parameters.targetVoltage * s.parameters.targetCurrent
        ) ? 'up' : 'down';

        return {
          icon: Battery,
          color: 'text-amber-500',
          content: (
            <MetricDisplay
              label="Gesamtverbrauch"
              value={`${totalPower.toFixed(1)} kW`}
              trend={powerTrend}
              icon={Battery}
            />
          )
        };

      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-500',
          content: null
        };
    }
  };

  const config = getUseCaseConfig();

  return (
    <div
      draggable={isDragModeActive}
      onDragStart={() => handleDragStart(index)}
      onDragOver={handleDragOver}
      onDrop={() => handleDrop(index)}
      className="p-1"
    >
      <BaseCard
        icon={config.icon}
        iconColor={config.color}
        title={useCase.title}
        subtitle={`${matchedSensors.length} Sensor${matchedSensors.length !== 1 ? 'en' : ''}`}
        status={calculateOverallStatus(matchedSensors)}
        isFavorite={isFavorite('useCase', useCase.id)}
        onFavoriteToggle={() => toggleFavorite('useCase', useCase.id)}
        onClick={() => !isDragModeActive && openDetailView(useCase)}
      >
        <div className="flex flex-col h-full">
          {config.content}
          {matchedSensors.length > 0 && <StatusDistribution sensors={matchedSensors} />}
        </div>
      </BaseCard>
    </div>
  );
};

// Room Card
export const RoomCard = ({ room, sensors = [], assets = [], handleClick }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const roomSensors = sensors.filter(s => s.roomId === room.id);
  const roomAssets = assets.filter(a => a.roomId === room.id);
  
  // Gruppiere Sensoren nach Typ
  const sensorGroups = {
    climate: roomSensors.filter(s => s.type === 'climate'),
    energy: roomSensors.filter(s => s.type === 'energy'),
    fillLevel: roomSensors.filter(s => s.type === 'distance' && s.matchedUseCase === 1),
    doors: roomSensors.filter(s => s.type === 'distance' && s.matchedUseCase === 3)
  };

  const renderMetrics = () => {
    const metrics = [];

    if (sensorGroups.climate.length > 0) {
      const avgTemp = sensorGroups.climate.reduce((acc, s) => acc + s.data.temperature, 0) / 
        sensorGroups.climate.length;
      metrics.push(
        <MetricDisplay
          key="temp"
          label="Temperatur"
          value={`${avgTemp.toFixed(1)}°C`}
          icon={Thermometer}
        />
      );
    }

    if (sensorGroups.energy.length > 0) {
      const totalPower = sensorGroups.energy.reduce((acc, s) => 
        acc + (s.data.voltage * s.data.current), 0) / 1000;
      metrics.push(
        <MetricDisplay
          key="power"
          label="Leistung"
          value={`${totalPower.toFixed(1)} kW`}
          icon={Battery}
        />
      );
    }

    if (sensorGroups.fillLevel.length > 0) {
      const avgFill = sensorGroups.fillLevel.reduce((acc, s) => {
        const { maxDistance, minDistance } = s.parameters;
        return acc + ((maxDistance - s.data.distance) / (maxDistance - minDistance)) * 100;
      }, 0) / sensorGroups.fillLevel.length;

      metrics.push(
        <MetricDisplay
          key="fill"
          label="Füllstand"
          value={`${Math.round(avgFill)}%`}
          icon={BarChart2}
          showBar={true}
        />
      );
    }

    if (sensorGroups.doors.length > 0) {
      const openCount = sensorGroups.doors.filter(s => 
        s.data.distance > (s.parameters.targetDistance + s.parameters.tolerance)
      ).length;

      metrics.push(
        <MetricDisplay
          key="doors"
          label="Geöffnet"
          value={`${openCount} von ${sensorGroups.doors.length}`}
          icon={Lock}
        />
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {metrics}
      </div>
    );
  };

  return (
    <BaseCard
      icon={MapPin}
      iconColor="text-purple-500"
      title={room.name}
      subtitle={`${roomAssets.length} Gerät${roomAssets.length !== 1 ? 'e' : ''}/Objekt${roomAssets.length !== 1 ? 'e' : ''}`}
      status={calculateOverallStatus(roomSensors)}
      isFavorite={isFavorite('room', room.id)}
      onFavoriteToggle={() => toggleFavorite('room', room.id)}
      onClick={() => handleClick(room)}
    >
      <div className="flex flex-col h-full">
        {renderMetrics()}
        {roomSensors.length > 0 && <StatusDistribution sensors={roomSensors} />}
      </div>
    </BaseCard>
  );
};

// Category Card
export const CategoryCard = ({ category, assets = [], sensors = [], handleClick }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const categoryAssets = assets.filter(a => a.categoryId === category.id);
  const categorySensors = sensors.filter(s => 
    categoryAssets.some(a => a.id === s.assetId)
  );
  
  // Gruppiere Sensoren nach Typ
  const sensorGroups = {
    climate: categorySensors.filter(s => s.type === 'climate'),
    energy: categorySensors.filter(s => s.type === 'energy'),
    fillLevel: categorySensors.filter(s => s.type === 'distance' && s.matchedUseCase === 1),
    doors: categorySensors.filter(s => s.type === 'distance' && s.matchedUseCase === 3)
  };

  const renderMetrics = () => {
    const metrics = [];

    if (sensorGroups.climate.length > 0) {
      const avgTemp = sensorGroups.climate.reduce((acc, s) => acc + s.data.temperature, 0) / 
        sensorGroups.climate.length;
      metrics.push(
        <MetricDisplay
          key="temp"
          label="Temperatur"
          value={`${avgTemp.toFixed(1)}°C`}
          icon={Thermometer}
        />
      );
    }

    if (sensorGroups.energy.length > 0) {
      const totalPower = sensorGroups.energy.reduce((acc, s) => 
        acc + (s.data.voltage * s.data.current), 0) / 1000;
      metrics.push(
        <MetricDisplay
          key="power"
          label="Leistung"
          value={`${totalPower.toFixed(1)} kW`}
          icon={Battery}
        />
      );
    }

    if (sensorGroups.fillLevel.length > 0) {
      const avgFill = sensorGroups.fillLevel.reduce((acc, s) => {
        const { maxDistance, minDistance } = s.parameters;
        return acc + ((maxDistance - s.data.distance) / (maxDistance - minDistance)) * 100;
      }, 0) / sensorGroups.fillLevel.length;

      metrics.push(
        <MetricDisplay
          key="fill"
          label="Füllstand"
          value={`${Math.round(avgFill)}%`}
          icon={BarChart2}
          showBar={true}
        />
      );
    }

    if (sensorGroups.doors.length > 0) {
      const openCount = sensorGroups.doors.filter(s => 
        s.data.distance > (s.parameters.targetDistance + s.parameters.tolerance)
      ).length;

      metrics.push(
        <MetricDisplay
          key="doors"
          label="Geöffnet"
          value={`${openCount} von ${sensorGroups.doors.length}`}
          icon={Lock}
        />
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {metrics}
      </div>
    );
  };

  return (
    <BaseCard
      icon={Box}
      iconColor="text-indigo-500"
      title={category.name}
      subtitle={`${categoryAssets.length} Gerät${categoryAssets.length !== 1 ? 'e' : ''}/Objekt${categoryAssets.length !== 1 ? 'e' : ''}`}
      status={calculateOverallStatus(categorySensors)}
      isFavorite={isFavorite('category', category.id)}
      onFavoriteToggle={() => toggleFavorite('category', category.id)}
      onClick={() => handleClick(category)}
    >
      <div className="flex flex-col h-full">
        {renderMetrics()}
        {categorySensors.length > 0 && <StatusDistribution sensors={categorySensors} />}
      </div>
    </BaseCard>
  );
};

// Status Distribution Component
const StatusDistribution = ({ sensors }) => {
  const statusCounts = {
    critical: sensors.filter(s => calculateOverallStatus([s]) === 'Kritisch').length,
    warning: sensors.filter(s => calculateOverallStatus([s]) === 'Warnung').length,
    normal: sensors.filter(s => calculateOverallStatus([s]) === 'Normal').length
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-2">
      {Object.entries({
          'Kritisch': statusCounts.critical,
          'Warnung': statusCounts.warning,
          'Normal': statusCounts.normal
        }).map(([status, count]) => count > 0 && (
          <span key={status} className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
            {count} {status}
          </span>
        ))}
      </div>
    </div>
  );
};

