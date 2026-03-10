import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MyText, MyView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/context/auth.context';
import { FontAwesome } from '@expo/vector-icons';
import { t } from '@/i18n';
import Constants from 'expo-constants';

export default function ProfileModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();

  const initial = user?.name?.charAt(0).toUpperCase() || '?';
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const menuItems = [
    { icon: 'user' as const, label: t.profile.editProfile, onPress: () => alert(t.profile.comingSoonDesc) },
    { icon: 'bell' as const, label: t.profile.notifications, onPress: () => { router.back(); router.push('/(tabs)/two'); } },
    { icon: 'shield' as const, label: t.profile.privacy, onPress: () => alert(t.profile.comingSoonDesc) },
  ];

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

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: isDark ? '#2a3a30' : '#e8f5ee' }]}>
          <MyText style={[styles.avatarText, { color: '#1dc27d' }]}>{initial}</MyText>
        </View>
        <View style={styles.profileInfo}>
          <MyText style={[styles.name, { color: colors.text }]}>{user?.name || t.profile.user}</MyText>
          <MyText style={[styles.email, { color: colors.secondaryText }]}>{user?.email || ''}</MyText>
        </View>
      </View>

      {/* Menu Section */}
      <View style={styles.sectionWrapper}>
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
      </View>

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
  profileInfo: {
    marginLeft: 14,
    flex: 1,
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
