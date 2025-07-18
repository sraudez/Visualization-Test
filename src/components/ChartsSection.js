import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { getChartDataForType } from '../utils/chartDataUtils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ChartsSection({ currentStatsData, selectedChartTypes, setSelectedChartTypes }) {
  const handleChartTypeChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedChartTypes(selectedOptions);
  };

  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
        <h3 style={{ color: '#555', margin: 0 }}>Charts</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ color: '#555', fontWeight: 600, fontSize: '14px' }}>Chart Types:</label>
          <select
            multiple
            value={selectedChartTypes}
            onChange={handleChartTypeChange}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              fontSize: '14px',
              minWidth: '150px',
              minHeight: '40px'
            }}
          >
            <option value="pie">Pie Chart (Yes/No)</option>
            <option value="bar">Bar Chart (1-10)</option>
            <option value="line">Line Chart (1-10)</option>
            <option value="scatter">Scatter Plot (1-10)</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {selectedChartTypes.includes('pie') && (
          <ChartContainer title="Distribution (Pie Chart)" minWidth={300}>
            <PieChartComponent data={currentStatsData} />
          </ChartContainer>
        )}
        {selectedChartTypes.includes('bar') && (
          <ChartContainer title="Distribution (Bar Chart)" minWidth={300}>
            <BarChartComponent data={currentStatsData} />
          </ChartContainer>
        )}
        {selectedChartTypes.includes('line') && (
          <ChartContainer title="Distribution (Line Chart)" minWidth={300}>
            <LineChartComponent data={currentStatsData} />
          </ChartContainer>
        )}
        {selectedChartTypes.includes('scatter') && (
          <ChartContainer title="Distribution (Scatter Plot)" minWidth={300}>
            <ScatterChartComponent data={currentStatsData} />
          </ChartContainer>
        )}
      </div>
    </div>
  );
}

function ChartContainer({ title, children, minWidth }) {
  return (
    <div style={{ flex: 1, minWidth }}>
      <h4 style={{ color: '#555', marginBottom: 10 }}>{title}</h4>
      {children}
    </div>
  );
}

function PieChartComponent({ data }) {
  const pieData = getChartDataForType(data, 'pie');
  
  if (pieData.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <PieChart width={300} height={200}>
      <Pie
        data={pieData}
        cx={150}
        cy={100}
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
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

function BarChartComponent({ data }) {
  const barData = getChartDataForType(data, 'bar');
  
  if (barData.length === 0) {
    return <NoDataMessage />;
  }

  const dataKey = barData[0]?.score !== undefined ? "score" : "category";

  return (
    <BarChart width={400} height={200} data={barData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={dataKey} />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  );
}

function LineChartComponent({ data }) {
  const lineData = getChartDataForType(data, 'line');
  
  if (lineData.length === 0) {
    return <NoDataMessage />;
  }

  const dataKey = lineData[0]?.score !== undefined ? "score" : "category";

  return (
    <LineChart width={400} height={200} data={lineData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={dataKey} />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} />
    </LineChart>
  );
}

function ScatterChartComponent({ data }) {
  const scatterData = getChartDataForType(data, 'scatter');
  
  if (scatterData.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <ScatterChart width={400} height={200} data={scatterData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="x" />
      <YAxis />
      <Tooltip />
      <Scatter dataKey="y" fill="#ffc658" />
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