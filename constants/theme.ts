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
    
    // Container styles
    containerBackground: 'rgba(255, 255, 255, 0.95)',
    containerBorder: 'rgba(76, 175, 80, 0.2)',
    containerShadow: 'rgba(0, 0, 0, 0.08)',
    
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