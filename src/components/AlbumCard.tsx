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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      className={cn(
        "group relative flex flex-col rounded-lg p-4 transition-all duration-300 hover:bg-white/5",
        className
      )}
    >
      <div className="relative mb-4 aspect-square w-full shadow-2xl shadow-black/50">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="h-full w-full rounded-md object-cover"
          referrerPolicy="no-referrer"
        />
        
        <button
          onClick={() => onReview(album)}
          className="absolute bottom-2 right-2 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-purple-500 text-black opacity-0 shadow-xl transition-all duration-300 hover:scale-105 group-hover:translate-y-0 group-hover:opacity-100 active:scale-95"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-1 font-sans text-base font-bold text-white">{album.title}</h3>
        <p className="line-clamp-2 text-sm font-medium text-white/60">
          {album.artist} • {album.year}
        </p>
      </div>
    </motion.div>
  );
}
