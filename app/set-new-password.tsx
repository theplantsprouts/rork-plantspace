import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { PlantTheme } from "@/constants/theme";
import { router } from "expo-router";

export default function SetNewPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");

  useEffect(() => {
    if (newPassword.length === 0) {
      setPasswordStrength("weak");
      return;
    }

    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) strength++;

    if (strength <= 1) {
      setPasswordStrength("weak");
    } else if (strength <= 2) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  }, [newPassword]);

  const handleSetNewPassword = async () => {
    setErrorMessage("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      console.log("Password updated successfully");
      router.push("/password-reset-success" as any);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setErrorMessage("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return PlantTheme.colors.error;
      case "medium":
        return PlantTheme.colors.warning;
      case "strong":
        return PlantTheme.colors.success;
    }
  };

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case "weak":
        return "33%";
      case "medium":
        return "66%";
      case "strong":
        return "100%";
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <ArrowLeft color={PlantTheme.colors.textDark} size={24} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Set a new password</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.content}>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Enter new password"
                      placeholderTextColor={PlantTheme.colors.textSecondary}
                      secureTextEntry={!showNewPassword}
                      testID="new-password-input"
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeIcon}
                    >
                      {showNewPassword ? (
                        <EyeOff
                          color={PlantTheme.colors.textSecondary}
                          size={20}
                        />
                      ) : (
                        <Eye
                          color={PlantTheme.colors.textSecondary}
                          size={20}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor={PlantTheme.colors.textSecondary}
                      secureTextEntry={!showConfirmPassword}
                      testID="confirm-password-input"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeIcon}
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          color={PlantTheme.colors.textSecondary}
                          size={20}
                        />
                      ) : (
                        <Eye
                          color={PlantTheme.colors.textSecondary}
                          size={20}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.strengthContainer}>
                  <Text style={styles.strengthLabel}>Password Strength</Text>
                  <View style={styles.strengthBarContainer}>
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          width: getStrengthWidth(),
                          backgroundColor: getStrengthColor(),
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.strengthText,
                      { color: getStrengthColor() },
                    ]}
                  >
                    {passwordStrength.charAt(0).toUpperCase() +
                      passwordStrength.slice(1)}
                  </Text>
                </View>

                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleSetNewPassword}
                disabled={loading}
                activeOpacity={0.8}
                testID="set-password-button"
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Updating..." : "Set New Password"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlantTheme.colors.backgroundStart,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: PlantTheme.borderRadius.full,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: PlantTheme.colors.textDark,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingVertical: 40,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: PlantTheme.colors.textSecondary,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PlantTheme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: PlantTheme.colors.outline,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: PlantTheme.colors.textDark,
  },
  eyeIcon: {
    padding: 4,
  },
  strengthContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  strengthLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: PlantTheme.colors.textSecondary,
    marginBottom: 8,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: PlantTheme.colors.surfaceVariant,
    borderRadius: PlantTheme.borderRadius.full,
    overflow: "hidden",
    marginBottom: 8,
  },
  strengthBar: {
    height: "100%",
    borderRadius: PlantTheme.borderRadius.full,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.3)",
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500" as const,
  },
  footer: {
    paddingVertical: 24,
  },
  submitButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingVertical: 16,
    borderRadius: PlantTheme.borderRadius.full,
    alignItems: "center",
    shadowColor: PlantTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold" as const,
  },
});
