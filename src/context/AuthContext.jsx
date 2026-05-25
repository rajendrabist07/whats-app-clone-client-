import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe, login as loginApi, logout as logoutApi, signup as signupApi } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then(({ data }) => setUser(data.data))
      .catch(() => localStorage.removeItem('accessToken'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const { data } = await loginApi(payload);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
  };

  const signup = async (payload) => {
    const { data } = await signupApi(payload);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
