// utils/NotificationContext.js
import React, { createContext, useState, useCallback, useMemo } from 'react';
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../Components/Notification';

export const NotificationContext = createContext(null);

const MAX_HISTORY_SIZE = 100; // Maximale Anzahl der gespeicherten Benachrichtigungen

export const NotificationProvider = ({ children }) => {
  // Aktive Benachrichtigungen (werden angezeigt)
  const [activeNotifications, setActiveNotifications] = useState([]);
  // Benachrichtigungshistorie
  const [notificationHistory, setNotificationHistory] = useState([]);
  // Filter für die Historie
  const [historyFilter, setHistoryFilter] = useState({
    types: Object.values(NOTIFICATION_TYPES),
    timeRange: 'all', // 'all', 'today', 'week', 'month'
    sensorIds: [], // Leeres Array bedeutet alle Sensoren
    searchQuery: ''
  });

  const addNotification = useCallback((type, message, sensorId = null) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      sensorId,
      timestamp: new Date().toISOString(),
      priority: NOTIFICATION_PRIORITIES[type]
    };

    // Füge zur aktiven Liste hinzu
    setActiveNotifications(prev => 
      [...prev, newNotification]
        .sort((a, b) => b.priority - a.priority) // Sortiere nach Priorität
    );

    // Füge zur Historie hinzu
    setNotificationHistory(prev => {
      const newHistory = [newNotification, ...prev];
      return newHistory.slice(0, MAX_HISTORY_SIZE);
    });

    // Automatisches Entfernen nach 5 Sekunden für Info-Benachrichtigungen
    if (type === NOTIFICATION_TYPES.INFO) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setActiveNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setActiveNotifications([]);
  }, []);

  // Gefilterte Historie basierend auf den aktuellen Filtereinstellungen
  const filteredHistory = useMemo(() => {
    return notificationHistory.filter(notification => {
      // Typ-Filter
      if (!historyFilter.types.includes(notification.type)) return false;

      // Zeitraum-Filter
      if (historyFilter.timeRange !== 'all') {
        const notificationDate = new Date(notification.timestamp);
        const now = new Date();
        switch (historyFilter.timeRange) {
          case 'today':
            if (notificationDate.getDate() !== now.getDate()) return false;
            break;
          case 'week':
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            if (notificationDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
            if (notificationDate < monthAgo) return false;
            break;
          default:
            break;
        }
      }

      // Sensor-Filter
      if (historyFilter.sensorIds.length > 0 && !historyFilter.sensorIds.includes(notification.sensorId)) {
        return false;
      }

      // Suchfilter
      if (historyFilter.searchQuery) {
        const searchLower = historyFilter.searchQuery.toLowerCase();
        return notification.message.toLowerCase().includes(searchLower);
      }

      return true;
    });
  }, [notificationHistory, historyFilter]);

  const value = {
    activeNotifications,
    notificationHistory: filteredHistory,
    addNotification,
    removeNotification,
    clearAllNotifications,
    historyFilter,
    setHistoryFilter
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};