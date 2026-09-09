import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { swapApi, chatApi, reviewApi } from '../api/services';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';

const PushPin = () => (
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
    <div className="w-3 h-3 rounded-full bg-[#78909C] border border-[#455A64] shadow-sm" />
    <div className="w-[1.2px] h-3 bg-gray-400 -mt-[1px]" />
  </div>
);

/** Skeleton shimmer block */
function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-ink/8 rounded-lg ${className}`} />
  );
}

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  // socketReady is a real React state — triggers effect re-run when socket connects
  const { socketRef, socketReady } = useSocket();
  const [swap, setSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  // ── Load swap + message history in PARALLEL ────────────────────────────
  useEffect(() => {
    setPageLoading(true);
    setError('');

    Promise.all([
      swapApi.detail(id),
      chatApi.history(id),
    ])
      .then(([swapRes, chatRes]) => {
        setSwap(swapRes.data.swap);
        setMessages(chatRes.data.messages);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
          'Could not load the chat. Please go back and try again.'
        );
      })
      .finally(() => setPageLoading(false));
  }, [id]);

  // ── Socket event listeners — re-runs when socket becomes ready ─────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socketReady) return undefined;

    socket.emit('chat:join', id);

    const onMessage = (msg) => {
      if (msg.swapRequest === id || msg.swapRequest?._id === id)
        setMessages((prev) => [...prev, msg]);
    };
    const onTyping = ({ isTyping }) => setOtherTyping(isTyping);

    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
    };
  }, [socketReady, id]); // ← socketReady (state) is a proper dependency

  // ── Auto-scroll to latest message ─────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage() {
    if (!text.trim()) return;
    socketRef.current?.emit('chat:message', { swapRequestId: id, text });
    setText('');
  }

  function handleTyping(val) {
    setText(val);
    socketRef.current?.emit('chat:typing', { swapRequestId: id, isTyping: val.length > 0 });
  }

  async function respond(action) {
    const { data } = await swapApi.respond(id, action);
    setSwap(data.swap);
  }

  async function submitReview() {
    const rating = Number(prompt('Rate this swap partner 1-5:'));
    if (!rating) return;
    const comment = prompt('Add a short comment (optional):') || '';
    await reviewApi.create({ swapRequest: id, rating, comment });
    alert('Thanks for your review!');
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-[#4E3629]/70 hover:text-[#4E3629] mb-6">
          ← Back to dashboard
        </button>
        <div className="bg-rust/10 border border-rust/20 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">😕</div>
          <p className="text-sm text-rust font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-ink text-paperRaised rounded-lg px-5 py-2.5 text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-24 h-4" />
        </div>
        <Skeleton className="w-32 h-3 mb-2" />
        <Skeleton className="w-48 h-7 mb-6" />

        {/* Chat box skeleton */}
        <div className="bg-[#FBFAF4] border border-[#4E3629]/15 rounded-xl h-[55dvh] sm:h-[480px] lg:h-[520px] flex flex-col p-4 gap-3">
          <Skeleton className="w-3/5 h-9 self-start" />
          <Skeleton className="w-2/5 h-9 self-end" />
          <Skeleton className="w-4/5 h-9 self-start" />
          <Skeleton className="w-1/2 h-9 self-end" />
          <Skeleton className="w-3/5 h-9 self-start" />
          <div className="flex-1" />
          <div className="flex gap-2 border-t border-ink/10 pt-3">
            <Skeleton className="flex-1 h-10 rounded-full" />
            <Skeleton className="w-16 h-10 rounded-full" />
          </div>
        </div>

        {/* Server wake-up notice — shown after 3 s if still loading */}
        <WakeUpNotice />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  const other = swap.fromUser._id === user.id ? swap.toUser : swap.fromUser;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-sm text-[#4E3629]/75 hover:text-[#4E3629] mb-4 inline-flex items-center gap-1"
      >
        ← Back to dashboard
      </button>
      <div className="text-[10px] sm:text-xs uppercase tracking-wide text-[#A67A1E] font-semibold">
        Negotiation
      </div>
      <h1 className="font-display text-xl sm:text-2xl font-bold mt-1 text-[#4E3629]">
        Chat with {other.name}
      </h1>

      {/* Socket connection indicator */}
      <div className="flex items-center gap-1.5 mt-1 mb-3">
        <span className={`w-2 h-2 rounded-full ${socketReady ? 'bg-[#4C7A5D]' : 'bg-yellow-400 animate-pulse'}`} />
        <span className="text-[11px] text-ink/50">
          {socketReady ? 'Live' : 'Connecting…'}
        </span>
      </div>

      {/* ── Chat box ── */}
      <div className="relative overflow-visible bg-[#FBFAF4] border border-[#4E3629]/15 rounded-xl shadow-sm flex flex-col h-[55dvh] sm:h-[480px] lg:h-[520px]">
        <PushPin />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-2 sm:gap-2.5">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-ink/40 text-sm italic">
              No messages yet. Say hello!
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m._id}
              className={`max-w-[85%] sm:max-w-[70%] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-sm leading-relaxed ${
                m.sender._id === user.id || m.sender === user.id
                  ? 'self-end bg-ink text-paperRaised rounded-br-sm'
                  : 'self-start bg-paper border border-ink/10 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          ))}
          {otherTyping && (
            <div className="text-xs text-ink/40 italic">{other.name} is typing…</div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 border-t border-ink/10 p-2.5 sm:p-3">
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={socketReady ? 'Type a message...' : 'Connecting to chat…'}
            disabled={!socketReady}
            className="flex-1 border border-ink/15 rounded-full px-3 sm:px-4 py-2 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!socketReady || !text.trim()}
            className="bg-ink text-paperRaised rounded-full px-4 py-2 text-sm font-semibold hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
        {swap.status === 'pending' && swap.toUser._id === user.id && (
          <>
            <button
              onClick={() => respond('accept')}
              className="w-full sm:w-auto bg-green text-paperRaised rounded-lg px-5 py-3 text-sm font-semibold"
            >
              Accept swap
            </button>
            <button
              onClick={() => respond('reject')}
              className="w-full sm:w-auto bg-rust text-paperRaised rounded-lg px-5 py-3 text-sm font-semibold"
            >
              Decline
            </button>
          </>
        )}
        {swap.status === 'accepted' && (
          <button
            onClick={() => respond('complete')}
            className="w-full sm:w-auto bg-green text-paperRaised rounded-lg px-5 py-3 text-sm font-semibold"
          >
            Mark swap complete
          </button>
        )}
        {swap.status === 'completed' && (
          <button
            onClick={submitReview}
            className="w-full sm:w-auto border border-ink/20 rounded-lg px-5 py-3 text-sm hover:bg-ink/5 transition-colors"
          >
            Leave a review
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Shows a "server is waking up" notice after a 4-second delay.
 * Helps users understand Render's cold-start delay instead of thinking the page is broken.
 */
function WakeUpNotice() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;
  return (
    <div className="mt-5 bg-[#EFE0BC]/60 border border-[#A67A1E]/20 rounded-xl p-4 text-sm text-[#8A6416] flex gap-3 items-start">
      <span className="text-xl">☕</span>
      <div>
        <p className="font-semibold">Server is waking up…</p>
        <p className="text-xs mt-0.5 opacity-80">
          The backend is on a free tier and spins down when idle. First load can take up to 30 seconds — hang tight!
        </p>
      </div>
    </div>
  );
}
