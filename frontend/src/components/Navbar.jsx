import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const links = [
    ['/listings', 'Browse'],
    ['/dashboard', 'Dashboard'],
    ...(user.role === 'admin' ? [['/admin', 'Admin']] : []),
  ];

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-ink/10 bg-paperRaised sticky top-0 z-20">
      <Link to="/listings" className="font-display font-bold text-xl flex items-center gap-2">
        🧵 Thread Trade
      </Link>
      <div className="flex gap-1">
        {links.map(([path, label]) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`px-3.5 py-2 rounded-full text-sm font-medium ${
              location.pathname.startsWith(path) ? 'bg-ink text-paperRaised' : 'text-ink/70 hover:bg-ink/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm border border-ink/10 rounded-full px-3 py-1.5 bg-paperRaised">
        <span className="w-2 h-2 rounded-full bg-green inline-block" />
        {user.name}
        <button onClick={logout} className="underline text-xs text-ink/60 ml-1">
          Log out
        </button>
      </div>
    </div>
  );
}
