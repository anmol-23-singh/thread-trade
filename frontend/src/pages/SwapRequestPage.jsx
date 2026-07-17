import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingApi, swapApi } from '../api/services';

const PushPin = () => (
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
    <div className="w-3 h-3 rounded-full bg-[#78909C] border border-[#455A64] shadow-sm" />
    <div className="w-[1.2px] h-3 bg-gray-400 -mt-[1px]" />
  </div>
);

export default function SwapRequestPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [wanted, setWanted] = useState(null);
  const [mine, setMine] = useState([]);
  const [offeredId, setOfferedId] = useState('');
  const [cashTopUp, setCashTopUp] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listingApi.detail(itemId).then(({ data }) => setWanted(data.listing));
    listingApi.mine().then(({ data }) => {
      const available = data.listings.filter((l) => l.status === 'Available');
      setMine(available);
      if (available[0]) setOfferedId(available[0]._id);
    });
  }, [itemId]);

  if (!wanted) return <div className="text-center py-20 text-ink/50">Loading...</div>;

  const offered = mine.find((l) => l._id === offeredId);
  const diff = offered ? wanted.estimatedValue - (offered.estimatedValue + Number(cashTopUp || 0)) : 0;
  const fair = offered ? Math.abs(diff) <= Math.max(150, wanted.estimatedValue * 0.15) : null;

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      const { data } = await swapApi.create({
        itemOffered: offeredId,
        itemWanted: wanted._id,
        cashTopUp: Number(cashTopUp) || 0,
        note,
      });
      navigate(`/swaps/${data.swap._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send swap request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-9">
      <button onClick={() => navigate(-1)} className="text-sm text-[#4E3629]/75 hover:text-[#4E3629] mb-4">← Back</button>
      <div className="text-xs uppercase tracking-wide text-[#A67A1E] font-semibold">Propose a swap</div>
      <h1 className="font-display text-3xl font-bold mt-1 text-[#4E3629]">Trade for "{wanted.title}"</h1>

      {mine.length === 0 ? (
        <div className="relative overflow-visible bg-[#FBFAF4] border border-[#4E3629]/15 rounded-xl p-6 mt-6">
          <PushPin />
          <p className="text-sm">You don't have any items listed yet, so there's nothing to offer in trade.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-[#4E3629] text-paperRaised rounded px-4 py-2 text-sm mt-3">
            List an item first
          </button>
        </div>
      ) : (
        <div className="relative overflow-visible bg-[#FBFAF4] border border-[#4E3629]/15 rounded-xl shadow-sm p-6 mt-6 space-y-4">
          <PushPin />
          {error && <div className="text-sm text-rust bg-rust/10 border border-rust/20 rounded p-2">{error}</div>}
          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-1">Choose an item to offer</label>
            <select
              value={offeredId}
              onChange={(e) => setOfferedId(e.target.value)}
              className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm"
            >
              {mine.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.title} — ~₹{l.estimatedValue}
                </option>
              ))}
            </select>
          </div>

          {offered && (
            <div className="text-center py-3">
              <div className="flex items-center justify-center gap-6">
                <div className="text-sm">
                  <div className="text-3xl">👕</div>
                  {offered.title}
                  <div className="font-mono text-[#A67A1E]">~₹{offered.estimatedValue}</div>
                </div>
                <div className="italic text-ink/50 font-display">for</div>
                <div className="text-sm">
                  <div className="text-3xl">👕</div>
                  {wanted.title}
                  <div className="font-mono text-[#A67A1E]">~₹{wanted.estimatedValue}</div>
                </div>
              </div>
              <p className={`text-sm font-semibold mt-3 ${fair ? 'text-green' : 'text-rust'}`}>
                {fair
                  ? '✓ This looks like a fair-value match.'
                  : diff > 0
                  ? `⚠ Your item is worth ~₹${diff} less — consider adding a cash top-up.`
                  : `⚠ Your item is worth ~₹${-diff} more — the owner may ask for extra.`}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-1">Optional cash top-up (₹)</label>
            <input
              type="number"
              min="0"
              value={cashTopUp}
              onChange={(e) => setCashTopUp(e.target.value)}
              className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-1">Note to the owner</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Happy to add a small cash top-up if the value doesn't match exactly."
              className="w-full border border-ink/15 rounded px-3 py-2 bg-paper text-sm min-h-[70px]"
            />
          </div>

          <button onClick={handleSubmit} disabled={submitting} className="bg-green text-paperRaised rounded px-5 py-2.5 text-sm font-semibold">
            {submitting ? 'Sending...' : 'Send swap request'}
          </button>
        </div>
      )}
    </div>
  );
}
