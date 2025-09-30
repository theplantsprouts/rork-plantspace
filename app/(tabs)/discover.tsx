import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Inbox } from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';



export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Explore Garden</Text>
          <TouchableOpacity style={styles.inboxButton}>
            <Inbox color={PlantTheme.colors.onSurface} size={24} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Search 
            color={PlantTheme.colors.onSurfaceVariant} 
            size={20} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search PlantSpace"
            placeholderTextColor={PlantTheme.colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Explore Garden</Text>
          <Text style={styles.emptyStateText}>Discover trending topics, popular gardeners, and content tailored for you.</Text>
          <Text style={styles.emptyStateSubtext}>Start by searching or browsing the garden!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlantTheme.colors.surfaceContainer,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(246, 248, 246, 0.8)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(114, 121, 114, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerSpacer: {
    width: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: PlantTheme.colors.onSurface,
  },
  inboxButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(226, 226, 226, 0.5)',
    borderRadius: PlantTheme.borderRadius.full,
    height: 48,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: PlantTheme.colors.onSurface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: PlantTheme.colors.onSurface,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: PlantTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: PlantTheme.colors.outline,
    textAlign: 'center',
  },
});