import React, { useMemo, useState } from 'react';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { 
  DetailViewContainer,
  DetailViewHeader,
  EntityGrid,
  MetricDisplay,
  AlertBox
} from '../shared/DetailedViewComponents';
import { calculateStatus } from '../../utils/sensorCalculations';
import { calculateOverallStatus } from '../../utils/statusCalculations';
import { getStatusColor } from '../../utils/sensorCalculations';
import { useFavorites } from '../../utils/FavoritesContext';
import FavoriteButton from '../../utils/FavoriteButton';
import { calculateOpenCount, calculateOpenDuration } from '../../utils/CalculateDoorStatus';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Thermometer, Battery, Lock, BarChart2, 
  Droplet, TrendingUp, TrendingDown, 
  Wind, AlertTriangle, Clock, Activity
} from 'lucide-react';

// Base Card Component mit verbesserten Styles
export const SensorCard = ({ children, sensor, status, onFavoriteToggle, isFavorite }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 relative overflow-hidden">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium truncate pr-16">
          {sensor.type === 'climate' ? 'Klimasensor' :
           sensor.type === 'distance' && sensor.matchedUseCase === 1 ? 'Füllstandssensor' :
           sensor.type === 'distance' && sensor.matchedUseCase === 3 ? 'Türsensor' :
           sensor.type === 'energy' ? 'Energiesensor' : 'Sensor'} {sensor.id}
        </h3>
        {sensor.room && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{sensor.room.name}</p>}
      </div>
      <div className="flex items-center gap-2 absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto">
        <FavoriteButton isFavorite={isFavorite} onToggle={onFavoriteToggle} />
        <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
          status === 'Normal' ? 'bg-green-500/20 text-green-500' :
          status === 'Warnung' ? 'bg-amber-500/20 text-amber-500' :
          'bg-red-500/20 text-red-500'
        }`}>
          {status}
        </span>
      </div>
    </div>
    {children}
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

// Verbesserter Chart Container mit responsivem Design
const MetricChart = ({ data, dataKey, unit, domain, height = 200 }) => (
  <div className="bg-white dark:bg-gray-900/50 rounded-lg p-2 sm:p-4">
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="time"
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={50}
          axisLine={{ stroke: '#4B5563' }}
          tickLine={{ stroke: '#4B5563' }}
        />
        <YAxis 
          domain={domain}
          unit={unit}
          width={40}
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
          axisLine={{ stroke: '#4B5563' }}
          tickLine={{ stroke: '#4B5563' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
            padding: '8px'
          }}
          labelStyle={{ color: '#F9FAFB' }}
          itemStyle={{ color: '#60A5FA' }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey}
          stroke="#60A5FA"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: '#60A5FA' }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// StatusIndicator Component für einheitliche Statusanzeigen
const StatusIndicator = ({ type, value, threshold, unit = '' }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-500 dark:text-gray-400">{type}</span>
    <span className={`font-medium ${
      value > threshold * 1.5 ? 'text-red-500' :
      value > threshold ? 'text-yellow-500' :
      'text-green-500'
    }`}>
      {value}{unit}
    </span>
  </div>
);

// Konstanten für ClimateDisplay
const timeRangeOptions = [
  { label: '8h', hours: 8 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 }
];

const metricTypes = [
  { 
    id: 'temperature', 
    label: 'Temperatur', 
    unit: '°C',
    icon: Thermometer,
    color: 'text-rose-500',
    bgColor: '#f43f5e',  // rose-500
    limits: { min: -30, max: 50 }
  },
  { 
    id: 'humidity', 
    label: 'Luftfeuchtigkeit', 
    unit: '%',
    icon: Droplet,
    color: 'text-blue-500',
    bgColor: '#3b82f6',  // blue-500
    limits: { min: 0, max: 100 }
  },
  { 
    id: 'co2', 
    label: 'CO₂', 
    unit: 'ppm',
    icon: Wind,
    color: 'text-emerald-500',
    bgColor: '#10b981',  // emerald-500
    limits: { min: 0, max: 5000 }
  }
];

const MetricTab = ({ metric, isActive, onClick }) => {
  const Icon = metric.icon;
  return (
    <button
      onClick={() => onClick(metric.id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        isActive 
          ? `${metric.color} bg-white dark:bg-gray-800` 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-300 hover:bg-white dark:bg-gray-800/50'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{metric.label}</span>
    </button>
  );
};

const TimeRangeSelector = ({ selectedRange, onChange }) => (
  <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-lg p-1">
    {timeRangeOptions.map(range => (
      <button
        key={range.label}
        onClick={() => onChange(range.hours)}
        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
          selectedRange === range.hours
            ? 'bg-gray-200 dark:bg-gray-700 text-white'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-300'
        }`}
      >
        {range.label}
      </button>
    ))}
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={`
    px-2 py-1 rounded-full text-xs font-medium
    ${status === 'Normal' ? 'bg-green-500/20 text-green-500' :
      status === 'Warnung' ? 'bg-yellow-500/20 text-yellow-500' :
      'bg-red-500/20 text-red-500'}
  `}>
    {status}
  </span>
);

const ValueDisplay = ({ value, unit, trend = null }) => (
  <div className="flex items-baseline gap-2">
    <span className="text-4xl font-bold tracking-tight">
      {typeof value === 'number' ? value.toFixed(1) : value}
    </span>
    <span className="text-lg text-gray-500 dark:text-gray-400">{unit}</span>
    {trend && (
      <span className={`text-sm ${
        trend > 0 ? 'text-red-400' : trend < 0 ? 'text-green-400' : 'text-gray-500 dark:text-gray-400'
      }`}>
        {trend > 0 ? '↑' : trend < 0 ? '↓' : '–'}
        {Math.abs(trend).toFixed(1)}%
      </span>
    )}
  </div>
);

export const ClimateDisplay = ({ sensor }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [timeRange, setTimeRange] = useState(24); // Default 24h

// Raum, Objekt und Kategorie-Zuweisungen
const room = sensor.room || { name: 'Kein Raum zugewiesen' };
const asset = sensor.asset || { name: 'Kein Objekt zugewiesen' };
const category = sensor.category || { name: 'Keine Kategorie zugewiesen' };
console.log(room,asset,category);

// Kombinierte Standortinformation
const locationInfo = [room.name, category.name, asset.name]
  .filter(item => item !== 'Kein Raum zugewiesen' && 
                  item !== 'Keine Kategorie zugewiesen' && 
                  item !== 'Kein Objekt zugewiesen')
  .join(' → ');

  const parameters = sensor.parameters || {};

  // Get current metric config
  const currentMetric = useMemo(() => 
    metricTypes.find(m => m.id === selectedMetric),
    [selectedMetric]
  );

  // Prepare and validate chart data
  const chartData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now - timeRange * 60 * 60 * 1000);
    
    return sensor.history
      .filter(entry => new Date(entry.timestamp) > cutoff)
      .slice() // Erstelle eine Kopie
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sortiere chronologisch
      .map(entry => {
        const date = new Date(entry.timestamp);
        
        return {
          time: date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            day: timeRange > 24 ? '2-digit' : undefined,
            month: timeRange > 24 ? '2-digit' : undefined,
          }),
          [currentMetric.label]: entry.data[selectedMetric],
          timestamp: date,
          fullTime: date.toISOString()
        };
      });
  }, [sensor.history, timeRange, currentMetric, selectedMetric]);
  
  // Helper function to validate metric values
  const isValidMetricValue = (value, metric) => {
    return value !== undefined && 
           value !== null && 
           value >= metric.limits.min && 
           value <= metric.limits.max;
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const values = chartData
      .map(d => d[currentMetric.label])
      .filter(v => v !== null);
    
    if (values.length === 0) return null;

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      current: values[values.length - 1],
      trend: ((values[values.length - 1] - values[0]) / values[0] * 100) || 0
    };
  }, [chartData, currentMetric]);

  const getStatus = () => {
    if (!stats || !parameters) return 'Normal';

    const value = sensor.data[selectedMetric];
    let target, tolerance;

    switch(selectedMetric) {
      case 'temperature':
        target = parameters.targetTemperature;
        tolerance = parameters.tempTolerance;
        break;
      case 'humidity':
        target = parameters.targetHumidity;
        tolerance = parameters.humidityTolerance;
        break;
      case 'co2':
        target = parameters.targetCO2;
        tolerance = parameters.co2Tolerance;
        break;
      default:
        return 'Normal';
    }

    const diff = Math.abs(value - target);
    if (diff > tolerance * 2) return 'Kritisch';
    if (diff > tolerance) return 'Warnung';
    return 'Normal';
  };

  const status = getStatus();

  return (
    <SensorCard
      sensor={{
        ...sensor,
        room: room.name,
        title: `Klimasensor ${sensor.id}`,
        subtitle: locationInfo || 'Kein Standort zugewiesen'
      }}
      status={status}
      isFavorite={isFavorite('sensor', sensor.id)}
      onFavoriteToggle={() => toggleFavorite('sensor', sensor.id)}
    >
      <div className="space-y-4">
        {/* Metric Selection Tabs - kompakter */}
        <div className="flex flex-wrap gap-1 mb-2">
          {metricTypes.map(metric => (
            <MetricTab
              key={metric.id}
              metric={metric}
              isActive={selectedMetric === metric.id}
              onClick={setSelectedMetric}
            />
          ))}
        </div>

        {/* Main Value Card - kompakter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Aktueller Wert</h3>
              <ValueDisplay
                value={stats?.current}
                unit={currentMetric.unit}
                trend={stats?.trend}
              />
            </div>
          </div>

          {/* Target Value Display - reduziert */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white dark:bg-gray-900/50 rounded-lg p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Zielwert</div>
              <div className="text-sm font-medium">
                {parameters[`target${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`]} {currentMetric.unit}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900/50 rounded-lg p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Toleranz</div>
              <div className="text-sm font-medium">
                {parameters[`${selectedMetric === 'co2' ? 'co2' : selectedMetric === 'temperature' ? 'temp' : selectedMetric}Tolerance`]} {currentMetric.unit}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section - kompakter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Verlauf</h3>
            <TimeRangeSelector
              selectedRange={timeRange}
              onChange={setTimeRange}
            />
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickMargin={5}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={10}
                  unit={currentMetric.unit}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem'
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Line
                  type="monotone"
                  dataKey={currentMetric.label}
                  stroke={currentMetric.bgColor.replace('bg-', 'rgb(')}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Last Update - kompakt */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>
            Letzte Aktualisierung: {new Date(sensor.history[0].timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </SensorCard>
  );
};

// FillLevelDisplay
export const FillLevelDisplay = ({ sensor }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [timeRange, setTimeRange] = useState(24); // Default 24h

  const parameters = sensor.parameters || {};
  const { distance } = sensor.data;
  const fillLevel = ((parameters.maxDistance - distance) / 
    (parameters.maxDistance - parameters.minDistance)) * 100;
  
  const status = fillLevel < parameters.criticalThreshold ? 'Kritisch' :
                 fillLevel < parameters.warningThreshold ? 'Warnung' : 'Normal';

  // Verbesserte Chart-Daten mit optimierter Zeitdarstellung
  const chartData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now - timeRange * 60 * 60 * 1000);
    
    return sensor.history
      .filter(entry => new Date(entry.timestamp) > cutoff)
      .slice() // Erstelle eine Kopie
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sortiere chronologisch
      .map(entry => {
        const date = new Date(entry.timestamp);
        const level = ((parameters.maxDistance - entry.data.distance) / 
          (parameters.maxDistance - parameters.minDistance) * 100);
        
        return {
          time: date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            day: timeRange > 24 ? '2-digit' : undefined,
            month: timeRange > 24 ? '2-digit' : undefined,
          }),
          Füllstand: level.toFixed(1),
          timestamp: date
        };
      });
  }, [sensor.history, timeRange, parameters]);

  // Erweiterte Statistiken
  const stats = useMemo(() => ({
    current: fillLevel,
    average: chartData.reduce((acc, curr) => acc + parseFloat(curr.Füllstand), 0) / chartData.length,
    min: Math.min(...chartData.map(d => parseFloat(d.Füllstand))),
    max: Math.max(...chartData.map(d => parseFloat(d.Füllstand))),
    trend: calculateTrend(chartData.map(d => parseFloat(d.Füllstand))),
    consumptionRate: calculateConsumptionRate(chartData),
    timeUntilCritical: calculateTimeUntilCritical(fillLevel, calculateConsumptionRate(chartData), parameters.criticalThreshold)
  }), [chartData, fillLevel, parameters]);

  return (
    <SensorCard
      sensor={sensor}
      status={status}
      isFavorite={isFavorite('sensor', sensor.id)}
      onFavoriteToggle={() => toggleFavorite('sensor', sensor.id)}
    >
      <div className="space-y-4">
        {/* Hauptmetrik */}
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Aktueller Füllstand</h3>
              <ValueDisplay
                value={fillLevel}
                unit="%"
                trend={stats.trend}
              />
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Füllstandsanzeige */}
          <div className="space-y-2">
            <ProgressBar value={fillLevel} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Kritisch: {parameters.criticalThreshold}%</span>
              <span>Warnung: {parameters.warningThreshold}%</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Verlauf</h3>
            <TimeRangeSelector
              selectedRange={timeRange}
              onChange={setTimeRange}
            />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickMargin={5}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={10}
                  unit="%"
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem'
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Line
                  type="monotone"
                  dataKey="Füllstand"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistiken */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Statistiken</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">24h Durchschnitt</span>
                <span className="font-medium">{stats.average.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">24h Minimum</span>
                <span className="font-medium">{stats.min.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">24h Maximum</span>
                <span className="font-medium">{stats.max.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Prognose</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Verbrauchsrate</span>
                <span className="font-medium">
                  {Math.abs(stats.consumptionRate).toFixed(1)}% pro Stunde
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Zeit bis kritisch</span>
                <span className="font-medium">{stats.timeUntilCritical}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>
            Letzte Aktualisierung: {new Date(sensor.history[0].timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </SensorCard>
  );
};

// Hilfsfunktionen für Berechnungen
function calculateConsumptionRate(chartData) {
  const timeSpan = 4; // Betrachte die letzten 4 Stunden für die Rate
  const recentData = chartData.slice(0, Math.min(timeSpan * 4, chartData.length)); // 4 Messungen pro Stunde
  
  if (recentData.length < 2) return 0;
  
  const totalChange = parseFloat(recentData[0].Füllstand) - parseFloat(recentData[recentData.length - 1].Füllstand);
  const hours = recentData.length / 4;
  
  return totalChange / hours;
}

function calculateTimeUntilCritical(currentLevel, consumptionRate, criticalThreshold) {
  if (consumptionRate >= 0) return 'nicht berechenbar';
  
  const remainingPercent = currentLevel - criticalThreshold;
  const hoursUntilCritical = Math.abs(remainingPercent / consumptionRate);
  
  if (hoursUntilCritical < 1) {
    return `${Math.round(hoursUntilCritical * 60)} Minuten`;
  } else if (hoursUntilCritical < 24) {
    return `${Math.round(hoursUntilCritical)} Stunden`;
  } else {
    return `${Math.round(hoursUntilCritical / 24)} Tagen`;
  }
}

export const DoorDisplay = ({ sensor }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [timeRange, setTimeRange] = useState(24);
  
  const parameters = sensor.parameters || {};
  const isOpen = sensor.data.distance > (parameters.targetDistance + parameters.tolerance);
  const status = isOpen ? 'Warnung' : 'Normal';

  // Prepare chart data
  const chartData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now - timeRange * 60 * 60 * 1000);
    
    return sensor.history
      .filter(entry => new Date(entry.timestamp) > cutoff)
      .slice() // Erstelle eine Kopie
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sortiere chronologisch
      .map(entry => {
        const date = new Date(entry.timestamp);
        const isOpen = entry.data.distance > (parameters.targetDistance + parameters.tolerance);
        
        // Berechne die Öffnungsdauer für diesen Datenpunkt
        let openDuration = 0;
        if (isOpen) {
          const nextEntry = sensor.history.find(e => 
            new Date(e.timestamp) > date && 
            e.data.distance <= (parameters.targetDistance + parameters.tolerance)
          );
          if (nextEntry) {
            openDuration = Math.round((new Date(nextEntry.timestamp) - date) / (1000 * 60));
          } else {
            // Wenn kein Schließzeitpunkt gefunden wurde und die Tür noch offen ist
            openDuration = Math.round((now - date) / (1000 * 60));
          }
        }
  
        return {
          time: date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            day: timeRange > 24 ? '2-digit' : undefined,
            month: timeRange > 24 ? '2-digit' : undefined,
          }),
          timestamp: date,
          status: isOpen ? 100 : 0,
          openDuration
        };
      });
  }, [sensor.history, timeRange, parameters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const openDuration = calculateOpenDuration(sensor.history, parameters);
    const openCount = {
      today: calculateOpenCount(sensor.history, parameters, 'today'),
      week: calculateOpenCount(sensor.history, parameters, 'week')
    };
    
    return {
      currentOpenDuration: openDuration,
      openCount,
      averageOpenTime: calculateAverageOpenTime(sensor.history, parameters),
      busyHours: calculateBusyHours(sensor.history, parameters),
      currentDeviation: Math.abs(sensor.data.distance - parameters.targetDistance)
    };
  }, [sensor.history, parameters]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="text-gray-300 text-sm font-medium">{label}</p>
          {data.openCount > 0 && (
            <p className="text-sm text-gray-400">
              {data.openCount} Öffnung{data.openCount !== 1 ? 'en' : ''}
            </p>
          )}
          {data.openDuration > 0 && (
            <p className="text-sm text-gray-400">
              {data.openDuration} Min. geöffnet
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <SensorCard
      sensor={sensor}
      status={status}
      isFavorite={isFavorite('sensor', sensor.id)}
      onFavoriteToggle={() => toggleFavorite('sensor', sensor.id)}
    >
      <div className="space-y-4">
        {/* Main Status */}
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Status</h3>
              <div className="flex items-center gap-3">
                <Lock className={`w-6 h-6 ${isOpen ? 'text-amber-500' : 'text-green-500'}`} />
                <span className="text-2xl font-bold">
                  {isOpen ? 'Geöffnet' : 'Geschlossen'}
                </span>
              </div>
              {isOpen && stats.currentOpenDuration > 0 && (
                <span className="text-sm text-amber-500">
                  Seit {formatDuration(stats.currentOpenDuration)}
                </span>
              )}
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400">Heute</div>
              <div className="text-lg font-medium">{stats.openCount.today}×</div>
              <div className="text-xs text-gray-500">Öffnungen</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400">Ø Dauer</div>
              <div className="text-lg font-medium">
                {formatDuration(stats.averageOpenTime)}
              </div>
              <div className="text-xs text-gray-500">pro Öffnung</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400">Abweichung</div>
              <div className="text-lg font-medium">
                {stats.currentDeviation.toFixed(1)} cm
              </div>
              <div className="text-xs text-gray-500">vom Zielwert</div>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Aktivitätsverlauf</h3>
            <TimeRangeSelector
              selectedRange={timeRange}
              onChange={setTimeRange}
            />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickMargin={5}
                  interval={Math.ceil(chartData.length / 8)} // Dynamische Anzahl von Ticks
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={10}
                  domain={[0, 100]}
                  ticks={[0, 100]}
                  tickFormatter={(value) => value === 0 ? 'Geschlossen' : 'Geöffnet'}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-700">
                          <p className="text-gray-300 text-sm font-medium">{label}</p>
                          <p className="text-sm text-gray-400">
                            {data.status === 100 ? 'Geöffnet' : 'Geschlossen'}
                          </p>
                          {data.openDuration > 0 && (
                            <p className="text-sm text-gray-400">
                              Öffnungsdauer: {data.openDuration} Min.
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Bereich für geöffnete Zeiten */}
                <defs>
                  <linearGradient id="openArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <Line
                  type="linear"
                  dataKey="status"
                  stroke="#10B981"
                  strokeWidth={2}
                  connectNulls
                  dot={{ 
                    r: 2,
                    fill: '#10B981',
                    strokeWidth: 0
                  }}
                  activeDot={{ 
                    r: 6,
                    fill: '#10B981',
                    stroke: '#fff',
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Öffnungsstatistik</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Öffnungen heute</span>
                <span className="font-medium">{stats.openCount.today}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Öffnungen diese Woche</span>
                <span className="font-medium">{stats.openCount.week}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Durchschnittliche Dauer</span>
                <span className="font-medium">
                  {formatDuration(stats.averageOpenTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Technische Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Aktueller Abstand</span>
                <span className="font-medium">{sensor.data.distance.toFixed(1)} cm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Zielabstand</span>
                <span className="font-medium">
                  {parameters.targetDistance} cm (±{parameters.tolerance} cm)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Abweichung</span>
                <span className={`font-medium ${
                  stats.currentDeviation > parameters.tolerance 
                    ? 'text-amber-500' 
                    : 'text-green-500'
                }`}>
                  {stats.currentDeviation.toFixed(1)} cm
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Busiest Hours */}
        {stats.busyHours.length > 0 && (
          <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Aktivste Zeiten</h3>
            <div className="flex flex-wrap gap-2">
              {stats.busyHours.map(hour => (
                <div 
                  key={hour.hour} 
                  className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm"
                >
                  {hour.hour}:00 - {hour.hour + 1}:00
                  <span className="text-gray-500 ml-2">{hour.count}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>
            Letzte Aktualisierung: {new Date(sensor.history[0].timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </SensorCard>
  );
};

// Hilfsfunktionen für erweiterte Statistiken
const formatDuration = (minutes) => {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}h ${remainingMinutes}m`;
};

function calculateAverageOpenTime(history, parameters) {
  let totalTime = 0;
  let openCount = 0;
  let isCurrentlyOpen = false;
  let openStartTime = null;

  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    const isOpen = entry.data.distance > (parameters.targetDistance + parameters.tolerance);
    
    if (isOpen && !isCurrentlyOpen) {
      // Tür wurde geöffnet
      openStartTime = new Date(entry.timestamp);
      isCurrentlyOpen = true;
      openCount++;
    } else if (!isOpen && isCurrentlyOpen) {
      // Tür wurde geschlossen
      const closeTime = new Date(entry.timestamp);
      totalTime += (closeTime - openStartTime) / (1000 * 60); // Konvertiere zu Minuten
      isCurrentlyOpen = false;
    }
  }

  return openCount > 0 ? totalTime / openCount : 0;
}

function calculateTotalOpenTime(history, parameters) {
  let totalTime = 0;
  let isCurrentlyOpen = false;
  let openStartTime = null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    const entryTime = new Date(entry.timestamp);
    if (entryTime < today) continue;

    const isOpen = entry.data.distance > (parameters.targetDistance + parameters.tolerance);
    
    if (isOpen && !isCurrentlyOpen) {
      openStartTime = entryTime;
      isCurrentlyOpen = true;
    } else if (!isOpen && isCurrentlyOpen) {
      totalTime += (entryTime - openStartTime) / (1000 * 60);
      isCurrentlyOpen = false;
    }
  }

  return totalTime;
}

function calculateBusyHours(history, parameters) {
  const hourCounts = new Array(24).fill(0);
  
  history.forEach(entry => {
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    const isOpen = entry.data.distance > (parameters.targetDistance + parameters.tolerance);
    
    if (isOpen) {
      hourCounts[hour]++;
    }
  });

  // Finde die drei aktivsten Stunden
  return hourCounts
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .filter(hour => hour.count > 0);
}

// EnergyDisplay Component
export const EnergyDisplay = ({ sensor }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [timeRange, setTimeRange] = useState(24);
  const [selectedMetric, setSelectedMetric] = useState('power');

  const parameters = sensor.parameters || {};
  const { voltage, current } = sensor.data;
  const power = voltage * current;
  const status = calculateOverallStatus([sensor]);

  const metricTypes = [
    { 
      id: 'power', 
      label: 'Leistung', 
      unit: 'kW',
      icon: Battery,
      color: 'text-amber-500',
      bgColor: '#f59e0b'
    },
    { 
      id: 'voltage', 
      label: 'Spannung', 
      unit: 'V',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: '#3b82f6'
    },
    { 
      id: 'current', 
      label: 'Stromstärke', 
      unit: 'A',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: '#10b981'
    }
  ];

  // Prepare chart data
  const chartData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now - timeRange * 60 * 60 * 1000);
    
    return sensor.history
      .filter(entry => new Date(entry.timestamp) > cutoff)
      .slice() // Erstelle eine Kopie
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sortiere chronologisch
      .map(entry => {
        const date = new Date(entry.timestamp);
        const entryPower = entry.data.voltage * entry.data.current;
        
        return {
          time: date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            day: timeRange > 24 ? '2-digit' : undefined,
            month: timeRange > 24 ? '2-digit' : undefined,
          }),
          Leistung: (entryPower / 1000).toFixed(2),
          Spannung: entry.data.voltage.toFixed(1),
          Stromstärke: entry.data.current.toFixed(2),
          timestamp: date
        };
      });
  }, [sensor.history, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const powerStats = {
      current: power / 1000,
      avg: chartData.reduce((acc, curr) => acc + parseFloat(curr.Leistung), 0) / chartData.length,
      max: Math.max(...chartData.map(d => parseFloat(d.Leistung))),
      min: Math.min(...chartData.map(d => parseFloat(d.Leistung))),
      trend: calculateTrend(chartData.map(d => parseFloat(d.Leistung)))
    };

    const voltageStats = {
      current: voltage,
      avg: chartData.reduce((acc, curr) => acc + parseFloat(curr.Spannung), 0) / chartData.length,
      deviation: Math.abs(voltage - parameters.targetVoltage),
      status: calculateStatus(voltage, parameters.targetVoltage, parameters.voltageTolerance)
    };

    const currentStats = {
      current: current,
      avg: chartData.reduce((acc, curr) => acc + parseFloat(curr.Stromstärke), 0) / chartData.length,
      deviation: Math.abs(current - parameters.targetCurrent),
      status: calculateStatus(current, parameters.targetCurrent, parameters.currentTolerance)
    };

    const consumption = calculateEnergyConsumption(chartData);

    return { power: powerStats, voltage: voltageStats, current: currentStats, consumption };
  }, [chartData, voltage, current, parameters, power]);

  // Active warnings
  const warnings = useMemo(() => [
    stats.voltage.deviation > parameters.voltageTolerance && {
      type: 'voltage',
      message: `Spannung außerhalb des Toleranzbereichs (±${parameters.voltageTolerance}V)`
    },
    stats.current.deviation > parameters.currentTolerance && {
      type: 'current',
      message: `Stromstärke außerhalb des Toleranzbereichs (±${parameters.currentTolerance}A)`
    },
    stats.power.current > stats.power.avg * 1.5 && {
      type: 'power',
      message: 'Überdurchschnittlich hoher Energieverbrauch'
    }
  ].filter(Boolean), [stats, parameters]);

  // Get current metric config
  const currentMetric = metricTypes.find(m => m.id === selectedMetric);

  return (
    <SensorCard
      sensor={sensor}
      status={status}
      isFavorite={isFavorite('sensor', sensor.id)}
      onFavoriteToggle={() => toggleFavorite('sensor', sensor.id)}
    >
      <div className="space-y-4">
        {/* Metric Selection Tabs */}
        <div className="flex flex-wrap gap-1 mb-2">
          {metricTypes.map(metric => (
            <MetricTab
              key={metric.id}
              metric={metric}
              isActive={selectedMetric === metric.id}
              onClick={setSelectedMetric}
            />
          ))}
        </div>

        {/* Main Metrics */}
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400">
                {currentMetric.label}
              </h3>
              <ValueDisplay
                value={selectedMetric === 'power' ? stats.power.current :
                       selectedMetric === 'voltage' ? stats.voltage.current :
                       stats.current.current}
                unit={currentMetric.unit}
                trend={selectedMetric === 'power' ? stats.power.trend : undefined}
              />
            </div>
            <StatusBadge status={
              selectedMetric === 'power' ? status :
              selectedMetric === 'voltage' ? stats.voltage.status :
              stats.current.status
            } />
          </div>

          {/* Parameter Reference */}
          {selectedMetric !== 'power' && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                <div className="text-xs text-gray-500">Zielwert</div>
                <div className="text-sm font-medium">
                  {selectedMetric === 'voltage' ? parameters.targetVoltage : parameters.targetCurrent} 
                  {currentMetric.unit}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                <div className="text-xs text-gray-500">Toleranz</div>
                <div className="text-sm font-medium">
                  ±{selectedMetric === 'voltage' ? parameters.voltageTolerance : parameters.currentTolerance} 
                  {currentMetric.unit}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Verlauf</h3>
            <TimeRangeSelector
              selectedRange={timeRange}
              onChange={setTimeRange}
            />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickMargin={5}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={10}
                  unit={currentMetric.unit}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem'
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Line
                  type="monotone"
                  dataKey={currentMetric.label}
                  stroke={currentMetric.bgColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">24h Statistiken</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Durchschnitt</span>
                <span className="font-medium">
                  {selectedMetric === 'power' ? stats.power.avg.toFixed(2) :
                   selectedMetric === 'voltage' ? stats.voltage.avg.toFixed(1) :
                   stats.current.avg.toFixed(2)} {currentMetric.unit}
                </span>
              </div>
              {selectedMetric === 'power' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Maximum</span>
                    <span className="font-medium">
                      {stats.power.max.toFixed(2)} {currentMetric.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Minimum</span>
                    <span className="font-medium">
                      {stats.power.min.toFixed(2)} {currentMetric.unit}
                    </span>
                  </div>
                </>
              )}
              {selectedMetric !== 'power' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Abweichung</span>
                  <span className={`font-medium ${
                    (selectedMetric === 'voltage' ? stats.voltage.deviation > parameters.voltageTolerance :
                     stats.current.deviation > parameters.currentTolerance)
                      ? 'text-amber-500'
                      : 'text-green-500'
                  }`}>
                    {(selectedMetric === 'voltage' ? stats.voltage.deviation : stats.current.deviation).toFixed(2)} 
                    {currentMetric.unit}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Verbrauch</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Heute</span>
                <span className="font-medium">
                  {stats.consumption.today.toFixed(1)} kWh
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Prognose</span>
                <span className="font-medium">
                  {stats.consumption.forecast.toFixed(1)} kWh/Tag
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Trend</span>
                <span className={`font-medium ${
                  stats.consumption.trend >= 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {stats.consumption.trend >= 0 ? '+' : ''}
                  {stats.consumption.trend.toFixed(1)}% vs. Ø
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-500 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Aktive Warnungen
            </h4>
            <div className="space-y-2">
              {warnings.map((warning, index) => (
                <div key={index} className="text-sm text-red-400">
                  • {warning.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>
            Letzte Aktualisierung: {new Date(sensor.history[0].timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </SensorCard>
  );
};

// Hilfsfunktionen für Berechnungen
function calculateTrend(values) {
  if (values.length < 2) return 0;
  const first = values[values.length - 1];
  const last = values[0];
  return ((last - first) / first) * 100;
}

function calculateEnergyConsumption(chartData) {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const todayData = chartData.filter(entry => new Date(entry.fullTime) >= startOfDay);
  
  // Berechne den tatsächlichen Verbrauch
  const totalEnergy = todayData.reduce((acc, curr, index, arr) => {
    if (index === 0) return 0;
    const timeInHours = (new Date(curr.fullTime) - new Date(arr[index - 1].fullTime)) / (1000 * 60 * 60);
    return acc + (parseFloat(curr.Leistung) * timeInHours);
  }, 0);

  // Berechne Prognose
  const hoursInDay = now.getHours() + (now.getMinutes() / 60);
  const forecast = totalEnergy * (24 / hoursInDay);

  // Berechne Trend im Vergleich zum Durchschnitt (Beispielwert)
  const avgDailyConsumption = 10; // Hier sollte der tatsächliche Durchschnitt eingesetzt werden
  const trend = ((forecast - avgDailyConsumption) / avgDailyConsumption) * 100;

  return {
    today: totalEnergy,
    forecast,
    trend
  };
}
// Hauptkomponente
const SensorView = ({ 
  useCase, 
  sensorData, 
  rooms, 
  assets, 
  categories, 
  onClose 
}) => {
  const enrichedSensorData = useMemo(() => {
    return sensorData.map(sensor => {
      const asset = assets.find(a => a.id === sensor.assetId);
      const room = rooms.find(r => r.id === asset?.roomId);
      const category = categories.find(c => c.id === asset?.categoryId);

      return {
        ...sensor,
        room: room || { name: 'Kein Raum zugewiesen' },
        asset: asset || { name: 'Kein Objekt zugewiesen' },
        category: category || { name: 'Keine Kategorie zugewiesen' }
      };
    });
  }, [sensorData, rooms, assets, categories]);
// Gruppiere Sensoren nach Typ
  const sensorsByType = useMemo(() => ({
  climate: sensorData.filter(s => s.type === 'climate'),
  fillLevel: sensorData.filter(s => s.type === 'distance' && s.matchedUseCase === 1),
  door: sensorData.filter(s => s.type === 'distance' && s.matchedUseCase === 3),
  energy: sensorData.filter(s => s.type === 'energy')
  }), [sensorData]);
  // Filter state
  const [activeType, setActiveType] = React.useState(null);
  // Gefilterte Sensoren basierend auf aktivem Typ
  const filteredSensors = activeType
  ? sensorData.filter(s => s.type === activeType)
  : sensorData;
  return (
  <DetailViewContainer>
    <DetailViewHeader
      title={useCase.title}
      subtitle={`${sensorData.length} Sensor${sensorData.length !== 1 ? 'en' : ''}`}
      status={calculateOverallStatus(sensorData)}
      breadcrumbs={[useCase.title]}
      onClose={onClose}
    />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Sensor Grid */}
      <EntityGrid>
        {filteredSensors.map(sensor => {
          const Component = {
            climate: ClimateDisplay,
            fillLevel: FillLevelDisplay,
            door: DoorDisplay,  
            energy: EnergyDisplay
          }[sensor.type === 'distance' ? 
            sensor.matchedUseCase === 1 ? 'fillLevel' : 'door'
            : sensor.type
          ];

          return Component && (
            <Component key={sensor.id} sensor={sensor} />  
          );
        })}

        {/* Meldungen, wenn keine Sensoren verfügbar */}
        {filteredSensors.length === 0 && (
          <AlertBox
            type="info"  
            title="Keine Sensoren gefunden"
            messages={[
              'Es sind keine Sensoren für den ausgewählten Filter verfügbar.',
              'Versuchen Sie es mit anderen Filteroptionen.'  
            ]}
          />
        )}
      </EntityGrid>
    </div>
  </DetailViewContainer>
  );
};

export default SensorView;