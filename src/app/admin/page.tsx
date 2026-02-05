import PlayerAdmin from '@/components/admin/PlayerAdmin';

export const metadata = {
  title: 'Admin — Players | DraftFC',
};

export default function AdminPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Player Management
            </h1>
            <p className="text-white/60 max-w-xl">
              Manage your football players database. Add, edit, or remove players and their stats.
            </p>
          </div>
        </div>
      </div>

      {/* Player Admin Component */}
      <PlayerAdmin />
    </div>
  );
}
