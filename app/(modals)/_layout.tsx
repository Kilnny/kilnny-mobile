import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        presentation: "modal",
        headerShadowVisible: false,
        animation: Platform.OS === 'ios' ? 'default' : 'none',
      }}
    />
  );
}
