/**
 * FamilyCare – Family Care Coordination System
 * Master Application Controller & Orchestrator
 * (Complete Sign In / Sign Up Authentication + Clean Storage)
 */

import { store, STORAGE_KEYS } from './data.js';
import { renderDashboard } from './dashboard.js';
import { renderRecipients, setRecipientFilter, setRecipientSearch } from './recipients.js';
import { renderTasks, setTaskViewMode, setTaskStatusFilter, setTaskPriorityFilter, setTaskSearch } from './tasks.js';
import { renderMedications, setMedSlot, setMedRecipientFilter } from './medications.js';
import { renderAppointments, setApptViewMode, setApptFilter } from './appointments.js';
import { renderCalendar, prevMonth, nextMonth, todayMonth } from './calendar.js';
import { renderMessages, selectChatThread, sendChatMessage } from './messages.js';
import { renderReports, setReportRange, exportCareReportCSV } from './reports.js';
import { renderEmergency } from './emergency.js';
import { renderSettings } from './settings.js';

let currentSection = 'dashboard';
let confirmCallback = null;
let currentAuthTab = 'signin';

// Initialize App on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupNavListeners();
  setupGlobalSearch();
  setupMobileDrawer();
  checkAuth();
});

// =============================================================================
// Authentication & Session Management
// =============================================================================

function checkAuth() {
  const currentUser = store.getCurrentUser();
  const authScreen = document.getElementById('auth-screen');
  const appContainer = document.getElementById('app-container');

  if (!currentUser) {
    if (authScreen) authScreen.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
  } else {
    if (authScreen) authScreen.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';
    updateHeaderProfile();
    renderSection(currentSection);
    updateNotificationBadge();
  }
}

export function setAuthTab(tab) {
  currentAuthTab = tab;
  const signinTab = document.getElementById('auth-tab-signin');
  const signupTab = document.getElementById('auth-tab-signup');
  const signinForm = document.getElementById('form-signin');
  const signupForm = document.getElementById('form-signup');
  const alertBox = document.getElementById('auth-alert');

  if (alertBox) alertBox.classList.remove('show');

  if (tab === 'signin') {
    if (signinTab) signinTab.classList.add('active');
    if (signupTab) signupTab.classList.remove('active');
    if (signinForm) signinForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
  } else {
    if (signinTab) signinTab.classList.remove('active');
    if (signupTab) signupTab.classList.add('active');
    if (signinForm) signinForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
  }
}

export function handleSignIn(e) {
  e.preventDefault();
  const emailInput = document.getElementById('signin-email');
  const passInput = document.getElementById('signin-password');
  const alertBox = document.getElementById('auth-alert');

  const email = emailInput.value.trim();
  const password = passInput.value;

  const res = store.signIn({ email, password });
  if (res.success) {
    if (alertBox) alertBox.classList.remove('show');
    showToast(`Welcome back, ${res.user.name}!`, 'success');
    checkAuth();
  } else {
    if (alertBox) {
      alertBox.textContent = res.error;
      alertBox.classList.add('show');
    }
  }
}

export function handleSignUp(e) {
  e.preventDefault();
  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const passInput = document.getElementById('signup-password');
  const confirmPassInput = document.getElementById('signup-confirm-password');
  const roleInput = document.getElementById('signup-role');
  const phoneInput = document.getElementById('signup-phone');
  const alertBox = document.getElementById('auth-alert');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passInput.value;
  const confirmPass = confirmPassInput.value;
  const role = roleInput.value.trim() || 'Primary Caregiver';
  const phone = phoneInput.value.trim();

  if (password.length < 6) {
    if (alertBox) {
      alertBox.textContent = 'Password must be at least 6 characters in length.';
      alertBox.classList.add('show');
    }
    return;
  }

  if (password !== confirmPass) {
    if (alertBox) {
      alertBox.textContent = 'Passwords do not match. Please re-enter.';
      alertBox.classList.add('show');
    }
    return;
  }

  const res = store.signUp({ name, email, password, role, phone });
  if (res.success) {
    if (alertBox) alertBox.classList.remove('show');
    showToast(`Account created! Welcome to FamilyCare, ${res.user.name}.`, 'success');
    checkAuth();
  } else {
    if (alertBox) {
      alertBox.textContent = res.error;
      alertBox.classList.add('show');
    }
  }
}

export function signOut() {
  store.signOut();
  showToast('You have been signed out.', 'info');
  checkAuth();
}

export function quickDemoSignIn() {
  const users = store.getUsers();
  if (users.length > 0) {
    store.setCurrentUser(users[0]);
    showToast(`Signed in as ${users[0].name}`, 'success');
    checkAuth();
  } else {
    const res = store.signUp({
      name: 'Sarah Miller',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'Primary Caregiver',
      phone: '(555) 234-5678'
    });
    showToast(`Signed in as ${res.user.name}`, 'success');
    checkAuth();
  }
}

// =============================================================================
// Section Navigation
// =============================================================================

function navigateTo(sectionId) {
  currentSection = sectionId;

  // Update sidebar active link
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-section') === sectionId);
  });

  // Update section visibility
  document.querySelectorAll('.view-section').forEach(el => {
    el.classList.remove('active');
  });

  const targetView = document.getElementById(`${sectionId}-view`);
  if (targetView) targetView.classList.add('active');

  const titles = {
    dashboard: 'Care Overview',
    recipients: 'Care Recipients',
    tasks: 'Tasks & Responsibilities',
    medications: 'Medication Tracker',
    appointments: 'Appointments & Consultations',
    calendar: 'Family Calendar',
    messages: 'Family Care Messages',
    reports: 'Care Reports & Analytics',
    emergency: 'Emergency Contacts & Directives',
    settings: 'Settings & Profile'
  };

  const titleEl = document.getElementById('page-title-text');
  const breadcrumbEl = document.getElementById('page-breadcrumb-text');
  if (titleEl) titleEl.textContent = titles[sectionId] || 'Dashboard';
  if (breadcrumbEl) breadcrumbEl.textContent = titles[sectionId] || 'Overview';

  renderSection(sectionId);
  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderSection(sectionId) {
  switch (sectionId) {
    case 'dashboard': renderDashboard(); break;
    case 'recipients': renderRecipients(); break;
    case 'tasks': renderTasks(); break;
    case 'medications': renderMedications(); break;
    case 'appointments': renderAppointments(); break;
    case 'calendar': renderCalendar(); break;
    case 'messages': renderMessages(); break;
    case 'reports': renderReports(); break;
    case 'emergency': renderEmergency(); break;
    case 'settings': renderSettings(); break;
    default: renderDashboard();
  }
}

function setupNavListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.getAttribute('data-section');
      if (section) navigateTo(section);
    });
  });
}

function setupGlobalSearch() {
  const searchInput = document.getElementById('global-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    if (!val) return;

    if (currentSection !== 'tasks' && currentSection !== 'recipients' && currentSection !== 'medications') {
      navigateTo('tasks');
    }

    if (currentSection === 'tasks') setTaskSearch(val);
    else if (currentSection === 'recipients') setRecipientSearch(val);
  });
}

function setupMobileDrawer() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (menuBtn && sidebar && backdrop) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('show');
    });

    backdrop.addEventListener('click', closeMobileSidebar);
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('show');
}

// Notifications Dropdown
export function toggleNotifications() {
  const dropdown = document.getElementById('notifications-dropdown');
  if (!dropdown) return;

  const isShowing = dropdown.classList.contains('show');
  document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('show'));

  if (!isShowing) {
    dropdown.classList.add('show');
    renderNotificationsDropdown();
  }
}

function renderNotificationsDropdown() {
  const listEl = document.getElementById('notifications-dropdown-list');
  if (!listEl) return;

  const notifs = store.getNotifications();
  if (notifs.length === 0) {
    listEl.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No new notifications</div>`;
    return;
  }

  listEl.innerHTML = notifs.map(n => `
    <div class="dropdown-item ${n.unread ? 'unread' : ''}">
      <div style="font-size: 1rem; color: var(--primary); margin-top: 2px;">
        ${n.type === 'medication' ? '<i class="fa-solid fa-pills"></i>' : (n.type === 'task' ? '<i class="fa-solid fa-list-check"></i>' : '<i class="fa-regular fa-bell"></i>')}
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary);">${n.title}</div>
        <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 2px;">${n.message}</div>
        <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">${n.time}</div>
      </div>
    </div>
  `).join('');
}

export function markNotificationsAsRead() {
  store.markAllNotificationsRead();
  renderNotificationsDropdown();
  updateNotificationBadge();
  showToast('All notifications marked as read', 'info');
}

function updateNotificationBadge() {
  const badge = document.getElementById('notif-badge-counter');
  if (!badge) return;

  const unreadCount = store.getNotifications().filter(n => n.unread).length;
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

export function toggleProfileMenu() {
  const dropdown = document.getElementById('profile-dropdown');
  if (!dropdown) return;

  const isShowing = dropdown.classList.contains('show');
  document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('show'));

  if (!isShowing) dropdown.classList.add('show');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.header-btn') && !e.target.closest('.profile-pill') && !e.target.closest('.dropdown-menu')) {
    document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('show'));
  }
});

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-xmark',
    warning: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info} toast-icon"></i>
    <span class="toast-msg">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

export function showConfirm(title, message, onConfirm) {
  const modal = document.getElementById('modal-confirm');
  const titleEl = document.getElementById('confirm-modal-title');
  const msgEl = document.getElementById('confirm-modal-msg');
  if (!modal) return;

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  confirmCallback = onConfirm;

  modal.classList.add('show');
}

export function confirmAction() {
  if (typeof confirmCallback === 'function') {
    confirmCallback();
  }
  closeModal('modal-confirm');
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('show');
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('show');
}

function initTheme() {
  const settings = store.getSettings();
  const theme = settings.theme || 'light';
  setTheme(theme, false);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next, true);
}

export function setTheme(theme, save = true) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  }

  const themeIcon = document.getElementById('theme-toggle-icon');
  if (themeIcon) {
    themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }

  if (save) {
    const s = store.getSettings();
    s.theme = theme;
    store.saveSettings(s);
    showToast(`Switched to ${theme} theme`, 'info');
  }
}

function updateHeaderProfile() {
  const currentUser = store.getCurrentUser();
  if (!currentUser) return;

  const nameEls = document.querySelectorAll('.user-display-name');
  const roleEls = document.querySelectorAll('.user-display-role');
  const emailEls = document.querySelectorAll('.user-display-email');
  const avatarEls = document.querySelectorAll('.user-display-avatar');

  nameEls.forEach(el => el.textContent = currentUser.name);
  roleEls.forEach(el => el.textContent = currentUser.role);
  emailEls.forEach(el => el.textContent = currentUser.email);
  avatarEls.forEach(el => {
    if (el.tagName === 'IMG') {
      el.src = currentUser.avatar;
    }
  });
}

// =============================================================================
// CRUD Operations
// =============================================================================

export function toggleTaskStatus(taskId) {
  const tasks = store.getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const wasDone = task.status === 'Completed';
  task.status = wasDone ? 'Pending' : 'Completed';
  task.completedAt = wasDone ? null : new Date().toISOString();

  store.saveTask(task);

  if (!wasDone) {
    store.addNotification({
      title: 'Task Completed',
      message: `${task.assignedToName} completed "${task.title}".`,
      time: 'Just now',
      type: 'task'
    });
    showToast(`Task marked as completed!`, 'success');
  } else {
    showToast(`Task reopened`, 'info');
  }

  renderSection(currentSection);
  updateNotificationBadge();
}

export function updateTaskStatus(taskId, newStatus) {
  const tasks = store.getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = newStatus;
  task.completedAt = newStatus === 'Completed' ? new Date().toISOString() : null;
  store.saveTask(task);
  showToast(`Task status updated to ${newStatus}`, 'success');
  renderSection(currentSection);
}

export function openTaskModal(taskId = null) {
  const modal = document.getElementById('modal-add-task');
  const form = document.getElementById('form-add-task');
  const titleEl = document.getElementById('task-modal-title');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('task-id-hidden').value = '';

  const recipients = store.getRecipients();
  const family = store.getFamilyMembers();

  populateDropdown('task-recipient-select', recipients, 'name', 'id', 'Select Care Recipient');
  populateDropdown('task-assignee-select', family, 'name', 'id', 'Assign Caregiver');

  if (taskId) {
    const task = store.getTasks().find(t => t.id === taskId);
    if (task) {
      titleEl.textContent = 'Edit Care Task';
      document.getElementById('task-id-hidden').value = task.id;
      document.getElementById('task-title-input').value = task.title;
      document.getElementById('task-desc-input').value = task.description || '';
      document.getElementById('task-recipient-select').value = task.recipientId;
      document.getElementById('task-assignee-select').value = task.assignedToId;
      document.getElementById('task-priority-select').value = task.priority;
      document.getElementById('task-due-date').value = task.dueDate || '';
      document.getElementById('task-due-time').value = task.dueTime || '';
    }
  } else {
    titleEl.textContent = 'Create New Care Task';
    document.getElementById('task-due-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('task-due-time').value = '10:00';
  }

  modal.classList.add('show');
}

export function saveTaskForm(e) {
  e.preventDefault();
  const id = document.getElementById('task-id-hidden').value;
  const title = document.getElementById('task-title-input').value.trim();
  const description = document.getElementById('task-desc-input').value.trim();
  const recipientSelect = document.getElementById('task-recipient-select');
  const assigneeSelect = document.getElementById('task-assignee-select');
  const priority = document.getElementById('task-priority-select').value;
  const dueDate = document.getElementById('task-due-date').value;
  const dueTime = document.getElementById('task-due-time').value;

  const recipientId = recipientSelect.value;
  const recipientName = recipientSelect.options[recipientSelect.selectedIndex]?.text || 'General Care';
  const assignedToId = assigneeSelect.value;
  const assignedToName = assigneeSelect.options[assigneeSelect.selectedIndex]?.text || 'Caregiver';

  const existing = id ? store.getTasks().find(t => t.id === id) : null;

  const taskObj = {
    id: id || undefined,
    title,
    description,
    recipientId,
    recipientName,
    assignedToId,
    assignedToName,
    priority,
    status: existing ? existing.status : 'Pending',
    dueDate,
    dueTime,
    completedAt: existing ? existing.completedAt : null
  };

  store.saveTask(taskObj);
  closeModal('modal-add-task');
  showToast(id ? 'Task updated successfully' : 'Care task scheduled!', 'success');
  renderSection(currentSection);
}

export function editTask(id) {
  openTaskModal(id);
}

export function deleteTask(id) {
  showConfirm(
    'Delete Care Task',
    'Are you sure you want to remove this care task? This action cannot be undone.',
    () => {
      store.deleteTask(id);
      showToast('Task removed from schedule', 'info');
      renderSection(currentSection);
    }
  );
}

// Recipients CRUD
export function openRecipientModal(recId = null) {
  const modal = document.getElementById('modal-add-recipient');
  const form = document.getElementById('form-add-recipient');
  const titleEl = document.getElementById('recipient-modal-title');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('recipient-id-hidden').value = '';

  if (recId) {
    const r = store.getRecipients().find(item => item.id === recId);
    if (r) {
      titleEl.textContent = 'Edit Care Recipient';
      document.getElementById('recipient-id-hidden').value = r.id;
      document.getElementById('recipient-name-input').value = r.name;
      document.getElementById('recipient-dob-input').value = r.dob || '';
      document.getElementById('recipient-age-input').value = r.age || '';
      document.getElementById('recipient-gender-select').value = r.gender || 'Female';
      document.getElementById('recipient-phone-input').value = r.phone || '';
      document.getElementById('recipient-room-input').value = r.room || '';
      document.getElementById('recipient-emg-input').value = r.emergencyContact || '';
      document.getElementById('recipient-conditions-input').value = (r.conditions || []).join(', ');
      document.getElementById('recipient-allergies-input').value = (r.allergies || []).join(', ');
      document.getElementById('recipient-mobility-input').value = r.mobility || '';
      document.getElementById('recipient-pref-input').value = r.preferences || '';
      document.getElementById('recipient-notes-input').value = r.notes || '';
    }
  } else {
    titleEl.textContent = 'Add Care Recipient';
  }

  modal.classList.add('show');
}

export function saveRecipientForm(e) {
  e.preventDefault();
  const id = document.getElementById('recipient-id-hidden').value;
  const name = document.getElementById('recipient-name-input').value.trim();
  const dob = document.getElementById('recipient-dob-input').value;
  const age = parseInt(document.getElementById('recipient-age-input').value) || 0;
  const gender = document.getElementById('recipient-gender-select').value;
  const phone = document.getElementById('recipient-phone-input').value.trim();
  const room = document.getElementById('recipient-room-input').value.trim();
  const emergencyContact = document.getElementById('recipient-emg-input').value.trim();

  const conditions = document.getElementById('recipient-conditions-input').value
    .split(',').map(s => s.trim()).filter(Boolean);
  const allergies = document.getElementById('recipient-allergies-input').value
    .split(',').map(s => s.trim()).filter(Boolean);
  const mobility = document.getElementById('recipient-mobility-input').value.trim();
  const preferences = document.getElementById('recipient-pref-input').value.trim();
  const notes = document.getElementById('recipient-notes-input').value.trim();

  const initials = encodeURIComponent(name);
  const recipientObj = {
    id: id || undefined,
    name,
    dob,
    age,
    gender,
    phone,
    room,
    emergencyContact,
    conditions,
    allergies,
    mobility,
    preferences,
    notes,
    avatar: `https://ui-avatars.com/api/?name=${initials}&background=14B8A6&color=fff&bold=true`
  };

  store.saveRecipient(recipientObj);
  closeModal('modal-add-recipient');
  showToast(id ? 'Recipient profile updated' : 'New care recipient added!', 'success');
  renderSection(currentSection);
}

export function editRecipient(id) {
  openRecipientModal(id);
}

export function deleteRecipient(id) {
  showConfirm(
    'Delete Care Recipient Profile',
    'Are you sure you want to remove this family member from care tracking? Associated tasks and records will remain archived.',
    () => {
      store.deleteRecipient(id);
      showToast('Recipient profile deleted', 'info');
      renderSection(currentSection);
    }
  );
}

export function viewRecipientDetails(id) {
  const r = store.getRecipients().find(item => item.id === id);
  if (!r) return;

  const modal = document.getElementById('modal-view-recipient');
  const body = document.getElementById('view-recipient-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 20px;">
      <img src="${r.avatar}" alt="${r.name}" style="width: 76px; height: 76px; border-radius: var(--radius-full); object-fit: cover; border: 3px solid var(--primary);">
      <div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${r.name}</h3>
        <div style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 2px;">
          ${r.age} years old · ${r.gender || 'Not specified'} · DOB: ${r.dob || 'N/A'}
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
          <i class="fa-solid fa-location-dot" style="color: var(--primary);"></i> ${r.room || 'Residence'} · Phone: ${r.phone || 'N/A'}
        </div>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.84rem;">
      <div style="background-color: var(--bg-hover); padding: 12px; border-radius: var(--radius-md);">
        <strong style="color: var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Known Drug & Food Allergies:</strong>
        <div style="margin-top: 4px; font-weight: 600; color: var(--text-primary);">
          ${(r.allergies && r.allergies.length) ? r.allergies.join(', ') : 'None documented'}
        </div>
      </div>

      <div style="background-color: var(--bg-hover); padding: 12px; border-radius: var(--radius-md);">
        <strong style="color: var(--primary);"><i class="fa-solid fa-file-medical"></i> Diagnosed Medical Conditions:</strong>
        <div style="margin-top: 4px;">
          ${(r.conditions && r.conditions.length) ? r.conditions.join(' · ') : 'None recorded'}
        </div>
      </div>

      <div style="background-color: var(--bg-hover); padding: 12px; border-radius: var(--radius-md);">
        <strong style="color: var(--text-primary);"><i class="fa-solid fa-person-walking"></i> Mobility Requirements & Assistance:</strong>
        <div style="margin-top: 4px; color: var(--text-secondary);">
          ${r.mobility || 'Fully independent mobility'}
        </div>
      </div>

      <div style="background-color: var(--bg-hover); padding: 12px; border-radius: var(--radius-md);">
        <strong style="color: var(--secondary);"><i class="fa-solid fa-heart"></i> Daily Care Preferences:</strong>
        <div style="margin-top: 4px; color: var(--text-secondary);">
          ${r.preferences || 'Standard daily care routines'}
        </div>
      </div>

      <div style="background-color: var(--bg-hover); padding: 12px; border-radius: var(--radius-md);">
        <strong style="color: var(--text-primary);"><i class="fa-solid fa-phone-volume"></i> Emergency Contact:</strong>
        <div style="margin-top: 4px; color: var(--text-secondary);">
          ${r.emergencyContact || 'Family Primary Caregiver'}
        </div>
      </div>

      ${r.notes ? `
        <div style="background-color: var(--bg-hover); padding: 12px; border-radius: var(--radius-md);">
          <strong style="color: var(--text-primary);"><i class="fa-regular fa-note-sticky"></i> Clinical & Caregiver Notes:</strong>
          <div style="margin-top: 4px; color: var(--text-secondary); font-style: italic;">
            ${r.notes}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.add('show');
}

// Medications CRUD & Dose Logger
export function openMedModal(medId = null) {
  const modal = document.getElementById('modal-add-med');
  const form = document.getElementById('form-add-med');
  const titleEl = document.getElementById('med-modal-title');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('med-id-hidden').value = '';

  const recipients = store.getRecipients();
  const family = store.getFamilyMembers();

  populateDropdown('med-recipient-select', recipients, 'name', 'id', 'Select Care Recipient');
  populateDropdown('med-caregiver-select', family, 'name', 'name', 'Select Administering Caregiver');

  if (medId) {
    const m = store.getMedications().find(item => item.id === medId);
    if (m) {
      titleEl.textContent = 'Edit Medication';
      document.getElementById('med-id-hidden').value = m.id;
      document.getElementById('med-name-input').value = m.name;
      document.getElementById('med-dosage-input').value = m.dosage;
      document.getElementById('med-recipient-select').value = m.recipientId;
      document.getElementById('med-timeslot-select').value = m.timeSlot || 'Morning';
      document.getElementById('med-sched-time').value = m.scheduledTime || '08:00';
      document.getElementById('med-frequency-input').value = m.frequency || 'Once Daily';
      document.getElementById('med-instructions-input').value = m.instructions || '';
      document.getElementById('med-caregiver-select').value = m.assignedCaregiver || '';
    }
  } else {
    titleEl.textContent = 'Add Prescription Medication';
    document.getElementById('med-sched-time').value = '08:00';
  }

  modal.classList.add('show');
}

export function saveMedForm(e) {
  e.preventDefault();
  const id = document.getElementById('med-id-hidden').value;
  const name = document.getElementById('med-name-input').value.trim();
  const dosage = document.getElementById('med-dosage-input').value.trim();
  const recipientSelect = document.getElementById('med-recipient-select');
  const timeSlot = document.getElementById('med-timeslot-select').value;
  const scheduledTime = document.getElementById('med-sched-time').value;
  const frequency = document.getElementById('med-frequency-input').value.trim();
  const instructions = document.getElementById('med-instructions-input').value.trim();
  const caregiverSelect = document.getElementById('med-caregiver-select');

  const recipientId = recipientSelect.value;
  const recipientName = recipientSelect.options[recipientSelect.selectedIndex]?.text || 'Care Recipient';
  const assignedCaregiver = caregiverSelect.value || store.getCurrentUser()?.name || 'Caregiver';

  const existing = id ? store.getMedications().find(m => m.id === id) : null;

  const medObj = {
    id: id || undefined,
    name,
    dosage,
    recipientId,
    recipientName,
    timeSlot,
    scheduledTime,
    frequency,
    startDate: existing?.startDate || new Date().toISOString().split('T')[0],
    endDate: existing?.endDate || '2028-12-31',
    instructions,
    assignedCaregiver,
    status: existing?.status || 'Scheduled',
    lastAdministered: existing?.lastAdministered || null
  };

  store.saveMedication(medObj);
  closeModal('modal-add-med');
  showToast(id ? 'Medication updated' : 'Medication scheduled successfully!', 'success');
  renderSection(currentSection);
}

export function editMedication(id) {
  openMedModal(id);
}

export function deleteMedication(id) {
  showConfirm(
    'Delete Medication Record',
    'Are you sure you want to remove this medication from daily schedules? Prior administration logs will remain intact.',
    () => {
      store.deleteMedication(id);
      showToast('Medication deleted', 'info');
      renderSection(currentSection);
    }
  );
}

export function openDoseLogModal(medId) {
  const med = store.getMedications().find(m => m.id === medId);
  if (!med) return;

  const modal = document.getElementById('modal-log-dose');
  if (!modal) return;

  document.getElementById('log-med-id').value = med.id;
  document.getElementById('log-med-name-display').textContent = `${med.name} (${med.dosage})`;
  document.getElementById('log-recipient-display').textContent = `For: ${med.recipientName}`;
  document.getElementById('log-notes-input').value = '';

  modal.classList.add('show');
}

export function saveDoseLogForm(e) {
  e.preventDefault();
  const medId = document.getElementById('log-med-id').value;
  const status = document.getElementById('log-status-select').value;
  const notes = document.getElementById('log-notes-input').value.trim();

  const med = store.getMedications().find(m => m.id === medId);
  if (!med) return;

  const currentUser = store.getCurrentUser();

  store.addMedicationLog({
    medicationId: med.id,
    medicationName: `${med.name} ${med.dosage}`,
    recipientName: med.recipientName,
    administeredBy: currentUser?.name || 'Caregiver',
    status: status,
    notes: notes || `Routine ${status.toLowerCase()} dose`
  });

  med.status = status;
  if (status === 'Administered') med.lastAdministered = new Date().toISOString();
  store.saveMedication(med);

  closeModal('modal-log-dose');
  showToast(`Medication logged as ${status}`, status === 'Administered' ? 'success' : 'warning');
  renderSection(currentSection);
}

// Appointments CRUD
export function openAppointmentModal(apptId = null) {
  const modal = document.getElementById('modal-add-appointment');
  const form = document.getElementById('form-add-appointment');
  const titleEl = document.getElementById('appt-modal-title');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('appt-id-hidden').value = '';

  const recipients = store.getRecipients();
  const family = store.getFamilyMembers();

  populateDropdown('appt-recipient-select', recipients, 'name', 'id', 'Select Care Recipient');
  populateDropdown('appt-companion-select', family, 'name', 'name', 'Select Accompanying Family Member');

  if (apptId) {
    const a = store.getAppointments().find(item => item.id === apptId);
    if (a) {
      titleEl.textContent = 'Edit Appointment';
      document.getElementById('appt-id-hidden').value = a.id;
      document.getElementById('appt-title-input').value = a.title;
      document.getElementById('appt-provider-input').value = a.provider;
      document.getElementById('appt-specialty-input').value = a.specialty || '';
      document.getElementById('appt-recipient-select').value = a.recipientId;
      document.getElementById('appt-companion-select').value = a.accompanyingName;
      document.getElementById('appt-date-input').value = a.date;
      document.getElementById('appt-time-input').value = a.time;
      document.getElementById('appt-location-input').value = a.location;
      document.getElementById('appt-notes-input').value = a.notes || '';
    }
  } else {
    titleEl.textContent = 'Schedule Doctor Appointment';
    document.getElementById('appt-date-input').value = new Date().toISOString().split('T')[0];
    document.getElementById('appt-time-input').value = '10:00';
  }

  modal.classList.add('show');
}

export function saveAppointmentForm(e) {
  e.preventDefault();
  const id = document.getElementById('appt-id-hidden').value;
  const title = document.getElementById('appt-title-input').value.trim();
  const provider = document.getElementById('appt-provider-input').value.trim();
  const specialty = document.getElementById('appt-specialty-input').value.trim();
  const recipientSelect = document.getElementById('appt-recipient-select');
  const companionSelect = document.getElementById('appt-companion-select');
  const date = document.getElementById('appt-date-input').value;
  const time = document.getElementById('appt-time-input').value;
  const location = document.getElementById('appt-location-input').value.trim();
  const notes = document.getElementById('appt-notes-input').value.trim();

  const recipientId = recipientSelect.value;
  const recipientName = recipientSelect.options[recipientSelect.selectedIndex]?.text || 'Care Recipient';
  const accompanyingName = companionSelect.value || store.getCurrentUser()?.name || 'Self';

  const existing = id ? store.getAppointments().find(a => a.id === id) : null;

  const apptObj = {
    id: id || undefined,
    title,
    provider,
    specialty,
    recipientId,
    recipientName,
    accompanyingId: 'fam_companion',
    accompanyingName,
    date,
    time,
    location,
    notes,
    status: existing?.status || 'Upcoming'
  };

  store.saveAppointment(apptObj);
  closeModal('modal-add-appointment');
  showToast(id ? 'Appointment details updated' : 'Appointment scheduled and synced!', 'success');
  renderSection(currentSection);
}

export function editAppointment(id) {
  openAppointmentModal(id);
}

export function deleteAppointment(id) {
  showConfirm(
    'Cancel Appointment',
    'Are you sure you want to delete this scheduled doctor visit?',
    () => {
      store.deleteAppointment(id);
      showToast('Appointment removed', 'info');
      renderSection(currentSection);
    }
  );
}

export function toggleApptCompleted(id) {
  const appts = store.getAppointments();
  const a = appts.find(item => item.id === id);
  if (!a) return;

  a.status = a.status === 'Completed' ? 'Upcoming' : 'Completed';
  store.saveAppointment(a);
  showToast(`Appointment status changed to ${a.status}`, 'success');
  renderSection(currentSection);
}

// Calendar Events & Drilldown
export function openCalendarEventModal() {
  const modal = document.getElementById('modal-add-calendar-event');
  const form = document.getElementById('form-add-calendar-event');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('cal-event-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('cal-event-time').value = '14:00';
  modal.classList.add('show');
}

export function saveCalendarEventForm(e) {
  e.preventDefault();
  const title = document.getElementById('cal-event-title').value.trim();
  const category = document.getElementById('cal-event-category').value;
  const date = document.getElementById('cal-event-date').value;
  const time = document.getElementById('cal-event-time').value;
  const recipient = document.getElementById('cal-event-recipient').value.trim() || 'All Family';
  const caregiver = document.getElementById('cal-event-caregiver').value.trim() || (store.getCurrentUser()?.name || 'Caregiver');
  const details = document.getElementById('cal-event-details').value.trim();

  store.saveCalendarEvent({
    title,
    category,
    date,
    time,
    recipient,
    caregiver,
    details
  });

  closeModal('modal-add-calendar-event');
  showToast('Calendar event added successfully', 'success');
  renderSection('calendar');
}

export function openDateEventsModal(dateKey) {
  const modal = document.getElementById('modal-view-date-events');
  const body = document.getElementById('view-date-events-body');
  const titleEl = document.getElementById('view-date-events-title');
  if (!modal || !body) return;

  if (titleEl) titleEl.textContent = `Schedule for ${dateKey}`;

  const tasks = store.getTasks().filter(t => t.dueDate === dateKey);
  const appts = store.getAppointments().filter(a => a.date === dateKey);
  const calEvents = store.getCalendarEvents().filter(e => e.date === dateKey);

  const total = tasks.length + appts.length + calEvents.length;

  if (total === 0) {
    body.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 32px 16px;">
        <i class="fa-regular fa-calendar-check" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
        No specific events or tasks scheduled for ${dateKey}.
      </div>
    `;
  } else {
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${appts.map(a => `
          <div style="padding: 12px; background-color: var(--primary-light); border: 1px solid rgba(37,99,235,0.2); border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--primary); font-size: 0.88rem;">
              <span><i class="fa-solid fa-stethoscope"></i> ${a.title}</span>
              <span class="tabular-nums">${a.time}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Provider: ${a.provider} · For ${a.recipientName}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">Companion: ${a.accompanyingName} · Location: ${a.location}</div>
          </div>
        `).join('')}

        ${tasks.map(t => `
          <div style="padding: 12px; background-color: var(--warning-light); border: 1px solid rgba(245,158,11,0.25); border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--warning); font-size: 0.88rem;">
              <span><i class="fa-solid fa-list-check"></i> ${t.title}</span>
              <span class="tabular-nums">${t.dueTime || 'Anytime'}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">${t.description || ''}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">For ${t.recipientName} · Assigned to ${t.assignedToName} · Priority: ${t.priority}</div>
          </div>
        `).join('')}

        ${calEvents.map(e => `
          <div style="padding: 12px; background-color: var(--bg-hover); border: 1px solid var(--border); border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--text-primary); font-size: 0.88rem;">
              <span><i class="fa-solid fa-calendar-day" style="color: #8B5CF6;"></i> ${e.title}</span>
              <span class="tabular-nums">${e.time || ''}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">${e.details || ''}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">Participant: ${e.recipient} · Caregiver: ${e.caregiver}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  modal.classList.add('show');
}

// Emergency Contacts CRUD
export function openEmergencyModal(emgId = null) {
  const modal = document.getElementById('modal-add-emergency');
  const form = document.getElementById('form-add-emergency');
  const titleEl = document.getElementById('emergency-modal-title');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('emg-id-hidden').value = '';

  if (emgId) {
    const c = store.getEmergencyContacts().find(item => item.id === emgId);
    if (c) {
      titleEl.textContent = 'Edit Emergency Contact';
      document.getElementById('emg-id-hidden').value = c.id;
      document.getElementById('emg-name-input').value = c.name;
      document.getElementById('emg-rel-input').value = c.relationship;
      document.getElementById('emg-phone-input').value = c.phone;
      document.getElementById('emg-hospital-input').value = c.hospital || '';
      document.getElementById('emg-mednotes-input').value = c.medicalNotes || '';
      document.getElementById('emg-instr-input').value = c.instructions || '';
    }
  } else {
    titleEl.textContent = 'Add Emergency Contact';
  }

  modal.classList.add('show');
}

export function saveEmergencyForm(e) {
  e.preventDefault();
  const id = document.getElementById('emg-id-hidden').value;
  const name = document.getElementById('emg-name-input').value.trim();
  const relationship = document.getElementById('emg-rel-input').value.trim();
  const phone = document.getElementById('emg-phone-input').value.trim();
  const hospital = document.getElementById('emg-hospital-input').value.trim();
  const medicalNotes = document.getElementById('emg-mednotes-input').value.trim();
  const instructions = document.getElementById('emg-instr-input').value.trim();

  store.saveEmergencyContact({
    id: id || undefined,
    name,
    relationship,
    phone,
    hospital,
    medicalNotes,
    instructions
  });

  closeModal('modal-add-emergency');
  showToast(id ? 'Emergency contact updated' : 'Emergency contact added', 'success');
  renderSection(currentSection);
}

export function editEmergencyContact(id) {
  openEmergencyModal(id);
}

export function deleteEmergencyContact(id) {
  showConfirm(
    'Delete Emergency Contact',
    'Are you sure you want to remove this emergency contact?',
    () => {
      store.deleteEmergencyContact(id);
      showToast('Emergency contact removed', 'info');
      renderSection(currentSection);
    }
  );
}

// Add Family Caregiver Modal & Handler
export function openAddFamilyModal() {
  const modal = document.getElementById('modal-add-family');
  const form = document.getElementById('form-add-family');
  if (!modal || !form) return;
  form.reset();
  modal.classList.add('show');
}

export function saveFamilyMemberForm(e) {
  e.preventDefault();
  const name = document.getElementById('family-member-name').value.trim();
  const relation = document.getElementById('family-member-relation').value.trim();
  const email = document.getElementById('family-member-email').value.trim();
  const phone = document.getElementById('family-member-phone').value.trim();

  const initials = encodeURIComponent(name);
  store.addFamilyMember({
    name,
    relation: relation || 'Caregiver',
    email,
    phone,
    avatar: `https://ui-avatars.com/api/?name=${initials}&background=2563EB&color=fff&bold=true`,
    status: 'active',
    completedTasksCount: 0,
    totalAssignedTasks: 0
  });

  closeModal('modal-add-family');
  showToast(`Caregiver ${name} added to family circle!`, 'success');
  renderSection(currentSection);
}

// Settings Handlers
export function saveProfileSettings(e) {
  e.preventDefault();
  const currentUser = store.getCurrentUser();
  if (!currentUser) return;

  currentUser.name = document.getElementById('setting-user-name').value.trim();
  currentUser.role = document.getElementById('setting-user-role').value.trim();
  currentUser.phone = document.getElementById('setting-user-phone').value.trim();
  currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563EB&color=fff&bold=true`;

  store.setCurrentUser(currentUser);

  // Update in Users table
  const users = store.getUsers();
  const uIdx = users.findIndex(u => u.id === currentUser.id);
  if (uIdx >= 0) {
    users[uIdx] = { ...users[uIdx], ...currentUser };
    store.set(STORAGE_KEYS.USERS, users);
  }

  // Update in Family Members list
  const family = store.getFamilyMembers();
  const fIdx = family.findIndex(f => f.userId === currentUser.id || f.email === currentUser.email);
  if (fIdx >= 0) {
    family[fIdx].name = currentUser.name;
    family[fIdx].relation = currentUser.role;
    family[fIdx].phone = currentUser.phone;
    family[fIdx].avatar = currentUser.avatar;
    store.set(STORAGE_KEYS.FAMILY, family);
  }

  updateHeaderProfile();
  showToast('Profile settings saved successfully!', 'success');
}

export function updateNotificationPrefs() {
  const s = store.getSettings();
  s.notifications = {
    taskReminders: document.getElementById('notif-pref-tasks')?.checked ?? true,
    medicationAlerts: document.getElementById('notif-pref-meds')?.checked ?? true,
    appointmentAlerts: document.getElementById('notif-pref-appts')?.checked ?? true,
    familyChatMessages: document.getElementById('notif-pref-msgs')?.checked ?? true
  };
  store.saveSettings(s);
  showToast('Notification preferences updated', 'info');
}

export function setLanguage(lang) {
  const s = store.getSettings();
  s.language = lang;
  store.saveSettings(s);
  showToast(`Language set to ${lang.toUpperCase()}`, 'info');
}

export function clearAllData() {
  showConfirm(
    'Clear All Care Data',
    'This will erase all care recipients, tasks, medications, logs, and appointments. Your user account will remain. Are you sure?',
    () => {
      store.clearExampleData();
      showToast('All care records have been cleared', 'info');
      renderSection('dashboard');
    }
  );
}

function populateDropdown(selectId, items, labelProp, valProp, placeholderText = null) {
  const el = document.getElementById(selectId);
  if (!el) return;

  let optionsHtml = '';
  if (placeholderText) {
    optionsHtml += `<option value="" disabled ${items.length === 0 ? 'selected' : ''}>-- ${placeholderText} --</option>`;
  }

  if (items.length === 0) {
    optionsHtml += `<option value="" disabled>(No items available yet)</option>`;
  } else {
    optionsHtml += items.map((item, idx) => `
      <option value="${item[valProp]}" ${(!placeholderText && idx === 0) ? 'selected' : ''}>${item[labelProp]}</option>
    `).join('');
  }

  el.innerHTML = optionsHtml;
}

// Global Export Object to Window for HTML event handlers
window.FamilyCareApp = {
  navigateTo,
  renderSection,
  showToast,
  showConfirm,
  confirmAction,
  openModal,
  closeModal,
  toggleTheme,
  setTheme,
  toggleNotifications,
  markNotificationsAsRead,
  toggleProfileMenu,

  // Auth
  setAuthTab,
  handleSignIn,
  handleSignUp,
  signOut,
  quickDemoSignIn,

  // Recipients
  setRecipientFilter,
  onRecipientSearch: setRecipientSearch,
  openRecipientModal,
  saveRecipientForm,
  editRecipient,
  deleteRecipient,
  viewRecipientDetails,

  // Tasks
  toggleTaskStatus,
  updateTaskStatus,
  openTaskModal,
  saveTaskForm,
  editTask,
  deleteTask,
  setTaskViewMode,
  setTaskStatusFilter,
  setTaskPriorityFilter,
  onTaskSearch: setTaskSearch,

  // Medications
  setMedSlot,
  setMedRecipientFilter,
  openMedModal,
  saveMedForm,
  editMedication,
  deleteMedication,
  openDoseLogModal,
  saveDoseLogForm,

  // Appointments
  setApptViewMode,
  setApptFilter,
  openAppointmentModal,
  saveAppointmentForm,
  editAppointment,
  deleteAppointment,
  toggleApptCompleted,

  // Calendar
  prevMonth,
  nextMonth,
  todayMonth,
  openCalendarEventModal,
  saveCalendarEventForm,
  openDateEventsModal,

  // Messages
  selectChatThread,
  sendChatMessage,
  openAddFamilyModal,
  saveFamilyMemberForm,

  // Reports
  setReportRange,
  exportCareReportCSV,

  // Emergency
  openEmergencyModal,
  saveEmergencyForm,
  editEmergencyContact,
  deleteEmergencyContact,

  // Settings
  saveProfileSettings,
  updateNotificationPrefs,
  setLanguage,
  clearAllData
};
