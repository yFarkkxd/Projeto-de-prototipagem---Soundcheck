import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star } from 'lucide-react';
import { Album, Review, UserProfile } from '../types';
import { cn } from '../lib/utils';

interface ReviewFormProps {
  album: Album | null;
  currentUser: UserProfile;
  onClose: () => void;
  onSubmit: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

export function ReviewForm({ album, currentUser, onClose, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!album) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    onSubmit({
      albumId: album.id,
      albumTitle: album.title,
      artist: album.artist,
      coverUrl: album.coverUrl,
      rating,
      comment,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
    });
    onClose();
    setRating(0);
    setComment('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl glass p-8 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-white/40 hover:text-white"
          >
            <X size={24} />
          </button>

          <div className="flex gap-6">
            <img
              src={album.coverUrl}
              alt={album.title}
              className="h-32 w-32 rounded-xl object-cover shadow-lg"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">{album.title}</h2>
              <p className="text-white/60">{album.artist}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="mb-2 block text-sm font-medium text-white/60">Sua Nota (0-5)</label>
                <span className="text-xl font-bold text-purple-500">{rating}/5</span>
              </div>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(rating === star ? 0 : star)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star
                      size={36}
                      className={cn(
                        "transition-colors",
                        (hoveredRating || rating) >= star
                          ? "fill-purple-500 text-purple-500"
                          : "text-white/10"
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/30">Clique na estrela selecionada para resetar para 0.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/60">Sua Opinião</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="O que achou deste álbum? (opcional)"
                rows={4}
                className="w-full rounded-xl bg-white/5 p-4 text-white outline-none ring-1 ring-white/10 transition-all focus:ring-purple-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-purple-500 py-4 font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-600 active:scale-95"
            >
              Publicar Review
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
