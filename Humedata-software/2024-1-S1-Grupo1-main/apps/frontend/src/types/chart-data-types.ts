export interface RawMeasurement {
  timestamp: string;
  [key: string]: number | string;
}

export interface RawZoneData {
  [key: string]: RawMeasurement[]
}

export interface RawChartData {
  name: string;
  id: string;
  data: RawZoneData;
}

export interface RawChartDataCollection {
  [key: string]: RawChartData;
}

export interface Measurement {
  timestamp: number;
  [key: string]: number | string;
}

export interface ZoneData {
  [key: string]: Measurement[]
}

export interface ChartData {
  name: string;
  id: string;
  data: ZoneData;
  movingAverageData?: ZoneData;
}

export interface ChartDataCollection {
  [key: string]: ChartData;
}