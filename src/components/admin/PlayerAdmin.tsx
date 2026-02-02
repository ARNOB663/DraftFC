'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToaster } from '@/components/ui/Toaster';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ALL_POSITIONS } from '@/lib/utils';

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

const SORT_OPTIONS = [
  { value: 'rating-desc', label: 'Rating (highest)' },
  { value: 'rating-asc', label: 'Rating (lowest)' },
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
  { value: 'age-desc', label: 'Age (oldest)' },
  { value: 'age-asc', label: 'Age (youngest)' },
  { value: 'position', label: 'Position' },
] as const;

const RARITY_OPTIONS = ['All', 'legendary', 'epic', 'rare', 'common'] as const;

function DarkSelect({
  value,
  onChange,
  options,
  label,
  getLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[] | readonly { value: string; label: string }[];
  label: string;
  getLabel?: (v: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: getLabel ? getLabel(o) : o } : o));
  const selectedLabel = items.find((i) => i.value === value)?.label ?? value;

  return (
    <div className="relative">
      <label className="block text-xs text-white/60 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center justify-between gap-2 w-full min-w-[140px] px-3 py-2 rounded-lg border border-white/20 bg-dark-800 text-white focus:outline-none focus:border-neon-cyan/50"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 py-1 w-full min-w-[140px] rounded-lg border border-white/20 bg-dark-800 shadow-xl max-h-56 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(item.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-white/10 ${
                value === item.value ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
  const [search, setSearch] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('All');
  const [filterRarity, setFilterRarity] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('rating-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { notify } = useToaster();

  useEffect(() => {
    setPage(1);
  }, [search, filterPosition, filterRarity, sortBy]);

  const filteredPlayers = useMemo(() => {
    let result = [...players];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.position.toLowerCase().includes(q) ||
          (p.rarity && p.rarity.toLowerCase().includes(q))
      );
    }

    if (filterPosition !== 'All') {
      result = result.filter((p) => p.position === filterPosition);
    }

    if (filterRarity !== 'All') {
      result = result.filter((p) => (p.rarity ?? '').toLowerCase() === filterRarity.toLowerCase());
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'age-desc':
          return (b.age ?? 0) - (a.age ?? 0);
        case 'age-asc':
          return (a.age ?? 0) - (b.age ?? 0);
        case 'position':
          return a.position.localeCompare(b.position) || a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [players, search, filterPosition, filterRarity, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / pageSize));
  const paginatedPlayers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPlayers.slice(start, start + pageSize);
  }, [filteredPlayers, page, pageSize]);

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
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search by name, position, rarity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-neon-cyan/50"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            showFilters ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan' : 'border-white/20 bg-white/10 hover:bg-white/20'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

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

      {showFilters && (
        <div className="mb-4 p-4 rounded-xl border border-white/20 bg-white/5 flex flex-wrap gap-4">
          <DarkSelect
            label="Position"
            value={filterPosition}
            onChange={setFilterPosition}
            options={['All', ...ALL_POSITIONS]}
            getLabel={(v) => (v === 'All' ? 'All positions' : v)}
          />
          <DarkSelect
            label="Rarity"
            value={filterRarity}
            onChange={setFilterRarity}
            options={[...RARITY_OPTIONS]}
            getLabel={(v) => (v === 'All' ? 'All rarities' : v)}
          />
          <DarkSelect
            label="Sort by"
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
          />
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setFilterPosition('All');
                setFilterRarity('All');
                setSortBy('rating-desc');
              }}
              className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white/80 hover:bg-white/20 text-sm"
            >
              Reset filters
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading players...</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <p className="text-sm text-white/60">
              Showing {filteredPlayers.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filteredPlayers.length)} of {filteredPlayers.length}
              {players.length !== filteredPlayers.length && ` (filtered from ${players.length})`}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <DarkSelect
                  label="Per page"
                  value={String(pageSize)}
                  onChange={(v) => {
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                  options={['5', '10', '20', '50']}
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded border border-white/20 bg-dark-800 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm text-white/80">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded border border-white/20 bg-dark-800 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
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
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/60">
                    {players.length === 0 ? 'No players yet. Create one above.' : 'No players match your search or filters.'}
                  </td>
                </tr>
              ) : (
              paginatedPlayers.map(player => (
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
              )))}
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
