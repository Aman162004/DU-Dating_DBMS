// API Module for DU Dating App
// Handles all HTTP requests to the backend

const API_BASE_URL = window.location.origin;

// Generic API Request Handler
async function apiRequest(endpoint, options = {}) {
  const token = Auth.getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - invalid/expired token
      if (response.status === 401) {
        console.warn('Authentication failed, clearing token and redirecting to login');
        Auth.removeToken();
        Storage.remove('user');
        
        // Don't redirect if already on auth pages
        if (!window.location.pathname.includes('login') && 
            !window.location.pathname.includes('register') &&
            !window.location.pathname.includes('home.html')) {
          window.location.href = '/HTML/login.html';
        }
      }
      
      throw new Error(data.message || data.error || 'Request failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: error.message };
  }
}

// Authentication APIs
const AuthAPI = {
  async login(email, password) {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(userData) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async getColleges() {
    return apiRequest('/api/auth/colleges', {
      method: 'GET'
    });
  }
};

// Profile APIs
const ProfileAPI = {
  async getProfile() {
    return apiRequest('/api/profile', {
      method: 'GET'
    });
  },

  async updateProfile(profileData) {
    return apiRequest('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  async getInterests() {
    return apiRequest('/api/interests', {
      method: 'GET'
    });
  }
};

// Swipe APIs
const SwipeAPI = {
  async getPotentialUsers() {
    return apiRequest('/api/users/potential', {
      method: 'GET'
    });
  },

  async swipe(targetUserId, liked) {
    return apiRequest('/api/swipe', {
      method: 'POST',
      body: JSON.stringify({
        swiped_id: targetUserId,
        action: liked ? 'like' : 'dislike'
      })
    });
  }
};

// Matches APIs
const MatchAPI = {
  async getMatches() {
    return apiRequest('/api/matches', {
      method: 'GET'
    });
  },

  async unmatch(matchId) {
    return apiRequest(`/api/matches/${matchId}`, {
      method: 'DELETE'
    });
  }
};

// Messages APIs
const MessageAPI = {
  async getMessages(matchId) {
    return apiRequest(`/api/messages/${matchId}`, {
      method: 'GET'
    });
  },

  async sendMessage(matchId, content) {
    return apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        match_id: matchId,
        content
      })
    });
  },

  async markAsRead(matchId) {
    return apiRequest(`/api/messages/${matchId}/read`, {
      method: 'PUT'
    });
  }
};

// Export APIs
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    apiRequest,
    AuthAPI,
    ProfileAPI,
    SwipeAPI,
    MatchAPI,
    MessageAPI
  };
}
