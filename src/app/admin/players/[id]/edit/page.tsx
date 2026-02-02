'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlayerEditor from '@/components/admin/PlayerEditor';
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

export default function AdminPlayerEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { notify } = useToaster();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) {
      router.replace('/admin');
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (!token || !id) return;
    async function load() {
      try {
        const res = await fetch(`/api/admin/players/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          notify('Player not found', 'error');
          router.replace('/admin');
          return;
        }
        const json = await res.json();
        setPlayer(json.data);
      } catch (err: any) {
        notify(err.message || 'Failed to load player', 'error');
        router.replace('/admin');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, id, notify, router]);

  function handleSaved() {
    router.push('/admin');
  }

  function handleCancel() {
    router.push('/admin');
  }

  if (loading || !token) {
    return (
      <main className="p-6">
        <p className="text-white/80">Loading...</p>
      </main>
    );
  }

  if (!player) {
    return null;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel — Players</h1>
      <div className="mb-4">
        <button
          onClick={() => router.push('/admin')}
          className="text-sm text-white/70 hover:text-white"
        >
          ← Back to players
        </button>
      </div>
      <div className="max-w-2xl border border-white/20 p-6 rounded-xl bg-white/5 backdrop-blur text-white">
        <h2 className="text-xl font-bold mb-4">Edit: {player.name}</h2>
        <PlayerEditor
          player={player}
          token={token}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      </div>
    </main>
  );
}
