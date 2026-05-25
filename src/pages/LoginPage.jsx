import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-panel" onSubmit={handleSubmit}>
        <h1>WhatsApp MERN</h1>
        <p>Login to continue your chats.</p>
        {error && <div className="error-banner">{error}</div>}
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <button className="primary-btn" type="submit">Login</button>
        <span className="auth-link">No account? <Link to="/signup">Sign up</Link></span>
      </form>
    </main>
  );
}
