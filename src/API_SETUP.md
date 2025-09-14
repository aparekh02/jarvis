# 🎯 Jarvis API Setup Guide

This guide will help you configure the APIs needed for Jarvis's voice assistant and AI features.

## 🔑 Required API Keys

### 1. OpenAI API (Recommended - Powers AI, TTS, and STT)

**What it provides:**
- AI task optimization with GPT-3.5/4
- High-quality text-to-speech (TTS)  
- Advanced speech-to-text (Whisper)
- Smart task suggestions and flowchart generation

**How to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com/signup)
2. Create an account or sign in
3. Navigate to [API Keys](https://platform.openai.com/account/api-keys)
4. Click "Create new secret key"
5. Copy the key and add it to your `.env` file:
   ```
   VITE_OPENAI_API_KEY=sk-your-key-here
   ```

**Cost:** 
- New accounts get $5 in free credits
- Pay-as-you-use after that
- Typical usage: $0.01-0.05 per session

---

### 2. Google Classroom API (Optional)

**What it provides:**
- Sync assignments from Google Classroom
- Automatic task creation from coursework

**How to get it:**
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable the "Google Classroom API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the key and add it to your `.env`:
   ```
   VITE_GOOGLE_CLASSROOM_API_KEY=your-google-key-here
   ```

---

## 🎙️ Voice API Alternatives

If you prefer not to use OpenAI, here are free alternatives:

### Option A: Web Speech API (Built-in Browser)
- **Cost:** Completely free
- **Setup:** No API key needed
- **Limitations:** Works offline, but quality varies by browser
- **Note:** This is used as fallback when no API key is provided

### Option B: Google Cloud Speech APIs
- **Free Tier:** 60 minutes of audio per month
- **Setup:** [Google Cloud Speech](https://console.cloud.google.com/)
- **Add to .env:** `VITE_GOOGLE_SPEECH_API_KEY=your-key`

### Option C: Azure Cognitive Services
- **Free Tier:** 5 hours of audio per month  
- **Setup:** [Azure Speech Services](https://azure.microsoft.com/services/cognitive-services/speech-services/)
- **Add to .env:** 
  ```
  VITE_AZURE_SPEECH_KEY=your-key
  VITE_AZURE_SPEECH_REGION=your-region
  ```

### Option D: AssemblyAI (Speech-to-Text only)
- **Free Tier:** 5 hours per month
- **Setup:** [AssemblyAI](https://www.assemblyai.com/)
- **Add to .env:** `VITE_ASSEMBLYAI_API_KEY=your-key`

---

## 🚀 Quick Start

1. **Minimum Setup (Free):**
   - No API keys needed
   - Uses browser's Web Speech API
   - Limited functionality but works offline

2. **Recommended Setup:**
   - Get OpenAI API key ($5 free credits)
   - Full AI features, high-quality voice
   - Best user experience

3. **Full Setup:**
   - OpenAI + Google Classroom APIs
   - Complete feature set
   - Production-ready

---

## 🔧 Environment Variables

Your `.env` file should look like:

```env
# Required for full AI features
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Optional for classroom sync
VITE_GOOGLE_CLASSROOM_API_KEY=your-google-key-here

# Alternative voice APIs (pick one)
# VITE_GOOGLE_SPEECH_API_KEY=your-google-speech-key
# VITE_AZURE_SPEECH_KEY=your-azure-key
# VITE_AZURE_SPEECH_REGION=eastus
# VITE_ASSEMBLYAI_API_KEY=your-assemblyai-key
```

---

## 🛠️ Troubleshooting

### "Cannot read properties of undefined" errors
- This occurs when `import.meta.env` is undefined
- Make sure you have a `.env` file in your project root
- Copy `.env.example` to `.env` and add your API keys
- Restart your development server completely (Ctrl+C then restart)

### "API key not configured" errors
- Check that your `.env` file is in the project root (same level as `package.json`)
- Ensure variable names start with `VITE_` (required for Vite)
- Make sure there are no quotes around your API keys in the .env file
- Restart your development server after adding keys
- Check browser console: API keys should appear in `import.meta.env`

### Voice features not working
- Grant microphone permissions in browser (click the microphone icon in address bar)
- Try different browsers (Chrome/Edge work best for Web Speech API)
- Check browser console for specific errors
- Test with and without OpenAI API key (fallback modes available)

### AI features not working
- Verify OpenAI API key is valid and starts with `sk-`
- Check you have credits remaining in your OpenAI account
- Make sure you're not hitting rate limits (try waiting a few minutes)
- Check browser network tab for 401/403 errors from OpenAI API

### Environment Variable Debugging
Add this to your component to debug:
```javascript
console.log('Environment check:', {
  hasEnv: !!import.meta.env,
  openaiKey: import.meta.env?.VITE_OPENAI_API_KEY ? 'Found' : 'Missing',
  classroomKey: import.meta.env?.VITE_GOOGLE_CLASSROOM_API_KEY ? 'Found' : 'Missing'
})
```

---

## 🔒 Security Notes

- Never commit API keys to version control
- Add `.env` to your `.gitignore` file
- Use environment variables in production
- Rotate keys periodically for security

---

## 💡 Tips

- Start with OpenAI for best experience
- Web Speech API works offline as backup
- Monitor API usage in provider dashboards
- Consider caching responses to reduce costs