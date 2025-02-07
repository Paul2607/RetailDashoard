import React, { useState } from 'react';
import { RoomView, AssetView, CategoryView, SensorView } from './DetailedViews';
import { UseCaseCard, RoomCard, CategoryCard } from './DashboardCards';
import { useFavorites } from '../utils/FavoritesContext';

const ViewSelector = ({ 
  useCases,
  rooms,
  assets,
  categories,
  sensors,
  isDragModeActive,
  handleDragStart,
  handleDragOver,
  handleDrop,
  openDetailView,
  calculateOverallStatus
}) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUseCase, setSelectedUseCase] = useState(null);
  const [previousView, setPreviousView] = useState(null);
  
  const { favorites } = useFavorites();

  // Event Handler
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setSelectedAsset(null);
    setSelectedCategory(null);
    setSelectedUseCase(null);
  };

  const handleAssetClick = (asset, source) => {
    setPreviousView(source);
    setSelectedAsset(asset);
    setSelectedUseCase(null);
    if (source === 'room') {
      setSelectedCategory(null);
    } else if (source === 'category') {
      setSelectedRoom(null);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedRoom(null);
    setSelectedAsset(null);
    setSelectedUseCase(null);
  };

  const handleUseCaseClick = (useCase) => {
    if (!isDragModeActive) {
      setSelectedUseCase(useCase);
      setSelectedRoom(null);
      setSelectedAsset(null);
      setSelectedCategory(null);
    }
  };

  const handleDetailClose = () => {
    setSelectedRoom(null);
    setSelectedAsset(null);
    setSelectedCategory(null);
    setSelectedUseCase(null);
    setPreviousView(null);
  };

  // Detail Views Rendering
  if (selectedUseCase) {
    return (
      <SensorView
        useCase={selectedUseCase}
        sensorData={sensors.filter(sensor => sensor.matchedUseCase === selectedUseCase.id)}
        rooms={rooms}
        assets={assets}
        categories={categories}
        onClose={handleDetailClose}
        isDragModeActive={isDragModeActive}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
      />
    );
  }

  if (selectedAsset) {
    const assetRoom = rooms.find(room => room.id === selectedAsset.roomId);
    return (
      <AssetView
        asset={selectedAsset}
        room={assetRoom}
        sensors={sensors}
        onClose={() => {
          setSelectedAsset(null);
          if (previousView === 'category' && selectedAsset.categoryId) {
            const category = categories.find(c => c.id === selectedAsset.categoryId);
            setSelectedCategory(category);
          } else if (previousView === 'room' && selectedAsset.roomId) {
            const room = rooms.find(r => r.id === selectedAsset.roomId);
            setSelectedRoom(room);
          }
          setPreviousView(null);
        }}
      />
    );
  }

  if (selectedCategory) {
    return (
      <CategoryView
        category={selectedCategory}
        assets={assets}
        rooms={rooms}
        sensors={sensors}
        onClose={handleDetailClose}
        onAssetClick={(asset) => handleAssetClick(asset, 'category')}
      />
    );
  }

  if (selectedRoom) {
    return (
      <RoomView
        room={selectedRoom}
        categories={categories}
        assets={assets}
        sensors={sensors}
        onClose={handleDetailClose}
        onAssetClick={(asset) => handleAssetClick(asset, 'room')}
      />
    );
  }

  // Filtern der Use Cases mit zugewiesenen Sensoren
  const useCasesWithSensors = useCases.filter(useCase => 
    sensors.some(sensor => sensor.matchedUseCase === useCase.id)
  );

  // Filtern der Räume mit zugewiesenen Sensoren
  const roomsWithSensors = rooms.filter(room => 
    sensors.some(sensor => sensor.roomId === room.id)
  );

  // Filtern der Kategorien mit zugewiesenen Sensoren
  const categoriesWithSensors = categories.filter(category => 
    assets.some(asset => 
      asset.categoryId === category.id && 
      sensors.some(sensor => sensor.assetId === asset.id)
    )
  );

  // Filtern der Favoriten
  const favoriteEntities = {
    useCases: useCasesWithSensors.filter(useCase => 
      favorites.some(fav => 
        fav.entityType === 'useCase' && 
        fav.entityId === useCase.id.toString()
      )
    ),
    rooms: roomsWithSensors.filter(room => 
      favorites.some(fav => 
        fav.entityType === 'room' && 
        fav.entityId === room.id.toString()
      )
    ),
    categories: categoriesWithSensors.filter(category => 
      favorites.some(fav => 
        fav.entityType === 'category' && 
        fav.entityId === category.id.toString()
      )
    )
  };

  // Dashboard Content
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 text-dark:text-white overflow-x-hidden text-left">
      <div className="max-w-full px-4 py-8">
        {/* Favoriten Section */}
        {Object.values(favoriteEntities).some(arr => arr.length > 0) && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Favoriten</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4 min-w-max">
                {favoriteEntities.useCases.map((useCase, index) => (
                  <div className="w-80 flex-none" key={useCase.id}>
                    <UseCaseCard 
                      useCase={useCase}
                      sensors={sensors}
                      isDragModeActive={isDragModeActive}
                      index={index}
                      handleDragStart={handleDragStart}
                      handleDragOver={handleDragOver}
                      handleDrop={handleDrop}
                      openDetailView={() => handleUseCaseClick(useCase)}
                      calculateOverallStatus={calculateOverallStatus}
                    />
                  </div>
                ))}
                
                {favoriteEntities.rooms.map(room => (
                  <div className="w-80 flex-none" key={room.id}>
                    <RoomCard
                      room={room}
                      sensors={sensors}
                      assets={assets}
                      handleClick={handleRoomClick}
                    />
                  </div>
                ))}

                {favoriteEntities.categories.map(category => (
                  <div className="w-80 flex-none" key={category.id}>
                    <CategoryCard
                      category={category}
                      assets={assets}
                      sensors={sensors}
                      handleClick={handleCategoryClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Rooms Section */}
        {roomsWithSensors.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Orte</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4 min-w-max">
                {roomsWithSensors.map(room => (
                  <div className="w-80 flex-none" key={room.id}>
                    <RoomCard
                      room={room}
                      sensors={sensors}
                      assets={assets}
                      handleClick={handleRoomClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        {categoriesWithSensors.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Geräte/Objekte</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4 min-w-max">
                {categoriesWithSensors.map(category => (
                  <div className="w-80 flex-none" key={category.id}>
                    <CategoryCard
                      category={category}
                      assets={assets}
                      sensors={sensors}
                      handleClick={handleCategoryClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

                {/* Use Cases Section */}
                {useCasesWithSensors.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Alle Sensoren (nach Messtyp)</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4 min-w-max">
                {useCasesWithSensors.map((useCase, index) => (
                  <div className="w-80 flex-none" key={useCase.id}>
                    <UseCaseCard 
                      useCase={useCase}
                      sensors={sensors}
                      isDragModeActive={isDragModeActive}
                      index={index}
                      handleDragStart={handleDragStart}
                      handleDragOver={handleDragOver}
                      handleDrop={handleDrop}
                      openDetailView={() => handleUseCaseClick(useCase)}
                      calculateOverallStatus={calculateOverallStatus}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        
      </div>
    </div>
  );
};

export default ViewSelector;