import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <div className="text-xs uppercase tracking-wide text-[#A67A1E] font-semibold">Clothing Exchange &amp; Swap Marketplace</div>
      <h1 className="font-display text-4xl font-bold mt-1">Welcome back</h1>
      <p className="text-ink/60 mt-2 text-sm">Log in to browse, list, and swap clothes.</p>

      <form onSubmit={handleSubmit} className="bg-paperRaised border border-ink/10 rounded-lg shadow-sm p-6 mt-6 space-y-4">
        {error && <div className="text-sm text-rust bg-rust/10 border border-rust/20 rounded p-2">{error}</div>}
        <div>
          <label className="block text-xs font-semibold text-ink/60 mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink/60 mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button disabled={loading} className="w-full bg-ink text-paperRaised rounded py-2.5 font-semibold text-sm">
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <p className="text-xs text-center text-ink/60">
          No account? <Link to="/register" className="underline text-ink/70">Register</Link>
        </p>
        <p className="text-[11px] text-center text-ink/40">
          Seeded demo logins: ananya@example.com ,  Password : "Swap_123"
        </p>
      </form>
    </div>
  );
}
