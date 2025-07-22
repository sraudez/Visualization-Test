/**
 * Utility functions for processing chart data
 */

import { detectCSVFormat } from './cvsParser';

/**
 * Checks if a score value is within the specified range
 */
function isScoreInRange(score, scoreFormat, scoreRange) {
  switch (scoreFormat) {
    case 'yes_no':
      return isYesNoScoreInRange(score, scoreRange);
    case 'numeric_1_10':
    case 'numeric_other':
      return isNumericScoreInRange(score, scoreRange);
    default:
      return true; // Include all data for unknown formats
  }
}

/**
 * Checks if a yes/no score is within the specified range
 */
function isYesNoScoreInRange(score, scoreRange) {
  const scoreLower = score.toString().toLowerCase();
  const isYes = scoreLower === 'yes' || scoreLower === 'y' || scoreLower === 'true' || scoreLower === '1';
  const isNo = scoreLower === 'no' || scoreLower === 'n' || scoreLower === 'false' || scoreLower === '0';
  
  if (isYes) return scoreRange.yes;
  if (isNo) return scoreRange.no;
  return false;
}

/**
 * Checks if a numeric score is within the specified range
 */
function isNumericScoreInRange(score, scoreRange) {
  const numScore = parseFloat(score);
  if (isNaN(numScore)) return false;
  return numScore >= scoreRange.min && numScore <= scoreRange.max;
}

/**
 * Filters data based on score ranges for a specific dataset
 */
export function filterDataByScoreRanges(data, datasetScoreRanges, datasetName) {
  if (!data || data.length === 0) return [];

  const scoreRange = datasetScoreRanges[datasetName];
  if (!scoreRange) return data;

  const format = detectCSVFormat(data);
  if (!format) return data;

  const { scoreCol, scoreFormat } = format;

  return data.filter(row => {
    const score = row[scoreCol];
    if (!score || score.toString().trim() === '') return false;

    return isScoreInRange(score, scoreFormat, scoreRange);
  });
}

/**
 * Filters combined data from multiple datasets
 */
export function filterCombinedDataByScoreRanges(datasetData, datasetScoreRanges) {
  const filteredData = [];
  
  Object.entries(datasetData).forEach(([datasetName, data]) => {
    const filteredDatasetData = filterDataByScoreRanges(data, datasetScoreRanges, datasetName);
    filteredData.push(...filteredDatasetData);
  });
  
  return filteredData;
}

/**
 * Detects the score column name in the data
 */
export function detectScoreColumn(data) {
  if (data.length === 0) return null;
  
  const firstRow = data[0];
  if (firstRow.scores !== undefined) return 'scores';
  if (firstRow.score !== undefined) return 'score';
  return null;
}

/**
 * Gets yes/no data from the dataset
 */
export function getYesNoData(data, scoreColumn) {
  if (!scoreColumn) return [];
  
  return data.filter(row => {
    const score = row[scoreColumn];
    return score && (score.toString().toLowerCase() === 'yes' || score.toString().toLowerCase() === 'no');
  });
}

/**
 * Gets numeric data from the dataset
 */
export function getNumericData(data, scoreColumn) {
  if (!scoreColumn) return [];
  
  return data.filter(row => {
    const score = row[scoreColumn];
    return score && !isNaN(parseFloat(score)) && parseFloat(score) >= 1 && parseFloat(score) <= 10;
  });
}

/**
 * Creates yes/no chart data for different chart types
 */
export function createYesNoChartData(yesNoData, scoreColumn, chartType) {
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
}

/**
 * Creates numeric chart data for different chart types
 */
export function createNumericChartData(numericData, scoreColumn, chartType) {
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
}

/**
 * Gets chart data for a specific chart type
 */
export function getChartDataForType(data, chartType) {
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
}

/**
 * Gets pie chart data (default chart type)
 */
export function getChartData(data) {
  return getChartDataForType(data, 'pie');
}

/**
 * Gets numeric data for statistics calculations
 */
export function getNumericDataForStats(data) {
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
}

/**
 * Creates pie chart data for yes/no format
 */
function createYesNoPieData(filteredData, scoreCol) {
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
}

/**
 * Creates pie chart data for numeric format
 */
function createNumericPieData(filteredData, scoreCol) {
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
}

/**
 * Creates pie chart data for categorical format
 */
function createCategoricalPieData(filteredData, scoreCol) {
  const distribution = {};
  filteredData.forEach(row => {
    const value = row[scoreCol] || 'Unknown';
    distribution[value] = (distribution[value] || 0) + 1;
  });
  
  return Object.entries(distribution).map(([value, count]) => ({
    name: value,
    value: count
  })).sort((a, b) => b.value - a.value).slice(0, 10);
}

/**
 * Creates bar/line chart data for yes/no format
 */
function createYesNoBarLineData(filteredData, scoreCol) {
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
}

/**
 * Creates bar/line chart data for numeric format
 */
function createNumericBarLineData(filteredData, scoreCol) {
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
}

/**
 * Creates bar/line chart data for categorical format
 */
function createCategoricalBarLineData(filteredData, scoreCol) {
  const distribution = {};
  filteredData.forEach(row => {
    const value = row[scoreCol] || 'Unknown';
    distribution[value] = (distribution[value] || 0) + 1;
  });
  
  return Object.entries(distribution).map(([value, count]) => ({
    category: value,
    count: count
  })).sort((a, b) => b.count - a.count).slice(0, 10);
}

/**
 * Creates scatter plot data for yes/no format
 */
function createYesNoScatterData(filteredData, scoreCol) {
  return filteredData.map((row, index) => {
    const value = row[scoreCol].toString().toLowerCase();
    const yValue = (value === 'yes' || value === 'y' || value === 'true' || value === '1') ? 1 : 0;
    return {
      x: index + 1,
      y: yValue
    };
  });
}

/**
 * Creates scatter plot data for numeric format
 */
function createNumericScatterData(filteredData, scoreCol) {
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
}

/**
 * Creates scatter plot data for categorical format
 */
function createCategoricalScatterData(filteredData, scoreCol) {
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

/**
 * Gets chart data for a specific dataset and chart type
 */
export function getDatasetChartData(datasetData, datasetName, chartType, datasetScoreRanges) {
  const data = datasetData[datasetName];
  if (!data || data.length === 0) return [];
  
  const filteredData = filterDataByScoreRanges(data, datasetScoreRanges, datasetName);
  if (filteredData.length === 0) return [];
  
  const format = detectCSVFormat(filteredData);
  if (!format) {
    return createFallbackChartData(filteredData, chartType);
  }
  
  const { scoreCol, scoreFormat } = format;
  
  // Handle pie chart
  if (chartType === 'pie') {
    if (scoreFormat === 'yes_no') {
      return createYesNoPieData(filteredData, scoreCol);
    } else if (scoreFormat === 'numeric_1_10' || scoreFormat === 'numeric_other') {
      return createNumericPieData(filteredData, scoreCol);
    } else {
      return createCategoricalPieData(filteredData, scoreCol);
    }
  }
  
  // Handle bar and line charts
  if (chartType === 'bar' || chartType === 'line') {
    if (scoreFormat === 'yes_no') {
      return createYesNoBarLineData(filteredData, scoreCol);
    } else if (scoreFormat === 'numeric_1_10' || scoreFormat === 'numeric_other') {
      return createNumericBarLineData(filteredData, scoreCol);
    } else {
      return createCategoricalBarLineData(filteredData, scoreCol);
    }
  }
  
  // Handle scatter plot
  if (chartType === 'scatter') {
    if (scoreFormat === 'yes_no') {
      return createYesNoScatterData(filteredData, scoreCol);
    } else if (scoreFormat === 'numeric_1_10' || scoreFormat === 'numeric_other') {
      return createNumericScatterData(filteredData, scoreCol);
    } else {
      return createCategoricalScatterData(filteredData, scoreCol);
    }
  }
  
  return [];
}

/**
 * Creates fallback chart data when format detection fails
 */
function createFallbackChartData(data, chartType) {
  if (data.length === 0) return [];
  
  const firstRow = data[0];
  const headers = Object.keys(firstRow);
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