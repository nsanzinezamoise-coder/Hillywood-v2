"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, User, Monitor, Moon, Sun, Home, Film, Tv, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Client-only wrapper component to prevent hydration mismatches
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "Series", href: "/series", icon: Tv },
  { label: "Shorts", href: "/shorts", icon: Video },
];

// Desktop Logo Component
const DesktopLogo = ({ isRed }: { isRed: boolean }) => (
  <Link href="/" className="flex items-center gap-3 h-full">
    <div className="relative h-35 w-35"> {/* Increased from h-12 w-12 to h-16 w-16 */}
      <Image
        src="/hero.png"
        alt="Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
    {/* <span 
                  className="font-serif text-2xl sm:text-1xl font-extrabold whitespace-nowrap transition-colors duration-3000"
                  style={{ color: isRed ? '#1C1C1C' : '#ffffff' }}
                >
                   <span style={{ color: isRed ? '#1C1C1C' : '#ffffff' }}>Hilly</span>Wood
                </span> */}

                 <span 
                  className="font-serif text-2xl sm:text-1xl font-extrabold whitespace-nowrap transition-colors duration-3000"
                  style={{ color: isRed ? '#ff0000' : '#ffffff' }}
                >
                   <span style={{ color: isRed ? '#ff0000' : '#ffffff' }}>Hilly</span>Wood
                </span>
  </Link>
);

// Mobile Logo Component
const MobileLogo = ({ isRed }: { isRed: boolean }) => (
  <Link href="/" className="flex items-center gap-0 h-full">
    <div className="relative h-19 w-19"> {/* Increased from h-10 w-10 to h-14 w-14 */}
      <Image
        src="/hero.png"
        alt="Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
    <span 
                  className="font-serif text-xl sm:text-2xl font-extrabold whitespace-nowrap transition-colors duration-3000"
                  style={{ color: isRed ? '#ff0000' : '#ffffff' }}
                >
                   <span style={{ color: isRed ? '#ff0000' : '#ffffff' }}>Hilly</span>Wood
                </span>


                {/* <span 
                  className="font-serif text-2xl sm:text-1xl font-extrabold whitespace-nowrap transition-colors duration-3000"
                  style={{ color: isRed ? '#1C1C1C' : '#ffffff' }}
                >
                   <span style={{ color: isRed ? '#1C1C1C' : '#ffffff' }}>Hilly</span>Wood
                </span> */}
  </Link>
);

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRed, setIsRed] = useState(true); // State for logo color
  const { setTheme, theme } = useTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isWatchPage = pathname?.startsWith("/watch/");

  // Color transition effect for logo
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRed(prev => !prev);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Define toggleTheme function
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsLoadingResults(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Live search error:", error);
      } finally {
        setIsLoadingResults(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide header on watch pages
  if (isWatchPage) {
    return null;
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled || pathname !== "/"
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-background/40 backdrop-blur-md border-b border-white/5"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 relative">
            {/* Logo Section - Desktop */}
            <div className="hidden md:flex items-center flex-1">
              <DesktopLogo isRed={isRed} />
            </div>

            {/* Logo Section - Mobile */}
            <div className="flex md:hidden items-center flex-1">
              <MobileLogo isRed={isRed} />
            </div>

            {/* Desktop Navigation (Center) */}
            <nav className="hidden lg:flex items-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-full ${
                      pathname === item.href
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-foreground/90 hover:text-foreground hover:bg-primary/10"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </motion.div>
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Section */}
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute left-0 right-0 top-0 bottom-0 md:relative md:inset-auto bg-background md:bg-transparent z-20 flex items-center justify-between px-2 md:px-0"
                  >
                    <form onSubmit={handleSearchSubmit} className="flex items-center flex-1 max-w-[calc(100vw-200px)] md:max-w-none">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Titles, people, genres"
                          className="bg-secondary border border-border text-foreground text-sm rounded-full pl-10 pr-4 py-2 w-full md:w-64 outline-none focus:border-primary/50 placeholder:text-muted-foreground"
                          autoFocus
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onBlur={() => {
                            setTimeout(() => {
                              if (!searchQuery) setIsSearchOpen(false);
                            }, 200);
                          }}
                        />
                      </div>
                    </form>

                    {/* Mobile buttons - visible when search is open */}
                    <div className="flex items-center gap-1 md:hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full"
                        type="button"
                      >
                        {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
                      </Button>
                      <Link href="/notifications">
                        <Button variant="ghost" size="icon" className="rounded-full relative" type="button">
                          <Bell className="w-5 h-5" />
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>
                      </Link>
                      
                      {/* Mobile Profile Dropdown */}
                      <ClientOnly>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full" type="button">
                              {user?.avatar ? (
                                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                  <Image src={user.avatar} alt={user.name || "User"} fill className="object-cover" />
                                </div>
                              ) : (
                                <User className="w-5 h-5" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-popover backdrop-blur-xl border-border rounded-xl w-56 p-2 text-muted-foreground z-[60]"
                          >
                            <div className="px-2 py-1.5 text-sm font-semibold text-foreground border-b border-border mb-1">
                              {user ? `Hello, ${user.name}` : "My Account"}
                            </div>

                            {(user?.role === 'admin' || user?.role === 'moderator') && (
                              <DropdownMenuItem onSelect={() => router.push("/admin")} className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                Dashboard
                              </DropdownMenuItem>
                            )}

                            {user ? (
                              <>
                                <DropdownMenuItem onSelect={() => router.push("/profile")} className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                  Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                  Help Center
                                </DropdownMenuItem>
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem
                                  onClick={async () => {
                                    await logout();
                                    window.location.href = "/login";
                                  }}
                                  className="rounded-lg text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                                >
                                  Sign Out
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onSelect={() => router.push("/login")} className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                  Sign In
                                </DropdownMenuItem>
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                  Help Center
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </ClientOnly>
                    </div>

                    {/* Live Results Dropdown */}
                    <AnimatePresence>
                      {searchQuery.length >= 2 && (isSearchOpen || searchResults.length > 0) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-2 right-2 md:left-auto md:w-80 mt-2 bg-popover/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                        >
                          {isLoadingResults ? (
                            <div className="p-8 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
                              <p className="text-xs text-muted-foreground">Searching movies...</p>
                            </div>
                          ) : searchResults.length > 0 ? (
                            <div className="space-y-1">
                              {searchResults.slice(0, 5).map((result) => (
                                <Link
                                  key={result._id}
                                  href={result.link}
                                  onClick={() => {
                                    setSearchQuery("");
                                    setIsSearchOpen(false);
                                  }}
                                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/10 transition-colors group"
                                >
                                  <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                                    <Image
                                      src={result.poster}
                                      alt={result.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                      {result.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase font-bold">
                                        {result.type}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">
                                        {result.releaseYear}
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                              {searchResults.length >= 5 && (
                                <Link
                                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="block text-center py-2 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg mt-1 transition-colors border-t border-border/50"
                                >
                                  See all results
                                </Link>
                              )}
                            </div>
                          ) : (
                            <div className="p-8 text-center">
                              <p className="text-sm text-muted-foreground">No matches found</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <>
                    {/* Search button - always visible */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsSearchOpen(true)}
                      className="p-2 rounded-full hover:bg-primary/10 transition-colors text-foreground"
                      type="button"
                    >
                      <Search className="w-5 h-5" />
                    </motion.button>

                    {/* Mobile action buttons - ALWAYS VISIBLE on mobile */}
                    <div className="flex items-center gap-1 md:hidden">
                      {/* Theme toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full"
                        type="button"
                      >
                        {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
                      </Button>

                      {/* Notification */}
                      <Link href="/notifications">
                        <Button variant="ghost" size="icon" className="rounded-full relative" type="button">
                          <Bell className="w-5 h-5" />
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>
                      </Link>

                      {/* Mobile Profile Dropdown */}
                      <ClientOnly>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full" type="button">
                              {user?.avatar ? (
                                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                  <Image src={user.avatar} alt={user.name || "User"} fill className="object-cover" />
                                </div>
                              ) : (
                                <User className="w-5 h-5" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-popover backdrop-blur-xl border-border rounded-xl w-56 p-2 text-muted-foreground z-[60]"
                          >
                            <div className="px-2 py-1.5 text-sm font-semibold text-foreground border-b border-border mb-1">
                              {user ? `Hello, ${user.name}` : "My Account"}
                            </div>

                            {(user?.role === 'admin' || user?.role === 'moderator') && (
                              <DropdownMenuItem onSelect={() => router.push("/admin")} className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                Dashboard
                              </DropdownMenuItem>
                            )}

                            {user ? (
                              <>
                                <DropdownMenuItem onSelect={() => router.push("/profile")} className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                  Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                  Help Center
                                </DropdownMenuItem>
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem
                                  onClick={async () => {
                                    await logout();
                                    window.location.href = "/login";
                                  }}
                                  className="rounded-lg text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                                >
                                  Sign Out
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onSelect={() => router.push("/login")} className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                  Sign In
                                </DropdownMenuItem>
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                  Help Center
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </ClientOnly>
                    </div>
                  </>
                )}
              </AnimatePresence>

              {/* Desktop buttons - hidden on mobile */}
              <div className="hidden md:flex items-center gap-2">
                {/* Theme Toggle Dropdown */}
                {mounted && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative p-2 rounded-full hover:bg-primary/10 transition-colors text-foreground flex items-center justify-center w-10 h-10"
                        type="button"
                      >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover backdrop-blur-xl border-border rounded-xl">
                      <DropdownMenuItem onClick={() => setTheme("light")} className="text-muted-foreground focus:text-foreground focus:bg-primary/10 cursor-pointer">
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")} className="text-muted-foreground focus:text-foreground focus:bg-primary/10 cursor-pointer">
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")} className="text-muted-foreground focus:text-foreground focus:bg-primary/10 cursor-pointer">
                        <Monitor className="mr-2 h-4 w-4" />
                        <span>System</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Notifications */}
                <Link href="/notifications">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative p-2 rounded-full hover:bg-primary/10 transition-colors text-foreground cursor-pointer"
                    type="button"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                  </motion.button>
                </Link>

                {/* User Menu */}
                <ClientOnly>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground overflow-hidden ml-1 cursor-pointer"
                        type="button"
                      >
                        {user?.avatar ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={user.avatar}
                              alt={user.name || "User"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-popover backdrop-blur-xl border-border rounded-xl w-56 p-2 text-muted-foreground"
                    >
                      <div className="px-2 py-1.5 text-sm font-semibold text-foreground border-b border-border mb-1">
                        {user ? `Hello, ${user.name}` : "My Account"}
                      </div>

                      {(user?.role === 'admin' || user?.role === 'moderator') && (
                        <DropdownMenuItem onSelect={() => router.push("/admin")} className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                          Dashboard
                        </DropdownMenuItem>
                      )}

                      {user ? (
                        <>
                          <DropdownMenuItem onSelect={() => router.push("/profile")} className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                            Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                            Help Center
                          </DropdownMenuItem>
                          <div className="h-px bg-border my-1" />
                          <DropdownMenuItem
                            onClick={async () => {
                              await logout();
                              window.location.href = "/login";
                            }}
                            className="rounded-lg text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                          >
                            Sign Out
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem onSelect={() => router.push("/login")} className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                            Sign In
                          </DropdownMenuItem>
                          <div className="h-px bg-border my-1" />
                          <DropdownMenuItem className="rounded-lg focus:bg-primary/10 focus:text-foreground cursor-pointer">
                            Help Center
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <nav className="bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.1)] rounded-t-2xl flex items-center justify-around p-1.5 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-95 group relative cursor-pointer"
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-primary"}`} />
                <span className={`text-[9px] font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-primary"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}