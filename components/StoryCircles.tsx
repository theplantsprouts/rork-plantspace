import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePosts } from '@/hooks/use-posts';
import { useAppContext } from '@/hooks/use-app-context';

interface StoryCirclesProps {
  posts?: any[];
}

export function StoryCircles({ posts: propPosts }: StoryCirclesProps = {}) {
  const { posts: hookPosts } = usePosts();
  const { currentUser } = useAppContext();
  const posts = propPosts || hookPosts;

  const handleAddStory = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Story Feature', 'Story creation is coming soon!');
      return;
    }

    Alert.alert(
      'Add Story',
      'What would you like to share?',
      [
        { text: 'Text Story', onPress: () => handleCreateStory('text') },
        { text: 'Photo Story', onPress: () => handleCreateStory('photo') },
        { text: 'Both', onPress: () => handleCreateStory('both') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCreateStory = async (type: 'text' | 'photo' | 'both') => {
    if (type === 'photo' || type === 'both') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need photo permissions to add images to your story.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Story image:', result.assets[0].uri);
      }
    }

    // Here you would implement story creation logic
    Alert.alert('Story Created', 'Your story will disappear in 24 hours!');
  };
  
  const stories = useMemo(() => {
    const uniqueUsers = posts.reduce((acc: any[], post: any) => {
      if (!acc.find(u => u.id === post.user.id)) {
        acc.push({
          id: post.user.id,
          user: {
            name: post.user.name.split(' ')[0], // First name only
            avatar: post.user.avatar,
          },
          hasStory: true,
        });
      }
      return acc;
    }, []);
    
    const addStory = {
      id: 'add',
      user: {
        name: 'Your Story',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      },
      isAdd: true,
    };
    
    return [addStory, ...uniqueUsers.slice(0, 8)];
  }, [posts, currentUser]);
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stories.map((story) => (
          <TouchableOpacity 
            key={story.id} 
            style={styles.storyItem}
            onPress={story.isAdd ? handleAddStory : undefined}
          >
            {story.isAdd ? (
              <View style={styles.addStoryContainer}>
                <Image source={{ uri: story.user.avatar }} style={styles.addStoryAvatar} />
                <View style={styles.addButton}>
                  <Plus color="#fff" size={16} />
                </View>
              </View>
            ) : (
              <LinearGradient
                colors={['#FF6B9D', '#4ECDC4', '#45B7D1']}
                style={styles.storyGradient}
              >
                <Image source={{ uri: story.user.avatar }} style={styles.storyAvatar} />
              </LinearGradient>
            )}
            <Text style={styles.storyName}>{story.user.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 15,
    gap: 15,
  },
  storyItem: {
    alignItems: 'center',
    width: 70,
  },
  addStoryContainer: {
    position: 'relative',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStoryAvatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  addButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF6B9D',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  storyGradient: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  storyName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});