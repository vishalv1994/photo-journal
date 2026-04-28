import { useState } from 'react';
import { suggestCaption } from '../api';

interface Props {
  photoUrl: string;
}

export default function CaptionSuggest({ photoUrl }: Props) {
  const [caption, setCaption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const { caption: text } = await suggestCaption(photoUrl);
      setCaption(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  if (caption) {
    return <p className="text-xs text-slate-600 italic">“{caption}”</p>;
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-xs text-slate-500 hover:text-slate-900 underline disabled:opacity-50"
      >
        {loading ? 'Thinking…' : 'Suggest caption'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
