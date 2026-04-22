/**
 * HÀNH ĐỘNG Page — Jotform-style: list + Add/Edit form
 */

import { store } from '../js/store.js';

// ─── STATE ────────────────────────────────────────────────────────────────────
let editingRuleId = null;    // null = closed | string = editing rule id
let formOpen = false;        // true = form visible
let activeDropdown = null;
let searchQuery = '';
let openMenuId = null;       // rule id with ⋮ menu open

function freshState() {
  return {
    channels: ['all'],
    whens: [{ condition_id: '', params: {} }],
    logic: 'any',
    dos: [{ action_id: '', params: {} }],
  };
}

let currentFormState = freshState();

// ─── MAIN RENDER ──────────────────────────────────────────────────────────────
export function renderActionsPage(container) {
  const rules = store.getRules();


  container.innerHTML = `
    <div class="fade-in actions-page">

      <!-- PAGE HEADER -->
      <div class="actions-page-header">
        <div class="actions-page-icon"><i data-lucide="flag" class="w-5 h-5"></i></div>
        <div>
          <div class="actions-page-title">HÀNH ĐỘNG</div>
          <div class="actions-page-sub">Thiết lập quy tắc tự động hóa hành vi của agent.</div>
        </div>
      </div>

      <!-- ADD NEW ACTION BUTTON (always visible) -->
      <button class="add-action-main-btn" id="btn-add-new">
        <i data-lucide="plus" class="w-4 h-4"></i>
        Thêm quy tắc mới
      </button>

      <!-- FORM (visible only when adding/editing) -->
      ${formOpen ? `
        <div class="action-form-panel" id="action-form-panel">
          ${renderRuleBuilder()}
        </div>` : ''}

      <!-- RULES LIST -->
      <div class="rules-content">
        ${rules.length > 0 ? rules.map(renderRuleCard).join('') : (!formOpen ? renderEmptyState() : '')}
      </div>
    </div>`;

  attachEvents(container);
}

// ─── RULE BUILDER ─────────────────────────────────────────────────────────────
function renderRuleBuilder() {
  const { whens, logic, dos, channels } = currentFormState;
  const isEditing = !!editingRuleId;
  const showLogicBanner = whens.length >= 2;

  return `
    <div class="rule-builder-inner">
      <!-- CHANNELS -->
      <div class="form-field-group">
        <label class="form-field-label">KÊNH ÁP DỤNG</label>
        <div class="custom-dropdown" id="dropdown-channels">
          <div class="dropdown-trigger ${activeDropdown === 'channels' ? 'active' : ''}">
            <div class="flex flex-wrap gap-2">
              ${channels.map(cid => {
                const chan = window.CHANNELS.find(c => c.id === cid);
                return chan ? `<span class="channel-tag-pill">${chan.icon} ${chan.label}<span class="tag-remove" data-id="${cid}">×</span></span>` : '';
              }).join('')}
            </div>
            <i data-lucide="chevron-down" class="w-4 h-4 opacity-50"></i>
          </div>
          <div class="dropdown-list ${activeDropdown === 'channels' ? 'show' : ''}">
            ${window.CHANNELS.map(c => `
              <div class="dropdown-item flex-row items-center gap-3 ${channels.includes(c.id) ? 'selected' : ''}" data-id="${c.id}" data-type="channel">
                <input type="checkbox" ${channels.includes(c.id) ? 'checked' : ''} class="pointer-events-none">
                <span class="font-semibold">${c.icon} ${c.label}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- WHEN ROWS -->
      <div class="builder-section section-when">
        ${whens.map((w, i) => renderWhenRow(w, i, whens.length)).join('')}
      </div>

      ${showLogicBanner ? `
        <div class="logic-banner">
          <span>NẾU</span>
          <select class="logic-select" id="logic-select">
            <option value="any" ${logic === 'any' ? 'selected' : ''}>BẤT KỲ</option>
            <option value="all" ${logic === 'all' ? 'selected' : ''}>TẤT CẢ</option>
          </select>
          <span>điều kiện trên khớp</span>
        </div>` : ''}

      <!-- DO ROWS -->
      <div class="builder-section section-do">
        ${dos.map((d, i) => renderDoRow(d, i, dos.length)).join('')}
      </div>

      <!-- FORM HÀNH ĐỘNG -->
      <div class="form-actions">
        <button class="btn btn-secondary" id="cancel-form">Hủy</button>
        <button class="btn btn-primary" id="save-rule">
          ${isEditing ? 'Cập nhật' : 'Lưu'}
        </button>
      </div>
    </div>`;
}

// ─── WHEN ROW ─────────────────────────────────────────────────────────────────
function renderWhenRow(w, i, total) {
  const cond = window.WHEN_CONDITIONS.find(c => c.id === w.condition_id);
  const ddKey = `when-${i}`;
  const isLast = i === total - 1;
  const showPlus  = isLast && canAddWhen();
  const showMinus = total > 1;

  return `
    <div class="action-row" data-index="${i}">
      <div class="action-row-left">
        <div class="action-row-label"><span class="badge badge-when">WHEN</span></div>
        <div class="action-row-content">
          <div class="custom-dropdown" id="dropdown-${ddKey}">
            <div class="dropdown-trigger ${activeDropdown === ddKey ? 'active' : ''}">
              <div class="flex items-center gap-2">
                ${cond?.icon ? `<span>${cond.icon}</span>` : ''}
                <span class="${!w.condition_id ? 'text-text-muted italic' : 'font-semibold'}">
                  ${cond ? cond.label : 'Tìm hoặc nhập điều kiện'}
                </span>
              </div>
              <div class="flex items-center gap-1">
                ${w.condition_id ? `<i data-lucide="x" class="w-4 h-4 clear-when cursor-pointer" data-index="${i}"></i>` : ''}
                <i data-lucide="chevron-down" class="w-4 h-4 opacity-50"></i>
              </div>
            </div>
            <div class="dropdown-list ${activeDropdown === ddKey ? 'show' : ''}">
              <div class="dropdown-search">
                <input type="text" class="input py-1 text-sm search-input" placeholder="Tìm điều kiện..."
                  value="${activeDropdown === ddKey ? searchQuery : ''}">
              </div>
              ${window.WHEN_CONDITIONS
                .filter(c => !searchQuery || c.label.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(c => `
                  <div class="dropdown-item ${w.condition_id === c.id ? 'selected' : ''}"
                    data-id="${c.id}" data-type="when" data-index="${i}">
                    <div class="item-label">${c.icon ? `<span>${c.icon}</span> ` : ''}${c.label}</div>
                    <div class="item-desc">${c.description || ''}</div>
                  </div>`).join('')}
            </div>
          </div>
          ${cond?.params?.length ? `
            <div class="params-grid mt-2">
              ${renderParamsFields(cond.params, 'when', i, w.params)}
            </div>` : ''}
        </div>
      </div>
      <div class="action-row-btns">
        ${showPlus  ? `<button class="row-action-btn row-add-btn"  data-type="when" id="add-when-btn" title="Thêm điều kiện">+</button>` : '<span class="row-action-spacer"></span>'}
        ${showMinus ? `<button class="row-action-btn row-minus-btn" data-type="when" data-index="${i}" title="Remove">−</button>` : '<span class="row-action-spacer"></span>'}
      </div>
    </div>`;
}

// ─── DO ROW ───────────────────────────────────────────────────────────────────
function renderDoRow(d, i, total) {
  const act = window.DO_ACTIONS.find(a => a.id === d.action_id);
  const ddKey = `do-${i}`;
  const isLast = i === total - 1;
  const showPlus  = isLast && canAddDo();
  const showMinus = total > 1;

  return `
    <div class="action-row" data-index="${i}">
      <div class="action-row-left">
        <div class="action-row-label"><span class="badge badge-do">DO</span></div>
        <div class="action-row-content">
          <div class="custom-dropdown" id="dropdown-${ddKey}">
            <div class="dropdown-trigger ${activeDropdown === ddKey ? 'active' : ''}">
              <div class="flex items-center gap-2">
                ${act?.icon ? `<span>${act.icon}</span>` : ''}
                <span class="${!d.action_id ? 'text-text-muted italic' : 'font-semibold'}">
                  ${act ? act.label : 'Tìm hoặc nhập hành động'}
                </span>
              </div>
              <div class="flex items-center gap-1">
                ${d.action_id ? `<i data-lucide="x" class="w-4 h-4 clear-do cursor-pointer" data-index="${i}"></i>` : ''}
                <i data-lucide="chevron-down" class="w-4 h-4 opacity-50"></i>
              </div>
            </div>
            <div class="dropdown-list ${activeDropdown === ddKey ? 'show' : ''}">
              <div class="dropdown-search">
                <input type="text" class="input py-1 text-sm search-input" placeholder="Tìm hành động..."
                  value="${activeDropdown === ddKey ? searchQuery : ''}">
              </div>
              ${window.DO_ACTIONS
                .filter(a => !searchQuery || a.label.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(a => `
                  <div class="dropdown-item ${d.action_id === a.id ? 'selected' : ''}"
                    data-id="${a.id}" data-type="do" data-index="${i}">
                    <div class="item-label">${a.icon ? `<span>${a.icon}</span> ` : ''}${a.label}${a.badge ? ` <span class="badge-new">${a.badge}</span>` : ''}</div>
                    <div class="item-desc">${a.description || ''}</div>
                  </div>`).join('')}
            </div>
          </div>
          ${act?.params?.length ? `
            <div class="params-grid mt-2">
              ${renderParamsFields(act.params, 'do', i, d.params)}
            </div>` : ''}
        </div>
      </div>
      <div class="action-row-btns">
        ${showPlus  ? `<button class="row-action-btn row-add-btn" data-type="do" id="add-do-btn" title="Thêm hành động">+</button>` : '<span class="row-action-spacer"></span>'}
        ${showMinus ? `<button class="row-action-btn row-minus-btn" data-type="do" data-index="${i}" title="Remove">−</button>` : '<span class="row-action-spacer"></span>'}
      </div>
    </div>`;
}

function renderParamsFields(params, type, rowIndex, currentParams) {
  return params.map(p => `
    <div class="${(p.type === 'textarea' || type === 'when') ? 'params-full' : ''}">
      <label class="block text-xs font-bold uppercase text-text-muted mb-1">${p.label}</label>
      ${p.type === 'textarea'
        ? `<textarea class="input h-24 param-input" data-type="${type}" data-row="${rowIndex}" data-key="${p.key}" placeholder="${p.placeholder}">${currentParams[p.key] || ''}</textarea>`
        : p.type === 'select'
        ? `<select class="input param-input" data-type="${type}" data-row="${rowIndex}" data-key="${p.key}">
             ${p.options.map(opt => `<option value="${opt}" ${currentParams[p.key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
           </select>`
        : `<input type="${p.type}" class="input param-input" data-type="${type}" data-row="${rowIndex}" data-key="${p.key}"
             value="${currentParams[p.key] || ''}" placeholder="${p.placeholder}">`}
    </div>`).join('');
}

// ─── RULE CARD (Jotform style) ────────────────────────────────────────────────
function renderRuleCard(rule) {
  const truncate = (s, n) => s && s.length > n ? s.slice(0, n - 1) + '…' : (s || '');
  const whens = rule.whens || [];
  const dos   = rule.dos   || [];
  const logic = rule.logic || 'any';
  const isMenuOpen = openMenuId === rule.id;

  const whenLines = whens.map((w, i) => {
    const cond = window.WHEN_CONDITIONS.find(c => c.id === w.condition_id);
    const val  = Object.values(w.params || {}).join(', ');
    const logicLabel = i > 0 ? `<span class="rule-logic-inline">${logic === 'any' ? 'OR' : 'AND'}</span> ` : '';
    return `<div class="rule-card-line">
      ${logicLabel}<span class="rc-label rc-when">WHEN</span>
      <span class="rc-text">${cond ? cond.label : w.condition_id}</span>
      ${val ? `<span class="rc-value">${truncate(val, 40)}</span>` : ''}
    </div>`;
  }).join('');

  const doLines = dos.map(d => {
    const act = window.DO_ACTIONS.find(a => a.id === d.action_id);
    const val = Object.values(d.params || {}).filter(v => typeof v === 'string').join(', ');
    return `<div class="rule-card-line">
      <span class="rc-label rc-do">${act ? act.label.toUpperCase() : 'DO'}</span>
      ${val ? `<span class="rc-value">${truncate(val, 45)}</span>` : ''}
    </div>`;
  }).join('');

  const channelChips = (rule.channels || []).map(cid => {
    const chan = window.CHANNELS.find(c => c.id === cid);
    return chan ? `<span class="rc-channel-chip">${chan.icon} ${chan.label}</span>` : '';
  }).join('');

  return `
    <div class="jf-rule-card ${!rule.enabled ? 'jf-rule-card--off' : ''}" data-id="${rule.id}">
      <div class="jf-rule-card-body">
        ${whenLines}
        ${doLines}
        <div class="rule-card-line mt-1">
          <span class="rc-label rc-channels">KÊNH</span>
          <span class="rc-channels-chips">${channelChips}</span>
        </div>
      </div>
      <div class="jf-rule-card-menu">
        <button class="kebab-btn" data-id="${rule.id}" title="Tùy chọn">⋮</button>
        ${isMenuOpen ? `
          <div class="kebab-dropdown">
            <div class="kebab-item edit-rule-btn" data-id="${rule.id}">
              <i data-lucide="edit-2" class="w-3 h-3"></i> Edit
            </div>
            <div class="kebab-item toggle-rule-btn" data-id="${rule.id}">
              <i data-lucide="${rule.enabled ? 'eye-off' : 'eye'}" class="w-3 h-3"></i>
              ${rule.enabled ? 'Disable' : 'Enable'}
            </div>
            <div class="kebab-item delete-rule-btn danger" data-id="${rule.id}">
              <i data-lucide="trash-2" class="w-3 h-3"></i> Delete
            </div>
          </div>` : ''}
      </div>
    </div>`;
}

function renderEmptyState() {
  return `
    <div class="actions-empty">
      <div style="font-size:32px;opacity:0.3">⚡</div>
      <p>Chưa có quy tắc nào. Nhấn <strong>Thêm quy tắc mới</strong> để bắt đầu.</p>
    </div>`;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function canAddWhen() {
  const last = currentFormState.whens[currentFormState.whens.length - 1];
  if (!last.condition_id) return false;
  const cond = window.WHEN_CONDITIONS.find(c => c.id === last.condition_id);
  return !cond?.params?.some(p => !last.params[p.key]);
}

function canAddDo() {
  const last = currentFormState.dos[currentFormState.dos.length - 1];
  if (!last.action_id) return false;
  const act = window.DO_ACTIONS.find(a => a.id === last.action_id);
  return !act?.params?.some(p => p.type !== 'select' && !last.params[p.key]);
}

function isFormValid() {
  return currentFormState.whens.some(w => w.condition_id) &&
         currentFormState.dos.some(d => d.action_id);
}

function openForm(ruleId = null) {
  if (ruleId) {
    const rule = store.getRuleById(ruleId);
    if (!rule) return;
    editingRuleId = ruleId;
    currentFormState = {
      channels: [...(rule.channels || ['all'])],
      whens: JSON.parse(JSON.stringify(rule.whens || [{ condition_id: '', params: {} }])),
      logic: rule.logic || 'any',
      dos:   JSON.parse(JSON.stringify(rule.dos   || [{ action_id: '', params: {} }])),
    };
  } else {
    editingRuleId = null;
    currentFormState = freshState();
  }
  formOpen = true;
  openMenuId = null;
}

function closeForm() {
  formOpen = false;
  editingRuleId = null;
  currentFormState = freshState();
  activeDropdown = null;
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
function attachEvents(container) {
  // ── Thêm quy tắc mới button
  container.querySelector('#btn-add-new')?.addEventListener('click', e => {
    e.stopPropagation();
    openForm();
    renderActionsPage(container);
    // Scroll form into view
    setTimeout(() => container.querySelector('.action-form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  });

  if (!formOpen) {
    // ── Kebab menu buttons
    container.querySelectorAll('.kebab-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openMenuId = openMenuId === id ? null : id;
        renderActionsPage(container);
      });
    });

    container.querySelectorAll('.edit-rule-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openForm(btn.dataset.id);
        renderActionsPage(container);
        setTimeout(() => container.querySelector('.action-form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      });
    });

    container.querySelectorAll('.toggle-rule-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        store.toggleRuleEnabled(btn.dataset.id);
        openMenuId = null;
        renderActionsPage(container);
      });
    });

    container.querySelectorAll('.delete-rule-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        store.deleteRule(btn.dataset.id);
        openMenuId = null;
        window.showToast && window.showToast('Đã xóa quy tắc');
        renderActionsPage(container);
      });
    });

    // Close kebab on outside click
    const closeMenu = () => { if (openMenuId) { openMenuId = null; renderActionsPage(container); } };
    document.removeEventListener('click', closeMenu);
    document.addEventListener('click', closeMenu);
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // ── Form events (only when form is open) ──────────────────────────────────

  // Channels dropdown
  container.querySelector('#dropdown-channels .dropdown-trigger')?.addEventListener('click', e => {
    e.stopPropagation();
    activeDropdown = activeDropdown === 'channels' ? null : 'channels';
    searchQuery = '';
    renderActionsPage(container);
  });

  // WHEN/DO row dropdowns
  currentFormState.whens.forEach((_, i) => {
    container.querySelector(`#dropdown-when-${i} .dropdown-trigger`)?.addEventListener('click', e => {
      e.stopPropagation();
      const key = `when-${i}`;
      activeDropdown = activeDropdown === key ? null : key;
      searchQuery = '';
      renderActionsPage(container);
    });
  });
  currentFormState.dos.forEach((_, i) => {
    container.querySelector(`#dropdown-do-${i} .dropdown-trigger`)?.addEventListener('click', e => {
      e.stopPropagation();
      const key = `do-${i}`;
      activeDropdown = activeDropdown === key ? null : key;
      searchQuery = '';
      renderActionsPage(container);
    });
  });

  // Close dropdowns
  const closeAll = () => { if (activeDropdown) { activeDropdown = null; renderActionsPage(container); } };
  document.removeEventListener('click', closeAll);
  document.addEventListener('click', closeAll);
  container.querySelectorAll('.dropdown-list').forEach(el => el.addEventListener('click', e => e.stopPropagation()));

  // Search
  container.querySelectorAll('.search-input').forEach(el => {
    el.addEventListener('input', e => { searchQuery = e.target.value; renderActionsPage(container); });
    setTimeout(() => el.focus(), 0);
  });

  // Select dropdown items
  container.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const { id, type, index } = item.dataset;
      const idx = parseInt(index ?? 0);
      if (type === 'channel') {
        if (id === 'all') currentFormState.channels = ['all'];
        else {
          currentFormState.channels = currentFormState.channels.filter(c => c !== 'all');
          if (currentFormState.channels.includes(id)) currentFormState.channels = currentFormState.channels.filter(c => c !== id);
          else currentFormState.channels.push(id);
        }
        if (!currentFormState.channels.length) currentFormState.channels = ['all'];
      } else if (type === 'when') {
        currentFormState.whens[idx] = { condition_id: id, params: {} };
        activeDropdown = null;
      } else if (type === 'do') {
        currentFormState.dos[idx] = { action_id: id, params: {} };
        activeDropdown = null;
      }
      renderActionsPage(container);
    });
  });

  container.querySelectorAll('.clear-when').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); currentFormState.whens[parseInt(btn.dataset.index)] = { condition_id: '', params: {} }; renderActionsPage(container); });
  });
  container.querySelectorAll('.clear-do').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); currentFormState.dos[parseInt(btn.dataset.index)] = { action_id: '', params: {} }; renderActionsPage(container); });
  });
  container.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      currentFormState.channels = currentFormState.channels.filter(c => c !== btn.dataset.id);
      if (!currentFormState.channels.length) currentFormState.channels = ['all'];
      renderActionsPage(container);
    });
  });

  // Row +/- buttons
  container.querySelectorAll('.row-minus-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const { type, index } = btn.dataset;
      const idx = parseInt(index);
      if (type === 'when' && currentFormState.whens.length > 1) {
        currentFormState.whens.splice(idx, 1);
        if (currentFormState.whens.length < 2) currentFormState.logic = 'any';
      } else if (type === 'do' && currentFormState.dos.length > 1) {
        currentFormState.dos.splice(idx, 1);
      }
      renderActionsPage(container);
    });
  });
  container.querySelector('#add-when-btn')?.addEventListener('click', e => { e.stopPropagation(); currentFormState.whens.push({ condition_id: '', params: {} }); renderActionsPage(container); });
  container.querySelector('#add-do-btn')?.addEventListener('click', e => { e.stopPropagation(); currentFormState.dos.push({ action_id: '', params: {} }); renderActionsPage(container); });

  // Logic select
  container.querySelector('#logic-select')?.addEventListener('change', e => { currentFormState.logic = e.target.value; });

  // Param inputs
  container.querySelectorAll('.param-input').forEach(el => {
    el.addEventListener('input', e => {
      const { type, row, key } = e.target.dataset;
      const idx = parseInt(row ?? 0);
      if (type === 'when') currentFormState.whens[idx].params[key] = e.target.value;
      else if (type === 'do') currentFormState.dos[idx].params[key] = e.target.value;
    });
  });

  // Save
  container.querySelector('#save-rule')?.addEventListener('click', () => {
    if (!isFormValid()) { window.showToast && window.showToast('Vui lòng chọn điều kiện KHI và hành động THỰC HIỆN.', 'error'); return; }
    const payload = {
      channels: currentFormState.channels,
      whens: currentFormState.whens.filter(w => w.condition_id),
      logic: currentFormState.whens.filter(w => w.condition_id).length > 1 ? currentFormState.logic : 'any',
      dos: currentFormState.dos.filter(d => d.action_id),
    };
    if (editingRuleId) {
      store.updateRule(editingRuleId, payload);
      window.showToast && window.showToast('✓ Đã cập nhật quy tắc');
    } else {
      store.addRule(payload);
      window.showToast && window.showToast('✓ Đã lưu quy tắc');
    }
    closeForm();
    renderActionsPage(container);
  });

  // Cancel
  container.querySelector('#cancel-form')?.addEventListener('click', () => { closeForm(); renderActionsPage(container); });

  if (window.lucide) window.lucide.createIcons();
}
