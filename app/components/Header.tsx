'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Bell, MessageCircle, User, LogOut, Settings, Plus } from 'lucide-react';
import SearchBar from './SearchBar';
import { messageService } from '@/lib/messageService';
import { getNotifications, markNotificationAsRead } from '@/lib/notifications';
import { formatDistanceToNow } from 'date-fns';
import CreateListingWidget from './CreateListingWidget';
import Logo from './Logo';

export default function Header() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Subscribe to conversations for unread count and latest messages
    const unsubMessages = messageService.subscribeToConversations(session.user.id, (conversations) => {
      // Get latest message from each conversation
      const latestMessages = conversations
        .map(conv => ({
          ...conv.lastMessage,
          otherParticipant: conv.participants.find((p: any) => p.id !== session.user.id),
          conversationId: conv.id,
          listing: conv.listing
        }))
        .filter(msg => msg.created_at)
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 5);

      setMessages(latestMessages);
      setUnreadMessages(conversations.reduce((acc, conv) => 
        acc + (conv.messages?.filter((m: any) => !m.is_read && m.recipientId === session.user.id).length || 0), 0
      ));
    });

    // Load notifications
    const loadNotifications = async () => {
      const notifications = await getNotifications(session.user.id);
      setNotifications(notifications.slice(0, 5));
      setUnreadNotifications(notifications.filter(n => !n.is_read).length);
    };
    loadNotifications();

    return () => {
      unsubMessages();
    };
  }, [session?.user?.id]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }
    setShowNotifications(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Nav */}
            <div className="flex items-center gap-4 md:gap-8">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-600 hover:text-gray-900 md:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <Link href="/" className="flex items-center gap-2">
                <Logo />
                <span className="text-xl font-bold hidden sm:inline">UniMarkets</span>
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link href="/explore" className="text-gray-600 hover:text-gray-900">
                  Explore
                </Link>
              </nav>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-4 md:mx-8">
              <SearchBar />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {session?.user ? (
                <>
                    <button 
                    className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                    onClick={() => {
                      setShowCreateListing(true);
                      setShowMessages(false);
                      setShowNotifications(false);
                      setShowMenu(false);
                    }}
                  >
                    <Plus className="w-5 h-5" />
                  </button>


                  <button
                    onClick={() => setShowCreateListing(true)}
                    className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Plus className="w-6 h-6" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowMessages(!showMessages);
                        setShowNotifications(false);
                        setShowMenu(false);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-900 relative"
                    >
                      <MessageCircle className="w-6 h-6" />
                      {unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadMessages}
                        </span>
                      )}
                    </button>

                    {showMessages && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden">
                        <div className="p-4 border-b">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Messages</h3>
                            <Link 
                              href="/messages" 
                              className="text-sm text-indigo-600 hover:text-indigo-700"
                              onClick={() => setShowMessages(false)}
                            >
                              View All
                            </Link>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {messages.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              No messages yet
                            </div>
                          ) : (
                            messages.map((message) => (
                              <Link
                                key={message.id}
                                href={`/messages?conversation=${message.conversationId}`}
                                className={`block p-4 hover:bg-gray-50 border-b ${!message.is_read && message.recipientId === session.user.id ? 'bg-blue-50' : ''}`}
                                onClick={() => setShowMessages(false)}
                              >
                                <div className="flex items-start gap-3">
                                  <Image
                                    src={message.otherParticipant.profile_image || `https://ui-avatars.com/api/?name=${message.otherParticipant.full_name}`}
                                    alt={message.otherParticipant.full_name}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium">{message.otherParticipant.full_name}</p>
                                    <p className="text-sm text-gray-600 truncate">
                                      {message.senderId === session.user.id ? 'You: ' : ''}
                                      {message.content || (message.type === 'IMAGE' ? 'Sent an image' : 'Sent a file')}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowMessages(false);
                        setShowMenu(false);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-900 relative"
                    >
                      <Bell className="w-6 h-6" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden">
                        <div className="p-4 border-b">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Notifications</h3>
                            <Link 
                              href="/notifications" 
                              className="text-sm text-indigo-600 hover:text-indigo-700"
                              onClick={() => setShowNotifications(false)}
                            >
                              View All
                            </Link>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <Link
                                key={notification.id}
                                href={getNotificationLink(notification)}
                                className={`block p-4 hover:bg-gray-50 border-b ${!notification.is_read ? 'bg-blue-50' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <p className="font-medium">{notification.title}</p>
                                    <p className="text-sm text-gray-600">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowMenu(!showMenu);
                        setShowMessages(false);
                        setShowNotifications(false);
                      }}
                      className="p-1 text-gray-600 hover:text-gray-900"
                    >
                      <Image
                        src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}`}
                        alt={session.user.name || 'Profile'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border overflow-hidden">
                        <div className="p-2">
                          <Link
                            href={`/profile/${session.user.id}`}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
                            onClick={() => setShowMenu(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
                            onClick={() => setShowMenu(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                          <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-red-600"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t bg-white">
            <nav className="px-4 py-2">
              <Link
                href="/explore"
                className="block py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowMobileMenu(false)}
              >
                Explore
              </Link>
              {session?.user && (
                <>
                  <Link
                    href={`/profile/${session.user.id}`}
                    className="block py-2 text-gray-600 hover:text-gray-900"  
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block py-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Settings
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <CreateListingWidget 
        isVisible={showCreateListing}
        onClose={() => setShowCreateListing(false)}
      />
    </>
  );
}

function getNotificationLink(notification: any): string {
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