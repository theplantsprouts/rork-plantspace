import { Platform } from 'react-native';
import { sendCallSignal, subscribeToCallSignals, clearCallSignals } from './firebase-chat';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private conversationId: string | null = null;
  private userId: string;
  private remoteUserId: string;
  private signalUnsubscribe: (() => void) | null = null;

  constructor(userId: string, remoteUserId: string, conversationId: string) {
    this.userId = userId;
    this.remoteUserId = remoteUserId;
    this.conversationId = conversationId;
  }

  async initializeLocalStream(): Promise<MediaStream> {
    try {
      if (Platform.OS !== 'web') {
        throw new Error('Voice calls are only supported on web. Native support requires a custom development build.');
      }
      
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      
      if (!this.localStream) {
        throw new Error('Failed to initialize local stream');
      }
      return this.localStream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  async createPeerConnection(
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: string) => void
  ) {
    try {
      if (Platform.OS !== 'web') {
        throw new Error('Voice calls are only supported on web. Native support requires a custom development build.');
      }
      
      this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

      if (this.localStream && this.peerConnection) {
        this.localStream.getTracks().forEach((track) => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }

      if (this.peerConnection) {
        this.peerConnection.ontrack = (event) => {
          console.log('Received remote track');
          if (event.streams && event.streams[0]) {
            this.remoteStream = event.streams[0];
            onRemoteStream(event.streams[0]);
          }
        };

        this.peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            console.log('Sending ICE candidate');
            await sendCallSignal({
              type: 'ice-candidate',
              from: this.userId,
              to: this.remoteUserId,
              data: event.candidate,
            });
          }
        };

        this.peerConnection.onconnectionstatechange = () => {
          const state = this.peerConnection?.connectionState || 'unknown';
          console.log('Connection state:', state);
          onConnectionStateChange(state);
        };
      }

      this.setupSignalListener();
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  private setupSignalListener() {
    if (!this.conversationId) return;

    this.signalUnsubscribe = subscribeToCallSignals(this.conversationId, async (signal) => {
      console.log('Received signal:', signal.type);

      if (signal.to !== this.userId) return;

      try {
        switch (signal.type) {
          case 'offer':
            await this.handleOffer(signal.data);
            break;
          case 'answer':
            await this.handleAnswer(signal.data);
            break;
          case 'ice-candidate':
            await this.handleIceCandidate(signal.data);
            break;
          case 'end-call':
            this.endCall();
            break;
        }
      } catch (error) {
        console.error('Error handling signal:', error);
      }
    });
  }

  async createOffer(): Promise<void> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      await sendCallSignal({
        type: 'offer',
        from: this.userId,
        to: this.remoteUserId,
        data: offer,
      });

      console.log('Offer created and sent');
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      await sendCallSignal({
        type: 'answer',
        from: this.userId,
        to: this.remoteUserId,
        data: answer,
      });

      console.log('Answer created and sent');
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('Answer received and set');
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('ICE candidate added');
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  async endCall() {
    console.log('Ending call');

    if (this.conversationId) {
      await sendCallSignal({
        type: 'end-call',
        from: this.userId,
        to: this.remoteUserId,
      });
      await clearCallSignals(this.conversationId);
    }

    if (this.signalUnsubscribe) {
      this.signalUnsubscribe();
      this.signalUnsubscribe = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}
