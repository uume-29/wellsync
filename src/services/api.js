import axios from 'axios';

// Dynamically match browser hostname (localhost or 127.0.0.1) on port 5000 to maintain same-site cookie scope
const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

// Create configured Axios instance with credentials enabled for HttpOnly cookies
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Always send & receive HttpOnly authentication cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token fallback if present in client storage
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('wellsync_auth_token');
        if (storedToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
      }
    } catch (e) {
      // Ignore storage access errors in restricted browser contexts
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  // Authentication API Endpoints
  auth: {
    register: async ({ name, email, password }) => {
      const response = await axiosInstance.post('/api/auth/register', { name, email, password });
      return response.data;
    },

    login: async ({ email, password }) => {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      return response.data;
    },

    logout: async () => {
      const response = await axiosInstance.post('/api/auth/logout');
      return response.data;
    },

    getMe: async () => {
      const response = await axiosInstance.get('/api/auth/me');
      return response.data;
    },

    updateProfile: async (profileData) => {
      const response = await axiosInstance.put('/api/profile', profileData);
      return response.data;
    },
  },

  // User Profile API Endpoints
  profile: {
    getProfile: async () => {
      const response = await axiosInstance.get('/api/profile');
      return response.data;
    },

    updateProfile: async (profileData) => {
      const response = await axiosInstance.put('/api/profile', profileData);
      return response.data;
    },
  },

  // Clinical AI Meal Planner API Endpoints (MongoDB Atlas Persisted)
  mealPlanner: {
    getCurrentPlan: async () => {
      const response = await axiosInstance.get('/api/meals/current');
      return response.data;
    },

    generatePlan: async (params = {}) => {
      const response = await axiosInstance.post('/api/meals/generate', params);
      return response.data;
    },

    swapMeal: async ({ dayId, mealType }) => {
      const response = await axiosInstance.post('/api/meals/swap', { dayId, mealType });
      return response.data;
    },
  },

  foodVision: {
    analyzeImage: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            foodName: 'Avocado Toast with Poached Egg & Microgreens',
            calories: 380,
            macros: { protein: '16g', carbs: '28g', healthyFats: '22g', fiber: '9g' },
            micronutrients: ['Vitamin E', 'Folate', 'Potassium', 'Omega-3'],
            glycemicImpact: 'Low',
            confidence: 0.94,
          });
        }, 800);
      });
    },
  },

  ragAssistant: {
    query: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            answer:
              'Magnesium glycinate is commonly suggested for sleep support due to its high bioavailability and calming glycine amino acid component. Clinical studies suggest 200–400mg taken 30-60 minutes before bed improves sleep quality.',
            citations: [
              { title: 'Journal of Research in Medical Sciences (2012)', url: '#' },
              { title: 'NIH Dietary Supplement Fact Sheet: Magnesium', url: '#' },
            ],
            safetyCheckPassed: true,
          });
        }, 800);
      });
    },
  },
};

export default axiosInstance;
