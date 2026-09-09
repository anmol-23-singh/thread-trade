import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user || location.pathname === '/login' || location.pathname === '/register') return null;

  const links = [
    ['/listings', 'Browse'],
    ['/dashboard', 'Dashboard'],
  ];

  function handleNav(path) {
    navigate(path);
    setMenuOpen(false);
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-[#4E3629]/10 bg-[#FBFAF4]/90 backdrop-blur-md">
      {/* ── Main bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Logo */}
        <Link
          to="/listings"
          className="font-display font-bold text-base sm:text-xl flex items-center gap-2 text-[#4E3629]"
        >
          🧵 <span>Thread Trade</span>
        </Link>

        {/* Desktop nav tabs — hidden on mobile */}
        <div className="hidden sm:flex gap-1.5 bg-[#DFD3C3]/30 border border-[#4E3629]/10 p-1 rounded-full backdrop-blur-sm">
          {links.map(([path, label]) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`px-4 sm:px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
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

        {/* Right side — desktop user pill + mobile hamburger */}
        <div className="flex items-center gap-3">
          {/* Desktop user pill */}
          <div className="hidden sm:flex items-center gap-2 text-sm border border-[#4E3629]/15 rounded-full px-4 py-1.5 bg-[#FBFAF4]/60 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#4C7A5D] inline-block" />
            <span className="font-medium text-[#4E3629] max-w-[120px] truncate">{user.name}</span>
            <button
              onClick={logout}
              className="underline text-xs text-[#4E3629]/65 hover:text-[#4E3629] ml-1"
            >
              Log out
            </button>
          </div>

          {/* Hamburger button — visible only on mobile */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="sm:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px] rounded-lg border border-[#4E3629]/15 bg-[#FBFAF4]/60"
          >
            <span
              className={`block w-5 h-[2px] bg-[#4E3629] rounded transition-all duration-200 origin-center ${
                menuOpen ? 'rotate-45 translate-y-[7px]' : ''
              }`}
            />
            <span
              className={`block w-5 h-[2px] bg-[#4E3629] rounded transition-all duration-200 ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-5 h-[2px] bg-[#4E3629] rounded transition-all duration-200 origin-center ${
                menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="sm:hidden border-t border-[#4E3629]/10 bg-[#FBFAF4]/97 px-4 py-4 flex flex-col gap-2">
          {/* User info */}
          <div className="flex items-center gap-2 pb-3 border-b border-[#4E3629]/10 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4C7A5D] inline-block" />
            <span className="font-semibold text-[#4E3629] text-sm">{user.name}</span>
          </div>

          {/* Nav links */}
          {links.map(([path, label]) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#4E3629] text-[#FBFAF4]'
                    : 'text-[#4E3629] hover:bg-[#4E3629]/8'
                }`}
              >
                {label}
              </button>
            );
          })}

          {/* Logout */}
          <button
            onClick={() => { logout(); setMenuOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-xl text-sm text-[#9A4425] font-semibold hover:bg-[#9A4425]/8 transition-colors duration-150"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
