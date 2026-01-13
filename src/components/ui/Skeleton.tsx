'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-dark-800/50',
        className
      )}
    />
  );
}

// Player card skeleton
export function PlayerCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-44 h-56',
    md: 'w-80 h-[420px]',
    lg: 'w-[440px] h-[580px]',
  };

  return (
    <div className={cn('rounded-2xl bg-dark-800/30 overflow-hidden', sizeClasses[size])}>
      <div className="p-4 h-full flex flex-col">
        {/* Top badges */}
        <div className="flex justify-between">
          <Skeleton className="w-12 h-6 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="w-8 h-5" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        {/* Name area */}
        <div className="mt-4">
          <Skeleton className="w-24 h-6 mb-1" />
          <Skeleton className="w-32 h-8" />
        </div>

        {/* Spacer for player image area */}
        <div className="flex-1" />

        {/* Rating */}
        <div className="mt-auto">
          <Skeleton className="w-20 h-16 mb-3" />
          
          {/* Stats bar */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="flex-1 h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Auction stage skeleton
export function AuctionStageSkeleton() {
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-40 rounded-2xl" />
          <div className="flex flex-col items-center justify-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="w-32 h-6" />
          </div>
          <Skeleton className="h-40 rounded-2xl" />
        </div>

        {/* Main area */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl hidden md:block" />
          <div className="flex flex-col items-center">
            <Skeleton className="w-32 h-10 mb-6" />
            <PlayerCardSkeleton size="lg" />
            <Skeleton className="w-full max-w-md h-40 mt-6 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl hidden lg:block" />
        </div>
      </div>
    </div>
  );
}

// Lobby skeleton
export function LobbySkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Skeleton className="w-48 h-10 mx-auto mb-2" />
          <Skeleton className="w-64 h-5 mx-auto" />
        </div>

        <Skeleton className="h-24 rounded-2xl mb-6" />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>

        <Skeleton className="h-32 rounded-2xl mb-6" />

        <div className="flex gap-4">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <Skeleton className="flex-1 h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
