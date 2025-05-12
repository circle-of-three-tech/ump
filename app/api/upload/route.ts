import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { uploadFileToStorage, generateUniqueFileName } from '@/lib/storage';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Check Content-Type header from the request directly
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return new NextResponse('Content-Type must be multipart/form-data', { status: 400 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      return new NextResponse('Invalid file type', { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return new NextResponse('File too large (max 10MB)', { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueFilename = generateUniqueFileName(file.name);
    
    // Upload to Firebase Storage with user-specific folder
    console.log('Uploading file:', {
      filename: uniqueFilename,
      type: file.type,
      size: file.size
    });
    
    const url = await uploadFileToStorage(
      buffer,
      uniqueFilename,
      `uploads/${session.user.id}`
    );

    // console.log('File uploaded successfully:', url);

    return NextResponse.json({ url }, {
      headers: { 'Content-Type': 'application/json' }
    });
    // return url;
  } catch (error: any) {
    console.error('Upload error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}