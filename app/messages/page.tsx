'use client';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ConversationList from './components/ConversationList';
import ConversationView from './components/ConversationView';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

export default function MessagesPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversation');

  useEffect(() => {
    const initSession = async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        redirect('/auth/signin');
      }
      setSession(session);
      
      // Get initial conversations
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', session.user.id),
        orderBy('last_message_at', 'desc')
      );

      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversationsData = await Promise.all(
        conversationsSnapshot.docs.map(async (doc) => {
          const conversationData = doc.data();
          
          // Get last message
          const messagesQuery = query(
            collection(db, 'messages'),
            where('conversationId', '==', doc.id),
            orderBy('created_at', 'desc'),
            limit(1)
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          const lastMessage = messagesSnapshot.docs[0]?.data();

          return {
            id: doc.id,
            ...conversationData,
            lastMessage
          };
        })
      );

      setConversations(conversationsData);
      setLoading(false);
    };

    initSession();
  }, []);

  useEffect(() => {
    const loadCurrentConversation = async () => {
      if (!conversationId || !session?.user) return;

      // Get current conversation messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('created_at', 'desc'),
        limit(50)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setCurrentConversation({
          ...conversation,
          messages: messages.reverse()
        });
      }
    };

    loadCurrentConversation();
  }, [conversationId, session, conversations]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-1/3 border-r">
        <ConversationList 
          initialConversations={conversations}
          currentId={conversationId || undefined}
          userId={session.user.id}
        />
      </div>
      <div className="flex-1">
        {currentConversation ? (
          <ConversationView
            conversation={currentConversation}
            currentUser={session.user}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}