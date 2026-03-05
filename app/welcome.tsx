import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyText, MyView } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { t } from '@/i18n';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('@hasSeenWelcome', 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Error setting welcome status:', error);
    }
  };

  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;

  return (
    <MyView style={styles.container}>
      <MyView style={styles.content}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.logo}
        />
        <MyText style={styles.title}>{t.welcome.title}</MyText>
        <MyText style={styles.description}>
          {t.welcome.description}
        </MyText>
      </MyView>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: textColor }]}
        onPress={handleGetStarted}
      >
        <MyText
          style={[
            styles.buttonText,
            {
              color:
                textColor === Colors.light.text
                  ? Colors.dark.text
                  : Colors.light.text,
            },
          ]}
        >
          {t.welcome.getStarted}
        </MyText>
      </TouchableOpacity>
    </MyView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
    lineHeight: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
