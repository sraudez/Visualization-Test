import { useState, useEffect, useCallback } from 'react';
import { parseCSV } from '../utils';

export function useStatsManagement(datasetData, csvFiles) {
  const [selectedStatsDataset, setSelectedStatsDataset] = useState('');
  const [currentStatsData, setCurrentStatsData] = useState([]);
  const [selectedChartTypes, setSelectedChartTypes] = useState(['pie', 'bar']);

  const loadStatsData = useCallback(async () => {
    if (selectedStatsDataset && datasetData[selectedStatsDataset]) {
      // Use already loaded data
      setCurrentStatsData(datasetData[selectedStatsDataset]);
    } else if (selectedStatsDataset) {
      // Fetch data for the selected dataset if not already loaded
      try {
        const response = await fetch(`/data/${selectedStatsDataset}`);
        if (response.ok) {
          const text = await response.text();
          const data = parseCSV(text);
          setCurrentStatsData(data);
        } else {
          setCurrentStatsData([]);
        }
      } catch (error) {
        console.error('Error loading CSV for stats:', selectedStatsDataset, error);
        setCurrentStatsData([]);
      }
    } else {
      // Use combined data from all selected datasets for map visualization
      const combinedData = Object.values(datasetData).flat();
      setCurrentStatsData(combinedData);
    }
  }, [selectedStatsDataset, datasetData]);

  // Load stats data when selected stats dataset changes
  useEffect(() => {
    loadStatsData();
  }, [loadStatsData]);

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