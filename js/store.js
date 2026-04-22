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

const SEED_RULES = [
  // Kịch bản 1: Sales Assistant
  {
    id: 'seed_sales_1',
    scenario: 'sales',
    channels: ['all'],
    when: { condition_id: 'conv_starts', params: {} },
    do: { action_id: 'say_msg', params: { message: 'Xin chào! Tôi là Lina, trợ lý bán hàng. Tôi có thể giúp gì cho bạn hôm nay? 😊' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_sales_2',
    scenario: 'sales',
    channels: ['all'],
    when: { condition_id: 'conv_starts', params: {} },
    do: { action_id: 'show_btn', params: { buttons: 'Đặt hàng, Xem bảng giá, Tư vấn sản phẩm, Tra cứu đơn hàng' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_sales_3',
    scenario: 'sales',
    channels: ['all'],
    when: { condition_id: 'user_wants', params: { intent: 'đặt lịch tư vấn, gặp tư vấn viên, demo sản phẩm' } },
    do: { action_id: 'appointment', params: { url: 'https://calendly.com/sales-demo' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_sales_4',
    scenario: 'sales',
    channels: ['all'],
    when: { condition_id: 'user_asks', params: { subject: 'giá, bảng giá, gói dịch vụ, phí, chi phí' } },
    do: { action_id: 'list_items', params: { items: 'Gói Cơ bản | 199.000đ/tháng - Tối đa 100 form, 1.000 lượt gửi\nGói Chuyên nghiệp | 499.000đ/tháng - Không giới hạn form, 10.000 lượt gửi\nGói Doanh nghiệp | Liên hệ - Không giới hạn, SLA, hỗ trợ 24/7' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_sales_5',
    scenario: 'sales',
    channels: ['all'],
    when: { condition_id: 'user_sentiment', params: { sentiment: 'tức giận, thất vọng, không hài lòng, bực bội' } },
    do: { action_id: 'say_msg', params: { message: 'Tôi rất tiếc về trải nghiệm không tốt của bạn. Hãy để tôi kết nối bạn với nhân viên hỗ trợ cao cấp ngay lập tức. Bạn có thể cho tôi biết thêm về vấn đề đang gặp phải không?' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  // Kịch bản 2: Customer Support Bot
  {
    id: 'seed_support_1',
    scenario: 'support',
    channels: ['all'],
    when: { condition_id: 'user_wants', params: { intent: 'đổi hàng, trả hàng, hoàn tiền, refund, return' } },
    do: { action_id: 'say_msg', params: { message: 'Tôi sẽ hỗ trợ bạn quy trình đổi/trả hàng. Chính sách của chúng tôi: đổi trả trong vòng 30 ngày, hàng còn nguyên tem nhãn. Bạn vui lòng cung cấp mã đơn hàng để tôi kiểm tra nhé!' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_support_2',
    scenario: 'support',
    channels: ['all'],
    when: { condition_id: 'user_provides', params: { info_type: 'mã đơn hàng, order ID, số đơn' } },
    do: { action_id: 'ask_info', params: { what: 'tên và số điện thoại để xác thực đơn hàng' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_support_3',
    scenario: 'support',
    channels: ['all'],
    when: { condition_id: 'user_asks', params: { subject: 'chính sách, bảo hành, điều khoản, quy định' } },
    do: { action_id: 'kb_answer', params: {} },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_support_4',
    scenario: 'support',
    channels: ['all'],
    when: { condition_id: 'sentence_contains', params: { keyword: 'khẩn cấp, urgent, gấp, emergency' } },
    do: { action_id: 'send_email', params: { to: 'support-priority@company.com', subject: '🚨 Khách hàng cần hỗ trợ khẩn cấp', body: 'Có khách hàng đánh dấu yêu cầu là khẩn cấp. Vui lòng xử lý ngay.' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_support_5',
    scenario: 'support',
    channels: ['all'],
    when: { condition_id: 'user_wants', params: { intent: 'nói chuyện với người thật, nhân viên, tổng đài, human agent' } },
    do: { action_id: 'say_msg', params: { message: 'Tôi hiểu bạn muốn kết nối với nhân viên hỗ trợ trực tiếp. Đội ngũ của chúng tôi làm việc từ 8h-17h thứ Hai đến thứ Sáu. Bạn để lại số điện thoại, chúng tôi sẽ gọi lại trong vòng 30 phút!' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  // Kịch bản 3: Healthcare / Booking Bot
  {
    id: 'seed_health_1',
    scenario: 'healthcare',
    channels: ['all'],
    when: { condition_id: 'user_wants', params: { intent: 'đặt lịch khám, hẹn khám, booking, đặt lịch' } },
    do: { action_id: 'appointment', params: { url: 'https://booking.clinic.com/appointment' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_health_2',
    scenario: 'healthcare',
    channels: ['standalone'],
    when: { condition_id: 'conv_starts', params: {} },
    do: { action_id: 'ask_info', params: { what: 'tên đầy đủ và ngày sinh để tra cứu hồ sơ' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_health_3',
    scenario: 'healthcare',
    channels: ['all'],
    when: { condition_id: 'date_is', params: { date_desc: 'after 5pm, before 8am, weekends, cuối tuần, ngoài giờ hành chính' } },
    do: { action_id: 'say_msg', params: { message: 'Phòng khám hiện đang ngoài giờ làm việc (8h00 - 17h00, thứ Hai - thứ Sáu). Bạn có thể đặt lịch online hoặc gọi hotline 1900-xxxx vào giờ hành chính. Trường hợp khẩn cấp, vui lòng gọi 115.' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_health_4',
    scenario: 'healthcare',
    channels: ['all'],
    when: { condition_id: 'user_asks', params: { subject: 'dịch vụ, chuyên khoa, bác sĩ, khám gì, điều trị' } },
    do: { action_id: 'list_items', params: { items: 'Nội tổng quát | Khám sức khỏe định kỳ, tư vấn bệnh thông thường\nNhi khoa | Chăm sóc sức khỏe trẻ em từ 0-15 tuổi\nTim mạch | Siêu âm tim, điện tâm đồ, tư vấn bệnh lý tim\nDa liễu | Điều trị mụn, dị ứng, các bệnh về da' } },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'seed_health_5',
    scenario: 'healthcare',
    channels: ['all'],
    when: { condition_id: 'user_talks', params: { topic: 'bảo hiểm, BHYT, chi phí khám, giá khám, viện phí' } },
    do: { action_id: 'always_include', params: { content: '💡 Phòng khám chấp nhận BHYT và hầu hết các gói bảo hiểm tư nhân. Mang theo thẻ BHYT để được hưởng quyền lợi.' } },
    enabled: true,
    created_at: new Date().toISOString()
  }
];

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

    // Inject seed rules if empty
    if (!data.rules || data.rules.length === 0) {
      data.rules = [...SEED_RULES];
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
