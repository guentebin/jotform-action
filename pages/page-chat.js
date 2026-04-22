/**
 * pages/page-chat.js
 */

import { store } from '../js/store.js';
import { processMessage } from '../js/gemini.js';

export function renderChatPage(container) {
  const apiKey = store.getApiKey();
  const history = store.getChatHistory();
  const config = store.getAgentConfig();
  const rules = store.getRules().filter(r => r.enabled);

  if (!apiKey) {
    container.innerHTML = `
      <div class="fade-in p-6 flex flex-col h-full bg-white">
        <div class="mb-8 text-center">
          <div class="logo-j mx-auto mb-4 w-12 h-12 text-xl font-bold">J</div>
          <h2 class="text-xl font-bold mb-2">Kết nối Gemini API</h2>
          <p class="text-sm text-text-muted px-4">Nhập API Key từ Google AI Studio để bắt đầu chat.</p>
        </div>

        <div class="card space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase text-text-muted mb-2">Google API Key</label>
            <input type="password" id="temp-api-key" class="input" placeholder="Dán key Google AI Studio vào đây...">
          </div>
          <button id="set-api-key-btn" class="btn btn-primary w-full py-3">Kết nối & Chat</button>
          
          <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-center block text-xs text-primary font-bold hover:underline">
            <i data-lucide="external-link" class="inline w-3 h-3"></i> Lấy key từ AI Studio
          </a>
        </div>
      </div>
    `;

    container.querySelector('#set-api-key-btn').addEventListener('click', () => {
      const key = container.querySelector('#temp-api-key').value.trim();
      if (key) {
        store.setApiKey(key);
        renderChatPage(container);
      }
    });

    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="fade-in flex flex-col h-full bg-slate-50">
      <!-- Chat Header -->
      <div class="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
            ${config.name.charAt(0)}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <div class="text-sm font-bold">${config.name}</div>
              <button id="change-key-btn" class="text-[10px] text-primary hover:underline font-bold">Đổi key</button>
            </div>
            <div class="text-[10px] text-green-500 font-bold uppercase flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Trực tuyến
            </div>
          </div>
        </div>
        <button id="clear-chat-btn" class="btn btn-icon text-gray-400 hover:text-red-500 transition-colors" title="Xóa lịch sử">
          <i data-lucide="refresh-cw" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Messages Area -->
      <div id="messages-window" class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        ${history.length === 0 ? `
          <div class="text-center py-10 opacity-30">
            <p class="text-xs italic font-medium">Bắt đầu cuộc trò chuyện để kiểm tra agent.</p>
          </div>
        ` : history.map(msg => renderMessage(msg)).join('')}
        <div id="typing-indicator" class="hidden">
          <div class="flex justify-start">
            <div class="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
              <span class="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
              <span class="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span class="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Footer -->
      <div class="p-4 bg-white border-t border-gray-100">
        <div class="flex items-center gap-2 mb-3 px-1">
          <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tự động hóa:</span>
          <span class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">⚡ ${rules.length} quy tắc đang bật</span>
        </div>
        <form id="chat-input-form" class="flex items-center gap-2 relative">
          <input type="text" id="chat-msg-input" class="input pr-12 rounded-full border-gray-200" placeholder="Nhập tin nhắn..." autocomplete="off">
          <button type="submit" class="absolute right-1 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            <i data-lucide="arrow-up" class="w-5 h-5"></i>
          </button>
        </form>
      </div>
    </div>
  `;

  attachChatEvents(container);
  scrollToBottom();
  
  // Auto-check for conversation_starts
  if (history.length === 0) {
    checkConversationStarts(container);
  }

  if (window.lucide) window.lucide.createIcons();
}

function renderMessage(msg) {
  const isUser = msg.role === 'user';
  return `
    <div class="flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300">
      <div class="${isUser ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-gray-100 text-text-main rounded-tl-none'} max-w-[85%] p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap">
        ${msg.content}
        ${!isUser && msg.metadata ? renderMetadata(msg.metadata) : ''}
      </div>
    </div>
  `;
}

function renderMetadata(metadata) {
  return metadata.map(item => {
    switch (item.type) {
      case 'buttons':
        return `
          <div class="flex flex-wrap gap-2 mt-3 p-1">
            ${item.data.map(btn => `<button class="text-xs bg-gray-100 hover:bg-primary hover:text-white border border-gray-200 px-3 py-1.5 rounded-full font-semibold transition-all action-button">${btn}</button>`).join('')}
          </div>
        `;
      case 'video':
        const videoId = item.data.includes('v=') ? item.data.split('v=')[1].split('&')[0] : 
                        item.data.includes('youtu.be/') ? item.data.split('youtu.be/')[1] : null;
        return videoId ? `<div class="mt-3 aspect-video rounded-lg overflow-hidden border border-gray-100"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>` : '';
      case 'list':
        const items = item.data.split('\n').filter(line => line.includes('|'));
        return `
          <div class="mt-3 space-y-2">
            ${items.map(line => {
              const [title, desc] = line.split('|').map(s => s.trim());
              return `
                <div class="p-2 border border-gray-100 rounded bg-slate-50">
                  <div class="font-bold text-[11px]">${title}</div>
                  <div class="text-[10px] text-text-muted">${desc}</div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      case 'appointment':
        return `<a href="${item.data}" target="_blank" class="mt-3 block text-center bg-green-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-600 transition-colors">📅 Book Appointment</a>`;
      case 'badge':
        return `<div class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-tight bg-green-50 p-1.5 rounded border border-green-100"><i data-lucide="${item.icon}" class="w-3 h-3"></i> ${item.label}</div>`;
      default:
        return '';
    }
  }).join('');
}

function attachChatEvents(container) {
  const form = container.querySelector('#chat-input-form');
  const input = container.querySelector('#chat-msg-input');
  const msgWindow = container.querySelector('#messages-window');
  const typing = container.querySelector('#typing-indicator');

  const onSend = async (text) => {
    if (!text) return;

    // User Message
    store.addChatMessage('user', text);
    input.value = '';
    renderMessages(msgWindow);

    // Typing
    typing.classList.remove('hidden');
    scrollToBottom();

    try {
      const history = store.getChatHistory();
      const result = await processMessage(text, history);
      
      const agentText = result.text || '_(Phản hồi từ Gemini sẽ hiển thị ở đây — cần cấu hình Gemini API)_';
      
      // Agent Message
      store.addChatMessage('agent', agentText);
      
      // Update history with metadata for the last message
      const updatedHistory = store.getChatHistory();
      updatedHistory[updatedHistory.length - 1].metadata = result.metadata;
      localStorage.setItem('jotform_agent_builder_v1', JSON.stringify(store.data)); // Direct override for metadata save

      typing.classList.add('hidden');
      renderMessages(msgWindow);
    } catch (e) {
      console.error(e);
      typing.classList.add('hidden');
      store.addChatMessage('agent', '_(Phản hồi từ Gemini sẽ hiển thị ở đây — cần cấu hình Gemini API)_');
      renderMessages(msgWindow);
    }
  };

  const changeKeyBtn = container.querySelector('#change-key-btn');
  if (changeKeyBtn) {
    changeKeyBtn.addEventListener('click', () => {
      store.setApiKey('');
      renderChatPage(container);
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      onSend(input.value.trim());
    });
  }

  // Action buttons
  msgWindow.addEventListener('click', (e) => {
    if (e.target.classList.contains('action-button')) {
      onSend(e.target.innerText);
    }
  });

  // Clear
  container.querySelector('#clear-chat-btn').addEventListener('click', () => {
    store.clearChatHistory();
    renderChatPage(container);
  });
}

function renderMessages(msgWindow) {
  const history = store.getChatHistory();
  const typing = msgWindow.querySelector('#typing-indicator');
  
  // Keep typing indicator at bottom
  msgWindow.innerHTML = history.map(msg => renderMessage(msg)).join('') + typing.outerHTML;
  scrollToBottom();
  if (window.lucide) window.lucide.createIcons();
}

async function checkConversationStarts(container) {
  const rules = store.getRules().filter(r => r.enabled && r.when.condition_id === 'conv_starts');
  if (rules.length > 0) {
    const typing = container.querySelector('#typing-indicator');
    typing.classList.remove('hidden');
    
    // Process as if triggered
    const result = await processMessage('', []); 
    store.addChatMessage('agent', result.text);
    
    const updatedHistory = store.getChatHistory();
    updatedHistory[updatedHistory.length - 1].metadata = result.metadata;
    localStorage.setItem('jotform_agent_builder_v1', JSON.stringify(store.data));

    typing.classList.add('hidden');
    renderMessages(container.querySelector('#messages-window'));
  }
}

function scrollToBottom() {
  const win = document.getElementById('messages-window');
  if (win) win.scrollTop = win.scrollHeight;
}
