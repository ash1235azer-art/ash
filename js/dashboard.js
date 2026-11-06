/**
 * FamilyCare – Family Care Coordination System
 * Dashboard Module (Clean, Dynamic & Real Data Driven)
 */

import { store } from './data.js';

export function renderDashboard() {
  const container = document.getElementById('dashboard-view');
  if (!container) return;

  const currentUser = store.getCurrentUser();
  const tasks = store.getTasks();
  const appointments = store.getAppointments();
  const familyMembers = store.getFamilyMembers();
  const notifications = store.getNotifications();
  const medLogs = store.getMedicationLogs();

  // 1. Calculate Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const upcomingAppointments = appointments.filter(a => a.status !== 'Completed').length;

  // 2. Determine Time Greeting
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  const firstName = (currentUser?.name || 'Caregiver').split(' ')[0];

  // 3. Filter Today's Tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysSchedule = tasks
    .filter(t => !t.dueDate || t.dueDate === todayStr || t.status !== 'Completed')
    .slice(0, 6);

  // 4. Next Appointments
  const nextAppointments = appointments
    .filter(a => a.status !== 'Completed')
    .slice(0, 3);

  // 5. Family Member Progress Calculation
  const caregiverStats = familyMembers.map(member => {
    const memberTasks = tasks.filter(t => t.assignedToName === member.name || t.assignedToId === member.id);
    const completed = memberTasks.filter(t => t.status === 'Completed').length;
    const total = memberTasks.length || (member.totalAssignedTasks || 0);
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      ...member,
      completed,
      total,
      pct: Math.min(100, Math.max(0, pct))
    };
  });

  // 6. Build Recent Activity Feed from actual events (notifications & med logs)
  const activityItems = [];
  notifications.slice(0, 4).forEach(n => {
    activityItems.push({
      title: n.title,
      text: n.message,
      time: n.time || 'Recently',
      icon: n.type === 'medication' ? 'fa-pills' : (n.type === 'task' ? 'fa-list-check' : 'fa-bell')
    });
  });

  medLogs.slice(0, 3).forEach(l => {
    activityItems.push({
      title: `${l.administeredBy} logged dose`,
      text: `${l.medicationName} for ${l.recipientName} (${l.status})`,
      time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: 'fa-clipboard-check'
    });
  });

  container.innerHTML = `
    <!-- Welcome Header -->
    <div class="section-banner">
      <div class="section-banner-title">
        <h2>${greeting}, ${firstName}!</h2>
        <p>Here's your family care coordination overview.</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-secondary" onclick="window.FamilyCareApp.openMedModal()">
          <i class="fa-solid fa-pills"></i> Log Medication
        </button>
        <button class="btn btn-primary" onclick="window.FamilyCareApp.openTaskModal()">
          <i class="fa-solid fa-plus"></i> New Task
        </button>
      </div>
    </div>

    <!-- 4 Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Total Care Tasks</span>
          <span class="stat-value tabular-nums">${totalTasks}</span>
          <span class="stat-subtext">${totalTasks > 0 ? 'Active care items' : 'No tasks created yet'}</span>
        </div>
        <div class="stat-icon-wrap stat-icon-blue">
          <i class="fa-solid fa-list-check"></i>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Completed Tasks</span>
          <span class="stat-value tabular-nums">${completedTasks}</span>
          <span class="stat-subtext">${totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) + '% completion rate' : 'Ready to start'}</span>
        </div>
        <div class="stat-icon-wrap stat-icon-green">
          <i class="fa-solid fa-circle-check"></i>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Pending Tasks</span>
          <span class="stat-value tabular-nums">${pendingTasks}</span>
          <span class="stat-subtext">Requires caregiver action</span>
        </div>
        <div class="stat-icon-wrap stat-icon-amber">
          <i class="fa-solid fa-clock"></i>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Upcoming Appointments</span>
          <span class="stat-value tabular-nums">${upcomingAppointments}</span>
          <span class="stat-subtext">Consultations & clinic visits</span>
        </div>
        <div class="stat-icon-wrap stat-icon-teal">
          <i class="fa-solid fa-calendar-check"></i>
        </div>
      </div>
    </div>

    <!-- Main 2-Column Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Left Column: Today's Schedule -->
      <div class="card">
        <div class="card-header-bar">
          <div class="card-header-title">
            <i class="fa-regular fa-calendar-days"></i>
            <h3>Today's Care Schedule</h3>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.FamilyCareApp.navigateTo('tasks')">
            Manage Tasks <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Care Activity</th>
                <th>Assigned Caregiver</th>
                <th>Recipient</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${todaysSchedule.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
                    <i class="fa-regular fa-calendar-check" style="font-size: 1.8rem; margin-bottom: 8px; display: block; color: var(--text-muted);"></i>
                    No care tasks scheduled for today.<br>
                    <button class="btn btn-primary btn-sm" style="margin-top: 10px;" onclick="window.FamilyCareApp.openTaskModal()">
                      <i class="fa-solid fa-plus"></i> Schedule First Task
                    </button>
                  </td>
                </tr>
              ` : todaysSchedule.map(t => {
                const isDone = t.status === 'Completed';
                const statusClass = isDone ? 'badge-completed' : (t.status === 'In Progress' ? 'badge-in-progress' : 'badge-pending');
                return `
                  <tr>
                    <td class="tabular-nums" style="font-weight: 600; color: var(--text-primary); white-space: nowrap;">
                      <i class="fa-regular fa-clock" style="color: var(--text-muted); margin-right: 4px;"></i> ${t.dueTime || 'All Day'}
                    </td>
                    <td>
                      <div style="font-weight: 600; color: var(--text-primary);">${t.title}</div>
                      <div style="font-size: 0.74rem; color: var(--text-secondary); max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.description || 'No description provided'}</div>
                    </td>
                    <td>
                      <span style="font-size: 0.82rem; font-weight: 500;">${t.assignedToName || 'Unassigned'}</span>
                    </td>
                    <td>
                      <span style="font-size: 0.82rem; color: var(--text-secondary);">${t.recipientName || 'General'}</span>
                    </td>
                    <td>
                      <span class="status-badge ${statusClass}">
                        ${isDone ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-hourglass-half"></i>'} ${t.status}
                      </span>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      ${isDone ? `
                        <button class="btn btn-secondary btn-sm" onclick="window.FamilyCareApp.toggleTaskStatus('${t.id}')" title="Reopen Task">
                          <i class="fa-solid fa-rotate-left"></i> Undo
                        </button>
                      ` : `
                        <button class="btn btn-primary btn-sm" onclick="window.FamilyCareApp.toggleTaskStatus('${t.id}')">
                          <i class="fa-solid fa-check"></i> Complete
                        </button>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column: Upcoming Appointments, Responsibilities, Activity Feed -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Upcoming Appointments -->
        <div class="card">
          <div class="card-header-bar">
            <div class="card-header-title">
              <i class="fa-solid fa-user-doctor"></i>
              <h3>Upcoming Appointments</h3>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.FamilyCareApp.navigateTo('appointments')">
              Manage
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${nextAppointments.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); padding: 20px 10px; font-size: 0.82rem;">
                No upcoming medical appointments.<br>
                <button class="btn btn-secondary btn-sm" style="margin-top: 8px;" onclick="window.FamilyCareApp.openAppointmentModal()">
                  <i class="fa-solid fa-plus"></i> Schedule Consultation
                </button>
              </div>
            ` : nextAppointments.map(appt => `
              <div style="padding: 12px; border-radius: var(--radius-md); background-color: var(--bg-hover); border: 1px solid var(--border-light);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                  <span style="font-weight: 700; font-size: 0.86rem; color: var(--text-primary);">${appt.title}</span>
                  <span class="status-badge badge-in-progress" style="font-size: 0.68rem;">${appt.date}</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 6px;">
                  <i class="fa-solid fa-stethoscope" style="color: var(--primary); margin-right: 4px;"></i> ${appt.provider} ${appt.specialty ? `(${appt.specialty})` : ''}
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted);">
                  <span><i class="fa-regular fa-user"></i> ${appt.recipientName}</span>
                  <span><i class="fa-solid fa-shield-heart"></i> Escort: ${appt.accompanyingName}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Care Responsibilities (Progress Bars) -->
        <div class="card">
          <div class="card-header-bar">
            <div class="card-header-title">
              <i class="fa-solid fa-people-roof"></i>
              <h3>Care Responsibilities</h3>
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Task Distribution</span>
          </div>

          <div class="caregiver-progress-list">
            ${caregiverStats.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 12px;">
                No family caregivers assigned yet.
              </div>
            ` : caregiverStats.map(m => `
              <div class="caregiver-progress-item">
                <div class="caregiver-info-row">
                  <div class="caregiver-name">
                    <img src="${m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=2563EB&color=fff`}" class="activity-avatar" alt="${m.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=2563EB&color=fff'">
                    <div>
                      <div>${m.name}</div>
                      <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal;">${m.relation || 'Caregiver'}</div>
                    </div>
                  </div>
                  <span class="caregiver-pct">${m.pct}% <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">(${m.completed}/${m.total})</span></span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${m.pct}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Family Activity Feed -->
        <div class="card">
          <div class="card-header-bar">
            <div class="card-header-title">
              <i class="fa-solid fa-wave-square"></i>
              <h3>Family Activity Feed</h3>
            </div>
          </div>

          <div class="activity-list">
            ${activityItems.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 18px 10px;">
                <i class="fa-regular fa-bell" style="font-size: 1.4rem; margin-bottom: 6px; display: block; color: var(--text-muted);"></i>
                No activity recorded yet. Updates will appear here as you log medications and complete care duties.
              </div>
            ` : activityItems.map(item => `
              <div class="activity-item">
                <div class="stat-icon-wrap stat-icon-blue" style="width: 34px; height: 34px; font-size: 0.9rem; flex-shrink: 0;">
                  <i class="fa-solid ${item.icon}"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-text"><strong>${item.title}</strong>: ${item.text}</div>
                  <div class="activity-time">${item.time}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;
}
