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

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socketRef = useSocket();
  const [swap, setSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    swapApi.detail(id).then(({ data }) => setSwap(data.swap));
    chatApi.history(id).then(({ data }) => setMessages(data.messages));
  }, [id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;

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
  }, [socketRef.current, id]);

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

  if (!swap) return <div className="text-center py-20 text-ink/50">Loading...</div>;

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

      {/* ── Chat box — taller on desktop, uses dvh on mobile for keyboard safety ── */}
      <div className="relative overflow-visible bg-[#FBFAF4] border border-[#4E3629]/15 rounded-xl shadow-sm mt-4 flex flex-col h-[55dvh] sm:h-[480px] lg:h-[520px]">
        <PushPin />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-2 sm:gap-2.5">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`max-w-[85%] sm:max-w-[70%] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-sm ${
                m.sender._id === user.id || m.sender === user.id
                  ? 'self-end bg-ink text-paperRaised rounded-br-sm'
                  : 'self-start bg-paper border border-ink/10 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          ))}
          {otherTyping && (
            <div className="text-xs text-ink/40 italic">{other.name} is typing...</div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div className="flex gap-2 border-t border-ink/10 p-2.5 sm:p-3">
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border border-ink/15 rounded-full px-3 sm:px-4 py-2 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
          <button
            onClick={sendMessage}
            className="bg-ink text-paperRaised rounded-full px-4 py-2 text-sm font-semibold hover:bg-ink/90 transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {/* ── Action buttons — stack on mobile ── */}
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
