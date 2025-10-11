import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';

export default function ChatBotScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatbotStatus, setChatbotStatus] = useState(null);
  const scrollViewRef = useRef();

  useEffect(() => {
    // Check chatbot status on mount
    checkChatbotStatus();
    
    // Add welcome message
    addBotMessage(
      "👋 Hi! I'm your EasyShop AI assistant. How can I help you today?\n\nI can help you with:\n• Finding products\n• Order tracking\n• Shipping information\n• Returns & refunds\n• General questions"
    );
  }, []);

  const checkChatbotStatus = async () => {
    try {
      const response = await api.get('/chatbot/status');
      setChatbotStatus(response.data);
      
      if (!response.data.available) {
        addBotMessage(
          "⚠️ I'm currently unavailable. Please contact our support team for assistance."
        );
      }
    } catch (error) {
      console.error('Error checking chatbot status:', error);
    }
  };

  const addBotMessage = (text) => {
    const botMessage = {
      id: Date.now(),
      text,
      sender: 'bot',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const addUserMessage = (text) => {
    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessageText = inputText.trim();
    setInputText('');
    
    // Add user message to chat
    addUserMessage(userMessageText);
    
    // Show typing indicator
    setIsBotTyping(true);
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages
        .slice(-10) // Last 10 messages for context
        .map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }));

      // Send message to AI chatbot
      const response = await api.post('/chatbot/message', {
        message: userMessageText,
        conversationHistory,
      });

      // Add bot response
      if (response.data.message) {
        addBotMessage(response.data.message);
      } else if (response.data.fallbackMessage) {
        addBotMessage(response.data.fallbackMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addBotMessage(
        "😔 I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team."
      );
    } finally {
      setIsBotTyping(false);
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputText(question);
  };

  const suggestedQuestions = [
    { id: 1, icon: '🛍️', text: 'Help me find a product' },
    { id: 2, icon: '📦', text: 'Track my order' },
    { id: 3, icon: '🚚', text: 'Shipping information' },
    { id: 4, icon: '↩️', text: 'Return policy' },
  ];

  const renderMessage = (message) => {
    const isBot = message.sender === 'bot';
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isBot ? styles.botMessageContainer : styles.userMessageContainer,
        ]}
      >
        {isBot && (
          <View style={styles.botAvatar}>
            <Ionicons name="chatbubbles" size={20} color="#fff" />
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isBot ? styles.botBubble : styles.userBubble,
          ]}
        >
          <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>
            {message.text}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        
        {!isBot && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerAvatar}>
            <Ionicons name="chatbubbles" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {chatbotStatus?.available ? '🟢 Online' : '🔴 Offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
        
        {isBotTyping && (
          <View style={[styles.messageContainer, styles.botMessageContainer]}>
            <View style={styles.botAvatar}>
              <Ionicons name="chatbubbles" size={20} color="#fff" />
            </View>
            <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggested Questions (show when no messages) */}
      {messages.length <= 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
          contentContainerStyle={styles.suggestionsContent}
        >
          {suggestedQuestions.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={styles.suggestionChip}
              onPress={() => handleSuggestedQuestion(q.text)}
            >
              <Text style={styles.suggestionIcon}>{q.icon}</Text>
              <Text style={styles.suggestionText}>{q.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059473',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059473',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#059473',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  botText: {
    color: '#333',
  },
  userText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    paddingVertical: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059473',
    marginHorizontal: 2,
  },
  suggestionsContainer: {
    maxHeight: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  suggestionsContent: {
    padding: 10,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059473',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

