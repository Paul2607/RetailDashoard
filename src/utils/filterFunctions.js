// utils/filterFunctions.js

/**
 * Entfernt Duplikate aus einer Liste von Sensoren basierend auf ihrer ID.
 * @param {Array} sensors - Die Liste der Sensoren.
 * @param {String} filter - Der aktuelle Filtertyp (z.B. "all", "distance", etc.).
 * @returns {Array} - Die gefilterte und duplikatfreie Sensorliste.
 */
export const filterSensors = (sensors, filter) => {
    return [...new Map(
      (filter === "all" ? sensors : sensors.filter((sensor) => sensor.type === filter))
        .map((sensor) => [sensor.id, sensor]) // `Map` erstellt eindeutige Einträge basierend auf der ID
    ).values()];
  };
  
  /**
   * Liefert das passende Symbol für den angegebenen Sensortyp.
   * @param {String} type - Der Typ des Sensors (z.B. "climate", "distance", "energy").
   * @returns {String} - Das entsprechende Symbol als Emoji.
   */
  export const getSensorIcon = (type) => {
    switch (type) {
      case "climate":
        return "🌡️"; // Klima
      case "distance":
        return "📏"; // Entfernung
      case "energy":
        return "⚡"; // Energie
      default:
        return "❓"; // Unbekannter Typ
    }
  };
  