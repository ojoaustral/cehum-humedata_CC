# Humedatos Mobile

## Node Modules
Para que la app compile en linux tenemos que hacer un soft-link de los modulos del proyecto raiz a la carpeta de la app
```bash
ln -sf path_to_root/node_modules path_to_root/apps/mobile/

```
El path_to_root es la carpeta donde se encuentra el proyecto raiz, y debe ser un path absoluto,
ejemplo:
```bash
ln -sf /home/user/humedatos/node_modules /home/user/humedatos/apps/mobile/
```

## Setup
- Node 18 ([nvm](https://github.com/nvm-sh/nvm))
```bash
nvm use
```
- Instalar dependencias
```bash
pnpm install --check-files
```

### JAVA
Para poder compilar la app en android es necesario tener instalado el JDK de java 17
#### JENV
Para instalar el JDK de java 17 se puede utilizar jenv

```bash
git clone https://github.com/jenv/jenv.git ~/.jenv

```
Agregar al .bashrc o .zshrc

```bash
export PATH="$HOME/.jenv/bin:$PATH"
eval "$(jenv init -)"
```
Finalmente revisar con
```bash
jenv doctor
```

#### OpenJDK 17

```bash
wget https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz
tar xvf openjdk-17.0.2_linux-x64_bin.tar.gz
sudo mv jdk-17.0.2 /opt/
jenv add /opt/jdk-17.0.2
jenv global 17.0.2
```
### Build
```bash
npx expo prebuild
npx expo run:android
```

## Run
- General
```bash
pnpm dev
```
- Android
```bash
pnpm android
```
- IOS
```bash
pnpm ios
```

## Emulators
### Android
- En caso de querer un simulador ver Android Studio [emulador](https://docs.expo.dev/workflow/android-studio-emulator/)
- En caso de tener un Android fisico bajarse la app de Expo y escanear el QR
#### Copiar pantalla
Existe un comando para poder replicar la pantalla de tu android y ver los cambios en tiempo real
```bash
scrcpy -b2M
```
Se puede instalar con el gestor de paquetes de tu sistema operativo
- Es necesario tener habilitado el modo desarrollador en el dispositivo

### IOS
- En caso de tener un Mac ver el [simulador](https://docs.expo.dev/workflow/ios-simulator/)
- En caso de tener un iPhone fisico bajarse la app de Expo y escanear el QR


## Arduino
- Se probo con un Arduino UNO y un modulo HC-06

## TODO
- [ ] Agregar configuraciones de usuario para los ChartData[] de la app
