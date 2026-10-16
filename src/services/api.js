import axios from 'axios';

// Create configured Axios instance with credentials enabled for HttpOnly cookies
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000',
  withCredentials: true, // Crucial for receiving and sending HttpOnly authentication cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

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

    updateProfile: async ({ name, preferences }) => {
      const response = await axiosInstance.put('/api/auth/profile', { name, preferences });
      return response.data;
    },
  },

  // Stubs for future backend features (Meal Planner, Vision, RAG Assistant)
  mealPlanner: {
    generatePlan: async () => {
      return {
        success: true,
        meals: [
          { day: 'Monday', meal: 'Quinoa Bowl with Roasted Sage Chickpeas & Avocado', calories: 520 },
          { day: 'Tuesday', meal: 'Herb Salmon with Steamed Bok Choy & Sweet Potato', calories: 610 },
          { day: 'Wednesday', meal: 'Golden Turmeric Lentil Soup with Spinach', calories: 440 },
        ],
      };
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
