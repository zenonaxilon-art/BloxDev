import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ShoppingCart, Star, ShieldCheck, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product, User as AppUser } from '../types';

export function ProductDetail() {
  const { id } = useParams();
  const { currentUser } = useAppStore();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<AppUser | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!supabase || !id) return;
      const { data: p } = await supabase.from('products').select('*').eq('id', id).single();
      if (p) {
        setProduct(p);
        const { data: s } = await supabase.from('users').select('*').eq('id', p.seller_id).single();
        if (s) setSeller(s);
      }
    }
    fetchData();
  }, [id]);

  const handlePurchase = async () => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }
    if (!supabase || !product) return;
    setIsPurchasing(true);
    try {
      const { error } = await supabase.from('orders').insert({
        buyer_id: currentUser.id,
        product_id: product.id,
        status: 'completed'
      });
      if (error) throw error;
      alert("Purchase successful!");
      navigate('/messages', { state: { sellerId: product.seller_id } });
    } catch (e) {
      console.error(e);
      alert("Purchase failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!product) {
    return <div className="text-center py-20">Loading product...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-video w-full bg-[#161821] rounded-2xl overflow-hidden border border-[#24272F] p-4">
            <div className="w-full h-full bg-[#0D0F16] rounded-xl border border-[#1F222C] overflow-hidden relative">
              <img 
                src={product.images[0]} 
                alt={product.title} 
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <span className="bg-[#161821] border border-[#24272F] px-2 py-1 rounded text-xs">{product.category}</span>
              <span>&bull;</span>
              <div className="flex items-center text-slate-400 text-xs">
                <Star className="w-3.5 h-3.5 fill-current text-yellow-500 mr-1" />
                4.9 <span className="text-slate-500 ml-1">(24 reviews)</span>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold mb-4">{product.title}</h1>
            
            <div className="flex items-center gap-3 p-4 bg-[#12141C] rounded-xl border border-[#1F222C]">
              <div className="w-10 h-10 bg-[#161821] border border-[#24272F] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-200">Developer</span>
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xs text-slate-500">Member since 2023</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#161821] rounded-2xl border border-[#24272F]">
            <div className="font-mono text-4xl font-bold text-green-400 mb-6 bg-[#090A0F] p-4 rounded-xl border border-[#1F222C] inline-block w-full text-center">
              R${product.price.toLocaleString()}
            </div>
            <button 
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/10 active:scale-[0.98]">
              <ShoppingCart className="w-5 h-5" />
              {isPurchasing ? 'Processing...' : 'Purchase Now'}
            </button>
            <p className="text-xs text-slate-500 text-center mt-4">
              Secure transaction via external payment flow. Delivery is instant.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2 text-[#E0E2E7]">Description</h3>
            <p className="text-slate-400 leading-relaxed font-light text-sm">
              {product.description}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2 text-[#E0E2E7]">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(t => (
                <span key={t} className="px-3 py-1 bg-[#161821] border border-[#24272F] text-slate-400 text-xs rounded-lg">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
