import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, TrendingUp, History, Star, Disc, User, Users, Settings, UserPlus, UserCheck, Check, X, Edit2, Search as SearchIcon } from 'lucide-react';
import { Album, Review, UserProfile } from './types';
import { AlbumCard } from './components/AlbumCard';
import { ReviewForm } from './components/ReviewForm';
import { ReviewList } from './components/ReviewList';
import { SearchMusic } from './components/SearchMusic';
import { SearchUsers } from './components/SearchUsers';
import { cn } from './lib/utils';

const INITIAL_USER: UserProfile = {
  id: 'current-user',
  name: 'Seu Nome',
  handle: '@voce',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  bio: 'Amante de música e colecionador de vinis.',
  followersCount: 128,
  followingCount: 256,
  joinedAt: Date.now(),
};

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    userId: 'u1',
    userName: 'Ana Silva',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    albumId: 'a1',
    albumTitle: 'Random Access Memories',
    artist: 'Daft Punk',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
    rating: 5,
    comment: 'Um clássico moderno. A produção é impecável e a colaboração com Giorgio Moroder é lendária.',
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: 'r2',
    userId: 'u2',
    userName: 'Pedro Rock',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    albumId: 'a2',
    albumTitle: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    coverUrl: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&h=300&fit=crop',
    rating: 5,
    comment: 'Não há palavras para descrever a jornada sonora deste álbum. Essencial para qualquer fã de música.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
  {
    id: 'r3',
    userId: 'u3',
    userName: 'Clara Jazz',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Clara',
    albumId: 'a3',
    albumTitle: 'Kind of Blue',
    artist: 'Miles Davis',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    rating: 4,
    comment: 'Suave, elegante e revolucionário. Perfeito para uma noite de chuva.',
    createdAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
  }
];

export default function App() {
  const [searchResults, setSearchResults] = useState<Album[]>(() => {
    const saved = localStorage.getItem('soundcheck_search_results');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Initialize state from localStorage or defaults
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('soundcheck_reviews');
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });
  
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userSearchResults, setUserSearchResults] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'feed' | 'profile' | 'community'>(() => {
    const saved = localStorage.getItem('soundcheck_active_tab');
    return (saved as any) || 'discover';
  });
  
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('soundcheck_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });
  
  const [following, setFollowing] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('soundcheck_following');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editHandle, setEditHandle] = useState(user.handle);
  const [editBio, setEditBio] = useState(user.bio);

  // Sync edit states when user changes (e.g. after initial load)
  useEffect(() => {
    setEditName(user.name);
    setEditHandle(user.handle);
    setEditBio(user.bio);
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('soundcheck_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('soundcheck_following', JSON.stringify(Array.from(following)));
  }, [following]);

  useEffect(() => {
    localStorage.setItem('soundcheck_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('soundcheck_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('soundcheck_search_results', JSON.stringify(searchResults));
  }, [searchResults]);

  const handleAddReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    setReviews([newReview, ...reviews]);
  };

  const toggleFollow = (userId: string) => {
    const newFollowing = new Set(following);
    if (newFollowing.has(userId)) {
      newFollowing.delete(userId);
      setUser(prev => ({ ...prev, followingCount: prev.followingCount - 1 }));
    } else {
      newFollowing.add(userId);
      setUser(prev => ({ ...prev, followingCount: prev.followingCount + 1 }));
    }
    setFollowing(newFollowing);
  };

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: editName,
      handle: editHandle.startsWith('@') ? editHandle : `@${editHandle}`,
      bio: editBio,
    };
    
    setUser(updatedUser);
    
    // Update name and handle in existing reviews by this user
    setReviews(prev => prev.map(review => 
      review.userId === user.id 
        ? { ...review, userName: editName } 
        : review
    ));
    
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setEditHandle(user.handle);
    setEditBio(user.bio);
    setIsEditingProfile(false);
  };

  return (
    <div className="relative min-h-screen">
      <div className="atmosphere" />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                <Disc className="animate-spin-slow" size={24} />
              </div>
              <span className="hidden font-serif text-2xl font-bold tracking-tight text-white md:block">SoundCheck</span>
            </div>

            <div className="hidden w-96 md:block">
              <SearchMusic onResults={(results) => {
                setSearchResults(results);
                setActiveTab('discover');
              }} />
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
            {[
              { id: 'discover', icon: Music, label: 'Descobrir' },
              { id: 'feed', icon: History, label: 'Feed' },
              { id: 'community', icon: Users, label: 'Comunidade' },
              { id: 'profile', icon: User, label: 'Perfil' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all md:px-6",
                  activeTab === tab.id ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white"
                )}
              >
                <tab.icon size={16} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Mobile Search */}
        <div className="mb-8 md:hidden">
          <SearchMusic onResults={(results) => {
            setSearchResults(results);
            setActiveTab('discover');
          }} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {searchResults.length === 0 ? (
                <section className="flex flex-col items-center py-20 text-center">
                  <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-3xl font-serif text-5xl font-bold leading-tight text-white md:text-7xl"
                  >
                    Sua música, sua <span className="text-purple-500">voz.</span>
                  </motion.h1>
                  <p className="mt-6 max-w-xl text-lg text-white/60">
                    Descubra novos álbuns, compartilhe suas avaliações e conecte-se com outros amantes de música.
                  </p>
                </section>
              ) : (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-white/40">
                    <TrendingUp size={20} />
                    <h2 className="text-sm font-bold uppercase tracking-widest">Resultados da Busca</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {searchResults.map((album) => (
                      <AlbumCard
                        key={album.id}
                        album={album}
                        onReview={setSelectedAlbum}
                      />
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-3xl font-bold text-white">Feed da Comunidade</h2>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <span className="font-bold text-purple-500">{reviews.length}</span> reviews publicados
                </div>
              </div>
              <ReviewList reviews={reviews} />
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <section className="flex flex-col items-center py-10 text-center">
                <h1 className="font-serif text-4xl font-bold text-white md:text-5xl">Encontre seus amigos</h1>
                <p className="mt-4 max-w-xl text-white/60">
                  Pesquise por outros amantes de música e veja o que eles andam ouvindo.
                </p>
                <div className="mt-8 w-full max-w-xl">
                  <SearchUsers onResults={setUserSearchResults} />
                </div>
              </section>

              {userSearchResults.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-white/40">
                    <SearchIcon size={20} />
                    <h2 className="text-sm font-bold uppercase tracking-widest">Resultados da Busca</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {userSearchResults.map((result) => (
                      <div 
                        key={result.id} 
                        className="group flex cursor-pointer items-center justify-between rounded-2xl glass p-4 transition-all hover:bg-white/5"
                        onClick={() => setSelectedUser(result)}
                      >
                        <div className="flex items-center gap-3">
                          <img src={result.avatar} alt={result.name} className="h-12 w-12 rounded-full bg-white/5" />
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-purple-400">{result.name}</h4>
                            <p className="text-xs text-white/40">{result.handle}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollow(result.id);
                          }}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                            following.has(result.id) 
                              ? "bg-white/10 text-purple-500" 
                              : "bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105"
                          )}
                        >
                          {following.has(result.id) ? <UserCheck size={20} /> : <UserPlus size={20} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="space-y-8">
                <div className="flex items-center gap-2 text-white/40">
                  <TrendingUp size={20} />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Sugestões para você</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { id: 'u1', name: 'Ana Silva', handle: '@aninha_music', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', bio: 'Fã de Daft Punk e música eletrônica.' },
                    { id: 'u2', name: 'Pedro Rock', handle: '@pedrorock', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro', bio: 'Colecionador de vinis de rock clássico.' },
                    { id: 'u3', name: 'Clara Jazz', handle: '@clarajazz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Clara', bio: 'Amante de Jazz e Blues.' },
                  ].map((suggested) => (
                    <div 
                      key={suggested.id} 
                      className="group flex cursor-pointer items-center justify-between rounded-2xl glass p-4 transition-all hover:bg-white/5"
                      onClick={() => setSelectedUser(suggested as any)}
                    >
                      <div className="flex items-center gap-3">
                        <img src={suggested.avatar} alt={suggested.name} className="h-12 w-12 rounded-full bg-white/5" />
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-purple-400">{suggested.name}</h4>
                          <p className="text-xs text-white/40">{suggested.handle}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollow(suggested.id);
                        }}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                          following.has(suggested.id) 
                            ? "bg-white/10 text-purple-500" 
                            : "bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105"
                        )}
                      >
                        {following.has(suggested.id) ? <UserCheck size={20} /> : <UserPlus size={20} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Profile Header */}
              <div className="relative overflow-hidden rounded-3xl glass p-8 md:p-12">
                <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-32 w-32 rounded-full border-4 border-white/10 bg-white/5 shadow-2xl md:h-40 md:w-40"
                    />
                    <button className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20">
                      <Settings size={20} />
                    </button>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    {isEditingProfile ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-white/30">Nome</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-xl bg-white/5 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-white/30">Username</label>
                          <input
                            type="text"
                            value={editHandle}
                            onChange={(e) => setEditHandle(e.target.value)}
                            className="w-full rounded-xl bg-white/5 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-white/30">Bio</label>
                          <textarea
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            rows={3}
                            className="w-full rounded-xl bg-white/5 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500/50"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleSaveProfile}
                            className="flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-2 font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-600"
                          >
                            <Check size={18} /> Salvar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-2 rounded-xl bg-white/5 px-6 py-2 font-bold text-white transition-all hover:bg-white/10"
                          >
                            <X size={18} /> Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-4 md:justify-start">
                          <h1 className="font-serif text-4xl font-bold text-white">{user.name}</h1>
                          <button 
                            onClick={() => setIsEditingProfile(true)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                        <p className="text-lg text-white/40">{user.handle}</p>
                        <p className="mt-4 max-w-lg text-white/60">{user.bio}</p>
                      </>
                    )}
                    
                    <div className="mt-8 flex justify-center gap-8 md:justify-start">
                      <div className="text-center md:text-left">
                        <span className="block text-2xl font-bold text-white">{user.followersCount}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/30">Seguidores</span>
                      </div>
                      <div className="text-center md:text-left">
                        <span className="block text-2xl font-bold text-white">{user.followingCount}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/30">Seguindo</span>
                      </div>
                      <div className="text-center md:text-left">
                        <span className="block text-2xl font-bold text-white">{reviews.filter(r => r.userId === user.id).length}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/30">Reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User's Reviews */}
              <div className="space-y-8">
                <h2 className="font-serif text-3xl font-bold text-white">Suas Avaliações</h2>
                <ReviewList reviews={reviews.filter(r => r.userId === user.id)} />
              </div>

              {/* Suggestions to Follow */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 text-white/40">
                  <Users size={20} />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Sugestões para seguir</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { id: 'u1', name: 'Ana Silva', handle: '@aninha_music', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana' },
                    { id: 'u2', name: 'Pedro Rock', handle: '@pedrorock', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro' },
                    { id: 'u3', name: 'Clara Jazz', handle: '@clarajazz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Clara' },
                  ].map((suggested) => (
                    <div key={suggested.id} className="flex items-center justify-between rounded-2xl glass p-4">
                      <div className="flex items-center gap-3">
                        <img src={suggested.avatar} alt={suggested.name} className="h-12 w-12 rounded-full bg-white/5" />
                        <div>
                          <h4 className="text-sm font-bold text-white">{suggested.name}</h4>
                          <p className="text-xs text-white/40">{suggested.handle}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFollow(suggested.id)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                          following.has(suggested.id) 
                            ? "bg-white/10 text-purple-500" 
                            : "bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105"
                        )}
                      >
                        {following.has(suggested.id) ? <UserCheck size={20} /> : <UserPlus size={20} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 py-12 text-center text-white/20">
        <p className="text-sm">© 2026 SoundCheck. Powered by Gemini AI.</p>
      </footer>

      {/* User Profile Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl glass p-8 shadow-2xl"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute right-6 top-6 text-white/40 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                <img src={selectedUser.avatar} alt={selectedUser.name} className="h-32 w-32 rounded-full bg-white/5" />
                <div className="flex-1">
                  <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h2 className="font-serif text-3xl font-bold text-white">{selectedUser.name}</h2>
                      <p className="text-white/40">{selectedUser.handle}</p>
                    </div>
                    <button
                      onClick={() => toggleFollow(selectedUser.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-full px-6 py-2 font-bold transition-all",
                        following.has(selectedUser.id) 
                          ? "bg-white/10 text-purple-500" 
                          : "bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105"
                      )}
                    >
                      {following.has(selectedUser.id) ? (
                        <><UserCheck size={18} /> Seguindo</>
                      ) : (
                        <><UserPlus size={18} /> Seguir</>
                      )}
                    </button>
                  </div>
                  <p className="mt-4 text-white/60">{selectedUser.bio}</p>
                  
                  <div className="mt-6 flex justify-center gap-8 md:justify-start">
                    <div className="text-center md:text-left">
                      <span className="block text-xl font-bold text-white">{selectedUser.followersCount}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Seguidores</span>
                    </div>
                    <div className="text-center md:text-left">
                      <span className="block text-xl font-bold text-white">{selectedUser.followingCount}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Seguindo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-6">
                <h3 className="font-serif text-xl font-bold text-white">Atividade Recente</h3>
                <div className="rounded-2xl bg-white/5 p-8 text-center text-white/20">
                  <p>Este usuário ainda não publicou nenhuma review.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <ReviewForm
        album={selectedAlbum}
        currentUser={user}
        onClose={() => setSelectedAlbum(null)}
        onSubmit={handleAddReview}
      />
    </div>
  );
}
