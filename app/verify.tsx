import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
} from 'react-native';
import { MyView, MyText } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '@/config/axios.config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '@/i18n';

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const colorScheme = useColorScheme();
  const router = useRouter();

  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const backgroundColor = colorScheme ? Colors[colorScheme].background : Colors.light.background;
  const isDark = colorScheme === 'dark';

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');
    if (!digit && text.length > 0) return;

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      Alert.alert(t.common.error, t.verify.enterFullCode);
      return;
    }

    setIsVerifying(true);
    try {
      await apiClient.post('/auth/verify-code', { email, code: fullCode });
      Alert.alert(t.verify.verified, t.verify.verifiedDesc, [
        { text: t.verify.continue, onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error) {
      Alert.alert(t.common.error, error instanceof Error ? error.message : t.verify.invalidCode);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await apiClient.post('/auth/resend-verification', { email, source: 'mobile' });
      Alert.alert(t.verify.sent, t.verify.sentDesc);
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (error) {
      Alert.alert(t.common.error, t.verify.resendFailed);
    } finally {
      setIsResending(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

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
          <MyText style={styles.title}>{t.verify.title}</MyText>
          <MyText style={[styles.subtitle, { color: 'gray' }]}>
            {t.verify.subtitle}
          </MyText>
          <MyText style={[styles.email, { color: textColor }]}>{email}</MyText>
        </View>

        <View style={styles.codeContainer}>
          {Array.from({ length: CODE_LENGTH }).map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.codeInput,
                {
                  color: textColor,
                  borderColor: code[index] ? '#1dc27d' : isDark ? '#444' : '#ddd',
                  backgroundColor: isDark ? '#1c1c1c' : '#f9f9f9',
                },
              ]}
              value={code[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: textColor }]}
          onPress={handleVerify}
          disabled={isVerifying || code.join('').length !== CODE_LENGTH}
        >
          {isVerifying ? (
            <ActivityIndicator color={backgroundColor} />
          ) : (
            <MyText style={[styles.buttonText, { color: backgroundColor }]}>
              {t.verify.verify}
            </MyText>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <MyText style={styles.footerText}>{t.verify.didntReceive}</MyText>
          <TouchableOpacity onPress={handleResend} disabled={isResending}>
            {isResending ? (
              <ActivityIndicator size="small" color="#1dc27d" />
            ) : (
              <MyText style={[styles.footerLink, { color: '#1dc27d' }]}>
                {t.verify.resend}
              </MyText>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <MyText style={{ color: 'gray', fontSize: 14 }}>
            {t.verify.verifyLater}
          </MyText>
        </TouchableOpacity>
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
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
});
