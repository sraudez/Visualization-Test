import { useState, useEffect, useCallback } from 'react';
import { detectCSVFormat } from '../utils';

export function useScoreRangeManagement(datasetData, selectedDatasets) {
  const [datasetScoreRanges, setDatasetScoreRanges] = useState({});

  const initializeScoreRanges = useCallback(() => {
    const newScoreRanges = { ...datasetScoreRanges };
    let hasChanges = false;
    
    selectedDatasets.forEach(dataset => {
      if (!newScoreRanges[dataset] && datasetData[dataset] && datasetData[dataset].length > 0) {
        const format = detectCSVFormat(datasetData[dataset]);
        if (format) {
          newScoreRanges[dataset] = {
            yes: true,
            no: true,
            min: 1,
            max: 10
          };
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      setDatasetScoreRanges(newScoreRanges);
    }
  }, [selectedDatasets, datasetData, datasetScoreRanges]);

  // Initialize score ranges for datasets when they are loaded
  useEffect(() => {
    initializeScoreRanges();
  }, [initializeScoreRanges]);

  const updateDatasetScoreRange = (dataset, field, value) => {
    setDatasetScoreRanges(prev => ({
      ...prev,
      [dataset]: {
        ...prev[dataset],
        [field]: value
      }
    }));
  };

  const getDatasetScoreRange = (dataset) => {
    return datasetScoreRanges[dataset] || { yes: true, no: true, min: 1, max: 10 };
  };

  const resetAllFilters = () => {
    const newScoreRanges = {};
    selectedDatasets.forEach(dataset => {
      newScoreRanges[dataset] = { yes: true, no: true, min: 1, max: 10 };
    });
    setDatasetScoreRanges(newScoreRanges);
  };

  return {
    datasetScoreRanges,
    updateDatasetScoreRange,
    getDatasetScoreRange,
    resetAllFilters
  };
} 