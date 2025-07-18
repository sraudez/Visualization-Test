import { useState, useEffect } from 'react';

export function useHeatmapManagement(selectedDatasets) {
  const [selectedHeatmapDatasets, setSelectedHeatmapDatasets] = useState([]);
  const [hideMarkersWithHeatmap, setHideMarkersWithHeatmap] = useState(false);

  // Auto-select heatmap datasets when datasets are selected
  useEffect(() => {
    if (selectedDatasets.length > 0) {
      // Auto-select all datasets for heatmap when datasets are first selected
      if (selectedHeatmapDatasets.length === 0) {
        setSelectedHeatmapDatasets([...selectedDatasets]);
      } else {
        // Only include datasets that are still selected
        setSelectedHeatmapDatasets(prev => 
          prev.filter(dataset => selectedDatasets.includes(dataset))
        );
      }
    } else {
      // Clear heatmap datasets when no datasets are selected
      setSelectedHeatmapDatasets([]);
    }
  }, [selectedDatasets, selectedHeatmapDatasets.length]);

  const updateHeatmapDatasetSelection = (dataset, isSelected) => {
    if (isSelected) {
      setSelectedHeatmapDatasets(prev => [...prev, dataset]);
    } else {
      setSelectedHeatmapDatasets(prev => prev.filter(d => d !== dataset));
    }
  };

  const getHeatmapDatasets = () => {
    return selectedHeatmapDatasets;
  };

  return {
    selectedHeatmapDatasets,
    updateHeatmapDatasetSelection,
    getHeatmapDatasets,
    hideMarkersWithHeatmap,
    setHideMarkersWithHeatmap
  };
} 