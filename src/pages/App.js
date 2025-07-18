import React, { useState } from 'react';
import Map from '../components/Map';
import { AppHeader, StatisticsSection, ChartsSection } from '../components';
import { 
  useDatasetManagement, 
  useScoreRangeManagement, 
  useHeatmapManagement, 
  useStatsManagement 
} from '../hooks';

function App() {
  const [controlBarOpen, setControlBarOpen] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Custom hooks for state management
  const {
    csvFiles,
    selectedDatasets,
    setSelectedDatasets,
    datasetData,
    csvData,
    csvLoaded
  } = useDatasetManagement();

  const {
    datasetScoreRanges,
    updateDatasetScoreRange,
    getDatasetScoreRange,
    resetAllFilters
  } = useScoreRangeManagement(datasetData, selectedDatasets);

  const {
    selectedHeatmapDatasets,
    updateHeatmapDatasetSelection,
    getHeatmapDatasets,
    hideMarkersWithHeatmap,
    setHideMarkersWithHeatmap
  } = useHeatmapManagement(selectedDatasets);

  const {
    selectedStatsDataset,
    setSelectedStatsDataset,
    currentStatsData,
    selectedChartTypes,
    updateSelectedChartTypes
  } = useStatsManagement(datasetData, csvFiles);

  const handleChartTypeChange = (newTypes) => {
    updateSelectedChartTypes(newTypes);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <AppHeader 
        controlBarOpen={controlBarOpen} 
        setControlBarOpen={setControlBarOpen} 
      />

      <Map
        controlBarOpen={controlBarOpen}
        setControlBarOpen={setControlBarOpen}
        showChart={showChart}
        setShowChart={setShowChart}
        showStats={showStats}
        setShowStats={setShowStats}
        csvData={csvData}
        csvLoaded={csvLoaded}
        selectedDatasets={selectedDatasets}
        setSelectedDatasets={setSelectedDatasets}
        csvFiles={csvFiles}
        datasetData={datasetData}
        datasetScoreRanges={datasetScoreRanges}
        updateDatasetScoreRange={updateDatasetScoreRange}
        getDatasetScoreRange={getDatasetScoreRange}
        resetAllFilters={resetAllFilters}
        selectedHeatmapDatasets={selectedHeatmapDatasets}
        updateHeatmapDatasetSelection={updateHeatmapDatasetSelection}
        getHeatmapDatasets={getHeatmapDatasets}
        hideMarkersWithHeatmap={hideMarkersWithHeatmap}
        setHideMarkersWithHeatmap={setHideMarkersWithHeatmap}
      />

      {showStats && (
        <div style={{ marginTop: 20, padding: 20, backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
          <StatisticsSection
            currentStatsData={currentStatsData}
            selectedStatsDataset={selectedStatsDataset}
            setSelectedStatsDataset={setSelectedStatsDataset}
            csvFiles={csvFiles}
          />
          
          <ChartsSection
            currentStatsData={currentStatsData}
            selectedChartTypes={selectedChartTypes}
            setSelectedChartTypes={handleChartTypeChange}
          />
        </div>
      )}
    </div>
  );
}

export default App;
