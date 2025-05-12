import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '../../../auth';

// Add PATCH endpoint for marking notifications as read
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await request.json();
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, title, message, recipientId, data } = await req.json();

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        data: data || {},
        is_read: false,
        userId: recipientId,
        senderId: session.user.id
      },
    });

    // If the user has a push_subscription, send a push notification
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { push_subscription: true }
    });

    if (recipient?.push_subscription) {
      try {
        // Here you would implement your push notification logic
        // using the recipient.push_subscription data
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly ? { is_read: false } : {}),
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        sender: {
          select: {
            id: true,
            full_name: true,
            profile_image: true,
          }
        }
      },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}