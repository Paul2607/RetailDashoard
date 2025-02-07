// components/Notification.js
import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const NOTIFICATION_TYPES = {
  WARNING: 'warning',
  CRITICAL: 'critical',
  INFO: 'info'
};

export const NOTIFICATION_PRIORITIES = {
  [NOTIFICATION_TYPES.INFO]: 0,
  [NOTIFICATION_TYPES.WARNING]: 1,
  [NOTIFICATION_TYPES.CRITICAL]: 2
};

const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.WARNING:
      return <AlertTriangle className="w-5 h-5" />;
    case NOTIFICATION_TYPES.CRITICAL:
      return <AlertCircle className="w-5 h-5" />;
    case NOTIFICATION_TYPES.INFO:
    default:
      return <Info className="w-5 h-5" />;
  }
};

const getNotificationStyles = (type) => {
  const baseStyles = {
    container: `
      flex items-center gap-3 p-4 rounded-lg shadow-lg mb-2
      transform transition-all duration-300 ease-in-out
      hover:translate-x-1
    `,
    icon: "flex-shrink-0",
    content: "flex-grow",
    closeButton: `
      flex-shrink-0 opacity-70 hover:opacity-100
      transition-opacity duration-200
    `
  };

  switch (type) {
    case NOTIFICATION_TYPES.WARNING:
      return {
        ...baseStyles,
        container: `${baseStyles.container} bg-amber-100 text-amber-900`,
        icon: `${baseStyles.icon} text-amber-600`
      };
    case NOTIFICATION_TYPES.CRITICAL:
      return {
        ...baseStyles,
        container: `${baseStyles.container} bg-red-100 text-red-900`,
        icon: `${baseStyles.icon} text-red-600`
      };
    case NOTIFICATION_TYPES.INFO:
    default:
      return {
        ...baseStyles,
        container: `${baseStyles.container} bg-blue-100 text-blue-900`,
        icon: `${baseStyles.icon} text-blue-600`
      };
  }
};

const Notification = ({ 
  type = NOTIFICATION_TYPES.INFO,
  message,
  timestamp,
  sensorId,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const styles = getNotificationStyles(type);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Allow animation to complete
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={styles.container} role="alert">
      <div className={styles.icon}>
        {getNotificationIcon(type)}
      </div>
      
      <div className={styles.content}>
        <div className="font-semibold">
          {message}
        </div>
        {(sensorId || timestamp) && (
          <div className="text-sm opacity-75">
            {sensorId && `Sensor ${sensorId}`}
            {sensorId && timestamp && ' • '}
            {timestamp && new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        className={styles.closeButton}
        aria-label="Schließen"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Notification;