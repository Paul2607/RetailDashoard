// App.js
import React, { useState, useEffect } from "react";
import { useDragAndDrop } from "./utils/dragndrop";
import styles from "./styles/AppStyles";
import defaultUseCases from "./data/defaultUseCases";
import Navigation from "./utils/Navigation";
import ViewSelector from "./Components/ViewSelector";
import { SensorEditView } from './Components/SensorManagement/index';
import { NOTIFICATION_TYPES } from './Components/Notification';
import { NotificationContext } from './utils/NotificationContext';
import { dataSync } from './utils/server-api';
import { calculateOverallStatus } from './utils/statusCalculations';
import { useTheme } from './utils/ThemeContext';

const App = () => {
  // DragAndDrop state und Funktionen
  const {
    items: useCases,
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragModeActive,
  } = useDragAndDrop(defaultUseCases);

  const { isDarkMode, toggleTheme } = useTheme();  // Hook am Anfang der Komponente
  // State für Views und Navigation
  const [selectedUseCase, setSelectedUseCase] = useState(null);
  const [previousUseCase, setPreviousUseCase] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditingSensors, setIsEditingSensors] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('monitoring');

  // Daten-State
  const [sensors, setSensors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardView, setDashboardView] = useState('useCases');

  // Context für Benachrichtigungen
  const { addNotification } = React.useContext(NotificationContext);

  // Daten initialisieren
  useEffect(() => {
    const initializeData = async () => {
      try {
        const syncedData = await dataSync.initialize();
        setSensors(syncedData.sensors || []);
        setRooms(syncedData.rooms || []);
        setAssets(syncedData.assets || []);
        setCategories(syncedData.categories || []);
      } catch (error) {
        console.error('Fehler beim Initialisieren der Daten:', error);
        addNotification?.(
          NOTIFICATION_TYPES.ERROR, 
          'Fehler beim Laden der Daten'
        );
      }
    };

    initializeData();
  }, [addNotification]);

  // Sensor-Update Funktionen
  const updateSensor = async (sensorId, updates) => {
    try {
      const updatedSensor = { 
        ...sensors.find(s => s.id === sensorId), 
        ...updates 
      };

      const updatedData = await dataSync.syncEntity('sensors', updatedSensor);
      
      setSensors(updatedData.sensors);
      setRooms(updatedData.rooms);
      setAssets(updatedData.assets);
      setCategories(updatedData.categories);

    } catch (error) {
      console.error('Fehler beim Aktualisieren des Sensors:', error);
      addNotification?.(
        NOTIFICATION_TYPES.ERROR, 
        'Fehler beim Aktualisieren des Sensors'
      );
    }
  };

  const updateSensorUseCase = async (sensorId, newMatchedUseCase) => {
    await updateSensor(sensorId, {
      matchedUseCase: newMatchedUseCase ? Number(newMatchedUseCase) : null
    });
  };

  const updateSensorParameters = async (updatedSensor) => {
    try {
      await updateSensor(updatedSensor.id, {
        parameters: updatedSensor.parameters,
        roomId: updatedSensor.roomId,
        assetId: updatedSensor.assetId,
        matchedUseCase: updatedSensor.matchedUseCase,
        categoryId: updatedSensor.categoryId
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Sensor-Parameter:', error);
      addNotification?.(
        NOTIFICATION_TYPES.ERROR, 
        'Fehler beim Aktualisieren der Sensor-Parameter'
      );
    }
  };

  const openDetailView = (useCase) => {
    setSelectedUseCase(useCase);
    setPreviousUseCase(null);
  };

  const openSensorEditView = () => {
    setIsEditingSensors(true);
    setSelectedUseCase(null);
  };

  const closeSensorEditView = (updatedSensors) => {
    setIsEditingSensors(false);
    if (updatedSensors) {
      setSensors(updatedSensors);
    }
    if (previousUseCase) {
      setSelectedUseCase(previousUseCase);
      setPreviousUseCase(null);
    }
  };

  // Render der verschiedenen Views
  const renderContent = () => {
    switch(currentView) {
      case 'monitoring':
          if (isEditingSensors) {
          return (
            <SensorEditView
              sensors={sensors}
              rooms={rooms}
              assets={assets}
              categories={categories}
              useCases={useCases}
              setIsEditingSensors={closeSensorEditView}
              updateSensorUseCase={updateSensorUseCase}
              updateSensorParameters={updateSensorParameters}
              onSensorUpdate={setSensors}
            />
          );
        } else {
          return (
            <main style={styles.mainContent}>
              <ViewSelector 
                currentView={dashboardView}
                onViewChange={setDashboardView}
                useCases={useCases}
                rooms={rooms}
                categories={categories}
                assets={assets}
                sensors={sensors}
                isDragModeActive={isDragModeActive}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                openDetailView={openDetailView}
                calculateOverallStatus={calculateOverallStatus}
              />
            </main>
          );
        }
      
      case 'insights':
        return (
          <div style={styles.contentContainer}>
            <div style={{marginTop: "50px"}}>
              <h2>Insights & Analysen</h2>
              <p style={{ color: '#666', marginTop: '10px' }}>
              Diese Funktion wird in einer späteren Version implementiert.
              </p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div style={{marginTop: "50px"}}>
          <div style={styles.contentContainer}>
            <h2>Verwaltung</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>
              Diese Funktion wird in einer späteren Version implementiert.
            </p>
          </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={styles.appContainer}>
      <Navigation 
        isOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
  
      <header style={styles.header}>
        <p style={{
      ...styles.subtitle, 
      cursor: 'pointer',  // Zeigt an, dass es klickbar ist
      userSelect: 'none'  // Verhindert Textmarkierung
    }}
    onClick={() => {
      // Setze alle Ansichten zurück
      setSelectedUseCase(null);
      setPreviousUseCase(null);
      setIsEditingSensors(false);
      setCurrentView('monitoring');
      setDashboardView('useCases');
      setShowDropdown(false);
    }}
    >mioty retail</p>
      </header>
  
      {!isEditingSensors && currentView === 'monitoring' && !selectedUseCase && (
        <>
          <button
            style={styles.addButton}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            +
          </button>
          {/* Theme Toggle Button */}
          <button
            style={{
              ...styles.addButton,
              right: "60px"  // Versetzt den Button nach links vom + Button
            }}
            onClick={toggleTheme}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </>
      )}


      {showDropdown && (
        <div style={styles.dropdown}>
          <button
            onClick={() => {
              setShowDropdown(false);
              openSensorEditView();
            }}
            style={styles.dropdownItem}
          >
            Sensoren hinzufügen/bearbeiten
          </button>
        </div>
      )}
          
      {renderContent()}

    </div>
  );
};

export default App;