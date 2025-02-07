// utils/statusCalculations.js

export const STATUS_LEVELS = {
  CRITICAL: "Kritisch",
  WARNING: "Warnung",
  NORMAL: "Normal",
  UNKNOWN: "Unbekannt",
  NONE: "Keine Sensoren"
};

export const STATUS_WEIGHTS = {
  [STATUS_LEVELS.CRITICAL]: 3,
  [STATUS_LEVELS.WARNING]: 2,
  [STATUS_LEVELS.NORMAL]: 1,
  [STATUS_LEVELS.UNKNOWN]: 0,
  [STATUS_LEVELS.NONE]: -1
};

// Berechnet den Status einzelner Sensoren
export const calculateSensorStatus = (sensor) => {
  if (!sensor || !sensor.type) return STATUS_LEVELS.UNKNOWN;
  
  const parameters = sensor.parameters || {};
  
  switch(sensor.type) {
    case 'climate': {
      if (!sensor.data) return STATUS_LEVELS.UNKNOWN;
      
      const tempDiff = Math.abs(sensor.data.temperature - (parameters.targetTemperature || 21));
      const humidityDiff = Math.abs(sensor.data.humidity - (parameters.targetHumidity || 50));
      const co2Diff = Math.abs(sensor.data.co2 - (parameters.targetCO2 || 800));
  
      if (tempDiff > (parameters.tempTolerance || 2) * 2 ||
          humidityDiff > (parameters.humidityTolerance || 10) * 2 ||
          co2Diff > (parameters.co2Tolerance || 200) * 2) {
        return STATUS_LEVELS.CRITICAL;
      }
      if (tempDiff > (parameters.tempTolerance || 2) ||
          humidityDiff > (parameters.humidityTolerance || 10) ||
          co2Diff > (parameters.co2Tolerance || 200)) {
        return STATUS_LEVELS.WARNING;
      }
      return STATUS_LEVELS.NORMAL;
    }

    case 'distance': {
      if (!sensor.data) return STATUS_LEVELS.UNKNOWN;
      
      if (sensor.matchedUseCase === 1) { // Füllstand
        const fillLevel = ((parameters.maxDistance - sensor.data.distance) / 
          (parameters.maxDistance - parameters.minDistance)) * 100;
        
        if (fillLevel < (parameters.criticalThreshold || 20)) return STATUS_LEVELS.CRITICAL;
        if (fillLevel < (parameters.warningThreshold || 40)) return STATUS_LEVELS.WARNING;
        return STATUS_LEVELS.NORMAL;
      } else { // Türen/Öffnungen
        const isOpen = sensor.data.distance > (parameters.targetDistance + parameters.tolerance);
        return isOpen ? STATUS_LEVELS.WARNING : STATUS_LEVELS.NORMAL;
      }
    }

    case 'energy': {
      if (!sensor.data) return STATUS_LEVELS.UNKNOWN;
      
      const power = sensor.data.voltage * sensor.data.current;
      const voltageDiff = Math.abs(sensor.data.voltage - (parameters.targetVoltage || 230));
      const currentDiff = Math.abs(sensor.data.current - (parameters.targetCurrent || 10));

      if (voltageDiff > (parameters.voltageTolerance || 10) * 2 ||
          currentDiff > (parameters.currentTolerance || 1) * 2) {
        return STATUS_LEVELS.CRITICAL;
      }
      if (voltageDiff > (parameters.voltageTolerance || 10) ||
          currentDiff > (parameters.currentTolerance || 1)) {
        return STATUS_LEVELS.WARNING;
      }
      return STATUS_LEVELS.NORMAL;
    }

    default:
      return STATUS_LEVELS.UNKNOWN;
  }
};

// Berechnet den Gesamtstatus für eine Gruppe von Sensoren
export const calculateOverallStatus = (sensors) => {
  if (!sensors || sensors.length === 0) return STATUS_LEVELS.NONE;
  
  const statusValues = sensors.map(sensor => 
    STATUS_WEIGHTS[calculateSensorStatus(sensor)]
  );
  
  const maxStatus = Math.max(...statusValues);
  
  return Object.entries(STATUS_WEIGHTS)
    .find(([_, weight]) => weight === maxStatus)?.[0] || STATUS_LEVELS.UNKNOWN;
};

// Berechnet den Status für einen bestimmten Sensortyp
export const calculateTypeStatus = (sensors, type = null) => {
  if (!sensors || sensors.length === 0) {
    return { status: STATUS_LEVELS.NONE, color: '#666' };
  }

  const status = calculateOverallStatus(sensors);
  
  let color;
  switch(status) {
    case STATUS_LEVELS.CRITICAL:
      color = '#EF4444'; // red
      break;
    case STATUS_LEVELS.WARNING:
      color = '#F59E0B'; // yellow
      break;
    case STATUS_LEVELS.NORMAL:
      color = '#10B981'; // green
      break;
    default:
      color = '#666'; // gray
  }

  return { status: status, color: color };
};