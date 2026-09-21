import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { MyText, MyView } from "@/components/Themed";
import { TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/config/axios.config";
import { Build, BuildState } from "@/types/projects";
import { useApkInstaller } from "@/hooks/useApkInstaller";
import { useAppLauncher } from "@/hooks/useAppLauncher";
import { isPackageInstalled, useAppForeground } from "@/hooks/usePackageCheck";
import { t } from "@/i18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSocket } from "@/context/socket.context";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

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
    packageName: string;
    projectId: string;
  }>();

  const [builds, setBuilds] = useState<Build[]>([]);
  const [filteredBuilds, setFilteredBuilds] = useState<Build[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  // Track which build is currently being installed
  const [installingBuildId, setInstallingBuildId] = useState<string | null>(null);
  // Whether the package is installed on device at all
  const [appInstalled, setAppInstalled] = useState(false);
  // Which specific build is installed (by ID) — null means we don't know yet
  const [installedBuildId, setInstalledBuildId] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const textColor = colors.text;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { joinProject } = useSocket();

  const fetchBuilds = useCallback(async (silent = false) => {
    if (!params.projectId) return;

    try {
      if (!silent) setLoading(true);
      const data = await apiClient.get(`/builds/project/${params.projectId}`);
      const latestBuilds = data
        .filter((b: any) => !b.buildStatus || b.buildStatus === 'READY')
        .sort(
          (a: { buildNumber: number }, b: { buildNumber: number }) =>
            b.buildNumber - a.buildNumber
        )
        .slice(0, 20);

      setBuilds(latestBuilds);
      setFilteredBuilds(latestBuilds);
    } catch (error) {
      console.error("Error fetching builds:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [params.projectId]);

  useEffect(() => {
    fetchBuilds();
    if (params.projectId) {
      joinProject(params.projectId);
    }
  }, [params.projectId]);

  // Real-time: refresh builds when a new one is created for this project
  useRealtimeEvents({
    onBuildCreated: useCallback((build: any) => {
      if (build.projectId === params.projectId) {
        fetchBuilds(true);
      }
    }, [params.projectId, fetchBuilds]),
  });

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
  const { openApp, uninstallApp } = useAppLauncher();

  const latestBuild = builds.length > 0 ? builds[0] : null;
  const effectivePackageName = latestBuild?.packageName || params.packageName || undefined;

  // Check if app is installed on device
  const checkAppInstalled = useCallback(async () => {
    if (!effectivePackageName) {
      setAppInstalled(false);
      return;
    }
    const installed = await isPackageInstalled(effectivePackageName);
    setAppInstalled(installed);
    if (!installed) {
      setInstalledBuildId(null);
    }
  }, [effectivePackageName]);

  useAppForeground(checkAppInstalled);

  useEffect(() => {
    checkAppInstalled();
  }, [effectivePackageName, builds]);

  // Resolve which build is installed by checking server installation record
  useEffect(() => {
    if (!params.projectId || !appInstalled) return;

    let cancelled = false;
    (async () => {
      try {
        const installation: any = await apiClient.get(
          `/installations/project/${params.projectId}/latest`
        );
        if (cancelled) return;
        if (installation && installation.buildId) {
          setInstalledBuildId(installation.buildId);
        }
      } catch {
        // Non-critical
      }
    })();
    return () => { cancelled = true; };
  }, [params.projectId, appInstalled]);

  const handleInstallBuild = async (buildId: string, pkgName?: string) => {
    try {
      setInstallingBuildId(buildId);

      // Detect downgrade: if app is installed and target build has a lower buildNumber
      if (appInstalled && installedBuildId) {
        const installedBuild = builds.find((b) => b.id === installedBuildId);
        const targetBuild = builds.find((b) => b.id === buildId);
        if (installedBuild && targetBuild && targetBuild.buildNumber < installedBuild.buildNumber) {
          // Downgrade — must uninstall first
          await uninstallApp(effectivePackageName);
          // Wait for uninstall to complete
          let retries = 10;
          while (retries > 0) {
            await new Promise((r) => setTimeout(r, 1000));
            const still = await isPackageInstalled(effectivePackageName || '');
            if (!still) break;
            retries--;
          }
          setAppInstalled(false);
          setInstalledBuildId(null);
        }
      }

      const success = await installApk(buildId, pkgName);
      if (success) {
        setAppInstalled(true);
        setInstalledBuildId(buildId);
      }
    } catch (error) {
      console.error("Error installing build:", error);
    } finally {
      setInstallingBuildId(null);
    }
  };

  const handleUninstall = async () => {
    await uninstallApp(effectivePackageName);
    // Re-check after uninstall intent
    setTimeout(async () => {
      const still = await isPackageInstalled(effectivePackageName || '');
      setAppInstalled(still);
      if (!still) setInstalledBuildId(null);
    }, 1000);
  };

  // Main header button
  const latestIsInstalled = appInstalled && installedBuildId === latestBuild?.id;
  const hasUpdate = appInstalled && !latestIsInstalled && latestBuild !== null;

  const renderMainButton = () => {
    if (!latestBuild) return null;

    const isInstalling = installingBuildId === latestBuild.id;

    // App installed with the latest build → Open + Uninstall
    if (latestIsInstalled) {
      return (
        <View className="mt-3 flex-row items-center" style={{ gap: 8 }}>
          <TouchableOpacity
            style={{ backgroundColor: "#1dc27d", flex: 1 }}
            className="rounded-md px-6 py-2"
            onPress={() => openApp(effectivePackageName)}
          >
            <MyText className="text-center text-white font-semibold">
              {t.detail.open}
            </MyText>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-md p-2"
            onPress={handleUninstall}
          >
            <FontAwesome name="trash-o" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      );
    }

    // App installed but with an older build → Update + Open side by side
    if (hasUpdate) {
      return (
        <View className="mt-3 flex-row items-center" style={{ gap: 8 }}>
          <TouchableOpacity
            style={{ backgroundColor: "#3b82f6", flex: 1 }}
            className="rounded-md px-6 py-2"
            onPress={() => handleInstallBuild(latestBuild.id, latestBuild.packageName)}
            disabled={installingBuildId !== null}
          >
            {isInstalling ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <MyText className="text-center text-white font-semibold">
                {t.detail.update}
              </MyText>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: "#1dc27d" }}
            className="rounded-md px-4 py-2"
            onPress={() => openApp(effectivePackageName)}
          >
            <MyText className="text-white font-semibold">
              {t.detail.open}
            </MyText>
          </TouchableOpacity>
        </View>
      );
    }

    // App not installed at all → Install
    return (
      <TouchableOpacity
        style={{ backgroundColor: "#3b82f6" }}
        className="rounded-md px-6 py-2 mt-3"
        onPress={() => handleInstallBuild(latestBuild.id, latestBuild.packageName)}
        disabled={installingBuildId !== null}
      >
        {isInstalling ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <MyText style={{ color: "#fff" }} className="text-center font-semibold">
            {t.detail.install}
          </MyText>
        )}
      </TouchableOpacity>
    );
  };

  // Per-build action button in build history
  const renderBuildButton = (build: Build, isLatest: boolean) => {
    const isInstalling = installingBuildId === build.id;
    const anyInstalling = installingBuildId !== null;
    const isThisBuildInstalled = appInstalled && installedBuildId === build.id;

    // This specific build is installed → "Open"
    if (isThisBuildInstalled) {
      return (
        <TouchableOpacity
          className="px-4 py-2 rounded-md"
          style={{ backgroundColor: "#1dc27d" }}
          onPress={() => openApp(build.packageName)}
        >
          <MyText style={{ color: "#fff", fontWeight: "600" }}>
            {t.detail.open}
          </MyText>
        </TouchableOpacity>
      );
    }

    // Latest build but a different (older) build is installed → "Update"
    // Any other build → "Install"
    const label = isLatest && hasUpdate ? t.detail.update : t.detail.install;

    return (
      <TouchableOpacity
        className="px-4 py-2 rounded-md"
        style={{ backgroundColor: "#3b82f6", opacity: anyInstalling && !isInstalling ? 0.5 : 1 }}
        onPress={() => handleInstallBuild(build.id, build.packageName)}
        disabled={anyInstalling}
      >
        {isInstalling ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <MyText style={{ color: "#fff", fontWeight: "600" }}>
            {label}
          </MyText>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: colorScheme
            ? Colors[colorScheme].background
            : Colors.light.background,
        },
      ]}
      style={{ flex: 1 }}
    >
      <Stack.Screen
        options={{
          headerShown: false,
          statusBarTranslucent: true,
        }}
      />
      <TouchableOpacity
        style={{ padding: 16, paddingBottom: 0 }}
        onPress={() => router.back()}
      >
        <FontAwesome name="arrow-left" size={20} color={textColor} />
      </TouchableOpacity>
      <MyView style={styles.header}>
        {params.picture ? (
          <Image source={{ uri: params.picture }} style={styles.appIcon} />
        ) : (
          <View style={[styles.appIcon, { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }]}>
            <FontAwesome name="android" size={40} color={colors.secondaryText} />
          </View>
        )}
        <View style={styles.headerInfo}>
          <MyText className="text-2xl font-bold">{params.name}</MyText>
          <View className="flex-row items-center gap-1">
            <MyText className="text-gray-600">
              Version {latestBuild?.version || params.version}
            </MyText>
            {appInstalled && (
              <FontAwesome name="check-circle" size={14} color="#1dc27d" />
            )}
          </View>
          <MyText className="text-gray-600 mt-1">{params.developer}</MyText>
          {renderMainButton()}
        </View>
      </MyView>

      <MyView style={styles.section}>
        <TouchableOpacity onPress={navigateToFeedback} className="mb-6">
          <Text className="text-xl text-[#1dc27d]">{t.detail.sendFeedback}</Text>
        </TouchableOpacity>

        <View className="mb-6">
          <MyText className="text-2xl font-bold mb-3">{t.detail.whatToTest}</MyText>
          <MyText className="text-gray-600 leading-6">
            {latestBuild?.whatToTest || params.whatToTest || '-'}
          </MyText>
        </View>

        <View className="mb-6">
          <MyText className="text-2xl font-bold mb-3">{t.detail.description}</MyText>
          <MyText className="text-gray-600 leading-6">
            {params.description || '-'}
          </MyText>
        </View>

        <View className="mb-6">
          <MyText className="text-2xl font-bold mb-4">{t.detail.info}</MyText>
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <MyText className="text-lg">{t.detail.developer}</MyText>
              <MyText className="text-gray-600">{params.developer}</MyText>
            </View>
            <View className="flex-row justify-between">
              <MyText className="text-lg">{t.detail.date}</MyText>
              <MyText className="text-gray-600">
                {params.releaseDate ? new Date(params.releaseDate).toLocaleDateString() : "-"}
              </MyText>
            </View>
            <View className="flex-row justify-between">
              <MyText className="text-lg">{t.detail.version}</MyText>
              <MyText className="text-gray-600">
                {latestBuild?.version || params.version}
              </MyText>
            </View>
            <View className="flex-row justify-between">
              <MyText className="text-lg">{t.detail.size}</MyText>
              <MyText className="text-gray-600">
                {latestBuild?.size ? `${latestBuild.size} MB` : params.size || '-'}
              </MyText>
            </View>
          </View>
        </View>

        {/* Build History */}
        <View className="mt-4">
          <MyText className="text-2xl font-bold mb-3">{t.detail.previousBuilds}</MyText>

          <View style={{ backgroundColor: colors.surface }} className="flex-row items-center mb-4 rounded-lg px-3 py-2">
            <FontAwesome name="search" size={16} color={textColor} />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder={t.detail.searchBuilds}
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ color: textColor }}
            />
          </View>

          {loading ? (
            <MyText className="text-center py-4">{t.detail.loadingBuilds}</MyText>
          ) : filteredBuilds.length > 0 ? (
            <View className="space-y-4">
              {filteredBuilds.map((build, index) => {
                const isLatest = index === 0 && !searchQuery;
                return (
                  <View
                    key={build.id}
                    style={{
                      backgroundColor: colors.card,
                      borderColor: isLatest ? '#1dc27d' : colors.border,
                      borderWidth: isLatest ? 1 : StyleSheet.hairlineWidth,
                    }}
                    className="rounded-xl p-4"
                  >
                    <View className="flex-row justify-between items-center">
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <View className="flex-row items-center gap-2">
                          <MyText className="font-bold">
                            v{build.version}
                          </MyText>
                          {isLatest && (
                            <View style={{ backgroundColor: '#1dc27d20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                              <Text style={{ color: '#1dc27d', fontSize: 10, fontWeight: '700' }}>
                                LATEST
                              </Text>
                            </View>
                          )}
                        </View>
                        <MyText className="text-gray-500 text-sm">
                          Build #{build.buildNumber}
                          {build.size ? ` · ${build.size} MB` : ''}
                        </MyText>
                        <MyText className="text-gray-500 text-sm mt-1">
                          {new Date(build.releaseDate).toLocaleDateString()}
                        </MyText>
                      </View>

                      {renderBuildButton(build, isLatest)}
                    </View>

                    {build.releaseNotes && (
                      <View style={{ backgroundColor: colors.surface }} className="mt-2 p-2 rounded">
                        <MyText className="text-xs text-gray-500 mb-1" style={{ fontWeight: '600' }}>
                          Release Notes
                        </MyText>
                        <MyText className="text-sm text-gray-600 dark:text-gray-400">
                          {build.releaseNotes.length > 150
                            ? `${build.releaseNotes.substring(0, 150)}...`
                            : build.releaseNotes}
                        </MyText>
                      </View>
                    )}

                    {build.whatToTest && !build.releaseNotes && (
                      <View style={{ backgroundColor: colors.surface }} className="mt-2 p-2 rounded">
                        <MyText className="text-sm text-gray-600 dark:text-gray-400">
                          {build.whatToTest.length > 100
                            ? `${build.whatToTest.substring(0, 100)}...`
                            : build.whatToTest}
                        </MyText>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <MyText className="text-center py-4 text-gray-500">
              {searchQuery
                ? t.detail.noBuildsFound
                : t.detail.noBuildsAvailable}
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
