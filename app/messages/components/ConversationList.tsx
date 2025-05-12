'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { messageService } from '@/lib/messageService';

interface ConversationListProps {
  initialConversations: any[];
  currentId?: string;
  userId: string;
}

export default function ConversationList({
  initialConversations,
  currentId,
  userId
}: ConversationListProps) {
  const pathname = usePathname();
  const [conversations, setConversations] = useState(initialConversations);

  useEffect(() => {
    // Subscribe to conversations updates
    const unsubscribe = messageService.subscribeToConversations(userId, (updatedConversations) => {
      setConversations(updatedConversations);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return (
    <div className="h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>
      <div className="overflow-y-auto h-[calc(100%-65px)]">
        {conversations.map((conversation) => {
          const otherParticipant = conversation.participants.find(
            (p: any) => p.id !== userId
          );
          const lastMessage = conversation.lastMessage;
          const unreadCount = conversation.messages?.filter(
            (m: any) => !m.is_read && m.recipientId === userId
          ).length || 0;
          const isActive = currentId === conversation.id;

          return (
            <Link
              key={conversation.id}
              href={`${pathname}?conversation=${conversation.id}`}
              className={`block p-4 border-b hover:bg-gray-50 transition-colors ${
                isActive ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Image
                  src={otherParticipant.profile_image || `https://ui-avatars.com/api/?name=${otherParticipant.full_name}`}
                  alt={otherParticipant.full_name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate">
                      {otherParticipant.full_name}
                    </p>
                    {lastMessage && (
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {conversation.listing && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="relative w-8 h-8">
                        <Image
                          src={conversation.listing.images[0]?.url || '/placeholder.png'}
                          alt={conversation.listing.title}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.listing.title}
                      </p>
                    </div>
                  )}
                  {lastMessage && (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {lastMessage.senderId === userId ? 'You: ' : ''}
                        {lastMessage.content || (lastMessage.type === 'IMAGE' ? 'Sent an image' : 'Sent a file')}
                      </p>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}