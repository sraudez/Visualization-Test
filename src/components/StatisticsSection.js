import React from 'react';
import { getChartData, getNumericDataForStats } from '../utils/chartDataUtils';

export function StatisticsSection({ currentStatsData, selectedStatsDataset, setSelectedStatsDataset, csvFiles, datasetScoreRanges, datasetData }) {
  const chartData = getChartData(currentStatsData);
  const numericData = getNumericDataForStats(currentStatsData);

  const formatDatasetName = (filename) => {
    return filename.replace('.csv', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const calculateAverageScore = () => {
    if (numericData.length === 0) return 'N/A';
    const totalSum = numericData.reduce((sum, item) => sum + (item.score * item.count), 0);
    const totalCount = numericData.reduce((sum, item) => sum + item.count, 0);
    return (totalSum / totalCount).toFixed(2);
  };

  const getHighestScore = () => {
    return numericData.length > 0 ? Math.max(...numericData.map(item => item.score)) : 'N/A';
  };

  const getLowestScore = () => {
    return numericData.length > 0 ? Math.min(...numericData.map(item => item.score)) : 'N/A';
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    if (!datasetScoreRanges || Object.keys(datasetScoreRanges).length === 0) return false;
    
    if (selectedStatsDataset) {
      // Single dataset selected
      const range = datasetScoreRanges[selectedStatsDataset];
      if (!range) return false;
      return !range.yes || !range.no || range.min > 1 || range.max < 10;
    } else {
      // All datasets - check if any dataset has filters
      return Object.values(datasetScoreRanges).some(range => {
        return !range.yes || !range.no || range.min > 1 || range.max < 10;
      });
    }
  };

  const getFilterStatus = () => {
    if (selectedStatsDataset && datasetScoreRanges[selectedStatsDataset]) {
      // Single dataset selected
      const range = datasetScoreRanges[selectedStatsDataset];
      const filters = [];
      
      if (!range.yes) filters.push('No "Yes" values');
      if (!range.no) filters.push('No "No" values');
      if (range.min > 1) filters.push(`Min: ${range.min}`);
      if (range.max < 10) filters.push(`Max: ${range.max}`);
      
      return filters.length > 0 ? filters.join(', ') : null;
    } else {
      // All datasets - show general filter status
      const activeDatasets = Object.entries(datasetScoreRanges).filter(([dataset, range]) => {
        return !range.yes || !range.no || range.min > 1 || range.max < 10;
      });
      
      if (activeDatasets.length > 0) {
        return `${activeDatasets.length} dataset(s) have active filters`;
      }
      return null;
    }
  };

  return (
    <div style={{ marginTop: 20, padding: 20, backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ color: '#333', margin: 0 }}>Data Visualization & Statistics</h2>
          {hasActiveFilters() && (
            <span style={{ 
              backgroundColor: '#ffc107', 
              color: '#333', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '12px', 
              fontWeight: 'bold' 
            }}>
              🔍 Filtered
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ color: '#555', fontWeight: 600, fontSize: '14px' }}>Dataset:</label>
          <select
            value={selectedStatsDataset}
            onChange={(e) => setSelectedStatsDataset(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="">All Datasets</option>
            {csvFiles.map(filename => (
              <option key={filename} value={filename}>
                {formatDatasetName(filename)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters() && getFilterStatus() && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '4px', 
          padding: '8px 12px', 
          marginBottom: '15px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>Active Filters:</strong> {getFilterStatus()}
        </div>
      )}

      <div>
        <h3 style={{ color: '#555', marginBottom: 15 }}>Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <StatCard title="Total Points" value={currentStatsData.length} color="#007bff" />
          <StatCard title="Yes Responses" value={chartData.find(item => item.name === 'Yes')?.value || 0} color="#28a745" />
          <StatCard title="No Responses" value={chartData.find(item => item.name === 'No')?.value || 0} color="#dc3545" />
          <StatCard title="Numeric Scores" value={numericData.reduce((sum, item) => sum + item.count, 0)} color="#17a2b8" />
          <StatCard title="Average Score" value={calculateAverageScore()} color="#17a2b8" />
          <StatCard title="Highest Score" value={getHighestScore()} color="#ffc107" />
          <StatCard title="Lowest Score" value={getLowestScore()} color="#ffc107" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h4 style={{ color: '#555', margin: '0 0 10px 0' }}>{title}</h4>
      <p style={{ fontSize: '24px', fontWeight: 'bold', color, margin: 0 }}>{value}</p>
    </div>
  );
} 