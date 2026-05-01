import React, { useState } from 'react';
import { useAppStore } from '../store';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, User, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const { setCurrentUser } = useAppStore();

  if (!isOpen) return null;

  const handleRobloxLogin = async () => {
    try {
      const res = await fetch('/api/auth/url');
      const data = await res.json();
      if (data.url) {
        window.open(data.url, 'oauth_popup', 'width=600,height=700');
      } else {
        setError(data.error || "Failed to initialize Roblox OAuth");
      }
    } catch (e: any) {
      setError("Failed to connect to auth server.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (isResetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        alert("Password reset email sent!");
        setIsResetMode(false);
      } else if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Let the store's onAuthStateChange handle user fetching
        onClose();
        
      } else {
        if (!username) throw new Error("Username is required");
        
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
        });
        if (error) throw error;

        if (data.user) {
          // Immediately insert user profile
          const { error: insertError } = await supabase.from('users').insert({
            id: data.user.id,
            username,
            role: 'buyer',
            verified: false
          });
          if (insertError) {
             console.error("Profile creation error:", insertError);
             throw new Error("Failed to create user profile");
          }
          alert("Signup successful! You can now log in.");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#12141C] border border-[#24272F] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isResetMode ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
            </h2>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              {isResetMode ? 'Enter your email to receive a password reset link.' : 'Sign in to buy, sell, and connect.'}
            </p>
          </div>

          {!isResetMode && (
            <>
              <button 
                onClick={handleRobloxLogin}
                className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg mb-6"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/22/Roblox_Logo_2022.svg" alt="Roblox" className="w-5 h-5" />
                Continue with Roblox
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] flex-1 bg-[#24272F]"></div>
                <span className="text-xs text-slate-500 font-medium">OR USE EMAIL</span>
                <div className="h-[1px] flex-1 bg-[#24272F]"></div>
              </div>
            </>
          )}

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isResetMode && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-[#0D0F16] border border-[#24272F] rounded-xl py-2.5 pl-10 pr-4 text-[#E0E2E7] focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="RobloxBuilderPro"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0D0F16] border border-[#24272F] rounded-xl py-2.5 pl-10 pr-4 text-[#E0E2E7] focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {!isResetMode && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#0D0F16] border border-[#24272F] rounded-xl py-2.5 pl-10 pr-4 text-[#E0E2E7] focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 mt-6"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : (
                isResetMode ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account')
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {!isResetMode && (
              <p className="text-sm text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-blue-400 hover:text-blue-300 font-bold ml-1"
                >
                  {isLogin ? "Sign Up" : "Log In"}
                </button>
              </p>
            )}
            
            {isLogin && !isResetMode && (
              <p className="text-sm">
                <button 
                  onClick={() => setIsResetMode(true)} 
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Forgot your password?
                </button>
              </p>
            )}

            {isResetMode && (
              <p className="text-sm">
                <button 
                  onClick={() => setIsResetMode(false)} 
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
                >
                  Back to Log In
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
