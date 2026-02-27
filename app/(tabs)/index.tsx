import { ActivityIndicator, Alert, FlatList, RefreshControl, TouchableOpacity, Modal, TextInput, StyleSheet } from "react-native";
import { MyView, MyText } from "@/components/Themed";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FontAwesome } from "@expo/vector-icons";
import { View } from "react-native";
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
  const [redeemVisible, setRedeemVisible] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const bgColor = colorScheme ? Colors[colorScheme].background : Colors.light.background;
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

  const handleRedeemCode = async () => {
    const code = redeemCode.trim();
    if (!code) return;

    setRedeemLoading(true);
    try {
      await apiClient.post('/invitations/redeem', { code });
      setRedeemVisible(false);
      setRedeemCode('');
      Alert.alert('Invitación aceptada', 'Te has unido al proyecto exitosamente.');
      fetchProjects();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Código inválido o expirado');
    } finally {
      setRedeemLoading(false);
    }
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
        <MyText className="text-xl font-bold">Tus Proyectos</MyText>
        <TouchableOpacity onPress={() => setRedeemVisible(true)}>
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
              <MyText className="text-gray-500">No se encontraron proyectos</MyText>
            </MyView>
          ) : null
        }
      />

      {/* Redeem Code Modal */}
      <Modal
        visible={redeemVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRedeemVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1c1c1c' : '#fff' }]}>
            <MyText style={styles.modalTitle}>Código de invitación</MyText>
            <MyText style={[styles.modalSubtitle, { color: 'gray' }]}>
              Ingresa el código que recibiste para unirte a un proyecto.
            </MyText>
            <TextInput
              style={[styles.codeInput, { color: textColor, borderColor: isDark ? '#444' : '#ddd' }]}
              value={redeemCode}
              onChangeText={(text) => setRedeemCode(text.toUpperCase())}
              placeholder="Ej: A1B2C3"
              placeholderTextColor="gray"
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: isDark ? '#444' : '#ddd', borderWidth: 1 }]}
                onPress={() => { setRedeemVisible(false); setRedeemCode(''); }}
              >
                <MyText>Cancelar</MyText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#1dc27d' }]}
                onPress={handleRedeemCode}
                disabled={redeemLoading || redeemCode.trim().length < 4}
              >
                {redeemLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MyText style={{ color: '#fff', fontWeight: 'bold' }}>Aceptar</MyText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </MyView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  codeInput: {
    fontSize: 24,
    fontFamily: 'monospace',
    letterSpacing: 8,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
