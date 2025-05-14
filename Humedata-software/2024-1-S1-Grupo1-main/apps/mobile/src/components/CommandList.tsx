import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useStore from "@/utils/useStore"
import { router } from 'expo-router';
import { cn } from '@ui/utils';
import { Button } from './Button';
import { CustomCommand } from "@/utils/useStore"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Text } from '@/components/ui/text';


const MIN_COLUMN_WIDTHS = [50, 50];

export function CommandList() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const commands = useStore((state) => state.sensorCommands());
  const setSelectedCommand = useStore((state) => state.setSelectedCommand)

  const handleNewCommand = async () => {
    const newCommand: CustomCommand = {
      name: "cmd",
      value: ""
    }
    setSelectedCommand(newCommand)
    router.navigate("/home/command_configuration")
  }

  const columnWidths = React.useMemo(() => {
    return MIN_COLUMN_WIDTHS.map((minWidth) => {
      const evenWidth = width / MIN_COLUMN_WIDTHS.length;
      return evenWidth > minWidth ? evenWidth : minWidth;
    });
  }, [width]);

  const handleCommandPress = (cmd: CustomCommand) => {
    setSelectedCommand(cmd)
    router.navigate("/home/command_configuration")
  }

  return (
    <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false}>
      <Table aria-labelledby='invoice-table'>
        <TableHeader>
          <TableRow>
            <TableHead className='px-0.5' style={{ width: columnWidths[0] }}>
              <Text>Nombre</Text>
            </TableHead>
            <TableHead style={{ width: columnWidths[1] }}>
              <Text>Valor sin prefijo</Text>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <FlashList
            data={commands}
            estimatedItemSize={25}
            contentContainerStyle={{
              paddingBottom: insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: command, index }) => {
              return (
                <TableRow
                  key={command.name}
                  className={cn(index % 2 === 0 ? 'bg-gray-200' : 'bg-white')}
                  onPress={
                    () => {
                      handleCommandPress(command)
                    }
                  }
                >
                  <TableCell style={{ width: columnWidths[0] }}>
                    <Text>{command.name}</Text>
                  </TableCell>
                  <TableCell style={{ width: columnWidths[1] }}>
                    <Text>{command.value}</Text>
                  </TableCell>
                </TableRow>
              );
            }}
            ListFooterComponent={() => {
              return (
                <>
                  <Button 
                    onPress={() => {
                      handleNewCommand()
                    }}
                    label="+"
                    className="bg-gray-500 w-1/4 mt-2"/>
                </>
              );
            }}
          />
        </TableBody>
      </Table>
    </ScrollView>
  );
}
