import React, { useEffect, useState } from 'react';
import { listingApi } from '../api/services';
import ListingCard from '../components/ListingCard.jsx';
import { Link } from 'react-router-dom';

const CATEGORIES = ['Shirt', 'Dress', 'Jacket', 'Jeans', 'Footwear', 'Accessory', 'Ethnic Wear', 'Kidswear', 'Other'];

const ManilaFolderSelect = ({ value, onChange, options, defaultLabel }) => {
  return (
    <div className="relative bg-[#C4A482] border border-[#4E3629]/30 rounded-t-xl rounded-b-[4px] px-4 py-2 pr-9 min-w-[140px] shadow-sm hover:bg-[#bfa07e] transition-colors cursor-pointer select-none">
      {/* Silver Paper Clip overlay */}
      <svg className="absolute -top-2.5 right-2 w-4.5 h-7 text-[#455A64] drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
      {/* Native Select overlaid with transparent styling */}
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-transparent border-none text-xs font-bold text-[#4E3629] focus:outline-none cursor-pointer appearance-none pr-1"
      >
        {defaultLabel && <option value="" className="bg-[#FBFAF4] text-[#4E3629] font-bold">{defaultLabel}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={val} value={val} className="bg-[#FBFAF4] text-[#4E3629] font-semibold">
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default function Listings() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ category: '', search: '', sort: 'newest', page: 1 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  // debounce search input -> filters.search, avoids firing a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput, page: 1 })), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    listingApi
      .list(params)
      .then(({ data }) => {
        setItems(data.items);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'value_low', label: 'Value: low to high' },
    { value: 'value_high', label: 'Value: high to low' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-9">
      <div className="text-xs uppercase tracking-widest text-[#A67A1E] font-bold">Browse listings</div>
      <h1 className="font-display text-4xl font-bold mt-1 text-[#4E3629]">Find your next swap</h1>
      <p className="text-[#4E3629]/70 mt-2 text-sm max-w-lg">
        {pagination.total} clothing items currently available for exchange.
      </p>

      <div className="flex gap-4 flex-wrap items-end mt-6">
        <div className="flex flex-col gap-1">
          <input
            placeholder="Search by title, brand, tag..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-[#4E3629]/20 rounded-full px-5 py-2 text-sm bg-[#FBFAF4] text-[#4E3629] placeholder-[#4E3629]/40 w-68 focus:outline-none focus:ring-1 focus:ring-gold shadow-inner"
          />
        </div>

        <ManilaFolderSelect
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          options={CATEGORIES}
          defaultLabel="All categories"
        />

        <ManilaFolderSelect
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
          options={sortOptions}
        />

        <Link to="/dashboard" className="ml-auto bg-[#4E3629] hover:bg-[#4E3629]/90 text-[#FBFAF4] rounded-full px-5 py-2 text-sm font-semibold transition-colors shadow-sm">
          + List an item
        </Link>
      </div>


      {loading ? (
        <div className="text-center py-20 text-ink/50">Loading listings...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-ink/50">No items match these filters yet.</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-8 mt-8">
          {items.map((l) => (
            <ListingCard key={l._id} listing={l} />
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setFilters({ ...filters, page: p })}
              className={`w-8 h-8 rounded-full text-sm ${p === pagination.page ? 'bg-ink text-paperRaised' : 'border border-ink/15'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
