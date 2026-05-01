import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Link } from 'react-router-dom';
import { Filter, Search, Star } from 'lucide-react';
import { ProductCategory } from '../types';
import { supabase } from '../lib/supabase';

export function Marketplace() {
  const { products, setProducts } = useAppStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'All'>('All');

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) return;
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data && !error) setProducts(data);
    }
    fetchProducts();
  }, [setProducts]);

  const categories: (ProductCategory | 'All')[] = ['All', 'UI Kits', 'Scripts', 'Maps', 'Models', 'Full Systems'];

  const filteredProducts = products.filter(p => {
    if (category !== 'All' && p.category !== category) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div className="bg-[#12141C] border border-[#1F222C] rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Category</h3>
          <div className="space-y-1">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  category === c 
                    ? 'bg-blue-500/10 text-blue-400 font-medium' 
                    : 'text-slate-400 hover:bg-[#161821] hover:text-[#E0E2E7]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search marketplace..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#161821] border border-[#24272F] text-[#E0E2E7] placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#161821] border border-[#24272F] rounded-lg text-sm text-slate-300 hover:bg-[#1F222C] transition">
            <Filter className="w-4 h-4" />
            Sort: Newest
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
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
                <div className="w-5 h-5 rounded-full bg-slate-700"></div>
                <span className="text-[11px] text-slate-400">Developer</span>
                <span className="ml-auto text-[11px] text-slate-500">4.9★ (24)</span>
              </div>
            </Link>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500">
              No products found for your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
