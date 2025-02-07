import React from 'react';
import { FaStar } from 'react-icons/fa';

const FavoriteButton = ({ isFavorite, onToggle }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  return (
    <button 
      onClick={handleClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <FaStar
        style={{
          color: isFavorite ? '#FFD700' : '#D3D3D3',
          fontSize: '1.2rem',
          transition: 'color 0.2s ease'
        }}
      />
    </button>
  );
};

export default FavoriteButton;