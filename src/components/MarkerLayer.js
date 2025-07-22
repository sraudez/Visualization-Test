// src/components/MarkerLayer.js
import React from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { detectCSVFormat, getMarkerSize } from '../utils';

export function MarkerLayer({ 
  csvData, 
  measurementMode, 
  selectedMarker, 
  setSelectedMarker, 
  mapRef, 
  zoom, 
  // Remove global score range props
  // scoreRangeYes, 
  // scoreRangeNo, 
  // scoreRangeMin, 
  // scoreRangeMax,
  datasetName,
  // Add per-dataset score range props
  datasetScoreRanges,
  getDatasetScoreRange,
  // Add hide markers with heatmap props
  showHeatmap,
  hideMarkersWithHeatmap
}) {
  console.log(`MarkerLayer for ${datasetName}:`, { 
    csvDataLength: csvData?.length, 
    firstRow: csvData?.[0],
    datasetName,
    showHeatmap,
    hideMarkersWithHeatmap
  });

  // Detect CSV format
  const csvFormat = detectCSVFormat(csvData);
  
  console.log(`CSV format for ${datasetName}:`, csvFormat);
  
  if (!csvFormat) {
    console.log(`No valid CSV format for ${datasetName}`);
    return null; // Invalid CSV format
  }
  
  const { latCol, lngCol, scoreCol, scoreFormat } = csvFormat;
  
  // Get score range for this specific dataset
  const scoreRange = getDatasetScoreRange ? getDatasetScoreRange(datasetName) : { yes: true, no: true, min: 1, max: 10 };
  
  console.log(`Score range for ${datasetName}:`, scoreRange);
  
  // Check if markers should be hidden (when heatmap is active and hide option is enabled)
  const shouldHideMarkers = showHeatmap && hideMarkersWithHeatmap;
  
  console.log(`Should hide markers for ${datasetName}:`, shouldHideMarkers);
  
  // Filter data based on score format and range
  const filteredData = csvData.filter(row => {
    const lat = parseFloat(row[latCol]);
    const lng = parseFloat(row[lngCol]);
    const score = row[scoreCol];
    
    if (isNaN(lat) || isNaN(lng)) return false;
    
    if (scoreFormat === 'yes_no') {
      const scoreLower = score.toString().toLowerCase();
      return (scoreLower === 'yes' && scoreRange.yes) || (scoreLower === 'no' && scoreRange.no);
    } else if (scoreFormat === 'numeric_1_10') {
      const numScore = parseFloat(score);
      return !isNaN(numScore) && numScore >= scoreRange.min && numScore <= scoreRange.max;
    } else if (scoreFormat === 'numeric_other') {
      // For other numeric formats, show all data
      return true;
    } else if (scoreFormat === 'categorical') {
      // For categorical data, show all data
      return true;
    }
    
    return true; // For unknown formats, show all
  });
  
  console.log(`Filtered data for ${datasetName}:`, { 
    originalLength: csvData.length, 
    filteredLength: filteredData.length,
    firstFilteredRow: filteredData[0]
  });
  
  // Don't render markers if they should be hidden
  if (shouldHideMarkers) {
    console.log(`Markers hidden for ${datasetName} due to heatmap`);
    return null;
  }
  
  return (
    <>
      {/* Render markers */}
      {filteredData.map((row, i) => {
        const lat = parseFloat(row[latCol]);
        const lng = parseFloat(row[lngCol]);
        const score = row[scoreCol];
        
        // Use consistent color scheme based on score format
        let finalColor;
        if (scoreFormat === 'yes_no') {
          const scoreLower = score.toString().toLowerCase();
          if (scoreLower === 'yes') {
            finalColor = '#28a745'; // Green for yes
          } else if (scoreLower === 'no') {
            finalColor = '#dc3545'; // Red for no
          } else {
            finalColor = '#6c757d'; // Gray for unknown values
          }
        } else if (scoreFormat === 'numeric_1_10') {
          const numScore = parseFloat(score);
          if (!isNaN(numScore)) {
            // Create RGB gradient from red (1) to blue (10)
            const normalized = (numScore - 1) / 9; // 0 to 1
            const red = Math.round(255 * (1 - normalized));
            const green = 0;
            const blue = Math.round(255 * normalized);
            finalColor = `rgb(${red}, ${green}, ${blue})`;
          } else {
            finalColor = '#6c757d'; // Gray for invalid values
          }
        } else if (scoreFormat === 'numeric_other') {
          const numScore = parseFloat(score);
          if (!isNaN(numScore)) {
            // Use a different color scheme for other numeric formats
            // Create a rainbow-like gradient
            const hue = (numScore * 137.5) % 360; // Golden angle approximation
            finalColor = `hsl(${hue}, 70%, 50%)`;
          } else {
            finalColor = '#6c757d'; // Gray for invalid values
          }
        } else if (scoreFormat === 'categorical') {
          // For categorical data, use a hash-based color
          const hash = score.toString().split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          const hue = Math.abs(hash) % 360;
          finalColor = `hsl(${hue}, 70%, 50%)`;
        } else {
          finalColor = '#6c757d'; // Gray for unknown formats
        }
        
        const scale = getMarkerSize(score, scoreFormat);
        
        return (
          <Marker
            key={`${datasetName}-${i}`}
            position={{ lat, lng }}
            clickable={!measurementMode}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale,
              fillColor: finalColor,
              fillOpacity: 0.8,
              strokeWeight: 1,
              strokeColor: '#222',
            }}
            onClick={measurementMode ? null : () => {
              setSelectedMarker({ lat, lng, score, i, format: scoreFormat, dataset: datasetName });
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
              mapRef.current.setCenter({ lat: 38.6270, lng: -90.1994 });
              mapRef.current.setZoom(12);
            }
          }}
        >
          <div style={{ color: 'black', fontSize: '14px', lineHeight: '1.4' }}>
            <div><strong>Dataset:</strong> {selectedMarker.dataset || 'Unknown'}</div>
            <div><strong>Latitude:</strong> {selectedMarker.lat.toFixed(6)}</div>
            <div><strong>Longitude:</strong> {selectedMarker.lng.toFixed(6)}</div>
            <div><strong>Score:</strong> {selectedMarker.score}</div>
            {selectedMarker.format && (
              <div><strong>Format:</strong> {selectedMarker.format}</div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
} 