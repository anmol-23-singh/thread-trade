import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', state: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/listings');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <h1 className="font-display text-4xl font-bold">Create your account</h1>
      <p className="text-ink/60 mt-2 text-sm">Join Thread Trade and start swapping.</p>

      <form onSubmit={handleSubmit} className="bg-paperRaised border border-ink/10 rounded-lg shadow-sm p-6 mt-6 space-y-4">
        {error && <div className="text-sm text-rust bg-rust/10 border border-rust/20 rounded p-2">{error}</div>}
        {[
          ['name', 'Full name', 'text'],
          ['email', 'Email', 'email'],
          ['password', 'Password (8+ chars, 1 uppercase, 1 number)', 'password'],
        ].map(([key, label, type]) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-ink/60 mb-1">{label}</label>
            <input
              type={type}
              required
              className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-ink/60 mb-1">City</label>
            <input
              className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-ink/60 mb-1">State</label>
            <input
              className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
        </div>
        <button disabled={loading} className="w-full bg-ink text-paperRaised rounded py-2.5 font-semibold text-sm">
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="text-xs text-center text-ink/60">
          Already have an account? <Link to="/login" className="underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
