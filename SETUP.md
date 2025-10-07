# Email Suggestions - Setup Guide

AI-powered email composer with suggestions from multiple LLM providers.

## 🚀 Quick Start (FREE)

### 1. Get a FREE Groq API Key
1. Go to https://console.groq.com/
2. Sign up (no credit card required)
3. Create an API key
4. Copy the key

### 2. Configure Environment
```bash
# Copy the example env file
cp .env.local .env.local

# Edit .env.local and add your Groq API key
# Replace 'your_groq_api_key_here' with your actual key
```

### 3. Run the App
```bash
npm run dev
```

Open http://localhost:3000

## 📝 How to Use

1. Select **Groq (Llama 3.3) - FREE** from the dropdown
2. Enter an email subject and/or body
3. Click **Get AI Suggestions**
4. Choose from 3 AI-generated suggestions
5. Click any suggestion to use it

## 🤖 Supported LLM Providers

### ✅ Groq (FREE - Recommended for Best Quality)
- **Model**: Llama 3.3 70B
- **Cost**: FREE
- **Rate Limit**: 30 requests/min
- **Setup**: https://console.groq.com/

### ✅ Mistral AI (FREE - Alternative)
- **Model**: Mistral Small
- **Cost**: FREE tier available
- **Rate Limit**: Rate limited
- **Setup**: https://console.mistral.ai/
- **Add to .env.local**: `MISTRAL_API_KEY=your_key`

### OpenAI (Paid)
- **Cost**: ~$0.002 per request
- **Setup**: https://platform.openai.com/api-keys
- **Install**: `npm install openai`
- **Add to .env.local**: `OPENAI_API_KEY=your_key`

## 🔧 Troubleshooting

### "Groq API key not configured" error
- Make sure you created `.env.local` (not just `.env`)
- Verify your API key is correct
- Restart the dev server after adding the key

### Suggestions not appearing
- Check browser console for errors
- Verify your API key has credits/quota
- Try a different LLM provider

## 📦 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **LLM SDKs**: Groq SDK, Mistral AI SDK

## 🎨 Features

- ✅ Real-time AI suggestions
- ✅ Multiple LLM providers (3 options)
- ✅ Clean, modern UI
- ✅ Dark mode support
- ✅ 2 FREE options (Groq + Mistral)
- ✅ Easy provider switching

---

**Need help?** Open an issue on GitHub or check the documentation.