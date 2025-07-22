// CSV parsing helper
export function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = values[i] ? values[i].trim() : ''; });
    return obj;
  });
}

// Detect CSV format and return metadata - specific for lat, lons, scores format
export function detectCSVFormat(data) {
  if (!data || data.length === 0) return null;
  
  const firstRow = data[0];
  const headers = Object.keys(firstRow);
  
  // Check for specific required headers
  const hasLat = headers.includes('lat');
  const hasLons = headers.includes('lons');
  const hasScores = headers.includes('scores');
  
  // If we don't have the exact headers we need, return null
  if (!hasLat || !hasLons || !hasScores) {
    console.log('CSV format not supported. Required headers: lat, lons, scores. Found:', headers);
    return null;
  }
  
  // Determine score format by analyzing the scores column
  let yesCount = 0, noCount = 0, numericCount = 0, totalValidRows = 0;
  
  // Sample up to 20 rows to determine format
  const sampleSize = Math.min(20, data.length);
  for (let i = 0; i < sampleSize; i++) {
    const score = data[i]['scores'];
    if (score && score.toString().trim() !== '') {
      totalValidRows++;
      const scoreLower = score.toString().toLowerCase();
      
      // Check if it's a numeric value first
      if (!isNaN(parseFloat(score))) {
        numericCount++;
      } else if (scoreLower === 'yes' || scoreLower === 'y' || scoreLower === 'true') {
        yesCount++;
      } else if (scoreLower === 'no' || scoreLower === 'n' || scoreLower === 'false') {
        noCount++;
      }
    }
  }
  
  let scoreFormat;
  if (totalValidRows === 0) {
    scoreFormat = 'unknown';
  } else if (yesCount > 0 || noCount > 0) {
    // If we found yes/no values, it's yes_no format
    scoreFormat = 'yes_no';
  } else if (numericCount > 0) {
    // Check if numeric values are in 1-10 range
    const numericScores = data
      .slice(0, sampleSize)
      .map(row => parseFloat(row['scores']))
      .filter(score => !isNaN(score));
    
    if (numericScores.length > 0) {
      const minScore = Math.min(...numericScores);
      const maxScore = Math.max(...numericScores);
      
      if (minScore >= 1 && maxScore <= 10) {
        scoreFormat = 'numeric_1_10';
      } else {
        scoreFormat = 'numeric_other';
      }
    } else {
      scoreFormat = 'numeric_other';
    }
  } else {
    scoreFormat = 'categorical';
  }
  
  return {
    latCol: 'lat',
    lngCol: 'lons',
    scoreCol: 'scores',
    scoreFormat,
    headers
  };
}