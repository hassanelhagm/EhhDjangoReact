// services/api.js
import axios from 'axios';
const API_BASE = 'http://localhost:8000/api';

export const getStudents = () => axios.get(`${API_BASE}/students/`);
// export const createStudent = (data) => axios.post(`${API_BASE}/students/`, data);
export const createStudent = (data) =>
  axios.post(`${API_BASE}/students/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateStudent = (id, data) =>
  axios.put(`${API_BASE}/students/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// export const updateStudent = (id, data) => axios.put(`${API_BASE}/students/${id}/`, data);
export const deleteStudent = (id) => axios.delete(`${API_BASE}/students/${id}/`);
export const getDegreeLevels = () => axios.get(`${API_BASE}/degree-levels/`);
