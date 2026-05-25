import api from './axios.config';

export const getMessages = (chatId, page = 1, limit = 30) => (
  api.get(`/messages/${chatId}`, { params: { page, limit } })
);

export const sendMessage = (chatId, content) => api.post(`/messages/${chatId}`, { content });
