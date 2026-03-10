import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from 'react-native';
import { MyText, MyView } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { apiClient } from '@/config/axios.config';
import { Notification, NotificationType } from '@/types/notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRealtimeEvents } from '@/hooks/useRealtimeEvents';

function getIconForType(type: NotificationType): React.ComponentProps<typeof FontAwesome>['name'] {
  switch (type) {
    case NotificationType.BUILD_READY:
      return 'rocket';
    case NotificationType.INVITATION:
      return 'envelope';
    case NotificationType.FEEDBACK_RECEIVED:
      return 'comment';
    case NotificationType.PROJECT_UPDATE:
      return 'refresh';
    default:
      return 'bell';
  }
}

function getColorForType(type: NotificationType): string {
  switch (type) {
    case NotificationType.BUILD_READY:
      return '#3b82f6';
    case NotificationType.INVITATION:
      return '#f59e0b';
    case NotificationType.FEEDBACK_RECEIVED:
      return '#1dc27d';
    default:
      return '#6b7280';
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const textColor = colors.text;
  const insets = useSafeAreaInsets();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiClient.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, [fetchNotifications]);

  // Real-time: add new notifications as they arrive
  useRealtimeEvents({
    onNotification: useCallback((notification: any) => {
      setNotifications((prev) => [notification, ...prev]);
    }, []),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const openNotification = (item: Notification) => {
    if (!item.read) markAsRead(item.id);
    setSelectedNotification(item);
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const typeColor = getColorForType(item.type);

    return (
      <TouchableOpacity
        onPress={() => openNotification(item)}
        activeOpacity={0.7}
        style={[
          styles.notificationItem,
          { backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <FontAwesome name={getIconForType(item.type)} size={18} color={typeColor} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <MyText className="font-bold text-base flex-1 mr-2" numberOfLines={1}>
              {item.title}
            </MyText>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: typeColor }]} />}
          </View>
          <MyText className="text-gray-500 text-sm mt-1" numberOfLines={2}>
            {item.body}
          </MyText>
          <MyText className="text-gray-400 text-xs mt-2">
            {timeAgo(item.createdAt)}
          </MyText>
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <MyView className="flex-1 items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color={textColor} />
      </MyView>
    );
  }

  return (
    <MyView className="flex-1 p-4" style={{ paddingTop: insets.top + 16 }}>
      <View style={styles.headerRow}>
        <MyText className="text-2xl font-bold">Notificaciones</MyText>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <MyText style={styles.badgeText}>{unreadCount}</MyText>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <FontAwesome name="bell-slash-o" size={48} color="#999" />
            <MyText className="text-gray-500 text-lg mt-4">
              No tienes notificaciones
            </MyText>
          </View>
        }
      />

      {/* Notification Detail Modal */}
      <Modal
        visible={!!selectedNotification}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {selectedNotification && (
              <>
                <View style={[
                  styles.modalIconRow,
                  { backgroundColor: getColorForType(selectedNotification.type) + '15' },
                ]}>
                  <FontAwesome
                    name={getIconForType(selectedNotification.type)}
                    size={28}
                    color={getColorForType(selectedNotification.type)}
                  />
                </View>
                <MyText style={styles.modalTitle}>{selectedNotification.title}</MyText>
                <MyText style={[styles.modalBody, { color: colors.secondaryText }]}>
                  {selectedNotification.body}
                </MyText>
                <MyText style={styles.modalTime}>
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </MyText>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedNotification(null)}
                >
                  <MyText style={{ color: '#fff', fontWeight: '600' }}>Cerrar</MyText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </MyView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    marginBottom: 8,
    borderRadius: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIconRow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  modalCloseBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
});
