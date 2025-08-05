import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Market Metrics
export const marketAPI = {
  getCurrentMetrics: () => api.get('/metrics/current').then(res => res.data),
  getHistoricalMetrics: (startDate, endDate) => 
    api.get('/metrics/history', { params: { startDate, endDate } }).then(res => res.data),
  getMarketAnalysis: () => api.get('/analysis/market').then(res => res.data),
};

// Phase Management
export const phaseAPI = {
  getCurrentPhase: () => api.get('/phase/current').then(res => res.data),
  getPhaseTransitions: () => api.get('/phase/transitions').then(res => res.data),
};

// Portfolio Allocation
export const allocationAPI = {
  getRecommendedAllocation: () => api.get('/allocation/recommended').then(res => res.data),
  getAllocationHistory: () => api.get('/allocation/history').then(res => res.data),
};

// Altcoins
export const altcoinAPI = {
  getMetrics: () => api.get('/altcoins/metrics').then(res => res.data),
};

// Technical Patterns
export const patternsAPI = {
  getCandlePatterns: () => api.get('/patterns/candles').then(res => res.data),
};

// Performance
export const performanceAPI = {
  getPerformanceMetrics: (startDate, endDate) => 
    api.get('/performance', { params: { startDate, endDate } }).then(res => res.data),
};

// Alerts
export const alertsAPI = {
  getActiveAlerts: () => api.get('/alerts/active').then(res => res.data),
  resolveAlert: (id) => api.post(`/alerts/${id}/resolve`).then(res => res.data),
};

// Price History
export const priceAPI = {
  getHistoricalPrices: (symbol, startDate, endDate) => 
    api.get(`/price/history/${symbol}`, { params: { startDate, endDate } }).then(res => res.data),
  getTechnicalIndicators: (symbol, period = 50) => 
    api.get(`/indicators/${symbol}`, { params: { period } }).then(res => res.data),
};

// Manual Triggers (for testing)
export const manualAPI = {
  fetchDataNow: () => api.post('/manual/fetch-data').then(res => res.data),
  checkPhaseNow: () => api.post('/manual/check-phase').then(res => res.data),
};

// Scheduler
export const schedulerAPI = {
  getStatus: () => api.get('/scheduler/status').then(res => res.data),
};

export default api;