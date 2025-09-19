import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';

const stories = [
  {
    id: 'add',
    user: { name: 'Your Story', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' },
    isAdd: true,
  },
  {
    id: 1,
    user: { name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    hasStory: true,
  },
  {
    id: 2,
    user: { name: 'Marcus', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    hasStory: true,
  },
  {
    id: 3,
    user: { name: 'Emma', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    hasStory: true,
  },
  {
    id: 4,
    user: { name: 'David', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
    hasStory: true,
  },
  {
    id: 5,
    user: { name: 'Lisa', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
    hasStory: true,
  },
];

export function StoryCircles() {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stories.map((story) => (
          <TouchableOpacity key={story.id} style={styles.storyItem}>
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