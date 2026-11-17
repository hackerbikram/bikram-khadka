'use client';

import { useState, useTransition } from 'react';
import { toggleLike } from '@/app/actions/engagementAction';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  initialLiked: boolean;
}

export default function LikeButton({ postId, initialLikes, initialLiked }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Save previous state for rollback if server fails
    const previousLiked = liked;
    const previousLikes = likes;

    // Optimistic UI update
    const nextLiked = !previousLiked;
    setLiked(nextLiked);
    setLikes(nextLiked ? previousLikes + 1 : Math.max(0, previousLikes - 1));

    startTransition(async () => {
      try {
        const res = await toggleLike(postId);
        setLikes(res.totalLikes);
        setLiked(res.userLiked);
      } catch (error) {
        // Revert UI state on error
        setLiked(previousLiked);
        setLikes(previousLikes);
        console.error('Like action failed:', error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-60 ${
        liked
          ? 'border-rose-200 bg-rose-50 text-rose-600'
          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
      }`}
    >
      <span>{liked ? '❤️' : '🤍'}</span>
      <span>{likes}</span>
    </button>
  );
}