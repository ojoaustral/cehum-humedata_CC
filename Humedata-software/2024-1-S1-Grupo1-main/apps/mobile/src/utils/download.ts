import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { TerminalOutput } from '@/components/Terminal';
import { Sensor } from './useStore';
import { outputToText } from '@/components/Terminal/TerminalOutputView';


export const downloadTerminalOutput = async (terminalOutput: TerminalOutput[], sensor: Sensor) => {
  const file = terminalOutput.map((output) => outputToText(output)).join("\n");
  const fileName = `${sensor.name}_log_${new Date().toISOString()}.txt`;
  const fileUri = FileSystem.cacheDirectory + fileName;
  
  await FileSystem.writeAsStringAsync(fileUri, file);
  
  await Sharing.shareAsync(fileUri, { dialogTitle: `Resultado Sensor ${sensor.name}` });
}
