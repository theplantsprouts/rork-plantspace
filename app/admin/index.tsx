import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { 
  Users, 
  FileText, 
  AlertTriangle,
  Shield,
} from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';
import { trpc } from '@/lib/trpc';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const statsQuery = trpc().admin.stats.dashboard.useQuery();
  const stats = statsQuery.data;
  const isLoading = statsQuery.isLoading;

  const menuItems = [
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      route: '/admin/users',
      color: PlantTheme.colors.primary,
    },
    {
      id: 'content',
      title: 'Content Moderation',
      description: 'Review and moderate posts',
      icon: FileText,
      route: '/admin/content',
      color: PlantTheme.colors.secondary,
    },
    {
      id: 'reports',
      title: 'Reports Review',
      description: 'Handle user reports and complaints',
      icon: AlertTriangle,
      route: '/admin/reports',
      color: PlantTheme.colors.warning,
      badge: stats?.pendingReports,
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Shield size={28} color={PlantTheme.colors.primary} />
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={PlantTheme.colors.primary} />
              <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
          ) : (
            <>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: PlantTheme.colors.surface }]}>
                  <View style={[styles.statIconContainer, { backgroundColor: PlantTheme.colors.primaryLight }]}>
                    <Users size={24} color={PlantTheme.colors.primary} />
                  </View>
                  <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
                  <Text style={styles.statLabel}>Total Users</Text>
                  <Text style={styles.statSubtext}>{stats?.activeUsers || 0} active</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: PlantTheme.colors.surface }]}>
                  <View style={[styles.statIconContainer, { backgroundColor: PlantTheme.colors.secondaryLight }]}>
                    <FileText size={24} color={PlantTheme.colors.secondary} />
                  </View>
                  <Text style={styles.statValue}>{stats?.totalPosts || 0}</Text>
                  <Text style={styles.statLabel}>Total Posts</Text>
                  <Text style={styles.statSubtext}>{stats?.flaggedPosts || 0} flagged</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: PlantTheme.colors.surface }]}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#FFE0B2' }]}>
                    <AlertTriangle size={24} color={PlantTheme.colors.warning} />
                  </View>
                  <Text style={styles.statValue}>{stats?.pendingReports || 0}</Text>
                  <Text style={styles.statLabel}>Pending Reports</Text>
                  <Text style={styles.statSubtext}>Needs review</Text>
                </View>
              </View>

              <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Management</Text>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.menuItem, { backgroundColor: PlantTheme.colors.surface }]}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}20` }]}>
                      <item.icon size={24} color={item.color} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuDescription}>{item.description}</Text>
                    </View>
                    {item.badge !== undefined && item.badge > 0 && (
                      <View style={[styles.badge, { backgroundColor: PlantTheme.colors.error }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
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
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: PlantTheme.colors.onSurface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    padding: 16,
    borderRadius: PlantTheme.borderRadius.md,
    alignItems: 'center',
    ...PlantTheme.shadows.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: PlantTheme.colors.onSurface,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: PlantTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 12,
    color: PlantTheme.colors.textSecondary,
    marginTop: 4,
  },
  menuSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PlantTheme.colors.onSurface,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: PlantTheme.borderRadius.md,
    marginBottom: 12,
    ...PlantTheme.shadows.sm,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PlantTheme.colors.onSurface,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: PlantTheme.colors.onSurfaceVariant,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: PlantTheme.colors.white,
  },
});
