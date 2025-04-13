import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  TextInput,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { MyText, MyView } from "@/components/Themed";
import { TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useApps } from "@/context/app-state.context";
import { useState, useEffect } from "react";
import { apiClient } from "@/config/axios.config";
import { Build, BuildState } from "@/types/projects";

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
    projectId: string; // Añadir projectId para buscar builds
  }>();

  const { updateAppState, apps } = useApps();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [filteredBuilds, setFilteredBuilds] = useState<Build[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const currentApp = apps.find((app) => app.id === Number(params.id));
  const currentState = currentApp?.state || params.state;

  const colorScheme = useColorScheme();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const router = useRouter();

  // Cargar las últimas builds al inicializar
  useEffect(() => {
    const fetchBuilds = async () => {
      if (!params.projectId) return;

      try {
        setLoading(true);
        const data = await apiClient.get(`/builds/project/${params.projectId}`);
        // Ordenamos por buildNumber descendente y tomamos las 5 últimas
        const latestBuilds = data
          .sort(
            (a: { buildNumber: number }, b: { buildNumber: number }) =>
              b.buildNumber - a.buildNumber
          )
          .slice(0, 5);

        setBuilds(latestBuilds);
        setFilteredBuilds(latestBuilds);
      } catch (error) {
        console.error("Error fetching builds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, [params.projectId]);

  // Filtrar builds basados en la búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBuilds(builds);
      return;
    }

    const filtered = builds.filter(
      (build) =>
        build.buildNumber.toString().includes(searchQuery) ||
        build.version.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredBuilds(filtered);
  }, [searchQuery, builds]);

  const navigateToFeedback = () => {
    router.push("/(modals)/feedback");
  };

  const handleInstallUpdate = () => {
    updateAppState(Number(params.id));
  };

  const handleInstallBuild = async (buildId: string) => {
    try {
      await apiClient.post(`/installations`, {
        buildId,
        status: "INSTALLING",
      });

      // Actualizar estado en UI
      setFilteredBuilds((prevBuilds) =>
        prevBuilds.map((build) =>
          build.id === buildId
            ? { ...build, state: BuildState.INSTALLED }
            : build
        )
      );

      // También actualizar el array de builds original
      setBuilds((prevBuilds) =>
        prevBuilds.map((build) =>
          build.id === buildId
            ? { ...build, state: BuildState.INSTALLED }
            : build
        )
      );

      console.log(`Installing build ${buildId}`);
    } catch (error) {
      console.error("Error installing build:", error);
    }
  };

  const renderButton = () => {
    if (currentState === "installed") {
      return (
        <FontAwesome
          className="mt-2"
          name="check-circle"
          size={24}
          color={textColor}
        />
      );
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

      {/* El resto del componente con contenido original */}
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

        <View className="mb-6">
          <MyText className="text-2xl font-bold mb-4">Information</MyText>
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <MyText className="text-lg">Developer</MyText>
              <MyText className="text-gray-600">{params.developer}</MyText>
            </View>
            <View className="flex-row justify-between">
              <MyText className="text-lg">Release Date</MyText>
              <MyText className="text-gray-600">
                {params.releaseDate ? new Date(params.releaseDate).toLocaleDateString() : "-"}
              </MyText>
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

        {/* Nueva sección para mostrar las builds anteriores */}
        <View className="mt-4">
          <MyText className="text-2xl font-bold mb-3">Previous Builds</MyText>

          {/* Buscador de builds */}
          <View className="flex-row items-center mb-4 bg-[#ececec] dark:bg-[#242424] rounded-lg px-3 py-2">
            <FontAwesome name="search" size={16} color={textColor} />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search by build number or version..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ color: textColor }}
            />
          </View>

          {loading ? (
            <MyText className="text-center py-4">Loading builds...</MyText>
          ) : filteredBuilds.length > 0 ? (
            <View className="space-y-4">
              {filteredBuilds.map((build) => (
                <View
                  key={build.id}
                  className="bg-[#ececec] dark:bg-[#242424] rounded-lg p-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <MyText className="font-bold">
                        Version {build.version}
                      </MyText>
                      <MyText className="text-gray-500 text-sm">
                        Build #{build.buildNumber}
                      </MyText>
                      <MyText className="text-gray-500 text-sm mt-1">
                        {new Date(build.releaseDate).toLocaleDateString()}
                      </MyText>
                    </View>

                    <TouchableOpacity
                      className="px-4 py-2 rounded-md"
                      style={{
                        backgroundColor:
                          build.state === "installed" ? "#ccc" : textColor,
                      }}
                      onPress={() => handleInstallBuild(build.id)}
                      disabled={build.state === "installed"}
                    >
                      <MyText
                        style={{
                          color:
                            colorScheme === "dark"
                              ? Colors.light.text
                              : Colors.dark.text,
                        }}
                      >
                        {build.state === "installed" ? "Installed" : "Install"}
                      </MyText>
                    </TouchableOpacity>
                  </View>

                  {build.whatToTest && (
                    <View className="mt-2 p-2 bg-[#ececec] dark:bg-[#1b1b1b] rounded">
                      <MyText className="text-sm text-gray-600 dark:text-gray-400">
                        {build.whatToTest.length > 100
                          ? `${build.whatToTest.substring(0, 100)}...`
                          : build.whatToTest}
                      </MyText>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <MyText className="text-center py-4 text-gray-500">
              {searchQuery
                ? "No matching builds found"
                : "No previous builds available"}
            </MyText>
          )}
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
