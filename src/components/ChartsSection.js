import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { getDatasetChartData } from '../utils/chartDataUtils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ChartsSection({ currentStatsData, selectedChartTypes, setSelectedChartTypes, selectedDatasets, datasetData, datasetScoreRanges, selectedStatsDataset }) {
  const [chartTypesDropdownOpen, setChartTypesDropdownOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.chart-types-dropdown') && !e.target.closest('.chart-types-btn')) {
        setChartTypesDropdownOpen(false);
      }
    }
    
    if (chartTypesDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [chartTypesDropdownOpen]);

  const handleChartTypeToggle = (chartType) => {
    const newSelected = selectedChartTypes.includes(chartType)
      ? selectedChartTypes.filter(type => type !== chartType)
      : [...selectedChartTypes, chartType];
    console.log('Selected chart types:', newSelected);
    setSelectedChartTypes(newSelected);
  };

  // Debug logging
  console.log('ChartsSection - selectedChartTypes:', selectedChartTypes);
  console.log('ChartsSection - selectedStatsDataset:', selectedStatsDataset);
  console.log('ChartsSection - datasetData keys:', Object.keys(datasetData || {}));

  const formatDatasetName = (filename) => {
    if (!filename) return 'Unknown Dataset';
    return filename.replace('.csv', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

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

  // Calculate chart layout based on number of selected charts
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

  const chartLayout = getChartLayout();

  // Get the current dataset to display charts for
  const currentDataset = selectedStatsDataset || (selectedDatasets.length > 0 ? selectedDatasets[0] : null);
  const filterStatus = currentDataset ? getFilterStatus(currentDataset) : null;

  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
        <h3 style={{ color: '#555', margin: 0 }}>Charts</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ color: '#555', fontWeight: 600, fontSize: '14px' }}>Chart Types:</label>
          
          {/* Chart Types Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="chart-types-btn"
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
              onClick={() => setChartTypesDropdownOpen(!chartTypesDropdownOpen)}
            >
              Charts ({selectedChartTypes.length})
            </button>
            {chartTypesDropdownOpen && (
              <div className="chart-types-dropdown" style={{ 
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
                <label style={{ display: 'block', marginBottom: 8, color: 'black' }}>
                  <input
                    type="checkbox"
                    checked={selectedChartTypes.includes('pie')}
                    onChange={() => handleChartTypeToggle('pie')}
                  />
                  Pie Chart (Yes/No)
                </label>
                <label style={{ display: 'block', marginBottom: 8, color: 'black' }}>
                  <input
                    type="checkbox"
                    checked={selectedChartTypes.includes('bar')}
                    onChange={() => handleChartTypeToggle('bar')}
                  />
                  Bar Chart (1-10)
                </label>
                <label style={{ display: 'block', marginBottom: 8, color: 'black' }}>
                  <input
                    type="checkbox"
                    checked={selectedChartTypes.includes('line')}
                    onChange={() => handleChartTypeToggle('line')}
                  />
                  Line Chart (1-10)
                </label>
                <label style={{ display: 'block', marginBottom: 8, color: 'black' }}>
                  <input
                    type="checkbox"
                    checked={selectedChartTypes.includes('scatter')}
                    onChange={() => handleChartTypeToggle('scatter')}
                  />
                  Scatter Plot (1-10)
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!currentDataset && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#999', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px dashed #ccc'
        }}>
          <p>No dataset selected. Choose a dataset from the "Dataset:" dropdown above.</p>
        </div>
      )}
      
      {selectedChartTypes.length === 0 && currentDataset && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#999', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px dashed #ccc'
        }}>
          <p>No charts selected. Choose chart types from the dropdown above.</p>
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        flexWrap: 'wrap',
        justifyContent: selectedChartTypes.length <= 2 ? 'flex-start' : 'space-between'
      }}>
        {selectedChartTypes.map(chartType => {
          return (
            <ChartContainer 
              key={chartType}
              title={`${formatDatasetName(currentDataset)} - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
              dataChartType={chartType}
              filterStatus={filterStatus}
              style={chartLayout}
            >
              {chartType === 'pie' && <PieChartComponent data={datasetData[currentDataset]} datasetName={currentDataset} datasetScoreRanges={datasetScoreRanges} datasetData={datasetData} />}
              {chartType === 'bar' && <BarChartComponent data={datasetData[currentDataset]} datasetName={currentDataset} datasetScoreRanges={datasetScoreRanges} datasetData={datasetData} />}
              {chartType === 'line' && <LineChartComponent data={datasetData[currentDataset]} datasetName={currentDataset} datasetScoreRanges={datasetScoreRanges} datasetData={datasetData} />}
              {chartType === 'scatter' && <ScatterChartComponent data={datasetData[currentDataset]} datasetName={currentDataset} datasetScoreRanges={datasetScoreRanges} datasetData={datasetData} />}
            </ChartContainer>
          );
        })}
      </div>
    </div>
  );
}

function ChartContainer({ title, children, dataChartType, filterStatus, style }) {
  return (
    <div style={{ 
      ...style,
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }} data-chart-type={dataChartType}>
      <h4 style={{ color: '#555', marginBottom: '8px', fontSize: '16px' }}>{title}</h4>
      {filterStatus && (
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginBottom: '12px',
          padding: '4px 8px',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          border: '1px solid #ffeaa7'
        }}>
          Filters: {filterStatus}
        </div>
      )}
      {children}
    </div>
  );
}

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

function BarChartComponent({ data, datasetName, datasetScoreRanges, datasetData }) {
  const barData = getDatasetChartData(datasetData, datasetName, 'bar', datasetScoreRanges);
  
  if (barData.length === 0) {
    return <NoDataMessage />;
  }

  // Check if data has 'category' (yes/no) or 'score' (numeric) format
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

function LineChartComponent({ data, datasetName, datasetScoreRanges, datasetData }) {
  const lineData = getDatasetChartData(datasetData, datasetName, 'line', datasetScoreRanges);
  
  if (lineData.length === 0) {
    return <NoDataMessage />;
  }

  // Check if data has 'category' (yes/no) or 'score' (numeric) format
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

function NoDataMessage() {
  return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
      No data available
    </div>
  );
} 