import Map from './Map';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ScatterChart, Scatter, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { useRef } from 'react';

function StatisticsPanel({ dataSet, csvData, greenScoreData, statsDataSet, setStatsDataSet, setShowStats }) {
  if (!statsDataSet) return null;

  const calculateStats = () => {
    if (statsDataSet === 'csv' && csvData.length > 0) {
      const yesCount = csvData.filter(row => (row.scores || '').toLowerCase() === 'yes').length;
      const noCount = csvData.filter(row => (row.scores || '').toLowerCase() === 'no').length;
      const total = csvData.length;
      const yesPercentage = ((yesCount / total) * 100).toFixed(1);
      const noPercentage = ((noCount / total) * 100).toFixed(1);
      
      return {
        total,
        yesCount,
        noCount,
        yesPercentage,
        noPercentage,
        dataType: 'Categorical (Yes/No)'
      };
    } else if (statsDataSet === 'green_score' && greenScoreData.length > 0) {
      const scores = greenScoreData.map(row => parseFloat(row.score)).filter(score => !isNaN(score));
      const total = scores.length;
      const mean = (scores.reduce((sum, score) => sum + score, 0) / total).toFixed(2);
      const sortedScores = scores.sort((a, b) => a - b);
      const median = total % 2 === 0 
        ? ((sortedScores[total/2 - 1] + sortedScores[total/2]) / 2).toFixed(2)
        : sortedScores[Math.floor(total/2)].toFixed(2);
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - parseFloat(mean), 2), 0) / total;
      const stdDev = Math.sqrt(variance).toFixed(2);
      
      return {
        total,
        mean,
        median,
        min,
        max,
        stdDev,
        dataType: 'Numerical (1-10 Scale)'
      };
    }
    return null;
  };

  const stats = calculateStats();
  if (!stats) return null;

  return (
    <div style={{
      background: '#ffffff',
      padding: 20,
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginTop: 16,
      border: '1px solid #ecf0f1'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: 18, 
          fontWeight: 600, 
          color: '#2c3e50',
          borderBottom: '2px solid #3498db',
          paddingBottom: 8
        }}>
          Descriptive Statistics 
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2c3e50' }}>Analysis Dataset:</span>
          <select 
            value={statsDataSet} 
            onChange={e => setStatsDataSet(e.target.value)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: 4, 
              border: '1px solid #bdc3c7',
              background: 'white',
              fontSize: '14px'
            }}
          >
            <option value="csv">Traffic Signal Data</option>
            <option value="green_score">Green Score Data</option>
          </select>
          <button
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#7f8c8d';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#95a5a6';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            onClick={() => setShowStats(false)}
          >
            Close
          </button>
        </div>
      </div>
      <div style={{ 
        fontSize: 13, 
        color: '#7f8c8d', 
        marginBottom: 16,
        fontStyle: 'italic'
      }}>
        Data Type: {stats.dataType}
      </div>
      
      {statsDataSet === 'csv' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
            <div style={{ fontWeight: 600, color: '#495057', fontSize: '13px', marginBottom: 4 }}>Total Observations</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#007bff' }}>{stats.total}</div>
          </div>
          <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
            <div style={{ fontWeight: 600, color: '#495057', fontSize: '13px', marginBottom: 4 }}>Positive Responses</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#28a745' }}>{stats.yesCount} ({stats.yesPercentage}%)</div>
          </div>
          <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
            <div style={{ fontWeight: 600, color: '#495057', fontSize: '13px', marginBottom: 4 }}>Negative Responses</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#dc3545' }}>{stats.noCount} ({stats.noPercentage}%)</div>
          </div>
          <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
            <div style={{ fontWeight: 600, color: '#495057', fontSize: '13px', marginBottom: 4 }}>Response Rate</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#6c757d' }}>100%</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
            <div style={{ fontWeight: 600, color: '#495057', fontSize: '13px', marginBottom: 4 }}>Total Observations</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#007bff' }}>{stats.total}</div>
          </div>
          <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
            <div style={{ fontWeight: 600, color: '#495057', fontSize: '13px', marginBottom: 4 }}>Mean Score</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#28a745' }}>{stats.mean}</div>
          </div>
          <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
            <div style={{ fontWeight: 600, color: '#495057', fontSize: '13px', marginBottom: 4 }}>Median Score</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#ffc107' }}>{stats.median}</div>
          </div>
          <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
            <div style={{ fontWeight: 600, color: '#495057', fontSize: '13px', marginBottom: 4 }}>Standard Deviation</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#6c757d' }}>{stats.stdDev}</div>
          </div>
          <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
            <div style={{ fontWeight: 600, color: '#495057', fontSize: '13px', marginBottom: 4 }}>Minimum Score</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#dc3545' }}>{stats.min}</div>
          </div>
          <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
            <div style={{ fontWeight: 600, color: '#495057', fontSize: '13px', marginBottom: 4 }}>Maximum Score</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#28a745' }}>{stats.max}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chart({ chartType, dataSet, csvData, greenScoreData }) {
  if (!chartType || !dataSet) return null;

  // Helper: get color for score 1-10 (red to green)
  const getColor = (score) => {
    // 1 = red (255,0,0), 10 = green (0,200,0)
    const t = (score - 1) / 9;
    const r = Math.round(255 * (1 - t));
    const g = Math.round(200 * t);
    return `rgb(${r},${g},0)`;
  };
  // Helper: get color for yes/no
  const getYesNoColor = (name) => name.toLowerCase() === 'yes' ? '#4caf50' : '#f44336';

  if (dataSet === 'csv') {
    // Traffic Signal yes/no counts
    const yesCount = csvData.filter(row => (row.scores || '').toLowerCase() === 'yes').length;
    const noCount = csvData.filter(row => (row.scores || '').toLowerCase() === 'no').length;
    const data = [
      { name: 'Yes', value: yesCount },
      { name: 'No', value: noCount },
    ];
    if (chartType === 'bar') {
      return (
        <BarChart width={400} height={300} data={data} style={{ margin: '0 auto' }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value">
            {data.map((entry, idx) => (
              <Cell key={idx} fill={getYesNoColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      );
    } else if (chartType === 'pie') {
      return (
        <PieChart width={400} height={300} style={{ margin: '0 auto' }}>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={getYesNoColor(entry.name)} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      );
    } else if (chartType === 'line') {
      // For yes/no, use a single line connecting both points, color dots by category
      return (
        <LineChart width={400} height={300} data={data} style={{ margin: '0 auto' }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2}
            dot={(props) => (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={7}
                fill={getYesNoColor(props.payload.name)}
                stroke="#888"
                strokeWidth={1}
              />
            )}
            activeDot={{ r: 9 }}
          />
        </LineChart>
      );
    } else if (chartType === 'scatter') {
      // For yes/no, just plot two points
      const scatterData = data.map((entry, idx) => ({ x: idx, y: entry.value, name: entry.name }));
      return (
        <ScatterChart width={400} height={300} style={{ margin: '0 auto' }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" name="Category" tickFormatter={i => data[i]?.name || ''} />
          <YAxis dataKey="y" name="Count" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={scatterData} fill="#8884d8">
            {scatterData.map((entry, idx) => (
              <Cell key={idx} fill={getYesNoColor(entry.name)} />
            ))}
          </Scatter>
        </ScatterChart>
      );
    } else if (chartType === 'histogram') {
      // For yes/no, histogram is just a bar chart
      return (
        <BarChart width={400} height={300} data={data} style={{ margin: '0 auto' }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value">
            {data.map((entry, idx) => (
              <Cell key={idx} fill={getYesNoColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      );
    }
  } else if (dataSet === 'green_score') {
    // Green Score distribution
    const scoreCounts = Array.from({ length: 10 }, (_, i) => ({
      score: i + 1,
      count: greenScoreData.filter(row => parseInt(row.score, 10) === i + 1).length,
    }));
    
    if (chartType === 'bar') {
      return (
        <BarChart width={400} height={300} data={scoreCounts} style={{ margin: '0 auto' }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="score" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count">
            {scoreCounts.map((entry, idx) => (
              <Cell key={idx} fill={getColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      );
    } else if (chartType === 'pie') {
      // Sort by score to ensure proper order in legend (treat as numbers)
      const sortedScoreCounts = [...scoreCounts].sort((a, b) => Number(a.score) - Number(b.score));
      const customLegend = (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          {sortedScoreCounts.map((entry, idx) => (
            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 16, height: 16, background: getColor(entry.score), borderRadius: 2, marginRight: 4 }}></span>
              <span style={{ color: getColor(entry.score), fontWeight: 600 }}>{entry.score}</span>
            </span>
          ))}
        </div>
      );
      return (
        <div>
          <PieChart width={400} height={300} style={{ margin: '0 auto' }}>
            <Pie data={sortedScoreCounts} dataKey="count" nameKey="score" cx="50%" cy="50%" outerRadius={80} label>
              {sortedScoreCounts.map((entry, idx) => (
                <Cell key={idx} fill={getColor(entry.score)} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          {customLegend}
        </div>
      );
    } else if (chartType === 'line') {
      return (
        <LineChart width={400} height={300} data={scoreCounts} style={{ margin: '0 auto' }}>
          <defs>
            <linearGradient id="line-rgb-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={getColor(1)} />
              <stop offset="100%" stopColor={getColor(10)} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="score" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="url(#line-rgb-gradient)" strokeWidth={2}
            dot={(props) => (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={5}
                fill={getColor(props.payload.score)}
                stroke="#888"
                strokeWidth={1}
              />
            )}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      );
    } else if (chartType === 'scatter') {
      // Create scatter plot data with random x values for visualization
      const scatterData = greenScoreData
        .map(row => ({
          x: Math.random() * 100, // Random x for visualization
          y: parseFloat(row.score),
          score: parseFloat(row.score)
        }))
        .filter(point => !isNaN(point.y))
        .slice(0, 100); // Limit to 100 points for readability
      
      return (
        <ScatterChart width={400} height={300} style={{ margin: '0 auto' }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" name="Random Position" />
          <YAxis dataKey="y" name="Score" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={scatterData} fill="#4caf50">
            {scatterData.map((entry, idx) => (
              <Cell key={idx} fill={getColor(entry.score)} />
            ))}
          </Scatter>
        </ScatterChart>
      );
    } else if (chartType === 'histogram') {
      // Create histogram data by grouping scores into bins
      const bins = Array.from({ length: 10 }, (_, i) => ({
        range: `${i + 1}`,
        count: greenScoreData.filter(row => parseInt(row.score, 10) === i + 1).length,
      }));
      
      return (
        <BarChart width={400} height={300} data={bins} style={{ margin: '0 auto' }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count">
            {bins.map((entry, idx) => (
              <Cell key={idx} fill={getColor(Number(entry.range))} />
            ))}
          </Bar>
        </BarChart>
      );
    }
  }
  return null;
}

function App() {
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [dataSet, setDataSet] = useState('csv');
  const [csvData, setCsvData] = useState([]);
  const [greenScoreData, setGreenScoreData] = useState([]);
  const [statsDataSet, setStatsDataSet] = useState('csv');
  const [showStats, setShowStats] = useState(false);
  const [scoreRangeMin, setScoreRangeMin] = useState(1);
  const [scoreRangeMax, setScoreRangeMax] = useState(10);
  const [scoreRangeYes, setScoreRangeYes] = useState(true);
  const [scoreRangeNo, setScoreRangeNo] = useState(true);
  
  // Control bar visibility state
  const [controlBarOpen, setControlBarOpen] = useState(false);
  
  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);

  // Filter greenScoreData for chart
  const filteredGreenScoreData = greenScoreData.filter(row => {
    const score = parseInt(row.score, 10);
    return score >= scoreRangeMin && score <= scoreRangeMax;
  });

  // Filter csvData for chart
  const filteredCsvData = csvData.filter(row => {
    const score = (row.scores || '').toLowerCase();
    return (score === 'yes' && scoreRangeYes) || (score === 'no' && scoreRangeNo);
  });

  return (
    <div className="App">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 16px',
        marginBottom: 10
      }}>
        <div style={{ width: 40, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', minHeight: '40px' }}>
          {!controlBarOpen && (
            <div style={{ position: 'relative' }}>
              <button
                style={{ 
                  padding: 8, 
                  borderRadius: 4, 
                  background: 'rgba(255, 255, 255, 0.9)', 
                  border: '1px solid #ccc', 
                  cursor: 'pointer', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  setShowTooltip(true);
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
                  setShowTooltip(false);
                }}
                onClick={() => setControlBarOpen(true)}
              >
                <img 
                  src={process.env.PUBLIC_URL + '/menu_icon.png'} 
                  alt="Menu" 
                  style={{ width: 24, height: 24 }}
                />
              </button>
              {showTooltip && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 4,
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  zIndex: 1000,
                  pointerEvents: 'none'
                }}>
                  Map Controls
                </div>
              )}
            </div>
          )}
        </div>
        <h1 style={{ 
          color: '#2c3e50', 
          textAlign: 'center', 
          margin: 0, 
          flex: 1,
          fontSize: '28px',
          fontWeight: 300,
          letterSpacing: '0.5px'
        }}>Urban Health & Liveability Research Platform</h1>
        <div style={{ width: 40 }}></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', width: '100%', gap: 32, marginTop: 10 }}>
        <div style={{ flex: 3, minWidth: 0 }}>
          <Map
            setCsvData={setCsvData}
            setGreenScoreData={setGreenScoreData}
            scoreRangeMin={scoreRangeMin}
            setScoreRangeMin={setScoreRangeMin}
            scoreRangeMax={scoreRangeMax}
            setScoreRangeMax={setScoreRangeMax}
            scoreRangeYes={scoreRangeYes}
            setScoreRangeYes={setScoreRangeYes}
            scoreRangeNo={scoreRangeNo}
            setScoreRangeNo={setScoreRangeNo}
            controlBarOpen={controlBarOpen}
            setControlBarOpen={setControlBarOpen}
          />
        </div>
        <div style={{ flex: 2, minWidth: 320 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16, 
            marginBottom: 24 
          }}>
            <button
              style={{ 
                padding: '10px 16px', 
                borderRadius: 6, 
                background: '#34495e', 
                color: 'white',
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#2c3e50';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#34495e';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onClick={() => setShowChart(v => !v)}
            >
              {showChart ? 'Hide Graph' : 'Generate Graph'}
            </button>
            {!showStats ? (
              <button
                style={{ 
                  padding: '10px 16px', 
                  borderRadius: 6, 
                  background: '#27ae60', 
                  color: 'white',
                  border: 'none', 
                  cursor: 'pointer', 
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#229954';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#27ae60';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onClick={() => setShowStats(true)}
              >
                Statistical Analysis
              </button>
            ) : null}
            {(showChart || showStats) && (
              <button
                style={{ 
                  padding: '10px 16px', 
                  borderRadius: 6, 
                  background: '#8e44ad', 
                  color: 'white',
                  border: 'none', 
                  cursor: 'pointer', 
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#7d3c98';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#8e44ad';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onClick={() => {
                  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
                  const snapshotData = {
                    timestamp: timestamp,
                    analysis: {
                      dataset: dataSet,
                      visualizationType: showChart ? chartType : 'None',
                      statisticalAnalysis: showStats ? statsDataSet : 'None',
                      filters: {
                        scoreRangeMin: scoreRangeMin,
                        scoreRangeMax: scoreRangeMax,
                        scoreRangeYes: scoreRangeYes,
                        scoreRangeNo: scoreRangeNo
                      }
                    },
                    statistics: showStats ? {
                      dataset: statsDataSet,
                      data: statsDataSet === 'csv' ? filteredCsvData : filteredGreenScoreData,
                      summary: statsDataSet === 'csv' ? {
                        total: filteredCsvData.length,
                        yesCount: filteredCsvData.filter(row => (row.scores || '').toLowerCase() === 'yes').length,
                        noCount: filteredCsvData.filter(row => (row.scores || '').toLowerCase() === 'no').length
                      } : {
                        total: filteredGreenScoreData.length,
                        scores: filteredGreenScoreData.map(row => parseFloat(row.score)).filter(score => !isNaN(score)),
                        mean: (filteredGreenScoreData.map(row => parseFloat(row.score)).filter(score => !isNaN(score)).reduce((sum, score) => sum + score, 0) / filteredGreenScoreData.length).toFixed(2),
                        min: Math.min(...filteredGreenScoreData.map(row => parseFloat(row.score)).filter(score => !isNaN(score))),
                        max: Math.max(...filteredGreenScoreData.map(row => parseFloat(row.score)).filter(score => !isNaN(score)))
                      }
                    } : null,
                    visualization: showChart ? {
                      type: chartType,
                      dataset: dataSet,
                      data: dataSet === 'csv' ? filteredCsvData : filteredGreenScoreData
                    } : null
                  };
                  
                  const jsonString = JSON.stringify(snapshotData, null, 2);
                  const blob = new Blob([jsonString], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `research-snapshot-${timestamp.replace(/[: ]/g, '-')}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                Download Dataset
              </button>
            )}
            {showChart && (
              <button
                style={{ 
                  padding: '10px 16px', 
                  borderRadius: 6, 
                  background: '#e67e22', 
                  color: 'white',
                  border: 'none', 
                  cursor: 'pointer', 
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#d35400';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#e67e22';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onClick={() => {
                  // Find the chart container
                  const chartContainer = document.querySelector('.recharts-wrapper');
                  if (chartContainer) {
                    // Use html2canvas to capture the chart
                    import('html2canvas').then(html2canvas => {
                      html2canvas.default(chartContainer, {
                        backgroundColor: '#ffffff',
                        scale: 2, // Higher resolution
                        useCORS: true,
                        allowTaint: true
                      }).then(canvas => {
                        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
                        const link = document.createElement('a');
                        link.download = `chart-${dataSet}-${chartType}-${timestamp.replace(/[: ]/g, '-')}.png`;
                        link.href = canvas.toDataURL();
                        link.click();
                      });
                    }).catch(err => {
                      console.error('Failed to load html2canvas:', err);
                      alert('Chart export failed. Please try again.');
                    });
                  } else {
                    alert('No chart found to export.');
                  }
                }}
              >
                Download Graph
              </button>
            )}
          </div>
          {showChart && (
            <>
              <label style={{ color: '#2c3e50', marginRight: 16, fontSize: '14px', fontWeight: 500 }}>
                Dataset:
                <select value={dataSet} onChange={e => setDataSet(e.target.value)} style={{ 
                  marginLeft: 8, 
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #bdc3c7',
                  background: 'white',
                  fontSize: '14px'
                }}>
                  <option value="csv">Traffic Signal Data</option>
                  <option value="green_score">Green Score Data</option>
                </select>
              </label>
              <label style={{ color: '#2c3e50', marginRight: 8, fontSize: '14px', fontWeight: 500 }}>
                Visualization Type:
                <select value={chartType} onChange={e => setChartType(e.target.value)} style={{ 
                  marginLeft: 8, 
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #bdc3c7',
                  background: 'white',
                  fontSize: '14px'
                }}>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="histogram">Histogram</option>
                </select>
              </label>
            </>
          )}
          {showChart && <Chart chartType={chartType} dataSet={dataSet} csvData={filteredCsvData} greenScoreData={filteredGreenScoreData} />}
          {!showStats ? null : (
            <>
              <StatisticsPanel dataSet={dataSet} csvData={filteredCsvData} greenScoreData={filteredGreenScoreData} statsDataSet={statsDataSet} setStatsDataSet={setStatsDataSet} setShowStats={setShowStats} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
