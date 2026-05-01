import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ShoppingCart, Search, UserCircle, LogOut, CheckCircle, ShieldUser, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AuthModal } from './AuthModal';

export function Layout() {
  const { currentUser, setCurrentUser } = useAppStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.data?.type === 'OAUTH_AUTH_SUCCESS' && e.data.credentials) {
        if (!supabase) return;
        const { error } = await supabase.auth.signInWithPassword({
          email: e.data.credentials.email,
          password: e.data.credentials.password
        });
        if (error) {
          console.error("Login failed", error);
          alert("Login failed: " + error.message);
        } else {
          setIsAuthModalOpen(false);
          window.location.reload();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-[#E0E2E7] font-sans">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <header className="bg-[#0D0F16] border-b border-[#1F222C] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Primary Nav */}
            <div className="flex items-center flex-1">
              <Link to="/" className="flex flex-shrink-0 items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 font-black text-xl text-white">
                  B
                </div>
                <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
                  BloxDev <span className="text-blue-500">Market</span>
                </span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link to="/marketplace" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
                  Marketplace
                </Link>
                <Link to="/leaderboard" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
                  Leaderboard
                </Link>
              </div>
            </div>

            {/* Search Bar - Hidden on small mobile */}
            <div className="flex-1 max-w-lg hidden sm:block mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search assets, scripts, UI..."
                  className="block w-full pl-10 pr-4 py-2 border border-[#24272F] rounded-full leading-5 bg-[#161821] text-sm text-[#E0E2E7] placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Current User Nav */}
            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-4 border-l border-[#1F222C] pl-6">
                  {currentUser.role === 'admin' && (
                    <Link to="/admin" className="text-slate-500 hover:text-white transition-colors" title="Admin Dashboard">
                      <ShieldUser className="w-5 h-5" />
                    </Link>
                  )}
                  {currentUser.role === 'seller' && (
                    <Link to="/dashboard" className="text-slate-500 hover:text-white transition-colors" title="Seller Dashboard">
                      <CheckCircle className="w-5 h-5" />
                    </Link>
                  )}
                  <Link to="/messages" className="text-slate-500 hover:text-white transition-colors" title="Messages">
                    <MessageSquare className="w-5 h-5" />
                  </Link>
                  <Link to="/cart" className="text-slate-500 hover:text-white transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                  </Link>

                  <div className="relative ml-2">
                    <button 
                      className="flex items-center gap-3 text-sm focus:outline-none group p-1 rounded-full transition"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                      <div className="hidden md:block text-right">
                        <div className="text-xs text-slate-500">Welcome,</div>
                        <div className="flex font-semibold text-[#E0E2E7] items-center gap-1 group-hover:text-white transition-colors">
                          {currentUser.username}
                          {currentUser.verified && <CheckCircle className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                      </div>
                      <img
                        className="h-10 w-10 rounded-full object-cover border border-[#24272F] bg-[#12141C]"
                        src={currentUser.avatar}
                        alt=""
                      />
                    </button>

                    {isMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-[#161821] ring-1 ring-black ring-opacity-5 border border-[#24272F]">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-[#1F222C] hover:text-white">
                          Your Profile
                        </Link>
                        {currentUser.role === 'seller' && (
                          <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-300 hover:bg-[#1F222C] hover:text-white">
                            Seller Dashboard
                          </Link>
                        )}
                        <button 
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#1F222C]"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/10 flex items-center gap-2"
                >
                  Log In
                </button>
              )}
            </div>
            
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-[#0D0F16] border-t border-[#1F222C] py-8 text-center text-slate-500 text-sm mt-auto">
        <p>&copy; {new Date().getFullYear()} BloxDev Market. Not affiliated with Roblox Corporation.</p>
        <div className="flex justify-center gap-4 mt-4 text-slate-500">
          <Link to="/" className="hover:text-slate-300">Terms</Link>
          <Link to="/" className="hover:text-slate-300">Privacy</Link>
          <Link to="/" className="hover:text-slate-300">Support</Link>
        </div>
      </footer>
    </div>
  );
}
