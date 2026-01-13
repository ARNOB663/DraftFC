'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function GameInitializer() {
    const { rejoinSession } = useGameStore();

    useEffect(() => {
        rejoinSession();
    }, [rejoinSession]);

    return null;
}
