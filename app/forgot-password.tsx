import React, { useState } from "react";
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
import { ArrowLeft, Sprout } from "lucide-react-native";
import { PlantTheme } from "@/constants/theme";
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSendResetLink = async () => {
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      console.log("Password reset email sent successfully");
      router.push("/reset-email-sent" as any);
    } catch (error: any) {
      console.error("Password reset error:", error);
      let message = "Failed to send reset link. Please try again.";
      
      if (error.code === "auth/user-not-found") {
        message = "No account found with this email address";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many attempts. Please try again later";
      }
      
      setErrorMessage(message);
    } finally {
      setLoading(false);
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
              <Text style={styles.headerTitle}>Reset Password</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Sprout color={PlantTheme.colors.primary} size={64} />
              </View>

              <Text style={styles.title}>Forgot your password?</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we&apos;ll send you a link to get back
                into your account.
              </Text>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="yourname@sprout.com"
                    placeholderTextColor={PlantTheme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="email-input"
                  />
                </View>

                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSendResetLink}
                  disabled={loading}
                  activeOpacity={0.8}
                  testID="send-reset-button"
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Remember your password?{" "}
                <Text
                  style={styles.footerLink}
                  onPress={() => router.push("/auth")}
                >
                  Log in
                </Text>
              </Text>
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
    justifyContent: "center",
    paddingVertical: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: PlantTheme.colors.textDark,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
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
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: PlantTheme.colors.outline,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: PlantTheme.colors.textDark,
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
  submitButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingVertical: 16,
    borderRadius: PlantTheme.borderRadius.full,
    alignItems: "center",
    marginTop: 8,
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
  footer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    textAlign: "center",
  },
  footerLink: {
    color: PlantTheme.colors.primary,
    fontWeight: "600" as const,
  },
});
