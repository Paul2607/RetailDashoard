export const SENSOR_TEMPLATES = {
  climate: {
    retail_room: {
      name: "Verkaufsraum",
      parameters: {
        targetTemperature: 22,
        tempTolerance: 1,
        targetHumidity: 50,
        humidityTolerance: 10,
        targetCO2: 800,
        co2Tolerance: 200
      }
    },
    standard_cooling: {
      name: "Standard-Kühlung",
      parameters: {
        targetTemperature: 6,
        tempTolerance: 2,
        targetHumidity: 70,
        humidityTolerance: 5,
        targetCO2: 800,
        co2Tolerance: 200
      }
    },
    deep_freezing: {
      name: "Tiefkühlung",
      parameters: {
        targetTemperature: -19,
        tempTolerance: 1,
        targetHumidity: 85,
        humidityTolerance: 5,
        targetCO2: 800,
        co2Tolerance: 200
      }
    },
    fruits_vegetables: {
      name: "Obst & Gemüse",
      parameters: {
        targetTemperature: 10,
        tempTolerance: 2,
        targetHumidity: 90,
        humidityTolerance: 5,
        targetCO2: 800,
        co2Tolerance: 200
      }
    },
    bakery: {
      name: "Backwaren",
      parameters: {
        targetTemperature: 21,
        tempTolerance: 1,
        targetHumidity: 55,
        humidityTolerance: 5,
        targetCO2: 800,
        co2Tolerance: 200
      }
    },
    meat: {
      name: "Fleisch & Wurst",
      parameters: {
        targetTemperature: 3,
        tempTolerance: 1,
        targetHumidity: 88,
        humidityTolerance: 3,
        targetCO2: 800,
        co2Tolerance: 200
      }
    },
    dairy: {
      name: "Molkereiprodukte",
      parameters: {
        targetTemperature: 6,
        tempTolerance: 2,
        targetHumidity: 80,
        humidityTolerance: 5,
        targetCO2: 800,
        co2Tolerance: 200
      }
    }
  },
  energy: {
    cooling_system: {
      name: "Kühlanlage",
      parameters: {
        targetVoltage: 230,
        voltageTolerance: 10,
        targetCurrent: 10,
        currentTolerance: 1
      }
    },
    lighting: {
      name: "Beleuchtung",
      parameters: {
        targetVoltage: 230,
        voltageTolerance: 10,
        targetCurrent: 5,
        currentTolerance: 1
      }
    },
    it_systems: {
      name: "IT-Systeme",
      parameters: {
        targetVoltage: 230,
        voltageTolerance: 5,
        targetCurrent: 3,
        currentTolerance: 0.5
      }
    }
  }
};

export const USE_CASE_MAPPING = {
  distance: [
    { id: 1, label: "Füllstände" },
    { id: 3, label: "Öffnungen" }
  ],
  climate: [
    { id: 2, label: "Raumklima" }
  ],
  energy: [
    { id: 4, label: "Stromversorgung" }
  ]
};

// Validierungsfunktionen für verschiedene Parametertypen
export const validateParameters = {
  distance: (params, useCase) => {
    const errors = {};
    
    if (useCase === 1) { // Füllstände
      if (!params.minDistance) errors.minDistance = "Minimaler Abstand erforderlich";
      if (!params.maxDistance) errors.maxDistance = "Maximaler Abstand erforderlich";
      if (params.minDistance >= params.maxDistance) {
        errors.minDistance = "Minimaler Abstand muss kleiner als maximaler Abstand sein";
      }
      if (params.warningThreshold && (params.warningThreshold < 0 || params.warningThreshold > 100)) {
        errors.warningThreshold = "Warnschwelle muss zwischen 0 und 100% liegen";
      }
      if (params.criticalThreshold && (params.criticalThreshold < 0 || params.criticalThreshold > 100)) {
        errors.criticalThreshold = "Kritische Schwelle muss zwischen 0 und 100% liegen";
      }
    } else if (useCase === 3) { // Öffnungen
      if (!params.targetDistance) errors.targetDistance = "Zielabstand erforderlich";
      if (!params.tolerance) errors.tolerance = "Toleranz erforderlich";
      if (params.tolerance <= 0) errors.tolerance = "Toleranz muss größer als 0 sein";
    }
    
    return errors;
  },
  
  climate: (params) => {
    const errors = {};
    
    if (!params.targetTemperature) errors.targetTemperature = "Zieltemperatur erforderlich";
    if (!params.tempTolerance) errors.tempTolerance = "Temperaturtoleranz erforderlich";
    if (!params.targetHumidity) errors.targetHumidity = "Ziel-Luftfeuchtigkeit erforderlich";
    if (!params.humidityTolerance) errors.humidityTolerance = "Luftfeuchtigkeitstoleranz erforderlich";
    if (!params.targetCO2) errors.targetCO2 = "Ziel-CO2 erforderlich";
    if (!params.co2Tolerance) errors.co2Tolerance = "CO2-Toleranz erforderlich";
    
    if (params.targetHumidity < 0 || params.targetHumidity > 100) {
      errors.targetHumidity = "Luftfeuchtigkeit muss zwischen 0 und 100% liegen";
    }
    
    return errors;
  },
  
  energy: (params) => {
    const errors = {};
    
    if (!params.targetVoltage) errors.targetVoltage = "Zielspannung erforderlich";
    if (!params.voltageTolerance) errors.voltageTolerance = "Spannungstoleranz erforderlich";
    if (!params.targetCurrent) errors.targetCurrent = "Zielstromstärke erforderlich";
    if (!params.currentTolerance) errors.currentTolerance = "Stromstärketoleranz erforderlich";
    
    if (params.voltageTolerance <= 0) {
      errors.voltageTolerance = "Spannungstoleranz muss größer als 0 sein";
    }
    if (params.currentTolerance <= 0) {
      errors.currentTolerance = "Stromstärketoleranz muss größer als 0 sein";
    }
    
    return errors;
  }
};