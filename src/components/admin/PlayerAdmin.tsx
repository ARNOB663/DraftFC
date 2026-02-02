'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToaster } from '@/components/ui/Toaster';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Player {
  _id: string;
  name: string;
  rating: number;
  position: string;
  age?: number;
  version?: string;
  images?: Record<string, string>;
  rarity?: string;
}

export default function PlayerAdmin() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createName, setCreateName] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { notify } = useToaster();

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) fetchPlayers();
  }, [token]);

  async function fetchPlayers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/players?page=1&limit=200', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setPlayers(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching players');
      notify(err.message || 'Error fetching players', 'error');
    } finally {
      setLoading(false);
    }
  }

  function saveTokenAndFetch(t: string) {
    localStorage.setItem('admin_token', t);
    setToken(t);
  }

  function requestDelete(id: string) {
    setDeleteId(id);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      const res = await fetch(`/api/admin/players/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to delete');
      setPlayers(players.filter(p => p._id !== id));
      notify('Player deleted', 'success');
    } catch (err: any) {
      notify(err.message || 'Delete failed', 'error');
    }
  }

  async function handleCreate() {
    if (!createName.trim()) return;
    const name = createName.trim();
    setCreateName('');
    setShowCreateForm(false);
    try {
      const res = await fetch('/api/admin/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, rating: 60, position: 'CM' }),
      });
      if (!res.ok) throw new Error('Create failed');
      const json = await res.json();
      setPlayers(prev => [json.data, ...prev]);
      notify('Player created', 'success');
    } catch (err: any) {
      notify(err.message || 'Create failed', 'error');
    }
  }

  if (!token) {
    return (
      <div className="max-w-xl">
        <p className="mb-2">Enter admin token to continue:</p>
        <input className="border p-2 mr-2" placeholder="ADMIN_TOKEN" onChange={e => setError(null)} id="admin-token" />
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            const el = document.getElementById('admin-token') as HTMLInputElement | null;
            if (!el) return;
            saveTokenAndFetch(el.value.trim());
          }}
        >
          Save & Load
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div>


      <div className="mb-4 flex gap-2 items-center flex-wrap">
        {showCreateForm ? (
          <>
            <input
              className="border border-white/20 bg-white/10 px-3 py-2 rounded text-white placeholder:text-white/50"
              placeholder="Player name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={handleCreate}>Create</button>
            <button className="px-3 py-2 bg-gray-600 text-white rounded" onClick={() => { setShowCreateForm(false); setCreateName(''); }}>Cancel</button>
          </>
        ) : (
          <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => setShowCreateForm(true)}>Create player</button>
        )}
        <button className="px-3 py-2 bg-gray-600 text-white rounded" onClick={fetchPlayers}>Refresh</button>
        <button
          className="px-3 py-2 bg-red-600 text-white rounded"
          onClick={() => {
            localStorage.removeItem('admin_token');
            setToken(null);
          }}
        >
          Log out
        </button>
      </div>

      {loading ? (
        <p>Loading players...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left">
                <th className="p-2">Face</th>
                <th className="p-2">Name</th>
                <th className="p-2">Rating</th>
                <th className="p-2">Position</th>
                <th className="p-2">Age</th>
                <th className="p-2">Rarity</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player._id} className="border-t">
                  <td className="p-2">
                    {player.images?.playerFace ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={player.images.playerFace} alt="face" className="w-12 h-12 rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">—</div>
                    )}
                  </td>
                  <td className="p-2">{player.name}</td>
                  <td className="p-2">{player.rating}</td>
                  <td className="p-2">{player.position}</td>
                  <td className="p-2">{player.age ?? '-'}</td>
                  <td className="p-2">{player.rarity ?? '-'}</td>
                  <td className="p-2 flex gap-2">
                    <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => router.push(`/admin/players/${player._id}/edit`)}>Edit</button>
                    <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => requestDelete(player._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete player"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
