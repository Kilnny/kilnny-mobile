import React from "react";
import { StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { MyText, MyView } from "@/components/Themed";

export default function UserSettingsModal() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === "dark" ? "#000" : "#fff" }}>
      <Stack.Screen
        options={{
          title: "User Settings",
          presentation: "modal",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
          },
        }}
      />
      <MyView style={styles.container}>
        <MyText className="text-2xl font-bold mb-4">User Profile</MyText>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: textColor }]}
          onPress={() => router.back()}
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
            Close
          </MyText>
        </TouchableOpacity>
      </MyView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});