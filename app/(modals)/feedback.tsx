import React, { useState, useRef, useEffect } from "react";
import { MyText, MyView } from "@/components/Themed";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  TouchableWithoutFeedback,
  Keyboard,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { apiClient } from "@/config/axios.config";
import { t } from "@/i18n";

export default function FeedbackModal() {
  const { buildId, projectName } = useLocalSearchParams<{ buildId: string; projectName: string }>();
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const colorScheme = useColorScheme();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Manejar eventos clave y navegación
  useEffect(() => {
    const keyboardWillShowSub = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsEditing(true)
    );
    const keyboardWillHideSub = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsEditing(false)
    );

    // Prevenir navegación con botón atrás físico si estamos editando
    const backAction = () => {
      if (isEditing) {
        Keyboard.dismiss();
        return true; // Evita navegación
      }
      return false; // Permite navegación normal
    };

    const backHandlerSub = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      keyboardWillShowSub.remove();
      keyboardWillHideSub.remove();
      backHandlerSub.remove();
    };
  }, [isEditing]);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert(t.common.error, t.feedback.emptyError);
      return;
    }
    if (!buildId) {
      Alert.alert(t.common.error, t.feedback.noBuildError);
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/feedback', {
        content: feedback.trim(),
        buildId,
      });
      Keyboard.dismiss();
      Alert.alert(t.feedback.sent, t.feedback.sentDesc, [
        { text: t.common.ok, onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error sending feedback:', error);
      Alert.alert(t.common.error, t.feedback.sendFailed);
    } finally {
      setSubmitting(false);
    }
  };

  // Manejadores de eventos para el TextInput
  const handleInputFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsEditing(true);
    // Importante: prevenir que el evento de focus se propague
    e.stopPropagation?.();
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor: colorScheme === "dark" ? "#000" : "#fff" }}>
        <Stack.Screen
          options={{
            title: t.feedback.title,
            presentation: "modal",
            headerShadowVisible: false,
            animation: "none", // Desactivar animaciones para evitar problemas
            headerStyle: {
              backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
            },
          }}
        />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <MyView style={styles.container}>
            <Text style={styles.description}>
              {t.feedback.description}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                multiline
                value={feedback}
                onChangeText={setFeedback}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={t.feedback.placeholder}
                style={[styles.textInput, { color: textColor }]}
                textAlignVertical="top"
                autoComplete="off"
                spellCheck={false}
                autoCorrect={false}
                keyboardType="default"
                returnKeyType="default"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: textColor, opacity: submitting ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={submitting || !feedback.trim()}
            >
              {submitting ? (
                <ActivityIndicator color={textColor === Colors.light.text ? Colors.dark.text : Colors.light.text} />
              ) : (
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
                  {t.feedback.send}
                </MyText>
              )}
            </TouchableOpacity>
          </MyView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

// Estilos existentes...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: "gray",
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  textInput: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    minHeight: 200,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16, 
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});