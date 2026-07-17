import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingApi, swapApi } from '../api/services';
import { useAuth } from '../context/AuthContext.jsx';
import ListingCard from '../components/ListingCard.jsx';

const CATEGORIES = ['Shirt', 'Dress', 'Jacket', 'Jeans', 'Footwear', 'Accessory', 'Ethnic Wear', 'Kidswear', 'Other'];
const CONDITIONS = ['New with tags', 'Like New', 'Good', 'Fair'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Shirt', brand: '', size: '', condition: 'Good',
    estimatedValue: '', city: user?.location?.city || '', state: user?.location?.state || '',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  function refreshListings() {
    listingApi.mine().then(({ data }) => setListings(data.listings));
  }
  function refreshSwaps() {
    swapApi.mine('incoming').then(({ data }) => setIncoming(data.swaps));
    swapApi.mine('outgoing').then(({ data }) => setOutgoing(data.swaps));
  }

  useEffect(() => {
    refreshListings();
    refreshSwaps();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    files.forEach((f) => fd.append('images', f));
    try {
      await listingApi.create(fd);
      setForm({ ...form, title: '', description: '', brand: '', size: '', estimatedValue: '' });
      setFiles([]);
      setTab('listings');
      refreshListings();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Could not publish listing');
    }
  }

  async function respond(id, action) {
    await swapApi.respond(id, action);
    refreshSwaps();
    refreshListings();
  }

  const tabs = [
    ['listings', `My Listings (${listings.length})`],
    ['incoming', `Incoming Requests (${incoming.length})`],
    ['outgoing', `Outgoing Requests (${outgoing.length})`],
    ['new', '+ New Listing'],
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-9">
      <div className="text-xs uppercase tracking-wide text-[#A67A1E] font-semibold">Your account</div>
      <h1 className="font-display text-3xl font-bold mt-1">{user?.name}'s dashboard</h1>

      <div className="flex gap-6 border-b border-ink/10 mt-6">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2.5 text-sm ${tab === key ? 'border-b-2 border-gold font-semibold' : 'text-ink/60'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'listings' &&
          (listings.length ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-8">
              {listings.map((l) => (
                <ListingCard key={l._id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-ink/50">You haven't listed anything yet.</div>
          ))}

        {tab === 'new' && (
          <form onSubmit={handleCreate} className="bg-paperRaised border border-ink/10 rounded-lg shadow-sm p-6 max-w-lg space-y-4">
            {error && <div className="text-sm text-rust bg-rust/10 border border-rust/20 rounded p-2">{error}</div>}
            <Field label="Title"><input required className="in" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <div className="flex gap-3">
              <Field label="Category" className="flex-1">
                <select className="in" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Condition" className="flex-1">
                <select className="in" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex gap-3">
              <Field label="Brand" className="flex-1"><input className="in" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field>
              <Field label="Size" className="flex-1"><input required className="in" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></Field>
            </div>
            <Field label="Estimated swap value (₹)">
              <input required type="number" min="0" className="in" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
            </Field>
            <div className="flex gap-3">
              <Field label="City" className="flex-1"><input required className="in" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
              <Field label="State" className="flex-1"><input required className="in" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
            </div>
            <Field label="Description">
              <textarea required className="in min-h-[70px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Photos (up to 6)">
              <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files))} className="text-sm" />
            </Field>
            <button className="bg-ink text-paperRaised rounded px-5 py-2.5 text-sm font-semibold">Publish listing</button>
          </form>
        )}

        {(tab === 'incoming' || tab === 'outgoing') && (
          <SwapTable swaps={tab === 'incoming' ? incoming : outgoing} isIncoming={tab === 'incoming'} onRespond={respond} onOpenChat={(id) => navigate(`/swaps/${id}`)} />
        )}
      </div>
      <style>{`.in{width:100%;border:1px solid rgba(33,44,57,.15);border-radius:5px;padding:8px 12px;background:#F1EFE4;font-size:14px}`}</style>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-ink/60 mb-1">{label}</label>
      {children}
    </div>
  );
}

function SwapTable({ swaps, isIncoming, onRespond, onOpenChat }) {
  if (!swaps.length) return <div className="text-center py-16 text-ink/50">Nothing here yet.</div>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[11px] uppercase text-ink/50 border-b border-ink/10">
          <th className="py-2">With</th><th>Offered</th><th>Wanted</th><th>Status</th><th></th>
        </tr>
      </thead>
      <tbody>
        {swaps.map((r) => (
          <tr key={r._id} className="border-b border-ink/10">
            <td className="py-2.5">{isIncoming ? r.fromUser?.name : r.toUser?.name}</td>
            <td>{r.itemOffered?.title}</td>
            <td>{r.itemWanted?.title}</td>
            <td><StatusPill status={r.status} /></td>
            <td className="text-right space-x-1.5">
              <button onClick={() => onOpenChat(r._id)} className="border border-ink/15 rounded-full px-3 py-1 text-xs">Chat</button>
              {isIncoming && r.status === 'pending' && (
                <>
                  <button onClick={() => onRespond(r._id, 'accept')} className="bg-green text-paperRaised rounded-full px-3 py-1 text-xs">Accept</button>
                  <button onClick={() => onRespond(r._id, 'reject')} className="bg-rust text-paperRaised rounded-full px-3 py-1 text-xs">Reject</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatusPill({ status }) {
  const styles = {
    pending: 'bg-[#EFE0BC] text-[#8A6416]',
    accepted: 'bg-[#D9E8DE] text-[#356449]',
    rejected: 'bg-[#F1D9D0] text-[#9A4425]',
    completed: 'bg-[#D9E8DE] text-[#356449]',
    cancelled: 'bg-[#F1D9D0] text-[#9A4425]',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${styles[status] || ''}`}>{status}</span>;
}
