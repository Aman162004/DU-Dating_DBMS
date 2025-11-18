// Profile Page Logic

let availableInterests = [];
let selectedInterests = [];
let currentProfile = null;

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('profile.html')) return;

  // Require authentication
  if (!Auth.requireAuth()) return;

  initProfilePage();
});

async function initProfilePage() {
  // Setup navbar
  setupProfileNavbar();
  
  // Load interests
  await loadInterests();
  
  // Load current profile
  await loadProfile();
  
  // Setup form handlers
  setupProfileForm();
  
  // Setup character counter for bio
  setupBioCounter();
}

// Setup Navbar
function setupProfileNavbar() {
  const swipeBtn = document.querySelector('a[href="swipe.html"]');
  const matchesBtn = document.querySelector('a[href="matches.html"]');
  const logoutBtn = document.getElementById('logout-btn');

  if (swipeBtn) {
    swipeBtn.addEventListener('click', () => {
      window.location.href = '/HTML/swipe.html';
    });
  }

  if (matchesBtn) {
    matchesBtn.addEventListener('click', () => {
      window.location.href = '/HTML/matches.html';
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

// Load Interests
async function loadInterests() {
  try {
    const result = await ProfileAPI.getInterests();

    if (result.success && result.data.interests) {
      availableInterests = result.data.interests;
      renderInterests();
    } else {
      Toast.error('Failed to load interests');
    }
  } catch (error) {
    console.error('Error loading interests:', error);
    Toast.error('Failed to load interests');
  }
}

// Render Interests
function renderInterests() {
  const interestsGrid = document.getElementById('interests-container');
  
  if (!interestsGrid) return;

  interestsGrid.innerHTML = availableInterests.map(interest => `
    <div class="interest-item">
      <input 
        type="checkbox" 
        id="interest-${interest.interest_id}" 
        class="interest-checkbox" 
        value="${interest.interest_id}"
        ${selectedInterests.includes(interest.interest_id) ? 'checked' : ''}
      >
      <label for="interest-${interest.interest_id}" class="interest-label">
        ${escapeHtml(interest.interest_name)}
      </label>
    </div>
  `).join('');

  // Add event listeners
  interestsGrid.querySelectorAll('.interest-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleInterestChange);
  });

  updateInterestCounter();
}

// Handle Interest Change
function handleInterestChange(e) {
  const interestId = parseInt(e.target.value);
  const maxInterests = 5;

  if (e.target.checked) {
    if (selectedInterests.length >= maxInterests) {
      Toast.warning(`You can select up to ${maxInterests} interests only`);
      e.target.checked = false;
      return;
    }
    selectedInterests.push(interestId);
  } else {
    selectedInterests = selectedInterests.filter(id => id !== interestId);
  }

  updateInterestCounter();
}

// Update Interest Counter
function updateInterestCounter() {
  const counter = document.getElementById('interestCounter');
  
  if (!counter) return;

  counter.textContent = `${selectedInterests.length}/5 selected`;
  
  if (selectedInterests.length >= 5) {
    counter.classList.add('max');
  } else {
    counter.classList.remove('max');
  }
}

// Load Current Profile
async function loadProfile() {
  Loading.show('Loading your profile...');

  try {
    const result = await ProfileAPI.getProfile();

    if (result.success && result.data.profile) {
      currentProfile = result.data.profile;
      populateProfileForm(currentProfile);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    Toast.error('Failed to load profile');
  } finally {
    Loading.hide();
  }
}

// Populate Profile Form
function populateProfileForm(profile) {
  // Basic info
  if (profile.bio) {
    document.getElementById('profile-bio').value = profile.bio;
  }
  
  if (profile.gender) {
    document.getElementById('profile-gender').value = profile.gender;
  }
  
  if (profile.seeking) {
    document.getElementById('profile-seeking').value = profile.seeking;
  }
  
  if (profile.date_of_birth) {
    document.getElementById('profile-dob').value = profile.date_of_birth;
  }
  
  if (profile.picture_url) {
    document.getElementById('profile-picture').value = profile.picture_url;
    updatePicturePreview(profile.picture_url);
  }

  // Interests
  if (profile.interests && Array.isArray(profile.interests)) {
    selectedInterests = profile.interests.map(i => i.interest_id);
    renderInterests();
  }

  // Update completeness
  updateProfileCompleteness(profile);
}

// Update Picture Preview
function updatePicturePreview(url) {
  const preview = document.getElementById('picturePreview');
  const currentUser = Auth.getUser();
  
  if (!preview) return;

  if (url) {
    preview.innerHTML = `<img src="${escapeHtml(url)}" alt="Profile Picture">`;
  } else {
    preview.innerHTML = getInitials(currentUser.first_name);
    preview.style.background = getAvatarColor(currentUser.first_name);
  }
}

// Setup Profile Form
function setupProfileForm() {
  const profileForm = document.getElementById('profile-form');
  const pictureUrl = document.getElementById('profile-picture');

  if (!profileForm) return;

  // Picture URL change
  if (pictureUrl) {
    pictureUrl.addEventListener('change', (e) => {
      updatePicturePreview(e.target.value);
    });
  }

  // Form submission
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProfile();
  });
}

// Save Profile
async function saveProfile() {
  const bio = document.getElementById('profile-bio').value.trim();
  const gender = document.getElementById('profile-gender').value;
  const seeking = document.getElementById('profile-seeking').value;
  const dateOfBirth = document.getElementById('profile-dob').value;
  const pictureUrl = document.getElementById('profile-picture').value.trim();

  // Validation
  if (!gender) {
    Toast.error('Please select your gender');
    return;
  }

  if (!seeking) {
    Toast.error('Please select who you are interested in');
    return;
  }

  if (!dateOfBirth) {
    Toast.error('Please enter your date of birth');
    return;
  }

  if (!Validate.age(dateOfBirth, 18)) {
    Toast.error('You must be at least 18 years old');
    return;
  }

  if (selectedInterests.length === 0) {
    Toast.warning('Consider adding at least one interest');
  }

  const profileData = {
    bio,
    gender,
    seeking,
    date_of_birth: dateOfBirth,
    picture_url: pictureUrl || null,
    interests: selectedInterests
  };

  Loading.show('Saving your profile...');

  try {
    const result = await ProfileAPI.updateProfile(profileData);

    if (result.success) {
      Toast.success('Profile updated successfully! 🎉');
      
      // Update stored user data
      const user = Auth.getUser();
      Auth.setUser({ ...user, ...profileData });

      // Redirect to swipe page after a delay
      setTimeout(() => {
        window.location.href = '/HTML/swipe.html';
      }, 1500);
    } else {
      Toast.error(result.error || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    Toast.error('Failed to update profile');
  } finally {
    Loading.hide();
  }
}

// Setup Bio Counter
function setupBioCounter() {
  const bioTextarea = document.getElementById('profile-bio');
  const charCounter = document.getElementById('charCounter');
  
  if (!bioTextarea || !charCounter) return;

  const maxLength = 500;

  bioTextarea.addEventListener('input', () => {
    const length = bioTextarea.value.length;
    charCounter.textContent = `${length}/${maxLength}`;

    if (length > maxLength * 0.9) {
      charCounter.classList.add('danger');
      charCounter.classList.remove('warning');
    } else if (length > maxLength * 0.7) {
      charCounter.classList.add('warning');
      charCounter.classList.remove('danger');
    } else {
      charCounter.classList.remove('warning', 'danger');
    }
  });
}

// Update Profile Completeness
function updateProfileCompleteness(profile) {
  const completenessBar = document.getElementById('completenessBar');
  const completenessPercentage = document.getElementById('completenessPercentage');
  
  if (!completenessBar || !completenessPercentage) return;

  let score = 0;
  const maxScore = 6;

  if (profile.bio && profile.bio.length > 20) score++;
  if (profile.gender) score++;
  if (profile.seeking) score++;
  if (profile.date_of_birth) score++;
  if (profile.picture_url) score++;
  if (profile.interests && profile.interests.length > 0) score++;

  const percentage = Math.round((score / maxScore) * 100);
  
  completenessBar.style.width = `${percentage}%`;
  completenessPercentage.textContent = `${percentage}%`;
}

// Cancel and go back
function cancelProfile() {
  if (confirm('Discard changes and go back?')) {
    window.location.href = '/HTML/swipe.html';
  }
}
