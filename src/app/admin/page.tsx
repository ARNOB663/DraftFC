import PlayerAdmin from '@/components/admin/PlayerAdmin';

export const metadata = {
  title: 'Admin — Players',
};

export default function AdminPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel — Players</h1>
      {/* Client-side admin component handles auth & actions */}
      <PlayerAdmin />
    </main>
  );
}
