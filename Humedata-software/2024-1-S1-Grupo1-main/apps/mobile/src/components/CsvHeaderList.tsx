import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useStore, { CsvHeader } from "@/utils/useStore"
import { IconButton } from './IconButton';
import { Input } from './Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Text } from '@/components/ui/text';


const MIN_COLUMN_WIDTHS = [70, 10];

export function CsvHeaderList() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const currentSensor = useStore((state) => state.currentSensor);
  const updateCsvHeader = useStore((state) => state.updateCsvHeader);
  const deleteCsvHeader = useStore((state) => state.deleteCsvHeader);
  const [temporalHeaders, setTemporalHeaders] = React.useState<CsvHeader[]>(currentSensor?.csvHeaders || []);

  const columnWidths = React.useMemo(() => {
    return MIN_COLUMN_WIDTHS.map((minWidth) => {
      const evenWidth = width / MIN_COLUMN_WIDTHS.length;
      return evenWidth > minWidth ? evenWidth : minWidth;
    });
  }, [width]);

  const lastId = currentSensor?.csvHeaders?.length ? currentSensor?.csvHeaders[currentSensor.csvHeaders.length - 1].id : 0;

  React.useEffect(() => {
    setTemporalHeaders(currentSensor?.csvHeaders || []);
  }, [currentSensor]);

  const handleTemporalHeaderChange = (header: CsvHeader, value: string) => {
    const findedHeader = temporalHeaders.find((h) => h.id === header.id);
    if (!findedHeader){
      const newHeader = header
      newHeader.name = value;
      setTemporalHeaders([...temporalHeaders, newHeader]);
      return;
    }
    findedHeader.name = value;
    setTemporalHeaders([...temporalHeaders]);
  }
  const saveHeader = (header: CsvHeader) => {
    if (!currentSensor) return;
    console.log("Saving header", header)
    updateCsvHeader(currentSensor, header);
  }

  const handleCsvDelete = (header: CsvHeader) => {
    if (!currentSensor) return;
    deleteCsvHeader(currentSensor, header);
  }

  const handleNewHeader = () => {
    if (!currentSensor) return;
    console.log("Updating headers")
    updateCsvHeader(currentSensor, {
      id: lastId + 1,
      name: 'Columna',
    });
  }

  const renderItem = React.useCallback(({ item: header, index }) => {
    return (
      <TableRow key={header.id} className={index % 2 === 0 ? 'bg-gray-200' : 'bg-white'}>
        <TableCell style={{ width: columnWidths[0] }}>
          <Input
            value={header.name}
            onChangeText={(value) => handleTemporalHeaderChange(header, value)}
          />
        </TableCell>
        <TableCell>
          <IconButton icon="check" onPress={() => saveHeader(header)}
          />
        </TableCell>
        <TableCell>
          <IconButton icon="delete" onPress={() => handleCsvDelete(header)} 
            className='bg-red-400'
          />
        </TableCell>
      </TableRow>
    );
  }, [columnWidths, handleTemporalHeaderChange, saveHeader, handleCsvDelete]);

  return (
    <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false}>
      <Table aria-labelledby='invoice-table'>
        <TableHeader>
          <TableRow>
            <TableHead className='px-0.5' style={{ width: columnWidths[0] }}>
              <Text>Nombre</Text>
            </TableHead>
            <TableHead className='px-0.5' style={{ width: columnWidths[1] }}>
            </TableHead>
            <TableHead className='px-0.5' style={{ width: columnWidths[1] }}>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <FlashList
            data={temporalHeaders}
            estimatedItemSize={25}
            contentContainerStyle={{
              paddingBottom: insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            ListFooterComponent={() => {
              return (
                <>
                  <IconButton
                    icon="add"
                    onPress={() => {
                      handleNewHeader();
                    }}
                    className="bg-gray-500"
                  />
                </>
              );
            }}
          />
        </TableBody>
      </Table>
    </ScrollView>
  );
}

