import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import notificationService from './notificationService';

class GlobalMessageListener {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.userId = null;
        this.isCoach = false;
    }

    connect(userId, isCoach = false) {
        // Disconnect existing connection if any
        this.disconnect();
        
        this.userId = userId;
        this.isCoach = isCoach;
        
        console.log('GlobalMessageListener: Connecting for user:', userId, 'isCoach:', isCoach);
        
        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            debug: () => {},
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = (frame) => {
            console.log('GlobalMessageListener: Connected to WebSocket: ' + frame);
            this.connected = true;
            
            if (isCoach) {
                // Coach: subscribe to all session topics using wildcard
                this.subscribeToAllSessions();
            }
            
            // Subscribe to user status updates
            const statusSubscription = this.stompClient.subscribe('/topic/user-status', (message) => {
                try {
                    const statusUpdate = JSON.parse(message.body);
                    console.log('GlobalMessageListener: Received user status update:', statusUpdate);
                } catch (error) {
                    console.error('Error parsing user status message:', error);
                }
            });
        };

        this.stompClient.onStompError = (frame) => {
            console.error('GlobalMessageListener: Broker reported error: ' + frame.headers['message']);
            this.connected = false;
        };

        this.stompClient.onWebSocketError = (error) => {
            console.error('GlobalMessageListener: WebSocket error:', error);
            this.connected = false;
        };

        this.stompClient.onWebSocketClose = () => {
            console.log('GlobalMessageListener: WebSocket connection closed');
            this.connected = false;
        };

        console.log('GlobalMessageListener: Activating WebSocket connection...');
        this.stompClient.activate();
    }

    subscribeToAllSessions() {
        if (!this.connected || !this.stompClient) {
            console.warn('GlobalMessageListener: Not connected, cannot subscribe to sessions');
            return;
        }

        // Subscribe to global messages topic for coaches
        const globalMessagesSubscription = this.stompClient.subscribe('/topic/global-messages', (message) => {
            try {
                console.log('GlobalMessageListener: Received message on global topic');
                const receivedMessage = JSON.parse(message.body);
                console.log('GlobalMessageListener: Parsed message:', receivedMessage);
                
                // Hiển thị thông báo nếu tin nhắn từ người khác
                if (receivedMessage.senderId && receivedMessage.senderId !== this.userId) {
                    const senderName = receivedMessage.senderName || receivedMessage.senderUsername || 'Người dùng';
                    notificationService.showNewMessageNotification(senderName, receivedMessage.sessionId);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });
        
        console.log('GlobalMessageListener: Subscribed to global messages topic');
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.connected = false;
            this.userId = null;
            this.isCoach = false;
        }
    }

    isConnected() {
        return this.connected;
    }
}

// Tạo instance singleton
const globalMessageListener = new GlobalMessageListener();
export default globalMessageListener; 