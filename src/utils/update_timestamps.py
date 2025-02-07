import json
import os
from datetime import datetime, timedelta

def update_sensor_timestamps():
    """
    Aktualisiert die Zeitstempel in sensorData.json auf den aktuellen Zeitpunkt
    während die relativen Zeitabstände beibehalten werden.
    """
    # Pfad zur JSON-Datei
    json_path = os.path.join('src', 'data', 'sensorData.json')
    
    try:
        # Lade die JSON-Datei
        with open(json_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        if not data.get('sensors'):
            print("Keine Sensordaten gefunden.")
            return
        
        # Finde den ältesten und neuesten Zeitstempel
        timestamps = []
        for sensor in data['sensors']:
            for entry in sensor['history']:
                timestamps.append(datetime.fromisoformat(entry['timestamp'].replace('Z', '+00:00')))
        
        oldest = min(timestamps)
        newest = max(timestamps)
        timespan = newest - oldest
        
        # Setze den neuesten Zeitpunkt auf jetzt
        now = datetime.now().replace(microsecond=0)
        start_time = now - timespan
        
        # Aktualisiere die Zeitstempel
        for sensor in data['sensors']:
            history = sensor['history']
            # Sortiere Historie nach Zeitstempel
            history.sort(key=lambda x: datetime.fromisoformat(x['timestamp'].replace('Z', '+00:00')))
            
            for entry in history:
                entry_time = datetime.fromisoformat(entry['timestamp'].replace('Z', '+00:00'))
                progress = (entry_time - oldest) / timespan
                new_time = start_time + (timespan * progress)
                entry['timestamp'] = new_time.isoformat() + 'Z'
            
            # Aktualisiere aktuelle Sensordaten mit dem letzten Historieneintrag
            sensor['data'] = history[-1]['data']
        
        # Speichere die aktualisierten Daten
        with open(json_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=2, ensure_ascii=False)
            
        print("Zeitstempel erfolgreich aktualisiert!")
        
    except Exception as e:
        print(f"Fehler beim Aktualisieren der Zeitstempel: {str(e)}")

if __name__ == "__main__":
    update_sensor_timestamps()