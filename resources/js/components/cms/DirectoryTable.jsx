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

/**
 * Paginated directory table styled like the village list
 * (blue header, Previous / page / Next).
 *
 * columns: [{ key, label, sortable?, link?, format? }]
 */
export default function DirectoryTable({
  rows = [],
  columns = [],
  getLink,
  searchKeys,
}) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(columns.find((c) => c.sortable !== false && c.key !== 'sno')?.key || columns[0]?.key);
  const [sortDir, setSortDir] = useState('asc');

  const keysToSearch = searchKeys || columns.map((c) => c.key).filter((k) => k !== 'sno');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...rows];
    if (q) {
      list = list.filter((r) =>
        keysToSearch.some((k) => String(r[k] ?? '').toLowerCase().includes(q))
      );
    }
    if (sortKey && sortKey !== 'sno') {
      list.sort((a, b) => {
        const av = String(a[sortKey] ?? '').toLowerCase();
        const bv = String(b[sortKey] ?? '').toLowerCase();
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [rows, search, sortKey, sortDir, keysToSearch]);

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

  const renderCell = (row, col, index) => {
    if (col.render) return col.render(row, index);
    if (col.key === 'sno') return start + index + 1;
    const raw = row[col.key];
    const value = col.format ? col.format(raw, row) : (raw || '—');
    if (col.link || (col.key === 'name' && getLink)) {
      const href = getLink?.(row);
      if (href) {
        return <Link to={href} className="text-[#337ab7] hover:underline font-medium">{value}</Link>;
      }
    }
    return value;
  };

  const thClass = (i, total) =>
    `text-left font-semibold px-4 py-3 ${columns[i]?.width || ''} border-r border-white/25 last:border-r-0`;
  const tdClass = 'px-4 py-3 text-gray-700 border-r border-gray-200 last:border-r-0';

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
          <label htmlFor="dir-table-search" className="text-gray-600">Search:</label>
          <input
            id="dir-table-search"
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-1.5 w-full sm:w-56"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#337ab7] text-white">
              {columns.map((col, i) => (
                <th key={col.key} className={thClass(i, columns.length)}>
                  {col.sortable === false || col.key === 'sno' ? (
                    col.label
                  ) : (
                    <SortBtn col={col.key} label={col.label} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-500">No records found.</td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr key={row.id || i} className="border-t border-gray-200 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className={tdClass}>
                      {renderCell(row, col, i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
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
            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>
          {[...Array(Math.min(totalPages, 7))].map((_, i) => {
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
            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 inline-flex items-center gap-1"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export { formatDate };
