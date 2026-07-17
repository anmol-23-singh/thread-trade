import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { swapApi, chatApi, reviewApi } from '../api/services';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';

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
      if (msg.swapRequest === id || msg.swapRequest?._id === id) setMessages((prev) => [...prev, msg]);
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
    <div className="max-w-2xl mx-auto px-8 py-9">
      <button onClick={() => navigate('/dashboard')} className="text-sm text-ink/60 mb-4">← Back to dashboard</button>
      <div className="text-xs uppercase tracking-wide text-[#A67A1E] font-semibold">Negotiation</div>
      <h1 className="font-display text-2xl font-bold mt-1">Chat with {other.name}</h1>

      <div className="bg-paperRaised border border-ink/10 rounded-lg shadow-sm mt-4 flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`max-w-[70%] px-3.5 py-2.5 rounded-xl text-sm ${
                m.sender._id === user.id || m.sender === user.id
                  ? 'self-end bg-ink text-paperRaised rounded-br-sm'
                  : 'self-start bg-paper border border-ink/10 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          ))}
          {otherTyping && <div className="text-xs text-ink/40 italic">{other.name} is typing...</div>}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 border-t border-ink/10 p-3">
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border border-ink/15 rounded-full px-4 py-2 text-sm"
          />
          <button onClick={sendMessage} className="bg-ink text-paperRaised rounded px-4 py-2 text-sm font-semibold">Send</button>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {swap.status === 'pending' && swap.toUser._id === user.id && (
          <>
            <button onClick={() => respond('accept')} className="bg-green text-paperRaised rounded px-4 py-2 text-sm font-semibold">Accept swap</button>
            <button onClick={() => respond('reject')} className="bg-rust text-paperRaised rounded px-4 py-2 text-sm font-semibold">Decline</button>
          </>
        )}
        {swap.status === 'accepted' && (
          <button onClick={() => respond('complete')} className="bg-green text-paperRaised rounded px-4 py-2 text-sm font-semibold">Mark swap complete</button>
        )}
        {swap.status === 'completed' && (
          <button onClick={submitReview} className="border border-ink/20 rounded px-4 py-2 text-sm">Leave a review</button>
        )}
      </div>
    </div>
  );
}
