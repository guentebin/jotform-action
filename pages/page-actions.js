/**
 * ACTIONS Page: WHEN/DO Rule Builder — Multiple conditions + actions
 */

import { store } from '../js/store.js';

let editingRuleId = null;
let activeDropdown = null; // 'channels' | 'when-N' | 'do-N'
let searchQuery = '';

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

  const scenarios = {
    mine:       { label: '📝 Quy tắc của tôi',        items: [] },
    sales:      { label: '🛒 Sales Assistant',         items: [] },
    support:    { label: '🎧 Customer Support',        items: [] },
    healthcare: { label: '🏥 Healthcare / Booking',    items: [] },
  };
  rules.forEach(rule => {
    const key = rule.scenario || 'mine';
    if (scenarios[key]) scenarios[key].items.push(rule);
    else scenarios[key] = { label: '📦 ' + key, items: [rule] };
  });

  const renderGroup = (g) => g.items.length === 0 ? '' : `
    <div class="scenario-group mb-8">
      <div class="scenario-header flex items-center gap-4 mb-4">
        <span class="h-px bg-gray-200 flex-1"></span>
        <span class="text-[11px] font-bold uppercase tracking-widest text-text-muted bg-slate-50 px-3 py-1 rounded-full border border-gray-100">${g.label}</span>
        <span class="h-px bg-gray-200 flex-1"></span>
      </div>
      <div class="space-y-4">${g.items.map(renderRuleCard).join('')}</div>
    </div>`;

  container.innerHTML = `
    <div class="fade-in max-w-5xl mx-auto">
      <div class="section-title-area">
        <h1>HÀNH ĐỘNG</h1>
        <p class="text-text-muted">Thiết lập quy tắc tự động hóa hành vi của agent.</p>
      </div>
      <div id="rule-builder-container" class="mb-10">${renderRuleBuilder()}</div>
      <div class="rules-section-header">
        <div class="rules-section-title">
          <span class="rules-section-icon">⚡</span>
          <h2>QUY TẮC ĐÃ LƯU</h2>
          <span class="rules-count-badge">${rules.length}</span>
        </div>
      </div>
      <div id="rules-list" class="pb-20">
        ${rules.length > 0
          ? Object.values(scenarios).map(renderGroup).join('')
          : renderEmptyState()}
      </div>
    </div>`;

  attachEvents(container);
}

// ─── RULE BUILDER ─────────────────────────────────────────────────────────────
function renderRuleBuilder() {
  const isEditing = !!editingRuleId;
  const { whens, logic, dos, channels } = currentFormState;
  const showLogicBanner = whens.length >= 2;

  return `
    <div class="card rule-builder-card">

      <!-- CHANNELS -->
      <div class="mb-4">
        <h3 class="text-xs font-bold uppercase text-text-muted mb-3">KÊNH ÁP DỤNG</h3>
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

      <!-- WHEN SECTION -->
      <div class="builder-section section-when">
        ${whens.map((w, i) => renderWhenRow(w, i, whens.length)).join('')}
      </div>

      ${showLogicBanner ? `
        <div class="logic-banner my-3">
          <span>IF</span>
          <select class="logic-select" id="logic-select">
            <option value="any" ${logic === 'any' ? 'selected' : ''}>ANY</option>
            <option value="all" ${logic === 'all' ? 'selected' : ''}>ALL</option>
          </select>
          <span>OF THE RULES ARE MATCHED</span>
        </div>` : ''}

      <!-- DO SECTION -->
      <div class="builder-section section-do">
        ${dos.map((d, i) => renderDoRow(d, i, dos.length)).join('')}
      </div>

      <div class="flex justify-end gap-3">
        ${isEditing ? `<button class="btn btn-secondary" id="cancel-edit">Hủy</button>` : ''}
        <button class="btn btn-primary" id="save-rule">${isEditing ? 'Cập nhật quy tắc' : 'Lưu quy tắc'}</button>
      </div>
    </div>`;
}

function renderWhenRow(w, i, total) {
  const cond = window.WHEN_CONDITIONS.find(c => c.id === w.condition_id);
  const ddKey = `when-${i}`;
  const isLast = i === total - 1;
  const showPlus = isLast && canAddWhen();
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
                  ${cond ? cond.label : 'Search or type a condition'}
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
        ${showPlus  ? `<button class="row-action-btn row-add-btn"  data-type="when" id="add-when-btn"   title="Add condition">+</button>` : '<span class="row-action-spacer"></span>'}
        ${showMinus ? `<button class="row-action-btn row-minus-btn" data-type="when" data-index="${i}" title="Remove">−</button>` : '<span class="row-action-spacer"></span>'}
      </div>
    </div>`;
}

function renderDoRow(d, i, total) {
  const act = window.DO_ACTIONS.find(a => a.id === d.action_id);
  const ddKey = `do-${i}`;
  const isLast = i === total - 1;
  const showPlus = isLast && canAddDo();
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
                  ${act ? act.label : 'Search or type an action'}
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
        ${showPlus  ? `<button class="row-action-btn row-add-btn" data-type="do" id="add-do-btn" title="Add action">+</button>` : '<span class="row-action-spacer"></span>'}
        ${showMinus ? `<button class="row-action-btn row-minus-btn" data-type="do" data-index="${i}" title="Remove">&#8722;</button>` : '<span class="row-action-spacer"></span>'}
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

// ─── RULE CARD ────────────────────────────────────────────────────────────────
function renderRuleCard(rule) {
  const truncate = (s, n) => s && s.length > n ? s.slice(0, n - 1) + '…' : (s || '');
  const whens = rule.whens || [];
  const dos   = rule.dos   || [];
  const logic = rule.logic || 'any';

  const logicBadge = whens.length > 1
    ? `<span class="rule-logic-badge-${logic === 'any' ? 'or' : 'and'}">${logic === 'any' ? 'HOẶC' : 'VÀ'}</span>`
    : '';

  const whenRows = whens.map((w, i) => {
    const cond = window.WHEN_CONDITIONS.find(c => c.id === w.condition_id);
    const label = cond ? cond.label : w.condition_id;
    const val = Object.values(w.params || {}).join(', ');
    return `
      <div class="flex items-center gap-2 flex-wrap">
        ${i > 0 ? logicBadge : ''}
        <span class="badge badge-when">KHI</span>
        <span class="rule-summary-text">${label}</span>
        ${val ? `<span class="text-xs text-text-muted font-mono italic">"${truncate(val, 40)}"</span>` : ''}
      </div>`;
  }).join('');

  const doRows = dos.map(d => {
    const act = window.DO_ACTIONS.find(a => a.id === d.action_id);
    const label = act ? act.label : d.action_id;
    const val = Object.values(d.params || {}).filter(v => typeof v === 'string').join(', ');
    return `
      <div class="flex items-center gap-2 flex-wrap">
        <span class="badge badge-do">THỰC HIỆN</span>
        <span class="rule-summary-text">${label}</span>
        ${val ? `<span class="text-xs text-text-muted font-mono italic">"${truncate(val, 40)}"</span>` : ''}
      </div>`;
  }).join('');

  const channelIcons = (rule.channels || []).map(cid => {
    const chan = window.CHANNELS.find(c => c.id === cid);
    return chan ? `<span title="${chan.label}">${chan.icon}</span>` : '';
  }).join('');

  return `
    <div class="card rule-card ${!rule.enabled ? 'disabled' : ''}" data-id="${rule.id}">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 space-y-3 min-w-0">
          <div class="rule-when-list space-y-1">${whenRows}</div>
          <div class="rule-do-list space-y-1">${doRows}</div>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <div class="flex gap-1">${channelIcons}</div>
          <label class="toggle-switch">
            <input type="checkbox" class="toggle-rule" ${rule.enabled ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <div class="flex gap-1 action-buttons">
            <button class="btn btn-icon edit-btn" title="Chỉnh sửa"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
            <button class="btn btn-icon delete-btn text-red-500" title="Xóa"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          </div>
          <div class="hidden confirm-delete-area flex items-center gap-2">
            <span class="text-[10px] font-bold text-red-600 uppercase">Xác nhận?</span>
            <button class="btn btn-xs btn-primary bg-red-600 border-red-600 confirm-delete" style="padding:2px 8px;font-size:10px">Xóa</button>
            <button class="btn btn-xs btn-secondary cancel-delete" style="padding:2px 8px;font-size:10px">Hủy</button>
          </div>
        </div>
      </div>
      <div class="rule-meta mt-2">
        <span>Tạo lúc: ${new Date(rule.created_at || Date.now()).toLocaleDateString('vi-VN')}</span>
      </div>
    </div>`;
}

function renderEmptyState() {
  return `
    <div class="text-center py-16 opacity-30">
      <i data-lucide="zap-off" class="w-16 h-16 mx-auto mb-4"></i>
      <p class="font-bold italic">Chưa có quy tắc nào.</p>
      <p class="text-sm mt-2">Dùng form phía trên để tạo quy tắc đầu tiên.</p>
    </div>`;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function canAddWhen() {
  const last = currentFormState.whens[currentFormState.whens.length - 1];
  if (!last.condition_id) return false;
  const cond = window.WHEN_CONDITIONS.find(c => c.id === last.condition_id);
  if (!cond) return false;
  // All required params must be filled
  return !cond.params?.some(p => !last.params[p.key]);
}

function canAddDo() {
  const last = currentFormState.dos[currentFormState.dos.length - 1];
  if (!last.action_id) return false;
  const act = window.DO_ACTIONS.find(a => a.id === last.action_id);
  if (!act) return false;
  return !act.params?.some(p => p.type !== 'select' && !last.params[p.key]);
}

function isFormValid() {
  // At least 1 WHEN with condition selected
  if (!currentFormState.whens.some(w => w.condition_id)) return false;
  // At least 1 DO with action selected
  if (!currentFormState.dos.some(d => d.action_id)) return false;
  return true;
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
function attachEvents(container) {
  // ── Channels dropdown toggle
  const chTrigger = container.querySelector('#dropdown-channels .dropdown-trigger');
  if (chTrigger) {
    chTrigger.addEventListener('click', e => {
      e.stopPropagation();
      activeDropdown = activeDropdown === 'channels' ? null : 'channels';
      searchQuery = '';
      renderActionsPage(container);
    });
  }

  // ── WHEN/DO row dropdowns
  currentFormState.whens.forEach((_, i) => {
    const trigger = container.querySelector(`#dropdown-when-${i} .dropdown-trigger`);
    if (trigger) {
      trigger.addEventListener('click', e => {
        e.stopPropagation();
        const key = `when-${i}`;
        activeDropdown = activeDropdown === key ? null : key;
        searchQuery = '';
        renderActionsPage(container);
      });
    }
  });
  currentFormState.dos.forEach((_, i) => {
    const trigger = container.querySelector(`#dropdown-do-${i} .dropdown-trigger`);
    if (trigger) {
      trigger.addEventListener('click', e => {
        e.stopPropagation();
        const key = `do-${i}`;
        activeDropdown = activeDropdown === key ? null : key;
        searchQuery = '';
        renderActionsPage(container);
      });
    }
  });

  // ── Close dropdowns on outside click
  const closeAll = () => {
    if (activeDropdown) { activeDropdown = null; renderActionsPage(container); }
    container.querySelectorAll('.confirm-delete-area').forEach(el => el.classList.add('hidden'));
    container.querySelectorAll('.action-buttons').forEach(el => el.classList.remove('hidden'));
  };
  document.removeEventListener('click', closeAll);
  document.addEventListener('click', closeAll);
  container.querySelectorAll('.dropdown-list').forEach(el => el.addEventListener('click', e => e.stopPropagation()));

  // ── Search
  container.querySelectorAll('.search-input').forEach(el => {
    el.addEventListener('input', e => { searchQuery = e.target.value; renderActionsPage(container); });
    setTimeout(() => el.focus(), 0);
  });

  // ── Select dropdown items
  container.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const { id, type, index } = item.dataset;
      const idx = parseInt(index ?? 0);
      if (type === 'channel') {
        if (id === 'all') {
          currentFormState.channels = ['all'];
        } else {
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

  // ── Clear buttons
  container.querySelectorAll('.clear-when').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      currentFormState.whens[parseInt(btn.dataset.index)] = { condition_id: '', params: {} };
      renderActionsPage(container);
    });
  });
  container.querySelectorAll('.clear-do').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      currentFormState.dos[parseInt(btn.dataset.index)] = { action_id: '', params: {} };
      renderActionsPage(container);
    });
  });

  // ── Channel tag remove
  container.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      currentFormState.channels = currentFormState.channels.filter(c => c !== btn.dataset.id);
      if (!currentFormState.channels.length) currentFormState.channels = ['all'];
      renderActionsPage(container);
    });
  });

  // ── Row remove buttons
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

  // ── Add WHEN / Add DO
  const addWhenBtn = container.querySelector('#add-when-btn');
  if (addWhenBtn) {
    addWhenBtn.addEventListener('click', e => {
      e.stopPropagation();
      currentFormState.whens.push({ condition_id: '', params: {} });
      renderActionsPage(container);
    });
  }
  const addDoBtn = container.querySelector('#add-do-btn');
  if (addDoBtn) {
    addDoBtn.addEventListener('click', e => {
      e.stopPropagation();
      currentFormState.dos.push({ action_id: '', params: {} });
      renderActionsPage(container);
    });
  }

  // ── Logic select
  const logicSel = container.querySelector('#logic-select');
  if (logicSel) {
    logicSel.addEventListener('change', e => { currentFormState.logic = e.target.value; });
  }

  // ── Param inputs
  container.querySelectorAll('.param-input').forEach(el => {
    el.addEventListener('input', e => {
      const { type, row, key } = e.target.dataset;
      const idx = parseInt(row ?? 0);
      if (type === 'when') currentFormState.whens[idx].params[key] = e.target.value;
      else if (type === 'do') currentFormState.dos[idx].params[key] = e.target.value;
    });
  });

  // ── Save rule
  container.querySelector('#save-rule')?.addEventListener('click', () => {
    if (!isFormValid()) {
      window.showToast('Vui lòng chọn cả điều kiện KHI và hành động THỰC HIỆN.', 'error');
      return;
    }
    // Filter out empty rows
    const cleanedWhens = currentFormState.whens.filter(w => w.condition_id);
    const cleanedDos   = currentFormState.dos.filter(d => d.action_id);
    const payload = {
      channels: currentFormState.channels,
      whens: cleanedWhens,
      logic: cleanedWhens.length > 1 ? currentFormState.logic : 'any',
      dos: cleanedDos,
    };

    if (editingRuleId) {
      store.updateRule(editingRuleId, payload);
      editingRuleId = null;
      window.showToast('✓ Đã cập nhật quy tắc thành công');
    } else {
      store.addRule(payload);
      window.showToast('✓ Đã lưu quy tắc thành công');
    }
    currentFormState = freshState();
    renderActionsPage(container);
  });

  // ── Cancel edit
  container.querySelector('#cancel-edit')?.addEventListener('click', () => {
    editingRuleId = null;
    currentFormState = freshState();
    renderActionsPage(container);
  });

  // ── Rule card actions
  container.querySelectorAll('.rule-card').forEach(card => {
    const id = card.dataset.id;
    card.querySelector('.toggle-rule')?.addEventListener('change', () => {
      store.toggleRuleEnabled(id);
      renderActionsPage(container);
    });

    const deleteBtn   = card.querySelector('.delete-btn');
    const actionsArea = card.querySelector('.action-buttons');
    const confirmArea = card.querySelector('.confirm-delete-area');

    deleteBtn?.addEventListener('click', e => {
      e.stopPropagation();
      actionsArea.classList.add('hidden');
      confirmArea.classList.remove('hidden');
    });
    card.querySelector('.cancel-delete')?.addEventListener('click', e => {
      e.stopPropagation();
      actionsArea.classList.remove('hidden');
      confirmArea.classList.add('hidden');
    });
    card.querySelector('.confirm-delete')?.addEventListener('click', e => {
      e.stopPropagation();
      store.deleteRule(id);
      window.showToast('✓ Đã xóa quy tắc');
      renderActionsPage(container);
    });

    card.querySelector('.edit-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      const rule = store.getRuleById(id);
      if (!rule) return;
      editingRuleId = id;
      currentFormState = {
        channels: [...(rule.channels || ['all'])],
        whens: JSON.parse(JSON.stringify(rule.whens || [{ condition_id: '', params: {} }])),
        logic: rule.logic || 'any',
        dos: JSON.parse(JSON.stringify(rule.dos || [{ action_id: '', params: {} }])),
      };
      renderActionsPage(container);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  if (window.lucide) window.lucide.createIcons();
}
