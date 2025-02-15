import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyView } from '@/components/Themed';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const checkWelcomeStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('@hasSeenWelcome');
      setHasSeenWelcome(value === 'true');
    } catch (error) {
      console.error('Error checking welcome status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MyView style={{flex: 1}}>
        <ActivityIndicator />
      </MyView>
    );
  }

  if (hasSeenWelcome) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/welcome" />;
  }
}