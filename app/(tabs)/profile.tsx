import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Edit3, MapPin, Calendar, Link, TreePine, Leaf, Sun, Bug } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAppContext } from '@/hooks/use-app-context';
import { usePosts } from '@/hooks/use-posts';
import { PlantTheme, PlantTerminology, PlantGrowthStage } from '@/constants/theme';
import { PlantGrowthAnimation } from '@/components/PlantGrowthAnimation';
import { GlassCard } from '@/components/GlassContainer';


export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const { currentUser } = useAppContext();
  const { posts } = usePosts();

  const insets = useSafeAreaInsets();
  
  const userPosts = posts.filter(post => post.user.id === currentUser?.id);
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
  
  // Calculate engagement score for plant growth
  const engagementScore = userPosts.length * 2 + totalLikes + (currentUser?.followers || 0) * 0.1;
  
  // Determine plant growth stage
  const getPlantStage = (score: number): PlantGrowthStage => {
    if (score >= 200) return 'tree';
    if (score >= 100) return 'bloom';
    if (score >= 50) return 'sapling';
    if (score >= 10) return 'sprout';
    return 'seed';
  };
  
  const plantStage = getPlantStage(engagementScore);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd, PlantTheme.colors.primaryLight]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌲 {PlantTerminology.profile}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => {
                router.push('/debug');
              }}
            >
              <Bug color={PlantTheme.colors.textSecondary} size={20} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Settings color={PlantTheme.colors.textPrimary} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          removeClippedSubviews={true}
        >
          <GlassCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Image 
                source={{ uri: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face' }} 
                style={styles.profileImage}
                cachePolicy="memory-disk"
                contentFit="cover"
                transition={200}
              />
              <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
                <Edit3 color={PlantTheme.colors.white} size={16} />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>{currentUser?.name || 'Alex Johnson'}</Text>
            <Text style={styles.profileHandle}>{currentUser?.username || '@alexjohnson'}</Text>
            
            <Text style={styles.profileBio}>
              Digital creator & photographer 📸 Sharing moments that matter ✨ Living life one adventure at a time 🌍
            </Text>

            <View style={styles.profileInfo}>
              <View style={styles.infoItem}>
                <MapPin color={PlantTheme.colors.textSecondary} size={16} />
                <Text style={styles.infoText}>San Francisco, CA</Text>
              </View>
              <View style={styles.infoItem}>
                <Calendar color={PlantTheme.colors.textSecondary} size={16} />
                <Text style={styles.infoText}>Joined March 2023</Text>
              </View>
              <View style={styles.infoItem}>
                <Link color={PlantTheme.colors.textSecondary} size={16} />
                <Text style={styles.infoText}>alexjohnson.com</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Sun color={PlantTheme.colors.accent} size={20} />
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Seeds</Text>
              </View>
              <View style={styles.statItem}>
                <TreePine color={PlantTheme.colors.primary} size={20} />
                <Text style={styles.statNumber}>{currentUser?.followers || 0}</Text>
                <Text style={styles.statLabel}>Garden Friends</Text>
              </View>
              <View style={styles.statItem}>
                <Leaf color={PlantTheme.colors.secondary} size={20} />
                <Text style={styles.statNumber}>{currentUser?.following || 0}</Text>
                <Text style={styles.statLabel}>Tending</Text>
              </View>
              <View style={styles.statItem}>
                <Sun color={PlantTheme.colors.accent} size={20} />
                <Text style={styles.statNumber}>{totalLikes}</Text>
                <Text style={styles.statLabel}>Sunshine</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editProfileButton} activeOpacity={0.8}>
                <Text style={styles.editProfileText}>Tend Garden</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
                <Text style={styles.shareButtonText}>Spread Seeds</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Plant Growth Animation - Moved below profile details */}
          <GlassCard style={styles.plantGrowthCard}>
            <PlantGrowthAnimation 
              stage={plantStage}
              engagementScore={Math.round(engagementScore)}
              size={120}
            />
          </GlassCard>

          <View style={styles.postsSection}>
            <Text style={styles.sectionTitle}>🌱 Your Seeds ({userPosts.length})</Text>
            {userPosts.length === 0 ? (
              <View style={styles.emptyPosts}>
                <Text style={styles.emptyPostsText}>No seeds planted yet</Text>
                <Text style={styles.emptyPostsSubtext}>Plant your first seed to start growing!</Text>
              </View>
            ) : (
              <View style={styles.postsGrid}>
                {userPosts.slice(0, 9).map((post) => (
                  <TouchableOpacity 
                    key={post.id} 
                    style={[styles.postItem, { width: (width - 50) / 3, height: (width - 50) / 3 }]}
                    activeOpacity={0.8}
                  >
                    {post.image ? (
                      <Image 
                        source={{ uri: post.image }} 
                        style={styles.postImage}
                        cachePolicy="memory-disk"
                        contentFit="cover"
                        transition={100}
                      />
                    ) : (
                      <View style={styles.textPost}>
                        <Text style={styles.textPostContent} numberOfLines={4}>
                          {post.content}
                        </Text>
                      </View>
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.postOverlay}
                    >
                      <Text style={styles.postLikes}>{post.likes}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PlantTheme.colors.textDark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  debugButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 25,
    padding: 25,
    backgroundColor: 'transparent',
  },
  plantGrowthCard: {
    alignItems: 'center',
    marginBottom: 25,
    padding: 20,
    backgroundColor: 'transparent',
  },
  profileHeader: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: PlantTheme.colors.primary,
  },
  editButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: PlantTheme.colors.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...PlantTheme.shadows.sm,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    marginBottom: 5,
  },
  profileHandle: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    marginBottom: 15,
  },
  profileBio: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  profileInfo: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
    marginBottom: 25,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  editProfileButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: PlantTheme.borderRadius.lg,
    ...PlantTheme.shadows.sm,
  },
  editProfileText: {
    color: PlantTheme.colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  shareButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: PlantTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
  },
  shareButtonText: {
    color: PlantTheme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  postsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    marginBottom: 15,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  postItem: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 5,
  },
  postLikes: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyPostsText: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyPostsSubtext: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  textPost: {
    backgroundColor: 'transparent',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
  },
  textPostContent: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});