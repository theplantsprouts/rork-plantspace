import { useState, useCallback } from 'react';
import { Post } from './use-posts';

interface AIAnalysisResult {
  isAgricultureRelated: boolean;
  aiScore: number;
  moderationStatus: 'approved' | 'pending' | 'rejected';
  aiTags: string[];
  recommendationScore: number;
  moderationReason?: string;
}

interface ContentModerationRequest {
  content: string;
  image?: string;
}

interface RecommendationRequest {
  userInterests: string[];
  followedUsers: number[];
  recentActivity: string[];
}

export function useAIContent() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moderationHistory, setModerationHistory] = useState<{
    postId: string;
    result: AIAnalysisResult;
    timestamp: string;
  }[]>([]);

  const analyzeContent = useCallback(async (request: ContentModerationRequest): Promise<AIAnalysisResult> => {
    setIsAnalyzing(true);
    
    try {
      console.log('Analyzing content for agriculture/environment relevance:', request.content);
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an AI content moderator for an agriculture and environment-focused social media platform. 
              
              Analyze the provided content and determine:
              1. Is it related to agriculture, farming, environment, sustainability, climate change, or food production? (true/false)
              2. Rate the relevance on a scale of 0.0 to 1.0 (1.0 being highly relevant)
              3. Should it be approved, pending review, or rejected?
              4. Extract relevant tags (max 5)
              5. Calculate recommendation score (0.0 to 1.0) based on quality and relevance
              
              Approve content that is:
              - Related to agriculture, farming, gardening, sustainability
              - Environmental conservation, climate change, biodiversity
              - Food production, organic farming, permaculture
              - Agricultural technology, precision farming
              - Rural development, agricultural education
              
              Reject content that is:
              - Completely unrelated to agriculture/environment
              - Contains harmful misinformation about farming practices
              - Promotes unsustainable or harmful agricultural practices
              
              Respond in JSON format:
              {
                "isAgricultureRelated": boolean,
                "aiScore": number,
                "moderationStatus": "approved" | "pending" | "rejected",
                "aiTags": ["tag1", "tag2"],
                "recommendationScore": number,
                "moderationReason": "explanation if rejected or pending"
              }`
            },
            {
              role: 'user',
              content: request.content
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      const data = await response.json();
      let analysisResult: AIAnalysisResult;
      
      try {
        analysisResult = JSON.parse(data.completion);
      } catch {
        console.warn('Failed to parse AI response, using fallback analysis');
        analysisResult = fallbackAnalysis(request.content);
      }

      console.log('AI Analysis Result:', analysisResult);
      return analysisResult;
      
    } catch (error) {
      console.error('Error analyzing content:', error);
      return fallbackAnalysis(request.content);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const fallbackAnalysis = (content: string): AIAnalysisResult => {
    const agricultureKeywords = [
      'farm', 'agriculture', 'crop', 'soil', 'plant', 'garden', 'harvest',
      'organic', 'sustainable', 'environment', 'climate', 'biodiversity',
      'compost', 'irrigation', 'pesticide', 'fertilizer', 'seed', 'greenhouse',
      'livestock', 'dairy', 'poultry', 'aquaculture', 'forestry', 'conservation'
    ];
    
    const lowerContent = content.toLowerCase();
    const matchedKeywords = agricultureKeywords.filter(keyword => 
      lowerContent.includes(keyword)
    );
    
    const isRelated = matchedKeywords.length > 0;
    const score = Math.min(matchedKeywords.length * 0.2, 1.0);
    
    return {
      isAgricultureRelated: isRelated,
      aiScore: score,
      moderationStatus: isRelated ? 'approved' : 'pending',
      aiTags: matchedKeywords.slice(0, 4),
      recommendationScore: score * 0.8,
      moderationReason: !isRelated ? 'Content may not be agriculture/environment related' : undefined
    };
  };

  const getRecommendations = useCallback(async (posts: Post[], request: RecommendationRequest): Promise<Post[]> => {
    try {
      console.log('Generating AI-powered recommendations');
      
      const approvedPosts = posts.filter(post => 
        post.moderationStatus === 'approved' && 
        post.isAgricultureRelated
      );
      
      const scoredPosts = approvedPosts.map(post => {
        let score = post.recommendationScore || 0;
        
        if (request.userInterests.some(interest => 
          post.aiTags?.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
        )) {
          score += 0.2;
        }
        
        if (request.followedUsers.includes(parseInt(post.user.id, 10))) {
          score += 0.3;
        }
        
        if (post.likes > 100) score += 0.1;
        if (post.comments > 20) score += 0.1;
        if (post.shares > 10) score += 0.1;
        
        return { ...post, finalScore: Math.min(score, 1.0) };
      });
      
      return scoredPosts
        .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
        .slice(0, 20);
        
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return posts.filter(post => post.moderationStatus === 'approved').slice(0, 10);
    }
  }, []);

  const moderatePost = useCallback(async (post: Post): Promise<Post> => {
    const analysis = await analyzeContent({ 
      content: post.content, 
      image: post.image 
    });
    
    const moderatedPost = {
      ...post,
      ...analysis
    };
    
    setModerationHistory(prev => [{
      postId: post.id,
      result: analysis,
      timestamp: new Date().toISOString()
    }, ...prev.slice(0, 49)]);
    
    return moderatedPost;
  }, [analyzeContent]);

  const getContentInsights = useCallback((posts: Post[]) => {
    const totalPosts = posts.length;
    const approvedPosts = posts.filter(p => p.moderationStatus === 'approved').length;
    const pendingPosts = posts.filter(p => p.moderationStatus === 'pending').length;
    const rejectedPosts = posts.filter(p => p.moderationStatus === 'rejected').length;
    const agriculturePosts = posts.filter(p => p.isAgricultureRelated).length;
    
    const topTags = posts
      .flatMap(p => p.aiTags || [])
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const sortedTags = Object.entries(topTags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
    
    return {
      totalPosts,
      approvedPosts,
      pendingPosts,
      rejectedPosts,
      agriculturePosts,
      approvalRate: totalPosts > 0 ? (approvedPosts / totalPosts) * 100 : 0,
      agricultureRate: totalPosts > 0 ? (agriculturePosts / totalPosts) * 100 : 0,
      topTags: sortedTags
    };
  }, []);

  return {
    analyzeContent,
    getRecommendations,
    moderatePost,
    getContentInsights,
    isAnalyzing,
    moderationHistory
  };
}