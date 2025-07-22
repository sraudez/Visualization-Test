import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { getDatasetChartData } from '../utils/chartDataUtils';

/**
 * Chart colors for consistent styling
 */
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

/**
 * Chart type configurations
 */
const CHART_TYPES = {
  pie: { label: 'Pie Chart (Yes/No)', component: 'PieChartComponent' },
  bar: { label: 'Bar Chart (1-10)', component: 'BarChartComponent' },
  line: { label: 'Line Chart (1-10)', component: 'LineChartComponent' },
  scatter: { label: 'Scatter Plot (1-10)', component: 'ScatterChartComponent' }
};

/**
 * Styles for the charts section
 */
const styles = {
  container: {
    marginBottom: 30
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  title: {
    color: '#555',
    margin: 0
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
  dropdownContainer: {
    position: 'relative'
  },
  dropdownButton: {
    padding: 8,
    borderRadius: 4,
    background: 'white',
    border: '1px solid #ccc',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    minWidth: 120
  },
  dropdown: {
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
  },
  checkboxLabel: {
    display: 'block',
    marginBottom: 8,
    color: 'black'
  },
  noDataContainer: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px dashed #ccc'
  },
  chartsContainer: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'flex-start'
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  },
  chartTitle: {
    color: '#555',
    marginBottom: '8px',
    fontSize: '16px'
  },
  filterStatus: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '12px',
    padding: '4px 8px',
    backgroundColor: '#fff3cd',
    borderRadius: '4px',
    border: '1px solid #ffeaa7'
  },
  noDataMessage: {
    textAlign: 'center',
    padding: '40px',
    color: '#999'
  }
};

/**
 * Hook for handling dropdown outside clicks
 */
function useDropdownOutsideClick(isOpen, setIsOpen, dropdownClass, buttonClass) {
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest(dropdownClass) && !e.target.closest(buttonClass)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, setIsOpen, dropdownClass, buttonClass]);
}

/**
 * Main charts section component
 */
export function ChartsSection({ 
  currentStatsData, 
  selectedChartTypes, 
  setSelectedChartTypes, 
  selectedDatasets, 
  datasetData, 
  datasetScoreRanges, 
  selectedStatsDataset 
}) {
  const [chartTypesDropdownOpen, setChartTypesDropdownOpen] = useState(false);

  useDropdownOutsideClick(chartTypesDropdownOpen, setChartTypesDropdownOpen, '.chart-types-dropdown', '.chart-types-btn');

  /**
   * Handles chart type selection toggle
   */
  const handleChartTypeToggle = (chartType) => {
    const newSelected = selectedChartTypes.includes(chartType)
      ? selectedChartTypes.filter(type => type !== chartType)
      : [...selectedChartTypes, chartType];
    setSelectedChartTypes(newSelected);
  };

  /**
   * Formats dataset filename for display
   */
  const formatDatasetName = (filename) => {
    if (!filename) return 'Unknown Dataset';
    return filename.replace('.csv', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  /**
   * Gets filter status description for a dataset
   */
  const getFilterStatus = (datasetName) => {
    const range = datasetScoreRanges[datasetName];
    if (!range) return null;
    
    const filters = [];
    if (!range.yes) filters.push('No "Yes"');
    if (!range.no) filters.push('No "No"');
    if (range.min > 1) filters.push(`Min: ${range.min}`);
    if (range.max < 10) filters.push(`Max: ${range.max}`);
    
    return filters.length > 0 ? filters.join(', ') : null;
  };

  /**
   * Calculates chart layout based on number of selected charts
   */
  const getChartLayout = () => {
    const chartCount = selectedChartTypes.length;
    
    if (chartCount === 1) {
      return { flex: 1, minWidth: '400px', maxWidth: '600px' };
    } else if (chartCount === 2) {
      return { flex: '1 1 45%', minWidth: '350px' };
    } else if (chartCount === 3) {
      return { flex: '1 1 30%', minWidth: '300px' };
    } else if (chartCount === 4) {
      return { flex: '1 1 22%', minWidth: '250px' };
    } else {
      return { flex: '1 1 20%', minWidth: '200px' };
    }
  };

  /**
   * Renders chart types dropdown
   */
  const renderChartTypesDropdown = () => (
    <div style={styles.dropdownContainer}>
      <button
        className="chart-types-btn"
        style={styles.dropdownButton}
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
        onClick={() => setChartTypesDropdownOpen(!chartTypesDropdownOpen)}
      >
        Charts ({selectedChartTypes.length})
      </button>
      {chartTypesDropdownOpen && (
        <div className="chart-types-dropdown" style={styles.dropdown}>
          {Object.entries(CHART_TYPES).map(([type, config]) => (
            <label key={type} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedChartTypes.includes(type)}
                onChange={() => handleChartTypeToggle(type)}
              />
              {config.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );

  /**
   * Renders no data message
   */
  const renderNoDataMessage = (message) => (
    <div style={styles.noDataContainer}>
      <p>{message}</p>
    </div>
  );

  /**
   * Renders chart components
   */
  const renderCharts = () => {
    const currentDataset = selectedStatsDataset || (selectedDatasets.length > 0 ? selectedDatasets[0] : null);
    const filterStatus = currentDataset ? getFilterStatus(currentDataset) : null;
    const chartLayout = getChartLayout();

    if (!currentDataset) {
      return renderNoDataMessage('No dataset selected. Choose a dataset from the "Dataset:" dropdown above.');
    }

    if (selectedChartTypes.length === 0) {
      return renderNoDataMessage('No charts selected. Choose chart types from the dropdown above.');
    }

    return (
      <div style={{
        ...styles.chartsContainer,
        justifyContent: selectedChartTypes.length <= 2 ? 'flex-start' : 'space-between'
      }}>
        {selectedChartTypes.map(chartType => (
          <ChartContainer 
            key={chartType}
            title={`${formatDatasetName(currentDataset)} - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
            dataChartType={chartType}
            filterStatus={filterStatus}
            style={{ ...styles.chartContainer, ...chartLayout }}
          >
            {chartType === 'pie' && (
              <PieChartComponent 
                data={datasetData[currentDataset]} 
                datasetName={currentDataset} 
                datasetScoreRanges={datasetScoreRanges} 
                datasetData={datasetData} 
              />
            )}
            {chartType === 'bar' && (
              <BarChartComponent 
                data={datasetData[currentDataset]} 
                datasetName={currentDataset} 
                datasetScoreRanges={datasetScoreRanges} 
                datasetData={datasetData} 
              />
            )}
            {chartType === 'line' && (
              <LineChartComponent 
                data={datasetData[currentDataset]} 
                datasetName={currentDataset} 
                datasetScoreRanges={datasetScoreRanges} 
                datasetData={datasetData} 
              />
            )}
            {chartType === 'scatter' && (
              <ScatterChartComponent 
                data={datasetData[currentDataset]} 
                datasetName={currentDataset} 
                datasetScoreRanges={datasetScoreRanges} 
                datasetData={datasetData} 
              />
            )}
          </ChartContainer>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Charts</h3>
        <div style={styles.controls}>
          <label style={styles.label}>Chart Types:</label>
          {renderChartTypesDropdown()}
        </div>
      </div>
      {renderCharts()}
    </div>
  );
}

/**
 * Container component for individual charts
 */
function ChartContainer({ title, children, dataChartType, filterStatus, style }) {
  return (
    <div style={style} data-chart-type={dataChartType}>
      <h4 style={styles.chartTitle}>{title}</h4>
      {filterStatus && (
        <div style={styles.filterStatus}>
          Filters: {filterStatus}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Pie chart component for yes/no data
 */
function PieChartComponent({ data, datasetName, datasetScoreRanges, datasetData }) {
  const pieData = getDatasetChartData(datasetData, datasetName, 'pie', datasetScoreRanges);
  
  if (pieData.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <PieChart width={280} height={200}>
      <Pie
        data={pieData}
        cx={140}
        cy={100}
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={70}
        fill="#8884d8"
        dataKey="value"
      >
        {pieData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}

/**
 * Bar chart component for numeric data
 */
function BarChartComponent({ data, datasetName, datasetScoreRanges, datasetData }) {
  const barData = getDatasetChartData(datasetData, datasetName, 'bar', datasetScoreRanges);
  
  if (barData.length === 0) {
    return <NoDataMessage />;
  }

  const dataKey = barData[0]?.category !== undefined ? 'category' : 'score';
  const valueKey = barData[0]?.count !== undefined ? 'count' : 'count';

  return (
    <BarChart width={280} height={200} data={barData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={dataKey} />
      <YAxis />
      <Tooltip />
      <Bar dataKey={valueKey} fill="#8884d8" />
    </BarChart>
  );
}

/**
 * Line chart component for numeric data
 */
function LineChartComponent({ data, datasetName, datasetScoreRanges, datasetData }) {
  const lineData = getDatasetChartData(datasetData, datasetName, 'line', datasetScoreRanges);
  
  if (lineData.length === 0) {
    return <NoDataMessage />;
  }

  const dataKey = lineData[0]?.category !== undefined ? 'category' : 'score';
  const valueKey = lineData[0]?.count !== undefined ? 'count' : 'count';

  return (
    <LineChart width={280} height={200} data={lineData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={dataKey} />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey={valueKey} stroke="#8884d8" strokeWidth={2} />
    </LineChart>
  );
}

/**
 * Scatter plot component for numeric data
 */
function ScatterChartComponent({ data, datasetName, datasetScoreRanges, datasetData }) {
  const scatterData = getDatasetChartData(datasetData, datasetName, 'scatter', datasetScoreRanges);
  
  if (scatterData.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <ScatterChart width={280} height={200} data={scatterData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="x" name="Index" />
      <YAxis dataKey="y" name="Score" />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
      <Scatter dataKey="y" fill="#8884d8" />
    </ScatterChart>
  );
}

/**
 * No data message component
 */
function NoDataMessage() {
  return (
    <div style={styles.noDataMessage}>
      No data available
    </div>
  );
} 