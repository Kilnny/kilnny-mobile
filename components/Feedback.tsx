import React, { useState } from "react";
import { MyText, MyView } from "./Themed";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

interface FeedbackProps {
  onClose?: () => void;
}

const Feedback: React.FC<FeedbackProps> = ({ onClose }) => {
  const [feedback, setFeedback] = useState("");
  const colorScheme = useColorScheme();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;

  return (
    <MyView style={styles.container}>
      <View style={styles.header}>
        <MyText style={styles.headerText}>Feedback</MyText>
      </View>

      <Text style={styles.description}>
        ¡Hola! 👋 Nos encantaría saber qué piensas sobre nuestra app. Ya sea que
        tengas una idea brillante, una queja épica, o simplemente quieras decir
        "¡Hola!", estamos aquí para escucharte. Así que no seas tímido, ¡déjanos
        tu feedback y hagamos que esta app sea aún más increíble juntos! 🚀
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          multiline
          value={feedback}
          onChangeText={setFeedback}
          placeholder="Escribe tu feedback aquí..."
          style={[styles.textInput, { color: textColor }]}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: textColor }]}
        onPress={() => {
          console.log(feedback);
          onClose?.();
        }}
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
          Send HeadShot!
        </MyText>
      </TouchableOpacity>
    </MyView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
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
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Feedback;
