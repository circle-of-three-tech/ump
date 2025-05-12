'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { fetchNotifications, markAsRead } from '@/app/utils/notifications';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    profile_image: string | null;
  };
}

interface NotificationsListProps {
  userId: string;
  unreadOnly?: boolean;
}

export function NotificationsList({
  userId,
  unreadOnly = false
}: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await fetchNotifications(unreadOnly);
        setNotifications(data);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [userId, unreadOnly]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
      // Update local state to mark notification as read
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }
  };

    if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
        <Bell className="w-12 h-12 mb-4" />
        <p>{unreadOnly ? 'No unread notifications' : 'No notifications yet'}</p>
      </div>
    );
  }

  const getNotificationLink = (notification: Notification): string => {
    switch (notification.type) {
      case 'MESSAGE':
        return `/messages?conversation=${notification.data?.conversationId}`;
      case 'LIKE':
      case 'COMMENT':
        return `/listings/${notification.data?.listingId}`;
      case 'FOLLOW':
        return `/profile/${notification.data?.followerId}`;
      case 'TRANSACTION':
        return `/transactions/${notification.data?.transactionId}`;
      default:
        return '#';
    }
  };

  return (
    <div className="space-y-1">
      {notifications.map((notification) => (
        <Link
          key={notification.id}
          href={getNotificationLink(notification)}
          className={`block p-4 rounded-lg hover:bg-gray-50 transition-colors ${
            !notification.is_read ? 'bg-blue-50/80' : 'bg-white'
          }`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start gap-3">
            {notification.sender?.profile_image && (
              <img
                src={notification.sender.profile_image}
                alt={notification.sender.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{notification.title}</p>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {!notification.is_read && (
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function getNotificationLink(notification: Notification): string {
  switch (notification.type) {
    case 'MESSAGE':
      return `/messages?conversation=${notification.data?.conversationId}`;
    case 'LIKE':
    case 'COMMENT':
      return `/listings/${notification.data?.listingId}`;
    case 'FOLLOW':
      return `/profile/${notification.data?.followerId}`;
    case 'TRANSACTION':
      return `/transactions/${notification.data?.transactionId}`;
    default:
      return '#';
  }
}