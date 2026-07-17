import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/services';

export default function Admin() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    adminApi.stats().then(({ data }) => setStats(data.stats));
    adminApi.users().then(({ data }) => setUsers(data.users));
    adminApi.listings().then(({ data }) => setListings(data.listings));
    adminApi.reports().then(({ data }) => setReports(data.reports));
  }, []);

  async function toggleBlock(id) {
    await adminApi.toggleBlock(id);
    const { data } = await adminApi.users();
    setUsers(data.users);
  }

  async function removeListing(id) {
    if (!confirm('Remove this listing?')) return;
    await adminApi.removeListing(id);
    setListings((prev) => prev.filter((l) => l._id !== id));
  }

  async function resolveReport(id, status) {
    await adminApi.resolveReport(id, { status });
    setReports((prev) => prev.filter((r) => r._id !== id));
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-9">
      <div className="text-xs uppercase tracking-wide text-[#A67A1E] font-semibold">Admin panel</div>
      <h1 className="font-display text-3xl font-bold mt-1">Platform overview</h1>

      <div className="flex gap-6 border-b border-ink/10 mt-6">
        {['stats', 'users', 'listings', 'reports'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2.5 text-sm capitalize ${tab === t ? 'border-b-2 border-gold font-semibold' : 'text-ink/60'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            ['Clothing listings', stats.totalListings],
            ['Successful swaps', stats.completedSwaps],
            ['Active users', stats.totalUsers],
            ['Swap conversion rate', `${stats.conversionRate}%`],
          ].map(([label, val]) => (
            <div key={label} className="bg-paperRaised border border-ink/10 rounded-lg p-4">
              <div className="font-display text-3xl font-semibold">{val}</div>
              <div className="text-xs text-ink/60">{label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <table className="w-full text-sm mt-6">
          <thead><tr className="text-left text-[11px] uppercase text-ink/50 border-b border-ink/10"><th className="py-2">Name</th><th>Email</th><th>Location</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-ink/10">
                <td className="py-2.5">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.location?.city}</td>
                <td>{u.isBlocked ? <span className="text-rust text-xs font-semibold">Blocked</span> : <span className="text-green text-xs font-semibold">Active</span>}</td>
                <td className="text-right">
                  {u.role !== 'admin' && (
                    <button onClick={() => toggleBlock(u._id)} className="border border-ink/15 rounded-full px-3 py-1 text-xs">
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'listings' && (
        <table className="w-full text-sm mt-6">
          <thead><tr className="text-left text-[11px] uppercase text-ink/50 border-b border-ink/10"><th className="py-2">Title</th><th>Owner</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l._id} className="border-b border-ink/10">
                <td className="py-2.5">{l.title}</td>
                <td>{l.owner?.name}</td>
                <td>{l.status}</td>
                <td className="text-right">
                  <button onClick={() => removeListing(l._id)} className="bg-rust text-paperRaised rounded-full px-3 py-1 text-xs">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'reports' && (
        reports.length === 0 ? (
          <div className="text-center py-16 text-ink/50">No open reports.</div>
        ) : (
          <table className="w-full text-sm mt-6">
            <thead><tr className="text-left text-[11px] uppercase text-ink/50 border-b border-ink/10"><th className="py-2">Reporter</th><th>Target type</th><th>Reason</th><th></th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-b border-ink/10">
                  <td className="py-2.5">{r.reporter?.name}</td>
                  <td>{r.targetType}</td>
                  <td>{r.reason}</td>
                  <td className="text-right space-x-1.5">
                    <button onClick={() => resolveReport(r._id, 'reviewed')} className="bg-green text-paperRaised rounded-full px-3 py-1 text-xs">Resolve</button>
                    <button onClick={() => resolveReport(r._id, 'dismissed')} className="border border-ink/15 rounded-full px-3 py-1 text-xs">Dismiss</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
