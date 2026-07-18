import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingApi, userApi } from '../api/services';
import { useAuth } from '../context/AuthContext.jsx';

const PushPin = () => (
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
    <div className="w-3 h-3 rounded-full bg-[#78909C] border border-[#455A64] shadow-sm" />
    <div className="w-[1.2px] h-3 bg-gray-400 -mt-[1px]" />
  </div>
);

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    listingApi.detail(id).then(({ data }) => setListing(data.listing));
  }, [id]);

  if (!listing) return <div className="text-center py-20 text-ink/50">Loading...</div>;

  const isMine = listing.owner?._id === user?.id;

  async function handleWishlist() {
    await userApi.toggleWishlist(listing._id);
    setWishlisted((w) => !w);
  }

  async function handleDelete() {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await listingApi.remove(listing._id);
        navigate('/listings');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete listing');
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-9">
      <button onClick={() => navigate('/listings')} className="text-sm text-[#4E3629]/70 hover:text-[#4E3629] mb-4">
        ← Back to listings
      </button>
      <div className="flex gap-8 flex-wrap items-start">
        <div className="relative overflow-visible bg-[#FBFAF4] border border-[#4E3629]/15 rounded-xl shadow-sm p-4 text-center w-64">
          <PushPin />
          <div className="h-64 rounded flex items-center justify-center text-8xl bg-gradient-to-br from-paper to-[#e6e2d3]">
            {listing.images?.[0]?.url ? (
              <img src={listing.images[0].url} className="h-full w-full object-cover rounded" alt={listing.title} />
            ) : (
              '👕'
            )}
          </div>
          <div className="font-mono text-xs text-ink/50 mt-2">{listing._id.slice(-8).toUpperCase()}</div>
        </div>

        <div className="flex-1 min-w-[280px]">
          <div className="text-xs uppercase tracking-wide text-[#A67A1E] font-semibold">
            {listing.category} · {listing.brand}
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">{listing.title}</h1>
          <p className="text-ink/60 mt-2 text-sm max-w-lg">{listing.description}</p>

          <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
            {[
              ['Size', listing.size],
              ['Condition', listing.condition],
              ['Est. value', `₹${listing.estimatedValue}`],
            ].map(([label, val]) => (
              <div key={label} className="bg-paperRaised border border-ink/10 rounded-lg p-3">
                <div className="text-[11px] text-ink/50">{label}</div>
                <div className="font-semibold">{val}</div>
              </div>
            ))}
          </div>

          <p className="text-sm text-ink/60 mt-4">
            Listed by <strong className="text-ink">{listing.owner?.name}</strong> · {listing.location?.city}
          </p>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => navigate(`/swap/${listing._id}`)}
              className="bg-ink text-paperRaised rounded px-5 py-2.5 text-sm font-semibold"
            >
              Propose a swap →
            </button>
            {isMine ? (
              <>
                <span className="border border-ink/10 rounded-full px-4 py-2 text-sm text-ink/70">This is your own listing</span>
                <button
                  onClick={handleDelete}
                  className="bg-rust text-paperRaised rounded px-5 py-2.5 text-sm font-semibold hover:bg-rust/90 transition-colors"
                >
                  Delete listing
                </button>
              </>
            ) : (
              <button
                onClick={handleWishlist}
                className="border border-ink/20 rounded px-4 py-2.5 text-sm"
              >
                {wishlisted ? '♥ Saved' : '♡ Save to wishlist'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
