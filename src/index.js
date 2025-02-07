// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './App.css';
import { NotificationProvider } from './utils/NotificationContext';
import { FavoritesProvider } from './utils/FavoritesContext';
import { ThemeProvider } from './utils/ThemeContext';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);