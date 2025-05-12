import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';

export const messageService = {
  // Subscribe to a conversation's messages
  subscribeToMessages: (conversationId: string, callback: (messages: any[]) => void) => {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('created_at', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  },

  // Subscribe to user's conversations
  subscribeToConversations: (userId: string, callback: (conversations: any[]) => void) => {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('last_message_at', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const conversations = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const conversationData = doc.data();
          // Get last message
          const messagesQuery = query(
            collection(db, 'messages'),
            where('conversationId', '==', doc.id),
            orderBy('created_at', 'desc'),
            where('created_at', '<=', conversationData.last_message_at)
          );
          const messagesSnap = await getDocs(messagesQuery);
          const lastMessage = messagesSnap.docs[0]?.data();

          return {
            id: doc.id,
            ...conversationData,
            lastMessage
          };
        })
      );
      callback(conversations);
    });
  },

  // Send a new message
  sendMessage: async (data: {
    content: string,
    type: 'TEXT' | 'IMAGE' | 'FILE',
    mediaUrl?: string,
    conversationId: string,
    senderId: string,
    recipientId: string
  }) => {
    const messageRef = await addDoc(collection(db, 'messages'), {
      ...data,
      created_at: serverTimestamp(),
      is_read: false
    });

    // Update conversation's last message timestamp
    const conversationRef = doc(db, 'conversations', data.conversationId);
    await updateDoc(conversationRef, {
      last_message_at: serverTimestamp()
    });

    return messageRef.id;
  },

  // Mark messages as read
  markMessagesAsRead: async (conversationId: string, userId: string) => {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('recipientId', '==', userId),
      where('is_read', '==', false)
    );

    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { is_read: true })
    );
    
    await Promise.all(updates);
  }
};