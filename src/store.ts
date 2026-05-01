import { create } from 'zustand';
import { User, Product } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';

interface AppState {
  currentUser: User | null;
  isLoadingSession: boolean;
  setCurrentUser: (user: User | null) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  isLoadingSession: true,
  setCurrentUser: (user) => set({ currentUser: user }),
  products: [],
  setProducts: (products) => set({ products }),
}));

// Initialize Supabase Auth listener if configured
if (isSupabaseConfigured && supabase) {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session) {
       const { data: user } = await supabase.from('users').select('*').eq('id', session.user.id).single();
       if (user) useAppStore.setState({ currentUser: user as User });
    }
    useAppStore.setState({ isLoadingSession: false });
  });

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session) {
      useAppStore.setState({ currentUser: null });
    } else {
      const { data: user } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      if (user) useAppStore.setState({ currentUser: user as User });
    }
  });
} else {
  useAppStore.setState({ isLoadingSession: false });
}
