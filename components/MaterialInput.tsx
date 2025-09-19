import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { PlantTheme } from '@/constants/theme';

interface MaterialInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  testID?: string;
}

export function MaterialInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  hint,
  disabled = false,
  style,
  inputStyle,
  testID,
}: MaterialInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const containerStyle = [
    styles.container,
    Platform.OS === 'android' && styles.materialAndroid,
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
    style,
  ];

  const textInputStyle = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    multiline && styles.multilineInput,
    Platform.OS === 'android' && styles.materialInputAndroid,
    inputStyle,
  ];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={containerStyle}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={textInputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={PlantTheme.colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          testID={testID}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: PlantTheme.colors.textPrimary,
    marginBottom: 8,
    ...(Platform.OS === 'android' && {
      fontFamily: 'System',
    }),
  },
  
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
    borderRadius: PlantTheme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    minHeight: 56,
    ...(Platform.OS !== 'android' && {
      backdropFilter: 'blur(10px)',
    }),
  },
  
  materialAndroid: {
    borderRadius: PlantTheme.material3.shapes.corner.medium,
    elevation: 1,
    shadowColor: 'transparent',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  
  focused: {
    borderColor: PlantTheme.colors.primary,
    borderWidth: 2,
    ...(Platform.OS === 'android' && {
      elevation: 2,
    }),
  },
  
  error: {
    borderColor: PlantTheme.colors.error,
    borderWidth: 2,
  },
  
  disabled: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  input: {
    flex: 1,
    fontSize: 16,
    color: PlantTheme.colors.textPrimary,
    paddingVertical: 16,
    ...(Platform.OS === 'android' && {
      fontFamily: 'System',
    }),
  },
  
  materialInputAndroid: {
    paddingVertical: 18,
  },
  
  inputWithLeftIcon: {
    marginLeft: 12,
  },
  
  inputWithRightIcon: {
    marginRight: 12,
  },
  
  multilineInput: {
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: 80,
  },
  
  leftIconContainer: {
    marginRight: 12,
  },
  
  rightIconContainer: {
    marginLeft: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
    borderRadius: PlantTheme.borderRadius.sm,
    ...(Platform.OS === 'android' && {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }),
  },
  
  errorText: {
    fontSize: 12,
    color: PlantTheme.colors.error,
    marginTop: 4,
    marginLeft: 16,
  },
  
  hintText: {
    fontSize: 12,
    color: PlantTheme.colors.textSecondary,
    marginTop: 4,
    marginLeft: 16,
  },
});