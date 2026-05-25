import api from './axios.config';

export const login = (payload) => api.post('/auth/login', payload);
export const signup = (payload) => api.post('/auth/signup', payload);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/users/me');
