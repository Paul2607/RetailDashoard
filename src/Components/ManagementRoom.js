// Components/RoomManagement.js
import React from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import styles from '../styles/AppStyles';

export const RoomEditModal = ({ rooms, onClose, onDelete, onEdit }) => {
  const handleDeleteAll = async () => {
    if (window.confirm('Möchten Sie wirklich alle Räume löschen?')) {
      try {
        await onDelete(null, false, true);
      } catch (error) {
        console.error('Fehler beim Löschen aller Räume:', error);
      }
    }
  };

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
        <h3 style={{ marginBottom: '15px', fontSize: '1.25rem' }}>Räume bearbeiten</h3>
        
        {rooms.length > 0 && (
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
            Alle Räume löschen
          </button>
        )}

        <div>
          {rooms.map(room => (
            <div 
              key={room.id} 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #374151'
              }}
            >
              <span>{room.name}</span>
              <div>
                <button
                  onClick={() => onEdit(room)}
                  style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6' }}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(room.id, true)}
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

// ManagementRoom.js
export const RoomManagement = ({
  rooms,
  selectedRoom,
  setSelectedRoom,
  onAddRoom,
  showNewRoomForm,
  setShowNewRoomForm,
  setShowRoomEditModal,
  newRoom,
  setNewRoom
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newRoom.name && newRoom.name.trim() !== '') {
      try {
        await onAddRoom(newRoom);
        setNewRoom({ name: '' });
        setShowNewRoomForm(false);
      } catch (error) {
        console.error('Error submitting room:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="font-medium text-black dark:text-white">Raum:</label>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewRoomForm(!showNewRoomForm)}
            className="flex items-center gap-1 text-green-500 hover:text-green-400"
          >
            <FaPlus /> Neu
          </button>
          <button
            onClick={() => setShowRoomEditModal(true)}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-400"
          >
            <FaEdit /> Bearbeiten
          </button>
        </div>
      </div>

      {showNewRoomForm ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700  rounded-lg p-4">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Raumname"
              value={newRoom.name}
              onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
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
                  setShowNewRoomForm(false);
                  setNewRoom({ name: '' });
                }}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      ) : (
        <select
          value={selectedRoom}
          onChange={e => setSelectedRoom(e.target.value)}
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-7000 rounded-lg px-3 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Kein Raum zugeordnet</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default RoomManagement;