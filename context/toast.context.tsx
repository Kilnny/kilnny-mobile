import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

export interface Toast {
  id: string;
  title: string;
  body: string;
  type?: 'info' | 'success' | 'warning';
  onPress?: () => void;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

const TOAST_DURATION = 4000;

function ToastView({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => dismiss(), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5 && g.dy < 0,
      onPanResponderMove: (_, g) => {
        if (g.dy < 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -30) {
          dismiss();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const bgColor =
    toast.type === 'success' ? '#1dc27d' :
    toast.type === 'warning' ? '#f59e0b' : '#3b82f6';

  const iconName =
    toast.type === 'success' ? 'check-circle' :
    toast.type === 'warning' ? 'exclamation-circle' : 'bell';

  return (
    <Animated.View
      style={[
        styles.toast,
        { top: insets.top + 8, transform: [{ translateY }], opacity },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={[styles.toastContent, { borderLeftColor: bgColor }]}
        activeOpacity={0.9}
        onPress={() => { toast.onPress?.(); dismiss(); }}
      >
        <FontAwesome name={iconName} size={18} color={bgColor} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.toastTitle} numberOfLines={1}>{toast.title}</Text>
          <Text style={styles.toastBody} numberOfLines={2}>{toast.body}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <ToastView key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
    elevation: 10,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  toastBody: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
});
