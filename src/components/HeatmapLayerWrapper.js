// src/components/HeatmapLayerWrapper.js
import { useEffect, useRef } from 'react';
import { detectCSVFormat } from '../utils';

export function HeatmapLayerWrapper({ showHeatmap, csvData, heatmapRadiusLevel, selectedDatasets, mapRef, selectedHeatmapDatasets, datasetData }) {
  const heatmapRefs = useRef({});

  useEffect(() => {
    // Clean up existing heatmaps
    Object.values(heatmapRefs.current).forEach(heatmap => {
      if (heatmap) {
        heatmap.setMap(null);
      }
    });
    heatmapRefs.current = {};

    // Don't create heatmap if disabled or no heatmap datasets selected
    if (!showHeatmap || !selectedHeatmapDatasets || selectedHeatmapDatasets.length === 0 || !mapRef.current) {
      return;
    }

    // Create heatmap for each selected heatmap dataset
    selectedHeatmapDatasets.forEach(datasetName => {
      const datasetRows = datasetData[datasetName];
      if (!datasetRows || datasetRows.length === 0) return;

      const csvFormat = detectCSVFormat(datasetRows);
      if (!csvFormat) return;

      const { latCol, lngCol, scoreCol, scoreFormat } = csvFormat;

      // Prepare heatmap data for this dataset
      const heatmapData = datasetRows
        .filter(row => {
          const lat = parseFloat(row[latCol]);
          const lng = parseFloat(row[lngCol]);
          return !isNaN(lat) && !isNaN(lng);
        })
        .map(row => {
          const lat = parseFloat(row[latCol]);
          const lng = parseFloat(row[lngCol]);
          const score = row[scoreCol];

          // Create weighted location for heatmap
          let weight = 1;
          if (scoreFormat === 'yes_no') {
            weight = score.toString().toLowerCase() === 'yes' ? 1 : 0.5;
          } else if (scoreFormat === 'numeric_1_10') {
            const numScore = parseFloat(score);
            weight = isNaN(numScore) ? 0 : numScore / 10;
          }

          return {
            location: new window.google.maps.LatLng(lat, lng),
            weight: weight
          };
        });

      // Only create heatmap if we have data
      if (heatmapData.length === 0) return;

      // Create new heatmap layer for this dataset
      const heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: mapRef.current,
        radius: Math.max(20, heatmapRadiusLevel * 10),
        opacity: 0.8,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });

      heatmapRefs.current[datasetName] = heatmap;
    });

    // Cleanup function
    return () => {
      Object.values(heatmapRefs.current).forEach(heatmap => {
        if (heatmap) {
          heatmap.setMap(null);
        }
      });
      heatmapRefs.current = {};
    };
  }, [showHeatmap, heatmapRadiusLevel, selectedHeatmapDatasets, mapRef, datasetData]);

  // This component doesn't render anything visible
  return null;
} 