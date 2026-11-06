/**
 * FamilyCare – Family Care Coordination System
 * Appointments Module (Card Grid & List Views)
 */

import { store } from './data.js';

let apptViewMode = 'grid'; // 'grid' | 'table'
let apptFilter = 'upcoming'; // 'upcoming' | 'all' | 'completed'

export function renderAppointments() {
  const container = document.getElementById('appointments-view');
  if (!container) return;

  const appointments = store.getAppointments();

  const filtered = appointments.filter(a => {
    if (apptFilter === 'upcoming') return a.status !== 'Completed';
    if (apptFilter === 'completed') return a.status === 'Completed';
    return true;
  });

  container.innerHTML = `
    <div class="section-banner">
      <div class="section-banner-title">
        <h2>Doctor & Therapy Appointments</h2>
        <p>Coordinate healthcare consultations, assign accompanying family members, and track clinical visits.</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-primary" onclick="window.FamilyCareApp.openAppointmentModal()">
          <i class="fa-solid fa-plus"></i> Schedule Appointment
        </button>
      </div>
    </div>

    <!-- Toolbar -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
      <div class="segmented-control">
        <button class="segmented-btn ${apptFilter === 'upcoming' ? 'active' : ''}" onclick="window.FamilyCareApp.setApptFilter('upcoming')">
          Upcoming (${appointments.filter(a => a.status !== 'Completed').length})
        </button>
        <button class="segmented-btn ${apptFilter === 'all' ? 'active' : ''}" onclick="window.FamilyCareApp.setApptFilter('all')">
          All Visits (${appointments.length})
        </button>
        <button class="segmented-btn ${apptFilter === 'completed' ? 'active' : ''}" onclick="window.FamilyCareApp.setApptFilter('completed')">
          Completed
        </button>
      </div>

      <div class="segmented-control">
        <button class="segmented-btn ${apptViewMode === 'grid' ? 'active' : ''}" onclick="window.FamilyCareApp.setApptViewMode('grid')">
          <i class="fa-solid fa-grip"></i> Cards
        </button>
        <button class="segmented-btn ${apptViewMode === 'table' ? 'active' : ''}" onclick="window.FamilyCareApp.setApptViewMode('table')">
          <i class="fa-solid fa-list"></i> List View
        </button>
      </div>
    </div>

    <!-- View Rendering -->
    ${filtered.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fa-regular fa-calendar-xmark"></i>
        </div>
        <div class="empty-state-title">No Appointments Found</div>
        <div class="empty-state-desc">Schedule a clinic consultation, physical therapy session, or follow-up doctor visit.</div>
        <button class="btn btn-primary" onclick="window.FamilyCareApp.openAppointmentModal()">
          <i class="fa-solid fa-plus"></i> Schedule Appointment
        </button>
      </div>
    ` : (apptViewMode === 'grid' ? renderApptGrid(filtered) : renderApptTable(filtered))}
  `;
}

function renderApptGrid(appointments) {
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
      ${appointments.map(a => {
        const isCompleted = a.status === 'Completed';
        return `
          <div class="card" style="display: flex; flex-direction: column; gap: 12px; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
              <div>
                <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${a.title}</h4>
                <div style="font-size: 0.8rem; color: var(--primary); font-weight: 600; margin-top: 2px;">
                  <i class="fa-solid fa-user-doctor"></i> ${a.provider}
                </div>
              </div>
              <span class="status-badge ${isCompleted ? 'badge-completed' : 'badge-in-progress'}">
                ${isCompleted ? '<i class="fa-solid fa-check"></i> Completed' : '<i class="fa-regular fa-clock"></i> Upcoming'}
              </span>
            </div>

            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">
              Specialty: <strong style="color: var(--text-secondary);">${a.specialty || 'General Consultation'}</strong>
            </div>

            <div style="background-color: var(--bg-hover); padding: 12px; border-radius: var(--radius-md); font-size: 0.78rem; display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> Date & Time:</span>
                <span class="tabular-nums" style="font-weight: 600; color: var(--text-primary);">${a.date} at ${a.time}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);"><i class="fa-regular fa-user"></i> Patient:</span>
                <span style="font-weight: 600; color: var(--text-primary);">${a.recipientName}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);"><i class="fa-solid fa-car-side"></i> Family Escort:</span>
                <span style="font-weight: 600; color: var(--secondary);">${a.accompanyingName}</span>
              </div>
              <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid var(--border-light); color: var(--text-secondary);">
                <i class="fa-solid fa-location-dot" style="color: var(--danger); margin-right: 4px;"></i> ${a.location}
              </div>
            </div>

            ${a.notes ? `
              <div style="font-size: 0.76rem; color: var(--text-secondary); font-style: italic;">
                <strong>Clinical Notes:</strong> ${a.notes}
              </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 12px; margin-top: auto;">
              <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="window.FamilyCareApp.toggleApptCompleted('${a.id}')">
                ${isCompleted ? '<i class="fa-solid fa-rotate-left"></i> Mark Upcoming' : '<i class="fa-solid fa-circle-check"></i> Mark Completed'}
              </button>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-sm btn-icon" title="Edit" onclick="window.FamilyCareApp.editAppointment('${a.id}')">
                  <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="btn btn-secondary btn-sm btn-icon" title="Delete" style="color: var(--danger);" onclick="window.FamilyCareApp.deleteAppointment('${a.id}')">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderApptTable(appointments) {
  return `
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Appointment / Clinic</th>
              <th>Provider</th>
              <th>Patient</th>
              <th>Accompanying</th>
              <th>Location</th>
              <th>Status</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${appointments.map(a => {
              const isDone = a.status === 'Completed';
              return `
                <tr>
                  <td class="tabular-nums" style="font-weight: 600; white-space: nowrap;">
                    ${a.date} <span style="font-size: 0.74rem; color: var(--text-muted); display: block;">${a.time}</span>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${a.title}</div>
                    <div style="font-size: 0.72rem; color: var(--text-secondary);">${a.specialty}</div>
                  </td>
                  <td>${a.provider}</td>
                  <td><strong>${a.recipientName}</strong></td>
                  <td><span style="color: var(--secondary); font-weight: 500;">${a.accompanyingName}</span></td>
                  <td style="font-size: 0.78rem; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${a.location}</td>
                  <td>
                    <span class="status-badge ${isDone ? 'badge-completed' : 'badge-in-progress'}">${a.status}</span>
                  </td>
                  <td style="text-align: right; white-space: nowrap;">
                    <button class="btn ${isDone ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="window.FamilyCareApp.toggleApptCompleted('${a.id}')">
                      ${isDone ? '<i class="fa-solid fa-rotate-left"></i>' : '<i class="fa-solid fa-check"></i>'}
                    </button>
                    <button class="btn btn-secondary btn-sm btn-icon" title="Edit" onclick="window.FamilyCareApp.editAppointment('${a.id}')">
                      <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm btn-icon" title="Delete" style="color: var(--danger);" onclick="window.FamilyCareApp.deleteAppointment('${a.id}')">
                      <i class="fa-regular fa-trash-can"></i>
                    </button>
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

export function setApptViewMode(mode) {
  apptViewMode = mode;
  renderAppointments();
}

export function setApptFilter(filter) {
  apptFilter = filter;
  renderAppointments();
}
