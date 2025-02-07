import React from 'react';
import { FaBars, FaTimes, FaChartLine, FaCog, FaDesktop } from 'react-icons/fa';
import styles from '../styles/AppStyles';
import ThemeSwitch from '../Components/ThemeSwitch';

const Navigation = ({ isOpen, toggleMenu, currentView, setCurrentView }) => {
  return (
    <>
      <div className="flex items-center gap-2 absolute top-3 right-15">
        <ThemeSwitch />
      </div>
      <button 
        onClick={toggleMenu}
        style={styles.hamburgerMenu}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <div style={{
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : '-300px',
        width: '300px',
        height: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        transition: 'left 0.3s ease',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          marginTop: '60px'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Mioty-Dashboard</h2>
        </div>

        <nav style={{ padding: '20px 0' }}>
          <MenuItem 
            icon={<FaDesktop />}
            text="Monitoring"
            isActive={currentView === 'monitoring'}
            onClick={() => {
              setCurrentView('monitoring');
              toggleMenu();
            }}
          />
          <MenuItem 
            icon={<FaChartLine />}
            text="Insights & Analyse"
            isActive={currentView === 'insights'}
            onClick={() => {
              setCurrentView('insights');
              toggleMenu();
            }}
          />
          <MenuItem 
            icon={<FaCog />}
            text="Verwaltung"
            isActive={currentView === 'settings'}
            onClick={() => {
              setCurrentView('settings');
              toggleMenu();
            }}
          />
        </nav>
      </div>

      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 998
          }}
          onClick={toggleMenu}
        />
      )}
    </>
  );
};

const MenuItem = ({ icon, text, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: '15px 20px',
      border: 'none',
      backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      textAlign: 'left',
      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
    }}
  >
    <span style={{ marginRight: '10px', opacity: isActive ? 1 : 0.7 }}>
      {icon}
    </span>
    <span style={{ 
      fontSize: '1rem', 
      fontWeight: isActive ? '500' : 'normal'
    }}>
      {text}
    </span>
  </button>
);

export default Navigation;