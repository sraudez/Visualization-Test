import React from 'react';
import { getChartData, getNumericDataForStats } from '../utils/chartDataUtils';

/**
 * Styles for the statistics section
 */
const styles = {
  container: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: '10px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  title: {
    color: '#333',
    margin: 0
  },
  filterBadge: {
    backgroundColor: '#ffc107',
    color: '#333',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  label: {
    color: '#555',
    fontWeight: 600,
    fontSize: '14px'
  },
  select: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: 'white',
    fontSize: '14px',
    minWidth: '150px'
  },
  filterWarning: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '4px',
    padding: '8px 12px',
    marginBottom: '15px',
    fontSize: '14px',
    color: '#856404'
  },
  statsSection: {
    marginTop: 20
  },
  statsTitle: {
    color: '#555',
    marginBottom: 15
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20
  },
  statCard: {
    textAlign: 'center',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '8px'
  },
  statTitle: {
    color: '#555',
    margin: '0 0 10px 0'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0
  }
};

/**
 * Statistics section component for displaying data insights
 */
export function StatisticsSection({ 
  currentStatsData, 
  selectedStatsDataset, 
  setSelectedStatsDataset, 
  csvFiles, 
  datasetScoreRanges, 
  datasetData 
}) {
  const chartData = getChartData(currentStatsData);
  const numericData = getNumericDataForStats(currentStatsData);

  /**
   * Formats dataset filename for display
   */
  const formatDatasetName = (filename) => {
    return filename.replace('.csv', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  /**
   * Calculates average score from numeric data
   */
  const calculateAverageScore = () => {
    if (numericData.length === 0) return 'N/A';
    const totalSum = numericData.reduce((sum, item) => sum + (item.score * item.count), 0);
    const totalCount = numericData.reduce((sum, item) => sum + item.count, 0);
    return (totalSum / totalCount).toFixed(2);
  };

  /**
   * Gets the highest score from numeric data
   */
  const getHighestScore = () => {
    return numericData.length > 0 ? Math.max(...numericData.map(item => item.score)) : 'N/A';
  };

  /**
   * Gets the lowest score from numeric data
   */
  const getLowestScore = () => {
    return numericData.length > 0 ? Math.min(...numericData.map(item => item.score)) : 'N/A';
  };

  /**
   * Checks if any filters are currently active
   */
  const hasActiveFilters = () => {
    if (!datasetScoreRanges || Object.keys(datasetScoreRanges).length === 0) return false;
    
    if (selectedStatsDataset) {
      const range = datasetScoreRanges[selectedStatsDataset];
      if (!range) return false;
      return !range.yes || !range.no || range.min > 1 || range.max < 10;
    } else {
      return Object.values(datasetScoreRanges).some(range => {
        return !range.yes || !range.no || range.min > 1 || range.max < 10;
      });
    }
  };

  /**
   * Gets filter status description
   */
  const getFilterStatus = () => {
    if (selectedStatsDataset && datasetScoreRanges[selectedStatsDataset]) {
      const range = datasetScoreRanges[selectedStatsDataset];
      const filters = [];
      
      if (!range.yes) filters.push('No "Yes" values');
      if (!range.no) filters.push('No "No" values');
      if (range.min > 1) filters.push(`Min: ${range.min}`);
      if (range.max < 10) filters.push(`Max: ${range.max}`);
      
      return filters.length > 0 ? filters.join(', ') : null;
    } else {
      const activeDatasets = Object.entries(datasetScoreRanges).filter(([dataset, range]) => {
        return !range.yes || !range.no || range.min > 1 || range.max < 10;
      });
      
      if (activeDatasets.length > 0) {
        return `${activeDatasets.length} dataset(s) have active filters`;
      }
      return null;
    }
  };

  /**
   * Renders the dataset selector
   */
  const renderDatasetSelector = () => (
    <div style={styles.controls}>
      <label style={styles.label}>Dataset:</label>
      <select
        value={selectedStatsDataset}
        onChange={(e) => setSelectedStatsDataset(e.target.value)}
        style={styles.select}
      >
        <option value="">All Datasets</option>
        {csvFiles.map(filename => (
          <option key={filename} value={filename}>
            {formatDatasetName(filename)}
          </option>
        ))}
      </select>
    </div>
  );

  /**
   * Renders the filter warning message
   */
  const renderFilterWarning = () => {
    if (!hasActiveFilters() || !getFilterStatus()) return null;

    return (
      <div style={styles.filterWarning}>
        <strong>Active Filters:</strong> {getFilterStatus()}
      </div>
    );
  };

  /**
   * Renders the statistics cards
   */
  const renderStatisticsCards = () => (
    <div style={styles.statsSection}>
      <h3 style={styles.statsTitle}>Statistics</h3>
      <div style={styles.statsGrid}>
        <StatCard title="Total Points" value={currentStatsData.length} color="#007bff" />
        <StatCard title="Yes Responses" value={chartData.find(item => item.name === 'Yes')?.value || 0} color="#28a745" />
        <StatCard title="No Responses" value={chartData.find(item => item.name === 'No')?.value || 0} color="#dc3545" />
        <StatCard title="Numeric Scores" value={numericData.reduce((sum, item) => sum + item.count, 0)} color="#17a2b8" />
        <StatCard title="Average Score" value={calculateAverageScore()} color="#17a2b8" />
        <StatCard title="Highest Score" value={getHighestScore()} color="#ffc107" />
        <StatCard title="Lowest Score" value={getLowestScore()} color="#ffc107" />
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h2 style={styles.title}>Data Visualization & Statistics</h2>
          {hasActiveFilters() && (
            <span style={styles.filterBadge}>
              🔍 Filtered
            </span>
          )}
        </div>
        {renderDatasetSelector()}
      </div>

      {renderFilterWarning()}
      {renderStatisticsCards()}
    </div>
  );
}

/**
 * Individual statistics card component
 */
function StatCard({ title, value, color }) {
  return (
    <div style={styles.statCard}>
      <h4 style={styles.statTitle}>{title}</h4>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  );
} 