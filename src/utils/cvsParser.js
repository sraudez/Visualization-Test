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

// Detect CSV format and return metadata
export function detectCSVFormat(data) {
  if (!data || data.length === 0) return null;
  
  const firstRow = data[0];
  const headers = Object.keys(firstRow);
  
  // More robust coordinate column detection
  const latCandidates = headers.filter(h => 
    h.toLowerCase().includes('lat') || 
    h.toLowerCase().includes('latitude')
  );
  
  const lngCandidates = headers.filter(h => 
    h.toLowerCase().includes('lng') || 
    h.toLowerCase().includes('lon') || 
    h.toLowerCase().includes('long') ||
    h.toLowerCase().includes('longitude')
  );
  
  if (latCandidates.length === 0 || lngCandidates.length === 0) {
    return null; // No valid coordinate columns found
  }
  
  // Determine coordinate column names - prefer exact matches first
  let latCol = latCandidates.find(h => h.toLowerCase() === 'lat') || 
               latCandidates.find(h => h.toLowerCase() === 'latitude') ||
               latCandidates[0];
               
  let lngCol = lngCandidates.find(h => h.toLowerCase() === 'lng') || 
               lngCandidates.find(h => h.toLowerCase() === 'lon') ||
               lngCandidates.find(h => h.toLowerCase() === 'longitude') ||
               lngCandidates[0];
  
  // Check for score column - more flexible detection
  const scoreCol = headers.find(h => 
    h.toLowerCase().includes('score') || 
    h.toLowerCase().includes('scores') ||
    h.toLowerCase().includes('value') ||
    h.toLowerCase().includes('rating') ||
    h.toLowerCase().includes('grade')
  );
  
  if (!scoreCol) {
    return null; // No score column found
  }
  
  // Determine score format by analyzing multiple rows
  let yesCount = 0, noCount = 0, numericCount = 0, totalValidRows = 0;
  
  // Sample up to 10 rows to determine format
  const sampleSize = Math.min(10, data.length);
  for (let i = 0; i < sampleSize; i++) {
    const score = data[i][scoreCol];
    if (score && score.toString().trim() !== '') {
      totalValidRows++;
      const scoreLower = score.toString().toLowerCase();
      
      if (scoreLower === 'yes') {
        yesCount++;
      } else if (scoreLower === 'no') {
        noCount++;
      } else if (!isNaN(parseFloat(score))) {
        numericCount++;
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
      .map(row => parseFloat(row[scoreCol]))
      .filter(score => !isNaN(score));
    
    const minScore = Math.min(...numericScores);
    const maxScore = Math.max(...numericScores);
    
    if (minScore >= 1 && maxScore <= 10) {
      scoreFormat = 'numeric_1_10';
    } else {
      scoreFormat = 'numeric_other';
    }
  } else {
    scoreFormat = 'categorical';
  }
  
  return {
    latCol,
    lngCol,
    scoreCol,
    scoreFormat,
    headers
  };
}