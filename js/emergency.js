/**
 * FamilyCare – Family Care Coordination System
 * Emergency Contacts & Critical Protocols Module
 */

import { store } from './data.js';

export function renderEmergency() {
  const container = document.getElementById('emergency-view');
  if (!container) return;

  const contacts = store.getEmergencyContacts();
  const recipients = store.getRecipients();

  container.innerHTML = `
    <!-- Critical 911 Warning Banner -->
    <div class="emergency-hero-banner">
      <div class="emergency-alert-info">
        <i class="fa-solid fa-triangle-exclamation emergency-alert-icon"></i>
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--danger); margin-bottom: 4px;">
            Life-Threatening Emergency Protocol
          </h3>
          <p style="font-size: 0.84rem; color: var(--text-primary); line-height: 1.4;">
            If any family member is experiencing acute chest pain, sudden numbness/paralysis (FAST symptoms), severe breathing difficulty, or unresponsiveness, dial <strong>911</strong> immediately. Do not delay emergency intervention.
          </p>
        </div>
      </div>
      <a href="tel:911" class="btn btn-danger" style="font-size: 1rem; padding: 12px 24px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);">
        <i class="fa-solid fa-phone-volume"></i> Call 911 Now
      </a>
    </div>

    <!-- Section Title & Add Action -->
    <div class="section-banner">
      <div class="section-banner-title">
        <h2>Emergency Contacts & Medical Directives</h2>
        <p>Immediate access to physicians, hospital trauma departments, power-of-attorney proxies, and allergy alerts.</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-primary" onclick="window.FamilyCareApp.openEmergencyModal()">
          <i class="fa-solid fa-plus"></i> Add Emergency Contact
        </button>
      </div>
    </div>

    <!-- Quick Critical Allergy Summary Box for All Recipients -->
    <div class="card" style="margin-bottom: 24px; border-color: rgba(239, 68, 68, 0.25);">
      <div class="card-header-bar">
        <div class="card-header-title">
          <i class="fa-solid fa-hand-dots" style="color: var(--danger);"></i>
          <h3>Critical Patient Allergies & Emergency Alerts</h3>
        </div>
        <span style="font-size: 0.74rem; color: var(--text-muted);">Inform Paramedics & Hospital Staff</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
        ${recipients.length === 0 ? `
          <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.8rem; grid-column: 1 / -1;">
            No care recipients registered yet. As you add family members with known drug or food allergies, their critical alerts will appear here automatically.
          </div>
        ` : recipients.map(r => `
          <div style="background-color: var(--bg-hover); padding: 12px; border-radius: var(--radius-md); border-left: 4px solid var(--danger);">
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary); margin-bottom: 4px;">
              ${r.name} (${r.age} yrs)
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px;">
              <strong style="color: var(--danger);">Known Allergies:</strong>
              ${(r.allergies && r.allergies.length) ? r.allergies.join(', ') : 'No known drug allergies'}
            </div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">
              <strong>Key Conditions:</strong> ${(r.conditions || []).join(' · ')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Emergency Contacts Cards Grid -->
    <div class="emergency-grid">
      ${contacts.map(c => `
        <div class="emergency-card">
          <div class="emergency-top-row">
            <div>
              <div class="emergency-name">${c.name}</div>
              <div class="emergency-rel">${c.relationship}</div>
            </div>
            <div style="display: flex; gap: 4px;">
              <button class="btn btn-secondary btn-sm btn-icon" title="Edit" onclick="window.FamilyCareApp.editEmergencyContact('${c.id}')">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="btn btn-secondary btn-sm btn-icon" title="Delete" style="color: var(--danger);" onclick="window.FamilyCareApp.deleteEmergencyContact('${c.id}')">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>

          <!-- Direct Call Button (opens phone dialer) -->
          <a href="tel:${c.phone.replace(/[^0-9]/g, '')}" class="emergency-call-btn">
            <i class="fa-solid fa-phone"></i> Call ${c.phone}
          </a>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.78rem; background-color: var(--bg-hover); padding: 12px; border-radius: var(--radius-md);">
            ${c.hospital ? `
              <div>
                <span style="color: var(--text-muted); font-size: 0.72rem; display: block;">Preferred Hospital / Facility:</span>
                <strong style="color: var(--text-primary);"><i class="fa-solid fa-hospital" style="color: var(--primary);"></i> ${c.hospital}</strong>
              </div>
            ` : ''}

            ${c.medicalNotes ? `
              <div>
                <span style="color: var(--text-muted); font-size: 0.72rem; display: block;">Medical Chart Notes:</span>
                <span style="color: var(--text-secondary);">${c.medicalNotes}</span>
              </div>
            ` : ''}

            ${c.instructions ? `
              <div style="border-top: 1px solid var(--border-light); padding-top: 6px;">
                <span style="color: var(--text-muted); font-size: 0.72rem; display: block;">When to Contact:</span>
                <span style="color: var(--text-secondary); font-style: italic;">${c.instructions}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
