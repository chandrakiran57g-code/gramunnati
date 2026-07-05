import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';

const PAGE_SIZES = [10, 25, 50, 100];

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ServiceDirectoryTable({ rows = [], getLink, variant = 'default' }) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...rows];
    if (q) {
      list = list.filter((r) =>
        [r.name, r.mandal, r.district, r.state].some((v) => String(v || '').toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      const av = String(a[sortKey] || '').toLowerCase();
      const bv = String(b[sortKey] || '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [rows, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const SortBtn = ({ col, label }) => (
    <button type="button" onClick={() => toggleSort(col)} className="inline-flex items-center gap-1 hover:text-white/90">
      {label} <ChevronsUpDown className="w-3.5 h-3.5 opacity-70" />
    </button>
  );

  const isVolunteers = variant === 'volunteers';
  const colSpan = 5;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-gray-200 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border border-gray-300 rounded px-2 py-1 bg-white"
          >
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>entries</span>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="dir-search" className="text-gray-600">Search:</label>
          <input
            id="dir-search"
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-1.5 w-full sm:w-56"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#337ab7] text-white">
              <th className="text-left font-semibold px-4 py-3 w-16">S.No</th>
              <th className="text-left font-semibold px-4 py-3"><SortBtn col="name" label="Name" /></th>
              {isVolunteers ? (
                <th className="text-left font-semibold px-4 py-3"><SortBtn col="state" label="State" /></th>
              ) : (
                <th className="text-left font-semibold px-4 py-3"><SortBtn col="mandal" label="Mandal" /></th>
              )}
              <th className="text-left font-semibold px-4 py-3"><SortBtn col="district" label="District" /></th>
              <th className="text-left font-semibold px-4 py-3"><SortBtn col="date_of_entry" label="Date of Entry" /></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-gray-500">No records found.</td></tr>
            ) : pageRows.map((row, i) => {
              const href = getLink(row);
              return (
                <tr key={row.id || i} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{start + i + 1}</td>
                  <td className="px-4 py-3">
                    {href ? (
                      <Link to={href} className="text-[#337ab7] hover:underline font-medium">{row.name}</Link>
                    ) : (
                      <span className="text-gray-800">{row.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{isVolunteers ? (row.state || '—') : (row.mandal || '—')}</td>
                  <td className="px-4 py-3 text-gray-700">{row.district || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(row.date_of_entry)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
        <div>
          Showing {filtered.length === 0 ? 0 : start + 1} to {Math.min(start + pageSize, filtered.length)} of {filtered.length} entries
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].slice(0, 7).map((_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`px-3 py-1.5 border rounded min-w-[2.25rem] ${
                  n === currentPage ? 'bg-[#337ab7] text-white border-[#337ab7]' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            );
          })}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
