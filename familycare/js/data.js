/**
 * FamilyCare – Family Care Coordination System
 * Data Store & Authentication Manager
 * Clean Architecture (Examples removed, real user signup/signin enabled)
 */

const STORAGE_KEYS = {
  USERS: 'familycare_users',
  CURRENT_USER: 'familycare_current_user',
  FAMILY: 'familycare_familyMembers',
  RECIPIENTS: 'familycare_careRecipients',
  TASKS: 'familycare_tasks',
  MEDICATIONS: 'familycare_medications',
  MED_LOGS: 'familycare_medicationLogs',
  APPOINTMENTS: 'familycare_appointments',
  CALENDAR_EVENTS: 'familycare_calendarEvents',
  MESSAGES: 'familycare_messages',
  NOTIFICATIONS: 'familycare_notifications',
  EMERGENCY: 'familycare_emergencyContacts',
  SETTINGS: 'familycare_settings',
  INITIALIZED_V2: 'familycare_clean_v2'
};

// Default system emergency numbers (non-personal public services)
const DEFAULT_EMERGENCY = [
  {
    id: 'emg_911',
    name: 'Emergency Medical Services (EMS)',
    relationship: 'National Emergency Dispatch',
    phone: '911',
    hospital: 'Local Nearest Emergency Department',
    medicalNotes: 'For acute chest pain, severe difficulty breathing, sudden stroke symptoms (FAST), severe trauma, or unresponsiveness.',
    instructions: 'Dial 911 immediately in life-threatening medical situations.'
  },
  {
    id: 'emg_poison',
    name: 'National Poison Control Center',
    relationship: 'Emergency Toxicology',
    phone: '(800) 222-1222',
    hospital: 'National Toxicological Guidance',
    medicalNotes: '24/7 free, confidential medical consultation for accidental medication overdoses or chemical ingestion.',
    instructions: 'Call immediately if accidental double dosing or toxic exposure is suspected.'
  }
];

class DataStore {
  constructor() {
    this.init();
  }

  init() {
    // Migration: if previously seeded with old dummy examples (e.g., Eleanor Vance), clear them out
    const v2Marker = localStorage.getItem(STORAGE_KEYS.INITIALIZED_V2);
    if (!v2Marker) {
      this.clearExampleData();
      localStorage.setItem(STORAGE_KEYS.INITIALIZED_V2, 'true');
    }

    // Ensure users array exists
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      // Optional default test user for quick evaluation
      const defaultUser = {
        id: 'usr_default',
        name: 'Sarah Miller',
        role: 'Primary Caregiver',
        email: 'sarah@example.com',
        password: 'password123',
        phone: '(555) 234-5678',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Miller&background=2563EB&color=fff',
        createdAt: new Date().toISOString()
      };
      this.set(STORAGE_KEYS.USERS, [defaultUser]);
      // Set default signed-in user initially
      if (!this.getCurrentUser()) {
        this.setCurrentUser(defaultUser);
        this.addFamilyMember({
          id: 'fam_' + defaultUser.id,
          userId: defaultUser.id,
          name: defaultUser.name,
          relation: 'Primary Caregiver',
          phone: defaultUser.phone,
          email: defaultUser.email,
          avatar: defaultUser.avatar,
          status: 'active',
          completedTasksCount: 0,
          totalAssignedTasks: 0
        });
      }
    }

    // Ensure collections exist as clean empty arrays
    if (!localStorage.getItem(STORAGE_KEYS.RECIPIENTS)) this.set(STORAGE_KEYS.RECIPIENTS, []);
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) this.set(STORAGE_KEYS.TASKS, []);
    if (!localStorage.getItem(STORAGE_KEYS.MEDICATIONS)) this.set(STORAGE_KEYS.MEDICATIONS, []);
    if (!localStorage.getItem(STORAGE_KEYS.MED_LOGS)) this.set(STORAGE_KEYS.MED_LOGS, []);
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) this.set(STORAGE_KEYS.APPOINTMENTS, []);
    if (!localStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS)) this.set(STORAGE_KEYS.CALENDAR_EVENTS, []);
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) this.set(STORAGE_KEYS.MESSAGES, []);
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) this.set(STORAGE_KEYS.NOTIFICATIONS, []);
    if (!localStorage.getItem(STORAGE_KEYS.EMERGENCY)) this.set(STORAGE_KEYS.EMERGENCY, DEFAULT_EMERGENCY);
    if (!localStorage.getItem(STORAGE_KEYS.FAMILY)) this.set(STORAGE_KEYS.FAMILY, []);
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, {
        notifications: {
          taskReminders: true,
          medicationAlerts: true,
          appointmentAlerts: true,
          familyChatMessages: true
        },
        language: 'en',
        theme: 'light'
      });
    }
  }

  clearExampleData() {
    this.set(STORAGE_KEYS.RECIPIENTS, []);
    this.set(STORAGE_KEYS.TASKS, []);
    this.set(STORAGE_KEYS.MEDICATIONS, []);
    this.set(STORAGE_KEYS.MED_LOGS, []);
    this.set(STORAGE_KEYS.APPOINTMENTS, []);
    this.set(STORAGE_KEYS.CALENDAR_EVENTS, []);
    this.set(STORAGE_KEYS.MESSAGES, []);
    this.set(STORAGE_KEYS.NOTIFICATIONS, []);
    this.set(STORAGE_KEYS.EMERGENCY, DEFAULT_EMERGENCY);
    this.set(STORAGE_KEYS.FAMILY, []);
  }

  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (err) {
      console.error(`Error reading ${key} from LocalStorage:`, err);
      return [];
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error writing ${key} to LocalStorage:`, err);
    }
  }

  // =========================================================================
  // Authentication & Users
  // =========================================================================

  getCurrentUser() {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  }

  getUsers() {
    return this.get(STORAGE_KEYS.USERS);
  }

  signUp({ name, email, password, role, phone }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = this.getUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const initials = encodeURIComponent(name.trim());
    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: (role || 'Primary Caregiver').trim(),
      phone: (phone || '').trim(),
      avatar: `https://ui-avatars.com/api/?name=${initials}&background=2563EB&color=fff&bold=true`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.set(STORAGE_KEYS.USERS, users);

    // Automatically register user as primary family member
    this.addFamilyMember({
      id: 'fam_' + newUser.id,
      userId: newUser.id,
      name: newUser.name,
      relation: newUser.role,
      phone: newUser.phone,
      email: newUser.email,
      avatar: newUser.avatar,
      status: 'active',
      completedTasksCount: 0,
      totalAssignedTasks: 0
    });

    this.setCurrentUser(newUser);

    // Create a welcome notification
    this.addNotification({
      title: 'Welcome to FamilyCare!',
      message: `Account created for ${newUser.name}. Add your care recipients to begin coordinating care.`,
      time: 'Just now',
      type: 'task'
    });

    return { success: true, user: newUser };
  }

  signIn({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = this.getUsers();

    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!user) {
      return { success: false, error: 'Invalid email or password. Please try again or create a new account.' };
    }

    this.setCurrentUser(user);

    // Make sure user is in family members list
    const family = this.getFamilyMembers();
    if (!family.some(f => f.email === user.email || f.name === user.name)) {
      this.addFamilyMember({
        id: 'fam_' + user.id,
        userId: user.id,
        name: user.name,
        relation: user.role || 'Primary Caregiver',
        phone: user.phone || '',
        email: user.email,
        avatar: user.avatar,
        status: 'active',
        completedTasksCount: 0,
        totalAssignedTasks: 0
      });
    }

    return { success: true, user };
  }

  signOut() {
    this.setCurrentUser(null);
  }

  // =========================================================================
  // Care Recipients
  // =========================================================================

  getRecipients() { return this.get(STORAGE_KEYS.RECIPIENTS); }
  saveRecipient(recipient) {
    const list = this.getRecipients();
    const idx = list.findIndex(r => r.id === recipient.id);
    if (idx >= 0) {
      list[idx] = recipient;
    } else {
      recipient.id = 'rec_' + Date.now();
      list.push(recipient);
    }
    this.set(STORAGE_KEYS.RECIPIENTS, list);
    return recipient;
  }
  deleteRecipient(id) {
    const list = this.getRecipients().filter(r => r.id !== id);
    this.set(STORAGE_KEYS.RECIPIENTS, list);
  }

  // =========================================================================
  // Tasks
  // =========================================================================

  getTasks() { return this.get(STORAGE_KEYS.TASKS); }
  saveTask(task) {
    const list = this.getTasks();
    const idx = list.findIndex(t => t.id === task.id);
    if (idx >= 0) {
      list[idx] = task;
    } else {
      task.id = 'task_' + Date.now();
      list.unshift(task);
    }
    this.set(STORAGE_KEYS.TASKS, list);
    return task;
  }
  deleteTask(id) {
    const list = this.getTasks().filter(t => t.id !== id);
    this.set(STORAGE_KEYS.TASKS, list);
  }

  // =========================================================================
  // Medications & Logs
  // =========================================================================

  getMedications() { return this.get(STORAGE_KEYS.MEDICATIONS); }
  saveMedication(med) {
    const list = this.getMedications();
    const idx = list.findIndex(m => m.id === med.id);
    if (idx >= 0) {
      list[idx] = med;
    } else {
      med.id = 'med_' + Date.now();
      list.push(med);
    }
    this.set(STORAGE_KEYS.MEDICATIONS, list);
    return med;
  }
  deleteMedication(id) {
    const list = this.getMedications().filter(m => m.id !== id);
    this.set(STORAGE_KEYS.MEDICATIONS, list);
  }

  getMedicationLogs() { return this.get(STORAGE_KEYS.MED_LOGS); }
  addMedicationLog(log) {
    const list = this.getMedicationLogs();
    log.id = 'log_' + Date.now();
    log.timestamp = new Date().toISOString();
    list.unshift(log);
    this.set(STORAGE_KEYS.MED_LOGS, list);
    return log;
  }

  // =========================================================================
  // Appointments
  // =========================================================================

  getAppointments() { return this.get(STORAGE_KEYS.APPOINTMENTS); }
  saveAppointment(appt) {
    const list = this.getAppointments();
    const idx = list.findIndex(a => a.id === appt.id);
    if (idx >= 0) {
      list[idx] = appt;
    } else {
      appt.id = 'appt_' + Date.now();
      list.push(appt);
    }
    this.set(STORAGE_KEYS.APPOINTMENTS, list);
    return appt;
  }
  deleteAppointment(id) {
    const list = this.getAppointments().filter(a => a.id !== id);
    this.set(STORAGE_KEYS.APPOINTMENTS, list);
  }

  // =========================================================================
  // Calendar Events
  // =========================================================================

  getCalendarEvents() { return this.get(STORAGE_KEYS.CALENDAR_EVENTS); }
  saveCalendarEvent(event) {
    const list = this.getCalendarEvents();
    const idx = list.findIndex(e => e.id === event.id);
    if (idx >= 0) {
      list[idx] = event;
    } else {
      event.id = 'cal_' + Date.now();
      list.push(event);
    }
    this.set(STORAGE_KEYS.CALENDAR_EVENTS, list);
    return event;
  }

  // =========================================================================
  // Family Members & Caregivers
  // =========================================================================

  getFamilyMembers() {
    const list = this.get(STORAGE_KEYS.FAMILY);
    // Ensure current user is always present in list
    const cur = this.getCurrentUser();
    if (cur && !list.some(f => f.email === cur.email || f.name === cur.name)) {
      list.unshift({
        id: 'fam_' + cur.id,
        userId: cur.id,
        name: cur.name,
        relation: cur.role || 'Primary Caregiver',
        phone: cur.phone || '',
        email: cur.email,
        avatar: cur.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(cur.name)}&background=2563EB&color=fff`,
        status: 'active',
        completedTasksCount: 0,
        totalAssignedTasks: 0
      });
      this.set(STORAGE_KEYS.FAMILY, list);
    }
    return list;
  }

  addFamilyMember(member) {
    const list = this.get(STORAGE_KEYS.FAMILY);
    if (!member.id) member.id = 'fam_' + Date.now();
    const idx = list.findIndex(f => f.id === member.id || f.email === member.email);
    if (idx >= 0) {
      list[idx] = member;
    } else {
      list.push(member);
    }
    this.set(STORAGE_KEYS.FAMILY, list);
    return member;
  }

  // =========================================================================
  // Messages & Communication
  // =========================================================================

  getMessages() { return this.get(STORAGE_KEYS.MESSAGES); }
  addMessage(msg) {
    const list = this.getMessages();
    msg.id = 'msg_' + Date.now();
    list.push(msg);
    this.set(STORAGE_KEYS.MESSAGES, list);
    return msg;
  }

  // =========================================================================
  // Notifications
  // =========================================================================

  getNotifications() { return this.get(STORAGE_KEYS.NOTIFICATIONS); }
  markAllNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, unread: false }));
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
  }
  addNotification(notif) {
    const list = this.getNotifications();
    notif.id = 'notif_' + Date.now();
    notif.unread = true;
    list.unshift(notif);
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // =========================================================================
  // Emergency Contacts
  // =========================================================================

  getEmergencyContacts() { return this.get(STORAGE_KEYS.EMERGENCY); }
  saveEmergencyContact(contact) {
    const list = this.getEmergencyContacts();
    const idx = list.findIndex(c => c.id === contact.id);
    if (idx >= 0) {
      list[idx] = contact;
    } else {
      contact.id = 'emg_' + Date.now();
      list.push(contact);
    }
    this.set(STORAGE_KEYS.EMERGENCY, list);
    return contact;
  }
  deleteEmergencyContact(id) {
    const list = this.getEmergencyContacts().filter(c => c.id !== id);
    this.set(STORAGE_KEYS.EMERGENCY, list);
  }

  // =========================================================================
  // Settings
  // =========================================================================

  getSettings() {
    const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return s ? JSON.parse(s) : {
      notifications: {
        taskReminders: true,
        medicationAlerts: true,
        appointmentAlerts: true,
        familyChatMessages: true
      },
      language: 'en',
      theme: 'light'
    };
  }
  saveSettings(settings) {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }
}

export const store = new DataStore();
export { STORAGE_KEYS };
