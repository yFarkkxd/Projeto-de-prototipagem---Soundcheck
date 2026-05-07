import React from 'react';
import { motion } from 'motion/react';
import { Star, Plus } from 'lucide-react';
import { Album } from '../types';
import { cn } from '../lib/utils';

interface AlbumCardProps {
  album: Album;
  onReview: (album: Album) => void;
  className?: string;
}

export function AlbumCard({ album, onReview, className }: AlbumCardProps) {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative flex flex-col rounded-3xl p-4 transition-all duration-300",
        className
      )}
    >
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        <button
          onClick={() => onReview(album)}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500 text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95">
            <Plus size={28} strokeWidth={3} />
          </div>
        </button>
      </div>

      <div className="flex flex-col gap-1 px-1">
        <h3 className="line-clamp-1 font-serif text-lg font-bold text-white group-hover:text-purple-400">{album.title}</h3>
        <p className="line-clamp-1 text-sm font-medium text-white/40">
          {album.artist} • {album.year}
        </p>
      </div>
    </motion.div>
  );
}
