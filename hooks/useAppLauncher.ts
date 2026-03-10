import { Alert, Platform } from 'react-native';
import { launchApp as nativeLaunchApp, uninstallApp as nativeUninstallApp } from '../modules/package-checker';
import { t } from '@/i18n';

export function useAppLauncher() {
  const openApp = async (packageName: string | undefined) => {
    if (!packageName) {
      Alert.alert(t.common.error, t.detail.openNotAvailable);
      return false;
    }

    if (Platform.OS !== 'android') return false;

    try {
      await nativeLaunchApp(packageName);
      return true;
    } catch {
      Alert.alert(t.common.error, t.detail.openNotAvailable);
      return false;
    }
  };

  const uninstallApp = async (packageName: string | undefined) => {
    console.log('[uninstallApp] called with packageName:', JSON.stringify(packageName));
    if (!packageName) {
      console.log('[uninstallApp] no packageName — aborting');
      Alert.alert(t.common.error, t.detail.openNotAvailable);
      return false;
    }

    if (Platform.OS !== 'android') return false;

    try {
      console.log('[uninstallApp] calling native uninstall for:', packageName);
      const result = await nativeUninstallApp(packageName);
      console.log('[uninstallApp] native result:', result);
      return true;
    } catch (error) {
      console.error('[uninstallApp] native error:', error);
      return false;
    }
  };

  return { openApp, uninstallApp };
}
