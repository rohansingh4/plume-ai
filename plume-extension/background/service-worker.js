// background/service-worker.js
// Plume Extension - Service Worker for AI API Calls

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GENERATE_SUGGESTIONS') {
    handleGenerateSuggestions(message.tweet, message.config, sender.tab?.id);
  }
  return true;
});

// Main suggestion generation handler
async function handleGenerateSuggestions(tweet, config, tabId) {
  const { provider, apiKey, expertise, style, tone, length, includeEmojis, addHashtags } = config;

  console.log('[Plume] Generating suggestions with provider:', provider);
  console.log('[Plume] Tweet text:', tweet.text?.substring(0, 50) + '...');

  if (!apiKey || !tabId) {
    console.error('[Plume] Missing API key or tab ID');
    sendSuggestions(tabId, []);
    return;
  }

  const prompt = buildPrompt(tweet, { expertise, style, tone, length, includeEmojis, addHashtags });

  try {
    let suggestions;

    switch (provider) {
      case 'openai':
        suggestions = await callOpenAI(apiKey, prompt);
        break;
      case 'anthropic':
        suggestions = await callAnthropic(apiKey, prompt);
        break;
      case 'groq':
        suggestions = await callGroq(apiKey, prompt);
        break;
      default:
        console.error('[Plume] Unknown provider:', provider);
        suggestions = [];
    }

    console.log('[Plume] Generated suggestions:', suggestions?.length || 0);
    sendSuggestions(tabId, suggestions);
    await updateStats();

  } catch (error) {
    console.error('[Plume] AI API Error:', error.message);
    console.error('[Plume] Full error:', error);
    sendSuggestions(tabId, []);
  }
}

// Build the prompt for AI
function buildPrompt(tweet, config) {
  const { expertise, style, tone, length, includeEmojis, addHashtags } = config;

  const toneDescription = tone < 33 ? 'friendly, warm, and approachable' :
                          tone > 66 ? 'authoritative, confident, and expert' :
                          'balanced, conversational, and engaging';

  const lengthGuide = length === 'concise' ? '1-2 sentences, under 100 characters ideal' :
                      length === 'detailed' ? '2-4 sentences, can use up to 280 characters' :
                      '1-3 sentences, around 140-180 characters';

  const styleDescriptions = {
    professional: 'professional and polished, using industry-appropriate language',
    casual: 'casual and relaxed, like talking to a friend',
    witty: 'clever and witty, with subtle humor or wordplay',
    thoughtful: 'thoughtful and insightful, adding depth to the conversation',
    provocative: 'bold and thought-provoking, challenging assumptions constructively'
  };

  const expertiseStr = expertise.length > 0
    ? `The user has expertise in: ${expertise.join(', ')}. Leverage this knowledge when relevant.`
    : '';

  return `You are an expert Twitter engagement assistant helping craft authentic, engaging replies.

TWEET TO REPLY TO:
Author: ${tweet.author} (@${tweet.handle})
Content: "${tweet.text}"

REPLY REQUIREMENTS:
- Communication Style: ${styleDescriptions[style] || style}
- Tone: ${toneDescription}
- Length: ${lengthGuide}
${expertiseStr}
${includeEmojis ? '- Include 1-2 relevant emojis naturally' : '- Do NOT include any emojis'}
${addHashtags ? '- Add 1-2 relevant hashtags if they fit naturally' : '- Do NOT include hashtags'}

GUIDELINES FOR GREAT REPLIES:
1. Add genuine value - share insight, ask a thoughtful question, or offer a unique perspective
2. Be authentic - avoid generic responses like "Great point!" or "So true!"
3. Match the energy of the original tweet
4. Spark further conversation when possible
5. Stay relevant to the tweet's topic
6. Never be sycophantic or overly agreeable

Generate exactly 3 different reply options, each taking a slightly different approach.

IMPORTANT: Return ONLY a valid JSON array with 3 string replies. No markdown, no explanation, just the JSON array.
Example format: ["Reply option 1", "Reply option 2", "Reply option 3"]`;
}

// OpenAI API call
async function callOpenAI(apiKey, prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Twitter engagement expert. Always respond with ONLY a valid JSON array of 3 reply strings. No other text.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 600
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '[]';

  return parseAIResponse(content);
}

// Anthropic API call
async function callAnthropic(apiKey, prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: prompt + '\n\nRemember: Return ONLY a JSON array with 3 reply strings. Nothing else.'
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '[]';

  return parseAIResponse(content);
}

// Groq API call with fallback models
async function callGroq(apiKey, prompt) {
  // Try these models in order (Groq updates model names frequently)
  const models = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama3-70b-8192',
    'mixtral-8x7b-32768'
  ];

  let lastError = null;

  for (const model of models) {
    console.log('[Plume] Trying Groq model:', model);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a Twitter engagement expert. Always respond with ONLY a valid JSON array of 3 reply strings. No other text.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 600
        })
      });

      console.log('[Plume] Groq response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Plume] Model ${model} failed:`, errorText);
        lastError = new Error(`Groq API error: ${response.status} - ${errorText}`);
        continue; // Try next model
      }

      const data = await response.json();
      console.log('[Plume] Groq response data:', JSON.stringify(data).substring(0, 200));

      const content = data.choices?.[0]?.message?.content || '[]';
      return parseAIResponse(content);

    } catch (error) {
      console.warn(`[Plume] Model ${model} error:`, error.message);
      lastError = error;
      continue; // Try next model
    }
  }

  // All models failed
  throw lastError || new Error('All Groq models failed');
}

// Parse AI response to extract JSON array
function parseAIResponse(content) {
  // Clean the content
  let cleaned = content.trim();

  // Try direct parse first
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3).map(s => String(s).trim());
    }
  } catch (e) {
    // Continue to extraction methods
  }

  // Try to extract JSON array from response
  const arrayMatch = cleaned.match(/\[[\s\S]*?\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 3).map(s => String(s).trim());
      }
    } catch (e) {
      // Continue
    }
  }

  // Try to extract quoted strings
  const quotes = cleaned.match(/"([^"]+)"/g);
  if (quotes && quotes.length >= 3) {
    return quotes.slice(0, 3).map(q => q.replace(/^"|"$/g, '').trim());
  }

  console.error('[Plume] Failed to parse AI response:', content);
  return [];
}

// Send suggestions back to content script
function sendSuggestions(tabId, suggestions) {
  if (!tabId) return;

  chrome.tabs.sendMessage(tabId, {
    type: 'SUGGESTIONS_READY',
    suggestions
  }).catch(error => {
    console.error('[Plume] Failed to send suggestions:', error);
  });
}

// Update usage statistics
async function updateStats() {
  try {
    const stored = await chrome.storage.local.get('plumeState');
    const state = stored.plumeState || {};

    const today = new Date().toDateString();
    const stats = state.stats || { repliesGenerated: 0, tweetsAnalyzed: 0, lastReset: today };

    // Reset daily stats if new day
    if (stats.lastReset !== today) {
      stats.repliesGenerated = 0;
      stats.tweetsAnalyzed = 0;
      stats.lastReset = today;
    }

    stats.repliesGenerated++;

    await chrome.storage.local.set({
      plumeState: { ...state, stats }
    });
  } catch (error) {
    console.error('[Plume] Failed to update stats:', error);
  }
}

// Log when service worker starts
console.log('%c[Plume] Service worker loaded', 'color: #8B5CF6; font-weight: bold;');
