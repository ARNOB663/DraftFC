import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

function normalizePlayer(doc: Record<string, unknown>, index: number) {
  const rating = typeof doc.rating === 'number' ? doc.rating : 75;
  const basePrice = (doc.basePrice as number) ?? rating * 1000000;
  const images = (doc.images as Record<string, string>) ?? {};
  return {
    _id: doc._id ?? `player_${index}`,
    name: doc.name ?? 'Unknown',
    position: doc.position ?? 'CM',
    rating,
    age: (doc.age as number) ?? 25,
    version: doc.version ?? 'FUT',
    images: {
      playerFace: images.playerFace ?? `https://i.pravatar.cc/256?u=${doc._id}`,
      nationFlag: images.nationFlag ?? 'https://flagcdn.com/w20/ar.png',
      clubBadge: images.clubBadge ?? `https://picsum.photos/seed/${doc._id}/50`,
      leagueLogo: images.leagueLogo ?? `https://picsum.photos/seed/league${doc._id}/50`,
    },
    overallStats: (doc.overallStats as Record<string, number>) ?? {
      paceOverall: 70 + (index % 20),
      shootingOverall: 65 + (index % 30),
      passingOverall: 65 + (index % 25),
      dribblingOverall: 65 + (index % 25),
      defendingOverall: 40 + (index % 45),
      physicalOverall: 60 + (index % 30),
    },
    basePrice,
    rarity: (doc.rarity as string) ?? 'rare',
  };
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const docs = await db.collection('players').find({}).limit(200).toArray();
    const players = docs.map((doc, i) => normalizePlayer(doc as Record<string, unknown>, i));
    return NextResponse.json(players);
  } catch (error) {
    console.error('Failed to fetch players from MongoDB:', error);
    return NextResponse.json([], { status: 500 });
  }
}
