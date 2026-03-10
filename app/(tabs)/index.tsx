import { ActivityIndicator, Alert, FlatList, RefreshControl, TouchableOpacity, Modal, TextInput, StyleSheet, Image, Pressable, Text } from "react-native";
import { MyView, MyText } from "@/components/Themed";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FontAwesome } from "@expo/vector-icons";
import { View } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import SkeletonCard from "@/components/SkeletonCard";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "expo-router";
import { apiClient } from "@/config/axios.config";
import { BuildState, Project } from "@/types/projects";
import { useApkInstaller } from "@/hooks/useApkInstaller";
import { useAppLauncher } from "@/hooks/useAppLauncher";
import { isPackageInstalled, useAppForeground } from "@/hooks/usePackageCheck";
import { t } from "@/i18n";
import { Swipeable } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth.context";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

const PIN_STORAGE_KEY = "kilnny_pinned_projects";
const MAX_PINS = 3;

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redeemVisible, setRedeemVisible] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const router = useRouter();
  const { installing, installApk } = useApkInstaller();
  const { openApp, uninstallApp } = useAppLauncher();
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const colors = Colors[colorScheme ?? 'light'];
  const avatarBg = isDark ? '#2a3a30' : '#e8f5ee';
  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  useEffect(() => {
    AsyncStorage.getItem(PIN_STORAGE_KEY).then((val) => {
      if (val) setPinnedIds(JSON.parse(val));
    });
  }, []);

  const savePins = useCallback(async (ids: string[]) => {
    setPinnedIds(ids);
    await AsyncStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(ids));
  }, []);

  const togglePin = useCallback((projectId: string) => {
    const ref = swipeableRefs.current.get(projectId);
    ref?.close();

    if (pinnedIds.includes(projectId)) {
      savePins(pinnedIds.filter((id) => id !== projectId));
    } else {
      if (pinnedIds.length >= MAX_PINS) {
        Alert.alert(t.common.error, t.projects.pinLimit);
        return;
      }
      savePins([...pinnedIds, projectId]);
    }
  }, [pinnedIds, savePins]);

  const handleUninstallFromSwipe = useCallback((project: Project) => {
    const ref = swipeableRefs.current.get(project.id);
    ref?.close();

    const pkgName = project.latestBuild?.packageName || undefined;
    console.log('[swipe uninstall] project:', project.name, 'packageName:', pkgName);
    uninstallApp(pkgName);
  }, [uninstallApp]);

  const handleInstallLatestBuild = async (project: Project) => {
    if (!project.latestBuild?.id) {
      Alert.alert(t.common.error, t.detail.noBuildError);
      return;
    }

    try {
      const success = await installApk(
        project.latestBuild.id,
        project.latestBuild.packageName,
      );
      if (success) {
        // Update local state to reflect installation
        setProjects((prev) =>
          prev.map((p) =>
            p.id === project.id && p.latestBuild
              ? { ...p, latestBuild: { ...p.latestBuild, state: BuildState.INSTALLED } }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error installing:", error);
    }
  };

  // Re-check real installation state when app returns to foreground
  const checkInstallStates = useCallback(async () => {
    let changed = false;
    const updated = await Promise.all(
      projects.map(async (project) => {
        const pkg = project.latestBuild?.packageName;
        if (!pkg || !project.latestBuild) return project;

        const installed = await isPackageInstalled(pkg);
        const currentState = project.latestBuild.state;

        if (installed) {
          // Check if the latest build is the one installed via server record
          try {
            const record: any = await apiClient.get(
              `/installations/project/${project.id}/latest`
            );
            const latestIsInstalled = record?.buildId === project.latestBuild.id;
            const newState = latestIsInstalled ? BuildState.INSTALLED : BuildState.HAS_UPDATE;
            if (currentState !== newState) {
              changed = true;
              return { ...project, latestBuild: { ...project.latestBuild, state: newState } };
            }
          } catch {
            // Fallback: just mark as installed
            if (currentState !== BuildState.INSTALLED) {
              changed = true;
              return { ...project, latestBuild: { ...project.latestBuild, state: BuildState.INSTALLED } };
            }
          }
        } else if (!installed && currentState !== BuildState.NOT_INSTALLED) {
          changed = true;
          return { ...project, latestBuild: { ...project.latestBuild, state: BuildState.NOT_INSTALLED } };
        }
        return project;
      })
    );
    if (changed) setProjects(updated);
  }, [projects]);

  useAppForeground(checkInstallStates);

  // Also check right after projects are fetched
  useEffect(() => {
    if (projects.length > 0 && !isLoading) {
      checkInstallStates();
    }
  }, [projects.length > 0, isLoading]);

  // Real-time: refresh project list when a new build is created
  useRealtimeEvents({
    onBuildCreated: useCallback(() => {
      fetchProjectsQuiet();
    }, []),
  });

  const fetchProjectsQuiet = async () => {
    try {
      const projectsData = await apiClient.get("/projects", { timeout: 20000 });
      if (projectsData && Array.isArray(projectsData)) {
        setProjects(projectsData);
      }
    } catch {}
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
        console.warn("Unexpected format:", projectsData);
      }
    } catch (error) {
      console.error("Request error:", error);
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
      Alert.alert(t.projects.invitationAccepted, t.projects.joinedProject);
      fetchProjects();
    } catch (error) {
      Alert.alert(t.common.error, error instanceof Error ? error.message : t.projects.invalidCode);
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
        developer: project.developer || "-",
        state: project.latestBuild?.state || "notInstalled",
        releaseDate:
          typeof project.latestBuild?.releaseDate === "string"
            ? project.latestBuild?.releaseDate
            : project.latestBuild?.releaseDate instanceof Date
            ? project.latestBuild?.releaseDate.toISOString()
            : new Date().toISOString(),
        size: project.latestBuild?.size || "-",
        whatToTest: project.latestBuild?.whatToTest || "",
        packageName: project.latestBuild?.packageName || "",
        projectId: project.id,
      },
    });
  };

  const renderLeftActions = (projectId: string) => {
    const isPinned = pinnedIds.includes(projectId);
    return (
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: '#f59e0b' }]}
        onPress={() => togglePin(projectId)}
      >
        <FontAwesome name={isPinned ? "thumb-tack" : "thumb-tack"} size={20} color="#fff" />
        <MyText style={styles.swipeActionText}>
          {isPinned ? "Unpin" : "Pin"}
        </MyText>
      </TouchableOpacity>
    );
  };

  const renderRightActions = (project: Project) => {
    if (project.latestBuild?.state !== BuildState.INSTALLED) return null;
    return (
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: '#ef4444' }]}
        onPress={() => handleUninstallFromSwipe(project)}
      >
        <FontAwesome name="trash-o" size={20} color="#fff" />
        <MyText style={styles.swipeActionText}>{t.detail.uninstall}</MyText>
      </TouchableOpacity>
    );
  };

  const renderProjectCard = (project: Project) => {
    const latestBuild = project.latestBuild;
    const isPinned = pinnedIds.includes(project.id);

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeableRefs.current.set(project.id, ref);
        }}
        renderLeftActions={() => renderLeftActions(project.id)}
        renderRightActions={() => renderRightActions(project)}
        overshootLeft={false}
        overshootRight={false}
      >
        <TouchableOpacity
          style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }}
          className="rounded-xl mx-3 my-1.5 overflow-hidden"
          onPress={() => navigateToProjectDetail(project)}
          activeOpacity={0.7}
        >
          <View className="p-4 flex-row">
            {project.picture ? (
              <Image
                source={{ uri: project.picture }}
                style={{ width: 56, height: 56, borderRadius: 14 }}
              />
            ) : (
              <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesome name="android" size={28} color={colors.secondaryText} />
              </View>
            )}
            <View className="ml-4 flex-1 justify-between">
              <View>
                <View className="flex-row items-center gap-1">
                  <MyText className="text-lg font-bold">{project.name}</MyText>
                  {isPinned && (
                    <FontAwesome name="thumb-tack" size={12} color="#f59e0b" />
                  )}
                </View>
                <MyText className="text-sm text-gray-500" numberOfLines={2}>
                  {project.description}
                </MyText>
              </View>

              <View className="flex-row justify-between items-center mt-2">
                {latestBuild ? (
                  <>
                    <View className="flex-row items-center gap-1">
                      <MyText className="text-xs">v{latestBuild.version}</MyText>
                      {latestBuild.state === BuildState.INSTALLED && (
                        <FontAwesome name="check-circle" size={14} color="#1dc27d" />
                      )}
                    </View>
                    {latestBuild.state === BuildState.INSTALLED ? (
                      <TouchableOpacity
                        className="bg-[#1dc27d] rounded-md px-4 py-1"
                        onPress={() => openApp(latestBuild.packageName)}
                      >
                        <MyText className="text-white text-xs font-semibold">{t.projects.open}</MyText>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        className="bg-blue-500 rounded-md px-4 py-1"
                        disabled={installing}
                        onPress={() => handleInstallLatestBuild(project)}
                      >
                        {installing ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : latestBuild.state === BuildState.HAS_UPDATE ? (
                          <MyText className="text-white text-xs">{t.detail.update}</MyText>
                        ) : (
                          <MyText className="text-white text-xs">{t.projects.install}</MyText>
                        )}
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <MyText className="text-xs text-gray-400">{t.projects.noBuilds}</MyText>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Sort projects: pinned first, then the rest
  const sortedProjects = [...projects].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id) ? 0 : 1;
    const bPinned = pinnedIds.includes(b.id) ? 0 : 1;
    return aPinned - bPinned;
  });

  const hasPinned = sortedProjects.some((p) => pinnedIds.includes(p.id));

  return (
    <MyView className="flex-1" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <MyText className="text-2xl font-bold">Kilnny</MyText>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => setRedeemVisible(true)}>
            <AntDesign name="pluscircleo" size={22} color={textColor} />
          </TouchableOpacity>
          <Pressable
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: avatarBg, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => router.push("/(modals)/profile")}
          >
            <Text style={{ color: '#1dc27d', fontWeight: 'bold', fontSize: 14 }}>{initial}</Text>
          </Pressable>
        </View>
      </View>
      <View className="px-4 pb-2">
        <MyText className="text-lg font-semibold">{t.projects.title}</MyText>
      </View>
      <FlatList
        data={isLoading ? Array(4).fill({}) : sortedProjects}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item, index }) => {
          if (isLoading) return <SkeletonCard />;

          const isPinned = pinnedIds.includes(item.id);
          const prevIsPinned = index > 0 && pinnedIds.includes(sortedProjects[index - 1]?.id);
          const showPinnedHeader = isPinned && index === 0;
          const showOtherHeader = !isPinned && (index === 0 || prevIsPinned);

          return (
            <>
              {showPinnedHeader && hasPinned && (
                <View className="px-4 pt-1 pb-1">
                  <MyText className="text-xs font-semibold text-gray-400 uppercase">
                    {t.projects.pinned}
                  </MyText>
                </View>
              )}
              {showOtherHeader && hasPinned && (
                <View className="px-4 pt-3 pb-1">
                  <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 8 }} />
                </View>
              )}
              {renderProjectCard(item)}
            </>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <MyView className="items-center justify-center py-10">
              <MyText className="text-gray-500">{t.projects.noProjects}</MyText>
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
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <MyText style={styles.modalTitle}>{t.projects.invitationCode}</MyText>
            <MyText style={[styles.modalSubtitle, { color: 'gray' }]}>
              {t.projects.invitationDesc}
            </MyText>
            <TextInput
              style={[styles.codeInput, { color: textColor, borderColor: colors.border }]}
              value={redeemCode}
              onChangeText={(text) => setRedeemCode(text.toUpperCase())}
              placeholder={t.projects.placeholder}
              placeholderTextColor="gray"
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => { setRedeemVisible(false); setRedeemCode(''); }}
              >
                <MyText>{t.projects.cancel}</MyText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#1dc27d' }]}
                onPress={handleRedeemCode}
                disabled={redeemLoading || redeemCode.trim().length < 4}
              >
                {redeemLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MyText style={{ color: '#fff', fontWeight: 'bold' }}>{t.projects.accept}</MyText>
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
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 8,
    borderRadius: 12,
  },
  swipeActionText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
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
