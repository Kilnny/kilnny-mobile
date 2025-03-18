import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const navigateToUserSettings = () => {
    router.push("/(modals)/profile");
  };

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
              className='w-10 h-10 flex items-center justify-center rounded-full bg-[#f0f0f0] mr-2'
              onPress={navigateToUserSettings}
            >
              <Text>L</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Settings',
          tabBarShowLabel: false,
          tabBarBackground: () => <View style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }} />,
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}