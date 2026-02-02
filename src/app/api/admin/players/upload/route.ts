import { NextResponse } from 'next/server';
import { uploadBufferAsImage } from '@/lib/cloudinary';

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

export async function POST(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const url = await uploadBufferAsImage(buffer, file.name.replace(/\.[^/.]+$/, ''));

  return NextResponse.json({ url });
}
