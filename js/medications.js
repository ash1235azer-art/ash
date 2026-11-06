/**
 * FamilyCare – Family Care Coordination System
 * Medication Tracker Module
 */

import { store } from './data.js';

let activeTimeSlot = 'all'; // 'all' | 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime'
let activeRecipientFilter = 'all';

export function renderMedications() {
  const container = document.getElementById('medications-view');
  if (!container) return;

  const meds = store.getMedications();
  const recipients = store.getRecipients();
  const medLogs = store.getMedicationLogs();

  // Filter
  const filteredMeds = meds.filter(m => {
    if (activeTimeSlot !== 'all' && m.timeSlot !== activeTimeSlot) return false;
    if (activeRecipientFilter !== 'all' && m.recipientId !== activeRecipientFilter) return false;
    return true;
  });

  container.innerHTML = `
    <div class="section-banner">
      <div class="section-banner-title">
        <h2>Medication Tracker</h2>
        <p>Monitor prescription regimens, record daily doses, and log administration history.</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-primary" onclick="window.FamilyCareApp.openMedModal()">
          <i class="fa-solid fa-plus"></i> Add Medication
        </button>
      </div>
    </div>

    <!-- Safety / Dosage Disclaimer Banner -->
    <div style="background-color: var(--secondary-light); border: 1px solid rgba(20, 184, 166, 0.3); border-radius: var(--radius-md); padding: 12px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; font-size: 0.8rem; color: var(--text-secondary);">
      <i class="fa-solid fa-shield-halved" style="color: var(--secondary); font-size: 1.15rem;"></i>
      <div>
        <strong style="color: var(--text-primary);">Caregiver Safety Notice:</strong>
        This system is an organization tracker for authorized family caregivers. Do not alter dosages without consulting your prescribing physician or pharmacist.
      </div>
    </div>

    <!-- Schedule Time Slot Tabs & Recipient Selector -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
      <div class="meds-schedule-tabs" style="margin-bottom: 0;">
        <button class="med-schedule-btn ${activeTimeSlot === 'all' ? 'active' : ''}" onclick="window.FamilyCareApp.setMedSlot('all')">
          <i class="fa-solid fa-pills"></i> All Times (${meds.length})
        </button>
        <button class="med-schedule-btn ${activeTimeSlot === 'Morning' ? 'active' : ''}" onclick="window.FamilyCareApp.setMedSlot('Morning')">
          <i class="fa-solid fa-sun" style="color: #F59E0B;"></i> Morning
        </button>
        <button class="med-schedule-btn ${activeTimeSlot === 'Afternoon' ? 'active' : ''}" onclick="window.FamilyCareApp.setMedSlot('Afternoon')">
          <i class="fa-solid fa-cloud-sun" style="color: #3B82F6;"></i> Afternoon
        </button>
        <button class="med-schedule-btn ${activeTimeSlot === 'Evening' ? 'active' : ''}" onclick="window.FamilyCareApp.setMedSlot('Evening')">
          <i class="fa-solid fa-sunset" style="color: #F97316;"></i> Evening
        </button>
        <button class="med-schedule-btn ${activeTimeSlot === 'Bedtime' ? 'active' : ''}" onclick="window.FamilyCareApp.setMedSlot('Bedtime')">
          <i class="fa-solid fa-moon" style="color: #6366F1;"></i> Bedtime
        </button>
      </div>

      <div style="display: flex; gap: 8px; align-items: center;">
        <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Filter Recipient:</label>
        <select class="form-control" style="width: auto; padding: 6px 12px; font-size: 0.8rem;" onchange="window.FamilyCareApp.setMedRecipientFilter(this.value)">
          <option value="all" ${activeRecipientFilter === 'all' ? 'selected' : ''}>All Family Members</option>
          ${recipients.map(r => `
            <option value="${r.id}" ${activeRecipientFilter === r.id ? 'selected' : ''}>${r.name}</option>
          `).join('')}
        </select>
      </div>
    </div>

    <!-- Active Medications Cards -->
    <div class="meds-grid">
      ${filteredMeds.length === 0 ? `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <i class="fa-solid fa-prescription-bottle-medical"></i>
          </div>
          <div class="empty-state-title">No Medications In This Slot</div>
          <div class="empty-state-desc">Select another time slot or add a medication to schedule daily caregiver administration.</div>
          <button class="btn btn-primary" onclick="window.FamilyCareApp.openMedModal()">
            <i class="fa-solid fa-plus"></i> Add Medication
          </button>
        </div>
      ` : filteredMeds.map(m => {
        const isAdministered = m.status === 'Administered';
        const isMissed = m.status === 'Missed';
        const isDeclined = m.status === 'Declined';

        let badgeClass = 'badge-pending';
        let badgeIcon = '<i class="fa-solid fa-clock"></i>';
        if (isAdministered) { badgeClass = 'badge-completed'; badgeIcon = '<i class="fa-solid fa-circle-check"></i>'; }
        else if (isMissed) { badgeClass = 'badge-overdue'; badgeIcon = '<i class="fa-solid fa-circle-xmark"></i>'; }
        else if (isDeclined) { badgeClass = 'badge-overdue'; badgeIcon = '<i class="fa-solid fa-ban"></i>'; }

        return `
          <div class="med-card">
            <div class="med-header">
              <div>
                <div class="med-name">${m.name}</div>
                <div class="med-dosage">${m.dosage}</div>
              </div>
              <span class="status-badge ${badgeClass}">
                ${badgeIcon} ${m.status || 'Scheduled'}
              </span>
            </div>

            <div class="med-details-list">
              <div class="med-detail-item">
                <span class="med-detail-label">Care Recipient</span>
                <span class="med-detail-val">${m.recipientName}</span>
              </div>
              <div class="med-detail-item">
                <span class="med-detail-label">Scheduled Time</span>
                <span class="med-detail-val tabular-nums">${m.scheduledTime} (${m.timeSlot})</span>
              </div>
              <div class="med-detail-item">
                <span class="med-detail-label">Frequency</span>
                <span class="med-detail-val">${m.frequency}</span>
              </div>
              <div class="med-detail-item">
                <span class="med-detail-label">Primary Caregiver</span>
                <span class="med-detail-val">${m.assignedCaregiver || 'Sarah Miller'}</span>
              </div>
            </div>

            ${m.instructions ? `
              <div class="med-instructions">
                <strong>Instructions:</strong> ${m.instructions}
              </div>
            ` : ''}

            <!-- Quick Action: Log dose -->
            <div class="med-actions-bar">
              <button class="btn ${isAdministered ? 'btn-secondary' : 'btn-primary'} btn-sm" style="flex: 1;" onclick="window.FamilyCareApp.openDoseLogModal('${m.id}')">
                <i class="fa-solid fa-clipboard-check"></i> ${isAdministered ? 'Record Another Dose' : 'Log Administration'}
              </button>
              <button class="btn btn-secondary btn-sm btn-icon" title="Edit" onclick="window.FamilyCareApp.editMedication('${m.id}')">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="btn btn-secondary btn-sm btn-icon" title="Delete" style="color: var(--danger);" onclick="window.FamilyCareApp.deleteMedication('${m.id}')">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Administration History Log -->
    <div class="card">
      <div class="card-header-bar">
        <div class="card-header-title">
          <i class="fa-solid fa-clock-rotate-left"></i>
          <h3>Recent Medication Administration Logs</h3>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Medication & Dose</th>
              <th>Recipient</th>
              <th>Administered By</th>
              <th>Status</th>
              <th>Notes / Vitals</th>
            </tr>
          </thead>
          <tbody>
            ${medLogs.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">
                  No medication administration records logged yet.
                </td>
              </tr>
            ` : medLogs.slice(0, 10).map(l => {
              const isOk = l.status === 'Administered';
              const logBadge = isOk ? 'badge-completed' : (l.status === 'Missed' ? 'badge-overdue' : 'badge-pending');
              const dateDisplay = new Date(l.timestamp).toLocaleString([], {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });
              return `
                <tr>
                  <td class="tabular-nums" style="font-size: 0.78rem; color: var(--text-secondary); white-space: nowrap;">
                    ${dateDisplay}
                  </td>
                  <td>
                    <strong style="color: var(--text-primary);">${l.medicationName}</strong>
                  </td>
                  <td>${l.recipientName}</td>
                  <td>${l.administeredBy}</td>
                  <td>
                    <span class="status-badge ${logBadge}">${l.status}</span>
                  </td>
                  <td style="font-size: 0.78rem; color: var(--text-secondary);">
                    ${l.notes || 'Routine dose administered'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function setMedSlot(slot) {
  activeTimeSlot = slot;
  renderMedications();
}

export function setMedRecipientFilter(recId) {
  activeRecipientFilter = recId;
  renderMedications();
}
