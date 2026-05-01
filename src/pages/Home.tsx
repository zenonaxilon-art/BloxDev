import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { Star, TrendingUp, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function Home() {
  const { products, setProducts } = useAppStore();

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) return;
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(4);
      if (data && !error) setProducts(data);
    }
    fetchProducts();
  }, [setProducts]);

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="text-center py-20 px-4 md:px-0">
        <span className="text-blue-500 font-bold tracking-wider uppercase text-xs mb-4 inline-block bg-blue-500/10 px-3 py-1 rounded-full">
          The Premier Developer Marketplace
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 mt-4">
          Upgrade your <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Roblox experiences.
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto tracking-wide font-light mb-10">
          Discover premium UI kits, robust scripts, and full systems built by verified developers.
          Buy safely, sell quickly, and build better games.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link 
            to="/marketplace" 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            Explore Marketplace
          </Link>
          <Link 
            to="/profile" 
            className="w-full sm:w-auto bg-[#161821] text-[#E0E2E7] border border-[#24272F] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#1F222C] transition-colors active:scale-[0.98]"
          >
            Become a Seller
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="text-2xl font-bold">Trending Assets</h2>
          </div>
          <Link to="/marketplace" className="text-sm font-medium text-blue-400 hover:text-blue-300">
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} className="bg-[#161821] border border-[#24272F] rounded-2xl overflow-hidden p-4 flex flex-col gap-3 group transition-all hover:border-[#383D47]">
              <div className="aspect-video bg-[#0D0F16] rounded-xl flex items-center justify-center border border-[#1F222C] relative overflow-hidden">
                <img 
                  src={p.images[0]} 
                  alt={p.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
              </div>
              <div className="flex justify-between items-start mt-1">
                <div className="flex-1 pr-2">
                  <h3 className="font-semibold text-[15px] group-hover:text-blue-400 transition-colors line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.description}</p>
                </div>
                <div className="bg-[#090A0F] px-2 py-1 rounded text-sm text-green-400 font-mono flex-shrink-0">
                  R${p.price.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 mt-auto border-t border-[#24272F]">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400">V</div>
                <span className="text-[11px] text-slate-400">Developer <span className="text-blue-400">Verified</span></span>
                <span className="ml-auto text-[11px] text-slate-500">4.9★ (24)</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center my-20 relative overflow-hidden shadow-xl shadow-blue-600/10">
        <div className="relative z-10">
          <ShieldCheck className="w-12 h-12 text-blue-200 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">Verified Developers Only</h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
            We protect buyers by requiring sellers to pass our verification process. 
            Become a verified developer by purchasing the VIP Gamepass to list your items securely.
          </p>
          <Link 
            to="/profile" 
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-transform"
          >
            Get Verified Badge
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

    </div>
  );
}
