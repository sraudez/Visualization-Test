// Get color for score based on format
export function getScoreColor(score, format) {
  if (format === 'yes_no') {
    const scoreLower = score.toString().toLowerCase();
    return scoreLower === 'yes' ? 'green' : 'red';
  } else if (format === 'numeric_1_10') {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return '#cccccc';
    
   // Create RGB gradient from red (1) → yellow (5.5) → green (10)
   const normalized = (score - 1) / 9; // Normalize 1–10 to 0–1
   let red, green, blue = 0;
 
   if (normalized < 0.5) {
     // Red to Yellow
     red = 255;
     green = Math.round(2 * 255 * normalized); // increase green
   } else {
     // Yellow to Green
     green = 255;
     red = Math.round(255 * (2 - 2 * normalized)); // decrease red
   }

return `rgb(${red}, ${green}, ${blue})`;
  } else {
    return '#cccccc'; // Default gray for other formats
  }
}

// Get marker size for score
export function getMarkerSize(score, format) {
  // Keep all markers the same size regardless of format
  return 6;
}