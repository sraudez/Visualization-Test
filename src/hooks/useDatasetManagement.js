import { useState, useEffect, useCallback, useRef } from 'react';
import { parseCSV } from '../utils';

export function useDatasetManagement() {
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [datasetData, setDatasetData] = useState({});
  const [csvData, setCsvData] = useState([]);
  const [csvLoaded, setCsvLoaded] = useState(false);

  // Use refs to store functions to avoid dependency issues
  const fetchDatasetRef = useRef();
  const clearDatasetDataRef = useRef();
  const loadSelectedDatasetsRef = useRef();

  const fetchDataset = useCallback(async (dataset) => {
    try {
      console.log(`Attempting to fetch dataset: ${dataset}`);
      // Fetch from backend server
      const response = await fetch(`http://localhost:3002/data/${dataset}`);
      console.log(`Fetch response for ${dataset}:`, response.status, response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      console.log(`Raw text for ${dataset}:`, text.substring(0, 200) + '...');
      
      const parsedData = parseCSV(text);
      console.log(`Parsed data for ${dataset}:`, parsedData.length, 'rows, first row:', parsedData[0]);
      return { dataset, data: parsedData };
    } catch (error) {
      console.error('Error loading CSV', dataset, ':', error);
      return { dataset, data: [] };
    }
  }, []);

  const clearDatasetData = useCallback(() => {
    console.log('clearDatasetData called - clearing all data');
    setCsvData([]);
    setCsvLoaded(false);
    setDatasetData({});
  }, []);

  const loadSelectedDatasets = useCallback(async () => {
    console.log('loadSelectedDatasets called with:', selectedDatasets);
    setCsvLoaded(false);
    
    try {
      const fetchPromises = selectedDatasets.map(fetchDatasetRef.current);
      console.log('Fetch promises created for:', selectedDatasets);
      
      const results = await Promise.all(fetchPromises);
      console.log('Fetch results:', results.map(r => ({ dataset: r.dataset, dataLength: r.data.length })));
      
      const newDatasetData = {};
      results.forEach(({ dataset, data }) => {
        newDatasetData[dataset] = data;
        console.log(`Added ${dataset} to datasetData:`, data.length, 'rows');
      });
      
      console.log('Final datasetData:', Object.keys(newDatasetData), 'with data:', newDatasetData);
      setDatasetData(newDatasetData);
      
      // Keep combined data for backward compatibility
      const combinedData = results.flatMap(({ data }) => data);
      console.log('Combined data length:', combinedData.length);
      setCsvData(combinedData);
      setCsvLoaded(true);
    } catch (error) {
      console.error('Error loading CSVs:', error);
      clearDatasetDataRef.current();
    }
  }, [selectedDatasets]);

  // Store functions in refs
  fetchDatasetRef.current = fetchDataset;
  clearDatasetDataRef.current = clearDatasetData;
  loadSelectedDatasetsRef.current = loadSelectedDatasets;

  const fetchCsvFileList = useCallback(async () => {
    try {
      console.log('Fetching CSV file list...');
      // Use hardcoded list of CSV files in public directory
      const knownCsvFiles = [
        'green_score.csv',
        'prop.csv', 
        'scores.csv',
        'stl_test.csv',
        'sample.csv'
      ];
      
      console.log('Available CSV files:', knownCsvFiles);
      setCsvFiles(knownCsvFiles);
      console.log('CSV files set in state');
    } catch (error) {
      console.error('Error setting CSV file list:', error);
      setCsvFiles([]);
    }
  }, []);

  // Fetch CSV file list from backend
  useEffect(() => {
    console.log('Initializing CSV file list...');
    fetchCsvFileList();
  }, [fetchCsvFileList]);

  // Auto-select first dataset when CSV files are loaded and no datasets are selected
  useEffect(() => {
    console.log('Auto-selection check:', { csvFilesLength: csvFiles.length, selectedDatasetsLength: selectedDatasets.length, csvFiles });
    if (csvFiles.length > 0 && selectedDatasets.length === 0) {
      console.log('Auto-selecting first dataset:', csvFiles[0]);
      setSelectedDatasets([csvFiles[0]]);
      console.log('Auto-selection completed, selectedDatasets should now be:', [csvFiles[0]]);
    }
  }, [csvFiles, selectedDatasets.length]);

  // Load CSV data when selected datasets change OR when we have selected datasets but no data
  useEffect(() => {
    console.log('Dataset loading effect triggered:', { 
      selectedDatasets, 
      selectedDatasetsLength: selectedDatasets.length,
      selectedDatasetsType: typeof selectedDatasets,
      selectedDatasetsIsArray: Array.isArray(selectedDatasets),
      datasetDataKeys: Object.keys(datasetData),
      datasetDataLength: Object.keys(datasetData).length
    });
    
    if (selectedDatasets.length === 0) {
      console.log('No datasets selected, clearing data');
      clearDatasetDataRef.current();
      return;
    }
    
    // Check if we have selected datasets but no corresponding data
    const hasDataForAllSelected = selectedDatasets.every(dataset => 
      datasetData[dataset] && datasetData[dataset].length > 0
    );
    
    console.log('Data check:', { 
      selectedDatasets, 
      datasetDataKeys: Object.keys(datasetData),
      hasDataForAllSelected 
    });
    
    if (!hasDataForAllSelected) {
      console.log('Loading datasets (missing data):', selectedDatasets);
      console.log('About to call loadSelectedDatasetsRef.current()');
      loadSelectedDatasetsRef.current();
      console.log('loadSelectedDatasetsRef.current() called');
    } else {
      console.log('All selected datasets already have data, skipping load');
    }
  }, [selectedDatasets, datasetData]);

  return {
    csvFiles,
    selectedDatasets,
    setSelectedDatasets,
    datasetData,
    csvData,
    csvLoaded
  };
} 