import PlayerAdmin from '@/components/admin/PlayerAdmin';

export const metadata = {
  title: 'Admin — Players | DraftFC',
};

export default function AdminPage() {
  return (
    <div className="p-4 lg:p-6">


      {/* Player Admin Component */}
      <PlayerAdmin />
    </div>
  );
}
