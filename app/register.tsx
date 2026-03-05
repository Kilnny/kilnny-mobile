import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MyView, MyText } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth.context';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '@/i18n';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(t.common.error, t.auth.fillAllFields);
      return;
    }

    setIsLoading(true);
    try {
      await register(email, name, password);
      router.replace(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      Alert.alert(t.common.error, error instanceof Error ? error.message : t.auth.registerFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const backgroundColor = colorScheme ? Colors[colorScheme].background : Colors.light.background;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
          />
          <MyText style={styles.title}>ApkFly</MyText>
          <MyText style={styles.subtitle}>{t.auth.createAccount}</MyText>
        </View>

        <MyView style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: 'gray' }]}
            placeholder={t.auth.name}
            placeholderTextColor="gray"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextInput
            style={[styles.input, { color: textColor, borderColor: 'gray' }]}
            placeholder={t.auth.email}
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={[styles.input, { color: textColor, borderColor: 'gray' }]}
            placeholder={t.auth.password}
            placeholderTextColor="gray"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: textColor }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={backgroundColor} />
            ) : (
              <MyText style={[styles.buttonText, { color: backgroundColor }]}>
                {t.auth.register}
              </MyText>
            )}
          </TouchableOpacity>
        </MyView>

        <View style={styles.footer}>
          <MyText style={styles.footerText}>{t.auth.alreadyHaveAccount}</MyText>
          <TouchableOpacity onPress={navigateToLogin}>
            <MyText style={[styles.footerLink, { color: '#1dc27d' }]}>
              {t.auth.login}
            </MyText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'gray',
  },
  inputContainer: {
    width: '100%',
    marginVertical: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    marginRight: 5,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
