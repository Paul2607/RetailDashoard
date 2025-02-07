import React, { useState, useEffect } from 'react';
import { DetailViewHeader } from '../shared/DetailedViewComponents';
import ManagementRoom, { RoomEditModal } from '../ManagementRoom';
import ManagementCategorys, { CategoryEditModal } from '../ManagementCategorys';
import ManagementAssets, { AssetEditModal } from '../ManagementAssets';
import { SENSOR_TEMPLATES, USE_CASE_MAPPING } from '../../Constants/sensorTemplates';
import { Battery, Thermometer, Ruler, Lock, Check, AlertTriangle } from 'lucide-react';

// Custom styled section component
const Section = ({ title, children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
    <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <h2 className="text-lg font-medium">{title}</h2>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const ParameterValidation = ({ currentValue, targetValue, tolerance, unit, label }) => {
  const difference = Math.abs(currentValue - targetValue);
  const isWithinTolerance = difference <= tolerance;
  const isWithinDoubledTolerance = difference <= (tolerance * 2);

  return (
    <div className="mt-2 p-3 rounded-lg bg-white dark:bg-gray-900/50">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            isWithinTolerance ? 'text-green-500' :
            isWithinDoubledTolerance ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {currentValue} {unit}
          </span>
          {isWithinTolerance ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}
        </div>
      </div>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>{(targetValue - tolerance).toFixed(1)}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>{targetValue.toFixed(1)}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>{(targetValue + tolerance).toFixed(1)}</span>
          </div>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className={`h-full rounded-full ${
              isWithinTolerance ? 'bg-green-500' :
              isWithinDoubledTolerance ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{
              width: '100%',
              transform: `scaleX(${Math.min(Math.abs(currentValue - targetValue) / (tolerance * 2), 1)})`,
              transformOrigin: currentValue < targetValue ? 'left' : 'right'
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Slider = ({ value, onChange, min, max, step = 1, label }) => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <label className="text-sm text-gray-500 dark:text-gray-400">{label}</label>
      <span className="text-sm font-medium">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
    />
    <div className="flex justify-between text-xs text-gray-500">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

const ParameterSection = ({ children, title, description, validationContent }) => (
  <div className="space-y-4 mb-6">
    <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
    {children}
    {validationContent}
  </div>
);

const SensorConfigView = ({
  sensor,
  rooms,
  assets,
  categories,
  useCases,
  onSave,
  onClose,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset
}) => {
  // State Management
  const [selectedUseCase, setSelectedUseCase] = useState(() => {
    return sensor.matchedUseCase ? sensor.matchedUseCase.toString() : '';
  });  const [parameters, setParameters] = useState(sensor.parameters || {});
  const [selectedRoom, setSelectedRoom] = useState(sensor.roomId || '');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    // Finde das Asset des Sensors
    const sensorAsset = assets.find(a => a.id === sensor.assetId);
    // Return die categoryId des Assets oder leeren String
    return sensorAsset ? sensorAsset.categoryId : '';
  });
  const [selectedAsset, setSelectedAsset] = useState(sensor.assetId || '');
  
  // Modal States
  const [showRoomEditModal, setShowRoomEditModal] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [showAssetEditModal, setShowAssetEditModal] = useState(false);

  // Form States
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '' });
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newAsset, setNewAsset] = useState({ name: '' });

  // Cache previous parameters to restore them when switching back
  const [cachedParameters, setCachedParameters] = useState({});

  // Refs
  const onAddRoomSuccess = React.useCallback((newRoom) => {
    setSelectedRoom(newRoom.id);
  }, []);
  
  const onAddCategorySuccess = React.useCallback((newCategory) => {
    setSelectedCategory(newCategory.id);
  }, []);
  
  const onAddAssetSuccess = React.useCallback((newAsset) => {
    setSelectedAsset(newAsset.id);
  }, []);

  // Effect to cache parameters when use case changes
  useEffect(() => {
    // Wenn der Sensor bereits einen UseCase hat, initialisiere die Parameter
    if (sensor.matchedUseCase && sensor.parameters) {
      setParameters(sensor.parameters);
    }
  }, [sensor]);

  const handleUseCaseChange = (newUseCase) => {
    setSelectedUseCase(newUseCase);
    
    // Wenn der Sensor bereits Parameter für diesen UseCase hat
    if (sensor.matchedUseCase === Number(newUseCase) && sensor.parameters) {
      setParameters(sensor.parameters);
    } else if (cachedParameters[newUseCase]) {
      setParameters(cachedParameters[newUseCase]);
    } else {
      setParameters(getDefaultParameters(newUseCase, sensor.type));
    }
  };

  const handleParameterChange = (key, value) => {
    if (typeof key === 'string') {
      setParameters(prev => ({ ...prev, [key]: value }));
    } else if (typeof key === 'object') {
      setParameters(prev => ({ ...prev, ...key }));
    }
  };

  const getDefaultParameters = (useCase, sensorType) => {
    // Implement default parameter logic based on use case and sensor type
    // This should be based on your business logic
    switch(sensorType) {
      case 'distance':
        return useCase === 1 ? {
          minDistance: 0,
          maxDistance: 100,
          warningThreshold: 40,
          criticalThreshold: 20
        } : {
          targetDistance: 5,
          tolerance: 2
        };
      case 'climate':
        return {
          targetTemperature: 21,
          tempTolerance: 2,
          targetHumidity: 50,
          humidityTolerance: 10,
          targetCO2: 800,
          co2Tolerance: 200
        };
      case 'energy':
        return {
          targetVoltage: 230,
          voltageTolerance: 10,
          targetCurrent: 10,
          currentTolerance: 1
        };
      default:
        return {};
    }
  };

  const renderParameters = () => {
    if (!selectedUseCase) return null;
  
    const safeNumericValue = (value, fallback = 0) => {
      return typeof value === 'number' ? value : fallback;
    };
  
    switch(sensor.type) {
      case 'distance':
        if (selectedUseCase === "1") {
          // Füllstands-Parameter
          const currentDistance = safeNumericValue(sensor.data.distance);
          const minDistance = Math.min(safeNumericValue(parameters.minDistance, 0), currentDistance);
          const maxDistance = Math.max(safeNumericValue(parameters.maxDistance, 100), currentDistance);
          
          const fillLevel = maxDistance !== minDistance
            ? ((maxDistance - currentDistance) / (maxDistance - minDistance)) * 100
            : 0;
  
          return (
            <ParameterSection 
              title="Füllstand-Parameter" 
              description="Konfigurieren Sie die Abstände für die Füllstandsmessung."
              validationContent={
                <div className="mt-4 space-y-4">
                {/* Neuer Block für aktuellen Abstand */}
                <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Aktueller Abstand</span>
                    <span className="font-medium">{currentDistance.toFixed(1)} cm</span>
                  </div>
                </div>                  <div className="mt-4 bg-white dark:bg-gray-900/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Aktueller Füllstand</span>
                      <span className="font-medium">{fillLevel.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          fillLevel < parameters.criticalThreshold ? 'bg-red-500' :
                          fillLevel < parameters.warningThreshold ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(Math.max(fillLevel, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              }
            >
              <div className="space-y-4">
                <Slider 
                  value={minDistance}
                  onChange={(value) => handleParameterChange("minDistance", value)}
                  min={0}
                  max={maxDistance - 1}
                  step={1}
                  label="Minimaler Abstand (100% voll)"
                />
                <Slider 
                  value={maxDistance}
                  onChange={(value) => handleParameterChange("maxDistance", value)}
                  min={minDistance + 1}
                  max={Math.max(200, currentDistance)}
                  step={1}
                  label="Maximaler Abstand (0% leer)"
                />
                <Slider 
                  value={parameters.warningThreshold || 40}
                  onChange={(value) => handleParameterChange("warningThreshold", value)}
                  min={parameters.criticalThreshold || 20}
                  max={100}
                  step={1}
                  label="Warnschwelle (%)"
                />
                <Slider 
                  value={parameters.criticalThreshold || 20}
                  onChange={(value) => handleParameterChange("criticalThreshold", value)}
                  min={0}
                  max={parameters.warningThreshold || 40}
                  step={1}
                  label="Kritische Schwelle (%)"
                />
              </div>
            </ParameterSection>
          );
        } else if (selectedUseCase === "3") {
          // Öffnungs-Parameter
          const currentDistance = safeNumericValue(sensor.data.distance);
          const targetDistance = safeNumericValue(parameters.targetDistance, 5);
          const tolerance = safeNumericValue(parameters.tolerance, 2);

          const isOpen = currentDistance > (targetDistance + tolerance);

          return (
            <ParameterSection 
              title="Öffnungs-Parameter" 
              description="Konfigurieren Sie die Abstände für Öffnungssensoren."
              validationContent={
                <div className="mt-4">
                  <ParameterValidation
                    currentValue={currentDistance}
                    targetValue={targetDistance}
                    tolerance={tolerance}
                    unit="cm"
                    label="Aktueller Abstand"
                  />
                  <div className="mt-4 bg-white dark:bg-gray-900/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isOpen ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                    }`}>
                      {isOpen ? 'Geöffnet' : 'Geschlossen'}
                    </span>
                  </div>
                </div>
              }
            >
              <div className="space-y-4">
                <Slider 
                  value={targetDistance}
                  onChange={(value) => handleParameterChange("targetDistance", value)}
                  min={0}
                  max={200}
                  step={1}
                  label="Zielabstand (geschlossen)"
                />
                <Slider 
                  value={tolerance}
                  onChange={(value) => handleParameterChange("tolerance", value)}
                  min={0.5}
                  max={10}
                  step={0.5}
                  label="Toleranz"
                />
              </div>
            </ParameterSection>
          );
        }
        break;

      case 'energy':
        return (
          <>
            <ParameterSection
              title="Vorlagen"
              description="Wählen Sie eine vordefinierte Vorlage für typische Anwendungsfälle."
            >
              <select
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500"
                onChange={(e) => {
                  if (e.target.value) {
                    const template = SENSOR_TEMPLATES.energy[e.target.value];
                    handleParameterChange(template.parameters);
                  }
                }}
                value=""
              >
                <option value="">Vorlage auswählen...</option>
                {Object.entries(SENSOR_TEMPLATES.energy).map(([key, template]) => (
                  <option key={key} value={key}>{template.name}</option>
                ))}
              </select>
            </ParameterSection>

            <ParameterSection
              title="Energie-Parameter"
              description="Konfigurieren Sie die Parameter für die Energieüberwachung."
              validationContent={
                <div className="space-y-4 mt-4">
                  <ParameterValidation
                    currentValue={safeNumericValue(sensor.data.voltage)}
                    targetValue={safeNumericValue(parameters.targetVoltage, 230)}
                    tolerance={safeNumericValue(parameters.voltageTolerance, 10)}
                    unit="V"
                    label="Aktuelle Spannung"
                  />
                  <ParameterValidation
                    currentValue={safeNumericValue(sensor.data.current)}
                    targetValue={safeNumericValue(parameters.targetCurrent, 10)}
                    tolerance={safeNumericValue(parameters.currentTolerance, 1)}
                    unit="A"
                    label="Aktuelle Stromstärke"
                  />
                </div>
              }
            >
              <div className="space-y-6">
                <Slider 
                  value={parameters.targetVoltage || 230}
                  onChange={(value) => handleParameterChange("targetVoltage", value)}
                  min={110}
                  max={400}
                  step={1}
                  label="Zielspannung"
                />
                <Slider 
                  value={parameters.voltageTolerance || 10}
                  onChange={(value) => handleParameterChange("voltageTolerance", value)}
                  min={1}
                  max={20}
                  step={1}
                  label="Spannungstoleranz"
                />
                <Slider 
                  value={parameters.targetCurrent || 10}
                  onChange={(value) => handleParameterChange("targetCurrent", value)}
                  min={0}
                  max={32}
                  step={0.1}
                  label="Zielstromstärke"
                />
                <Slider 
                  value={parameters.currentTolerance || 1}
                  onChange={(value) => handleParameterChange("currentTolerance", value)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  label="Stromstärketoleranz"
                />
              </div>
            </ParameterSection>
          </>
        );
      
        case 'climate':
          return (
            <>
              <ParameterSection
                title="Vorlagen"
                description="Wählen Sie eine vordefinierte Vorlage für typische Anwendungsfälle."
              >
                <select
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  onChange={(e) => {
                    if (e.target.value) {
                      const template = SENSOR_TEMPLATES.climate[e.target.value];
                      handleParameterChange(template.parameters);
                    }
                  }}
                  value=""
                >
                  <option value="">Vorlage auswählen...</option>
                  {Object.entries(SENSOR_TEMPLATES.climate).map(([key, template]) => (
                    <option key={key} value={key}>{template.name}</option>
                  ))}
                </select>
              </ParameterSection>
    
              <ParameterSection 
                title="Klima-Parameter"
                description="Konfigurieren Sie die Parameter für die Klimaüberwachung."
                validationContent={
                  <div className="space-y-4 mt-4">
                    <ParameterValidation
                      currentValue={safeNumericValue(sensor.data.temperature)}
                      targetValue={safeNumericValue(parameters.targetTemperature, 21)}
                      tolerance={safeNumericValue(parameters.tempTolerance, 2)}
                      unit="°C"
                      label="Aktuelle Temperatur"
                    />
                    <ParameterValidation
                      currentValue={safeNumericValue(sensor.data.humidity)}
                      targetValue={safeNumericValue(parameters.targetHumidity, 50)}
                      tolerance={safeNumericValue(parameters.humidityTolerance, 10)}
                      unit="%"
                      label="Aktuelle Luftfeuchtigkeit"
                    />
                    <ParameterValidation
                      currentValue={safeNumericValue(sensor.data.co2)}
                      targetValue={safeNumericValue(parameters.targetCO2, 800)}
                      tolerance={safeNumericValue(parameters.co2Tolerance, 200)}
                      unit="ppm"
                      label="Aktueller CO₂-Wert"
                    />
                  </div>
                }
              >
                <div className="space-y-6">
                  <Slider 
                    value={parameters.targetTemperature || 21}
                    onChange={(value) => handleParameterChange("targetTemperature", value)}
                    min={-25}
                    max={40}
                    step={0.5}
                    label="Zieltemperatur"
                  />
                  <Slider 
                    value={parameters.tempTolerance || 2}
                    onChange={(value) => handleParameterChange("tempTolerance", value)}
                    min={0.5}
                    max={5}
                    step={0.5}
                    label="Temperaturtoleranz"
                  />
                  <Slider 
                    value={parameters.targetHumidity || 50}
                    onChange={(value) => handleParameterChange("targetHumidity", value)}
                    min={0}
                    max={100}
                    step={1}
                    label="Ziel-Luftfeuchtigkeit"
                  />
                  <Slider 
                    value={parameters.humidityTolerance || 10}
                    onChange={(value) => handleParameterChange("humidityTolerance", value)}
                    min={1}
                    max={20}
                    step={1}
                    label="Luftfeuchtigkeitstoleranz"
                  />
                  <Slider 
                    value={parameters.targetCO2 || 800}
                    onChange={(value) => handleParameterChange("targetCO2", value)}
                    min={400}
                    max={2000}
                    step={50}
                    label="Ziel-CO₂-Wert"
                  />
                  <Slider 
                    value={parameters.co2Tolerance || 200}
                    onChange={(value) => handleParameterChange("co2Tolerance", value)}
                    min={50}
                    max={500}
                    step={50}
                    label="CO₂-Toleranz"
                  />
                </div>
              </ParameterSection>
            </>
          );

    }
    return null;
  };

  const handleSave = () => {
    onSave({
      ...sensor,
      parameters,
      matchedUseCase: selectedUseCase ? Number(selectedUseCase) : null,
      roomId: selectedRoom || null,
      assetId: selectedAsset || null
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-24">
      <DetailViewHeader
        title={`Sensor ${sensor.id} konfigurieren`}
        subtitle={`${
          sensor.type === 'climate' ? 'Klimasensor' :
          sensor.type === 'energy' ? 'Energiesensor' :
          sensor.type === 'distance' ? 'Abstandssensor' :
          'Sensor'
        }`}
        breadcrumbs={['Verwaltung', 'Sensoren', `Sensor ${sensor.id}`]}
        onClose={onClose}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* UseCase Selection */}
        <Section title="Anwendungsfall">
          <select
            value={selectedUseCase}
            onChange={(e) => handleUseCaseChange(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Bitte wählen</option>
            {USE_CASE_MAPPING[sensor.type]?.map(useCase => (
              <option key={useCase.id} value={useCase.id}>
                {useCase.label}
              </option>
            ))}
          </select>
        </Section>

        {/* Location Settings */}
        <Section title="Standort">
          <div className="space-y-6">
            <ManagementRoom
              rooms={rooms}
              selectedRoom={selectedRoom}
              setSelectedRoom={setSelectedRoom}
              onAddRoom={async (room) => {
                const newRoom = await onAddRoom(room);
                onAddRoomSuccess(newRoom[newRoom.length - 1]);
              }}              showNewRoomForm={showNewRoomForm}
              setShowNewRoomForm={setShowNewRoomForm}
              setShowRoomEditModal={setShowRoomEditModal}
              newRoom={newRoom}
              setNewRoom={setNewRoom}
            />

            <ManagementCategorys
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onAddCategory={async (category) => {
                const newCategories = await onAddCategory(category);
                onAddCategorySuccess(newCategories[newCategories.length - 1]);
              }}              showNewCategoryForm={showNewCategoryForm}
              setShowNewCategoryForm={setShowNewCategoryForm}
              setShowCategoryEditModal={setShowCategoryEditModal}
              newCategory={newCategory}
              setNewCategory={setNewCategory}
            />

            <ManagementAssets
              assets={assets}
              selectedRoom={selectedRoom}
              selectedCategory={selectedCategory}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              onAddAsset={async (asset) => {
                const newAssets = await onAddAsset(asset);
                onAddAssetSuccess(newAssets[newAssets.length - 1]);
              }}              showNewAssetForm={showNewAssetForm}
              setShowNewAssetForm={setShowNewAssetForm}
              setShowAssetEditModal={setShowAssetEditModal}
              newAsset={newAsset}
              setNewAsset={setNewAsset}
            />
          </div>
        </Section>

        {/* Parameters */}
        {selectedUseCase && (
          <Section title="Parameter">
            {renderParameters()}
          </Section>
        )}

        {/* Edit Modals */}
        {showRoomEditModal && (
          <RoomEditModal
            rooms={rooms}
            onClose={() => setShowRoomEditModal(false)}
            onDelete={onDeleteRoom}
            onEdit={onUpdateRoom}
          />
        )}

        {showCategoryEditModal && (
          <CategoryEditModal
            categories={categories}
            onClose={() => setShowCategoryEditModal(false)}
            onDelete={onDeleteCategory}
            onEdit={onUpdateCategory}
          />
        )}

        {showAssetEditModal && (
          <AssetEditModal
            assets={assets}
            selectedRoom={selectedRoom}
            selectedCategory={selectedCategory}
            onClose={() => setShowAssetEditModal(false)}
            onDelete={onDeleteAsset}
            onEdit={onUpdateAsset}
          />
        )}

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-800 p-4">
          <div className="max-w-4xl mx-auto flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorConfigView;