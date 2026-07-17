import React, { useEffect, useState } from 'react';
import { listingApi } from '../api/services';
import ListingCard from '../components/ListingCard.jsx';
import { Link } from 'react-router-dom';

const CATEGORIES = ['Shirt', 'Dress', 'Jacket', 'Jeans', 'Footwear', 'Accessory', 'Ethnic Wear', 'Kidswear', 'Other'];

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

  return (
    <div className="max-w-6xl mx-auto px-8 py-9">
      <div className="text-xs uppercase tracking-wide text-[#A67A1E] font-semibold">Browse listings</div>
      <h1 className="font-display text-4xl font-bold mt-1">Find your next swap</h1>
      <p className="text-ink/60 mt-2 text-sm max-w-lg">
        {pagination.total} clothing items currently available for exchange.
      </p>

      <div className="flex gap-3 flex-wrap items-center mt-6">
        <input
          placeholder="Search by title, brand, tag..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border border-ink/15 rounded-full px-4 py-2 text-sm bg-paperRaised w-64"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          className="border border-ink/15 rounded-full px-3 py-2 text-sm bg-paperRaised"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
          className="border border-ink/15 rounded-full px-3 py-2 text-sm bg-paperRaised"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="value_low">Value: low to high</option>
          <option value="value_high">Value: high to low</option>
        </select>
        <Link to="/dashboard" className="ml-auto border border-ink/20 rounded-full px-4 py-2 text-sm font-medium">
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
