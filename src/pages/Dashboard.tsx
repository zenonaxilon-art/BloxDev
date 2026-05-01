import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Upload, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCategory } from '../types';

export function Dashboard() {
  const { currentUser } = useAppStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState<ProductCategory>('UI Kits');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!currentUser || (currentUser.role !== 'seller' && currentUser.role !== 'admin')) {
    return null; // ProtectedRoute will handle redirect
  }

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || price < 0 || !file || !supabase) return;
    
    setIsUploading(true);
    try {
      // 1. Upload image to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('products')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      // 2. Insert product record
      const { error: insertError } = await supabase.from('products').insert({
        title,
        description,
        price,
        seller_id: currentUser.id,
        category,
        images: [publicUrlData.publicUrl],
        tags: []
      });

      if (insertError) throw insertError;
      
      alert("Product listed successfully!");
      setTitle('');
      setDescription('');
      setPrice(0);
      setFile(null);

    } catch (err) {
      console.error(err);
      alert("Failed to create product listing");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Seller Dashboard</h1>
        <p className="text-slate-400 mt-2">Manage your listings and sales</p>
      </div>

      <form onSubmit={handleCreateListing} className="bg-[#161821] border border-[#24272F] rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-blue-400"/> Create New Listing</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Product Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-[#0D0F16] border border-[#24272F] rounded-xl px-4 py-3" />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full bg-[#0D0F16] border border-[#24272F] rounded-xl px-4 py-3"></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Price (R$)</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} min={0} required className="w-full bg-[#0D0F16] border border-[#24272F] rounded-xl px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)} className="w-full bg-[#0D0F16] border border-[#24272F] rounded-xl px-4 py-3 text-[#E0E2E7]">
                <option value="UI Kits">UI Kits</option>
                <option value="Scripts">Scripts</option>
                <option value="Maps">Maps</option>
                <option value="Models">Models</option>
                <option value="Full Systems">Full Systems</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Product Image (Upload real file)</label>
            <label className="border-2 border-dashed border-[#24272F] hover:border-blue-500/50 bg-[#0D0F16] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group">
              <Upload className="w-8 h-8 text-slate-500 group-hover:text-blue-400 mb-3" />
              <span className="text-slate-400 text-sm">Click to upload product image</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required/>
            </label>
            {file && <p className="text-sm text-green-400 mt-2">Selected: {file.name}</p>}
          </div>
        </div>

        <button type="submit" disabled={isUploading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors">
          {isUploading ? 'Creating...' : 'List Product'}
        </button>
      </form>
    </div>
  );
}
