// Named API endpoints + thin fetch wrappers.
// Endpoint constants are kept top-level and named so the roachbase
// agent can statically enumerate the backend's expected surface area.

import type { Caption, Entry, Photo, Trip, User } from './types';

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const API_ME = `${API_BASE}/api/me`;
export const API_TRIPS = `${API_BASE}/api/trips`;
export const API_TRIP_DETAIL = (id: string) => `${API_BASE}/api/trips/${id}`;
export const API_ENTRIES = `${API_BASE}/api/entries`;
export const API_PHOTOS_UPLOAD_URL = `${API_BASE}/api/photos/upload-url`;
export const API_FUNCTIONS_SUGGEST_CAPTION = `${API_BASE}/api/functions/suggestCaption`;

// --- Auth helper ---------------------------------------------------------

const TOKEN_KEY = 'photo-journal:idToken';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${url} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

// --- Endpoints -----------------------------------------------------------

export function getMe(): Promise<User> {
  return jsonFetch<User>(API_ME);
}

export function listTrips(): Promise<Trip[]> {
  return jsonFetch<Trip[]>(API_TRIPS);
}

export function getTrip(id: string): Promise<{
  trip: Trip;
  entries: Array<Entry & { photos: Array<Photo & { caption: Caption | null }> }>;
}> {
  return jsonFetch(API_TRIP_DETAIL(id));
}

export function createTrip(data: {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}): Promise<Trip> {
  return jsonFetch<Trip>(API_TRIPS, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function createEntry(
  tripId: string,
  data: { title: string; body: string; loggedAt: string },
): Promise<Entry> {
  return jsonFetch<Entry>(API_ENTRIES, {
    method: 'POST',
    body: JSON.stringify({ tripId, ...data }),
  });
}

export function requestPhotoUploadUrl(
  entryId: string,
  contentType: string,
): Promise<{ url: string; gcsPath: string }> {
  return jsonFetch<{ url: string; gcsPath: string }>(API_PHOTOS_UPLOAD_URL, {
    method: 'POST',
    body: JSON.stringify({ entryId, contentType }),
  });
}

export function attachPhoto(entryId: string, gcsPath: string): Promise<Photo> {
  return jsonFetch<Photo>(`${API_BASE}/api/photos`, {
    method: 'POST',
    body: JSON.stringify({ entryId, gcsPath }),
  });
}

export function suggestCaption(photoUrl: string): Promise<{ caption: string }> {
  return jsonFetch<{ caption: string }>(API_FUNCTIONS_SUGGEST_CAPTION, {
    method: 'POST',
    body: JSON.stringify({ photoUrl }),
  });
}

// Exposed so AuthGuard can stash the Firebase ID token.
export function setIdToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
