# APKFLY Android Client

Este proyecto es el cliente de una aplicación similar a TestFlight, pero para dispositivos Android. Permite a los usuarios subir y distribuir APKs, así como instalar aplicaciones de orígenes desconocidos, especialmente aquellas subidas por el usuario o su equipo de desarrollo.

## Tecnologías

- **React Native**: Framework para el desarrollo de aplicaciones móviles nativas.
- **Expo**: Herramienta de desarrollo de aplicaciones React Native que facilita la configuración y la creación de builds.
- **NativeWind**: Librería de utilidades de estilos basada en TailwindCSS para React Native, que permite diseñar interfaces de usuario de manera rápida y eficiente.

## Funcionalidades

- Subir distribuciones de aplicaciones APK.
- Permitir a los usuarios descargar y probar aplicaciones desde orígenes desconocidos.
- Soporte para múltiples versiones de aplicaciones.
- Interfaz de usuario responsiva y fácil de usar.

## Instalación

### Requisitos previos

Asegúrate de tener instalados los siguientes programas en tu sistema:

- **Node.js** (versión 16 o superior)
- **Expo CLI**: Si no lo tienes instalado, puedes hacerlo con el siguiente comando:
  ```bash
  npm install -g expo-cli
  ```
- **Android Studio** (para emular el dispositivo Android)

### Pasos para la instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/testflight-android-client.git
   cd testflight-android-client
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo con Expo:
   ```bash
   expo start
   ```

4. Escanea el código QR con tu aplicación Expo Go o ejecuta en un emulador de Android.

## Uso

- Los usuarios pueden subir sus APKs a un servidor de almacenamiento (configurable) y generar links para ser descargados.
- La interfaz permite visualizar una lista de las aplicaciones disponibles, ver detalles y proceder con la instalación.
- Se manejan versiones de las aplicaciones para facilitar las pruebas de nuevas actualizaciones.

## Contribuir

1. Haz un fork de este repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -am 'Añadir nueva funcionalidad'`).
4. Haz push a tu rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.


