import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { VictoryChart, VictoryLine, VictoryAxis, VictoryScatter } from "victory-native";
import { trpc } from "@trpc-client/index";
import icon from "@/assets/images/icon.png";
import * as Animatable from "react-native-animatable";
import useStore from "@/utils/useStore";

export default function Chart({ dateStart, dateEnd, dataType, zoneIds, isLine }) {
  const [response, setResponse] = useState(null);
  const currentDataChart = useStore((state) => state.chartData).find((data) => data.trpcKey === dataType);

  const colors = ["#008cc0", "#93c020", "#2980B9", "#3498DB", "#1ABC9C", "#2ECC71", "#F1C40F", "#F39C12"];

  const shouldFetchData = Boolean(dateStart && dateEnd && dataType && zoneIds && zoneIds.length > 0);

  const { data, isLoading, isError, refetch } = trpc.zoneTimeSeries.getTimeSeriesByZones.useQuery(
    {
      zones_id: zoneIds,
      parameters: [dataType],
      start_date: new Date(dateStart),
      end_date: new Date(dateEnd),
    },
    {
      enabled: false, // Deshabilita la consulta por defecto
    }
  );

  let axis = ""
  if (dateStart && dateEnd) {
    const start = new Date(dateStart)
    const end = new Date(dateEnd)
    const difference = end.getTime() - start.getTime()
    if (difference/(1000*60*60*24) < 365 ) {
      if (difference/(1000*60*60*24) < 30 ) {
        if (difference/(1000*60*60*24) < 1 ) {
          axis = "HourMinutes"
        } else {
          axis = "DayHour"
        }
      } else {
        axis = "MonthDay"
      }
    } else {
      axis = "YearMonth"
    }
  }

  const handleAxis = (d) => {
    if (axis == "HourMinutes") {
      let hours = `${new Date(d).getHours()}`
      if (hours.length < 2) {
        hours = "0" + hours
      }
      let minutes = `${new Date(d).getMinutes()}`
      if (minutes.length < 2) {
        minutes = "0" + minutes
      }
      return(`[${hours}:${minutes}]`)
    }
    if (axis == "DayHour") {
      let hours = `${new Date(d).getHours()}`
      if (hours.length < 2) {
        hours = "0" + hours
      }
      return(`${new Date(d).getDate()} [${hours}:00]`)
    }
    if (axis == "MonthDay") {
      return(`${new Date(d).getDate()}-${new Date(d).getMonth()}`)
    }
    return(`${new Date(d).getMonth()}-${new Date(d).getFullYear()}`)
  }

  useEffect(() => {
    if (shouldFetchData) {
      refetch(); // Re-ejecuta la consulta cuando cambian las dependencias
    }
  }, [dateStart, dateEnd, dataType, zoneIds, shouldFetchData, refetch]);

  useEffect(() => {
    if (data) {
      setResponse(data);
    }
  }, [data]);

  if (!currentDataChart) {
    return null;
  }

  if (!shouldFetchData) {
    return (
      <View style={styles.centeredContainer} className="bg-gray-300 p-10 rounded mt-2">
        <Text>Por favor, proporciona las fechas de inicio, término y el tipo de datos</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <Animatable.Image
          animation="rotate"
          easing="linear"
          iterationCount="infinite"
          source={icon}
          style={styles.icon}
        />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Error loading data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {response && response[dataType] && (
        <VictoryChart style={{ parent: { width: "100%", height: "100%" } }}
          minDomain={currentDataChart.minY !== undefined ? {y: currentDataChart.minY} : undefined}
          maxDomain={currentDataChart.maxY !== undefined ? {y: currentDataChart.maxY} : undefined}
        >
          <VictoryAxis
            dependentAxis
            style={{
              grid: { stroke: "#F4F5F7", strokeWidth: 1.5 },
            }}
          />
          <VictoryAxis
            fixLabelOverlap={true}
            tickFormat={(d) => handleAxis(d)}
            style={{
              grid: { stroke: "#F4F5F7", strokeWidth: 1.5 },
            }}
          />
          {Object.keys(response[dataType].data).map((key, index) => {
            const value = response[dataType].data[key];
            const color = colors[index % colors.length];
            const filteredData = value
              .filter((item) => {
                const date = new Date(item.timestamp).getTime();
                return date >= new Date(dateStart).getTime() && date <= new Date(dateEnd).getTime();
              })
              .map((item) => ({
                x: new Date(item.timestamp).getTime(),
                y: item[dataType],
              }));

            return isLine ? (
              <VictoryLine
                key={key}
                style={{ data: { stroke: color }, parent: { border: "1px solid #ccc" } }}
                data={filteredData}
                interpolation="natural"
              />
            ) : (
              <VictoryScatter key={key} style={{ data: { fill: color } }} data={filteredData} />
            );
          })}
        </VictoryChart>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 100,
    height: 100,
    margin: 20,
  },
});
