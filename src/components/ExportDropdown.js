import React, { useState, useRef } from 'react';
import { filterDataByScoreRanges } from '../utils/chartDataUtils';
import { createCSVContent, downloadCSV } from '../utils/csvExportUtils';
import html2canvas from 'html2canvas';

export function ExportDropdown({ 
  selectedDatasets = [], 
  datasetData = {}, 
  datasetScoreRanges = {}, 
  selectedChartTypes = [],
  currentStatsData = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState({});
  const dropdownRef = useRef(null);

  // Ensure props are arrays/objects to prevent length errors
  const safeSelectedDatasets = Array.isArray(selectedDatasets) ? selectedDatasets : [];
  const safeDatasetData = datasetData || {};
  const safeDatasetScoreRanges = datasetScoreRanges || {};
  const safeSelectedChartTypes = Array.isArray(selectedChartTypes) ? selectedChartTypes : [];

  const handleExportCSV = async (datasetName) => {
    setExporting(prev => ({ ...prev, [`csv-${datasetName}`]: true }));
    
    try {
      const data = safeDatasetData[datasetName];
      if (!data || data.length === 0) return;

      const filteredData = filterDataByScoreRanges(data, safeDatasetScoreRanges, datasetName);
      if (filteredData.length === 0) return;

      const csvString = createCSVContent(filteredData);
      const filename = datasetName.replace('.csv', '');
      downloadCSV(csvString, `${filename}-filtered`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExporting(prev => ({ ...prev, [`csv-${datasetName}`]: false }));
    }
  };

  const handleExportChartImage = async (chartType) => {
    setExporting(prev => ({ ...prev, [`chart-${chartType}`]: true }));
    
    try {
      // Find the chart element by type
      const chartElement = document.querySelector(`[data-chart-type="${chartType}"]`);
      if (!chartElement) {
        console.warn(`Chart element for type ${chartType} not found`);
        return;
      }

      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `${chartType}-chart-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error exporting chart image:', error);
    } finally {
      setExporting(prev => ({ ...prev, [`chart-${chartType}`]: false }));
    }
  };

  const handleExportAllCharts = async () => {
    setExporting(prev => ({ ...prev, allCharts: true }));
    
    try {
      for (const chartType of safeSelectedChartTypes) {
        await handleExportChartImage(chartType);
        // Small delay between exports
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error exporting all charts:', error);
    } finally {
      setExporting(prev => ({ ...prev, allCharts: false }));
    }
  };

  const formatDatasetName = (filename) => {
    return filename.replace('.csv', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getFilterStatus = (datasetName) => {
    const range = safeDatasetScoreRanges[datasetName];
    if (!range) return null;
    
    const filters = [];
    if (!range.yes) filters.push('No "Yes"');
    if (!range.no) filters.push('No "No"');
    if (range.min > 1) filters.push(`Min: ${range.min}`);
    if (range.max < 10) filters.push(`Max: ${range.max}`);
    
    return filters.length > 0 ? filters.join(', ') : null;
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        📊 Export Data
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '300px',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>
              Export Filtered Data
            </h4>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Download filtered CSV data for each selected dataset
            </p>
          </div>

          {safeSelectedDatasets.length === 0 ? (
            <div style={{ color: '#999', fontStyle: 'italic', padding: '12px' }}>
              No datasets selected
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              {safeSelectedDatasets.map(datasetName => {
                const filterStatus = getFilterStatus(datasetName);
                const isExporting = exporting[`csv-${datasetName}`];
                
                return (
                  <div key={datasetName} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #eee'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#333' }}>
                        {formatDatasetName(datasetName)}
                      </div>
                      {filterStatus && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                          Filters: {filterStatus}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleExportCSV(datasetName)}
                      disabled={isExporting}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: isExporting ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        minWidth: '80px'
                      }}
                    >
                      {isExporting ? '⏳' : '📥 CSV'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {safeSelectedChartTypes.length > 0 && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>
                  Export Charts
                </h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Download chart images as PNG files
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                {safeSelectedChartTypes.map(chartType => {
                  const isExporting = exporting[`chart-${chartType}`];
                  const chartLabels = {
                    pie: 'Pie Chart',
                    bar: 'Bar Chart', 
                    line: 'Line Chart',
                    scatter: 'Scatter Plot'
                  };
                  
                  return (
                    <div key={chartType} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid #eee'
                    }}>
                      <div style={{ fontWeight: '500', color: '#333' }}>
                        {chartLabels[chartType]}
                      </div>
                      <button
                        onClick={() => handleExportChartImage(chartType)}
                        disabled={isExporting}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: isExporting ? '#ccc' : '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: isExporting ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          minWidth: '80px'
                        }}
                      >
                        {isExporting ? '⏳' : '📷 PNG'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleExportAllCharts}
                disabled={exporting.allCharts}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: exporting.allCharts ? '#ccc' : '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: exporting.allCharts ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {exporting.allCharts ? '⏳ Exporting All Charts...' : '📊 Export All Charts'}
              </button>
            </>
          )}

          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '12px'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
} 