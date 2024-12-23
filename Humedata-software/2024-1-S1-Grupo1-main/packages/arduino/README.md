# Arduino - Calibracion Humedat@s
## Descripción
Aqui se encuentran los archivos necesarios para la calibración de los sensores, actualmente se encuentran implementados los siguientes sensores:
- [x] PH (pH)
- [x] Conductividad (EC)
- [x] Redox (ORP)
- [x] Oxígeno Disuelto (DO)

Donde cada sensor tiene su carpeta con 2 archivos principales:
- {sensor}_Emulator.ino: Emulador del sensor, para poder probar el código sin tener el sensor físico.
- {sensor}_I2C.ino: Código para la calibración del sensor.

## Cargando el código

Para cargar el codigo es necesario tener instalado el IDE de Arduino, una vez instalado se debe de seguir los siguientes pasos:
- Descargar el repositorio.
- Abrir el sketch desde la carpeta packages/arduino
- Instalar los sensores:
    - En linux/OSX se puede instalar los sensores con el siguiente comando:
    ```bash
    ./install_sensors.sh all # Para instalar todos los sensores
    ./install_sensors.sh {sensor} # Para instalar un sensor en específico
    ./install_emulators.sh all # Para instalar todos los emuladores
    ./install_emulators.sh {sensor} # Para instalar un emulador en específico
    ```
    - En windows se debe copiar algun archivo ({sensor}_I2C.ino o {sensor}_Emulator.ino) a la carpeta de sketch de Arduino.

## Especificaciones Técnicas

Los factores claves para que el sensor de arduino funcione correctamente con la aplicacion son:
- **Baud Rate**: Se debe tener un baud rate iguales en la aplicacion y en el arduino.
- **Prefijo de los comandos**: Se debe tener un prefijo en los comandos para que el arduino pueda identificar a que sensor se esta refiriendo. Por ejemplo, si el prefijo es "ph_" y se envia el comando "ph_calibrate", el arduino sabra que se esta calibrando el sensor de pH.
- Se usa "\n" para indicar el final de un comando.
- La apliacion recibe el resultado directo del arduino para mostrarlo en la interfaz. Por lo que el comando de lectura debe ir en formato CSV o float sin caracteres especiales.
- El código actual usa el modulo HC-06 para la comunicación serial con un Arduino UNO. Este se conecta en los pines RX y TX del arduino.
- El código esta pensado para poder conectar varios sensores a un solo arduino, por lo que se debe de tener cuidado con los pines de comunicación de cada sensor.
