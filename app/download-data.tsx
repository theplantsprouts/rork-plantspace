import React, { useState } from 'react';
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
import { ArrowLeft, DownloadCloud } from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';

export default function DownloadDataScreen() {
  const insets = useSafeAreaInsets();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestData = () => {
    setIsRequesting(true);
    
    setTimeout(() => {
      setIsRequesting(false);
      Alert.alert(
        '🌱 Request Received',
        'We\'re preparing your data! You\'ll receive an email when your download is ready. This usually takes a few hours.',
        [{ text: 'Got it', onPress: () => router.back() }]
      );
    }, 1500);
  };

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
        <Text style={styles.headerTitle}>Download your data</Text>
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
            <DownloadCloud color={PlantTheme.colors.primary} size={48} />
          </View>
        </View>

        <Text style={styles.title}>Get a copy of your data</Text>
        
        <Text style={styles.description}>
          You can request a file containing your profile information, posts, comments, and other activity within our community.
        </Text>
        
        <Text style={styles.description}>
          Once you request your data, we&apos;ll begin processing it. This may take a little while. When your download is ready, we&apos;ll send a notification to your registered email address.
        </Text>

        <TouchableOpacity
          style={[styles.requestButton, isRequesting && styles.requestButtonDisabled]}
          onPress={handleRequestData}
          disabled={isRequesting}
          activeOpacity={0.7}
        >
          <Text style={styles.requestButtonText}>
            {isRequesting ? 'Requesting...' : 'Request Data'}
          </Text>
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
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#414941',
    lineHeight: 24,
    marginBottom: 16,
  },
  requestButton: {
    backgroundColor: PlantTheme.colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  requestButtonDisabled: {
    opacity: 0.6,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
