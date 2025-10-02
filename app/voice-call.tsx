import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PhoneOff, Mic, MicOff } from 'lucide-react-native';
import { Image } from 'expo-image';
import { WebRTCService } from '@/lib/webrtc';
import { auth } from '@/lib/firebase';

type CallState = 'connecting' | 'ringing' | 'connected' | 'ended';

export default function VoiceCallScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    conversationId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    isCaller: string;
  }>();

  const [callState, setCallState] = useState<CallState>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const webrtcService = useRef<WebRTCService | null>(null);
  const callTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentUser = auth.currentUser;

  const initializeCall = useCallback(async () => {
    if (!currentUser || !params.conversationId || !params.userId) {
      Alert.alert('Error', 'Invalid call parameters');
      router.back();
      return;
    }

    try {
      console.log('Initializing WebRTC call');
      webrtcService.current = new WebRTCService(
        currentUser.uid,
        params.userId,
        params.conversationId
      );

      await webrtcService.current.initializeLocalStream();
      console.log('Local stream initialized');

      await webrtcService.current.createPeerConnection(
        (remoteStream) => {
          console.log('Remote stream received');
          setCallState('connected');
        },
        (state) => {
          console.log('Connection state changed:', state);
          if (state === 'connected') {
            setCallState('connected');
          } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
            setCallState('ended');
            setTimeout(() => router.back(), 1000);
          }
        }
      );

      if (params.isCaller === 'true') {
        console.log('Creating offer as caller');
        setCallState('ringing');
        await webrtcService.current.createOffer();
      } else {
        console.log('Waiting for offer as receiver');
        setCallState('ringing');
      }
    } catch (error) {
      console.error('Error initializing call:', error);
      Alert.alert('Error', 'Failed to initialize call. Please check microphone permissions.');
      router.back();
    }
  }, [currentUser, params.conversationId, params.userId, params.isCaller]);

  const endCall = useCallback(async () => {
    console.log('Ending call');
    if (webrtcService.current) {
      await webrtcService.current.endCall();
      webrtcService.current = null;
    }
    if (callTimer.current) {
      clearInterval(callTimer.current);
      callTimer.current = null;
    }
    setCallState('ended');
    router.back();
  }, []);

  useEffect(() => {
    initializeCall();

    return () => {
      endCall();
    };
  }, [initializeCall, endCall]);

  useEffect(() => {
    if (callState === 'connected') {
      callTimer.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimer.current) {
        clearInterval(callTimer.current);
        callTimer.current = null;
      }
    }

    return () => {
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
    };
  }, [callState]);



  const toggleMute = () => {
    if (webrtcService.current) {
      const localStream = webrtcService.current.getLocalStream();
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = !track.enabled;
        });
        setIsMuted(!isMuted);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStateText = () => {
    switch (callState) {
      case 'connecting':
        return 'Connecting...';
      case 'ringing':
        return params.isCaller === 'true' ? 'Ringing...' : 'Incoming call...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call ended';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#17cf17', '#0ea80e']}
        style={StyleSheet.absoluteFillObject}
      />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: params.userAvatar || 'https://via.placeholder.com/120' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{params.userName}</Text>
          <Text style={styles.callState}>{getCallStateText()}</Text>
        </View>

        <View style={[styles.controls, { paddingBottom: insets.bottom + 40 }]}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            {isMuted ? (
              <MicOff size={32} color="#FFFFFF" />
            ) : (
              <Mic size={32} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
            <PhoneOff size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    paddingTop: 60,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  callState: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
