import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

function parseId(id: string): string | ObjectId {
  if (/^[a-fA-F0-9]{24}$/.test(id)) return new ObjectId(id);
  return id;
}

function getAdminTokenFromReq(req: Request) {
  const auth = req.headers.get('authorization') || req.headers.get('x-admin-token');
  if (!auth) return null;
  if (auth.startsWith('Bearer ')) return auth.replace('Bearer ', '');
  return auth;
}

function requireAdmin(req: Request) {
  const token = getAdminTokenFromReq(req);
  if (!process.env.ADMIN_TOKEN) {
    throw new Error('ADMIN_TOKEN not set');
  }
  if (token !== process.env.ADMIN_TOKEN) {
    return false;
  }
  return true;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await connectToDatabase();
  const { id } = await params;
  const player = await db.collection('players').findOne({ _id: parseId(id) });

  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: player });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { _id, ...updates } = body;
  const db = await connectToDatabase();
  const filter = { _id: parseId(id) };
  const updateRes = await db.collection('players').updateOne(filter, { $set: updates });
  if (updateRes.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const doc = await db.collection('players').findOne(filter);
  const data = doc ? { ...doc, _id: String(doc._id) } : null;
  return NextResponse.json({ data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = await connectToDatabase();
  const res = await db.collection('players').deleteOne({ _id: parseId(id) });

  if (res.deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
