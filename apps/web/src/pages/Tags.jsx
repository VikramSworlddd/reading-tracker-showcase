import { useState, useEffect } from 'react';
import { tags as tagsApi } from '../api';
import ConfirmModal from '../components/ConfirmModal';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    try {
      const { tags } = await tagsApi.list();
      setTags(tags);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTagName.trim()) return;
    
    setError('');
    setCreating(true);
    try {
      await tagsApi.create(newTagName);
      setNewTagName('');
      await loadTags();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function startEditing(tag) {
    setEditingId(tag.id);
    setEditingName(tag.name);
    setError('');
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName('');
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingName.trim()) return;
    
    setError('');
    try {
      await tagsApi.update(editingId, editingName);
      cancelEditing();
      await loadTags();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    try {
      await tagsApi.delete(deleteId);
      setDeleteId(null);
      await loadTags();
    } catch (err) {
      setError(err.message);
      setDeleteId(null);
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const tagToDelete = tags.find(t => t.id === deleteId);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-6">Manage Tags</h1>

      {/* Create new tag */}
      <div className="bg-white rounded-xl shadow-sm border border-ink-100 p-4 mb-6">
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            placeholder="New tag name..."
            maxLength={50}
            className="flex-1 px-4 py-2 bg-paper-50 border border-ink-200 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent text-sm"
          />
          <button
            type="submit"
            disabled={creating || !newTagName.trim()}
            className="px-6 py-2 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            {creating ? 'Creating...' : 'Create Tag'}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-100 mb-6">
          {error}
        </div>
      )}

      {/* Tags list */}
      <div className="bg-white rounded-xl shadow-sm border border-ink-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-ink-500 animate-pulse-gentle">
            Loading tags...
          </div>
        ) : tags.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-ink-400 mb-2">
              <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-ink-600 font-medium">No tags yet</p>
            <p className="text-ink-400 text-sm">Create your first tag above</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {tags.map(tag => (
              <li key={tag.id} className="px-4 py-3 hover:bg-paper-50 transition-colors">
                {editingId === tag.id ? (
                  <form onSubmit={handleUpdate} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      autoFocus
                      maxLength={50}
                      className="flex-1 px-3 py-1.5 bg-paper-50 border border-ink-200 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent text-sm"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-sm font-medium text-white bg-accent hover:bg-accent-dark rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-3 py-1.5 text-sm font-medium text-ink-600 hover:text-ink-900 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-ink-900">{capitalize(tag.name)}</span>
                      <span className="text-sm text-ink-400">
                        {tag.item_count} {tag.item_count === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(tag)}
                        className="px-3 py-1.5 text-sm font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition-colors"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => setDeleteId(tag.id)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-sm text-ink-400 mt-4">
        Deleting a tag will remove it from all items but won't delete the items themselves.
      </p>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Tag"
        message={`Are you sure you want to delete "${tagToDelete ? capitalize(tagToDelete.name) : ''}"? It will be removed from ${tagToDelete?.item_count || 0} items.`}
        confirmText="Delete"
      />
    </div>
  );
}

