import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export type NotificationType = 
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'MESSAGE'
  | 'TRANSACTION'
  | 'LISTING_UPDATE'
  | 'SYSTEM';

export interface NotificationPayload {
  title: string;
  message: string;
  icon?: string;
  data?: any;
}

export interface Notification {
  id: string;
  type: 'MESSAGE' | 'LIKE' | 'COMMENT' | 'FOLLOW' | 'TRANSACTION';
  title: string;
  message: string;
  userId: string;
  data?: any;
  is_read: boolean;
  created_at: Date;
}

export async function initializeNotifications() {
  try {
    if (typeof window === 'undefined') return null; // Server-side check
    
    const messaging = getMessaging();
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });

      // Register token with backend
      await fetch('/api/notifications/register-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      // Handle foreground messages
      onMessage(messaging, (payload) => {
        const { title, body, data } = payload.notification || {};
        if (title && body) {
          new Notification(title, {
            body,
            icon: '/icons/icon-192x192.png',
            data
          });
        }
      });

      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
}

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  data?: any
) {
  try {
    // Create notification in Firestore
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      data,
      is_read: false,
      created_at: serverTimestamp()
    });

    // Send FCM notification through backend
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        notification: {
          title,
          body: message,
          data
        }
      })
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

export function getNotificationTitle(type: NotificationType, data: any): string {
  switch (type) {
    case 'LIKE':
      return `${data.userName} liked your listing`;
    case 'COMMENT':
      return `${data.userName} commented on your listing`;
    case 'FOLLOW':
      return `${data.userName} started following you`;
    case 'MESSAGE':
      return `New message from ${data.userName}`;
    case 'TRANSACTION':
      return `Transaction update for "${data.listingTitle}"`;
    case 'LISTING_UPDATE':
      return `Update on listing "${data.listingTitle}"`;
    case 'SYSTEM':
      return 'System Notification';
    default:
      return 'New Notification';
  }
}

export function getNotificationMessage(type: NotificationType, data: any): string {
  switch (type) {
    case 'LIKE':
      return `${data.userName} liked your listing "${data.listingTitle}"`;
    case 'COMMENT':
      return `${data.userName} commented: "${data.comment.substring(0, 50)}${data.comment.length > 50 ? '...' : ''}"`;
    case 'FOLLOW':
      return `${data.userName} is now following you`;
    case 'MESSAGE':
      return `${data.userName}: "${data.message.substring(0, 50)}${data.message.length > 50 ? '...' : ''}"`;
    case 'TRANSACTION':
      return `${data.action} - ${data.listingTitle}`;
    case 'LISTING_UPDATE':
      return data.message || `There's an update on your listing "${data.listingTitle}"`;
    case 'SYSTEM':
      return data.message;
    default:
      return 'You have a new notification';
  }
}

export async function requestNotificationPermission() {
  return initializeNotifications();
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('created_at', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    created_at: doc.data().created_at?.toDate()
  })) as Notification[];
}

export function subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('created_at', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate()
    })) as Notification[];
    callback(notifications);
  });
}

export async function markNotificationAsRead(notificationId: string) {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, {
    is_read: true,
    read_at: serverTimestamp()
  });
}

export async function createNotification(data: {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  data?: any;
}) {
  await addDoc(collection(db, 'notifications'), {
    ...data,
    is_read: false,
    created_at: serverTimestamp()
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('is_read', '==', false)
  );

  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map(doc => 
    updateDoc(doc.ref, { 
      is_read: true,
      read_at: serverTimestamp()
    })
  );

  await Promise.all(updates);
}

export async function deleteNotification(notificationId: string) {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, {
    deleted_at: serverTimestamp()
  });
}