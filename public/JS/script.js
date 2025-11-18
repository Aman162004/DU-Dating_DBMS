// DU Dating App - Client-side JavaScript

// API Configuration
const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let currentMatch = null;
let currentMatchUser = null;

// DOM Elements - will be initialized when DOM is ready
let authView, appView, loginSection, registerSection, profileView, swipeView, matchesView, chatView, loadingOverlay;
let navProfile, navSwipe, navMatches, navLogout;
let showRegister, showLogin;
let loginForm, registerForm, profileForm, messageForm;

// Utility Functions
function showLoading() {
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    clearToken();
    showAuthView();
    showToast('Session expired. Please login again.', 'error');
    throw new Error('Unauthorized');
  }
  
  return response;
}

// View Navigation
function showAuthView() {
  authView.classList.remove('hidden');
  appView.classList.add('hidden');
  loginSection.classList.remove('hidden');
  registerSection.classList.add('hidden');
}

function showAppView() {
  authView.classList.add('hidden');
  appView.classList.remove('hidden');
  showSwipeView();
}

function showProfileView() {
  hideAllViews();
  profileView.classList.remove('hidden');
  setActiveNav(navProfile);
  loadProfile();
}

function showSwipeView() {
  hideAllViews();
  swipeView.classList.remove('hidden');
  setActiveNav(navSwipe);
  loadNextProfile();
}

function showMatchesView() {
  hideAllViews();
  matchesView.classList.remove('hidden');
  setActiveNav(navMatches);
  loadMatches();
}

function showChatView(matchId, matchUser) {
  hideAllViews();
  chatView.classList.remove('hidden');
  currentMatch = matchId;
  currentMatchUser = matchUser;
  document.getElementById('chat-user-name').textContent = matchUser.name;
  loadMessages(matchId);
}

function hideAllViews() {
  profileView.classList.add('hidden');
  swipeView.classList.add('hidden');
  matchesView.classList.add('hidden');
  chatView.classList.add('hidden');
}

function setActiveNav(activeBtn) {
  [navProfile, navSwipe, navMatches].forEach(btn => {
    btn.classList.remove('active');
  });
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

// Authentication Handlers
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  showLoading();
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setToken(data.token);
      currentUser = data.user;
      showToast('Login successful!');
      showAppView();
    } else {
      showToast(data.message || data.error || 'Login failed', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const collegeId = document.getElementById('register-college').value;
  
  if (!collegeId) {
    showToast('Please select your college', 'error');
    return;
  }
  
  showLoading();
  
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: name, email, password, college_id: parseInt(collegeId) }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setToken(data.token);
      currentUser = data.user;
      showToast('Registration successful!');
      showAppView();
    } else {
      showToast(data.message || data.error || 'Registration failed', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

// Load Colleges for Registration
async function loadColleges() {
  try {
    const response = await fetch(`${API_BASE}/auth/colleges`);
    
    if (!response.ok) {
      console.error('Failed to load colleges:', response.status);
      return;
    }
    
    const data = await response.json();
    
    const select = document.getElementById('register-college');
    if (!select) {
      console.error('College select element not found');
      return;
    }
    
    select.innerHTML = '<option value="">Select your college</option>';
    
    if (data.colleges && Array.isArray(data.colleges)) {
      data.colleges.forEach(college => {
        const option = document.createElement('option');
        option.value = college.college_id;
        option.textContent = college.college_name;
        select.appendChild(option);
      });
      console.log(`Loaded ${data.colleges.length} colleges`);
    }
  } catch (error) {
    console.error('Error loading colleges:', error);
    showToast('Could not load colleges list', 'error');
  }
}

// Profile Management
async function loadProfile() {
  showLoading();
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/profile`);
    const data = await response.json();
    
    if (response.ok) {
      const profile = data.profile;
      currentUser = profile;
      
      document.getElementById('profile-bio').value = profile.bio || '';
      document.getElementById('profile-gender').value = profile.gender || '';
      document.getElementById('profile-seeking').value = profile.seeking || '';
      document.getElementById('profile-dob').value = profile.date_of_birth || '';
      document.getElementById('profile-picture').value = profile.picture_url || '';
      
      // Load all interests
      await loadAllInterests();
      
      // Mark selected interests
      const userInterests = profile.interests || [];
      document.querySelectorAll('.interest-item').forEach(item => {
        const interestName = item.dataset.interest;
        if (userInterests.includes(interestName)) {
          item.classList.add('selected');
        }
      });
    }
  } catch (error) {
    showToast('Error loading profile', 'error');
  } finally {
    hideLoading();
  }
}

async function loadAllInterests() {
  try {
    const response = await fetchWithAuth(`${API_BASE}/interests`);
    const data = await response.json();
    
    const container = document.getElementById('interests-container');
    container.innerHTML = '';
    
    data.interests.forEach(interest => {
      const div = document.createElement('div');
      div.className = 'interest-item';
      div.dataset.interest = interest.interest_name;
      div.textContent = interest.interest_name;
      div.addEventListener('click', () => {
        div.classList.toggle('selected');
      });
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error loading interests:', error);
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  
  const bio = document.getElementById('profile-bio').value;
  const gender = document.getElementById('profile-gender').value;
  const seeking = document.getElementById('profile-seeking').value;
  const dob = document.getElementById('profile-dob').value;
  const picture = document.getElementById('profile-picture').value;
  
  const selectedInterests = Array.from(document.querySelectorAll('.interest-item.selected'))
    .map(item => item.dataset.interest);
  
  showLoading();
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/profile`, {
      method: 'PUT',
      body: JSON.stringify({
        bio,
        gender,
        seeking,
        date_of_birth: dob,
        picture_url: picture,
        interests: selectedInterests,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Profile updated successfully!');
    } else {
      showToast(data.error || 'Failed to update profile', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

// Swipe Functionality
let currentSwipeProfile = null;

async function loadNextProfile() {
  showLoading();
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/users/potential`);
    const data = await response.json();
    
    if (response.ok && data.user) {
      currentSwipeProfile = data.user;
      displaySwipeCard(data.user);
    } else {
      displayNoMoreProfiles();
    }
  } catch (error) {
    showToast('Error loading profiles', 'error');
  } finally {
    hideLoading();
  }
}

function displaySwipeCard(user) {
  const container = document.getElementById('swipe-card');
  const swipeActions = document.getElementById('swipe-actions');
  
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const age = user.date_of_birth ? calculateAge(user.date_of_birth) : '';
  
  container.innerHTML = `
    <div class="profile-image">
      ${user.picture_url 
        ? `<img src="${user.picture_url}" alt="${user.name}">` 
        : `<div class="initials">${initials}</div>`}
    </div>
    <div class="profile-info">
      <h3>${user.name}${age ? `, ${age}` : ''}</h3>
      <p class="college">${user.college_name}</p>
      ${user.bio ? `<p class="bio">${user.bio}</p>` : ''}
      ${user.interests && user.interests.length > 0 ? `
        <div class="interests-tags">
          ${user.interests.map(interest => 
            `<span class="interest-tag">${interest}</span>`
          ).join('')}
        </div>
      ` : ''}
    </div>
  `;
  
  // Show swipe actions
  if (swipeActions) {
    swipeActions.classList.remove('hidden');
  }
}

function displayNoMoreProfiles() {
  const container = document.getElementById('swipe-card');
  const swipeActions = document.getElementById('swipe-actions');
  
  container.innerHTML = '<p class="loading">No more profiles available. Check back later!</p>';
  
  // Hide swipe actions
  if (swipeActions) {
    swipeActions.classList.add('hidden');
  }
}

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

async function handleSwipe(userId, liked) {
  showLoading();
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/swipe`, {
      method: 'POST',
      body: JSON.stringify({ target_user_id: userId, liked }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      if (data.matched) {
        showToast("🎉 It's a match!", 'success');
        setTimeout(() => {
          showMatchesView();
        }, 1500);
      } else {
        loadNextProfile();
      }
    } else {
      showToast(data.error || 'Swipe failed', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
    hideLoading();
  }
}

// Matches
async function loadMatches() {
  showLoading();
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/matches`);
    const data = await response.json();
    
    if (response.ok) {
      displayMatches(data.matches);
    } else {
      showToast('Error loading matches', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

function displayMatches(matches) {
  const list = document.getElementById('matches-list');
  
  if (matches.length === 0) {
    list.innerHTML = '<li style="text-align: center; padding: 2rem; color: #757575;">No matches yet. Keep swiping!</li>';
    return;
  }
  
  list.innerHTML = matches.map(match => {
    const initials = match.name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `
      <li class="match-item" data-match-id="${match.match_id}" data-user='${JSON.stringify(match)}'>
        <div class="match-avatar">${initials}</div>
        <div class="match-info">
          <h4>${match.name}</h4>
          <p>${match.college_name}</p>
        </div>
      </li>
    `;
  }).join('');
  
  // Add click handlers
  document.querySelectorAll('.match-item').forEach(item => {
    item.addEventListener('click', () => {
      const matchId = item.dataset.matchId;
      const matchUser = JSON.parse(item.dataset.user);
      showChatView(matchId, matchUser);
    });
  });
}

// Chat
async function loadMessages(matchId) {
  showLoading();
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/messages/${matchId}`);
    const data = await response.json();
    
    if (response.ok) {
      displayMessages(data.messages);
    } else {
      showToast('Error loading messages', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

function displayMessages(messages) {
  const container = document.getElementById('messages-container');
  
  if (messages.length === 0) {
    container.innerHTML = '<p class="loading">No messages yet. Start the conversation!</p>';
    return;
  }
  
  container.innerHTML = messages.map(msg => {
    const isSent = msg.sender_id === currentUser.id;
    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `
      <div class="message ${isSent ? 'sent' : 'received'}">
        ${msg.message}
        <span class="message-time">${time}</span>
      </div>
    `;
  }).join('');
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

async function handleSendMessage(e) {
  e.preventDefault();
  
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        match_id: currentMatch,
        message,
      }),
    });
    
    if (response.ok) {
      input.value = '';
      loadMessages(currentMatch);
    } else {
      showToast('Failed to send message', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
  }
}

function handleLogout() {
  clearToken();
  currentUser = null;
  showToast('Logged out successfully');
  showAuthView();
}

// Initialize App
async function initApp() {
  // Initialize DOM elements
  authView = document.getElementById('auth-view');
  appView = document.getElementById('app-view');
  loginSection = document.getElementById('login-section');
  registerSection = document.getElementById('register-section');
  profileView = document.getElementById('profile-view');
  swipeView = document.getElementById('swipe-view');
  matchesView = document.getElementById('matches-view');
  chatView = document.getElementById('chat-view');
  loadingOverlay = document.getElementById('loading');

  // Get navigation buttons using data-view attributes
  const navButtons = document.querySelectorAll('.nav-btn[data-view]');
  navProfile = Array.from(navButtons).find(btn => btn.dataset.view === 'profile-view');
  navSwipe = Array.from(navButtons).find(btn => btn.dataset.view === 'swipe-view');
  navMatches = Array.from(navButtons).find(btn => btn.dataset.view === 'matches-view');
  navLogout = document.getElementById('logout-btn');

  showRegister = document.getElementById('show-register');
  showLogin = document.getElementById('show-login');

  loginForm = document.getElementById('login-form');
  registerForm = document.getElementById('register-form');
  profileForm = document.getElementById('profile-form');
  messageForm = document.getElementById('message-form');

  // Set up event listeners
  setupEventListeners();

  // Load colleges
  await loadColleges();
  
  const token = getToken();
  if (token) {
    // Verify token by loading profile
    try {
      showLoading();
      const response = await fetchWithAuth(`${API_BASE}/profile`);
      if (response.ok) {
        const data = await response.json();
        currentUser = data.profile;
        showAppView();
      } else {
        showAuthView();
      }
    } catch (error) {
      showAuthView();
    } finally {
      hideLoading();
    }
  } else {
    showAuthView();
  }
}

function setupEventListeners() {
  // Auth Links
  if (showRegister) {
    showRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginSection.classList.add('hidden');
      registerSection.classList.remove('hidden');
    });
  }

  if (showLogin) {
    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerSection.classList.add('hidden');
      loginSection.classList.remove('hidden');
    });
  }

  // Forms
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);
  if (messageForm) messageForm.addEventListener('submit', handleSendMessage);

  // Swipe buttons - using correct IDs from HTML
  const likeBtn = document.getElementById('like-btn');
  const dislikeBtn = document.getElementById('dislike-btn');
  
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      if (currentSwipeProfile) {
        handleSwipe(currentSwipeProfile.id, true);
      }
    });
  }

  if (dislikeBtn) {
    dislikeBtn.addEventListener('click', () => {
      if (currentSwipeProfile) {
        handleSwipe(currentSwipeProfile.id, false);
      }
    });
  }

  // Navigation
  if (navProfile) navProfile.addEventListener('click', showProfileView);
  if (navSwipe) navSwipe.addEventListener('click', showSwipeView);
  if (navMatches) navMatches.addEventListener('click', showMatchesView);
  if (navLogout) navLogout.addEventListener('click', handleLogout);

  // Chat back button
  const backBtn = document.getElementById('back-to-matches');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showMatchesView();
    });
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
