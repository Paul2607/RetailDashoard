/**
 * Berechnet die aktuelle Öffnungsdauer in Minuten.
 * @param {Object} history - Sensorverlauf mit timestamps und Abstandswerten
 * @param {Object} parameters - Sensorparameter mit targetDistance und tolerance
 * @returns {number} Dauer in Minuten
 */
export const calculateOpenDuration = (history, parameters = {}) => {
  if (!history || history.length < 2) return 0;
  
  const { targetDistance = 0, tolerance = 5 } = parameters;
  const now = new Date();
  let lastClosedTime = now;
  let isCurrentlyOpen = false;

  // Prüfe ob aktuell offen
  const currentDistance = history[0].data.distance;
  isCurrentlyOpen = currentDistance > (targetDistance + tolerance);

  if (!isCurrentlyOpen) return 0;

  // Finde den letzten Zeitpunkt, an dem die Tür geschlossen war
  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    const distance = entry.data.distance;
    
    if (distance <= (targetDistance + tolerance)) {
      lastClosedTime = new Date(entry.timestamp);
      break;
    }
  }

  // Berechne die Differenz in Minuten
  const diffInMs = now - lastClosedTime;
  return Math.floor(diffInMs / (1000 * 60));
};

/**
 * Zählt die Anzahl der Öffnungen innerhalb eines bestimmten Zeitraums.
 * @param {Object} history - Sensorverlauf mit timestamps und Abstandswerten
 * @param {Object} parameters - Sensorparameter mit targetDistance und tolerance
 * @param {string} [timeframe='today'] - Zeitraum ('today', 'week', 'month')
 * @returns {number} Anzahl der Öffnungen
 */
export const calculateOpenCount = (history, parameters = {}, timeframe = 'today') => {
  if (!history || history.length < 2) return 0;
  
  const { targetDistance = 0, tolerance = 5 } = parameters;
  let count = 0;
  let wasOpen = false;
  
  // Startzeit basierend auf timeframe
  const now = new Date();
  let startTime;
  switch(timeframe) {
    case 'week':
      startTime = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startTime = new Date(now.setDate(now.getDate() - 30));
      break;
    case 'today':
    default:
      startTime = new Date(now.setHours(0, 0, 0, 0));
  }

  // Filtere relevante Historie
  const relevantHistory = history.filter(entry => 
    new Date(entry.timestamp) >= startTime
  );

  // Zähle Übergänge von geschlossen zu offen
  for (let i = 0; i < relevantHistory.length; i++) {
    const distance = relevantHistory[i].data.distance;
    const isOpen = distance > (targetDistance + tolerance);
    
    if (isOpen && !wasOpen) {
      // Übergang von geschlossen zu offen
      count++;
    }
    
    wasOpen = isOpen;
  }

  return count;
};

/**
 * Berechnet zusätzliche statistische Informationen zu Öffnungen.
 * @param {Object} history - Sensorverlauf
 * @param {Object} parameters - Sensorparameter
 * @returns {Object} Erweiterte Statistiken
 */
export const calculateOpeningStats = (history, parameters = {}) => {
  const dailyCount = calculateOpenCount(history, parameters, 'today');
  const weeklyCount = calculateOpenCount(history, parameters, 'week');
  const monthlyCount = calculateOpenCount(history, parameters, 'month');
  
  // Durchschnittliche Öffnungen pro Tag (basierend auf Wochendaten)
  const avgDailyOpenings = Math.round(weeklyCount / 7);
  
  // Durchschnittliche Öffnungsdauer
  let totalDuration = 0;
  let openingCount = 0;
  let currentDuration = 0;
  
  const { targetDistance = 0, tolerance = 5 } = parameters;
  let wasOpen = false;
  let openingStart = null;
  
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    const isOpen = entry.data.distance > (targetDistance + tolerance);
    
    if (isOpen && !wasOpen) {
      // Öffnung beginnt
      openingStart = new Date(entry.timestamp);
    } else if (!isOpen && wasOpen && openingStart) {
      // Öffnung endet
      const endTime = new Date(entry.timestamp);
      currentDuration = (endTime - openingStart) / (1000 * 60); // in Minuten
      totalDuration += currentDuration;
      openingCount++;
      openingStart = null;
    }
    
    wasOpen = isOpen;
  }
  
  const avgDuration = openingCount > 0 ? Math.round(totalDuration / openingCount) : 0;

  return {
    today: dailyCount,
    weekly: weeklyCount,
    monthly: monthlyCount,
    avgDaily: avgDailyOpenings,
    avgDuration: avgDuration,
    currentDuration: calculateOpenDuration(history, parameters)
  };
};