import { FlatList, RefreshControl, TouchableOpacity } from "react-native";
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
import { Project } from "@/types/projects";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await apiClient.get("/projects", {
        timeout: 20000,
      });

      console.log("Projects data type:", typeof projectsData);

      if (projectsData && Array.isArray(projectsData)) {
        console.log("Projects found:", projectsData.length);
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
          {project.picture ? (
            <Image
              source={{
                uri: project.picture,
              }}
              className="w-20 h-20 rounded-lg"
            />
          ) : (
            <View className="w-20 h-20 bg-gray-200 rounded-lg justify-center items-center">
              <MyText className="text-4xl font-bold text-gray-500">
                {project.name.charAt(0).toUpperCase()}
              </MyText>
            </View>
          )}

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
                  <MyText className="text-xs text-gray-500">
                    Latest: v{latestBuild.version}
                  </MyText>

                  {latestBuild.state === "installed" ? (
                    <FontAwesome
                      name="check-circle"
                      size={24}
                      color={textColor}
                    />
                  ) : (
                    <TouchableOpacity
                      style={{
                        backgroundColor: textColor,
                      }}
                      className="px-4 py-1 rounded"
                      onPress={(e) => {
                        e.stopPropagation();
                        console.log(
                          `Installing latest build for ${project.name}`
                        );
                      }}
                    >
                      <MyText
                        style={{
                          color:
                            colorScheme === "dark"
                              ? Colors.light.text
                              : Colors.dark.text,
                        }}
                        className="text-sm"
                      >
                        {latestBuild.state === "hasUpdate"
                          ? "Update"
                          : "Install"}
                      </MyText>
                    </TouchableOpacity>
                  )}
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
        <AntDesign name="pluscircleo" size={24} color={textColor} />
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
