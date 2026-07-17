import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || location.pathname === '/login' || location.pathname === '/register') return null;

  const links = [
    ['/listings', 'Browse'],
    ['/dashboard', 'Dashboard'],
  ];

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-[#4E3629]/10 bg-[#FBFAF4]/45 backdrop-blur-md sticky top-0 z-20">
      <Link to="/listings" className="font-display font-bold text-xl flex items-center gap-2 text-[#4E3629]">
        🧵 Thread Trade
      </Link>
      
      {/* Centered Capsule Tabs */}
      <div className="flex gap-1.5 bg-[#DFD3C3]/30 border border-[#4E3629]/10 p-1 rounded-full backdrop-blur-sm">
        {links.map(([path, label]) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-[#4E3629] text-[#FBFAF4] shadow-sm' 
                  : 'text-[#4E3629]/75 hover:bg-[#4E3629]/5 hover:text-[#4E3629]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* User profile pill */}
      <div className="flex items-center gap-2.5 text-sm border border-[#4E3629]/15 rounded-full px-4 py-1.5 bg-[#FBFAF4]/60 backdrop-blur-sm shadow-sm">
        <span className="w-2 h-2 rounded-full bg-[#4C7A5D] inline-block" />
        <span className="font-medium text-[#4E3629]">{user.name}</span>
        <button onClick={logout} className="underline text-xs text-[#4E3629]/65 hover:text-[#4E3629] ml-1">
          Log out
        </button>
      </div>
    </div>
  );
}

