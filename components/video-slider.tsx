'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  ChevronUp,
  ChevronDown,
  Play,
  Tag,
  Music,
  MessageCircle,
  Heart,
  Share2,
  Volume2,
  VolumeX,
  Repeat,
  Send,
  Link as LinkIcon,
  Code,
  Facebook,
  X
} from 'lucide-react';

interface Short {
  id: string;
  url: string;
  title?: string;
  description: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
  user: string;
  userAvatar: string;
  sound: string;
  soundIcon: string;
  isLiked: boolean;
  hasLiked: boolean;
  hasDisliked?: boolean;
  userComments: any[];
  category?: any;
  slug?: string;
  tags?: string[];
}

interface VideoSliderProps {
  videos?: Short[];
  initialVideoId?: string;
}

export default function VideoSlider({ videos: propVideos, initialVideoId }: VideoSliderProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [videos, setVideos] = useState<Short[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState<Record<string, boolean>>({});
  const [isDesktop, setIsDesktop] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [commentsByVideo, setCommentsByVideo] = useState<Record<string, any[]>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const adRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Set videos from props
  useEffect(() => {
    if (propVideos && propVideos.length > 0) {
      setVideos(propVideos);
      const initialMuteState: Record<string, boolean> = {};
      propVideos.forEach(video => {
        initialMuteState[video.id] = false;
      });
      setIsMuted(initialMuteState);
    }
  }, [propVideos]);

  // Handle initial scroll
  useEffect(() => {
    if (videos.length > 0 && initialVideoId) {
      const index = videos.findIndex(v => v.id === initialVideoId);
      if (index !== -1 && index !== currentIndex) {
        setTimeout(() => {
          const container = containerRef.current;
          if (container) {
            container.scrollTo({
              top: index * container.clientHeight,
              behavior: 'smooth'
            });
            setCurrentIndex(index);
          }
        }, 100);
      }
    }
  }, [videos, initialVideoId]);

  useEffect(() => {
    const checkIfDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  // Intersection Observer for autoplay
  useEffect(() => {
    if (videos.length === 0) return;

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoId = entry.target.getAttribute('data-video-id');
        if (!videoId) return;

        const videoElement = videoRefs.current[videoId];
        if (entry.isIntersecting) {
          if (videoElement) {
            videoElement.play().catch(() => { });
            setIsPlaying(prev => ({ ...prev, [videoId]: true }));
          }
        } else {
          if (videoElement) {
            videoElement.pause();
            videoElement.currentTime = 0;
            setIsPlaying(prev => ({ ...prev, [videoId]: false }));
          }
        }
      });
    }, { threshold: 0.7 });

    videos.forEach(video => {
      const element = document.querySelector(`[data-video-id="${video.id}"]`);
      if (element) observerRef.current?.observe(element);
    });

    return () => observerRef.current?.disconnect();
  }, [videos]);

  // Load sidebar ad
  useEffect(() => {
    if (!isDesktop) return;

    const initAd = () => {
      try {
        const container = adRef.current;
        if (container && !container.hasChildNodes()) {
          const script1 = document.createElement('script');
          script1.type = 'text/javascript';
          script1.innerHTML = `
            atOptions = {
              'key' : '66975061848bb97f41e0aad2cde52b33',
              'format' : 'iframe',
              'height' : 600,
              'width' : 160,
              'params' : {}
            };
          `;
          const script2 = document.createElement('script');
          script2.type = 'text/javascript';
          script2.src = 'https://www.highperformanceformat.com/66975061848bb97f41e0aad2cde52b33/invoke.js';
          script2.async = true;
          script2.onerror = () => {
            console.warn('Ad script failed to load');
          };
          
          container.appendChild(script1);
          container.appendChild(script2);
        }
      } catch (error) {
        console.warn('Failed to load ads:', error);
      }
    };

    const timer = setTimeout(initAd, 1500);
    return () => clearTimeout(timer);
  }, [isDesktop]);

  // Handle scroll and URL update
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || videos.length === 0) return;
      const container = containerRef.current;
      const newIndex = Math.round(container.scrollTop / container.clientHeight);

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
        setCurrentIndex(newIndex);
        setShowCommentInput(null);
        setShowShareModal(null);
        const currentVideo = videos[newIndex];
        if (currentVideo && typeof window !== 'undefined') {
          const newUrl = `/shorts/${currentVideo.slug || currentVideo.id}`;
          try {
            if (window.history?.replaceState) {
              window.history.replaceState(null, '', newUrl);
            }
          } catch (error) {
            console.warn("History replaceState failed:", error);
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex, videos]);

  const togglePlay = useCallback((videoId: string) => {
    const videoElement = videoRefs.current[videoId];
    if (!videoElement) return;
    if (videoElement.paused) {
      videoElement.play();
      setIsPlaying(prev => ({ ...prev, [videoId]: true }));
    } else {
      videoElement.pause();
      setIsPlaying(prev => ({ ...prev, [videoId]: false }));
    }
  }, []);

  const toggleMute = useCallback((videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = videoRefs.current[videoId];
    if (!videoElement) return;
    videoElement.muted = !videoElement.muted;
    setIsMuted(prev => ({ ...prev, [videoId]: videoElement.muted }));
  }, []);

  const handleLike = useCallback(async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authUser) {
      alert("Please login to like this video");
      return;
    }

    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        const hasLiked = !v.hasLiked;
        const currentLikes = parseNumber(v.likes);
        return {
          ...v,
          hasLiked,
          likes: formatNumber(Math.max(0, hasLiked ? currentLikes + 1 : currentLikes - 1))
        };
      }
      return v;
    }));

    try {
      await fetch(`/api/shorts/${videoId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' })
      });
    } catch (error) { console.error(error); }
  }, [authUser]);

  const handleComment = useCallback(async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (showCommentInput === videoId) {
      setShowCommentInput(null);
      return;
    }
    setShowCommentInput(videoId);
    try {
      const res = await fetch(`/api/shorts/${videoId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCommentsByVideo(prev => ({ ...prev, [videoId]: data }));
      }
    } catch (error) { console.error(error); }
  }, [showCommentInput]);

  const submitComment = useCallback(async (videoId: string) => {
    if (!newComment.trim() || !authUser) {
      if (!authUser) alert("Please login to comment");
      return;
    }
    try {
      const res = await fetch(`/api/shorts/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: newComment.trim(),
          user: authUser.id
        })
      });
      if (res.ok) {
        const data = await res.json();
        const newDbComment = {
          _id: Date.now().toString(),
          user: { name: authUser.name, avatar: authUser.avatar },
          content: newComment.trim(),
          createdAt: new Date().toISOString()
        };
        setCommentsByVideo(prev => ({ ...prev, [videoId]: [newDbComment, ...(prev[videoId] || [])] }));
        setVideos(prev => prev.map(v => v.id === videoId ? { ...v, comments: formatNumber(parseNumber(v.comments) + 1) } : v));
        setNewComment('');
      }
    } catch (error) { console.error(error); }
  }, [newComment, authUser]);

  const handleShare = useCallback((videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(prev => prev === videoId ? null : videoId);
  }, []);

  const shareViaPlatform = useCallback(async (videoId: string, platform: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    const url = `${window.location.origin}/shorts/${video.slug || video.id}`;

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied!');
    } else if (platform === 'repost') {
      alert('Shared to your feed!');
    } else if (platform === 'send') {
      alert('Sent to friends!');
    } else if (platform === 'embed') {
      const embedCode = `<iframe src="${url}" width="360" height="640"></iframe>`;
      navigator.clipboard.writeText(embedCode);
      alert('Embed code copied!');
    } else {
      const shareUrls: Record<string, string> = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      };
      if (shareUrls[platform]) window.open(shareUrls[platform], '_blank');
    }

    try {
      await fetch(`/api/shorts/${videoId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'share' })
      });
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, shares: formatNumber(parseNumber(v.shares) + 1) } : v));
    } catch (error) { console.error(error); }
    setShowShareModal(null);
  }, [videos]);

  const scrollToNext = () => {
    if (currentIndex < videos.length - 1) {
      containerRef.current?.scrollTo({ top: (currentIndex + 1) * containerRef.current.clientHeight, behavior: 'smooth' });
    }
  };

  const scrollToPrev = () => {
    if (currentIndex > 0) {
      containerRef.current?.scrollTo({ top: (currentIndex - 1) * containerRef.current.clientHeight, behavior: 'smooth' });
    }
  };

  const parseNumber = (str: string): number => {
    if (!str) return 0;
    const n = parseFloat(str);
    if (str.includes('K')) return n * 1000;
    if (str.includes('M')) return n * 1000000;
    return n;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (videos.length === 0) return null;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-rotate { animation: rotate 3s linear infinite; }
        .pause-overlay { animation: fadeInOut 0.5s ease-out forwards; }
        @keyframes fadeInOut { from { opacity: 0.8; transform: scale(1); } to { opacity: 0; transform: scale(1.5); } }
      `}</style>
      
      {/* Sticky Desktop Navigation UI */}
      {isDesktop && (
        <>
          {/* Sticky Left Side Ad */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 z-[60]">
            <div ref={adRef} className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden min-h-[600px] min-w-[160px]">
              {/* Sidebar ad injected here once */}
            </div>
            <p className="text-[10px] text-white/30 mt-2 text-center uppercase tracking-widest">Advertisement</p>
          </div>

          {/* Sticky Right Side Scroll Buttons */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-[60]">
            <button onClick={scrollToPrev} disabled={currentIndex === 0} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all disabled:opacity-30">
              <ChevronUp size={28} />
            </button>
            <button onClick={scrollToNext} disabled={currentIndex === videos.length - 1} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all disabled:opacity-30">
              <ChevronDown size={28} />
            </button>
          </div>
        </>
      )}

      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {videos.map((video, idx) => (
          <div
            key={video.id}
            data-video-id={video.id}
            className="relative w-full h-full snap-start flex items-center justify-center"
          >

            {/* Video Wrapper */}
            <div className="relative w-full h-full max-w-[500px] bg-black rounded-2xl overflow-hidden">
              <video
                ref={el => { if (el) videoRefs.current[video.id] = el; }}
                src={video.url}
                className="w-full h-full object-cover"
                loop
                muted={isMuted[video.id]}
                playsInline
                onClick={() => togglePlay(video.id)}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  setProgress(prev => ({ ...prev, [video.id]: (v.currentTime / v.duration) * 100 }));
                }}
              />

              {/* Overlays */}
              {!isPlaying[video.id] && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <Play size={80} fill="white" className="opacity-60 text-white stroke-none" />
                </div>
              )}

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/20 z-50">
                <div style={{ width: `${progress[video.id] || 0}%` }} className="h-full bg-white transition-all duration-100" />
              </div>

              {/* Right Side Actions */}
              <div className="absolute right-3 bottom-24 flex flex-col items-center gap-6 z-40">
                {/* Admin Feed - Only Admin Icons */}
                <div onClick={(e) => handleLike(video.id, e)} className="flex flex-col items-center gap-1 cursor-pointer">
                  <Heart size={30} fill={video.hasLiked ? "#ff0050" : "none"} color={video.hasLiked ? "#ff0050" : "white"} className="drop-shadow-lg" />
                  <span className="text-white text-[11px] font-bold drop-shadow-md">{video.likes}</span>
                </div>

                <div onClick={(e) => handleComment(video.id, e)} className="flex flex-col items-center gap-1 cursor-pointer">
                  <MessageCircle size={30} color="white" fill="none" className="drop-shadow-lg" />
                  <span className="text-white text-[11px] font-bold drop-shadow-md">{video.comments}</span>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    alert("Video saved!");
                  }}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="drop-shadow-lg">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="text-white text-[11px] font-bold drop-shadow-md">{video.saves}</span>
                </div>

                <div onClick={(e) => handleShare(video.id, e)} className="flex flex-col items-center gap-1 cursor-pointer">
                  <Share2 size={30} color="white" fill="none" className="drop-shadow-lg" />
                  <span className="text-white text-[11px] font-bold drop-shadow-md">{video.shares}</span>
                </div>

                <div className={`w-11 h-11 rounded-full bg-conic-from-black border-[10px] border-[#222] flex items-center justify-center shadow-xl ${isPlaying[video.id] ? 'animate-rotate' : ''}`}>
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#ff0050] to-[#00b8ff] border-2 border-black" />
                </div>
              </div>

              {/* Bottom Info */}
              <div className="absolute left-3 bottom-6 right-20 text-white z-40 pointer-events-none">
                <div className="pointer-events-auto">
                  <h3 className="font-bold text-lg mb-2 drop-shadow-lg">@{video.user}</h3>
                  <p className="text-sm leading-snug mb-4 drop-shadow-lg line-clamp-2 max-w-[85%]">{video.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {video.tags && video.tags.length > 0 ? (
                      video.tags.map((tag, i) => (
                        <span key={i} className="flex items-center gap-1 text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg">
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <div className="flex items-center gap-2">
                        <Music size={14} className={isPlaying[video.id] ? 'animate-rotate' : ''} />
                        <span className="text-sm font-medium drop-shadow-lg overflow-hidden whitespace-nowrap text-ellipsis">{video.sound}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mute Toggle */}
              <div onClick={(e) => toggleMute(video.id, e)} className="absolute top-5 right-5 p-2 bg-black/30 rounded-full z-40 cursor-pointer text-white">
                {isMuted[video.id] ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </div>
            </div>

            {/* Comment Modal */}
            {showCommentInput === video.id && (
              <div
                className={`absolute z-[100] bg-black/95 backdrop-blur-3xl border-white/10 shadow-2xl flex flex-col transition-all duration-300
                  ${isDesktop ? 'right-[100px] top-1/2 -translate-y-1/2 w-[380px] h-[550px] rounded-2xl border' : 'left-0 bottom-0 w-full h-[70vh] rounded-t-2xl'}
                `}
              >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h3 className="text-white font-bold">Comments ({video.comments})</h3>
                  <button onClick={() => setShowCommentInput(null)} className="text-white/60 hover:text-white"><ChevronDown /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {(commentsByVideo[video.id] || []).map(comment => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#ff0050] flex items-center justify-center font-bold text-white shrink-0">
                        {comment.user?.name?.charAt(0) || "G"}
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/60 text-xs font-semibold">{comment.user?.name || "Anonymous"}</p>
                        <p className="text-white text-sm leading-relaxed">{comment.content}</p>
                        <p className="text-white/30 text-[10px]">{new Date(comment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {!(commentsByVideo[video.id] || []).length && (
                    <div className="h-full flex items-center justify-center text-white/40 italic">No comments yet...</div>
                  )}
                </div>

                <div className="p-4 border-t border-white/10 flex gap-3">
                  <input
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add comment..."
                    className="flex-1 bg-white/10 rounded-full px-5 py-2.5 text-white text-sm outline-none focus:ring-1 ring-[#ff0050]/50"
                  />
                  <button onClick={() => submitComment(video.id)} className="bg-[#ff0050] text-white px-6 rounded-full text-sm font-bold active:scale-95 transition-transform">Post</button>
                </div>
              </div>
            )}

            {/* Share Modal - Horizontal TikTok Style */}
            {showShareModal === video.id && (
              <div
                className={`absolute z-[200] bg-[#1a1a1a] shadow-2xl flex flex-col transition-all duration-300
                  ${isDesktop ? 'right-[20px] bottom-[20px] w-[500px] rounded-2xl' : 'left-0 bottom-0 w-full rounded-t-2xl'}
                `}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 flex justify-between items-center">
                  <h3 className="text-white font-bold text-base text-center w-full">Share too</h3>
                  <button onClick={() => setShowShareModal(null)} className="text-white/60 hover:text-white absolute right-5">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-5 px-6 pb-10 pt-2">
                  {[
                    { id: 'repost', label: 'Repost', icon: Repeat, color: 'bg-[#face15]' },
                    { id: 'send', label: 'Send to friends', icon: Send, color: 'bg-[#ff0050]' },
                    { id: 'copy', label: 'Copy', icon: LinkIcon, color: 'bg-[#00b8ff]' },
                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25d366]' },
                    { id: 'embed', label: 'Embed', icon: Code, color: 'bg-[#00c5bc]' },
                    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-[#1877f2]' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => shareViaPlatform(video.id, p.id)}
                      className="flex flex-col items-center gap-2 min-w-[72px] group transition-transform active:scale-90"
                    >
                      <div className={`w-[54px] h-[54px] ${p.color} rounded-full flex items-center justify-center text-white shadow-xl group-hover:brightness-110 transition-all`}>
                        <p.icon size={26} />
                      </div>
                      <span className="text-white/90 text-[11px] font-medium text-center leading-tight whitespace-normal">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}