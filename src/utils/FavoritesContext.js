// utils/FavoritesContext.js
import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { dbOperations } from './db';
import { dataSync } from './server-api';

export const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialer Load der Favoriten
  useEffect(() => {
    let isSubscribed = true;
    const loadFavorites = async () => {
      try {
        const currentData = await dataSync.fetchAllData();
        if (isSubscribed) {
          setFavorites(currentData?.favorites || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };
    loadFavorites();
    
    return () => {
      isSubscribed = false;
    };
  }, []);

const addFavorite = useCallback(async (entityType, entityId) => {
  try {
    const currentData = await dataSync.fetchAllData();
    const newFavorite = {
      id: `fav_${Date.now()}`,
      entityType,
      entityId: entityId.toString(),
      timestamp: new Date().toISOString()
    };

    // Update server data
    const updatedFavorites = currentData.favorites ? [...currentData.favorites, newFavorite] : [newFavorite];
    await dataSync.updateData({
      ...currentData,
      favorites: updatedFavorites
    });

    // Update local state
    setFavorites(updatedFavorites);

    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}, []);

  const removeFavorite = useCallback(async (entityType, entityId) => {
    try {
      const currentData = await dataSync.fetchAllData();
      const updatedFavorites = (currentData.favorites || [])
        .filter(f => !(f.entityType === entityType && f.entityId === entityId.toString()));
  
      // Update server data
      await dataSync.updateData({
        ...currentData,
        favorites: updatedFavorites
      });
  
      // Update local state
      setFavorites(updatedFavorites);
      return false;
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }, []);

  const isFavorite = useCallback((entityType, entityId) => {
    return favorites.some(f => 
      f.entityType === entityType && 
      f.entityId === entityId.toString()
    );
  }, [favorites]);
  
  const toggleFavorite = useCallback(async (entityType, entityId) => {
    try {
      const isFav = isFavorite(entityType, entityId);
      if (isFav) {
        return await removeFavorite(entityType, entityId);
      } else {
        return await addFavorite(entityType, entityId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }, [isFavorite, removeFavorite, addFavorite]);

  const value = {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};