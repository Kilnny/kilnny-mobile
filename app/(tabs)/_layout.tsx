import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/auth.context';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user } = useAuth();
  const isDark = colorScheme === 'dark';

  const navigateToUserSettings = () => {
    router.push("/(modals)/profile");
  };

  const avatarBg = isDark ? '#333' : '#f0f0f0';
  const avatarText = isDark ? '#fff' : '#000';
  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
        headerShown: true,
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ApkFly',
          tabBarShowLabel: false,
          tabBarBackground: () => <View style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }} />,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Pressable
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: avatarBg, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}
              onPress={navigateToUserSettings}
            >
              <Text style={{ color: avatarText, fontWeight: 'bold', fontSize: 15 }}>{initial}</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Notificaciones',
          tabBarShowLabel: false,
          tabBarBackground: () => <View style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }} />,
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
        }}
      />
    </Tabs>
  );
}