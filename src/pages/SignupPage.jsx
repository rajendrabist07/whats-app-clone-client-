import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-panel" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p>Start chatting with MongoDB-backed persistence.</p>
        {error && <div className="error-banner">{error}</div>}
        <label>
          Username
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} minLength={3} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required />
        </label>
        <button className="primary-btn" type="submit">Sign up</button>
        <span className="auth-link">Have an account? <Link to="/login">Login</Link></span>
      </form>
    </main>
  );
}
