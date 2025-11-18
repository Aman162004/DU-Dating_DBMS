// Utility Functions for DU Dating App

// Toast Notification System
const Toast = {
  show(message, type = 'info', duration = 3000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(message, duration) {
    this.show(message, 'success', duration);
  },

  error(message, duration) {
    this.show(message, 'error', duration);
  },

  warning(message, duration) {
    this.show(message, 'warning', duration);
  },

  info(message, duration) {
    this.show(message, 'info', duration);
  }
};

// Loading Overlay
const Loading = {
  show(message = 'Loading...') {
    let overlay = document.getElementById('loading-overlay');
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">${message}</p>
        </div>
      `;
      document.body.appendChild(overlay);
    } else {
      const text = overlay.querySelector('.loading-text');
      if (text) text.textContent = message;
    }

    overlay.classList.add('active');
  },

  hide() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }
};

// Local Storage Helper
const Storage = {
  set(key, value) {
    try {
      // Special handling for token (JWT is already a string)
      if (key === 'token') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      // Special handling for token (JWT is already a string)
      if (key === 'token') {
        // Validate it's a proper JWT format (header.payload.signature)
        const parts = item.split('.');
        if (parts.length !== 3) {
          console.warn('Invalid token format, removing...');
          localStorage.removeItem('token');
          return defaultValue;
        }
        return item;
      }
      
      return JSON.parse(item);
    } catch (error) {
      console.error('Storage get error:', error);
      // If parsing fails, clear the corrupted data
      localStorage.removeItem(key);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

// Authentication Helper
const Auth = {
  getToken() {
    return Storage.get('token');
  },

  setToken(token) {
    return Storage.set('token', token);
  },

  removeToken() {
    return Storage.remove('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getUser() {
    return Storage.get('user');
  },

  setUser(user) {
    return Storage.set('user', user);
  },

  logout() {
    this.removeToken();
    Storage.remove('user');
    window.location.href = '/HTML/login.html';
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/HTML/login.html';
      return false;
    }
    return true;
  }
};

// Form Validation
const Validate = {
  email(email) {
    const duEmailRegex = /@.*\.du\.ac\.in$/;
    return duEmailRegex.test(email);
  },

  password(password, minLength = 6) {
    return password && password.length >= minLength;
  },

  required(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },

  age(dateOfBirth, minAge = 18) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= minAge;
    }
    
    return age >= minAge;
  }
};

// Date Formatting
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// Calculate Age from Date of Birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Debounce Function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle Function
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Format Match Date
const formatMatchDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
};

// Format Time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// Escape HTML to prevent XSS
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Get Initials from Name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Check if user is online (placeholder for WebSocket integration)
const isUserOnline = (userId) => {
  // This would integrate with WebSocket in a real app
  return Math.random() > 0.5; // Random for demo
};

// Generate Avatar Color based on name
const getAvatarColor = (name) => {
  const colors = [
    '#FE3C72', '#FF6B6B', '#4ECDC4', '#45B7D1', 
    '#96CEB4', '#FFEAA7', '#DDA15E', '#C77DFF'
  ];
  
  if (!name) return colors[0];
  
  const charCode = name.charCodeAt(0);
  const index = charCode % colors.length;
  return colors[index];
};

// Export all utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Toast,
    Loading,
    Storage,
    Auth,
    Validate,
    formatDate,
    calculateAge,
    debounce,
    throttle,
    formatMatchDate,
    formatTime,
    escapeHtml,
    getInitials,
    isUserOnline,
    getAvatarColor
  };
}
