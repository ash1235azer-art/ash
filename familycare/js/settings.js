/**
 * FamilyCare – Family Care Coordination System
 * Settings & User Profile Module
 */

import { store } from './data.js';

export function renderSettings() {
  const container = document.getElementById('settings-view');
  if (!container) return;

  const currentUser = store.getCurrentUser();
  const settings = store.getSettings();

  const userName = currentUser?.name || 'Caregiver User';
  const userRole = currentUser?.role || 'Primary Caregiver';
  const userEmail = currentUser?.email || 'user@example.com';
  const userPhone = currentUser?.phone || '(555) 000-0000';
  const avatarUrl = currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563EB&color=fff&bold=true`;

  container.innerHTML = `
    <div class="section-banner">
      <div class="section-banner-title">
        <h2>Settings & Account</h2>
        <p>Manage your caregiver identity, notification preferences, system appearance, and session security.</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-secondary" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.3);" onclick="window.FamilyCareApp.signOut()">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
        </button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
      <!-- Profile Information Card -->
      <div class="card">
        <div class="card-header-bar">
          <div class="card-header-title">
            <i class="fa-solid fa-user-gear"></i>
            <h3>Caregiver Profile</h3>
          </div>
        </div>

        <form onsubmit="window.FamilyCareApp.saveProfileSettings(event)">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
            <img src="${avatarUrl}" alt="Profile" style="width: 72px; height: 72px; border-radius: var(--radius-full); object-fit: cover; border: 3px solid var(--primary-light);">
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 700;">${userName}</h4>
              <p style="font-size: 0.78rem; color: var(--text-secondary);">${userRole}</p>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                <i class="fa-solid fa-envelope"></i> ${userEmail}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="setting-user-name" class="form-control" value="${userName}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Caregiving Role / Family Title</label>
            <input type="text" id="setting-user-role" class="form-control" value="${userRole}" placeholder="e.g. Primary Caregiver, Daughter, Son, Nurse" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email Address (Sign In ID)</label>
              <input type="email" id="setting-user-email" class="form-control" value="${userEmail}" required readonly style="background-color: var(--bg-hover); opacity: 0.85;">
              <div class="form-hint">Email address is your unique account identifier.</div>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" id="setting-user-phone" class="form-control" value="${userPhone}">
            </div>
          </div>

          <div style="margin-top: 18px; display: flex; justify-content: space-between; align-items: center;">
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-floppy-disk"></i> Save Profile Details
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.FamilyCareApp.signOut()">
              Sign Out
            </button>
          </div>
        </form>
      </div>

      <!-- Preferences & System Information -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Notification Preferences -->
        <div class="card">
          <div class="card-header-bar">
            <div class="card-header-title">
              <i class="fa-solid fa-bell"></i>
              <h3>Notification Preferences</h3>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.85rem;">
            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <div>
                <strong>Task Due Reminders</strong>
                <div style="font-size: 0.74rem; color: var(--text-secondary);">Receive alerts 15 minutes before scheduled care activities</div>
              </div>
              <input type="checkbox" id="notif-pref-tasks" ${settings.notifications?.taskReminders !== false ? 'checked' : ''} onchange="window.FamilyCareApp.updateNotificationPrefs()">
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <div>
                <strong>Medication Administration Alerts</strong>
                <div style="font-size: 0.74rem; color: var(--text-secondary);">Notifications for scheduled prescription slots</div>
              </div>
              <input type="checkbox" id="notif-pref-meds" ${settings.notifications?.medicationAlerts !== false ? 'checked' : ''} onchange="window.FamilyCareApp.updateNotificationPrefs()">
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <div>
                <strong>Appointment Reminders</strong>
                <div style="font-size: 0.74rem; color: var(--text-secondary);">Advance clinical notices 24 hours and 2 hours prior</div>
              </div>
              <input type="checkbox" id="notif-pref-appts" ${settings.notifications?.appointmentAlerts !== false ? 'checked' : ''} onchange="window.FamilyCareApp.updateNotificationPrefs()">
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <div>
                <strong>Family Messages & Activity</strong>
                <div style="font-size: 0.74rem; color: var(--text-secondary);">Notices for newly received caregiver messages</div>
              </div>
              <input type="checkbox" id="notif-pref-msgs" ${settings.notifications?.familyChatMessages !== false ? 'checked' : ''} onchange="window.FamilyCareApp.updateNotificationPrefs()">
            </label>
          </div>
        </div>

        <!-- System & Theme Preferences -->
        <div class="card">
          <div class="card-header-bar">
            <div class="card-header-title">
              <i class="fa-solid fa-sliders"></i>
              <h3>Appearance & Data Management</h3>
            </div>
          </div>

          <div class="form-row" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Theme Mode</label>
              <select id="theme-select" class="form-control" onchange="window.FamilyCareApp.setTheme(this.value)">
                <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light Theme (Clean White)</option>
                <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark Theme (Healthcare Slate)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Display Language</label>
              <select id="language-select" class="form-control" onchange="window.FamilyCareApp.setLanguage(this.value)">
                <option value="en" selected>English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          <!-- Clear All Data Action -->
          <div style="background-color: var(--bg-hover); padding: 14px; border-radius: var(--radius-md); font-size: 0.78rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: var(--text-primary);">Reset Workspace Data</strong>
              <div style="color: var(--text-muted); font-size: 0.72rem;">Clear all created tasks, medications, and records.</div>
            </div>
            <button class="btn btn-secondary btn-sm" style="color: var(--danger);" onclick="window.FamilyCareApp.clearAllData()">
              <i class="fa-regular fa-trash-can"></i> Clear Data
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
