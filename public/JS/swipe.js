// Swipe Page Logic - Tinder-style Card Swiping

let currentUsers = [];
let currentIndex = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let currentCard = null;
let lastSwipedUser = null;
let swipeHistory = [];

// Initialize swipe page
document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('swipe.html')) return;

  // Require authentication
  if (!Auth.requireAuth()) return;

  initSwipePage();
});

async function initSwipePage() {
  // Setup navbar
  setupNavbar();
  
  // Setup action buttons
  setupActionButtons();
  
  // Load potential users
  await loadPotentialUsers();
  
  // Setup swipe gestures
  setupSwipeGestures();
}

// Setup Navbar
function setupNavbar() {
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        Auth.logout();
      }
    });
  }
}

// Load Potential Users
async function loadPotentialUsers() {
  Loading.show('Finding profiles...');

  try {
    const result = await SwipeAPI.getPotentialUsers();

    if (result.success && result.data.users) {
      currentUsers = result.data.users;
      currentIndex = 0;

      if (currentUsers.length > 0) {
        renderCards();
      } else {
        showNoMoreCards();
      }
    } else {
      Toast.error('Failed to load profiles');
      showNoMoreCards();
    }
  } catch (error) {
    console.error('Error loading users:', error);
    Toast.error('Failed to load profiles');
  } finally {
    Loading.hide();
  }
}

// Render Cards
function renderCards() {
  const cardStack = document.getElementById('card-stack');
  
  if (!cardStack) return;

  cardStack.innerHTML = '';

  // Render up to 3 cards for stacking effect
  for (let i = 0; i < Math.min(3, currentUsers.length - currentIndex); i++) {
    const user = currentUsers[currentIndex + i];
    const card = createCard(user, i);
    cardStack.appendChild(card);
  }

  currentCard = cardStack.querySelector('.profile-card');
  
  // Show/hide no more cards message
  const noMoreCards = document.getElementById('no-more-cards');
  if (noMoreCards) {
    if (currentUsers.length - currentIndex === 0) {
      noMoreCards.classList.remove('hidden');
    } else {
      noMoreCards.classList.add('hidden');
    }
  }
}

// Create Profile Card
function createCard(user, stackPosition) {
  const card = document.createElement('div');
  card.className = 'profile-card';
  card.dataset.userId = user.user_id;

  const age = user.age || '?';
  const interests = user.interests || [];
  const matchedQualities = user.matchedQualities || [];
  const matchScore = user.matchScore || 0;
  
  // Prepare image gallery
  const images = [
    user.profile_picture_url,
    user.profile_picture_2_url,
    user.profile_picture_3_url
  ].filter(Boolean);
  
  card.innerHTML = `
    <div class="card-image">
      ${images.length > 0 
        ? `
          <div class="image-gallery">
            ${images.map((img, idx) => `
              <img src="${escapeHtml(img)}" 
                   alt="${escapeHtml(user.first_name)} - Photo ${idx + 1}" 
                   draggable="false"
                   class="gallery-image ${idx === 0 ? 'active' : ''}"
                   data-index="${idx}">
            `).join('')}
          </div>
          ${images.length > 1 ? `
            <div class="image-indicators">
              ${images.map((_, idx) => `
                <span class="indicator ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>
              `).join('')}
            </div>
          ` : ''}
        `
        : `<div class="profile-placeholder">${getInitials(user.first_name)}</div>`
      }
      <div class="card-label nope">NOPE</div>
      <div class="card-label like">LIKE</div>
      <div class="card-label star">SUPER<br/>LIKE</div>
      ${matchScore > 0 ? `<div class="match-score">${matchScore}% Match</div>` : ''}
    </div>
    <div class="card-info">
      <div class="card-name">
        ${escapeHtml(user.first_name)}, ${age}
      </div>
      <div class="card-details">
        <span class="card-details-icon">📍</span>
        ${escapeHtml(user.college_name || 'Delhi University')}
        ${user.gender ? ` • ${user.gender}` : ''}
        ${user.height ? ` • ${user.height}cm` : ''}
      </div>
      ${user.occupation ? `<div class="card-occupation">🎓 ${escapeHtml(user.occupation)}</div>` : ''}
      ${user.bio ? `<div class="card-bio">${escapeHtml(user.bio)}</div>` : ''}
      
      ${matchedQualities.length > 0 ? `
        <div class="matched-qualities-box">
          <div class="qualities-header">
            <span class="qualities-icon">✨</span>
            <span class="qualities-title">What You Have in Common</span>
          </div>
          <div class="qualities-list">
            ${matchedQualities.map(quality => `
              <div class="quality-item">
                <div class="quality-label">
                  ${quality.type === 'interests' ? '❤️' : 
                    quality.type === 'traits' ? '⭐' : 
                    quality.type === 'goal' ? '🎯' : '🌟'} 
                  ${escapeHtml(quality.label)}
                </div>
                <div class="quality-details">
                  ${quality.items.slice(0, 3).map(item => 
                    `<span class="quality-tag">${escapeHtml(item)}</span>`
                  ).join('')}
                  ${quality.items.length > 3 ? 
                    `<span class="quality-tag">+${quality.items.length - 3} more</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${interests.length > 0 ? `
        <div class="card-interests">
          <div class="interests-label">Interests</div>
          ${interests.slice(0, 5).map(interest => 
            `<span class="interest-tag">${escapeHtml(interest.interest_name)}</span>`
          ).join('')}
          ${interests.length > 5 ? `<span class="interest-tag">+${interests.length - 5} more</span>` : ''}
        </div>
      ` : ''}
    </div>
  `;

  // Add image gallery navigation if multiple images
  if (images.length > 1) {
    let currentImageIndex = 0;
    const cardImageDiv = card.querySelector('.card-image');
    
    cardImageDiv.addEventListener('click', (e) => {
      const clickX = e.offsetX;
      const cardWidth = cardImageDiv.offsetWidth;
      
      if (clickX < cardWidth / 2) {
        // Left side - previous image
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
      } else {
        // Right side - next image
        currentImageIndex = (currentImageIndex + 1) % images.length;
      }
      
      // Update active image
      card.querySelectorAll('.gallery-image').forEach((img, idx) => {
        img.classList.toggle('active', idx === currentImageIndex);
      });
      card.querySelectorAll('.indicator').forEach((indicator, idx) => {
        indicator.classList.toggle('active', idx === currentImageIndex);
      });
    });
  }

  return card;
}

// Setup Action Buttons
function setupActionButtons() {
  const undoBtn = document.getElementById('btn-undo');
  const dislikeBtn = document.getElementById('btn-dislike');
  const starBtn = document.getElementById('btn-star');
  const likeBtn = document.getElementById('btn-like');
  const boostBtn = document.getElementById('btn-boost');

  if (undoBtn) {
    undoBtn.addEventListener('click', handleUndo);
  }

  if (dislikeBtn) {
    dislikeBtn.addEventListener('click', () => handleSwipe('dislike'));
  }

  if (starBtn) {
    starBtn.addEventListener('click', () => handleSwipe('superlike'));
  }

  if (likeBtn) {
    likeBtn.addEventListener('click', () => handleSwipe('like'));
  }

  if (boostBtn) {
    boostBtn.addEventListener('click', () => {
      Toast.info('Boost feature coming soon! 🚀');
    });
  }
}

// Handle Undo
function handleUndo() {
  if (swipeHistory.length === 0) {
    Toast.info('No more actions to undo');
    return;
  }

  const lastAction = swipeHistory.pop();
  
  // Move back index
  if (currentIndex > 0) {
    currentIndex--;
    renderCards();
    updateUndoButton();
    Toast.success('Action undone!');
  }
}

// Update Undo Button State
function updateUndoButton() {
  const undoBtn = document.getElementById('btn-undo');
  if (undoBtn) {
    undoBtn.disabled = swipeHistory.length === 0;
  }
}

// Setup Swipe Gestures
function setupSwipeGestures() {
  const cardStack = document.getElementById('card-stack');
  
  if (!cardStack) return;

  // Touch events
  cardStack.addEventListener('touchstart', handleDragStart, { passive: true });
  cardStack.addEventListener('touchmove', handleDragMove, { passive: false });
  cardStack.addEventListener('touchend', handleDragEnd);

  // Mouse events
  cardStack.addEventListener('mousedown', handleDragStart);
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);
}

function handleDragStart(e) {
  if (!currentCard || e.target.closest('.card-info-btn')) return;

  isDragging = true;
  currentCard.classList.add('swiping');
  
  const touch = e.type.includes('mouse') ? e : e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  currentX = startX;
  currentY = startY;
}

function handleDragMove(e) {
  if (!isDragging || !currentCard) return;

  e.preventDefault();
  
  const touch = e.type.includes('mouse') ? e : e.touches[0];
  const deltaX = touch.clientX - startX;
  const deltaY = touch.clientY - startY;
  const rotation = deltaX * 0.1;

  currentCard.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${rotation}deg)`;

  // Show appropriate labels
  currentCard.classList.remove('dragging-right', 'dragging-left', 'dragging-up');
  
  if (deltaY < -80 && Math.abs(deltaX) < 80) {
    currentCard.classList.add('dragging-up');
  } else if (deltaX > 50) {
    currentCard.classList.add('dragging-right');
  } else if (deltaX < -50) {
    currentCard.classList.add('dragging-left');
  }
}

function handleDragEnd(e) {
  if (!isDragging || !currentCard) return;

  isDragging = false;
  currentCard.classList.remove('swiping');

  const touch = e.type.includes('mouse') ? e : e.changedTouches[0];
  const deltaX = touch.clientX - startX;
  const deltaY = touch.clientY - startY;

  // Determine swipe action
  if (deltaY < -120 && Math.abs(deltaX) < 100) {
    handleSwipe('superlike');
  } else if (deltaX > 120) {
    handleSwipe('like');
  } else if (deltaX < -120) {
    handleSwipe('dislike');
  } else {
    // Reset card position
    currentCard.style.transform = '';
    currentCard.classList.remove('dragging-right', 'dragging-left', 'dragging-up');
  }
}

// Handle Swipe Action
async function handleSwipe(action) {
  if (!currentCard) return;

  const userId = parseInt(currentCard.dataset.userId);
  const user = currentUsers[currentIndex];

  // Determine swipe direction and liked status
  let liked = false;
  let animationClass = 'swipe-left';

  if (action === 'like' || action === 'superlike') {
    liked = true;
    animationClass = 'swipe-right';
  }

  // Add to history
  swipeHistory.push({ userId, action, index: currentIndex });
  updateUndoButton();

  // Animate card away
  currentCard.classList.add(animationClass);
  currentCard.classList.remove('dragging-right', 'dragging-left', 'dragging-up');

  // Show feedback
  if (action === 'superlike') {
    Toast.success('Super Liked! ⭐');
  }

  // Send swipe to backend
  try {
    const result = await SwipeAPI.swipe(userId, liked);

    // Check for match
    if (result.success && result.data.match) {
      setTimeout(() => showMatchModal(user), 300);
    }
  } catch (error) {
    console.error('Swipe error:', error);
  }

  // Move to next card
  setTimeout(() => {
    currentIndex++;
    
    if (currentIndex < currentUsers.length) {
      renderCards();
    } else {
      showNoMoreCards();
    }
  }, 400);
}

// Show Match Modal
function showMatchModal(user) {
  const modal = document.getElementById('match-modal');
  const currentUser = Auth.getUser();
  
  if (!modal) return;

  const matchName = document.getElementById('match-name');
  const avatar1 = document.getElementById('match-avatar-1');
  const avatar2 = document.getElementById('match-avatar-2');
  const sendMessageBtn = document.getElementById('send-message-btn');
  const keepSwipingBtn = document.getElementById('keep-swiping-btn');

  if (matchName) {
    matchName.textContent = user.first_name;
  }

  // Set avatars
  if (avatar1 && currentUser) {
    avatar1.innerHTML = currentUser.picture_url 
      ? `<img src="${currentUser.picture_url}" alt="You">`
      : `<div style="background: ${getAvatarColor(currentUser.first_name)}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 60px; color: white; font-weight: 700;">${getInitials(currentUser.first_name)}</div>`;
  }

  if (avatar2) {
    avatar2.innerHTML = user.picture_url 
      ? `<img src="${user.picture_url}" alt="${user.first_name}">`
      : `<div style="background: ${getAvatarColor(user.first_name)}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 60px; color: white; font-weight: 700;">${getInitials(user.first_name)}</div>`;
  }

  // Setup button handlers
  if (sendMessageBtn) {
    sendMessageBtn.onclick = () => {
      window.location.href = `/HTML/chat.html?user=${user.user_id}`;
    };
  }

  if (keepSwipingBtn) {
    keepSwipingBtn.onclick = closeMatchModal;
  }

  modal.classList.add('active');
}

function closeMatchModal() {
  const modal = document.getElementById('match-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Show No More Cards
function showNoMoreCards() {
  const noMoreCards = document.getElementById('no-more-cards');
  
  if (noMoreCards) {
    noMoreCards.classList.remove('hidden');
  }
}
