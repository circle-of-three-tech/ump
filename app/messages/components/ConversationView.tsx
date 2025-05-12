'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { messageService } from '@/lib/messageService';
import { formatDistanceToNow } from 'date-fns';
import { Link, Send, Image as ImageIcon } from 'lucide-react';

interface ConversationViewProps {
  conversation: any;
  currentUser: any;
}

export default function ConversationView({
  conversation,
  currentUser
}: ConversationViewProps) {
  const [messages, setMessages] = useState(conversation.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherParticipant = conversation.participants.find(
    (p: any) => p.id !== currentUser.id
  );

  useEffect(() => {
    // Subscribe to real-time message updates
    const unsubscribe = messageService.subscribeToMessages(conversation.id, (updatedMessages) => {
      setMessages(updatedMessages);
    });

    // Mark messages as read
    messageService.markMessagesAsRead(conversation.id, currentUser.id);

    return () => {
      unsubscribe();
    };
  }, [conversation.id, currentUser.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await messageService.sendMessage({
        content: newMessage,
        type: 'TEXT',
        conversationId: conversation.id,
        senderId: currentUser.id,
        recipientId: otherParticipant.id
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const { url } = await uploadResponse.json();

        await messageService.sendMessage({
          content: '',
          type: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
          mediaUrl: url,
          conversationId: conversation.id,
          senderId: currentUser.id,
          recipientId: otherParticipant.id
        });
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={otherParticipant.profile_image || `https://ui-avatars.com/api/?name=${otherParticipant.full_name}`}
            alt={otherParticipant.full_name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold">{otherParticipant.full_name}</h3>
            {conversation.listing && (
              <p className="text-sm text-gray-600">
                Re: {conversation.listing.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: any) => {
          const isSender = message.senderId === currentUser.id;

          return (
            <div
              key={message.id}
              className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[70%] ${isSender ? 'flex-row-reverse' : ''}`}>
                <Image
                  src={message.sender.profile_image || `https://ui-avatars.com/api/?name=${message.sender.full_name}`}
                  alt={message.sender.full_name}
                  width={32}
                  height={32}
                  className="rounded-full self-end"
                />
                <div>
                  {message.type === 'TEXT' && (
                    <div
                      className={`rounded-lg p-3 ${
                        isSender
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  )}
                  {message.type === 'IMAGE' && (
                    <div className="rounded-lg overflow-hidden">
                      <Image
                        src={message.media_url}
                        alt="Shared image"
                        width={300}
                        height={300}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                    })}
                    {message.is_read && isSender && (
                      <span className="ml-1">· Read</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isUploading}
          >
            <ImageIcon size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isUploading}
            className="p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}