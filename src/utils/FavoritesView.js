import React from 'react';
import { useFavorites } from '../utils/FavoritesContext';
import SensorCard from './SensorCard';
import styles from '../styles/AppStyles';
import { FaArrowLeft, FaStar } from 'react-icons/fa';

const FavoritesView = ({ sensors, onClose }) => {
  const { favorites } = useFavorites();

  // Filter Sensoren basierend auf Favoriten
  const favoriteSensors = sensors.filter(sensor => 
    favorites.some(fav => fav.sensorId === sensor.id.toString())
  );

  // Sortiere nach Zeitstempel (neueste zuerst)
  const sortedFavorites = [...favoriteSensors].sort((a, b) => {
    const favA = favorites.find(fav => fav.sensorId === a.id.toString());
    const favB = favorites.find(fav => fav.sensorId === b.id.toString());
    return new Date(favB.timestamp) - new Date(favA.timestamp);
  });

  return (
    <div style={styles.appContainer}>
      <div style={styles.detailViewHeader}>
        <button onClick={onClose} style={styles.backButton}>
          <FaArrowLeft />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaStar style={{ color: '#FFD700' }} />
          <h2 style={styles.sectionTitle}>Favoriten</h2>
        </div>
      </div>

      {favoriteSensors.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          color: '#666'
        }}>
          <FaStar style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
          <p>Keine Favoriten vorhanden</p>
          <p style={{ fontSize: '0.9em' }}>
            Fügen Sie Sensoren zu Ihren Favoriten hinzu, indem Sie den Stern auf einer Sensorkarte anklicken
          </p>
        </div>
      ) : (
        <div style={styles.sensorCardGrid}>
          {sortedFavorites.map(sensor => (
            <SensorCard
              key={sensor.id}
              sensor={sensor}
              isDetailCard={true}
              renderContent={(sensor) => {
                // Hier können wir die existierende Render-Logik für verschiedene Sensortypen wiederverwenden
                // Dies würde aus der DetailedViewSensors.js übernommen
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;