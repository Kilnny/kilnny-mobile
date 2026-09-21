import React from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { MyText, MyView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/context/auth.context';
import { FontAwesome } from '@expo/vector-icons';
import { t } from '@/i18n';
import Constants from 'expo-constants';
import { apiClient } from '@/config/axios.config';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout, updateUser, uploadUserPicture } = useAuth();
  const [mode, setMode] = React.useState<'view' | 'edit' | 'password'>('view');
  const [name, setName] = React.useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const initial = user?.name?.charAt(0).toUpperCase() || '?';
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const menuItems = [
    { icon: 'user' as const, label: t.profile.editProfile, onPress: () => { setName(user?.name || ''); setMode('edit'); } },
    { icon: 'bell' as const, label: t.profile.notifications, onPress: () => { router.back(); router.push('/(tabs)/two'); } },
    { icon: 'shield' as const, label: t.profile.privacy, onPress: () => setMode('password') },
    { icon: 'briefcase' as const, label: t.profile.workspace, onPress: () => { router.back(); router.push('/(modals)/workspace'); } },
  ];

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert(t.common.error, t.profile.requiredName);
      return;
    }

    setIsSaving(true);
    try {
      await updateUser({ name: name.trim() });
      setMode('view');
      Alert.alert(t.profile.nameUpdated, t.profile.nameUpdatedDesc);
    } catch (error) {
      Alert.alert(t.common.error, error instanceof Error ? error.message : t.profile.updateFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || newPassword.length < 6 || newPassword !== confirmPassword) {
      Alert.alert(t.common.error, newPassword !== confirmPassword ? t.profile.passwordMismatch : t.profile.passwordUpdateFailed);
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.put(`/users/${user.id}/password`, { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('view');
      Alert.alert(t.profile.passwordUpdated, t.profile.passwordUpdatedDesc);
    } catch (error) {
      Alert.alert(t.common.error, error instanceof Error ? error.message : t.profile.passwordUpdateFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickPicture = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t.common.error, t.profile.picturePermission);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setIsSaving(true);
    try {
      await uploadUserPicture({
        uri: asset.uri,
        name: asset.fileName || `avatar-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });
    } catch (error) {
      Alert.alert(t.common.error, error instanceof Error ? error.message : t.profile.pictureUploadFailed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: t.profile.title,
          presentation: 'modal',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text, fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <FontAwesome name="chevron-left" size={16} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {mode !== 'view' && (
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => setMode('view')} style={styles.formBack}>
            <FontAwesome name="chevron-left" size={14} color={colors.text} />
            <MyText style={{ color: colors.text }}>{t.profile.title}</MyText>
          </TouchableOpacity>
          <MyText style={[styles.formTitle, { color: colors.text }]}>
            {mode === 'edit' ? t.profile.editTitle : t.profile.changePassword}
          </MyText>
          {mode === 'edit' ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t.auth.name}
              placeholderTextColor={colors.secondaryText}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              autoCapitalize="words"
            />
          ) : (
            <>
              {[['currentPassword', currentPassword, setCurrentPassword, t.profile.currentPassword], ['newPassword', newPassword, setNewPassword, t.profile.newPassword], ['confirmPassword', confirmPassword, setConfirmPassword, t.profile.confirmPassword]].map(([key, value, setter, placeholder]) => (
                <TextInput
                  key={key as string}
                  value={value as string}
                  onChangeText={setter as (value: string) => void}
                  placeholder={placeholder as string}
                  placeholderTextColor={colors.secondaryText}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  secureTextEntry
                />
              ))}
            </>
          )}
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.accent }]} onPress={mode === 'edit' ? handleSaveProfile : handleChangePassword} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#fff" /> : <MyText style={styles.saveText}>{t.profile.save}</MyText>}
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity onPress={handlePickPicture} disabled={isSaving} style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
          {user?.picture ? <Image source={{ uri: user.picture }} style={styles.avatarImage} /> : <MyText style={[styles.avatarText, { color: colors.accent }]}>{initial}</MyText>}
          <View style={[styles.cameraBadge, { backgroundColor: colors.accent }]}><FontAwesome name="camera" size={11} color="#fff" /></View>
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <MyText style={[styles.name, { color: colors.text }]}>{user?.name || t.profile.user}</MyText>
          <MyText style={[styles.email, { color: colors.secondaryText }]}>{user?.email || ''}</MyText>
        </View>
      </View>

      {/* Menu Section */}
      {mode === 'view' && <View style={styles.sectionWrapper}>
        <MyText style={[styles.sectionLabel, { color: colors.secondaryText }]}>{t.profile.settings}</MyText>
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={item.onPress}
              activeOpacity={0.6}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: isDark ? '#252525' : '#f0f0f0' }]}>
                <FontAwesome name={item.icon} size={14} color={colors.secondaryText} />
              </View>
              <MyText style={[styles.menuItemText, { color: colors.text }]}>{item.label}</MyText>
              <FontAwesome name="chevron-right" size={12} color={colors.secondaryText} />
            </TouchableOpacity>
          ))}
        </View>
      </View>}

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* App Version */}
      <MyText style={[styles.versionText, { color: colors.secondaryText }]}>
        Kilnny v{appVersion}
      </MyText>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: isDark ? '#2a1a1a' : '#fef2f2', borderColor: isDark ? '#3a2020' : '#fecaca' }]}
        onPress={logout}
        activeOpacity={0.7}
      >
        <FontAwesome name="sign-out" size={16} color="#ef4444" />
        <MyText style={styles.logoutText}>{t.profile.logout}</MyText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1dc27d',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 24,
  },
  formBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#1dc27d',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 46,
    marginTop: 4,
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
  },
  sectionWrapper: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    flex: 1,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
});
