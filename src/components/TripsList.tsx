import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createTrip, listTrips } from '../api';
import type { Trip } from '../types';

export default function TripsList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listTrips()
      .then(setTrips)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  function startAdding() {
    setNewTitle('');
    setAdding(true);
  }

  function cancelAdding() {
    setAdding(false);
    setNewTitle('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || submitting) return;
    setSubmitting(true);
    try {
      const trip = await createTrip({
        title,
        description: '',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      });
      setTrips((prev) => [trip, ...prev]);
      setAdding(false);
      setNewTitle('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Trips</h2>
        {!adding && (
          <button
            onClick={startAdding}
            className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-700"
          >
            + Add Trip
          </button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 flex items-center gap-2 bg-white rounded-xl shadow-sm p-3"
        >
          <input
            data-testid="new-trip-title"
            autoFocus
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Trip title"
            className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <button
            type="submit"
            disabled={!newTitle.trim() || submitting}
            className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
          <button
            type="button"
            onClick={cancelAdding}
            className="bg-slate-100 text-slate-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-200"
          >
            Cancel
          </button>
        </form>
      )}

      {loading && <p className="text-slate-500">Loading trips…</p>}
      {error && (
        <p className="text-red-500 text-sm mb-4">Failed to load: {error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map((t) => (
          <Link
            key={t.id}
            to={`/trips/${t.id}`}
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
          >
            <div className="font-medium">{t.title}</div>
            <div className="text-sm text-slate-500 mt-1 line-clamp-2">
              {t.description || 'No description'}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {new Date(t.startDate).toLocaleDateString()} —{' '}
              {new Date(t.endDate).toLocaleDateString()}
            </div>
          </Link>
        ))}
        {!loading && trips.length === 0 && !error && (
          <div className="text-slate-500 col-span-full">
            No trips yet. Click “Add Trip” to start.
          </div>
        )}
      </div>
    </div>
  );
}
