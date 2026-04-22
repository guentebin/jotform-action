/**
 * pages/page-knowledge.js
 */

import { store } from '../js/store.js';

export function renderKnowledgePage(container) {
  const config = store.getAgentConfig();
  
  container.innerHTML = `
    <div class="fade-in max-w-4xl px-4">
      <div class="section-title-area">
        <h1>CƠ SỞ KIẾN THỨC</h1>
        <p class="text-text-muted">Cung cấp văn bản chuyên môn hoặc nội dung web cho agent của bạn.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- TEXT KNOWLEDGE -->
        <div class="space-y-4">
          <div class="card h-full flex flex-col">
            <h3 class="font-bold mb-4 flex items-center gap-2">
              <i data-lucide="file-text" class="w-5 h-5 text-primary"></i> Kiến thức văn bản
            </h3>
            <textarea id="text-input" class="input flex-1 mb-3 min-h-[150px]" placeholder="Dán FAQ, thông tin sản phẩm, hoặc bất kỳ ngữ cảnh văn bản nào tại đây..."></textarea>
            <button id="add-text-btn" class="btn btn-secondary w-full text-sm">Thêm đoạn văn bản</button>
            
            <div id="text-list" class="mt-6 space-y-2 max-h-[300px] overflow-y-auto">
              ${config.knowledge.texts.map((text, i) => `
                <div class="bg-gray-50 border border-gray-200 p-2 rounded text-xs flex justify-between gap-2">
                  <span class="truncate">${text}</span>
                  <button class="delete-text text-red-500 hover:text-red-700" data-index="${i}">×</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- URL KNOWLEDGE -->
        <div class="space-y-4">
          <div class="card h-full flex flex-col">
            <h3 class="font-bold mb-4 flex items-center gap-2">
              <i data-lucide="link" class="w-5 h-5 text-primary"></i> Liên kết Website
            </h3>
            <div class="flex gap-2 mb-3">
              <input type="url" id="url-input" class="input text-sm" placeholder="https://example.com/info">
              <button id="add-url-btn" class="btn btn-secondary text-sm whitespace-nowrap">Thêm URL</button>
            </div>
            
            <div id="url-list" class="mt-6 space-y-2 max-h-[300px] overflow-y-auto">
              ${config.knowledge.urls.map((url, i) => `
                <div class="bg-blue-50 border border-blue-100 p-2 rounded text-xs flex justify-between gap-2 overflow-hidden">
                  <a href="${url}" target="_blank" class="truncate text-blue-600 hover:underline">${url}</a>
                  <button class="delete-url text-red-500 hover:text-red-700" data-index="${i}">×</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  attachEvents(container);
  if (window.lucide) window.lucide.createIcons();
}

function attachEvents(container) {
  const config = store.getAgentConfig();

  // Add Text
  container.querySelector('#add-text-btn').addEventListener('click', () => {
    const val = container.querySelector('#text-input').value.trim();
    if (val) {
      config.knowledge.texts.push(val);
      store.updateAgentConfig({ knowledge: config.knowledge });
      renderKnowledgePage(container);
    }
  });

  // Add URL
  container.querySelector('#add-url-btn').addEventListener('click', () => {
    const val = container.querySelector('#url-input').value.trim();
    if (val) {
      config.knowledge.urls.push(val);
      store.updateAgentConfig({ knowledge: config.knowledge });
      renderKnowledgePage(container);
    }
  });

  // Delete items
  container.querySelectorAll('.delete-text').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      config.knowledge.texts.splice(idx, 1);
      store.updateAgentConfig({ knowledge: config.knowledge });
      renderKnowledgePage(container);
    });
  });

  container.querySelectorAll('.delete-url').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      config.knowledge.urls.splice(idx, 1);
      store.updateAgentConfig({ knowledge: config.knowledge });
      renderKnowledgePage(container);
    });
  });
}
