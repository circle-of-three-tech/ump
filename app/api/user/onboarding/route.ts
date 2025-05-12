import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { uploadFileToStorage, generateUniqueFileName } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const bio = formData.get('bio') as string;
    const interests = JSON.parse(formData.get('interests') as string);
    const studentIdImage = formData.get('studentIdImage') as File | null;
    const profileImage = formData.get('profileImage') as File | null;

    let studentIdUrl = null;
    let profileImageUrl = null;

    // Upload student ID if provided
    if (studentIdImage) {
      // Convert File to Buffer
      const bytes = await studentIdImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const uniqueFilename = generateUniqueFileName(studentIdImage.name);
      
      // Upload to Firebase Storage with private access
      studentIdUrl = await uploadFileToStorage(
        buffer,
        uniqueFilename,
        `student-ids/${session.user.id}`,
        true // isPrivate
      );
    }

    // Upload profile image if provided
    if (profileImage) {
      // Convert File to Buffer
      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const uniqueFilename = generateUniqueFileName(profileImage.name);
      
      // Upload to Firebase Storage with public access
      profileImageUrl = await uploadFileToStorage(
        buffer,
        uniqueFilename,
        `profiles/${session.user.id}`
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        bio,
        interests,
        student_id_image: studentIdUrl,
        profile_image: profileImageUrl,
        profile_completed: true,
        // If student ID was uploaded, mark as pending verification
        verification_status: studentIdUrl ? 'PENDING' : 'NONE',
      },
      select: {
        id: true,
        bio: true,
        interests: true,
        profile_image: true,
        verification_status: true
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}