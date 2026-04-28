// Core domain types for the photo-journal app.
// These are the strongest schema signal for the roachbase agent:
// the agent reads these and infers tables, columns, and foreign keys.

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  userId: string; // FK -> User.id
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Entry {
  id: string;
  tripId: string; // FK -> Trip.id
  title: string;
  body: string;
  loggedAt: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  entryId: string; // FK -> Entry.id
  gcsPath: string; // path inside the GCS bucket
  url: string; // public or signed URL for display
  contentType: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface Caption {
  id: string;
  photoId: string; // FK -> Photo.id (1:1)
  text: string;
  source: 'user' | 'suggested';
  createdAt: string;
}
