'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  RefreshCw, Plus, Grid3X3, List, Trash2, Edit3, Users,
  Star, Trophy, TrendingUp, X
} from 'lucide-react';
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

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

// Skeleton Loading Card
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-white/10" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4 mx-auto" />
        <div className="h-6 bg-white/10 rounded w-1/2 mx-auto" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="flex-1 h-9 bg-white/10 rounded-lg" />
        <div className="flex-1 h-9 bg-white/10 rounded-lg" />
      </div>
    </div>
  );
}

// Stats Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  gradient
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${gradient} p-2.5`}>
      <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="p-1 rounded-lg bg-white/10">
            <Icon className="w-3 h-3 text-white" />
          </div>
          <span className="text-white/60 text-[10px] uppercase font-bold tracking-wider">{label}</span>
        </div>
        <p className="text-lg font-black text-white">{value}</p>
      </div>
    </div>
  );
}

// Enhanced Select Component
function EnhancedSelect({
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
      <label className="block text-[10px] text-white/50 mb-1 font-bold uppercase tracking-wider">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex items-center justify-between gap-2 w-full min-w-[140px] px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-500/50 hover:bg-white/10 transition-all"
      >
        <span className="text-xs">{selectedLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-[100] mt-1 py-1 w-full min-w-[140px] rounded-lg border border-white/10 bg-[#0f172a] shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
          {items.map((item) => (
            <button
              key={item.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur from firing
                onChange(item.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-xs transition-colors ${value === item.value
                ? 'bg-cyan-500/20 text-cyan-400 font-medium'
                : 'text-white/80 hover:bg-white/10'
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

// Player Card Component - FIFA Ultimate Team Style
function PlayerCard({
  player,
  onEdit,
  onDelete
}: {
  player: Player;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const rarityStyles: Record<string, {
    cardBg: string;
    border: string;
    accent: string;
    shine: string;
    text: string;
  }> = {
    legendary: {
      cardBg: 'bg-gradient-to-b from-yellow-900/40 via-amber-800/30 to-yellow-950/50',
      border: 'border-yellow-500/40 hover:border-yellow-400/60',
      accent: 'from-yellow-400 to-orange-500',
      shine: 'from-yellow-400/0 via-yellow-300/30 to-yellow-400/0',
      text: 'text-yellow-400'
    },
    epic: {
      cardBg: 'bg-gradient-to-b from-purple-900/40 via-fuchsia-800/30 to-purple-950/50',
      border: 'border-purple-500/40 hover:border-purple-400/60',
      accent: 'from-purple-400 to-pink-500',
      shine: 'from-purple-400/0 via-purple-300/30 to-purple-400/0',
      text: 'text-purple-400'
    },
    rare: {
      cardBg: 'bg-gradient-to-b from-blue-900/40 via-cyan-800/30 to-blue-950/50',
      border: 'border-cyan-500/40 hover:border-cyan-400/60',
      accent: 'from-cyan-400 to-blue-500',
      shine: 'from-cyan-400/0 via-cyan-300/30 to-cyan-400/0',
      text: 'text-cyan-400'
    },
    common: {
      cardBg: 'bg-gradient-to-b from-slate-800/40 via-gray-700/30 to-slate-900/50',
      border: 'border-gray-500/40 hover:border-gray-400/60',
      accent: 'from-gray-400 to-gray-500',
      shine: 'from-gray-400/0 via-gray-300/20 to-gray-400/0',
      text: 'text-gray-400'
    },
  };

  const rarity = (player.rarity ?? 'common').toLowerCase();
  const style = rarityStyles[rarity] || rarityStyles.common;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border-2 ${style.border} ${style.cardBg} backdrop-blur-xl transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/50`}
    >
      {/* Animated Shine Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${style.shine} translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out`} />

      {/* Top Section - Rating & Position */}
      <div className="relative p-3 pb-0">
        <div className="flex justify-between items-start">
          {/* Rating Display */}
          <div className="flex flex-col items-center">
            <div className={`text-2xl font-black bg-gradient-to-b ${style.accent} bg-clip-text text-transparent drop-shadow-lg`}>
              {player.rating}
            </div>
            <div className={`text-xs font-bold ${style.text} tracking-wider`}>
              {player.position}
            </div>
          </div>

          {/* Nation & Club Flags */}
          <div className="flex flex-col gap-1 items-center">
            {player.images?.nationFlag && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.images.nationFlag} alt="nation" className="w-5 h-4 object-cover rounded shadow-md" />
            )}
            {player.images?.clubLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.images.clubLogo} alt="club" className="w-5 h-5 object-contain drop-shadow-lg" />
            )}
          </div>
        </div>
      </div>

      {/* Player Image Section */}
      <div className="relative flex justify-center -mt-1 mb-1">
        <div className="relative">
          {/* Glow Behind Image */}
          <div className={`absolute inset-0 bg-gradient-to-t ${style.accent} rounded-full blur-xl opacity-30 scale-75`} />

          {player.images?.playerFace ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.images.playerFace}
              alt={player.name}
              className="relative w-32 h-32 object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${style.accent} flex items-center justify-center`}>
              <span className="text-4xl font-black text-white/90 drop-shadow-lg">
                {player.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Player Name */}
      <div className="px-3 pb-1.5">
        <div className={`w-full h-0.5 bg-gradient-to-r ${style.accent} mb-1.5 opacity-60`} />
        <h3
          className="font-black text-white text-center text-sm uppercase tracking-wide truncate"
          title={player.name}
        >
          {player.name}
        </h3>
      </div>

      {/* Meta Info */}
      <div className="px-3 pb-3 flex flex-col gap-1.5 items-center">
        {/* Version - Full Width */}
        {player.version && (
          <div className="w-full text-center px-1">
            <span className="text-[11px] font-medium text-white/80 block truncate tracking-wide" title={player.version}>
              {player.version}
            </span>
          </div>
        )}

        {/* Rarity & Age Row */}
        <div className="flex items-center justify-center gap-2 w-full">
          {player.rarity && (
            <span className={`px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${style.text}`}>
              {player.rarity}
            </span>
          )}
          {player.age && (
            <span className="text-[10px] text-white/40 font-medium tracking-wide">
              {player.age} yo
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-2 pt-0 flex gap-1.5">
        <button
          onClick={onEdit}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-bold rounded-lg bg-gradient-to-r ${style.accent} text-white shadow-lg hover:opacity-90 transition-all hover:shadow-xl transform hover:-translate-y-0.5`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-bold rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-400/50 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function PlayerAdmin() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createName, setCreateName] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('All');
  const [filterRarity, setFilterRarity] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('rating-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

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

  // Stats calculations
  const stats = useMemo(() => {
    const legendaryCount = players.filter(p => (p.rarity ?? '').toLowerCase() === 'legendary').length;
    const avgRating = players.length > 0
      ? Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length)
      : 0;
    return { total: players.length, legendary: legendaryCount, avgRating };
  }, [players]);

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / pageSize));
  const paginatedPlayers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPlayers.slice(start, start + pageSize);
  }, [filteredPlayers, page, pageSize]);

  useEffect(() => {
    const defaultToken = 'admin-bypass';
    localStorage.setItem('admin_token', defaultToken);
    setToken(defaultToken);
  }, []);

  useEffect(() => {
    if (token) fetchPlayers();
  }, [token]);

  async function fetchPlayers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/players?page=1&limit=10000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setPlayers(json.data || []);
    } catch (err: any) {
      notify(err.message || 'Error fetching players', 'error');
    } finally {
      setLoading(false);
    }
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
      setPlayers(players => players.filter(p => p._id !== id));
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

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Players"
          value={stats.total.toLocaleString()}
          gradient="from-cyan-500/10 to-blue-500/10"
        />
        <StatCard
          icon={Trophy}
          label="Legendary"
          value={stats.legendary}
          gradient="from-yellow-500/10 to-orange-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Rating"
          value={stats.avgRating}
          gradient="from-purple-500/10 to-pink-500/10"
        />
        <StatCard
          icon={Star}
          label="Filtered"
          value={filteredPlayers.length.toLocaleString()}
          gradient="from-green-500/10 to-emerald-500/10"
        />
      </div>

      {/* Toolbar */}
      <div className="relative z-20 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-2.5">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-all ${showFilters
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
              : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/80'
              }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
            {showCreateForm ? (
              <>
                <input
                  className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 min-w-[150px]"
                  placeholder="Player name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <button
                  className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:opacity-90 transition-opacity"
                  onClick={handleCreate}
                >
                  Create
                </button>
                <button
                  className="px-3 py-2 text-sm rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                  onClick={() => { setShowCreateForm(false); setCreateName(''); }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Player</span>
              </button>
            )}
            <button
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
              onClick={fetchPlayers}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-3">
            <EnhancedSelect
              label="Position"
              value={filterPosition}
              onChange={setFilterPosition}
              options={['All', ...ALL_POSITIONS]}
              getLabel={(v) => (v === 'All' ? 'All positions' : v)}
            />
            <EnhancedSelect
              label="Rarity"
              value={filterRarity}
              onChange={setFilterRarity}
              options={[...RARITY_OPTIONS]}
              getLabel={(v) => (v === 'All' ? 'All rarities' : v.charAt(0).toUpperCase() + v.slice(1))}
            />
            <EnhancedSelect
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
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white text-[10px] uppercase font-bold tracking-wider transition-colors"
              >
                Reset filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Info & Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] uppercase font-bold tracking-wider text-white/40">
          Showing <span className="text-white">{filteredPlayers.length === 0 ? 0 : (page - 1) * pageSize + 1}</span>
          –<span className="text-white">{Math.min(page * pageSize, filteredPlayers.length)}</span> of{' '}
          <span className="text-white">{filteredPlayers.length.toLocaleString()}</span>
          {players.length !== filteredPlayers.length && (
            <span className="text-white/30 lowercase"> (from {players.length.toLocaleString()})</span>
          )}
        </p>

        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-[11px] font-bold focus:outline-none focus:border-cyan-500/50"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size} className="bg-[#1a1a2e]">{size} / page</option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1.5 text-[11px] font-bold text-white/70 min-w-[80px] text-center uppercase tracking-wider">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Player Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No players found</h3>
          <p className="text-white/50">
            {players.length === 0 ? 'Get started by adding your first player.' : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {paginatedPlayers.map(player => (
            <PlayerCard
              key={player._id}
              player={player}
              onEdit={() => router.push(`/admin/players/${player._id}/edit`)}
              onDelete={() => requestDelete(player._id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete player"
        message="This action cannot be undone. The player will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
