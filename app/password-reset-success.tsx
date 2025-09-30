import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sprout } from "lucide-react-native";
import { PlantTheme } from "@/constants/theme";
import { router } from "expo-router";

export default function PasswordResetSuccessScreen() {
  const handleBackToLogin = () => {
    router.replace("/auth");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Sprout color={PlantTheme.colors.onPrimaryContainer} size={48} />
            </View>
          </View>

          <Text style={styles.title}>Password Updated!</Text>
          <Text style={styles.subtitle}>
            Your password has been updated successfully. You can now log in with
            your new password.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleBackToLogin}
            activeOpacity={0.8}
            testID="back-to-login-button"
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: PlantTheme.borderRadius.full,
    backgroundColor: PlantTheme.colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    ...PlantTheme.shadows.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: PlantTheme.colors.textDark,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
  },
  button: {
    backgroundColor: PlantTheme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: PlantTheme.borderRadius.full,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    shadowColor: PlantTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold" as const,
  },
});
