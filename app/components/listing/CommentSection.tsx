'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, Send, X, MessageSquare, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  timeAgo: string;
  user: {
    id: string;
    name: string;
    profile_image: string | null;
    university: string | null;
  };
  replyCount: number;
  likeCount: number;
  isLiked: boolean;
}

interface CommentSectionProps {
  listingId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentSection({ listingId, isOpen, onClose }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [viewingReplies, setViewingReplies] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ...rest of the component code...
  
  return (
    <div 
      className={cn(
        "absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-xl z-30 transition-transform duration-300",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}
      style={{ height: '70%' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Comment List */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 h-[calc(100%-60px-64px)]">
        {comments.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className="mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                {/* ...existing comment rendering code... */}
              </div>
            ))}
            {hasMore && !loading && (
              <div className="flex justify-center mt-4">
                <Button onClick={() => fetchComments(false)} size="sm" variant="outline">
                  Load more
                </Button>
              </div>
            )}
            {loading && (
              <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Comment Input */}
      {session?.user && (
        <form onSubmit={handleSubmitComment} className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[60px]"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!commentText.trim() || submitting}
              className="h-10 w-10 self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}