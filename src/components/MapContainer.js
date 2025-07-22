// src/components/MapContainer.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { containerStyle, center, initialCenter, initialZoom } from '../utils/mapConfig';
import { mapStyles } from '../utils/mapStyles';
import { parseCSV, detectCSVFormat } from '../utils';
import { useMeasurement } from '../hooks';
import { MarkerLayer } from './MarkerLayer';
import { HeatmapLayerWrapper } from './HeatmapLayerWrapper';
import { GeoJsonLoader } from './GeoJsonLoader';
import { MeasurementDisplay } from './MeasurementDisplay';
import { LayerControls, BottomControls } from './LayerControls';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCp6YMW24ocLyfToDWWFs_FmUuN7AwVm4c';

/**
 * Main map container component that integrates Google Maps with various layers
 */
function MapContainer(props) {
  const [showCensusTracts, setShowCensusTracts] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [zoom, setZoom] = useState(12);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapRadiusLevel, setHeatmapRadiusLevel] = useState(5);
  const [layersDropdownOpen, setLayersDropdownOpen] = useState(false);
  const [scoreRangeDropdownOpen, setScoreRangeDropdownOpen] = useState(false);
  
  const mapRef = useRef(null);
  const controlBarRef = useRef(null);
  const streetViewRef = useRef(null);

  const measurement = useMeasurement();

  // Destructure props for useCallback dependencies
  const {
    csvData: propsCsvData,
    csvText: propsCsvText,
    datasetData: propsDatasetData,
    updateDatasetScoreRange: propsUpdateDatasetScoreRange,
    getDatasetScoreRange: propsGetDatasetScoreRange,
    resetAllFilters: propsResetAllFilters
  } = props;

  /**
   * Handles CSV data updates from props
   */
  const handleCSVDataUpdate = useCallback(() => {
    if (propsCsvData && propsCsvData.length > 0) {
      setCsvData(propsCsvData);
      setCsvLoaded(true);
    } else if (propsCsvText) {
      try {
        const parsed = parseCSV(propsCsvText);
        setCsvData(parsed);
        setCsvLoaded(true);
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    }
  }, [propsCsvData, propsCsvText]);

  /**
   * Initializes score ranges for new datasets
   */
  const initializeDatasetScoreRanges = useCallback(() => {
    if (!propsDatasetData || Object.keys(propsDatasetData).length === 0) return;
    
    Object.entries(propsDatasetData).forEach(([datasetName, datasetRows]) => {
      if (datasetRows.length > 0) {
        const format = detectCSVFormat(datasetRows);
        if (format && propsUpdateDatasetScoreRange) {
          const currentRange = propsGetDatasetScoreRange ? 
            propsGetDatasetScoreRange(datasetName) : null;
          
          if (!currentRange) {
            propsUpdateDatasetScoreRange(datasetName, 'yes', true);
            propsUpdateDatasetScoreRange(datasetName, 'no', true);
            propsUpdateDatasetScoreRange(datasetName, 'min', 1);
            propsUpdateDatasetScoreRange(datasetName, 'max', 10);
          }
        }
      }
    });
  }, [propsDatasetData, propsUpdateDatasetScoreRange, propsGetDatasetScoreRange]);

  /**
   * Handles map initialization
   */
  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
    streetViewRef.current = map.getStreetView();
    map.addListener('zoom_changed', () => {
      setZoom(map.getZoom());
    });
  }, []);

  /**
   * Resets all filters
   */
  const resetFilters = useCallback(() => {
    if (propsResetAllFilters) {
      propsResetAllFilters();
    }
  }, [propsResetAllFilters]);

  /**
   * Wraps map click handler for measurement mode
   */
  const handleMapClickWrapper = useCallback((event) => {
    measurement.handleMapClick(event, mapRef);
  }, [measurement]);

  /**
   * Renders marker layers for selected datasets
   */
  const renderMarkerLayers = () => {
    if (!props.datasetData || !props.selectedDatasets) return null;

    return props.selectedDatasets.map(datasetName => {
      const datasetRows = props.datasetData[datasetName];
      
      return (
        <MarkerLayer
          key={datasetName}
          csvData={datasetRows}
          measurementMode={measurement.measurementMode}
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
      );
    });
  };

  // Effects
  useEffect(() => {
    handleCSVDataUpdate();
  }, [handleCSVDataUpdate]);

  useEffect(() => {
    initializeDatasetScoreRanges();
  }, [initializeDatasetScoreRanges]);

  return (
    <div style={{ position: 'relative' }}>
      <LayerControls
        controlBarOpen={props.controlBarOpen}
        setControlBarOpen={props.setControlBarOpen}
        showCensusTracts={showCensusTracts}
        setShowCensusTracts={setShowCensusTracts}
        measurementMode={measurement.measurementMode}
        setMeasurementMode={measurement.setMeasurementMode}
        resetMeasurement={measurement.resetMeasurement}
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
        selectedChartTypes={props.selectedChartTypes}
        currentStatsData={props.currentStatsData}
      />

      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["visualization"]}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          options={{ styles: mapStyles }}
          onLoad={handleMapLoad}
          onClick={handleMapClickWrapper}
        >
          {renderMarkerLayers()}
          
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
            measurementMode={measurement.measurementMode}
          />
        </GoogleMap>
      </LoadScript>
      
      <MeasurementDisplay
        measurementMode={measurement.measurementMode}
        measurementPoints={measurement.measurementPoints}
        measurementDistance={measurement.measurementDistance}
        resetMeasurement={measurement.resetMeasurement}
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
        selectedChartTypes={props.selectedChartTypes}
        currentStatsData={props.currentStatsData}
      />
    </div>
  );
}

export default MapContainer; 