# 🤖 OpenAI AI Chatbot Integration Guide

## Overview

This guide explains how to set up and use the OpenAI-powered AI chatbot in your EasyShop e-commerce platform. The chatbot provides intelligent customer support, product recommendations, and order assistance.

---

## 🎯 Features

### ✅ **What the Chatbot Can Do:**

- **Product Discovery**: Help customers find products based on their needs
- **Order Tracking**: Assist with order status and shipping information
- **General Support**: Answer questions about shipping, returns, and policies
- **Product Recommendations**: Suggest products based on customer queries
- **24/7 Availability**: Always available to help customers

### 🎨 **User Interface:**

- **Floating Chat Button**: Accessible from the home screen
- **Beautiful Chat Interface**: Modern, WhatsApp-style chat UI
- **Typing Indicators**: Shows when AI is thinking
- **Suggested Questions**: Quick-start prompts for common queries
- **Message History**: Maintains conversation context

---

## 🔧 Setup Instructions

### **Step 1: Get Your OpenAI API Key**

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy your API key (it starts with `sk-...`)

⚠️ **Important**: Keep your API key secure and never commit it to version control!

---

### **Step 2: Configure the Backend**

1. Open the file: `Ecommerce/backend/.env`

2. Add your OpenAI API key:

```env
# OpenAI API (for AI Chatbot)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-actual-api-key-here
```

3. Replace `sk-your-actual-api-key-here` with your actual API key

---

### **Step 3: Install Dependencies (if needed)**

The chatbot uses `axios` which is already installed. No additional dependencies needed!

---

### **Step 4: Start the Server**

```bash
cd Ecommerce/backend
npm start
```

The server will automatically load the chatbot routes.

---

### **Step 5: Test the Chatbot**

#### **Option 1: Test via Mobile App**

1. Start the mobile app:
   ```bash
   cd Ecommerce_App
   npx expo start --tunnel
   ```

2. Open the app on your phone
3. Look for the **floating chat button** (green circle with chat icon) on the home screen
4. Tap it to open the chatbot
5. Start chatting!

#### **Option 2: Test via API (Postman/cURL)**

```bash
# Check chatbot status
curl http://localhost:5001/api/chatbot/status

# Send a message
curl -X POST http://localhost:5001/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me find a laptop",
    "conversationHistory": []
  }'
```

---

## 📡 API Endpoints

### **1. Check Chatbot Status**
```
GET /api/chatbot/status
```
**Response:**
```json
{
  "available": true,
  "model": "gpt-3.5-turbo",
  "message": "AI chatbot is ready to assist you! 🤖"
}
```

---

### **2. Send Message to Chatbot**
```
POST /api/chatbot/message
```
**Request Body:**
```json
{
  "message": "I'm looking for wireless headphones",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help you today?"
    }
  ],
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "message": "I'd be happy to help you find wireless headphones! We have several great options...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### **3. Get Product Recommendations**
```
POST /api/chatbot/recommend-products
```
**Request Body:**
```json
{
  "query": "gaming laptop under $1000",
  "category": "Electronics"
}
```

**Response:**
```json
{
  "recommendations": "Based on your budget, I recommend...",
  "products": [...],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### **4. Get Order Help**
```
POST /api/chatbot/order-help
```
**Request Body:**
```json
{
  "question": "Where is my order?",
  "orderId": "order-id-here",
  "userId": "user-id-here"
}
```

---

### **5. Get Suggested Questions**
```
GET /api/chatbot/suggested-questions
```
**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "category": "products",
      "icon": "🛍️",
      "question": "Help me find a product",
      "examples": [...]
    },
    ...
  ]
}
```

---

## 🎨 Customization

### **Customize the AI Personality**

Edit `Ecommerce/backend/services/openaiService.js`:

```javascript
this.systemPrompt = `You are a helpful AI assistant for EasyShop...
// Customize this text to change the chatbot's personality and behavior
`;
```

### **Change the AI Model**

In `openaiService.js`, change:

```javascript
this.model = 'gpt-3.5-turbo'; // Fast and cost-effective
// OR
this.model = 'gpt-4'; // More intelligent but more expensive
```

### **Adjust Response Length**

In `openaiService.js`, modify:

```javascript
max_tokens: 500, // Increase for longer responses
```

---

## 💰 Cost Management

### **OpenAI Pricing (as of 2024):**

- **GPT-3.5-turbo**: ~$0.002 per 1K tokens (very affordable)
- **GPT-4**: ~$0.03 per 1K tokens (more expensive)

### **Cost Optimization Tips:**

1. **Use GPT-3.5-turbo** for most queries (it's very capable!)
2. **Limit conversation history** to last 10 messages
3. **Set max_tokens** to reasonable values (500-1000)
4. **Monitor usage** on OpenAI dashboard
5. **Set spending limits** in your OpenAI account

### **Estimated Costs:**

- **100 conversations/day** with GPT-3.5-turbo: ~$1-2/month
- **1000 conversations/day** with GPT-3.5-turbo: ~$10-20/month

---

## 🔒 Security Best Practices

### ✅ **DO:**

- Store API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables in production
- Monitor API usage regularly
- Set rate limits on endpoints

### ❌ **DON'T:**

- Commit API keys to Git
- Share API keys publicly
- Hardcode API keys in source code
- Expose API keys in frontend code

---

## 🐛 Troubleshooting

### **Problem: "OpenAI API key is not configured"**

**Solution:**
1. Check that `OPENAI_API_KEY` is set in `.env`
2. Restart the backend server
3. Verify the API key is valid on OpenAI platform

---

### **Problem: "Invalid OpenAI API key"**

**Solution:**
1. Verify your API key on [OpenAI Platform](https://platform.openai.com/api-keys)
2. Make sure you copied the entire key (starts with `sk-`)
3. Check if your OpenAI account has billing enabled

---

### **Problem: "Rate limit exceeded"**

**Solution:**
1. Check your OpenAI usage limits
2. Upgrade your OpenAI plan if needed
3. Implement request throttling in your app

---

### **Problem: Chatbot not responding**

**Solution:**
1. Check backend server logs for errors
2. Verify internet connection
3. Test the `/api/chatbot/status` endpoint
4. Check OpenAI service status

---

## 📱 Mobile App Usage

### **For Customers:**

1. **Open the app** on your phone
2. **Look for the green floating button** with a chat icon
3. **Tap the button** to open the chatbot
4. **Type your question** or select a suggested question
5. **Get instant AI-powered help!**

### **Suggested Questions:**

- "Help me find a product"
- "Track my order"
- "What's your shipping policy?"
- "How do I return an item?"

---

## 🎯 Use Cases

### **1. Product Discovery**
```
Customer: "I need a gift for a 5-year-old boy"
AI: "Great! I can help you find the perfect gift. We have educational toys, building blocks, action figures..."
```

### **2. Order Tracking**
```
Customer: "Where is my order #12345?"
AI: "Let me check that for you. Your order is currently in transit and should arrive by..."
```

### **3. General Support**
```
Customer: "What's your return policy?"
AI: "Our return policy allows returns within 30 days of purchase..."
```

---

## 📊 Monitoring

### **Check Chatbot Usage:**

1. **OpenAI Dashboard**: View API usage and costs
2. **Backend Logs**: Monitor chatbot requests
3. **Analytics**: Track customer satisfaction

---

## 🚀 Future Enhancements

### **Potential Improvements:**

- [ ] Add conversation history storage in database
- [ ] Implement user feedback system (thumbs up/down)
- [ ] Add multilingual support
- [ ] Integrate with order management system
- [ ] Add voice input/output
- [ ] Implement chatbot analytics dashboard
- [ ] Add human handoff for complex queries

---

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review backend server logs
3. Test API endpoints with Postman
4. Verify OpenAI API key is valid

---

## 🎉 Congratulations!

Your AI chatbot is now ready to provide intelligent customer support 24/7! 🤖

**Happy Chatting!** 💬

