import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { items as itemsApi, tags as tagsApi } from '../api';
import SummaryCards from '../components/SummaryCards';

export default function ReadingList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaryKey, setSummaryKey] = useState(0);

  // Filter state from URL
  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'savedAt';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await itemsApi.list({ page, q, status, tag, sort });
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, q, status, tag, sort]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    tagsApi.list().then(r => setTags(r.tags)).catch(() => {});
  }, []);

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  }

  async function handleStatusToggle(item) {
    const newStatus = item.status === 'READ' ? 'UNREAD' : 'READ';
    try {
      await itemsApi.updateStatus(item.id, newStatus);
      await loadItems();
      setSummaryKey(k => k + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  function formatDate(isoString) {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div>
      <SummaryCards key={summaryKey} />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-ink-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search title, URL, or notes..."
              value={q}
              onChange={e => updateFilter('q', e.target.value)}
              className="w-full px-4 py-2 bg-paper-50 border border-ink-200 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent text-sm"
            />
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={e => updateFilter('status', e.target.value)}
            className="px-4 py-2 bg-paper-50 border border-ink-200 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent text-sm"
          >
            <option value="">All Statuses</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>

          {/* Tag filter */}
          <select
            value={tag}
            onChange={e => updateFilter('tag', e.target.value)}
            className="px-4 py-2 bg-paper-50 border border-ink-200 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent text-sm"
          >
            <option value="">All Tags</option>
            {tags.map(t => (
              <option key={t.id} value={t.id}>{capitalize(t.name)}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => updateFilter('sort', e.target.value)}
            className="px-4 py-2 bg-paper-50 border border-ink-200 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent text-sm"
          >
            <option value="savedAt">Newest First</option>
            <option value="statusFirst">Unread First</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-100 mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-ink-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-ink-500 animate-pulse-gentle">
            Loading items...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-ink-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-ink-600 font-medium mb-1">No items found</p>
            <p className="text-ink-400 text-sm mb-4">
              {q || status || tag ? 'Try adjusting your filters' : 'Start by adding your first reading item'}
            </p>
            <Link
              to="/items/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-100">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-ink-700">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-ink-700 w-24">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-ink-700">Tags</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-ink-700 w-28">Saved</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-ink-700 w-28">Read</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-ink-700 w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-paper-50 transition-colors">
                    <td className="px-4 py-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink-900 hover:text-accent font-medium text-sm block truncate max-w-xs"
                        title={item.title}
                      >
                        {item.title}
                      </a>
                      <span className="text-xs text-ink-400 truncate block max-w-xs" title={item.url}>
                        {item.url}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'UNREAD' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map(t => (
                          <span
                            key={t.id}
                            className="inline-flex px-2 py-0.5 bg-ink-100 text-ink-600 text-xs rounded-full"
                          >
                            {capitalize(t.name)}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs text-ink-400">+{item.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-600">
                      {formatDate(item.saved_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-600">
                      {formatDate(item.read_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStatusToggle(item)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            item.status === 'UNREAD'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          {item.status === 'UNREAD' ? 'Mark Read' : 'Mark Unread'}
                        </button>
                        <Link
                          to={`/items/${item.id}/edit`}
                          className="px-3 py-1.5 text-xs font-medium text-ink-600 hover:text-ink-900 bg-ink-100 hover:bg-ink-200 rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 bg-ink-50 border-t border-ink-100 flex items-center justify-between">
            <p className="text-sm text-ink-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => updateFilter('page', String(page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm font-medium text-ink-600 bg-white border border-ink-200 rounded-lg hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => updateFilter('page', String(page + 1))}
                disabled={page >= pagination.totalPages}
                className="px-3 py-1.5 text-sm font-medium text-ink-600 bg-white border border-ink-200 rounded-lg hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

