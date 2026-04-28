import { useRef, useState } from 'react';
import { attachPhoto, requestPhotoUploadUrl } from '../api';

interface Props {
  entryId: string;
  onUploaded?: () => void;
}

export default function PhotoUploader({ entryId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      // 1. Ask the backend for a signed upload URL.
      setStatus('Requesting upload URL…');
      const { url, gcsPath } = await requestPhotoUploadUrl(entryId, file.type);

      // 2. PUT the bytes directly to GCS.
      setStatus('Uploading to storage…');
      const putRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error(`PUT to signed URL failed: ${putRes.status}`);
      }

      // 3. Tell the backend the upload finished so it can persist a Photo row.
      setStatus('Finalizing…');
      await attachPhoto(entryId, gcsPath);

      setStatus('Uploaded.');
      onUploaded?.();
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('');
    }
  }

  return (
    <div className="text-sm">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <span className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md px-3 py-1.5 font-medium">
          + Add photo
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </label>
      {status && <span className="ml-3 text-slate-500">{status}</span>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
