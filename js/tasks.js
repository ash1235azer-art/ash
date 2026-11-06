/**
 * FamilyCare – Family Care Coordination System
 * Tasks & Responsibilities Module (Table & Kanban Board)
 */

import { store } from './data.js';

let viewMode = 'kanban'; // 'kanban' | 'table'
let statusFilter = 'all'; // 'all' | 'Pending' | 'In Progress' | 'Completed' | 'Overdue'
let priorityFilter = 'all'; // 'all' | 'Urgent' | 'High' | 'Medium' | 'Low'
let searchQuery = '';

export function renderTasks() {
  const container = document.getElementById('tasks-view');
  if (!container) return;

  const tasks = store.getTasks();
  const todayStr = new Date().toISOString().split('T')[0];

  // Identify overdue tasks dynamically if due date passed and not completed
  const processedTasks = tasks.map(t => {
    let status = t.status;
    if (status !== 'Completed' && t.dueDate && t.dueDate < todayStr) {
      status = 'Overdue';
    }
    return { ...t, status };
  });

  // Filter & Search
  const filtered = processedTasks.filter(t => {
    const matchesSearch = searchQuery === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  container.innerHTML = `
    <div class="section-banner">
      <div class="section-banner-title">
        <h2>Tasks & Responsibilities</h2>
        <p>Coordinate daily caregiving routines, set priorities, and track assignment progress.</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-primary" onclick="window.FamilyCareApp.openTaskModal()">
          <i class="fa-solid fa-plus"></i> Create Care Task
        </button>
      </div>
    </div>

    <!-- Toolbar: Filters & View Switcher -->
    <div class="tasks-toolbar">
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <!-- Status Filter -->
        <div class="segmented-control">
          <button class="segmented-btn ${statusFilter === 'all' ? 'active' : ''}" onclick="window.FamilyCareApp.setTaskStatusFilter('all')">
            All (${processedTasks.length})
          </button>
          <button class="segmented-btn ${statusFilter === 'Pending' ? 'active' : ''}" onclick="window.FamilyCareApp.setTaskStatusFilter('Pending')">
            Pending
          </button>
          <button class="segmented-btn ${statusFilter === 'In Progress' ? 'active' : ''}" onclick="window.FamilyCareApp.setTaskStatusFilter('In Progress')">
            In Progress
          </button>
          <button class="segmented-btn ${statusFilter === 'Completed' ? 'active' : ''}" onclick="window.FamilyCareApp.setTaskStatusFilter('Completed')">
            Completed
          </button>
        </div>

        <!-- Priority Select -->
        <select class="form-control" style="width: auto; padding: 6px 12px; font-size: 0.78rem;" onchange="window.FamilyCareApp.setTaskPriorityFilter(this.value)">
          <option value="all" ${priorityFilter === 'all' ? 'selected' : ''}>All Priorities</option>
          <option value="Urgent" ${priorityFilter === 'Urgent' ? 'selected' : ''}>Urgent</option>
          <option value="High" ${priorityFilter === 'High' ? 'selected' : ''}>High</option>
          <option value="Medium" ${priorityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
          <option value="Low" ${priorityFilter === 'Low' ? 'selected' : ''}>Low</option>
        </select>
      </div>

      <div style="display: flex; gap: 10px; align-items: center;">
        <!-- Search input -->
        <div style="position: relative; width: 220px;">
          <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.78rem;"></i>
          <input
            type="text"
            class="form-control"
            placeholder="Search tasks..."
            value="${searchQuery}"
            oninput="window.FamilyCareApp.onTaskSearch(this.value)"
            style="padding: 6px 12px 6px 30px; font-size: 0.8rem;"
          />
        </div>

        <!-- Table vs Kanban Toggle -->
        <div class="segmented-control">
          <button class="segmented-btn ${viewMode === 'kanban' ? 'active' : ''}" onclick="window.FamilyCareApp.setTaskViewMode('kanban')" title="Kanban Board">
            <i class="fa-solid fa-table-columns"></i> Board
          </button>
          <button class="segmented-btn ${viewMode === 'table' ? 'active' : ''}" onclick="window.FamilyCareApp.setTaskViewMode('table')" title="List Table">
            <i class="fa-solid fa-list"></i> Table
          </button>
        </div>
      </div>
    </div>

    <!-- View Mode Render -->
    ${viewMode === 'kanban' ? renderKanban(filtered) : renderTable(filtered)}
  `;
}

function renderKanban(tasks) {
  const columns = [
    { id: 'Pending', label: 'Pending', color: 'var(--warning)' },
    { id: 'In Progress', label: 'In Progress', color: 'var(--info)' },
    { id: 'Completed', label: 'Completed', color: 'var(--success)' },
    { id: 'Overdue', label: 'Overdue', color: 'var(--danger)' }
  ];

  return `
    <div class="kanban-board">
      ${columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return `
          <div class="kanban-col">
            <div class="kanban-col-header">
              <div class="kanban-col-title">
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${col.color};"></span>
                ${col.label}
              </div>
              <span class="kanban-badge">${colTasks.length}</span>
            </div>

            <div class="kanban-cards-wrap">
              ${colTasks.length === 0 ? `
                <div style="text-align: center; color: var(--text-muted); font-size: 0.78rem; padding: 24px 8px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
                  No tasks
                </div>
              ` : colTasks.map(t => {
                const priorityClass = `priority-${t.priority.toLowerCase()}`;
                const isDone = t.status === 'Completed';
                return `
                  <div class="task-card">
                    <div class="task-card-header">
                      <span class="priority-badge ${priorityClass}">
                        ${t.priority}
                      </span>
                      <div style="display: flex; gap: 4px;">
                        <button class="btn btn-secondary btn-icon" style="width: 22px; height: 22px; font-size: 0.7rem;" title="Edit" onclick="window.FamilyCareApp.editTask('${t.id}')">
                          <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-secondary btn-icon" style="width: 22px; height: 22px; font-size: 0.7rem; color: var(--danger);" title="Delete" onclick="window.FamilyCareApp.deleteTask('${t.id}')">
                          <i class="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </div>

                    <div class="task-card-title">${t.title}</div>
                    <div class="task-card-desc">${t.description}</div>

                    <div style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                      <i class="fa-regular fa-user" style="color: var(--primary);"></i> For: <strong>${t.recipientName}</strong>
                    </div>

                    <div class="task-card-footer">
                      <div class="task-assignee">
                        <i class="fa-solid fa-hands-holding-child" style="color: var(--text-muted);"></i>
                        <span>${t.assignedToName}</span>
                      </div>
                      <div class="tabular-nums" style="display: flex; align-items: center; gap: 4px;">
                        <i class="fa-regular fa-clock"></i> ${t.dueTime || 'Anytime'}
                      </div>
                    </div>

                    <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
                      <select class="form-control" style="width: auto; padding: 2px 6px; font-size: 0.72rem;" onchange="window.FamilyCareApp.updateTaskStatus('${t.id}', this.value)">
                        <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Completed</option>
                      </select>

                      <button class="btn ${isDone ? 'btn-secondary' : 'btn-primary'} btn-sm" style="font-size: 0.72rem; padding: 3px 8px;" onclick="window.FamilyCareApp.toggleTaskStatus('${t.id}')">
                        ${isDone ? '<i class="fa-solid fa-rotate-left"></i> Reopen' : '<i class="fa-solid fa-check"></i> Done'}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderTable(tasks) {
  return `
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Recipient</th>
              <th>Assigned To</th>
              <th>Due Date & Time</th>
              <th>Priority</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
                  No tasks match the selected filters.
                </td>
              </tr>
            ` : tasks.map(t => {
              const priorityClass = `priority-${t.priority.toLowerCase()}`;
              const isDone = t.status === 'Completed';
              const statusClass = isDone ? 'badge-completed' : (t.status === 'In Progress' ? 'badge-in-progress' : (t.status === 'Overdue' ? 'badge-overdue' : 'badge-pending'));
              return `
                <tr>
                  <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${t.title}</div>
                    <div style="font-size: 0.74rem; color: var(--text-secondary); max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.description}</div>
                  </td>
                  <td>
                    <span style="font-size: 0.82rem; font-weight: 500;">${t.recipientName}</span>
                  </td>
                  <td>
                    <span style="font-size: 0.82rem; color: var(--text-secondary);">${t.assignedToName}</span>
                  </td>
                  <td class="tabular-nums">
                    <span style="font-size: 0.8rem; font-weight: 500;">${t.dueDate || 'Today'}</span>
                    <span style="font-size: 0.74rem; color: var(--text-muted); display: block;">${t.dueTime || 'All Day'}</span>
                  </td>
                  <td>
                    <span class="priority-badge ${priorityClass}">${t.priority}</span>
                  </td>
                  <td>
                    <span class="status-badge ${statusClass}">${t.status}</span>
                  </td>
                  <td style="text-align: right; white-space: nowrap;">
                    <button class="btn ${isDone ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="window.FamilyCareApp.toggleTaskStatus('${t.id}')">
                      ${isDone ? '<i class="fa-solid fa-rotate-left"></i>' : '<i class="fa-solid fa-check"></i> Done'}
                    </button>
                    <button class="btn btn-secondary btn-sm btn-icon" title="Edit" onclick="window.FamilyCareApp.editTask('${t.id}')">
                      <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm btn-icon" title="Delete" style="color: var(--danger);" onclick="window.FamilyCareApp.deleteTask('${t.id}')">
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

export function setTaskViewMode(mode) {
  viewMode = mode;
  renderTasks();
}

export function setTaskStatusFilter(status) {
  statusFilter = status;
  renderTasks();
}

export function setTaskPriorityFilter(priority) {
  priorityFilter = priority;
  renderTasks();
}

export function setTaskSearch(q) {
  searchQuery = q;
  renderTasks();
}
