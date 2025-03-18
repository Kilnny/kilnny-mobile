import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

export default function ModalsLayout() {
  
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        presentation: "modal",
        headerShadowVisible: false,
        // Deshabilitar animaciones para reducir problemas de navegación
        animation: Platform.OS === 'ios' ? 'default' : 'none',
      }}
    />
  );
}