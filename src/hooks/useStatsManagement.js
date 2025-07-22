import { useState, useEffect, useCallback } from 'react';
import { parseCSV } from '../utils';
import { filterDataByScoreRanges, filterCombinedDataByScoreRanges } from '../utils/chartDataUtils';

export function useStatsManagement(datasetData, csvFiles, datasetScoreRanges, setSelectedDatasets) {
  const [selectedStatsDataset, setSelectedStatsDataset] = useState('');
  const [currentStatsData, setCurrentStatsData] = useState([]);
  const [selectedChartTypes, setSelectedChartTypes] = useState(['pie', 'bar']);

  const loadStatsData = useCallback(async () => {
    console.log('loadStatsData called with:', { selectedStatsDataset, datasetDataKeys: Object.keys(datasetData), datasetScoreRanges });
    
    if (selectedStatsDataset && datasetData[selectedStatsDataset]) {
      console.log('Using existing dataset data for:', selectedStatsDataset);
      // Use filtered data for the selected dataset
      const filteredData = filterDataByScoreRanges(
        datasetData[selectedStatsDataset], 
        datasetScoreRanges, 
        selectedStatsDataset
      );
      console.log('Filtered data for stats:', filteredData.length, 'rows');
      setCurrentStatsData(filteredData);
    } else if (selectedStatsDataset) {
      console.log('Fetching new dataset data for:', selectedStatsDataset);
      // Fetch data for the selected dataset if not already loaded
      try {
        const response = await fetch(`/${selectedStatsDataset}`);
        console.log('Fetch response for stats:', response.status, response.ok);
        
        if (response.ok) {
          const text = await response.text();
          console.log('Raw text for stats:', text.substring(0, 200) + '...');
          
          const data = parseCSV(text);
          console.log('Parsed data for stats:', data.length, 'rows, first row:', data[0]);
          
          const filteredData = filterDataByScoreRanges(data, datasetScoreRanges, selectedStatsDataset);
          console.log('Filtered data for stats:', filteredData.length, 'rows');
          setCurrentStatsData(filteredData);
          
          // Also add this dataset to the main selectedDatasets if not already there
          if (setSelectedDatasets && !datasetData[selectedStatsDataset]) {
            console.log('Adding dataset to main selection:', selectedStatsDataset);
            setSelectedDatasets(prev => {
              const newSelection = prev.includes(selectedStatsDataset) ? prev : [...prev, selectedStatsDataset];
              console.log('Updated selectedDatasets:', newSelection);
              return newSelection;
            });
          }
        } else {
          console.log('Fetch failed for stats dataset');
          setCurrentStatsData([]);
        }
      } catch (error) {
        console.error('Error loading CSV for stats:', selectedStatsDataset, error);
        setCurrentStatsData([]);
      }
    } else {
      console.log('No selectedStatsDataset, using combined data');
      // Use filtered combined data from all selected datasets
      const filteredCombinedData = filterCombinedDataByScoreRanges(datasetData, datasetScoreRanges);
      console.log('Combined data for stats:', filteredCombinedData.length, 'rows');
      setCurrentStatsData(filteredCombinedData);
    }
  }, [selectedStatsDataset, datasetData, datasetScoreRanges, setSelectedDatasets]);

  // Load stats data when dependencies change
  useEffect(() => {
    loadStatsData();
  }, [loadStatsData]);

  // Auto-select first dataset for stats if none selected
  useEffect(() => {
    if (csvFiles.length > 0 && !selectedStatsDataset) {
      console.log('Auto-selecting first dataset for stats:', csvFiles[0]);
      setSelectedStatsDataset(csvFiles[0]);
    }
  }, [csvFiles, selectedStatsDataset]);

  const updateSelectedChartTypes = (newTypes) => {
    setSelectedChartTypes(newTypes);
  };

  return {
    selectedStatsDataset,
    setSelectedStatsDataset,
    currentStatsData,
    selectedChartTypes,
    updateSelectedChartTypes
  };
} 