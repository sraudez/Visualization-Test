import React, { useState, useRef } from 'react';
import { filterDataByScoreRanges } from '../utils/chartDataUtils';
import { createCSVContent, downloadCSV } from '../utils/csvExportUtils';
import html2canvas from 'html2canvas';

/**
 * Styles for the export dropdown component
 */
const styles = {
  container: {
    position: 'relative',
    display: 'inline-block'
  },
  button: {
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
  },
  dropdown: {
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
  },
  section: {
    marginBottom: '16px'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#333',
    fontSize: '16px'
  },
  sectionDescription: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  noDataMessage: {
    color: '#999',
    fontStyle: 'italic',
    padding: '12px'
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee'
  },
  itemInfo: {
    flex: 1
  },
  itemTitle: {
    fontWeight: '500',
    color: '#333'
  },
  filterStatus: {
    fontSize: '12px',
    color: '#666',
    marginTop: '2px'
  },
  exportButton: (isExporting, color = '#28a745') => ({
    padding: '6px 12px',
    backgroundColor: isExporting ? '#ccc' : color,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: isExporting ? 'not-allowed' : 'pointer',
    fontSize: '12px',
    minWidth: '80px'
  }),
  exportAllButton: (isExporting) => ({
    width: '100%',
    padding: '10px',
    backgroundColor: isExporting ? '#ccc' : '#6f42c1',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: isExporting ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }),
  closeButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '12px'
  }
};

/**
 * Chart type labels for display
 */
const CHART_LABELS = {
  pie: 'Pie Chart',
  bar: 'Bar Chart', 
  line: 'Line Chart',
  scatter: 'Scatter Plot'
};

/**
 * Export dropdown component for downloading filtered data and chart images
 */
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

  /**
   * Exports filtered CSV data for a specific dataset
   */
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

  /**
   * Exports a single chart as PNG image
   */
  const handleExportChartImage = async (chartType) => {
    setExporting(prev => ({ ...prev, [`chart-${chartType}`]: true }));
    
    try {
      const chartElement = document.querySelector(`[data-chart-type="${chartType}"]`);
      if (!chartElement) {
        console.warn(`Chart element for type ${chartType} not found`);
        return;
      }

      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
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

  /**
   * Exports all selected charts as PNG images
   */
  const handleExportAllCharts = async () => {
    setExporting(prev => ({ ...prev, allCharts: true }));
    
    try {
      for (const chartType of safeSelectedChartTypes) {
        await handleExportChartImage(chartType);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error exporting all charts:', error);
    } finally {
      setExporting(prev => ({ ...prev, allCharts: false }));
    }
  };

  /**
   * Formats dataset filename for display
   */
  const formatDatasetName = (filename) => {
    return filename.replace('.csv', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  /**
   * Gets filter status description for a dataset
   */
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

  /**
   * Renders CSV export section
   */
  const renderCSVExportSection = () => {
    if (safeSelectedDatasets.length === 0) {
      return <div style={styles.noDataMessage}>No datasets selected</div>;
    }

    return (
      <div style={styles.section}>
        {safeSelectedDatasets.map(datasetName => {
          const filterStatus = getFilterStatus(datasetName);
          const isExporting = exporting[`csv-${datasetName}`];
          
          return (
            <div key={datasetName} style={styles.itemContainer}>
              <div style={styles.itemInfo}>
                <div style={styles.itemTitle}>
                  {formatDatasetName(datasetName)}
                </div>
                {filterStatus && (
                  <div style={styles.filterStatus}>
                    Filters: {filterStatus}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleExportCSV(datasetName)}
                disabled={isExporting}
                style={styles.exportButton(isExporting)}
              >
                {isExporting ? '⏳' : '📥 CSV'}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Renders chart export section
   */
  const renderChartExportSection = () => {
    if (safeSelectedChartTypes.length === 0) return null;

    return (
      <>
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Export Charts</h4>
          <p style={styles.sectionDescription}>
            Download chart images as PNG files
          </p>
        </div>

        <div style={styles.section}>
          {safeSelectedChartTypes.map(chartType => {
            const isExporting = exporting[`chart-${chartType}`];
            
            return (
              <div key={chartType} style={styles.itemContainer}>
                <div style={styles.itemTitle}>
                  {CHART_LABELS[chartType]}
                </div>
                <button
                  onClick={() => handleExportChartImage(chartType)}
                  disabled={isExporting}
                  style={styles.exportButton(isExporting, '#17a2b8')}
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
          style={styles.exportAllButton(exporting.allCharts)}
        >
          {exporting.allCharts ? '⏳ Exporting All Charts...' : '📊 Export All Charts'}
        </button>
      </>
    );
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.button}
      >
        📊 Export Data
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Export Filtered Data</h4>
            <p style={styles.sectionDescription}>
              Download filtered CSV data for each selected dataset
            </p>
          </div>

          {renderCSVExportSection()}
          {renderChartExportSection()}

          <button
            onClick={() => setIsOpen(false)}
            style={styles.closeButton}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
} 