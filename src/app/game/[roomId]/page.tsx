'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { Lobby } from '@/components/game/Lobby';
import { AuctionStage } from '@/components/game/AuctionStage';
import { GameResult } from '@/components/game/GameResult';
import { Notification } from '@/components/ui/Notification';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { room, isConnected, connect, notification, setNotification } = useGameStore();

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  useEffect(() => {
    if (!room && isConnected) {
      // No room, redirect to home
      router.push('/');
    }
  }, [room, isConnected, router]);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Game stages */}
      {room.status === 'waiting' || room.status === 'ready' ? (
        <Lobby />
      ) : room.status === 'auction' ? (
        <AuctionStage />
      ) : room.status === 'finished' ? (
        <GameResult />
      ) : null}
    </>
  );
}
