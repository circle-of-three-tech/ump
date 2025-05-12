import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import webpush from 'web-push';

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:' + process.env.CONTACT_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const subscription = await req.json();

    // Store the subscription in Firebase
    await addDoc(collection(db, 'push_subscriptions'), {
      userId: session.user.id,
      subscription,
      notification_preferences: {
        messages: true,
        likes: true,
        comments: true,
        follows: true,
        transactions: true
      },
      created_at: serverTimestamp(),
      active: true
    });

    // Send a test notification
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Notifications Enabled',
        message: 'You will now receive notifications for important updates',
        icon: '/icons/icon-192x192.png'
      })
    );

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Push subscription error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find and deactivate subscriptions in Firebase
    const subscriptionsQuery = query(
      collection(db, 'push_subscriptions'),
      where('userId', '==', session.user.id),
      where('active', '==', true)
    );
    
    const snapshot = await getDocs(subscriptionsQuery);
    await Promise.all(
      snapshot.docs.map(doc => 
        updateDoc(doc.ref, { 
          active: false,
          deactivated_at: serverTimestamp()
        })
      )
    );

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Push unsubscription error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const preferences = await req.json();

    // Update notification preferences for all active subscriptions
    const subscriptionsQuery = query(
      collection(db, 'push_subscriptions'),
      where('userId', '==', session.user.id),
      where('active', '==', true)
    );
    
    const snapshot = await getDocs(subscriptionsQuery);
    await Promise.all(
      snapshot.docs.map(doc => 
        updateDoc(doc.ref, { 
          notification_preferences: preferences,
          updated_at: serverTimestamp()
        })
      )
    );

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}