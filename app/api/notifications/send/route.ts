import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId, notification } = await req.json();

    // Get user's FCM token from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { push_subscription: true }
    });

    if (!user?.push_subscription) {
      return new NextResponse('User has no push subscription', { status: 400 });
    }

    const messaging = getMessaging(getFirebaseAdmin());
    
    // Send notification through FCM
    await messaging.send({
      token: user.push_subscription as string,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data,
      webpush: {
        fcmOptions: {
          link: process.env.NEXT_PUBLIC_APP_URL
        }
      }
    });

    return new NextResponse('Notification sent', { status: 200 });
  } catch (error) {
    console.error('Error sending notification:', error);
    return new NextResponse('Error sending notification', { status: 500 });
  }
}