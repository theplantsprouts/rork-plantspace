export const PlantTheme = {
  colors: {
    // Primary plant-inspired greens (Material 3 expressive palette)
    primary: '#17cf17',
    primaryLight: '#a3f7a3',
    primaryDark: '#005300',
    primaryContainer: '#a3f7a3',
    onPrimaryContainer: '#002100',

    secondary: '#4CAF50',
    secondaryLight: '#A5D6A7',
    secondaryDark: '#2E7D32',

    tertiary: '#7BD389',
    tertiaryDark: '#2F6B3B',

    // Accent flowers and fruits
    accent: '#FF7043',
    accentLight: '#FFB199',
    accentDark: '#D84315',

    // Material surfaces
    surface: '#ffffff',
    surfaceVariant: '#E3F2E6',
    surfaceContainer: '#F6F8F6',
    surfaceContainerHigh: '#E9ECE9',
    surfaceDark: '#1C2B1C',
    onSurface: '#1a1c1a',
    onSurfaceVariant: '#424942',
    onSurfaceDark: '#e2e3e2',

    outline: '#727972',
    outlineVariant: '#c2c9c2',

    // Background gradients
    backgroundStart: '#f6f8f6',
    backgroundEnd: '#F1F8E9',
    backgroundDark: '#112111',

    // Card backgrounds
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(23, 207, 23, 0.18)',
    cardShadow: 'rgba(0, 0, 0, 0.08)',

    // Glass
    glassBorder: 'rgba(23, 207, 23, 0.28)',
    glassBackground: 'rgba(255, 255, 255, 0.12)',

    // Text colors
    textPrimary: '#2E7D32',
    textSecondary: '#5C6F57',
    textLight: '#81C784',
    textDark: '#1B5E20',

    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Neutral
    white: '#FFFFFF',
    black: '#000000',
    gray: '#9E9E9E',
    lightGray: '#F5F5F5',
    darkGray: '#424242',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },

  elevation: {
    level0: { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
    level1: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 },
    level2: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    level3: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
    level4: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 12, elevation: 6 },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export const PlantTypography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '900' as const },
  headline: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  title: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
};

export const PlantTerminology = {
  home: 'Garden',
  discover: 'Explore',
  create: 'Plant Seed',
  notifications: 'Leaves',
  profile: 'My Grove',
  posts: 'Seeds',
  likes: 'Sunshine',
  comments: 'Roots',
  followers: 'Garden Friends',
  following: 'Tending',
  share: 'Spread Seeds',
  save: 'Harvest',
};

export type PlantGrowthStage = 'seed' | 'sprout' | 'sapling' | 'bloom' | 'tree';

export const PlantGrowthStages: Record<PlantGrowthStage, {
  name: string;
  emoji: string;
  minEngagement: number;
  description: string;
}> = {
  seed: {
    name: 'Seed',
    emoji: '🌱',
    minEngagement: 0,
    description: 'Just getting started in the garden',
  },
  sprout: {
    name: 'Sprout',
    emoji: '🌿',
    minEngagement: 10,
    description: 'Growing and learning',
  },
  sapling: {
    name: 'Sapling',
    emoji: '🌳',
    minEngagement: 50,
    description: 'Developing strong roots',
  },
  bloom: {
    name: 'Bloom',
    emoji: '🌸',
    minEngagement: 100,
    description: 'Flourishing in the community',
  },
  tree: {
    name: 'Mighty Tree',
    emoji: '🌲',
    minEngagement: 200,
    description: 'A pillar of the garden community',
  },
};