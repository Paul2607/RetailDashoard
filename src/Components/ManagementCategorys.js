// Components/CategoryManagement.js
import React from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import styles from '../styles/AppStyles';
import { dataSync } from '../utils/server-api';

export const CategoryEditModal = ({ categories, onClose, onDelete, onEdit }) => {
  const handleDeleteAll = async () => {
    if (window.confirm('Möchten Sie wirklich alle Kategorien löschen?')) {
      try {
        await onDelete(null, false, true);
      } catch (error) {
        console.error('Fehler beim Löschen aller Kategorien:', error);
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
        <h3 style={{ marginBottom: '15px', fontSize: '1.25rem' }}>Kategorien bearbeiten</h3>
        
        {categories.length > 0 && (
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
            Alle Kategorien löschen
          </button>
        )}

        <div>
          {categories.map(category => (
            <div 
              key={category.id} 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #374151'
              }}
            >
              <span>{category.name}</span>
              <div>
                <button
                  onClick={() => onEdit(category)}
                  style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6' }}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(category.id, true)}
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

// ManagementCategorys.js
export const CategoryManagement = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  onAddCategory,
  showNewCategoryForm,
  setShowNewCategoryForm,
  setShowCategoryEditModal,
  newCategory,
  setNewCategory
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newCategory.name && newCategory.name.trim() !== '') {
      try {
        await onAddCategory(newCategory);
        setNewCategory({ name: '' });
        setShowNewCategoryForm(false);
      } catch (error) {
        console.error('Error submitting category:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="font-medium text-black dark:text-white">Objektkategorie:</label>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
            className="flex items-center gap-1 text-green-500 hover:text-green-400"
          >
            <FaPlus /> Neu
          </button>
          <button
            onClick={() => setShowCategoryEditModal(true)}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-400"
          >
            <FaEdit /> Bearbeiten
          </button>
        </div>
      </div>

      {showNewCategoryForm ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Kategoriename"
              value={newCategory.name}
              onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
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
                  setShowNewCategoryForm(false);
                  setNewCategory({ name: '' });
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
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Keine Kategorie zugeordnet</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CategoryManagement;