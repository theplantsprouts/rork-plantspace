import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle, X, Info } from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  visible: boolean;
}

const TOAST_COLORS = {
  success: {
    background: PlantTheme.colors.success,
    icon: CheckCircle,
  },
  error: {
    background: PlantTheme.colors.error,
    icon: AlertCircle,
  },
  info: {
    background: PlantTheme.colors.info,
    icon: Info,
  },
  warning: {
    background: PlantTheme.colors.warning,
    icon: AlertCircle,
  },
};

export function Toast({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onHide, 
  visible 
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [isVisible, setIsVisible] = useState(visible);
  
  const { background, icon: IconComponent } = TOAST_COLORS[type];

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onHide?.();
    });
  };

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, slideAnim]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 10,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: background }]}>
        <IconComponent color={PlantTheme.colors.white} size={20} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <X color={PlantTheme.colors.white} size={16} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: PlantTheme.borderRadius.lg,
    gap: 12,
    ...PlantTheme.shadows.lg,
    ...(Platform.OS === 'android' && {
      elevation: 8,
    }),
  },
  message: {
    flex: 1,
    color: PlantTheme.colors.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
});

// Toast Manager Hook
let toastRef: React.RefObject<any> | null = null;

export const setToastRef = (ref: React.RefObject<any>) => {
  toastRef = ref;
};

export const showToast = {
  success: (message: string) => {
    toastRef?.current?.show(message, 'success');
  },
  error: (message: string) => {
    toastRef?.current?.show(message, 'error');
  },
  info: (message: string) => {
    toastRef?.current?.show(message, 'info');
  },
  warning: (message: string) => {
    toastRef?.current?.show(message, 'warning');
  },
};

// Toast Container Component
export function ToastContainer() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  } | null>(null);
  
  const toastContainerRef = useRef({
    show: (message: string, type: ToastType = 'info') => {
      setToast({ message, type, visible: true });
    },
  });

  useEffect(() => {
    setToastRef(toastContainerRef);
  }, []);

  const handleHide = () => {
    setToast(null);
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onHide={handleHide}
        />
      )}
    </>
  );
}