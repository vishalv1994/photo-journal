import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createTrip, listTrips } from '../api';
import type { Trip } from '../types';

export default function TripsList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTrips()
      .then(setTrips)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd() {
    try {
      const trip = await createTrip({
        title: 'Untitled trip',
        description: '',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      });
      setTrips((prev) => [trip, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Trips</h2>
        <button
          onClick={handleAdd}
          className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          + Add Trip
        </button>
      </div>

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
