import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThreeDClothes from '../components/ThreeDClothes.jsx';
import ThreeDTradeText from '../components/ThreeDTradeText.jsx';

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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F2EAE1] relative overflow-x-hidden">
      {/* Left Pane - 3D Clothes Canvas */}
      <div className="w-full lg:w-1/2 h-[350px] lg:h-screen bg-transparent lg:border-r border-b lg:border-b-0 border-ink/10 relative">
        <ThreeDClothes />
      </div>

      {/* Right Pane - Register Form with Terracotta background */}
      <div className="w-full lg:w-1/2 min-h-[600px] lg:min-h-screen flex flex-col items-center justify-center p-6 lg:p-16 bg-[#8E4F3E] relative">
        {/* Subtle geometric pattern layer on the right side */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-md w-full z-10">
          <div className="text-xs uppercase tracking-widest text-[#F5C469] font-bold">Clothing Exchange &amp; Swap Marketplace</div>
          <h1 className="font-display text-4xl font-bold mt-1 text-[#FBFAF4]">Create your account</h1>
          <p className="text-[#FBFAF4]/70 mt-2 text-sm">Join Thread Trade and start swapping.</p>

          <form onSubmit={handleSubmit} className="bg-paperRaised/95 backdrop-blur-md border border-[#FBFAF4]/10 rounded-2xl shadow-2xl p-6 mt-6 space-y-4">
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
                  className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-ink/60 mb-1">City</label>
                <input
                  className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-ink/60 mb-1">State</label>
                <input
                  className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
            </div>
            <button disabled={loading} className="w-full bg-ink hover:bg-ink/90 text-paperRaised rounded-lg py-2.5 font-semibold text-sm transition-colors duration-200 shadow-sm">
              {loading ? 'Creating account...' : 'Register'}
            </button>
            <p className="text-xs text-center text-ink/60">
              Already have an account? <Link to="/login" className="underline text-ink/70 hover:text-ink">Log in</Link>
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


