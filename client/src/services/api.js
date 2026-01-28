import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Profile API
export const profileAPI = {
  create: (data) => axios.post(`${API_URL}/profile`, data),
  get: () => axios.get(`${API_URL}/profile`),
  getStrength: () => axios.get(`${API_URL}/profile/strength`)
};

// Counsellor API
export const counsellorAPI = {
  chat: (data) => axios.post(`${API_URL}/counsellor/chat`, data),
  recommend: () => axios.post(`${API_URL}/counsellor/recommend`),
  analyze: () => axios.get(`${API_URL}/counsellor/analyze`)
};

// Universities API
export const universitiesAPI = {
  getAll: (params) => axios.get(`${API_URL}/universities`, { params }),
  shortlist: (id) => axios.put(`${API_URL}/universities/${id}/shortlist`),
  lock: (id) => axios.put(`${API_URL}/universities/${id}/lock`),
  unlock: (id) => axios.put(`${API_URL}/universities/${id}/unlock`),
  remove: (id) => axios.delete(`${API_URL}/universities/${id}`)
};

// ToDos API
export const todosAPI = {
  getAll: (params) => axios.get(`${API_URL}/todos`, { params }),
  create: (data) => axios.post(`${API_URL}/todos`, data),
  update: (id, data) => axios.put(`${API_URL}/todos/${id}`, data),
  toggle: (id) => axios.put(`${API_URL}/todos/${id}/toggle`),
  delete: (id) => axios.delete(`${API_URL}/todos/${id}`)
};