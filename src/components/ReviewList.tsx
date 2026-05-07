import React, { forwardRef } from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare } from 'lucide-react';
import { VirtuosoGrid } from 'react-virtuoso';
import { Review } from '../types';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewItem = ({ review, index }: { review: Review; index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3 }}
    className="group relative h-full overflow-hidden rounded-2xl glass p-6"
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
);

const gridComponents = {
  List: forwardRef<HTMLDivElement, any>(({ style, children, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      style={{ ...style }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {children}
    </div>
  )),
  Item: ({ children, ...props }: any) => (
    <div {...props} className="p-1">
      {children}
    </div>
  ),
};

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
    <VirtuosoGrid
      useWindowScroll
      data={reviews}
      components={gridComponents}
      itemContent={(index, review) => (
        <ReviewItem review={review} index={index} />
      )}
    />
  );
}
