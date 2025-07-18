export const focusOnDataPoints = (mapRef, csvData, initialCenter, initialZoom) => {
  if (!mapRef.current || !csvData || csvData.length === 0) {
    recenterMap(mapRef, initialCenter, initialZoom);
    return;
  }

  const bounds = new window.google.maps.LatLngBounds();
  
  csvData.forEach(row => {
    const lat = parseFloat(row.lat || row.latitude || row.lats);
    const lng = parseFloat(row.lng || row.longitude || row.lons);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      bounds.extend({ lat, lng });
    }
  });
  
  if (!bounds.isEmpty()) {
    mapRef.current.fitBounds(bounds);
    // Add some padding
    window.google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom > 15) {
        mapRef.current.setZoom(15);
      }
    });
  } else {
    recenterMap(mapRef, initialCenter, initialZoom);
  }
};

export const recenterMap = (mapRef, initialCenter, initialZoom) => {
  if (mapRef.current) {
    mapRef.current.setCenter(initialCenter);
    mapRef.current.setZoom(initialZoom);
  }
};

export const resetMap = (mapRef, initialCenter, initialZoom, resetFilters) => {
  resetFilters();
  recenterMap(mapRef, initialCenter, initialZoom);
}; 