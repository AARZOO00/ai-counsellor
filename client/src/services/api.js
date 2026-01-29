import axios from "axios";

/* ======================================
   1. SERVER CONNECTION SETUP
====================================== */

// Determine API URL based on environment
const getAPIURL = () => {
  // In production (Vercel), use environment variable
  if (process.env.REACT_APP_API_URL) {
    console.log('[API] Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Production default: Render backend
  if (process.env.NODE_ENV === 'production') {
    const url = 'https://ai-counsellor-vosd.onrender.com/api';
    console.log('[API] Using production backend:', url);
    return url;
  }
  
  // Development: localhost
  console.log('[API] Using development localhost');
  return 'http://localhost:5001/api';
};

const API_URL = getAPIURL();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token Interceptor (Har request mein token jodta hai)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ======================================
   2. AUTH API (Real Backend Calls)
====================================== */
export const authAPI = {
  login: async (credentials) => {
    return await api.post("/auth/login", credentials);
  },
  register: async (userData) => {
    return await api.post("/auth/register", userData);
  },
  loadUser: async () => {
    return await api.get("/auth/user");
  },
};

/* ======================================
   3. OTHER APIs (Mock Data + Real Calls)
====================================== */

// Profile API
export const profileAPI = {
  getProfile: async () => ({
    data: {
      profile: {
        currentEducationLevel: "Bachelor's",
        major: "Computer Science",
        gpa: 8.2,
        intendedDegree: "Master's",
        fieldOfStudy: "Computer Science",
        preferredCountries: ["USA", "Canada"],
        budgetPerYear: { min: 15000, max: 30000 },
        profileStrength: { academics: "Strong", exams: "In Progress", documents: "Draft" },
      },
    },
  }),
  create: async (data) => api.post("/profile", data),
};

// Counsellor API
export const counsellorAPI = {
  analyze: async () => ({
    data: {
      analysis: {
        strengths: ["Strong academic background", "Good GPA"],
        gaps: ["GRE score improvement recommended"],
      },
    },
  }),
  recommend: async () => api.post("/counsellor/recommend"),
  sendMessage: async (message) => api.post("/counsellor/chat", { message }),
};

// Universities API
export const universitiesAPI = {
  getAll: async () => api.get("/universities"),
  shortlist: async (id) => api.post(`/universities/${id}/shortlist`),
  lock: async (id) => api.post(`/universities/${id}/lock`),
  unlock: async (id) => api.post(`/universities/${id}/unlock`),
  remove: async (id) => api.post(`/universities/${id}/remove`),
};

// Todos API
export const todosAPI = {
  getAll: async () => api.get("/todos"),
  toggle: async (id) => api.put(`/todos/${id}/toggle`),
};

// Dashboard API
export const dashboardAPI = {
  getData: async () => api.get("/dashboard/stats"),
};

export default api;