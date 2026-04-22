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
        ${rules.length > 0 ? rules.map(rule => renderRuleCard(rule)).join('') : renderEmptyState()}
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
      <div class="mb-6">
        <h3 class="font-bold mb-2">Rule Channels</h3>
        <div class="flex flex-wrap gap-2 mb-3">
          <select id="channel-select" class="input w-auto text-sm">
            <option value="" disabled selected>Add channel...</option>
            ${window.CHANNELS.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}
          </select>
        </div>
        <div class="channel-tags">
          ${currentFormState.channels.map(cid => {
            const chan = window.CHANNELS.find(c => c.id === cid);
            return `<span class="channel-tag">${chan.icon} ${chan.label} <span class="tag-remove" data-id="${cid}">×</span></span>`;
          }).join('')}
        </div>
      </div>

      <!-- WHEN SECTION -->
      <div class="builder-section section-when">
        <div class="section-label">
          <span class="badge badge-when">WHEN</span>
          <span class="font-bold text-sm">Condition Trigger</span>
        </div>
        <select id="when-select" class="input ${!currentFormState.when.condition_id ? 'border-dashed' : ''}">
          <option value="" disabled ${!currentFormState.when.condition_id ? 'selected' : ''}>Select a trigger condition...</option>
          ${window.WHEN_CONDITIONS.map(c => `
            <option value="${c.id}" ${currentFormState.when.condition_id === c.id ? 'selected' : ''}>${c.label}</option>
          `).join('')}
        </select>
        
        <div id="when-params" class="params-grid">
          ${when ? renderParamsFields(when.params, 'when') : ''}
        </div>
      </div>

      <!-- DO SECTION -->
      <div class="builder-section section-do">
        <div class="section-label">
          <span class="badge badge-do">DO</span>
          <span class="font-bold text-sm">Target Action</span>
        </div>
        <select id="do-select" class="input ${!currentFormState.do.action_id ? 'border-dashed' : ''}">
          <option value="" disabled ${!currentFormState.do.action_id ? 'selected' : ''}>Select an action to perform...</option>
          ${window.DO_ACTIONS.map(a => `
            <option value="${a.id}" ${currentFormState.do.action_id === a.id ? 'selected' : ''}>${a.badge ? `(${a.badge}) ` : ''}${a.label}</option>
          `).join('')}
        </select>

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
  
  // Format summary
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
            ${rule.channels.map(cid => {
              const chan = window.CHANNELS.find(c => c.id === cid);
              return `<span title="${chan.label}">${chan.icon}</span>`;
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
        <span>ID: ${rule.id}</span>
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
  // Channel Select
  const channelSelect = container.querySelector('#channel-select');
  if (channelSelect) {
    channelSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (!val) return;
      
      if (val === 'all') {
        currentFormState.channels = ['all'];
      } else {
        currentFormState.channels = currentFormState.channels.filter(c => c !== 'all');
        if (!currentFormState.channels.includes(val)) {
          currentFormState.channels.push(val);
        }
      }
      renderActionsPage(container);
    });
  }

  // Remove Tag
  container.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      currentFormState.channels = currentFormState.channels.filter(c => c !== id);
      if (currentFormState.channels.length === 0) currentFormState.channels = ['all'];
      renderActionsPage(container);
    });
  });

  // When/Do Select
  const whenSelect = container.querySelector('#when-select');
  if (whenSelect) {
    whenSelect.addEventListener('change', (e) => {
      currentFormState.when.condition_id = e.target.value;
      currentFormState.when.params = {};
      renderActionsPage(container);
    });
  }

  const doSelect = container.querySelector('#do-select');
  if (doSelect) {
    doSelect.addEventListener('change', (e) => {
      currentFormState.do.action_id = e.target.value;
      currentFormState.do.params = {};
      renderActionsPage(container);
    });
  }

  // Param Inputs
  container.querySelectorAll('.param-input').forEach(el => {
    el.addEventListener('input', (e) => {
      const { type, key } = e.target.dataset;
      currentFormState[type].params[key] = e.target.value;
    });
  });

  // Save Rule
  container.querySelector('#save-rule').addEventListener('click', () => {
    // Validation
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
    
    // Reset Form
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
    
    // Toggle
    card.querySelector('.toggle-rule').addEventListener('change', () => {
      store.toggleRuleEnabled(id);
      renderActionsPage(container);
    });

    // Delete
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this rule?')) {
        store.deleteRule(id);
        renderActionsPage(container);
      }
    });

    // Edit
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const rule = store.getRuleById(id);
      editingRuleId = id;
      currentFormState = JSON.parse(JSON.stringify(rule)); // Deep copy
      renderActionsPage(container);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  if (window.lucide) window.lucide.createIcons();
}
