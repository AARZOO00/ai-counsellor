import axios from "axios";

/* ======================================
   ✅ API BASE URL (PRODUCTION SAFE)
====================================== */

// Always use Render backend in production
const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://ai-counsellor-vosd.onrender.com/api";

console.log("[API] Base URL:", API_URL);

/* ======================================
   ✅ AXIOS INSTANCE
====================================== */

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ======================================
   ✅ TOKEN INTERCEPTOR
====================================== */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ======================================
   ✅ AUTH API
====================================== */

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  loadUser: () => api.get("/auth/user"),
};

/* ======================================
   ✅ PROFILE API
====================================== */

export const profileAPI = {
  getProfile: () => api.get("/profile"),
  create: (data) => api.post("/profile", data),
  update: (data) => api.put("/profile", data),
};

/* ======================================
   ✅ AI COUNSELLOR API
====================================== */

export const counsellorAPI = {
  sendMessage: (message) =>
    api.post("/counsellor/chat", { message }),

  recommendUniversities: () =>
    api.get("/university/recommend"),

  analyzeProfile: () =>
    api.get("/counsellor/analyze"),

  predictChance: (universityId) =>
    api.post("/counsellor/predict", { universityId }),

  reviewSOP: (sopText) =>
    api.post("/counsellor/review-sop", { sopText }),
};

/* ======================================
   ✅ UNIVERSITIES API (IMPORTANT)
====================================== */

export const universitiesAPI = {
  getAll: () => api.get("/university/recommend"),
  shortlist: (id) => api.post(`/university/${id}/shortlist`),
  lock: (id) => api.post(`/university/${id}/lock`),
  unlock: (id) => api.post(`/university/${id}/unlock`),
};

/* ======================================
   ✅ DASHBOARD API
====================================== */

export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
};

/* ======================================
   ✅ TODOS / APPLICATIONS (OPTIONAL)
====================================== */

export const todosAPI = {
  getAll: () => api.get("/todos"),
  toggle: (id) => api.put(`/todos/${id}/toggle`),
};

export default api;
