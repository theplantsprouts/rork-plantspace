import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';



export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainer }]}>
      <View style={[styles.header, { paddingTop: 16, backgroundColor: `${colors.background}CC`, borderBottomColor: `${colors.outline}33` }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceVariant }]}>
          <Search 
            color={colors.onSurfaceVariant} 
            size={20} 
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            placeholder="Search PlantSpace"
            placeholderTextColor={colors.onSurfaceVariant}
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
          <Text style={[styles.emptyStateTitle, { color: colors.onSurface }]}>Explore Garden</Text>
          <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>Discover trending topics, popular gardeners, and content tailored for you.</Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.outline }]}>Start by searching or browsing the garden!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    height: 48,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});