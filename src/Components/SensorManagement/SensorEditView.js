// Components/SensorManagement/SensorEditView.js
import React, { useState } from 'react';
import SensorListView from './SensorListView';
import SensorConfigView from './SensorConfigView';
import { DetailViewContainer } from '../shared/DetailedViewComponents';
import { dataSync } from '../../utils/server-api';

const SensorEditView = ({ 
  sensors, 
  rooms, 
  assets,
  categories, 
  useCases, 
  setIsEditingSensors, 
  updateSensorUseCase, 
  updateSensorParameters,
  onSensorUpdate
}) => {
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [localRooms, setLocalRooms] = useState(rooms);
  const [localCategories, setLocalCategories] = useState(categories);
  const [localAssets, setLocalAssets] = useState(assets);


  const handleSensorSelect = (sensor) => {
    setSelectedSensor(sensor);
  };

  const handleSensorSave = async (updatedSensor) => {
    await updateSensorParameters(updatedSensor);
    setSelectedSensor(null);
  };

  const handleClose = () => {
    setIsEditingSensors(false);
  };

  // CRUD Operations für Rooms
  const handleAddRoom = async (room) => {
    try {
      const currentData = await dataSync.fetchAllData();
      // Ensure we have a name before creating the room
      if (!room.name || room.name.trim() === '') {
        throw new Error('Room name cannot be empty');
      }
      
      const newRoom = {
        id: Date.now().toString(),
        name: room.name.trim()
      };
      
      const updatedRooms = currentData.rooms ? [...currentData.rooms, newRoom] : [newRoom];
      
      const updatePayload = {
        sensors: currentData.sensors || [],
        rooms: updatedRooms,
        assets: currentData.assets || [],
        categories: currentData.categories || [],
        favorites: currentData.favorites || []
      };
  
      await dataSync.updateData(updatePayload);
      onSensorUpdate(updatePayload.sensors);
      setLocalRooms(updatedRooms); // Aktualisiere lokalen State
      
      return updatedRooms;
    } catch (error) {
      console.error('Error adding room:', error);
      throw error;
    }
  };

  const handleUpdateRoom = async (room) => {
    try {
      const currentData = await dataSync.fetchAllData();
      const updatedRooms = currentData.rooms.map(r => 
        r.id === room.id ? room : r
      );
      
      await dataSync.updateData({
        ...currentData,
        rooms: updatedRooms
      });
      setLocalRooms(updatedRooms); // Aktualisiere lokalen State
      return updatedRooms;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  };

  const handleDeleteRoom = async (roomId, showConfirm = true) => {
    if (showConfirm && !window.confirm('Möchten Sie diesen Raum wirklich löschen?')) {
      return;
    }

    try {
      const currentData = await dataSync.fetchAllData();
      const updatedRooms = currentData.rooms.filter(r => r.id !== roomId);
      
      await dataSync.updateData({
        ...currentData,
        rooms: updatedRooms
      });
      setLocalRooms(updatedRooms); // Aktualisiere lokalen State
      return updatedRooms;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  };

  // CRUD Operations für Categories
  const handleAddCategory = async (category) => {
    try {
      const currentData = await dataSync.fetchAllData();
      
      // Ensure we have a name before creating the category
      if (!category.name || category.name.trim() === '') {
        throw new Error('Category name cannot be empty');
      }
      
      const newCategory = {
        id: Date.now().toString(),
        name: category.name.trim()
      };
      
      const updatedCategories = currentData.categories ? 
        [...currentData.categories, newCategory] : [newCategory];
      
      const updatePayload = {
        sensors: currentData.sensors || [],
        rooms: currentData.rooms || [],
        assets: currentData.assets || [],
        categories: updatedCategories,
        favorites: currentData.favorites || []
      };
  
      await dataSync.updateData(updatePayload);
      setLocalCategories(updatedCategories); // Aktualisiere lokalen State
      return updatedCategories;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const handleUpdateCategory = async (category) => {
    try {
      const currentData = await dataSync.fetchAllData();
      const updatedCategories = currentData.categories.map(c => 
        c.id === category.id ? category : c
      );
      
      await dataSync.updateData({
        ...currentData,
        categories: updatedCategories
      });
      setLocalCategories(updatedCategories); // Aktualisiere lokalen State
        return updatedCategories;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const handleDeleteCategory = async (categoryId, showConfirm = true) => {
    if (showConfirm && !window.confirm('Möchten Sie diese Kategorie wirklich löschen?')) {
      return;
    }

    try {
      const currentData = await dataSync.fetchAllData();
      const updatedCategories = currentData.categories.filter(c => c.id !== categoryId);
      
      await dataSync.updateData({
        ...currentData,
        categories: updatedCategories
      });
      setLocalCategories(updatedCategories); // Aktualisiere lokalen State
      return updatedCategories;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // CRUD Operations für Assets
  const handleAddAsset = async (asset) => {
    try {
      const currentData = await dataSync.fetchAllData();
      
      // Ensure we have a name before creating the asset
      if (!asset.name || asset.name.trim() === '') {
        throw new Error('Asset name cannot be empty');
      }
      
      const newAsset = {
        id: Date.now().toString(), // Simplified ID generation
        name: asset.name.trim(),
        categoryId: asset.categoryId || '',
        roomId: asset.roomId || ''
      };
      
      const updatedAssets = currentData.assets ? [...currentData.assets, newAsset] : [newAsset];
      
      const updatePayload = {
        sensors: currentData.sensors || [],
        rooms: currentData.rooms || [],
        assets: updatedAssets,
        categories: currentData.categories || [],
        favorites: currentData.favorites || []
      };
  
      await dataSync.updateData(updatePayload);
      setLocalAssets(updatedAssets); // Aktualisiere lokalen State
      return updatedAssets;
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  };

  
  const handleUpdateAsset = async (asset) => {
    try {
      const currentData = await dataSync.fetchAllData();
      const updatedAssets = currentData.assets.map(a => 
        a.id === asset.id ? asset : a
      );
      
      await dataSync.updateData({
        ...currentData,
        assets: updatedAssets
      });
      setLocalAssets(updatedAssets); // Aktualisiere lokalen State
      return updatedAssets;
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  };

  const handleDeleteAsset = async (assetId, showConfirm = true) => {
    if (showConfirm && !window.confirm('Möchten Sie dieses Objekt wirklich löschen?')) {
      return;
    }

    try {
      const currentData = await dataSync.fetchAllData();
      const updatedAssets = currentData.assets.filter(a => a.id !== assetId);
      
      await dataSync.updateData({
        ...currentData,
        assets: updatedAssets
      });
      setLocalAssets(updatedAssets); // Aktualisiere lokalen State
      return updatedAssets;
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  };

  return (
    <DetailViewContainer>
      {selectedSensor ? (
        <SensorConfigView
          sensor={selectedSensor}
          rooms={localRooms}
          assets={localAssets}
          categories={localCategories}
          useCases={useCases}
          onSave={handleSensorSave}
          onClose={() => setSelectedSensor(null)}
          // CRUD Operations als Props übergeben
          onAddRoom={handleAddRoom}
          onUpdateRoom={handleUpdateRoom}
          onDeleteRoom={handleDeleteRoom}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddAsset={handleAddAsset}
          onUpdateAsset={handleUpdateAsset}
          onDeleteAsset={handleDeleteAsset}
        />
      ) : (
        <SensorListView
          sensors={sensors}
          rooms={rooms}
          assets={assets}
          categories={categories}
          onSelectSensor={handleSensorSelect}
          onClose={handleClose}
          updateSensorUseCase={updateSensorUseCase}
          onSensorUpdate={onSensorUpdate}  // Neue Prop
        />
      )}
    </DetailViewContainer>
  );
};

export default SensorEditView;