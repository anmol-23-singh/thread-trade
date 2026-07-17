import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThreeDClothes from '../components/ThreeDClothes.jsx';
import ThreeDTradeText from '../components/ThreeDTradeText.jsx';

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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F2EAE1] relative overflow-x-hidden">
      {/* Left Pane - 3D Clothes Canvas */}
      <div className="w-full lg:w-1/2 h-[350px] lg:h-screen bg-transparent lg:border-r border-b lg:border-b-0 border-ink/10 relative">
        <ThreeDClothes />
      </div>

      {/* Right Pane - Login Form with Terracotta background */}
      <div className="w-full lg:w-1/2 min-h-[550px] lg:min-h-screen flex flex-col items-center justify-center p-6 lg:p-16 bg-[#8E4F3E] relative">
        {/* Subtle geometric pattern layer on the right side */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-md w-full z-10">
          <div className="text-xs uppercase tracking-widest text-[#F5C469] font-bold">Clothing Exchange &amp; Swap Marketplace</div>
          <h1 className="font-display text-4xl font-bold mt-1 text-[#FBFAF4]">Welcome back</h1>
          <p className="text-[#FBFAF4]/70 mt-2 text-sm">Log in to browse, list, and swap clothes.</p>

          <form onSubmit={handleSubmit} className="bg-paperRaised/95 backdrop-blur-md border border-[#FBFAF4]/10 rounded-2xl shadow-2xl p-6 mt-6 space-y-4">
            {error && <div className="text-sm text-rust bg-rust/10 border border-rust/20 rounded p-2">{error}</div>}
            <div>
              <label className="block text-xs font-semibold text-ink/60 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink/60 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button disabled={loading} className="w-full bg-ink hover:bg-ink/90 text-paperRaised rounded-lg py-2.5 font-semibold text-sm transition-colors duration-200 shadow-sm">
              {loading ? 'Logging in...' : 'Log in'}
            </button>
            <p className="text-xs text-center text-ink/60">
              No account? <Link to="/register" className="underline text-ink/70 hover:text-ink">Register</Link>
            </p>
            <p className="text-[11px] text-center text-ink/40 bg-paper/50 rounded py-2 border border-ink/5 mt-2">
              Seeded demo logins: <span className="font-mono text-ink/75">ananya@example.com</span> , Password: <span className="font-mono text-ink/75">"Swap_123"</span>
            </p>
          </form>
          
          {/* 3D Volumetric TRADE text below form */}
          <div className="mt-8 flex flex-col items-center">
            <ThreeDTradeText />
          </div>
        </div>
      </div>
    </div>
  );
}


