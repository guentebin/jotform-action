/**
 * Jotform Agent Builder - Data Persistence Layer
 */

const STORAGE_KEY = 'jotform_agent_builder_v1';

const DEFAULT_DATA = {
  config: {
    name: 'Agent của tôi',
    persona: {
      role: 'Trợ lý hữu ích',
      tone: 'Professional',
      language: 'Vietnamese',
      instructions: 'Bạn là một trợ lý chuyên nghiệp. Luôn lịch sự và sẵn sàng giúp đỡ.'
    },
    knowledge: {
      texts: [],
      urls: []
    }
  },
  rules: [],
  chatHistory: []
};

class Store {
  constructor() {
    this.data = this.load();
  }

  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const api_key = localStorage.getItem('jotform_gemini_api_key');
    let data;
    try {
      data = saved ? JSON.parse(saved) : { ...DEFAULT_DATA };
    } catch (e) {
      data = { ...DEFAULT_DATA };
    }
    data.apiKey = api_key || '';
    return data;
  }

  save() {
    // We don't save the API key in the main JSON to keep it slightly more isolated
    const { apiKey, ...rest } = this.data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    if (apiKey) {
      localStorage.setItem('jotform_gemini_api_key', apiKey);
    }
    window.dispatchEvent(new CustomEvent('store-updated', { detail: this.data }));
  }

  // API Key
  getApiKey() {
    return this.data.apiKey;
  }

  setApiKey(key) {
    this.data.apiKey = key;
    this.save();
  }

  // Agent Config
  getAgentConfig() {
    return this.data.config;
  }

  updateAgentConfig(newConfig) {
    this.data.config = { ...this.data.config, ...newConfig };
    this.save();
  }

  // Action Rules
  getRules() {
    return this.data.rules;
  }

  getRuleById(id) {
    return this.data.rules.find(r => r.id === id);
  }

  addRule(rule) {
    const newRule = {
      id: 'rule_' + Date.now(),
      channels: rule.channels || ['all'],
      when: rule.when || { condition_id: 'conv_starts', params: {} },
      do: rule.do || { action_id: 'say_msg', params: { message: 'Hello!' } },
      enabled: true,
      created_at: new Date().toISOString()
    };
    this.data.rules.push(newRule);
    this.save();
    return newRule;
  }

  updateRule(id, updates) {
    const index = this.data.rules.findIndex(r => r.id === id);
    if (index !== -1) {
      this.data.rules[index] = { ...this.data.rules[index], ...updates };
      this.save();
    }
  }

  deleteRule(id) {
    this.data.rules = this.data.rules.filter(r => r.id !== id);
    this.save();
  }

  toggleRuleEnabled(id) {
    const rule = this.getRuleById(id);
    if (rule) {
      rule.enabled = !rule.enabled;
      this.save();
    }
  }

  // Chat History
  getChatHistory() {
    return this.data.chatHistory;
  }

  addChatMessage(role, content) {
    const msg = {
      role, // 'user' or 'agent'
      content,
      timestamp: new Date().toISOString()
    };
    this.data.chatHistory.push(msg);
    // Keep internal history manageable
    if (this.data.chatHistory.length > 100) {
      this.data.chatHistory.shift();
    }
    this.save();
  }

  clearChatHistory() {
    this.data.chatHistory = [];
    this.save();
  }
}

export const store = new Store();
