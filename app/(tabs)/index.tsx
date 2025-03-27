import { FlatList, RefreshControl } from "react-native";
import AppCard from "@/components/AppCard";
import { MyView, MyText } from "@/components/Themed";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FontAwesome } from "@expo/vector-icons";
import { View } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import SkeletonCard from "@/components/SkeletonCard";
import { useApps } from "@/context/app-state.context";

export default function TabOneScreen() {
  const { apps, isLoading, refreshing, updateAppState, refreshApps } = useApps();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;

  return (
    <MyView className="flex-1">
      <View className="flex-row items-center justify-between m-4">
        <MyText className="text-xl font-bold">
          Available Apps for Testing
        </MyText>
        <AntDesign name="pluscircleo" size={24} color={iconColor} />
      </View>
      <FlatList
        data={isLoading ? Array(4).fill({}) : apps}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) =>
          isLoading ? (
            <SkeletonCard />
          ) : (
            <AppCard
              id={item.id}
              picture={item.picture}
              name={item.name}
              version={item.version}
              description={item.description}
              buttonText={
                item.state === "installed" ? (
                  <FontAwesome
                    name="check-circle"
                    size={24}
                    color={iconColor}
                  />
                ) : item.state === "hasUpdate" ? (
                  "Update"
                ) : (
                  "Install"
                )
              }
              onButtonClick={() => updateAppState(item.id)}
              state={item.state}
              developer={item.developer}
              releaseDate={item.releaseDate}
              size={item.size}
              whatToTest={item.whatToTest}
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshApps} />
        }
      />
    </MyView>
  );
}