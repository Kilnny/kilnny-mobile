import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { MyText, MyView } from "@/components/Themed";
import { TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useApps } from "@/context/app-state.context";

export default function DetailsScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    description: string;
    picture: string;
    version: string;
    developer: string;
    state: string;
    releaseDate: string;
    size: string;
    whatToTest: string;
  }>();

  const { updateAppState, apps } = useApps();
  
  const currentApp = apps.find(app => app.id === Number(params.id));
  const currentState = currentApp?.state || params.state;

  const colorScheme = useColorScheme();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const router = useRouter();

  const navigateToFeedback = () => {
    router.push("/(modals)/feedback");
  };

  const handleInstallUpdate = () => {
    updateAppState(Number(params.id));
  };

  const renderButton = () => {
    if (currentState === "installed") {
      return <FontAwesome className="mt-2" name="check-circle" size={24} color={textColor} />;
    } else if (currentState === "hasUpdate") {
      return (
        <TouchableOpacity
          style={{ backgroundColor: textColor }}
          className="rounded-md px-6 py-2 mt-3"
          onPress={handleInstallUpdate}
        >
          <MyText
            style={{
              color:
                textColor === Colors.light.text
                  ? Colors.dark.text
                  : Colors.light.text,
            }}
            className="text-center"
          >
            Update
          </MyText>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={{ backgroundColor: textColor }}
          className="bg-gray-200 rounded-md px-6 py-2 mt-3"
          onPress={handleInstallUpdate}
        >
          <MyText
            style={{
              color:
                textColor === Colors.light.text
                  ? Colors.dark.text
                  : Colors.light.text,
            }}
            className="text-center"
          >
            Install
          </MyText>
        </TouchableOpacity>
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: colorScheme
            ? Colors[colorScheme].background
            : Colors.light.background,
        },
      ]}
      style={{ flex: 1 }}
    >
      <Stack.Screen
        options={{
          title: "",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colorScheme
              ? Colors[colorScheme].background
              : Colors.light.background,
          },
        }}
      />
      <MyView style={styles.header}>
        <Image source={{ uri: params.picture }} style={styles.appIcon} />
        <View style={styles.headerInfo}>
          <MyText className="text-2xl font-bold">{params.name}</MyText>
          <MyText className="text-gray-600">Version {params.version}</MyText>
          <MyText className="text-gray-600 mt-1">{params.developer}</MyText>
          {renderButton()}
        </View>
      </MyView>

      {/* El resto del componente sigue igual */}
      <MyView style={styles.section}>
        <TouchableOpacity onPress={navigateToFeedback} className="mb-6">
          <Text className="text-xl text-[#1dc27d]">Send Feedback</Text>
        </TouchableOpacity>

        <View className="mb-6">
          <MyText className="text-2xl font-bold mb-3">What to test?</MyText>
          <MyText className="text-gray-600 leading-6">
            {params.whatToTest}
          </MyText>
        </View>

        <View className="mb-6">
          <MyText className="text-2xl font-bold mb-3">Description</MyText>
          <MyText className="text-gray-600 leading-6">
            {params.description}
          </MyText>
        </View>

        <View>
          <MyText className="text-2xl font-bold mb-4">Information</MyText>
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <MyText className="text-lg">Developer</MyText>
              <MyText className="text-gray-600">{params.developer}</MyText>
            </View>
            <View className="flex-row justify-between">
              <MyText className="text-lg">Release Date</MyText>
              <MyText className="text-gray-600">{params.releaseDate}</MyText>
            </View>
            <View className="flex-row justify-between">
              <MyText className="text-lg">Version</MyText>
              <MyText className="text-gray-600">{params.version}</MyText>
            </View>
            <View className="flex-row justify-between">
              <MyText className="text-lg">Size</MyText>
              <MyText className="text-gray-600">{params.size}</MyText>
            </View>
          </View>
        </View>
      </MyView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    minHeight: Dimensions.get("window").height,
  },
  header: {
    flexDirection: "row",
    padding: 16,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  section: {
    padding: 16,
  },
});