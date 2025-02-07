

const defaultUseCases = [
  { id: 1, title: "Füllstände", type: "Distance", specialType: "minMax", description: "Informationen zu den Füllständen in Regalen, Silos oder Behältern." },
  { id: 2, title: "Raumklima", type: "Climate", specialType: "clim", description: "Überwacht Luftqualität und Klima." },
  { id: 3, title: "Öffnungen", type: "Distance", specialType: "static", description: "Erkennt die Öffnung und Schließung von Türen oder Behältern." },
  { id: 4, title: "Stromversorgung", type: "Energy", specialType: "energ", description: "Überwacht Stromversorgung und Energieverbrauch." },
];

export default defaultUseCases;