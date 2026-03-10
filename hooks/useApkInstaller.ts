import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform, Alert } from 'react-native';
import { apiClient } from '../config/axios.config';
import { API_URL } from '../config/envs.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPackageInstalled } from './usePackageCheck';

export function useApkInstaller() {
  const [installing, setInstalling] = useState(false);

  /**
   * Downloads and launches the APK installer intent.
   * After the intent returns, verifies if the app was actually installed.
   * Returns true only if the app is confirmed installed on device.
   */
  const installApk = async (buildId: string, packageName?: string): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      Alert.alert('Error', 'La instalacion de APKs solo esta disponible en Android');
      return false;
    }

    try {
      setInstalling(true);

      const token = await AsyncStorage.getItem('@auth_token');

      // Get signed download URL from server
      const response = await fetch(`${API_URL}/builds/${buildId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to get download URL');
      let { url: signedUrl } = await response.json();

      // The server may return localhost URLs (local storage mode).
      // Android emulator can't reach host via localhost — replace with 10.0.2.2
      if (Platform.OS === 'android') {
        signedUrl = signedUrl.replace('://localhost:', '://10.0.2.2:');
      }

      const downloadDir = FileSystem.cacheDirectory + 'apks/';
      const downloadPath = `${downloadDir}app-${buildId}.apk`;

      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      }

      // Download directly from R2
      const { uri } = await FileSystem.downloadAsync(signedUrl, downloadPath);

      const contentUri = await FileSystem.getContentUriAsync(uri);

      // Launch the Android package installer
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/vnd.android.package-archive'
      });

      // After installer returns, verify if the package is actually installed
      if (packageName) {
        const installed = await isPackageInstalled(packageName);
        if (installed) {
          // Register installation on server only if confirmed
          try {
            await apiClient.post('/installations', {
              buildId,
              status: 'installed'
            });
          } catch {
            // Non-critical
          }
          setInstalling(false);
          return true;
        }
      }

      // Could not verify — user may have cancelled
      setInstalling(false);
      return false;
    } catch (error) {
      console.error('Error installing APK:', error);
      setInstalling(false);
      Alert.alert(
        'Error de instalacion',
        'No se pudo instalar la aplicacion. Intentalo de nuevo.'
      );
      return false;
    }
  };

  return {
    installing,
    installApk
  };
}
