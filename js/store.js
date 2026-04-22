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
    knowledge: { texts: [], urls: [] }
  },
  rules: [],
  chatHistory: []
};

// Helper: normalize old single when/do → new whens[]/dos[] arrays
function normalizeRule(rule) {
  if (!rule) return rule;
  if (rule.when && !rule.whens) {
    rule.whens = [rule.when];
    delete rule.when;
  }
  if (rule.do && !rule.dos) {
    rule.dos = [rule.do];
    delete rule.do;
  }
  if (!rule.whens) rule.whens = [{ condition_id: '', params: {} }];
  if (!rule.dos)   rule.dos   = [{ action_id: '',   params: {} }];
  if (!rule.logic) rule.logic = 'any';
  return rule;
}

const SEED_RULES = [
  // ── Kịch bản 1: Sales Assistant ──────────────────────────────────────
  {
    id: 'seed_sales_1', scenario: 'sales', channels: ['all'],
    whens: [{ condition_id: 'conv_starts', params: {} }],
    logic: 'any',
    dos: [{ action_id: 'say_msg', params: { message: 'Xin chào! Tôi là Lina, trợ lý bán hàng. Tôi có thể giúp gì cho bạn hôm nay? 😊' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_sales_2', scenario: 'sales', channels: ['all'],
    whens: [{ condition_id: 'conv_starts', params: {} }],
    logic: 'any',
    dos: [{ action_id: 'show_btn', params: { buttons: 'Đặt hàng, Xem bảng giá, Tư vấn sản phẩm, Tra cứu đơn hàng' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_sales_3', scenario: 'sales', channels: ['all'],
    whens: [{ condition_id: 'user_wants', params: { intent: 'đặt lịch tư vấn, gặp tư vấn viên, demo sản phẩm' } }],
    logic: 'any',
    dos: [{ action_id: 'appointment', params: { url: 'https://calendly.com/sales-demo' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_sales_4', scenario: 'sales', channels: ['all'],
    whens: [{ condition_id: 'user_asks', params: { subject: 'giá, bảng giá, gói dịch vụ, phí, chi phí' } }],
    logic: 'any',
    dos: [{ action_id: 'list_items', params: { items: 'Gói Cơ bản | 199.000đ/tháng - Tối đa 100 form, 1.000 lượt gửi\nGói Chuyên nghiệp | 499.000đ/tháng - Không giới hạn form, 10.000 lượt gửi\nGói Doanh nghiệp | Liên hệ - Không giới hạn, SLA, hỗ trợ 24/7' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_sales_5', scenario: 'sales', channels: ['all'],
    whens: [{ condition_id: 'user_sentiment', params: { sentiment: 'tức giận, thất vọng, không hài lòng, bực bội' } }],
    logic: 'any',
    dos: [{ action_id: 'say_msg', params: { message: 'Tôi rất tiếc về trải nghiệm không tốt của bạn. Hãy để tôi kết nối bạn với nhân viên hỗ trợ cao cấp ngay lập tức. Bạn có thể cho tôi biết thêm về vấn đề đang gặp phải không?' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  // Sales advanced: multiple WHEN (ANY) + multiple DO
  {
    id: 'seed_sales_adv_1', scenario: 'sales', channels: ['all'],
    whens: [
      { condition_id: 'user_sentiment', params: { sentiment: 'tức giận, thất vọng, bực bội' } },
      { condition_id: 'sentence_contains', params: { keyword: 'hủy, cancel, refund, hoàn tiền' } }
    ],
    logic: 'any',
    dos: [
      { action_id: 'say_msg', params: { message: 'Tôi rất tiếc về trải nghiệm này. Hãy để tôi kết nối bạn với chuyên viên hỗ trợ cao cấp ngay!' } },
      { action_id: 'send_email', params: { to: 'manager@company.com', subject: '🚨 Khách hàng cần hỗ trợ khẩn cấp', body: 'Khách hàng có dấu hiệu không hài lòng hoặc muốn hủy. Cần xử lý ngay.' } }
    ],
    enabled: true, created_at: new Date().toISOString()
  },
  // Sales advanced: multiple WHEN (ALL) + multiple DO — upsell đúng trang + đúng chủ đề
  {
    id: 'seed_sales_adv_2', scenario: 'sales', channels: ['chatbot'],
    whens: [
      { condition_id: 'url_contains', params: { url_pattern: '/pricing' } },
      { condition_id: 'user_talks', params: { topic: 'nâng cấp, upgrade, gói cao hơn, enterprise' } }
    ],
    logic: 'all',
    dos: [
      { action_id: 'list_items', params: { items: 'Gói Pro | Tính năng không giới hạn + ưu tiên hỗ trợ\nGói Enterprise | Triển khai riêng + SLA + Account Manager' } },
      { action_id: 'show_btn', params: { buttons: 'Nâng cấp ngay, Tư vấn miễn phí, So sánh gói' } }
    ],
    enabled: true, created_at: new Date().toISOString()
  },

  // ── Kịch bản 2: Customer Support Bot ─────────────────────────────────
  {
    id: 'seed_support_1', scenario: 'support', channels: ['all'],
    whens: [{ condition_id: 'user_wants', params: { intent: 'đổi hàng, trả hàng, hoàn tiền, refund, return' } }],
    logic: 'any',
    dos: [{ action_id: 'say_msg', params: { message: 'Tôi sẽ hỗ trợ bạn quy trình đổi/trả hàng. Chính sách: đổi trả trong vòng 30 ngày, hàng còn nguyên tem nhãn. Bạn vui lòng cung cấp mã đơn hàng để tôi kiểm tra nhé!' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_support_2', scenario: 'support', channels: ['all'],
    whens: [{ condition_id: 'user_provides', params: { info_type: 'mã đơn hàng, order ID, số đơn' } }],
    logic: 'any',
    dos: [{ action_id: 'ask_info', params: { what: 'tên và số điện thoại để xác thực đơn hàng' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_support_3', scenario: 'support', channels: ['all'],
    whens: [{ condition_id: 'user_asks', params: { subject: 'chính sách, bảo hành, điều khoản, quy định' } }],
    logic: 'any',
    dos: [{ action_id: 'kb_answer', params: {} }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_support_4', scenario: 'support', channels: ['all'],
    whens: [{ condition_id: 'sentence_contains', params: { keyword: 'khẩn cấp, urgent, gấp, emergency' } }],
    logic: 'any',
    dos: [{ action_id: 'send_email', params: { to: 'support-priority@company.com', subject: '🚨 Khách hàng cần hỗ trợ khẩn cấp', body: 'Có khách hàng đánh dấu yêu cầu là khẩn cấp. Vui lòng xử lý ngay.' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_support_5', scenario: 'support', channels: ['all'],
    whens: [{ condition_id: 'user_wants', params: { intent: 'nói chuyện với người thật, nhân viên, tổng đài, human agent' } }],
    logic: 'any',
    dos: [{ action_id: 'say_msg', params: { message: 'Tôi hiểu bạn muốn kết nối với nhân viên hỗ trợ trực tiếp. Đội ngũ làm việc 8h-17h thứ Hai đến thứ Sáu. Bạn để lại số điện thoại, chúng tôi sẽ gọi lại trong 30 phút!' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  // Support advanced: lỗi kỹ thuật — ANY + 3 DO
  {
    id: 'seed_support_adv_1', scenario: 'support', channels: ['all'],
    whens: [
      { condition_id: 'sentence_contains', params: { keyword: 'lỗi, bug, error, không hoạt động, crash' } },
      { condition_id: 'user_sentiment', params: { sentiment: 'bối rối, confused, không hiểu, frustrated' } }
    ],
    logic: 'any',
    dos: [
      { action_id: 'say_msg', params: { message: 'Tôi hiểu bạn đang gặp sự cố kỹ thuật. Hãy để tôi hỗ trợ ngay!' } },
      { action_id: 'ask_info', params: { what: 'mô tả chi tiết lỗi và thiết bị / trình duyệt đang dùng' } },
      { action_id: 'send_email', params: { to: 'tech-support@company.com', subject: 'Báo lỗi kỹ thuật từ chat', body: 'Khách hàng đang gặp vấn đề kỹ thuật qua chat. Vui lòng theo dõi.' } }
    ],
    enabled: true, created_at: new Date().toISOString()
  },

  // ── Kịch bản 3: Healthcare / Booking Bot ─────────────────────────────
  {
    id: 'seed_health_1', scenario: 'healthcare', channels: ['all'],
    whens: [{ condition_id: 'user_wants', params: { intent: 'đặt lịch khám, hẹn khám, booking, đặt lịch' } }],
    logic: 'any',
    dos: [{ action_id: 'appointment', params: { url: 'https://booking.clinic.com/appointment' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_health_2', scenario: 'healthcare', channels: ['standalone'],
    whens: [{ condition_id: 'conv_starts', params: {} }],
    logic: 'any',
    dos: [{ action_id: 'ask_info', params: { what: 'tên đầy đủ và ngày sinh để tra cứu hồ sơ' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_health_3', scenario: 'healthcare', channels: ['all'],
    whens: [{ condition_id: 'date_is', params: { date_spec: 'after 5pm, before 8am, weekends, cuối tuần, ngoài giờ hành chính' } }],
    logic: 'any',
    dos: [{ action_id: 'say_msg', params: { message: 'Phòng khám hiện ngoài giờ làm việc (8h00 - 17h00, Thứ Hai - Thứ Sáu). Đặt lịch online hoặc gọi hotline 1900-xxxx. Khẩn cấp: gọi 115.' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_health_4', scenario: 'healthcare', channels: ['all'],
    whens: [{ condition_id: 'user_asks', params: { subject: 'dịch vụ, chuyên khoa, bác sĩ, khám gì, điều trị' } }],
    logic: 'any',
    dos: [{ action_id: 'list_items', params: { items: 'Nội tổng quát | Khám sức khỏe định kỳ, tư vấn bệnh thông thường\nNhi khoa | Chăm sóc sức khỏe trẻ em từ 0-15 tuổi\nTim mạch | Siêu âm tim, điện tâm đồ, tư vấn bệnh lý tim\nDa liễu | Điều trị mụn, dị ứng, các bệnh về da' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  {
    id: 'seed_health_5', scenario: 'healthcare', channels: ['all'],
    whens: [{ condition_id: 'user_talks', params: { topic: 'bảo hiểm, BHYT, chi phí khám, giá khám, viện phí' } }],
    logic: 'any',
    dos: [{ action_id: 'always_include', params: { content: '💡 Phòng khám chấp nhận BHYT và hầu hết bảo hiểm tư nhân. Mang thẻ BHYT để hưởng quyền lợi.' } }],
    enabled: true, created_at: new Date().toISOString()
  },
  // Healthcare advanced: booking + ALL + 2 DO
  {
    id: 'seed_health_adv_1', scenario: 'healthcare', channels: ['all'],
    whens: [
      { condition_id: 'user_wants', params: { intent: 'đặt lịch, booking, hẹn khám' } },
      { condition_id: 'user_provides', params: { info_type: 'tên, họ tên, tên bệnh nhân' } }
    ],
    logic: 'all',
    dos: [
      { action_id: 'appointment', params: { url: 'https://booking.clinic.com/appointment' } },
      { action_id: 'send_email', params: { to: 'reception@clinic.com', subject: 'Bệnh nhân mới đặt lịch qua chat', body: 'Có bệnh nhân mới yêu cầu đặt lịch khám qua chatbot. Vui lòng xác nhận.' } }
    ],
    enabled: true, created_at: new Date().toISOString()
  },
  // Healthcare advanced: ngoài giờ OR khẩn cấp — ANY + 2 DO
  {
    id: 'seed_health_adv_2', scenario: 'healthcare', channels: ['all'],
    whens: [
      { condition_id: 'date_is', params: { date_spec: 'after 5pm, before 8am, cuối tuần, weekend' } },
      { condition_id: 'sentence_contains', params: { keyword: 'khẩn cấp, cấp cứu, emergency, nguy hiểm' } }
    ],
    logic: 'any',
    dos: [
      { action_id: 'say_msg', params: { message: 'Phòng khám ngoài giờ làm việc. Trường hợp khẩn cấp: gọi 115 hoặc đến cơ sở y tế gần nhất ngay!' } },
      { action_id: 'show_btn', params: { buttons: 'Gọi 115, Đặt lịch hẹn, Xem giờ làm việc' } }
    ],
    enabled: true, created_at: new Date().toISOString()
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
      data.rules = SEED_RULES.map(r => ({ ...r }));
    }

    // Normalize all rules to new schema
    data.rules = data.rules.map(normalizeRule);

    data.apiKey = api_key || '';
    return data;
  }

  save() {
    const { apiKey, ...rest } = this.data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    if (apiKey) localStorage.setItem('jotform_gemini_api_key', apiKey);
    window.dispatchEvent(new CustomEvent('store-updated', { detail: this.data }));
  }

  getApiKey() { return this.data.apiKey; }
  setApiKey(key) { this.data.apiKey = key; this.save(); }

  getAgentConfig() { return this.data.config; }
  updateAgentConfig(newConfig) {
    this.data.config = { ...this.data.config, ...newConfig };
    this.save();
  }

  getRules() { return this.data.rules; }
  getRuleById(id) { return this.data.rules.find(r => r.id === id); }

  addRule(rule) {
    const newRule = normalizeRule({
      id: 'rule_' + Date.now(),
      scenario: rule.scenario || null,
      channels: rule.channels || ['all'],
      whens: rule.whens || [{ condition_id: 'conv_starts', params: {} }],
      logic: rule.logic || 'any',
      dos: rule.dos || [{ action_id: 'say_msg', params: { message: 'Xin chào!' } }],
      enabled: true,
      created_at: new Date().toISOString()
    });
    this.data.rules.push(newRule);
    this.save();
    return newRule;
  }

  updateRule(id, updates) {
    const index = this.data.rules.findIndex(r => r.id === id);
    if (index !== -1) {
      this.data.rules[index] = normalizeRule({ ...this.data.rules[index], ...updates });
      this.save();
    }
  }

  deleteRule(id) {
    this.data.rules = this.data.rules.filter(r => r.id !== id);
    this.save();
  }

  toggleRuleEnabled(id) {
    const rule = this.getRuleById(id);
    if (rule) { rule.enabled = !rule.enabled; this.save(); }
  }

  getChatHistory() { return this.data.chatHistory; }
  addChatMessage(role, content) {
    this.data.chatHistory.push({ role, content, timestamp: new Date().toISOString() });
    if (this.data.chatHistory.length > 100) this.data.chatHistory.shift();
    this.save();
  }
  clearChatHistory() { this.data.chatHistory = []; this.save(); }
}

export const store = new Store();
