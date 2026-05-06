/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Hourglass, CheckCircle, ArrowUpRight, Flame, Layers, Award, UserCheck, Timer, ChevronRight } from 'lucide-react';
import { DropItem, WalletState } from '../types';

interface DropsGridProps {
  wallet: WalletState;
  onUpdateBalance: (newBalance: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  searchQuery: string;
  selectedId: string | null;
  onClearSelection: () => void;
}

const INITIAL_DROPS: DropItem[] = [
  {
    id: '1',
    title: 'Nebula Artifact 01',
    creator: {
      name: 'Cosmo Art',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format&q=60',
      username: '@cosmo_art'
    },
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    price: '0.08',
    totalMinted: 742,
    maxSupply: 1000,
    status: 'minting',
    releaseTime: new Date(Date.now() - 3600000).toISOString(),
    description: 'A stellar digital artifact rendered through neural fields representing cosmic energy. Own the celestial keys to the upcoming metaverse space station.',
    category: 'art',
    likes: 342,
    hasLiked: false
  },
  {
    id: '2',
    title: 'Solara Audio Synthesis',
    creator: {
      name: 'Helios',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format&q=60',
      username: '@helios_audio'
    },
    image: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&auto=format&fit=crop&q=80',
    price: '0.12',
    totalMinted: 0,
    maxSupply: 300,
    status: 'upcoming',
    releaseTime: new Date(Date.now() + 45000000).toISOString(), // ~12 hours from now
    description: 'Generative modular synthesizers that morph in response to global solar wind telemetry. Includes high-fidelity lossless master WAV and live sound visualizer.',
    category: 'music',
    likes: 189,
    hasLiked: false
  },
  {
    id: '3',
    title: 'Kyoto Cyberpunk Grid',
    creator: {
      name: 'Retro Grid',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&fit=crop&auto=format&q=60',
      username: '@retro_grid'
    },
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    price: '0.05',
    totalMinted: 290,
    maxSupply: 300,
    status: 'minting',
    releaseTime: new Date(Date.now() - 72000000).toISOString(),
    description: 'Exclusive 3D assets optimized for retro arcade environments. Includes GLTF source code and private access keys to virtual neon lounge rooms.',
    category: 'gaming',
    likes: 412,
    hasLiked: true
  },
  {
    id: '4',
    title: 'Aether Silk Couture',
    creator: {
      name: 'Lumen Couture',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format&q=60',
      username: '@lumen_couture'
    },
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&auto=format&fit=crop&q=80',
    price: '0.25',
    totalMinted: 50,
    maxSupply: 50,
    status: 'completed',
    releaseTime: new Date(Date.now() - 360000000).toISOString(),
    description: 'Ethereal digital robes tailored for avatars. Features dynamic flow mechanics that catch the simulated winds of major testnet environments.',
    category: 'fashion',
    likes: 298,
    hasLiked: false
  },
  {
    id: '5',
    title: 'Concrete Monolith Codex',
    creator: {
      name: 'Architect Prime',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format&q=60',
      username: '@architect_prime'
    },
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    price: '0.15',
    totalMinted: 120,
    maxSupply: 250,
    status: 'minting',
    releaseTime: new Date(Date.now() - 10000000).toISOString(),
    description: 'Industrial geometry study inspired by structural brutalism. An exact representation of virtual spaces and architectural layouts in code.',
    category: 'art',
    likes: 195,
    hasLiked: false
  },
  {
    id: '6',
    title: 'Frequencies & Waves 1.0',
    creator: {
      name: 'Freq Mod',
      avatar: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=80&fit=crop&auto=format&q=60',
      username: '@freq_mod'
    },
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    price: '0.06',
    totalMinted: 18,
    maxSupply: 100,
    status: 'minting',
    releaseTime: new Date(Date.now() - 80000).toISOString(),
    description: 'Interactive sound waveforms mapped via WebAudio API directly onto abstract canvas renders. Play, generate and customize your synth rhythm on demand.',
    category: 'music',
    likes: 95,
    hasLiked: false
  },
];

export default function DropsGrid({
  wallet,
  onUpdateBalance,
  onShowToast,
  searchQuery,
  selectedId,
  onClearSelection,
}: DropsGridProps) {
  const [drops, setDrops] = useState<DropItem[]>(INITIAL_DROPS);
  const [activeTab, setActiveTab] = useState<'all' | 'art' | 'music' | 'gaming' | 'fashion'>('all');
  const [selectedDrop, setSelectedDrop] = useState<DropItem | null>(null);
  const [mintLoading, setMintLoading] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [countdownString, setCountdownString] = useState<string>('00:00:00');

  // Sync selectedId from header search action
  useEffect(() => {
    if (selectedId) {
      if (selectedId === 'all' || selectedId === 'art' || selectedId === 'music' || selectedId === 'gaming' || selectedId === 'fashion') {
        setActiveTab(selectedId);
        onClearSelection();
      } else {
        const matched = drops.find(d => d.id === selectedId);
        if (matched) {
          setSelectedDrop(matched);
          onClearSelection();
        }
      }
    }
  }, [selectedId, drops, onClearSelection]);

  // Handle countdown updates
  useEffect(() => {
    const upcoming = drops.find(d => d.status === 'upcoming');
    if (!upcoming) return;

    const interval = setInterval(() => {
      const release = new Date(upcoming.releaseTime).getTime();
      const diff = release - Date.now();

      if (diff <= 0) {
        setCountdownString('00:00:00');
        // Transition state to minting
        setDrops(prev => prev.map(d => d.id === upcoming.id ? { ...d, status: 'minting' } : d));
        onShowToast(`${upcoming.title} is now LIVE for minting!`, 'success');
        clearInterval(interval);
      } else {
        const hrs = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setCountdownString(`${hrs}:${mins}:${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [drops, onShowToast]);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDrops(prev =>
      prev.map(d => {
        if (d.id === id) {
          const likedState = !d.hasLiked;
          const currentLikes = d.likes;
          onShowToast(likedState ? 'Saved to collection list.' : 'Removed from collection list.', 'info');
          return {
            ...d,
            hasLiked: likedState,
            likes: likedState ? currentLikes + 1 : currentLikes - 1,
          };
        }
        return d;
      })
    );
  };

  const handleMintAction = () => {
    if (!selectedDrop) return;
    if (!wallet.isConnected) {
      onShowToast('Wallet connection requested to register simulated mints.', 'error');
      return;
    }

    const priceNum = parseFloat(selectedDrop.price);
    const balanceNum = parseFloat(wallet.balance || '0.0');

    if (balanceNum < priceNum) {
      onShowToast('Insufficient testnet Ethereum funds. Please request faucet ETH at your wallet profile.', 'error');
      return;
    }

    setMintLoading(true);
    setMinutesTimer();
  };

  const setMinutesTimer = () => {
    if (!selectedDrop) return;
    setTimeout(() => {
      // Deduct transaction fee
      const priceNum = parseFloat(selectedDrop.price);
      const balanceNum = parseFloat(wallet.balance || '0');
      const finalBalance = (balanceNum - priceNum).toFixed(2);
      onUpdateBalance(finalBalance);

      // Increment supply count
      setDrops(prev =>
        prev.map(d => {
          if (d.id === selectedDrop.id) {
            const nextMinted = d.totalMinted + 1;
            const isFinished = nextMinted >= d.maxSupply;
            return {
              ...d,
              totalMinted: nextMinted,
              status: isFinished ? 'completed' : d.status,
            };
          }
          return d;
        })
      );

      setMintLoading(false);
      setMintSuccess(true);
      onShowToast(`Dispatched transaction block for ${selectedDrop.title}!`, 'success');
      
      // Update selected states to keep sync
      setSelectedDrop(prev => {
        if (!prev) return null;
        const nextMinted = prev.totalMinted + 1;
        const isFinished = nextMinted >= prev.maxSupply;
        return {
          ...prev,
          totalMinted: nextMinted,
          status: isFinished ? 'completed' : prev.status,
        };
      });
    }, 1500);
  };

  const handleOpenDropDetail = (item: DropItem) => {
    setSelectedDrop(item);
    setMintSuccess(false);
  };

  const filteredDrops = drops
    .filter(item => activeTab === 'all' || item.category === activeTab)
    .filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.creator.name.toLowerCase().includes(q) ||
        item.creator.username.toLowerCase().includes(q) ||
        item.category.includes(q)
      );
    });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 pb-24 mt-4">
      {/* Interactive Tabs Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 pb-5 gap-4 mb-10 select-none">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-indigo-500 fill-indigo-100" />
          <h2 className="text-xl font-bold font-sans text-gray-900 tracking-tight">Active Releases</h2>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-gray-50/80 rounded-full border border-gray-100">
          {(['all', 'art', 'music', 'gaming', 'fashion'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {tab === 'all' ? 'All Drops' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Canvas */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredDrops.length > 0 ? (
            filteredDrops.map(item => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                onClick={() => handleOpenDropDetail(item)}
                className="group relative bg-white border border-gray-100 rounded-[2rem] p-4.5 shadow-sm hover:shadow-xl hover:border-gray-200/80 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                
                {/* Media Image container */}
                <div className="w-full aspect-[4/3] rounded-[1.5rem] bg-gray-50 overflow-hidden relative shadow-inner">
                  <img
                    referrerPolicy="no-referrer"
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                  />
                  
                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 bg-white/75 backdrop-blur-md rounded-full px-3 py-1 text-[9px] font-bold tracking-wider text-gray-800 uppercase shadow-sm">
                    {item.category}
                  </div>

                  {/* Top Right Actions (Heart Like Button) */}
                  <button
                    onClick={(e) => handleLike(item.id, e)}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full border shadow-sm transition-all active:scale-90 cursor-pointer ${
                      item.hasLiked
                        ? 'bg-rose-500/90 text-white border-rose-500/50 hover:bg-rose-600'
                        : 'bg-white/75 backdrop-blur-md text-gray-600 border-gray-100 hover:bg-white hover:text-black'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${item.hasLiked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Countdown Overlay for Upcoming items */}
                  {item.status === 'upcoming' && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                      <div className="p-2.5 bg-white/10 rounded-2xl mb-1.5 text-white/90 border border-white/20">
                        <Timer className="w-6 h-6 animate-pulse" />
                      </div>
                      <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Unlocking In</span>
                      <span className="text-2xl font-extrabold text-[#D9FF3F] tracking-tight font-mono mt-0.5 select-none text-shadow">
                        {countdownString}
                      </span>
                    </div>
                  )}
                </div>

                {/* Core Stats Details */}
                <div className="mt-4 px-1 pb-1">
                  
                  {/* Title & Status Badge Row */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                      {item.title}
                    </h3>
                    
                    {/* Status badges */}
                    {item.status === 'minting' && (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full select-none flex-shrink-0 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Minting
                      </span>
                    )}
                    {item.status === 'upcoming' && (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-[#E0D4FC]/40 text-[#6B3CF1] border border-[#E0D4FC]/60 font-bold px-2.5 py-0.5 rounded-full select-none flex-shrink-0">
                        <Hourglass className="w-2.5 h-2.5" />
                        Locked
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-gray-50 text-gray-500 border border-gray-100 font-bold px-2.5 py-0.5 rounded-full select-none flex-shrink-0">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Finished
                      </span>
                    )}
                  </div>

                  {/* Creator Bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <img
                      referrerPolicy="no-referrer"
                      src={item.creator.avatar}
                      alt={item.creator.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-500 font-medium">
                      By <span className="font-semibold text-gray-700">{item.creator.username}</span>
                    </span>
                  </div>

                  {/* Mint Progress Bar (if minting or finished) */}
                  {item.status !== 'upcoming' && (
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold font-mono">
                        <span>SUPPLY MINTED</span>
                        <span className="text-gray-700">
                          {item.totalMinted} / {item.maxSupply}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black transition-all duration-500"
                          style={{
                            width: `${(item.totalMinted / item.maxSupply) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom Metas Indicator Row */}
                  <div className="flex items-center justify-between border-t border-gray-50 mt-4 pt-3.5 pb-0.5">
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase font-mono">Mint price</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5 font-mono">{item.price} ETH</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-100 px-3 py-1.5 rounded-xl transition-all select-none">
                      <span>View details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>

              </motion.div>
            ))
          ) : (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-gray-50 rounded-3xl border border-gray-100 py-20 px-6 text-center">
              <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-900">No matching drops found</p>
              <p className="text-xs text-gray-400 mt-1">Try expanding your search parameters or selecting an alternative folder tab.</p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  onClearSelection();
                }}
                className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-full px-4.5 py-1.5 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Drop Details Modal Drawer Overlay */}
      <AnimatePresence>
        {selectedDrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop shadow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDrop(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body popup */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close icon button */}
              <button
                onClick={() => setSelectedDrop(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-gray-50 border border-gray-100 text-gray-400 hover:text-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 hidden" />
                <span className="text-xs font-bold px-1 select-none">Close</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-4.5">
                {/* Left pane: media preview */}
                <div className="w-full aspect-[4/3] md:aspect-square rounded-[2rem] bg-gray-50 overflow-hidden relative shadow-sm">
                  <img
                    referrerPolicy="no-referrer"
                    src={selectedDrop.image}
                    alt={selectedDrop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-2xl px-3 py-1.5 text-[10px] text-white font-mono font-semibold flex items-center gap-1.5 border border-white/10">
                    <Award className="w-3.5 h-3.5 text-lime-400" />
                    <span>VERIFIED CREATOR</span>
                  </div>
                </div>

                {/* Right pane: metrics & action description */}
                <div className="flex flex-col justify-between">
                  <div>
                    {/* Creator avatar card */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <img
                        referrerPolicy="no-referrer"
                        src={selectedDrop.creator.avatar}
                        alt={selectedDrop.creator.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div>
                        <span className="text-xs text-gray-400">Created by</span>
                        <p className="text-xs font-bold text-gray-900 mt-[-2px]">{selectedDrop.creator.username}</p>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                      {selectedDrop.title}
                    </h3>
                    
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-3 border-t border-gray-50 pt-3">
                      {selectedDrop.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-5 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-mono font-semibold tracking-wider">Release Price</span>
                        <p className="text-base font-extrabold text-gray-900 mt-0.5 font-mono">{selectedDrop.price} ETH</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-mono font-semibold tracking-wider">Category Tag</span>
                        <p className="text-xs font-bold text-gray-900 mt-1 capitalize">{selectedDrop.category}</p>
                      </div>
                    </div>

                    {selectedDrop.status !== 'upcoming' && (
                      <div className="mt-5 space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold font-mono">
                          <span>COLLATERAL SUPPLY MINTED</span>
                          <span className="text-gray-900">
                            {selectedDrop.totalMinted} / {selectedDrop.maxSupply} ({Math.round((selectedDrop.totalMinted / selectedDrop.maxSupply) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{
                              width: `${(selectedDrop.totalMinted / selectedDrop.maxSupply) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    {mintSuccess ? (
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 p-4 rounded-2xl text-center flex flex-col items-center">
                        <UserCheck className="w-6 h-6 text-emerald-600 mb-1" />
                        <p className="text-xs font-bold">Successfully Registered Mint ownership!</p>
                        <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Asset assigned and verification receipt saved in localStorage sandbox.</p>
                      </div>
                    ) : selectedDrop.status === 'upcoming' ? (
                      <div className="bg-gray-50 rounded-2xl p-4.5 text-center border border-gray-100 flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-700">Awaiting Launch Signal</span>
                        <p className="text-[10px] text-gray-500 mt-0.5">Minting opens when the locking index timer counts down to zero.</p>
                        <div className="mt-2.5 text-base font-extrabold text-[#6B3CF1] font-mono">
                          {countdownString}
                        </div>
                      </div>
                    ) : selectedDrop.status === 'completed' ? (
                      <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100 font-bold text-xs text-gray-400">
                        This release has reached maximum supply and is closed.
                      </div>
                    ) : (
                      <button
                        onClick={handleMintAction}
                        disabled={mintLoading}
                        className="w-full bg-black text-white hover:bg-black/90 disabled:bg-gray-400 py-3.5 rounded-2xl text-sm font-extrabold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                      >
                        {mintLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Approving sandbox logs...</span>
                          </>
                        ) : (
                          <>
                            <span>Mint Digital Drop</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
