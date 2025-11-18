// Matches Page Logic

let allMatches = [];

// Initialize matches page
document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('matches.html')) return;

  // Require authentication
  if (!Auth.requireAuth()) return;

  initMatchesPage();
});

async function initMatchesPage() {
  // Setup navbar
  setupMatchesNavbar();
  
  // Load matches
  await loadMatches();
}

// Setup Navbar
function setupMatchesNavbar() {
  const swipeBtn = document.getElementById('swipeBtn');
  const profileBtn = document.getElementById('profileBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (swipeBtn) {
    swipeBtn.addEventListener('click', () => {
      window.location.href = '/HTML/swipe.html';
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      window.location.href = '/HTML/profile.html';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        Auth.logout();
      }
    });
  }
}

// Load Matches
async function loadMatches() {
  Loading.show('Loading your matches...');

  try {
    const result = await MatchAPI.getMatches();

    if (result.success && result.data.matches) {
      allMatches = result.data.matches;
      renderMatches();
    } else {
      Toast.error('Failed to load matches');
      showEmptyState();
    }
  } catch (error) {
    console.error('Error loading matches:', error);
    Toast.error('Failed to load matches');
    showEmptyState();
  } finally {
    Loading.hide();
  }
}

// Render Matches
function renderMatches() {
  const matchesGrid = document.getElementById('matchesGrid');
  const matchCount = document.getElementById('matchCount');
  
  if (!matchesGrid) return;

  if (allMatches.length === 0) {
    showEmptyState();
    return;
  }

  // Update count
  if (matchCount) {
    matchCount.innerHTML = `You have <span>${allMatches.length}</span> ${allMatches.length === 1 ? 'match' : 'matches'}`;
  }

  // Render match cards
  matchesGrid.innerHTML = allMatches.map((match, index) => 
    createMatchCard(match, index)
  ).join('');

  // Add event listeners
  addMatchEventListeners();
}

// Create Match Card
function createMatchCard(match, index) {
  const user = match.user;
  const age = user.date_of_birth ? calculateAge(user.date_of_birth) : '?';
  const matchDate = formatMatchDate(match.matched_at);
  const interests = user.interests || [];
  const hasUnreadMessages = match.unread_count > 0;

  return `
    <div class="match-card" data-match-id="${match.match_id}" data-user-id="${user.user_id}">
      <div class="match-image">
        ${user.picture_url 
          ? `<img src="${escapeHtml(user.picture_url)}" alt="${escapeHtml(user.first_name)}">`
          : `<div class="profile-placeholder" style="background: ${getAvatarColor(user.first_name)}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 64px; color: white;">${getInitials(user.first_name)}</div>`
        }
        ${hasUnreadMessages ? `<div class="unread-badge">${match.unread_count}</div>` : ''}
        <div class="match-badge">Matched ${matchDate}</div>
      </div>
      <div class="match-info">
        <div class="match-name">
          ${escapeHtml(user.first_name)}, ${age}
        </div>
        <div class="match-details">
          <span class="match-detail-item">📍 ${escapeHtml(user.college_name || 'DU')}</span>
          ${user.gender ? `<span class="match-detail-item">• ${user.gender}</span>` : ''}
        </div>
        ${user.bio ? `
          <div class="match-bio">${escapeHtml(user.bio)}</div>
        ` : ''}
        ${interests.length > 0 ? `
          <div class="match-interests">
            ${interests.slice(0, 3).map(interest => 
              `<span class="match-interest-tag">${escapeHtml(interest.interest_name)}</span>`
            ).join('')}
            ${interests.length > 3 ? `<span class="match-interest-tag">+${interests.length - 3}</span>` : ''}
          </div>
        ` : ''}
        <div class="match-actions">
          <button class="match-btn btn-message" onclick="openChat(${user.user_id})">
            💬 Message
          </button>
          <button class="match-btn btn-unmatch" onclick="confirmUnmatch(${match.match_id}, '${escapeHtml(user.first_name)}')">
            ✕ Unmatch
          </button>
        </div>
      </div>
    </div>
  `;
}

// Add Event Listeners
function addMatchEventListeners() {
  const matchCards = document.querySelectorAll('.match-card');
  
  matchCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on buttons
      if (e.target.closest('.match-actions')) return;
      
      const userId = card.dataset.userId;
      openChat(userId);
    });
  });
}

// Open Chat
function openChat(userId) {
  window.location.href = `/HTML/chat.html?user=${userId}`;
}

// Confirm Unmatch
function confirmUnmatch(matchId, userName) {
  if (confirm(`Are you sure you want to unmatch with ${userName}? This action cannot be undone.`)) {
    unmatchUser(matchId);
  }
}

// Unmatch User
async function unmatchUser(matchId) {
  Loading.show('Unmatching...');

  try {
    const result = await MatchAPI.unmatch(matchId);

    if (result.success) {
      Toast.success('Unmatched successfully');
      
      // Remove from UI
      allMatches = allMatches.filter(m => m.match_id !== matchId);
      renderMatches();
    } else {
      Toast.error(result.error || 'Failed to unmatch');
    }
  } catch (error) {
    console.error('Error unmatching:', error);
    Toast.error('Failed to unmatch');
  } finally {
    Loading.hide();
  }
}

// Show Empty State
function showEmptyState() {
  const matchesGrid = document.getElementById('matchesGrid');
  const matchCount = document.getElementById('matchCount');
  
  if (!matchesGrid) return;

  if (matchCount) {
    matchCount.innerHTML = 'You have <span>0</span> matches';
  }

  matchesGrid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">💔</div>
      <h2>No Matches Yet</h2>
      <p>Start swiping to find your perfect match! Once you match with someone, they'll appear here.</p>
      <a href="/HTML/swipe.html" class="btn-start-swiping">Start Swiping</a>
    </div>
  `;
}

// Filter Matches (optional feature for future)
function filterMatches(filterType) {
  let filtered = [...allMatches];

  switch (filterType) {
    case 'recent':
      filtered.sort((a, b) => new Date(b.matched_at) - new Date(a.matched_at));
      break;
    case 'unread':
      filtered = filtered.filter(m => m.unread_count > 0);
      break;
    case 'all':
    default:
      break;
  }

  allMatches = filtered;
  renderMatches();
}

// Search Matches (optional feature)
function searchMatches(query) {
  if (!query.trim()) {
    loadMatches();
    return;
  }

  const searchTerm = query.toLowerCase();
  const filtered = allMatches.filter(match => 
    match.user.first_name.toLowerCase().includes(searchTerm) ||
    (match.user.bio && match.user.bio.toLowerCase().includes(searchTerm)) ||
    (match.user.college_name && match.user.college_name.toLowerCase().includes(searchTerm))
  );

  allMatches = filtered;
  renderMatches();
}
