import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/listings/${listing._id}`)}
      className="hangtag bg-paperRaised border border-ink/10 shadow-sm p-4 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex justify-between items-center mb-1.5">
        <div className="text-[11px] font-mono text-ink/50">{listing._id.slice(-6).toUpperCase()}</div>
        {listing.brand && listing.brand !== 'Unbranded' && (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A67A1E] bg-[#A67A1E]/10 px-2 py-0.5 rounded-full">
            {listing.brand}
          </span>
        )}
      </div>
      <div className="h-36 my-2 rounded flex items-center justify-center text-5xl bg-gradient-to-br from-paper to-[#e6e2d3] overflow-hidden">
        {listing.images?.[0]?.url ? (
          <img src={listing.images[0].url} alt={listing.title} className="h-full w-full object-cover rounded group-hover:scale-105 transition-transform duration-300" />
        ) : (
          '👕'
        )}
      </div>
      <div className="font-display font-semibold text-[17px] group-hover:text-[#A67A1E] transition-colors">{listing.title}</div>
      <div className="flex flex-wrap gap-1.5 my-1.5 text-[11px]">
        <span className="border border-ink/10 rounded-full px-2 py-0.5">{listing.size}</span>
        <span className="border border-ink/10 rounded-full px-2 py-0.5">{listing.condition}</span>
        <span className="border border-ink/10 rounded-full px-2 py-0.5">{listing.location?.city}</span>
      </div>
      <div className="flex justify-between items-center border-t border-dashed border-ink/15 pt-2 mt-1.5">
        <span className="font-mono font-semibold text-[#A67A1E]">~₹{listing.estimatedValue}</span>
        <span className="text-[11px] text-ink/50">{listing.owner?.name?.split(' ')[0]}</span>
      </div>
    </div>
  );
}
