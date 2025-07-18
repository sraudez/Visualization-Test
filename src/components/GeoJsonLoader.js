// src/components/GeoJsonLoader.js
import { useEffect, useRef } from 'react';
import censusTractsGeoJson from '../assets/census_tracts.geojson.json';

const censusTractStyle = {
  fillColor: '#cccccc',   
  fillOpacity: 0.5,
  strokeColor: '#555555',
  strokeWeight: 1
};

export function GeoJsonLoader({ mapRef, showCensusTracts, measurementMode = false }) {
  const dataLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !showCensusTracts) {
      if (dataLayerRef.current) {
        dataLayerRef.current.setMap(null);
        dataLayerRef.current = null;
      }
      return;
    }

    // Use the imported GeoJSON data directly
    const dataLayer = new window.google.maps.Data({
      map: mapRef.current,
      style: censusTractStyle
    });

    dataLayer.addGeoJson(censusTractsGeoJson);
    dataLayerRef.current = dataLayer;

    // If in measurement mode, make the data layer non-clickable
    // but maintain the visual styling
    if (measurementMode) {
      dataLayer.setStyle({
        ...censusTractStyle,
        clickable: false
      });
    } else {
      dataLayer.setStyle({
        ...censusTractStyle,
        clickable: true
      });
    }

    return () => {
      if (dataLayerRef.current) {
        dataLayerRef.current.setMap(null);
        dataLayerRef.current = null;
      }
    };
  }, [mapRef, showCensusTracts, measurementMode]);

  return null;
} 