import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { isPackageInstalled as nativeIsPackageInstalled } from '../modules/package-checker';

export async function isPackageInstalled(packageName: string | undefined): Promise<boolean> {
  if (Platform.OS !== 'android' || !packageName) return false;

  try {
    return await nativeIsPackageInstalled(packageName);
  } catch {
    return false;
  }
}

export function useAppForeground(callback: () => void) {
  const appState = useRef(AppState.currentState);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        savedCallback.current();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);
}
