import { ActivityIndicator, Alert, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { MyView, MyText } from "@/components/Themed";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FontAwesome } from "@expo/vector-icons";
import { View, Image } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import SkeletonCard from "@/components/SkeletonCard";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { apiClient } from "@/config/axios.config";
import { BuildState, Project } from "@/types/projects";
import { useApkInstaller } from "@/hooks/useApkInstaller";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const router = useRouter();
  const { installing, installApk } = useApkInstaller();

  const handleInstallLatestBuild = async (project: Project) => {
    if (!project.latestBuild?.id) {
      Alert.alert("Error", "Este proyecto no tiene builds disponibles");
      return;
    }

    try {
      await installApk(project.latestBuild.id);
      fetchProjects();
    } catch (error) {
      console.error("Error al instalar:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await apiClient.get("/projects", {
        timeout: 20000,
      });

      if (projectsData && Array.isArray(projectsData)) {
        setProjects(projectsData);
      } else {
        console.warn("Formato inesperado:", projectsData);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const navigateToProjectDetail = (project: Project) => {
    router.push({
      pathname: "/detail",
      params: {
        id: project.id,
        name: project.name,
        description: project.description,
        picture: project.picture || "https://via.placeholder.com/100",
        version: project.latestBuild?.version || "N/A",
        developer: project.developer || "Unknow",
        state: project.latestBuild?.state || "notInstalled",
        releaseDate:
          typeof project.latestBuild?.releaseDate === "string"
            ? project.latestBuild?.releaseDate
            : project.latestBuild?.releaseDate instanceof Date
            ? project.latestBuild?.releaseDate.toISOString()
            : new Date().toISOString(),
        size: project.latestBuild?.size || "Unknown",
        whatToTest: project.latestBuild?.whatToTest || "",
        projectId: project.id,
      },
    });
  };

  const renderProjectCard = (project: Project) => {
    const latestBuild = project.latestBuild;

    return (
      <TouchableOpacity
        className="bg-[#ececec] dark:bg-[#242424] rounded-lg m-2 overflow-hidden shadow"
        onPress={() => navigateToProjectDetail(project)}
      >
        <View className="p-4 flex-row">
          {/* Mantén el código de la imagen del proyecto */}

          <View className="ml-4 flex-1 justify-between">
            <View>
              <MyText className="text-lg font-bold">{project.name}</MyText>
              <MyText className="text-sm text-gray-500" numberOfLines={2}>
                {project.description}
              </MyText>
            </View>

            <View className="flex-row justify-between items-center mt-2">
              {latestBuild ? (
                <>
                  <MyText className="text-xs">v{latestBuild.version}</MyText>
                  <TouchableOpacity
                    className="bg-blue-500 rounded-md px-4 py-1"
                    disabled={installing || latestBuild.state === BuildState.INSTALLED}
                    onPress={() => handleInstallLatestBuild(project)}
                  >
                    {installing ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : latestBuild.state === BuildState.INSTALLED ? (
                      <MyText className="text-white text-xs">Instalado</MyText>
                    ) : (
                      <MyText className="text-white text-xs">Instalar</MyText>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <FontAwesome
                  name="exclamation-circle"
                  size={24}
                  color={textColor}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MyView className="flex-1">
      <View className="flex-row items-center justify-between m-4">
        <MyText className="text-xl font-bold">Your Projects</MyText>
        <TouchableOpacity
          onPress={() => Alert.alert('Crear proyecto', 'Los proyectos se crean desde la web o el CLI.\n\napkfly init')}
        >
          <AntDesign name="pluscircleo" size={24} color={textColor} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={isLoading ? Array(4).fill({}) : projects}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) =>
          isLoading ? <SkeletonCard /> : renderProjectCard(item)
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <MyView className="items-center justify-center py-10">
              <MyText className="text-gray-500">No projects found</MyText>
            </MyView>
          ) : null
        }
      />
    </MyView>
  );
}
