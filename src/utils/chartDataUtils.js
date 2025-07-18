/**
 * Utility functions for processing chart data
 */

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