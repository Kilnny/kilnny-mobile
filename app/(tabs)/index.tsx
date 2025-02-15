import { useEffect, useState } from "react";
import { FlatList, RefreshControl } from "react-native";
import AppCard from "@/components/AppCard";
import { MyView, MyText } from "@/components/Themed";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FontAwesome } from "@expo/vector-icons";
import { View } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import SkeletonCard from "@/components/SkeletonCard";

const initialApps = [
  {
    id: 1,
    name: "App One",
    version: "1.0.0",
    description: "Description for App One",
    picture:
      "https://cdn.pixabay.com/photo/2015/09/10/21/53/fractal-935011_640.jpg",
    state: "hasUpdate",
    developer: "Developer One",
    releaseDate: "2021-01-01",
    size: "10MB",
    whatToTest: "Test One, Test Two, Test Three",
  },
  {
    id: 2,
    name: "App Two",
    version: "1.0.0",
    description: "Description for App Two",
    picture:
      "https://cdn.pixabay.com/photo/2012/03/02/12/41/fractal-21236_640.jpg",
    state: "noInstalled",
    developer: "Developer One",
    releaseDate: "2021-01-01",
    size: "10MB",
    whatToTest: "Test One, Test Two, Test Three",
  },
  {
    id: 3,
    name: "App Three",
    version: "1.0.0",
    description: "Description for App Three",
    picture:
      "https://cdn.pixabay.com/photo/2019/09/13/19/18/coffee-4474690_640.jpg",
    state: "noInstalled",
    developer: "Developer One",
    releaseDate: "2021-01-01",
    size: "10MB",
    whatToTest: "Test One, Test Two, Test Three",
  },
  {
    id: 4,
    name: "App Four",
    version: "1.0.0",
    description: "Description for App Four",
    picture:
      "https://cdn.pixabay.com/photo/2015/09/10/21/54/purple-935012_640.jpg",
    state: "noInstalled",
    developer: "Developer One",
    releaseDate: "2021-01-01",
    size: "10MB",
    whatToTest: "Test One, Test Two, Test Three",
  },
];

export default function TabOneScreen() {
  const [apps, setApps] = useState(initialApps);
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const iconColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const [isLoading, setIsLoading] = useState(true);

  const handleButtonClick = (id: number) => {
    setApps((prevApps) =>
      prevApps.map((app) =>
        app.id === id
          ? {
              ...app,
              state:
                app.state === "noInstalled" || app.state === "hasUpdate"
                  ? "installed"
                  : app.state,
            }
          : app
      )
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setApps(initialApps);
      setRefreshing(false);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    setTimeout(() => {
      setApps(initialApps);
      setIsLoading(false);
    }, 2000);
  }, []);

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
              onButtonClick={() => handleButtonClick(item.id)}
              state={item.state}
              developer={item.developer}
              releaseDate={item.releaseDate}
              size={item.size}
              whatToTest={item.whatToTest}
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </MyView>
  );
}