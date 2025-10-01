import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle, X, Info, Sprout } from 'lucide-react-native';
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

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

export function CustomAlert({ visible, title, message, buttons = [], onDismiss }: CustomAlertProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const defaultButtons: AlertButton[] = buttons.length > 0 ? buttons : [{ text: 'OK', style: 'default' }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Pressable style={alertStyles.overlay} onPress={onDismiss}>
        <Animated.View
          style={[
            alertStyles.backdrop,
            { opacity: fadeAnim },
          ]}
        />
      </Pressable>
      <View style={alertStyles.centeredView}>
        <Animated.View
          style={[
            alertStyles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={alertStyles.iconContainer}>
            <Sprout color={PlantTheme.colors.primary} size={32} />
          </View>
          
          <Text style={alertStyles.title}>{title}</Text>
          {message && <Text style={alertStyles.message}>{message}</Text>}
          
          <View style={alertStyles.buttonContainer}>
            {defaultButtons.map((button, index) => {
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    alertStyles.button,
                    isDestructive && alertStyles.destructiveButton,
                    isCancel && alertStyles.cancelButton,
                    defaultButtons.length === 1 && alertStyles.singleButton,
                  ]}
                  onPress={() => {
                    button.onPress?.();
                    onDismiss?.();
                  }}
                >
                  <Text
                    style={[
                      alertStyles.buttonText,
                      isDestructive && alertStyles.destructiveButtonText,
                      isCancel && alertStyles.cancelButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const alertStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: PlantTheme.colors.white,
    borderRadius: PlantTheme.borderRadius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    ...PlantTheme.shadows.lg,
    ...(Platform.OS === 'android' && {
      elevation: 8,
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PlantTheme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: PlantTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: PlantTheme.borderRadius.md,
    backgroundColor: PlantTheme.colors.primary,
    alignItems: 'center',
  },
  singleButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: PlantTheme.colors.surfaceVariant,
  },
  destructiveButton: {
    backgroundColor: PlantTheme.colors.error,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: PlantTheme.colors.white,
  },
  cancelButtonText: {
    color: PlantTheme.colors.textPrimary,
  },
  destructiveButtonText: {
    color: PlantTheme.colors.white,
  },
});

let alertRef: React.RefObject<any> | null = null;

export const setAlertRef = (ref: React.RefObject<any>) => {
  alertRef = ref;
};

export const PlantAlert = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => {
    alertRef?.current?.show(title, message, buttons);
  },
};

export function AlertContainer() {
  const [alert, setAlert] = useState<{
    title: string;
    message?: string;
    buttons?: AlertButton[];
    visible: boolean;
  } | null>(null);

  const alertContainerRef = useRef({
    show: (title: string, message?: string, buttons?: AlertButton[]) => {
      setAlert({ title, message, buttons, visible: true });
    },
  });

  useEffect(() => {
    setAlertRef(alertContainerRef);
  }, []);

  const handleDismiss = () => {
    setAlert(null);
  };

  return (
    <>
      {alert && (
        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          buttons={alert.buttons}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}

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