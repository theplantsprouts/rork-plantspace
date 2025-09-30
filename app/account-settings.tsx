import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  AtSign,
  Mail,
  Lock,
  Trash2,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';
import { PlantTheme } from '@/constants/theme';

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#1a1c1a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => router.push('/change-username')}
          activeOpacity={0.7}
        >
          <View style={styles.settingItemLeft}>
            <View style={styles.settingIconContainer}>
              <AtSign color={PlantTheme.colors.primary} size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Change Username</Text>
              <Text style={styles.settingSubtitle}>
                @{user?.username || 'Not set'}
              </Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => router.push('/change-email')}
          activeOpacity={0.7}
        >
          <View style={styles.settingItemLeft}>
            <View style={styles.settingIconContainer}>
              <Mail color={PlantTheme.colors.primary} size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Change Email</Text>
              <Text style={styles.settingSubtitle}>
                {user?.email || 'Not set'}
              </Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => router.push('/change-password')}
          activeOpacity={0.7}
        >
          <View style={styles.settingItemLeft}>
            <View style={styles.settingIconContainer}>
              <Lock color={PlantTheme.colors.primary} size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingSubtitle}>
                Last changed 2 months ago
              </Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={styles.dangerCard}
            onPress={() => router.push('/delete-account')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.dangerIconContainer}>
                <Trash2 color="#EF4444" size={24} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.dangerTitle}>Delete Account</Text>
                <Text style={styles.dangerSubtitle}>
                  This action is permanent
                </Text>
              </View>
            </View>
            <Text style={styles.dangerChevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F6F8F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1c1a',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  settingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(23, 207, 23, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1c1a',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  chevron: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '300' as const,
  },
  dangerSection: {
    marginTop: 32,
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dangerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#DC2626',
    marginBottom: 2,
  },
  dangerSubtitle: {
    fontSize: 14,
    color: '#EF4444',
  },
  dangerChevron: {
    fontSize: 24,
    color: '#EF4444',
    fontWeight: '300' as const,
  },
});
