// Authentication Logic for Login and Register Pages

let currentStep = 1;
const totalSteps = 3;
let selectedInterests = [];
let selectedTraits = [];

// Initialize auth pages
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;

  // Redirect if already logged in
  if (Auth.isAuthenticated() && (currentPage.includes('login.html') || currentPage.includes('register.html'))) {
    window.location.href = '/HTML/swipe.html';
    return;
  }

  if (currentPage.includes('login.html')) {
    initLoginPage();
  } else if (currentPage.includes('register.html')) {
    initRegisterPage();
  }
});

// Login Page Logic
function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Validation
    if (!Validate.email(email)) {
      Toast.error('Please enter a valid email address');
      return;
    }

    if (!Validate.password(password)) {
      Toast.error('Password must be at least 6 characters');
      return;
    }

    // Show loading
    Loading.show('Logging in...');

    try {
      const result = await AuthAPI.login(email, password);

      if (result.success) {
        // Store token and user data
        Auth.setToken(result.data.token);
        Auth.setUser(result.data.user);

        Toast.success('Login successful! 🎉');
        
        // Redirect to swipe page
        setTimeout(() => {
          window.location.href = '/HTML/swipe.html';
        }, 500);
      } else {
        Toast.error(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.error('An error occurred. Please try again.');
    } finally {
      Loading.hide();
    }
  });
}

// Register Page Logic
function initRegisterPage() {
  const registerForm = document.getElementById('register-form');
  const collegeSelect = document.getElementById('register-college');

  if (!registerForm) return;

  // Load colleges and interests
  loadColleges();
  loadInterests();

  // Setup multi-step form
  setupMultiStepForm();
  setupCheckboxGroups();

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather all form data
    const formData = {
      // Basic info
      first_name: document.getElementById('register-name').value.trim(),
      email: document.getElementById('register-email').value.trim(),
      college_id: parseInt(collegeSelect.value),
      password: document.getElementById('register-password').value,
      
      // Profile data
      date_of_birth: document.getElementById('register-dob').value,
      gender: document.getElementById('register-gender').value,
      bio: document.getElementById('register-bio').value.trim(),
      height: document.getElementById('register-height').value || null,
      seeking: document.getElementById('register-seeking').value,
      relationship_goal: document.getElementById('register-relationship-goal').value,
      occupation: document.getElementById('register-occupation').value.trim() || null,
      
      // Lifestyle
      lifestyle_drinking: document.getElementById('register-drinking').value || null,
      lifestyle_smoking: document.getElementById('register-smoking').value || null,
      lifestyle_exercise: document.getElementById('register-exercise').value || null,
      
      // Interests and traits
      interest_ids: selectedInterests,
      personality_traits: selectedTraits,
      looking_for: document.getElementById('register-looking-for').value.trim() || null
    };

    // Validation
    if (!Validate.required(formData.first_name)) {
      Toast.error('Please enter your name');
      return;
    }

    if (!Validate.email(formData.email)) {
      Toast.error('Please enter a valid email address');
      return;
    }

    if (!formData.college_id) {
      Toast.error('Please select your college');
      return;
    }

    if (!Validate.password(formData.password)) {
      Toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.bio || formData.bio.length < 50) {
      Toast.error('Bio must be at least 50 characters');
      return;
    }

    if (selectedInterests.length < 3) {
      Toast.error('Please select at least 3 interests');
      return;
    }

    // Show loading
    Loading.show('Creating your account...');

    try {
      const result = await AuthAPI.register(formData);

      if (result.success) {
        // Store token and user data
        Auth.setToken(result.data.token);
        Auth.setUser(result.data.user);

        Toast.success('Account created successfully! 🎉');
        
        // Redirect to swipe page directly
        setTimeout(() => {
          window.location.href = '/HTML/swipe.html';
        }, 1000);
      } else {
        Toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Toast.error('An error occurred. Please try again.');
    } finally {
      Loading.hide();
    }
  });
}

// Multi-step form functionality
function setupMultiStepForm() {
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const submitBtn = document.getElementById('submit-btn');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
          currentStep++;
          updateStep();
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStep();
      }
    });
  }
}

function validateCurrentStep() {
  if (currentStep === 1) {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const college = document.getElementById('register-college').value;
    const password = document.getElementById('register-password').value;
    const dob = document.getElementById('register-dob').value;
    const gender = document.getElementById('register-gender').value;

    if (!name || !email || !college || !password || !dob || !gender) {
      Toast.error('Please fill in all required fields');
      return false;
    }
    if (!Validate.email(email)) {
      Toast.error('Please enter a valid email address');
      return false;
    }
    if (!Validate.password(password)) {
      Toast.error('Password must be at least 6 characters');
      return false;
    }
  } else if (currentStep === 2) {
    const bio = document.getElementById('register-bio').value.trim();
    const seeking = document.getElementById('register-seeking').value;
    const relationshipGoal = document.getElementById('register-relationship-goal').value;

    if (!bio || !seeking || !relationshipGoal) {
      Toast.error('Please fill in all required fields');
      return false;
    }
    if (bio.length < 50) {
      Toast.error('Bio must be at least 50 characters');
      return false;
    }
  } else if (currentStep === 3) {
    if (selectedInterests.length < 3) {
      Toast.error('Please select at least 3 interests');
      return false;
    }
  }
  return true;
}

function updateStep() {
  // Hide all steps
  document.querySelectorAll('.form-step').forEach(step => {
    step.classList.remove('active');
  });

  // Show current step
  const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if (currentStepElement) {
    currentStepElement.classList.add('active');
  }

  // Update progress bar
  document.querySelectorAll('.progress-step').forEach((step, index) => {
    if (index < currentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });

  // Update buttons
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');

  if (prevBtn) {
    prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
  }

  if (nextBtn && submitBtn) {
    if (currentStep === totalSteps) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'block';
    } else {
      nextBtn.style.display = 'block';
      submitBtn.style.display = 'none';
    }
  }
}

// Setup checkbox groups for interests and traits
function setupCheckboxGroups() {
  // Traits checkboxes
  const traitsGroup = document.getElementById('traits-group');
  if (traitsGroup) {
    traitsGroup.addEventListener('click', (e) => {
      const item = e.target.closest('.checkbox-item');
      if (item) {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const value = checkbox.value;
        
        if (checkbox.checked) {
          checkbox.checked = false;
          item.classList.remove('selected');
          selectedTraits = selectedTraits.filter(t => t !== value);
        } else {
          checkbox.checked = true;
          item.classList.add('selected');
          selectedTraits.push(value);
        }
      }
    });
  }
}

// Setup image upload
// Load Colleges into Select Dropdown
async function loadColleges() {
  const collegeSelect = document.getElementById('register-college');
  
  if (!collegeSelect) return;

  try {
    const result = await AuthAPI.getColleges();

    if (result.success && result.data.colleges) {
      collegeSelect.innerHTML = '<option value="">Select your college *</option>';
      
      result.data.colleges.forEach(college => {
        const option = document.createElement('option');
        option.value = college.college_id;
        option.textContent = college.college_name;
        collegeSelect.appendChild(option);
      });
    } else {
      Toast.error('Failed to load colleges');
    }
  } catch (error) {
    console.error('Error loading colleges:', error);
    Toast.error('Failed to load colleges');
  }
}

// Load Interests
async function loadInterests() {
  const interestsGroup = document.getElementById('interests-group');
  
  if (!interestsGroup) return;

  try {
    const result = await fetch('/api/interests');
    const data = await result.json();

    if (data.success && data.interests) {
      interestsGroup.innerHTML = '';
      
      data.interests.forEach(interest => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        label.innerHTML = `
          <input type="checkbox" value="${interest.interest_id}">
          <span>${interest.interest_name}</span>
        `;
        label.addEventListener('click', (e) => {
          const checkbox = label.querySelector('input[type="checkbox"]');
          const interestId = parseInt(checkbox.value);
          
          if (checkbox.checked) {
            checkbox.checked = false;
            label.classList.remove('selected');
            selectedInterests = selectedInterests.filter(id => id !== interestId);
          } else {
            checkbox.checked = true;
            label.classList.add('selected');
            selectedInterests.push(interestId);
          }
        });
        
        interestsGroup.appendChild(label);
      });
    }
  } catch (error) {
    console.error('Error loading interests:', error);
  }
}
