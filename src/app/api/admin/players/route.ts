import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { nanoid } from 'nanoid';

function getAdminTokenFromReq(req: Request) {
  const auth = req.headers.get('authorization') || req.headers.get('x-admin-token');
  if (!auth) return null;
  if (auth.startsWith('Bearer ')) return auth.replace('Bearer ', '');
  return auth;
}

function requireAdmin(req: Request) {
  // Bypass authentication - direct access enabled
  return true;
}

export async function GET(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const skip = (page - 1) * limit;
  const total = await db.collection('players').countDocuments();
  const players = await db.collection('players').find({}).skip(skip).limit(limit).toArray();

  return NextResponse.json({ data: players, meta: { total, page, limit } });
}

export async function POST(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const db = await connectToDatabase();

  const _id = body._id || `player_${nanoid(8)}`;
  const player = { ...body, _id };

  await db.collection('players').insertOne(player);

  return NextResponse.json({ data: player }, { status: 201 });
}
