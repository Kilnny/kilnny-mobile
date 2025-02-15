import React from "react";
import { TouchableOpacity, View, ScrollView } from "react-native";
import { MyText, MyView } from "@/components/Themed";
import Icon from "@/components/Icon";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

const Welcome = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const handleStartNow = async () => {
    try {
      await AsyncStorage.setItem("@hasSeenWelcome", "true");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving welcome status:", error);
    }
  };

  const features = [
    {
      id: 1,
      type: "FontAwesome" as "FontAwesome",
      icon: "envelope-open",
      title: "Get access to the latest beta apps!",
      description:
        "Receive invitations and start testing new apps before they go public.",
    },
    {
      id: 2,
      type: "Entypo" as "Entypo",
      icon: "lab-flask",
      title: "Experience the latest features before anyone else.",
      description:
        "Join exclusive beta tests for cutting-edge apps and be the first to try them.",
    },
    {
      id: 3,
      type: "FontAwesome" as "FontAwesome",
      icon: "comments",
      title: "Your feedback matters!",
      description:
        "Share your thoughts and help developers improve apps with easy-to-submit feedback.",
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <MyView className="flex-1 p-10">
        <MyView className="mb-12">
          <MyText className="text-4xl font-bold mb-4">What is this?</MyText>
          <MyText className="text-2xl">
            How can this help me be more efficient?
          </MyText>
        </MyView>

        {features.map((feature) => (
          <MyView key={feature.id} className="flex-row items-center mb-8 mr-4">
            <Icon
              type={feature.type}
              name={feature.icon}
              size={32}
              color={textColor}
            />
            <MyView className="ml-4">
              <MyText className="text-xl font-semibold">{feature.title}</MyText>
              <MyText className="text-lg">{feature.description}</MyText>
            </MyView>
          </MyView>
        ))}

        <TouchableOpacity
          className="mt-12 bg-[#008db9] rounded-lg py-4 px-8 items-center"
          onPress={handleStartNow}
        >
          <MyText className="text-white text-lg font-semibold">Start now!</MyText>
        </TouchableOpacity>
      </MyView>
    </ScrollView>
  );
};

export default Welcome;