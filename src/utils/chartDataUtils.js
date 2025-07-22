/**
 * Utility functions for processing chart data
 */

import { detectCSVFormat } from './cvsParser';

// Filter data based on score ranges - more flexible version
export function filterDataByScoreRanges(data, datasetScoreRanges, datasetName) {
  if (!data || data.length === 0) return [];
  
  const scoreRange = datasetScoreRanges[datasetName];
  if (!scoreRange) return data;
  
  const format = detectCSVFormat(data);
  if (!format) {
    // If format detection fails, return all data
    return data;
  }
  
  const { scoreCol, scoreFormat } = format;
  
  return data.filter(row => {
    const score = row[scoreCol];
    if (!score || score.toString().trim() === '') return false;
    
    if (scoreFormat === 'yes_no') {
      const scoreLower = score.toString().toLowerCase();
      const isYes = scoreLower === 'yes' || scoreLower === 'y' || scoreLower === 'true' || scoreLower === '1';
      const isNo = scoreLower === 'no' || scoreLower === 'n' || scoreLower === 'false' || scoreLower === '0';
      
      if (isYes) return scoreRange.yes;
      if (isNo) return scoreRange.no;
      return false;
    } else if (scoreFormat === 'numeric_1_10' || scoreFormat === 'numeric_other') {
      const numScore = parseFloat(score);
      if (isNaN(numScore)) return false;
      return numScore >= scoreRange.min && numScore <= scoreRange.max;
    } else {
      // For categorical or unknown formats, include all data
      return true;
    }
  });
}

// Filter combined data from multiple datasets
export function filterCombinedDataByScoreRanges(datasetData, datasetScoreRanges) {
  const filteredData = [];
  
  Object.entries(datasetData).forEach(([datasetName, data]) => {
    const filteredDatasetData = filterDataByScoreRanges(data, datasetScoreRanges, datasetName);
    filteredData.push(...filteredDatasetData);
  });
  
  return filteredData;
}

export const detectScoreColumn = (data) => {
  if (data.length === 0) return null;
  
  const firstRow = data[0];
  if (firstRow.scores !== undefined) return 'scores';
  if (firstRow.score !== undefined) return 'score';
  return null;
};

export const getYesNoData = (data, scoreColumn) => {
  if (!scoreColumn) return [];
  
  return data.filter(row => {
    const score = row[scoreColumn];
    return score && (score.toString().toLowerCase() === 'yes' || score.toString().toLowerCase() === 'no');
  });
};

export const getNumericData = (data, scoreColumn) => {
  if (!scoreColumn) return [];
  
  return data.filter(row => {
    const score = row[scoreColumn];
    return score && !isNaN(parseFloat(score)) && parseFloat(score) >= 1 && parseFloat(score) <= 10;
  });
};

export const createYesNoChartData = (yesNoData, scoreColumn, chartType) => {
  const yesCount = yesNoData.filter(row => row[scoreColumn].toString().toLowerCase() === 'yes').length;
  const noCount = yesNoData.filter(row => row[scoreColumn].toString().toLowerCase() === 'no').length;
  
  switch (chartType) {
    case 'pie':
      return [
        { name: 'Yes', value: yesCount },
        { name: 'No', value: noCount }
      ];
    case 'bar':
      return [
        { category: 'Yes', count: yesCount },
        { category: 'No', count: noCount }
      ];
    case 'line':
      return [
        { category: 'Yes', count: yesCount },
        { category: 'No', count: noCount }
      ];
    case 'scatter':
      return [
        { x: 1, y: yesCount, label: 'Yes' },
        { x: 2, y: noCount, label: 'No' }
      ];
    default:
      return [];
  }
};

export const createNumericChartData = (numericData, scoreColumn, chartType) => {
  const scoreCounts = {};
  numericData.forEach(row => {
    const score = parseFloat(row[scoreColumn]);
    scoreCounts[score] = (scoreCounts[score] || 0) + 1;
  });

  const sortedScores = Object.keys(scoreCounts).sort((a, b) => parseFloat(a) - parseFloat(b));
  
  switch (chartType) {
    case 'pie':
      return sortedScores.map(score => ({
        name: `Score ${score}`,
        value: scoreCounts[score]
      }));
    case 'bar':
      return sortedScores.map(score => ({
        score: parseFloat(score),
        count: scoreCounts[score]
      }));
    case 'line':
      return sortedScores.map(score => ({
        score: parseFloat(score),
        count: scoreCounts[score]
      }));
    case 'scatter':
      return sortedScores.map(score => ({
        x: parseFloat(score),
        y: scoreCounts[score],
        label: `Score ${score}`
      }));
    default:
      return [];
  }
};

export const getChartDataForType = (data, chartType) => {
  const scoreColumn = detectScoreColumn(data);
  if (!scoreColumn) return [];

  const yesNoData = getYesNoData(data, scoreColumn);
  const numericData = getNumericData(data, scoreColumn);

  if (yesNoData.length > 0) {
    return createYesNoChartData(yesNoData, scoreColumn, chartType);
  } else if (numericData.length > 0) {
    return createNumericChartData(numericData, scoreColumn, chartType);
  }
  
  return [];
};

export const getChartData = (data) => {
  return getChartDataForType(data, 'pie');
};

export const getNumericDataForStats = (data) => {
  const scoreColumn = detectScoreColumn(data);
  if (!scoreColumn) return [];
  
  return data
    .filter(row => {
      const score = row[scoreColumn];
      return score && !isNaN(parseFloat(score)) && parseFloat(score) >= 1 && parseFloat(score) <= 10;
    })
    .map(row => ({
      score: parseFloat(row[scoreColumn]),
      count: 1
    }))
    .reduce((acc, item) => {
      const existing = acc.find(x => x.score === item.score);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push(item);
      }
      return acc;
    }, [])
    .sort((a, b) => a.score - b.score);
}; 

// Get chart data for a specific dataset and chart type - universal version
export function getDatasetChartData(datasetData, datasetName, chartType, datasetScoreRanges) {
  const data = datasetData[datasetName];
  if (!data || data.length === 0) return [];
  
  // Filter data based on score ranges
  const filteredData = filterDataByScoreRanges(data, datasetScoreRanges, datasetName);
  if (filteredData.length === 0) return [];
  
  const format = detectCSVFormat(filteredData);
  if (!format) {
    // Fallback: create basic chart data from any available columns
    return createFallbackChartData(filteredData, chartType);
  }
  
  const { scoreCol, scoreFormat } = format;
  
  // For Pie Chart - handle all data types
  if (chartType === 'pie') {
    if (scoreFormat === 'yes_no') {
      const yesCount = filteredData.filter(row => {
        const val = row[scoreCol].toString().toLowerCase();
        return val === 'yes' || val === 'y' || val === 'true' || val === '1';
      }).length;
      const noCount = filteredData.filter(row => {
        const val = row[scoreCol].toString().toLowerCase();
        return val === 'no' || val === 'n' || val === 'false' || val === '0';
      }).length;
      
      return [
        { name: 'Yes', value: yesCount },
        { name: 'No', value: noCount }
      ];
    } else if (scoreFormat === 'numeric_1_10' || scoreFormat === 'numeric_other') {
      // For numeric data, create distribution for pie chart
      const distribution = {};
      filteredData.forEach(row => {
        const score = parseFloat(row[scoreCol]);
        if (!isNaN(score)) {
          const roundedScore = Math.round(score);
          distribution[roundedScore] = (distribution[roundedScore] || 0) + 1;
        }
      });
      
      return Object.entries(distribution).map(([score, count]) => ({
        name: `Value ${score}`,
        value: count
      })).sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));
    } else {
      // For categorical or unknown data, create distribution
      const distribution = {};
      filteredData.forEach(row => {
        const value = row[scoreCol] || 'Unknown';
        distribution[value] = (distribution[value] || 0) + 1;
      });
      
      return Object.entries(distribution).map(([value, count]) => ({
        name: value,
        value: count
      })).sort((a, b) => b.value - a.value).slice(0, 10); // Limit to top 10 categories
    }
  }
  
  // For Bar, Line, and Scatter charts - handle all data types
  if (chartType === 'bar' || chartType === 'line') {
    if (scoreFormat === 'yes_no') {
      const yesCount = filteredData.filter(row => {
        const val = row[scoreCol].toString().toLowerCase();
        return val === 'yes' || val === 'y' || val === 'true' || val === '1';
      }).length;
      const noCount = filteredData.filter(row => {
        const val = row[scoreCol].toString().toLowerCase();
        return val === 'no' || val === 'n' || val === 'false' || val === '0';
      }).length;
      
      return [
        { category: 'Yes', count: yesCount },
        { category: 'No', count: noCount }
      ];
    } else if (scoreFormat === 'numeric_1_10' || scoreFormat === 'numeric_other') {
      // Create distribution data
      const distribution = {};
      filteredData.forEach(row => {
        const score = parseFloat(row[scoreCol]);
        if (!isNaN(score)) {
          const roundedScore = Math.round(score);
          distribution[roundedScore] = (distribution[roundedScore] || 0) + 1;
        }
      });
      
      return Object.entries(distribution).map(([score, count]) => ({
        score: parseInt(score),
        count: count
      })).sort((a, b) => a.score - b.score);
    } else {
      // For categorical data, create bar chart
      const distribution = {};
      filteredData.forEach(row => {
        const value = row[scoreCol] || 'Unknown';
        distribution[value] = (distribution[value] || 0) + 1;
      });
      
      return Object.entries(distribution).map(([value, count]) => ({
        category: value,
        count: count
      })).sort((a, b) => b.count - a.count).slice(0, 10); // Limit to top 10 categories
    }
  }
  
  if (chartType === 'scatter') {
    if (scoreFormat === 'yes_no') {
      // For yes/no data, create scatter plot with binary values
      return filteredData.map((row, index) => {
        const value = row[scoreCol].toString().toLowerCase();
        const yValue = (value === 'yes' || value === 'y' || value === 'true' || value === '1') ? 1 : 0;
        return {
          x: index + 1,
          y: yValue
        };
      });
    } else if (scoreFormat === 'numeric_1_10' || scoreFormat === 'numeric_other') {
      // For numeric data, create scatter plot with actual scores
      return filteredData.map((row, index) => {
        const score = parseFloat(row[scoreCol]);
        if (!isNaN(score)) {
          return {
            x: index + 1,
            y: score
          };
        }
        return null;
      }).filter(Boolean);
    } else {
      // For categorical data, create scatter plot with category indices
      const categories = [...new Set(filteredData.map(row => row[scoreCol] || 'Unknown'))];
      return filteredData.map((row, index) => {
        const value = row[scoreCol] || 'Unknown';
        const yValue = categories.indexOf(value);
        return {
          x: index + 1,
          y: yValue
        };
      });
    }
  }
  
  return [];
}

// Fallback function to create chart data when format detection fails
function createFallbackChartData(data, chartType) {
  if (data.length === 0) return [];
  
  const firstRow = data[0];
  const headers = Object.keys(firstRow);
  
  // Use the first available column as data source
  const dataCol = headers[0];
  
  if (chartType === 'pie') {
    const distribution = {};
    data.forEach(row => {
      const value = row[dataCol] || 'Unknown';
      distribution[value] = (distribution[value] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([value, count]) => ({
      name: value,
      value: count
    })).sort((a, b) => b.value - a.value).slice(0, 8);
  }
  
  if (chartType === 'bar' || chartType === 'line') {
    const distribution = {};
    data.forEach(row => {
      const value = row[dataCol] || 'Unknown';
      distribution[value] = (distribution[value] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([value, count]) => ({
      category: value,
      count: count
    })).sort((a, b) => b.count - a.count).slice(0, 10);
  }
  
  if (chartType === 'scatter') {
    const categories = [...new Set(data.map(row => row[dataCol] || 'Unknown'))];
    return data.map((row, index) => {
      const value = row[dataCol] || 'Unknown';
      const yValue = categories.indexOf(value);
      return {
        x: index + 1,
        y: yValue
      };
    });
  }
  
  return [];
} 