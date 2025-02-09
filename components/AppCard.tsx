import React from "react";
import { TouchableOpacity, Image, View } from "react-native";
import { MyText, MyView } from "./Themed";

interface AppCardProps {
  name: string;
  description: string;
  buttonText: React.ReactNode;
  picture: string;
  onButtonClick: () => void;
  hasUpdate: boolean;
  children?: React.ReactNode;
}

const AppCard: React.FC<AppCardProps> = ({
  name,
  description,
  buttonText,
  onButtonClick,
  picture,
  hasUpdate,
}) => {
  return (
    <MyView
      style={{ justifyContent: "space-between", marginTop: 15, flexDirection: 'row', marginHorizontal: 8, padding: 8 }}
      border
      shadow={true}
      className="items-center rounded-lg"
    >
      <View style={{flexDirection: 'row'}} className="flex-row items-center">
        <Image source={{ uri: picture }} style={{ width: 50, height: 50, backfaceVisibility: 'hidden', borderRadius: 200}} />
        <MyText style={{marginLeft: 10}} className="font-bold text-xl">{name}</MyText>
      </View>
      <TouchableOpacity
        className="text-white py-2 px-4 rounded"
        onPress={onButtonClick}
      >
        <MyText className="text-center">{hasUpdate ? "Update" : buttonText}</MyText>
      </TouchableOpacity>
    </MyView>
  );
};

export default AppCard;