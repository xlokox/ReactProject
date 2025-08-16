import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection
  async connect() {
    try {
      // Get the same base URL as API but for socket connection
      const baseURL = 'http://192.168.1.100:5001'; // Update this IP address
      
      this.socket = io(baseURL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        autoConnect: true,
      });

      this.setupEventListeners();
      
      console.log('🔌 Socket.io connection initiated');
      
    } catch (error) {
      console.error('❌ Socket connection error:', error);
    }
  }

  // Setup socket event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket.io connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.addUserToSocket();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error.message);
      this.isConnected = false;
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.addUserToSocket();
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed after maximum attempts');
      this.isConnected = false;
    });

    // Chat-related events
    this.socket.on('seller_message', (message) => {
      console.log('📨 Received seller message:', message);
      // Handle incoming seller message
      this.handleIncomingMessage(message);
    });

    this.socket.on('customer_message', (message) => {
      console.log('📨 Received customer message:', message);
      // Handle incoming customer message
      this.handleIncomingMessage(message);
    });

    this.socket.on('typing', (data) => {
      console.log('⌨️ Typing indicator:', data);
      // Handle typing indicator
    });

    this.socket.on('message_read_confirmation', (data) => {
      console.log('📖 Message read confirmation:', data);
      // Handle read confirmation
    });

    // Active users events
    this.socket.on('activeSeller', (sellers) => {
      console.log('🏪 Active sellers updated:', sellers.length);
    });

    this.socket.on('activeCustomer', (customers) => {
      console.log('👥 Active customers updated:', customers.length);
    });
  }

  // Add user to socket when connected
  async addUserToSocket() {
    try {
      const userInfo = await AsyncStorage.getItem('customerInfo');
      if (userInfo && this.socket) {
        const user = JSON.parse(userInfo);
        this.socket.emit('add_user', user.id, user);
        console.log('👤 User added to socket:', user.name);
      }
    } catch (error) {
      console.error('Error adding user to socket:', error);
    }
  }

  // Send message to seller
  sendMessageToSeller(message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_customer_message', {
        ...message,
        timestamp: new Date().toISOString()
      });
      console.log('📤 Message sent to seller:', message);
    } else {
      console.error('❌ Cannot send message: Socket not connected');
    }
  }

  // Send typing indicator
  sendTypingIndicator(receiverId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', {
        senderId: 'current_user_id', // Replace with actual user ID
        receiverId,
        typing: isTyping
      });
    }
  }

  // Mark message as read
  markMessageAsRead(messageId, senderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message_read', {
        messageId,
        readBy: 'current_user_id', // Replace with actual user ID
        senderId
      });
    }
  }

  // Handle incoming messages
  handleIncomingMessage(message) {
    // This can be extended to update Redux store or trigger notifications
    console.log('📨 Processing incoming message:', message);
    
    // You can dispatch Redux actions here to update the chat state
    // Example: store.dispatch(addMessage(message));
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 Socket disconnected manually');
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Ping server for health check
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
      
      this.socket.once('pong', (data) => {
        console.log('🏓 Pong received:', data);
      });
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
