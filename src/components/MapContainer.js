// src/components/MapContainer.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { containerStyle, center, mapStyles, initialCenter, initialZoom, parseCSV, detectCSVFormat } from '../utils';
import { useMeasurement } from '../hooks';
import { MeasurementDisplay } from '../components';
import { GeoJsonLoader } from './GeoJsonLoader';
import { MarkerLayer } from './MarkerLayer';
import { HeatmapLayerWrapper } from './HeatmapLayerWrapper';
import { LayerControls, BottomControls } from './LayerControls';

function MapContainer(props) {
  const [showCensusTracts, setShowCensusTracts] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [zoom, setZoom] = useState(12);
  const mapRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapRadiusLevel, setHeatmapRadiusLevel] = useState(5);
  const [layersDropdownOpen, setLayersDropdownOpen] = useState(false);
  const [scoreRangeDropdownOpen, setScoreRangeDropdownOpen] = useState(false);
  const controlBarRef = useRef(null);
  const streetViewRef = useRef(null);

  // Custom hook for measurement functionality
  const {
    measurementMode,
    setMeasurementMode,
    measurementPoints,
    measurementDistance,
    resetMeasurement,
    handleMapClick
  } = useMeasurement();

  // Destructure props outside useEffect to avoid dependency issues
  const { 
    datasetData, 
    updateDatasetScoreRange, 
    getDatasetScoreRange 
  } = props;

  // Handle dynamic CSV data from props
  const handleCSVDataUpdate = useCallback(() => {
    if (props.csvData && props.csvData.length > 0) {
      setCsvData(props.csvData);
      setCsvLoaded(true);
    } else if (props.csvText) {
      try {
        const parsed = parseCSV(props.csvText);
        setCsvData(parsed);
        setCsvLoaded(true);
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    }
  }, [props.csvData, props.csvText]);

  useEffect(() => {
    handleCSVDataUpdate();
  }, [handleCSVDataUpdate]);

  // Auto-detect score format and set appropriate ranges - now per dataset
  const initializeDatasetScoreRanges = useCallback(() => {
    if (!datasetData || Object.keys(datasetData).length === 0) return;
    
    Object.entries(datasetData).forEach(([datasetName, datasetRows]) => {
      if (datasetRows.length > 0) {
        const format = detectCSVFormat(datasetRows);
        if (format && updateDatasetScoreRange) {
          const currentRange = getDatasetScoreRange ? getDatasetScoreRange(datasetName) : null;
          if (!currentRange) {
            updateDatasetScoreRange(datasetName, 'yes', true);
            updateDatasetScoreRange(datasetName, 'no', true);
            updateDatasetScoreRange(datasetName, 'min', 1);
            updateDatasetScoreRange(datasetName, 'max', 10);
          }
        }
      }
    });
  }, [datasetData, updateDatasetScoreRange, getDatasetScoreRange]);

  useEffect(() => {
    initializeDatasetScoreRanges();
  }, [initializeDatasetScoreRanges]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
    streetViewRef.current = map.getStreetView();
    map.addListener('zoom_changed', () => {
      setZoom(map.getZoom());
    });
  };

  const resetFilters = () => {
    if (props.resetAllFilters) {
      props.resetAllFilters();
    }
  };

  const handleMapClickWrapper = (event) => {
    handleMapClick(event, mapRef);
  };

  return (
    <div style={{ position: 'relative' }}>
      <LayerControls
        controlBarOpen={props.controlBarOpen}
        setControlBarOpen={props.setControlBarOpen}
        showCensusTracts={showCensusTracts}
        setShowCensusTracts={setShowCensusTracts}
        measurementMode={measurementMode}
        setMeasurementMode={setMeasurementMode}
        resetMeasurement={resetMeasurement}
        mapRef={mapRef}
        initialCenter={initialCenter}
        initialZoom={initialZoom}
        setZoom={setZoom}
        resetFilters={resetFilters}
        showChart={props.showChart}
        setShowChart={props.setShowChart}
        showStats={props.showStats}
        setShowStats={props.setShowStats}
        csvData={csvData}
        csvLoaded={csvLoaded}
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        heatmapRadiusLevel={heatmapRadiusLevel}
        setHeatmapRadiusLevel={setHeatmapRadiusLevel}
        layersDropdownOpen={layersDropdownOpen}
        setLayersDropdownOpen={setLayersDropdownOpen}
        scoreRangeDropdownOpen={scoreRangeDropdownOpen}
        setScoreRangeDropdownOpen={setScoreRangeDropdownOpen}
        controlBarRef={controlBarRef}
        selectedDatasets={props.selectedDatasets}
        setSelectedDatasets={props.setSelectedDatasets}
        csvFiles={props.csvFiles}
        datasetData={props.datasetData}
        datasetScoreRanges={props.datasetScoreRanges}
        updateDatasetScoreRange={props.updateDatasetScoreRange}
        getDatasetScoreRange={props.getDatasetScoreRange}
        selectedHeatmapDatasets={props.selectedHeatmapDatasets}
        updateHeatmapDatasetSelection={props.updateHeatmapDatasetSelection}
        getHeatmapDatasets={props.getHeatmapDatasets}
        hideMarkersWithHeatmap={props.hideMarkersWithHeatmap}
        setHideMarkersWithHeatmap={props.setHideMarkersWithHeatmap}
      />

      <LoadScript googleMapsApiKey="AIzaSyCp6YMW24ocLyfToDWWFs_FmUuN7AwVm4c" libraries={["visualization"]}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          options={{ styles: mapStyles }}
          onLoad={handleMapLoad}
          onClick={handleMapClickWrapper}
        >
          {/* Render separate MarkerLayer for each dataset */}
          {props.datasetData && Object.entries(props.datasetData).map(([datasetName, datasetRows]) => (
            <MarkerLayer
              key={datasetName}
              csvData={datasetRows}
              measurementMode={measurementMode}
              selectedMarker={selectedMarker}
              setSelectedMarker={setSelectedMarker}
              mapRef={mapRef}
              zoom={zoom}
              datasetName={datasetName}
              datasetScoreRanges={props.datasetScoreRanges}
              getDatasetScoreRange={props.getDatasetScoreRange}
              showHeatmap={showHeatmap}
              hideMarkersWithHeatmap={props.hideMarkersWithHeatmap}
            />
          ))}
          
          <HeatmapLayerWrapper
            showHeatmap={showHeatmap}
            csvData={csvData}
            heatmapRadiusLevel={heatmapRadiusLevel}
            selectedDatasets={props.selectedDatasets}
            mapRef={mapRef}
            selectedHeatmapDatasets={props.selectedHeatmapDatasets}
            datasetData={props.datasetData}
          />
          
          <GeoJsonLoader
            mapRef={mapRef}
            showCensusTracts={showCensusTracts}
            measurementMode={measurementMode}
          />
        </GoogleMap>
      </LoadScript>
      
      <MeasurementDisplay
        measurementMode={measurementMode}
        measurementPoints={measurementPoints}
        measurementDistance={measurementDistance}
        resetMeasurement={resetMeasurement}
      />
      
      <BottomControls
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        csvLoaded={csvLoaded}
        heatmapRadiusLevel={heatmapRadiusLevel}
        setHeatmapRadiusLevel={setHeatmapRadiusLevel}
        scoreRangeDropdownOpen={scoreRangeDropdownOpen}
        setScoreRangeDropdownOpen={setScoreRangeDropdownOpen}
        resetFilters={resetFilters}
        datasetData={props.datasetData}
        selectedDatasets={props.selectedDatasets}
        datasetScoreRanges={props.datasetScoreRanges}
        updateDatasetScoreRange={props.updateDatasetScoreRange}
        getDatasetScoreRange={props.getDatasetScoreRange}
        selectedHeatmapDatasets={props.selectedHeatmapDatasets}
        updateHeatmapDatasetSelection={props.updateHeatmapDatasetSelection}
        getHeatmapDatasets={props.getHeatmapDatasets}
        hideMarkersWithHeatmap={props.hideMarkersWithHeatmap}
        setHideMarkersWithHeatmap={props.setHideMarkersWithHeatmap}
      />
    </div>
  );
}

export default MapContainer; 