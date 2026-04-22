/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderActionsPage } from '../pages/page-actions.js';
import { renderPersonaPage } from '../pages/page-persona.js';
import { renderKnowledgePage } from '../pages/page-knowledge.js';
import { renderChatPage } from '../pages/page-chat.js';

// App State
const state = {
  activeTab: 'train',
  activePage: 'persona',
  isPreviewOpen: false,
  agentName: 'Agent của tôi'
};

const pageRenderers = {
  persona: renderPersonaPage,
  knowledge: renderKnowledgePage,
  actions: renderActionsPage,
  chat: renderChatPage,
  tools: (container) => container.innerHTML = '<div class="fade-in"><h1>CÔNG CỤ</h1><p class="text-text-muted mt-4">Cấu hình công cụ đang được phát triển...</p></div>',
  forms: (container) => container.innerHTML = '<div class="fade-in"><h1>BIỂU MẪU</h1><p class="text-text-muted mt-4">Tích hợp biểu mẫu đang được phát triển...</p></div>',
  teach: (container) => container.innerHTML = '<div class="fade-in"><h1>HUẤN LUYỆN</h1><p class="text-text-muted mt-4">Công cụ học tập và tinh chỉnh đang được phát triển...</p></div>'
};

// Toast Utility
window.showToast = (message, type = 'success') => {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    ${type === 'success' ? '<i data-lucide="check-circle" class="w-4 h-4"></i>' : '<i data-lucide="alert-circle" class="w-4 h-4"></i>'}
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  if (window.lucide) window.lucide.createIcons();
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, type === 'success' ? 2000 : 3000);
};

function init() {
  renderSidebar();
  attachEventListeners();
  updateUI();
  mountPage();
}

function renderSidebar() {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

  sidebarNav.innerHTML = window.SIDEBAR_ITEMS.map(item => `
    <div class="sidebar-item ${state.activePage === item.id ? 'active' : ''}" data-page="${item.id}">
      <i data-lucide="${item.icon}"></i>
      <div class="sidebar-item-content">
        <span class="sidebar-item-title">${item.title}</span>
        <span class="sidebar-item-desc">${item.desc}</span>
      </div>
    </div>
  `).join('');

  // Re-run lucide to inject icons
  if (window.lucide) window.lucide.createIcons();

  // Attach clicks to sidebar items
  document.querySelectorAll('.sidebar-item').forEach(el => {
    el.addEventListener('click', () => {
      state.activePage = el.dataset.page;
      updateUI();
      mountPage();
    });
  });
}

function attachEventListeners() {
  // Tabs
  document.querySelectorAll('.tab-link').forEach(el => {
    el.addEventListener('click', () => {
      state.activeTab = el.dataset.tab;
      updateUI();
      mountPage();
    });
  });

  // Preview Toggle
  const previewToggle = document.getElementById('preview-toggle');
  previewToggle.addEventListener('change', (e) => {
    state.isPreviewOpen = e.target.checked;
    updateUI();
  });

  // Close Preview
  document.getElementById('close-preview').addEventListener('click', () => {
    state.isPreviewOpen = false;
    document.getElementById('preview-toggle').checked = false;
    updateUI();
  });

  // Backdrop click to close
  document.getElementById('preview-backdrop').addEventListener('click', () => {
    state.isPreviewOpen = false;
    document.getElementById('preview-toggle').checked = false;
    updateUI();
  });

  // Agent Name
  const nameInput = document.getElementById('agent-name');
  nameInput.addEventListener('input', (e) => {
    state.agentName = e.target.value;
  });
}

function updateUI() {
  // Update Tabs
  document.querySelectorAll('.tab-link').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === state.activeTab);
  });

  // Sidebar Visibility
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('hidden', state.activeTab !== 'train');

  // Preview Panel & Backdrop
  const previewPanel = document.getElementById('preview-panel');
  const backdrop = document.getElementById('preview-backdrop');
  
  previewPanel.classList.toggle('open', state.isPreviewOpen);
  backdrop.classList.toggle('visible', state.isPreviewOpen);

  if (state.isPreviewOpen) {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) renderChatPage(chatContainer);
  }

  // Re-render Sidebar items to update active class
  renderSidebar();
}

function mountPage() {
  const container = document.getElementById('main-content');
  if (!container) return;

  if (state.activeTab === 'build') {
    container.innerHTML = '<div class="fade-in"><h1>Build Mode</h1><p class="text-text-muted mt-4">Canvas and flow builder coming soon...</p></div>';
  } else if (state.activeTab === 'publish') {
    container.innerHTML = '<div class="fade-in"><h1>Publish Mode</h1><p class="text-text-muted mt-4">Deployment and widget embedding options coming soon...</p></div>';
  } else {
    // Train tab
    const renderer = pageRenderers[state.activePage];
    if (renderer) {
      renderer(container);
    } else {
      container.innerHTML = '<div class="fade-in"><h1>Page Not Found</h1></div>';
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
