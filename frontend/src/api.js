import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchRecords = (params = {}) =>
  axios.get(`${API_URL}/records`, { params }).then(r => r.data);

export const fetchFilters = () =>
  axios.get(`${API_URL}/records/filters`).then(r => r.data);

export const fetchSummary = (params = {}) =>
  axios.get(`${API_URL}/records/summary`, { params }).then(r => r.data);
