import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTrip } from '../api';
import type { Caption, Entry, Photo, Trip } from '../types';
import PhotoUploader from './PhotoUploader';
import CaptionSuggest from './CaptionSuggest';

type LoadedEntry = Entry & {
  photos: Array<Photo & { caption: Caption | null }>;
};

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [entries, setEntries] = useState<LoadedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getTrip(id)
      .then((data) => {
        setTrip(data.trip);
        setEntries(data.entries);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← All trips
      </Link>

      {loading && <p className="text-slate-500 mt-4">Loading…</p>}
      {error && (
        <p className="text-red-500 text-sm mt-4">Failed to load: {error}</p>
      )}

      {trip && (
        <>
          <h2 className="text-3xl font-semibold mt-3">{trip.title}</h2>
          <p className="text-slate-600 mt-1">{trip.description}</p>

          <div className="mt-8 space-y-6">
            {entries.map((entry) => (
              <section
                key={entry.id}
                className="bg-white rounded-xl shadow-sm p-5"
              >
                <h3 className="text-lg font-medium">{entry.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{entry.body}</p>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {entry.photos.map((p) => (
                    <div key={p.id} className="space-y-2">
                      <img
                        src={p.url}
                        alt={p.caption?.text ?? ''}
                        className="rounded-lg w-full h-32 object-cover bg-slate-100"
                      />
                      {p.caption ? (
                        <p className="text-xs text-slate-600">
                          {p.caption.text}
                        </p>
                      ) : (
                        <CaptionSuggest photoUrl={p.url} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <PhotoUploader entryId={entry.id} />
                </div>
              </section>
            ))}

            {entries.length === 0 && !loading && (
              <p className="text-slate-500">No entries in this trip yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
