import json
from datetime import datetime, timedelta
import random
import os
import uuid

class ShopDataGenerator:
    def __init__(self):
        self.now = datetime.now()
        self.data = {
            "sensors": [],
            "rooms": [],
            "assets": [],
            "categories": [],
            "favorites": []
        }
        
        # Detaillierte Shop-Struktur
        self.ROOMS = [
            {"name": "Verkaufsraum", "description": "Hauptverkaufsbereich mit Regalen und Kühltheken"},
            {"name": "Kühlbereich", "description": "Gekühlter Lagerbereich für empfindliche Waren"},
            {"name": "Lager", "description": "Zentraler Lagerbereich für Trockenwaren"},
            {"name": "Backshop", "description": "Bereich für Backwaren und Frischprodukte"}
        ]
        
        self.CATEGORIES = [
            {"name": "Kühlregale", "description": "Gekühlte Verkaufsbereiche"},
            {"name": "Trockenwaren", "description": "Regale für nicht gekühlte Produkte"},
            {"name": "Tiefkühlung", "description": "Tiefgekühlte Bereiche"},
            {"name": "Zugänge", "description": "Ein- und Ausgänge"}
        ]
        
        self.ASSETS = {
            "Kühlregale": [
                {"name": "Milchprodukte-Kühlung", "sensors": ["climate", "energy"], "warning_prob": 0.2},
                {"name": "Getränke-Kühlung", "sensors": ["climate", "energy"], "warning_prob": 0.1},
                {"name": "Frischetheke", "sensors": ["climate", "energy"], "warning_prob": 0.3}
            ],
            "Trockenwaren": [
                {"name": "Konserven-Regal", "sensors": ["distance"], "warning_prob": 0.4},
                {"name": "Gewürze-Regal", "sensors": ["distance"], "warning_prob": 0.2},
                {"name": "Süßwaren-Regal", "sensors": ["distance"], "warning_prob": 0.3}
            ],
            "Tiefkühlung": [
                {"name": "Tiefkühl-Truhe 1", "sensors": ["climate", "energy"], "warning_prob": 0.1},
                {"name": "Tiefkühl-Truhe 2", "sensors": ["climate", "energy"], "warning_prob": 0.2}
            ],
            "Zugänge": [
                {"name": "Haupteingang", "sensors": ["distance"], "warning_prob": 0.3},
                {"name": "Lagereingang", "sensors": ["distance"], "warning_prob": 0.1}
            ]
        }
        
        self.ROOM_CATEGORIES = {
            "Verkaufsraum": ["Kühlregale", "Trockenwaren", "Zugänge"],
            "Lager": ["Trockenwaren", "Zugänge"],
            "Kühlbereich": ["Kühlregale", "Tiefkühlung"],
            "Backshop": ["Kühlregale", "Trockenwaren"]
        }

    def generate_id(self, prefix='', length=12):
        """Generiert eine eindeutige ID mit optionalem Präfix."""
        unique_id = str(uuid.uuid4().hex)[:length]
        return f"{prefix}{unique_id}" if prefix else unique_id

    def generate_sensor_parameters(self, sensor_type, asset_name):
        """Generiert realistische Parameter für verschiedene Sensortypen."""
        if sensor_type == "climate":
            if "Tiefkühl" in asset_name:
                return {
                    "targetTemperature": -18,
                    "tempTolerance": 2,
                    "targetHumidity": 70,
                    "humidityTolerance": 5,
                    "targetCO2": 800,
                    "co2Tolerance": 200
                }
            elif "Frischetheke" in asset_name:
                return {
                    "targetTemperature": 4,
                    "tempTolerance": 1,
                    "targetHumidity": 80,
                    "humidityTolerance": 10,
                    "targetCO2": 800,
                    "co2Tolerance": 200
                }
            else:
                return {
                    "targetTemperature": 21,
                    "tempTolerance": 2,
                    "targetHumidity": 50,
                    "humidityTolerance": 10,
                    "targetCO2": 800,
                    "co2Tolerance": 200
                }
        
        elif sensor_type == "energy":
            return {
                "targetVoltage": 230,
                "voltageTolerance": 10,
                "targetCurrent": 5,
                "currentTolerance": 1
            }
        
        elif sensor_type == "distance":
            if "Eingang" in asset_name:
                return {
                    "targetDistance": 5,
                    "tolerance": 2
                }
            else:
                return {
                    "minDistance": 0,
                    "maxDistance": 100,
                    "warningThreshold": 40,
                    "criticalThreshold": 20
                }
        
        return {}

    def generate_sensor_history(self, sensor_type, parameters, is_warning=False):
        """Generiert realistische Sensor-Historiendaten."""
        history = []
        current_time = self.now - timedelta(days=7)
        
        if sensor_type == "climate":
            temp = parameters["targetTemperature"]
            humidity = parameters["targetHumidity"]
            co2 = parameters["targetCO2"]
            
            for _ in range(672):  # 7 Tage x 24h x 4 (15-min Intervalle)
                # Einführung realistischer Variationen
                if is_warning:
                    temp += random.uniform(2, 4)
                    humidity += random.uniform(10, 20)
                    co2 += random.uniform(100, 200)
                else:
                    # Natürliche Schwankungen
                    hour = current_time.hour
                    if 7 <= hour <= 20:  # Geschäftszeiten
                        temp += random.uniform(-0.5, 0.5)
                        humidity += random.uniform(-2, 2)
                        co2 += random.uniform(-50, 50)
                    else:
                        temp += random.uniform(-0.2, 0.2)
                        humidity += random.uniform(-1, 1)
                        co2 += random.uniform(-20, 20)
                
                # Grenzen begrenzen
                temp = max(min(temp, parameters["targetTemperature"] + 5), 
                          parameters["targetTemperature"] - 5)
                humidity = max(min(humidity, 95), 30)
                co2 = max(min(co2, 2000), 400)
                
                history.append({
                    "timestamp": current_time.isoformat(),
                    "data": {
                        "temperature": round(temp, 1),
                        "humidity": round(humidity, 1),
                        "co2": round(co2),
                        "moldy?": humidity > 70 and temp > 25
                    }
                })
                
                current_time += timedelta(minutes=15)
        
        elif sensor_type == "energy":
            voltage = parameters["targetVoltage"]
            current = parameters["targetCurrent"]
            
            for _ in range(672):
                hour = current_time.hour
                
                # Tageszeit-abhängige Variationen
                if 22 <= hour or hour < 6:  # Nachts
                    current_factor = 0.8
                elif 10 <= hour <= 18:  # Hauptgeschäftszeit
                    current_factor = 1.2
                else:
                    current_factor = 1.0
                
                # Zufällige Schwankungen
                if is_warning:
                    voltage += random.uniform(10, 20)
                    current += random.uniform(1, 2) * current_factor
                else:
                    voltage += random.uniform(-2, 2)
                    current += random.uniform(-0.3, 0.3) * current_factor
                
                history.append({
                    "timestamp": current_time.isoformat(),
                    "data": {
                        "voltage": round(voltage, 1),
                        "current": round(current, 2)
                    }
                })
                
                current_time += timedelta(minutes=15)
        
        elif sensor_type == "distance":
            if "targetDistance" in parameters:  # Türsensor
                distance = parameters["targetDistance"]
                tolerance = parameters["tolerance"]
                
                for _ in range(2016):  # 7 Tage x 24h x 12 (5-min Intervalle)
                    hour = current_time.hour
                    
                    # Simuliere Öffnungsmuster
                    if 7 <= hour <= 20:  # Geschäftszeiten
                        is_open = random.random() < 0.3
                    else:
                        is_open = random.random() < 0.05
                    
                    current_distance = parameters["targetDistance"] + \
                        (tolerance * 3 if is_open else 0)
                    
                    history.append({
                        "timestamp": current_time.isoformat(),
                        "data": {
                            "distance": round(current_distance, 1)
                        }
                    })
                    
                    current_time += timedelta(minutes=5)
            
            else:  # Füllstandssensor
                current_distance = parameters["minDistance"]
                last_restock = current_time
                
                for _ in range(672):  # 7 Tage x 24h x 4
                    hour = current_time.hour
                    
                    # Simuliere Verbrauch und Auffüllung
                    if 8 <= hour <= 20:
                        time_since_restock = current_time - last_restock
                        fill_level = ((parameters["maxDistance"] - current_distance) / 
                                     (parameters["maxDistance"] - parameters["minDistance"])) * 100
                        
                        # Auffüllung bei niedrigem Füllstand
                        if ((fill_level < 30 and time_since_restock > timedelta(hours=2)) or 
                            fill_level < 15):
                            current_distance = parameters["minDistance"]
                            last_restock = current_time
                        else:
                            # Verbrauchsrate variieren
                            consumption = random.uniform(0.2, 1.5) if 10 <= hour <= 18 else random.uniform(0.1, 0.5)
                            current_distance += consumption
                    else:
                        # Minimaler Verbrauch außerhalb der Geschäftszeiten
                        current_distance += random.uniform(0, 0.1)
                    
                    # Begrenze auf maximale Distanz
                    current_distance = min(current_distance, parameters["maxDistance"])
                    
                    history.append({
                        "timestamp": current_time.isoformat(),
                        "data": {
                            "distance": round(current_distance, 1)
                        }
                    })
                    
                    current_time += timedelta(minutes=15)
        
        return sorted(history, key=lambda x: x["timestamp"])

    def add_rooms(self):
        """Erstelle Räume für den Shop."""
        self.data["rooms"] = [
            {"name": room["name"], "id": self.generate_id('ROOM_')} 
            for room in self.ROOMS
        ]
        return self.data["rooms"]

    def add_categories(self):
        """Erstelle Kategorien für Assets."""
        self.data["categories"] = [
            {"name": category["name"], "id": self.generate_id('CAT_')} 
            for category in self.CATEGORIES
        ]
        return self.data["categories"]

    def add_assets(self, rooms, categories):
        """Erstelle Assets für den Shop."""
        room_dict = {room["name"]: room["id"] for room in rooms}
        category_dict = {category["name"]: category["id"] for category in categories}
        
        assets = []
        
        for room_name, allowed_categories in self.ROOM_CATEGORIES.items():
            room_id = room_dict[room_name]
            
            for category_name in allowed_categories:
                category_id = category_dict[category_name]
                
                for asset_def in self.ASSETS[category_name]:
                    asset_id = self.generate_id('AST_')
                    assets.append({
                        "name": asset_def["name"],
                        "id": asset_id,
                        "roomId": room_id,
                        "categoryId": category_id
                    })
        
        self.data["assets"] = assets
        return assets

    def add_sensors(self, assets):
        """Generiere Sensoren für Assets."""
        sensors = []
        
        for asset in assets:
            # Finde entsprechende Asset-Definition
            asset_def = next(
                (item for cat in self.ASSETS.values() for item in cat if item["name"] == asset["name"]),
                None
            )
            
            if asset_def and "sensors" in asset_def:
                for sensor_type in asset_def["sensors"]:
                    # Bestimme, ob Warnung generiert werden soll
                    is_warning = random.random() < asset_def.get("warning_prob", 0.1)
                    
                    # Generiere Parameter und History
                    parameters = self.generate_sensor_parameters(sensor_type, asset["name"])
                    history = self.generate_sensor_history(sensor_type, parameters, is_warning)
                    
                    # Bestimme Use Case
                    if sensor_type == "climate":
                        use_case = 2  # Raumklima
                        sensor_id_prefix = 'CLIM_'
                    elif sensor_type == "energy":
                        use_case = 4  # Energieüberwachung
                        sensor_id_prefix = 'ENRG_'
                    elif "Eingang" in asset["name"]:
                        use_case = 3  # Öffnungen
                        sensor_id_prefix = 'DOOR_'
                    else:
                        use_case = 1  # Füllstände
                        sensor_id_prefix = 'FILL_'
                    
                    # Erstelle Sensor mit eindeutiger ID
                    sensor_id = self.generate_id(sensor_id_prefix)
                    
                    sensor = {
                        "id": sensor_id,
                        "type": sensor_type,
                        "data": history[-1]["data"],
                        "history": history,
                        "matchedUseCase": use_case,
                        "parameters": parameters,
                        "assetId": asset["id"],
                        "roomId": asset["roomId"]
                    }
                    
                    sensors.append(sensor)
        
        self.data["sensors"] = sensors
        return sensors

    def add_favorites(self, sensors):
        """Erstelle Favoriten für eine Teilmenge der Sensoren."""
        # Wähle 20% der Sensoren als Favoriten aus
        num_favorites = max(1, len(sensors) // 5)
        favorite_sensors = random.sample(sensors, num_favorites)
        
        favorites = []
        for sensor in favorite_sensors:
            favorites.append({
                "id": self.generate_id('FAV_'),
                "entityType": "sensor",
                "entityId": sensor["id"],
                "timestamp": self.now.isoformat()
            })
        
        # Füge auch einen Use Case Favoriten hinzu
        unique_usecases = set(sensor["matchedUseCase"] for sensor in sensors)
        for usecase in list(unique_usecases)[:1]:  # Wähle den ersten Use Case
            favorites.append({
                "id": self.generate_id('FAV_'),
                "entityType": "useCase",
                "entityId": str(usecase),
                "timestamp": self.now.isoformat()
            })
        
        self.data["favorites"] = favorites
        return favorites

    def generate(self):
        """Generiere vollständige Shop-Daten."""
        rooms = self.add_rooms()
        categories = self.add_categories()
        assets = self.add_assets(rooms, categories)
        sensors = self.add_sensors(assets)
        self.add_favorites(sensors)
        
        return self.data

def main():
    """Hauptfunktion zum Generieren und Speichern der Daten."""
    # Zeitstempel für konsistente Daten
    generator = ShopDataGenerator()
    shop_data = generator.generate()
    
    # Stelle Ausgabeverzeichnis sicher
    output_file = os.path.join('src', 'data', 'sensorData.json')
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Speichere Daten
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(shop_data, f, indent=2, ensure_ascii=False)
    
    # Ausgabe von Statistiken
    print("\nStatistiken:")
    print(f"Räume: {len(shop_data['rooms'])}")
    print(f"Kategorien: {len(shop_data['categories'])}")
    print(f"Assets: {len(shop_data['assets'])}")
    print(f"Sensoren: {len(shop_data['sensors'])}")
    print(f"Favoriten: {len(shop_data['favorites'])}")
    
    # Detaillierte Sensor-Verteilung
    print("\nSensor-Verteilung:")
    sensor_types = {}
    for sensor in shop_data['sensors']:
        sensor_types[sensor['type']] = sensor_types.get(sensor['type'], 0) + 1
    
    for sensor_type, count in sensor_types.items():
        print(f"{sensor_type}: {count} Sensoren")
    
    # Use Case Verteilung
    print("\nUse Case Verteilung:")
    use_cases = {}
    for sensor in shop_data['sensors']:
        use_cases[sensor['matchedUseCase']] = use_cases.get(sensor['matchedUseCase'], 0) + 1
    
    use_case_names = {
        1: "Füllstände",
        2: "Raumklima",
        3: "Öffnungen",
        4: "Energieüberwachung"
    }
    
    for use_case, count in use_cases.items():
        print(f"{use_case_names.get(use_case, 'Unbekannt')}: {count} Sensoren")

if __name__ == "__main__":
    main()