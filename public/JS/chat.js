// Chat Page Logic

let currentMatchId = null;
let currentChatUser = null;
let messages = [];
let messagePollingInterval = null;

// Initialize chat page
document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('chat.html')) return;

  // Require authentication
  if (!Auth.requireAuth()) return;

  initChatPage();
});

async function initChatPage() {
  // Get user ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user');

  if (!userId) {
    Toast.error('No user specified');
    window.location.href = '/HTML/matches.html';
    return;
  }

  // Find the match
  await findMatch(userId);
  
  if (!currentMatchId) {
    Toast.error('Match not found');
    window.location.href = '/HTML/matches.html';
    return;
  }

  // Setup UI
  setupChatHeader();
  setupMessageForm();
  
  // Load messages
  await loadMessages();
  
  // Start polling for new messages
  startMessagePolling();
}

// Find Match by User ID
async function findMatch(userId) {
  Loading.show('Loading chat...');

  try {
    const result = await MatchAPI.getMatches();

    if (result.success && result.data.matches) {
      const match = result.data.matches.find(m => m.user.user_id === parseInt(userId));
      
      if (match) {
        currentMatchId = match.match_id;
        currentChatUser = match.user;
      }
    }
  } catch (error) {
    console.error('Error finding match:', error);
  } finally {
    Loading.hide();
  }
}

// Setup Chat Header
function setupChatHeader() {
  const backBtn = document.getElementById('backBtn');
  const chatUserName = document.getElementById('chatUserName');
  const chatUserStatus = document.getElementById('chatUserStatus');
  const chatUserAvatar = document.getElementById('chatUserAvatar');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/HTML/matches.html';
    });
  }

  if (!currentChatUser) return;

  const age = currentChatUser.date_of_birth ? calculateAge(currentChatUser.date_of_birth) : '';
  
  if (chatUserName) {
    chatUserName.textContent = `${currentChatUser.first_name}${age ? ', ' + age : ''}`;
  }

  if (chatUserStatus) {
    const isOnline = isUserOnline(currentChatUser.user_id);
    chatUserStatus.innerHTML = isOnline 
      ? '<span class="online-indicator"></span> Online'
      : currentChatUser.college_name || 'DU';
  }

  if (chatUserAvatar) {
    if (currentChatUser.picture_url) {
      chatUserAvatar.innerHTML = `<img src="${escapeHtml(currentChatUser.picture_url)}" alt="${escapeHtml(currentChatUser.first_name)}">`;
    } else {
      chatUserAvatar.innerHTML = getInitials(currentChatUser.first_name);
      chatUserAvatar.style.background = getAvatarColor(currentChatUser.first_name);
    }
  }
}

// Setup Message Form
function setupMessageForm() {
  const messageForm = document.getElementById('messageForm');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');

  if (!messageForm || !messageInput) return;

  // Auto-resize textarea
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
    
    // Enable/disable send button
    if (sendBtn) {
      sendBtn.disabled = !messageInput.value.trim();
    }
  });

  // Handle Enter key (send on Enter, new line on Shift+Enter)
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      messageForm.dispatchEvent(new Event('submit'));
    }
  });

  // Form submission
  messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await sendMessage();
  });
}

// Load Messages
async function loadMessages() {
  if (!currentMatchId) return;

  try {
    const result = await MessageAPI.getMessages(currentMatchId);

    if (result.success && result.data.messages) {
      messages = result.data.messages;
      renderMessages();
      scrollToBottom();
      
      // Mark as read
      await MessageAPI.markAsRead(currentMatchId);
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    showEmptyChatState();
  }
}

// Render Messages
function renderMessages() {
  const messagesContainer = document.getElementById('messagesContainer');
  const currentUser = Auth.getUser();
  
  if (!messagesContainer) return;

  if (messages.length === 0) {
    showEmptyChatState();
    return;
  }

  let lastDate = null;
  let html = '';

  messages.forEach((message, index) => {
    const messageDate = new Date(message.created_at).toDateString();
    
    // Add date separator
    if (messageDate !== lastDate) {
      html += `
        <div class="date-separator">
          <span>${formatMatchDate(message.created_at)}</span>
        </div>
      `;
      lastDate = messageDate;
    }

    const isSent = message.sender_id === currentUser.user_id;
    const messageClass = isSent ? 'sent' : 'received';
    const showAvatar = !isSent;

    html += `
      <div class="message ${messageClass}">
        ${showAvatar ? `
          <div class="message-avatar">
            ${currentChatUser.picture_url 
              ? `<img src="${escapeHtml(currentChatUser.picture_url)}" alt="${escapeHtml(currentChatUser.first_name)}">`
              : `<div style="background: ${getAvatarColor(currentChatUser.first_name)}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 16px; color: white;">${getInitials(currentChatUser.first_name)}</div>`
            }
          </div>
        ` : ''}
        <div class="message-content">
          <div class="message-bubble">
            ${escapeHtml(message.content)}
          </div>
          <div class="message-time">
            ${formatTime(message.created_at)}
          </div>
        </div>
      </div>
    `;
  });

  messagesContainer.innerHTML = html;
}

// Send Message
async function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  
  if (!messageInput || !currentMatchId) return;

  const content = messageInput.value.trim();

  if (!content) return;

  // Disable input while sending
  messageInput.disabled = true;

  try {
    const result = await MessageAPI.sendMessage(currentMatchId, content);

    if (result.success) {
      // Clear input
      messageInput.value = '';
      messageInput.style.height = 'auto';
      
      // Add message to UI immediately
      messages.push(result.data.message);
      renderMessages();
      scrollToBottom();
    } else {
      Toast.error(result.error || 'Failed to send message');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    Toast.error('Failed to send message');
  } finally {
    messageInput.disabled = false;
    messageInput.focus();
  }
}

// Scroll to Bottom
function scrollToBottom(smooth = true) {
  const messagesContainer = document.getElementById('messagesContainer');
  
  if (!messagesContainer) return;

  messagesContainer.scrollTo({
    top: messagesContainer.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

// Show Empty Chat State
function showEmptyChatState() {
  const messagesContainer = document.getElementById('messagesContainer');
  
  if (!messagesContainer || !currentChatUser) return;

  messagesContainer.innerHTML = `
    <div class="empty-chat">
      <div class="empty-chat-icon">👋</div>
      <h3>Say Hi to ${escapeHtml(currentChatUser.first_name)}!</h3>
      <p>Start the conversation and get to know each other better.</p>
    </div>
  `;
}

// Start Message Polling
function startMessagePolling() {
  // Poll for new messages every 5 seconds
  messagePollingInterval = setInterval(async () => {
    if (!currentMatchId) return;

    try {
      const result = await MessageAPI.getMessages(currentMatchId);

      if (result.success && result.data.messages) {
        const newMessages = result.data.messages;
        
        // Check if there are new messages
        if (newMessages.length > messages.length) {
          const wasAtBottom = isScrolledToBottom();
          messages = newMessages;
          renderMessages();
          
          // Only auto-scroll if user was already at bottom
          if (wasAtBottom) {
            scrollToBottom();
          }
          
          // Mark as read
          await MessageAPI.markAsRead(currentMatchId);
        }
      }
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  }, 5000);
}

// Check if scrolled to bottom
function isScrolledToBottom() {
  const messagesContainer = document.getElementById('messagesContainer');
  
  if (!messagesContainer) return true;

  const threshold = 100;
  const position = messagesContainer.scrollTop + messagesContainer.clientHeight;
  const height = messagesContainer.scrollHeight;
  
  return position >= height - threshold;
}

// Stop Message Polling
function stopMessagePolling() {
  if (messagePollingInterval) {
    clearInterval(messagePollingInterval);
    messagePollingInterval = null;
  }
}

// Show Typing Indicator (placeholder for WebSocket)
function showTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  
  if (typingIndicator) {
    typingIndicator.classList.add('active');
  }
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  
  if (typingIndicator) {
    typingIndicator.classList.remove('active');
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopMessagePolling();
});

// Optional: Add emoji picker functionality
function insertEmoji(emoji) {
  const messageInput = document.getElementById('messageInput');
  
  if (!messageInput) return;

  const cursorPos = messageInput.selectionStart;
  const textBefore = messageInput.value.substring(0, cursorPos);
  const textAfter = messageInput.value.substring(cursorPos);
  
  messageInput.value = textBefore + emoji + textAfter;
  messageInput.focus();
  messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
  
  // Trigger input event to resize
  messageInput.dispatchEvent(new Event('input'));
}
