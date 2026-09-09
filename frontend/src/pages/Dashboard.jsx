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
    ['incoming', `Incoming (${incoming.length})`],
    ['outgoing', `Outgoing (${outgoing.length})`],
    ['new', '+ New'],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9">
      <div className="text-[10px] sm:text-xs uppercase tracking-wide text-[#A67A1E] font-semibold">
        Your account
      </div>
      <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
        {user?.name}'s dashboard
      </h1>

      {/* ── Tab bar — scrollable on mobile ── */}
      <div className="flex gap-1.5 sm:gap-2 border-b border-[#4E3629]/20 mt-5 sm:mt-6 overflow-x-auto pb-0 scrollbar-none">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold rounded-t-xl transition-all duration-200 whitespace-nowrap ${
              tab === key
                ? 'bg-[#C4A482] text-[#4E3629] border border-[#4E3629]/30 border-b-transparent shadow-sm'
                : 'bg-[#FBFAF4]/35 text-[#4E3629]/65 hover:bg-[#FBFAF4]/65 border border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 sm:mt-6">
        {/* ── My Listings grid ── */}
        {tab === 'listings' &&
          (listings.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4 sm:gap-6 lg:gap-8">
              {listings.map((l) => (
                <ListingCard key={l._id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-ink/50 text-sm">
              You haven't listed anything yet.
            </div>
          ))}

        {/* ── New listing form ── */}
        {tab === 'new' && (
          <form
            onSubmit={handleCreate}
            className="bg-paperRaised border border-ink/10 rounded-xl shadow-sm p-4 sm:p-6 max-w-lg space-y-4"
          >
            {error && (
              <div className="text-sm text-rust bg-rust/10 border border-rust/20 rounded p-2">{error}</div>
            )}
            <Field label="Title">
              <input required className="in" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select className="in" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Condition">
                <select className="in" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand">
                <input className="in" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </Field>
              <Field label="Size">
                <input required className="in" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
              </Field>
            </div>
            <Field label="Estimated swap value (₹)">
              <input required type="number" min="0" className="in" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <input required className="in" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
              <Field label="State">
                <input required className="in" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </Field>
            </div>
            <Field label="Description">
              <textarea required className="in min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Photos (up to 6)">
              <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files))} className="text-sm w-full" />
            </Field>
            <button className="w-full bg-ink text-paperRaised rounded-lg px-5 py-3 text-sm font-semibold hover:bg-ink/90 transition-colors">
              Publish listing
            </button>
          </form>
        )}

        {/* ── Swap tables ── */}
        {(tab === 'incoming' || tab === 'outgoing') && (
          <SwapList
            swaps={tab === 'incoming' ? incoming : outgoing}
            isIncoming={tab === 'incoming'}
            onRespond={respond}
            onOpenChat={(id) => navigate(`/swaps/${id}`)}
          />
        )}
      </div>

      <style>{`.in{width:100%;border:1px solid rgba(33,44,57,.15);border-radius:6px;padding:9px 12px;background:#F1EFE4;font-size:14px}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink/60 mb-1">{label}</label>
      {children}
    </div>
  );
}

/**
 * SwapList — card-based on mobile, table on sm+
 */
function SwapList({ swaps, isIncoming, onRespond, onOpenChat }) {
  if (!swaps.length)
    return <div className="text-center py-16 text-ink/50 text-sm">Nothing here yet.</div>;

  return (
    <>
      {/* ── Mobile card layout (hidden sm+) ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {swaps.map((r) => (
          <div key={r._id} className="bg-paperRaised border border-ink/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#4E3629]">
                {isIncoming ? r.fromUser?.name : r.toUser?.name}
              </span>
              <StatusPill status={r.status} />
            </div>
            <div className="text-xs text-ink/60">
              <span className="font-medium">Offered:</span> {r.itemOffered?.title}
            </div>
            <div className="text-xs text-ink/60">
              <span className="font-medium">Wanted:</span> {r.itemWanted?.title}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => onOpenChat(r._id)}
                className="border border-ink/15 rounded-full px-4 py-1.5 text-xs font-medium"
              >
                Chat
              </button>
              {isIncoming && r.status === 'pending' && (
                <>
                  <button
                    onClick={() => onRespond(r._id, 'accept')}
                    className="bg-green text-paperRaised rounded-full px-4 py-1.5 text-xs font-semibold"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onRespond(r._id, 'reject')}
                    className="bg-rust text-paperRaised rounded-full px-4 py-1.5 text-xs font-semibold"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table (hidden on mobile) ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="text-left text-[11px] uppercase text-ink/50 border-b border-ink/10">
              <th className="py-2 pr-4">With</th>
              <th className="pr-4">Offered</th>
              <th className="pr-4">Wanted</th>
              <th className="pr-4">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {swaps.map((r) => (
              <tr key={r._id} className="border-b border-ink/10">
                <td className="py-2.5 pr-4">{isIncoming ? r.fromUser?.name : r.toUser?.name}</td>
                <td className="pr-4 max-w-[140px] truncate">{r.itemOffered?.title}</td>
                <td className="pr-4 max-w-[140px] truncate">{r.itemWanted?.title}</td>
                <td className="pr-4"><StatusPill status={r.status} /></td>
                <td className="text-right space-x-1.5 whitespace-nowrap">
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
      </div>
    </>
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
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${styles[status] || ''}`}>
      {status}
    </span>
  );
}
