import { detectCSVFormat } from './cvsParser';

export const createCSVContent = (data) => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(','))
  ];
  
  return csvContent.join('\n');
};

export const downloadCSV = (csvString, filename) => {
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const filterDataByFormat = (data, format, scoreRanges) => {
  if (!format || !data.length) return data;
  
  if (format.scoreFormat === 'yes_no') {
    return data.filter(row => {
      const score = row[format.scoreCol];
      const scoreLower = score.toString().toLowerCase();
      return (scoreLower === 'yes' && scoreRanges.yes) || (scoreLower === 'no' && scoreRanges.no);
    });
  } else if (format.scoreFormat === 'numeric_1_10') {
    return data.filter(row => {
      const score = parseFloat(row[format.scoreCol]);
      return score >= scoreRanges.min && score <= scoreRanges.max;
    });
  }
  
  return data;
};

export const exportFilteredCSV = (data, scoreRanges) => {
  if (data.length === 0) return;
  
  const format = detectCSVFormat(data);
  if (!format) return;
  
  const filteredData = filterDataByFormat(data, format, scoreRanges);
  
  if (filteredData.length === 0) return;
  
  const filename = format.scoreFormat === 'yes_no' ? 'yes-no-data' : 'numeric-data';
  const csvString = createCSVContent(filteredData);
  downloadCSV(csvString, filename);
}; 