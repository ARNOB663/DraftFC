'use client';

import React, { useState } from 'react';
import { useToaster } from '@/components/ui/Toaster';

interface Player {
  _id: string;
  name: string;
  rating: number;
  position: string;
  age?: number;
  images?: Record<string, string>;
  rarity?: string;
}

export default function PlayerEditor({ player, token, onSaved, onCancel }: { player: Player; token: string; onSaved: (p: Player) => void; onCancel: () => void; }) {
  const { notify } = useToaster();
  const [form, setForm] = useState<Player>(player);
  const [saving, setSaving] = useState(false);

  function update(field: keyof Player, value: any) {
    setForm((prev) => ({ ...prev, [field]: value } as Player));
  }

  async function uploadImage(file: File) {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/players/upload', { method: 'POST', body: fd, headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      setForm((prev) => ({ ...prev, images: { ...(prev.images || {}), playerFace: json.url } }));
      notify('Image uploaded', 'success');
    } catch (err: any) {
      notify(err.message || 'Upload failed', 'error');
      throw err;
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/players/${form._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Save failed (${res.status})`);
      onSaved(json.data);
      notify('Player saved', 'success');
    } catch (err: any) {
      notify(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm">Name</label>
          <input value={form.name} onChange={e => update('name', e.target.value)} className="border border-white/20 p-2 w-full rounded bg-white/10 text-white placeholder:text-white/50" />
        </div>
        <div>
          <label className="block text-sm">Position</label>
          <input value={form.position} onChange={e => update('position', e.target.value)} className="border border-white/20 p-2 w-full rounded bg-white/10 text-white placeholder:text-white/50" />
        </div>
        <div>
          <label className="block text-sm">Rating</label>
          <input type="number" value={form.rating} onChange={e => update('rating', Number(e.target.value))} className="border border-white/20 p-2 w-full rounded bg-white/10 text-white placeholder:text-white/50" />
        </div>
        <div>
          <label className="block text-sm">Age</label>
          <input type="number" value={form.age ?? ''} onChange={e => update('age', Number(e.target.value) || undefined)} className="border border-white/20 p-2 w-full rounded bg-white/10 text-white placeholder:text-white/50" />
        </div>
        <div>
          <label className="block text-sm">Rarity</label>
          <input value={form.rarity ?? ''} onChange={e => update('rarity', e.target.value)} className="border border-white/20 p-2 w-full rounded bg-white/10 text-white placeholder:text-white/50" />
        </div>
        <div>
          <label className="block text-sm">Face</label>
          <div className="flex gap-2 items-center">
            {form.images?.playerFace ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.images.playerFace} alt="face" className="w-16 h-16 rounded" />
            ) : (
              <div className="w-16 h-16 bg-gray-200" />
            )}
            <input type="file" accept="image/*" onChange={e => {
              const f = e.target.files?.[0];
              if (f) uploadImage(f).catch(() => { });
            }} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded hover:bg-white/20" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
