import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, TrendingUp, History, Star, Disc, User, Users, Settings, UserPlus, UserCheck, Check, X, Edit2, Search as SearchIcon, MessageCircle, Send, Upload, Image as ImageIcon } from 'lucide-react';
import { Album, Review, UserProfile, Chat, Message } from './types';
import { AlbumCard } from './components/AlbumCard';
import { ReviewForm } from './components/ReviewForm';
import { ReviewList } from './components/ReviewList';
import { SearchMusic } from './components/SearchMusic';
import { SearchUsers } from './components/SearchUsers';
import { cn } from './lib/utils';

const MOCK_USERS = [
  { id: 'u1', name: 'Ana Silva', handle: '@aninha_music', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', bio: 'Fã de Daft Punk e música eletrônica.', followersCount: 154, followingCount: 89 },
  { id: 'u2', name: 'Pedro Rock', handle: '@pedrorock', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro', bio: 'Colecionador de vinis de rock clássico.', followersCount: 231, followingCount: 142 },
  { id: 'u3', name: 'Clara Jazz', handle: '@clarajazz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Clara', bio: 'Amante de Jazz e Blues.', followersCount: 98, followingCount: 56 },
];

const INITIAL_USER: UserProfile = {
  id: 'current-user',
  name: 'Seu Nome',
  handle: '@voce',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  bio: 'Amante de música e colecionador de vinis.',
  followersCount: 42,
  followingCount: 0,
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
  const [hasSearchedUsers, setHasSearchedUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'feed' | 'profile' | 'community' | 'messages'>(() => {
    const saved = localStorage.getItem('soundcheck_active_tab');
    return (saved as any) || 'home';
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('soundcheck_chats');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('soundcheck_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
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
  const [editAvatar, setEditAvatar] = useState(user.avatar);

  // Sync edit states when user changes (e.g. after initial load)
  useEffect(() => {
    setEditName(user.name);
    setEditHandle(user.handle);
    setEditBio(user.bio);
  }, [user.name, user.handle, user.bio]);

  // Memoized user counts and lists
  const userReviews = React.useMemo(() => reviews.filter(r => r.userId === user.id), [reviews, user.id]);
  
  const followedUsers = React.useMemo(() => {
    return Array.from(following).map((followedId) => {
      return MOCK_USERS.find(u => u.id === followedId) || userSearchResults.find(u => u.id === followedId);
    }).filter(Boolean) as UserProfile[];
  }, [following, userSearchResults]);

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
    if (activeTab !== 'home') {
      setSearchResults([]);
    }
    localStorage.setItem('soundcheck_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('soundcheck_search_results', JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    localStorage.setItem('soundcheck_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('soundcheck_messages', JSON.stringify(messages));
  }, [messages]);

  const handleAddReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    setReviews([newReview, ...reviews]);
  };

  const toggleFollow = (userId: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  // Sync followingCount with following set size
  useEffect(() => {
    setUser(prev => ({
      ...prev,
      followingCount: following.size
    }));
  }, [following.size]);

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: editName,
      handle: editHandle.startsWith('@') ? editHandle : `@${editHandle}`,
      bio: editBio,
      avatar: editAvatar,
    };
    
    setUser(updatedUser);
    
    // Update name and avatar in existing reviews by this user
    setReviews(prev => prev.map(review => 
      review.userId === user.id 
        ? { ...review, userName: editName, userAvatar: editAvatar } 
        : review
    ));
    
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setEditHandle(user.handle);
    setEditBio(user.bio);
    setEditAvatar(user.avatar);
    setIsEditingProfile(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const PREDEFINED_AVATARS = ['Felix', 'Aneka', 'Milo', 'Luna', 'Oliver', 'Maya', 'Jack', 'Aria'];

  const startChat = (otherUser: UserProfile) => {
    let chat = chats.find(c => c.participants.includes(otherUser.id));
    if (!chat) {
      chat = {
        id: `chat-${Date.now()}`,
        participants: [user.id, otherUser.id],
        updatedAt: Date.now(),
      };
      setChats([chat, ...chats]);
    }
    setActiveChatId(chat.id);
    setActiveTab('messages');
    setSelectedUser(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;

    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;

    const otherUserId = chat.participants.find(p => p !== user.id);
    if (!otherUserId) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: otherUserId,
      content: newMessage,
      createdAt: Date.now(),
      read: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    const updatedChats = chats.map(c => 
      c.id === activeChatId ? { ...c, lastMessage: message, updatedAt: Date.now() } : c
    );
    setChats(updatedChats.sort((a, b) => b.updatedAt - a.updatedAt));
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen">
      <div className="atmosphere" />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
            <motion.div 
               whileHover={{ scale: 1.1, rotate: 90 }}
               className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20"
            >
              <Disc className="animate-spin-slow" size={24} />
            </motion.div>
              <span className="hidden font-serif text-2xl font-bold tracking-tight text-white md:block">SoundCheck</span>
            </div>

            <div className="hidden w-96 md:block">
              <SearchMusic onResults={(results) => {
                setSearchResults(results);
                setActiveTab('home');
              }} />
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
            {[
              { id: 'home', icon: Music, label: 'Início' },
              { id: 'feed', icon: History, label: 'Feed' },
              { id: 'community', icon: Users, label: 'Comunidade' },
              { id: 'messages', icon: MessageCircle, label: 'Mensagens' },
              { id: 'profile', icon: User, label: 'Perfil' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all md:px-6",
                  activeTab === tab.id ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white"
                )}
              >
                <tab.icon size={16} />
                <span className="hidden md:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Mobile Search */}
        <div className="mb-8 md:hidden">
          <SearchMusic onResults={(results) => {
            setSearchResults(results);
            setActiveTab('home');
          }} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {searchResults.length === 0 ? (
                <div className="space-y-20">
                  {/* Enhanced Hero Section */}
                  <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-purple-900/20 via-black to-black p-8 md:p-20">
                    <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-purple-600/10 blur-[120px]" />
                    <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[120px]" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-purple-400"
                      >
                        <Star size={14} /> Nova Experiência Musical
                      </motion.div>
                      
                      <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-4xl font-serif text-5xl font-bold leading-[1.1] text-white md:text-8xl"
                      >
                        Sua trilha sonora, <br />
                        <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">sua verdade.</span>
                      </motion.h1>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 max-w-xl text-lg text-white/50"
                      >
                        O SoundCheck é onde a crítica musical encontra a paixão. Descubra álbuns, compartilhe notas e conecte-se com quem ouve o que você ama.
                      </motion.p>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-10 flex flex-wrap justify-center gap-4"
                      >
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveTab('community')}
                          className="rounded-full bg-purple-500 px-8 py-4 font-bold text-white shadow-xl shadow-purple-500/20 transition-all hover:bg-purple-600"
                        >
                          Explorar Comunidade
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const input = document.getElementById('search-music-input');
                            if (input) {
                              input.focus();
                              input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          className="rounded-full border border-white/10 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white/10"
                        >
                          Pesquisar Álbuns
                        </motion.button>
                      </motion.div>
                    </div>
                  </section>
                </div>
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
              <section className="relative overflow-hidden rounded-3xl bg-purple-500/10 p-10 text-center">
                <div className="atmosphere opacity-30" />
                <h1 className="relative font-serif text-4xl font-bold text-white md:text-5xl">Conecte-se com a música</h1>
                <p className="relative mt-4 mx-auto max-w-xl text-white/60">
                  Descubra o que seus amigos estão ouvindo, siga novos críticos e construa sua rede musical.
                </p>
                <div className="relative mt-10 flex justify-center">
                  <SearchUsers onResults={(results) => {
                    setUserSearchResults(results);
                    setHasSearchedUsers(true);
                  }} />
                </div>
              </section>

              {hasSearchedUsers && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/40">
                      <SearchIcon size={20} />
                      <h2 className="text-sm font-bold uppercase tracking-widest">
                        {userSearchResults.length > 0 ? 'Resultados da Busca' : 'Nenhum usuário encontrado'}
                      </h2>
                    </div>
                    {userSearchResults.length > 0 && (
                      <button 
                        onClick={() => {
                          setUserSearchResults([]);
                          setHasSearchedUsers(false);
                        }}
                        className="text-xs font-bold text-purple-500 hover:underline"
                      >
                        Limpar busca
                      </button>
                    )}
                  </div>

                  {userSearchResults.length > 0 ? (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {userSearchResults.map((result) => (
                        <motion.div 
                          key={result.id} 
                          variants={itemVariants}
                          whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                          className="group flex cursor-pointer items-center justify-between rounded-2xl glass p-5 transition-all"
                          onClick={() => setSelectedUser(result)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img src={result.avatar} alt={result.name} className="h-14 w-14 rounded-full border border-white/10 bg-white/5" />
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#050505] bg-green-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-purple-400">{result.name}</h4>
                              <p className="text-xs text-white/40">{result.handle}</p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFollow(result.id);
                            }}
                            className={cn(
                              "flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-all",
                              following.has(result.id) 
                                ? "bg-white/10 text-purple-500" 
                                : "bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105"
                            )}
                          >
                            {following.has(result.id) ? (
                              <UserCheck size={16} />
                            ) : (
                              <><UserPlus size={16} /> Seguir</>
                            )}
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-white/20">
                        <Users size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-white">Usuário não encontrado</h3>
                      <p className="mt-2 max-w-xs text-sm text-white/40">
                        Não encontramos ninguém com esse nome ou handle. Tente pesquisar por termos diferentes.
                      </p>
                      <button 
                        onClick={() => {
                          setUserSearchResults([]);
                          setHasSearchedUsers(false);
                        }}
                        className="mt-6 rounded-full border border-white/10 px-6 py-2 text-xs font-bold text-white transition-all hover:bg-white/5"
                      >
                        Voltar para sugestões
                      </button>
                    </div>
                  )}
                </section>
              )}

              {!hasSearchedUsers && (
                <div className="grid gap-12 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/40">
                        <TrendingUp size={20} className="text-purple-500" />
                        <h2 className="text-sm font-bold uppercase tracking-widest">Membros em Destaque</h2>
                      </div>
                    </div>
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid gap-6 sm:grid-cols-2"
                    >
                      {[
                        { id: 'u1', name: 'Ana Silva', handle: '@aninha_music', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', bio: 'Fã de Daft Punk e música eletrônica.' },
                        { id: 'u2', name: 'Pedro Rock', handle: '@pedrorock', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro', bio: 'Colecionador de vinis de rock clássico.' },
                        { id: 'u3', name: 'Clara Jazz', handle: '@clarajazz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Clara', bio: 'Amante de Jazz e Blues.' },
                      ].map((suggested) => (
                        <motion.div 
                          key={suggested.id} 
                          variants={itemVariants}
                          whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                          className="group relative overflow-hidden rounded-3xl glass p-6 transition-all"
                          onClick={() => setSelectedUser(suggested as any)}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                              <img src={suggested.avatar} alt={suggested.name} className="h-24 w-24 rounded-full border-2 border-white/10 bg-white/5 p-1 shadow-xl" />
                              <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-[#050505] bg-purple-500" />
                            </div>
                            <h4 className="font-serif text-xl font-bold text-white group-hover:text-purple-400">{suggested.name}</h4>
                            <p className="text-sm text-white/40">{suggested.handle}</p>
                            <p className="mt-3 line-clamp-2 text-xs text-white/60">{suggested.bio}</p>
                            
                            <div className="mt-6 flex w-full gap-2">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFollow(suggested.id);
                                }}
                                className={cn(
                                  "flex-1 items-center justify-center rounded-xl py-2.5 text-xs font-bold transition-all",
                                  following.has(suggested.id) 
                                    ? "bg-white/10 text-purple-500" 
                                    : "bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-600"
                                )}
                              >
                                {following.has(suggested.id) ? 'Seguindo' : 'Seguir'}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startChat(suggested as any);
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white transition-all hover:bg-white/10"
                              >
                                <MessageCircle size={18} />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  <motion.div 
                    variants={itemVariants}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-2 text-white/40">
                      <Music size={20} className="text-purple-500" />
                      <h2 className="text-sm font-bold uppercase tracking-widest">Resumo da Comunidade</h2>
                    </div>
                    
                    <div className="rounded-3xl glass p-6 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <span className="text-sm text-white/40">Total de Membros</span>
                        <span className="font-bold text-white">4.2k</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <span className="text-sm text-white/40">Reviews Hoje</span>
                        <span className="font-bold text-white">128</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <span className="text-sm text-white/40">Álbuns Populares</span>
                        <span className="font-bold text-white">12</span>
                      </div>
                      
                      <div className="pt-4">
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Top Gêneros</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Rock', 'Jazz', 'Electronic', 'Pop', 'Hip-Hop'].map(genre => (
                            <span key={genre} className="rounded-full bg-white/5 px-3 py-1 text-[10px] text-white/40">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex h-[calc(100vh-200px)] overflow-hidden rounded-3xl glass"
            >
              {/* Chat List */}
              <div className="w-80 border-r border-white/5 bg-white/2">
                <div className="border-b border-white/5 p-6">
                  <h2 className="font-serif text-2xl font-bold text-white">Mensagens</h2>
                </div>
                <div className="overflow-y-auto">
                  {chats.length === 0 ? (
                    <div className="p-10 text-center text-sm text-white/20">
                      Nenhuma conversa iniciada.
                    </div>
                  ) : (
                    chats.map(chat => {
                      const otherParticipant = reviews.find(r => chat.participants.includes(r.userId) && r.userId !== user.id);
                      const name = otherParticipant?.userName || 'Usuário';
                      const avatar = otherParticipant?.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.id}`;
                      
                      return (
                        <button
                          key={chat.id}
                          onClick={() => setActiveChatId(chat.id)}
                          className={cn(
                            "flex w-full items-center gap-4 border-b border-white/5 p-4 transition-colors hover:bg-white/5",
                            activeChatId === chat.id && "bg-white/10"
                          )}
                        >
                          <img src={avatar} alt={name} className="h-12 w-12 rounded-full border border-white/10 bg-white/10" />
                          <div className="flex-1 overflow-hidden text-left">
                            <h4 className="line-clamp-1 text-sm font-bold text-white">{name}</h4>
                            <p className="line-clamp-1 text-xs text-white/40">
                              {chat.lastMessage ? chat.lastMessage.content : 'Inicie uma conversa'}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex flex-1 flex-col bg-white/1">
                {activeChatId ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages
                        .filter(m => 
                          (m.senderId === user.id && m.receiverId === chats.find(c => c.id === activeChatId)?.participants.find(p => p !== user.id)) ||
                          (m.receiverId === user.id && m.senderId === chats.find(c => c.id === activeChatId)?.participants.find(p => p !== user.id))
                        )
                        .map(msg => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex",
                              msg.senderId === user.id ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-lg",
                                msg.senderId === user.id 
                                  ? "bg-purple-500 text-white" 
                                  : "bg-white/10 text-white backdrop-blur-md"
                              )}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                    </div>
                    <form onSubmit={handleSendMessage} className="border-t border-white/5 bg-black/40 p-4 backdrop-blur-md">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Escreva sua mensagem..."
                          className="flex-1 rounded-xl bg-white/5 px-4 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-purple-500/50"
                        />
                        <button
                          type="submit"
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-600"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-center text-white/20">
                    <MessageCircle size={64} className="mb-4 opacity-10" />
                    <p>Selecione uma conversa para começar.</p>
                  </div>
                )}
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
                      src={isEditingProfile ? editAvatar : user.avatar}
                      alt={user.name}
                      className="h-32 w-32 rounded-full border-4 border-white/10 bg-white/5 shadow-2xl md:h-40 md:w-40"
                    />
                    {isEditingProfile ? (
                      <label className="absolute bottom-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-purple-500 text-white shadow-lg transition-all hover:bg-purple-600">
                        <Upload size={20} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                    ) : (
                      <button className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20">
                        <Settings size={20} />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    {isEditingProfile ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-white/30">Escolha um Avatar</label>
                          <div className="flex flex-wrap gap-3">
                            {PREDEFINED_AVATARS.map((seed) => {
                              const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                              return (
                                <button
                                  key={seed}
                                  onClick={() => setEditAvatar(url)}
                                  className={cn(
                                    "relative h-12 w-12 overflow-hidden rounded-full border-2 transition-all hover:scale-110",
                                    editAvatar === url ? "border-purple-500 ring-2 ring-purple-500/20" : "border-transparent opacity-60 hover:opacity-100"
                                  )}
                                >
                                  <img src={url} alt={seed} className="h-full w-full object-cover" />
                                </button>
                              );
                            })}
                          </div>
                        </div>

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
                      <button 
                        onClick={() => setActiveTab('profile')} // Just refresh for now
                        className="text-center transition-all hover:scale-105 md:text-left"
                      >
                        <span className="block text-2xl font-bold text-white">{following.size}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/30">Seguindo</span>
                      </button>
                      <div className="text-center md:text-left">
                        <span className="block text-2xl font-bold text-white">{userReviews.length}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/30">Reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User's Reviews */}
              <div className="space-y-8">
                <h2 className="font-serif text-3xl font-bold text-white">Suas Avaliações</h2>
                <ReviewList reviews={userReviews} />
              </div>

              {/* User's Following */}
              {following.size > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-2 text-white/40">
                    <UserCheck size={20} />
                    <h2 className="text-sm font-bold uppercase tracking-widest">Pessoas que você segue</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {followedUsers.map((followedUser) => (
                        <div 
                          key={followedUser.id} 
                          className="group flex cursor-pointer items-center justify-between rounded-2xl glass p-4 transition-all hover:bg-white/5"
                          onClick={() => setSelectedUser(followedUser)}
                        >
                          <div className="flex items-center gap-3">
                            <img src={followedUser.avatar} alt={followedUser.name} className="h-12 w-12 rounded-full bg-white/5" />
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-purple-400">{followedUser.name}</h4>
                              <p className="text-xs text-white/40">{followedUser.handle}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFollow(followedUser.id);
                            }}
                            className="bg-white/10 text-purple-500 flex h-10 w-10 items-center justify-center rounded-full transition-all"
                          >
                            <UserCheck size={20} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Suggestions to Follow */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 text-white/40">
                  <Users size={20} />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Sugestões para seguir</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {MOCK_USERS.map((suggested) => (
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
        </AnimatePresence>
      </main>


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
                    <div className="flex gap-2">
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
                      <button
                        onClick={() => startChat(selectedUser as UserProfile)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
                      >
                        <MessageCircle size={20} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 text-white/60">{selectedUser.bio}</p>
                  
                  <div className="mt-6 flex justify-center gap-8 md:justify-start">
                    <div className="text-center md:text-left">
                      <span className="block text-xl font-bold text-white">
                        {selectedUser.followersCount + (following.has(selectedUser.id) ? 1 : 0)}
                      </span>
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
