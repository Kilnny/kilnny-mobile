import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { MyText } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { apiClient } from '@/config/axios.config';
import { t } from '@/i18n';

type WorkspaceItem = {
  id: string;
  name: string;
  description?: string;
  picture?: string | null;
};

type Selection = WorkspaceItem & { kind: 'organization' | 'project' };

export default function WorkspaceSettingsModal() {
  const colors = Colors[useColorScheme() ?? 'light'];
  const [organizations, setOrganizations] = useState<WorkspaceItem[]>([]);
  const [projects, setProjects] = useState<WorkspaceItem[]>([]);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiClient.get('/organizations'), apiClient.get('/projects')])
      .then(([orgs, projectList]) => {
        setOrganizations(Array.isArray(orgs) ? orgs : []);
        setProjects(Array.isArray(projectList) ? projectList : []);
      })
      .catch(() => Alert.alert(t.common.error, t.profile.workspaceLoadFailed))
      .finally(() => setLoading(false));
  }, []);

  const select = (item: WorkspaceItem, kind: Selection['kind']) => {
    setSelected({ ...item, kind });
    setName(item.name);
    setDescription(item.description || '');
  };

  const pickPicture = async () => {
    if (!selected) return;
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
    setSaving(true);
    try {
      const picture = {
        uri: asset.uri,
        name: asset.fileName || `workspace-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      };
      const endpoint = selected.kind === 'organization'
        ? `/organizations/${selected.id}/picture`
        : `/projects/${selected.id}/picture`;
      const updated = await apiClient.upload(endpoint, picture);
      setSelected({ ...selected, ...updated });
      if (selected.kind === 'organization') {
        setOrganizations((items) => items.map((item) => item.id === selected.id ? { ...item, ...updated } : item));
      } else {
        setProjects((items) => items.map((item) => item.id === selected.id ? { ...item, ...updated } : item));
      }
    } catch (error) {
      Alert.alert(t.common.error, error instanceof Error ? error.message : t.profile.pictureUploadFailed);
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!selected || !name.trim()) return;
    setSaving(true);
    try {
      const endpoint = selected.kind === 'organization'
        ? `/organizations/${selected.id}`
        : `/projects/${selected.id}`;
      const body = selected.kind === 'organization'
        ? { name: name.trim() }
        : { name: name.trim(), description: description.trim() };
      const updated = await apiClient.put(endpoint, body);
      setSelected({ ...selected, ...updated });
      if (selected.kind === 'organization') {
        setOrganizations((items) => items.map((item) => item.id === selected.id ? { ...item, ...updated } : item));
      } else {
        setProjects((items) => items.map((item) => item.id === selected.id ? { ...item, ...updated } : item));
      }
      Alert.alert(t.profile.workspaceSaved, t.profile.workspaceSavedDesc);
    } catch (error) {
      Alert.alert(t.common.error, error instanceof Error ? error.message : t.profile.updateFailed);
    } finally {
      setSaving(false);
    }
  };

  const renderItem = (item: WorkspaceItem, kind: Selection['kind']) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => select(item, kind)}
      activeOpacity={0.75}
    >
      {item.picture ? <Image source={{ uri: item.picture }} style={styles.itemImage} /> : <View style={[styles.itemImage, styles.itemFallback, { backgroundColor: colors.accentSoft }]}><FontAwesome name={kind === 'organization' ? 'building' : 'android'} size={18} color={colors.accent} /></View>}
      <MyText style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</MyText>
      <FontAwesome name="chevron-right" size={12} color={colors.secondaryText} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: t.profile.workspace, presentation: 'modal', headerShown: true, headerShadowVisible: false, headerStyle: { backgroundColor: colors.background }, headerTitleStyle: { color: colors.text }, headerLeft: () => <TouchableOpacity onPress={() => router.back()} style={styles.back}><FontAwesome name="chevron-left" size={16} color={colors.text} /></TouchableOpacity> }} />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator color={colors.accent} /> : selected ? (
          <View>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backToList}><FontAwesome name="chevron-left" size={13} color={colors.accent} /><MyText style={{ color: colors.accent }}>{t.profile.workspace}</MyText></TouchableOpacity>
            <MyText style={[styles.title, { color: colors.text }]}>{selected.kind === 'organization' ? t.profile.organization : t.profile.project}</MyText>
            <TouchableOpacity onPress={pickPicture} disabled={saving} style={styles.pictureButton}>
              {selected.picture ? <Image source={{ uri: selected.picture }} style={styles.picture} /> : <View style={[styles.picture, styles.itemFallback, { backgroundColor: colors.accentSoft }]}><FontAwesome name="camera" size={24} color={colors.accent} /></View>}
              <MyText style={{ color: colors.accent }}>{t.profile.changePicture}</MyText>
            </TouchableOpacity>
            <TextInput value={name} onChangeText={setName} placeholder={t.auth.name} placeholderTextColor={colors.secondaryText} style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
            {selected.kind === 'project' && <TextInput value={description} onChangeText={setDescription} placeholder={t.detail.description} placeholderTextColor={colors.secondaryText} multiline style={[styles.input, styles.description, { color: colors.text, borderColor: colors.border }]} />}
            <TouchableOpacity onPress={save} disabled={saving} style={[styles.save, { backgroundColor: colors.accent }]}>{saving ? <ActivityIndicator color="#fff" /> : <MyText style={styles.saveText}>{t.profile.save}</MyText>}</TouchableOpacity>
          </View>
        ) : (
          <>
            <MyText style={[styles.title, { color: colors.text }]}>{t.profile.workspace}</MyText>
            <MyText style={[styles.section, { color: colors.secondaryText }]}>{t.profile.organizations}</MyText>
            {organizations.map((item) => renderItem(item, 'organization'))}
            {organizations.length === 0 && <MyText style={{ color: colors.secondaryText }}>{t.profile.noOrganizations}</MyText>}
            <MyText style={[styles.section, { color: colors.secondaryText }]}>{t.profile.projects}</MyText>
            {projects.map((item) => renderItem(item, 'project'))}
            {projects.length === 0 && <MyText style={{ color: colors.secondaryText }}>{t.projects.noProjects}</MyText>}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  back: { padding: 8, marginLeft: -4 },
  backToList: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 18 },
  title: { fontSize: 23, fontWeight: '700', marginBottom: 20 },
  section: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 12, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 11, marginBottom: 8 },
  itemImage: { width: 42, height: 42, borderRadius: 10, marginRight: 12 },
  itemFallback: { alignItems: 'center', justifyContent: 'center' },
  itemName: { flex: 1, fontSize: 15, fontWeight: '600' },
  pictureButton: { alignItems: 'center', gap: 8, marginBottom: 20 },
  picture: { width: 88, height: 88, borderRadius: 20 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12, fontSize: 15 },
  description: { minHeight: 100, textAlignVertical: 'top' },
  save: { minHeight: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
