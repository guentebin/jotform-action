/**
 * pages/page-persona.js
 */

import { store } from '../js/store.js';

export function renderPersonaPage(container) {
  const config = store.getAgentConfig();
  
  container.innerHTML = `
    <div class="fade-in max-w-2xl px-4">
      <div class="section-title-area">
        <h1>NHÂN CÁCH AGENT</h1>
        <p class="text-text-muted">Xác định danh tính và hành vi của agent.</p>
      </div>

      <div class="card space-y-6">
        <div>
          <label class="block text-sm font-bold uppercase text-text-muted mb-2">Tên Agent</label>
          <input type="text" id="persona-name" class="input" value="${config.name}" placeholder="ví dụ: Hỗ trợ khách hàng">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold uppercase text-text-muted mb-2">Vai trò</label>
            <input type="text" id="persona-role" class="input" value="${config.persona.role}" placeholder="ví dụ: Chuyên viên tư vấn">
          </div>
          <div>
            <label class="block text-sm font-bold uppercase text-text-muted mb-2">Giọng điệu</label>
            <select id="persona-tone" class="input">
              <option value="Professional" ${config.persona.tone === 'Professional' ? 'selected' : ''}>Chuyên nghiệp</option>
              <option value="Friendly" ${config.persona.tone === 'Friendly' ? 'selected' : ''}>Thân thiện</option>
              <option value="Casual" ${config.persona.tone === 'Casual' ? 'selected' : ''}>Thoải mái</option>
              <option value="Formal" ${config.persona.tone === 'Formal' ? 'selected' : ''}>Trang trọng</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold uppercase text-text-muted mb-2">Ngôn ngữ</label>
          <select id="persona-lang" class="input">
            <option value="English" ${config.persona.language === 'English' ? 'selected' : ''}>Tiếng Anh</option>
            <option value="Vietnamese" ${config.persona.language === 'Vietnamese' ? 'selected' : ''}>Tiếng Việt</option>
            <option value="Auto" ${config.persona.language === 'Auto' ? 'selected' : ''}>Tự động</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-bold uppercase text-text-muted mb-2">Hướng dẫn hệ thống</label>
          <textarea id="persona-instructions" class="input h-48" placeholder="Nhập hướng dẫn chi tiết về cách AI nên phản hồi...">${config.persona.instructions}</textarea>
        </div>

        <div class="flex justify-end pt-4">
          <button id="save-persona-btn" class="btn btn-primary">Lưu cấu hình</button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#save-persona-btn').addEventListener('click', () => {
    const updates = {
      name: container.querySelector('#persona-name').value,
      persona: {
        role: container.querySelector('#persona-role').value,
        tone: container.querySelector('#persona-tone').value,
        language: container.querySelector('#persona-lang').value,
        instructions: container.querySelector('#persona-instructions').value
      }
    };
    store.updateAgentConfig(updates);
    window.showToast('✓ Đã lưu nhân cách agent');
  });
}
