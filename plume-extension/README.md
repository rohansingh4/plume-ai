# Plume - AI Tweet Engagement

**Craft replies that resonate.**

Plume is a client-side Chrome extension that helps you grow your Twitter/X presence by generating AI-powered reply suggestions based on your interests, expertise, and communication style.

## Features

- **AI-Powered Suggestions**: Generate 3 contextual reply options for any tweet
- **Multiple AI Providers**: Support for OpenAI, Anthropic (Claude), and Groq
- **Personalized Voice**: Configure your expertise, communication style, and tone
- **100% Client-Side**: Your API key stays in your browser - no data sent to third parties
- **Beautiful Dark UI**: Seamlessly blends with Twitter's dark mode

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Install dependencies and generate icons:
   ```bash
   cd plume-extension
   npm install
   ```
3. Open Chrome and navigate to `chrome://extensions`
4. Enable **Developer mode** (toggle in top right)
5. Click **Load unpacked**
6. Select the `plume-extension` folder
7. The Plume icon should appear in your extensions toolbar

### Setup

1. Click the Plume extension icon
2. Select your preferred AI provider (OpenAI, Anthropic, or Groq)
3. Enter your API key
4. Choose your topics of expertise
5. Set your communication style and tone preferences
6. Start engaging!

## Usage

1. Navigate to Twitter/X (twitter.com or x.com)
2. Click the reply button on any tweet
3. The Plume suggestion panel will appear automatically
4. Choose from 3 AI-generated reply options
5. Click **Use** to insert into the reply composer, or **Copy** to clipboard

## API Keys

You'll need an API key from one of the supported providers:

- **OpenAI**: Get your key at [platform.openai.com](https://platform.openai.com/api-keys)
- **Anthropic**: Get your key at [console.anthropic.com](https://console.anthropic.com/)
- **Groq**: Get your key at [console.groq.com](https://console.groq.com/keys)

Your API key is stored locally in Chrome's extension storage and is only used to make requests directly to the AI provider's API.

## Development

### Project Structure

```
plume-extension/
├── manifest.json          # Extension manifest (Manifest V3)
├── package.json           # Node.js dependencies
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── content/
│   ├── content.js         # Twitter integration
│   └── content.css        # Suggestion panel styles
├── background/
│   └── service-worker.js  # AI API calls
├── lib/
│   └── storage.js         # Shared storage utilities
├── icons/
│   ├── icon16.png         # 16x16 icon
│   ├── icon48.png         # 48x48 icon
│   └── icon128.png        # 128x128 icon
├── assets/
│   └── logo.svg           # Source logo
└── scripts/
    └── generate-icons.js  # Icon generation script
```

### Regenerating Icons

If you modify the logo, regenerate icons with:

```bash
npm run generate-icons
```

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions`
3. Click the refresh icon on the Plume extension card
4. Reload the Twitter/X tab to see changes

## Privacy

- **No Server**: Plume runs entirely in your browser
- **No Tracking**: We don't collect any usage data
- **Your Keys**: API keys are stored locally and never leave your browser
- **Direct API Calls**: Requests go directly to your chosen AI provider

## Troubleshooting

### Extension not showing on Twitter
- Make sure you're on twitter.com or x.com
- Check that the extension is enabled in `chrome://extensions`
- Try refreshing the Twitter page

### Suggestions not generating
- Verify your API key is correct in the extension settings
- Check the browser console for error messages
- Ensure you have sufficient credits with your AI provider

### Panel not appearing
- The panel only shows when "Auto-show suggestions" is enabled
- Make sure you're clicking the reply button (not quote tweet)

## License

MIT License - feel free to modify and distribute.

---

**Plume v1.0.0** | Craft thoughtful replies that resonate
