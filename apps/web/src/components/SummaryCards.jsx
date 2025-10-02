import { useEffect, useState } from 'react';
import { metrics } from '../api';

export default function SummaryCards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const result = await metrics.summary();
      setData(result);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-ink-100 animate-pulse">
            <div className="h-4 bg-ink-100 rounded w-20 mb-3" />
            <div className="h-8 bg-ink-100 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    { label: 'Unread', value: data.unreadCount, color: 'text-accent' },
    { label: 'Read This Month', value: data.readThisMonthCount, color: 'text-emerald-600' },
    { label: 'Total Items', value: data.totalCount, color: 'text-ink-700' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {cards.map(card => (
        <div 
          key={card.label} 
          className="bg-white rounded-xl p-5 shadow-sm border border-ink-100 hover:border-ink-200 transition-colors"
        >
          <p className="text-sm font-medium text-ink-500 mb-1">{card.label}</p>
          <p className={`text-3xl font-display font-semibold ${card.color}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function refreshSummary() {
  // This is a simple way to trigger refresh - in a real app, we might use context or events
  window.dispatchEvent(new CustomEvent('refresh-summary'));
}

