import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft, MousePointerClick } from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';

export default function AdPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const [personalizedAds, setPersonalizedAds] = useState(true);

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
          <ArrowLeft color="#191c19" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ad Preferences</Text>
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
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MousePointerClick color={PlantTheme.colors.primary} size={48} />
          </View>
        </View>

        <Text style={styles.title}>Your Ad Garden</Text>
        <Text style={styles.description}>
          Manage how your ad experience grows. These settings help us show you more relevant content and support PlantSpace.
        </Text>

        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Personalized Ads</Text>
              <Text style={styles.settingSubtitle}>
                Allow us to use your activity to cultivate a personalized ad experience.
              </Text>
            </View>
            <Switch
              value={personalizedAds}
              onValueChange={setPersonalizedAds}
              trackColor={{
                false: '#E8EAE6',
                true: 'rgba(23, 207, 23, 0.3)',
              }}
              thumbColor={personalizedAds ? PlantTheme.colors.primary : '#C1C8C0'}
              ios_backgroundColor="#E8EAE6"
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.7}
          >
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Ad Categories</Text>
              <Text style={styles.settingSubtitle}>
                See the topics we think you&apos;re interested in based on your activity.
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.7}
          >
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Manage Ad Partners</Text>
              <Text style={styles.settingSubtitle}>
                Control which ad networks can show you ads on PlantSpace.
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.learnMoreButton} activeOpacity={0.7}>
          <Text style={styles.learnMoreText}>Learn More About Our Ads</Text>
        </TouchableOpacity>
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
    color: '#191c19',
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
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(23, 207, 23, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#191c19',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#414941',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  settingsContainer: {
    backgroundColor: '#F0F4F0',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 48,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#191c19',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#414941',
    lineHeight: 20,
  },
  chevron: {
    fontSize: 24,
    color: '#191c19',
    fontWeight: '300' as const,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(113, 121, 113, 0.3)',
  },
  learnMoreButton: {
    backgroundColor: 'rgba(23, 207, 23, 0.2)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PlantTheme.colors.primary,
  },
});
