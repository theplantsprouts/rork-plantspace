import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Inbox } from 'lucide-react-native';
import { Image } from 'expo-image';
import { PlantTheme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const trendingTopics = [
  { id: 1, tag: '#VeganRecipes', active: true },
  { id: 2, tag: '#SustainableLiving', active: false },
  { id: 3, tag: '#ZeroWaste', active: false },
  { id: 4, tag: '#PlantParenthood', active: false },
];

const popularGardeners = [
  {
    id: 1,
    name: 'Olivia Green',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Ethan Bloom',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Sophia Leaf',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'Noah Root',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
];

const forYouPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=400&fit=crop',
    title: 'Plant-based cooking tips',
    description: 'Learn how to make delicious and nutritious plant-based meals with these expert tips.',
    views: '120K',
    time: '2 days ago',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop',
    title: 'Sustainable gardening practices',
    description: 'Discover eco-friendly gardening techniques to minimize your environmental impact.',
    views: '85K',
    time: '3 days ago',
  },
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();
  const [selectedTopic, setSelectedTopic] = useState(1);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTopicPress = async (topicId: number) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTopic(topicId);
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Topics</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topicsContainer}
          >
            {trendingTopics.map((topic) => (
              <TouchableOpacity 
                key={topic.id} 
                style={[
                  styles.topicChip,
                  topic.active && styles.topicChipActive
                ]}
                onPress={() => handleTopicPress(topic.id)}
              >
                <Text style={[
                  styles.topicText,
                  topic.active && styles.topicTextActive
                ]}>
                  {topic.tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Gardeners</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sproutsContainer}
          >
            {popularGardeners.map((gardener) => (
              <TouchableOpacity key={gardener.id} style={styles.sproutCard}>
                <Image source={{ uri: gardener.avatar }} style={styles.sproutAvatar} />
                <Text style={styles.sproutName}>{gardener.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>For You</Text>
          <View style={styles.forYouContainer}>
            {forYouPosts.map((post) => (
              <TouchableOpacity key={post.id} style={styles.forYouCard}>
                <Image source={{ uri: post.image }} style={styles.forYouImage} />
                <View style={styles.forYouContent}>
                  <Text style={styles.forYouTitle}>{post.title}</Text>
                  <Text style={styles.forYouDescription}>{post.description}</Text>
                  <Text style={styles.forYouMeta}>{post.views} views · {post.time}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  section: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PlantTheme.colors.onSurface,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  topicsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: PlantTheme.borderRadius.full,
    backgroundColor: 'rgba(226, 226, 226, 0.5)',
    marginRight: 8,
  },
  topicChipActive: {
    backgroundColor: 'rgba(23, 207, 23, 0.1)',
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PlantTheme.colors.onSurface,
  },
  topicTextActive: {
    color: PlantTheme.colors.primary,
  },
  sproutsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  sproutCard: {
    alignItems: 'center',
    width: 96,
  },
  sproutAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  sproutName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: PlantTheme.colors.onSurface,
    textAlign: 'center',
  },
  forYouContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  forYouCard: {
    backgroundColor: 'rgba(226, 226, 226, 0.3)',
    borderRadius: PlantTheme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 16,
  },
  forYouImage: {
    width: '100%',
    height: 192,
  },
  forYouContent: {
    padding: 16,
  },
  forYouTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PlantTheme.colors.onSurface,
    marginBottom: 4,
  },
  forYouDescription: {
    fontSize: 14,
    color: PlantTheme.colors.onSurfaceVariant,
    marginBottom: 8,
    lineHeight: 20,
  },
  forYouMeta: {
    fontSize: 12,
    color: PlantTheme.colors.outline,
  },
});