import { useState, useEffect, useCallback } from 'react';
import { parseCSV } from '../utils';

export function useDatasetManagement() {
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [datasetData, setDatasetData] = useState({});
  const [csvData, setCsvData] = useState([]);
  const [csvLoaded, setCsvLoaded] = useState(false);

  const fetchDataset = useCallback(async (dataset) => {
    try {
      const response = await fetch(`/data/${dataset}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const parsedData = parseCSV(text);
      return { dataset, data: parsedData };
    } catch (error) {
      console.error('Error loading CSV', dataset, ':', error);
      return { dataset, data: [] };
    }
  }, []);

  const clearDatasetData = useCallback(() => {
    setCsvData([]);
    setCsvLoaded(false);
    setDatasetData({});
  }, []);

  const loadSelectedDatasets = useCallback(async () => {
    setCsvLoaded(false);
    
    try {
      const fetchPromises = selectedDatasets.map(fetchDataset);
      const results = await Promise.all(fetchPromises);
      
      const newDatasetData = {};
      results.forEach(({ dataset, data }) => {
        newDatasetData[dataset] = data;
      });
      
      setDatasetData(newDatasetData);
      
      // Keep combined data for backward compatibility
      const combinedData = results.flatMap(({ data }) => data);
      setCsvData(combinedData);
      setCsvLoaded(true);
    } catch (error) {
      console.error('Error loading CSVs:', error);
      clearDatasetData();
    }
  }, [selectedDatasets, fetchDataset, clearDatasetData]);

  const fetchCsvFileList = useCallback(async () => {
    try {
      const response = await fetch('/api/csv-files');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.files)) {
        setCsvFiles(data.files);
        // Removed auto-selection of first file - app starts with no datasets selected
      } else {
        console.error('Invalid response format:', data);
        setCsvFiles([]);
      }
    } catch (error) {
      console.error('Error fetching CSV file list:', error);
      setCsvFiles([]);
    }
  }, []);

  // Fetch CSV file list from backend
  useEffect(() => {
    fetchCsvFileList();
  }, [fetchCsvFileList]);

  // Load CSV data when selected datasets change
  useEffect(() => {
    if (selectedDatasets.length === 0) {
      clearDatasetData();
      return;
    }
    
    loadSelectedDatasets();
  }, [selectedDatasets, loadSelectedDatasets, clearDatasetData]);

  return {
    csvFiles,
    selectedDatasets,
    setSelectedDatasets,
    datasetData,
    csvData,
    csvLoaded
  };
} 