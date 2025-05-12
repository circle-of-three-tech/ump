import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  limit,
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { content, type, mediaUrl, conversationId, recipientId, listingId } = await req.json();

    let conversationRef;

    if (conversationId) {
      // Verify user is part of the conversation
      const conversationQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', session.user.id)
      );
      const conversationSnapshot = await getDocs(conversationQuery);
      const conversation = conversationSnapshot.docs.find(doc => doc.id === conversationId);

      if (!conversation) {
        return new NextResponse('Conversation not found or unauthorized', { status: 404 });
      }
      conversationRef = doc(db, 'conversations', conversationId);
    } else {
      // Create new conversation
      conversationRef = await addDoc(collection(db, 'conversations'), {
        participants: [session.user.id, recipientId],
        created_at: serverTimestamp(),
        last_message_at: serverTimestamp(),
        listing_id: listingId || null
      });
    }

    // Create message
    const messageRef = await addDoc(collection(db, 'messages'), {
      content,
      type,
      media_url: mediaUrl,
      conversationId: conversationRef.id,
      senderId: session.user.id,
      recipientId,
      created_at: serverTimestamp(),
      is_read: false,
      sender: {
        id: session.user.id,
        full_name: session.user.name,
        profile_image: session.user.image
      }
    });

    // Update conversation's last message timestamp
    await updateDoc(conversationRef, {
      last_message_at: serverTimestamp()
    });

    // Create notification for recipient
    await addDoc(collection(db, 'notifications'), {
      userId: recipientId,
      type: 'MESSAGE',
      title: 'New Message',
      message: `${session.user.name} sent you a message`,
      data: {
        conversationId: conversationRef.id,
        messageId: messageRef.id
      },
      created_at: serverTimestamp(),
      is_read: false
    });

    return NextResponse.json({ id: messageRef.id });
  } catch (error: any) {
    console.error('Send message error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const cursor = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');
    const limitSize = limitParam ? parseInt(limitParam) : 50;

    if (!conversationId) {
      // Get all conversations for user
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', session.user.id),
        orderBy('last_message_at', 'desc')
      );

      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversations = await Promise.all(
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

          // Get unread count
          const unreadQuery = query(
            collection(db, 'messages'),
            where('conversationId', '==', doc.id),
            where('recipientId', '==', session.user.id),
            where('is_read', '==', false)
          );
          const unreadSnapshot = await getDocs(unreadQuery);

          return {
            id: doc.id,
            ...conversationData,
            lastMessage,
            unreadCount: unreadSnapshot.size
          };
        })
      );

      return NextResponse.json({ conversations });
    }

    // Get messages for conversation
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('created_at', 'desc'),
      limit(limitSize)
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Mark messages as read
    const unreadQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('recipientId', '==', session.user.id),
      where('is_read', '==', false)
    );
    
    const unreadSnapshot = await getDocs(unreadQuery);
    await Promise.all(
      unreadSnapshot.docs.map(doc => 
        updateDoc(doc.ref, { 
          is_read: true,
          read_at: serverTimestamp()
        })
      )
    );

    const nextCursor = messages.length === limitSize ? messages[messages.length - 1].id : null;

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}