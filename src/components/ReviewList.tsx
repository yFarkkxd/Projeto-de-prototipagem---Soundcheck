import React from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare } from 'lucide-react';
import { Review } from '../types';

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <MessageSquare size={48} className="mb-4 opacity-20" />
        <p>Ainda não há reviews. Seja o primeiro!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="group relative overflow-hidden rounded-2xl glass p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <img
                src={review.userAvatar}
                alt={review.userName}
                className="h-10 w-10 rounded-full bg-white/10"
              />
              <div>
                <h5 className="text-sm font-bold text-white">{review.userName}</h5>
                <p className="text-[10px] text-white/40">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-1 text-purple-500">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-bold">{review.rating}/5</span>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <img
              src={review.coverUrl}
              alt={review.albumTitle}
              className="h-20 w-20 rounded-lg object-cover shadow-md"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 overflow-hidden">
              <h4 className="line-clamp-1 font-serif text-lg font-medium text-white">{review.albumTitle}</h4>
              <p className="text-sm text-white/60">{review.artist}</p>
            </div>
          </div>
          
          {review.comment && (
            <div className="mt-4">
              <p className="line-clamp-3 text-sm italic text-white/80">"{review.comment}"</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
