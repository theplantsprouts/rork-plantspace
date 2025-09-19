export const PlantTheme = {
  colors: {
    // Primary plant-inspired greens
    primary: '#4CAF50',
    primaryLight: '#81C784',
    primaryDark: '#388E3C',
    
    // Secondary earth tones
    secondary: '#8BC34A',
    secondaryLight: '#AED581',
    secondaryDark: '#689F38',
    
    // Accent colors (floral)
    accent: '#FF7043',
    accentLight: '#FFAB91',
    accentDark: '#D84315',
    
    // Background gradients
    backgroundStart: '#E8F5E8',
    backgroundEnd: '#F1F8E9',
    
    // Glass morphism
    glassBackground: 'rgba(255, 255, 255, 0.3)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
    glassShadow: 'rgba(0, 0, 0, 0.15)',
    
    // Text colors
    textPrimary: '#2E7D32',
    textSecondary: '#558B2F',
    textLight: '#81C784',
    textDark: '#1B5E20',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    
    // Neutral colors
    white: '#FFFFFF',
    black: '#000000',
    gray: '#9E9E9E',
    lightGray: '#F5F5F5',
    darkGray: '#424242',
    
    // Material 3 specific colors for Android
    material3: {
      primary: '#4CAF50',
      onPrimary: '#FFFFFF',
      primaryContainer: '#C8E6C9',
      onPrimaryContainer: '#1B5E20',
      secondary: '#8BC34A',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#DCEDC8',
      onSecondaryContainer: '#33691E',
      tertiary: '#FF7043',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#FFCCBC',
      onTertiaryContainer: '#BF360C',
      surface: '#FEFBFF',
      onSurface: '#1C1B1F',
      surfaceVariant: '#E7E0EC',
      onSurfaceVariant: '#49454F',
      outline: '#79747E',
      outlineVariant: '#CAC4D0',
      inverseSurface: '#313033',
      inverseOnSurface: '#F4EFF4',
      inversePrimary: '#81C784',
    },
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
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
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
  
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.3)',
    border: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    backdropFilter: 'blur(15px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  // Material 3 Design System
  material3: {
    // Shape tokens
    shapes: {
      corner: {
        none: 0,
        extraSmall: 4,
        small: 8,
        medium: 12,
        large: 16,
        extraLarge: 28,
        full: 9999,
      },
    },
    // Motion tokens
    motion: {
      easing: {
        standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
        decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
        accelerate: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
      },
      duration: {
        short1: 50,
        short2: 100,
        short3: 150,
        short4: 200,
        medium1: 250,
        medium2: 300,
        medium3: 350,
        medium4: 400,
        long1: 450,
        long2: 500,
        long3: 550,
        long4: 600,
      },
    },
    // Elevation tokens
    elevation: {
      level0: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      level1: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      level2: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
      },
      level3: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
      },
      level4: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      level5: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
      },
    },
  },
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