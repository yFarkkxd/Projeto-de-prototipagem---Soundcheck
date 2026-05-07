import React, { forwardRef } from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare } from 'lucide-react';
import { VirtuosoGrid } from 'react-virtuoso';
import { Review } from '../types';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewItem = ({ review, index }: { review: Review; index: number }) => {
  const variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring' as const, 
        stiffness: 260, 
        damping: 20, 
        delay: index * 0.05 
      } 
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      className="group relative h-full overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md transition-shadow hover:shadow-2xl hover:shadow-purple-500/10"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <motion.img
            whileHover={{ scale: 1.1 }}
            src={review.userAvatar}
            alt={review.userName}
            className="h-10 w-10 rounded-full border border-white/10 bg-white/10"
          />
          <div>
            <h5 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{review.userName}</h5>
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
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={review.coverUrl}
          alt={review.albumTitle}
          className="h-20 w-20 rounded-xl object-cover shadow-xl"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 overflow-hidden">
          <h4 className="line-clamp-1 font-serif text-lg font-bold text-white">{review.albumTitle}</h4>
          <p className="text-sm text-white/40">{review.artist}</p>
        </div>
      </div>
      
      {review.comment && (
        <div className="mt-4">
          <p className="line-clamp-3 text-sm italic leading-relaxed text-white/70">"{review.comment}"</p>
        </div>
      )}
    </motion.div>
  );
};

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
