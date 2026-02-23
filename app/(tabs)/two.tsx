import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { MyText, MyView } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { apiClient } from '@/config/axios.config';
import { Notification, NotificationType } from '@/types/notifications';

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
  const colorScheme = useColorScheme();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;

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

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => !item.read && markAsRead(item.id)}
      activeOpacity={item.read ? 1 : 0.7}
      className="flex-row items-start p-4 mb-2 rounded-lg bg-[#f5f5f5] dark:bg-[#1c1c1c]"
    >
      <View className="w-10 h-10 rounded-full items-center justify-center bg-[#e0e0e0] dark:bg-[#333] mr-3">
        <FontAwesome name={getIconForType(item.type)} size={18} color={textColor} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <MyText className="font-bold text-base flex-1 mr-2" numberOfLines={1}>
            {item.title}
          </MyText>
          {!item.read && (
            <View className="w-2.5 h-2.5 rounded-full bg-[#1dc27d]" />
          )}
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

  if (loading) {
    return (
      <MyView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={textColor} />
      </MyView>
    );
  }

  return (
    <MyView className="flex-1 p-4">
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
    </MyView>
  );
}
