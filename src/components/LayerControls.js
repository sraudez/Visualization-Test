// src/components/LayerControls.js
import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { detectCSVFormat } from '../utils';
import { ExportDropdown } from './ExportDropdown';


export function LayerControls({
  controlBarOpen,
  setControlBarOpen,
  showCensusTracts,
  setShowCensusTracts,
  measurementMode,
  setMeasurementMode,
  resetMeasurement,
  mapRef,
  initialCenter,
  initialZoom,
  setZoom,
  resetFilters,
  showChart,
  setShowChart,
  showStats,
  setShowStats,
  csvData,
  csvLoaded,
  scoreRangeYes,
  setScoreRangeYes,
  scoreRangeNo,
  setScoreRangeNo,
  scoreRangeMin,
  setScoreRangeMin,
  scoreRangeMax,
  setScoreRangeMax,
  showHeatmap,
  setShowHeatmap,
  heatmapRadiusLevel,
  setHeatmapRadiusLevel,
  layersDropdownOpen,
  setLayersDropdownOpen,
  scoreRangeDropdownOpen,
  setScoreRangeDropdownOpen,
  controlBarRef,
  selectedDatasets,
  setSelectedDatasets,
  csvFiles,
  datasetData,
  datasetScoreRanges,
  updateDatasetScoreRange,
  getDatasetScoreRange,
  selectedHeatmapDatasets,
  updateHeatmapDatasetSelection,
  getHeatmapDatasets,
  hideMarkersWithHeatmap,
  setHideMarkersWithHeatmap,
  selectedChartTypes,
  currentStatsData
}) {
  const [datasetDropdownOpen, setDatasetDropdownOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.dataset-dropdown') && !e.target.closest('.dataset-btn')) {
        setDatasetDropdownOpen(false);
      }
    }
    
    if (datasetDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [datasetDropdownOpen]);

  // Close layers dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.layers-dropdown') && !e.target.closest('.layers-btn')) {
        setLayersDropdownOpen(false);
      }
    }
    
    if (layersDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [layersDropdownOpen, setLayersDropdownOpen]);

  // Close score range dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.score-range-dropdown') && !e.target.closest('.score-range-btn')) {
        setScoreRangeDropdownOpen(false);
      }
    }
    
    if (scoreRangeDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [scoreRangeDropdownOpen, setScoreRangeDropdownOpen]);

  const handleFocus = () => {
    if (mapRef.current) {
      // Focus on the data points if any are loaded
      if (csvData && csvData.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        
        csvData.forEach(row => {
          // Try different possible column names for coordinates
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
        }
      } else {
        // If no data, just recenter
        mapRef.current.setCenter(initialCenter);
        mapRef.current.setZoom(initialZoom);
      }
    }
  };

  const handleReset = () => {
    resetFilters();
    if (mapRef.current) {
      mapRef.current.setCenter(initialCenter);
      mapRef.current.setZoom(initialZoom);
    }
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setCenter(initialCenter);
      mapRef.current.setZoom(initialZoom);
    }
  };

  const handleMeasurementToggle = () => {
    setMeasurementMode(!measurementMode);
    if (measurementMode) {
      // Reset measurement when turning off
      resetMeasurement();
    }
  };

  const handleCensusTractsToggle = () => {
    setShowCensusTracts(!showCensusTracts);
  };

  const getDatasetDisplayName = (filename) => {
    const name = filename.replace('.csv', '');
    
    // Check if we have data for this specific dataset to determine format
    if (datasetData && datasetData[filename] && datasetData[filename].length > 0) {
      const format = detectCSVFormat(datasetData[filename]);
      if (format) {
        if (format.scoreFormat === 'yes_no') {
          return `${name.charAt(0).toUpperCase() + name.slice(1)} (Yes/No)`;
        } else if (format.scoreFormat === 'numeric_1_10') {
          return `${name.charAt(0).toUpperCase() + name.slice(1)} (1-10)`;
        } else if (format.scoreFormat === 'numeric_other') {
          return `${name.charAt(0).toUpperCase() + name.slice(1)} (Numeric)`;
        } else if (format.scoreFormat === 'categorical') {
          return `${name.charAt(0).toUpperCase() + name.slice(1)} (Categorical)`;
        }
      }
    }
    
    // Fallback: prettify filename without format indicator
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Debug logging
  console.log('LayerControls - csvFiles:', csvFiles);
  console.log('LayerControls - selectedDatasets:', selectedDatasets);

  if (!controlBarOpen) return null;

  return (
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
          onClick={() => setControlBarOpen(false)}
        >
          ✕
        </button>

        {/* Census Tracts Toggle */}
        <button
          style={{ 
            padding: 8, 
            borderRadius: 4, 
            background: showCensusTracts ? '#007bff' : 'white', 
            color: showCensusTracts ? 'white' : 'black',
            border: '1px solid #ccc', 
            cursor: 'pointer', 
            fontWeight: 600,
            transition: 'all 0.2s ease'
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
          onClick={handleCensusTractsToggle}
        >
          {showCensusTracts ? 'Hide Census Tracts' : 'Show Census Tracts'}
        </button>

        {/* Dataset Selector */}
        <div style={{ position: 'relative' }}>
          <button
            className="dataset-btn"
            style={{ 
              padding: 8, 
              borderRadius: 4, 
              background: 'white', 
              border: '1px solid #ccc', 
              cursor: 'pointer', 
              fontWeight: 600,
              transition: 'all 0.2s ease',
              minWidth: 120
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
            onClick={() => setDatasetDropdownOpen(!datasetDropdownOpen)}
          >
            Data
          </button>
          {datasetDropdownOpen && (
            <div className="dataset-dropdown" style={{ 
              position: 'absolute', 
              top: 40, 
              left: 0, 
              background: 'white', 
              border: '1px solid #ccc', 
              borderRadius: 6, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)', 
              padding: 8, 
              minWidth: 150, 
              zIndex: 10 
            }}>
              {csvFiles.length === 0 ? (
                <div style={{ color: 'gray', fontSize: '12px' }}>No CSV files found</div>
              ) : (
                csvFiles.map(filename => (
                  <label key={filename} style={{ display: 'block', marginBottom: 8, color: 'black' }}>
                    <input
                      type="checkbox"
                      checked={selectedDatasets.includes(filename)}
                      onChange={() => {
                        console.log('Checkbox clicked for:', filename);
                        const newSelected = selectedDatasets.includes(filename)
                          ? selectedDatasets.filter(f => f !== filename)
                          : [...selectedDatasets, filename];
                        console.log('New selected datasets:', newSelected);
                        setSelectedDatasets(newSelected);
                      }}
                    />
                    {getDatasetDisplayName(filename)}
                  </label>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Measurement Toggle */}
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
          onClick={handleMeasurementToggle}
        >
          {measurementMode ? 'Exit Measure' : 'Measure'}
        </button>

        {/* Reset Button */}
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
          onClick={handleReset}
        >
          Reset
        </button>

        {/* Recenter Button */}
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
          onClick={handleRecenter}
        >
          Recenter
        </button>

        {/* Focus Button */}
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
          onClick={handleFocus}
        >
          Focus
        </button>

        {/* Stats Toggle */}
        <button
          style={{ 
            padding: 8, 
            borderRadius: 4, 
            background: showStats ? '#27ae60' : 'white', 
            color: showStats ? 'white' : 'black',
            border: '1px solid #ccc', 
            cursor: 'pointer', 
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!showStats) {
              e.target.style.background = '#f0f0f0';
              e.target.style.borderColor = '#999';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            } else {
              e.target.style.background = '#229954';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!showStats) {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#ccc';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            } else {
              e.target.style.background = '#27ae60';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
          onClick={() => {
            setShowStats(v => !v);
            setShowChart(v => !v); // Toggle chart along with stats
          }}
        >
          {showStats ? 'Hide Stats & Graph' : 'Show Stats & Graph'}
        </button>
      </div>
    </Draggable>
  );
}

export function BottomControls({
  showHeatmap,
  setShowHeatmap,
  csvLoaded,
  heatmapRadiusLevel,
  setHeatmapRadiusLevel,
  scoreRangeDropdownOpen,
  setScoreRangeDropdownOpen,
  handleExportCSV,
  resetFilters,
  datasetData,
  selectedDatasets,
  datasetScoreRanges,
  updateDatasetScoreRange,
  getDatasetScoreRange,
  selectedHeatmapDatasets,
  updateHeatmapDatasetSelection,
  getHeatmapDatasets,
  hideMarkersWithHeatmap,
  setHideMarkersWithHeatmap,
  selectedChartTypes,
  updateChartTypeSelection,
  getChartTypes,
  currentStatsData
}) {
  const [heatmapDropdownOpen, setHeatmapDropdownOpen] = useState(false);
  
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.heatmap-dropdown') && !e.target.closest('.heatmap-btn')) {
        setHeatmapDropdownOpen(false);
      }
    }
    
    if (heatmapDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [heatmapDropdownOpen]);
  
  return (
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
        disabled={!csvLoaded}
      >
        {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
      </button>

      <label style={{ display: 'flex', alignItems: 'center', color: 'black', fontSize: 12 }}>
        <input
          type="checkbox"
          checked={hideMarkersWithHeatmap}
          onChange={(e) => setHideMarkersWithHeatmap(e.target.checked)}
          style={{ marginRight: 8 }}
        />
        Hide Markers when Heatmap is Active
      </label>

      {showHeatmap && selectedDatasets.length > 1 && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className="heatmap-btn"
            style={{ 
              padding: 8, 
              borderRadius: 4, 
              background: 'white', 
              border: '1px solid #ccc', 
              cursor: 'pointer', 
              fontWeight: 600, 
              transition: 'all 0.2s ease',
              fontSize: 14
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
            onClick={() => setHeatmapDropdownOpen(!heatmapDropdownOpen)}
          >
            Heatmap Datasets ({selectedHeatmapDatasets.length}/{selectedDatasets.length})
          </button>
          {heatmapDropdownOpen && (
            <div className="heatmap-dropdown" style={{ 
              position: 'absolute',
              top: 40, 
              left: 0,
              background: 'white', 
              border: '1px solid #ccc', 
              borderRadius: 6, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)', 
              padding: 12, 
              minWidth: 200, 
              zIndex: 10 
            }}>
              <div style={{ marginBottom: 8, fontSize: 12, color: '#333', fontWeight: 600 }}>
                Select Datasets for Heatmap
              </div>
              {selectedDatasets.map(dataset => (
                <label key={dataset} style={{ display: 'block', marginBottom: 6, color: 'black', fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={selectedHeatmapDatasets.includes(dataset)}
                    onChange={(e) => updateHeatmapDatasetSelection(dataset, e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  {dataset.replace('.csv', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

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
          disabled={false}
        >
          Score Range ({selectedDatasets.length} datasets)
        </button>
        {scoreRangeDropdownOpen && (
          <div className="score-range-dropdown" style={{ 
            position: 'absolute', 
            top: 40, 
            left: 0, 
            background: 'white', 
            border: '1px solid #ccc', 
            borderRadius: 6, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)', 
            padding: 16, 
            minWidth: 300, 
            maxWidth: 400,
            maxHeight: 500,
            overflowY: 'auto',
            zIndex: 10 
          }}>
            <div style={{ marginBottom: 12, fontSize: 14, color: '#333', fontWeight: 600 }}>
              Dataset Score Ranges
            </div>
            
            {selectedDatasets.length === 0 ? (
              <div style={{ color: 'gray', fontSize: '12px' }}>No datasets selected</div>
            ) : (
              selectedDatasets.map(dataset => {
                const datasetRows = datasetData[dataset];
                const format = datasetRows && datasetRows.length > 0 ? detectCSVFormat(datasetRows) : null;
                const scoreRange = getDatasetScoreRange(dataset);
                
                return (
                  <div key={dataset} style={{ 
                    marginBottom: 16, 
                    padding: 12, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 4,
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div style={{ 
                      marginBottom: 8, 
                      fontSize: 13, 
                      fontWeight: 600, 
                      color: '#333',
                      borderBottom: '1px solid #ddd',
                      paddingBottom: 4
                    }}>
                      {dataset.replace('.csv', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      {format && (
                        <span style={{ 
                          marginLeft: 8, 
                          fontSize: 11, 
                          color: '#666', 
                          fontWeight: 'normal' 
                        }}>
                          ({format.scoreFormat})
                        </span>
                      )}
                    </div>
                    
                    {format && format.scoreFormat === 'yes_no' ? (
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ display: 'inline-block', marginRight: 12, color: 'black', fontSize: 12 }}>
                          <input 
                            type="checkbox" 
                            checked={scoreRange.yes} 
                            onChange={e => updateDatasetScoreRange(dataset, 'yes', e.target.checked)}
                            style={{ marginRight: 4 }}
                          /> Yes
                        </label>
                        <label style={{ display: 'inline-block', color: 'black', fontSize: 12 }}>
                          <input 
                            type="checkbox" 
                            checked={scoreRange.no} 
                            onChange={e => updateDatasetScoreRange(dataset, 'no', e.target.checked)}
                            style={{ marginRight: 4 }}
                          /> No
                        </label>
                      </div>
                    ) : format && format.scoreFormat === 'numeric_1_10' ? (
                      <div style={{ fontSize: 12, color: 'black' }}>
                        <label style={{ display: 'inline-block', marginRight: 8 }}>
                          Min:
                          <input
                            type="number"
                            min={1}
                            max={scoreRange.max}
                            value={scoreRange.min}
                            onChange={e => updateDatasetScoreRange(dataset, 'min', Number(e.target.value))}
                            style={{ width: 40, marginLeft: 4, fontSize: 11 }}
                          />
                        </label>
                        <label style={{ display: 'inline-block' }}>
                          Max:
                          <input
                            type="number"
                            min={scoreRange.min}
                            max={10}
                            value={scoreRange.max}
                            onChange={e => updateDatasetScoreRange(dataset, 'max', Number(e.target.value))}
                            style={{ width: 40, marginLeft: 4, fontSize: 11 }}
                          />
                        </label>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: 8 }}>
                          <label style={{ display: 'inline-block', marginRight: 12, color: 'black', fontSize: 12 }}>
                            <input 
                              type="checkbox" 
                              checked={scoreRange.yes} 
                              onChange={e => updateDatasetScoreRange(dataset, 'yes', e.target.checked)}
                              style={{ marginRight: 4 }}
                            /> Yes
                          </label>
                          <label style={{ display: 'inline-block', color: 'black', fontSize: 12 }}>
                            <input 
                              type="checkbox" 
                              checked={scoreRange.no} 
                              onChange={e => updateDatasetScoreRange(dataset, 'no', e.target.checked)}
                              style={{ marginRight: 4 }}
                            /> No
                          </label>
                        </div>
                        
                        <div style={{ fontSize: 12, color: 'black' }}>
                          <label style={{ display: 'inline-block', marginRight: 8 }}>
                            Min:
                            <input
                              type="number"
                              min={1}
                              max={scoreRange.max}
                              value={scoreRange.min}
                              onChange={e => updateDatasetScoreRange(dataset, 'min', Number(e.target.value))}
                              style={{ width: 40, marginLeft: 4, fontSize: 11 }}
                            />
                          </label>
                          <label style={{ display: 'inline-block' }}>
                            Max:
                            <input
                              type="number"
                              min={scoreRange.min}
                              max={10}
                              value={scoreRange.max}
                              onChange={e => updateDatasetScoreRange(dataset, 'max', Number(e.target.value))}
                              style={{ width: 40, marginLeft: 4, fontSize: 11 }}
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
            
            <div style={{ marginTop: 12, fontSize: 10, color: '#999', borderTop: '1px solid #ddd', paddingTop: 8 }}>
              Debug: {selectedDatasets.length} datasets selected
            </div>
          </div>
        )}
      </div>

      <ExportDropdown
        selectedDatasets={selectedDatasets}
        datasetData={datasetData}
        datasetScoreRanges={datasetScoreRanges}
        selectedChartTypes={selectedChartTypes}
        currentStatsData={currentStatsData}
      />



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
  );
}

 