/**
 * js/gemini.js - Gemini API Client & Actions Executor
 */

import { store } from './store.js';

const GEMINI_MODEL = 'gemini-1.5-flash';
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Builds the system instructions based on Persona and Knowledge Base
 */
function buildSystemPrompt() {
  const config = store.getAgentConfig();
  const rules = store.getRules().filter(r => r.enabled);
  
  let prompt = `You are ${config.name}. 
Role: ${config.persona.role}
Tone: ${config.persona.tone}
Language: ${config.persona.language}
Instructions: ${config.persona.instructions}

`;

  if (config.knowledge.texts.length > 0) {
    prompt += `KNOWLEDGE BASE:\n${config.knowledge.texts.join('\n\n')}\n\n`;
  }

  // Inject Talk About / Don't Talk About rules as instructions
  const talkAbout = rules.filter(r => r.do.action_id === 'talk_about').map(r => r.do.params.topic);
  const dontTalk = rules.filter(r => r.do.action_id === 'dont_talk').map(r => r.do.params.topic);

  if (talkAbout.length > 0) {
    prompt += `IMPORTANT: Always try to mention or talk about: ${talkAbout.join(', ')}.\n`;
  }
  if (dontTalk.length > 0) {
    prompt += `CRITICAL: Never mention or talk about: ${dontTalk.join(', ')}.\n`;
  }

  return prompt;
}

/**
 * Executes the Gemini API call
 */
export async function callGemini(message, history = []) {
  const apiKey = store.getApiKey();
  if (!apiKey) throw new Error('API Key missing');

  const systemPrompt = buildSystemPrompt();
  const contents = [
    { role: 'user', parts: [{ text: `SYSTEM INSTRUCTIONS: ${systemPrompt}` }] },
    ...history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const response = await fetch(`${API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

/**
 * Evaluates which rules should trigger for a given message
 */
async function evaluateTriggers(message, history) {
  const rules = store.getRules().filter(r => r.enabled);
  const triggeredRuleIds = [];

  // 1. Check conversation_starts (Special Case)
  if (history.length === 0) {
    const startRule = rules.find(r => r.when.condition_id === 'conv_starts');
    if (startRule) triggeredRuleIds.push(startRule.id);
  }

  // 2. Batch analyze other conditions using Gemini
  const activeConditions = rules.filter(r => r.when.condition_id !== 'conv_starts');
  if (activeConditions.length > 0) {
    const analysisPrompt = `Analyze the following user message: "${message}"
Identify which of these conditions are met. Return ONLY a comma-separated list of IDs, or "none".
Conditions:
${activeConditions.map(r => {
  const cond = window.WHEN_CONDITIONS.find(c => c.id === r.when.condition_id);
  return `- ID: ${r.id}, Condition: ${cond.label}, Params: ${JSON.stringify(r.when.params)}`;
}).join('\n')}
`;

    try {
      const result = await callGemini(analysisPrompt, []);
      if (result.toLowerCase() !== 'none') {
        const ids = result.split(',').map(s => s.trim());
        triggeredRuleIds.push(...ids.filter(id => activeConditions.some(r => r.id === id)));
      }
    } catch (e) {
      console.warn('Trigger analysis failed, falling back to basic matching', e);
      // Basic fallback matching (keyword contains)
      activeConditions.forEach(r => {
        if (r.when.condition_id === 'sentence_contains' && message.toLowerCase().includes(r.when.params.keyword?.toLowerCase())) {
          triggeredRuleIds.push(r.id);
        }
      });
    }
  }

  return [...new Set(triggeredRuleIds)]; // Unique IDs
}

/**
 * Main execution flow
 */
export async function processMessage(message, history) {
  const triggeredIds = await evaluateTriggers(message, history);
  const rules = store.getRules().filter(r => triggeredIds.includes(r.id));
  
  let results = {
    text: '',
    metadata: [],
    intercepted: false
  };

  // Execute DO actions
  for (const rule of rules) {
    const actionId = rule.do.action_id;
    const params = rule.do.params;

    switch (actionId) {
      case 'say_msg':
        results.text = params.message;
        results.intercepted = true;
        break;
      case 'ask_info':
        results.text = params.what;
        results.intercepted = true;
        break;
      case 'show_btn':
        results.metadata.push({ type: 'buttons', data: params.buttons.split(',').map(s => s.trim()) });
        break;
      case 'show_video':
        results.metadata.push({ type: 'video', data: params.url });
        break;
      case 'list_items':
        results.metadata.push({ type: 'list', data: params.items });
        break;
      case 'appointment':
        results.metadata.push({ type: 'appointment', data: params.url });
        break;
      case 'send_email':
        console.log('MOCK EMAIL SENT:', params);
        results.metadata.push({ type: 'badge', label: 'Đã gửi Email', icon: 'mail' });
        break;
      case 'api_request':
        try {
          const body = params.method !== 'GET' ? params.body : undefined;
          await fetch(params.endpoint, { method: params.method, body });
          results.metadata.push({ type: 'badge', label: 'Gọi API thành công', icon: 'code' });
        } catch (e) {
          results.metadata.push({ type: 'badge', label: 'Gọi API thất bại', icon: 'alert-circle' });
        }
        break;
      case 'push_notify':
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(params.title, { body: params.message });
            results.metadata.push({ type: 'badge', label: 'Đã gửi thông báo', icon: 'bell' });
          } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              new Notification(params.title, { body: params.message });
              results.metadata.push({ type: 'badge', label: 'Đã gửi thông báo', icon: 'bell' });
            }
          }
        }
        break;
    }
  }

  // If not intercepted by say_msg, call Gemini for general response
  if (!results.intercepted) {
    results.text = await callGemini(message, history);
  }

  // Add Always Include
  const alwaysIncludeRules = store.getRules().filter(r => r.enabled && r.do.action_id === 'always_include');
  alwaysIncludeRules.forEach(r => {
    results.text += `\n\n${r.do.params.content}`;
  });

  return results;
}
