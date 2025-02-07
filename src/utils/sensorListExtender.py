import json
from datetime import datetime, timedelta
import random
import os
import math
from typing import Dict, List, Optional

# Pfad zur JSON-Datei
JSON_FILE_PATH = os.path.join('src', 'data', 'sensorData.json')

# Templates aus sensorTemplates.js
CLIMATE_TEMPLATES = {
    'retail_room': {
        'targetTemperature': 22,
        'tempTolerance': 1,
        'targetHumidity': 50,
        'humidityTolerance': 10,
        'targetCO2': 800,
        'co2Tolerance': 200
    },
    'standard_cooling': {
        'targetTemperature': 6,
        'tempTolerance': 2,
        'targetHumidity': 70,
        'humidityTolerance': 5,
        'targetCO2': 800,
        'co2Tolerance': 200
    },
    'deep_freezing': {
        'targetTemperature': -19,
        'tempTolerance': 1,
        'targetHumidity': 85,
        'humidityTolerance': 5,
        'targetCO2': 800,
        'co2Tolerance': 200
    },
    'fruits_vegetables': {
        'targetTemperature': 10,
        'tempTolerance': 2,
        'targetHumidity': 90,
        'humidityTolerance': 5,
        'targetCO2': 800,
        'co2Tolerance': 200
    },
    'bakery': {
        'targetTemperature': 21,
        'tempTolerance': 1,
        'targetHumidity': 55,
        'humidityTolerance': 5,
        'targetCO2': 800,
        'co2Tolerance': 200
    },
    'meat': {
        'targetTemperature': 3,
        'tempTolerance': 1,
        'targetHumidity': 88,
        'humidityTolerance': 3,
        'targetCO2': 800,
        'co2Tolerance': 200
    },
    'dairy': {
        'targetTemperature': 6,
        'tempTolerance': 2,
        'targetHumidity': 80,
        'humidityTolerance': 5,
        'targetCO2': 800,
        'co2Tolerance': 200
    }
}

ENERGY_TEMPLATES = {
    'cooling_system': {
        'targetVoltage': 230,
        'voltageTolerance': 10,
        'targetCurrent': 10,
        'currentTolerance': 1
    },
    'lighting': {
        'targetVoltage': 230,
        'voltageTolerance': 10,
        'targetCurrent': 5,
        'currentTolerance': 1
    },
    'it_systems': {
        'targetVoltage': 230,
        'voltageTolerance': 5,
        'targetCurrent': 3,
        'currentTolerance': 0.5
    }
}

def simulate_anomaly(sensor_type: str, use_case: int) -> Dict:
    """Generiert realistische Anomalien für verschiedene Sensortypen."""
    anomalies = {
        "climate": {
            # Klimaanlagenausfall
            "cooling_failure": {
                "temperature": lambda t: t + random.uniform(5, 10),
                "humidity": lambda h: h + random.uniform(10, 20),
                "co2": lambda c: c
            },
            # Lüftungsausfall
            "ventilation_failure": {
                "temperature": lambda t: t + random.uniform(2, 4),
                "humidity": lambda h: h + random.uniform(15, 25),
                "co2": lambda c: c + random.uniform(300, 500)
            },
            # Sensorfehler
            "sensor_malfunction": {
                "temperature": lambda t: t * random.uniform(0.5, 1.5),
                "humidity": lambda h: h * random.uniform(0.5, 1.5),
                "co2": lambda c: c * random.uniform(0.5, 1.5)
            }
        },
        "energy": {
            # Spannungsspitze
            "voltage_spike": {
                "voltage": lambda v: v * random.uniform(1.2, 1.4),
                "current": lambda c: c
            },
            # Stromausfall
            "power_outage": {
                "voltage": lambda v: v * random.uniform(0, 0.2),
                "current": lambda c: c * random.uniform(0, 0.2)
            },
            # Überlast
            "overload": {
                "voltage": lambda v: v * random.uniform(0.8, 0.9),
                "current": lambda c: c * random.uniform(1.5, 2.0)
            }
        },
        "distance": {
            # Für Füllstände (use_case 1)
            1: {
                # Sensorfehler
                "sensor_error": {
                    "distance": lambda d: d * random.uniform(1.5, 2.0)
                },
                # Plötzliche Leerung
                "sudden_empty": {
                    "distance": lambda d: d * random.uniform(0.9, 1.0)
                }
            },
            # Für Türen (use_case 3)
            3: {
                # Tür klemmt
                "door_stuck": {
                    "distance": lambda d: d + random.uniform(5, 10)
                },
                # Sensor lose
                "sensor_loose": {
                    "distance": lambda d: d * random.uniform(0.5, 1.5)
                }
            }
        }
    }

    if sensor_type not in anomalies:
        return {}

    if sensor_type == "distance":
        anomaly_dict = anomalies[sensor_type][use_case]
    else:
        anomaly_dict = anomalies[sensor_type]

    # Wähle zufällige Anomalie
    anomaly_type = random.choice(list(anomaly_dict.keys()))
    return anomaly_dict[anomaly_type]

def load_json(file_path: str) -> Dict:
    """Lädt JSON-Daten aus einer Datei."""
    try:
        with open(file_path, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        print("Datei nicht gefunden. Es wird eine neue Datei erstellt.")
        return {"sensors": []}

def save_json(data: Dict, file_path: str) -> None:
    """Speichert JSON-Daten in eine Datei."""
    with open(file_path, "w") as file:
        json.dump(data, file, indent=2)

def generate_climate_data(template: Dict, timestamp: datetime, last_values: Optional[Dict] = None,
                        anomaly: Optional[Dict] = None) -> Dict:
    """Generiert realistische Klimadaten basierend auf Template und Tageszeit."""
    if not last_values:
        last_values = {
            'temperature': template['targetTemperature'],
            'humidity': template['targetHumidity'],
            'co2': template['targetCO2']
        }

    # Tageszeit-Faktoren (0.0 bis 1.0)
    hour = timestamp.hour
    day_factor = 1.0 - abs(hour - 12) / 12  # Maximum um 12 Uhr
    is_business_hours = 8 <= hour <= 20

    # Zufällige Schwankungen mit Trägheit
    temp_change = random.uniform(-0.3, 0.3)
    humidity_change = random.uniform(-2, 2)
    co2_change = random.uniform(-30, 30) + (day_factor * 100 if is_business_hours else 0)

    # Anwenden der Anomalie falls vorhanden
    if anomaly:
        temperature = anomaly['temperature'](last_values['temperature'])
        humidity = anomaly['humidity'](last_values['humidity'])
        co2 = anomaly['co2'](last_values['co2'])
    else:
        temperature = max(min(
            last_values['temperature'] + temp_change,
            template['targetTemperature'] + template['tempTolerance'] * 3
        ), template['targetTemperature'] - template['tempTolerance'] * 3)

        humidity = max(min(
            last_values['humidity'] + humidity_change,
            template['targetHumidity'] + template['humidityTolerance'] * 3
        ), template['targetHumidity'] - template['humidityTolerance'] * 3)

        co2 = max(min(
            last_values['co2'] + co2_change,
            template['targetCO2'] + template['co2Tolerance'] * 3
        ), template['targetCO2'] - template['co2Tolerance'] * 3)

    return {
        'temperature': round(temperature, 1),
        'humidity': round(humidity, 1),
        'co2': round(co2),
        'moldy?': humidity > 65 and temperature > 22
    }

def generate_energy_data(template: Dict, timestamp: datetime, last_values: Optional[Dict] = None,
                        anomaly: Optional[Dict] = None) -> Dict:
    """Generiert realistische Energiedaten basierend auf Template und Tageszeit."""
    if not last_values:
        last_values = {
            'voltage': template['targetVoltage'],
            'current': template['targetCurrent']
        }

    # Tageszeit-Faktoren
    hour = timestamp.hour
    is_business_hours = 8 <= hour <= 20
    day_factor = 1.0 - abs(hour - 12) / 12

    # Zufällige Schwankungen mit Trägheit
    voltage_change = random.uniform(-0.5, 0.5)
    current_change = random.uniform(-0.2, 0.2) * (1.5 if is_business_hours else 0.8)

    # Anwenden der Anomalie falls vorhanden
    if anomaly:
        voltage = anomaly['voltage'](last_values['voltage'])
        current = anomaly['current'](last_values['current'])
    else:
        voltage = max(min(
            last_values['voltage'] + voltage_change,
            template['targetVoltage'] + template['voltageTolerance'] * 3
        ), template['targetVoltage'] - template['voltageTolerance'] * 3)

        current = max(min(
            last_values['current'] + current_change,
            template['targetCurrent'] + template['currentTolerance'] * 3
        ), template['targetCurrent'] - template['currentTolerance'] * 3)

    return {
        'voltage': round(voltage, 1),
        'current': round(current, 1)
    }

def generate_distance_fill_data(parameters: Dict, timestamp: datetime, last_value: Optional[float] = None,
                              anomaly: Optional[Dict] = None) -> Dict:
    """Generiert realistische Füllstandsdaten."""
    if last_value is None:
        last_value = parameters['maxDistance'] - (parameters['maxDistance'] - parameters['minDistance']) * 0.7

    # Tageszeit-Faktoren
    hour = timestamp.hour
    is_business_hours = 8 <= hour <= 20

    # Anwenden der Anomalie falls vorhanden
    if anomaly:
        distance = anomaly['distance'](last_value)
    else:
        # Simuliere realistischen Verbrauch
        if is_business_hours:
            change_rate = random.uniform(0.1, 0.3)  # Schnellerer Verbrauch
            # Simuliere Nachfüllungen (5% Wahrscheinlichkeit)
            if random.random() < 0.05:
                distance = parameters['maxDistance']  # Vollständig gefüllt
            else:
                distance = min(parameters['maxDistance'], last_value + change_rate)
        else:
            change_rate = random.uniform(0, 0.1)  # Langsamerer Verbrauch
            distance = min(parameters['maxDistance'], last_value + change_rate)

    return {'distance': round(distance, 1)}

def generate_distance_door_data(parameters: Dict, timestamp: datetime, last_value: Optional[float] = None,
                              anomaly: Optional[Dict] = None) -> Dict:
    """Generiert realistische Tür-/Öffnungsdaten."""
    hour = timestamp.hour
    is_business_hours = 8 <= hour <= 20
    
    # Grundzustand: geschlossen
    if last_value is None:
        return {'distance': parameters['targetDistance']}

    # Anwenden der Anomalie falls vorhanden
    if anomaly:
        distance = anomaly['distance'](last_value)
    else:
        if is_business_hours:
            if last_value <= parameters['targetDistance']:  # Tür ist zu
                # 10% Chance zu öffnen
                if random.random() < 0.1:
                    distance = parameters['targetDistance'] + parameters['tolerance'] * 3
                else:
                    distance = last_value
            else:  # Tür ist offen
                # 80% Chance zu schließen
                if random.random() < 0.8:
                    distance = parameters['targetDistance']
                else:
                    distance = last_value
        else:
            # Außerhalb der Geschäftszeiten meist geschlossen
            if random.random() < 0.95:  # 95% Chance zu schließen
                distance = parameters['targetDistance']
            else:
                distance = last_value

    return {'distance': round(distance, 1)}

def generate_history(sensor_type: str, use_case: int, template: Optional[Dict] = None, 
                    start_date: datetime = None) -> List[Dict]:
    """Generiert History von start_date bis heute mit realistischen Werten."""
    if start_date is None:
        # Generiere die letzten 7 Tage
        start_date = datetime.now() - timedelta(days=7)
    
    history = []
    current_time = datetime.now()
    current = start_date

    # Initialisiere last_values
    if sensor_type == "climate":
        last_values = {
            'temperature': template['targetTemperature'],
            'humidity': template['targetHumidity'],
            'co2': template['targetCO2']
        }
    elif sensor_type == "energy":
        last_values = {
            'voltage': template['targetVoltage'],
            'current': template['targetCurrent']
        }
    elif sensor_type == "distance":
        if use_case == 1:  # Füllstand
            last_values = {'distance': template['maxDistance']}
        else:  # Öffnungen
            last_values = {'distance': template['targetDistance']}

    # Anomalie-Management
    anomaly_active = False
    anomaly_end = None
    current_anomaly = None

    while current <= current_time:
        # Wähle Intervall basierend auf Sensor-Typ und Use-Case
        if sensor_type == "distance" and use_case == 3:  # Tür-Sensoren
            interval = timedelta(minutes=5)
        else:
            interval = timedelta(minutes=15)

        # Anomalie-Management
        if not anomaly_active and random.random() < 0.001:  # 0.1% Chance für neue Anomalie
            anomaly_active = True
            # Anomalie dauert 30-120 Minuten
            anomaly_duration = timedelta(minutes=random.randint(30, 120))
            anomaly_end = current + anomaly_duration
            current_anomaly = simulate_anomaly(sensor_type, use_case)
            print(f"Anomalie gestartet bei {current} für {anomaly_duration}")
        elif anomaly_active and current >= anomaly_end:
            anomaly_active = False
            current_anomaly = None
            print(f"Anomalie beendet bei {current}")

        # Generiere Daten basierend auf Sensortyp
        if sensor_type == "climate":
            data = generate_climate_data(template, current, last_values, 
                                      current_anomaly if anomaly_active else None)
            last_values = data
        elif sensor_type == "energy":
            data = generate_energy_data(template, current, last_values,
                                     current_anomaly if anomaly_active else None)
            last_values = data
        elif sensor_type == "distance":
            if use_case == 1:  # Füllstand
                data = generate_distance_fill_data(template, current, last_values['distance'],
                                                current_anomaly if anomaly_active else None)
            else:  # Öffnungen
                data = generate_distance_door_data(template, current, last_values['distance'],
                                               current_anomaly if anomaly_active else None)
            last_values = data

        history.append({
            "timestamp": current.isoformat(),
            "data": data
        })
        
        current += interval

    return history

def add_sensors(sensors: List[Dict], num_sensors: int = 1) -> None:
    """Fügt eine angegebene Anzahl von Sensoren mit realistischen Daten hinzu."""
    sensor_id = max(sensor["id"] for sensor in sensors) + 1 if sensors else 1
    
    start_date = datetime.now() - timedelta(days=7)  # Die letzten 7 Tage

    for _ in range(num_sensors):
        sensor_type = random.choice(["climate", "distance", "energy"])
        
        # Bestimme Use Case und Template basierend auf Sensor-Typ
        if sensor_type == "climate":
            matched_usecase = 2  # Luftqualität
            template_name = random.choice(list(CLIMATE_TEMPLATES.keys()))
            template = CLIMATE_TEMPLATES[template_name]
        elif sensor_type == "energy":
            matched_usecase = 4  # Stromversorgung
            template_name = random.choice(list(ENERGY_TEMPLATES.keys()))
            template = ENERGY_TEMPLATES[template_name]
        else:  # distance
            matched_usecase = random.choice([1, 3])  # Füllstände oder Öffnungen
            if matched_usecase == 1:
                template = {
                    'minDistance': 0,
                    'maxDistance': 100,
                    'warningThreshold': 40,
                    'criticalThreshold': 20
                }
            else:
                template = {
                    'targetDistance': 5,
                    'tolerance': 3
                }

        history = generate_history(sensor_type, matched_usecase, template, start_date)

        new_sensor = {
            "id": sensor_id,
            "type": sensor_type,
            "data": history[-1]["data"],  # Aktuelle Daten sind der letzte History-Eintrag
            "history": history,
            "matchedUseCase": None,
            "parameters": template
        }

        sensors.append(new_sensor)
        print(f"Sensor mit ID {sensor_id}, Typ {sensor_type} und UseCase {matched_usecase} hinzugefügt.")
        sensor_id += 1

def main():
    data = load_json(JSON_FILE_PATH)
    sensors = data.get("sensors", [])

    while True:
        print("\n1. Neue Sensoren hinzufügen")
        print("2. Sensorliste anzeigen")
        print("3. Sensorliste zurücksetzen")
        print("4. Beenden")
        choice = input("Wahl: ")

        if choice == "1":
            num_sensors = int(input("Anzahl der hinzuzufügenden Sensoren: "))
            add_sensors(sensors, num_sensors)
        elif choice == "2":
            print(json.dumps(sensors, indent=2))
        elif choice == "3":
            sensors = []
            print("Sensorliste wurde zurückgesetzt.")
        elif choice == "4":
            break
        else:
            print("Ungültige Eingabe.")

    data["sensors"] = sensors
    save_json(data, JSON_FILE_PATH)
    print("Daten gespeichert.")

if __name__ == "__main__":
    main()