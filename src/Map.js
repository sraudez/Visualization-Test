// src/Map.js
import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { HeatmapLayer } from '@react-google-maps/api';
import Draggable from 'react-draggable';

//size of the map
const containerStyle = {
  width: '100%',
  height: '550px',
  borderRadius: '20px',
  overflow: 'hidden',
};

const center = {
  lat: 38.6270, // example: St. Louis
  lng: -90.1994,
};

const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#d0e8d0' }], // faded green
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#dadada' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#e5e5e5' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#d0e4f7' }], // faded blue
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
];

function Map(props) {
  const [showCensusTracts, setShowCensusTracts] = useState(false);
  const [showCsvPoints, setShowCsvPoints] = useState(false);
  const [showGreenScore, setShowGreenScore] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [greenScoreData, setGreenScoreData] = useState([]);
  const [greenScoreLoaded, setGreenScoreLoaded] = useState(false);
  const [zoom, setZoom] = useState(12);
  const mapRef = useRef(null);
  const dataLayerRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapRadiusLevel, setHeatmapRadiusLevel] = useState(5); // 1-10
  const [heatmapSource, setHeatmapSource] = useState('csv'); // 'csv' or 'green_score'
  const [layersDropdownOpen, setLayersDropdownOpen] = useState(false);
  const initialCenter = { ...center };
  const initialZoom = 12;
  // Score range filter state is now in App.js
  // const [scoreRangeYes, setScoreRangeYes] = useState(true);
  // const [scoreRangeNo, setScoreRangeNo] = useState(true);
  const [scoreRangeDropdownOpen, setScoreRangeDropdownOpen] = useState(false);
  
  // Distance measurement tool state
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState([]);
  const [measurementDistance, setMeasurementDistance] = useState(0);
  const [measurementPolyline, setMeasurementPolyline] = useState(null);
  const controlBarRef = useRef(null);
  const streetViewRef = useRef(null);
  
  // CSV parsing helper
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((h, i) => { obj[h.trim()] = values[i] ? values[i].trim() : ''; });
      return obj;
    });
  }

  // Fetch CSV only once
  useEffect(() => {
    if (!csvLoaded) {
      fetch(process.env.PUBLIC_URL + '/sample.csv')
        .then(res => res.text())
        .then(text => {
          const parsed = parseCSV(text);
          setCsvData(parsed);
          setCsvLoaded(true);
          if (typeof props.setCsvData === 'function') {
            props.setCsvData(parsed);
          }
        });
    }
  }, [csvLoaded]);

  // Always fetch green_score.csv on mount
  useEffect(() => {
    if (!greenScoreLoaded) {
      fetch(process.env.PUBLIC_URL + '/green_score.csv')
        .then(res => res.text())
        .then(text => {
          const parsed = parseCSV(text);
          setGreenScoreData(parsed);
          setGreenScoreLoaded(true);
          if (typeof props.setGreenScoreData === 'function') {
            props.setGreenScoreData(parsed);
          }
        });
    }
  }, [greenScoreLoaded]);

  // Prepare heatmap data safely, with weights
  let heatmapData = [];
  if (showHeatmap && window.google && window.google.maps) {
    if (heatmapSource === 'csv' && showCsvPoints) {
      heatmapData = csvData
        .map(row => {
          const lat = parseFloat(row.lats);
          const lng = parseFloat(row.lons);
          const score = (row.scores || '').toLowerCase();
          if (isNaN(lat) || isNaN(lng)) return null;
          // Use 1 for 'yes', 0 for 'no'
          const weight = score === 'yes' ? 1 : 0;
          return { location: new window.google.maps.LatLng(lat, lng), weight };
        })
        .filter(Boolean);
    } else if (heatmapSource === 'green_score' && showGreenScore) {
      heatmapData = greenScoreData
        .map(row => {
          const lat = parseFloat(row.latitude);
          const lng = parseFloat(row.longitude);
          const score = parseFloat(row.score);
          if (isNaN(lat) || isNaN(lng) || isNaN(score)) return null;
          // Use score as weight
          return { location: new window.google.maps.LatLng(lat, lng), weight: score };
        })
        .filter(Boolean);
    }
  }

  // Sync heatmapSource with active layers
  useEffect(() => {
    if (showGreenScore && !showCsvPoints) {
      setHeatmapSource('green_score');
    } else if (showCsvPoints && !showGreenScore) {
      setHeatmapSource('csv');
    }
    // If both are on, don't auto-switch (let user choose)
  }, [showGreenScore, showCsvPoints]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.layers-dropdown') && !e.target.closest('.layers-btn')) {
        setLayersDropdownOpen(false);
      }
    }
    if (layersDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [layersDropdownOpen]);

  // Close score range dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.score-range-dropdown') && !e.target.closest('.score-range-btn')) {
        setScoreRangeDropdownOpen(false);
      }
    }
    if (scoreRangeDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [scoreRangeDropdownOpen]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
    // Store reference to Street View panorama
    streetViewRef.current = map.getStreetView();
    // If toggle is on, add the layer
    if (showCensusTracts) {
      // Fetch and add GeoJSON
      fetch('/census_tracts.geojson.json')
        .then(response => response.json())
        .then(geojson => {
          if (dataLayerRef.current) {
            dataLayerRef.current.setMap(null);
          }
          const dataLayer = new window.google.maps.Data({
            map: mapRef.current,
            style: {
              fillColor: '#cccccc',
              fillOpacity: 0.5,
              strokeColor: '#555555', // darker grey for boundaries
              strokeWeight: 2,
            },
          });
          dataLayer.addGeoJson(geojson);
          dataLayerRef.current = dataLayer;
        });
    }
    // Listen for zoom changes
    map.addListener('zoom_changed', () => {
      setZoom(map.getZoom());
    });
  };

  const handleZoomSlider = (e) => {
    const newZoom = Number(e.target.value);
    setZoom(newZoom);
    if (mapRef.current) {
      mapRef.current.setZoom(newZoom);
    }
  };

  const anyCsvLayerSelected = showCsvPoints || showGreenScore;

  // Reset filters handler
  const resetFilters = () => {
    props.setScoreRangeYes(true);
    props.setScoreRangeNo(true);
    props.setScoreRangeMin(1);
    props.setScoreRangeMax(10);
  };

  // Distance measurement functions
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleMapClick = (event) => {
    if (!measurementMode) return;
    
    const newPoint = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    const updatedPoints = [...measurementPoints, newPoint];
    setMeasurementPoints(updatedPoints);
    
    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < updatedPoints.length; i++) {
      totalDistance += calculateDistance(updatedPoints[i-1], updatedPoints[i]);
    }
    setMeasurementDistance(totalDistance);
    
    // Create polyline
    if (mapRef.current) {
      if (measurementPolyline) {
        measurementPolyline.setMap(null);
      }
      const polyline = new window.google.maps.Polyline({
        path: updatedPoints,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: mapRef.current
      });
      setMeasurementPolyline(polyline);
    }
  };

  const resetMeasurement = () => {
    setMeasurementPoints([]);
    setMeasurementDistance(0);
    if (measurementPolyline) {
      measurementPolyline.setMap(null);
      setMeasurementPolyline(null);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {props.controlBarOpen && (
        // Full draggable control bar when open
        <Draggable nodeRef={controlBarRef}>
          <div ref={controlBarRef} style={{ 
            position: 'absolute', 
            top: 16, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 2000,
            display: 'flex', 
            alignItems: 'center', 
            gap: 16, 
            background: 'rgba(255, 255, 255, 0.9)', 
            padding: 8, 
            borderRadius: 8, 
            width: 'fit-content', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            cursor: 'move'
          }}>
            {/* Close button */}
            <button
              style={{ 
                padding: 4, 
                borderRadius: 4, 
                background: 'white', 
                border: '1px solid #ccc', 
                cursor: 'pointer', 
                fontWeight: 600,
                fontSize: 12,
                transition: 'all 0.2s ease',
                marginRight: 8
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.borderColor = '#999';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#ccc';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              onClick={() => props.setControlBarOpen(false)}
            >
              ✕
            </button>
            <button
              style={{ 
                padding: 8, 
                borderRadius: 4, 
                background: showCensusTracts ? '#007bff' : 'white', 
                color: showCensusTracts ? 'white' : 'black',
                border: '1px solid #ccc', 
                cursor: 'pointer', 
                fontWeight: 600,
                transition: 'all 0.2s ease',
                ':hover': {
                  background: '#f0f0f0',
                  borderColor: '#999',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
              onMouseEnter={(e) => {
                if (!showCensusTracts) {
                  e.target.style.background = '#f0f0f0';
                  e.target.style.borderColor = '#999';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                } else {
                  e.target.style.background = '#0056b3';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showCensusTracts) {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#ccc';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                } else {
                  e.target.style.background = '#007bff';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
              onClick={() => {
                const newState = !showCensusTracts;
                setShowCensusTracts(newState);
                if (newState && mapRef.current) {
                  // Fetch and add GeoJSON
                  fetch(process.env.PUBLIC_URL + '/census_tracts.geojson.json')
                    .then(response => response.json())
                    .then(geojson => {
                      if (dataLayerRef.current) {
                        dataLayerRef.current.setMap(null);
                      }
                      const dataLayer = new window.google.maps.Data({
                        map: mapRef.current,
                        style: {
                          fillColor: '#cccccc',
                          fillOpacity: 0.5,
                          strokeColor: '#555555', // darker grey for boundaries
                          strokeWeight: 2,
                        },
                      });
                      dataLayer.addGeoJson(geojson);
                      dataLayerRef.current = dataLayer;
                    });
                } else if (dataLayerRef.current) {
                  dataLayerRef.current.setMap(null);
                  dataLayerRef.current = null;
                }
              }}
            >
              {showCensusTracts ? 'Hide Census Tracts' : 'Show Census Tracts'}
            </button>
            <div style={{ position: 'relative' }}>
              <button className="layers-btn" style={{ 
                padding: 8, 
                borderRadius: 4, 
                background: 'white', 
                border: '1px solid #ccc', 
                cursor: 'pointer', 
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }} 
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.borderColor = '#999';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#ccc';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              onClick={() => setLayersDropdownOpen(v => !v)}>
                Layers
              </button>
              {layersDropdownOpen && (
                <div className="layers-dropdown" style={{ position: 'absolute', top: 40, left: 0, background: 'white', border: '1px solid #ccc', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', padding: 12, minWidth: 200, zIndex: 10 }}>
                  <label style={{ display: 'block', marginBottom: 8, color: 'black' }}>
                    <input type="checkbox" checked={showCsvPoints} onChange={e => setShowCsvPoints(e.target.checked)} /> Traffic Signal set
                  </label>
                  <label style={{ display: 'block', marginBottom: 4, color: 'black' }}>
                    <input type="checkbox" checked={showGreenScore} onChange={e => setShowGreenScore(e.target.checked)} /> Green Score set
                  </label>
                </div>
              )}
            </div>
            
            <button
              style={{ 
                padding: 8, 
                borderRadius: 4, 
                background: measurementMode ? '#4CAF50' : 'white', 
                color: measurementMode ? 'white' : 'black',
                border: '1px solid #ccc', 
                cursor: 'pointer', 
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!measurementMode) {
                  e.target.style.background = '#f0f0f0';
                  e.target.style.borderColor = '#999';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                } else {
                  e.target.style.background = '#45a049';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!measurementMode) {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#ccc';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                } else {
                  e.target.style.background = '#4CAF50';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
              onClick={() => setMeasurementMode(!measurementMode)}
            >
              {measurementMode ? 'Exit Measure' : 'Measure'}
            </button>
            <button
              style={{ padding: 8, borderRadius: 4, background: 'white', border: '1px solid #ccc', cursor: 'pointer', fontWeight: 600 }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.borderColor = '#999';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#ccc';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              onClick={() => {
                setShowCensusTracts(false);
                setShowCsvPoints(false);
                setShowGreenScore(false);
                setLayersDropdownOpen(false);
                setMeasurementMode(false);
                if (mapRef.current) {
                  mapRef.current.setCenter(initialCenter);
                  mapRef.current.setZoom(initialZoom);
                  setZoom(initialZoom);
                  // Exit Street View if active
                  if (streetViewRef.current && streetViewRef.current.getVisible()) {
                    streetViewRef.current.setVisible(false);
                  }
                }
                resetFilters();
              }}
            >
              Reset
            </button>
            <button
              style={{ 
                padding: 8, 
                borderRadius: 4, 
                background: 'white', 
                border: '1px solid #ccc', 
                cursor: 'pointer', 
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.borderColor = '#999';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#ccc';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.setCenter(initialCenter);
                  mapRef.current.setZoom(initialZoom);
                  setZoom(initialZoom);
                }
              }}
            >
              Recenter
            </button>
            <button
              style={{ 
                padding: 8, 
                borderRadius: 4, 
                background: 'white', 
                border: '1px solid #ccc', 
                cursor: 'pointer', 
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.borderColor = '#999';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#ccc';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              onClick={() => {
                if (mapRef.current) {
                  // Focus on selected datasets
                  const bounds = new window.google.maps.LatLngBounds();
                  let hasData = false;
                  
                  // Add CSV points to bounds if selected
                  if (showCsvPoints && csvData.length > 0) {
                    csvData.forEach(row => {
                      const lat = parseFloat(row.lats);
                      const lng = parseFloat(row.lons);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        bounds.extend(new window.google.maps.LatLng(lat, lng));
                        hasData = true;
                      }
                    });
                  }
                  
                  // Add Green Score points to bounds if selected
                  if (showGreenScore && greenScoreData.length > 0) {
                    greenScoreData.forEach(row => {
                      const lat = parseFloat(row.latitude);
                      const lng = parseFloat(row.longitude);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        bounds.extend(new window.google.maps.LatLng(lat, lng));
                        hasData = true;
                      }
                    });
                  }
                  
                  if (hasData) {
                    mapRef.current.fitBounds(bounds);
                    // Add some padding to the bounds and zoom in more
                    const listener = mapRef.current.addListener('bounds_changed', () => {
                      const currentBounds = mapRef.current.getBounds();
                      if (currentBounds) {
                        const ne = currentBounds.getNorthEast();
                        const sw = currentBounds.getSouthWest();
                        const latPadding = (ne.lat() - sw.lat()) * 0.1;
                        const lngPadding = (ne.lng() - sw.lng()) * 0.1;
                        
                        const paddedBounds = new window.google.maps.LatLngBounds(
                          new window.google.maps.LatLng(sw.lat() - latPadding, sw.lng() - lngPadding),
                          new window.google.maps.LatLng(ne.lat() + latPadding, ne.lng() + lngPadding)
                        );
                        
                        mapRef.current.fitBounds(paddedBounds);
                        
                        // Zoom in more after fitting bounds
                        setTimeout(() => {
                          const currentZoom = mapRef.current.getZoom();
                          const newZoom = Math.min(currentZoom + 2, 18); // Zoom in by 2 levels, max zoom 18
                          mapRef.current.setZoom(newZoom);
                          setZoom(newZoom);
                        }, 100);
                        
                        window.google.maps.event.removeListener(listener);
                      }
                    });
                  } else {
                    // If no data is selected, recenter to default
                    mapRef.current.setCenter(initialCenter);
                    mapRef.current.setZoom(initialZoom);
                    setZoom(initialZoom);
                  }
                }
              }}
            >
              Focus
            </button>
          </div>
        </Draggable>
      )}
      <LoadScript googleMapsApiKey="AIzaSyCp6YMW24ocLyfToDWWFs_FmUuN7AwVm4c" libraries={["visualization"]}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          options={{ styles: mapStyles }}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
        >
          {/* Render CSV markers if toggle is on */}
          {showCsvPoints && csvData.map((row, i) => {
            const lat = parseFloat(row.lats);
            const lng = parseFloat(row.lons);
            const score = (row.scores || '').toLowerCase();
            if (isNaN(lat) || isNaN(lng)) return null;
            if ((score === 'yes' && !props.scoreRangeYes) || (score === 'no' && !props.scoreRangeNo)) return null;
            return (
              <Marker
                key={i}
                position={{ lat, lng }}
                clickable={!measurementMode}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: score === 'yes' ? 'green' : 'red',
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: '#222',
                }}
                onClick={measurementMode ? null : () => {
                  setSelectedMarker({ lat, lng, score, i });
                  // Zoom in and center on the clicked point
                  if (mapRef.current) {
                    mapRef.current.setCenter({ lat, lng });
                    mapRef.current.setZoom(Math.max(zoom + 2, 16)); // Zoom in by 2 levels, minimum zoom 16
                  }
                }}
              />
            );
          })}
          {/* Render Green Score markers if toggle is on */}
          {showGreenScore && greenScoreData.map((row, i) => {
            const lat = parseFloat(row.latitude);
            const lng = parseFloat(row.longitude);
            const score = parseFloat(row.score);
            if (isNaN(lat) || isNaN(lng) || isNaN(score)) return null;
            if (score < props.scoreRangeMin || score > props.scoreRangeMax) return null;
            // Interpolate color and size: 1 = light green/small, 10 = dark green/large
            const lightness = 80 - ((score - 1) / 9) * 50; // 1:80%, 10:30%
            const color = `hsl(120, 100%, ${lightness}%)`;
            const scale = 6 + ((score - 1) / 9) * 18; // 1:6, 10:24
            return (
              <Marker
                key={`green-score-${i}`}
                position={{ lat, lng }}
                clickable={!measurementMode}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale,
                  fillColor: color,
                  fillOpacity: 0.8,
                  strokeWeight: 1,
                  strokeColor: '#222',
                }}
                onClick={measurementMode ? null : () => {
                  setSelectedMarker({ lat, lng, score, i });
                  // Zoom in and center on the clicked point
                  if (mapRef.current) {
                    mapRef.current.setCenter({ lat, lng });
                    mapRef.current.setZoom(Math.max(zoom + 2, 16)); // Zoom in by 2 levels, minimum zoom 16
                  }
                }}
              />
            );
          })}
          {/* InfoWindow for selected marker */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => {
                setSelectedMarker(null);
                // Return to initial center and zoom (same as Recenter button)
                if (mapRef.current) {
                  mapRef.current.setCenter(initialCenter);
                  mapRef.current.setZoom(initialZoom);
                  setZoom(initialZoom);
                }
              }}
            >
              <div style={{ color: 'black', fontSize: '14px', lineHeight: '1.4' }}>
                <div><strong>Latitude:</strong> {selectedMarker.lat.toFixed(6)}</div>
                <div><strong>Longitude:</strong> {selectedMarker.lng.toFixed(6)}</div>
                <div><strong>Safety Score:</strong> {selectedMarker.score}</div>
              </div>
            </InfoWindow>
          )}
          {/* Heatmap Layer */}
          <HeatmapLayer data={showHeatmap ? heatmapData : []} options={{ radius: 10 + (heatmapRadiusLevel - 1) * 10, opacity: 0.6 }} />
      </GoogleMap>
    </LoadScript>
      
      {/* Distance Measurement Display */}
      {measurementMode && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: 12,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: 200
        }}>
          <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            Distance Measurement
          </div>
          <div style={{ marginBottom: 8, fontSize: 12 }}>
            Click points on the map to measure distance
          </div>
          {measurementPoints.length > 0 && (
            <>
              <div style={{ marginBottom: 8, fontSize: 12 }}>
                <strong>Total Distance:</strong> {measurementDistance.toFixed(2)} km
              </div>
              <div style={{ marginBottom: 8, fontSize: 12 }}>
                <strong>Points:</strong> {measurementPoints.length}
              </div>
              <button
                style={{ 
                  padding: '4px 8px', 
                  borderRadius: 4, 
                  background: 'white', 
                  border: '1px solid #ccc', 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  fontSize: 12,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f0f0f0';
                  e.target.style.borderColor = '#999';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#ccc';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
                onClick={resetMeasurement}
              >
                Reset
              </button>
            </>
          )}
        </div>
      )}
      
      {/* Control center below the map: always visible */}
      <div style={{
        marginTop: 16,
        padding: 16,
        background: '#f8f8f8',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        color: 'black'
      }}>
        <button
          style={{ 
            padding: 8, 
            borderRadius: 4, 
            background: showHeatmap ? '#007bff' : 'white', 
            color: showHeatmap ? 'white' : 'black',
            border: '1px solid #ccc', 
            cursor: 'pointer', 
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!showHeatmap) {
              e.target.style.background = '#f0f0f0';
              e.target.style.borderColor = '#999';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            } else {
              e.target.style.background = '#0056b3';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!showHeatmap) {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#ccc';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            } else {
              e.target.style.background = '#007bff';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
        </button>
        <label style={{ marginLeft: 24, color: 'black' }}>
          Data set:
          <select
            value={heatmapSource}
            onChange={e => setHeatmapSource(e.target.value)}
            style={{ marginLeft: 8, verticalAlign: 'middle' }}
            disabled={!csvLoaded && !greenScoreLoaded}
          >
            {csvLoaded && <option value="csv">Traffic Signal (yes/no)</option>}
            {greenScoreLoaded && <option value="green_score">Green Score (1-10)</option>}
          </select>
        </label>
        {/* Score Range UI */}
        <div style={{ marginLeft: 24, position: 'relative', display: 'inline-block' }}>
          <button
            className="score-range-btn"
            style={{ padding: 8, borderRadius: 4, background: 'white', border: '1px solid #ccc', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease' }}
            onClick={() => setScoreRangeDropdownOpen(v => !v)}
            onMouseEnter={(e) => {
              e.target.style.background = '#f0f0f0';
              e.target.style.borderColor = '#999';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#ccc';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Score Range
          </button>
          {scoreRangeDropdownOpen && (
            <div className="score-range-dropdown" style={{ position: 'absolute', top: 40, left: 0, background: 'white', border: '1px solid #ccc', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', padding: 16, minWidth: 200, zIndex: 10 }}>
              {heatmapSource === 'csv' && (
                <>
                  <label style={{ display: 'block', marginBottom: 8, color: 'black' }}>
                    <input type="checkbox" checked={props.scoreRangeYes} onChange={e => props.setScoreRangeYes(e.target.checked)} /> Yes
                  </label>
                  <label style={{ display: 'block', marginBottom: 4, color: 'black' }}>
                    <input type="checkbox" checked={props.scoreRangeNo} onChange={e => props.setScoreRangeNo(e.target.checked)} /> No
                  </label>
                </>
              )}
              {heatmapSource === 'green_score' && (
                <>
                  <label style={{ display: 'block', marginBottom: 8, color: 'black' }}>
                    Min:
                    <input
                      type="number"
                      min={1}
                      max={props.scoreRangeMax}
                      value={props.scoreRangeMin}
                      onChange={e => props.setScoreRangeMin(Number(e.target.value))}
                      style={{ width: 48, marginLeft: 8 }}
                    />
                  </label>
                  <label style={{ display: 'block', color: 'black' }}>
                    Max:
                    <input
                      type="number"
                      min={props.scoreRangeMin}
                      max={10}
                      value={props.scoreRangeMax}
                      onChange={e => props.setScoreRangeMax(Number(e.target.value))}
                      style={{ width: 48, marginLeft: 8 }}
                    />
                  </label>
                </>
              )}
            </div>
          )}
        </div>
        {/* Export CSV Button */}
        <button
          style={{ marginLeft: 24, padding: 8, borderRadius: 4, background: 'white', border: '1px solid #ccc', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease' }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f0f0f0';
            e.target.style.borderColor = '#999';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.borderColor = '#ccc';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          onClick={() => {
            let data = [];
            let filename = '';
            if (heatmapSource === 'csv') {
              data = csvData.filter(row => {
                const score = (row.scores || '').toLowerCase();
                return (score === 'yes' && props.scoreRangeYes) || (score === 'no' && props.scoreRangeNo);
              });
              filename = 'traffic-signal';
            } else if (heatmapSource === 'green_score') {
              data = greenScoreData.filter(row => {
                const score = parseFloat(row.score);
                return score >= props.scoreRangeMin && score <= props.scoreRangeMax;
              });
              filename = 'green-score';
            }
            if (data.length === 0) return;
            const headers = Object.keys(data[0] || {});
            const csvContent = [
              headers.join(','),
              ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
              }).join(','))
            ];
            const csvString = csvContent.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          Export CSV
        </button>
        <button
          style={{ marginLeft: 24, padding: 8, borderRadius: 4, background: 'white', border: '1px solid #ccc', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease' }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f0f0f0';
            e.target.style.borderColor = '#999';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.borderColor = '#ccc';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          onClick={resetFilters}
        >
          Reset Filters
        </button>
        <label style={{ marginLeft: 24, color: 'black' }}>
          Interpolation (Radius):
          <input
            type="range"
            min={1}
            max={10}
            value={heatmapRadiusLevel}
            onChange={e => setHeatmapRadiusLevel(Number(e.target.value))}
            style={{ marginLeft: 8, verticalAlign: 'middle' }}
          />
          <span style={{ marginLeft: 8, color: 'black' }}>{10 + (heatmapRadiusLevel - 1) * 10}</span>
        </label>
      </div>
    </div>
  );
}

export default Map;
