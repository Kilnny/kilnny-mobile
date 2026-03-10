import { useEffect } from 'react';
import { useSocket } from '@/context/socket.context';
import { useToast } from '@/context/toast.context';

interface BuildCreatedEvent {
  id: string;
  version: string;
  buildNumber: number;
  projectId: string;
  packageName?: string;
  state: string;
  buildStatus?: string;
}

interface BuildStateChangedEvent {
  buildId: string;
  state: string;
  projectId: string;
}

interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  body: string;
  metadata?: any;
}

interface UseRealtimeEventsOptions {
  onBuildCreated?: (build: BuildCreatedEvent) => void;
  onBuildStateChanged?: (event: BuildStateChangedEvent) => void;
  onNotification?: (notification: NotificationEvent) => void;
}

export function useRealtimeEvents(options: UseRealtimeEventsOptions = {}) {
  const { socket } = useSocket();
  const { showToast } = useToast();

  useEffect(() => {
    if (!socket) return;

    const handleBuildCreated = (build: BuildCreatedEvent) => {
      // Only show toast and notify when the build is actually ready (not just announced)
      if (build.buildStatus && build.buildStatus !== 'READY') return;

      showToast({
        title: 'Nueva build disponible',
        body: `Version ${build.version} (Build #${build.buildNumber})`,
        type: 'success',
      });
      options.onBuildCreated?.(build);
    };

    const handleBuildStateChanged = (event: BuildStateChangedEvent) => {
      options.onBuildStateChanged?.(event);
    };

    const handleNotification = (notification: NotificationEvent) => {
      // Only show toast if it's not a BUILD_READY (already handled by build:created)
      if (notification.type !== 'BUILD_READY') {
        showToast({
          title: notification.title,
          body: notification.body,
          type: 'info',
        });
      }
      options.onNotification?.(notification);
    };

    socket.on('build:created', handleBuildCreated);
    socket.on('build:stateChanged', handleBuildStateChanged);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('build:created', handleBuildCreated);
      socket.off('build:stateChanged', handleBuildStateChanged);
      socket.off('notification', handleNotification);
    };
  }, [socket, options.onBuildCreated, options.onBuildStateChanged, options.onNotification]);
}
