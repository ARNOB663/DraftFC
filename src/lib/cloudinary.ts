import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadBufferAsImage(buffer: Buffer, filename = 'upload') {
  // Upload buffer by converting to base64 data URI
  const base64 = buffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64}`;

  const res = await cloudinary.uploader.upload(dataUri, {
    folder: 'players',
    public_id: filename,
    overwrite: true,
  });

  return res.secure_url;
}

export async function uploadDataUri(dataUri: string) {
  const res = await cloudinary.uploader.upload(dataUri, {
    folder: 'players',
  });
  return res.secure_url;
}
