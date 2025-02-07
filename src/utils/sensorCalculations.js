// utils/sensorCalculations.js

// Berechnet den Status für einen Klimawert
export const getClimateStatus = (type, value, params) => {
    if (!params) return 'normal';
  
    let target, tolerance;
    switch(type) {
      case 'temperature':
        target = params.targetTemperature;
        tolerance = params.tempTolerance;
        break;
      case 'humidity':
        target = params.targetHumidity;
        tolerance = params.humidityTolerance;
        break;
      case 'co2':
        target = params.targetCO2;
        tolerance = params.co2Tolerance;
        break;
      default:
        return 'normal';
    }
  
    if (!target || !tolerance) return 'normal';
    
    const diff = Math.abs(value - target);
    if (diff > tolerance * 2) return 'critical';
    if (diff > tolerance) return 'warning';
    return 'normal';
  };
  
  // Berechnet den Füllstand
  export const calculateFillLevel = (distance, minDistance, maxDistance) => {
    if (!minDistance || !maxDistance) return null;
    const range = maxDistance - minDistance;
    const currentLevel = maxDistance - distance;
    return Math.max(0, Math.min(100, (currentLevel / range) * 100));
  };
  
  // Bestimmt den Status des Füllstands
  export const getFillLevelStatus = (level, params) => {
    const warningThreshold = params?.warningThreshold || 40;
    const criticalThreshold = params?.criticalThreshold || 20;
  
    if (level < criticalThreshold) return 'critical';
    if (level < warningThreshold) return 'warning';
    return 'normal';
  };
  
  // Berechnet den Status für Energiewerte
  export const getEnergyStatus = (type, value, params) => {
    if (!params) return 'normal';
  
    let target, tolerance;
    switch(type) {
      case 'voltage':
        target = params.targetVoltage;
        tolerance = params.voltageTolerance;
        break;
      case 'current':
        target = params.targetCurrent;
        tolerance = params.currentTolerance;
        break;
      case 'power':
        return 'normal'; // Kann später erweitert werden
      default:
        return 'normal';
    }
  
    if (!target || !tolerance) return 'normal';
    
    const diff = Math.abs(value - target);
    if (diff > tolerance * 2) return 'critical';
    if (diff > tolerance) return 'warning';
    return 'normal';
  };
  
  // Berechnet Trends aus der Historie
  export const calculateTrend = (history, key) => {
    if (!history || history.length < 2) return 'stable';
    
    const latest = history[0].data[key];
    const previous = history[1].data[key];
    const diff = latest - previous;
    
    const thresholds = {
      temperature: 0.5,
      humidity: 2,
      co2: 50,
      distance: 2,
      voltage: 2,
      current: 0.5
    };
  
    const threshold = thresholds[key] || 0.1;
    
    if (Math.abs(diff) < threshold) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };
  
  // Erstellt die Sensor-Displays für die Karten
  export const createSensorDisplays = (sensor) => {
    const parameters = sensor.parameters || {};
    const displays = [];
  
    switch(sensor.type) {
      case 'climate':
        // Temperatur
        displays.push({
          type: 'numeric',
          sensorId: `${sensor.id}-temp`,
          data: {
            title: 'Temperatur',
            value: sensor.data.temperature,
            unit: '°C',
            status: getClimateStatus('temperature', sensor.data.temperature, parameters),
            trend: calculateTrend(sensor.history, 'temperature')
          }
        });
  
        // Luftfeuchtigkeit
        displays.push({
          type: 'numeric',
          sensorId: `${sensor.id}-humidity`,
          data: {
            title: 'Luftfeuchtigkeit',
            value: sensor.data.humidity,
            unit: '%',
            status: getClimateStatus('humidity', sensor.data.humidity, parameters),
            trend: calculateTrend(sensor.history, 'humidity')
          }
        });
  
        // CO2
        displays.push({
          type: 'numeric',
          sensorId: `${sensor.id}-co2`,
          data: {
            title: 'CO₂',
            value: sensor.data.co2,
            unit: 'ppm',
            status: getClimateStatus('co2', sensor.data.co2, parameters),
            trend: calculateTrend(sensor.history, 'co2')
          }
        });
  
        // Schimmelwarnung
        if (sensor.data["moldy?"]) {
          displays.push({
            type: 'status',
            sensorId: `${sensor.id}-mold`,
            priority: 0,
            data: {
              title: 'Schimmelrisiko',
              state: 'Warnung',
              status: 'warning'
            }
          });
        }
        break;
  
      case 'distance':
        if (sensor.matchedUseCase === 1) { // Füllstand
          const fillLevel = calculateFillLevel(
            sensor.data.distance,
            parameters.minDistance,
            parameters.maxDistance
          );
          
          if (fillLevel !== null) {
            displays.push({
              type: 'level',
              sensorId: sensor.id,
              data: {
                title: 'Füllstand',
                percentage: fillLevel,
                status: getFillLevelStatus(fillLevel, parameters),
                needsAction: fillLevel < (parameters.criticalThreshold || 20),
                trend: calculateTrend(sensor.history, 'distance')
              }
            });
          }
        } else if (sensor.matchedUseCase === 3) { // Öffnungen
          const isOpen = sensor.data.distance > (parameters.targetDistance + (parameters.tolerance || 5));
          displays.push({
            type: 'status',
            sensorId: sensor.id,
            data: {
              title: 'Status',
              state: isOpen ? 'Geöffnet' : 'Geschlossen',
              status: isOpen ? 'warning' : 'normal'
            }
          });
        }
        break;
  
      case 'energy':
        const voltage = sensor.data.voltage;
        const current = sensor.data.current;
        const power = voltage * current;
  
        displays.push({
          type: 'numeric',
          sensorId: `${sensor.id}-power`,
          data: {
            title: 'Leistung',
            value: power,
            unit: 'W',
            status: getEnergyStatus('power', power, parameters)
          }
        });
  
        displays.push({
          type: 'numeric',
          sensorId: `${sensor.id}-voltage`,
          data: {
            title: 'Spannung',
            value: voltage,
            unit: 'V',
            status: getEnergyStatus('voltage', voltage, parameters)
          }
        });
  
        displays.push({
          type: 'numeric',
          sensorId: `${sensor.id}-current`,
          data: {
            title: 'Stromstärke',
            value: current,
            unit: 'A',
            status: getEnergyStatus('current', current, parameters)
          }
        });
        break;

        default: 
          return null;
    }
  
    return displays;
  };

  export const calculateStatus = (value, target, tolerance) => {
    if (!target || !tolerance) return 'unknown';
    const diff = Math.abs(value - target);
    if (diff > tolerance * 2) return 'critical';
    if (diff > tolerance) return 'warning';
    return 'normal';
  };
  
  export const getStatusColor = (status) => {
    switch(status) {
      case 'critical': return '#ff4444';
      case 'warning': return '#ffbb33';
      case 'normal': return '#00C851';
      default: return '#666';
    }
  };
  