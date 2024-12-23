import React from "react"
import ChartsCheckbox from "./charts-checkbox"
import { FilterTimeRange } from "../filter-by-time-range"

interface FilterDataChartsProps {
  selectedZones: string[];
  selectedCharts: string[];
  setSelectedCharts: React.Dispatch<React.SetStateAction<string[]>>;
  startDate: Date | undefined;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  endDate: Date | undefined;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  quickRange: string | undefined;
  setQuickRange: React.Dispatch<React.SetStateAction<string | undefined>>;
  handleVisualizeCharts: () => void;
}

const FilterDataCharts: React.FC<FilterDataChartsProps> = ({
  selectedZones,
  selectedCharts,
  setSelectedCharts,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  quickRange,
  setQuickRange,
  handleVisualizeCharts,
}) => {

  return (
    <div className="flex flex-row pt-5 space-x-5">
      <ChartsCheckbox 
        onParameterChange={setSelectedCharts} 
        selectedZones={selectedZones}
      />
      <FilterTimeRange 
        onRangeChange={(start, end, range) => {
          setStartDate(start) 
          setEndDate(end) 
          setQuickRange(range)
          handleVisualizeCharts()
        }} 
      />
    </div>
  )
}

export default FilterDataCharts