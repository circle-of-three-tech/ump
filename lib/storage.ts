import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase';

if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  throw new Error('Firebase Storage bucket is not configured. Please check your environment variables.');
}

const storage = getStorage(app);

export async function uploadFileToStorage(
  file: Buffer | Blob,
  fileName: string,
  folder: string = '',
  isPrivate: boolean = false
): Promise<string> {
  const fullPath = folder ? `${folder}/${fileName}` : fileName;
  const storageRef = ref(storage, fullPath);
  
  try {
    // Set metadata including privacy settings
    const metadata = {
      contentType: file instanceof Blob ? file.type : 'application/octet-stream',
      cacheControl: isPrivate ? 'private, max-age=3600' : 'public, max-age=31536000',
      customMetadata: {
        isPublic: (!isPrivate).toString(),
        uploadedAt: new Date().toISOString()
      }
    };

    // Upload the file
    console.log('Starting file upload to Firebase Storage:', {
      path: fullPath,
      contentType: metadata.contentType,
      cacheControl: metadata.cacheControl,
      isPrivate
    });
    
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    if (!snapshot) {
      throw new Error('Upload failed - no snapshot returned');
    }
    
    console.log('File uploaded successfully, getting download URL...');
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    if (!downloadUrl) {
      throw new Error('Failed to get download URL');
    }
    
    console.log('Download URL obtained:', downloadUrl);
    
    return downloadUrl;
  } catch (error: any) {
    console.error('Error uploading file:', {
      code: error.code,
      message: error.message,
      status: error.status_,
      path: fullPath,
      isPrivate
    });
    
    if (error.code === 'storage/unknown' && error.status_ === 404) {
      throw new Error('Storage bucket not found. Please verify your Firebase Storage configuration.');
    } else if (error.code === 'storage/unauthorized') {
      throw new Error('Unauthorized to access Firebase Storage. Check your security rules and authentication.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled. Please try again.');
    } else if (error.code === 'storage/invalid-argument') {
      throw new Error('Invalid file or storage path. Please check the file and try again.');
    } else if (error.code === 'storage/quota-exceeded') {
      throw new Error('Storage quota exceeded. Please contact support.');
    }
    
    throw error;
  }
}

// Helper to generate a unique file name
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
}