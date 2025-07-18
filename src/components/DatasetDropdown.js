import React from 'react';
import { detectCSVFormat } from '../utils';

export function DatasetDropdown({
  datasetDropdownOpen,
  setDatasetDropdownOpen,
  selectedDatasets,
  setSelectedDatasets,
  csvFiles,
  datasetData
}) {
  const handleDatasetToggle = (dataset) => {
    if (selectedDatasets.includes(dataset)) {
      setSelectedDatasets(selectedDatasets.filter(d => d !== dataset));
    } else {
      setSelectedDatasets([...selectedDatasets, dataset]);
    }
  };

  const getDatasetDisplayName = (filename) => {
    const name = filename.replace('.csv', '');
    
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
    
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="dataset-dropdown" style={{ position: 'relative' }}>
      <button
        className="dataset-btn"
        onClick={() => setDatasetDropdownOpen(!datasetDropdownOpen)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>📊</span>
        Datasets ({selectedDatasets.length})
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>
      
      {datasetDropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: '200px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {csvFiles.map(filename => (
            <div
              key={filename}
              onClick={() => handleDatasetToggle(filename)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: selectedDatasets.includes(filename) ? '#e3f2fd' : 'transparent',
                borderBottom: '1px solid #eee',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = selectedDatasets.includes(filename) ? '#e3f2fd' : '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = selectedDatasets.includes(filename) ? '#e3f2fd' : 'transparent';
              }}
            >
              <input
                type="checkbox"
                checked={selectedDatasets.includes(filename)}
                readOnly
                style={{ margin: 0 }}
              />
              {getDatasetDisplayName(filename)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 