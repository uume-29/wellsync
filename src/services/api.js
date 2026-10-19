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

    getRecipe: async (dayId, mealType) => {
      const response = await axiosInstance.get(`/api/meals/recipe/${dayId}/${mealType}`);
      return response.data;
    },

    enrichRecipe: async ({ dayId, mealType }) => {
      const response = await axiosInstance.post('/api/meals/recipe/enrich', { dayId, mealType });
      return response.data;
    },
  },

  // Pantry Inventory API Endpoints (MongoDB Atlas Persisted)
  pantry: {
    getItems: async () => {
      const response = await axiosInstance.get('/api/pantry');
      return response.data;
    },

    addItem: async (itemData) => {
      const response = await axiosInstance.post('/api/pantry', itemData);
      return response.data;
    },

    updateItem: async (id, itemData) => {
      const response = await axiosInstance.put(`/api/pantry/${id}`, itemData);
      return response.data;
    },

    toggleStatus: async (id) => {
      const response = await axiosInstance.patch(`/api/pantry/${id}/toggle`);
      return response.data;
    },

    deleteItem: async (id) => {
      const response = await axiosInstance.delete(`/api/pantry/${id}`);
      return response.data;
    },
  },

  // Monthly Grocery Planning API Endpoints (MongoDB Atlas Persisted)
  grocery: {
    getMonths: async () => {
      const response = await axiosInstance.get('/api/grocery/months');
      return response.data;
    },

    getPlan: async (month) => {
      const response = await axiosInstance.get('/api/grocery/current', {
        params: month ? { month } : {},
      });
      return response.data;
    },

    generatePlan: async (params = {}) => {
      const response = await axiosInstance.post('/api/grocery/generate', params);
      return response.data;
    },

    addItem: async (itemData) => {
      const response = await axiosInstance.post('/api/grocery/items', itemData);
      return response.data;
    },

    updateItem: async (itemId, itemData) => {
      const response = await axiosInstance.put(`/api/grocery/items/${itemId}`, itemData);
      return response.data;
    },

    deleteItem: async (itemId, month) => {
      const response = await axiosInstance.delete(`/api/grocery/items/${itemId}`, {
        params: month ? { month } : {},
      });
      return response.data;
    },

    togglePurchase: async (itemId, month) => {
      const response = await axiosInstance.patch(`/api/grocery/items/${itemId}/purchase`, { month });
      return response.data;
    },

    addToPantry: async (itemId, month) => {
      const response = await axiosInstance.post(`/api/grocery/items/${itemId}/add-to-pantry`, { month });
      return response.data;
    },

    recordBill: async (billData) => {
      const response = await axiosInstance.post('/api/grocery/bills', billData);
      return response.data;
    },

    deleteBill: async (billId, month) => {
      const response = await axiosInstance.delete(`/api/grocery/bills/${billId}`, {
        params: month ? { month } : {},
      });
      return response.data;
    },

    getBudgetAlternatives: async (month) => {
      const response = await axiosInstance.get('/api/grocery/budget-alternatives', {
        params: month ? { month } : {},
      });
      return response.data;
    },

    finalizePlan: async (month, status = 'completed') => {
      const response = await axiosInstance.patch('/api/grocery/finalize', { month, status });
      return response.data;
    },

    transferAllToPantry: async (month) => {
      const response = await axiosInstance.post('/api/grocery/transfer-purchased', { month });
      return response.data;
    },
  },

  foodDiary: {
    getByDate: async (date) => {
      const response = await axiosInstance.get('/api/food-diary', {
        params: date ? { date } : {},
      });
      return response.data;
    },

    getHistory: async (limit = 14) => {
      const response = await axiosInstance.get('/api/food-diary/history', {
        params: { limit },
      });
      return response.data;
    },

    createEntry: async (entryData) => {
      const response = await axiosInstance.post('/api/food-diary', entryData);
      return response.data;
    },

    updateEntry: async (id, entryData) => {
      const response = await axiosInstance.put(`/api/food-diary/${id}`, entryData);
      return response.data;
    },

    deleteEntry: async (id) => {
      const response = await axiosInstance.delete(`/api/food-diary/${id}`);
      return response.data;
    },

    analyzeImage: async (image, mimeType = 'image/jpeg') => {
      const response = await axiosInstance.post('/api/food-diary/analyze-image', {
        image,
        mimeType,
      });
      return response.data;
    },
  },

  foodVision: {
    analyzeImage: async (image, mimeType = 'image/jpeg') => {
      // Connect to real backend Gemini Vision endpoint
      const response = await axiosInstance.post('/api/food-diary/analyze-image', {
        image,
        mimeType,
      });
      return response.data?.data || response.data;
    },
  },

  medicines: {
    getAll: async (date) => {
      const response = await axiosInstance.get('/api/medicines', {
        params: date ? { date } : {},
      });
      return response.data;
    },

    create: async (medData) => {
      const response = await axiosInstance.post('/api/medicines', medData);
      return response.data;
    },

    update: async (id, medData) => {
      const response = await axiosInstance.put(`/api/medicines/${id}`, medData);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/api/medicines/${id}`);
      return response.data;
    },

    setStatus: async (id, statusData) => {
      const response = await axiosInstance.patch(`/api/medicines/${id}/status`, statusData);
      return response.data;
    },

    toggleReminder: async (id) => {
      const response = await axiosInstance.patch(`/api/medicines/${id}/toggle-reminder`);
      return response.data;
    },

    getCompliance: async (days = 7) => {
      const response = await axiosInstance.get('/api/medicines/compliance', {
        params: { days },
      });
      return response.data;
    },
  },

  caregiver: {
    getAll: async () => {
      const response = await axiosInstance.get('/api/caregiver');
      return response.data;
    },

    invite: async (inviteData) => {
      const response = await axiosInstance.post('/api/caregiver/invite', inviteData);
      return response.data;
    },

    verifyInvitation: async (token) => {
      const response = await axiosInstance.get(`/api/caregiver/invitations/verify/${token}`);
      return response.data;
    },

    acceptInvitation: async (acceptData) => {
      const response = await axiosInstance.post('/api/caregiver/invitations/accept', acceptData);
      return response.data;
    },

    updatePermissions: async (id, permissions) => {
      const response = await axiosInstance.patch(`/api/caregiver/${id}/permissions`, {
        permissions,
      });
      return response.data;
    },

    revoke: async (id) => {
      const response = await axiosInstance.delete(`/api/caregiver/${id}`);
      return response.data;
    },

    getMyPatients: async () => {
      const response = await axiosInstance.get('/api/caregiver/patients');
      return response.data;
    },

    getPatientModuleData: async (grantId, module) => {
      const response = await axiosInstance.get(`/api/caregiver/patient/${grantId}/${module}`);
      return response.data;
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
