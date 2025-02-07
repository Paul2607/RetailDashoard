// AppStyles.js
const styles = {
  // Container Styles
  appContainer: {
    textAlign: "center",
    minHeight: "100vh",
    width: "100%",
    paddingTop: "40px",
    paddingLeft: "10px",
    margin: "0",
    position: "relative",
    overflowY: 'auto',
    height: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },

  // Header Styles
  header: {
    padding: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    position: "fixed",
    top: "0px",
    left: "0px",
    right: "0px",
    zIndex: 100,
    backgroundColor: 'var(--bg-secondary)',
    height: '55px',
  },

  subtitle: {
    color: "#F97316", // Keeping this orange as brand color
    fontSize: "1.2rem",
    fontWeight: "600",
    letterSpacing: "0.1rem",
  },

  // Section Styles
  sectionContainer: {
    width: "100%",
    marginBottom: "20px",
    padding: "0 20px",
  },

  mainContent: {
    paddingTop: "50px",
  },

  sectionTitle: {
    textAlign: "left",
    marginBottom: "15px",
    fontSize: "1.25rem",
    fontWeight: "600",
    color: 'var(--text-primary)',
  },

  // Card & Dashboard Styles
  dashboard: {
    display: "flex",
    gap: "20px",
    overflowY: "auto",
    paddingBottom: "10px",
    marginBottom: "10px",
    WebkitOverflowScrolling: "touch",
  },

  card: {
    borderRadius: "12px",
    backgroundColor: 'var(--bg-secondary)',
    padding: "20px",
    minWidth: "150px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
    flex: "0 0 auto",
    border: "1px solid var(--border-color)",
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: "0 6px 8px rgba(0,0,0,0.3)",
    },
  },

  // Sensor Card Styles
  sensorCard: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    padding: '15px',
    margin: '10px',
    width: '100%',
    maxWidth: '350px',
    minWidth: '280px',
    color: 'var(--text-primary)',
  },

  sensorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 0',
  },

  sensorTitle: {
    fontSize: '1rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },

  // Value Display Styles
  valueDisplay: {
    backgroundColor: 'var(--bg-primary)',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
  },

  valueLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },

  primaryValue: {
    fontSize: '1.5rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },

  secondaryValue: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },

  // Progress Bar Styles
  progressBarContainer: {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '4px',
    height: '8px',
    overflow: 'hidden',
  },

  // Chart Styles
  chartContainer: {
    backgroundColor: 'var(--bg-primary)',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
  },

  // Status Colors - keeping these consistent across themes
  statusColors: {
    normal: {
      background: 'rgba(16, 185, 129, 0.2)',
      text: '#10B981'
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.2)',
      text: '#F59E0B'
    },
    critical: {
      background: 'rgba(239, 68, 68, 0.2)',
      text: '#EF4444'
    }
  },

  // Button Styles
  backButton: {
    color: 'var(--text-primary)',
    position: "fixed",
    top: "85px",
    left: "10px",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    display: "flex",
    zIndex: 1000,
    backgroundColor: 'transparent',
    padding: '10px',
    '&:hover': {
      color: 'var(--text-secondary)',
    },
  },

  addButton: {
    color: 'var(--text-primary)',
    position: "fixed",
    top: "-8px",
    right: "15px",
    border: "none",
    fontSize: "34px",
    cursor: "pointer",
    display: "flex",
    zIndex: 1000,
    backgroundColor: 'transparent',
    padding: '10px',
  },

  hamburgerMenu: {
    color: 'var(--text-primary)',
    position: 'fixed',
    top: '5px',
    left: '15px',
    zIndex: 1000,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '10px',
  },

  // Dropdown Styles
  dropdown: {
    position: "fixed",
    top: "80px",
    right: "10px",
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
    padding: "10px 0",
    zIndex: 10000,
    width: "200px",
    border: "1px solid var(--border-color)",
  },

  dropdownItem: {
    padding: "10px 15px",
    textAlign: "left",
    fontSize: "1rem",
    color: 'var(--text-primary)',
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    cursor: "pointer",
    width: "100%",
    '&:hover': {
      backgroundColor: 'var(--bg-primary)',
    },
  },

  // Parameter Configuration Styles
  parameterGroup: {
    marginBottom: "15px",
    backgroundColor: 'var(--bg-secondary)',
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
  },

  parameterInput: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid var(--border-color)",
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: "0.9rem",
  },

  // Fixed Button Container
  fixedButtonContainer: {
    position: "fixed",
    bottom: "0",
    left: "0",
    right: "0",
    padding: "15px",
    backgroundColor: 'var(--bg-secondary)',
    boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    borderTop: "1px solid var(--border-color)",
  },

  saveButton: {
    backgroundColor: "#059669",
    color: "#F9FAFB",
    padding: "12px 24px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    transition: "background-color 0.3s ease",
    '&:hover': {
      backgroundColor: "#047857",
    },
  },

  // Status Badge
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },

  // Animations
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },

  '@keyframes slideIn': {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 }
  },

  animatedCard: {
    animation: 'fadeIn 0.3s ease-in-out, slideIn 0.3s ease-out'
  },

  contentContainer: {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  
  // Für die Insights und Settings Views
  contentContainerAlt: {
    marginTop: "50px",
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
};


export default styles;