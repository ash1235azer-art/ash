/**
 * FamilyCare – Family Care Coordination System
 * Interactive Monthly Family Calendar Module
 */

import { store } from './data.js';

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-indexed

export function renderCalendar() {
  const container = document.getElementById('calendar-view');
  if (!container) return;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevLastDay = new Date(currentYear, currentMonth, 0).getDate();

  // Aggregate all events: tasks, appointments, custom calendar events
  const tasks = store.getTasks();
  const appointments = store.getAppointments();
  const calEvents = store.getCalendarEvents();

  // Combine into unified event map by YYYY-MM-DD
  const eventsByDate = {};

  const addEventToMap = (dateStr, eventObj) => {
    if (!dateStr) return;
    if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
    eventsByDate[dateStr].push(eventObj);
  };

  appointments.forEach(a => {
    addEventToMap(a.date, {
      id: a.id,
      title: a.title,
      category: 'appt',
      time: a.time,
      typeLabel: 'Doctor / Clinic',
      recipient: a.recipientName,
      caregiver: a.accompanyingName
    });
  });

  tasks.forEach(t => {
    if (t.dueDate) {
      addEventToMap(t.dueDate, {
        id: t.id,
        title: t.title,
        category: 'task',
        time: t.dueTime,
        typeLabel: 'Care Task',
        recipient: t.recipientName,
        caregiver: t.assignedToName
      });
    }
  });

  calEvents.forEach(e => {
    addEventToMap(e.date, {
      id: e.id,
      title: e.title,
      category: e.category || 'visit',
      time: e.time,
      typeLabel: e.category === 'medication' ? 'Med Routine' : (e.category === 'visit' ? 'Family Visit' : 'Care Shift'),
      recipient: e.recipient,
      caregiver: e.caregiver
    });
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Build grid days
  let dayCellsHtml = '';

  // Previous month trailing days
  for (let x = firstDayIndex; x > 0; x--) {
    const dayNum = prevLastDay - x + 1;
    dayCellsHtml += `
      <div class="calendar-day-cell other-month">
        <span class="day-number">${dayNum}</span>
      </div>
    `;
  }

  // Current month days
  for (let i = 1; i <= lastDay; i++) {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(i).padStart(2, '0');
    const dateKey = `${currentYear}-${mStr}-${dStr}`;
    const isToday = dateKey === todayStr;
    const dayEvents = eventsByDate[dateKey] || [];

    dayCellsHtml += `
      <div class="calendar-day-cell ${isToday ? 'is-today' : ''}" onclick="window.FamilyCareApp.openDateEventsModal('${dateKey}')">
        <span class="day-number">${i}</span>
        <div class="day-events-list">
          ${dayEvents.slice(0, 3).map(ev => {
            let catClass = 'cal-event-appt';
            if (ev.category === 'task') catClass = 'cal-event-task';
            else if (ev.category === 'med' || ev.category === 'medication') catClass = 'cal-event-med';
            else if (ev.category === 'visit') catClass = 'cal-event-visit';

            return `
              <div class="cal-event-pill ${catClass}" title="${ev.time || ''} ${ev.title}">
                <span>${ev.time ? ev.time.substring(0, 5) : ''}</span>
                <span>${ev.title}</span>
              </div>
            `;
          }).join('')}
          ${dayEvents.length > 3 ? `
            <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; padding-left: 2px;">
              +${dayEvents.length - 3} more
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Next month leading days to complete row
  const totalSlots = firstDayIndex + lastDay;
  const nextMonthDays = (7 - (totalSlots % 7)) % 7;
  for (let j = 1; j <= nextMonthDays; j++) {
    dayCellsHtml += `
      <div class="calendar-day-cell other-month">
        <span class="day-number">${j}</span>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="section-banner">
      <div class="section-banner-title">
        <h2>Family Calendar</h2>
        <p>Coordinate caregiver shifts, medical visits, medication cycles, and family check-ins in one unified view.</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-primary" onclick="window.FamilyCareApp.openCalendarEventModal()">
          <i class="fa-solid fa-plus"></i> Add Event
        </button>
      </div>
    </div>

    <!-- Calendar Navigation & Legend -->
    <div class="calendar-header-bar">
      <div class="calendar-nav-group">
        <h3 class="calendar-month-label">${monthNames[currentMonth]} ${currentYear}</h3>
        <button class="btn btn-secondary btn-sm btn-icon" onclick="window.FamilyCareApp.prevMonth()" title="Previous Month">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.FamilyCareApp.todayMonth()">
          Today
        </button>
        <button class="btn btn-secondary btn-sm btn-icon" onclick="window.FamilyCareApp.nextMonth()" title="Next Month">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <!-- Color Legend -->
      <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap; font-size: 0.76rem; color: var(--text-secondary);">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 10px; height: 10px; border-radius: 2px; background-color: var(--primary);"></span>
          <span>Appointments</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 10px; height: 10px; border-radius: 2px; background-color: var(--warning);"></span>
          <span>Care Tasks</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 10px; height: 10px; border-radius: 2px; background-color: var(--secondary);"></span>
          <span>Medications</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 10px; height: 10px; border-radius: 2px; background-color: #8B5CF6;"></span>
          <span>Family Visits / Shifts</span>
        </div>
      </div>
    </div>

    <!-- Month Grid -->
    <div class="calendar-grid">
      <div class="calendar-day-head">Sun</div>
      <div class="calendar-day-head">Mon</div>
      <div class="calendar-day-head">Tue</div>
      <div class="calendar-day-head">Wed</div>
      <div class="calendar-day-head">Thu</div>
      <div class="calendar-day-head">Fri</div>
      <div class="calendar-day-head">Sat</div>
      ${dayCellsHtml}
    </div>
  `;
}

export function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

export function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

export function todayMonth() {
  const now = new Date();
  currentMonth = now.getMonth();
  currentYear = now.getFullYear();
  renderCalendar();
}
