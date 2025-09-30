import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Sprout, MailCheck } from "lucide-react-native";
import { PlantTheme } from "@/constants/theme";
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ResetEmailSentScreen() {
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleResendLink = async () => {
    setMessage("");
    setResending(true);

    try {
      const user = auth.currentUser;
      if (user?.email) {
        await sendPasswordResetEmail(auth, user.email);
        setMessage("Reset link sent again! Check your inbox.");
      } else {
        setMessage("Please go back and enter your email again.");
      }
    } catch (error: any) {
      console.error("Resend error:", error);
      setMessage("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/auth")}
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

            <View style={styles.messageCard}>
              <View style={styles.messageIconContainer}>
                <MailCheck color={PlantTheme.colors.primary} size={48} />
              </View>
              <Text style={styles.messageTitle}>Check your inbox</Text>
              <Text style={styles.messageText}>
                A password reset link has been sent to your email. Please check
                your inbox and spam folder to continue.
              </Text>
            </View>

            {message ? (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>{message}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Didn&apos;t receive the email?{" "}
              <Text
                style={[
                  styles.footerLink,
                  resending && styles.footerLinkDisabled,
                ]}
                onPress={resending ? undefined : handleResendLink}
              >
                {resending ? "Sending..." : "Resend link"}
              </Text>
            </Text>
          </View>
        </ScrollView>
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
  messageCard: {
    backgroundColor: PlantTheme.colors.surfaceContainer,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  messageIconContainer: {
    width: 80,
    height: 80,
    borderRadius: PlantTheme.borderRadius.full,
    backgroundColor: PlantTheme.colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: PlantTheme.colors.textDark,
    marginBottom: 12,
    textAlign: "center",
  },
  messageText: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(23, 207, 23, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(23, 207, 23, 0.3)",
  },
  infoText: {
    color: PlantTheme.colors.primary,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500" as const,
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
  footerLinkDisabled: {
    opacity: 0.5,
  },
});
