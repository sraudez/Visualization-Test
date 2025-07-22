import { useState } from 'react';
import { calculateDistance } from '../utils';

export function useMeasurement() {
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState([]);
  const [measurementDistance, setMeasurementDistance] = useState(0);
  const [measurementPolyline, setMeasurementPolyline] = useState(null);

  const resetMeasurement = () => {
    setMeasurementPoints([]);
    setMeasurementDistance(0);
    if (measurementPolyline) {
      measurementPolyline.setMap(null);
      setMeasurementPolyline(null);
    }
  };

  const handleMapClick = (event, mapRef) => {
    if (!measurementMode) return;
    
    const newPoint = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    const updatedPoints = [...measurementPoints, newPoint];
    setMeasurementPoints(updatedPoints);
    
    const totalDistance = calculateTotalDistance(updatedPoints);
    setMeasurementDistance(totalDistance);
    
    createMeasurementPolyline(updatedPoints, mapRef);
  };

  const calculateTotalDistance = (points) => {
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += calculateDistance(points[i-1], points[i]);
    }
    return totalDistance;
  };

  const createMeasurementPolyline = (points, mapRef) => {
    if (!mapRef.current) return;
    
    if (measurementPolyline) {
      measurementPolyline.setMap(null);
    }
    
    const polyline = new window.google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: mapRef.current
    });
    setMeasurementPolyline(polyline);
  };

  return {
    measurementMode,
    setMeasurementMode,
    measurementPoints,
    measurementDistance,
    resetMeasurement,
    handleMapClick
  };
} 