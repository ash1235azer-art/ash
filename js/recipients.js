/**
 * FamilyCare – Family Care Coordination System
 * Care Recipients Management Module
 */

import { store } from './data.js';

let currentFilter = 'all';
let searchQuery = '';

export function renderRecipients() {
  const container = document.getElementById('recipients-view');
  if (!container) return;

  const recipients = store.getRecipients();

  // Filter & Search
  const filtered = recipients.filter(r => {
    const matchesSearch = searchQuery === '' ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.conditions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.phone && r.phone.includes(searchQuery));

    if (!matchesSearch) return false;
    if (currentFilter === 'elderly') return r.age >= 70;
    if (currentFilter === 'mobility') return r.mobility.toLowerCase().includes('cane') || r.mobility.toLowerCase().includes('wheelchair') || r.mobility.toLowerCase().includes('walker');
    return true;
  });

  container.innerHTML = `
    <div class="section-banner">
      <div class="section-banner-title">
        <h2>Care Recipients</h2>
        <p>Manage family members receiving coordinated health assistance and daily care.</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-primary" onclick="window.FamilyCareApp.openRecipientModal()">
          <i class="fa-solid fa-user-plus"></i> Add Care Recipient
        </button>
      </div>
    </div>

    <!-- Toolbar: Search & Segmented Filters -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
      <div class="segmented-control">
        <button class="segmented-btn ${currentFilter === 'all' ? 'active' : ''}" onclick="window.FamilyCareApp.setRecipientFilter('all')">
          All Recipients (${recipients.length})
        </button>
        <button class="segmented-btn ${currentFilter === 'elderly' ? 'active' : ''}" onclick="window.FamilyCareApp.setRecipientFilter('elderly')">
          Seniors (70+)
        </button>
        <button class="segmented-btn ${currentFilter === 'mobility' ? 'active' : ''}" onclick="window.FamilyCareApp.setRecipientFilter('mobility')">
          Mobility Support
        </button>
      </div>

      <div style="position: relative; width: 280px;">
        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.82rem;"></i>
        <input
          type="text"
          class="form-control"
          placeholder="Search by name, condition..."
          value="${searchQuery}"
          oninput="window.FamilyCareApp.onRecipientSearch(this.value)"
          style="padding-left: 34px; font-size: 0.82rem;"
        />
      </div>
    </div>

    <!-- Recipients Grid -->
    ${filtered.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fa-solid fa-users-slash"></i>
        </div>
        <div class="empty-state-title">No Care Recipients Found</div>
        <div class="empty-state-desc">Try adjusting your search terms or add a new family member to coordinate care.</div>
        <button class="btn btn-primary" onclick="window.FamilyCareApp.openRecipientModal()">
          <i class="fa-solid fa-plus"></i> Add Recipient
        </button>
      </div>
    ` : `
      <div class="recipients-grid">
        ${filtered.map(r => `
          <div class="recipient-card">
            <div class="recipient-top">
              <img src="${r.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=14B8A6&color=fff&bold=true`}" alt="${r.name}" class="recipient-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=14B8A6&color=fff&bold=true'">
              <div class="recipient-header-meta">
                <h4>${r.name}</h4>
                <div class="recipient-age-gender">
                  ${r.age} yrs · ${r.gender || 'Not specified'} · <i class="fa-solid fa-door-open" style="color: var(--text-muted);"></i> ${r.room || 'Family Home'}
                </div>
              </div>
            </div>

            <!-- Conditions & Allergies Chips -->
            <div class="recipient-meta-tags">
              ${(r.conditions || []).map(c => `
                <span class="meta-chip chip-condition"><i class="fa-solid fa-notes-medical"></i> ${c}</span>
              `).join('')}
              ${(r.allergies || []).map(a => `
                <span class="meta-chip chip-allergy"><i class="fa-solid fa-triangle-exclamation"></i> Allergy: ${a}</span>
              `).join('')}
            </div>

            <!-- Mobility & Preferences Preview -->
            <div class="recipient-details-preview">
              <div style="font-weight: 600; font-size: 0.76rem; color: var(--text-primary); margin-bottom: 2px;">
                <i class="fa-solid fa-person-walking" style="color: var(--primary);"></i> Mobility Requirement:
              </div>
              <div style="font-size: 0.76rem; color: var(--text-secondary); margin-bottom: 6px;">
                ${r.mobility || 'None reported'}
              </div>
              <div style="font-weight: 600; font-size: 0.76rem; color: var(--text-primary); margin-bottom: 2px;">
                <i class="fa-solid fa-heart" style="color: var(--secondary);"></i> Care Preference:
              </div>
              <div style="font-size: 0.76rem; color: var(--text-secondary);">
                ${r.preferences ? r.preferences.substring(0, 85) + '...' : 'Standard care routines'}
              </div>
            </div>

            <!-- Action buttons -->
            <div class="recipient-card-actions">
              <button class="btn btn-secondary btn-sm" onclick="window.FamilyCareApp.viewRecipientDetails('${r.id}')">
                <i class="fa-solid fa-id-card"></i> Full Profile
              </button>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-sm btn-icon" title="Edit" onclick="window.FamilyCareApp.editRecipient('${r.id}')">
                  <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="btn btn-secondary btn-sm btn-icon" title="Delete" style="color: var(--danger);" onclick="window.FamilyCareApp.deleteRecipient('${r.id}')">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

export function setRecipientFilter(filter) {
  currentFilter = filter;
  renderRecipients();
}

export function setRecipientSearch(q) {
  searchQuery = q;
  renderRecipients();
}
