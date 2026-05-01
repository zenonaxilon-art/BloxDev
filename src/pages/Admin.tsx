import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { ShieldAlert, Check, X, Trash2, Ban } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { VerificationRequest, User, Product } from '../types';

interface PopulatedRequest extends VerificationRequest {
  users: User;
}

export function Admin() {
  const { currentUser } = useAppStore();
  const [requests, setRequests] = useState<PopulatedRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;
      const { data: verifications } = await supabase
        .from('verification_requests')
        .select(`*, users (*)`)
        .eq('status', 'pending');
        
      if (verifications) setRequests(verifications as any); 

      const { data: allUsers } = await supabase.from('users').select('*');
      if (allUsers) setUsers(allUsers as User[]);

      const { data: allProducts } = await supabase.from('products').select('*');
      if (allProducts) setProducts(allProducts as Product[]);
    }
    fetchData();
  }, []);

  if (currentUser?.role !== 'admin') {
    return null; // ProtectedRoute handles redirect
  }

  const handleApprove = async (id: string, userId: string) => {
    if (!supabase) return;
    await supabase.from('verification_requests').update({ status: 'approved' }).eq('id', id);
    await supabase.from('users').update({ verified: true, role: 'seller' }).eq('id', userId);
    setRequests(requests.filter(r => r.id !== id));
    setUsers(users.map(u => u.id === userId ? { ...u, verified: true, role: 'seller' } : u));
  };

  const handleReject = async (id: string) => {
    if (!supabase) return;
    await supabase.from('verification_requests').update({ status: 'rejected' }).eq('id', id);
    setRequests(requests.filter(r => r.id !== id));
  };

  const handleDeleteProduct = async (id: string) => {
    if (!supabase) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p => p.id !== id));
  };

  const handleBanUser = async (id: string) => {
    if (!supabase) return;
    // For simplicity, we just change their role or flag them. Since we don't have a 'banned' boolean, let's reset roll to buyer and clear verified.
    // In a real app we'd have an 'is_banned' column or block them in Supabase Auth.
    await supabase.from('users').update({ role: 'buyer', verified: false }).eq('id', id);
    setUsers(users.map(u => u.id === id ? { ...u, role: 'buyer', verified: false } : u));
    alert("User privileges revoked.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-[#E0E2E7]">Admin Control Panel</h1>
        <p className="text-slate-400 text-sm">Manage verification requests and moderated content.</p>
      </div>

      <div className="bg-[#161821] rounded-2xl border border-[#24272F] overflow-hidden">
        <div className="p-5 border-b border-[#24272F] bg-[#12141C]">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pending Verification Requests ({requests.length})</h2>
        </div>
        
        <div className="divide-y divide-[#24272F]">
          {requests.map(req => (
            <div key={req.id} className="p-6 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-64 bg-[#0D0F16] rounded-xl overflow-hidden border border-[#1F222C] p-2">
                <img src={req.proof_image_url} alt="Proof screenshot" className="w-full object-cover rounded-lg aspect-video opacity-90" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-[#E0E2E7]">{req.users?.username || 'Unknown'}</h3>
                  <p className="text-xs text-slate-500 mt-1 bg-[#12141C] border border-[#1F222C] px-2 py-1 rounded inline-block">Submitted proof for VIP Gamepass</p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => handleApprove(req.id, req.user_id)}
                    className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    <Check className="w-4 h-4" /> Approve & Verify
                  </button>
                  <button 
                    onClick={() => handleReject(req.id)}
                    className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
             <div className="p-8 text-center text-slate-500 bg-[#0D0F16]">
               No pending requests.
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#161821] rounded-2xl border border-[#24272F] overflow-hidden">
          <div className="p-5 border-b border-[#24272F] bg-[#12141C]">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manage Users</h2>
          </div>
          <div className="divide-y divide-[#24272F] max-h-96 overflow-y-auto">
            {users.map(u => (
              <div key={u.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="text-sm font-bold text-[#E0E2E7]">{u.username}</div>
                    <div className="text-xs text-slate-500">Role: {u.role}</div>
                  </div>
                </div>
                <button onClick={() => handleBanUser(u.id)} title="Revoke selling privileges" className="text-red-500 hover:text-red-400 p-2">
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#161821] rounded-2xl border border-[#24272F] overflow-hidden">
          <div className="p-5 border-b border-[#24272F] bg-[#12141C]">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manage Products</h2>
          </div>
          <div className="divide-y divide-[#24272F] max-h-96 overflow-y-auto">
            {products.map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={p.images[0]} alt="Product" className="w-10 h-10 rounded object-cover" />
                  <div>
                    <div className="text-sm font-bold text-[#E0E2E7] line-clamp-1">{p.title}</div>
                    <div className="text-xs text-slate-500">Category: {p.category}</div>
                  </div>
                </div>
                <button onClick={() => handleDeleteProduct(p.id)} title="Delete product" className="text-red-500 hover:text-red-400 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
