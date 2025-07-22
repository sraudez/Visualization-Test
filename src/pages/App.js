import React, { useState } from 'react';
import Map from '../components/Map';
import { AppHeader, StatisticsSection, ChartsSection } from '../components';
import { 
  useDatasetManagement, 
  useScoreRangeManagement, 
  useHeatmapManagement, 
  useStatsManagement 
} from '../hooks';

/**
 * Styles for the main app container
 */
const appStyles = {
  container: {
    padding: 20,
    fontFamily: 'Arial, sans-serif'
  },
  statsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: '10px'
  }
};

/**
 * Main App component that orchestrates the application
 */
function App() {
  const [controlBarOpen, setControlBarOpen] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const datasetManagement = useDatasetManagement();
  const scoreRangeManagement = useScoreRangeManagement(
    datasetManagement.datasetData, 
    datasetManagement.selectedDatasets
  );
  const heatmapManagement = useHeatmapManagement(datasetManagement.selectedDatasets);
  const statsManagement = useStatsManagement(
    datasetManagement.datasetData,
    datasetManagement.csvFiles,
    scoreRangeManagement.datasetScoreRanges,
    datasetManagement.setSelectedDatasets
  );

  const handleChartTypeChange = (newTypes) => {
    statsManagement.updateSelectedChartTypes(newTypes);
  };

  const renderStatisticsSection = () => {
    if (!showStats) return null;

    return (
      <div style={appStyles.statsContainer}>
        <StatisticsSection
          currentStatsData={statsManagement.currentStatsData}
          selectedStatsDataset={statsManagement.selectedStatsDataset}
          setSelectedStatsDataset={statsManagement.setSelectedStatsDataset}
          csvFiles={datasetManagement.csvFiles}
          datasetScoreRanges={scoreRangeManagement.datasetScoreRanges}
          datasetData={datasetManagement.datasetData}
        />
        
        <ChartsSection
          currentStatsData={statsManagement.currentStatsData}
          selectedChartTypes={statsManagement.selectedChartTypes}
          setSelectedChartTypes={handleChartTypeChange}
          selectedDatasets={datasetManagement.selectedDatasets}
          datasetData={datasetManagement.datasetData}
          datasetScoreRanges={scoreRangeManagement.datasetScoreRanges}
          selectedStatsDataset={statsManagement.selectedStatsDataset}
        />
      </div>
    );
  };

  return (
    <div style={appStyles.container}>
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
        csvData={datasetManagement.csvData}
        csvLoaded={datasetManagement.csvLoaded}
        selectedDatasets={datasetManagement.selectedDatasets}
        setSelectedDatasets={datasetManagement.setSelectedDatasets}
        csvFiles={datasetManagement.csvFiles}
        datasetData={datasetManagement.datasetData}
        datasetScoreRanges={scoreRangeManagement.datasetScoreRanges}
        updateDatasetScoreRange={scoreRangeManagement.updateDatasetScoreRange}
        getDatasetScoreRange={scoreRangeManagement.getDatasetScoreRange}
        resetAllFilters={scoreRangeManagement.resetAllFilters}
        selectedHeatmapDatasets={heatmapManagement.selectedHeatmapDatasets}
        updateHeatmapDatasetSelection={heatmapManagement.updateHeatmapDatasetSelection}
        getHeatmapDatasets={heatmapManagement.getHeatmapDatasets}
        hideMarkersWithHeatmap={heatmapManagement.hideMarkersWithHeatmap}
        setHideMarkersWithHeatmap={heatmapManagement.setHideMarkersWithHeatmap}
        selectedChartTypes={statsManagement.selectedChartTypes}
        currentStatsData={statsManagement.currentStatsData}
      />

      {renderStatisticsSection()}
    </div>
  );
}

export default App;
