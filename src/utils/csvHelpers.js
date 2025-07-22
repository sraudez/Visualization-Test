// Get display name for any CSV file
export function getCSVDisplayName(filename, format) {
    // Remove .csv extension
    const name = filename.replace('.csv', '');
    
    // Convert to readable format
    const displayName = name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Add format indicator
    if (format === 'yes_no') {
      return `${displayName} (Yes/No)`;
    } else if (format === 'numeric_1_10') {
      return `${displayName} (1-10)`;
    } else {
      return `${displayName} (${format})`;
    }
  } 