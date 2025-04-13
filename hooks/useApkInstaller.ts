// hooks/useApkInstaller.ts
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform, Alert } from 'react-native';
import { apiClient } from '../config/axios.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useApkInstaller() {
  const [installing, setInstalling] = useState(false);
  const API_URL = 'http://192.168.1.103:3000/api';

  const installApk = async (buildId: string): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      Alert.alert('Error', 'La instalación de APKs solo está disponible en Android');
      return false;
    }

    try {
      setInstalling(true);

      await apiClient.post('/installations', {
        buildId,
        status: 'installed'
      });

      const token = await AsyncStorage.getItem('@auth_token');

      const downloadUrl = `${API_URL}/builds/${buildId}/download`;
      const downloadDir = FileSystem.cacheDirectory + 'apks/';
      const downloadPath = `${downloadDir}app-${buildId}.apk`;

      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      }

      console.log(`Descargando desde: ${downloadUrl}`);
      const { uri } = await FileSystem.downloadAsync(downloadUrl, downloadPath, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log(`APK descargado en: ${uri}`);

      const contentUri = await FileSystem.getContentUriAsync(uri);
      console.log(`Content URI: ${contentUri}`);

      const result = await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/vnd.android.package-archive'
      });

      console.log('Instalador iniciado con resultado:', result);

      setInstalling(false);
      return true;
    } catch (error) {
      console.error('Error al instalar APK:', error);
      setInstalling(false);
      Alert.alert(
        'Error de instalación', 
        'No se pudo instalar la aplicación. Por favor, inténtalo de nuevo.'
      );
      return false;
    }
  };

  return {
    installing,
    installApk
  };
}