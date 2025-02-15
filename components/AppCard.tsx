import React from "react";
import { TouchableOpacity, Image, View, Pressable } from "react-native";
import { MyText, MyView } from "./Themed";
import { router } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

interface AppCardProps {
  id: number;
  name: string;
  version: string;
  description: string;
  buttonText: React.ReactNode;
  picture: string;
  onButtonClick: () => void;
  state: string;
  children?: React.ReactNode;
  developer?: string;
  releaseDate?: string;
  size?: string;
  whatToTest?: string;
}

const AppCard: React.FC<AppCardProps> = ({
  id,
  name,
  description,
  buttonText,
  version,
  onButtonClick,
  picture,
  state,
  developer,
  releaseDate,
  size,
  whatToTest,
}) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;

  const handlePress = () => {
    router.push({
      pathname: "/detail",
      params: {
        id: id.toString(),
        name,
        description,
        picture,
        version,
        developer,
        state,
        releaseDate,
        size,
        whatToTest,
      },
    });
  };

  return (
    <Pressable onPress={handlePress}>
      <MyView
        style={{
          justifyContent: "space-between",
          marginTop: 15,
          flexDirection: "row",
          marginHorizontal: 8,
          padding: 10,
        }}
        border
        shadow={true}
        className="items-center rounded-lg"
      >
        <View
          style={{ flexDirection: "row" }}
          className="flex-row items-center"
        >
          <Image
            source={{ uri: picture }}
            style={{
              width: 50,
              height: 50,
              backfaceVisibility: "hidden",
              borderRadius: 200,
            }}
          />
          <View>
            <MyText style={{ marginLeft: 10 }} className="font-bold text-lg">
              {name}
            </MyText>
            <MyText style={{ marginLeft: 10 }}>{version}</MyText>
          </View>
        </View>
        <TouchableOpacity
          className="text-white py-2 px-4 rounded"
          onPress={onButtonClick}
        >
          <MyText className="text-center" style={{ color: textColor }}>
            {state === "hasUpdate" ? "Update" : buttonText}
          </MyText>
        </TouchableOpacity>
      </MyView>
    </Pressable>
  );
};

export default AppCard;