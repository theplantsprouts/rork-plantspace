import React from 'react';
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
import {
  ArrowLeft,
  Eye,
  Database,
  Download,
  Ban,
} from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';
import { useSettings } from '@/hooks/use-settings';

type MessagePrivacy = 'everyone' | 'following' | 'none';

export default function PrivacySettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updatePrivacySetting } = useSettings();
  
  const privateProfile = settings.privacy.privateProfile;
  const personalizedAds = settings.privacy.personalizedAds;
  const messagePrivacy = settings.privacy.messagePrivacy;

  const renderRadioOption = (
    value: MessagePrivacy,
    label: string,
    selected: boolean
  ) => (
    <TouchableOpacity
      key={value}
      style={styles.radioOption}
      onPress={() => updatePrivacySetting('messagePrivacy', value)}
      activeOpacity={0.7}
    >
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Privacy</Text>
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
        <View style={styles.settingCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Eye color="#424842" size={24} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Private Profile</Text>
                <Text style={styles.settingSubtitle}>
                  Only followers can see your posts
                </Text>
              </View>
            </View>
            <Switch
              value={privateProfile}
              onValueChange={(value) => updatePrivacySetting('privateProfile', value)}
              trackColor={{
                false: '#E8EAE6',
                true: 'rgba(23, 207, 23, 0.3)',
              }}
              thumbColor={privateProfile ? PlantTheme.colors.primary : '#C1C8C0'}
              ios_backgroundColor="#E8EAE6"
            />
          </View>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.cardTitle}>Who can send you sprouts (messages)?</Text>
          <View style={styles.radioGroup}>
            {renderRadioOption('everyone', 'Everyone', messagePrivacy === 'everyone')}
            {renderRadioOption('following', 'People you follow', messagePrivacy === 'following')}
            {renderRadioOption('none', 'No one', messagePrivacy === 'none')}
          </View>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Database color="#424842" size={24} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Personalized Ads</Text>
                <Text style={styles.settingSubtitle}>
                  Allow using your data for ads
                </Text>
              </View>
            </View>
            <Switch
              value={personalizedAds}
              onValueChange={(value) => updatePrivacySetting('personalizedAds', value)}
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
            onPress={() => router.push('/download-data' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <Download color="#424842" size={24} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Download Your Data</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingCard}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/blocked-accounts' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <Ban color="#424842" size={24} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Blocked Accounts</Text>
                <Text style={styles.settingSubtitle}>
                  Manage accounts you&apos;ve blocked
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
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
  },
  settingCard: {
    backgroundColor: '#F0F4F0',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#1C1C1C',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#444844',
  },
  chevron: {
    fontSize: 24,
    color: '#424842',
    fontWeight: '300' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAE6',
    marginLeft: 56,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: PlantTheme.colors.primary,
    padding: 16,
    paddingBottom: 8,
  },
  radioGroup: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#79747E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: PlantTheme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PlantTheme.colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    color: '#1C1C1C',
  },
});
