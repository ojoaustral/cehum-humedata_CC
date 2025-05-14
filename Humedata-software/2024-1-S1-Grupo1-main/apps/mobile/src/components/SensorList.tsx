import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useStore from "@/utils/useStore"
import { Sensor } from '@/utils/useStore';
import { router } from 'expo-router';
import { cn } from '@ui/utils';
import { Button } from './Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Text } from '@/components/ui/text';
import { View } from 'react-native-animatable';


const MIN_COLUMN_WIDTHS = [50, 50, 50];

export function SensorList() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sensorList = useStore((state) => state.sensors);
  const setSensor = useStore((state) => state.setCurrentSensor);

  const handleNewSensor = async () => {
    const newSensor: Sensor = {
      name: "Sensor",
      prefix: "ns_",
      readingFormat: "csv",
      csvHeaders: [],
    }
    setSensor(newSensor)
    router.navigate("/home/sensor_configuration")
  }

  const columnWidths = React.useMemo(() => {
    return MIN_COLUMN_WIDTHS.map((minWidth) => {
      const evenWidth = width / MIN_COLUMN_WIDTHS.length;
      return evenWidth > minWidth ? evenWidth : minWidth;
    });
  }, [width]);

  const handleSensorPress = (sensor: Sensor) => {
    setSensor(sensor)
    router.navigate("/home/sensor_configuration")
  }

  return (
    <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false}>
      <Table className='w-10/12' aria-labelledby='invoice-table'>
        <TableHeader>
          <TableRow>
            <TableHead className='px-0.5' style={{ width: columnWidths[0] }}>
              <Text>Nombre</Text>
            </TableHead>
            <TableHead style={{ width: columnWidths[1] }}>
              <Text>Prefijo</Text>
            </TableHead>
            <TableHead style={{ width: columnWidths[2] }}>
              <Text>Formato</Text>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <FlashList
            data={sensorList}
            estimatedItemSize={25}
            contentContainerStyle={{
              paddingBottom: insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: sensor, index }) => {
              return (
                <TableRow
                  key={sensor.name}
                  className={cn(index % 2 === 0 ? 'bg-gray-200' : 'bg-white')}
                  onPress={
                    () => {
                      handleSensorPress(sensor)
                    }
                  }
                >
                  <TableCell style={{ width: columnWidths[0] }}>
                    <Text>{sensor.name}</Text>
                  </TableCell>
                  <TableCell style={{ width: columnWidths[1] }}>
                    <Text>{sensor.prefix}</Text>
                  </TableCell>
                  <TableCell style={{ width: columnWidths[2] }}>
                    <Text>{sensor.readingFormat.toString()}</Text>
                  </TableCell>
                </TableRow>
              );
            }}
            ListFooterComponent={() => {
              return (
                <>
                  <View className="flex justify-center items-center">
                    <Button 
                      onPress={() => {
                        handleNewSensor()
                      }}
                      label="+"
                      className="bg-primary w-1/2 mt-4"/>
                  </View>
                </>
              );
            }}
          />
        </TableBody>
      </Table>
    </ScrollView>
  );
}
