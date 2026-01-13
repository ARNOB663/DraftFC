import type { Metadata } from 'next';
import { GameInitializer } from '@/components/GameInitializer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Football Auction - Draft Your Dream Team',
  description: 'A competitive football player auction game. Draft players, build your squad, and compete to build the best team!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-grid-pattern">
        <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
        <GameInitializer />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
