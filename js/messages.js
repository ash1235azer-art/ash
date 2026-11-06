/**
 * FamilyCare – Family Care Coordination System
 * Family Messages Module (Clean & Dynamic)
 */

import { store } from './data.js';

let activeThreadId = null;

export function renderMessages() {
  const container = document.getElementById('messages-view');
  if (!container) return;

  const currentUser = store.getCurrentUser();
  const allFamily = store.getFamilyMembers();
  // Other family members excluding currently logged in user
  const otherMembers = allFamily.filter(m => m.userId !== currentUser?.id && m.email !== currentUser?.email);
  const allMessages = store.getMessages();

  if (otherMembers.length > 0 && (!activeThreadId || !otherMembers.some(m => m.id === activeThreadId))) {
    activeThreadId = otherMembers[0].id;
  }

  const activeContact = otherMembers.find(m => m.id === activeThreadId);
  const threadMessages = activeContact ? allMessages.filter(m => m.threadWith === activeContact.id) : [];

  container.innerHTML = `
    <div class="section-banner">
      <div class="section-banner-title">
        <h2>Family Care Messages</h2>
        <p>Coordinate day-to-day updates, handoffs, and questions with other family caregivers.</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-secondary" onclick="window.FamilyCareApp.openAddFamilyModal()">
          <i class="fa-solid fa-user-plus"></i> Add Family Caregiver
        </button>
      </div>
    </div>

    ${otherMembers.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fa-regular fa-comments"></i>
        </div>
        <div class="empty-state-title">No Family Caregivers Connected Yet</div>
        <div class="empty-state-desc">
          Add other family members, siblings, or caregivers to this circle to coordinate care shifts and send direct updates.
        </div>
        <button class="btn btn-primary" onclick="window.FamilyCareApp.openAddFamilyModal()">
          <i class="fa-solid fa-user-plus"></i> Add Family Member
        </button>
      </div>
    ` : `
      <div class="chat-container">
        <!-- Contacts Sidebar -->
        <div class="chat-sidebar">
          <div class="chat-sidebar-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">
                Caregiver Team
              </div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">
                ${otherMembers.length} Caregiver${otherMembers.length > 1 ? 's' : ''}
              </div>
            </div>
            <button class="btn btn-secondary btn-sm btn-icon" title="Add Caregiver" onclick="window.FamilyCareApp.openAddFamilyModal()">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>

          <div class="chat-contacts-list">
            ${otherMembers.map(member => {
              const memberMsgs = allMessages.filter(m => m.threadWith === member.id);
              const lastMsg = memberMsgs[memberMsgs.length - 1];
              const isActive = member.id === activeContact?.id;

              return `
                <div class="chat-contact-item ${isActive ? 'active' : ''}" onclick="window.FamilyCareApp.selectChatThread('${member.id}')">
                  <div class="contact-avatar-wrap">
                    <img src="${member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2563EB&color=fff`}" alt="${member.name}" class="contact-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2563EB&color=fff'">
                    <span class="online-dot"></span>
                  </div>
                  <div class="contact-meta">
                    <div class="contact-name-row">
                      <span class="contact-name">${member.name}</span>
                      <span class="contact-last-time">${lastMsg ? lastMsg.timestamp : ''}</span>
                    </div>
                    <div class="contact-snippet">
                      ${lastMsg ? (lastMsg.isSender ? 'You: ' : '') + lastMsg.text : 'Start conversation...'}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Main Chat Body -->
        <div class="chat-main">
          <!-- Chat Header -->
          <div class="chat-header-bar">
            <div class="chat-active-user">
              <img src="${activeContact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeContact.name)}&background=2563EB&color=fff`}" alt="${activeContact.name}" class="activity-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(activeContact.name)}&background=2563EB&color=fff'">
              <div>
                <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">${activeContact.name}</div>
                <div style="font-size: 0.74rem; color: var(--secondary); font-weight: 500;">
                  <i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> Active · ${activeContact.relation || 'Caregiver'}
                </div>
              </div>
            </div>
            ${activeContact.phone ? `
              <div>
                <a href="tel:${activeContact.phone}" class="btn btn-secondary btn-sm" title="Call Caregiver">
                  <i class="fa-solid fa-phone"></i> Call
                </a>
              </div>
            ` : ''}
          </div>

          <!-- Notice Banner -->
          <div class="chat-notice-banner">
            <i class="fa-solid fa-circle-info"></i>
            <span><strong>Private Family Thread:</strong> Messages are coordinated and stored securely in your browser.</span>
          </div>

          <!-- Message Bubbles -->
          <div class="chat-messages-area" id="chat-messages-container">
            ${threadMessages.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); margin: auto;">
                <i class="fa-regular fa-comments" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
                Send your first message to ${activeContact.name}.
              </div>
            ` : threadMessages.map(m => `
              <div class="msg-row ${m.isSender ? 'sent' : 'received'}">
                <img src="${m.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.senderName)}&background=2563EB&color=fff`}" alt="${m.senderName}" class="msg-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.senderName)}&background=2563EB&color=fff'">
                <div class="msg-bubble">
                  <div style="font-weight: 600; font-size: 0.72rem; margin-bottom: 2px; opacity: 0.9;">${m.senderName}</div>
                  <div>${m.text}</div>
                  <div class="msg-time tabular-nums">${m.timestamp}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Chat Input Form -->
          <form class="chat-input-bar" onsubmit="window.FamilyCareApp.sendChatMessage(event)">
            <input
              type="text"
              id="chat-message-input"
              class="chat-input"
              placeholder="Type a care update or message for ${activeContact.name}..."
              autocomplete="off"
              required
            />
            <button type="submit" class="btn btn-primary" style="border-radius: var(--radius-full); padding: 10px 18px;">
              <i class="fa-solid fa-paper-plane"></i> Send
            </button>
          </form>
        </div>
      </div>
    `}
  `;

  // Scroll to bottom
  setTimeout(() => {
    const box = document.getElementById('chat-messages-container');
    if (box) box.scrollTop = box.scrollHeight;
  }, 50);
}

export function selectChatThread(memberId) {
  activeThreadId = memberId;
  renderMessages();
}

export function sendChatMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chat-message-input');
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = '';

  const currentUser = store.getCurrentUser();
  const activeContact = store.getFamilyMembers().find(m => m.id === activeThreadId);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Add user message
  store.addMessage({
    threadWith: activeThreadId,
    senderId: currentUser ? currentUser.id : 'usr_me',
    senderName: currentUser ? currentUser.name : 'Me',
    senderAvatar: currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Me')}&background=2563EB&color=fff`,
    text: text,
    timestamp: timeStr,
    isSender: true
  });

  renderMessages();

  // Simulated auto-reply from connected caregiver
  if (activeContact) {
    setTimeout(() => {
      const replies = [
        `Thanks for the update! I have noted that down in the log.`,
        `Got it! I am currently checking on the schedule now. Everything is running smoothly.`,
        `Understood, thank you for letting me know! I will follow up shortly.`
      ];
      const replyText = replies[Math.floor(Math.random() * replies.length)];

      store.addMessage({
        threadWith: activeThreadId,
        senderId: activeContact.id,
        senderName: activeContact.name,
        senderAvatar: activeContact.avatar,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSender: false
      });

      store.addNotification({
        title: `New message from ${activeContact.name}`,
        message: replyText,
        time: 'Just now',
        type: 'message'
      });

      renderMessages();
    }, 1200);
  }
}
