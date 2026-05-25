import api from './axios.config';

export const getChats = () => api.get('/chats');
export const startChat = (userId) => api.post('/chats', { userId });
export const searchUsers = (q) => api.get('/users/search', { params: { q } });
