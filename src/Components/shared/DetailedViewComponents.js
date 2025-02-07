import React from 'react';
import { ChevronRight } from 'lucide-react';

// Header Component
export const DetailViewHeader = ({ 
  title,
  subtitle,
  status,
  entityType,
  entityId,
  breadcrumbs = [],
  onClose,
  actions
}) => {
  return (
    <div className="fixed top-[55px] left-0 right-0 z-40">
      {/* Main Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg 
                  className="w-6 h-6 text-gray-500 dark:text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
                </div>
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
              </div>
            </div>
            {actions}

            {status && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${status === 'Normal' ? 'bg-green-500/20 text-green-500' :
                status === 'Warnung' ? 'bg-amber-500/20 text-amber-500' :
                'bg-red-500/20 text-red-500'}`}
              >
                {status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb Subheader */}
      <div className="bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-12 flex items-center">
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Dashboard</span>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="w-4 h-4" />
                  <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 dark:text-white' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main content container that accounts for fixed headers
export const DetailViewContainer = ({ children }) => (
<div className={`pt-36 pb-8 bg-white dark:bg-gray-900 min-h-screen`}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {children}
  </div>
</div>
);

// Card component used in detailed views
export const DetailCard = ({ title, children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 ${className}`}>
    {title && <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h2>}
    {children}
  </div>
);

// Grid for metrics display
export const MetricsGrid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {children}
  </div>
);

// Individual metric display
export const MetricDisplay = ({ 
  icon: Icon,
  label, 
  value, 
  subValue,
  trend,
  status,
  showBar,
  barValue 
}) => (
  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-xl font-medium mt-1 text-gray-900 dark:text-white">
            {value}
            {trend && (
              <span className={`ml-2 ${trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                {trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
          {subValue && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subValue}</div>}
        </div>
      </div>
      {status && (
        <span className={`w-2 h-2 rounded-full 
          ${status === 'Normal' ? 'bg-green-500' :
          status === 'Warnung' ? 'bg-amber-500' :
          'bg-red-500'}`} 
        />
      )}
    </div>
    {showBar && barValue && (
      <div className="mt-2">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              barValue < 20 ? 'bg-red-500' :
              barValue < 50 ? 'bg-amber-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(Math.max(barValue, 0), 100)}%` }}
          />
        </div>
      </div>
    )}
  </div>
);

// Warning/Alert box
export const AlertBox = ({ type = 'warning', title, messages = [] }) => {
  const styles = {
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200'
    }
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} ${style.border} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <svg 
          className={`w-5 h-5 ${style.text} mt-0.5`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <h3 className={`text-sm font-medium ${style.text}`}>{title}</h3>
          {messages.length > 0 && (
            <ul className={`mt-2 space-y-1 text-sm ${style.text}/90`}>
              {messages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Grid for entity cards
export const EntityGrid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {children}
  </div>
);
