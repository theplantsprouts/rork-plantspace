import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X, Sparkles, User } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { usePosts } from '@/hooks/use-posts';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { GlassCard } from '@/components/GlassContainer';
import { AnimatedIconButton } from '@/components/AnimatedPressable';
import { trackSearch } from '@/lib/analytics';
import { trpc } from '@/lib/trpc';



export default function DiscoverScreen() {
  const params = useLocalSearchParams<{ search?: string }>();
  const [searchQuery, setSearchQuery] = useState(params.search || '');
  const [debouncedQuery, setDebouncedQuery] = useState(params.search || '');
  const [showRecommendations, setShowRecommendations] = useState(!params.search);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const searchType = 'all' as const;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { recommendedPosts, getSmartRecommendations } = usePosts();
  
  useEffect(() => {
    if (params.search) {
      setSearchQuery(params.search);
      setDebouncedQuery(params.search);
      setShowRecommendations(false);
    }
  }, [params.search]);
  
  const searchQuery_trpc = trpc.posts.search.useQuery(
    { 
      searchQuery: debouncedQuery,
      type: searchType,
      limit: 20 
    },
    { 
      enabled: debouncedQuery.length > 0,
      refetchOnWindowFocus: false,
    }
  );
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!searchQuery && recommendedPosts.length === 0) {
        setLoadingRecommendations(true);
        try {
          await getSmartRecommendations(
            ['agriculture', 'farming', 'sustainability', 'environment'],
            []
          );
        } catch (error) {
          console.error('Error loading recommendations:', error);
        } finally {
          setLoadingRecommendations(false);
        }
      }
    };
    loadRecommendations();
  }, [searchQuery, recommendedPosts.length, getSmartRecommendations]);

  const searchResults = useMemo(() => {
    if (!debouncedQuery || !searchQuery_trpc.data) {
      return { users: [], posts: [], hashtags: [] };
    }
    
    if (searchQuery.trim()) {
      const totalResults = 
        (searchQuery_trpc.data.users?.length || 0) + 
        (searchQuery_trpc.data.posts?.length || 0) + 
        (searchQuery_trpc.data.hashtags?.length || 0);
      trackSearch(searchQuery, totalResults);
    }
    
    return searchQuery_trpc.data;
  }, [searchQuery_trpc.data, debouncedQuery, searchQuery]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowRecommendations(!query.trim());
  };
  
  const clearSearch = () => {
    setSearchQuery('');
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
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <AnimatedIconButton
              style={styles.clearButton}
              onPress={clearSearch}
              bounceEffect="subtle"
            >
              <X color={colors.onSurfaceVariant} size={20} />
            </AnimatedIconButton>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {!searchQuery.trim() && showRecommendations ? (
          <View>
            <View style={styles.recommendationHeader}>
              <Sparkles color={colors.primary} size={24} />
              <Text style={[styles.recommendationTitle, { color: colors.onSurface }]}>Recommended for You</Text>
            </View>
            <Text style={[styles.recommendationSubtext, { color: colors.onSurfaceVariant }]}>
              AI-powered content based on your interests
            </Text>
            {loadingRecommendations ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Finding best content...</Text>
              </View>
            ) : recommendedPosts.length > 0 ? (
              <View style={styles.resultsContainer}>
                {recommendedPosts.map((post) => (
                  <TouchableOpacity
                    key={post.id}
                    onPress={() => router.push(`/post-detail?postId=${post.id}`)}
                    activeOpacity={0.7}
                  >
                    <GlassCard style={[styles.postCard, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
                      <View style={styles.postHeader}>
                        <View style={styles.postAvatar}>
                          {post.user.avatar ? (
                            <Image
                              source={{ uri: post.user.avatar }}
                              style={styles.postAvatarImage}
                              contentFit="cover"
                              cachePolicy="memory-disk"
                              transition={100}
                            />
                          ) : (
                            <Text style={[styles.postAvatarText, { color: colors.primary }]}>
                              {post.user.name.charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>
                        <View style={styles.postUserInfo}>
                          <Text style={[styles.postUsername, { color: colors.onSurface }]}>{post.user.name}</Text>
                          <View style={styles.postMetaRow}>
                            <Text style={[styles.postTimestamp, { color: colors.onSurfaceVariant }]}>{post.timestamp}</Text>
                            {post.aiScore && post.aiScore > 0.7 && (
                              <View style={[styles.qualityBadge, { backgroundColor: `${colors.primary}20` }]}>
                                <Sparkles size={12} color={colors.primary} />
                                <Text style={[styles.qualityText, { color: colors.primary }]}>
                                  {(post.aiScore * 100).toFixed(0)}%
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                      <Text style={[styles.postContent, { color: colors.onSurfaceVariant }]} numberOfLines={3}>
                        {post.content}
                      </Text>
                      {post.aiTags && post.aiTags.length > 0 && (
                        <View style={styles.tagsRow}>
                          {post.aiTags.slice(0, 3).map((tag, idx) => (
                            <View key={idx} style={[styles.tagPill, { backgroundColor: `${colors.primary}15` }]}>
                              <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      {post.image && (
                        <Image
                          source={{ uri: post.image }}
                          style={styles.postImage}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={100}
                        />
                      )}
                      <View style={styles.postStats}>
                        <Text style={[styles.postStatsText, { color: colors.onSurfaceVariant }]}>
                          {post.likes} likes • {post.comments} comments
                        </Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateTitle, { color: colors.onSurface }]}>Explore Garden</Text>
                <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>Discover trending topics, popular gardeners, and content tailored for you.</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.outline }]}>Start by searching or browsing the garden!</Text>
              </View>
            )}
          </View>
        ) : (searchQuery_trpc.isLoading || searchQuery_trpc.isFetching) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Searching...</Text>
          </View>
        ) : (searchResults.users.length === 0 && searchResults.posts.length === 0 && searchResults.hashtags.length === 0) ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateTitle, { color: colors.onSurface }]}>No Results Found</Text>
            <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>We could not find any posts matching &quot;{searchQuery}&quot;</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.outline }]}>Try different keywords or browse all posts</Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {searchResults.users.length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  Users ({searchResults.users.length})
                </Text>
                {searchResults.users.map((user: any) => (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => router.push(`/user-profile?userId=${user.id}`)}
                    activeOpacity={0.7}
                  >
                    <GlassCard style={[styles.userCard, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
                      <View style={styles.userCardContent}>
                        {user.avatar ? (
                          <Image
                            source={{ uri: user.avatar }}
                            style={styles.userAvatar}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            transition={100}
                          />
                        ) : (
                          <View style={[styles.userAvatar, { backgroundColor: `${colors.primary}20` }]}>
                            <User color={colors.primary} size={24} />
                          </View>
                        )}
                        <View style={styles.userInfo}>
                          <Text style={[styles.userDisplayName, { color: colors.onSurface }]}>
                            {user.name}
                          </Text>
                          <Text style={[styles.userUsername, { color: colors.onSurfaceVariant }]}>
                            @{user.username}
                          </Text>
                          {user.bio && (
                            <Text 
                              style={[styles.userBio, { color: colors.onSurfaceVariant }]} 
                              numberOfLines={2}
                            >
                              {user.bio}
                            </Text>
                          )}
                        </View>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {searchResults.hashtags.length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  Hashtags ({searchResults.hashtags.length})
                </Text>
                <View style={styles.hashtagsContainer}>
                  {searchResults.hashtags.map((tag: string, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSearchQuery(`#${tag}`)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.hashtagPill, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
                        <Text style={[styles.hashtagText, { color: colors.primary }]}>#{tag}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {searchResults.posts.length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  Posts ({searchResults.posts.length})
                </Text>
                {searchResults.posts.map((post: any) => (
              <TouchableOpacity
                key={post.id}
                onPress={() => router.push(`/post-detail?postId=${post.id}`)}
                activeOpacity={0.7}
              >
                <GlassCard style={[styles.postCard, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
                  <View style={styles.postHeader}>
                    <View style={styles.postAvatar}>
                      {post.user.avatar ? (
                        <Image
                          source={{ uri: post.user.avatar }}
                          style={styles.postAvatarImage}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={100}
                        />
                      ) : (
                        <Text style={[styles.postAvatarText, { color: colors.primary }]}>
                          {post.user.name.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.postUserInfo}>
                      <Text style={[styles.postUsername, { color: colors.onSurface }]}>{post.user.name}</Text>
                      <Text style={[styles.postTimestamp, { color: colors.onSurfaceVariant }]}>{post.timestamp}</Text>
                    </View>
                  </View>
                  <Text style={[styles.postContent, { color: colors.onSurfaceVariant }]} numberOfLines={3}>
                    {post.content}
                  </Text>
                  {post.image && (
                    <Image
                      source={{ uri: post.image }}
                      style={styles.postImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={100}
                    />
                  )}
                  <View style={styles.postStats}>
                    <Text style={[styles.postStatsText, { color: colors.onSurfaceVariant }]}>
                      {post.likes} likes • {post.comments} comments
                    </Text>
                  </View>
                </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
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
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  postCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  postAvatarImage: {
    width: 40,
    height: 40,
  },
  postAvatarText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  postUserInfo: {
    flex: 1,
  },
  postUsername: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  postTimestamp: {
    fontSize: 13,
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  postStats: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  postStatsText: {
    fontSize: 13,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  recommendationTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  recommendationSubtext: {
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 12,
    marginTop: 8,
  },
  userCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userDisplayName: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    marginBottom: 4,
  },
  userBio: {
    fontSize: 13,
    lineHeight: 18,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  hashtagPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  hashtagText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});