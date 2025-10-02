import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { items as itemsApi, tags as tagsApi } from '../api';
import ConfirmModal from '../components/ConfirmModal';

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    url: '',
    status: 'UNREAD',
    notes: '',
    tagIds: []
  });

  useEffect(() => {
    Promise.all([
      itemsApi.get(id),
      tagsApi.list()
    ]).then(([itemRes, tagsRes]) => {
      const item = itemRes.item;
      setForm({
        title: item.title,
        url: item.url,
        status: item.status,
        notes: item.notes || '',
        tagIds: item.tags.map(t => t.id)
      });
      setTags(tagsRes.tags);
    }).catch(err => {
      setError(err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleTagToggle(tagId) {
    setForm(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(tid => tid !== tagId)
        : [...prev.tagIds, tagId]
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await itemsApi.update(id, {
        title: form.title,
        url: form.url,
        status: form.status,
        notes: form.notes || null,
        tagIds: form.tagIds
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await itemsApi.delete(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setShowDeleteModal(false);
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-12 text-center">
          <div className="text-ink-500 animate-pulse-gentle">Loading item...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="text-sm text-ink-500 hover:text-ink-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to list
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-ink-900">Edit Item</h1>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ink-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={180}
              className="w-full px-4 py-2.5 bg-paper-50 border border-ink-200 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-ink-700 mb-1.5">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              id="url"
              name="url"
              type="url"
              value={form.url}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-paper-50 border border-ink-200 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-ink-700 mb-1.5">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-paper-50 border border-ink-200 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    form.tagIds.includes(tag.id)
                      ? 'bg-accent text-white'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  }`}
                >
                  {capitalize(tag.name)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-ink-700 mb-1.5">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              maxLength={5000}
              className="w-full px-4 py-2.5 bg-paper-50 border border-ink-200 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent resize-y"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              to="/"
              className="py-2.5 px-6 bg-ink-100 hover:bg-ink-200 text-ink-700 font-medium rounded-lg transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this reading item? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}

