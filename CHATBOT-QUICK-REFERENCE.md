# 🤖 OpenAI Chatbot - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1️⃣ Get API Key
```
Visit: https://platform.openai.com/api-keys
Create new key → Copy it
```

### 2️⃣ Configure
```bash
# Edit: Ecommerce/backend/.env
OPENAI_API_KEY=sk-your-key-here
```

### 3️⃣ Start
```bash
# Terminal 1: Backend
cd Ecommerce/backend && npm start

# Terminal 2: Mobile App
cd Ecommerce_App && npx expo start --tunnel
```

---

## 📡 API Endpoints Cheat Sheet

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chatbot/status` | GET | Check availability |
| `/api/chatbot/message` | POST | Send chat message |
| `/api/chatbot/recommend-products` | POST | Get recommendations |
| `/api/chatbot/order-help` | POST | Order assistance |
| `/api/chatbot/suggested-questions` | GET | Get question prompts |

---

## 💬 Example API Calls

### Check Status
```bash
curl http://localhost:5001/api/chatbot/status
```

### Send Message
```bash
curl -X POST http://localhost:5001/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me find a laptop",
    "conversationHistory": []
  }'
```

### Get Recommendations
```bash
curl -X POST http://localhost:5001/api/chatbot/recommend-products \
  -H "Content-Type: application/json" \
  -d '{
    "query": "gaming laptop under $1000",
    "category": "Electronics"
  }'
```

---

## 🎨 Customization Quick Guide

### Change AI Personality
**File:** `Ecommerce/backend/services/openaiService.js`
```javascript
this.systemPrompt = `Your custom personality here...`;
```

### Change Model
```javascript
this.model = 'gpt-3.5-turbo'; // Fast & cheap
// OR
this.model = 'gpt-4'; // Smart & expensive
```

### Adjust Response Length
```javascript
max_tokens: 500, // Default
max_tokens: 1000, // Longer responses
max_tokens: 200, // Shorter responses
```

### Change UI Colors
**File:** `Ecommerce_App/src/screens/ChatBotScreen.js`
```javascript
backgroundColor: '#059473', // Your brand color
```

---

## 💰 Cost Calculator

### GPT-3.5-turbo (Recommended)
- **Price:** $0.002 per 1K tokens
- **Average chat:** ~200 tokens = $0.0004
- **100 chats/day:** ~$1-2/month
- **1000 chats/day:** ~$10-20/month

### GPT-4 (Premium)
- **Price:** $0.03 per 1K tokens
- **Average chat:** ~200 tokens = $0.006
- **100 chats/day:** ~$15-30/month
- **1000 chats/day:** ~$150-300/month

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not configured" | Check `.env` file, restart server |
| "Invalid API key" | Verify on OpenAI platform, check billing |
| "Rate limit exceeded" | Upgrade OpenAI plan or wait |
| No response | Check logs, test `/api/chatbot/status` |
| Floating button not showing | Check `App.js` imports, restart app |

---

## 📁 Files Created

### Backend
- ✨ `services/openaiService.js` - Core AI service
- ✨ `controllers/chat/ChatbotController.js` - API controller
- ✨ `routes/chatbotRoutes.js` - Route definitions
- ✨ `test-chatbot.js` - Test script
- 📝 `server.js` - Updated with routes
- 📝 `.env` - Added API key

### Mobile App
- ✨ `src/screens/ChatBotScreen.js` - Chat UI
- ✨ `src/components/FloatingChatButton.js` - Floating button
- 📝 `App.js` - Added navigation

### Documentation
- ✨ `OPENAI-CHATBOT-SETUP.md` - Full guide
- ✨ `CHATBOT-IMPLEMENTATION-SUMMARY.md` - Overview
- ✨ `CHATBOT-QUICK-REFERENCE.md` - This file
- ✨ `PUML Files/chatbot-flow.puml` - Flow diagram

---

## 🧪 Test Commands

### Test Backend
```bash
cd Ecommerce/backend
node test-chatbot.js
```

### Test API Endpoint
```bash
curl http://localhost:5001/api/chatbot/status
```

### Check Logs
```bash
# Backend logs show chatbot activity
# Look for: 🤖 💬 ✅ ❌ emojis
```

---

## 🎯 Common Use Cases

### Product Discovery
```
User: "I need a gift for a 5-year-old"
AI: "Great! We have educational toys, building blocks..."
```

### Order Tracking
```
User: "Where is my order?"
AI: "Your order is in transit, arriving by..."
```

### General Help
```
User: "What's your return policy?"
AI: "We accept returns within 30 days..."
```

---

## 🔒 Security Checklist

- [x] API key in `.env` file
- [x] `.env` in `.gitignore`
- [x] No keys in source code
- [x] Environment variables only
- [x] Error messages don't expose keys

---

## 📊 Monitoring

### OpenAI Dashboard
- View usage: https://platform.openai.com/usage
- Check costs: https://platform.openai.com/account/billing
- Set limits: https://platform.openai.com/account/limits

### Backend Logs
```bash
# Look for these indicators:
🤖 Chatbot message received
✅ AI Response generated
❌ Error in sendMessage
💬 Chatbot routes registered
```

---

## 🎨 UI Components

### Floating Chat Button
- **Location:** Home screen (bottom right)
- **Color:** Green (#059473)
- **Animation:** Pulse effect
- **Badge:** Red dot notification

### Chat Screen
- **Header:** AI Assistant with status
- **Messages:** WhatsApp-style bubbles
- **Input:** Bottom text field with send button
- **Suggestions:** Horizontal scroll chips

---

## 🚀 Performance Tips

### Optimize Costs
1. Use GPT-3.5-turbo (not GPT-4)
2. Limit conversation history to 10 messages
3. Set reasonable max_tokens (500-1000)
4. Monitor usage on OpenAI dashboard

### Improve Speed
1. Use streaming responses (future enhancement)
2. Cache common questions (future enhancement)
3. Implement rate limiting
4. Use CDN for static assets

---

## 📞 Support Resources

- **OpenAI Docs:** https://platform.openai.com/docs
- **OpenAI Status:** https://status.openai.com
- **React Native:** https://reactnative.dev
- **Express.js:** https://expressjs.com

---

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Test script passes all tests
- [ ] `/api/chatbot/status` returns available
- [ ] Mobile app shows floating button
- [ ] Chat screen opens correctly
- [ ] Messages send and receive
- [ ] Typing indicator works
- [ ] Suggested questions work
- [ ] Conversation context maintained
- [ ] Error handling works

---

## 🎉 You're Ready!

Your AI chatbot is fully integrated and ready to use!

**Next Steps:**
1. Get your OpenAI API key
2. Add it to `.env` file
3. Run the test script
4. Start chatting!

**Happy Coding!** 🤖💬

---

**Quick Links:**
- [Full Setup Guide](OPENAI-CHATBOT-SETUP.md)
- [Implementation Summary](CHATBOT-IMPLEMENTATION-SUMMARY.md)
- [Flow Diagram](PUML%20Files/chatbot-flow.puml)

