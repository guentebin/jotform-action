/**
 * ACTIONS Page: WHEN/DO Rule Builder
 */

import { store } from '../js/store.js';

let editingRuleId = null;
let currentFormState = {
  channels: ['all'],
  when: { condition_id: '', params: {} },
  do: { action_id: '', params: {} }
};

// Dropdown UI states
let activeDropdown = null; // 'channels', 'when', 'do'
let searchQuery = '';

export function renderActionsPage(container) {
  const rules = store.getRules();
  
  container.innerHTML = `
    <div class="fade-in max-w-5xl mx-auto">
      <!-- HEADER -->
      <div class="section-title-area">
        <h1>ACTIONS</h1>
        <p class="text-text-muted">Direct your agent with automated rules and triggers.</p>
      </div>

      <!-- RULE BUILDER -->
      <div id="rule-builder-container" class="mb-10">
        ${renderRuleBuilder()}
      </div>

      <div class="divider"></div>

      <!-- SAVED RULES HEADER -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-bold">SAVED RULES</h2>
          <span class="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">${rules.length}</span>
        </div>
      </div>

      <!-- RULES LIST -->
      <div id="rules-list" class="space-y-4 pb-20">
        ${(rules && Array.isArray(rules) && rules.length > 0) ? rules.map(rule => renderRuleCard(rule)).join('') : renderEmptyState()}
      </div>
    </div>
  `;

  attachEvents(container);
}

function renderRuleBuilder() {
  const isEditing = !!editingRuleId;
  const when = window.WHEN_CONDITIONS.find(c => c.id === currentFormState.when.condition_id);
  const doa = window.DO_ACTIONS.find(a => a.id === currentFormState.do.action_id);

  return `
    <div class="card rule-builder-card">
      <!-- CHANNELS -->
      <div class="mb-8">
        <h3 class="text-xs font-bold uppercase text-text-muted mb-3">Target Channels</h3>
        <div class="custom-dropdown" id="dropdown-channels">
          <div class="dropdown-trigger ${activeDropdown === 'channels' ? 'active' : ''}">
            <div class="flex flex-wrap gap-2">
              ${(currentFormState.channels || []).map(cid => {
                const chan = window.CHANNELS.find(c => c.id === cid);
                return chan ? `<span class="channel-tag-pill">${chan.icon} ${chan.label} <span class="tag-remove" data-id="${cid}">×</span></span>` : '';
              }).join('')}
            </div>
            <i data-lucide="chevron-down" class="w-4 h-4 opacity-50"></i>
          </div>
          <div class="dropdown-list ${activeDropdown === 'channels' ? 'show' : ''}">
            ${window.CHANNELS.map(c => `
              <div class="dropdown-item flex-row items-center gap-3 ${currentFormState.channels.includes(c.id) ? 'selected' : ''}" data-id="${c.id}" data-type="channel">
                <input type="checkbox" ${currentFormState.channels.includes(c.id) ? 'checked' : ''} class="pointer-events-none">
                <span class="font-semibold">${c.icon} ${c.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- WHEN SECTION -->
      <div class="builder-section section-when">
        <div class="section-label">
          <span class="badge badge-when">WHEN</span>
        </div>
        
        <div class="custom-dropdown" id="dropdown-when">
          <div class="dropdown-trigger ${activeDropdown === 'when' ? 'active' : ''}">
            <div class="flex items-center gap-2">
              ${when && when.icon ? `<span>${when.icon}</span>` : ''}
              <span class="${!currentFormState.when.condition_id ? 'text-text-muted italic' : 'font-semibold'}">
                ${when ? when.label : 'Select a trigger condition...'}
              </span>
            </div>
            <div class="flex items-center gap-2">
              ${currentFormState.when.condition_id ? `<i data-lucide="x" class="w-4 h-4 clear-select" data-type="when"></i>` : ''}
              <i data-lucide="chevron-down" class="w-4 h-4 opacity-50"></i>
            </div>
          </div>
          <div class="dropdown-list ${activeDropdown === 'when' ? 'show' : ''}">
            <div class="dropdown-search">
              <input type="text" class="input py-1 text-sm search-input" placeholder="Search triggers..." value="${activeDropdown === 'when' ? searchQuery : ''}">
            </div>
            ${window.WHEN_CONDITIONS
              .filter(c => !searchQuery || c.label.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(c => `
              <div class="dropdown-item ${currentFormState.when.condition_id === c.id ? 'selected' : ''}" data-id="${c.id}" data-type="when">
                <div class="item-label">
                  ${c.icon ? `<span>${c.icon}</span> ` : ''}
                  ${c.label}
                </div>
                <div class="item-desc">${c.description || 'Automation trigger'}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div id="when-params" class="params-grid">
          ${when ? renderParamsFields(when.params, 'when') : ''}
        </div>
      </div>

      <!-- DO SECTION -->
      <div class="builder-section section-do">
        <div class="section-label">
          <span class="badge badge-do">DO</span>
        </div>

        <div class="custom-dropdown" id="dropdown-do">
          <div class="dropdown-trigger ${activeDropdown === 'do' ? 'active' : ''}">
            <div class="flex items-center gap-2">
              ${doa && doa.icon ? `<span>${doa.icon}</span>` : ''}
              <span class="${!currentFormState.do.action_id ? 'text-text-muted italic' : 'font-semibold'}">
                ${doa ? doa.label : 'Select an action to perform...'}
              </span>
            </div>
            <div class="flex items-center gap-2">
              ${currentFormState.do.action_id ? `<i data-lucide="x" class="w-4 h-4 clear-select" data-type="do"></i>` : ''}
              <i data-lucide="chevron-down" class="w-4 h-4 opacity-50"></i>
            </div>
          </div>
          <div class="dropdown-list ${activeDropdown === 'do' ? 'show' : ''}">
            <div class="dropdown-search">
              <input type="text" class="input py-1 text-sm search-input" placeholder="Search actions..." value="${activeDropdown === 'do' ? searchQuery : ''}">
            </div>
            ${window.DO_ACTIONS
              .filter(a => !searchQuery || a.label.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(a => `
              <div class="dropdown-item ${currentFormState.do.action_id === a.id ? 'selected' : ''}" data-id="${a.id}" data-type="do">
                <div class="item-label">
                  ${a.icon ? `<span>${a.icon}</span> ` : ''}
                  ${a.badge ? `<span class="badge badge-do text-[8px] p-1">${a.badge}</span> ` : ''}
                  ${a.label}
                </div>
                <div class="item-desc">Execute ${a.label.toLowerCase()} logic</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div id="do-params" class="params-grid">
          ${doa ? renderParamsFields(doa.params, 'do') : ''}
        </div>
      </div>

      <div class="flex justify-end gap-3">
        ${isEditing ? `<button class="btn btn-secondary" id="cancel-edit">Cancel</button>` : ''}
        <button class="btn btn-primary" id="save-rule">${isEditing ? 'Update Rule' : 'Save Rule'}</button>
      </div>
    </div>
  `;
}

function renderParamsFields(params, type) {
  return params.map(p => `
    <div class="${p.type === 'textarea' ? 'params-full' : ''}">
      <label class="block text-xs font-bold uppercase text-text-muted mb-1">${p.label}</label>
      ${p.type === 'textarea' ? `
        <textarea class="input h-24 param-input" data-type="${type}" data-key="${p.key}" placeholder="${p.placeholder}">${currentFormState[type].params[p.key] || ''}</textarea>
      ` : p.type === 'select' ? `
        <select class="input param-input" data-type="${type}" data-key="${p.key}">
          ${p.options.map(opt => `<option value="${opt}" ${currentFormState[type].params[p.key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      ` : `
        <input type="${p.type}" class="input param-input" data-type="${type}" data-key="${p.key}" value="${currentFormState[type].params[p.key] || ''}" placeholder="${p.placeholder}">
      `}
    </div>
  `).join('');
}

function renderRuleCard(rule) {
  const whenObj = window.WHEN_CONDITIONS.find(c => c.id === rule.when.condition_id);
  const doObj = window.DO_ACTIONS.find(a => a.id === rule.do.action_id);
  
  const whenText = whenObj ? whenObj.label : 'Unknown';
  const doText = doObj ? doObj.label : 'Unknown';
  
  const whenValue = Object.values(rule.when.params).join(', ') || '';
  const doValue = Object.values(rule.do.params).join(', ') || '';
  const truncate = (str, n) => str.length > n ? str.substr(0, n-1) + '...' : str;

  return `
    <div class="card rule-card ${!rule.enabled ? 'disabled' : ''}" data-id="${rule.id}">
      <div class="flex items-start justify-between">
        <div class="flex-1 space-y-4">
          <div class="flex items-center gap-4">
            <span class="badge badge-when">WHEN</span>
            <div class="rule-summary">
              <span class="rule-summary-text">${whenText}</span>
              ${whenValue ? `<span class="text-xs text-text-muted font-mono italic">"${truncate(whenValue, 50)}"</span>` : ''}
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="badge badge-do">DO</span>
            <div class="rule-summary">
              <span class="rule-summary-text">${doText}</span>
              ${doValue ? `<span class="text-xs text-text-muted font-mono italic">"${truncate(doValue, 50)}"</span>` : ''}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex gap-1">
            ${(rule.channels || []).map(cid => {
              const chan = window.CHANNELS.find(c => c.id === cid);
              return chan ? `<span title="${chan.label}">${chan.icon}</span>` : '';
            }).join('')}
          </div>
          <label class="toggle-switch">
            <input type="checkbox" class="toggle-rule" ${rule.enabled ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <div class="flex gap-1">
            <button class="btn btn-icon edit-btn" title="Edit"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
            <button class="btn btn-icon delete-btn text-red-500" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          </div>
        </div>
      </div>
      
      <div class="rule-meta">
        <span>Created: ${new Date(rule.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="text-center py-16 opacity-30">
      <i data-lucide="zap-off" class="w-16 h-16 mx-auto mb-4"></i>
      <p class="font-bold italic">No active rules defined yet.</p>
      <p class="text-sm mt-2">Use the builder above to set up your first automation.</p>
    </div>
  `;
}

function attachEvents(container) {
  // Toggle Dropdowns
  ['channels', 'when', 'do'].forEach(type => {
    container.querySelector(`#dropdown-${type} .dropdown-trigger`).addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeDropdown === type) {
        activeDropdown = null;
      } else {
        activeDropdown = type;
        searchQuery = '';
      }
      renderActionsPage(container);
    });
  });

  // Global click to close dropdowns
  const closeDropdowns = () => {
    if (activeDropdown) {
      activeDropdown = null;
      renderActionsPage(container);
    }
  };
  document.addEventListener('click', closeDropdowns);
  container.querySelectorAll('.dropdown-list').forEach(el => {
    el.addEventListener('click', (e) => e.stopPropagation());
  });

  // Search
  container.querySelectorAll('.search-input').forEach(el => {
    el.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderActionsPage(container);
    });
    el.focus();
  });

  // Select Items
  container.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const { id, type } = item.dataset;
      
      if (type === 'channel') {
        if (id === 'all') {
          currentFormState.channels = ['all'];
        } else {
          currentFormState.channels = currentFormState.channels.filter(c => c !== 'all');
          if (currentFormState.channels.includes(id)) {
            currentFormState.channels = currentFormState.channels.filter(c => c !== id);
          } else {
            currentFormState.channels.push(id);
          }
        }
        if (currentFormState.channels.length === 0) currentFormState.channels = ['all'];
      } else if (type === 'when') {
        currentFormState.when.condition_id = id;
        currentFormState.when.params = {};
        activeDropdown = null;
      } else if (type === 'do') {
        currentFormState.do.action_id = id;
        currentFormState.do.params = {};
        activeDropdown = null;
      }
      
      renderActionsPage(container);
    });
  });

  // Clear selects
  container.querySelectorAll('.clear-select').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const { type } = btn.dataset;
      currentFormState[type].condition_id = '';
      currentFormState[type].action_id = '';
      currentFormState[type].params = {};
      renderActionsPage(container);
    });
  });

  // Tag Remove
  container.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      currentFormState.channels = currentFormState.channels.filter(c => c !== id);
      if (currentFormState.channels.length === 0) currentFormState.channels = ['all'];
      renderActionsPage(container);
    });
  });

  // Param Inputs
  container.querySelectorAll('.param-input').forEach(el => {
    el.addEventListener('input', (e) => {
      const { type, key } = e.target.dataset;
      currentFormState[type].params[key] = e.target.value;
    });
  });

  // Save Rule
  container.querySelector('#save-rule').addEventListener('click', () => {
    if (!currentFormState.when.condition_id || !currentFormState.do.action_id) {
      alert('Please select both a WHEN condition and a DO action.');
      return;
    }

    if (editingRuleId) {
      store.updateRule(editingRuleId, currentFormState);
      editingRuleId = null;
    } else {
      store.addRule(currentFormState);
    }
    
    currentFormState = { channels: ['all'], when: { condition_id: '', params: {} }, do: { action_id: '', params: {} } };
    renderActionsPage(container);
  });

  // Cancel Edit
  const cancelBtn = container.querySelector('#cancel-edit');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      editingRuleId = null;
      currentFormState = { channels: ['all'], when: { condition_id: '', params: {} }, do: { action_id: '', params: {} } };
      renderActionsPage(container);
    });
  }

  // Rule Actions
  container.querySelectorAll('.rule-card').forEach(card => {
    const id = card.dataset.id;
    card.querySelector('.toggle-rule').addEventListener('change', () => {
      store.toggleRuleEnabled(id);
      renderActionsPage(container);
    });
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this rule?')) {
        store.deleteRule(id);
        renderActionsPage(container);
      }
    });
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const rule = store.getRuleById(id);
      editingRuleId = id;
      currentFormState = JSON.parse(JSON.stringify(rule));
      renderActionsPage(container);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  if (window.lucide) window.lucide.createIcons();
}
