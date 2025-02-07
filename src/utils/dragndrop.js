import { useState } from "react";

export const useDragAndDrop = (initialItems) => {
  const [items, setItems] = useState(initialItems);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [isDragModeActive, setIsDragModeActive] = useState(false); // Zustand für Drag-and-Drop-Modus

  const handleDragStart = (index) => {
    if (!isDragModeActive) return;  // Verhindern, dass Drag-and-Drop startet, wenn der Modus nicht aktiv ist
    setDraggedItemIndex(index);
  };

  const handleDragOver = (event) => {
    if (!isDragModeActive) return;  // Verhindern, dass Drag-over passiert, wenn der Modus nicht aktiv ist
    event.preventDefault();
  };

  const handleDrop = (index) => {
    if (!isDragModeActive) return;  // Verhindern, dass Drop passiert, wenn der Modus nicht aktiv ist
    const draggedItem = items[draggedItemIndex];
    const remainingItems = items.filter((_, i) => i !== draggedItemIndex);

    const updatedItems = [
      ...remainingItems.slice(0, index),
      draggedItem,
      ...remainingItems.slice(index),
    ];

    setItems(updatedItems);
    setDraggedItemIndex(null);
  };

  const toggleDragMode = () => {
    setIsDragModeActive(!isDragModeActive); // Umschalten des Drag-and-Drop-Modus
  };

  return {
    items,
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragModeActive,
    toggleDragMode, // Gib die Funktion zurück, um den Modus zu toggeln
  };
};
