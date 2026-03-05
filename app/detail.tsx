import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { MyText, MyView } from "@/components/Themed";
import { TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useState, useEffect } from "react";
import { apiClient } from "@/config/axios.config";
import { Build, BuildState } from "@/types/projects";
import { useApkInstaller } from "@/hooks/useApkInstaller";

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
    projectId: string;
  }>();

  const [builds, setBuilds] = useState<Build[]>([]);
  const [filteredBuilds, setFilteredBuilds] = useState<Build[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const currentState = params.state;

  const colorScheme = useColorScheme();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const router = useRouter();

  useEffect(() => {
    const fetchBuilds = async () => {
      if (!params.projectId) return;

      try {
        setLoading(true);
        const data = await apiClient.get(`/builds/project/${params.projectId}`);
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
    const latestBuildId = builds.length > 0 ? builds[0].id : '';
    router.push({
      pathname: "/(modals)/feedback",
      params: { buildId: latestBuildId, projectName: params.name || '' },
    });
  };

  const { installing, installApk } = useApkInstaller();

  // Reemplaza tu función handleInstallBuild actual con esta:
  const handleInstallBuild = async (buildId: string) => {
    try {
      // Iniciar la instalación real del APK
      const success = await installApk(buildId);
      
      if (success) {
        // Actualizar la UI como ya lo estás haciendo
        setFilteredBuilds((prevBuilds) =>
          prevBuilds.map((build) =>
            build.id === buildId
              ? { ...build, state: BuildState.INSTALLED }
              : build
          )
        );
        
        setBuilds((prevBuilds) =>
          prevBuilds.map((build) =>
            build.id === buildId
              ? { ...build, state: BuildState.INSTALLED }
              : build
          )
        );
      }
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
          onPress={() => handleInstallBuild(params.id)}
          disabled={installing}
        >
          {installing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <MyText
              style={{
                color:
                  textColor === Colors.light.text
                    ? Colors.dark.text
                    : Colors.light.text,
              }}
              className="text-center"
            >
              Actualizar
            </MyText>
          )}
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={{ backgroundColor: textColor }}
          className="rounded-md px-6 py-2 mt-3"
          onPress={() => handleInstallBuild(params.id)}
          disabled={installing}
        >
          {installing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <MyText
              style={{
                color:
                  textColor === Colors.light.text
                    ? Colors.dark.text
                    : Colors.light.text,
              }}
              className="text-center"
            >
              Instalar
            </MyText>
          )}
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
          statusBarTranslucent: true,
          headerStyle: {
            backgroundColor: colorScheme
              ? Colors[colorScheme].background
              : Colors.light.background,
          },
        }}
      />
      <MyView style={styles.header}>
        {params.picture && params.picture !== 'https://via.placeholder.com/100' ? (
          <Image source={{ uri: params.picture }} style={styles.appIcon} />
        ) : (
          <View style={[styles.appIcon, { backgroundColor: colorScheme === 'dark' ? '#333' : '#ddd', alignItems: 'center', justifyContent: 'center' }]}>
            <FontAwesome name="android" size={40} color={colorScheme === 'dark' ? '#888' : '#999'} />
          </View>
        )}
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
          <Text className="text-xl text-[#1dc27d]">Enviar Feedback</Text>
        </TouchableOpacity>

        <View className="mb-6">
          <MyText className="text-2xl font-bold mb-3">Que probar?</MyText>
          <MyText className="text-gray-600 leading-6">
            {params.whatToTest}
          </MyText>
        </View>

        <View className="mb-6">
          <MyText className="text-2xl font-bold mb-3">Descripcion</MyText>
          <MyText className="text-gray-600 leading-6">
            {params.description}
          </MyText>
        </View>

        <View className="mb-6">
          <MyText className="text-2xl font-bold mb-4">Informacion</MyText>
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <MyText className="text-lg">Desarrollador</MyText>
              <MyText className="text-gray-600">{params.developer}</MyText>
            </View>
            <View className="flex-row justify-between">
              <MyText className="text-lg">Fecha</MyText>
              <MyText className="text-gray-600">
                {params.releaseDate ? new Date(params.releaseDate).toLocaleDateString() : "-"}
              </MyText>
            </View>
            <View className="flex-row justify-between">
              <MyText className="text-lg">Version</MyText>
              <MyText className="text-gray-600">{params.version}</MyText>
            </View>
            <View className="flex-row justify-between">
              <MyText className="text-lg">Tamano</MyText>
              <MyText className="text-gray-600">{params.size}</MyText>
            </View>
          </View>
        </View>

        {/* Nueva sección para mostrar las builds anteriores */}
        <View className="mt-4">
          <MyText className="text-2xl font-bold mb-3">Builds Anteriores</MyText>

          {/* Buscador de builds */}
          <View className="flex-row items-center mb-4 bg-[#ececec] dark:bg-[#242424] rounded-lg px-3 py-2">
            <FontAwesome name="search" size={16} color={textColor} />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Buscar por numero de build o version..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ color: textColor }}
            />
          </View>

          {loading ? (
            <MyText className="text-center py-4">Cargando builds...</MyText>
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
                        {build.state === "installed" ? "Instalada" : "Instalar"}
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
                ? "No se encontraron builds"
                : "No hay builds disponibles"}
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
