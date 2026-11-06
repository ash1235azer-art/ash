/**
 * FamilyCare – Family Care Coordination System
 * Care Reports & Analytics Module (with CSV Export)
 */

import { store } from './data.js';

let reportRange = 'monthly'; // 'weekly' | 'monthly' | 'all'

export function renderReports() {
  const container = document.getElementById('reports-view');
  if (!container) return;

  const tasks = store.getTasks();
  const medications = store.getMedications();
  const medLogs = store.getMedicationLogs();
  const appointments = store.getAppointments();
  const familyMembers = store.getFamilyMembers();

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;

  // Med adherence
  const totalLogs = medLogs.length || 1;
  const administeredLogs = medLogs.filter(l => l.status === 'Administered').length;
  const adherenceRate = Math.round((administeredLogs / totalLogs) * 100);

  // Caregiver breakdown
  const caregiverBreakdown = familyMembers.map(m => {
    const memberTasks = tasks.filter(t => t.assignedToName === m.name || t.assignedToId === m.id);
    const done = memberTasks.filter(t => t.status === 'Completed').length;
    const total = memberTasks.length || 1;
    const pct = Math.round((done / total) * 100);
    return { name: m.name, role: m.relation, done, total: memberTasks.length, pct };
  });

  container.innerHTML = `
    <div class="section-banner">
      <div class="section-banner-title">
        <h2>Care Reports & Analytics</h2>
        <p>Analyze routine adherence, family task division, and healthcare appointment history.</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-secondary" onclick="window.FamilyCareApp.exportCareReportCSV()">
          <i class="fa-solid fa-file-csv"></i> Export to CSV
        </button>
      </div>
    </div>

    <!-- Date Range Filter Tabs -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <div class="segmented-control">
        <button class="segmented-btn ${reportRange === 'weekly' ? 'active' : ''}" onclick="window.FamilyCareApp.setReportRange('weekly')">
          Past 7 Days (Weekly)
        </button>
        <button class="segmented-btn ${reportRange === 'monthly' ? 'active' : ''}" onclick="window.FamilyCareApp.setReportRange('monthly')">
          Past 30 Days (Monthly)
        </button>
        <button class="segmented-btn ${reportRange === 'all' ? 'active' : ''}" onclick="window.FamilyCareApp.setReportRange('all')">
          All-Time Overview
        </button>
      </div>

      <div style="font-size: 0.78rem; color: var(--text-secondary);">
        <i class="fa-regular fa-calendar-check" style="color: var(--primary);"></i> Report period: <strong>${reportRange === 'weekly' ? 'Last 7 Days' : (reportRange === 'monthly' ? 'Current Month (Nov 2026)' : 'Full History')}</strong>
      </div>
    </div>

    <!-- 4 High-level Summary Metrics -->
    <div class="report-metric-strip">
      <div class="report-metric-box">
        <div class="report-metric-value tabular-nums">${completedTasks}</div>
        <div class="report-metric-label">Completed Care Tasks</div>
        <span style="font-size: 0.72rem; color: var(--success);"><i class="fa-solid fa-arrow-trend-up"></i> ${Math.round((completedTasks/totalTasks)*100)}% on-time completion</span>
      </div>

      <div class="report-metric-box">
        <div class="report-metric-value tabular-nums" style="color: var(--secondary);">${adherenceRate}%</div>
        <div class="report-metric-label">Medication Adherence Rate</div>
        <span style="font-size: 0.72rem; color: var(--text-muted);">${administeredLogs} of ${totalLogs} recorded doses</span>
      </div>

      <div class="report-metric-box">
        <div class="report-metric-value tabular-nums" style="color: var(--warning);">${pendingTasks}</div>
        <div class="report-metric-label">Pending / Scheduled Duties</div>
        <span style="font-size: 0.72rem; color: var(--text-muted);">Active in queue</span>
      </div>

      <div class="report-metric-box">
        <div class="report-metric-value tabular-nums" style="color: ${overdueTasks > 0 ? 'var(--danger)' : 'var(--text-muted)'};">${overdueTasks}</div>
        <div class="report-metric-label">Overdue Tasks</div>
        <span style="font-size: 0.72rem; color: ${overdueTasks > 0 ? 'var(--danger)' : 'var(--success)'};">
          ${overdueTasks > 0 ? 'Attention required' : 'Zero overdue items'}
        </span>
      </div>
    </div>

    <!-- 2 Main Analytical Sections -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <!-- Caregiver Participation Breakdown -->
      <div class="card">
        <div class="card-header-bar">
          <div class="card-header-title">
            <i class="fa-solid fa-user-group"></i>
            <h3>Family Member Participation</h3>
          </div>
          <span style="font-size: 0.74rem; color: var(--text-muted);">Tasks Assigned & Completed</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${caregiverBreakdown.map(cg => `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                <div>
                  <strong>${cg.name}</strong> <span style="font-size: 0.72rem; color: var(--text-muted);">(${cg.role})</span>
                </div>
                <div class="tabular-nums" style="font-weight: 700; color: var(--primary);">
                  ${cg.done} / ${cg.total} tasks (${cg.pct}%)
                </div>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${cg.pct}%;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Medication Administration Summary -->
      <div class="card">
        <div class="card-header-bar">
          <div class="card-header-title">
            <i class="fa-solid fa-pills"></i>
            <h3>Prescription Adherence Overview</h3>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${medications.slice(0, 4).map(m => `
            <div style="padding: 10px; background-color: var(--bg-hover); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600; font-size: 0.84rem; color: var(--text-primary);">${m.name} (${m.dosage})</div>
                <div style="font-size: 0.74rem; color: var(--text-secondary);">For ${m.recipientName} · ${m.frequency}</div>
              </div>
              <span class="status-badge ${m.status === 'Administered' ? 'badge-completed' : 'badge-pending'}">
                ${m.status === 'Administered' ? '<i class="fa-solid fa-check"></i> On Track' : '<i class="fa-solid fa-clock"></i> Scheduled'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Appointment & Clinical History Log -->
    <div class="card">
      <div class="card-header-bar">
        <div class="card-header-title">
          <i class="fa-solid fa-hospital-user"></i>
          <h3>Appointment Attendance & Consultation Log</h3>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Clinic / Provider</th>
              <th>Recipient</th>
              <th>Family Escort</th>
              <th>Location</th>
              <th>Outcome / Status</th>
            </tr>
          </thead>
          <tbody>
            ${appointments.map(a => `
              <tr>
                <td class="tabular-nums" style="font-weight: 600;">${a.date}</td>
                <td>
                  <strong>${a.title}</strong>
                  <div style="font-size: 0.72rem; color: var(--text-secondary);">${a.provider}</div>
                </td>
                <td>${a.recipientName}</td>
                <td><span style="color: var(--secondary); font-weight: 500;">${a.accompanyingName}</span></td>
                <td style="font-size: 0.78rem;">${a.location}</td>
                <td>
                  <span class="status-badge ${a.status === 'Completed' ? 'badge-completed' : 'badge-in-progress'}">
                    ${a.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function setReportRange(range) {
  reportRange = range;
  renderReports();
}

export function exportCareReportCSV() {
  const tasks = store.getTasks();
  const appointments = store.getAppointments();
  const medLogs = store.getMedicationLogs();

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Category,Record Title,Recipient,Assigned/Companion,Date/Time,Status,Notes\n';

  // Tasks
  tasks.forEach(t => {
    const row = [
      'Care Task',
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.recipientName}"`,
      `"${t.assignedToName}"`,
      `"${t.dueDate || ''} ${t.dueTime || ''}"`,
      `"${t.status}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  // Appointments
  appointments.forEach(a => {
    const row = [
      'Appointment',
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.recipientName}"`,
      `"${a.accompanyingName}"`,
      `"${a.date} ${a.time}"`,
      `"${a.status}"`,
      `"${(a.provider + ' - ' + (a.notes || '')).replace(/"/g, '""')}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  // Med logs
  medLogs.forEach(l => {
    const row = [
      'Medication Log',
      `"${l.medicationName.replace(/"/g, '""')}"`,
      `"${l.recipientName}"`,
      `"${l.administeredBy}"`,
      `"${l.timestamp}"`,
      `"${l.status}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `FamilyCare_Summary_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (window.FamilyCareApp && window.FamilyCareApp.showToast) {
    window.FamilyCareApp.showToast('Care report successfully exported to CSV', 'success');
  }
}
