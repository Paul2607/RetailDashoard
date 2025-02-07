// Components/AssetManagement.js
import React from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import styles from '../styles/AppStyles';
import { dataSync } from '../utils/server-api';

export const AssetEditModal = ({ assets, selectedRoom, selectedCategory, onClose, onDelete, onEdit }) => {
  const handleDeleteAll = async () => {
    if (window.confirm('Möchten Sie wirklich alle Objekte löschen?')) {
      try {
        await onDelete(null, false, true);
      } catch (error) {
        console.error('Fehler beim Löschen aller Objekte:', error);
      }
    }
  };

  const filteredAssets = assets.filter(asset => 
    (!selectedRoom || asset.roomId === selectedRoom) &&
    (!selectedCategory || asset.categoryId === selectedCategory)
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1F2937',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        color: '#F9FAFB'
      }}>
        <h3 style={{ marginBottom: '15px', fontSize: '1.25rem' }}>Objekte bearbeiten</h3>
        
        {filteredAssets.length > 0 && (
          <button
            onClick={handleDeleteAll}
            style={{
              marginBottom: '15px',
              padding: '8px 16px',
              backgroundColor: '#EF4444',
              color: '#F9FAFB',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Alle Objekte löschen
          </button>
        )}

        <div>
          {filteredAssets.map(asset => (
            <div 
              key={asset.id} 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #374151'
              }}
            >
              <span>{asset.name}</span>
              <div>
                <button
                  onClick={() => onEdit(asset)}
                  style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6' }}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(asset.id, true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            backgroundColor: '#374151',
            color: '#F9FAFB',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Schließen
        </button>
      </div>
    </div>
  );
};

export const AssetManagement = ({
  assets,
  selectedRoom,
  selectedCategory,
  selectedAsset,
  setSelectedAsset,
  onAddAsset,
  showNewAssetForm,
  setShowNewAssetForm,
  setShowAssetEditModal,
  newAsset,
  setNewAsset
}) => {
  const filteredAssets = assets.filter(asset => 
    (!selectedRoom || asset.roomId === selectedRoom) &&
    (!selectedCategory || asset.categoryId === selectedCategory)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newAsset.name && newAsset.name.trim() !== '') {
      try {
        const assetToAdd = {
          ...newAsset,
          roomId: selectedRoom || '',
          categoryId: selectedCategory || ''
        };
        await onAddAsset(assetToAdd);
        setNewAsset({ name: '' });
        setShowNewAssetForm(false);
      } catch (error) {
        console.error('Error submitting asset:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="font-medium text-black dark:text-white">Objekt:</label>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewAssetForm(!showNewAssetForm)}
            className="flex items-center gap-1 text-green-500 hover:text-green-400"
          >
            <FaPlus /> Neu
          </button>
          <button
            onClick={() => setShowAssetEditModal(true)}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-400"
          >
            <FaEdit /> Bearbeiten
          </button>
        </div>
      </div>

      {showNewAssetForm ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Objektname"
              value={newAsset.name}
              onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 mb-3"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Hinzufügen
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewAssetForm(false);
                  setNewAsset({ name: '' });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      ) : (
        <select
          value={selectedAsset}
          onChange={e => setSelectedAsset(e.target.value)}
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Kein Objekt zugeordnet</option>
          {filteredAssets.map(asset => (
            <option key={asset.id} value={asset.id}>
              {asset.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};


export default AssetManagement;