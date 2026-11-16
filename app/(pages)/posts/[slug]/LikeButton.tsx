'use client';

import { useState, useTransition } from 'react';

interface LikeButtonProps {
  postId: number;
  initialLikes: number;
  incrementLikeAction: (postId: number) => Promise<number>;
}

export default function LikeButton({ postId, initialLikes, incrementLikeAction }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    if (hasLiked) return;
    setLikes((prev) => prev + 1);
    setHasLiked(true);

    startTransition(async () => {
      try {
        await incrementLikeAction(postId);
      } catch {
        setLikes((prev) => prev - 1);
        setHasLiked(false);
      }
    });
  };

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer border ${
        hasLiked
          ? 'bg-red-50 text-red-600 border-red-200 shadow-xs'
          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
      }`}
    >
      <span>{hasLiked ? '❤️' : '🤍'}</span>
      <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
    </button>
  );
}