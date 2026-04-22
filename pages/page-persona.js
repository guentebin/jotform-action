/**
 * pages/page-persona.js
 */

import { store } from '../js/store.js';

export function renderPersonaPage(container) {
  const config = store.getAgentConfig();
  
  container.innerHTML = `
    <div class="fade-in max-w-2xl px-4">
      <div class="section-title-area">
        <h1>AI PERSONA</h1>
        <p class="text-text-muted">Define how your agent identifies and behaves.</p>
      </div>

      <div class="card space-y-6">
        <div>
          <label class="block text-sm font-bold uppercase text-text-muted mb-2">Agent Name</label>
          <input type="text" id="persona-name" class="input" value="${config.name}" placeholder="e.g. Chat Support">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold uppercase text-text-muted mb-2">Role</label>
            <input type="text" id="persona-role" class="input" value="${config.persona.role}" placeholder="e.g. Sales Assistant">
          </div>
          <div>
            <label class="block text-sm font-bold uppercase text-text-muted mb-2">Tone</label>
            <select id="persona-tone" class="input">
              <option ${config.persona.tone === 'Professional' ? 'selected' : ''}>Professional</option>
              <option ${config.persona.tone === 'Friendly' ? 'selected' : ''}>Friendly</option>
              <option ${config.persona.tone === 'Casual' ? 'selected' : ''}>Casual</option>
              <option ${config.persona.tone === 'Formal' ? 'selected' : ''}>Formal</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold uppercase text-text-muted mb-2">Language</label>
          <select id="persona-lang" class="input">
            <option ${config.persona.language === 'English' ? 'selected' : ''}>English</option>
            <option ${config.persona.language === 'Vietnamese' ? 'selected' : ''}>Vietnamese</option>
            <option ${config.persona.language === 'Auto' ? 'selected' : ''}>Auto-detect</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-bold uppercase text-text-muted mb-2">System Instructions</label>
          <textarea id="persona-instructions" class="input h-48" placeholder="Give detailed instructions on how the AI should respond...">${config.persona.instructions}</textarea>
        </div>

        <div class="flex justify-end pt-4">
          <button id="save-persona-btn" class="btn btn-primary">Save Config</button>
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
    alert('Persona saved successfully!');
  });
}
